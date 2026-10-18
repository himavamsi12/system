// Narration audio for the episode player, generated with ElevenLabs.
// Each caption is generated once and saved as public/audio/<id>.mp3, where <id> is a hash of the caption text.
// The player plays that saved file directly, so ElevenLabs is only called for captions that have no file yet.
// The API key stays on the server, and only captions that exist in the episodes are spoken,
// so the endpoint cannot be used to generate arbitrary audio on our account.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Default: "George", a built-in ElevenLabs voice that works on the free plan.
// Voice Library voices (e.g. 05QRrdNgiglhuYOaTQvw) need a paid plan or API credits; set ELEVENLABS_VOICE_ID to use one.
// After changing the voice, delete public/audio so the captions are generated again in the new voice.
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? 'JBFqnCBsd6RMkjVDRZzb';
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID ?? 'eleven_multilingual_v2';
// Generating new audio is off unless ELEVENLABS_GENERATE=on. Saved files in public/audio always play.
// Prefer `npm run voices` to generate everything in one go.
const GENERATE = process.env.ELEVENLABS_GENERATE === 'on';
const MAX_CHARS = 1200;
const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio');

// Same id the player computes in the browser: first 16 hex chars of SHA-1 of the caption
const audioId = (text: string) => createHash('sha1').update(text, 'utf8').digest('hex').slice(0, 16);

const mp3 = (body: BodyInit) =>
  new Response(body, {
    headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });

let allowed: Promise<Set<string>> | null = null;

const unescapeJs = (s: string) =>
  s.replace(/\\u([0-9a-fA-F]{4})/g, (_, h: string) => String.fromCharCode(parseInt(h, 16))).replace(/\\(.)/g, '$1');

// Every caption string in the episode data (cap:"…" or cap:'…')
const loadCaptions = async (origin: string): Promise<Set<string>> => {
  const res = await fetch(new URL('/legacy/videos.js', origin), { cache: 'no-store' });
  if (!res.ok) throw new Error(`videos.js ${res.status}`);
  const src = await res.text();
  const caps = new Set<string>();
  for (const m of src.matchAll(/\bcap:(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')/g)) {
    caps.add(unescapeJs(m[1] ?? m[2] ?? ''));
  }
  return caps;
};

export const GET = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const text = (url.searchParams.get('text') ?? '').trim();
  const key = GENERATE ? process.env.ELEVENLABS_API_KEY : undefined;
  if (!text) return new Response(key ? 'Bad request' : 'Narration generation is off', { status: key ? 400 : 503 });
  if (text.length > MAX_CHARS) return new Response('Bad request', { status: 400 });

  // Already generated: serve the saved file, no ElevenLabs call
  const file = path.join(AUDIO_DIR, `${audioId(text)}.mp3`);
  try {
    return mp3(await readFile(file));
  } catch {
    // not saved yet
  }

  if (!key) return new Response('Narration generation is off', { status: 503 });

  allowed ??= loadCaptions(url.origin).catch((err: unknown) => {
    allowed = null;
    throw err;
  });
  let captions: Set<string>;
  try {
    captions = await allowed;
  } catch {
    return new Response('Captions unavailable', { status: 503 });
  }
  if (!captions.has(text)) return new Response('Unknown caption', { status: 404 });

  const upstream = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_64`,
    {
      method: 'POST',
      headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    },
  );
  if (!upstream.ok) {
    // Pass back ElevenLabs' error code and message (never the key) so setup problems are easy to diagnose
    let reason = '';
    try {
      const err: unknown = await upstream.json();
      const detail = (err as { detail?: { status?: string; message?: string } }).detail;
      reason = [detail?.status, detail?.message].filter(Boolean).join(': ');
    } catch {
      reason = upstream.statusText;
    }
    return new Response(`Narration failed (ElevenLabs ${upstream.status}) ${reason}`.trim(), { status: 502 });
  }

  const audio = Buffer.from(await upstream.arrayBuffer());
  // Save it so this caption is never generated again. Fails quietly on read-only hosts (e.g. Vercel);
  // there, commit public/audio from a local run instead.
  try {
    await mkdir(AUDIO_DIR, { recursive: true });
    await writeFile(file, audio);
  } catch {
    // read-only file system
  }
  return mp3(audio);
};

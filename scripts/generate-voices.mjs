// Generate ElevenLabs narration for every episode caption that does not have a saved file yet.
// Files go to public/audio/<id>.mp3 (id = first 16 hex chars of SHA-1 of the caption), the same
// files the player looks for first. Existing files are skipped, so re-running only fills the gaps.
//
//   npm run voices                 dry run: how many captions are missing and how many characters they cost
//   npm run voices -- --yes        generate all missing captions
//   npm run voices -- --yes --limit 20   generate at most 20 (useful on a small monthly allowance)
//
// Reads ELEVENLABS_API_KEY (and optional ELEVENLABS_VOICE_ID / ELEVENLABS_MODEL_ID) from .env.local.
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const AUDIO_DIR = path.join(ROOT, 'public', 'audio');
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? 'JBFqnCBsd6RMkjVDRZzb';
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID ?? 'eleven_multilingual_v2';
const KEY = process.env.ELEVENLABS_API_KEY;

const args = process.argv.slice(2);
const yes = args.includes('--yes');
const limitAt = args.indexOf('--limit');
const limit = limitAt >= 0 ? Number(args[limitAt + 1]) : Infinity;

const audioId = (text) => createHash('sha1').update(text, 'utf8').digest('hex').slice(0, 16);
const unescapeJs = (s) =>
  s.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/\\(.)/g, '$1');

const src = await readFile(path.join(ROOT, 'public', 'legacy', 'videos.js'), 'utf8');
const captions = [
  ...new Set(
    [...src.matchAll(/\bcap:(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')/g)].map((m) => unescapeJs(m[1] ?? m[2] ?? '').trim()),
  ),
].filter(Boolean);

const missing = captions.filter((t) => !existsSync(path.join(AUDIO_DIR, `${audioId(t)}.mp3`)));
const todo = missing.slice(0, limit);
const chars = todo.reduce((n, t) => n + t.length, 0);

console.log(`${captions.length} captions · ${captions.length - missing.length} saved · ${missing.length} missing`);
console.log(`This run: ${todo.length} captions · ${chars.toLocaleString()} characters (about that many ElevenLabs credits)`);
if (!yes) {
  console.log('Dry run. Add --yes to generate, e.g. npm run voices -- --yes');
  process.exit(0);
}
if (!KEY) {
  console.error('ELEVENLABS_API_KEY is not set in .env.local');
  process.exit(1);
}

await mkdir(AUDIO_DIR, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const generate = async (text) => {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_64`, {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({ text, model_id: MODEL_ID, voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    let detail = '';
    try {
      const err = await res.json();
      detail = [err?.detail?.status, err?.detail?.message].filter(Boolean).join(': ');
    } catch {
      detail = res.statusText;
    }
    // Rate limited or temporary error: wait and retry. Anything else (no credits, bad key): stop.
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      await sleep(2000 * attempt);
      continue;
    }
    throw new Error(`ElevenLabs ${res.status} ${detail}`.trim());
  }
  throw new Error('ElevenLabs: too many retries');
};

let done = 0;
for (const text of todo) {
  const id = audioId(text);
  try {
    await writeFile(path.join(AUDIO_DIR, `${id}.mp3`), await generate(text));
    done++;
    console.log(`[${done}/${todo.length}] ${id}.mp3  ${text.slice(0, 60)}…`);
  } catch (err) {
    console.error(`Stopped after ${done} files: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  }
}
console.log(`Done: ${done} new files in public/audio. Commit that folder so the live site plays them.`);

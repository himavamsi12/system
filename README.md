# Concept Lab

A free, static learning site for system design interviews.

| Page | What it is |
|---|---|
| `index.html` | Home page and study path |
| `videos.html` | 12 animated explainer videos (3D isometric + 2D), with transcript. Link straight to one with `videos.html#ep7` |
| `manual.html` | Field manual: the 12 building blocks, simulators, interview playbook |
| `case-study.html` | Case study: one food delivery order through every topic |

No build step and no backend: every page is a single self-contained HTML file. Fonts load from Google Fonts.

## Put it online (pick one, all free)

**Netlify Drop (fastest, no account setup beyond sign-in)**
1. Go to https://app.netlify.com/drop
2. Drag this whole folder onto the page.
3. You get a public URL in seconds. Rename the site under *Site configuration → Change site name*.

**Vercel**
```bash
npm i -g vercel
cd system-design-visually
vercel --prod
```

**GitHub Pages**
1. Create a public repo and push these files to the `main` branch.
2. Repo → *Settings → Pages* → Source: *Deploy from a branch*, branch `main`, folder `/ (root)`.
3. Your site appears at `https://<username>.github.io/<repo>/`.

**Cloudflare Pages**
Dashboard → *Workers & Pages → Create → Pages → Upload assets* → drop the folder.

## Custom domain
All four hosts let you add your own domain (for example `systemdesign.yourname.dev`) from their domain settings; point a CNAME record at the address they give you.

## Local preview
```bash
npx serve .
# or
python3 -m http.server 8080
```

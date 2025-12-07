# peakbagger

This workspace contains a web UI (a single `index.html`) for Peakbagger’s Journal with integration hooks to the NH48 API.

What I changed in this workspace
- Added `index.html` with:
	- Circular profile thumbnails next to mountain names (first image if available).
	- A detail pane image carousel that loads images from the NH48 images endpoint at `/_functions/nh48_images?peak=...`.
	- Graceful fallbacks when the API or images are not available.

Next steps (deploy & embed)
1. Push this repository to your GitHub repo (if it isn't already):

```bash
git add index.html README.md
git commit -m "Add Peakbagger web UI with NH48 image carousel and profile thumbs"
git push origin main
```

2. Enable hosting on GitHub Pages (Repository > Settings > Pages) or deploy to Netlify/Vercel and get a public URL.

3. Embed in Wix:
 - Use the Wix Embed element and provide an `iframe` that points to your hosted URL (GitHub Pages or Netlify). Example embed HTML:

```html
<iframe src="https://your-username.github.io/your-repo/" width="100%" height="900" style="border:0"></iframe>
```

Notes
- The `index.html` expects the functions host at `/_functions` when served under `nh48pics.com`, otherwise it falls back to `https://www.nh48pics.com/_functions`.
- The image endpoint assumed is `/_functions/nh48_images?peak=...` which should return JSON `{ images: [{ url, thumb, caption }, ...] }`.
- If your actual API path or JSON shape differs, adjust the `fetchPeakImages` function in `index.html` accordingly.

If you want, I can:
- Update the `index.html` to match the full original UI instead of the minimal demo shell I included here.
- Add a tiny build script or GitHub Action to deploy to GitHub Pages automatically.
Peakbagger Peak Logging Web Application

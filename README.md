# gradegap

How grading differs between professors teaching the same course at UBC Okanagan and UBC Vancouver.
Live at https://gradegap.goerzen.dev. Grade data comes from [UBCGrades](https://ubcgrades.com) by
[DonneyF](https://github.com/DonneyF/ubcgrades). Not affiliated with the University of British Columbia.

## How it works
- `All_UBCO_Professors.ipynb` downloads the data, runs the analysis for both campuses, and writes `index.html`, `data/ubco.json`, `data/ubcv.json` and `prof_comparison.csv`. Edit its settings cell (thresholds, campuses) to change results.
- `site/` holds the page source: `template.html`, `styles.css`, `app.js`, `content.json`, `favicon.svg`, `og.png`.
- `.github/workflows/build.yml` runs the notebook on the 1st of each month, on notebook changes, or on demand (Actions tab), then commits the new files. Cloudflare Pages redeploys on every commit.

## Setup
1. Delete the stray `build.yml` in the repo root (the real one lives in `.github/workflows/`), and `analytics.html` if you made one.
2. Upload everything from this folder to the repo, replacing existing files. If `.github` won't upload, use Add file > Create new file, type `.github/workflows/build.yml`, and paste the file's contents.
3. Cloudflare Pages: keep your existing project (framework none, no build command, output directory `/`). If GitHub Pages is still on, turn it off in Settings > Pages.
4. Actions tab > Build dashboard > Run workflow. The first run downloads both campuses and takes a while. When it is green, open the site.
5. Repo Settings: add the description "How grading differs between UBC professors" and the website `https://gradegap.goerzen.dev`.

## Placeholders
`site/content.json` has `data_origin` and `data_terms`. Leave them empty and nothing shows. Fill them in (plain sentences) and they appear in the About section on the next build.

## Optional: self-hosted fonts
Download IBM Plex Sans (Regular) and Source Serif 4 (SemiBold) as .woff2 into `/fonts`, then uncomment the `@font-face` block at the top of `site/styles.css`. Without them the site uses system fonts.

## Preview locally
Run the notebook; the last cell shows the site. Or run `python -m http.server` in this folder and open http://localhost:8000.

## Licence
MIT. See `LICENSE`. The licence covers this code, not the grade data.

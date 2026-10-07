# UBCO grade comparison dashboard

Interactive table of which professors grade above or below colleagues teaching the same courses
(data from [UBCGrades](https://ubcgrades.com/api-reference)).

- `All_UBCO_Professors.ipynb` – the analysis. Edit the settings cell (campus, thresholds) to change the results.
- `.github/workflows/build.yml` – re-runs the notebook on GitHub's servers and commits a fresh `index.html`
  (monthly, whenever the notebook changes, or on demand from the Actions tab).
- `index.html` – the page GitHub Pages serves.

Averages reflect course mix, class size and who enrols. They are not a measure of teaching quality.

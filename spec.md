# EuroMillions Smart Number Generator

## Current State
New project — no existing implementation.

## Requested Changes (Diff)

### Add
- Full single-page app for generating EuroMillions number suggestions based on uploaded CSV history
- Step-by-step instructions panel (3 steps) linking to National Lottery CSV download
- CSV drag-and-drop / file upload with PapaParse parsing (columns: DrawDate, Ball1–5, Star1–2)
- Filter to last 6 months (~48 draws) of data only
- Statistics dashboard: top 10 hot numbers, top 10 cold numbers, lucky star frequency chart (Chart.js bar chart)
- 6 generation strategies: Hot, Cold, Balanced, Trend (last 10 draws), Weighted Random, Gap strategy — randomly selected each click
- Weighted random selection with added entropy so consecutive clicks always differ
- Output display: lottery balls UI (white for main, gold for stars), animated number reveal, strategy name label
- Line count selector: 1 / 3 / 5 / 10 lines
- "Generate Again" and "Clear Data" buttons
- CSV validation with user-facing error messages
- Dark mode design, card layout, mobile responsive

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Set up React app with Chart.js and PapaParse via CDN imports or npm
2. Build InstructionsPanel component (3-step guide)
3. Build CSVUploader component with drag-and-drop, PapaParse, 6-month filter, validation
4. Build StatsContext/hook to hold parsed draw data in memory
5. Build StatsDashboard component: hot/cold number lists + Chart.js lucky star bar chart
6. Build number generation engine (6 strategies, weighted random selector, entropy injection)
7. Build GeneratorPanel: line count selector, generate button, animated ball reveal
8. Build LotteryBall component (white/gold variants, CSS animation)
9. Wire Clear Data to reset all state
10. Apply dark theme, responsive layout, data-ocid markers

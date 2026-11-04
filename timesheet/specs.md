# Timesheet Upgrade Spec

**App:** Timesheet (`timesheet.html`) by Easily Uncomplicated
**Goal:** Turn the existing timesheet into a pay-aware, visual tool: enter your rates, log hours against named tasks, and see where your time and money went.
**Hosting:** Static site on GitHub Pages. No backend, no accounts, no uploads, no outside data.

---

## 1. What already exists

Keep all of this working:

- Manual entry with From / To times
- Separate timer option
- Week stats
- CSV export
- Overtime and pay basics

This spec describes what is **added or changed**.

---

## 2. File structure

Follow the SPEC.md convention: clean HTML, separate CSS and JS.

```
timesheet.html
css/timesheet.css
js/timesheet.js
```

Keep the new features split into clear sections inside `timesheet.js` (settings, entries, tasks, calculations, charts, export, storage) so the file stays readable.

---

## 3. Features

### 3.1 Settings panel (rates and overtime rule)

| Field | Notes |
|---|---|
| Hourly wage | Number, in rand (R) |
| Overtime wage | Either a direct rand amount or a multiplier (1.5x, 2x). User picks which. |
| Overtime starts after | Hours threshold (e.g. 8 per day or 40 per week) |
| Overtime rule | Toggle: **Daily** or **Weekly** |

Rules:
- Settings save automatically and load on every visit.
- If no rates are set, the app still works and shows hours only, with a gentle "Add your rates to see earnings" prompt instead of R0.00.

### 3.2 Logging an entry

Each entry has:

- **Date:** date picker, defaults to today, backdating allowed
- **From / To:** time pickers (existing)
- **Task:** pick a preset chip or type a custom name
- **Note:** optional free text for one-offs
- **Break:** optional minutes to subtract (nice to have)

Also:
- The timer option stays, and a finished timer run becomes a normal entry with a date, times and a task.
- Entries can be edited and deleted.
- Overnight shifts (To earlier than From) roll over to the next day.

### 3.3 Task presets

- Quick-tap chips such as: **Client meeting, Maintenance, Admin, Travel**
- User can add, rename, reorder and delete presets
- Optional task colour from the brand palette: Navy or Amber, with supporting neutrals used where contrast permits
- Presets are saved with the user's settings
- Deleting a preset does not delete old entries. They keep their task name.

### 3.4 Visuals

1. **Hours per day** (bar chart)
   - One bar per day for the selected week
   - Regular hours in Navy; overtime hours in Amber, outlined in Navy on light chart backgrounds
2. **Time by task** (donut or stacked bar)
   - Percentage and hours per task for the selected period
   - Labels like "Maintenance: 12h (40%)"
3. **Earnings summary** (cards)
   - Regular pay, overtime pay and total
   - Shown for the selected week and month

Rules:
- A period switcher: **This week / This month / Custom range**
- Charts handle empty periods with a friendly empty state
- Each chart has a text or table equivalent, so nothing depends on colour alone

### 3.5 Export

- **CSV:** existing export, now with columns for date, from, to, hours, regular hours, overtime hours, task, note, and pay
- **Print view (later):** a clean printable summary for invoicing

### 3.6 Data storage

- `localStorage` for entries, settings and presets
- **Backup to file / Restore from file:** one-click JSON download and re-import, so data survives switching browsers or clearing storage
- Wrap storage reads and writes safely, and handle empty or corrupted data without breaking the page

---

## 4. Calculation rules

- **Entry hours** = (To − From) − break
- **Daily rule:** hours beyond the threshold in a single day are overtime
- **Weekly rule:** hours beyond the threshold across the Monday to Sunday week are overtime, applied to the latest entries first
- **Pay** = regular hours × hourly wage + overtime hours × overtime wage
- Round money to 2 decimals and display hours as `h:mm` and decimal
- All calculations are plain arithmetic with no external data

---

## 5. Design

- Follow `brand.md`: Navy (#202D50), Amber (#F3B544), and Ivory (#F7F5EF), with Paper, Ink, and Muted ink as supporting neutrals
- Overtime uses Amber with a Navy outline on light chart backgrounds; include labels or a table equivalent so the chart does not rely on colour alone
- Minimal, clean, mobile friendly. Date and time pickers must be easy to use on a phone.
- Tagline and tone: **Simple on purpose.** Few fields visible at a time, with settings tucked away until needed.

---

## 6. Open decisions

Confirm these before building:

1. **Overtime rule default:** Daily, Weekly, or let the user choose (spec currently assumes the user chooses)
2. **Charts:** hand-drawn SVG/canvas (no dependencies, fits the brand) or a small library like Chart.js (faster to build, adds a file)
3. **Overtime wage input:** direct rand amount, multiplier, or both (spec currently assumes both)
4. **Break field:** include now or later

---

## 7. Out of scope

- Accounts or cloud sync
- Uploading documents
- Tax, UIF or deductions (depends on data that changes)
- Public holiday detection (depends on data that changes)
- Payments of any kind

---

## 8. Suggested build order

1. Settings panel (rates, overtime rule), saved to storage
2. Date picker and task field on entries
3. Task presets (add, edit, delete, chips)
4. Pay and overtime calculations
5. Earnings cards
6. Hours-per-day chart
7. Time-by-task chart
8. CSV update and backup/restore
9. Polish: empty states, mobile checks, print view

---

## 9. Done when

- A user can set their rates once and never retype them
- Logging an entry takes a few taps: date, times, task chip
- The week view shows hours per day with overtime clearly highlighted
- The task breakdown matches the entries
- Totals match a manual calculation
- Export and restore round-trip without losing data
- It works offline once loaded and looks right on a phone
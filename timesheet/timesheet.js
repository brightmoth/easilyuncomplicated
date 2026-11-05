const ENTRY_STORAGE_KEY = "eu.timesheet.entries.v1";
const TIMER_STORAGE_KEY = "eu.timesheet.stopwatch.v1";
const SETTINGS_STORAGE_KEY = "eu.timesheet.settings.v1";

const form = document.querySelector("#time-entry-form");
const entryDate = document.querySelector("#entry-date");
const entryFrom = document.querySelector("#entry-from");
const entryTo = document.querySelector("#entry-to");
const entryTask = document.querySelector("#entry-task");
const entryNote = document.querySelector("#entry-note");
const entryBreak = document.querySelector("#entry-break");
const manualTimeFields = document.querySelector("#manual-time-fields");
const addEntryButton = document.querySelector("#add-entry-button");
const timerControls = document.querySelector("#timer-controls");
const timerDisplay = document.querySelector("#timer-display");
const timerStateLabel = document.querySelector("#timer-state");
const timerIndicator = document.querySelector("#timer-indicator");
const startTimerButton = document.querySelector("#start-timer");
const pauseTimerButton = document.querySelector("#pause-timer");
const stopTimerButton = document.querySelector("#stop-timer");
const entryStatus = document.querySelector("#entry-status");
const entriesBody = document.querySelector(".entries-panel tbody");
const entryMethodInputs = document.querySelectorAll('input[name="entry-method"]');
const settingsForm = document.querySelector("#settings-form");
const hourlyWageInput = document.querySelector("#hourly-wage");
const overtimeWageTypeInput = document.querySelector("#overtime-wage-type");
const overtimeWageInput = document.querySelector("#overtime-wage");
const overtimeWageLabel = document.querySelector("#overtime-wage-label");
const overtimeThresholdInput = document.querySelector("#overtime-threshold");
const settingsStatus = document.querySelector("#settings-status");
const summaryPeriod = document.querySelector("#summary-period");
const rangeControl = document.querySelector(".range-control");
const rangeFromInput = document.querySelector("#range-from");
const rangeToInput = document.querySelector("#range-to");
const summaryStatus = document.querySelector("#summary-status");
const settingsPanel = document.querySelector("#settings-panel");

const summaryTotalHours = document.querySelector("#summary-total-hours");
const summaryRegularHours = document.querySelector("#summary-regular-hours");
const summaryOvertimeHours = document.querySelector("#summary-overtime-hours");
const summaryTotalEarnings = document.querySelector("#summary-total-earnings");
const earningsRegularPay = document.querySelector("#earnings-regular-pay");
const earningsOvertimePay = document.querySelector("#earnings-overtime-pay");
const earningsTotalPay = document.querySelector("#earnings-total-pay");

const localDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const localTimeString = (date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const announce = (message) => {
  entryStatus.textContent = message;
};

const readEntries = () => {
  try {
    const stored = localStorage.getItem(ENTRY_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.some((entry) => (
      !entry
      || typeof entry.id !== "string"
      || typeof entry.date !== "string"
      || typeof entry.from !== "string"
      || typeof entry.to !== "string"
      || typeof entry.task !== "string"
      || (entry.durationMs !== undefined && !Number.isFinite(entry.durationMs))
      || (entry.durationMinutes !== undefined && !Number.isFinite(entry.durationMinutes))
    ))) {
      throw new TypeError("Saved time entries have an invalid format.");
    }

    return parsed;
  } catch (error) {
    announce(`Saved time entries could not be loaded: ${error.message}`);
    return [];
  }
};

const saveEntries = (nextEntries) => {
  try {
    localStorage.setItem(ENTRY_STORAGE_KEY, JSON.stringify(nextEntries));
    return true;
  } catch (error) {
    announce(`Your time entry could not be saved: ${error.message}`);
    return false;
  }
};

const readTimer = () => {
  try {
    const stored = localStorage.getItem(TIMER_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);
    if (
      !parsed
      || !Number.isFinite(parsed.startedAt)
      || !Number.isFinite(parsed.pausedMs)
      || typeof parsed.date !== "string"
      || typeof parsed.task !== "string"
    ) {
      throw new TypeError("Saved stopwatch data has an invalid format.");
    }
    return parsed;
  } catch (error) {
    announce(`The saved stopwatch could not be restored: ${error.message}`);
    return null;
  }
};

const defaultSettings = {
  hourlyWage: "",
  overtimeWageType: "amount",
  overtimeWage: "",
  overtimeThreshold: "",
  overtimeRule: "daily",
};

const normalizeOptionalRate = (value) => {
  if (value === "" || value === null || value === undefined) {
    return "";
  }
  const rate = Number(value);
  if (!Number.isFinite(rate) || rate < 0) {
    throw new TypeError("Saved pay settings contain an invalid amount.");
  }
  return String(rate);
};

const readSettings = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) {
      return { ...defaultSettings };
    }

    const parsed = JSON.parse(stored);
    if (
      !parsed
      || !["amount", "multiplier"].includes(parsed.overtimeWageType)
      || !["daily", "weekly"].includes(parsed.overtimeRule)
    ) {
      throw new TypeError("Saved pay settings have an invalid format.");
    }

    return {
      hourlyWage: normalizeOptionalRate(parsed.hourlyWage),
      overtimeWageType: parsed.overtimeWageType,
      overtimeWage: normalizeOptionalRate(parsed.overtimeWage),
      overtimeThreshold: normalizeOptionalRate(parsed.overtimeThreshold),
      overtimeRule: parsed.overtimeRule,
    };
  } catch (error) {
    settingsStatus.textContent = `Pay settings could not be loaded: ${error.message}`;
    return { ...defaultSettings };
  }
};

const saveTimer = () => {
  try {
    if (timer) {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timer));
    } else {
      localStorage.removeItem(TIMER_STORAGE_KEY);
    }
    return true;
  } catch (error) {
    announce(`The stopwatch state could not be saved: ${error.message}`);
    return false;
  }
};

const formatDuration = (milliseconds) => {
  const totalMinutes = Math.max(0, Math.round(milliseconds / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
};

const formatClock = (milliseconds) => {
  const totalSeconds = Math.floor(Math.max(0, milliseconds) / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor(totalSeconds / 60) % 60).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const elapsedMilliseconds = (now = Date.now()) => {
  if (!timer) {
    return 0;
  }
  const currentPause = timer.pausedAt ? now - timer.pausedAt : 0;
  return Math.max(0, now - timer.startedAt - timer.pausedMs - currentPause);
};

let entries = readEntries();
let timer = readTimer();
let settings = readSettings();
let tickerId = null;

const renderEntries = () => {
  entriesBody.replaceChildren();

  if (entries.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.className = "empty-cell";
    cell.colSpan = 6;
    cell.textContent = "No time entries yet. Your logged time will appear here.";
    row.append(cell);
    entriesBody.append(row);
    renderCalculations();
    return;
  }

  const sortedEntries = [...entries].sort((first, second) => (
    `${second.date} ${second.from}`.localeCompare(`${first.date} ${first.from}`)
  ));

  for (const entry of sortedEntries) {
    const row = document.createElement("tr");
    const dateCell = document.createElement("td");
    const timeCell = document.createElement("td");
    const taskCell = document.createElement("td");
    const hoursCell = document.createElement("td");
    const noteCell = document.createElement("td");
    const actionsCell = document.createElement("td");
    const deleteButton = document.createElement("button");

    dateCell.textContent = entry.date;
    timeCell.textContent = `${entry.from}–${entry.to}`;
    taskCell.textContent = entry.task;
    hoursCell.textContent = `${formatDuration(
      entry.durationMs ?? (entry.durationMinutes ?? 0) * 60000,
    )} (${((entry.durationMs ?? (entry.durationMinutes ?? 0) * 60000) / 3600000).toFixed(2)}h)`;
    noteCell.textContent = entry.note || "—";
    deleteButton.className = "entry-delete";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete ${entry.task} entry from ${entry.date}`);
    deleteButton.addEventListener("click", () => {
      const nextEntries = entries.filter((savedEntry) => savedEntry.id !== entry.id);
      if (saveEntries(nextEntries)) {
        entries = nextEntries;
        renderEntries();
        announce("Time entry deleted.");
      }
    });
    actionsCell.append(deleteButton);
    row.append(dateCell, timeCell, taskCell, hoursCell, noteCell, actionsCell);
    entriesBody.append(row);
  }
  renderCalculations();
};

const parseOptionalNumber = (value) => {
  if (value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : Number.NaN;
};

const durationHours = (entry) => {
  if (Number.isFinite(entry.durationMs)) {
    return Math.max(0, entry.durationMs / 3600000);
  }
  if (Number.isFinite(entry.durationMinutes)) {
    return Math.max(0, entry.durationMinutes / 60);
  }

  const from = Number(entry.from.slice(0, 2)) * 60 + Number(entry.from.slice(3, 5));
  const to = Number(entry.to.slice(0, 2)) * 60 + Number(entry.to.slice(3, 5));
  let minutes = to - from;
  if (minutes < 0) {
    minutes += 24 * 60;
  }
  return Math.max(0, minutes - Number(entry.breakMinutes || 0)) / 60;
};

const mondayOf = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return localDateString(date);
};

const currentRange = (period) => {
  const today = new Date();
  const todayString = localDateString(today);
  if (period === "week") {
    const start = mondayOf(todayString);
    const end = new Date(`${start}T00:00:00`);
    end.setDate(end.getDate() + 6);
    return { start, end: localDateString(end) };
  }
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return { start: localDateString(start), end: localDateString(end) };
};

const selectedRange = () => {
  if (summaryPeriod.value === "custom") {
    if (!rangeFromInput.value || !rangeToInput.value || rangeFromInput.value > rangeToInput.value) {
      return null;
    }
    return { start: rangeFromInput.value, end: rangeToInput.value };
  }
  return currentRange(summaryPeriod.value);
};

const calculateOvertime = (sourceEntries) => {
  const allocations = new Map();
  const threshold = parseOptionalNumber(settings.overtimeThreshold);
  for (const entry of sourceEntries) {
    allocations.set(entry, 0);
  }
  if (threshold === null || Number.isNaN(threshold)) {
    return allocations;
  }

  const groups = new Map();
  for (const entry of sourceEntries) {
    const groupKey = settings.overtimeRule === "daily" ? entry.date : mondayOf(entry.date);
    const group = groups.get(groupKey) ?? [];
    group.push(entry);
    groups.set(groupKey, group);
  }

  for (const group of groups.values()) {
    const totalHours = group.reduce((total, entry) => total + durationHours(entry), 0);
    let remainingOvertime = Math.max(0, totalHours - threshold);
    const latestFirst = [...group].sort((first, second) => (
      `${second.date} ${second.from}`.localeCompare(`${first.date} ${first.from}`)
    ));

    for (const entry of latestFirst) {
      const overtimeHours = Math.min(durationHours(entry), remainingOvertime);
      allocations.set(entry, overtimeHours);
      remainingOvertime -= overtimeHours;
    }
  }
  return allocations;
};

const formatHours = (hours) => {
  const totalMinutes = Math.round(hours * 60);
  return `${Math.floor(totalMinutes / 60)}h ${String(totalMinutes % 60).padStart(2, "0")}m (${hours.toFixed(2)}h)`;
};

const moneyFormatter = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
});

const showSettingsLink = (element, message) => {
  const link = document.createElement("a");
  link.href = "#settings-panel";
  link.textContent = message;
  element.replaceChildren(link);
};

const renderCalculations = () => {
  const customRange = summaryPeriod.value === "custom";
  rangeControl.hidden = !customRange;
  const range = selectedRange();
  if (!range) {
    summaryStatus.textContent = "Choose a valid start and end date for the custom range.";
    summaryTotalHours.textContent = "—";
    summaryRegularHours.textContent = "—";
    summaryOvertimeHours.textContent = "—";
    summaryTotalEarnings.textContent = "—";
    earningsRegularPay.textContent = "—";
    earningsOvertimePay.textContent = "—";
    earningsTotalPay.textContent = "—";
    return;
  }
  summaryStatus.textContent = "";

  const allocations = calculateOvertime(entries);
  const periodEntries = entries.filter((entry) => entry.date >= range.start && entry.date <= range.end);
  const totalHours = periodEntries.reduce((total, entry) => total + durationHours(entry), 0);
  const overtimeHours = periodEntries.reduce((total, entry) => total + (allocations.get(entry) ?? 0), 0);
  const regularHours = Math.max(0, totalHours - overtimeHours);
  summaryTotalHours.textContent = formatHours(totalHours);
  summaryRegularHours.textContent = formatHours(regularHours);
  summaryOvertimeHours.textContent = formatHours(overtimeHours);

  const hourlyWage = parseOptionalNumber(settings.hourlyWage);
  const overtimeWage = parseOptionalNumber(settings.overtimeWage);
  const regularPay = hourlyWage === null || Number.isNaN(hourlyWage)
    ? null
    : regularHours * hourlyWage;
  const hasPayRate = hourlyWage !== null || overtimeWage !== null;
  let overtimeRate = null;
  if (overtimeWage !== null && !Number.isNaN(overtimeWage)) {
    overtimeRate = settings.overtimeWageType === "amount"
      ? overtimeWage
      : (hourlyWage === null || Number.isNaN(hourlyWage) ? null : hourlyWage * overtimeWage);
  }
  const overtimePay = !hasPayRate
    ? null
    : (overtimeHours === 0 ? 0 : (overtimeRate === null ? null : overtimeHours * overtimeRate));
  const totalPay = regularPay === null || overtimePay === null
    ? null
    : regularPay + overtimePay;

  if (regularPay === null) {
    showSettingsLink(earningsRegularPay, "Set your hourly wage");
  } else {
    earningsRegularPay.textContent = moneyFormatter.format(regularPay);
  }

  if (overtimePay === null) {
    showSettingsLink(earningsOvertimePay, "Set your overtime rate");
  } else {
    earningsOvertimePay.textContent = moneyFormatter.format(overtimePay);
  }

  if (totalPay === null) {
    showSettingsLink(earningsTotalPay, "Add your pay rates to calculate earnings");
    showSettingsLink(summaryTotalEarnings, "Set pay rates");
  } else {
    earningsTotalPay.textContent = moneyFormatter.format(totalPay);
    summaryTotalEarnings.textContent = moneyFormatter.format(totalPay);
  }
};

const restoreSettingsForm = () => {
  hourlyWageInput.value = settings.hourlyWage;
  overtimeWageTypeInput.value = settings.overtimeWageType;
  overtimeWageInput.value = settings.overtimeWage;
  overtimeThresholdInput.value = settings.overtimeThreshold;
  const rule = settingsForm.querySelector(`input[name="overtime-rule"][value="${settings.overtimeRule}"]`);
  if (rule) {
    rule.checked = true;
  }
  updateOvertimeWageLabel();
};

const updateOvertimeWageLabel = () => {
  const isMultiplier = overtimeWageTypeInput.value === "multiplier";
  overtimeWageLabel.textContent = isMultiplier
    ? "Overtime multiplier (e.g. 1.5)"
    : "Overtime pay (R/hour)";
  overtimeWageInput.step = isMultiplier ? "0.05" : "0.01";
  overtimeWageInput.placeholder = isMultiplier ? "e.g. 1.5" : "e.g. 300";
};

const persistSettingsFromForm = () => {
  const wage = parseOptionalNumber(hourlyWageInput.value);
  const overtime = parseOptionalNumber(overtimeWageInput.value);
  const threshold = parseOptionalNumber(overtimeThresholdInput.value);
  if ([wage, overtime, threshold].some(Number.isNaN)) {
    settingsStatus.textContent = "Enter zero or a positive amount for each rate and threshold.";
    return;
  }

  const rule = settingsForm.querySelector('input[name="overtime-rule"]:checked')?.value;
  const nextSettings = {
    hourlyWage: hourlyWageInput.value,
    overtimeWageType: overtimeWageTypeInput.value,
    overtimeWage: overtimeWageInput.value,
    overtimeThreshold: overtimeThresholdInput.value,
    overtimeRule: rule === "weekly" ? "weekly" : "daily",
  };
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
    settings = nextSettings;
    settingsStatus.textContent = "Saved on this device.";
    renderCalculations();
  } catch (error) {
    settingsStatus.textContent = `Pay settings could not be saved: ${error.message}`;
  }
};

const selectedMethod = () => (
  document.querySelector('input[name="entry-method"]:checked')?.value ?? "manual"
);

const renderTimer = () => {
  const isTimerMode = selectedMethod() === "timer";
  manualTimeFields.hidden = isTimerMode;
  entryFrom.required = !isTimerMode;
  entryTo.required = !isTimerMode;
  addEntryButton.hidden = isTimerMode;
  timerControls.hidden = !isTimerMode;

  if (!timer) {
    timerDisplay.value = "00:00:00";
    timerStateLabel.textContent = "Stopwatch is ready.";
    timerControls.classList.remove("is-running");
    startTimerButton.disabled = false;
    startTimerButton.textContent = "Start";
    pauseTimerButton.disabled = true;
    pauseTimerButton.textContent = "Pause";
    stopTimerButton.disabled = true;
  } else {
    const paused = Boolean(timer.pausedAt);
    timerDisplay.value = formatClock(elapsedMilliseconds());
    timerStateLabel.textContent = paused ? "Stopwatch paused." : "Stopwatch running.";
    timerControls.classList.toggle("is-running", !paused);
    startTimerButton.disabled = true;
    pauseTimerButton.disabled = false;
    pauseTimerButton.textContent = paused ? "Resume" : "Pause";
    stopTimerButton.disabled = false;
    entryDate.value = timer.date;
    entryTask.value = timer.task;
    entryNote.value = timer.note;
    entryBreak.value = timer.breakMinutes;
  }

  const isActive = Boolean(timer);
  for (const input of entryMethodInputs) {
    input.disabled = isActive;
  }

  for (const input of [entryDate, entryTask, entryNote, entryBreak]) {
    input.disabled = isActive;
  }

  if (timer && !timer.pausedAt && tickerId === null) {
    tickerId = window.setInterval(() => {
      timerDisplay.value = formatClock(elapsedMilliseconds());
    }, 250);
  } else if ((!timer || timer.pausedAt) && tickerId !== null) {
    window.clearInterval(tickerId);
    tickerId = null;
  }
};

const setTodayIfEmpty = () => {
  if (!entryDate.value) {
    entryDate.value = localDateString(new Date());
  }
};

form.addEventListener("change", (event) => {
  if (event.target instanceof HTMLInputElement && event.target.name === "entry-method") {
    announce("");
    renderTimer();
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (selectedMethod() !== "manual") {
    return;
  }

  const values = new FormData(form);
  const from = String(values.get("from"));
  const to = String(values.get("to"));
  const breakMinutes = Number(values.get("break") || 0);
  let durationMinutes = (
    Number(to.slice(0, 2)) * 60 + Number(to.slice(3, 5))
    - Number(from.slice(0, 2)) * 60 - Number(from.slice(3, 5))
  );
  if (durationMinutes < 0) {
    durationMinutes += 24 * 60;
  }
  durationMinutes -= breakMinutes;

  if (!Number.isFinite(breakMinutes) || breakMinutes < 0 || durationMinutes <= 0) {
    announce("Check the times and break. The entry must have a positive duration.");
    return;
  }

  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    date: String(values.get("date")),
    from,
    to,
    task: String(values.get("task")).trim(),
    note: String(values.get("note") || "").trim(),
    breakMinutes,
    durationMinutes,
  };
  if (!entry.task) {
    announce("Add a task before saving the entry.");
    return;
  }

  const nextEntries = [...entries, entry];
  if (!saveEntries(nextEntries)) {
    return;
  }

  entries = nextEntries;
  form.reset();
  setTodayIfEmpty();
  renderTimer();
  renderEntries();
  announce("Time entry added.");
});

startTimerButton.addEventListener("click", () => {
  const task = entryTask.value.trim();
  if (!task) {
    entryTask.focus();
    announce("Choose or enter a task before starting the stopwatch.");
    return;
  }

  const breakMinutes = Number(entryBreak.value || 0);
  if (!Number.isFinite(breakMinutes) || breakMinutes < 0) {
    entryBreak.focus();
    announce("Enter a valid break duration before starting the stopwatch.");
    return;
  }

  setTodayIfEmpty();
  const startedAt = Date.now();
  timer = {
    startedAt,
    pausedAt: null,
    pausedMs: 0,
    date: entryDate.value,
    task,
    note: entryNote.value.trim(),
    breakMinutes,
    from: localTimeString(new Date(startedAt)),
  };
  announce("");
  saveTimer();
  renderTimer();
});

pauseTimerButton.addEventListener("click", () => {
  if (!timer) {
    return;
  }

  if (timer.pausedAt) {
    timer.pausedMs += Date.now() - timer.pausedAt;
    timer.pausedAt = null;
    announce("Stopwatch resumed.");
  } else {
    timer.pausedAt = Date.now();
    announce("Stopwatch paused.");
  }
  saveTimer();
  renderTimer();
});

stopTimerButton.addEventListener("click", () => {
  if (!timer) {
    return;
  }

  const stoppedAt = Date.now();
  const durationMs = elapsedMilliseconds(stoppedAt) - timer.breakMinutes * 60000;
  if (durationMs <= 0) {
    announce("Run the stopwatch for a little longer before saving.");
    return;
  }

  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    date: timer.date,
    from: timer.from,
    to: localTimeString(new Date(stoppedAt)),
    task: timer.task,
    note: timer.note,
    breakMinutes: timer.breakMinutes + timer.pausedMs / 60000,
    durationMs,
  };
  const nextEntries = [...entries, entry];
  if (!saveEntries(nextEntries)) {
    return;
  }

  entries = nextEntries;
  timer = null;
  saveTimer();
  entryDate.disabled = false;
  entryTask.disabled = false;
  entryNote.disabled = false;
  entryBreak.disabled = false;
  form.reset();
  setTodayIfEmpty();
  renderTimer();
  renderEntries();
  announce("Stopwatch time saved as a time entry.");
});

settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();
});

settingsForm.addEventListener("input", (event) => {
  if (event.target === overtimeWageTypeInput) {
    updateOvertimeWageLabel();
  }
  persistSettingsFromForm();
});

settingsForm.addEventListener("change", (event) => {
  if (event.target === overtimeWageTypeInput) {
    updateOvertimeWageLabel();
  }
  persistSettingsFromForm();
});

summaryPeriod.addEventListener("change", () => {
  if (summaryPeriod.value === "custom" && (!rangeFromInput.value || !rangeToInput.value)) {
    const defaultRange = currentRange("week");
    rangeFromInput.value = defaultRange.start;
    rangeToInput.value = localDateString(new Date());
  }
  renderCalculations();
});

rangeFromInput.addEventListener("change", renderCalculations);
rangeToInput.addEventListener("change", renderCalculations);

document.querySelectorAll('a[href="#settings-panel"]').forEach((link) => {
  link.addEventListener("click", () => {
    settingsPanel.open = true;
  });
});

restoreSettingsForm();
if (!settingsStatus.textContent) {
  settingsStatus.textContent = "Rates are saved only in this browser on this device.";
}
if (window.location.hash === "#settings-panel") {
  settingsPanel.open = true;
}
setTodayIfEmpty();
if (timer) {
  document.querySelector('input[name="entry-method"][value="timer"]').checked = true;
}
renderTimer();
renderEntries();
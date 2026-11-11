// Jadwal Shift Karyawan (Owner) — hanya lihat.
// Membaca jadwal yang sudah ditampilkan Admin lewat tombol "Tampilkan ke Owner"
// (localStorage "washupShiftSchedulePublished", bentuk { "YYYY-MM-DD": { nama: idShift | "libur" } }).
// Draf Admin ("washupShiftSchedule") tidak pernah dibaca di sini.
// Memakai fungsi dari app.js: ensureMasterDefaults, masterDefinitions.
(() => {
  const page = document.querySelector(".owner-schedule-page");
  if (!page) return;

  const PUBLISHED_KEY = "washupShiftSchedulePublished";
  const PUBLISHED_AT_KEY = "washupShiftSchedulePublishedAt";
  const OFF = "libur";
  const DAY_NAMES = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  const $ = (selector) => document.querySelector(selector);
  const ui = {
    week: $("#owner-sched-week"),
    search: $("#owner-sched-search"),
    filter: $("#owner-sched-filter"),
    title: $("#owner-sched-title"),
    table: $("#owner-sched-table"),
    tableWrap: $("#owner-sched-table-wrap"),
    empty: $("#owner-sched-empty"),
    updated: $("#owner-sched-updated"),
    day: $("#owner-sched-day"),
    dayTitle: $("#owner-sched-day-title"),
    duty: $("#owner-sched-duty"),
  };

  // ---------- Tanggal ----------
  const pad = (value) => String(value).padStart(2, "0");
  const toKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const fromKey = (key) => {
    const [year, month, day] = String(key).split("-").map(Number);
    return new Date(year, month - 1, day);
  };
  const addDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  const startOfWeek = (date) => addDays(date, -((date.getDay() + 6) % 7));
  const shortDate = (date) => `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
  const longDate = (date) => `${DAY_NAMES[(date.getDay() + 6) % 7]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  const weekDates = (weekKey) => DAY_NAMES.map((_, index) => addDays(fromKey(weekKey), index));
  const formatRange = (weekKey) => {
    const start = fromKey(weekKey);
    const end = addDays(start, 6);
    if (start.getFullYear() !== end.getFullYear()) {
      return `${start.getDate()} ${MONTHS[start.getMonth()]} ${start.getFullYear()} – ${end.getDate()} ${MONTHS[end.getMonth()]} ${end.getFullYear()}`;
    }
    if (start.getMonth() !== end.getMonth()) {
      return `${start.getDate()} ${MONTHS[start.getMonth()]} – ${end.getDate()} ${MONTHS[end.getMonth()]} ${end.getFullYear()}`;
    }
    return `${start.getDate()}–${end.getDate()} ${MONTHS[start.getMonth()]} ${end.getFullYear()}`;
  };

  // ---------- Data ----------
  const formatTime = (value, isEnd) => (isEnd && value === "00:00" ? "24.00" : String(value || "").replace(":", "."));
  function readJson(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "{}");
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch {
      return {};
    }
  }
  function getShiftOptions() {
    let shifts = [];
    try {
      shifts = ensureMasterDefaults("shifts", masterDefinitions.shifts);
    } catch {
      shifts = [];
    }
    const options = shifts
      .filter((shift) => shift && shift.status === "Aktif" && shift.id && shift.name)
      .sort((first, second) => String(first.start).localeCompare(String(second.start)))
      .map((shift) => ({
        id: shift.id,
        label: String(shift.name).replace(/^shift\s+/i, ""),
        time: `${formatTime(shift.start)}–${formatTime(shift.end, true)}`,
      }));
    return [...options, { id: OFF, label: "Libur", time: "Tidak bertugas" }];
  }
  // Nama karyawan yang dijadwalkan pada satu tanggal untuk satu shift.
  const namesFor = (published, dateKey, shiftId) => Object.entries(published[dateKey] || {})
    .filter(([, value]) => value === shiftId)
    .map(([name]) => name)
    .sort((first, second) => first.localeCompare(second, "id-ID"));
  const weekHasData = (published, weekKey) => weekDates(weekKey).some((date) => Object.keys(published[toKey(date)] || {}).length);

  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  // ---------- Pilihan filter ----------
  function fillWeeks() {
    const published = readJson(PUBLISHED_KEY);
    const publishedAt = readJson(PUBLISHED_AT_KEY);
    const current = toKey(startOfWeek(new Date()));
    const keys = Object.keys(publishedAt).filter((key) => weekHasData(published, key));
    const all = [...new Set([...keys, current])].sort();
    ui.week.replaceChildren(...all.map((key) => {
      const option = make("option", "", `${formatRange(key)}${keys.includes(key) ? "" : " (belum ditampilkan)"}`);
      option.value = key;
      return option;
    }));
    ui.week.value = keys.includes(current) || !keys.length ? current : keys[keys.length - 1];
  }
  function fillShiftFilter() {
    ui.filter.replaceChildren(make("option", "", "Semua shift"), ...getShiftOptions().map((shift) => {
      const option = make("option", "", shift.label);
      option.value = shift.id;
      return option;
    }));
    ui.filter.options[0].value = "all";
  }
  function fillDays() {
    const dates = weekDates(ui.week.value);
    const todayIndex = dates.findIndex((date) => toKey(date) === toKey(new Date()));
    ui.day.replaceChildren(...dates.map((date, index) => {
      const option = make("option", "", `${DAY_NAMES[index]}, ${shortDate(date)}`);
      option.value = String(index);
      return option;
    }));
    ui.day.value = String(todayIndex >= 0 ? todayIndex : 0);
  }

  // ---------- Tampilan ----------
  function renderTable(published) {
    const options = getShiftOptions();
    const visible = ui.filter.value === "all" ? options : options.filter((shift) => shift.id === ui.filter.value);
    const query = ui.search.value.trim().toLocaleLowerCase("id-ID");
    const todayKey = toKey(new Date());

    const head = make("thead");
    const headRow = make("tr");
    const corner = make("th", "", "Hari / Tanggal");
    corner.scope = "col";
    headRow.append(corner);
    visible.forEach((shift) => {
      const th = make("th");
      th.scope = "col";
      th.append(make("span", "sched-col-title", shift.label), make("span", "sched-col-time", shift.time));
      headRow.append(th);
    });
    head.append(headRow);

    const body = make("tbody");
    weekDates(ui.week.value).forEach((date, index) => {
      const dateKey = toKey(date);
      const row = make("tr");
      if (dateKey === todayKey) row.classList.add("is-today");
      const dayCell = make("th");
      dayCell.scope = "row";
      dayCell.append(make("strong", "", DAY_NAMES[index]), make("span", "sched-day-date", shortDate(date)));
      row.append(dayCell);
      visible.forEach((shift) => {
        const cell = make("td");
        const names = namesFor(published, dateKey, shift.id)
          .filter((name) => !query || name.toLocaleLowerCase("id-ID").includes(query));
        if (names.length) {
          const list = make("div", "sched-chip-list");
          names.forEach((name) => list.append(make("span", `sched-chip ${shift.id === OFF ? "sched-chip-off" : "sched-chip-on"}`, name)));
          cell.append(list);
        } else {
          const dash = make("span", "sched-dash", "—");
          dash.setAttribute("aria-label", "Tidak ada");
          cell.append(dash);
        }
        row.append(cell);
      });
      body.append(row);
    });
    ui.table.replaceChildren(ui.table.querySelector("caption") || make("caption", "sr-only", "Jadwal shift karyawan"), head, body);
  }

  function renderDuty(published) {
    const date = weekDates(ui.week.value)[Number(ui.day.value) || 0];
    const dateKey = toKey(date);
    ui.dayTitle.textContent = longDate(date);
    ui.duty.replaceChildren(...getShiftOptions().map((shift) => {
      const names = namesFor(published, dateKey, shift.id);
      const box = make("div", "owner-duty-box");
      box.append(make("span", "", `${shift.label} · ${shift.time}`), make("strong", "", names.length ? names.join(", ") : "Tidak ada"));
      return box;
    }));
  }

  function render() {
    const published = readJson(PUBLISHED_KEY);
    const publishedAt = readJson(PUBLISHED_AT_KEY)[ui.week.value];
    const hasData = Boolean(publishedAt) && weekHasData(published, ui.week.value);
    ui.title.textContent = `Jadwal ${formatRange(ui.week.value)}`;
    ui.tableWrap.hidden = !hasData;
    ui.empty.hidden = hasData;
    if (hasData) renderTable(published);
    const note = "Owner hanya dapat melihat; perubahan jadwal dilakukan oleh admin.";
    ui.updated.textContent = hasData
      ? `Ditampilkan admin ${new Date(publishedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}. ${note}`
      : note;
    renderDuty(hasData ? published : {});
  }

  ui.week.addEventListener("change", () => { fillDays(); render(); });
  ui.search.addEventListener("input", render);
  ui.filter.addEventListener("change", render);
  ui.day.addEventListener("change", () => renderDuty(readJson(PUBLISHED_AT_KEY)[ui.week.value] ? readJson(PUBLISHED_KEY) : {}));

  fillWeeks();
  fillShiftFilter();
  fillDays();
  render();
})();

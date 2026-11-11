// Tab "Data Shift" di halaman Data Shift Admin: jadwal per hari (hari × shift) dan
// form "Atur Pembagian Shift" untuk satu karyawan selama satu minggu.
// Memakai data draf yang sama dengan tab Pembagian Shift (js/shift-schedule.js):
// localStorage "washupShiftSchedule" = { "YYYY-MM-DD": { nama: idShift | "libur" } }.
// Setelah menyimpan, event "washup:shift-schedule-changed" memberi tahu tab Pembagian Shift.
// Memakai fungsi dari app.js: ensureMasterDefaults, masterDefinitions, getActiveEmployees.
(() => {
  const view = document.getElementById("sd-table");
  if (!view) return;

  const STORAGE_KEY = "washupShiftSchedule";
  const PUBLISHED_KEY = "washupShiftSchedulePublished";
  const PUBLISHED_AT_KEY = "washupShiftSchedulePublishedAt";
  const OFF = "libur";
  const DAY_NAMES = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  const $ = (selector) => document.querySelector(selector);
  const ui = {
    week: $("#sd-week"),
    search: $("#sd-search"),
    title: $("#sd-title"),
    status: $("#sd-status"),
    tableWrap: $("#sd-table-wrap"),
    empty: $("#sd-empty"),
    legend: $("#sd-legend"),
    rotation: $("#sd-rotation"),
    open: $("#sd-open-form"),
    dialog: $("#sd-dialog"),
    form: $("#sd-form"),
    formEmployee: $("#sd-form-employee"),
    formWeek: $("#sd-form-week"),
    shiftInfo: $("#sd-shift-info"),
    dayRows: $("#sd-day-rows"),
    summary: $("#sd-summary"),
    notice: $("#sd-notice"),
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
  function getEmployees() {
    try {
      return getActiveEmployees();
    } catch {
      return [];
    }
  }
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };
  const weekSnapshot = (schedule, weekKey) => JSON.stringify(weekDates(weekKey).map((date) => schedule[toKey(date)] || {}));

  // ---------- Pilihan minggu ----------
  // Minggu lalu sampai 4 minggu ke depan, ditambah minggu lain yang sudah punya jadwal.
  function weekOptions() {
    const current = startOfWeek(new Date());
    const keys = new Set([-1, 0, 1, 2, 3, 4].map((offset) => toKey(addDays(current, offset * 7))));
    Object.keys(readJson(STORAGE_KEY)).forEach((dateKey) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) keys.add(toKey(startOfWeek(fromKey(dateKey))));
    });
    return [...keys].sort();
  }
  function fillWeekSelect(select, value) {
    const keys = weekOptions();
    select.replaceChildren(...keys.map((key) => {
      const option = make("option", "", formatRange(key));
      option.value = key;
      return option;
    }));
    select.value = keys.includes(value) ? value : toKey(startOfWeek(new Date()));
  }

  // ---------- Tampilan jadwal per hari ----------
  function renderView() {
    const weekKey = ui.week.value;
    const schedule = readJson(STORAGE_KEY);
    const options = getShiftOptions();
    const employees = getEmployees();
    const query = ui.search.value.trim().toLocaleLowerCase("id-ID");
    const todayKey = toKey(new Date());

    ui.title.textContent = `Jadwal ${formatRange(weekKey)}`;
    const wasPublished = Boolean(readJson(PUBLISHED_AT_KEY)[weekKey]);
    const sameAsPublished = weekSnapshot(schedule, weekKey) === weekSnapshot(readJson(PUBLISHED_KEY), weekKey);
    const status = !wasPublished ? ["Draf", "draft"] : sameAsPublished ? ["Tampil di Owner", "published"] : ["Ada perubahan", "changed"];
    ui.status.textContent = status[0];
    ui.status.className = `ss-status ss-status-${status[1]}`;

    ui.empty.hidden = employees.length > 0;
    ui.tableWrap.hidden = employees.length === 0;
    ui.open.disabled = employees.length === 0;

    const head = make("thead");
    const headRow = make("tr");
    const corner = make("th", "", "Hari / Tanggal");
    corner.scope = "col";
    headRow.append(corner);
    options.forEach((shift) => {
      const th = make("th");
      th.scope = "col";
      th.append(make("span", "sched-col-title", shift.label), make("span", "sched-col-time", shift.time));
      headRow.append(th);
    });
    head.append(headRow);

    const body = make("tbody");
    weekDates(weekKey).forEach((date, index) => {
      const dateKey = toKey(date);
      const row = make("tr");
      if (dateKey === todayKey) row.classList.add("is-today");
      const dayCell = make("th");
      dayCell.scope = "row";
      dayCell.append(make("strong", "", DAY_NAMES[index]), make("span", "sched-day-date", shortDate(date)));
      row.append(dayCell);
      options.forEach((shift) => {
        const cell = make("td");
        const names = Object.entries(schedule[dateKey] || {})
          .filter(([name, value]) => value === shift.id && (!query || name.toLocaleLowerCase("id-ID").includes(query)))
          .map(([name]) => name)
          .sort((first, second) => first.localeCompare(second, "id-ID"));
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
    view.replaceChildren(view.querySelector("caption"), head, body);

    ui.legend.textContent = `${options.filter((shift) => shift.id !== OFF).map((shift) => `${shift.label} · ${shift.time}`).join("   |   ")}. Tanda — berarti tidak ada karyawan pada shift itu.`;

    // Ringkasan rotasi per karyawan, misalnya "kasir: 3 Pagi · 3 Malam · 1 Libur".
    ui.rotation.replaceChildren(...employees
      .filter((employee) => !query || employee.name.toLocaleLowerCase("id-ID").includes(query))
      .map((employee) => {
        const counts = options.map((shift) => [shift.label, weekDates(weekKey).filter((date) => (schedule[toKey(date)] || {})[employee.name] === shift.id).length]);
        const unset = 7 - counts.reduce((total, [, count]) => total + count, 0);
        const parts = counts.filter(([, count]) => count).map(([label, count]) => `${count} ${label}`);
        if (unset) parts.push(`${unset} belum diatur`);
        const line = make("p");
        line.append(make("strong", "", `Rotasi ${employee.name}: `), document.createTextNode(parts.join(" · ")));
        return line;
      }));
  }

  // ---------- Form Atur Pembagian Shift ----------
  function renderForm() {
    const options = getShiftOptions();
    const schedule = readJson(STORAGE_KEY);
    const employeeName = ui.formEmployee.value;
    ui.shiftInfo.replaceChildren(
      make("strong", "", options.filter((shift) => shift.id !== OFF).map((shift) => `${shift.label} · ${shift.time}`).join("   |   ")),
      make("span", "", "Jam setiap shift diatur lewat tombol Atur Jam Shift."),
    );
    ui.dayRows.replaceChildren(...weekDates(ui.formWeek.value).map((date, index) => {
      const dateKey = toKey(date);
      const value = (schedule[dateKey] || {})[employeeName] || "";
      const row = make("div", "sd-day-row");
      const label = make("span", "sd-day-name");
      label.id = `sd-day-label-${index}`;
      label.append(make("strong", "", DAY_NAMES[index]), make("small", "", shortDate(date)));
      const group = make("div", "sd-segment");
      group.setAttribute("role", "radiogroup");
      group.setAttribute("aria-labelledby", label.id);
      options.forEach((shift) => {
        const option = make("label", "sd-segment-option");
        const input = make("input");
        input.type = "radio";
        input.name = `sd-day-${index}`;
        input.value = shift.id;
        input.dataset.date = dateKey;
        input.checked = value === shift.id;
        option.append(input, make("span", "", shift.label));
        group.append(option);
      });
      const time = make("span", "sd-day-time");
      row.append(label, group, time);
      return row;
    }));
    updateFormSummary();
  }
  function updateFormSummary() {
    const options = getShiftOptions();
    const chosen = [...ui.dayRows.querySelectorAll("input:checked")].map((input) => input.value);
    ui.dayRows.querySelectorAll(".sd-day-row").forEach((row) => {
      const picked = row.querySelector("input:checked");
      const shift = options.find((option) => option.id === picked?.value);
      row.querySelector(".sd-day-time").textContent = shift ? `${shift.label} · ${shift.time}` : "Belum diatur";
    });
    const parts = options.map((shift) => [shift.label, chosen.filter((value) => value === shift.id).length])
      .filter(([, count]) => count)
      .map(([label, count]) => `${count} ${label}`);
    if (chosen.length < 7) parts.push(`${7 - chosen.length} belum diatur`);
    ui.summary.textContent = `${ui.formEmployee.value || "-"} · ${parts.join(" · ")}`;
  }
  const openDialog = (dialog) => (typeof dialog.showModal === "function" ? dialog.showModal() : dialog.setAttribute("open", ""));
  const closeDialog = (dialog) => (typeof dialog.close === "function" ? dialog.close() : dialog.removeAttribute("open"));

  ui.open.addEventListener("click", () => {
    const employees = getEmployees();
    ui.formEmployee.replaceChildren(...employees.map((employee) => {
      const option = make("option", "", `${employee.name} · ${employee.role}`);
      option.value = employee.name;
      return option;
    }));
    fillWeekSelect(ui.formWeek, ui.week.value);
    ui.notice.textContent = "";
    renderForm();
    openDialog(ui.dialog);
    ui.formEmployee.focus();
  });
  ui.formEmployee.addEventListener("change", renderForm);
  ui.formWeek.addEventListener("change", renderForm);
  ui.dayRows.addEventListener("change", () => { ui.notice.textContent = ""; updateFormSummary(); });
  $("#sd-close").addEventListener("click", () => closeDialog(ui.dialog));
  $("#sd-cancel").addEventListener("click", () => closeDialog(ui.dialog));
  ui.dialog.addEventListener("click", (event) => { if (event.target === ui.dialog) closeDialog(ui.dialog); });

  ui.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const employeeName = ui.formEmployee.value;
    if (!employeeName) {
      ui.notice.textContent = "Pilih karyawan terlebih dahulu.";
      return;
    }
    const picked = [...ui.dayRows.querySelectorAll("input:checked")];
    if (!picked.length) {
      ui.notice.textContent = "Pilih shift minimal untuk satu hari.";
      ui.dayRows.querySelector("input")?.focus();
      return;
    }
    const schedule = readJson(STORAGE_KEY);
    picked.forEach((input) => {
      schedule[input.dataset.date] ||= {};
      schedule[input.dataset.date][employeeName] = input.value;
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
    } catch {
      ui.notice.textContent = "Jadwal tidak dapat disimpan. Penyimpanan browser penuh atau tidak tersedia.";
      return;
    }
    closeDialog(ui.dialog);
    fillWeekSelect(ui.week, ui.formWeek.value);
    renderView();
    window.dispatchEvent(new Event("washup:shift-schedule-changed"));
  });

  // ---------- Atur Jam Shift (tabel master shift di dalam dialog) ----------
  const timesDialog = $("#sd-times-dialog");
  if (timesDialog) {
    $("#sd-open-times")?.addEventListener("click", () => openDialog(timesDialog));
    $("#sd-times-close")?.addEventListener("click", () => closeDialog(timesDialog));
    timesDialog.addEventListener("click", (event) => { if (event.target === timesDialog) closeDialog(timesDialog); });
    // Jam shift bisa berubah: perbarui label jam di jadwal setelah dialog ditutup.
    timesDialog.addEventListener("close", () => {
      renderView();
      window.dispatchEvent(new Event("washup:shift-schedule-changed"));
    });
  }

  // ---------- Mulai ----------
  ui.week.addEventListener("change", renderView);
  ui.search.addEventListener("input", renderView);
  // Perubahan dari tab Pembagian Shift (grid, dialog, tampilkan ke owner) ikut tampil di sini.
  window.addEventListener("washup:shift-schedule-changed", renderView);
  document.querySelectorAll(".ss-tab").forEach((tab) => tab.addEventListener("click", () => {
    if (tab.dataset.tab === "shifts") renderView();
  }));
  fillWeekSelect(ui.week, toKey(startOfWeek(new Date())));
  renderView();
})();

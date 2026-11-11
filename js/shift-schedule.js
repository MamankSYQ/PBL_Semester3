// Pembagian Shift (halaman Data Shift Admin).
// Jadwal mingguan per karyawan: grid karyawan x hari, atur beberapa hari sekaligus,
// dan salin jadwal minggu sebelumnya. Perubahan langsung tersimpan (tanpa draf).
// Memakai fungsi dari app.js: ensureMasterDefaults, masterDefinitions, getActiveEmployees.
(() => {
  const panel = document.getElementById("ss-panel-schedule");
  if (!panel) return;

  const STORAGE_KEY = "washupShiftSchedule";
  const OFF = "libur";
  const DAY_NAMES = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  const $ = (selector) => document.querySelector(selector);
  const el = {
    tabs: document.querySelectorAll(".ss-tab"),
    tabPanels: document.querySelectorAll("[data-tab-panel]"),
    weekLabel: $("#ss-week-label"),
    weekPrev: $("#ss-week-prev"),
    weekNext: $("#ss-week-next"),
    weekToday: $("#ss-week-today"),
    copyWeek: $("#ss-copy-week"),
    openBulk: $("#ss-open-bulk"),
    head: $("#ss-grid-head"),
    body: $("#ss-grid-body"),
    caption: $("#ss-grid-caption"),
    gridWrap: document.querySelector(".ss-grid-wrap"),
    empty: $("#ss-empty"),
    legend: $("#ss-legend"),
    filled: $("#ss-filled-count"),
    notice: $("#ss-notice"),
    bulkDialog: $("#ss-bulk-dialog"),
    bulkForm: $("#ss-bulk-form"),
    bulkRange: $("#ss-bulk-range"),
    bulkEmployee: $("#ss-bulk-employee"),
    bulkDays: $("#ss-bulk-days"),
    bulkDayCount: $("#ss-bulk-day-count"),
    bulkShifts: $("#ss-bulk-shifts"),
    bulkSummaryTitle: $("#ss-bulk-summary-title"),
    bulkSummaryText: $("#ss-bulk-summary-text"),
    bulkNotice: $("#ss-bulk-notice"),
    previewName: $("#ss-preview-name"),
    previewList: $("#ss-preview-list"),
    confirmDialog: $("#ss-confirm-dialog"),
    confirmText: $("#ss-confirm-text"),
    confirmOk: $("#ss-confirm-ok"),
  };

  // ---------- Tanggal ----------
  const pad = (value) => String(value).padStart(2, "0");
  const toKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const addDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  const startOfWeek = (date) => addDays(date, -((date.getDay() + 6) % 7)); // Senin
  const shortDate = (date) => `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`;
  const formatRange = (start) => {
    const end = addDays(start, 6);
    if (start.getFullYear() !== end.getFullYear()) {
      return `${start.getDate()} ${MONTHS[start.getMonth()]} ${start.getFullYear()} – ${end.getDate()} ${MONTHS[end.getMonth()]} ${end.getFullYear()}`;
    }
    if (start.getMonth() !== end.getMonth()) {
      return `${start.getDate()} ${MONTHS[start.getMonth()]} – ${end.getDate()} ${MONTHS[end.getMonth()]} ${end.getFullYear()}`;
    }
    return `${start.getDate()}–${end.getDate()} ${MONTHS[start.getMonth()]} ${end.getFullYear()}`;
  };

  let weekStart = startOfWeek(new Date());
  const weekDates = () => DAY_NAMES.map((_, index) => addDays(weekStart, index));

  // ---------- Data ----------
  const formatTime = (value, isEnd) => (isEnd && value === "00:00" ? "24.00" : String(value || "").replace(":", "."));

  function getShiftOptions() {
    let shifts = [];
    try {
      shifts = ensureMasterDefaults("shifts", masterDefinitions.shifts);
    } catch {
      shifts = [];
    }
    return shifts
      .filter((shift) => shift && shift.status === "Aktif" && shift.id && shift.name)
      .sort((first, second) => String(first.start).localeCompare(String(second.start)))
      .map((shift) => ({
        id: shift.id,
        label: String(shift.name).replace(/^shift\s+/i, ""),
        time: `${formatTime(shift.start)}–${formatTime(shift.end, true)}`,
      }));
  }

  function getEmployees() {
    try {
      return getActiveEmployees();
    } catch {
      return [];
    }
  }

  function readSchedule() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch {
      return {};
    }
  }

  function saveSchedule(schedule) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
      return true;
    } catch {
      showNotice("Jadwal tidak dapat disimpan. Penyimpanan browser penuh atau tidak tersedia.", true);
      return false;
    }
  }

  const getValue = (schedule, dateKey, employeeName) => (schedule[dateKey] && schedule[dateKey][employeeName]) || "";

  function setValue(schedule, dateKey, employeeName, value) {
    if (!value) {
      if (schedule[dateKey]) {
        delete schedule[dateKey][employeeName];
        if (!Object.keys(schedule[dateKey]).length) delete schedule[dateKey];
      }
      return;
    }
    schedule[dateKey] ||= {};
    schedule[dateKey][employeeName] = value;
  }

  // Label dan keterangan jam untuk satu nilai jadwal.
  function describe(value, shiftOptions) {
    if (!value) return { label: "Belum diatur", time: "—", kind: "empty" };
    if (value === OFF) return { label: "Libur", time: "Tidak bertugas", kind: "off" };
    const shift = shiftOptions.find((option) => option.id === value);
    return shift
      ? { label: shift.label, time: shift.time, kind: "shift" }
      : { label: "Shift nonaktif", time: "Perlu diatur ulang", kind: "inactive" };
  }

  // ---------- Notifikasi ----------
  let noticeTimer = null;
  function showNotice(message, isError = false) {
    el.notice.textContent = message;
    el.notice.classList.toggle("is-error", isError);
    clearTimeout(noticeTimer);
    if (!isError) noticeTimer = setTimeout(() => { el.notice.textContent = ""; }, 4000);
  }

  // ---------- Tab ----------
  function selectTab(name, moveFocus = false) {
    el.tabs.forEach((tab) => {
      const active = tab.dataset.tab === name;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      tab.classList.toggle("is-active", active);
      if (active && moveFocus) tab.focus();
    });
    el.tabPanels.forEach((section) => { section.hidden = section.dataset.tabPanel !== name; });
    const hash = name === "schedule" ? "#pembagian-shift" : "#data-shift";
    if (window.location.hash !== hash) history.replaceState(null, "", hash);
    if (name === "schedule") render();
  }

  el.tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTab(tab.dataset.tab));
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      const next = el.tabs[(index + (event.key === "ArrowRight" ? 1 : -1) + el.tabs.length) % el.tabs.length];
      selectTab(next.dataset.tab, true);
    });
  });

  // ---------- Grid mingguan ----------
  function buildSelect(value, shiftOptions, ariaLabel) {
    const select = document.createElement("select");
    select.className = "ss-cell-select";
    select.setAttribute("aria-label", ariaLabel);
    const add = (optionValue, text) => {
      const option = document.createElement("option");
      option.value = optionValue;
      option.textContent = text;
      select.append(option);
    };
    add("", "Pilih");
    shiftOptions.forEach((shift) => add(shift.id, shift.label));
    add(OFF, "Libur");
    if (value && value !== OFF && !shiftOptions.some((shift) => shift.id === value)) add(value, "Shift nonaktif");
    select.value = value;
    return select;
  }

  function render() {
    const shiftOptions = getShiftOptions();
    const employees = getEmployees();
    const schedule = readSchedule();
    const dates = weekDates();
    const todayKey = toKey(new Date());
    const isCurrentWeek = toKey(weekStart) === toKey(startOfWeek(new Date()));

    el.weekLabel.textContent = formatRange(weekStart);
    el.weekToday.hidden = isCurrentWeek;
    el.caption.textContent = `Jadwal shift karyawan ${formatRange(weekStart)}`;

    // Kepala tabel
    el.head.replaceChildren();
    const corner = document.createElement("th");
    corner.scope = "col";
    corner.textContent = "Karyawan";
    el.head.append(corner);
    dates.forEach((date, index) => {
      const th = document.createElement("th");
      th.scope = "col";
      if (toKey(date) === todayKey) th.classList.add("is-today");
      const name = document.createElement("span");
      name.textContent = DAY_NAMES[index];
      const day = document.createElement("small");
      day.textContent = shortDate(date);
      th.append(name, day);
      el.head.append(th);
    });

    // Isi tabel
    el.body.replaceChildren();
    let filled = 0;
    employees.forEach((employee) => {
      const row = document.createElement("tr");
      const nameCell = document.createElement("th");
      nameCell.scope = "row";
      const name = document.createElement("strong");
      name.textContent = employee.name;
      const role = document.createElement("small");
      role.textContent = employee.role;
      nameCell.append(name, role);
      row.append(nameCell);

      dates.forEach((date, index) => {
        const dateKey = toKey(date);
        const value = getValue(schedule, dateKey, employee.name);
        const info = describe(value, shiftOptions);
        if (value) filled += 1;

        const cell = document.createElement("td");
        cell.dataset.kind = info.kind;
        if (dateKey === todayKey) cell.classList.add("is-today");
        const select = buildSelect(value, shiftOptions, `${employee.name}, ${DAY_NAMES[index]} ${shortDate(date)}`);
        select.dataset.date = dateKey;
        select.dataset.employee = employee.name;
        const time = document.createElement("small");
        time.textContent = info.kind === "empty" ? "Belum diatur" : info.time;
        cell.append(select, time);
        row.append(cell);
      });
      el.body.append(row);
    });

    const total = employees.length * 7;
    el.filled.textContent = total ? `${filled}/${total} terisi` : "0 karyawan";
    el.empty.hidden = employees.length > 0;
    el.gridWrap.hidden = employees.length === 0;
    el.openBulk.disabled = employees.length === 0;
    el.copyWeek.disabled = employees.length === 0;

    // Keterangan shift
    el.legend.replaceChildren();
    [...shiftOptions.map((shift) => `${shift.label} · ${shift.time}`), "Libur · Tidak bertugas"].forEach((text) => {
      const item = document.createElement("span");
      item.textContent = text;
      el.legend.append(item);
    });
  }

  el.body.addEventListener("change", (event) => {
    const select = event.target.closest(".ss-cell-select");
    if (!select) return;
    const schedule = readSchedule();
    setValue(schedule, select.dataset.date, select.dataset.employee, select.value);
    if (!saveSchedule(schedule)) return render();
    const info = describe(select.value, getShiftOptions());
    const dayIndex = weekDates().findIndex((date) => toKey(date) === select.dataset.date);
    render();
    // Kembalikan fokus ke sel yang sama setelah tabel digambar ulang.
    const same = el.body.querySelector(`.ss-cell-select[data-date="${select.dataset.date}"][data-employee="${CSS.escape(select.dataset.employee)}"]`);
    same?.focus();
    showNotice(`${select.dataset.employee} · ${DAY_NAMES[dayIndex]} → ${info.label}. Tersimpan.`);
  });

  // ---------- Navigasi minggu ----------
  el.weekPrev.addEventListener("click", () => { weekStart = addDays(weekStart, -7); render(); });
  el.weekNext.addEventListener("click", () => { weekStart = addDays(weekStart, 7); render(); });
  el.weekToday.addEventListener("click", () => { weekStart = startOfWeek(new Date()); render(); });

  // ---------- Dialog umum ----------
  const openDialog = (dialog) => (typeof dialog.showModal === "function" ? dialog.showModal() : dialog.setAttribute("open", ""));
  const closeDialog = (dialog) => (typeof dialog.close === "function" ? dialog.close() : dialog.removeAttribute("open"));
  // Klik di luar kotak dialog menutup dialog.
  [el.bulkDialog, el.confirmDialog].forEach((dialog) => {
    dialog.addEventListener("click", (event) => { if (event.target === dialog) closeDialog(dialog); });
  });

  // ---------- Salin minggu sebelumnya ----------
  function copyPreviousWeek() {
    const schedule = readSchedule();
    weekDates().forEach((date) => {
      const previous = schedule[toKey(addDays(date, -7))];
      const key = toKey(date);
      if (previous && Object.keys(previous).length) schedule[key] = { ...previous };
      else delete schedule[key];
    });
    if (saveSchedule(schedule)) {
      render();
      showNotice("Jadwal minggu sebelumnya berhasil disalin.");
    }
  }

  el.copyWeek.addEventListener("click", () => {
    const schedule = readSchedule();
    const dates = weekDates();
    const previousHasData = dates.some((date) => Object.keys(schedule[toKey(addDays(date, -7))] || {}).length);
    if (!previousHasData) {
      showNotice("Minggu sebelumnya belum punya jadwal untuk disalin.", true);
      return;
    }
    const currentHasData = dates.some((date) => Object.keys(schedule[toKey(date)] || {}).length);
    if (!currentHasData) {
      copyPreviousWeek();
      return;
    }
    el.confirmText.textContent = `Jadwal ${formatRange(weekStart)} akan diganti dengan jadwal ${formatRange(addDays(weekStart, -7))}.`;
    openDialog(el.confirmDialog);
  });
  el.confirmOk.addEventListener("click", () => { closeDialog(el.confirmDialog); copyPreviousWeek(); });
  $("#ss-confirm-cancel").addEventListener("click", () => closeDialog(el.confirmDialog));
  $("#ss-confirm-close").addEventListener("click", () => closeDialog(el.confirmDialog));

  // ---------- Atur beberapa hari ----------
  function renderBulkOptions() {
    const shiftOptions = getShiftOptions();
    const employees = getEmployees();
    const dates = weekDates();

    el.bulkRange.textContent = formatRange(weekStart);

    const selectedEmployee = el.bulkEmployee.value;
    el.bulkEmployee.replaceChildren();
    employees.forEach((employee) => {
      const option = document.createElement("option");
      option.value = employee.name;
      option.textContent = `${employee.name} · ${employee.role}`;
      el.bulkEmployee.append(option);
    });
    if (employees.some((employee) => employee.name === selectedEmployee)) el.bulkEmployee.value = selectedEmployee;

    el.bulkDays.replaceChildren();
    dates.forEach((date, index) => {
      const label = document.createElement("label");
      label.className = "ss-day-option";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = "days";
      input.value = toKey(date);
      const name = document.createElement("strong");
      name.textContent = DAY_NAMES[index];
      const day = document.createElement("small");
      day.textContent = shortDate(date);
      label.append(input, name, day);
      el.bulkDays.append(label);
    });

    el.bulkShifts.replaceChildren();
    [...shiftOptions, { id: OFF, label: "Libur", time: "Tidak bertugas" }].forEach((shift) => {
      const label = document.createElement("label");
      label.className = "ss-shift-option";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "shift";
      input.value = shift.id;
      const name = document.createElement("strong");
      name.textContent = shift.label;
      const time = document.createElement("small");
      time.textContent = shift.time;
      label.append(input, name, time);
      el.bulkShifts.append(label);
    });
  }

  function updateBulkPreview() {
    const shiftOptions = getShiftOptions();
    const schedule = readSchedule();
    const dates = weekDates();
    const employeeName = el.bulkEmployee.value;
    const employee = getEmployees().find((item) => item.name === employeeName);
    const selectedDays = [...el.bulkDays.querySelectorAll("input:checked")].map((input) => input.value);
    const shiftValue = el.bulkShifts.querySelector("input:checked")?.value || "";
    const newInfo = describe(shiftValue, shiftOptions);

    el.bulkDayCount.textContent = `${selectedDays.length} hari dipilih`;
    el.bulkDays.querySelectorAll(".ss-day-option").forEach((label) => label.classList.toggle("is-checked", label.querySelector("input").checked));
    el.bulkShifts.querySelectorAll(".ss-shift-option").forEach((label) => label.classList.toggle("is-checked", label.querySelector("input").checked));

    el.previewName.textContent = employee ? `${employee.name} · ${employee.role}` : "-";
    el.previewList.replaceChildren();
    dates.forEach((date, index) => {
      const dateKey = toKey(date);
      const isSelected = selectedDays.includes(dateKey) && shiftValue;
      const info = isSelected ? newInfo : describe(getValue(schedule, dateKey, employeeName), shiftOptions);
      const item = document.createElement("li");
      item.classList.toggle("is-changed", Boolean(isSelected));
      const day = document.createElement("span");
      const dayName = document.createElement("strong");
      dayName.textContent = DAY_NAMES[index];
      const dayDate = document.createElement("small");
      dayDate.textContent = shortDate(date);
      day.append(dayName, dayDate);
      const value = document.createElement("span");
      const valueName = document.createElement("strong");
      valueName.textContent = `${isSelected ? "✓ " : ""}${info.label}`;
      const valueTime = document.createElement("small");
      valueTime.textContent = info.time;
      value.append(valueName, valueTime);
      item.append(day, value);
      el.previewList.append(item);
    });

    if (!selectedDays.length || !shiftValue) {
      el.bulkSummaryTitle.textContent = "Pilih hari dan shift.";
      el.bulkSummaryText.textContent = "Ringkasan perubahan akan tampil di sini.";
      return;
    }
    const chosen = dates.map((date, index) => (selectedDays.includes(toKey(date)) ? DAY_NAMES[index] : null)).filter(Boolean);
    const unchanged = DAY_NAMES.filter((name) => !chosen.includes(name));
    el.bulkSummaryTitle.textContent = `${employeeName} · ${chosen.join(", ")} → ${newInfo.label}`;
    el.bulkSummaryText.textContent = unchanged.length
      ? `Hanya ${chosen.length} hari terpilih yang diubah. ${unchanged.join(", ")} tidak berubah.`
      : "Semua hari dalam minggu ini akan diubah.";
  }

  el.openBulk.addEventListener("click", () => {
    renderBulkOptions();
    el.bulkNotice.textContent = "";
    updateBulkPreview();
    openDialog(el.bulkDialog);
    el.bulkEmployee.focus();
  });
  el.bulkForm.addEventListener("change", () => { el.bulkNotice.textContent = ""; updateBulkPreview(); });
  $("#ss-bulk-close").addEventListener("click", () => closeDialog(el.bulkDialog));
  $("#ss-bulk-cancel").addEventListener("click", () => closeDialog(el.bulkDialog));

  el.bulkForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const employeeName = el.bulkEmployee.value;
    const selectedDays = [...el.bulkDays.querySelectorAll("input:checked")].map((input) => input.value);
    const shiftValue = el.bulkShifts.querySelector("input:checked")?.value || "";
    if (!employeeName) {
      el.bulkNotice.textContent = "Pilih karyawan terlebih dahulu.";
      el.bulkEmployee.focus();
      return;
    }
    if (!selectedDays.length) {
      el.bulkNotice.textContent = "Pilih minimal satu hari.";
      el.bulkDays.querySelector("input")?.focus();
      return;
    }
    if (!shiftValue) {
      el.bulkNotice.textContent = "Pilih shift untuk hari terpilih.";
      el.bulkShifts.querySelector("input")?.focus();
      return;
    }
    const schedule = readSchedule();
    selectedDays.forEach((dateKey) => setValue(schedule, dateKey, employeeName, shiftValue));
    if (!saveSchedule(schedule)) {
      el.bulkNotice.textContent = "Jadwal tidak dapat disimpan. Penyimpanan browser penuh atau tidak tersedia.";
      return;
    }
    closeDialog(el.bulkDialog);
    render();
    showNotice(`Jadwal ${employeeName} untuk ${selectedDays.length} hari berhasil disimpan.`);
  });

  // ---------- Mulai ----------
  if (typeof mountIcons === "function") {
    document.querySelectorAll("#ss-panel-schedule [data-icon], .ss-bulk-dialog [data-icon], [data-tab-panel] [data-icon]").forEach((node) => {
      if (!node.firstChild) node.innerHTML = renderIcon(node.dataset.icon);
    });
  }
  selectTab(window.location.hash === "#pembagian-shift" ? "schedule" : "shifts");
})();

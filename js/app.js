// Menentukan jalur dari folder utama proyek, termasuk saat halaman berada di pages/{role}/.
const appRoot = window.location.pathname.includes("/pages/") ? "../../" : "";
function appUrl(path) {
  return `${appRoot}${path}`;
}

// Semua tombol logout (id berakhiran "logout", serta #logout-button) juga menghapus username sesi, bukan hanya role.
document.addEventListener("click", (event) => {
  if (event.target.closest('[id$="logout"], #logout-button')) sessionStorage.removeItem("washupUsername");
}, true);

const shellLogout = document.getElementById(document.body.dataset.logoutId);
shellLogout?.addEventListener("click", () => {
  sessionStorage.removeItem("washupRole");
  sessionStorage.removeItem("washupUsername");
  window.location.href = appUrl("login.html");
});

// Sidebar yang bisa diciutkan. Dipakai halaman yang memuat css/sidebar-collapse.css
// dan menyediakan tombol #sidebar-collapse-toggle. Preferensi disimpan per peramban.
function setupCollapsibleSidebar() {
  const shell = document.querySelector(".dashboard-shell");
  const toggle = document.querySelector("#sidebar-collapse-toggle");
  if (!shell || !toggle) return;

  const storageKey = "washupSidebarCollapsed";

  function readPreference() {
    try {
      return localStorage.getItem(storageKey) === "true";
    } catch {
      return false;
    }
  }

  function savePreference(collapsed) {
    try {
      localStorage.setItem(storageKey, String(collapsed));
    } catch {
      /* Penyimpanan boleh tidak tersedia, fitur tetap jalan untuk kunjungan ini. */
    }
  }

  function syncToggleLabel() {
    const collapsed = shell.classList.contains("sidebar-collapsed");
    const label = collapsed ? "Perluas menu samping" : "Ciutkan menu samping";
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.setAttribute("aria-label", label);
    toggle.title = label;
  }

  shell.classList.toggle("sidebar-collapsed", readPreference());
  syncToggleLabel();

  toggle.addEventListener("click", () => {
    const collapsed = shell.classList.toggle("sidebar-collapsed");
    savePreference(collapsed);
    syncToggleLabel();
  });
}

setupCollapsibleSidebar();

const currentYear = document.querySelector("#current-year");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

// Jumlah baris per halaman untuk semua tabel (paginasi seragam: Sebelumnya 1 2 Selanjutnya).
const TABLE_PAGE_SIZE = 5;

const accounts = {
  admin: { password: "admin123", role: "Admin" },
  kasir: { password: "kasir123", role: "Kasir" },
  petugas: { password: "petugas123", role: "Petugas" },
  owner: { password: "owner123", role: "Owner" },
};

const transactionStorageKey = "washupTransactions";
const attendanceStorageKey = "washupPetugasAttendance";
const baseDashboardData = { vehicles: 0, transactions: 0, queue: 0, revenue: 0 };

// Tarif berdasarkan ukuran kendaraan (revisi kelompok, Oktober 2026), menggantikan sistem cuci paket.
const serviceOptions = {
  Mobil: [
    { name: "Cuci Mobil Kecil", price: 30000 },
    { name: "Cuci Mobil Sedang", price: 35000 },
    { name: "Cuci Mobil Besar", price: 40000 },
  ],
  Motor: [
    { name: "Cuci Motor Kecil", price: 12000 },
    { name: "Cuci Motor Sedang", price: 15000 },
    { name: "Cuci Motor Besar", price: 17000 },
  ],
};

const masterDefinitions = {
  services: {
    key: "washupServices",
    title: "Layanan dan Tarif",
    fields: [
      { key: "name", label: "Nama layanan", type: "text", required: true },
      { key: "vehicleType", label: "Jenis kendaraan", type: "select", options: ["Mobil", "Motor"], required: true },
      { key: "price", label: "Harga", type: "number", min: 1, required: true },
      { key: "status", label: "Status", type: "select", options: ["Aktif", "Nonaktif"], required: true },
    ],
    columns: ["name", "vehicleType", "price", "status"],
    labels: { name: "Layanan", vehicleType: "Jenis", price: "Harga", status: "Status" },
    detailTitle: "Layanan dan Tarif",
    deleteMessage: "Perhatian apakah anda yakin ingin menghapus data ini?!",
  },
  shifts: {
    key: "washupShifts",
    title: "Data Shift",
    fields: [
      { key: "name", label: "Nama shift", type: "text", required: true },
      { key: "start", label: "Jam mulai", type: "time", required: true },
      { key: "end", label: "Jam selesai", type: "time", required: true },
      { key: "status", label: "Status", type: "select", options: ["Aktif", "Nonaktif"], required: true },
    ],
    columns: ["name", "start", "end", "status"],
    labels: { name: "Shift", start: "Mulai", end: "Selesai", status: "Status" },
    detailTitle: "Detail Shift",
    deleteMessage: "Perhatian apakah anda yakin ingin menghapus data ini?",
  },
  users: {
    key: "washupUsers",
    title: "Akun Pengguna",
    fields: [
      { key: "username", label: "Username", type: "text", required: true },
      { key: "password", label: "Password", type: "password", required: true },
      { key: "role", label: "Role", type: "select", options: ["Admin", "Kasir", "Petugas", "Owner"], required: true },
      { key: "status", label: "Status", type: "select", options: ["Aktif", "Nonaktif"], required: true },
    ],
    columns: ["username", "role", "status"],
    labels: { username: "Username", role: "Role", status: "Status" },
    detailTitle: "Detail Akun",
    deleteMessage: "Perhatian apakah anda yakin ingin menghapus data ini?",
  },
};

const masterDefaults = {
  services: [
    { id: "service-mobil-kecil", name: "Cuci Mobil Kecil", vehicleType: "Mobil", price: 30000, status: "Aktif" },
    { id: "service-mobil-sedang", name: "Cuci Mobil Sedang", vehicleType: "Mobil", price: 35000, status: "Aktif" },
    { id: "service-mobil-besar", name: "Cuci Mobil Besar", vehicleType: "Mobil", price: 40000, status: "Aktif" },
    { id: "service-motor-kecil", name: "Cuci Motor Kecil", vehicleType: "Motor", price: 12000, status: "Aktif" },
    { id: "service-motor-sedang", name: "Cuci Motor Sedang", vehicleType: "Motor", price: 15000, status: "Aktif" },
    { id: "service-motor-besar", name: "Cuci Motor Besar", vehicleType: "Motor", price: 17000, status: "Aktif" },
  ],
  shifts: [{ id: "shift-pagi", name: "Shift Pagi", start: "08:00", end: "16:00", status: "Aktif" }],
  users: Object.entries(accounts).map(([username, account]) => ({ id: `user-${username}`, username, password: account.password, role: account.role, status: "Aktif" })),
};

function readMasterRecords(definition) {
  try {
    const value = JSON.parse(localStorage.getItem(definition.key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveMasterRecords(definition, records) {
  localStorage.setItem(definition.key, JSON.stringify(records));
}

// Layanan paket lama yang sudah tidak dipakai. Dihapus otomatis dari localStorage agar tidak muncul lagi
// di Layanan & Tarif maupun Transaksi Baru. Transaksi lama tetap menyimpan nama dan harga aslinya.
const retiredServiceIds = ["service-mobil-1", "service-mobil-2", "service-mobil-3", "service-motor-1", "service-motor-2"];

function ensureMasterDefaults(type, definition) {
  const defaults = masterDefaults[type];
  if (!defaults) return readMasterRecords(definition);
  let records = readMasterRecords(definition);
  if (type === "services" && records.some((record) => retiredServiceIds.includes(record.id))) {
    records = records.filter((record) => !retiredServiceIds.includes(record.id));
    saveMasterRecords(definition, records);
  }
  if (type === "users") {
    if (localStorage.getItem(definition.key) === null) {
      records = defaults.map((record) => ({ ...record }));
      saveMasterRecords(definition, records);
    } else if (!records.some((record) => String(record?.username || "").trim().toLowerCase() === "admin")) {
      const admin = defaults.find((record) => record.username === "admin");
      if (admin) {
        records.push({ ...admin });
        saveMasterRecords(definition, records);
      }
    }
    return records;
  }
  const existingKeys = new Set(records.map((record) => record.id));
  const missing = defaults.filter((record) => !existingKeys.has(record.id));
  if (missing.length) {
    records.push(...missing.map((record) => ({ ...record })));
    saveMasterRecords(definition, records);
  }
  return records;
}

function getUserAccounts() {
  return ensureMasterDefaults("users", masterDefinitions.users);
}

function getActiveEmployees() {
  return getUserAccounts()
    .filter((account) => account && account.status === "Aktif" &&
      (account.role === "Kasir" || account.role === "Petugas") && String(account.username || "").trim())
    .map((account) => ({ name: String(account.username || "").trim(), role: account.role }));
}

function getActiveServiceOptions() {
  const definition = masterDefinitions.services;
  const records = ensureMasterDefaults("services", definition);
  if (!records.length) return serviceOptions;
  return records.reduce((grouped, service) => {
    if (service.status !== "Aktif" || !service.name || !service.vehicleType || !(Number(service.price) > 0)) return grouped;
    grouped[service.vehicleType] ||= [];
    grouped[service.vehicleType].push({ name: service.name, price: Number(service.price) });
    return grouped;
  }, { Mobil: [], Motor: [] });
}

function getTransactions() {
  try {
    const storedTransactions = JSON.parse(localStorage.getItem(transactionStorageKey) || "[]");
    if (!Array.isArray(storedTransactions)) {
      return [];
    }

    const normalizedTransactions = storedTransactions.map((transaction) => ({
      ...transaction,
      serviceStatus: transaction.serviceStatus || transaction.statusPengerjaan || transaction.workStatus || "Menunggu",
      paymentStatus: transaction.paymentStatus || transaction.statusPembayaran || "Belum Dibayar",
    }));

    if (JSON.stringify(normalizedTransactions) !== JSON.stringify(storedTransactions)) {
      saveTransactions(normalizedTransactions);
    }
    return normalizedTransactions;
  } catch {
    return [];
  }
}

function saveTransactions(transactions) {
  localStorage.setItem(transactionStorageKey, JSON.stringify(transactions));
}

function isValidServiceStatusTransition(currentStatus, nextStatus) {
  const statusOrder = ["Menunggu", "Sedang Dicuci", "Selesai"];
  const currentIndex = statusOrder.indexOf(String(currentStatus || "").trim());
  const nextIndex = statusOrder.indexOf(String(nextStatus || "").trim());
  return currentIndex >= 0 && nextIndex >= currentIndex && nextIndex <= currentIndex + 1;
}

// Satu format Rupiah untuk seluruh aplikasi, contoh: Rp 30.000 dan -Rp 20.000.
function formatCurrency(value) {
  const amount = Number(value) || 0;
  const sign = amount < 0 ? "-" : "";
  return `${sign}Rp ${Math.abs(amount).toLocaleString("id-ID")}`;
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function getNextNumber(prefix, transactions, baseNumber = 0) {
  const numbers = transactions
    .map((transaction) => Number(String(transaction[prefix]).replace(/\D/g, "")))
    .filter((number) => Number.isFinite(number));
  const nextNumber = Math.max(baseNumber, ...numbers) + 1;
  return `${prefix === "queueNumber" ? "A" : "TRX-"}${String(nextNumber).padStart(2, "0")}`;
}

function getTransactionNumber(transactions) {
  const dateKey = formatDateKey(new Date());
  const countForToday = transactions.filter((transaction) => {
    const createdDate = new Date(transaction.createdAt);
    return !Number.isNaN(createdDate.getTime()) && formatDateKey(createdDate) === dateKey;
  }).length;
  return `TRX-${dateKey}-${String(countForToday + 1).padStart(3, "0")}`;
}

function getTodayKey() {
  return formatDateKey(new Date());
}

function getTodayLabel() {
  return new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function getAttendanceRecords() {
  try {
    const value = JSON.parse(localStorage.getItem(attendanceStorageKey) || "[]");
    if (Array.isArray(value)) {
      return value.filter((item) => item && typeof item === "object");
    }
    return value && typeof value === "object" ? [value] : [];
  } catch {
    return [];
  }
}

function getAttendance(employeeId = "petugas") {
  const records = getAttendanceRecords();
  const today = getTodayKey();
  const exactMatch = records.find((attendance) => attendance && attendance.employeeId === employeeId && attendance.date === today);
  if (exactMatch) return exactMatch;

  if (employeeId === "petugas") {
    const legacyMatch = records.find((attendance) => attendance && !attendance.employeeId && attendance.employeeName === "Petugas" && attendance.date === today);
    if (legacyMatch) {
      legacyMatch.employeeId = "petugas";
      return legacyMatch;
    }
  }

  return null;
}

function saveAttendance(attendance) {
  try {
    const records = getAttendanceRecords();
    if (!attendance.employeeId && attendance.employeeName === "Petugas") {
      attendance.employeeId = "petugas";
    }
    const existingIndex = records.findIndex((record) => {
      if (!record || record.date !== attendance.date) return false;
      if (record.employeeId && attendance.employeeId) {
        return record.employeeId === attendance.employeeId;
      }
      if (!record.employeeId && (attendance.employeeId === "petugas" || attendance.employeeName === "Petugas") && record.employeeName === "Petugas") {
        return true;
      }
      return false;
    });

    if (existingIndex >= 0) {
      records[existingIndex] = { ...records[existingIndex], ...attendance };
    } else {
      records.push(attendance);
    }
    localStorage.setItem(attendanceStorageKey, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}

function readAttendancePhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("error", () => reject(new Error("Foto tidak dapat dibaca.")));
    reader.addEventListener("load", () => {
      const image = new Image();
      image.addEventListener("error", () => reject(new Error("Foto tidak dapat diproses.")));
      image.addEventListener("load", () => {
        try {
          const maxDimension = 1280;
          const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Foto tidak dapat diproses.");
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        } catch {
          reject(new Error("Foto tidak dapat diproses."));
        }
      });
      image.src = String(reader.result);
    });
    reader.readAsDataURL(file);
  });
}

const loginForm = document.querySelector("#login-form");
const loginError = document.querySelector("#login-error");
const passwordInput = document.querySelector("#password");
const passwordToggle = document.querySelector("#password-toggle");
const usernameInput = document.querySelector("#username");
const usernameError = document.querySelector("#username-error");
const passwordError = document.querySelector("#password-error");

if (passwordToggle && passwordInput) {
  passwordToggle.addEventListener("click", () => {
    const shouldShowPassword = passwordInput.type === "password";
    passwordInput.type = shouldShowPassword ? "text" : "password";
    const label = `${shouldShowPassword ? "Sembunyikan" : "Tampilkan"} password`;
    passwordToggle.setAttribute("aria-label", label);
    passwordToggle.setAttribute("aria-pressed", String(shouldShowPassword));
    passwordToggle.setAttribute("title", label);
  });
}


const roleOptions = document.querySelectorAll(".role-option");
const selectedRoleInput = document.querySelector("#selected-role");

roleOptions.forEach((option) => {
  option.addEventListener("click", () => {
    roleOptions.forEach((item) => {
      const active = item === option;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    if (selectedRoleInput) selectedRoleInput.value = option.dataset.role || "Admin";
    if (loginError) loginError.textContent = "";
  });
});

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const username = String(formData.get("username")).trim().toLowerCase();
    const password = String(formData.get("password"));
    const users = getUserAccounts();
    const account = users.find((user) => String(user.username || "").trim().toLowerCase() === username);

    usernameError.textContent = username ? "" : "Username wajib diisi.";
    passwordError.textContent = password ? "" : "Password wajib diisi.";
    loginError.textContent = "";

    if (!username || !password) {
      return;
    }

    if (!account || account.password !== password) {
      loginError.textContent = "Username atau password salah.";
      return;
    }

    if (account.status !== "Aktif") {
      loginError.textContent = "Akun dinonaktifkan. Silakan hubungi Administrator.";
      return;
    }

    const selectedRole = selectedRoleInput?.value || "Admin";
    if (account.role !== selectedRole) {
      loginError.textContent = `Akun ini bukan akun ${selectedRole}. Pilih jenis akun yang sesuai.`;
      return;
    }

    const validRoles = ["Admin", "Kasir", "Petugas", "Owner"];
    if (!validRoles.includes(account.role)) {
      loginError.textContent = "Role akun tidak valid.";
      return;
    }

    sessionStorage.setItem("washupRole", account.role);
    sessionStorage.setItem("washupUsername", username);
    window.location.href = account.role === "Kasir"
      ? appUrl("pages/kasir/dashboard-kasir.html")
      : account.role === "Petugas"
        ? appUrl("pages/petugas/dashboard-petugas.html")
        : account.role === "Owner"
          ? appUrl("pages/owner/dashboard-owner.html")
          : account.role === "Admin"
            ? appUrl("pages/admin/dashboard-admin.html")
            : appUrl("role.html");
  });
}

if (usernameInput && usernameError) {
  usernameInput.addEventListener("input", () => {
    usernameError.textContent = "";
    loginError.textContent = "";
  });
}

if (passwordInput && passwordError) {
  passwordInput.addEventListener("input", () => {
    passwordError.textContent = "";
    loginError.textContent = "";
  });
}

const roleName = document.querySelector("#role-name");
const roleMessage = document.querySelector("#role-message");
const logoutButton = document.querySelector("#logout-button");

if (roleName) {
  const role = sessionStorage.getItem("washupRole");

  if (!role) {
    window.location.replace(appUrl("login.html"));
  } else if (role === "Kasir") {
    window.location.replace(appUrl("pages/kasir/dashboard-kasir.html"));
  } else if (role === "Owner") {
    window.location.replace(appUrl("pages/owner/dashboard-owner.html"));
  } else if (role === "Admin") {
    window.location.replace(appUrl("pages/admin/dashboard-admin.html"));
  } else {
    roleName.textContent = role;
    roleMessage.textContent = `Halaman dashboard ${role} akan dikembangkan pada tahap berikutnya.`;
  }
}

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem("washupRole");
    window.location.href = appUrl("login.html");
  });
}

const dashboardLogout = document.querySelector("#dashboard-logout");
const petugasDashboardLogout = document.querySelector("#petugas-dashboard-logout");
const transactionLogout = document.querySelector("#transaction-logout");

if (document.querySelector(".kasir-page")) {
  const role = sessionStorage.getItem("washupRole");

  if (role !== "Kasir") {
    window.location.replace(appUrl(role ? "role.html" : "login.html"));
  }
}

if (document.querySelector(".owner-dashboard-page") && sessionStorage.getItem("washupRole") !== "Owner") {
  window.location.replace(appUrl("login.html"));
}

if (document.querySelector(".owner-report-page") && sessionStorage.getItem("washupRole") !== "Owner") {
  window.location.replace(appUrl("login.html"));
}

if (document.querySelector(".owner-finance-page") && sessionStorage.getItem("washupRole") !== "Owner") {
  window.location.replace(appUrl("login.html"));
}

if (document.querySelector(".owner-employee-page") && sessionStorage.getItem("washupRole") !== "Owner") {
  window.location.replace(appUrl("login.html"));
}

if (document.querySelector(".owner-service-stats-page") && sessionStorage.getItem("washupRole") !== "Owner") {
  window.location.replace(appUrl("login.html"));
}

if (document.querySelector(".admin-dashboard-page") && sessionStorage.getItem("washupRole") !== "Admin") {
  window.location.replace(appUrl("login.html"));
}

if (document.querySelector(".petugas-page") && sessionStorage.getItem("washupRole") !== "Petugas") {
  window.location.replace(appUrl("login.html"));
}

if (dashboardLogout) {
  dashboardLogout.addEventListener("click", () => {
    sessionStorage.removeItem("washupRole");
    window.location.href = appUrl("login.html");
  });
}

if (petugasDashboardLogout) {
  petugasDashboardLogout.addEventListener("click", () => {
    sessionStorage.removeItem("washupRole");
    window.location.href = appUrl("login.html");
  });
}

function renderDashboardData() {
  const vehicleCount = document.querySelector("#vehicle-count");
  const transactionCount = document.querySelector("#transaction-count");
  const queueCount = document.querySelector("#queue-count");
  const revenueTotal = document.querySelector("#revenue-total");
  const queueBadge = document.querySelector("#queue-badge");
  const queueTableBody = document.querySelector("#queue-table-body");
  const kasirDate = document.querySelector("#kasir-date");
  if (kasirDate) kasirDate.textContent = getTodayLabel();

  if (!vehicleCount || !transactionCount || !queueCount || !revenueTotal || !queueBadge || !queueTableBody) {
    return;
  }

  const transactions = getTransactions();
  const queueRecords = transactions;
  const activeQueue = transactions.filter((transaction) => transaction.serviceStatus !== "Selesai");
  const statistics = {
    vehicles: transactions.length,
    transactions: transactions.length,
    queue: activeQueue.length,
    revenue: transactions
      .filter((transaction) => transaction.paymentStatus === "Lunas")
      .reduce((total, transaction) => total + Number(transaction.price || 0), 0),
  };

  vehicleCount.textContent = String(statistics.vehicles);
  transactionCount.textContent = String(statistics.transactions);
  queueCount.textContent = String(statistics.queue);
  revenueTotal.textContent = formatCurrency(statistics.revenue);
  queueBadge.textContent = `${statistics.queue} kendaraan aktif`;

  queueTableBody.replaceChildren();
  queueRecords.forEach((record) => {
    const row = document.createElement("tr");
    [record.queueNumber, record.plateNumber, record.vehicleType, record.service].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    });

    const statusCell = document.createElement("td");
    const statusBadge = document.createElement("span");
    statusBadge.className = `status-badge ${record.serviceStatus === "Selesai" ? "status-done" : record.serviceStatus === "Sedang Dicuci" ? "status-washing" : "status-waiting"}`;
    statusBadge.textContent = record.serviceStatus;
    statusCell.append(statusBadge);
    row.append(statusCell);
    queueTableBody.append(row);
  });
}

if (document.querySelector(".dashboard-page")) {
  renderDashboardData();
}

function setupTransactionForm() {
  const transactionForm = document.querySelector("#transaction-form");
  const vehicleTypeInput = document.querySelector("#vehicle-type");
  const serviceInput = document.querySelector("#service-select");
  const pricePreview = document.querySelector("#price-preview");
  const transactionResult = document.querySelector("#transaction-result");
  const transactionError = document.querySelector("#transaction-error");

  if (!transactionForm || !vehicleTypeInput || !serviceInput || !pricePreview) {
    return;
  }

  const inputs = {
    customerName: document.querySelector("#customer-name"),
    customerPhone: document.querySelector("#customer-phone"),
    plateNumber: document.querySelector("#plate-number"),
  };
  const errors = {
    customerName: document.querySelector("#customer-name-error"),
    customerPhone: document.querySelector("#customer-phone-error"),
    plateNumber: document.querySelector("#plate-number-error"),
    vehicleType: document.querySelector("#vehicle-type-error"),
    service: document.querySelector("#service-error"),
  };

  function selectedService() {
    const option = getActiveServiceOptions()[vehicleTypeInput.value]?.find((service) => service.name === serviceInput.value);
    return option || null;
  }

  function updateSummary() {
    const service = selectedService();
    document.querySelector("#summary-customer").textContent = inputs.customerName.value.trim() || "-";
    document.querySelector("#summary-plate").textContent = inputs.plateNumber.value.trim() || "-";
    document.querySelector("#summary-vehicle").textContent = vehicleTypeInput.value || "-";
    document.querySelector("#summary-service").textContent = service?.name || "-";
    document.querySelector("#summary-price").textContent = formatCurrency(service?.price || 0);
    pricePreview.textContent = formatCurrency(service?.price || 0);
  }

  function updateServices() {
    const services = getActiveServiceOptions()[vehicleTypeInput.value] || [];
    serviceInput.replaceChildren();
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = services.length ? "Pilih layanan" : "Pilih jenis kendaraan terlebih dahulu";
    serviceInput.append(placeholder);
    services.forEach((service) => {
      const option = document.createElement("option");
      option.value = service.name;
      option.textContent = `${service.name} - ${formatCurrency(service.price)}`;
      serviceInput.append(option);
    });
    serviceInput.disabled = services.length === 0;
    updateSummary();
  }

  function clearErrors() {
    Object.values(errors).forEach((error) => {
      error.textContent = "";
    });
    transactionError.textContent = "";
  }

  vehicleTypeInput.addEventListener("change", () => {
    errors.vehicleType.textContent = "";
    updateServices();
  });
  serviceInput.addEventListener("change", () => {
    errors.service.textContent = "";
    updateSummary();
  });
  Object.values(inputs).forEach((input) => {
    input.addEventListener("input", () => {
      updateSummary();
      clearErrors();
    });
  });

  transactionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors();
    const service = selectedService();
    let hasError = false;
    const requiredFields = [
      ["customerName", "Nama pelanggan wajib diisi."],
      ["customerPhone", "Nomor telepon wajib diisi."],
      ["plateNumber", "Nomor plat wajib diisi."],
    ];

    requiredFields.forEach(([field, message]) => {
      if (!inputs[field].value.trim()) {
        errors[field].textContent = message;
        hasError = true;
      }
    });
    if (!vehicleTypeInput.value) {
      errors.vehicleType.textContent = "Jenis kendaraan wajib dipilih.";
      hasError = true;
    }
    if (!service) {
      errors.service.textContent = "Layanan wajib dipilih.";
      hasError = true;
    }
    if (hasError) {
      return;
    }

    const transactions = getTransactions();
    const transaction = {
      id: `local-${Date.now()}`,
      transactionNumber: getTransactionNumber(transactions),
      queueNumber: getNextNumber("queueNumber", transactions, baseDashboardData.queue),
      customerName: inputs.customerName.value.trim(),
      customerPhone: inputs.customerPhone.value.trim(),
      plateNumber: inputs.plateNumber.value.trim().toUpperCase(),
      vehicleType: vehicleTypeInput.value,
      service: service.name,
      price: service.price,
      serviceStatus: "Menunggu",
      paymentStatus: "Belum Dibayar",
      createdAt: new Date().toISOString(),
    };

    transactions.push(transaction);
    saveTransactions(transactions);
    document.querySelector("#result-transaction-number").textContent = transaction.transactionNumber;
    document.querySelector("#result-queue-number").textContent = transaction.queueNumber;
    document.querySelector("#result-service-status").textContent = transaction.serviceStatus;
    document.querySelector("#result-payment-status").textContent = transaction.paymentStatus;
    document.querySelector("#result-customer").textContent = transaction.customerName;
    document.querySelector("#result-vehicle").textContent = `${transaction.plateNumber} — ${transaction.vehicleType}`;
    document.querySelector("#result-service").textContent = transaction.service;
    document.querySelector("#result-price").textContent = formatCurrency(transaction.price);
    transactionResult.hidden = false;
    transactionResult.scrollIntoView({ behavior: "smooth", block: "start" });
    transactionForm.hidden = true;
  });

  document.querySelector("#cancel-transaction")?.addEventListener("click", () => {
    window.location.href = appUrl("pages/kasir/dashboard-kasir.html");
  });

  updateServices();
}

setupTransactionForm();

if (transactionLogout) {
  transactionLogout.addEventListener("click", () => {
    sessionStorage.removeItem("washupRole");
    window.location.href = appUrl("login.html");
  });
}

function setupQueuePage() {
  const queueBody = document.querySelector("#queue-page-body");
  const searchInput = document.querySelector("#queue-search");
  const filterInput = document.querySelector("#queue-filter");
  const queueEmpty = document.querySelector("#queue-empty");
  const queueResultCount = document.querySelector("#queue-result-count");
  const queuePager = document.querySelector("#queue-pager");
  const activeQueueCount = document.querySelector("#active-queue-count");
  const dialog = document.querySelector("#queue-dialog");
  const dialogClose = document.querySelector("#dialog-close");
  const dialogCancel = document.querySelector("#dialog-cancel");
  const updateStatusButton = document.querySelector("#update-status");
  const detailStatus = document.querySelector("#detail-status");
  const dialogNotice = document.querySelector("#dialog-notice");
  const queueLogout = document.querySelector("#queue-logout");
  const editDialog = document.querySelector("#queue-edit-dialog");
  const editClose = document.querySelector("#queue-edit-close");
  const editCancel = document.querySelector("#queue-edit-cancel");
  const editSave = document.querySelector("#queue-edit-save");
  const editNotice = document.querySelector("#queue-edit-notice");
  const editCustomer = document.querySelector("#edit-customer");
  const editPhone = document.querySelector("#edit-phone");
  const editPlate = document.querySelector("#edit-plate");
  const editVehicle = document.querySelector("#edit-vehicle");
  const editService = document.querySelector("#edit-service");
  const editPrice = document.querySelector("#edit-price");

  if (!queueBody || !searchInput || !filterInput || !queueEmpty || !queueResultCount || !activeQueueCount) {
    return;
  }

  let selectedTransactionId = null;
  let editingTransactionKey = null;
  let currentPage = 1;

  function queueTransactionKey(transaction) {
    return String(transaction?.id ?? transaction?.transactionNumber ?? transaction?.queueNumber ?? "");
  }

  function statusClass(status) {
    if (status === "Selesai") return "status-done";
    if (status === "Sedang Dicuci") return "status-washing";
    return "status-waiting";
  }

  function makeStatusBadge(status) {
    const badge = document.createElement("span");
    badge.className = `status-badge ${statusClass(status)}`;
    badge.textContent = status;
    return badge;
  }

  function filteredTransactions() {
    const search = searchInput.value.trim().toLowerCase();
    const filter = filterInput.value;
    return getTransactions().filter((transaction) => {
      const matchesSearch = [transaction.plateNumber, transaction.customerName, transaction.queueNumber]
        .some((value) => String(value || "").toLowerCase().includes(search));
      const matchesFilter = filter === "Semua" || transaction.serviceStatus === filter;
      return matchesSearch && matchesFilter;
    });
  }

  function renderQueuePage() {
    const allTransactions = getTransactions();
    const activeTransactions = allTransactions.filter((transaction) => transaction.serviceStatus !== "Selesai");
    const transactions = filteredTransactions();
    const pageSize = TABLE_PAGE_SIZE;
    const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize));

    // Pertahankan halaman yang valid saat hasil pencarian/filter atau jumlah data berubah.
    currentPage = Math.min(Math.max(1, currentPage), totalPages);
    const startIndex = transactions.length ? (currentPage - 1) * pageSize : 0;
    const visibleTransactions = transactions.slice(startIndex, startIndex + pageSize);
    const endIndex = Math.min(startIndex + pageSize, transactions.length);

    activeQueueCount.textContent = `${activeTransactions.length} kendaraan`;
    queueResultCount.textContent = `${transactions.length} data`;
    queueBody.replaceChildren();
    queueEmpty.hidden = transactions.length > 0;

    if (queuePager) {
      window.WashupPager.renderPager(queuePager, {
        page: currentPage,
        total: totalPages,
        onChange: (target) => { currentPage = target; renderQueuePage(); },
      });
    }

    visibleTransactions.forEach((transaction) => {
      const row = document.createElement("tr");
      [transaction.queueNumber, transaction.plateNumber, transaction.customerName, transaction.vehicleType, transaction.service].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value ?? "-";
        row.append(cell);
      });

      const serviceStatusCell = document.createElement("td");
      serviceStatusCell.append(makeStatusBadge(transaction.serviceStatus));
      row.append(serviceStatusCell);
      // Tombol aksi mengikuti desain Figma: Detail (biru), Edit (hijau), Hapus (merah).
      const actionCell = document.createElement("td");
      actionCell.className = "queue-action-cell";
      const actionGroup = document.createElement("div");
      actionGroup.className = "queue-action-buttons";

      const detailButton = document.createElement("button");
      detailButton.className = "table-action table-action-detail";
      detailButton.type = "button";
      detailButton.textContent = "Detail";
      detailButton.addEventListener("click", () => openDetail(transaction));

      const editButton = document.createElement("button");
      editButton.className = "table-action table-action-edit";
      editButton.type = "button";
      editButton.textContent = "Edit";
      editButton.addEventListener("click", () => openEdit(transaction));

      const deleteButton = document.createElement("button");
      deleteButton.className = "table-action table-action-delete";
      deleteButton.type = "button";
      deleteButton.textContent = "Hapus";
      deleteButton.addEventListener("click", () => deleteTransaction(transaction));

      actionGroup.append(detailButton, editButton, deleteButton);
      actionCell.append(actionGroup);
      row.append(actionCell);
      queueBody.append(row);
    });
  }

  function openDetail(transaction) {
    selectedTransactionId = queueTransactionKey(transaction);
    const details = {
      "detail-queue": transaction.queueNumber,
      "detail-transaction": transaction.transactionNumber,
      "detail-customer": transaction.customerName,
      "detail-phone": transaction.customerPhone,
      "detail-vehicle": transaction.vehicleType,
      "detail-plate": transaction.plateNumber,
      "detail-service": transaction.service,
      "detail-price": formatCurrency(transaction.price),
      "detail-service-status": transaction.serviceStatus,
      "detail-payment-status": transaction.paymentStatus,
    };
    Object.entries(details).forEach(([id, value]) => {
      document.querySelector(`#${id}`).textContent = value;
    });
    detailStatus.value = transaction.serviceStatus;
    dialogNotice.textContent = "";
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  }

  function updateEditServiceOptions(selectedServiceName = "") {
    const vehicleType = editVehicle?.value || "Mobil";
    const services = getActiveServiceOptions()[vehicleType] || [];
    editService.replaceChildren();
    services.forEach((service) => {
      const option = document.createElement("option");
      option.value = service.name;
      option.textContent = service.name;
      option.dataset.price = String(service.price);
      editService.append(option);
    });
    if (services.some((service) => service.name === selectedServiceName)) {
      editService.value = selectedServiceName;
    }
    if (!editService.value && services.length) editService.selectedIndex = 0;
    const selected = services.find((service) => service.name === editService.value);
    editPrice.textContent = formatCurrency(selected?.price || 0);
  }

  function openEdit(transaction) {
    if (!editDialog || !editCustomer || !editPhone || !editPlate || !editVehicle || !editService || !editPrice) return;
    if (transaction.paymentStatus === "Lunas") {
      window.alert("Transaksi yang sudah Lunas tidak dapat diedit.");
      return;
    }
    editingTransactionKey = queueTransactionKey(transaction);
    editCustomer.value = transaction.customerName || "";
    editPhone.value = transaction.customerPhone || "";
    editPlate.value = transaction.plateNumber || "";
    editVehicle.value = transaction.vehicleType === "Motor" ? "Motor" : "Mobil";
    updateEditServiceOptions(transaction.service || "");
    if (editNotice) editNotice.textContent = "";
    if (typeof editDialog.showModal === "function") editDialog.showModal();
    else editDialog.setAttribute("open", "");
  }

  function closeEdit() {
    if (!editDialog) return;
    if (typeof editDialog.close === "function") editDialog.close();
    else editDialog.removeAttribute("open");
    editingTransactionKey = null;
  }

  function deleteTransaction(transaction) {
    const description = `${transaction.queueNumber || "Antrean"} — ${transaction.plateNumber || transaction.customerName || "transaksi"}`;
    if (!window.confirm(`Hapus ${description} dari daftar antrean? Tindakan ini tidak dapat dibatalkan.`)) return;
    const transactions = getTransactions();
    const targetKey = queueTransactionKey(transaction);
    const remaining = transactions.filter((item) => queueTransactionKey(item) !== targetKey);
    if (remaining.length === transactions.length) return;
    saveTransactions(remaining);
    if (selectedTransactionId && queueTransactionKey(transaction) === String(selectedTransactionId) && dialog?.open) closeDetail();
    renderQueuePage();
  }

  function saveEdit() {
    if (!editingTransactionKey || !editCustomer || !editPhone || !editPlate || !editVehicle || !editService) return;
    const customerName = editCustomer.value.trim();
    const customerPhone = editPhone.value.trim();
    const plateNumber = editPlate.value.trim().toUpperCase();
    if (!customerName || !customerPhone || !plateNumber || !editService.value) {
      if (editNotice) editNotice.textContent = "Lengkapi nama pelanggan, nomor telepon, nomor plat, dan layanan.";
      return;
    }
    const transactions = getTransactions();
    const transaction = transactions.find((item) => queueTransactionKey(item) === editingTransactionKey);
    if (!transaction) {
      if (editNotice) editNotice.textContent = "Data transaksi tidak ditemukan. Muat ulang daftar antrean.";
      return;
    }
    if (transaction.paymentStatus === "Lunas") {
      if (editNotice) editNotice.textContent = "Transaksi yang sudah Lunas tidak dapat diedit.";
      return;
    }
    const selectedService = (getActiveServiceOptions()[editVehicle.value] || []).find((service) => service.name === editService.value);
    if (!selectedService) {
      if (editNotice) editNotice.textContent = "Layanan yang dipilih sudah tidak tersedia.";
      return;
    }
    transaction.customerName = customerName;
    transaction.customerPhone = customerPhone;
    transaction.plateNumber = plateNumber;
    transaction.vehicleType = editVehicle.value;
    transaction.service = selectedService.name;
    transaction.price = selectedService.price;
    saveTransactions(transactions);
    closeEdit();
    renderQueuePage();
  }

  function closeDetail() {
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
    selectedTransactionId = null;
  }

  searchInput.addEventListener("input", () => {
    currentPage = 1;
    renderQueuePage();
  });
  filterInput.addEventListener("change", () => {
    currentPage = 1;
    renderQueuePage();
  });
  dialogClose?.addEventListener("click", closeDetail);
  dialogCancel?.addEventListener("click", closeDetail);
  editClose?.addEventListener("click", closeEdit);
  editCancel?.addEventListener("click", closeEdit);
  editSave?.addEventListener("click", saveEdit);
  editVehicle?.addEventListener("change", () => updateEditServiceOptions());
  editService?.addEventListener("change", () => {
    const service = (getActiveServiceOptions()[editVehicle?.value || "Mobil"] || []).find((item) => item.name === editService.value);
    if (editPrice) editPrice.textContent = formatCurrency(service?.price || 0);
  });
  editDialog?.addEventListener("click", (event) => {
    if (event.target === editDialog) closeEdit();
  });
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) closeDetail();
  });
  updateStatusButton?.addEventListener("click", () => {
    const transactions = getTransactions();
    const transaction = transactions.find((item) => queueTransactionKey(item) === String(selectedTransactionId ?? ""));
    if (!transaction) return;
    if (transaction.paymentStatus === "Lunas") {
      dialogNotice.textContent = "Status pengerjaan tidak dapat diubah setelah transaksi Lunas.";
      return;
    }
    const nextStatus = detailStatus.value;
    if (!isValidServiceStatusTransition(transaction.serviceStatus, nextStatus)) {
      dialogNotice.textContent = "Status harus mengikuti urutan Menunggu, Sedang Dicuci, lalu Selesai.";
      return;
    }
    transaction.serviceStatus = nextStatus;
    saveTransactions(transactions);
    dialogNotice.textContent = "Status pengerjaan berhasil diperbarui.";
    document.querySelector("#detail-service-status").textContent = transaction.serviceStatus;
    renderQueuePage();
  });
  queueLogout?.addEventListener("click", () => {
    sessionStorage.removeItem("washupRole");
    window.location.href = appUrl("login.html");
  });

  renderQueuePage();
}

if (document.querySelector(".queue-page")) {
  const role = sessionStorage.getItem("washupRole");
  if (role !== "Kasir") {
    window.location.replace(appUrl(role ? "role.html" : "login.html"));
  } else {
    setupQueuePage();
  }
}

function setupTransactionHistory() {
  const body = document.querySelector("#history-table-body");
  const search = document.querySelector("#history-search");
  const serviceFilter = document.querySelector("#history-service-filter");
  const paymentFilter = document.querySelector("#history-payment-filter");
  const dateFilter = document.querySelector("#history-date-filter");
  const resultCount = document.querySelector("#history-result-count");
  const empty = document.querySelector("#history-empty");
  const emptyTitle = document.querySelector("#history-empty-title");
  const emptyMessage = document.querySelector("#history-empty-message");
  const detailDialog = document.querySelector("#history-dialog");
  const filterToggle = document.querySelector("#history-filter-toggle");
  const filterOptions = document.querySelector("#history-filter-options");
  const pager = document.querySelector("#history-pager");
  const receiptOverlay = document.querySelector("#history-receipt-overlay");
  const receiptDialogTitle = document.querySelector("#history-receipt-dialog-title");
  const receiptCaption = document.querySelector("#history-receipt-caption");

  if (!body || !search || !serviceFilter || !paymentFilter || !dateFilter || !resultCount || !empty || !emptyTitle || !emptyMessage || !detailDialog || !pager || !receiptOverlay) return;

  let currentPage = 1;
  let currentReceiptType = "transaction";
  let lastFocusedElement = null;

  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value == null || value === "" ? "-" : String(value);
  };
  const formatDateTime = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
  };
  const makeStatusBadge = (status, type) => {
    const badge = document.createElement("span");
    const normalized = status || (type === "payment" ? "Belum Dibayar" : "Menunggu");
    const isDone = type === "payment" ? normalized === "Lunas" : normalized === "Selesai";
    badge.className = `status-badge ${isDone ? "status-done" : normalized === "Sedang Dicuci" ? "status-washing" : "status-waiting"}`;
    badge.textContent = normalized;
    return badge;
  };
  const closeDetail = () => {
    if (typeof detailDialog.close === "function") detailDialog.close(); else detailDialog.removeAttribute("open");
  };
  const openDetail = (transaction) => {
    const details = {
      "history-detail-transaction": transaction.transactionNumber,
      "history-detail-queue": transaction.queueNumber,
      "history-detail-customer": transaction.customerName,
      "history-detail-phone": transaction.customerPhone,
      "history-detail-plate": transaction.plateNumber,
      "history-detail-vehicle": transaction.vehicleType,
      "history-detail-service": transaction.service,
      "history-detail-price": formatCurrency(transaction.price),
      "history-detail-service-status": transaction.serviceStatus,
      "history-detail-payment-status": transaction.paymentStatus,
      "history-detail-payment-method": transaction.paymentMethod || "-",
      "history-detail-created-at": formatDateTime(transaction.createdAt),
    };
    Object.entries(details).forEach(([id, value]) => setText(id, value));
    if (typeof detailDialog.showModal === "function") detailDialog.showModal(); else detailDialog.setAttribute("open", "");
  };
  const filteredTransactions = () => {
    const query = search.value.trim().toLowerCase();
    return getTransactions().filter((transaction) => {
      const matchesSearch = [transaction.transactionNumber, transaction.queueNumber, transaction.customerName, transaction.plateNumber]
        .some((value) => String(value || "").toLowerCase().includes(query));
      const matchesService = serviceFilter.value === "Semua" || transaction.serviceStatus === serviceFilter.value;
      const matchesPayment = paymentFilter.value === "Semua" || transaction.paymentStatus === paymentFilter.value;
      const createdAt = new Date(transaction.createdAt);
      const matchesDate = !dateFilter.value || (!Number.isNaN(createdAt.getTime()) && formatDateKey(createdAt) === dateFilter.value.replaceAll("-", ""));
      return matchesSearch && matchesService && matchesPayment && matchesDate;
    }).sort((first, second) => (new Date(second.createdAt).getTime() || 0) - (new Date(first.createdAt).getTime() || 0));
  };

  const setReceiptVisibility = (type) => {
    receiptOverlay.querySelectorAll(".history-receipt-transaction-only").forEach((element) => { element.hidden = type !== "transaction"; });
    receiptOverlay.querySelectorAll(".history-receipt-payment-only").forEach((element) => { element.hidden = type !== "payment"; });
    const paidStatus = document.querySelector("#history-receipt-paid-status");
    if (paidStatus) paidStatus.hidden = type !== "payment";
    setText("history-receipt-total-label", type === "payment" ? "Total dibayar" : "Total tagihan");
    if (receiptDialogTitle) receiptDialogTitle.textContent = type === "payment" ? "Struk Pembayaran" : "Struk Transaksi";
    if (receiptCaption) receiptCaption.textContent = type === "payment" ? "STRUK PEMBAYARAN" : "STRUK TRANSAKSI";
  };
  const openReceipt = (transaction, type) => {
    if (!transaction) return;
    if (type === "payment" && transaction.paymentStatus !== "Lunas") return;
    currentReceiptType = type;
    lastFocusedElement = document.activeElement;
    setReceiptVisibility(type);
    const total = Math.max(0, Number(transaction.price) || 0);
    const received = Math.max(0, Number(transaction.amountReceived ?? total) || 0);
    const change = Math.max(0, Number(transaction.change ?? Math.max(0, received - total)) || 0);
    const fields = {
      "history-receipt-transaction-number": transaction.transactionNumber || "-",
      "history-receipt-queue-number": transaction.queueNumber || "-",
      "history-receipt-transaction-date": formatDateTime(transaction.createdAt),
      "history-receipt-paid-date": transaction.paidAt ? formatDateTime(transaction.paidAt) : "-",
      "history-receipt-customer": transaction.customerName || "-",
      "history-receipt-phone": transaction.customerPhone || "-",
      "history-receipt-plate": transaction.plateNumber || "-",
      "history-receipt-vehicle": transaction.vehicleType || "-",
      "history-receipt-service": transaction.service || "-",
      "history-receipt-service-price": formatCurrency(total),
      "history-receipt-subtotal": formatCurrency(total),
      "history-receipt-total": formatCurrency(total),
      "history-receipt-method": transaction.paymentMethod || "Tunai",
      "history-receipt-received": formatCurrency(received),
      "history-receipt-change": formatCurrency(change),
      "history-receipt-service-status": transaction.serviceStatus || "Menunggu",
      "history-receipt-payment-status": transaction.paymentStatus || "Belum Dibayar",
    };
    Object.entries(fields).forEach(([id, value]) => setText(id, value));
    setText("history-receipt-note", type === "payment"
      ? "Struk ini adalah bukti pembayaran yang telah dikonfirmasi."
      : "Struk ini adalah bukti transaksi, bukan bukti pembayaran.");
    receiptOverlay.hidden = false;
    receiptOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.remove("history-receipt-printing");
    document.querySelector("#history-receipt-close")?.focus();
  };
  const closeReceipt = () => {
    receiptOverlay.hidden = true;
    receiptOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("history-receipt-printing");
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") lastFocusedElement.focus();
  };
  const render = () => {
    const allTransactions = getTransactions();
    const transactions = filteredTransactions();
    const pageSize = TABLE_PAGE_SIZE;
    const totalPages = transactions.length ? Math.ceil(transactions.length / pageSize) : 0;
    currentPage = totalPages ? Math.min(Math.max(1, currentPage), totalPages) : 1;
    const startIndex = transactions.length ? (currentPage - 1) * pageSize : 0;
    const visibleTransactions = transactions.slice(startIndex, startIndex + pageSize);

    resultCount.textContent = `${transactions.length} data`;
    empty.hidden = transactions.length > 0;
    emptyTitle.textContent = allTransactions.length ? "Transaksi tidak ditemukan." : "Belum ada riwayat transaksi.";
    emptyMessage.textContent = allTransactions.length ? "Ubah pencarian atau filter untuk melihat transaksi lain." : "Transaksi yang dibuat Kasir akan tampil di sini.";
    body.replaceChildren();
    window.WashupPager.renderPager(pager, {
      page: currentPage,
      total: totalPages || 1,
      onChange: (target) => { currentPage = target; render(); },
    });

    visibleTransactions.forEach((transaction) => {
      const row = document.createElement("tr");
      [transaction.transactionNumber, transaction.queueNumber, formatDateTime(transaction.createdAt), transaction.customerName, transaction.plateNumber, transaction.vehicleType, transaction.service, formatCurrency(transaction.price)].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value || "-";
        row.append(cell);
      });
      const serviceCell = document.createElement("td");
      serviceCell.append(makeStatusBadge(transaction.serviceStatus, "service"));
      row.append(serviceCell);
      const paymentCell = document.createElement("td");
      paymentCell.append(makeStatusBadge(transaction.paymentStatus, "payment"));
      row.append(paymentCell);
      const methodCell = document.createElement("td");
      methodCell.textContent = transaction.paymentMethod || "-";
      row.append(methodCell);

      const actionCell = document.createElement("td");
      actionCell.className = "history-action-cell";
      const actionGroup = document.createElement("div");
      actionGroup.className = "history-action-group";
      const makeAction = (label, className, onClick, disabled = false, title = "") => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `table-action ${className}`;
        button.textContent = label;
        button.disabled = disabled;
        if (title) button.title = title;
        button.addEventListener("click", onClick);
        return button;
      };
      actionGroup.append(
        makeAction("Detail", "history-action-detail", () => openDetail(transaction)),
        makeAction("Struk Transaksi", "history-action-transaction", () => openReceipt(transaction, "transaction")),
        makeAction("Struk Pembayaran", "history-action-payment", () => openReceipt(transaction, "payment"), transaction.paymentStatus !== "Lunas", transaction.paymentStatus !== "Lunas" ? "Struk pembayaran tersedia setelah transaksi berstatus Lunas." : "Lihat struk pembayaran")
      );
      actionCell.append(actionGroup);
      row.append(actionCell);
      body.append(row);
    });
  };

  search.addEventListener("input", () => { currentPage = 1; render(); });
  serviceFilter.addEventListener("change", () => { currentPage = 1; render(); });
  paymentFilter.addEventListener("change", () => { currentPage = 1; render(); });
  dateFilter.addEventListener("change", () => { currentPage = 1; render(); });
  filterToggle?.addEventListener("click", () => {
    const wasExpanded = filterToggle.getAttribute("aria-expanded") === "true";
    filterToggle.setAttribute("aria-expanded", String(!wasExpanded));
    filterToggle.classList.toggle("is-open", !wasExpanded);
    if (filterOptions) filterOptions.hidden = wasExpanded;
  });
  document.querySelector("#history-dialog-close")?.addEventListener("click", closeDetail);
  detailDialog.addEventListener("click", (event) => { if (event.target === detailDialog) closeDetail(); });
  document.querySelector("#history-logout")?.addEventListener("click", () => { sessionStorage.removeItem("washupRole"); sessionStorage.removeItem("washupUsername"); window.location.href = appUrl("login.html"); });
  document.querySelector("#history-receipt-close")?.addEventListener("click", closeReceipt);
  document.querySelector("#history-receipt-done")?.addEventListener("click", closeReceipt);
  document.querySelector("#history-receipt-print")?.addEventListener("click", () => {
    document.body.classList.add("history-receipt-printing");
    window.requestAnimationFrame(() => window.print());
  });
  receiptOverlay.addEventListener("click", (event) => { if (event.target === receiptOverlay) closeReceipt(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !receiptOverlay.hidden) closeReceipt(); });
  window.addEventListener("afterprint", () => document.body.classList.remove("history-receipt-printing"));
  window.addEventListener("storage", (event) => { if (event.key === transactionStorageKey) render(); });
  render();
}

if (document.querySelector(".history-page")) setupTransactionHistory();

function setupPaymentPage() {
  const body = document.querySelector("#payment-table-body");
  const empty = document.querySelector("#payment-empty");
  const resultCount = document.querySelector("#payment-result-count");
  const unpaidCount = document.querySelector("#payment-unpaid-count");
  const readyCount = document.querySelector("#payment-ready-count");
  const pendingTotalElement = document.querySelector("#payment-pending-total");
  const pendingDescription = document.querySelector("#payment-pending-description");
  const notice = document.querySelector("#payment-notice");
  const detailNotice = document.querySelector("#payment-dialog-notice");
  const paymentMethod = document.querySelector("#payment-method");
  const confirmButton = document.querySelector("#confirm-payment");
  const pager = document.querySelector("#payment-pager");
  const cashFields = document.querySelector("#payment-cash-fields");
  const cashReceived = document.querySelector("#payment-cash-received");
  const changeLabel = document.querySelector("#payment-change");
  const qrisFields = document.querySelector("#payment-qris-fields");
  const qrisVerified = document.querySelector("#payment-qris-verified");
  const receiptOverlay = document.querySelector("#payment-receipt-overlay");

  if (!body || !empty || !resultCount || !unpaidCount || !readyCount || !pendingTotalElement || !pendingDescription || !notice || !detailNotice || !paymentMethod || !confirmButton) return;

  let selectedTransactionId = null;
  let currentPage = 1;
  const money = (value) => formatCurrency(Math.max(0, Number(value) || 0));
  const safeDateTime = (value) => {
    const date = new Date(value || Date.now());
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(date) + " WIB";
  };
  const normalizeStatus = (value) => String(value || "").trim().toLocaleLowerCase("id-ID").replace(/\s+/g, " ");
  const isPaid = (transaction) => normalizeStatus(transaction.paymentStatus || transaction.statusPembayaran) === "lunas";
  const isReady = (transaction) => {
    const status = normalizeStatus(transaction.serviceStatus || transaction.statusPengerjaan || transaction.workStatus);
    return ["selesai", "selesai dicuci", "sudah selesai", "completed", "complete", "done", "finished"].includes(status);
  };
  const transactionKey = (transaction) => transaction?.id ?? transaction?.transactionNumber ?? null;
  const getSelectedTransaction = () => getTransactions().find((item) => transactionKey(item) === selectedTransactionId) || null;

  const makePaymentBadge = (transaction) => {
    const badge = document.createElement("span");
    let className = "status-waiting";
    let label = "Belum dibayar";
    if (isPaid(transaction)) {
      className = "status-done";
      label = "Lunas";
    } else if (isReady(transaction)) {
      className = "status-washing";
      label = "Perlu konfirmasi";
    }
    badge.className = `status-badge ${className}`;
    badge.textContent = label;
    return badge;
  };

  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = value == null || value === "" ? "-" : String(value);
  };

  const updateChange = () => {
    const transaction = getSelectedTransaction();
    const total = transaction ? Math.max(0, Number(transaction.price) || 0) : 0;
    const received = Math.max(0, Number(cashReceived?.value) || 0);
    if (changeLabel) changeLabel.textContent = money(Math.max(0, received - total));
  };

  const renderMethod = () => {
    const isQris = paymentMethod.value === "QRIS";
    if (cashFields) cashFields.hidden = isQris;
    if (qrisFields) qrisFields.hidden = !isQris;
    setText("#payment-method-section-title", isQris ? "Pembayaran QRIS" : "Pembayaran tunai");
    setText("#payment-method-pill", paymentMethod.value || "Tunai");
    updateChange();
  };

  const renderSelectedTransaction = () => {
    const transaction = getSelectedTransaction();
    const hasTransaction = Boolean(transaction);
    const canChoosePayment = hasTransaction && !isPaid(transaction);
    // Tombol aktif untuk transaksi belum lunas. Validasi status pengerjaan,
    // nominal tunai, dan verifikasi QRIS dijalankan saat tombol ditekan.
    confirmButton.disabled = !canChoosePayment;
    paymentMethod.disabled = !canChoosePayment;
    if (cashReceived) cashReceived.disabled = !canChoosePayment;
    if (qrisVerified) qrisVerified.disabled = !canChoosePayment;

    if (!transaction) {
      setText("#payment-selected-meta", "Pilih transaksi dari daftar untuk memeriksa tagihan.");
      setText("#payment-subtotal", "Rp 0");
      setText("#payment-discount", "− Rp 0");
      setText("#payment-detail-total", "Rp 0");
      if (cashReceived) cashReceived.value = "";
      if (qrisVerified) qrisVerified.checked = false;
      detailNotice.textContent = "Pilih transaksi yang sudah selesai dicuci untuk mengonfirmasi pembayaran.";
      renderMethod();
      return;
    }

    setText("#payment-selected-meta", `${transaction.customerName || "Pelanggan"} · ${transaction.plateNumber || "-"} · ${transaction.transactionNumber || "-"}`);
    const total = Math.max(0, Number(transaction.price) || 0);
    setText("#payment-subtotal", money(total));
    setText("#payment-discount", "− Rp 0");
    setText("#payment-detail-total", money(total));
    paymentMethod.value = transaction.paymentMethod === "QRIS" ? "QRIS" : "Tunai";
    if (cashReceived) cashReceived.value = String(Math.max(total, Number(transaction.amountReceived) || 0));
    if (qrisVerified) qrisVerified.checked = false;
    if (isPaid(transaction)) {
      detailNotice.textContent = "Transaksi ini sudah lunas. Pilih Lihat Struk pada daftar untuk membuka bukti pembayaran.";
    } else if (!isReady(transaction)) {
      detailNotice.textContent = "Transaksi hanya dapat dibayar setelah kendaraan selesai dicuci.";
    } else {
      detailNotice.textContent = "Pastikan nominal dan metode pembayaran sesuai sebelum mengonfirmasi lunas.";
    }
    renderMethod();
  };

  const setReceiptFields = (transaction) => {
    const total = Math.max(0, Number(transaction.price) || 0);
    const received = Math.max(0, Number(transaction.amountReceived ?? total) || 0);
    const change = Math.max(0, Number(transaction.change ?? Math.max(0, received - total)) || 0);
    const values = {
      "receipt-transaction-number": transaction.transactionNumber || "-",
      "receipt-transaction-date": safeDateTime(transaction.createdAt),
      "receipt-paid-date": safeDateTime(transaction.paidAt),
      "receipt-customer": transaction.customerName || "-",
      "receipt-phone": transaction.customerPhone || "-",
      "receipt-plate": transaction.plateNumber || "-",
      "receipt-vehicle": transaction.vehicleType || "-",
      "receipt-queue-number": transaction.queueNumber || "-",
      "receipt-service": transaction.service || "-",
      "receipt-service-price": money(total),
      "receipt-subtotal": money(total),
      "receipt-discount": "− Rp 0",
      "receipt-total": money(total),
      "receipt-method": transaction.paymentMethod || "Tunai",
      "receipt-received": money(received),
      "receipt-change": money(change),
    };
    Object.entries(values).forEach(([id, value]) => setText(`#${id}`, value));
  };

  const openReceipt = (transaction) => {
    if (!transaction || !isPaid(transaction) || !receiptOverlay) return;
    setReceiptFields(transaction);
    receiptOverlay.hidden = false;
    receiptOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("payment-receipt-open");
    document.querySelector("#payment-receipt-close")?.focus();
  };
  const closeReceipt = () => {
    if (!receiptOverlay) return;
    receiptOverlay.hidden = true;
    receiptOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("payment-receipt-open");
  };

  const renderPagination = (rows) => {
    if (!pager) return;
    const pageSize = TABLE_PAGE_SIZE;
    const total = rows.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    currentPage = Math.min(Math.max(1, currentPage), totalPages);
    const startIndex = total ? (currentPage - 1) * pageSize : 0;
    const endIndex = Math.min(startIndex + pageSize, total);
    rows.forEach((row, index) => { row.hidden = index < startIndex || index >= endIndex; });
    window.WashupPager.renderPager(pager, {
      page: currentPage,
      total: totalPages,
      onChange: (target) => { currentPage = target; render(); },
    });
  };

  const render = () => {
    const transactions = getTransactions();
    const unpaidTransactions = transactions.filter((transaction) => !isPaid(transaction));
    const readyTransactions = unpaidTransactions.filter(isReady);
    const notReadyTransactions = unpaidTransactions.filter((transaction) => !isReady(transaction));
    const pendingAmount = unpaidTransactions.reduce((sum, transaction) => sum + Math.max(0, Number(transaction.price) || 0), 0);

    unpaidCount.textContent = String(notReadyTransactions.length);
    readyCount.textContent = String(readyTransactions.length);
    pendingTotalElement.textContent = money(pendingAmount);
    pendingDescription.textContent = `${unpaidTransactions.length} tagihan belum dikonfirmasi`;
    resultCount.textContent = `${transactions.length} transaksi`;
    empty.hidden = transactions.length > 0;
    if (!selectedTransactionId || !transactions.some((item) => transactionKey(item) === selectedTransactionId)) {
      const candidate = readyTransactions[0] || unpaidTransactions[0] || null;
      selectedTransactionId = candidate ? transactionKey(candidate) : null;
    }
    body.replaceChildren();

    transactions.forEach((transaction) => {
      const row = document.createElement("tr");
      row.dataset.transactionId = String(transaction.id || transaction.transactionNumber || "");
      if (transactionKey(transaction) === selectedTransactionId) row.classList.add("is-selected");

      const numberCell = document.createElement("td");
      numberCell.textContent = transaction.transactionNumber || "-";
      row.append(numberCell);

      const customerCell = document.createElement("td");
      customerCell.className = "payment-customer-cell";
      const customerName = document.createElement("strong"); customerName.textContent = transaction.customerName || "-";
      const customerPlate = document.createElement("small"); customerPlate.textContent = transaction.plateNumber || "-";
      customerCell.append(customerName, customerPlate); row.append(customerCell);

      const totalCell = document.createElement("td"); totalCell.textContent = money(transaction.price); row.append(totalCell);
      const statusCell = document.createElement("td"); statusCell.append(makePaymentBadge(transaction)); row.append(statusCell);

      const actionCell = document.createElement("td");
      const action = document.createElement("button");
      action.type = "button";
      action.className = "payment-table-action table-action-detail";
      action.textContent = isPaid(transaction) ? "Lihat Struk" : "Periksa";
      action.dataset.transactionKey = String(transactionKey(transaction) ?? "");
      action.setAttribute("aria-label", `${isPaid(transaction) ? "Lihat struk" : "Periksa pembayaran"} ${transaction.transactionNumber || "transaksi"}`);
      actionCell.append(action); row.append(actionCell); body.append(row);
    });

    renderPagination(Array.from(body.querySelectorAll("tr")));
    renderSelectedTransaction();
  };

  // Event delegation keeps the Periksa/Lihat Struk buttons interactive even
  // when render() rebuilds the transaction table rows.
  body.addEventListener("click", (event) => {
    const action = event.target.closest(".payment-table-action");
    if (!action || !body.contains(action)) return;
    event.preventDefault();

    const key = action.dataset.transactionKey;
    const transaction = getTransactions().find((item) => String(transactionKey(item) ?? "") === key);
    if (!transaction) {
      notice.textContent = "Data transaksi tidak ditemukan. Muat ulang halaman lalu coba lagi.";
      render();
      return;
    }

    selectedTransactionId = transactionKey(transaction);
    notice.textContent = isPaid(transaction)
      ? "Transaksi sudah lunas. Struk pembayaran dibuka."
      : `Transaksi ${transaction.transactionNumber || "terpilih"} dipilih untuk pemeriksaan pembayaran.`;
    render();

    if (isPaid(transaction)) {
      openReceipt(transaction);
    } else {
      // On mobile, bring the details card into view after selecting a row.
      const checkPanel = document.querySelector("#payment-check-title");
      if (checkPanel && window.matchMedia("(max-width: 900px)").matches) {
        checkPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });

  paymentMethod.addEventListener("change", () => {
    if (qrisVerified) qrisVerified.checked = false;
    renderMethod();
    detailNotice.textContent = paymentMethod.value === "QRIS"
      ? "Pilih QRIS, lalu centang verifikasi setelah pembayaran benar-benar diterima."
      : "Masukkan nominal uang diterima sebelum mengonfirmasi lunas.";
  });
  cashReceived?.addEventListener("input", updateChange);
  qrisVerified?.addEventListener("change", () => {
    if (qrisVerified.checked) detailNotice.textContent = "Verifikasi QRIS dicentang. Pastikan status pengerjaan sudah Selesai sebelum mengonfirmasi.";
  });
  confirmButton.addEventListener("click", () => {
    const transactions = getTransactions();
    const transaction = transactions.find((item) => transactionKey(item) === selectedTransactionId);
    if (!transaction) { detailNotice.textContent = "Pilih transaksi terlebih dahulu."; return; }
    if (isPaid(transaction)) { detailNotice.textContent = "Transaksi ini sudah lunas. Pilih Lihat Struk pada daftar transaksi."; return; }
    if (!isReady(transaction)) {
      detailNotice.textContent = `Status pengerjaan masih “${transaction.serviceStatus || "Menunggu"}”. Pembayaran baru dapat dikonfirmasi setelah status kendaraan menjadi Selesai.`;
      return;
    }

    const total = Math.max(0, Number(transaction.price) || 0);
    const method = paymentMethod.value;
    let received = total;
    let change = 0;
    if (method === "Tunai") {
      received = Math.max(0, Number(cashReceived?.value) || 0);
      if (received < total) {
        detailNotice.textContent = `Nominal diterima masih kurang ${money(total - received)}.`;
        cashReceived?.focus();
        return;
      }
      change = received - total;
    } else if (method === "QRIS" && !qrisVerified?.checked) {
      detailNotice.textContent = "Pastikan pembayaran QRIS benar-benar diterima sebelum mengonfirmasi.";
      qrisVerified?.focus();
      return;
    }

    transaction.paymentStatus = "Lunas";
    transaction.paymentMethod = method;
    transaction.amountReceived = received;
    transaction.change = change;
    transaction.paidAt = new Date().toISOString();
    try {
      saveTransactions(transactions);
    } catch {
      detailNotice.textContent = "Pembayaran belum berhasil disimpan. Periksa penyimpanan browser lalu coba kembali.";
      return;
    }

    const confirmedTransaction = { ...transaction };
    notice.textContent = "Pembayaran berhasil dikonfirmasi. Struk pembayaran ditampilkan.";
    render();
    openReceipt(confirmedTransaction);
  });

  document.querySelector("#payment-logout")?.addEventListener("click", () => {
    sessionStorage.removeItem("washupRole");
    sessionStorage.removeItem("washupUsername");
    window.location.href = appUrl("login.html");
  });
  document.querySelector("#payment-receipt-print")?.addEventListener("click", () => {
    // Beri browser satu frame untuk merender struk sebelum membuka dialog cetak.
    window.requestAnimationFrame(() => window.print());
  });
  document.querySelector("#payment-receipt-close")?.addEventListener("click", closeReceipt);
  document.querySelector("#payment-receipt-done")?.addEventListener("click", closeReceipt);
  receiptOverlay?.addEventListener("click", (event) => { if (event.target === receiptOverlay) closeReceipt(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && receiptOverlay && !receiptOverlay.hidden) closeReceipt(); });
  window.addEventListener("storage", (event) => { if (event.key === transactionStorageKey) render(); });
  render();
}

if (document.querySelector(".payment-page")) setupPaymentPage();

function setupOwnerDashboard() {
  const vehicleCount = document.querySelector("#owner-vehicle-count");
  const transactionCount = document.querySelector("#owner-transaction-count");
  const revenueTotal = document.querySelector("#owner-revenue-total");
  const unpaidCount = document.querySelector("#owner-unpaid-count");
  const paidCount = document.querySelector("#owner-paid-count");
  const revenueToday = document.querySelector("#owner-revenue-today");
  const revenueWeek = document.querySelector("#owner-revenue-week");
  const revenueMonth = document.querySelector("#owner-revenue-month");
  const recentBody = document.querySelector("#owner-recent-body");
  const recentEmpty = document.querySelector("#owner-recent-empty");
  const recentCount = document.querySelector("#owner-recent-count");

  if (!vehicleCount || !transactionCount || !revenueTotal || !unpaidCount || !paidCount || !revenueToday || !revenueWeek || !revenueMonth || !recentBody || !recentEmpty || !recentCount) {
    return;
  }

  const today = new Date();
  const todayKey = getTodayKey();
  const weekStart = new Date(today);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const month = today.getMonth();
  const year = today.getFullYear();
  const validCreatedAt = (transaction) => {
    const createdAt = new Date(transaction.createdAt);
    return Number.isNaN(createdAt.getTime()) ? null : createdAt;
  };
  const validPaidAt = (transaction) => {
    const paidAt = transaction.paidAt ? new Date(transaction.paidAt) : null;
    return paidAt && !Number.isNaN(paidAt.getTime()) ? paidAt : validCreatedAt(transaction);
  };
  const sumPaid = (transactions) => transactions
    .filter((transaction) => transaction.paymentStatus === "Lunas")
    .reduce((total, transaction) => total + Number(transaction.price || 0), 0);
  const paymentBadge = (paymentStatus) => {
    const badge = document.createElement("span");
    badge.className = `status-badge ${paymentStatus === "Lunas" ? "status-done" : "status-waiting"}`;
    badge.textContent = paymentStatus || "Belum Dibayar";
    return badge;
  };

  const render = () => {
    const transactions = getTransactions();
    const todayTransactions = transactions.filter((transaction) => {
      const createdAt = validCreatedAt(transaction);
      return createdAt && formatDateKey(createdAt) === todayKey;
    });
    const todayPaidTransactions = transactions.filter((transaction) => {
      const paidAt = validPaidAt(transaction);
      return transaction.paymentStatus === "Lunas" && paidAt && formatDateKey(paidAt) === todayKey;
    });
    const weekPaidTransactions = transactions.filter((transaction) => {
      const paidAt = validPaidAt(transaction);
      return transaction.paymentStatus === "Lunas" && paidAt && paidAt >= weekStart && paidAt <= today;
    });
    const monthPaidTransactions = transactions.filter((transaction) => {
      const paidAt = validPaidAt(transaction);
      return transaction.paymentStatus === "Lunas" && paidAt && paidAt.getFullYear() === year && paidAt.getMonth() === month;
    });

    const uniqueVehiclesToday = new Set(todayTransactions
      .map((transaction) => String(transaction.plateNumber || "").trim().replace(/\s+/g, " ").toUpperCase())
      .filter(Boolean));
    vehicleCount.textContent = String(uniqueVehiclesToday.size);
    transactionCount.textContent = String(todayTransactions.length);
    revenueTotal.textContent = formatCurrency(sumPaid(todayPaidTransactions));
    unpaidCount.textContent = String(transactions.filter((transaction) => transaction.paymentStatus === "Belum Dibayar").length);
    paidCount.textContent = String(transactions.filter((transaction) => transaction.paymentStatus === "Lunas").length);
    revenueToday.textContent = formatCurrency(sumPaid(todayPaidTransactions));
    revenueWeek.textContent = formatCurrency(sumPaid(weekPaidTransactions));
    revenueMonth.textContent = formatCurrency(sumPaid(monthPaidTransactions));

    const recentTransactions = [...transactions].sort((first, second) => {
      const firstTime = validCreatedAt(first)?.getTime() || 0;
      const secondTime = validCreatedAt(second)?.getTime() || 0;
      return secondTime - firstTime;
    }).slice(0, 5);
    recentBody.replaceChildren();
    recentEmpty.hidden = recentTransactions.length > 0;
    recentCount.textContent = `${recentTransactions.length} data`;
    recentTransactions.forEach((transaction) => {
      const row = document.createElement("tr");
      [transaction.queueNumber, transaction.customerName, transaction.plateNumber, transaction.service, formatCurrency(transaction.price)].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      });
      const paymentCell = document.createElement("td");
      paymentCell.append(paymentBadge(transaction.paymentStatus));
      row.append(paymentCell);
      recentBody.append(row);
    });
  };

  document.querySelector("#owner-date").textContent = getTodayLabel();
  document.querySelectorAll("[data-owner-placeholder]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      document.querySelector("#owner-notice").textContent = "Menu laporan belum tersedia.";
    });
  });
  document.querySelector("#owner-logout")?.addEventListener("click", () => { sessionStorage.removeItem("washupRole"); window.location.href = appUrl("login.html"); });
  render();
}

if (document.querySelector(".owner-dashboard-page")) setupOwnerDashboard();

function setupOwnerTransactionReport() {
  const search = document.querySelector("#owner-report-search");
  const period = document.querySelector("#owner-report-period");
  const body = document.querySelector("#owner-report-table-body");
  const empty = document.querySelector("#owner-report-empty");
  const emptyTitle = document.querySelector("#owner-report-empty-title");
  const emptyMessage = document.querySelector("#owner-report-empty-message");
  const resultCount = document.querySelector("#owner-report-result-count");
  const dialog = document.querySelector("#owner-report-dialog");
  const morningShiftCount = document.querySelector("#owner-report-shift-morning");
  const nightShiftCount = document.querySelector("#owner-report-shift-night");
  const fields = ["total-count", "revenue", "cash", "qris"];
  if (!search || !period || !body || !empty || !emptyTitle || !emptyMessage || !resultCount || !dialog || fields.some((field) => !document.querySelector(`#owner-report-${field}`))) return;
  if (!morningShiftCount || !nightShiftCount) return;

  const now = new Date();
  const todayKey = getTodayKey();
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const isDateInSelectedPeriod = (date) => {
    if (period.value === "Semua") return true;
    if (Number.isNaN(date.getTime())) return false;
    if (period.value === "Hari Ini") return formatDateKey(date) === todayKey;
    if (period.value === "Minggu Ini") return date >= weekStart && date <= now;
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  };
  const inPeriod = (transaction) => isDateInSelectedPeriod(new Date(transaction.createdAt));
  const formatDateTime = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
  };
  const readShifts = () => {
    try {
      const shifts = JSON.parse(localStorage.getItem("washupShifts") || "[]");
      return Array.isArray(shifts) ? shifts : [];
    } catch (error) {
      console.error("Tidak dapat membaca data shift untuk laporan owner.", error);
      return [];
    }
  };
  const activeShifts = readShifts().filter((shift) => shift.status === "Aktif" && shift.name);
  const timeToMinutes = (value) => {
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(value || ""));
    return match ? Number(match[1]) * 60 + Number(match[2]) : null;
  };
  const isWithinShift = (date, shift) => {
    const start = timeToMinutes(shift.start);
    const end = shift.end === "00:00" ? 1440 : timeToMinutes(shift.end);
    if (start === null || end === null) return false;
    const time = date.getHours() * 60 + date.getMinutes();
    return end > start ? time >= start && time < end : time >= start || time < end;
  };
  const countShiftTransactions = (transactions, shiftName) => {
    const matchingShifts = activeShifts.filter((shift) => shift.name.toLowerCase().includes(shiftName.toLowerCase()));
    return transactions.filter((transaction) => {
      const createdAt = new Date(transaction.createdAt);
      return !Number.isNaN(createdAt.getTime()) && matchingShifts.some((shift) => isWithinShift(createdAt, shift));
    }).length;
  };
  const setDetail = (transaction) => {
    const detail = { "owner-report-detail-transaction": transaction.transactionNumber, "owner-report-detail-queue": transaction.queueNumber, "owner-report-detail-customer": transaction.customerName, "owner-report-detail-phone": transaction.customerPhone, "owner-report-detail-plate": transaction.plateNumber, "owner-report-detail-vehicle": transaction.vehicleType, "owner-report-detail-service": transaction.service, "owner-report-detail-price": formatCurrency(transaction.price), "owner-report-detail-service-status": transaction.serviceStatus, "owner-report-detail-payment-status": transaction.paymentStatus, "owner-report-detail-payment-method": transaction.paymentMethod || "-", "owner-report-detail-created-at": formatDateTime(transaction.createdAt) };
    Object.entries(detail).forEach(([id, value]) => { document.querySelector(`#${id}`).textContent = value || "-"; });
    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
  };
  const closeDialog = () => { if (typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open"); };
  const render = () => {
    const allTransactions = getTransactions();
    const periodTransactions = allTransactions.filter(inPeriod);
    const query = search.value.trim().toLowerCase();
    const transactions = periodTransactions.filter((transaction) => [transaction.transactionNumber, transaction.queueNumber, transaction.customerName, transaction.plateNumber].some((value) => String(value || "").toLowerCase().includes(query))).slice().sort((first, second) => (new Date(second.createdAt).getTime() || 0) - (new Date(first.createdAt).getTime() || 0));
    const paidTransactions = periodTransactions.filter((transaction) => transaction.paymentStatus === "Lunas");
    const totalPaid = paidTransactions.reduce((total, transaction) => total + Number(transaction.price || 0), 0);
    const paymentSummary = (method) => {
      const records = paidTransactions.filter((transaction) => transaction.paymentMethod === method);
      return `${records.length} transaksi · ${formatCurrency(records.reduce((total, transaction) => total + Number(transaction.price || 0), 0))}`;
    };
    document.querySelector("#owner-report-total-count").textContent = String(periodTransactions.length);
    document.querySelector("#owner-report-revenue").textContent = formatCurrency(totalPaid);
    morningShiftCount.textContent = String(countShiftTransactions(periodTransactions, "Pagi"));
    nightShiftCount.textContent = String(countShiftTransactions(periodTransactions, "Malam"));
    document.querySelector("#owner-report-cash").textContent = paymentSummary("Tunai");
    document.querySelector("#owner-report-qris").textContent = paymentSummary("QRIS");
    resultCount.textContent = `${transactions.length} data`;
    empty.hidden = transactions.length > 0;
    emptyTitle.textContent = allTransactions.length ? "Transaksi tidak ditemukan." : "Belum ada transaksi.";
    emptyMessage.textContent = allTransactions.length
      ? "Ubah pencarian atau periode untuk melihat transaksi lain."
      : "Data Transaksi Kasir Akan Tampil Disini";
    body.replaceChildren();
    transactions.forEach((transaction) => {
      const row = document.createElement("tr");
      [transaction.transactionNumber, formatDateTime(transaction.createdAt), transaction.customerName, transaction.plateNumber, transaction.vehicleType, transaction.service, formatCurrency(transaction.price), transaction.serviceStatus].forEach((value) => { const cell = document.createElement("td"); cell.textContent = value || "-"; row.append(cell); });
      const action = document.createElement("td");
      const detailButton = document.createElement("button");
      detailButton.className = "table-action table-action-detail";
      detailButton.type = "button";
      detailButton.textContent = "Detail";
      detailButton.addEventListener("click", () => setDetail(transaction));
      action.append(detailButton);
      row.append(action);
      body.append(row);
    });
  };
  search.addEventListener("input", render);
  period.addEventListener("change", render);
  document.querySelector("#owner-report-dialog-close")?.addEventListener("click", closeDialog);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) closeDialog(); });
  document.querySelectorAll("[data-owner-report-placeholder]").forEach((link) => link.addEventListener("click", (event) => { event.preventDefault(); document.querySelector("#owner-report-notice").textContent = "Menu laporan belum tersedia."; }));
  const logout = () => {
    sessionStorage.removeItem("washupRole");
    window.location.href = appUrl("login.html");
  };
  document.querySelector("#owner-report-logout")?.addEventListener("click", logout);
  document.querySelector("#owner-logout")?.addEventListener("click", logout);
  render();
}

if (document.querySelector(".owner-report-page")) setupOwnerTransactionReport();

function setupOwnerLogout() {
  document.querySelector("#owner-logout")?.addEventListener("click", () => {
    sessionStorage.removeItem("washupRole");
    window.location.href = appUrl("login.html");
  });
}

function setupOwnerFinanceReport() {
  const incomeTotal = document.querySelector("#owner-finance-income");
  const expenseTotal = document.querySelector("#owner-finance-expense");
  const netBalance = document.querySelector("#owner-finance-balance");
  const transactionCount = document.querySelector("#owner-finance-count");
  const incomeBody = document.querySelector("#owner-income-body");
  const incomeEmpty = document.querySelector("#owner-income-empty");
  const expenseBody = document.querySelector("#owner-expense-body");
  const expenseEmpty = document.querySelector("#owner-expense-empty");
  if (!incomeTotal || !expenseTotal || !netBalance || !transactionCount || !incomeBody || !incomeEmpty || !expenseBody || !expenseEmpty) return;

  const readExpenses = () => {
    try {
      const expenses = JSON.parse(localStorage.getItem("washupExpenses") || "[]");
      return Array.isArray(expenses) ? expenses : [];
    } catch (error) {
      console.error("Tidak dapat membaca data pengeluaran WASHUP.", error);
      return [];
    }
  };
  const formatDate = (value) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) {
      const [year, month, day] = value.split("-").map(Number);
      return new Date(year, month - 1, day).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
  };
  const paidTransactions = getTransactions().filter((transaction) => transaction.paymentStatus === "Lunas");
  const incomeGroups = new Map();
  paidTransactions.forEach((transaction) => {
    const date = new Date(transaction.createdAt);
    const dateKey = Number.isNaN(date.getTime()) ? "-" : formatDateKey(date);
    const service = String(transaction.service || "-");
    const key = `${dateKey}\u0000${service}`;
    const group = incomeGroups.get(key) || {
      dateKey,
      date: Number.isNaN(date.getTime()) ? "-" : formatDate(date),
      service,
      count: 0,
      total: 0,
    };
    group.count += 1;
    group.total += Number(transaction.price || 0);
    incomeGroups.set(key, group);
  });
  const incomeRecords = [...incomeGroups.values()].sort((first, second) => second.dateKey.localeCompare(first.dateKey) || first.service.localeCompare(second.service));
  const expenses = readExpenses()
    .filter((expense) => expense && typeof expense === "object" && !Array.isArray(expense))
    .map((expense) => {
      // Halaman Pengeluaran Kasir menyimpan total di field "amount" (jumlah barang opsional);
      // data lama memakai quantity x price. Keduanya didukung.
      const rawQuantity = Number(expense.quantity);
      const amount = Number(expense.amount);
      const hasAmount = expense.amount !== undefined && expense.amount !== null && expense.amount !== "" && Number.isFinite(amount);
      const quantity = Number.isFinite(rawQuantity) && rawQuantity > 0 ? rawQuantity : (hasAmount ? 1 : 0);
      const price = hasAmount ? (quantity > 0 ? amount / quantity : amount) : Number(expense.price);
      return {
        date: formatDate(expense.date),
        description: String(expense.description || "-"),
        quantity,
        price: Number.isFinite(price) ? price : 0,
      };
    });
  const totalIncome = paidTransactions.reduce((total, transaction) => total + Number(transaction.price || 0), 0);
  const totalExpenses = expenses.reduce((total, expense) => total + expense.quantity * expense.price, 0);
  incomeTotal.textContent = formatCurrency(totalIncome);
  expenseTotal.textContent = formatCurrency(totalExpenses);
  netBalance.textContent = formatCurrency(totalIncome - totalExpenses);
  transactionCount.textContent = String(paidTransactions.length);

  const appendCell = (row, value) => {
    const cell = document.createElement("td");
    cell.textContent = String(value);
    row.append(cell);
  };
  incomeBody.replaceChildren();
  incomeEmpty.hidden = incomeRecords.length > 0;
  incomeRecords.forEach((record) => {
    const row = document.createElement("tr");
    appendCell(row, record.date);
    appendCell(row, record.service);
    appendCell(row, record.count);
    appendCell(row, formatCurrency(record.total / record.count));
    appendCell(row, formatCurrency(record.total));
    incomeBody.append(row);
  });
  expenseBody.replaceChildren();
  expenseEmpty.hidden = expenses.length > 0;
  expenses.forEach((expense) => {
    const row = document.createElement("tr");
    appendCell(row, expense.date);
    appendCell(row, expense.description);
    appendCell(row, expense.quantity);
    appendCell(row, formatCurrency(expense.price));
    appendCell(row, formatCurrency(expense.quantity * expense.price));
    expenseBody.append(row);
  });
  setupOwnerLogout();
}

function setupOwnerEmployeeReport() {
  const totalEmployees = document.querySelector("#owner-employee-total");
  const presentTotal = document.querySelector("#owner-employee-present");
  const absentTotal = document.querySelector("#owner-employee-absent");
  const lateTotal = document.querySelector("#owner-employee-late");
  const attendanceBody = document.querySelector("#owner-attendance-body");
  const attendanceEmpty = document.querySelector("#owner-attendance-empty");
  const attendanceTableWrap = document.querySelector(".owner-employee-table-wrap");
  if (!totalEmployees || !presentTotal || !absentTotal || !lateTotal || !attendanceBody || !attendanceEmpty || !attendanceTableWrap) return;

  const readRecords = (key) => {
    try {
      const records = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(records) ? records.filter((record) => record && typeof record === "object") : [];
    } catch (error) {
      console.error(`Tidak dapat membaca ${key} untuk laporan owner.`, error);
      return [];
    }
  };
  const now = new Date();
  const monthKey = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const dateKey = (value) => String(value || "").replace(/\D/g, "").slice(0, 8);
  const normalizeName = (name) => String(name || "").trim().toLocaleLowerCase("id-ID");
  const activeEmployees = getActiveEmployees();
  const employeeKeys = new Set(activeEmployees.map((employee) => normalizeName(employee.name)));
  const shifts = readRecords("washupShifts");
  const attendance = getAttendanceRecords();
  const attendanceEmployeeKey = (record) => [record.employeeName, record.employeeId]
    .map(normalizeName)
    .find((key) => employeeKeys.has(key));
  const todayKey = getTodayKey();
  const shiftByName = new Map(shifts.map((shift) => [normalizeName(shift.name), shift]));
  const toMinutes = (time) => {
    const match = String(time || "").trim().match(/^(\d{1,2})[.:](\d{2})$/);
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    return hours <= 23 && minutes <= 59 ? hours * 60 + minutes : null;
  };
  const isLate = (record) => {
    const shift = shiftByName.get(normalizeName(record.shift));
    if (!shift) return false;
    const checkInMinutes = toMinutes(record.checkIn);
    const shiftStartMinutes = toMinutes(shift.start);
    return checkInMinutes !== null && shiftStartMinutes !== null && checkInMinutes > shiftStartMinutes;
  };
  const todayAttendance = attendance.filter((record) => dateKey(record.date) === todayKey && record.checkIn);
  const checkedInNames = new Set(todayAttendance.map(attendanceEmployeeKey).filter(Boolean));
  const lateNamesToday = new Set(todayAttendance
    .filter(isLate)
    .map(attendanceEmployeeKey)
    .filter(Boolean));
  totalEmployees.textContent = String(activeEmployees.length);
  presentTotal.textContent = String(checkedInNames.size);
  absentTotal.textContent = String(activeEmployees.filter((employee) => !checkedInNames.has(normalizeName(employee.name))).length);
  lateTotal.textContent = String(lateNamesToday.size);

  const appendCell = (row, value) => {
    const cell = document.createElement("td");
    cell.textContent = String(value);
    row.append(cell);
  };
  const monthlyAttendance = attendance.filter((record) => dateKey(record.date).startsWith(monthKey));
  const monthlySummaries = new Map();
  activeEmployees.forEach((employee) => {
    const key = normalizeName(employee.name);
    monthlySummaries.set(key, { presentDates: new Set(), lateDates: new Set() });
  });
  monthlyAttendance.forEach((record) => {
    const key = attendanceEmployeeKey(record);
    if (!key) return;
    if (!record.checkIn) return;
    const summary = monthlySummaries.get(key) || { presentDates: new Set(), lateDates: new Set() };
    const recordDateKey = dateKey(record.date);
    summary.presentDates.add(recordDateKey);
    if (isLate(record)) summary.lateDates.add(recordDateKey);
    monthlySummaries.set(key, summary);
  });
  attendanceBody.replaceChildren();
  const sortedEmployees = [...activeEmployees].sort((first, second) => first.name.localeCompare(second.name, "id-ID"));
  attendanceEmpty.hidden = sortedEmployees.length > 0;
  attendanceTableWrap.hidden = sortedEmployees.length === 0;
  sortedEmployees.forEach((employee) => {
    const key = normalizeName(employee.name);
    const summary = monthlySummaries.get(key) || { presentDates: new Set(), lateDates: new Set() };
    const row = document.createElement("tr");
    // Izin dan insentif belum memiliki sumber data yang dapat dipercaya.
    [employee.name, summary.presentDates.size, summary.lateDates.size, "-", "-"].forEach((value) => appendCell(row, value));
    attendanceBody.append(row);
  });
  setupOwnerLogout();
}

function setupOwnerServiceStats() {
  const monthSelect = document.querySelector("#owner-stats-month");
  const yearSelect = document.querySelector("#owner-stats-year");
  const applyButton = document.querySelector("#owner-stats-apply");
  const typesTotal = document.querySelector("#owner-stats-types");
  const usageTotal = document.querySelector("#owner-stats-usage");
  const topService = document.querySelector("#owner-stats-top");
  const revenueTotal = document.querySelector("#owner-stats-revenue");
  const chart = document.querySelector("#owner-stats-chart");
  const empty = document.querySelector("#owner-stats-empty");
  if (!monthSelect || !yearSelect || !applyButton || !typesTotal || !usageTotal || !topService || !revenueTotal || !chart || !empty) return;

  const transactions = getTransactions();
  const validTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.createdAt);
    return !Number.isNaN(date.getTime());
  });
  const now = new Date();
  const years = new Set([now.getFullYear()]);
  validTransactions.forEach((transaction) => years.add(new Date(transaction.createdAt).getFullYear()));
  const yearPlaceholder = yearSelect.querySelector('option[value=""]');
  if (!yearPlaceholder) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Pilih periode tahun";
    yearSelect.prepend(option);
  }
  const monthPlaceholder = monthSelect.querySelector('option[value=""]');
  if (!monthPlaceholder) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Pilih periode bulan";
    monthSelect.prepend(option);
  }
  [...years].sort((first, second) => second - first).forEach((year) => {
    const option = document.createElement("option");
    option.value = String(year);
    option.textContent = String(year);
    yearSelect.append(option);
  });
  const monthNames = Array.from({ length: 12 }, (_, index) =>
    new Date(2000, index, 1).toLocaleDateString("id-ID", { month: "long" }));
  monthNames.forEach((month, index) => {
    const option = document.createElement("option");
    option.value = String(index + 1);
    option.textContent = month.charAt(0).toUpperCase() + month.slice(1);
    monthSelect.append(option);
  });

  const render = () => {
    const month = Number(monthSelect.value) || now.getMonth() + 1;
    const year = Number(yearSelect.value) || now.getFullYear();
    const paidTransactions = getTransactions().filter((transaction) => {
      if (transaction.paymentStatus !== "Lunas") return false;
      const date = new Date(transaction.createdAt);
      return !Number.isNaN(date.getTime()) && date.getMonth() + 1 === month && date.getFullYear() === year;
    });
    const services = new Map();
    paidTransactions.forEach((transaction) => {
      const name = String(transaction.service || "").trim();
      if (!name) return;
      const service = services.get(name) || { name, count: 0, revenue: 0 };
      service.count += 1;
      service.revenue += Number(transaction.price || 0);
      services.set(name, service);
    });
    const popularServices = [...services.values()].sort((first, second) =>
      second.count - first.count || first.name.localeCompare(second.name));
    const totalRevenue = paidTransactions.reduce((total, transaction) => total + Number(transaction.price || 0), 0);
    typesTotal.textContent = String(services.size);
    usageTotal.textContent = String(paidTransactions.length);
    topService.textContent = popularServices[0]?.name || "-";
    revenueTotal.textContent = formatCurrency(totalRevenue);
    chart.replaceChildren();
    empty.hidden = popularServices.length > 0;
    if (popularServices.length) {
      const maxUsage = Math.max(...popularServices.map((service) => service.count));
      const scale = Math.ceil(maxUsage / 5) * 5;
      const plot = document.createElement("div");
      plot.className = "owner-chart-plot";
      plot.setAttribute("role", "img");
      plot.setAttribute("aria-label", "Grafik jumlah penggunaan tiap layanan");
      const axisTitle = document.createElement("span");
      axisTitle.className = "owner-chart-axis-title";
      axisTitle.textContent = "Jumlah Penggunaan";
      const ticks = document.createElement("div");
      ticks.className = "owner-chart-ticks";
      for (let index = 5; index >= 0; index -= 1) {
        const tick = document.createElement("span");
        tick.textContent = String(Math.round((scale * index) / 5));
        ticks.append(tick);
      }
      const bars = document.createElement("div");
      bars.className = "owner-chart-bars";
      popularServices.forEach((service) => {
        const column = document.createElement("div");
        column.className = "owner-chart-column";
        const value = document.createElement("span");
        value.className = "owner-chart-value";
        value.textContent = String(service.count);
        const barTrack = document.createElement("div");
        barTrack.className = "owner-chart-bar-track";
        const bar = document.createElement("div");
        bar.className = "owner-chart-bar";
        bar.style.height = `${Math.max((service.count / scale) * 100, 4)}%`;
        barTrack.append(value, bar);
        const label = document.createElement("span");
        label.className = "owner-chart-label";
        label.textContent = service.name;
        label.title = service.name;
        column.append(barTrack, label);
        bars.append(column);
      });
      plot.append(axisTitle, ticks, bars);
      const scroller = document.createElement("div");
      scroller.className = "owner-chart-scroll";
      scroller.tabIndex = 0;
      scroller.setAttribute("role", "region");
      scroller.setAttribute("aria-label", "Grafik popularitas layanan, dapat digeser");
      scroller.append(plot);
      chart.append(scroller);
    }
  };
  applyButton.addEventListener("click", render);
  render();
  setupOwnerLogout();
}

if (document.querySelector(".owner-finance-page")) setupOwnerFinanceReport();
if (document.querySelector(".owner-employee-page")) setupOwnerEmployeeReport();
if (document.querySelector(".owner-service-stats-page")) setupOwnerServiceStats();

function setupAdminDashboard() {
  const customerCount = document.querySelector("#admin-customer-count");
  const vehicleCount = document.querySelector("#admin-vehicle-count");
  const serviceCount = document.querySelector("#admin-service-count");
  const employeeCount = document.querySelector("#admin-employee-count");
  const todayTransactionsCount = document.querySelector("#admin-today-transactions");
  const todayRevenue = document.querySelector("#admin-today-revenue");
  const activeQueueCount = document.querySelector("#admin-active-queue");
  const activeBadge = document.querySelector("#admin-active-badge");
  const popularServices = document.querySelector("#admin-popular-services");
  const monitoringQueue = document.querySelector("#admin-monitoring-queue");
  const waitingCashier = document.querySelector("#admin-waiting-cashier");
  const monitoringEmployees = document.querySelector("#admin-monitoring-employees");
  const checkInCount = document.querySelector("#admin-check-in-count");
  const currentShift = document.querySelector("#admin-current-shift");
  const currentShiftTime = document.querySelector("#admin-current-shift-time");
  const targetProgress = document.querySelector("#admin-target-progress");
  const targetPercent = document.querySelector("#admin-target-percent");
  const targetCount = document.querySelector("#admin-target-count");
  const activityList = document.querySelector("#admin-activity-list");
  const recentBody = document.querySelector("#admin-recent-body");
  const recentEmpty = document.querySelector("#admin-recent-empty");
  const recentCount = document.querySelector("#admin-recent-count");
  const notice = document.querySelector("#admin-notice");

  if (!customerCount || !vehicleCount || !serviceCount || !employeeCount || !todayTransactionsCount || !todayRevenue || !activeQueueCount || !activeBadge || !popularServices || !monitoringQueue || !waitingCashier || !monitoringEmployees || !checkInCount || !currentShift || !currentShiftTime || !targetProgress || !targetPercent || !targetCount || !activityList || !recentBody || !recentEmpty || !recentCount || !notice) {
    return;
  }

  const adminDailyTarget = 160; // target sementara, belum ada pengaturan target
  const readDashboardRecords = (key, label) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      if (!Array.isArray(value)) {
        notice.textContent = `Format data ${label} tidak valid.`;
        return [];
      }
      return value.filter((item) => item && typeof item === "object");
    } catch {
      notice.textContent = `Data ${label} tidak dapat dibaca.`;
      return [];
    }
  };
  const validDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };
  const isToday = (value, todayKey) => {
    const date = validDate(value);
    return Boolean(date && formatDateKey(date) === todayKey);
  };
  const timeInWib = (value) => {
    const date = validDate(value);
    return date ? `${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Jakarta" })} WIB` : "-";
  };
  const displayShortCurrency = (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return formatCurrency(0);
    if (amount >= 1000000) {
      const shortAmount = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount / 1000000);
      return `Rp ${shortAmount} jt`;
    }
    return formatCurrency(amount);
  };
  const createActivity = (title, detail, iconType) => {
    const item = document.createElement("div");
    item.className = "admin-activity-item";
    const icon = document.createElement("span");
    icon.className = "admin-activity-icon";
    icon.setAttribute("aria-hidden", "true");
    const activityIcons = { payment: "credit-card", transaction: "receipt", attendance: "user" };
    icon.innerHTML = window.renderIcon(activityIcons[iconType] || "list", "wu-icon");
    const copy = document.createElement("span");
    copy.className = "admin-activity-copy";
    const heading = document.createElement("strong");
    heading.textContent = title;
    const description = document.createElement("span");
    description.textContent = detail;
    copy.append(heading, description);
    item.append(icon, copy);
    return item;
  };

  const render = () => {
    notice.textContent = "";
    const transactions = getTransactions();
    const todayKey = getTodayKey();
    const todayTransactions = transactions.filter((transaction) => isToday(transaction.createdAt, todayKey));
    const activeEmployees = getActiveEmployees();
    const todayAttendance = getAttendanceRecords().filter((record) => String(record.date || "").replace(/\D/g, "").slice(0, 8) === todayKey && record.checkIn);
    const shifts = readDashboardRecords(masterDefinitions.shifts.key, "shift").filter((shift) => shift.status === "Aktif");

    const uniqueCustomerNames = new Set(transactions.map((transaction) => String(transaction.customerName || "").trim().toLowerCase()).filter(Boolean));
    const uniqueVehiclePlates = new Set(transactions.map((transaction) => String(transaction.plateNumber || "").replace(/\s+/g, " ").trim().toUpperCase()).filter(Boolean));
    let services = [];
    try {
      services = ensureMasterDefaults("services", masterDefinitions.services);
    } catch {
      notice.textContent = "Data layanan tidak dapat diperbarui.";
      services = readMasterRecords(masterDefinitions.services);
    }
    const activeEmployeeCount = activeEmployees.length;
    const recentTransactions = [...transactions].sort((first, second) => {
      const firstTime = validDate(first.createdAt)?.getTime() || 0;
      const secondTime = validDate(second.createdAt)?.getTime() || 0;
      return secondTime - firstTime;
    }).slice(0, 5);
    const activeQueue = transactions.filter((transaction) => transaction.serviceStatus === "Menunggu" || transaction.serviceStatus === "Sedang Dicuci").length;
    const waitingForCashier = transactions.filter((transaction) => transaction.serviceStatus === "Selesai" && transaction.paymentStatus === "Belum Dibayar").length;
    const verifiedCheckIns = todayAttendance.filter((record) => record.checkInVerified === true).length;
    const totalRevenue = transactions.reduce((sum, transaction) => {
      const paymentDate = transaction.paidAt || transaction.createdAt;
      if (transaction.paymentStatus !== "Lunas" || !isToday(paymentDate, todayKey)) return sum;
      const price = Number(transaction.price);
      return Number.isFinite(price) ? sum + price : sum;
    }, 0);
    const serviceCounts = new Map();
    todayTransactions.forEach((transaction) => {
      const serviceName = String(transaction.service || "").trim();
      if (serviceName) serviceCounts.set(serviceName, (serviceCounts.get(serviceName) || 0) + 1);
    });
    const topServices = [...serviceCounts.entries()].sort((first, second) => second[1] - first[1]).slice(0, 3);

    customerCount.textContent = String(uniqueCustomerNames.size);
    vehicleCount.textContent = String(uniqueVehiclePlates.size);
    serviceCount.textContent = String(services.length);
    employeeCount.textContent = String(activeEmployeeCount);
    todayTransactionsCount.textContent = String(todayTransactions.length);
    todayRevenue.textContent = displayShortCurrency(totalRevenue);
    activeQueueCount.textContent = String(activeQueue);
    activeBadge.textContent = `${activeEmployeeCount} aktif`;
    monitoringQueue.textContent = String(activeQueue);
    waitingCashier.textContent = String(waitingForCashier);
    monitoringEmployees.textContent = String(activeEmployeeCount);
    checkInCount.textContent = String(todayAttendance.length);
    popularServices.replaceChildren();
    Array.from({ length: 3 }, (_, index) => topServices[index] || ["-", 0]).forEach(([name, count]) => {
      const column = document.createElement("div");
      const serviceName = document.createElement("span");
      serviceName.textContent = name;
      const serviceCount = document.createElement("strong");
      serviceCount.textContent = String(count);
      column.append(serviceName, serviceCount);
      popularServices.append(column);
    });

    const currentTime = new Date();
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const shiftMinute = (time) => {
      const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(time || ""));
      return match ? Number(match[1]) * 60 + Number(match[2]) : null;
    };
    const runningShift = shifts.find((shift) => {
      const start = shiftMinute(shift.start);
      const end = shift.end === "00:00" ? 1440 : shiftMinute(shift.end);
      if (start === null || end === null) return false;
      if (start < end) return currentMinutes >= start && currentMinutes < end;
      return currentMinutes >= start || currentMinutes < end;
    });
    currentShift.textContent = runningShift?.name || "Tidak ada shift berjalan";
    currentShiftTime.textContent = runningShift
      ? `${String(runningShift.start).replace(":", ".")}–${runningShift.end === "00:00" ? "24.00" : String(runningShift.end).replace(":", ".")}`
      : "-";

    const targetCompletion = Math.min(100, Math.round((todayTransactions.length / adminDailyTarget) * 100));
    targetProgress.style.width = `${targetCompletion}%`;
    targetProgress.parentElement.setAttribute("aria-valuenow", String(targetCompletion));
    targetPercent.textContent = `${targetCompletion}% target tercapai`;
    targetCount.textContent = `${todayTransactions.length} / ${adminDailyTarget}`;

    activityList.replaceChildren();
    const latestPayment = transactions
      .filter((transaction) => transaction.paymentStatus === "Lunas" && isToday(transaction.paidAt || transaction.createdAt, todayKey))
      .sort((first, second) => (validDate(second.paidAt || second.createdAt)?.getTime() || 0) - (validDate(first.paidAt || first.createdAt)?.getTime() || 0))[0];
    if (latestPayment) {
      activityList.append(createActivity(
        `Pembayaran ${latestPayment.transactionNumber || "-"}`,
        `Lunas · ${timeInWib(latestPayment.paidAt || latestPayment.createdAt)}`,
        "payment",
      ));
    }
    const latestTransaction = [...todayTransactions].sort((first, second) => (validDate(second.createdAt)?.getTime() || 0) - (validDate(first.createdAt)?.getTime() || 0))[0];
    if (latestTransaction) {
      activityList.append(createActivity(
        `Transaksi baru ${latestTransaction.transactionNumber || "-"}`,
        `${latestTransaction.customerName || "-"} · ${timeInWib(latestTransaction.createdAt)}`,
        "transaction",
      ));
    }
    if (todayAttendance.length) {
      activityList.append(createActivity(
        "Absensi karyawan terverifikasi",
        `${verifiedCheckIns} dari ${todayAttendance.length}`,
        "attendance",
      ));
    }
    if (!activityList.childElementCount) {
      const emptyActivity = document.createElement("p");
      emptyActivity.className = "admin-activity-empty";
      emptyActivity.textContent = "Belum ada aktivitas hari ini.";
      activityList.append(emptyActivity);
    }

    const latestTransactionDate = validDate(recentTransactions[0]?.createdAt);
    if (latestTransactionDate) {
      const minutesAgo = Math.max(0, Math.floor((Date.now() - latestTransactionDate.getTime()) / 60000));
      recentCount.textContent = minutesAgo < 1 ? "baru saja" : `${minutesAgo} menit lalu`;
      recentCount.hidden = false;
    } else {
      recentCount.textContent = "";
      recentCount.hidden = true;
    }
    recentEmpty.hidden = recentTransactions.length > 0;
    recentBody.replaceChildren();
    recentTransactions.forEach((transaction) => {
      const row = document.createElement("tr");
      const price = transaction.price;
      const formattedPrice = price !== "" && price !== null && price !== undefined && Number.isFinite(Number(price)) ? formatCurrency(price) : "-";
      [transaction.transactionNumber || "-", transaction.customerName || "-", transaction.plateNumber || "-", transaction.service || "-", formattedPrice].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      });
      recentBody.append(row);
    });
  };

  document.querySelector("#admin-date").textContent = getTodayLabel();
  const currentYear = document.querySelector("#current-year");
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
  document.querySelectorAll("[data-admin-placeholder]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      notice.textContent = "Menu ini belum tersedia.";
    });
  });
  document.querySelector("#admin-logout")?.addEventListener("click", () => { sessionStorage.removeItem("washupRole"); window.location.href = appUrl("login.html"); });
  render();
}

if (document.querySelector(".admin-dashboard-page")) setupAdminDashboard();

function setupAdminVerificationPage() {
  const page = document.querySelector(".admin-verification-page");
  if (!page) return;

  if (sessionStorage.getItem("washupRole") !== "Admin") {
    window.location.replace(appUrl("login.html"));
    return;
  }

  const search = document.querySelector("#verification-search");
  const pendingCount = document.querySelector("#verification-pending-count");
  const tableBody = document.querySelector("#verification-table-body");
  const emptyState = document.querySelector("#verification-empty");
  const review = document.querySelector("#verification-review");
  const reviewTitle = document.querySelector("#verification-review-title");
  const reviewInfo = document.querySelector("#verification-review-info");
  const photoWrap = document.querySelector("#verification-photo-wrap");
  const partnerStatus = document.querySelector("#verification-partner-status");
  const confirmButton = document.querySelector("#verification-confirm");
  const actionHint = document.querySelector("#verification-action-hint");
  const notice = document.querySelector("#verification-notice");
  if (!search || !pendingCount || !tableBody || !emptyState || !review || !reviewTitle || !reviewInfo || !photoWrap || !partnerStatus || !confirmButton || !actionHint || !notice) return;

  const kindLabels = { checkIn: "Masuk", checkOut: "Keluar" };
  const verificationFields = {
    checkIn: { time: "checkIn", photo: "checkInPhoto", verified: "checkInVerified", verifiedAt: "checkInVerifiedAt" },
    checkOut: { time: "checkOut", photo: "checkOutPhoto", verified: "checkOutVerified", verifiedAt: "checkOutVerifiedAt" },
  };
  let selected = null;
  const setNotice = (message, isError = false) => {
    notice.textContent = message;
    notice.classList.toggle("is-error", isError);
  };

  const normalizedDate = (value) => String(value || "").replace(/\D/g, "").slice(0, 8);
  const formatDate = (value) => {
    const digits = normalizedDate(value);
    if (digits.length !== 8) return "—";
    const date = new Date(Number(digits.slice(0, 4)), Number(digits.slice(4, 6)) - 1, Number(digits.slice(6, 8)));
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  };
  const formatTime = (value) => {
    const time = String(value || "").trim();
    return time ? `${time.replace(":", ".")} WIB` : "—";
  };
  const formatShift = (value) => String(value || "").replace(/^Shift\s+/i, "").trim() || "—";
  const statusFor = (record, kind) => {
    const fields = verificationFields[kind];
    if (!record[fields.time]) return "Belum diajukan";
    return record[fields.verified] === true ? "Terverifikasi" : "Perlu verifikasi";
  };
  const shiftDetails = (record) => {
    const shift = readMasterRecords(masterDefinitions.shifts).find((item) => item.name === record.shift);
    if (!shift) return "";
    const start = String(shift.start || "").replace(":", ".");
    const end = shift.end === "00:00" ? "24.00" : String(shift.end || "").replace(":", ".");
    return start && end ? `${start}–${end}` : "";
  };
  const currentSelectedRecord = (records) => selected && records[selected.recordIndex] ? records[selected.recordIndex] : null;

  function renderReview(records) {
    const record = currentSelectedRecord(records);
    if (!record || !selected || !verificationFields[selected.kind]) {
      review.hidden = true;
      return;
    }

    const fields = verificationFields[selected.kind];
    const kindLabel = kindLabels[selected.kind];
    const time = record[fields.time];
    const shift = formatShift(record.shift);
    const schedule = shiftDetails(record);
    const shiftInfo = [shift, schedule].filter(Boolean).join(" ");
    const dateLabel = formatDate(record.date);
    const employeeName = String(record.employeeName || "Petugas");
    const partnerKind = selected.kind === "checkIn" ? "checkOut" : "checkIn";
    const partnerFields = verificationFields[partnerKind];
    const partnerLabel = kindLabels[partnerKind].toLowerCase();
    const partnerTime = record[partnerFields.time];

    review.hidden = false;
    reviewTitle.textContent = `Tinjau absensi ${kindLabel.toLowerCase()} · ${employeeName}`;
    reviewInfo.textContent = `${dateLabel} • ${shiftInfo} • ${kindLabel} ${formatTime(time)}`;
    photoWrap.replaceChildren();
    if (record[fields.photo]) {
      const photo = document.createElement("img");
      photo.src = record[fields.photo];
      photo.alt = `Foto absen ${kindLabel.toLowerCase()} ${employeeName}`;
      photoWrap.append(photo);
    } else {
      const missingPhoto = document.createElement("p");
      missingPhoto.textContent = "Foto bukti tidak tersedia.";
      photoWrap.append(missingPhoto);
    }
    partnerStatus.textContent = !partnerTime
      ? `Absensi ${partnerLabel} belum diajukan.`
      : `Absensi ${partnerLabel} ${formatTime(partnerTime)}${record[partnerFields.verified] === true ? " sudah terverifikasi." : " belum terverifikasi."}`;

    const isVerified = record[fields.verified] === true;
    const isAvailable = Boolean(time);
    const checkoutBlocked = selected.kind === "checkOut" && record.checkInVerified !== true;
    confirmButton.hidden = !isAvailable || isVerified;
    confirmButton.disabled = checkoutBlocked;
    confirmButton.textContent = `Verifikasi ${kindLabel}`;
    actionHint.hidden = !checkoutBlocked;
    actionHint.textContent = checkoutBlocked ? "Verifikasi absensi masuk terlebih dahulu sebelum memverifikasi absensi keluar." : "";
  }

  function render() {
    const records = getAttendanceRecords();
    const tableWrap = tableBody.closest(".verification-table-wrap");
    const scrollLeft = tableWrap?.scrollLeft || 0;
    const query = search.value.trim().toLowerCase();
    const pending = records.reduce((total, record) => total + ["checkIn", "checkOut"].filter((kind) => record[verificationFields[kind].time] && record[verificationFields[kind].verified] !== true).length, 0);
    pendingCount.textContent = `${pending} perlu verifikasi`;

    const filteredRecords = records
      .map((record, recordIndex) => ({ record, recordIndex }))
      .filter(({ record }) => String(record.employeeName || "").toLowerCase().includes(query))
      .sort((first, second) => normalizedDate(second.record.date).localeCompare(normalizedDate(first.record.date)));

    tableBody.replaceChildren();
    emptyState.hidden = filteredRecords.length > 0;
    const emptyHeading = emptyState.querySelector("h3");
    const emptyDescription = emptyState.querySelector("p");
    if (!records.length) {
      if (emptyHeading) emptyHeading.textContent = "Belum ada absensi petugas.";
      if (emptyDescription) emptyDescription.textContent = "Data absensi akan muncul setelah petugas melakukan absen.";
    } else if (!filteredRecords.length) {
      if (emptyHeading) emptyHeading.textContent = "Absensi tidak ditemukan.";
      if (emptyDescription) emptyDescription.textContent = "Coba kata kunci nama karyawan yang lain.";
    }

    filteredRecords.forEach(({ record, recordIndex }) => {
      ["checkIn", "checkOut"].forEach((kind) => {
        const status = statusFor(record, kind);
        const row = document.createElement("tr");
        if (selected?.recordIndex === recordIndex && selected.kind === kind) row.classList.add("is-selected");
        const values = [
          String(record.employeeName || "Petugas"),
          formatDate(record.date),
          formatShift(record.shift),
          kindLabels[kind],
          formatTime(record[verificationFields[kind].time]),
        ];
        values.forEach((value) => {
          const cell = document.createElement("td");
          cell.textContent = value;
          row.append(cell);
        });

        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");
        statusBadge.className = `verification-status verification-status-${status === "Terverifikasi" ? "verified" : status === "Perlu verifikasi" ? "pending" : "unsubmitted"}`;
        statusBadge.textContent = status;
        statusCell.append(statusBadge);
        row.append(statusCell);

        const actionCell = document.createElement("td");
        if (status === "Belum diajukan") {
          const unavailable = document.createElement("span");
          unavailable.className = "verification-unavailable";
          unavailable.textContent = "Tidak tersedia";
          actionCell.append(unavailable);
        } else {
          const action = document.createElement("button");
          action.type = "button";
          action.className = "verification-row-action table-action-detail";
          action.dataset.recordIndex = String(recordIndex);
          action.dataset.kind = kind;
          action.textContent = status === "Terverifikasi" ? "Detail" : "Tinjau";
          if (selected?.recordIndex === recordIndex && selected.kind === kind) action.classList.add("is-selected");
          actionCell.append(action);
        }
        row.append(actionCell);
        tableBody.append(row);
      });
    });

    renderReview(records);
    if (tableWrap) tableWrap.scrollLeft = scrollLeft;
  }

  tableBody.addEventListener("click", (event) => {
    const action = event.target.closest("button.verification-row-action");
    if (!action) return;
    selected = { recordIndex: Number(action.dataset.recordIndex), kind: action.dataset.kind };
    setNotice("");
    render();
  });
  search.addEventListener("input", () => {
    selected = null;
    setNotice("");
    render();
  });
  confirmButton.addEventListener("click", () => {
    if (!selected || !verificationFields[selected.kind]) return;
    const records = getAttendanceRecords();
    const record = records[selected.recordIndex];
    if (!record) {
      setNotice("Catatan absensi tidak ditemukan. Muat ulang halaman dan coba lagi.", true);
      return;
    }
    const fields = verificationFields[selected.kind];
    if (!record[fields.time]) {
      setNotice("Absensi belum diajukan dan tidak dapat diverifikasi.", true);
      return;
    }
    if (record[fields.verified] === true) {
      setNotice("Absensi ini sudah terverifikasi.");
      render();
      return;
    }
    if (selected.kind === "checkOut" && record.checkInVerified !== true) {
      setNotice("Verifikasi absensi masuk terlebih dahulu sebelum memverifikasi absensi keluar.", true);
      render();
      return;
    }

    records[selected.recordIndex] = { ...record, [fields.verified]: true, [fields.verifiedAt]: new Date().toISOString() };
    try {
      localStorage.setItem(attendanceStorageKey, JSON.stringify(records));
      setNotice(`Absensi ${kindLabels[selected.kind].toLowerCase()} ${String(record.employeeName || "Petugas")} berhasil diverifikasi.`);
      render();
    } catch {
      setNotice("Verifikasi tidak dapat disimpan. Periksa ruang penyimpanan browser dan coba lagi.", true);
    }
  });
  document.querySelector("#verification-logout")?.addEventListener("click", () => {
    sessionStorage.removeItem("washupRole");
    sessionStorage.removeItem("washupUsername");
    window.location.href = appUrl("login.html");
  });

  render();
}

if (document.querySelector(".admin-verification-page")) setupAdminVerificationPage();

function statusClassForPetugas(status) {
  if (status === "Selesai" || status === "Lunas") return "status-done";
  if (status === "Sedang Dicuci") return "status-washing";
  return "status-waiting";
}

function makePetugasStatusBadge(status) {
  const badge = document.createElement("span");
  badge.className = `status-badge ${statusClassForPetugas(status)}`;
  badge.textContent = status;
  return badge;
}

function setupPetugasDashboard() {
  const body = document.querySelector("#petugas-dashboard-body");
  const empty = document.querySelector("#petugas-dashboard-empty");
  const dialog = document.querySelector("#petugas-dialog");
  if (!body || !empty || !dialog) return;

  let selectedId = null;
  const waitingCount = document.querySelector("#waiting-count");
  const washingCount = document.querySelector("#washing-count");
  const doneCount = document.querySelector("#done-count");
  const vehicleCount = document.querySelector("#petugas-vehicle-count");
  const dateEl = document.querySelector("#petugas-date");
  if (dateEl) dateEl.textContent = getTodayLabel();

  const render = () => {
    const transactions = getTransactions();
    const today = getTodayKey();
    const todayTransactions = transactions.filter((transaction) => {
      const createdAt = new Date(transaction.createdAt);
      return !Number.isNaN(createdAt.getTime()) && formatDateKey(createdAt) === today;
    });
    const completedToday = todayTransactions.filter((transaction) => transaction.serviceStatus === "Selesai");
    const uniquePlatesToday = new Set(todayTransactions
      .map((transaction) => String(transaction.plateNumber || "").trim().toUpperCase())
      .filter(Boolean));
    if (waitingCount) waitingCount.textContent = transactions.filter((transaction) => transaction.serviceStatus === "Menunggu").length;
    if (washingCount) washingCount.textContent = transactions.filter((transaction) => transaction.serviceStatus === "Sedang Dicuci").length;
    if (doneCount) doneCount.textContent = completedToday.length;
    if (vehicleCount) vehicleCount.textContent = uniquePlatesToday.size;

    const visibleTransactions = transactions.slice().sort((first, second) => {
      const firstDone = first.serviceStatus === "Selesai";
      const secondDone = second.serviceStatus === "Selesai";
      return Number(firstDone) - Number(secondDone);
    });
    body.replaceChildren();
    empty.hidden = visibleTransactions.length > 0;
    visibleTransactions.forEach((transaction) => {
      const row = document.createElement("tr");
      [transaction.queueNumber || "-", transaction.plateNumber || "-", transaction.customerName || "-", transaction.vehicleType || "-", transaction.service || "-"].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      });
      const serviceCell = document.createElement("td");
      serviceCell.append(makePetugasStatusBadge(transaction.serviceStatus));
      row.append(serviceCell);

      const paymentCell = document.createElement("td");
      paymentCell.append(makePetugasStatusBadge(transaction.paymentStatus));
      row.append(paymentCell);

      const actionCell = document.createElement("td");
      const button = document.createElement("button");
      button.className = "table-action table-action-detail";
      button.type = "button";
      button.textContent = "Detail";
      button.addEventListener("click", () => openDetail(transaction));
      actionCell.append(button);
      row.append(actionCell);
      body.append(row);
    });
  };

  function openDetail(transaction) {
    selectedId = transaction.id;
    const values = {
      "petugas-detail-queue": transaction.queueNumber,
      "petugas-detail-transaction": transaction.transactionNumber,
      "petugas-detail-customer": transaction.customerName,
      "petugas-detail-phone": transaction.customerPhone,
      "petugas-detail-plate": transaction.plateNumber,
      "petugas-detail-vehicle": transaction.vehicleType,
      "petugas-detail-service": transaction.service,
      "petugas-detail-price": formatCurrency(transaction.price),
      "petugas-detail-service-status": transaction.serviceStatus,
      "petugas-detail-payment-status": transaction.paymentStatus,
    };
    Object.entries(values).forEach(([id, value]) => {
      document.querySelector(`#${id}`).textContent = value || "-";
    });
    document.querySelector("#petugas-detail-status").value = transaction.serviceStatus;
    document.querySelector("#petugas-dialog-notice").textContent = "";
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  const close = () => {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
    selectedId = null;
  };
  document.querySelector("#petugas-dialog-close")?.addEventListener("click", close);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });
  document.querySelector("#petugas-update-status")?.addEventListener("click", () => {
    const transactions = getTransactions();
    const transaction = transactions.find((item) => item.id === selectedId);
    if (!transaction) return;
    const notice = document.querySelector("#petugas-dialog-notice");
    if (transaction.paymentStatus === "Lunas") {
      notice.textContent = "Status pengerjaan tidak dapat diubah setelah transaksi Lunas.";
      return;
    }
    const nextStatus = document.querySelector("#petugas-detail-status").value;
    if (!isValidServiceStatusTransition(transaction.serviceStatus, nextStatus)) {
      notice.textContent = "Status harus mengikuti urutan Menunggu, Sedang Dicuci, lalu Selesai.";
      return;
    }
    transaction.serviceStatus = nextStatus;
    saveTransactions(transactions);
    document.querySelector("#petugas-detail-service-status").textContent = transaction.serviceStatus;
    notice.textContent = "Status pengerjaan berhasil diperbarui.";
    render();
  });
  render();
}

function setupPetugasAttendance() {
  document.querySelector("#attendance-logout")?.addEventListener("click", () => {
    sessionStorage.removeItem("washupRole");
    sessionStorage.removeItem("washupUsername");
    window.location.href = appUrl("login.html");
  });

  const employeeId = sessionStorage.getItem("washupUsername") || "petugas";
  const employeeName = employeeId === "petugas" ? "Petugas" : employeeId;
  const employeeRecords = () => getAttendanceRecords().filter((record) =>
    record.employeeId === employeeId || (!record.employeeId && record.employeeName === employeeName));
  const parseAttendanceDate = (value) => {
    const digits = String(value || "").replace(/\D/g, "");
    if (digits.length !== 8) return null;
    const date = new Date(Number(digits.slice(0, 4)), Number(digits.slice(4, 6)) - 1, Number(digits.slice(6, 8)));
    if (date.getFullYear() !== Number(digits.slice(0, 4)) ||
        date.getMonth() !== Number(digits.slice(4, 6)) - 1 ||
        date.getDate() !== Number(digits.slice(6, 8))) return null;
    return date;
  };
  const formatAttendanceDate = (date, options = { weekday: "long", day: "numeric", month: "short", year: "numeric" }) =>
    date.toLocaleDateString("id-ID", options);
  const timeToMinutes = (value) => {
    const match = /^(\d{1,2})[:.](\d{2})/.exec(String(value || "").trim());
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    return hours <= 23 && minutes <= 59 ? hours * 60 + minutes : null;
  };
  const shifts = ensureMasterDefaults("shifts", masterDefinitions.shifts);
  const getActiveShifts = () => shifts.filter((shift) => shift.status === "Aktif");
  const getShifts = () => shifts;
  const findShiftForTime = (date = new Date()) => {
    const activeShifts = getActiveShifts();
    const now = date.getHours() * 60 + date.getMinutes();
    const runningShift = activeShifts.find((shift) => {
      const start = timeToMinutes(shift.start);
      const end = timeToMinutes(shift.end);
      if (start === null || end === null) return false;
      if (end === 0) return now >= start;
      return end < start ? now >= start || now < end : now >= start && now < end;
    });
    return runningShift || activeShifts[0] || null;
  };
  const isLateAttendance = (record) => {
    if (record?.status === "Terlambat") return true;
    const checkInMinutes = timeToMinutes(record?.checkIn);
    if (checkInMinutes === null) return false;
    const shift = getShifts().find((item) => item.name === record.shift);
    const shiftStart = timeToMinutes(shift?.start);
    const shiftEnd = timeToMinutes(shift?.end);
    if (shiftStart === null) return false;
    let adjustedCheckIn = checkInMinutes;
    if (shiftEnd !== null && shiftEnd > 0 && shiftEnd < shiftStart && adjustedCheckIn < shiftEnd) adjustedCheckIn += 1440;
    return adjustedCheckIn > shiftStart;
  };

  if (document.body.dataset.page === "recap") {
    const form = document.querySelector("#attendance-period-form");
    const monthSelect = document.querySelector("#attendance-month");
    const yearSelect = document.querySelector("#attendance-year");
    const body = document.querySelector("#petugas-attendance-history-body");
    const empty = document.querySelector("#petugas-attendance-history-empty");
    const pagination = document.querySelector("#attendance-pagination");
    if (!form || !monthSelect || !yearSelect || !body || !empty || !pagination) return;

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const now = new Date();
    let currentPage = 1;
    for (let month = 0; month < monthNames.length; month += 1) {
      const option = document.createElement("option");
      option.value = String(month);
      option.textContent = monthNames[month];
      monthSelect.append(option);
    }
    monthSelect.value = String(now.getMonth());

    const records = employeeRecords();
    const years = new Set([now.getFullYear()]);
    records.forEach((record) => {
      const date = parseAttendanceDate(record.date);
      if (date) years.add(date.getFullYear());
    });
    [...years].sort((first, second) => second - first).forEach((year) => {
      const option = document.createElement("option");
      option.value = String(year);
      option.textContent = String(year);
      yearSelect.append(option);
    });
    yearSelect.value = String(now.getFullYear());

    const makeCell = (label, value) => {
      const cell = document.createElement("td");
      cell.dataset.label = label;
      cell.textContent = value;
      return cell;
    };
    const formatDuration = (record) => {
      let start = timeToMinutes(record.checkIn);
      let end = timeToMinutes(record.checkOut);
      if (start === null || end === null) return "—";
      if (end < start) end += 1440;
      const duration = end - start;
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      if (!hours) return `${minutes} mnt`;
      return minutes ? `${hours} jam ${minutes} mnt` : `${hours} jam`;
    };

    function renderRecap() {
      const selectedMonth = Number(monthSelect.value);
      const selectedYear = Number(yearSelect.value);
      const monthStart = new Date(selectedYear, selectedMonth, 1);
      const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endDate = monthEnd < today ? monthEnd : today;
      const monthRecords = employeeRecords().filter((record) => {
        const recordDate = parseAttendanceDate(record.date);
        return recordDate && recordDate >= monthStart && recordDate <= endDate;
      });
      const recordsByDay = new Map();
      monthRecords.forEach((record) => {
        const recordDate = parseAttendanceDate(record.date);
        if (recordDate) recordsByDay.set(formatDateKey(recordDate), record);
      });

      const rows = [];
      if (endDate >= monthStart) {
        for (let day = new Date(monthStart); day <= endDate; day.setDate(day.getDate() + 1)) {
          const record = recordsByDay.get(formatDateKey(day));
          const isWorkday = day.getDay() !== 0;
          if (record) {
            const reportStatus = record.status === "Izin" || record.status === "Sakit"
              ? record.status
              : record.checkIn
                ? isLateAttendance(record) ? "Terlambat" : "Hadir"
                : "Tanpa Keterangan";
            rows.push({ date: new Date(day), record, status: reportStatus });
          } else if (isWorkday) {
            rows.push({ date: new Date(day), record: null, status: "Tanpa Keterangan" });
          }
        }
      }

      const attendedRecords = monthRecords.filter((record) => Boolean(record.checkIn));
      const lateCount = attendedRecords.filter(isLateAttendance).length;
      // Form izin dan sakit belum tersedia; kedua jumlah tetap nol sampai ada sumber data resmi.
      const izinCount = 0;
      const sakitCount = 0;
      const absentCount = rows.filter((row) => row.status === "Tanpa Keterangan").length;
      const setDayCount = (id, count) => {
        const element = document.querySelector(id);
        const value = document.createElement("span");
        value.textContent = String(count);
        const unit = document.createElement("small");
        unit.textContent = "hari";
        element.replaceChildren(value, document.createTextNode(" "), unit);
      };
      setDayCount("#recap-present-count", attendedRecords.length);
      setDayCount("#recap-late-count", lateCount);
      document.querySelector("#recap-late-detail").textContent = `Dari ${attendedRecords.length} hari hadir`;
      setDayCount("#recap-leave-count", izinCount + sakitCount);
      document.querySelector("#recap-leave-detail").textContent = `${izinCount} hari izin · ${sakitCount} hari sakit`;
      setDayCount("#recap-absent-count", absentCount);
      document.querySelector("#recap-period-label").textContent = `${monthNames[selectedMonth]} ${selectedYear}`;
      document.querySelector("#recap-employee-period").textContent =
        `${employeeName} · Data s.d. ${formatAttendanceDate(endDate, { day: "numeric", month: "long", year: "numeric" })}`;

      rows.sort((first, second) => second.date - first.date);
      const pageCount = Math.max(1, Math.ceil(rows.length / TABLE_PAGE_SIZE));
      currentPage = Math.min(currentPage, pageCount);
      const visibleRows = rows.slice((currentPage - 1) * TABLE_PAGE_SIZE, currentPage * TABLE_PAGE_SIZE);
      body.replaceChildren();
      visibleRows.forEach(({ date, record, status: rowStatus }) => {
        const row = document.createElement("tr");
        row.append(
          makeCell("Tanggal", formatAttendanceDate(date)),
          makeCell("Shift", record?.shift || "—"),
          makeCell("Jam Masuk", record?.checkIn || "—"),
          makeCell("Jam Keluar", record?.checkOut || "—"),
          makeCell("Durasi Kerja", record ? formatDuration(record) : "—"),
        );
        const statusCell = document.createElement("td");
        statusCell.dataset.label = "Status";
        const badge = document.createElement("span");
        badge.className = `attendance-status-badge ${
          rowStatus === "Terlambat" ? "attendance-status-late"
            : rowStatus === "Izin" || rowStatus === "Sakit" ? "attendance-status-leave"
              : rowStatus === "Tanpa Keterangan" ? "attendance-status-absent" : "attendance-status-present"
        }`;
        badge.textContent = rowStatus;
        statusCell.append(badge);
        row.append(statusCell);
        body.append(row);
      });
      empty.hidden = rows.length > 0;

      pagination.classList.add("wu-pager");
      window.WashupPager.renderPager(pagination, {
        page: currentPage,
        total: pageCount,
        onChange: (target) => { currentPage = target; renderRecap(); },
      });
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      currentPage = 1;
      renderRecap();
    });
    renderRecap();
    return;
  }

  const action = document.querySelector("#attendance-action");
  if (!action) return;
  const isCheckOutPage = document.body.dataset.attendanceMode === "out";
  const date = document.querySelector("#attendance-date");
  const name = document.querySelector("#attendance-name");
  const shift = document.querySelector("#attendance-shift");
  const checkIn = document.querySelector("#check-in-time");
  const checkOut = document.querySelector("#check-out-time");
  const status = document.querySelector("#attendance-status");
  const notice = document.querySelector("#attendance-notice");
  const photoInput = document.querySelector("#attendance-photo-input");
  const photoPicker = document.querySelector("#photo-picker");
  const photoPreview = document.querySelector("#photo-preview");
  const photoPreviewImage = document.querySelector("#photo-preview-image");
  const photoFileName = document.querySelector("#photo-file-name");
  const photoPreviewStatus = document.querySelector("#photo-preview-status");
  const photoConfirmedIndicator = document.querySelector("#photo-confirmed-indicator");
  const usePhoto = document.querySelector("#use-photo");
  const replacePhoto = document.querySelector("#replace-photo");
  const checkInPhotoCard = document.querySelector("#check-in-photo-card");
  const checkOutPhotoCard = document.querySelector("#check-out-photo-card");
  const checkInPhoto = document.querySelector("#check-in-photo");
  const checkOutPhoto = document.querySelector("#check-out-photo");
  if (!date || !name || !shift || !checkIn || !checkOut || !status || !notice ||
      !photoInput || !photoPicker || !photoPreview || !photoPreviewImage || !photoFileName ||
      !photoPreviewStatus || !photoConfirmedIndicator || !usePhoto || !replacePhoto ||
      !checkInPhotoCard || !checkOutPhotoCard || !checkInPhoto || !checkOutPhoto) return;

  let selectedPhoto = null;
  let selectedPhotoName = "";
  let confirmedPhoto = null;
  const render = () => {
    const attendance = getAttendance(employeeId);
    date.textContent = getTodayLabel();
    name.textContent = employeeName;
    shift.textContent = attendance?.shift || findShiftForTime()?.name || "—";
    checkIn.textContent = attendance?.checkIn || "--";
    checkOut.textContent = attendance?.checkOut || "--";
    const hasCheckedIn = Boolean(attendance?.checkIn);
    const hasCheckedOut = Boolean(attendance?.checkOut);
    status.textContent = hasCheckedOut ? "Selesai"
      : hasCheckedIn ? isLateAttendance(attendance) ? "Terlambat" : "Hadir"
        : "Belum Absen";
    action.textContent = isCheckOutPage ? "Absen Keluar" : "Absen Masuk";
    action.disabled = isCheckOutPage ? !hasCheckedIn || hasCheckedOut : hasCheckedIn;
    photoConfirmedIndicator.hidden = !confirmedPhoto;
    photoPreview.classList.toggle("photo-preview-confirmed", Boolean(confirmedPhoto));
    usePhoto.disabled = !selectedPhoto || Boolean(confirmedPhoto);
    photoPreviewStatus.textContent = confirmedPhoto ? "Foto ini siap digunakan untuk absensi." : "Periksa foto sebelum digunakan.";
    const stateNotice = isCheckOutPage
      ? !hasCheckedIn ? "Lakukan Absen Masuk terlebih dahulu."
        : hasCheckedOut ? "Absen Keluar sudah tercatat." : ""
      : hasCheckedOut ? "Absensi hari ini sudah selesai."
        : hasCheckedIn ? "Absen Masuk sudah tercatat." : "";
    if (stateNotice) notice.textContent = stateNotice;
    checkInPhotoCard.hidden = !attendance?.checkInPhoto;
    checkOutPhotoCard.hidden = !attendance?.checkOutPhoto;
    if (attendance?.checkInPhoto) checkInPhoto.src = attendance.checkInPhoto;
    else checkInPhoto.removeAttribute("src");
    if (attendance?.checkOutPhoto) checkOutPhoto.src = attendance.checkOutPhoto;
    else checkOutPhoto.removeAttribute("src");
  };

  function resetPhotoSelection() {
    selectedPhoto = null;
    selectedPhotoName = "";
    confirmedPhoto = null;
    photoInput.value = "";
    photoPreview.hidden = true;
    photoPreviewImage.removeAttribute("src");
    photoPreview.classList.remove("photo-preview-confirmed");
    render();
  }

  photoPicker.addEventListener("click", () => photoInput.click());
  replacePhoto.addEventListener("click", () => photoInput.click());
  photoInput.addEventListener("change", () => {
    const file = photoInput.files?.[0];
    if (!file) return;
    const validImageType = file.type.startsWith("image/");
    const maximumPhotoSize = 8 * 1024 * 1024;
    if (!validImageType) {
      notice.textContent = "File harus berupa gambar.";
      photoInput.value = "";
      return;
    }
    if (file.size > maximumPhotoSize) {
      notice.textContent = "Ukuran foto terlalu besar. Gunakan foto dengan ukuran lebih kecil.";
      photoInput.value = "";
      return;
    }

    readAttendancePhoto(file).then((dataUrl) => {
      selectedPhoto = dataUrl;
      selectedPhotoName = file.name;
      confirmedPhoto = null;
      photoPreviewImage.src = selectedPhoto;
      photoFileName.textContent = selectedPhotoName;
      photoPreview.hidden = false;
      notice.textContent = "Foto siap diperiksa. Klik Gunakan Foto untuk melanjutkan.";
      render();
    }).catch((error) => {
      photoInput.value = "";
      notice.textContent = error.message || "Foto tidak dapat diproses.";
    });
  });
  usePhoto.addEventListener("click", () => {
    if (!selectedPhoto) {
      notice.textContent = "Pilih foto terlebih dahulu.";
      return;
    }
    confirmedPhoto = selectedPhoto;
    notice.textContent = `Foto sudah dikonfirmasi. Anda dapat melakukan ${isCheckOutPage ? "Absen Keluar" : "Absen Masuk"}.`;
    render();
  });

  action.addEventListener("click", () => {
    const activeShift = findShiftForTime();
    const attendance = getAttendance(employeeId) || {
      employeeId, employeeName, date: getTodayKey(), shift: activeShift?.name || "Shift Pagi",
      checkIn: null, checkInPhoto: null, checkOut: null, checkOutPhoto: null, status: "Belum Absen",
    };
    if (!attendance.employeeId) attendance.employeeId = employeeId;
    if (!attendance.employeeName) attendance.employeeName = employeeName;
    if (attendance.checkOut) {
      notice.textContent = "Absensi hari ini sudah selesai.";
      return;
    }
    if (isCheckOutPage && !attendance.checkIn) {
      notice.textContent = "Lakukan Absen Masuk terlebih dahulu.";
      return;
    }
    if (!isCheckOutPage && attendance.checkIn) {
      notice.textContent = "Absen Masuk sudah tercatat. Gunakan menu Absensi Keluar untuk melanjutkan.";
      return;
    }
    if (!confirmedPhoto) {
      notice.textContent = "Bukti foto wajib digunakan sebelum melakukan absensi.";
      return;
    }
    const now = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    if (!isCheckOutPage && !attendance.checkIn) {
      attendance.shift = activeShift?.name || attendance.shift;
      attendance.checkIn = now;
      attendance.checkInPhoto = confirmedPhoto;
      attendance.status = isLateAttendance({ ...attendance, checkIn: now, shift: attendance.shift }) ? "Terlambat" : "Hadir";
    } else if (isCheckOutPage && attendance.checkIn && !attendance.checkOut) {
      if (confirmedPhoto === attendance.checkInPhoto) {
        notice.textContent = "Gunakan foto baru untuk Absen Keluar.";
        return;
      }
      attendance.checkOut = now;
      attendance.checkOutPhoto = confirmedPhoto;
      attendance.status = "Selesai";
    }
    if (!saveAttendance(attendance)) {
      notice.textContent = "Absensi tidak dapat disimpan. Coba lagi.";
      return;
    }
    resetPhotoSelection();
    notice.textContent = isCheckOutPage ? "Absen keluar berhasil disimpan." : "Absen masuk berhasil disimpan.";
    render();
  });
  render();
}

if (document.querySelector(".petugas-page")) {
  if (sessionStorage.getItem("washupRole") !== "Petugas") window.location.replace(appUrl("login.html"));
}
if (document.querySelector(".petugas-dashboard-page")) setupPetugasDashboard();
if (document.querySelector(".petugas-attendance-page, .petugas-recap-page")) setupPetugasAttendance();

// Dropdown kustom untuk form data master.
// <select> asli tetap ada tetapi disembunyikan, jadi nilai form dan validasi tetap bekerja seperti biasa.
const customSelectTypes = ["services", "shifts", "users"];
const customSelectLabels = { Nonaktif: "Non Aktif" };

function enhanceSelect(select) {
  const wrapper = document.createElement("div");
  wrapper.className = "custom-select";
  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.id = `${select.id}-button`;
  trigger.className = "custom-select-trigger";
  trigger.setAttribute("role", "combobox");
  trigger.setAttribute("aria-haspopup", "listbox");
  if (select.required) trigger.setAttribute("aria-required", "true");
  trigger.setAttribute("aria-expanded", "false");
  const valueText = document.createElement("span");
  valueText.id = `${select.id}-value`;
  trigger.append(valueText);

  const list = document.createElement("ul");
  list.className = "custom-select-list";
  list.id = `${select.id}-list`;
  list.setAttribute("role", "listbox");
  list.tabIndex = -1;
  list.hidden = true;
  trigger.setAttribute("aria-controls", list.id);

  const label = document.querySelector(`label[for="${select.id}"]`);
  if (label) {
    label.id ||= `${select.id}-label`;
    label.htmlFor = trigger.id;
    trigger.setAttribute("aria-labelledby", `${label.id} ${valueText.id}`);
    list.setAttribute("aria-labelledby", label.id);
  }

  const items = [...select.options].map((option, index) => {
    const item = document.createElement("li");
    item.id = `${list.id}-${index}`;
    item.setAttribute("role", "option");
    item.textContent = customSelectLabels[option.value] || option.textContent;
    list.append(item);
    return item;
  });

  let activeIndex = Math.max(0, select.selectedIndex);
  const sync = () => {
    valueText.textContent = items[select.selectedIndex]?.textContent || (items.length ? "" : "Tidak ada pilihan");
    items.forEach((item, index) => item.setAttribute("aria-selected", String(index === select.selectedIndex)));
  };
  const setActive = (index) => {
    if (!items.length) return;
    activeIndex = (index + items.length) % items.length;
    items.forEach((item, itemIndex) => item.classList.toggle("is-active", itemIndex === activeIndex));
    list.setAttribute("aria-activedescendant", items[activeIndex].id);
  };
  const open = () => {
    if (!items.length) return;
    list.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    setActive(Math.max(0, select.selectedIndex));
    list.focus();
  };
  const close = (returnFocus = true) => {
    if (list.hidden) return;
    list.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    if (returnFocus) trigger.focus();
  };
  const choose = (index) => {
    select.selectedIndex = index;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    sync();
    close();
  };

  trigger.addEventListener("click", () => (list.hidden ? open() : close()));
  trigger.addEventListener("keydown", (event) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      open();
    }
  });
  list.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") { event.preventDefault(); setActive(activeIndex + 1); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActive(activeIndex - 1); }
    else if (event.key === "Home") { event.preventDefault(); setActive(0); }
    else if (event.key === "End") { event.preventDefault(); setActive(items.length - 1); }
    else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(activeIndex); }
    else if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(); }
    else if (event.key === "Tab") close(false);
  });
  list.addEventListener("mouseover", (event) => {
    const item = event.target.closest("li");
    if (item) setActive(items.indexOf(item));
  });
  list.addEventListener("click", (event) => {
    const item = event.target.closest("li");
    if (item) choose(items.indexOf(item));
  });
  wrapper.addEventListener("focusout", (event) => {
    if (!wrapper.contains(event.relatedTarget)) close(false);
  });

  select.classList.add("custom-select-native");
  select.tabIndex = -1;
  select.setAttribute("aria-hidden", "true");
  select.after(wrapper);
  wrapper.append(select, trigger, list);
  sync();
}

function normalizePhone(value) {
  return String(value || "").replace(/[\s.-]/g, "");
}

function setupMasterPage() {
  const page = document.querySelector(".master-page[data-master]");
  if (!page) return;

  if (sessionStorage.getItem("washupRole") !== "Admin") {
    window.location.replace(appUrl("login.html"));
    return;
  }

  const type = page.dataset.master;
  const definition = masterDefinitions[type];
  if (!definition) return;

  const tableHead = document.querySelector("#master-table-head");
  const tableBody = document.querySelector("#master-table-body");
  const resultCount = document.querySelector("#master-result-count");
  const emptyState = document.querySelector("#master-empty");
  const searchInput = document.querySelector("#master-search");
  const addButton = document.querySelector("#master-add");
  const dialog = document.querySelector("#master-dialog");
  const detailDialog = document.querySelector("#master-detail-dialog");
  const form = document.querySelector("#master-form");
  const formFields = document.querySelector("#master-form-fields");
  const formTitle = document.querySelector("#master-dialog-title");
  const notice = document.querySelector("#master-dialog-notice");
  const detailContent = document.querySelector("#master-detail-content");
  let editingId = null;

  if (!tableHead || !tableBody || !resultCount || !emptyState || !searchInput || !addButton || !dialog || !detailDialog || !form || !formFields || !notice || !detailContent) return;

  ensureMasterDefaults(type, definition);
  // Validasi ditangani validate() agar pesan selalu tampil di dialog (termasuk untuk dropdown kustom yang <select>-nya tersembunyi).
  if (form) form.noValidate = true;

  const isProtectedRecord = (record) => (type === "users" && String(record.username || "").trim().toLowerCase() === "admin") || (type === "services" && masterDefaults.services.some((item) => item.id === record.id)) || (type === "shifts" && record.id === "shift-pagi");
  // Jam shift ditampilkan dengan titik seperti Figma (08.00); jam selesai 00:00 berarti tengah malam (24.00).
  const formatShiftTime = (key, value) => (key === "end" && value === "00:00" ? "24.00" : String(value).replace(":", "."));
  const valueForDisplay = (key, value) => {
    if (key === "price") return formatCurrency(value);
    if (type === "shifts" && (key === "start" || key === "end") && value) return formatShiftTime(key, value);
    return (customSelectTypes.includes(type) && customSelectLabels[value]) || String(value || "-");
  };
  const createId = () => `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  function getRecords() {
    return readMasterRecords(definition);
  }

  function closeDialog(target) {
    if (target.open) target.close();
  }

  function renderHeaders() {
    tableHead.replaceChildren();
    [...definition.columns, ...(definition.actions === false ? [] : ["actions"])].forEach((column) => {
      const cell = document.createElement("th");
      cell.scope = "col";
      cell.textContent = column === "actions" ? "Aksi" : definition.labels[column];
      tableHead.append(cell);
    });
  }

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const searchColumns = definition.searchColumns || definition.columns;
    const records = getRecords().filter((record) => searchColumns.some((column) => String(record[column] || "").toLowerCase().includes(query)));
    tableBody.replaceChildren();
    records.forEach((record) => {
      const row = document.createElement("tr");
      definition.columns.forEach((column) => {
        const cell = document.createElement("td");
        cell.textContent = valueForDisplay(column, record[column]);
        row.append(cell);
      });
      const actions = document.createElement("td");
      const detailButton = document.createElement("button");
      detailButton.className = "table-action table-action-link table-action-detail";
      detailButton.type = "button";
      detailButton.dataset.action = "detail";
      detailButton.dataset.id = record.id;
      detailButton.textContent = "Detail";
      actions.append(detailButton);
      if (!(type === "users" && isProtectedRecord(record))) {
        const editButton = document.createElement("button");
        editButton.className = "table-action table-action-edit";
        editButton.type = "button";
        editButton.dataset.action = "edit";
        editButton.dataset.id = record.id;
        editButton.textContent = "Edit";
        actions.append(editButton);
        const deleteButton = document.createElement("button");
        deleteButton.className = "table-action table-action-delete";
        deleteButton.type = "button";
        deleteButton.dataset.action = "delete";
        deleteButton.dataset.id = record.id;
        deleteButton.textContent = "Hapus";
        actions.append(deleteButton);
      }
      if (definition.actions !== false) row.append(actions);
      tableBody.append(row);
    });
    resultCount.textContent = `${records.length} data`;
    emptyState.hidden = records.length > 0;
  }

  function renderForm(record = {}) {
    formFields.replaceChildren();
    definition.fields.forEach((field) => {
      const wrapper = document.createElement("div");
      wrapper.className = "form-field";
      const label = document.createElement("label");
      const inputId = `master-field-${field.key}`;
      label.htmlFor = inputId;
      label.textContent = field.label;
      wrapper.append(label);
      const input = document.createElement(field.type === "select" ? "select" : "input");
      input.id = inputId;
      input.dataset.field = field.key;
      input.name = field.key;
      input.type = field.type === "select" ? "text" : field.type;
      input.required = Boolean(field.required);
      if (field.min !== undefined) input.min = String(field.min);
      if (field.step !== undefined) input.step = String(field.step);
      if (field.placeholder) input.placeholder = field.placeholder;
      if (field.type === "select") {
        field.options.forEach((optionValue) => {
          const option = document.createElement("option");
          option.value = optionValue;
          option.textContent = optionValue;
          input.append(option);
        });
      }
      input.value = record[field.key] ?? (field.type === "select" ? (field.options[0] ?? "") : "");
      // Password lama tidak diisikan kembali saat Edit; kosong berarti password tidak diubah.
      if (field.type === "password" && record.id) {
        input.value = "";
        input.required = false;
        input.placeholder = "Kosongkan jika tidak diubah";
      }
      wrapper.append(input);
      formFields.append(wrapper);
    });
    if (customSelectTypes.includes(type)) formFields.querySelectorAll("select").forEach(enhanceSelect);
  }

  function openForm(record = null) {
    editingId = record?.id || null;
    formTitle.textContent = editingId ? `Edit ${definition.title}` : `Tambah ${definition.title}`;
    notice.textContent = "";
    renderForm(record || {});
    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
  }

  function openDetail(record) {
    // Judul dialog Detail mengikuti Figma per halaman; halaman tanpa detailTitle memakai judul di HTML.
    const detailTitle = detailDialog.querySelector(".dialog-heading h2");
    if (detailTitle && definition.detailTitle) detailTitle.textContent = definition.detailTitle;
    detailContent.replaceChildren();
    definition.columns.forEach((column) => {
      const wrapper = document.createElement("div");
      const label = document.createElement("span");
      label.textContent = (definition.detailLabels || definition.labels)[column];
      const value = document.createElement("strong");
      value.textContent = valueForDisplay(column, record[column]);
      wrapper.append(label, value);
      detailContent.append(wrapper);
    });
    if (typeof detailDialog.showModal === "function") detailDialog.showModal(); else detailDialog.setAttribute("open", "");
  }

  function validate(record, records) {
    const requiredField = definition.fields.find((field) => field.required && !(field.type === "password" && editingId) && !String(record[field.key] || "").trim());
    if (requiredField) {
      return `${requiredField.label} wajib diisi.`;
    }
    const invalidPhone = definition.fields.find((field) => field.type === "tel" && record[field.key] && !/^\+?\d{8,15}$/.test(record[field.key]));
    if (invalidPhone) return `${invalidPhone.label} hanya boleh berisi angka (8–15 digit).`;
    if (type === "services" && (!Number.isFinite(Number(record.price)) || Number(record.price) <= 0)) return "Harga harus lebih besar dari 0.";
    if (type === "shifts" && record.end !== "00:00" && record.start >= record.end) return "Jam selesai harus setelah jam mulai.";
    const duplicate = records.some((existing) => existing.id !== editingId && (
      (type === "services" && String(existing.name).trim().toLowerCase() === record.name.toLowerCase() && existing.vehicleType === record.vehicleType) ||
      (type === "shifts" && String(existing.name).trim().toLowerCase() === record.name.toLowerCase()) ||
      (type === "users" && String(existing.username || "").trim().toLowerCase() === record.username.toLowerCase())
    ));
    return duplicate ? "Data duplikat tidak diperbolehkan." : "";
  }

  // Dialog konfirmasi hapus dibuat lewat JS agar halaman master tidak perlu diubah.
  const deleteDialog = document.createElement("dialog");
  deleteDialog.className = "queue-dialog master-delete-dialog";
  deleteDialog.id = "master-delete-dialog";
  deleteDialog.setAttribute("aria-labelledby", "master-delete-title");
  deleteDialog.innerHTML = `
    <div class="dialog-heading">
      <h2 id="master-delete-title"></h2>
      <button class="dialog-close" type="button" data-delete="cancel" aria-label="Tutup konfirmasi hapus">×</button>
    </div>
    <p class="master-delete-message" id="master-delete-message"></p>
    <div class="dialog-actions">
      <button class="master-delete-cancel" type="button" data-delete="cancel">Batal</button>
      <button class="master-delete-confirm" type="button" data-delete="confirm">Hapus</button>
    </div>`;
  document.body.append(deleteDialog);
  const deleteMessage = deleteDialog.querySelector("#master-delete-message");
  const deleteConfirm = deleteDialog.querySelector('[data-delete="confirm"]');
  let deletingId = null;

  function openDeleteDialog(record) {
    const protectedRecord = isProtectedRecord(record);
    deletingId = protectedRecord ? null : record.id;
    deleteDialog.querySelector("#master-delete-title").textContent = `Hapus ${definition.title}`;
    deleteMessage.textContent = protectedRecord
      ? "Data bawaan tidak dapat dihapus. Gunakan status Nonaktif jika tersedia."
      : definition.deleteMessage || `Hapus ${definition.title} ini?`;
    deleteConfirm.hidden = protectedRecord;
    if (typeof deleteDialog.showModal === "function") deleteDialog.showModal(); else deleteDialog.setAttribute("open", "");
  }

  deleteDialog.addEventListener("click", (event) => {
    const action = event.target.closest("[data-delete]")?.dataset.delete;
    if (event.target === deleteDialog || action === "cancel") {
      deletingId = null;
      closeDialog(deleteDialog);
      return;
    }
    if (action === "confirm" && deletingId) {
      saveMasterRecords(definition, getRecords().filter((item) => item.id !== deletingId));
      deletingId = null;
      closeDialog(deleteDialog);
      render();
    }
  });

  addButton.addEventListener("click", () => openForm());
  searchInput.addEventListener("input", render);
  document.querySelector("#master-dialog-close")?.addEventListener("click", () => closeDialog(dialog));
  document.querySelector("#master-dialog-cancel")?.addEventListener("click", () => closeDialog(dialog));
  document.querySelector("#master-detail-close")?.addEventListener("click", () => closeDialog(detailDialog));
  tableBody.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const record = getRecords().find((item) => item.id === button.dataset.id);
    if (!record) return;
    if (button.dataset.action === "detail") openDetail(record);
    if (button.dataset.action === "edit") openForm(record);
    if (button.dataset.action === "delete") openDeleteDialog(record);
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const record = Object.fromEntries(new FormData(form).entries());
    // Rapikan isian: spasi di awal/akhir dibuang, spasi ganda dijadikan satu, nomor telepon tanpa spasi/tanda hubung.
    definition.fields.forEach((field) => {
      if (typeof record[field.key] !== "string" || field.type === "password") return;
      record[field.key] = field.type === "tel" ? normalizePhone(record[field.key]) : record[field.key].replace(/\s+/g, " ").trim();
    });
    if (type === "users" && editingId && !record.password) delete record.password;
    if (type === "users") record.username = record.username.trim().toLowerCase();
    if (type === "services") record.price = Number(record.price);
    const records = getRecords();
    const error = validate(record, records);
    notice.textContent = error;
    if (error) return;
    if (editingId) {
      const current = records.find((item) => item.id === editingId);
      if (type === "users" && isProtectedRecord(current)) return;
      saveMasterRecords(definition, records.map((item) => item.id === editingId ? { ...item, ...record } : item));
    } else {
      saveMasterRecords(definition, [...records, { ...record, id: createId() }]);
    }
    closeDialog(dialog);
    render();
  });
  document.querySelector("#master-logout")?.addEventListener("click", () => {
    sessionStorage.removeItem("washupRole");
    window.location.href = appUrl("login.html");
  });
  renderHeaders();
  render();
}

setupMasterPage();

/* ===== Modul Kasir dari branch Nindya (digabung 5 Nov 2026) ===== */

/* =========================================================
   MODUL HALAMAN TRANSAKSI BARU
   Digabung ke app.js sesuai struktur aset per role WASHUP.
   Hanya berjalan jika #transaction-form ditemukan.
   ========================================================= */
(() => {
  "use strict";

  // Jalankan modul ini hanya pada halaman Transaksi Baru agar app.js aman dipakai bersama.
  const transactionPageForm = document.querySelector("#transaction-form");
  if (!transactionPageForm) return;

  // Halaman transaksi hanya untuk pengguna ber-role Kasir.
  if (sessionStorage.getItem("washupRole") !== "Kasir") {
    window.location.replace(appUrl("login.html"));
    return;
  }
  const form = transactionPageForm;
  const layout = document.querySelector("#transaction-layout");
  const result = document.querySelector("#transaction-result");
  const heading = document.querySelector("#transaction-title");
  const eyebrow = document.querySelector("#transaction-eyebrow");
  const printButton = document.querySelector("#print-receipt-button");
  const noPrintButton = document.querySelector("#no-print-receipt-button");

  const currency = formatCurrency;

  function safeTransactions() {
    try {
      const value = JSON.parse(localStorage.getItem("washupTransactions") || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function formatReceiptDate(value) {
    const date = new Date(value || Date.now());
    const dateLabel = new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(date);
    const timeLabel = new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: "Asia/Jakarta",
    }).format(date);
    return `${dateLabel} · ${timeLabel} WIB`;
  }

  function getLatestTransaction() {
    const transactions = safeTransactions();
    if (!transactions.length) return null;
    return transactions[transactions.length - 1];
  }

  function fillReceipt(transaction) {
    if (!transaction) return;

    const queueDigits = String(transaction.queueNumber || "01").replace(/\D/g, "").padStart(2, "0");
    const setText = (selector, value) => {
      const element = document.querySelector(selector);
      if (element) element.textContent = value == null || value === "" ? "-" : String(value);
    };

    // Beberapa ID result-... dipertahankan agar tetap kompatibel dengan app.js lama.
    setText("#result-transaction-number", transaction.transactionNumber || "-");
    setText("#result-queue-number", queueDigits);
    setText("#result-service-status", transaction.serviceStatus === "Menunggu" ? "Menunggu pencucian" : transaction.serviceStatus || "Menunggu pencucian");
    setText("#result-payment-status", transaction.paymentStatus || "Belum Dibayar");
    setText("#result-customer", transaction.customerName || "-");
    setText("#result-vehicle", transaction.vehicleType || "-");
    setText("#result-service", transaction.service || "-");
    setText("#result-price", currency(transaction.price));
    setText("#receipt-date", formatReceiptDate(transaction.createdAt));
    setText("#receipt-cashier", "Kasir");
    setText("#receipt-phone", transaction.customerPhone || "-");
    setText("#receipt-plate", transaction.plateNumber || "-");
    setText("#receipt-service-price", currency(transaction.price));
    setText("#receipt-service-detail", `1 × ${currency(transaction.price)}`);
    setText("#receipt-success-message", `Nomor antrean ${queueDigits} sudah dibuat. Transaksi masuk ke antrean dan belum dibayar.`);

    if (layout) layout.hidden = true;
    if (result) result.hidden = false;
    if (eyebrow) eyebrow.textContent = "RINGKASAN PENGERJAAN";
    if (heading) heading.textContent = "Cetak Struk Transaksi";
  }

  // app.js menangani validasi dan penyimpanan transaksi terlebih dahulu.
  // Listener ini berjalan sesudahnya untuk menampilkan rincian struk.
  form?.addEventListener("submit", () => {
    window.setTimeout(() => {
      if (!result || result.hidden) return;
      fillReceipt(getLatestTransaction());
      result.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  });

  printButton?.addEventListener("click", () => window.print());
  noPrintButton?.addEventListener("click", () => {
    window.location.href = "dashboard-kasir.html";
  });

})();

/* =========================================================
   MODUL DASHBOARD KASIR — PAGINATION
   Seluruh JavaScript tetap berada di app.js sesuai struktur WASHUP.
   ========================================================= */
(() => {
  "use strict";

  // Modul ini hanya berjalan di Dashboard Kasir, bukan halaman Transaksi Baru.
  if (!document.body.classList.contains("kasir-dashboard-page") ||
      document.body.classList.contains("kasir-transaction-page") ||
      document.body.classList.contains("kasir-payment-page")) return;

  // Paginasi seragam: Sebelumnya, nomor halaman, Selanjutnya (komponen WashupPager).
  const tableBody = document.querySelector("#queue-table-body");
  const pager = document.querySelector("#queue-pager");

  if (!tableBody || !pager) return;

  let currentPage = 1;

  function getDataRows() {
    return Array.from(tableBody.querySelectorAll("tr"))
      .filter((row) => !row.classList.contains("queue-empty-row"));
  }

  function ensureEmptyState() {
    let emptyRow = tableBody.querySelector(".queue-empty-row");
    if (getDataRows().length === 0) {
      if (!emptyRow) {
        emptyRow = document.createElement("tr");
        emptyRow.className = "queue-empty-row";
        const cell = document.createElement("td");
        cell.colSpan = 5;

        const emptyState = document.createElement("div");
        emptyState.className = "queue-empty-state";
        const iconWrap = document.createElement("div");
        iconWrap.className = "queue-empty-icon wu-empty-icon";
        iconWrap.setAttribute("aria-hidden", "true");
        iconWrap.innerHTML = window.renderIcon("inbox", "wu-icon");

        const title = document.createElement("h3");
        title.className = "queue-empty-title";
        title.textContent = "Belum ada antrean.";
        const description = document.createElement("p");
        description.className = "queue-empty-description";
        description.textContent = "Transaksi Kasir akan tampil setelah dibuat.";
        emptyState.append(iconWrap, title, description);
        cell.appendChild(emptyState);
        emptyRow.appendChild(cell);
        tableBody.appendChild(emptyRow);
      }
    } else if (emptyRow) {
      emptyRow.remove();
    }
  }

  function renderPagination() {
    const rows = getDataRows();
    ensureEmptyState();

    const pageSize = TABLE_PAGE_SIZE;
    const totalRows = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
    currentPage = Math.min(Math.max(currentPage, 1), totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalRows);

    rows.forEach((row, index) => {
      row.hidden = index < startIndex || index >= endIndex;
    });

    window.WashupPager.renderPager(pager, {
      page: currentPage,
      total: totalPages,
      onChange: (target) => { currentPage = target; renderPagination(); },
    });
  }

  // Menjaga pagination sinkron ketika app.js menambah atau mengubah baris antrean.
  const tableObserver = new MutationObserver(() => renderPagination());
  tableObserver.observe(tableBody, { childList: true });
  renderPagination();
})();

/* =========================================================
   MODUL PENGELUARAN KASIR
   Fungsi halaman Pengeluaran digabung di sini agar cukup memuat satu app.js.
   Mendukung filter tahun/bulan, jumlah barang, edit, hapus, dan bukti nota.
   ========================================================= */
(() => {
  "use strict";

  const form = document.querySelector("#expense-form");
  const dialog = document.querySelector("#expense-dialog");
  if (!form || !dialog) return;

  const storageKey = "washupExpenses";
  const tableBody = document.querySelector("#expense-table-body");
  const emptyState = document.querySelector("#expense-empty");
  const todayTotal = document.querySelector("#expense-today-total");
  const monthTotal = document.querySelector("#expense-month-total");
  const dateInput = document.querySelector("#expense-date");
  const descriptionInput = document.querySelector("#expense-description");
  const quantityInput = document.querySelector("#expense-quantity");
  const amountInput = document.querySelector("#expense-amount");
  const proofInput = document.querySelector("#expense-proof");
  const currentProofNote = document.querySelector("#expense-current-proof");
  const message = document.querySelector("#expense-form-message");
  const dialogTitle = document.querySelector("#expense-dialog-title");
  const submitButton = form.querySelector('button[type="submit"]');
  const yearFilter = document.querySelector("#expense-year-filter");
  const monthFilter = document.querySelector("#expense-month-filter");
  const monthLabel = document.querySelector("#expense-month-label");
  const emptyTitle = document.querySelector("#expense-empty-title");
  const emptyMessage = document.querySelector("#expense-empty-message");

  if (!tableBody || !emptyState || !todayTotal || !monthTotal ||
      !dateInput || !descriptionInput || !quantityInput || !amountInput ||
      !proofInput || !message) return;

  let editingExpenseId = null;

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  const todayKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  };
  const money = formatCurrency;
  const quantityLabel = (value) => {
    if (value === undefined || value === null || value === "") return "—";
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed.toLocaleString("id-ID") : "—";
  };

  function readExpenses() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }

  function saveExpenses(records) {
    localStorage.setItem(storageKey, JSON.stringify(records));
  }

  function fileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(String(reader.result || "")), { once: true });
      reader.addEventListener("error", () => reject(new Error("Bukti nota tidak dapat dibaca.")), { once: true });
      reader.readAsDataURL(file);
    });
  }

  function createCell(text) {
    const cell = document.createElement("td");
    cell.textContent = text;
    return cell;
  }

  function formatDate(dateValue) {
    const date = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateValue || "-";
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  }

  function getValidYear(dateValue) {
    const match = /^(\d{4})-\d{2}-\d{2}$/.exec(String(dateValue || ""));
    return match ? Number(match[1]) : null;
  }

  function populateYearFilter(records) {
    if (!yearFilter) return;
    const currentYear = String(new Date().getFullYear());
    const previousSelection = yearFilter.value;
    const years = new Set([currentYear]);

    records.forEach((record) => {
      const year = getValidYear(record.date);
      if (year) years.add(String(year));
    });

    const sortedYears = [...years].sort((a, b) => Number(b) - Number(a));
    yearFilter.replaceChildren();
    sortedYears.forEach((year) => {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearFilter.append(option);
    });

    yearFilter.value = sortedYears.includes(previousSelection)
      ? previousSelection
      : currentYear;
  }

  function getSelectedPeriod() {
    const year = yearFilter?.value || String(new Date().getFullYear());
    const month = monthFilter?.value || "";
    return { year, month };
  }

  function makeActionButton(action, label, className, record) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `expense-action-button ${className}`;
    button.textContent = label;
    button.dataset.expenseAction = action;
    button.dataset.expenseId = String(record.id || "");
    button.setAttribute("aria-label", `${label} pengeluaran ${record.description || ""}`.trim());
    button.title = `${label} pengeluaran`;
    return button;
  }

  function render() {
    const allRecords = readExpenses().sort((a, b) =>
      String(b.date).localeCompare(String(a.date)) ||
      Number(b.createdAt || 0) - Number(a.createdAt || 0)
    );

    populateYearFilter(allRecords);
    const { year, month } = getSelectedPeriod();
    const periodRecords = allRecords.filter((record) => {
      const date = String(record.date || "");
      const matchesYear = date.startsWith(`${year}-`);
      const matchesMonth = !month || date.startsWith(`${year}-${month}-`);
      return matchesYear && matchesMonth;
    });

    tableBody.replaceChildren();
    periodRecords.forEach((record) => {
      const row = document.createElement("tr");
      row.append(createCell(formatDate(record.date)));
      row.append(createCell(record.description || "-"));
      row.append(createCell(quantityLabel(record.quantity)));
      row.append(createCell(money(record.amount)));

      const proofCell = document.createElement("td");
      if (record.proofData) {
        const link = document.createElement("a");
        link.className = "expense-proof-link";
        link.href = record.proofData;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Lihat Nota";
        link.setAttribute("aria-label", `Lihat nota ${record.proofName || "pengeluaran"}`);
        proofCell.append(link);
      } else {
        proofCell.textContent = "—";
      }
      row.append(proofCell);

      const actionCell = document.createElement("td");
      const actionGroup = document.createElement("div");
      actionGroup.className = "expense-actions";
      actionGroup.append(
        makeActionButton("edit", "Edit", "expense-action-edit", record),
        makeActionButton("delete", "Hapus", "expense-action-delete", record)
      );
      actionCell.append(actionGroup);
      row.append(actionCell);

      tableBody.append(row);
    });

    emptyState.hidden = periodRecords.length > 0;
    if (emptyTitle) {
      emptyTitle.textContent = allRecords.length
        ? "Tidak ada pengeluaran pada periode ini."
        : "Belum ada Pengeluaran.";
    }
    if (emptyMessage) {
      emptyMessage.textContent = allRecords.length
        ? "Pilih tahun atau bulan lain untuk melihat data pengeluaran."
        : "Data pengeluaran akan muncul setelah input pengeluaran dilakukan.";
    }

    const today = todayKey();
    const todayValue = allRecords
      .filter((record) => record.date === today)
      .reduce((sum, record) => sum + Number(record.amount || 0), 0);
    const periodValue = periodRecords
      .reduce((sum, record) => sum + Number(record.amount || 0), 0);

    todayTotal.textContent = money(todayValue);
    monthTotal.textContent = money(periodValue);

    if (monthLabel) {
      monthLabel.textContent = month
        ? `Pengeluaran ${monthNames[Number(month) - 1]} ${year}`
        : `Pengeluaran Tahun ${year}`;
    }
  }

  function setDialogMode(mode) {
    const isEditing = mode === "edit";
    if (dialogTitle) dialogTitle.textContent = isEditing ? "Edit Pengeluaran" : "Tambahkan Pengeluaran";
    if (submitButton) submitButton.textContent = isEditing ? "Simpan Perubahan" : "Simpan Pengeluaran";
  }

  function openAddDialog() {
    editingExpenseId = null;
    form.reset();
    setDialogMode("add");
    message.textContent = "";
    if (currentProofNote) {
      currentProofNote.hidden = true;
      currentProofNote.textContent = "";
    }
    dateInput.value = todayKey();
    quantityInput.value = "1";
    if (typeof dialog.showModal === "function") dialog.showModal();
  }

  function openEditDialog(record) {
    editingExpenseId = String(record.id || "");
    form.reset();
    setDialogMode("edit");
    message.textContent = "";
    dateInput.value = record.date || "";
    descriptionInput.value = record.description || "";
    // Catatan lama yang belum memiliki field jumlah tetap bisa diedit:
    // pengguna diminta mengisi jumlahnya sebelum menyimpan perubahan.
    quantityInput.value = record.quantity == null ? "" : String(record.quantity);
    amountInput.value = String(record.amount ?? "");
    if (currentProofNote) {
      currentProofNote.hidden = !record.proofData;
      currentProofNote.textContent = record.proofData
        ? `Bukti saat ini: ${record.proofName || "Nota terlampir"}. Unggah file baru hanya jika ingin menggantinya.`
        : "";
    }
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeDialog() {
    if (dialog.open && typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
    editingExpenseId = null;
    message.textContent = "";
    form.reset();
    setDialogMode("add");
    if (currentProofNote) {
      currentProofNote.hidden = true;
      currentProofNote.textContent = "";
    }
  }

  yearFilter?.addEventListener("change", render);
  monthFilter?.addEventListener("change", render);
  document.querySelector("#expense-add-button")?.addEventListener("click", openAddDialog);
  document.querySelector("#expense-dialog-close")?.addEventListener("click", closeDialog);
  document.querySelector("#expense-cancel-button")?.addEventListener("click", closeDialog);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });

  tableBody.addEventListener("click", (event) => {
    const button = event.target.closest?.("button[data-expense-action]");
    if (!button || !tableBody.contains(button)) return;

    const expenseId = button.dataset.expenseId;
    const record = readExpenses().find((item) => String(item.id || "") === expenseId);
    if (!record) {
      window.alert("Data pengeluaran tidak ditemukan. Muat ulang halaman lalu coba kembali.");
      render();
      return;
    }

    if (button.dataset.expenseAction === "edit") {
      openEditDialog(record);
      return;
    }

    if (button.dataset.expenseAction === "delete") {
      const confirmed = window.confirm(
        `Hapus catatan pengeluaran "${record.description || "Tanpa keterangan"}" sebesar ${money(record.amount)}? Tindakan ini tidak dapat dibatalkan.`
      );
      if (!confirmed) return;

      const records = readExpenses();
      const remaining = records.filter((item) => String(item.id || "") !== expenseId);
      try {
        saveExpenses(remaining);
        render();
      } catch {
        window.alert("Pengeluaran tidak dapat dihapus. Periksa penyimpanan browser lalu coba lagi.");
      }
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.textContent = "";

    const formData = new FormData(form);
    const date = String(formData.get("date") || "");
    const description = String(formData.get("description") || "").trim();
    const quantity = Number(formData.get("quantity"));
    const amount = Number(formData.get("amount"));
    const proofFile = proofInput.files?.[0] || null;

    if (!date || !description || !Number.isSafeInteger(quantity) || quantity <= 0 ||
        !Number.isFinite(amount) || amount <= 0) {
      message.textContent = "Lengkapi tanggal, keterangan, jumlah barang, dan nominal dengan benar.";
      return;
    }
    if (proofFile && proofFile.size > 1024 * 1024) {
      message.textContent = "Ukuran bukti nota maksimal 1 MB.";
      return;
    }

    try {
      const proofData = proofFile ? await fileAsDataUrl(proofFile) : "";
      const records = readExpenses();
      const existingIndex = editingExpenseId
        ? records.findIndex((item) => String(item.id || "") === editingExpenseId)
        : -1;

      if (editingExpenseId && existingIndex < 0) {
        message.textContent = "Data pengeluaran tidak ditemukan. Tutup formulir lalu coba kembali.";
        return;
      }

      const existing = existingIndex >= 0 ? records[existingIndex] : null;
      const updatedRecord = {
        ...(existing || {}),
        id: existing?.id || `expense-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        date,
        description,
        quantity,
        amount,
        proofName: proofFile ? proofFile.name : (existing?.proofName || ""),
        proofData: proofFile ? proofData : (existing?.proofData || ""),
        createdAt: existing?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      if (existingIndex >= 0) records[existingIndex] = updatedRecord;
      else records.push(updatedRecord);

      saveExpenses(records);
      // Arahkan filter ke tahun/bulan dari catatan yang baru dibuat atau diedit.
      populateYearFilter(records);
      if (yearFilter) yearFilter.value = date.slice(0, 4);
      if (monthFilter) monthFilter.value = date.slice(5, 7);
      render();
      closeDialog();
    } catch (error) {
      message.textContent = error instanceof Error
        ? error.message
        : "Pengeluaran tidak dapat disimpan. Coba lagi.";
    }
  });

  window.addEventListener("storage", (event) => {
    if (event.key === storageKey) render();
  });

  render();
})();


function setupProfileEditor() {
  const trigger = document.querySelector("#profile-edit-trigger");
  const dialog = document.querySelector("#profile-edit-dialog");
  const form = document.querySelector("#profile-edit-form");
  if (!trigger || !dialog || !form) return;

  const usernameInput = document.querySelector("#profile-username");
  const usernameNote = document.querySelector("#profile-username-note");
  const currentPasswordInput = document.querySelector("#profile-current-password");
  const newPasswordInput = document.querySelector("#profile-password");
  const displayUsername = document.querySelector("#profile-display-username");
  const displayRole = document.querySelector("#profile-display-role");
  const message = document.querySelector("#profile-form-message");
  const saveButton = document.querySelector("#profile-edit-save");
  const closeButton = document.querySelector("#profile-edit-close");
  const cancelButton = document.querySelector("#profile-edit-cancel");
  let editingAccountId = null;
  let protectedAdmin = false;

  const normalized = (value) => String(value || "").trim().toLowerCase();
  const activeRole = () => sessionStorage.getItem("washupRole") || document.body.dataset.role || "Pengguna";

  function currentAccount(records = getUserAccounts()) {
    const username = normalized(sessionStorage.getItem("washupUsername"));
    const role = activeRole();
    return records.find((account) =>
      normalized(account.username) === username && account.role === role
    ) || records.find((account) => account.protected && account.role === role) || null;
  }

  function setHeaderProfile(account) {
    const role = sessionStorage.getItem("washupRole") || account?.role || document.body.dataset.role || "Pengguna";
    const username = sessionStorage.getItem("washupUsername") || account?.username || role;
    if (displayUsername) displayUsername.textContent = username;
    if (displayRole) displayRole.textContent = `Role: ${role}`;
    trigger.setAttribute("aria-label", `Edit profil ${username || "pengguna"}`);
    trigger.title = `Edit profil ${username || "pengguna"}`;
  }

  function positionPopover() {
    if (!dialog.open) return;

    const triggerRect = trigger.getBoundingClientRect();
    const viewportPadding = 12;
    const popoverWidth = Math.min(340, window.innerWidth - viewportPadding * 2);
    const measuredWidth = dialog.getBoundingClientRect().width || popoverWidth;
    const width = Math.min(measuredWidth, window.innerWidth - viewportPadding * 2);
    const preferredLeft = triggerRect.right - width + 14;
    const left = Math.max(
      viewportPadding,
      Math.min(preferredLeft, window.innerWidth - width - viewportPadding)
    );
    const top = triggerRect.bottom + 8;
    const availableHeight = Math.max(220, window.innerHeight - top - viewportPadding);
    const maxHeight = Math.min(Math.round(window.innerHeight * 0.78), availableHeight);

    dialog.style.setProperty("--profile-popover-left", `${Math.round(left)}px`);
    dialog.style.setProperty("--profile-popover-top", `${Math.round(top)}px`);
    dialog.style.setProperty("--profile-popover-max-height", `${Math.round(maxHeight)}px`);
  }

  function resetPasswordVisibility() {
    dialog.querySelectorAll("[data-password-toggle]").forEach((button) => {
      const target = document.getElementById(button.dataset.passwordToggle);
      if (target) target.type = "password";
      button.setAttribute("aria-pressed", "false");
      const label = target?.id === "profile-current-password" ? "password lama" : "password baru";
      button.setAttribute("aria-label", `Tampilkan ${label}`);
    });
  }

  function showPopover() {
    if (typeof dialog.show === "function") {
      if (!dialog.open) dialog.show();
    } else {
      dialog.setAttribute("open", "");
    }
    trigger.setAttribute("aria-expanded", "true");
    positionPopover();
  }

  function openDialog() {
    const account = currentAccount();
    if (!account) {
      editingAccountId = null;
      protectedAdmin = false;
      message.textContent = "Akun tidak ditemukan. Silakan keluar dan masuk kembali.";
      showPopover();
      return;
    }

    editingAccountId = account.id;
    protectedAdmin = normalized(account.username) === "admin";
    usernameInput.value = account.username || "";
    usernameInput.disabled = protectedAdmin;
    if (usernameNote) usernameNote.hidden = !protectedAdmin;
    currentPasswordInput.value = String(account.password || "");
    newPasswordInput.value = "";
    message.textContent = "";
    saveButton.disabled = false;
    resetPasswordVisibility();

    showPopover();
    (protectedAdmin ? newPasswordInput : usernameInput).focus({ preventScroll: true });
  }

  function closeDialog({ restoreFocus = false } = {}) {
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else dialog.removeAttribute("open");

    form.reset();
    editingAccountId = null;
    protectedAdmin = false;
    usernameInput.disabled = false;
    if (usernameNote) usernameNote.hidden = true;
    message.textContent = "";
    saveButton.disabled = false;
    resetPasswordVisibility();
    trigger.setAttribute("aria-expanded", "false");
    if (restoreFocus) trigger.focus();
  }

  trigger.addEventListener("click", () => {
    if (dialog.open) closeDialog();
    else openDialog();
  });

  dialog.querySelectorAll("[data-password-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.passwordToggle);
      if (!target) return;

      const shouldShow = target.type === "password";
      target.type = shouldShow ? "text" : "password";
      const label = target.id === "profile-current-password" ? "password lama" : "password baru";
      button.setAttribute("aria-pressed", String(shouldShow));
      button.setAttribute("aria-label", `${shouldShow ? "Sembunyikan" : "Tampilkan"} ${label}`);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const username = normalized(usernameInput.value);
    const newPassword = String(newPasswordInput.value || "");

    if (!protectedAdmin && !username) {
      message.textContent = "Username wajib diisi.";
      usernameInput.focus();
      return;
    }
    if (!protectedAdmin && username.length > 40) {
      message.textContent = "Username maksimal 40 karakter.";
      usernameInput.focus();
      return;
    }
    if (newPassword && newPassword.length < 6) {
      message.textContent = "Password baru minimal 6 karakter.";
      newPasswordInput.focus();
      return;
    }

    try {
      const records = getUserAccounts();
      const accountIndex = records.findIndex((account) => account.id === editingAccountId);
      if (accountIndex < 0) {
        message.textContent = "Akun tidak ditemukan. Tutup formulir lalu coba kembali.";
        return;
      }

      const current = records[accountIndex];
      const nextUsername = normalized(current.username) === "admin" ? current.username : username;
      const duplicate = records.some((account, index) =>
        index !== accountIndex && normalized(account.username) === nextUsername
      );
      if (duplicate) {
        message.textContent = "Username sudah digunakan akun lain. Gunakan username yang berbeda.";
        usernameInput.focus();
        return;
      }

      const updated = {
        ...current,
        username: nextUsername,
        password: newPassword || current.password,
        updatedAt: Date.now(),
      };

      delete updated.profilePhoto;
      records[accountIndex] = updated;
      saveMasterRecords(masterDefinitions.users, records);
      sessionStorage.setItem("washupUsername", nextUsername);
      setHeaderProfile(updated);
      closeDialog();
    } catch (error) {
      message.textContent = error instanceof Error
        ? error.message
        : "Profil tidak dapat disimpan. Periksa penyimpanan browser lalu coba kembali.";
    }
  });

  closeButton?.addEventListener("click", () => closeDialog({ restoreFocus: true }));
  cancelButton?.addEventListener("click", () => closeDialog({ restoreFocus: true }));

  document.addEventListener("pointerdown", (event) => {
    if (!dialog.open) return;
    if (!dialog.contains(event.target) && !trigger.contains(event.target)) closeDialog();
  });

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDialog({ restoreFocus: true });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dialog.open) {
      event.preventDefault();
      closeDialog({ restoreFocus: true });
    }
  });

  window.addEventListener("resize", positionPopover);
  window.addEventListener("scroll", positionPopover, true);
  setHeaderProfile(currentAccount());
}

setupProfileEditor();

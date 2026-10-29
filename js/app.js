// Menentukan jalur dari folder utama proyek, termasuk saat halaman berada di pages/{role}/.
const appRoot = window.location.pathname.includes("/pages/") ? "../../" : "";
function appUrl(path) {
  return `${appRoot}${path}`;
}

// Semua tombol logout (id berakhiran "logout", serta #logout-button) juga menghapus username sesi, bukan hanya role.
document.addEventListener("click", (event) => {
  if (event.target.closest('[id$="logout"], #logout-button')) sessionStorage.removeItem("washupUsername");
}, true);

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

const accounts = {
  admin: { password: "admin123", role: "Admin" },
  kasir: { password: "kasir123", role: "Kasir" },
  petugas: { password: "petugas123", role: "Petugas" },
  owner: { password: "owner123", role: "Owner" },
};

const transactionStorageKey = "washupTransactions";
const attendanceStorageKey = "washupPetugasAttendance";
const baseDashboardData = {
  vehicles: 45,
  transactions: 38,
  queue: 7,
  revenue: 2850000,
};

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
  customers: {
    key: "washupCustomers",
    title: "Data Pelanggan",
    fields: [
      { key: "name", label: "Nama pelanggan", type: "text", required: true },
      { key: "phone", label: "Nomor telepon", type: "tel", required: true },
      { key: "address", label: "Alamat", type: "text", required: false },
    ],
    columns: ["name", "phone", "address", "status"],
    labels: { name: "Nama", phone: "Telepon", address: "Alamat", status: "Status" },
    detailLabels: { name: "Nama", phone: "Nomor Telepon", address: "Alamat", status: "Status" },
    detailTitle: "Detail Data Pelanggan",
  },
  vehicles: {
    key: "washupVehicles",
    title: "Data Kendaraan",
    fields: [
      { key: "plateNumber", label: "Nomor plat", type: "text", required: true },
      { key: "vehicleType", label: "Jenis kendaraan", type: "select", options: ["Mobil", "Motor"], required: true },
      { key: "customerName", label: "Nama pelanggan", type: "text", required: true },
      { key: "status", label: "Status", type: "select", options: ["Aktif", "Nonaktif"], required: true },
    ],
    columns: ["plateNumber", "vehicleType", "customerName", "status"],
    labels: { plateNumber: "Plat", vehicleType: "Jenis", customerName: "Pelanggan", status: "Status" },
  },
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
  employees: {
    key: "washupEmployees",
    title: "Data Karyawan",
    fields: [
      { key: "name", label: "Nama karyawan", type: "text", required: true },
      { key: "position", label: "Jabatan", type: "text", required: true },
      { key: "phone", label: "Nomor telepon", type: "tel", required: true },
      { key: "status", label: "Status", type: "select", options: ["Aktif", "Nonaktif"], required: true },
    ],
    columns: ["name", "position", "phone", "status"],
    labels: { name: "Nama", position: "Jabatan", phone: "Telepon", status: "Status" },
    detailLabels: { name: "Nama", position: "Jabatan", phone: "Nomor Telepon", status: "Status" },
    detailTitle: "Detail Karyawan",
    deleteMessage: "Perhatian apakah anda yakin ingin menghapus data ini?",
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
  // Absensi & Lembur yang dicatat Admin (Figma: Data Absensi). Terpisah dari absen foto Petugas (washupPetugasAttendance).
  attendance: {
    key: "washupAttendanceRecords",
    title: "Data Absensi",
    actions: false,
    searchColumns: ["employeeName"],
    fields: [
      { key: "employeeName", label: "Nama karyawan", type: "text", required: true },
      { key: "date", label: "Tanggal", type: "date", required: true },
      { key: "presence", label: "Kehadiran", type: "select", options: ["Masuk", "Izin", "Tanpa Keterangan"], required: true },
      // Pilihan shift diambil dari Data Shift yang berstatus Aktif.
      { key: "shift", label: "Shift", type: "select", get options() { return getActiveShiftNames(); }, required: true },
      { key: "overtimeHours", label: "Lembur", type: "number", min: 0, step: 0.5, placeholder: "-- Jam", required: false },
      { key: "incentive", label: "Insentif", type: "number", min: 0, step: 1000, placeholder: "Rp", required: false },
    ],
    columns: ["employeeName", "date", "presence", "shift", "overtimeHours", "incentive"],
    labels: { employeeName: "Karyawan", date: "Tanggal", presence: "Kehadiran", shift: "Shift", overtimeHours: "Lembur", incentive: "Insentif" },
  },
};

function getActiveShiftNames() {
  const names = ensureMasterDefaults("shifts", masterDefinitions.shifts)
    .filter((shift) => shift.status === "Aktif" && shift.name)
    .map((shift) => shift.name);
  return names;
}

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
  users: Object.entries(accounts).map(([username, account]) => ({ id: `user-${username}`, username, password: account.password, role: account.role, status: "Aktif", protected: true })),
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
  const existingKeys = new Set(records.map((record) => type === "users" ? record.username : record.id));
  const missing = defaults.filter((record) => !existingKeys.has(type === "users" ? record.username : record.id));
  if (missing.length) {
    records.push(...missing.map((record) => ({ ...record })));
    saveMasterRecords(definition, records);
  }
  return records;
}

function getUserAccounts() {
  return ensureMasterDefaults("users", masterDefinitions.users);
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
      serviceStatus: transaction.serviceStatus || "Menunggu",
      paymentStatus: transaction.paymentStatus || "Belum Dibayar",
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

function formatCurrency(value) {
  return `Rp ${Number(value).toLocaleString("id-ID")}`;
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
    passwordToggle.textContent = shouldShowPassword ? "Sembunyikan" : "Lihat";
    passwordToggle.setAttribute("aria-label", `${shouldShowPassword ? "Sembunyikan" : "Tampilkan"} password`);
    passwordToggle.setAttribute("aria-pressed", String(shouldShowPassword));
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
const dashboardNotice = document.querySelector("#dashboard-notice");
const placeholderLinks = document.querySelectorAll("[data-placeholder-link]");
const transactionLogout = document.querySelector("#transaction-logout");

if (document.querySelector(".dashboard-page")) {
  const role = sessionStorage.getItem("washupRole");

  if (role !== "Kasir") {
    window.location.replace(appUrl(role ? "role.html" : "login.html"));
  }
}

if (document.querySelector(".transaction-page") && sessionStorage.getItem("washupRole") !== "Kasir") {
  window.location.replace(appUrl("login.html"));
}

if (document.querySelector(".payment-page") && sessionStorage.getItem("washupRole") !== "Kasir") {
  window.location.replace(appUrl("login.html"));
}

if (document.querySelector(".history-page") && sessionStorage.getItem("washupRole") !== "Kasir") {
  window.location.replace(appUrl("login.html"));
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

if (document.querySelector(".petugas-dashboard-page") && sessionStorage.getItem("washupRole") !== "Petugas") {
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

placeholderLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    if (dashboardNotice) {
      dashboardNotice.textContent = "Riwayat Transaksi akan tersedia pada tahap berikutnya.";
    }
  });
});

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
    vehicles: baseDashboardData.vehicles + transactions.length,
    transactions: baseDashboardData.transactions + transactions.length,
    queue: activeQueue.length,
    revenue: baseDashboardData.revenue + transactions.filter((transaction) => transaction.paymentStatus === "Lunas").reduce((total, transaction) => total + Number(transaction.price || 0), 0),
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
  const activeQueueCount = document.querySelector("#active-queue-count");
  const dialog = document.querySelector("#queue-dialog");
  const dialogClose = document.querySelector("#dialog-close");
  const updateStatusButton = document.querySelector("#update-status");
  const detailStatus = document.querySelector("#detail-status");
  const dialogNotice = document.querySelector("#dialog-notice");
  const queueLogout = document.querySelector("#queue-logout");

  if (!queueBody || !searchInput || !filterInput || !queueEmpty || !queueResultCount || !activeQueueCount) {
    return;
  }

  let selectedTransactionId = null;

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
    activeQueueCount.textContent = `${activeTransactions.length} kendaraan`;
    queueResultCount.textContent = `${transactions.length} data`;
    queueBody.replaceChildren();
    queueEmpty.hidden = transactions.length > 0;

    transactions.forEach((transaction) => {
      const row = document.createElement("tr");
      [transaction.queueNumber, transaction.plateNumber, transaction.customerName, transaction.vehicleType, transaction.service].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      });

      const serviceStatusCell = document.createElement("td");
      serviceStatusCell.append(makeStatusBadge(transaction.serviceStatus));
      row.append(serviceStatusCell);
      const paymentStatusCell = document.createElement("td");
      paymentStatusCell.append(makeStatusBadge(transaction.paymentStatus));
      row.append(paymentStatusCell);
      const actionCell = document.createElement("td");
      const detailButton = document.createElement("button");
      detailButton.className = "table-action";
      detailButton.type = "button";
      detailButton.textContent = "Detail";
      detailButton.addEventListener("click", () => openDetail(transaction));
      actionCell.append(detailButton);
      row.append(actionCell);
      queueBody.append(row);
    });
  }

  function openDetail(transaction) {
    selectedTransactionId = transaction.id;
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

  function closeDetail() {
    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
    selectedTransactionId = null;
  }

  searchInput.addEventListener("input", renderQueuePage);
  filterInput.addEventListener("change", renderQueuePage);
  dialogClose?.addEventListener("click", closeDetail);
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) closeDetail();
  });
  updateStatusButton?.addEventListener("click", () => {
    const transactions = getTransactions();
    const transaction = transactions.find((item) => item.id === selectedTransactionId);
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
  const dialog = document.querySelector("#history-dialog");

  if (!body || !search || !serviceFilter || !paymentFilter || !dateFilter || !resultCount || !empty || !emptyTitle || !emptyMessage || !dialog) {
    return;
  }

  const formatDateTime = (createdAt) => {
    const date = new Date(createdAt);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
  };
  const makeStatusBadge = (status, type) => {
    const badge = document.createElement("span");
    const isDone = type === "payment" ? status === "Lunas" : status === "Selesai";
    badge.className = `status-badge ${isDone ? "status-done" : status === "Sedang Dicuci" ? "status-washing" : "status-waiting"}`;
    badge.textContent = status || (type === "payment" ? "Belum Dibayar" : "Menunggu");
    return badge;
  };
  const closeDetail = () => {
    if (typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open");
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
    Object.entries(details).forEach(([id, value]) => { document.querySelector(`#${id}`).textContent = value || "-"; });
    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
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
  const render = () => {
    const allTransactions = getTransactions();
    const transactions = filteredTransactions();
    resultCount.textContent = `${transactions.length} data`;
    empty.hidden = transactions.length > 0;
    emptyTitle.textContent = allTransactions.length ? "Transaksi tidak ditemukan." : "Belum ada riwayat transaksi.";
    emptyMessage.textContent = allTransactions.length ? "Ubah pencarian atau filter untuk melihat transaksi lain." : "Transaksi yang dibuat Kasir akan tampil di sini.";
    body.replaceChildren();
    transactions.forEach((transaction) => {
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
      const detailButton = document.createElement("button");
      detailButton.className = "table-action";
      detailButton.type = "button";
      detailButton.textContent = "Detail";
      detailButton.addEventListener("click", () => openDetail(transaction));
      actionCell.append(detailButton);
      row.append(actionCell);
      body.append(row);
    });
  };

  search.addEventListener("input", render);
  serviceFilter.addEventListener("change", render);
  paymentFilter.addEventListener("change", render);
  dateFilter.addEventListener("change", render);
  document.querySelector("#history-dialog-close")?.addEventListener("click", closeDetail);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) closeDetail(); });
  document.querySelector("#history-logout")?.addEventListener("click", () => { sessionStorage.removeItem("washupRole"); window.location.href = appUrl("login.html"); });
  render();
}

if (document.querySelector(".history-page")) setupTransactionHistory();

function setupPaymentPage() {
  const body = document.querySelector("#payment-table-body");
  const empty = document.querySelector("#payment-empty");
  const resultCount = document.querySelector("#payment-result-count");
  const readyCount = document.querySelector("#payment-ready-count");
  const notice = document.querySelector("#payment-notice");
  const dialog = document.querySelector("#payment-dialog");
  const dialogNotice = document.querySelector("#payment-dialog-notice");
  const paymentMethod = document.querySelector("#payment-method");
  const confirmButton = document.querySelector("#confirm-payment");

  if (!body || !empty || !resultCount || !readyCount || !notice || !dialog || !dialogNotice || !paymentMethod || !confirmButton) {
    return;
  }

  let selectedTransactionId = null;

  const makePaymentBadge = (paymentStatus) => {
    const badge = document.createElement("span");
    badge.className = `status-badge ${paymentStatus === "Lunas" ? "status-done" : "status-waiting"}`;
    badge.textContent = paymentStatus || "Belum Dibayar";
    return badge;
  };

  const makeServiceBadge = (serviceStatus) => {
    const badge = document.createElement("span");
    badge.className = `status-badge ${serviceStatus === "Selesai" ? "status-done" : serviceStatus === "Sedang Dicuci" ? "status-washing" : "status-waiting"}`;
    badge.textContent = serviceStatus;
    return badge;
  };

  const closeDialog = () => {
    if (typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open");
    selectedTransactionId = null;
  };

  const openPaymentDetail = (transaction) => {
    selectedTransactionId = transaction.id;
    const details = {
      "payment-detail-transaction": transaction.transactionNumber,
      "payment-detail-customer": transaction.customerName,
      "payment-detail-plate": transaction.plateNumber,
      "payment-detail-vehicle": transaction.vehicleType,
      "payment-detail-service": transaction.service,
      "payment-detail-total": formatCurrency(transaction.price),
    };
    Object.entries(details).forEach(([id, value]) => { document.querySelector(`#${id}`).textContent = value; });
    paymentMethod.value = "Tunai";
    dialogNotice.textContent = "";
    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
  };

  const requestPayment = (transaction) => {
    if (!transaction) {
      notice.textContent = "Transaksi tidak ditemukan.";
      return;
    }
    if (transaction.serviceStatus !== "Selesai") {
      notice.textContent = "Pembayaran dapat dilakukan setelah kendaraan selesai dicuci.";
      return;
    }
    if (transaction.paymentStatus === "Lunas") {
      notice.textContent = "Transaksi ini sudah dibayar.";
      return;
    }
    notice.textContent = "";
    openPaymentDetail(transaction);
  };

  const render = () => {
    const transactions = getTransactions();
    const readyTransactions = transactions.filter((transaction) => transaction.serviceStatus === "Selesai" && transaction.paymentStatus !== "Lunas");
    readyCount.textContent = `${readyTransactions.length} transaksi`;
    resultCount.textContent = `${transactions.length} data`;
    empty.hidden = transactions.length > 0;
    body.replaceChildren();
    transactions.forEach((transaction) => {
      const row = document.createElement("tr");
      [transaction.transactionNumber, transaction.queueNumber, transaction.customerName, transaction.plateNumber, transaction.vehicleType, transaction.service, formatCurrency(transaction.price)].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      });
      const serviceCell = document.createElement("td");
      serviceCell.append(makeServiceBadge(transaction.serviceStatus));
      row.append(serviceCell);
      const paymentCell = document.createElement("td");
      paymentCell.append(makePaymentBadge(transaction.paymentStatus));
      row.append(paymentCell);
      const actionCell = document.createElement("td");
      const payButton = document.createElement("button");
      payButton.className = "table-action";
      payButton.type = "button";
      payButton.textContent = "Bayar";
      payButton.addEventListener("click", () => requestPayment(transaction));
      actionCell.append(payButton);
      row.append(actionCell);
      body.append(row);
    });
  };

  document.querySelector("#payment-dialog-close")?.addEventListener("click", closeDialog);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) closeDialog(); });
  confirmButton.addEventListener("click", () => {
    const transactions = getTransactions();
    const transaction = transactions.find((item) => item.id === selectedTransactionId);
    if (!transaction) {
      dialogNotice.textContent = "Transaksi tidak ditemukan.";
      return;
    }
    if (transaction.serviceStatus !== "Selesai") {
      dialogNotice.textContent = "Pembayaran dapat dilakukan setelah kendaraan selesai dicuci.";
      return;
    }
    if (transaction.paymentStatus === "Lunas") {
      dialogNotice.textContent = "Transaksi ini sudah dibayar.";
      return;
    }
    transaction.paymentStatus = "Lunas";
    transaction.paymentMethod = paymentMethod.value;
    transaction.paidAt = new Date().toISOString();
    saveTransactions(transactions);
    closeDialog();
    notice.textContent = "Pembayaran berhasil dikonfirmasi.";
    render();
  });
  document.querySelector("#payment-logout")?.addEventListener("click", () => { sessionStorage.removeItem("washupRole"); window.location.href = appUrl("login.html"); });
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
    const paidAt = new Date(transaction.paidAt);
    return Number.isNaN(paidAt.getTime()) ? null : paidAt;
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

    vehicleCount.textContent = String(todayTransactions.length);
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
      detailButton.className = "table-action";
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
  const expenses = readExpenses().map((expense) => ({
    date: formatDate(expense.date),
    description: String(expense.description || "-"),
    quantity: Number(expense.quantity || 0),
    price: Number(expense.price || 0),
  }));
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
  const overtimeBody = document.querySelector("#owner-overtime-body");
  const overtimeEmpty = document.querySelector("#owner-overtime-empty");
  if (!totalEmployees || !presentTotal || !absentTotal || !lateTotal || !attendanceBody || !attendanceEmpty || !overtimeBody || !overtimeEmpty) return;

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
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const employees = readRecords("washupEmployees")
    .filter((employee) => employee.status === "Aktif" && employee.name)
    .sort((first, second) => first.name.localeCompare(second.name));
  const attendance = readRecords("washupAttendanceRecords")
    .filter((record) => String(record.date || "").startsWith(monthKey));
  const shifts = readRecords("washupShifts");
  const attendanceByEmployee = new Map();
  attendance.forEach((record) => {
    const name = String(record.employeeName || "").trim();
    if (!name) return;
    const summary = attendanceByEmployee.get(name) || { present: 0, absent: 0, late: 0, leave: 0 };
    if (record.presence === "Masuk") summary.present += 1;
    if (record.presence === "Tanpa Keterangan") summary.absent += 1;
    if (record.presence === "Izin") summary.leave += 1;
    attendanceByEmployee.set(name, summary);
  });
  const currentSummary = [...attendanceByEmployee.values()].reduce((total, summary) => ({
    present: total.present + summary.present,
    absent: total.absent + summary.absent,
  }), { present: 0, absent: 0 });
  totalEmployees.textContent = String(employees.length);
  presentTotal.textContent = String(currentSummary.present);
  absentTotal.textContent = String(currentSummary.absent);
  lateTotal.textContent = "0";

  const appendCell = (row, value) => {
    const cell = document.createElement("td");
    cell.textContent = String(value);
    row.append(cell);
  };
  attendanceBody.replaceChildren();
  attendanceEmpty.hidden = employees.length > 0;
  employees.forEach((employee) => {
    const summary = attendanceByEmployee.get(employee.name) || { present: 0, absent: 0, late: 0, leave: 0 };
    const row = document.createElement("tr");
    [employee.name, summary.present, summary.absent, summary.late, summary.leave].forEach((value) => appendCell(row, value));
    attendanceBody.append(row);
  });

  const formatShiftTime = (time, isEnd = false) => {
    if (!time) return "-";
    if (isEnd && time === "00:00") return "24.00";
    return String(time).replace(":", ".");
  };
  const overtimeRecords = attendance.filter((record) => Number(record.overtimeHours) > 0);
  overtimeBody.replaceChildren();
  overtimeEmpty.hidden = overtimeRecords.length > 0;
  overtimeRecords.forEach((record) => {
    const shift = shifts.find((item) => item.name === record.shift);
    const workHours = shift
      ? `${formatShiftTime(shift.start)} – ${formatShiftTime(shift.end, true)}`
      : "-";
    const hours = String(Number(record.overtimeHours)).replace(".", ",");
    const row = document.createElement("tr");
    [
      record.employeeName || "-",
      record.shift || "-",
      workHours,
      `${hours} Jam`,
      formatCurrency(Number(record.incentive || 0)),
    ].forEach((value) => appendCell(row, value));
    overtimeBody.append(row);
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
  monthSelect.value = String(now.getMonth() + 1);
  yearSelect.value = String(now.getFullYear());

  const render = () => {
    const month = Number(monthSelect.value);
    const year = Number(yearSelect.value);
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
        // Angka diletakkan di dalam track tepat di atas batang.
        barTrack.append(value, bar);
        const label = document.createElement("span");
        label.className = "owner-chart-label";
        label.textContent = service.name;
        label.title = service.name;
        column.append(barTrack, label);
        bars.append(column);
      });
      plot.append(axisTitle, ticks, bars);
      chart.append(plot);
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
  const recentBody = document.querySelector("#admin-recent-body");
  const recentEmpty = document.querySelector("#admin-recent-empty");
  const recentCount = document.querySelector("#admin-recent-count");
  const notice = document.querySelector("#admin-notice");

  if (!customerCount || !vehicleCount || !serviceCount || !employeeCount || !recentBody || !recentEmpty || !recentCount || !notice) {
    return;
  }

  const paymentBadge = (paymentStatus) => {
    const badge = document.createElement("span");
    badge.className = `status-badge ${paymentStatus === "Lunas" ? "status-done" : "status-waiting"}`;
    badge.textContent = paymentStatus || "Belum Dibayar";
    return badge;
  };

  const render = () => {
    const transactions = getTransactions();
    // Gabungan Data Pelanggan/Kendaraan (master Admin) dan data dari transaksi Kasir, dihitung unik.
    const customers = new Set([
      ...readMasterRecords(masterDefinitions.customers).map((customer) => String(customer.name || "").trim().toLowerCase()),
      ...transactions.map((transaction) => String(transaction.customerName || "").trim().toLowerCase()),
    ].filter(Boolean));
    const vehicles = new Set([
      ...readMasterRecords(masterDefinitions.vehicles).map((vehicle) => String(vehicle.plateNumber || "").replace(/\s+/g, "").toUpperCase()),
      ...transactions.map((transaction) => String(transaction.plateNumber || "").replace(/\s+/g, "").toUpperCase()),
    ].filter(Boolean));
    const services = ensureMasterDefaults("services", masterDefinitions.services).length;
    const employees = readMasterRecords(masterDefinitions.employees).filter((employee) => employee.status === "Aktif").length;
    const recentTransactions = [...transactions].sort((first, second) => {
      const firstTime = new Date(first.createdAt).getTime() || 0;
      const secondTime = new Date(second.createdAt).getTime() || 0;
      return secondTime - firstTime;
    }).slice(0, 5);

    customerCount.textContent = String(customers.size);
    vehicleCount.textContent = String(vehicles.size);
    serviceCount.textContent = String(services);
    employeeCount.textContent = String(employees);
    recentCount.textContent = `${recentTransactions.length} data`;
    recentEmpty.hidden = recentTransactions.length > 0;
    recentBody.replaceChildren();
    recentTransactions.forEach((transaction) => {
      const row = document.createElement("tr");
      [transaction.transactionNumber, transaction.customerName, transaction.plateNumber, transaction.service, formatCurrency(transaction.price)].forEach((value) => {
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

  document.querySelector("#admin-date").textContent = getTodayLabel();
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
  if (!body || !empty) return;

  const search = document.querySelector("#petugas-search");
  const filter = document.querySelector("#petugas-filter");

  const transactions = getTransactions();
  const counts = {
    waiting: transactions.filter((transaction) => transaction.serviceStatus === "Menunggu").length,
    washing: transactions.filter((transaction) => transaction.serviceStatus === "Sedang Dicuci").length,
    done: transactions.filter((transaction) => transaction.serviceStatus === "Selesai").length,
  };
  const waitingCount = document.querySelector("#waiting-count");
  const washingCount = document.querySelector("#washing-count");
  const doneCount = document.querySelector("#done-count");
  const vehicleCount = document.querySelector("#petugas-vehicle-count");
  const queueBadge = document.querySelector("#petugas-queue-badge");
  const dateEl = document.querySelector("#petugas-date");

  if (waitingCount) waitingCount.textContent = counts.waiting;
  if (washingCount) washingCount.textContent = counts.washing;
  if (doneCount) doneCount.textContent = counts.done;
  if (vehicleCount) vehicleCount.textContent = transactions.length;
  if (queueBadge) queueBadge.textContent = `${transactions.filter((transaction) => transaction.serviceStatus !== "Selesai").length} kendaraan aktif`;
  if (dateEl) dateEl.textContent = getTodayLabel();

  const render = () => {
    const query = search && search.value ? search.value.trim().toLowerCase() : "";
    const selectedFilter = filter && filter.value ? filter.value : "Semua";
    const filtered = transactions.filter((transaction) => {
      const matchesQuery = [transaction.plateNumber, transaction.queueNumber, transaction.customerName].some((value) => String(value || "").toLowerCase().includes(query));
      return matchesQuery && (selectedFilter === "Semua" || transaction.serviceStatus === selectedFilter);
    });

    body.replaceChildren();
    empty.hidden = filtered.length > 0;

    filtered.forEach((transaction) => {
      const row = document.createElement("tr");
      [transaction.queueNumber, transaction.plateNumber, transaction.customerName || "-", transaction.vehicleType, transaction.service].forEach((value) => {
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
      const link = document.createElement("a");
      link.className = "table-action table-action-link";
      link.href = appUrl("pages/petugas/antrean-petugas.html");
      link.textContent = "Detail";
      actionCell.append(link);
      row.append(actionCell);

      body.append(row);
    });
  };

  if (search) search.addEventListener("input", render);
  if (filter) filter.addEventListener("change", render);
  render();
}

function setupPetugasQueue() {
  const body = document.querySelector("#petugas-queue-body");
  const search = document.querySelector("#petugas-search");
  const filter = document.querySelector("#petugas-filter");
  const empty = document.querySelector("#petugas-queue-empty");
  const dialog = document.querySelector("#petugas-dialog");
  if (!body || !search || !filter || !empty || !dialog) return;

  let selectedId = null;
  const render = () => {
    const query = search.value.trim().toLowerCase();
    const selectedFilter = filter.value;
    const transactions = getTransactions().filter((transaction) => {
      const matchesQuery = [transaction.plateNumber, transaction.queueNumber, transaction.customerName].some((value) => String(value || "").toLowerCase().includes(query));
      return matchesQuery && (selectedFilter === "Semua" || transaction.serviceStatus === selectedFilter);
    });
    const activeCount = getTransactions().filter((transaction) => transaction.serviceStatus !== "Selesai").length;
    document.querySelector("#petugas-active-count").textContent = `${activeCount} kendaraan`;
    document.querySelector("#petugas-result-count").textContent = `${transactions.length} data`;
    body.replaceChildren();
    empty.hidden = transactions.length > 0;
    transactions.forEach((transaction) => {
      const row = document.createElement("tr");
      [transaction.queueNumber, transaction.plateNumber, transaction.customerName, transaction.vehicleType, transaction.service].forEach((value) => {
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
      button.className = "table-action";
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
    Object.entries(values).forEach(([id, value]) => { document.querySelector(`#${id}`).textContent = value; });
    document.querySelector("#petugas-detail-status").value = transaction.serviceStatus;
    document.querySelector("#petugas-dialog-notice").textContent = "";
    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
  }

  const close = () => { if (typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open"); selectedId = null; };
  search.addEventListener("input", render);
  filter.addEventListener("change", render);
  document.querySelector("#petugas-dialog-close")?.addEventListener("click", close);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });
  document.querySelector("#petugas-update-status")?.addEventListener("click", () => {
    const transactions = getTransactions();
    const transaction = transactions.find((item) => item.id === selectedId);
    if (!transaction) return;
    if (transaction.paymentStatus === "Lunas") {
      document.querySelector("#petugas-dialog-notice").textContent = "Status pengerjaan tidak dapat diubah setelah transaksi Lunas.";
      return;
    }
    const nextStatus = document.querySelector("#petugas-detail-status").value;
    if (!isValidServiceStatusTransition(transaction.serviceStatus, nextStatus)) {
      document.querySelector("#petugas-dialog-notice").textContent = "Status harus mengikuti urutan Menunggu, Sedang Dicuci, lalu Selesai.";
      return;
    }
    transaction.serviceStatus = nextStatus;
    saveTransactions(transactions);
    document.querySelector("#petugas-detail-service-status").textContent = transaction.serviceStatus;
    document.querySelector("#petugas-dialog-notice").textContent = "Status pengerjaan berhasil diperbarui.";
    render();
  });
  document.querySelector("#petugas-queue-logout")?.addEventListener("click", () => { sessionStorage.removeItem("washupRole"); window.location.href = appUrl("login.html"); });
  render();
}

function setupPetugasAttendance() {
  const action = document.querySelector("#attendance-action");
  if (!action) return;
  const date = document.querySelector("#attendance-date");
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
  const photoPurpose = document.querySelector("#photo-purpose");
  const checkInPhotoCard = document.querySelector("#check-in-photo-card");
  const checkOutPhotoCard = document.querySelector("#check-out-photo-card");
  const checkInPhoto = document.querySelector("#check-in-photo");
  const checkOutPhoto = document.querySelector("#check-out-photo");
  const employeeId = sessionStorage.getItem("washupUsername") || "petugas";
  const employeeName = employeeId === "petugas" ? "Petugas" : employeeId;
  let selectedPhoto = null;
  let selectedPhotoName = "";
  let confirmedPhoto = null;
  const render = () => {
    const attendance = getAttendance(employeeId);
    date.textContent = getTodayLabel();
    checkIn.textContent = attendance?.checkIn || "--";
    checkOut.textContent = attendance?.checkOut || "--";
    status.textContent = attendance?.status || "Belum Absen";
    const isCheckOut = Boolean(attendance?.checkIn && !attendance?.checkOut);
    photoPurpose.textContent = isCheckOut ? "Absen Keluar" : "Absen Masuk";
    action.textContent = attendance?.checkOut ? "Absensi Selesai" : isCheckOut ? "Absen Keluar" : "Absen Masuk";
    action.disabled = Boolean(attendance?.checkOut);
    photoConfirmedIndicator.hidden = !confirmedPhoto;
    photoPreview.classList.toggle("photo-preview-confirmed", Boolean(confirmedPhoto));
    usePhoto.disabled = !selectedPhoto || Boolean(confirmedPhoto);
    photoPreviewStatus.textContent = confirmedPhoto ? "Foto ini siap digunakan untuk absensi." : "Periksa foto sebelum digunakan.";
    notice.textContent = attendance?.checkOut ? "Absensi hari ini sudah selesai." : notice.textContent;
    if (attendance?.checkInPhoto) {
      checkInPhotoCard.hidden = false;
      checkInPhoto.src = attendance.checkInPhoto;
    }
    if (attendance?.checkOutPhoto) {
      checkOutPhotoCard.hidden = false;
      checkOutPhoto.src = attendance.checkOutPhoto;
    }
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
    const attendance = getAttendance(employeeId);
    notice.textContent = `Foto sudah dikonfirmasi. Anda dapat melakukan ${attendance?.checkIn ? "Absen Keluar" : "Absen Masuk"}.`;
    render();
  });

  action.addEventListener("click", () => {
    const attendance = getAttendance(employeeId) || { employeeId, employeeName, date: getTodayKey(), shift: "Shift Pagi", checkIn: null, checkInPhoto: null, checkOut: null, checkOutPhoto: null, status: "Belum Absen" };
    if (!attendance.employeeId) attendance.employeeId = employeeId;
    if (!attendance.employeeName) attendance.employeeName = employeeName;
    if (attendance.checkOut) {
      notice.textContent = "Absensi hari ini sudah selesai.";
      return;
    }
    if (!confirmedPhoto) {
      notice.textContent = "Bukti foto wajib digunakan sebelum melakukan absensi.";
      return;
    }
    const now = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    if (!attendance.checkIn) {
      attendance.checkIn = now;
      attendance.checkInPhoto = confirmedPhoto;
      attendance.status = "Hadir";
    } else if (!attendance.checkOut) {
      if (confirmedPhoto === attendance.checkInPhoto) {
        notice.textContent = "Gunakan foto baru untuk Absen Keluar.";
        return;
      }
      attendance.checkOut = now;
      attendance.checkOutPhoto = confirmedPhoto;
    }
    if (!saveAttendance(attendance)) {
      notice.textContent = "Foto tidak dapat disimpan. Gunakan foto yang lebih kecil atau coba lagi.";
      return;
    }
    resetPhotoSelection();
    notice.textContent = attendance.checkOut ? "Absensi hari ini sudah selesai." : "Absen masuk berhasil disimpan.";
    render();
  });
  document.querySelector("#attendance-logout")?.addEventListener("click", () => { sessionStorage.removeItem("washupRole"); sessionStorage.removeItem("washupUsername"); window.location.href = appUrl("login.html"); });
  render();
}

if (document.querySelector(".petugas-dashboard-page") || document.querySelector(".petugas-queue-page") || document.querySelector(".petugas-attendance-page")) {
  if (sessionStorage.getItem("washupRole") !== "Petugas") window.location.replace(appUrl("login.html"));
}
if (document.querySelector(".petugas-dashboard-page")) setupPetugasDashboard();
if (document.querySelector(".petugas-queue-page")) setupPetugasQueue();
if (document.querySelector(".petugas-attendance-page")) setupPetugasAttendance();

// Dropdown kustom untuk form data master (Figma: Data Kendaraan tambah 2).
// <select> asli tetap ada tetapi disembunyikan, jadi nilai form dan validasi tetap bekerja seperti biasa.
const customSelectTypes = ["vehicles", "services", "employees", "shifts", "attendance", "users"];
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
  const page = document.querySelector(".master-page");
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

  const isProtectedRecord = (record) => (type === "users" && (record.builtIn || record.protected)) || (type === "services" && masterDefaults.services.some((item) => item.id === record.id)) || (type === "shifts" && record.id === "shift-pagi");
  // Jam shift ditampilkan dengan titik seperti Figma (08.00); jam selesai 00:00 berarti tengah malam (24.00).
  const formatShiftTime = (key, value) => (key === "end" && value === "00:00" ? "24.00" : String(value).replace(":", "."));
  const valueForDisplay = (key, value) => {
    if (key === "price") return formatCurrency(value);
    if (type === "shifts" && (key === "start" || key === "end") && value) return formatShiftTime(key, value);
    if (type === "attendance") {
      if (key === "date" && /^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value).split("-").reverse().join(" / ");
      if (key === "overtimeHours") return Number(value) > 0 ? `${String(Number(value)).replace(".", ",")} Jam` : "-";
      if (key === "incentive") return Number(value) > 0 ? formatCurrency(value) : "-";
    }
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
      detailButton.className = "table-action table-action-link";
      detailButton.type = "button";
      detailButton.dataset.action = "detail";
      detailButton.dataset.id = record.id;
      detailButton.textContent = "Detail";
      actions.append(detailButton);
      if (!(type === "users" && isProtectedRecord(record))) {
        const editButton = document.createElement("button");
        editButton.className = "table-action";
        editButton.type = "button";
        editButton.dataset.action = "edit";
        editButton.dataset.id = record.id;
        editButton.textContent = "Edit";
        actions.append(editButton);
        const deleteButton = document.createElement("button");
        deleteButton.className = "table-action";
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
      if (type === "attendance" && requiredField.key === "shift") return "Belum ada shift aktif. Aktifkan shift di halaman Data Shift.";
      return `${requiredField.label} wajib diisi.`;
    }
    const invalidPhone = definition.fields.find((field) => field.type === "tel" && record[field.key] && !/^\+?\d{8,15}$/.test(record[field.key]));
    if (invalidPhone) return `${invalidPhone.label} hanya boleh berisi angka (8–15 digit).`;
    if (type === "attendance" && !getActiveShiftNames().includes(record.shift)) return "Shift yang dipilih tidak aktif.";
    if (type === "services" && (!Number.isFinite(Number(record.price)) || Number(record.price) <= 0)) return "Harga harus lebih besar dari 0.";
    if (type === "shifts" && record.end !== "00:00" && record.start >= record.end) return "Jam selesai harus setelah jam mulai.";
    if (type === "attendance" && (Number(record.overtimeHours) < 0 || Number(record.incentive) < 0)) return "Lembur dan insentif tidak boleh bernilai negatif.";
    const duplicate = records.some((existing) => existing.id !== editingId && (
      (type === "customers" && normalizePhone(existing.phone) === record.phone) ||
      (type === "vehicles" && String(existing.plateNumber).replace(/\s+/g, " ").trim().toUpperCase() === record.plateNumber) ||
      (type === "services" && String(existing.name).trim().toLowerCase() === record.name.toLowerCase() && existing.vehicleType === record.vehicleType) ||
      (type === "employees" && normalizePhone(existing.phone) === record.phone) ||
      (type === "shifts" && String(existing.name).trim().toLowerCase() === record.name.toLowerCase()) ||
      (type === "users" && existing.username.toLowerCase() === record.username.toLowerCase()) ||
      (type === "attendance" && existing.date === record.date && String(existing.employeeName).trim().toLowerCase() === String(record.employeeName).trim().toLowerCase())
    ));
    return duplicate ? "Data duplikat tidak diperbolehkan." : "";
  }

  // Dialog konfirmasi hapus (Figma: Data Pelanggan Hapus). Dibuat lewat JS agar keenam halaman master tidak perlu diubah.
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
    if (type === "vehicles") record.plateNumber = record.plateNumber.trim().toUpperCase();
    if (type === "users") record.username = record.username.trim().toLowerCase();
    if (type === "services") record.price = Number(record.price);
    if (type === "attendance") {
      record.employeeName = record.employeeName.trim();
      record.overtimeHours = record.overtimeHours === "" ? 0 : Number(record.overtimeHours);
      record.incentive = record.incentive === "" ? 0 : Number(record.incentive);
    }
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

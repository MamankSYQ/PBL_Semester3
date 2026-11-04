// Menentukan jalur dari folder utama proyek, termasuk saat halaman berada di pages/{role}/.
const appRoot = window.location.pathname.includes("/pages/") ? "../../" : "";
function appUrl(path) {
  return `${appRoot}${path}`;
}

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
  vehicles: 0,
  transactions: 0,
  queue: 0,
  revenue: 0,
};

// Daftar layanan dan harga resmi WASHUP.
// Pilih jenis kendaraan terlebih dahulu; layanan yang tampil hanya sesuai kendaraan.
const serviceOptions = {
  Mobil: [
    { id: "service-mobil-kecil", name: "Mobil Kecil", price: 30000 },
    { id: "service-mobil-sedang", name: "Mobil Sedang", price: 35000 },
    { id: "service-mobil-besar", name: "Mobil Besar", price: 40000 },
  ],
  Motor: [
    { id: "service-motor-kecil", name: "Motor Kecil", price: 12000 },
    { id: "service-motor-sedang", name: "Motor Sedang", price: 15000 },
    { id: "service-motor-besar", name: "Motor Besar", price: 17000 },
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
    title: "Layanan & Tarif",
    fields: [
      { key: "name", label: "Nama layanan", type: "text", required: true },
      { key: "vehicleType", label: "Jenis kendaraan", type: "select", options: ["Mobil", "Motor"], required: true },
      { key: "price", label: "Harga", type: "number", min: 1, required: true },
      { key: "status", label: "Status", type: "select", options: ["Aktif", "Nonaktif"], required: true },
    ],
    columns: ["name", "vehicleType", "price", "status"],
    labels: { name: "Layanan", vehicleType: "Jenis", price: "Harga", status: "Status" },
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
  },
};

const masterDefaults = {
  services: [
    { id: "service-mobil-kecil", name: "Mobil Kecil", vehicleType: "Mobil", price: 30000, status: "Aktif" },
    { id: "service-mobil-sedang", name: "Mobil Sedang", vehicleType: "Mobil", price: 35000, status: "Aktif" },
    { id: "service-mobil-besar", name: "Mobil Besar", vehicleType: "Mobil", price: 40000, status: "Aktif" },
    { id: "service-motor-kecil", name: "Motor Kecil", vehicleType: "Motor", price: 12000, status: "Aktif" },
    { id: "service-motor-sedang", name: "Motor Sedang", vehicleType: "Motor", price: 15000, status: "Aktif" },
    { id: "service-motor-besar", name: "Motor Besar", vehicleType: "Motor", price: 17000, status: "Aktif" },
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

function ensureMasterDefaults(type, definition) {
  const defaults = masterDefaults[type];
  if (!defaults) return readMasterRecords(definition);

  let records = readMasterRecords(definition);
  let changed = false;

  // Ganti lima preset layanan lama dengan enam preset terbaru, tanpa menghapus
  // catatan layanan custom lain yang mungkin ditambahkan pengguna.
  if (type === "services") {
    const obsoleteDefaultServiceIds = new Set([
      "service-mobil-1",
      "service-mobil-2",
      "service-mobil-3",
      "service-motor-1",
      "service-motor-2",
    ]);
    const filteredRecords = records.filter((record) => !obsoleteDefaultServiceIds.has(record.id));
    if (filteredRecords.length !== records.length) {
      records = filteredRecords;
      changed = true;
    }
  }

  const existingKeys = new Set(records.map((record) => type === "users" ? record.username : record.id));
  // Akun bawaan diidentifikasi dari ID/role yang dilindungi, bukan username.
  // Dengan begitu, perubahan username melalui Edit Profil tidak membuat akun
  // bawaan lama muncul kembali saat halaman atau aplikasi dimuat ulang.
  const missing = defaults.filter((record) => type === "users"
    ? !records.some((existing) => existing.id === record.id || (existing.protected && existing.role === record.role))
    : !existingKeys.has(record.id));
  if (missing.length) {
    records.push(...missing.map((record) => ({ ...record })));
    changed = true;
  }
  if (changed) saveMasterRecords(definition, records);
  return records;
}

function getUserAccounts() {
  return ensureMasterDefaults("users", masterDefinitions.users);
}

function getActiveServiceOptions() {
  const definition = masterDefinitions.services;
  const records = ensureMasterDefaults("services", definition);
  const grouped = { Mobil: [], Motor: [] };

  // Transaksi hanya menampilkan enam paket yang ditetapkan. Harga menggunakan
  // data master untuk paket yang aktif, dengan harga resmi sebagai fallback.
  Object.entries(serviceOptions).forEach(([vehicleType, options]) => {
    options.forEach((option) => {
      const configured = records.find((record) => record.id === option.id);
      if (configured && configured.status !== "Aktif") return;
      const configuredPrice = Number(configured?.price);
      grouped[vehicleType].push({
        name: option.name,
        price: Number.isFinite(configuredPrice) && configuredPrice > 0 ? configuredPrice : option.price,
      });
    });
  });

  return grouped;
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
  const queuePageSize = document.querySelector("#queue-page-size");
  const queueTableFooter = document.querySelector("#queue-table-footer");
  const queuePaginationRange = document.querySelector("#queue-pagination-range");
  const queuePageNumbers = document.querySelector("#queue-page-numbers");
  const queuePagePrev = document.querySelector("#queue-page-prev");
  const queuePageNext = document.querySelector("#queue-page-next");
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
    const pageSize = Math.max(1, Number.parseInt(queuePageSize?.value || "5", 10) || 5);
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

    if (queueTableFooter) queueTableFooter.hidden = transactions.length === 0;
    if (queuePaginationRange) {
      queuePaginationRange.textContent = transactions.length
        ? `Showing ${startIndex + 1} to ${endIndex} of ${transactions.length} entries`
        : "Showing 0 to 0 of 0 entries";
    }
    if (queuePagePrev) queuePagePrev.disabled = transactions.length === 0 || currentPage <= 1;
    if (queuePageNext) queuePageNext.disabled = transactions.length === 0 || currentPage >= totalPages;

    if (queuePageNumbers) {
      queuePageNumbers.replaceChildren();
      if (transactions.length) {
        let pages;
        if (totalPages <= 7) {
          pages = Array.from({ length: totalPages }, (_, index) => index + 1);
        } else {
          pages = [...new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages])]
            .filter((page) => page >= 1 && page <= totalPages)
            .sort((first, second) => first - second);
        }

        let previousPage = 0;
        pages.forEach((page) => {
          if (page - previousPage > 1) {
            const ellipsis = document.createElement("span");
            ellipsis.className = "queue-page-ellipsis";
            ellipsis.setAttribute("aria-hidden", "true");
            ellipsis.textContent = "…";
            queuePageNumbers.append(ellipsis);
          }
          const pageButton = document.createElement("button");
          pageButton.type = "button";
          pageButton.className = "queue-page-number";
          pageButton.textContent = String(page);
          pageButton.setAttribute("aria-label", `Halaman ${page}`);
          if (page === currentPage) {
            pageButton.classList.add("is-current");
            pageButton.setAttribute("aria-current", "page");
          }
          pageButton.addEventListener("click", () => {
            currentPage = page;
            renderQueuePage();
          });
          queuePageNumbers.append(pageButton);
          previousPage = page;
        });
      }
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
  queuePageSize?.addEventListener("change", () => {
    currentPage = 1;
    renderQueuePage();
  });
  queuePagePrev?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage -= 1;
      renderQueuePage();
    }
  });
  queuePageNext?.addEventListener("click", () => {
    const totalPages = Math.max(1, Math.ceil(filteredTransactions().length / Math.max(1, Number.parseInt(queuePageSize?.value || "5", 10) || 5)));
    if (currentPage < totalPages) {
      currentPage += 1;
      renderQueuePage();
    }
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
  const pageSizeSelect = document.querySelector("#history-page-size");
  const pageRange = document.querySelector("#history-pagination-range");
  const pageNumbers = document.querySelector("#history-page-numbers");
  const prevButton = document.querySelector("#history-page-prev");
  const nextButton = document.querySelector("#history-page-next");
  const receiptOverlay = document.querySelector("#history-receipt-overlay");
  const receiptDialogTitle = document.querySelector("#history-receipt-dialog-title");
  const receiptCaption = document.querySelector("#history-receipt-caption");

  if (!body || !search || !serviceFilter || !paymentFilter || !dateFilter || !resultCount || !empty || !emptyTitle || !emptyMessage || !detailDialog || !pageSizeSelect || !pageRange || !pageNumbers || !prevButton || !nextButton || !receiptOverlay) return;

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
  const renderPageNumbers = (totalPages) => {
    pageNumbers.replaceChildren();
    if (!totalPages) return;
    let pages;
    if (totalPages <= 7) pages = Array.from({ length: totalPages }, (_, index) => index + 1);
    else if (currentPage <= 4) pages = [1, 2, 3, 4, 5, "…", totalPages];
    else if (currentPage >= totalPages - 3) pages = [1, "…", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    else pages = [1, "…", currentPage - 1, currentPage, currentPage + 1, "…", totalPages];
    let previousPage = 0;
    pages.forEach((page) => {
      if (page === "…") {
        const ellipsis = document.createElement("span");
        ellipsis.className = "queue-page-ellipsis";
        ellipsis.textContent = "…";
        ellipsis.setAttribute("aria-hidden", "true");
        pageNumbers.append(ellipsis);
        return;
      }
      const button = document.createElement("button");
      button.type = "button";
      button.className = "queue-page-number";
      button.textContent = String(page);
      button.setAttribute("aria-label", `Halaman ${page}`);
      if (page === currentPage) {
        button.classList.add("is-current");
        button.setAttribute("aria-current", "page");
      }
      button.addEventListener("click", () => { currentPage = page; render(); });
      pageNumbers.append(button);
      previousPage = page;
    });
  };
  const render = () => {
    const allTransactions = getTransactions();
    const transactions = filteredTransactions();
    const pageSize = Math.max(1, Number.parseInt(pageSizeSelect.value || "5", 10) || 5);
    const totalPages = transactions.length ? Math.ceil(transactions.length / pageSize) : 0;
    currentPage = totalPages ? Math.min(Math.max(1, currentPage), totalPages) : 1;
    const startIndex = transactions.length ? (currentPage - 1) * pageSize : 0;
    const visibleTransactions = transactions.slice(startIndex, startIndex + pageSize);
    const endIndex = Math.min(startIndex + visibleTransactions.length, transactions.length);

    resultCount.textContent = `${transactions.length} data`;
    empty.hidden = transactions.length > 0;
    emptyTitle.textContent = allTransactions.length ? "Transaksi tidak ditemukan." : "Belum ada riwayat transaksi.";
    emptyMessage.textContent = allTransactions.length ? "Ubah pencarian atau filter untuk melihat transaksi lain." : "Transaksi yang dibuat Kasir akan tampil di sini.";
    body.replaceChildren();
    pageRange.textContent = transactions.length ? `Showing ${startIndex + 1} to ${endIndex} of ${transactions.length} entries` : "Showing 0 to 0 of 0 entries";
    prevButton.disabled = transactions.length === 0 || currentPage <= 1;
    nextButton.disabled = transactions.length === 0 || currentPage >= totalPages;
    renderPageNumbers(totalPages);

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
  pageSizeSelect.addEventListener("change", () => { currentPage = 1; render(); });
  prevButton.addEventListener("click", () => { if (currentPage > 1) { currentPage -= 1; render(); } });
  nextButton.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredTransactions().length / Math.max(1, Number.parseInt(pageSizeSelect.value || "5", 10) || 5));
    if (currentPage < totalPages) { currentPage += 1; render(); }
  });
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
  const pageSizeSelect = document.querySelector("#payment-page-size");
  const pageFooter = document.querySelector("#payment-table-footer");
  const rangeLabel = document.querySelector("#payment-pagination-range");
  const pageNumbers = document.querySelector("#payment-page-numbers");
  const prevButton = document.querySelector("#payment-page-prev");
  const nextButton = document.querySelector("#payment-page-next");
  const cashFields = document.querySelector("#payment-cash-fields");
  const cashReceived = document.querySelector("#payment-cash-received");
  const changeLabel = document.querySelector("#payment-change");
  const qrisFields = document.querySelector("#payment-qris-fields");
  const qrisVerified = document.querySelector("#payment-qris-verified");
  const receiptOverlay = document.querySelector("#payment-receipt-overlay");

  if (!body || !empty || !resultCount || !unpaidCount || !readyCount || !pendingTotalElement || !pendingDescription || !notice || !detailNotice || !paymentMethod || !confirmButton) return;

  // Sidebar Pembayaran mengikuti perilaku dan preferensi collapse Dashboard Kasir.
  function setupPaymentSidebarControls() {
    const shell = document.querySelector(".dashboard-shell");
    const desktopToggle = document.querySelector("#sidebar-toggle");
    const mobileToggle = document.querySelector("#mobile-sidebar-toggle");
    const backdrop = document.querySelector("#sidebar-backdrop");
    const mobileBreakpoint = window.matchMedia("(max-width: 768px)");
    const collapsedKey = "washupKasirSidebarCollapsed";
    if (!shell) return;

    function closeMobileSidebar() {
      shell.classList.remove("mobile-sidebar-open");
      document.body.classList.remove("mobile-sidebar-scroll-lock");
      if (backdrop) backdrop.hidden = true;
      mobileToggle?.setAttribute("aria-expanded", "false");
      mobileToggle?.setAttribute("aria-label", "Buka menu");
      if (mobileToggle) mobileToggle.title = "Buka menu";
    }
    function openMobileSidebar() {
      shell.classList.add("mobile-sidebar-open");
      document.body.classList.add("mobile-sidebar-scroll-lock");
      if (backdrop) backdrop.hidden = false;
      mobileToggle?.setAttribute("aria-expanded", "true");
      mobileToggle?.setAttribute("aria-label", "Tutup menu");
      if (mobileToggle) mobileToggle.title = "Tutup menu";
    }
    function updateDesktopToggle() {
      const collapsed = shell.classList.contains("sidebar-collapsed");
      desktopToggle?.setAttribute("aria-expanded", String(!collapsed));
      desktopToggle?.setAttribute("aria-label", collapsed ? "Perluas sidebar" : "Perkecil sidebar");
      if (desktopToggle) desktopToggle.title = collapsed ? "Perluas sidebar" : "Perkecil sidebar";
    }
    function syncViewport() {
      if (mobileBreakpoint.matches) {
        shell.classList.remove("sidebar-collapsed");
        closeMobileSidebar();
      } else {
        closeMobileSidebar();
        try { shell.classList.toggle("sidebar-collapsed", localStorage.getItem(collapsedKey) === "true"); }
        catch { shell.classList.remove("sidebar-collapsed"); }
        updateDesktopToggle();
      }
    }
    desktopToggle?.addEventListener("click", () => {
      if (mobileBreakpoint.matches) return;
      const collapsed = shell.classList.toggle("sidebar-collapsed");
      try { localStorage.setItem(collapsedKey, String(collapsed)); } catch { /* Storage boleh tidak tersedia. */ }
      updateDesktopToggle();
    });
    mobileToggle?.addEventListener("click", () => {
      if (shell.classList.contains("mobile-sidebar-open")) closeMobileSidebar();
      else openMobileSidebar();
    });
    backdrop?.addEventListener("click", closeMobileSidebar);
    shell.querySelectorAll(".dashboard-sidebar .nav-item").forEach((link) => {
      link.addEventListener("click", () => { if (mobileBreakpoint.matches) closeMobileSidebar(); });
    });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMobileSidebar(); });
    if (mobileBreakpoint.addEventListener) mobileBreakpoint.addEventListener("change", syncViewport);
    else mobileBreakpoint.addListener(syncViewport);
    syncViewport();
  }
  setupPaymentSidebarControls();

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

  const renderPages = (totalPages) => {
    if (!pageNumbers) return;
    pageNumbers.replaceChildren();
    let pages;
    if (totalPages <= 5) pages = Array.from({ length: totalPages }, (_, index) => index + 1);
    else if (currentPage <= 3) pages = [1, 2, 3, 4, "…", totalPages];
    else if (currentPage >= totalPages - 2) pages = [1, "…", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    else pages = [1, "…", currentPage - 1, currentPage, currentPage + 1, "…", totalPages];
    pages.forEach((page) => {
      if (page === "…") {
        const dots = document.createElement("span"); dots.className = "payment-page-ellipsis"; dots.textContent = "…"; dots.setAttribute("aria-hidden", "true"); pageNumbers.append(dots); return;
      }
      const button = document.createElement("button");
      button.type = "button";
      button.className = `payment-page-number ${page === currentPage ? "is-current" : ""}`;
      button.textContent = String(page);
      button.setAttribute("aria-label", `Halaman ${page}`);
      if (page === currentPage) button.setAttribute("aria-current", "page");
      button.addEventListener("click", () => { currentPage = page; render(); });
      pageNumbers.append(button);
    });
  };

  const renderPagination = (rows) => {
    if (!pageFooter || !rangeLabel) return;
    const pageSize = Math.max(1, Number.parseInt(pageSizeSelect?.value || "4", 10) || 4);
    const total = rows.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    currentPage = Math.min(Math.max(1, currentPage), totalPages);
    const startIndex = total ? (currentPage - 1) * pageSize : 0;
    const endIndex = Math.min(startIndex + pageSize, total);
    rows.forEach((row, index) => { row.hidden = index < startIndex || index >= endIndex; });
    pageFooter.hidden = total <= pageSize;
    rangeLabel.textContent = total ? `Showing ${startIndex + 1} to ${endIndex} of ${total} entries` : "Showing 0 to 0 of 0 entries";
    if (prevButton) prevButton.disabled = currentPage === 1 || total === 0;
    if (nextButton) nextButton.disabled = currentPage === totalPages || total === 0;
    renderPages(totalPages);
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
      action.className = "payment-table-action";
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
  pageSizeSelect?.addEventListener("change", () => { currentPage = 1; render(); });
  prevButton?.addEventListener("click", () => { if (currentPage > 1) { currentPage -= 1; render(); } });
  nextButton?.addEventListener("click", () => {
    const pageSize = Math.max(1, Number.parseInt(pageSizeSelect?.value || "4", 10) || 4);
    if (currentPage < Math.ceil(getTransactions().length / pageSize)) { currentPage += 1; render(); }
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
  const fields = ["total-count", "paid-count", "unpaid-count", "revenue", "cash", "qris"];
  if (!search || !period || !body || !empty || !emptyTitle || !emptyMessage || !resultCount || !dialog || fields.some((field) => !document.querySelector(`#owner-report-${field}`))) return;

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
    document.querySelector("#owner-report-paid-count").textContent = String(paidTransactions.length);
    document.querySelector("#owner-report-unpaid-count").textContent = String(periodTransactions.filter((transaction) => transaction.paymentStatus === "Belum Dibayar").length);
    document.querySelector("#owner-report-revenue").textContent = formatCurrency(totalPaid);
    document.querySelector("#owner-report-cash").textContent = paymentSummary("Tunai");
    document.querySelector("#owner-report-qris").textContent = paymentSummary("QRIS");
    resultCount.textContent = `${transactions.length} data`;
    empty.hidden = transactions.length > 0;
    emptyTitle.textContent = allTransactions.length ? "Transaksi tidak ditemukan." : "Belum ada transaksi.";
    emptyMessage.textContent = allTransactions.length ? "Ubah pencarian atau periode untuk melihat transaksi lain." : "Data transaksi akan tampil di sini.";
    body.replaceChildren();
    transactions.forEach((transaction) => {
      const row = document.createElement("tr");
      [transaction.transactionNumber, formatDateTime(transaction.createdAt), transaction.customerName, transaction.plateNumber, transaction.vehicleType, transaction.service, formatCurrency(transaction.price), transaction.serviceStatus, transaction.paymentStatus, transaction.paymentMethod || "-"].forEach((value) => { const cell = document.createElement("td"); cell.textContent = value || "-"; row.append(cell); });
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
  document.querySelector("#owner-report-logout")?.addEventListener("click", () => { sessionStorage.removeItem("washupRole"); window.location.href = appUrl("login.html"); });
  render();
}

if (document.querySelector(".owner-report-page")) setupOwnerTransactionReport();

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
    const customers = new Set(transactions.map((transaction) => String(transaction.customerName || "").trim()).filter(Boolean));
    const vehicles = new Set(transactions.map((transaction) => String(transaction.plateNumber || "").trim().toUpperCase()).filter(Boolean));
    const storedServices = readMasterRecords(masterDefinitions.services);
    const services = storedServices.length || Object.values(serviceOptions).reduce((total, options) => total + options.length, 0);
    const employees = Object.values(accounts).filter((account) => account.role === "Kasir" || account.role === "Petugas").length;
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

  const recordsWithDefaults = ensureMasterDefaults(type, definition);

  const isProtectedRecord = (record) => (type === "users" && (record.builtIn || record.protected)) || (type === "services" && masterDefaults.services.some((item) => item.id === record.id)) || (type === "shifts" && record.id === "shift-pagi");
  const valueForDisplay = (key, value) => key === "price" ? formatCurrency(value) : String(value || "-");
  const createId = () => `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  function getRecords() {
    return readMasterRecords(definition);
  }

  function closeDialog(target) {
    if (target.open) target.close();
  }

  function renderHeaders() {
    tableHead.replaceChildren();
    [...definition.columns, "actions"].forEach((column) => {
      const cell = document.createElement("th");
      cell.scope = "col";
      cell.textContent = column === "actions" ? "Aksi" : definition.labels[column];
      tableHead.append(cell);
    });
  }

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const records = getRecords().filter((record) => definition.columns.some((column) => String(record[column] || "").toLowerCase().includes(query)));
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
      row.append(actions);
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
      if (field.type === "select") {
        field.options.forEach((optionValue) => {
          const option = document.createElement("option");
          option.value = optionValue;
          option.textContent = optionValue;
          input.append(option);
        });
      }
      input.value = record[field.key] ?? (field.type === "select" ? field.options[0] : "");
      wrapper.append(input);
      formFields.append(wrapper);
    });
  }

  function openForm(record = null) {
    editingId = record?.id || null;
    formTitle.textContent = editingId ? `Edit ${definition.title}` : `Tambah ${definition.title}`;
    notice.textContent = "";
    renderForm(record || {});
    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
  }

  function openDetail(record) {
    detailContent.replaceChildren();
    definition.columns.forEach((column) => {
      const wrapper = document.createElement("div");
      const label = document.createElement("span");
      label.textContent = definition.labels[column];
      const value = document.createElement("strong");
      value.textContent = valueForDisplay(column, record[column]);
      wrapper.append(label, value);
      detailContent.append(wrapper);
    });
    if (typeof detailDialog.showModal === "function") detailDialog.showModal(); else detailDialog.setAttribute("open", "");
  }

  function validate(record, records) {
    const requiredField = definition.fields.find((field) => field.required && !String(record[field.key] || "").trim());
    if (requiredField) return `${requiredField.label} wajib diisi.`;
    if (type === "services" && (!Number.isFinite(Number(record.price)) || Number(record.price) <= 0)) return "Harga harus lebih besar dari 0.";
    if (type === "shifts" && record.start >= record.end) return "Jam selesai harus setelah jam mulai.";
    const duplicate = records.some((existing) => existing.id !== editingId && (
      (type === "customers" && existing.phone === record.phone) ||
      (type === "vehicles" && existing.plateNumber === record.plateNumber) ||
      (type === "services" && existing.name.toLowerCase() === record.name.toLowerCase() && existing.vehicleType === record.vehicleType) ||
      (type === "employees" && existing.phone === record.phone) ||
      (type === "shifts" && existing.name.toLowerCase() === record.name.toLowerCase()) ||
      (type === "users" && existing.username.toLowerCase() === record.username.toLowerCase())
    ));
    return duplicate ? "Data duplikat tidak diperbolehkan." : "";
  }

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
    if (button.dataset.action === "delete") {
      if (isProtectedRecord(record)) {
        notice.textContent = "Data bawaan tidak dapat dihapus. Gunakan status Nonaktif jika tersedia.";
        return;
      }
      if (window.confirm(`Hapus ${definition.title.toLowerCase()} ini?`)) {
        saveMasterRecords(definition, getRecords().filter((item) => item.id !== record.id));
        render();
      }
    }
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const record = Object.fromEntries(new FormData(form).entries());
    if (type === "vehicles") record.plateNumber = record.plateNumber.trim().toUpperCase();
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
  const shell = document.querySelector(".dashboard-shell");
  const sidebarToggle = document.querySelector("#sidebar-toggle");
  const mobileToggle = document.querySelector("#mobile-sidebar-toggle");
  const sidebarBackdrop = document.querySelector("#sidebar-backdrop");
  const logoutButton = document.querySelector("#kasir-dashboard-logout");
  const mobileBreakpoint = window.matchMedia("(max-width: 768px)");
  const collapsedStorageKey = "washupKasirSidebarCollapsed";

  function updateDesktopToggle() {
    const collapsed = Boolean(shell?.classList.contains("sidebar-collapsed"));
    sidebarToggle?.setAttribute("aria-expanded", String(!collapsed));
    sidebarToggle?.setAttribute("aria-label", collapsed ? "Perluas sidebar" : "Perkecil sidebar");
    if (sidebarToggle) sidebarToggle.title = collapsed ? "Perluas sidebar" : "Perkecil sidebar";
  }

  function closeMobileSidebar() {
    shell?.classList.remove("mobile-sidebar-open");
    document.body.classList.remove("mobile-sidebar-scroll-lock");
    if (sidebarBackdrop) sidebarBackdrop.hidden = true;
    mobileToggle?.setAttribute("aria-expanded", "false");
    mobileToggle?.setAttribute("aria-label", "Buka menu");
    if (mobileToggle) mobileToggle.title = "Buka menu";
  }

  function openMobileSidebar() {
    shell?.classList.add("mobile-sidebar-open");
    document.body.classList.add("mobile-sidebar-scroll-lock");
    if (sidebarBackdrop) sidebarBackdrop.hidden = false;
    mobileToggle?.setAttribute("aria-expanded", "true");
    mobileToggle?.setAttribute("aria-label", "Tutup menu");
    if (mobileToggle) mobileToggle.title = "Tutup menu";
  }

  function syncSidebarForViewport() {
    if (!shell) return;
    if (mobileBreakpoint.matches) {
      shell.classList.remove("sidebar-collapsed");
      closeMobileSidebar();
    } else {
      closeMobileSidebar();
      try {
        shell.classList.toggle("sidebar-collapsed", localStorage.getItem(collapsedStorageKey) === "true");
      } catch {
        shell.classList.remove("sidebar-collapsed");
      }
      updateDesktopToggle();
    }
  }

  sidebarToggle?.addEventListener("click", () => {
    if (mobileBreakpoint.matches || !shell) return;
    const collapsed = shell.classList.toggle("sidebar-collapsed");
    try {
      localStorage.setItem(collapsedStorageKey, String(collapsed));
    } catch {
      // Penyimpanan preferensi sidebar mungkin dinonaktifkan browser.
    }
    updateDesktopToggle();
  });

  mobileToggle?.addEventListener("click", () => {
    if (shell?.classList.contains("mobile-sidebar-open")) closeMobileSidebar();
    else openMobileSidebar();
  });
  sidebarBackdrop?.addEventListener("click", closeMobileSidebar);
  shell?.querySelectorAll(".dashboard-sidebar .nav-item").forEach((link) => {
    link.addEventListener("click", () => {
      if (mobileBreakpoint.matches) closeMobileSidebar();
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileSidebar();
  });
  if (mobileBreakpoint.addEventListener) mobileBreakpoint.addEventListener("change", syncSidebarForViewport);
  else mobileBreakpoint.addListener(syncSidebarForViewport);
  syncSidebarForViewport();

  logoutButton?.addEventListener("click", () => {
    sessionStorage.removeItem("washupRole");
    sessionStorage.removeItem("washupUsername");
    window.location.href = appUrl("login.html");
  });

  const form = transactionPageForm;
  const layout = document.querySelector("#transaction-layout");
  const result = document.querySelector("#transaction-result");
  const heading = document.querySelector("#transaction-title");
  const eyebrow = document.querySelector("#transaction-eyebrow");
  const printButton = document.querySelector("#print-receipt-button");
  const noPrintButton = document.querySelector("#no-print-receipt-button");

  function currency(value) {
    return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
  }

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
   MODUL DASHBOARD KASIR — SIDEBAR DAN PAGINATION
   Seluruh JavaScript tetap berada di app.js sesuai struktur WASHUP.
   ========================================================= */
(() => {
  "use strict";

  // Modul ini hanya berjalan di Dashboard Kasir, bukan halaman Transaksi Baru.
  if (!document.body.classList.contains("kasir-dashboard-page") ||
      document.body.classList.contains("kasir-transaction-page") ||
      document.body.classList.contains("kasir-payment-page")) return;

  const shell = document.querySelector(".dashboard-shell");
  if (!shell) return;

  const sidebarToggle = document.querySelector("#sidebar-toggle");
  const mobileToggle = document.querySelector("#mobile-sidebar-toggle");
  const backdrop = document.querySelector("#sidebar-backdrop");
  const logoutButton = document.querySelector("#kasir-dashboard-logout");
  const mobileBreakpoint = window.matchMedia("(max-width: 768px)");
  const collapsedStorageKey = "washupKasirSidebarCollapsed";

  function updateDesktopToggle() {
    const collapsed = shell.classList.contains("sidebar-collapsed");
    sidebarToggle?.setAttribute("aria-expanded", String(!collapsed));
    sidebarToggle?.setAttribute("aria-label", collapsed ? "Perluas sidebar" : "Perkecil sidebar");
    if (sidebarToggle) sidebarToggle.title = collapsed ? "Perluas sidebar" : "Perkecil sidebar";
  }

  function closeMobileSidebar() {
    shell.classList.remove("mobile-sidebar-open");
    document.body.classList.remove("mobile-sidebar-scroll-lock");
    if (backdrop) backdrop.hidden = true;
    mobileToggle?.setAttribute("aria-expanded", "false");
    mobileToggle?.setAttribute("aria-label", "Buka menu");
    if (mobileToggle) mobileToggle.title = "Buka menu";
  }

  function openMobileSidebar() {
    shell.classList.add("mobile-sidebar-open");
    document.body.classList.add("mobile-sidebar-scroll-lock");
    if (backdrop) backdrop.hidden = false;
    mobileToggle?.setAttribute("aria-expanded", "true");
    mobileToggle?.setAttribute("aria-label", "Tutup menu");
    if (mobileToggle) mobileToggle.title = "Tutup menu";
  }

  function syncSidebarForViewport() {
    if (mobileBreakpoint.matches) {
      shell.classList.remove("sidebar-collapsed");
      closeMobileSidebar();
      return;
    }
    closeMobileSidebar();
    try {
      shell.classList.toggle("sidebar-collapsed", localStorage.getItem(collapsedStorageKey) === "true");
    } catch {
      shell.classList.remove("sidebar-collapsed");
    }
    updateDesktopToggle();
  }

  sidebarToggle?.addEventListener("click", () => {
    if (mobileBreakpoint.matches) return;
    const collapsed = shell.classList.toggle("sidebar-collapsed");
    try {
      localStorage.setItem(collapsedStorageKey, String(collapsed));
    } catch {
      // Preferensi tetap dapat digunakan walau localStorage tidak tersedia.
    }
    updateDesktopToggle();
  });

  mobileToggle?.addEventListener("click", () => {
    if (shell.classList.contains("mobile-sidebar-open")) closeMobileSidebar();
    else openMobileSidebar();
  });
  backdrop?.addEventListener("click", closeMobileSidebar);
  shell.querySelectorAll(".dashboard-sidebar .nav-item").forEach((link) => {
    link.addEventListener("click", () => {
      if (mobileBreakpoint.matches) closeMobileSidebar();
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileSidebar();
  });
  if (mobileBreakpoint.addEventListener) mobileBreakpoint.addEventListener("change", syncSidebarForViewport);
  else mobileBreakpoint.addListener(syncSidebarForViewport);
  syncSidebarForViewport();

  logoutButton?.addEventListener("click", () => {
    sessionStorage.removeItem("washupRole");
    sessionStorage.removeItem("washupUsername");
    window.location.href = appUrl("login.html");
  });

  // Pagination meniru referensi: rentang data, nomor halaman, ellipsis, dan pilihan ukuran halaman.
  const tableBody = document.querySelector("#queue-table-body");
  const tableFooter = document.querySelector("#queue-table-footer");
  const rangeLabel = document.querySelector("#queue-pagination-range");
  const pageSizeSelect = document.querySelector("#queue-page-size");
  const pageNumbers = document.querySelector("#queue-page-numbers");
  const prevButton = document.querySelector("#queue-page-prev");
  const nextButton = document.querySelector("#queue-page-next");

  if (!tableBody || !tableFooter || !rangeLabel || !pageSizeSelect ||
      !pageNumbers || !prevButton || !nextButton) return;

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
        iconWrap.className = "queue-empty-icon";
        iconWrap.setAttribute("aria-hidden", "true");
        iconWrap.innerHTML = `
          <svg viewBox="0 0 48 48" focusable="false">
            <path d="M5 20.5 13 9h22l8 11.5v16H5z"></path>
            <path d="M5 20.5h10l5 5h8l5-5h10"></path>
          </svg>`;

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

  function appendEllipsis() {
    const ellipsis = document.createElement("span");
    ellipsis.className = "queue-page-ellipsis";
    ellipsis.textContent = "…";
    ellipsis.setAttribute("aria-hidden", "true");
    pageNumbers.appendChild(ellipsis);
  }

  function appendPageButton(page, totalPages) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "queue-page-number";
    button.textContent = String(page);
    button.setAttribute("aria-label", `Halaman ${page} dari ${totalPages}`);
    if (page === currentPage) {
      button.classList.add("is-current");
      button.setAttribute("aria-current", "page");
    }
    button.addEventListener("click", () => {
      currentPage = page;
      renderPagination();
    });
    pageNumbers.appendChild(button);
  }

  function renderPageNumbers(totalPages) {
    pageNumbers.replaceChildren();
    if (totalPages <= 7) {
      for (let page = 1; page <= totalPages; page += 1) appendPageButton(page, totalPages);
      return;
    }

    if (currentPage <= 4) {
      for (let page = 1; page <= 5; page += 1) appendPageButton(page, totalPages);
      appendEllipsis();
      appendPageButton(totalPages, totalPages);
      return;
    }

    if (currentPage >= totalPages - 3) {
      appendPageButton(1, totalPages);
      appendEllipsis();
      for (let page = totalPages - 4; page <= totalPages; page += 1) appendPageButton(page, totalPages);
      return;
    }

    appendPageButton(1, totalPages);
    appendEllipsis();
    for (let page = currentPage - 2; page <= currentPage + 2; page += 1) appendPageButton(page, totalPages);
    appendEllipsis();
    appendPageButton(totalPages, totalPages);
  }

  function renderPagination() {
    const rows = getDataRows();
    ensureEmptyState();

    tableFooter.hidden = false;
    const pageSize = Math.max(1, Number.parseInt(pageSizeSelect.value, 10) || 5);
    const totalRows = rows.length;

    if (totalRows === 0) {
      currentPage = 1;
      rangeLabel.textContent = "Showing 0 to 0 of 0 entries";
      pageNumbers.replaceChildren();
      prevButton.disabled = true;
      nextButton.disabled = true;
      return;
    }

    const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
    currentPage = Math.min(Math.max(currentPage, 1), totalPages);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalRows);

    rows.forEach((row, index) => {
      row.hidden = index < startIndex || index >= endIndex;
    });

    rangeLabel.textContent = `Showing ${startIndex + 1} to ${endIndex} of ${totalRows} entries`;
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
    renderPageNumbers(totalPages);
  }

  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage -= 1;
      renderPagination();
    }
  });
  nextButton.addEventListener("click", () => {
    const pageSize = Math.max(1, Number.parseInt(pageSizeSelect.value, 10) || 5);
    const totalPages = Math.ceil(getDataRows().length / pageSize);
    if (currentPage < totalPages) {
      currentPage += 1;
      renderPagination();
    }
  });
  pageSizeSelect.addEventListener("change", () => {
    currentPage = 1;
    renderPagination();
  });

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
  const money = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")},00`;
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


/* =========================================================
   EDIT PROFIL KASIR — popover kecil tepat di bawah profil topbar.
   Avatar tetap default; tidak ada fitur unggah/ganti foto.
   ========================================================= */
(() => {
  "use strict";

  const trigger = document.querySelector("#profile-edit-trigger");
  const dialog = document.querySelector("#profile-edit-dialog");
  const form = document.querySelector("#profile-edit-form");
  if (!trigger || !dialog || !form) return;

  const usernameInput = document.querySelector("#profile-username");
  const currentPasswordInput = document.querySelector("#profile-current-password");
  const newPasswordInput = document.querySelector("#profile-password");
  const displayUsername = document.querySelector("#profile-display-username");
  const displayRole = document.querySelector("#profile-display-role");
  const message = document.querySelector("#profile-form-message");
  const saveButton = document.querySelector("#profile-edit-save");
  const closeButton = document.querySelector("#profile-edit-close");
  const cancelButton = document.querySelector("#profile-edit-cancel");

  let editingAccountId = null;

  const normalized = (value) => String(value || "").trim().toLowerCase();

  function currentAccount(records = getUserAccounts()) {
    const username = normalized(sessionStorage.getItem("washupUsername"));
    const role = sessionStorage.getItem("washupRole");
    return records.find((account) =>
      normalized(account.username) === username && account.role === role
    ) || records.find((account) => account.protected && account.role === role) || null;
  }

  function setHeaderProfile(account) {
    if (!account) return;
    if (displayUsername) displayUsername.textContent = account.username || "Kasir";
    if (displayRole) displayRole.textContent = `Role: ${account.role || "Kasir"}`;
    trigger.setAttribute("aria-label", `Edit profil ${account.username || "pengguna"}`);
    trigger.title = `Edit profil ${account.username || "pengguna"}`;
  }

  function positionPopover() {
    if (!dialog.open) return;

    const triggerRect = trigger.getBoundingClientRect();
    const viewportPadding = 12;
    const popoverWidth = Math.min(340, window.innerWidth - viewportPadding * 2);
    const measuredWidth = dialog.getBoundingClientRect().width || popoverWidth;
    const width = Math.min(measuredWidth, popoverWidth);

    // Right-align the popover with the profile control, then clamp to the viewport.
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
      const label = target?.id === "profile-current-password"
        ? "password lama" : "password baru";
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
      message.textContent = "Akun tidak ditemukan. Silakan keluar dan masuk kembali.";
      showPopover();
      return;
    }

    editingAccountId = account.id;
    usernameInput.value = account.username || "";
    currentPasswordInput.value = String(account.password || "");
    newPasswordInput.value = "";
    message.textContent = "";
    saveButton.disabled = false;
    resetPasswordVisibility();

    showPopover();
    usernameInput.focus({ preventScroll: true });
  }

  function closeDialog({ restoreFocus = false } = {}) {
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else dialog.removeAttribute("open");

    form.reset();
    editingAccountId = null;
    message.textContent = "";
    saveButton.disabled = false;
    resetPasswordVisibility();
    trigger.setAttribute("aria-expanded", "false");
    if (restoreFocus) trigger.focus();
  }

  function toggleDialog() {
    if (dialog.open) closeDialog();
    else openDialog();
  }

  trigger.addEventListener("click", toggleDialog);
  trigger.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleDialog();
    }
  });

  dialog.querySelectorAll("[data-password-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.passwordToggle);
      if (!target) return;

      const shouldShow = target.type === "password";
      target.type = shouldShow ? "text" : "password";

      const label = target.id === "profile-current-password"
        ? "password lama" : "password baru";
      button.setAttribute("aria-pressed", String(shouldShow));
      button.setAttribute("aria-label", `${shouldShow ? "Sembunyikan" : "Tampilkan"} ${label}`);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const username = normalized(usernameInput.value);
    const newPassword = String(newPasswordInput.value || "");

    if (!username) {
      message.textContent = "Username wajib diisi.";
      usernameInput.focus();
      return;
    }
    if (username.length > 40) {
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

      const duplicate = records.some((account, index) =>
        index !== accountIndex && normalized(account.username) === username
      );
      if (duplicate) {
        message.textContent = "Username sudah digunakan akun lain. Gunakan username yang berbeda.";
        usernameInput.focus();
        return;
      }

      const current = records[accountIndex];
      const updated = {
        ...current,
        username,
        password: newPassword || current.password,
        updatedAt: Date.now(),
      };

      delete updated.profilePhoto;
      records[accountIndex] = updated;
      saveMasterRecords(masterDefinitions.users, records);
      sessionStorage.setItem("washupUsername", username);
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

  // Outside click closes the compact popover; clicking the profile control toggles it.
  document.addEventListener("pointerdown", (event) => {
    if (!dialog.open) return;
    if (!dialog.contains(event.target) && !trigger.contains(event.target)) {
      closeDialog();
    }
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
})();

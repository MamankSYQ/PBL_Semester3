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
  vehicles: 45,
  transactions: 38,
  queue: 7,
  revenue: 2850000,
};

const serviceOptions = {
  Mobil: [
    { name: "Cuci Mobil", price: 25000 },
    { name: "Cuci + Vacuum", price: 35000 },
    { name: "Cuci + Wax", price: 50000 },
  ],
  Motor: [
    { name: "Cuci Motor", price: 15000 },
    { name: "Cuci + Wax Motor", price: 25000 },
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
    { id: "service-mobil-1", name: "Cuci Mobil", vehicleType: "Mobil", price: 25000, status: "Aktif" },
    { id: "service-mobil-2", name: "Cuci + Vacuum", vehicleType: "Mobil", price: 35000, status: "Aktif" },
    { id: "service-mobil-3", name: "Cuci + Wax", vehicleType: "Mobil", price: 50000, status: "Aktif" },
    { id: "service-motor-1", name: "Cuci Motor", vehicleType: "Motor", price: 15000, status: "Aktif" },
    { id: "service-motor-2", name: "Cuci + Wax Motor", vehicleType: "Motor", price: 25000, status: "Aktif" },
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
  const records = readMasterRecords(definition);
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
  const records = readMasterRecords(definition);
  if (!records.length) return serviceOptions;
  return records.reduce((grouped, service) => {
    if (service.status !== "Aktif" || !service.name || !service.vehicleType || Number(service.price) <= 0) return grouped;
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
    const detailTitle = document.querySelector("#master-detail-title");
    if (detailTitle) detailTitle.textContent = `Detail ${definition.title}`;
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

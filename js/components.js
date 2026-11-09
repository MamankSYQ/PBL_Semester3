// Ikon WASHUP: satu set ikon garis (24x24, stroke) untuk menu dan kartu ringkasan semua role.
const WASHUP_ICONS = {
  "home": '<path d="m3 9.5 9-7 9 7V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  "plus": '<path d="M12 5v14M5 12h14"/>',
  "list": '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  "credit-card": '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
  "history": '<path d="M3 12a9 9 0 1 0 2.64-6.36L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  "file-text": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
  "calendar": '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  "calendar-check": '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9 16 2 2 4-4"/>',
  "clipboard-check": '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="m9 14 2 2 4-4"/>',
  "user": '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
  "users": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  "chart": '<path d="M3 3v18h18"/><path d="m7 14 4-4 4 3 6-7"/>',
  "log-in": '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5M15 12H3"/>',
  "log-out": '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  "receipt": '<path d="M5 2v20l2.5-1.5L10 22l2-1.5 2 1.5 2.5-1.5L19 22V2l-2.5 1.5L14 2l-2 1.5L10 2 7.5 3.5z"/><path d="M9 8h6M9 12h6M9 16h4"/>'
};

// Merender ikon berdasarkan nama. "rupiah" dirender sebagai teks Rp.
function renderIcon(name, className = "wu-icon") {
  if (name === "rupiah") return `<span class="${className} wu-icon-rp" aria-hidden="true">Rp</span>`;
  const paths = WASHUP_ICONS[name];
  if (!paths) return "";
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths}</svg>`;
}

// Mengisi semua elemen [data-icon] di halaman dengan ikon dari WASHUP_ICONS.
function mountIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((element) => {
    element.innerHTML = renderIcon(element.dataset.icon);
  });
}

const WASHUP_MENUS = {
  Admin: [
    { page: "dashboard", href: "dashboard-admin.html", label: "Dashboard", icon: renderIcon("home", "nav-icon-svg") },
    { page: "services", href: "layanan-tarif.html", label: "Layanan & Tarif", icon: renderIcon("rupiah", "nav-icon-rp") },
    { page: "shifts", href: "data-shift.html", label: "Data Shift", icon: renderIcon("calendar", "nav-icon-svg") },
    { page: "verification", href: "verifikasi-absensi.html", label: "Verifikasi Absensi", icon: renderIcon("clipboard-check", "nav-icon-svg") },
    { page: "users", href: "akun-pengguna.html", label: "Akun Pengguna", icon: renderIcon("user", "nav-icon-svg") }
  ],
  Owner: [
    { page: "dashboard", href: "dashboard-owner.html", label: "Dashboard", icon: renderIcon("home", "nav-icon-svg") },
    { page: "transactions", href: "laporan-transaksi.html", label: "Laporan Transaksi", icon: renderIcon("receipt", "nav-icon-svg") },
    { page: "finance", href: "laporan-keuangan.html", label: "Laporan Keuangan", icon: renderIcon("rupiah", "nav-icon-rp") },
    { page: "employees", href: "laporan-karyawan.html", label: "Laporan Karyawan", icon: renderIcon("users", "nav-icon-svg") },
    { page: "stats", href: "statistik-layanan.html", label: "Statistik Layanan", icon: renderIcon("chart", "nav-icon-svg") }
  ],
  Kasir: [
    { page: "dashboard", href: "dashboard-kasir.html", label: "Dashboard", icon: renderIcon("home", "nav-icon-svg") },
    { page: "new-transaction", href: "transaksi-baru.html", label: "Transaksi Baru", icon: renderIcon("plus", "nav-icon-svg") },
    { page: "queue", href: "antrean.html", label: "Antrean", icon: renderIcon("list", "nav-icon-svg") },
    { page: "payment", href: "pembayaran.html", label: "Pembayaran", icon: renderIcon("credit-card", "nav-icon-svg") },
    { page: "history", href: "riwayat-transaksi.html", label: "Riwayat Transaksi", icon: renderIcon("history", "nav-icon-svg") },
    { page: "expenses", href: "pengeluaran.html", label: "Pengeluaran", icon: renderIcon("file-text", "nav-icon-svg") }
  ],
  Petugas: [
    { page: "dashboard", href: "dashboard-petugas.html", label: "Dashboard", icon: renderIcon("home", "nav-icon-svg") },
    { page: "checkin", href: "absensi-masuk.html", label: "Absensi Masuk", icon: renderIcon("log-in", "nav-icon-svg") },
    { page: "checkout", href: "absensi-keluar.html", label: "Absensi Keluar", icon: renderIcon("log-out", "nav-icon-svg") },
    { page: "recap", href: "rekap-absensi.html", label: "Rekap Absensi", icon: renderIcon("calendar-check", "nav-icon-svg") }
  ]
};

const WASHUP_ROLE_META = {
  Admin: { menuLabel: "MENU ADMIN", note: "Area Monitoring Admin", home: "dashboard-admin.html", sidebarLabel: "Navigasi Admin", brandLabel: "WASHUP Dashboard Admin" },
  Owner: { menuLabel: "MENU OWNER", note: "Area Monitoring Owner", home: "dashboard-owner.html", sidebarLabel: "Navigasi Owner", brandLabel: "WASHUP Dashboard Owner" },
  Kasir: { menuLabel: "MENU KASIR", note: "Area Kerja Kasir", home: "dashboard-kasir.html", sidebarLabel: "Navigasi Kasir", brandLabel: "WASHUP Dashboard Kasir" },
  Petugas: { menuLabel: "MENU PETUGAS", note: "Area Monitoring Petugas", home: "dashboard-petugas.html", sidebarLabel: "Navigasi Petugas", brandLabel: "WASHUP Dashboard Petugas" }
};

// Mengamankan teks dinamis sebelum dimasukkan ke markup HTML.
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

// Merender navigasi role beserta tombol logout yang dipakai app.js.
function renderSidebar(role, activePage, logoutId) {
  const roleMeta = WASHUP_ROLE_META[role];
  const menu = WASHUP_MENUS[role];
  if (!roleMeta || !menu) throw new Error(`Role WASHUP tidak dikenal: ${role}`);

  const links = menu.map((item) => {
    const active = item.page === activePage;
    return `<a class="nav-item${active ? " active" : ""}" href="${escapeHTML(item.href)}"${active ? ' aria-current="page"' : ""} title="${escapeHTML(item.label)}" aria-label="${escapeHTML(item.label)}">${item.icon}<span class="nav-text">${escapeHTML(item.label)}</span></a>`;
  }).join("\n          ");

  return `<aside class="dashboard-sidebar" id="dashboard-drawer" aria-label="${escapeHTML(roleMeta.sidebarLabel)}">
        <a class="dashboard-brand" href="${escapeHTML(roleMeta.home)}" aria-label="${escapeHTML(roleMeta.brandLabel)}">
          <img class="brand-logo-img" src="../../assets/logo-washup.png" width="68" height="52" alt="Logo mobil cuci WASHUP" />
          <span class="brand-text">WASHUP</span>
        </a>

        <button class="drawer-close" id="mobile-menu-close" type="button" aria-label="Tutup menu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg></button>

        <nav class="dashboard-nav" id="dashboard-nav" aria-label="Menu utama">
          <p class="nav-label">${roleMeta.menuLabel}</p>
          ${links}
        </nav>

        <div class="sidebar-bottom">
          <p class="sidebar-note">${roleMeta.note}</p>
          <button class="sidebar-logout" id="${escapeHTML(logoutId)}" type="button"><svg class="logout-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></svg><span class="logout-text">Logout</span></button>
        </div>
      </aside>`;
}

// Merender tombol ciut sidebar sebagai saudara langsung elemen aside.
function renderSidebarToggle() {
  return `<button class="sidebar-collapse-toggle" id="sidebar-collapse-toggle" type="button" aria-expanded="true" aria-label="Ciutkan menu samping" title="Ciutkan menu samping"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5-7 7 7 7" /></svg></button>`;
}

// Merender topbar dengan judul dan identitas role seperti halaman sumbernya.
function renderTopbar(title, role) {
  const headingId = role === "Admin" && document.body.hasAttribute("data-master")
    ? ' id="master-page-heading"'
    : "";
  return `<header class="dashboard-topbar">
          <button class="topbar-menu-button" id="mobile-menu-toggle" type="button" aria-expanded="false" aria-controls="dashboard-drawer" aria-label="Buka menu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg></button>
          <div class="topbar-title-wrap">
            <h1${headingId}>${escapeHTML(title)}</h1>
          </div>
          <button class="user-summary profile-trigger" id="profile-edit-trigger" type="button" aria-label="Edit profil pengguna" aria-haspopup="dialog" aria-expanded="false" aria-controls="profile-edit-dialog" title="Edit profil">
            <div class="user-avatar-circle" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">${WASHUP_ICONS.user}</svg>
            </div>
            <div class="user-info">
              <strong id="profile-display-username">${escapeHTML(role)}</strong>
              <small id="profile-display-role">Role: ${escapeHTML(role)}</small>
            </div>
          </button>
        </header>`;
}

function renderProfileEditor() {
  return `<dialog class="profile-edit-dialog" id="profile-edit-dialog" aria-labelledby="profile-edit-title">
      <form class="profile-edit-form" id="profile-edit-form">
        <header class="profile-edit-heading">
          <div>
            <p class="eyebrow">PENGATURAN AKUN</p>
            <h2 id="profile-edit-title">Edit Profil</h2>
            <p class="profile-edit-subtitle">Perbarui informasi akun kamu.</p>
          </div>
          <button class="profile-edit-close" id="profile-edit-close" type="button" aria-label="Tutup">×</button>
        </header>
        <section class="profile-photo-section profile-default-avatar-section" aria-label="Foto profil default">
          <div class="profile-photo-preview" aria-hidden="true">
            <svg id="profile-photo-placeholder" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </div>
          <div class="profile-photo-controls">
            <span class="profile-photo-label">Foto Profil</span>
            <small>Foto profil default WASHUP. Foto ini tidak dapat diganti.</small>
          </div>
        </section>
        <label class="profile-form-field" for="profile-username">
          Username
          <input id="profile-username" name="username" type="text" maxlength="40" autocomplete="username" required placeholder="Masukkan username" />
          <small id="profile-username-note" hidden>Akun admin dilindungi dan username tidak dapat diubah.</small>
        </label>
        <label class="profile-form-field profile-password-field-label" for="profile-current-password">
          Password Lama
          <span class="profile-password-control">
            <input id="profile-current-password" name="profile-current-password" type="password" autocomplete="current-password" readonly aria-readonly="true" placeholder="••••••••" />
            <button class="profile-password-toggle" type="button" data-password-toggle="profile-current-password" aria-label="Tampilkan password lama" aria-pressed="false">
              <svg class="password-eye-show" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.4-6.2 9.5-6.2 9.5 6.2 9.5 6.2-3.4 6.2-9.5 6.2S2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.7" /></svg>
              <svg class="password-eye-hide" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3 21 21M10.6 6a9.7 9.7 0 0 1 1.4-.1c6.1 0 9.5 6.1 9.5 6.1s-1.1 2-3.1 3.7M6.2 6.3C3.8 7.8 2.5 12 2.5 12s3.4 6.2 9.5 6.2c1.2 0 2.3-.3 3.2-.7" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
            </button>
          </span>
        </label>
        <label class="profile-form-field profile-password-field-label" for="profile-password">
          Password Baru
          <span class="profile-password-control">
            <input id="profile-password" name="profile-password" type="password" autocomplete="new-password" minlength="6" placeholder="Masukkan password baru" />
            <button class="profile-password-toggle" type="button" data-password-toggle="profile-password" aria-label="Tampilkan password baru" aria-pressed="false">
              <svg class="password-eye-show" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.4-6.2 9.5-6.2 9.5 6.2 9.5 6.2-3.4 6.2-9.5 6.2S2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.7" /></svg>
              <svg class="password-eye-hide" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3 21 21M10.6 6a9.7 9.7 0 0 1 1.4-.1c6.1 0 9.5 6.1 9.5 6.1s-1.1 2-3.1 3.7M6.2 6.3C3.8 7.8 2.5 12 2.5 12s3.4 6.2 9.5 6.2c1.2 0 2.3-.3 3.2-.7" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
            </button>
          </span>
          <small>Kosongkan jika tidak ingin mengubah password.</small>
        </label>
        <p class="profile-form-message" id="profile-form-message" role="status" aria-live="polite"></p>
        <footer class="profile-edit-actions">
          <button class="profile-button-secondary" id="profile-edit-cancel" type="button">Batal</button>
          <button class="profile-button-primary" id="profile-edit-save" type="submit">Simpan Perubahan</button>
        </footer>
      </form>
    </dialog>`;
}

// Merender footer dengan tahun yang diperbarui app.js.
function renderFooter(label) {
  return `<footer class="dashboard-footer"><div class="footer-copy"><span class="c-icon-circle" aria-hidden="true">&copy;</span><span id="current-year"></span><span>WASHUP - ${escapeHTML(label)}</span></div><div class="footer-location">Maju Bersama Car Wash 2 · Kota Malang</div></footer>`;
}

// Mengganti semua placeholder shell sebelum app.js memasang perilaku halaman.
function mountAppShell() {
  const { role, page, title, logoutId } = document.body.dataset;
  if (!role || !page || !title || !logoutId) {
    throw new Error("Atribut data-role, data-page, data-title, dan data-logout-id wajib diisi.");
  }

  const sidebar = document.querySelector('[data-component="sidebar"]');
  const topbar = document.querySelector('[data-component="topbar"]');
  const footer = document.querySelector('[data-component="footer"]');
  if (!sidebar || !topbar || !footer) {
    throw new Error("Placeholder sidebar, topbar, dan footer WASHUP harus tersedia.");
  }

  const footerLabel = document.body.hasAttribute("data-footer")
    ? document.body.dataset.footer
    : title;
  sidebar.outerHTML = `${renderSidebar(role, page, logoutId)}${renderSidebarToggle()}`;
  topbar.outerHTML = renderTopbar(title, role);
  footer.outerHTML = renderFooter(footerLabel);
  document.body.insertAdjacentHTML("beforeend", `<div class="sidebar-overlay" id="sidebar-overlay" hidden></div>`);
  document.body.insertAdjacentHTML("beforeend", renderProfileEditor());
  mountIcons();
  setupMobileMenu();
}

// Menu hamburger untuk layar HP: sidebar menjadi drawer yang meluncur dari kiri di atas
// latar gelap. Tutup lewat tombol X, klik latar, tombol Esc, atau memilih menu.
function setupMobileMenu() {
  const drawer = document.getElementById("dashboard-drawer");
  const toggle = document.getElementById("mobile-menu-toggle");
  const close = document.getElementById("mobile-menu-close");
  const overlay = document.getElementById("sidebar-overlay");
  if (!drawer || !toggle || !overlay) return;
  const mobile = window.matchMedia("(max-width: 768px)");

  const setOpen = (isOpen, { restoreFocus = true } = {}) => {
    drawer.classList.toggle("is-menu-open", isOpen);
    document.body.classList.toggle("is-drawer-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Tutup menu" : "Buka menu");
    overlay.hidden = !isOpen;
    if (isOpen) {
      (drawer.querySelector(".nav-item.active") || close || drawer).focus?.();
    } else if (restoreFocus && mobile.matches) {
      toggle.focus();
    }
  };

  toggle.addEventListener("click", () => setOpen(!drawer.classList.contains("is-menu-open")));
  close?.addEventListener("click", () => setOpen(false));
  overlay.addEventListener("click", () => setOpen(false));
  drawer.querySelectorAll(".nav-item").forEach((link) => link.addEventListener("click", () => setOpen(false, { restoreFocus: false })));
  document.addEventListener("keydown", (event) => {
    if (!drawer.classList.contains("is-menu-open")) return;
    if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "Tab" && mobile.matches) {
      // Fokus keyboard tetap di dalam drawer selama terbuka.
      const focusable = [...drawer.querySelectorAll("a[href], button:not([disabled])")].filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  mobile.addEventListener("change", (event) => {
    if (!event.matches) setOpen(false, { restoreFocus: false });
  });
}

// ---------------------------------------------------------------------------
// Paginasi seragam untuk semua tabel: "Sebelumnya  1  2  Selanjutnya".
// ---------------------------------------------------------------------------

// Daftar nomor halaman; halaman jauh diringkas dengan "…" agar tidak melebar.
function pagerItems(total, current) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const wanted = [...new Set([1, current - 1, current, current + 1, total])]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);
  const items = [];
  wanted.forEach((page, index) => {
    if (index && page - wanted[index - 1] > 1) items.push("…");
    items.push(page);
  });
  return items;
}

// Menggambar kontrol halaman ke dalam elemen <nav>. Disembunyikan jika hanya 1 halaman.
function renderPager(nav, { page, total, onChange }) {
  nav.replaceChildren();
  nav.hidden = total <= 1;
  if (total <= 1) return;

  const makeButton = (label, className, target, ariaLabel) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `wu-pager-btn ${className}`;
    button.textContent = label;
    if (ariaLabel) button.setAttribute("aria-label", ariaLabel);
    button.addEventListener("click", () => onChange(target));
    return button;
  };

  const previous = makeButton("Sebelumnya", "wu-pager-step", page - 1, "Halaman sebelumnya");
  previous.disabled = page <= 1;
  const pages = document.createElement("div");
  pages.className = "wu-pager-pages";
  pagerItems(total, page).forEach((item) => {
    if (item === "…") {
      const dots = document.createElement("span");
      dots.className = "wu-pager-dots";
      dots.setAttribute("aria-hidden", "true");
      dots.textContent = "…";
      pages.append(dots);
      return;
    }
    const button = makeButton(String(item), "wu-pager-num", item, `Halaman ${item}`);
    if (item === page) {
      button.classList.add("is-current");
      button.setAttribute("aria-current", "page");
    }
    pages.append(button);
  });
  const next = makeButton("Selanjutnya", "wu-pager-step", page + 1, "Halaman berikutnya");
  next.disabled = page >= total;
  nav.append(previous, pages, next);
}

// Membuat <nav class="wu-pager"> tepat setelah pembungkus tabel (atau memakai yang sudah ada).
function ensurePager(anchor, id, label) {
  let nav = id ? document.getElementById(id) : null;
  if (!nav) {
    nav = document.createElement("nav");
    if (id) nav.id = id;
    anchor.after(nav);
  }
  nav.classList.add("wu-pager");
  nav.setAttribute("aria-label", label || "Navigasi halaman tabel");
  return nav;
}

// Paginasi otomatis untuk <tbody> yang barisnya dirender skrip lain: baris di luar halaman
// disembunyikan, dan kontrol halaman diperbarui setiap isi tabel berubah.
function paginateTable(tbody, { pageSize = 5, label } = {}) {
  const table = tbody?.closest("table");
  if (!table) return;
  const anchor = table.closest(".table-wrap, .queue-table-wrap, .history-table-wrap, .payment-table-wrap") || table;
  const nav = ensurePager(anchor, "", label || "Navigasi halaman tabel");
  let page = 1;
  const apply = () => {
    const rows = [...tbody.children].filter((row) => row.tagName === "TR");
    const total = Math.max(1, Math.ceil(rows.length / pageSize));
    page = Math.min(Math.max(1, page), total);
    rows.forEach((row, index) => {
      row.hidden = index < (page - 1) * pageSize || index >= page * pageSize;
    });
    renderPager(nav, { page, total, onChange: (target) => { page = target; apply(); } });
  };
  new MutationObserver(apply).observe(tbody, { childList: true });
  apply();
}

// Tabel yang barisnya dirender langsung di browser (tanpa paginasi bawaan).
function mountTablePagination() {
  [
    ["master-table-body", "Navigasi halaman data"],
    ["verification-table-body", "Navigasi halaman verifikasi absensi"],
    ["expense-table-body", "Navigasi halaman pengeluaran"],
    ["admin-recent-body", "Navigasi halaman aktivitas terbaru"],
    ["owner-recent-body", "Navigasi halaman transaksi terbaru"],
    ["owner-report-table-body", "Navigasi halaman laporan transaksi"],
    ["owner-attendance-body", "Navigasi halaman laporan karyawan"],
    ["owner-income-body", "Navigasi halaman pemasukan"],
    ["owner-expense-body", "Navigasi halaman pengeluaran"],
    ["petugas-dashboard-body", "Navigasi halaman absensi terbaru"],
  ].forEach(([id, label]) => paginateTable(document.getElementById(id), { label }));
}


// Menandai judul halaman dan judul kartu supaya ukuran/jarak seragam di semua role
// (struktur HTML tiap halaman berbeda-beda, jadi hierarkinya diterapkan lewat kelas ini).
function markHeadings() {
  const main = document.querySelector("main");
  if (!main) return;
  const titles = [...main.querySelectorAll("h2")];
  titles.forEach((title, index) => {
    title.classList.add(index === 0 ? "wu-page-title" : "wu-card-title");
  });
  const pageTitle = titles[0];
  if (!pageTitle) return;
  pageTitle.parentElement.classList.add("wu-page-head");
  const header = pageTitle.closest("main > *");
  if (header) header.classList.add("wu-page-header");
}

window.WashupPager = { renderPager, ensurePager, paginateTable };

mountAppShell();
markHeadings();
mountTablePagination();

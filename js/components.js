const WASHUP_MENUS = {
  Admin: [
    { page: "dashboard", href: "dashboard-admin.html", label: "Dashboard", icon: `<svg class="nav-icon-svg" viewBox="0 0 36 36" aria-hidden="true"><path fill="currentColor" d="M33 19a1 1 0 0 1-.71-.29L18 4.41L3.71 18.71A1 1 0 0 1 2.3 17.3l15-15a1 1 0 0 1 1.41 0l15 15A1 1 0 0 1 33 19Z" /><path fill="currentColor" d="M18 7.79L6 19.79V32a2 2 0 0 0 2 2h7V22h6v12h7a2 2 0 0 0 2-2V19.79ZM28 32h-3V20H11v12H8V19.38l10-10l10 10Z" /></svg>` },
    { page: "services", href: "layanan-tarif.html", label: "Layanan & Tarif", icon: `<span class="nav-icon-rp" aria-hidden="true">Rp</span>` },
    { page: "shifts", href: "data-shift.html", label: "Data Shift", icon: `<svg class="nav-icon-svg" viewBox="0 0 36 36" aria-hidden="true"><path fill="currentColor" d="M32.25 6h-4v3a1 1 0 0 1-2 0V6h-7v3a1 1 0 0 1-2 0V6h-7v3a1 1 0 0 1-2 0V6h-4.5A2.76 2.76 0 0 0 1 8.75v21.5A2.76 2.76 0 0 0 3.75 33h28.5A2.76 2.76 0 0 0 35 30.25V8.75A2.76 2.76 0 0 0 32.25 6ZM33 30.25a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1-.75-.75V15h30ZM33 13H3V8.75a.75.75 0 0 1 .75-.75H8v2a1 1 0 0 0 2 0V8h7v2a1 1 0 0 0 2 0V8h7v2a1 1 0 0 0 2 0V8h4.25a.75.75 0 0 1 .75.75Z" /></svg>` },
    { page: "verification", href: "verifikasi-absensi.html", label: "Verifikasi Absensi", icon: `<svg class="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /><rect x="8" y="2" width="8" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="2" /><path d="M9 14l2 2 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>` },
    { page: "users", href: "akun-pengguna.html", label: "Akun Pengguna", icon: `<svg class="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="4.2" fill="currentColor" /><path d="M5 21v-1.5c0-3.3 3.1-6 7-6s7 2.7 7 6V21H5z" fill="currentColor" /></svg>` }
  ],
  Owner: [
    { page: "dashboard", href: "dashboard-owner.html", label: "Dashboard", icon: `<svg class="nav-icon-svg" viewBox="0 0 36 36" aria-hidden="true"><path fill="currentColor" d="M33 19a1 1 0 0 1-.71-.29L18 4.41L3.71 18.71A1 1 0 0 1 2.3 17.3l15-15a1 1 0 0 1 1.41 0l15 15A1 1 0 0 1 33 19Z" /><path fill="currentColor" d="M18 7.79L6 19.79V32a2 2 0 0 0 2 2h7V22h6v12h7a2 2 0 0 0 2-2V19.79ZM28 32h-3V20H11v12H8V19.38l10-10l10 10Z" /></svg>` },
    { page: "transactions", href: "laporan-transaksi.html", label: "Laporan Transaksi", icon: `<svg class="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14M5 12h14M5 18h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>` },
    { page: "finance", href: "laporan-keuangan.html", label: "Laporan Keuangan", icon: `<span class="nav-icon-rp" aria-hidden="true">Rp</span>` },
    { page: "employees", href: "laporan-karyawan.html", label: "Laporan Karyawan", icon: `<svg class="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm7 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm-7 2c-3.1 0-7 1.6-7 4.5V20h14v-1.5c0-2.9-3.9-4.5-7-4.5zm7 1.5c.9.6 1.8 1.4 1.8 3V20H22v-1.5c0-2-3-3.2-5-3.5z" /></svg>` },
    { page: "stats", href: "statistik-layanan.html", label: "Statistik Layanan", icon: `<svg class="nav-icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 19.5h18M4 17V5m0 12 5-5 4 3 7-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>` }
  ],
  Kasir: [
    { page: "dashboard", href: "dashboard-kasir.html", label: "Dashboard", icon: `<svg class="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>` },
    { page: "new-transaction", href: "transaksi-baru.html", label: "Transaksi Baru", icon: `<svg class="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M12 20v-8m0 0V4m0 8h8m-8 0H4" /></svg>` },
    { page: "queue", href: "antrean.html", label: "Antrean", icon: `<svg class="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 6h16M4 12h16M4 18h16" /></svg>` },
    { page: "payment", href: "pembayaran.html", label: "Pembayaran", icon: `<svg class="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.8" /><path d="M3 10h18M7 15h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>` },
    { page: "history", href: "riwayat-transaksi.html", label: "Riwayat Transaksi", icon: `<svg class="nav-icon-svg" viewBox="0 0 48 48" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.6" d="M8.09 4.5H19a2.05 2.05 0 0 1 2.05 2.05V17.2c0 1.72-1.91 2.74-3 1.65l-3.48-3.5A12.82 12.82 0 1 0 36.83 24c0-3.46-1-6.06-4.93-10c-.84-.84-.1-1.55.38-2l2.28-2.27c.94-.94 1.27-1.12 2.1-.29c4.86 4.86 6.83 8.52 6.84 14.63A19.5 19.5 0 1 1 9.86 10.63C8.69 9.44 8.32 9.06 6.35 7.09c-.77-.76-.08-2.59 1.74-2.59" /></svg>` },
    { page: "expenses", href: "pengeluaran.html", label: "Pengeluaran", icon: `<svg class="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M5 3.8h10l4 4V20H5z" /><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M14.5 3.8v4.5H19M8 12h8M8 15.5h8" /></svg>` }
  ],
  Petugas: [
    { page: "dashboard", href: "dashboard-petugas.html", label: "Dashboard", icon: `<svg class="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" /><path d="M9 21V12h6v9" /></svg>` },
    { page: "checkin", href: "absensi-masuk.html", label: "Absensi Masuk", icon: `<svg class="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>` },
    { page: "checkout", href: "absensi-keluar.html", label: "Absensi Keluar", icon: `<svg class="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>` },
    { page: "recap", href: "rekap-absensi.html", label: "Rekap Absensi", icon: `<svg class="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3v18h18" /><path d="m7 14 4-4 4 3 6-7" /></svg>` }
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

  return `<aside class="dashboard-sidebar" aria-label="${escapeHTML(roleMeta.sidebarLabel)}">
        <a class="dashboard-brand" href="${escapeHTML(roleMeta.home)}" aria-label="${escapeHTML(roleMeta.brandLabel)}">
          <img class="brand-logo-img" src="../../assets/logo-washup.png" width="68" height="52" alt="Logo mobil cuci WASHUP" />
          <span class="brand-text">WASHUP</span>
        </a>

        <button class="mobile-menu-toggle" id="mobile-menu-toggle" type="button" aria-expanded="false" aria-controls="dashboard-nav" aria-label="Buka menu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg><span>Menu</span></button>

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
          <div class="topbar-title-wrap">
            <h1${headingId}>${escapeHTML(title)}</h1>
          </div>
          <button class="user-summary profile-trigger" id="profile-edit-trigger" type="button" aria-label="Edit profil pengguna" aria-haspopup="dialog" aria-expanded="false" aria-controls="profile-edit-dialog" title="Edit profil">
            <div class="user-avatar-circle" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
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
  document.body.insertAdjacentHTML("beforeend", renderProfileEditor());
  setupMobileMenu();
}

// Menu hamburger untuk layar HP: membuka/menutup daftar menu di sidebar.
function setupMobileMenu() {
  const aside = document.querySelector(".dashboard-sidebar");
  const toggle = document.getElementById("mobile-menu-toggle");
  if (!aside || !toggle) return;

  const setOpen = (isOpen) => {
    aside.classList.toggle("is-menu-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Tutup menu" : "Buka menu");
  };

  toggle.addEventListener("click", () => setOpen(!aside.classList.contains("is-menu-open")));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && aside.classList.contains("is-menu-open")) {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia("(min-width: 769px)").addEventListener("change", (event) => {
    if (event.matches) setOpen(false);
  });
}

mountAppShell();

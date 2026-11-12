<?php /** @var string $logoutId */ ?>
<aside class="dashboard-sidebar" aria-label="Navigasi Admin">
  <a class="dashboard-brand" href="dashboard-admin.php" aria-label="WASHUP Dashboard Admin">
    <img class="brand-logo-img" src="../../assets/logo-washup.png" alt="Logo mobil cuci WASHUP" />
    <span class="brand-text">WASHUP</span>
  </a>

  <nav class="dashboard-nav" aria-label="Menu utama">
          <p class="nav-label">MENU ADMIN</p>
          <a class="nav-item<?= nav_active('dashboard-admin') ?>" href="dashboard-admin.php"<?= nav_current('dashboard-admin') ?>>
            <svg class="nav-icon-svg" viewBox="0 0 36 36" aria-hidden="true">
              <path fill="currentColor" d="M33 19a1 1 0 0 1-.71-.29L18 4.41L3.71 18.71A1 1 0 0 1 2.3 17.3l15-15a1 1 0 0 1 1.41 0l15 15A1 1 0 0 1 33 19Z" />
              <path fill="currentColor" d="M18 7.79L6 19.79V32a2 2 0 0 0 2 2h7V22h6v12h7a2 2 0 0 0 2-2V19.79ZM28 32h-3V20H11v12H8V19.38l10-10l10 10Z" />
            </svg>
            Dashboard
          </a>
          <a class="nav-item<?= nav_active('data-pelanggan') ?>" href="data-pelanggan.php"<?= nav_current('data-pelanggan') ?>>
            <svg class="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="7" r="4.2" fill="currentColor" />
              <path d="M4 20.5c0-4.4 3.6-7.5 8-7.5s8 3.1 8 7.5v0.5H4v-0.5z" fill="currentColor" />
            </svg>
            Data Pelanggan
          </a>
          <a class="nav-item<?= nav_active('data-kendaraan') ?>" href="data-kendaraan.php"<?= nav_current('data-kendaraan') ?>>
            <svg class="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3.5" y="5.5" width="17" height="2.6" rx="1.3" fill="currentColor" />
              <rect x="3.5" y="10.7" width="17" height="2.6" rx="1.3" fill="currentColor" />
              <rect x="3.5" y="15.9" width="17" height="2.6" rx="1.3" fill="currentColor" />
            </svg>
            Data Kendaraan
          </a>
          <a class="nav-item<?= nav_active('layanan-tarif') ?>" href="layanan-tarif.php"<?= nav_current('layanan-tarif') ?>>
            <span class="nav-icon-rp" aria-hidden="true">Rp</span>
            Layanan &amp; Tarif
          </a>
          <a class="nav-item<?= nav_active('data-karyawan') ?>" href="data-karyawan.php"<?= nav_current('data-karyawan') ?>>
            <svg class="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm7 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm-7 2c-3.1 0-7 1.6-7 4.5V20h14v-1.5c0-2.9-3.9-4.5-7-4.5zm7 1.5c.9.6 1.8 1.4 1.8 3V20H22v-1.5c0-2-3-3.2-5-3.5z" fill="currentColor" />
            </svg>
            Data Karyawan
          </a>
          <a class="nav-item<?= nav_active('data-shift') ?>" href="data-shift.php"<?= nav_current('data-shift') ?>>
            <svg class="nav-icon-svg" viewBox="0 0 36 36" aria-hidden="true">
              <path fill="currentColor" d="M32.25 6h-4v3a1 1 0 0 1-2 0V6h-7v3a1 1 0 0 1-2 0V6h-7v3a1 1 0 0 1-2 0V6h-4.5A2.76 2.76 0 0 0 1 8.75v21.5A2.76 2.76 0 0 0 3.75 33h28.5A2.76 2.76 0 0 0 35 30.25V8.75A2.76 2.76 0 0 0 32.25 6ZM33 30.25a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1-.75-.75V15h30ZM33 13H3V8.75a.75.75 0 0 1 .75-.75H8v2a1 1 0 0 0 2 0V8h7v2a1 1 0 0 0 2 0V8h7v2a1 1 0 0 0 2 0V8h4.25a.75.75 0 0 1 .75.75Z" />
            </svg>
            Data Shift
          </a>
          <a class="nav-item<?= nav_active('absensi-lembur') ?>" href="absensi-lembur.php"<?= nav_current('absensi-lembur') ?>>
            <svg class="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <rect x="8" y="2" width="8" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="2" />
              <path d="M9 14l2 2 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Absensi &amp; Lembur
          </a>
          <a class="nav-item<?= nav_active('akun-pengguna') ?>" href="akun-pengguna.php"<?= nav_current('akun-pengguna') ?>>
            <svg class="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="7" r="4.2" fill="currentColor" />
              <path d="M5 21v-1.5c0-3.3 3.1-6 7-6s7 2.7 7 6V21H5z" fill="currentColor" />
            </svg>
            Akun Pengguna
          </a>
        </nav>

  <div class="sidebar-bottom">
    <p class="sidebar-note">Area Monitoring Admin</p>
    <form method="post" action="../../logout.php" style="display:contents">
      <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>" />
      <button class="sidebar-logout" id="<?= e($logoutId ?? 'logout') ?>" type="submit">Logout</button>
    </form>
  </div>
</aside>

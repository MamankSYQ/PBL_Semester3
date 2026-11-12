<?php /** @var string $logoutId */ ?>
<aside class="dashboard-sidebar" aria-label="Navigasi Petugas">
  <a class="dashboard-brand" href="dashboard-petugas.php" aria-label="WASHUP Dashboard Petugas">
    <img class="brand-logo-img" src="../../assets/logo-washup.png" alt="Logo mobil cuci WASHUP" />
    <span class="brand-text">WASHUP</span>
  </a>

  <nav class="dashboard-nav" aria-label="Menu utama">
          <p class="nav-label">MENU PETUGAS</p>
          <a class="nav-item<?= nav_active('dashboard-petugas') ?>" href="dashboard-petugas.php"<?= nav_current('dashboard-petugas') ?>>
            <svg class="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
              <path d="m3 10 9-7 9 7v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
              <path d="M9 21V12h6v9" />
            </svg>
            Dashboard
          </a>
          <a class="nav-item<?= nav_active('absensi-petugas') ?>" href="absensi-petugas.php"<?= nav_current('absensi-petugas') ?>>
            <svg class="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Absensi Masuk
          </a>
          <a class="nav-item<?= nav_active('absensi-petugas') ?>" href="absensi-petugas.php"<?= nav_current('absensi-petugas') ?>>
            <svg class="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Absensi Keluar
          </a>
        </nav>

  <div class="sidebar-bottom">
    <p class="sidebar-note">Area Monitoring Petugas</p>
    <form method="post" action="../../logout.php" style="display:contents">
      <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>" />
      <button class="sidebar-logout" id="<?= e($logoutId ?? 'logout') ?>" type="submit">Logout</button>
    </form>
  </div>
</aside>

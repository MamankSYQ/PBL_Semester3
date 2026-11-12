<?php /** @var string $logoutId */ ?>
<aside class="dashboard-sidebar" aria-label="Navigasi Petugas">
  <a class="dashboard-brand" href="dashboard-petugas.php" aria-label="WASHUP Dashboard Petugas">
    <span class="brand-mark">W</span>
    <span>
      <strong>WASHUP</strong>
      <small>Sistem Car Wash</small>
    </span>
  </a>

  <nav class="dashboard-nav" aria-label="Menu utama">
    <p class="nav-label">MENU PETUGAS</p>
      <a class="nav-item<?= nav_active('dashboard-petugas') ?>" href="dashboard-petugas.php"<?= nav_current('dashboard-petugas') ?>>
        <span class="nav-icon" aria-hidden="true">⌂</span>
        Dashboard
      </a>
      <a class="nav-item<?= nav_active('antrean-petugas') ?>" href="antrean-petugas.php"<?= nav_current('antrean-petugas') ?>>
        <span class="nav-icon" aria-hidden="true">≡</span>
        Antrean
      </a>
      <a class="nav-item<?= nav_active('absensi-petugas') ?>" href="absensi-petugas.php"<?= nav_current('absensi-petugas') ?>>
        <span class="nav-icon" aria-hidden="true">✓</span>
        Absensi
      </a>
  </nav>

  <div class="sidebar-bottom">
    <p class="sidebar-note">Area kerja Petugas</p>
    <form method="post" action="../../logout.php" style="display:contents">
      <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>" />
      <button class="sidebar-logout" id="<?= e($logoutId ?? 'logout') ?>" type="submit"><span class="nav-icon" aria-hidden="true">↪</span>Logout</button>
    </form>
  </div>
</aside>

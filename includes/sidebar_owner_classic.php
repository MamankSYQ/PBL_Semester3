<?php /** @var string $logoutId */ /** @var string $ownerPlaceholderAttr */ ?>
<aside class="dashboard-sidebar" aria-label="Navigasi Owner">
  <a class="dashboard-brand" href="dashboard-owner.php" aria-label="WASHUP Dashboard Owner">
    <span class="brand-mark">W</span>
    <span>
      <strong>WASHUP</strong>
      <small>Sistem Car Wash</small>
    </span>
  </a>

  <nav class="dashboard-nav" aria-label="Menu utama">
    <p class="nav-label">MENU OWNER</p>
      <a class="nav-item<?= nav_active('dashboard-owner') ?>" href="dashboard-owner.php"<?= nav_current('dashboard-owner') ?>>
        <span class="nav-icon" aria-hidden="true">⌂</span>
        Dashboard
      </a>
      <a class="nav-item<?= nav_active('laporan-transaksi') ?>" href="laporan-transaksi.php"<?= nav_current('laporan-transaksi') ?>>
        <span class="nav-icon" aria-hidden="true">≡</span>
        Laporan Transaksi
      </a>
      <a class="nav-item" href="laporan-transaksi.php">
        <span class="nav-icon" aria-hidden="true">Rp</span>
        Laporan Keuangan
      </a>
      <a class="nav-item" href="#laporan-karyawan" <?= $ownerPlaceholderAttr ?? '' ?>>
        <span class="nav-icon" aria-hidden="true">P</span>
        Laporan Karyawan
      </a>
  </nav>

  <div class="sidebar-bottom">
    <p class="sidebar-note">Area monitoring Owner</p>
    <form method="post" action="../../logout.php" style="display:contents">
      <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>" />
      <button class="sidebar-logout" id="<?= e($logoutId ?? 'logout') ?>" type="submit"><span class="nav-icon" aria-hidden="true">↪</span>Logout</button>
    </form>
  </div>
</aside>

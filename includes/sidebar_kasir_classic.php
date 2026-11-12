<?php /** @var string $logoutId */ ?>
<aside class="dashboard-sidebar" aria-label="Navigasi Kasir">
  <a class="dashboard-brand" href="dashboard-kasir.php" aria-label="WASHUP Dashboard Kasir">
    <span class="brand-mark">W</span>
    <span>
      <strong>WASHUP</strong>
      <small>Sistem Car Wash</small>
    </span>
  </a>

  <nav class="dashboard-nav" aria-label="Menu utama">
    <p class="nav-label">MENU KASIR</p>
      <a class="nav-item<?= nav_active('dashboard-kasir') ?>" href="dashboard-kasir.php"<?= nav_current('dashboard-kasir') ?>>
        <span class="nav-icon" aria-hidden="true">⌂</span>
        Dashboard
      </a>
      <a class="nav-item<?= nav_active('transaksi-baru') ?>" href="transaksi-baru.php"<?= nav_current('transaksi-baru') ?>>
        <span class="nav-icon" aria-hidden="true">+</span>
        Transaksi Baru
      </a>
      <a class="nav-item<?= nav_active('antrean') ?>" href="antrean.php"<?= nav_current('antrean') ?>>
        <span class="nav-icon" aria-hidden="true">≡</span>
        Antrean
      </a>
      <a class="nav-item<?= nav_active('pembayaran') ?>" href="pembayaran.php"<?= nav_current('pembayaran') ?>>
        <span class="nav-icon" aria-hidden="true">Rp</span>
        Pembayaran
      </a>
      <a class="nav-item<?= nav_active('riwayat-transaksi') ?>" href="riwayat-transaksi.php"<?= nav_current('riwayat-transaksi') ?>>
        <span class="nav-icon" aria-hidden="true">↺</span>
        Riwayat Transaksi
      </a>
  </nav>

  <div class="sidebar-bottom">
    <p class="sidebar-note">Area kerja Kasir</p>
    <form method="post" action="../../logout.php" style="display:contents">
      <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>" />
      <button class="sidebar-logout" id="<?= e($logoutId ?? 'logout') ?>" type="submit">
        <span class="nav-icon" aria-hidden="true">↪</span>
        Logout
      </button>
    </form>
  </div>
</aside>

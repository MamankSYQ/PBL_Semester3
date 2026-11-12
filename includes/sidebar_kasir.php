<?php /** @var string $logoutId */ ?>
<aside class="dashboard-sidebar" aria-label="Navigasi Kasir">
  <a class="dashboard-brand" href="dashboard-kasir.php" aria-label="WASHUP Dashboard Kasir">
    <img class="brand-logo-img" src="../../assets/logo-washup.png" alt="Logo mobil cuci WASHUP" />
    <span class="brand-text">WASHUP</span>
  </a>

  <nav class="dashboard-nav" aria-label="Menu utama">
          <p class="nav-label">MENU KASIR</p>
          <a class="nav-item<?= nav_active('dashboard-kasir') ?>" href="dashboard-kasir.php"<?= nav_current('dashboard-kasir') ?>>
            <svg class="nav-icon-svg" viewBox="0 0 36 36" aria-hidden="true">
              <path fill="currentColor" d="M33 19a1 1 0 0 1-.71-.29L18 4.41L3.71 18.71A1 1 0 0 1 2.3 17.3l15-15a1 1 0 0 1 1.41 0l15 15A1 1 0 0 1 33 19Z" />
              <path fill="currentColor" d="M18 7.79L6 19.79V32a2 2 0 0 0 2 2h7V22h6v12h7a2 2 0 0 0 2-2V19.79ZM28 32h-3V20H11v12H8V19.38l10-10l10 10Z" />
            </svg>
            Dashboard
          </a>
          <a class="nav-item<?= nav_active('transaksi-baru') ?>" href="transaksi-baru.php"<?= nav_current('transaksi-baru') ?>>
            <svg class="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M12 20v-8m0 0V4m0 8h8m-8 0H4" />
            </svg>
            Transaksi Baru
          </a>
          <a class="nav-item<?= nav_active('antrean') ?>" href="antrean.php"<?= nav_current('antrean') ?>>
            <svg class="nav-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M18 18H6c-.943 0-1.414 0-1.707-.293S4 16.943 4 16s0-1.414.293-1.707S5.057 14 6 14h12c.943 0 1.414 0 1.707.293S20 15.057 20 16s0 1.414-.293 1.707S18.943 18 18 18M4 10h16M4 6h16" />
            </svg>
            Antrean
          </a>
          <a class="nav-item<?= nav_active('pembayaran') ?>" href="pembayaran.php"<?= nav_current('pembayaran') ?>>
            <svg class="nav-icon-svg" viewBox="0 0 512 512" aria-hidden="true">
              <path fill="currentColor" d="M0 64c0-17.7 14.3-32 32-32h80c79.5 0 144 64.5 144 144c0 58.8-35.2 109.3-85.7 131.7l51.4 128.4c6.6 16.4-1.4 35-17.8 41.6s-35-1.4-41.6-17.8l-56-139.9H64v128c0 17.7-14.3 32-32 32S0 465.7 0 448zm64 192h48c44.2 0 80-35.8 80-80s-35.8-80-80-80H64zm256-96h80c61.9 0 112 50.1 112 112s-50.1 112-112 112h-48v96c0 17.7-14.3 32-32 32s-32-14.3-32-32V192c0-17.7 14.3-32 32-32m80 160c26.5 0 48-21.5 48-48s-21.5-48-48-48h-48v96z" />
            </svg>
            Pembayaran
          </a>
          <a class="nav-item<?= nav_active('riwayat-transaksi') ?>" href="riwayat-transaksi.php"<?= nav_current('riwayat-transaksi') ?>>
            <svg class="nav-icon-svg" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.6" d="M8.09 4.5H19a2.05 2.05 0 0 1 2.05 2.05V17.2c0 1.72-1.91 2.74-3 1.65l-3.48-3.5A12.82 12.82 0 1 0 36.83 24c0-3.46-1-6.06-4.93-10c-.84-.84-.1-1.55.38-2l2.28-2.27c.94-.94 1.27-1.12 2.1-.29c4.86 4.86 6.83 8.52 6.84 14.63A19.5 19.5 0 1 1 9.86 10.63C8.69 9.44 8.32 9.06 6.35 7.09c-.77-.76-.08-2.59 1.74-2.59" />
            </svg>
            Riwayat Transaksi
          </a>
        </nav>

  <div class="sidebar-bottom">
    <p class="sidebar-note">Area Kerja Kasir</p>
    <form method="post" action="../../logout.php" style="display:contents">
      <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>" />
      <button class="sidebar-logout" id="<?= e($logoutId ?? 'logout') ?>" type="submit">Logout</button>
    </form>
  </div>
</aside>

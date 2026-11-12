<?php
declare(strict_types=1);
require __DIR__ . '/../../config/app.php';

$role = 'admin';
$page = 'dashboard-admin';
$pageTitle = 'Dashboard Admin';
$pageDescription = 'Dashboard Admin WASHUP - Sistem Informasi Car Wash';
$h1 = 'Dashboard Admin';
$bodyClass = 'admin-dashboard-page';
$css = ['style.css', 'admin.css'];
$logoutId = 'admin-logout';
$footerLabel = 'Dashboard Admin';

require __DIR__ . '/../../includes/header.php';
?>
        <main class="dashboard-main admin-main">
          <section class="dashboard-welcome" aria-labelledby="admin-welcome-title">
            <div>
              <p class="eyebrow">RINGKASAN ADMINISTRASI</p>
              <h2 id="admin-welcome-title">Monitoring data operasional WASHUP</h2>
              <span class="admin-date-chip" id="admin-date"><?= e(tanggal_indonesia()) ?></span>
            </div>
          </section>

          <!-- D. EMPAT KARTU STATISTIK -->
          <section class="summary-grid" aria-label="Ringkasan data WASHUP">
            <!-- Kartu 1: Total Pelanggan (Siluet Orang Padat) -->
            <article class="summary-card">
              <div class="summary-card-top">
                <div class="summary-icon-box" aria-hidden="true">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="7" r="4.2" fill="currentColor" />
                    <path d="M4 20.5c0-4.4 3.6-7.5 8-7.5s8 3.1 8 7.5v0.5H4v-0.5z" fill="currentColor" />
                  </svg>
                </div>
                <span class="summary-trend">Data transaksi</span>
              </div>
              <p>Total Pelanggan</p>
              <strong id="admin-customer-count">0</strong>
            </article>

            <!-- Kartu 2: Total Kendaraan (3 Bilah Horizontal Membulat / Grille) -->
            <article class="summary-card">
              <div class="summary-card-top">
                <div class="summary-icon-box" aria-hidden="true">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="4" y="5.5" width="16" height="3" rx="1.5" fill="currentColor" />
                    <rect x="4" y="10.5" width="16" height="3" rx="1.5" fill="currentColor" />
                    <rect x="4" y="15.5" width="16" height="3" rx="1.5" fill="currentColor" />
                  </svg>
                </div>
                <span class="summary-trend">Data kendaraan</span>
              </div>
              <p>Total Kendaraan</p>
              <strong id="admin-vehicle-count">0</strong>
            </article>

            <!-- Kartu 3: Total Layanan (Cloche / Service Bell Dome) -->
            <article class="summary-card">
              <div class="summary-card-top">
                <div class="summary-icon-box" aria-hidden="true">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="5" r="1.8" fill="currentColor" />
                    <path d="M12 6.8v1.7" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    <path d="M4.5 16.5c0-4.1 3.4-7.5 7.5-7.5s7.5 3.4 7.5 7.5H4.5z" fill="currentColor" />
                    <rect x="3" y="17.5" width="18" height="2" rx="1" fill="currentColor" />
                  </svg>
                </div>
                <span class="summary-trend">Konfigurasi</span>
              </div>
              <p>Total Layanan</p>
              <strong id="admin-service-count">0</strong>
            </article>

            <!-- Kartu 4: Total Karyawan (Dua Orang / Team Users Siluet) -->
            <article class="summary-card">
              <div class="summary-card-top">
                <div class="summary-icon-box" aria-hidden="true">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm7 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm-7 2c-3.1 0-7 1.6-7 4.5V20h14v-1.5c0-2.9-3.9-4.5-7-4.5zm7 1.5c.9.6 1.8 1.4 1.8 3V20H22v-1.5c0-2-3-3.2-5-3.5z" fill="currentColor" />
                  </svg>
                </div>
                <span class="summary-trend">Akun operasional</span>
              </div>
              <p>Total Karyawan</p>
              <strong id="admin-employee-count">0</strong>
            </article>
          </section>

          <!-- E. PANEL TRANSAKSI TERBARU -->
          <section class="dashboard-section" aria-labelledby="admin-recent-title">
            <div class="section-heading">
              <div>
                <p class="eyebrow">MONITORING TRANSAKSI</p>
                <h2 id="admin-recent-title">Transaksi Terbaru</h2>
              </div>
              <!-- Counter badge dipertahankan untuk kebutuhan DOM JS -->
              <span class="badge badge-blue" id="admin-recent-count" hidden>0 data</span>
            </div>

            <div class="table-wrap">
              <table class="queue-table">
                <caption class="sr-only">Daftar transaksi terbaru</caption>
                <thead>
                  <tr>
                    <th scope="col">NO. TRANSAKSI</th>
                    <th scope="col">PELANGGAN</th>
                    <th scope="col">PLAT</th>
                    <th scope="col">LAYANAN</th>
                    <th scope="col">TOTAL</th>
                    <th scope="col">STATUS PEMBAYARAN</th>
                  </tr>
                </thead>
                <tbody id="admin-recent-body"></tbody>
              </table>
            </div>

            <!-- Empty State Sesuai Screenshot -->
            <div class="queue-empty" id="admin-recent-empty">
              <div class="queue-empty-box" aria-hidden="true">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M19 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 9.5h-4.2c-.4 1.5-1.7 2.5-3.3 2.5s-2.9-1-3.3-2.5H5V6h14v7.5z" />
                </svg>
              </div>
              <h3>Belum ada transaksi.</h3>
              <p>Transaksi Kasir akan tampil di halaman ini.</p>
            </div>

            <p class="admin-notice" id="admin-notice" role="status" aria-live="polite"></p>
          </section>
        </main>

<?php require __DIR__ . '/../../includes/footer.php'; ?>
<?php require __DIR__ . '/../../includes/scripts.php'; ?>

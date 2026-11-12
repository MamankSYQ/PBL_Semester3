<?php
declare(strict_types=1);
require __DIR__ . '/../../config/app.php';

$role = 'kasir';
$page = 'dashboard-kasir';
$pageTitle = 'Dashboard Kasir';
$pageDescription = 'Dashboard Kasir WASHUP - Sistem Informasi Car Wash';
$h1 = 'Dashboard Kasir';
$bodyClass = 'dashboard-page kasir-dashboard-page';
$css = ['style.css', 'kasir.css'];
$logoutId = 'dashboard-logout';
$footerLabel = 'Dashboard Kasir';

require __DIR__ . '/../../includes/header.php';
?>
        <main class="dashboard-main kasir-main">
          <!-- C. AREA SAMBUTAN -->
          <section class="dashboard-welcome" aria-labelledby="welcome-title">
            <p class="eyebrow">RINGKASAN PENGERJAAN</p>
            <h2 id="welcome-title">Selamat Datang, Kasir!</h2>
            <span class="admin-date-chip date-chip" id="kasir-date"><?= e(tanggal_indonesia()) ?></span>
          </section>

          <!-- D. EMPAT KARTU STATISTIK -->
          <section class="summary-grid" aria-label="Ringkasan operasional hari ini">
            <!-- Kartu 1: Kendaraan Hari Ini (ant-design:car-outlined) -->
            <article class="summary-card">
              <div class="summary-card-top">
                <div class="summary-icon-box" aria-hidden="true">
                  <svg viewBox="0 0 1024 1024" aria-hidden="true">
                    <path fill="currentColor" d="M380 704h264c4.4 0 8-3.6 8-8v-84c0-4.4-3.6-8-8-8h-40c-4.4 0-8 3.6-8 8v36H428v-36c0-4.4-3.6-8-8-8h-40c-4.4 0-8 3.6-8 8v84c0 4.4 3.6 8 8 8m340-123a40 40 0 1 0 80 0a40 40 0 1 0-80 0m239-167.6L935.3 372a8 8 0 0 0-10.9-2.9l-50.7 29.6l-78.3-216.2a63.9 63.9 0 0 0-60.9-44.4H301.2c-34.7 0-65.5 22.4-76.2 55.5l-74.6 205.2l-50.8-29.6a8 8 0 0 0-10.9 2.9L65 413.4c-2.2 3.8-.9 8.6 2.9 10.8l60.4 35.2l-14.5 40c-1.2 3.2-1.8 6.6-1.8 10v348.2c0 15.7 11.8 28.4 26.3 28.4h67.6c12.3 0 23-9.3 25.6-22.3l7.7-37.7h545.6l7.7 37.7c2.7 13 13.3 22.3 25.6 22.3h67.6c14.5 0 26.3-12.7 26.3-28.4V509.4c0-3.4-.6-6.8-1.8-10l-14.5-40l60.3-35.2a8 8 0 0 0 3-10.8M840 517v237H184V517l15.6-43h624.8zM292.7 218.1l.5-1.3l.4-1.3c1.1-3.3 4.1-5.5 7.6-5.5h427.6l75.4 208H220zM224 581a40 40 0 1 0 80 0a40 40 0 1 0-80 0" />
                  </svg>
                </div>
                <span class="summary-trend">Hari Ini</span>
              </div>
              <div>
                <p>Kendaraan Hari Ini</p>
                <strong id="vehicle-count">0</strong>
              </div>
            </article>

            <!-- Kartu 2: Transaksi Hari Ini (akar-icons:check-box) -->
            <article class="summary-card">
              <div class="summary-card-top">
                <div class="summary-icon-box" aria-hidden="true">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                      <rect width="18" height="18" x="3" y="3" rx="4" />
                      <path d="m9 12l2.25 2L15 10" />
                    </g>
                  </svg>
                </div>
                <span class="summary-trend">Hari Ini</span>
              </div>
              <div>
                <p>Transaksi Hari Ini</p>
                <strong id="transaction-count">0</strong>
              </div>
            </article>

            <!-- Kartu 3: Transaksi Hari Ini (grommet-icons:transaction) -->
            <article class="summary-card">
              <div class="summary-card-top">
                <div class="summary-icon-box" aria-hidden="true">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 7h18m-4-5l5 5l-5 5m6 5H4m4-5l-5 5l5 5" />
                  </svg>
                </div>
                <span class="summary-trend">Berjalan</span>
              </div>
              <div>
                <p>Antrean Aktif</p>
                <strong id="queue-count">0</strong>
              </div>
            </article>

            <!-- Kartu 4: Total Transaksi Hari Ini (fa7-solid:rupiah-sign) -->
            <article class="summary-card">
              <div class="summary-card-top">
                <div class="summary-icon-box" aria-hidden="true">
                  <svg viewBox="0 0 512 512" aria-hidden="true">
                    <path fill="currentColor" d="M0 64c0-17.7 14.3-32 32-32h80c79.5 0 144 64.5 144 144c0 58.8-35.2 109.3-85.7 131.7l51.4 128.4c6.6 16.4-1.4 35-17.8 41.6s-35-1.4-41.6-17.8l-56-139.9H64v128c0 17.7-14.3 32-32 32S0 465.7 0 448zm64 192h48c44.2 0 80-35.8 80-80s-35.8-80-80-80H64zm256-96h80c61.9 0 112 50.1 112 112s-50.1 112-112 112h-48v96c0 17.7-14.3 32-32 32s-32-14.3-32-32V192c0-17.7 14.3-32 32-32m80 160c26.5 0 48-21.5 48-48s-21.5-48-48-48h-48v96z" />
                  </svg>
                </div>
                <span class="summary-trend">Hari Ini</span>
              </div>
              <div>
                <p>Pendapatan Hari Ini</p>
                <strong id="revenue-total">Rp 0</strong>
              </div>
            </article>
          </section>

          <!-- E. PANEL ANTREAN SAAT INI -->
          <section class="dashboard-section" id="antrean-section" aria-labelledby="queue-title">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Kendaraan Hari Ini</p>
                <h2 id="queue-title">Antrean Saat Ini</h2>
              </div>
              <span class="badge badge-blue hide-visual" id="queue-badge" hidden>0 kendaraan aktif</span>
            </div>
            <div class="table-wrap">
              <table class="queue-table">
                <caption class="sr-only">Daftar antrean kendaraan saat ini</caption>
                <thead>
                  <tr>
                    <th scope="col">NO.</th>
                    <th scope="col">PLAT</th>
                    <th scope="col">KENDARAAN</th>
                    <th scope="col">LAYANAN</th>
                    <th scope="col">STATUS</th>
                  </tr>
                </thead>
                <tbody id="queue-table-body"></tbody>
              </table>
            </div>
          </section>

          <!-- F. PANEL TINDAKAN ANTREAN (AKSI CEPAT) -->
          <section class="quick-action-panel" id="aksi-cepat" aria-labelledby="quick-action-title">
            <div class="quick-action-info">
              <p class="eyebrow">Kendaraan Hari Ini</p>
              <h2 id="quick-action-title">Antrean Saat Ini</h2>
              <p id="dashboard-notice">Buat Transaksi Baru Untuk Menambahkan Pelanggan Ke Antrian</p>
            </div>
            <div class="quick-action-buttons">
              <a class="btn-transaksi-baru dashboard-action" href="transaksi-baru.php">Transaksi Baru</a>
              <a class="btn-lihat-antrean secondary-dashboard-button" href="antrean.php">Lihat Antrean</a>
            </div>
          </section>
        </main>

<?php require __DIR__ . '/../../includes/footer.php'; ?>
    

<?php require __DIR__ . '/../../includes/scripts.php'; ?>

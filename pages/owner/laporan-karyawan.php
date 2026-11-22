<?php
require __DIR__ . '/../../includes/auth.php';
require __DIR__ . '/../../includes/hydrate.php';
$u = require_role('Owner');
?>
<!doctype html>
<html lang="id">
  <head>
    <?php washup_bootstrap($u); ?>

    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Laporan Karyawan Owner WASHUP" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Laporan Karyawan | WASHUP</title>
    <link rel="icon" type="image/png" href="../../assets/favicon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Emblema+One&family=Open+Sans:wght@400;500;600;700;800&display=swap" />
    <link rel="stylesheet" href="../../css/tokens.css" />
    <link rel="stylesheet" href="../../css/style.css" />
    <link rel="stylesheet" href="../../css/base.css" />
    <link rel="stylesheet" href="../../css/owner.css?v=20261122-owner-period-filters-v8" />
    <link rel="stylesheet" href="../../css/sidebar-collapse.css" />
    <link rel="stylesheet" href="../../css/compact.css?v=20261122-owner-period-filters-v8" />
  </head>
  <body class="owner-page owner-employee-page" data-role="Owner" data-page="employees" data-title="Laporan Karyawan" data-logout-id="owner-logout">
    <div class="dashboard-shell">
      <div data-component="sidebar"></div>
      <div class="dashboard-content">
        <div data-component="topbar"></div>
        <main class="dashboard-main admin-main owner-employee-main">
          <section class="dashboard-welcome" aria-labelledby="owner-employee-title">
            <div>
              <p class="eyebrow">RINGKASAN KARYAWAN</p>
              <h2 id="owner-employee-title">Laporan Karyawan</h2>
            </div>
          </section>
          <section class="owner-stats-toolbar owner-period-toolbar" aria-label="Filter periode laporan karyawan">
            <div class="owner-stats-filter">
              <label for="owner-employee-month">Periode Bulan</label>
              <select id="owner-employee-month"><option value="">Pilih periode bulan</option></select>
            </div>
            <div class="owner-stats-filter">
              <label for="owner-employee-year">Periode Tahun</label>
              <select id="owner-employee-year"><option value="">Pilih periode tahun</option></select>
            </div>
            <button id="owner-employee-apply" type="button">Terapkan</button>
          </section>
          <section class="summary-grid owner-employee-summary-grid" aria-label="Ringkasan karyawan">
            <article class="summary-card">
              <div class="summary-card-top">
                <div class="summary-icon-box" data-icon="users" aria-hidden="true"></div>
              </div>
              <p>Total Karyawan</p>
              <strong id="owner-employee-total">0</strong>
            </article>
            <article class="summary-card">
              <div class="summary-card-top">
                <div class="summary-icon-box" data-icon="calendar-check" aria-hidden="true"></div>
              </div>
              <p>Hadir</p>
              <strong id="owner-employee-present">0</strong>
            </article>
            <article class="summary-card">
              <div class="summary-card-top">
                <div class="summary-icon-box" data-icon="calendar-x" aria-hidden="true"></div>
              </div>
              <p>Tidak Hadir</p>
              <strong id="owner-employee-absent">0</strong>
            </article>
            <article class="summary-card">
              <div class="summary-card-top">
                <div class="summary-icon-box" data-icon="clock-alert" aria-hidden="true"></div>
              </div>
              <p>Terlambat</p>
              <strong id="owner-employee-late">0</strong>
            </article>
          </section>
          <section class="dashboard-section owner-employee-section" aria-labelledby="owner-attendance-title">
            <div class="section-heading">
              <div>
                <p class="eyebrow">DAFTAR DATA BULANAN</p>
                <h2 id="owner-attendance-title">Rekap Kehadiran</h2>
              </div>
            </div>
            <div class="queue-table-wrap owner-employee-table-wrap" tabindex="0">
              <table class="queue-full-table owner-employee-table">
                <caption class="sr-only">Rekap kehadiran</caption>
                <thead>
                  <tr>
                    <th scope="col">KARYAWAN</th>
                    <th scope="col">HADIR</th>
                    <th scope="col">TERLAMBAT</th>
                    <th scope="col">KETERANGAN</th>
                    <th scope="col">GAJI DIBAYAR</th>
                    <th scope="col">INSENTIF LEMBUR</th>
                  </tr>
                </thead>
                <tbody id="owner-attendance-body"></tbody>
              </table>
            </div>
            <div class="queue-empty owner-employee-empty" id="owner-attendance-empty">
              <div class="queue-empty-box" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M19 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 9.5h-4.2c-.4 1.5-1.7 2.5-3.3 2.5s-2.9-1-3.3-2.5H5V6h14v7.5z" />
                </svg>
              </div>
              <h3>Belum ada data.</h3>
              <p>Rekap kehadiran akan tampil di sini.</p>
            </div>
          </section>
          <section class="dashboard-section owner-employee-section owner-employee-detail-section" aria-labelledby="owner-attendance-detail-title">
            <div class="section-heading">
              <div>
                <p class="eyebrow">BUKTI WAKTU KEHADIRAN</p>
                <h2 id="owner-attendance-detail-title">Rincian Kehadiran dan Bukti Jam Masuk/Keluar</h2>
              </div>
            </div>
            <div class="queue-table-wrap owner-employee-table-wrap owner-employee-detail-wrap" tabindex="0">
              <table class="queue-full-table owner-employee-table owner-employee-detail-table">
                <caption class="sr-only">Rincian jam masuk, jam keluar, dan keterangan absensi karyawan bulan ini</caption>
                <thead><tr>
                  <th scope="col">TANGGAL</th><th scope="col">KARYAWAN</th><th scope="col">SHIFT</th>
                  <th scope="col">JAM MASUK</th><th scope="col">JAM KELUAR</th><th scope="col">STATUS</th><th scope="col">KETERANGAN</th>
                </tr></thead>
                <tbody id="owner-attendance-detail-body"></tbody>
              </table>
            </div>
            <div class="queue-empty owner-employee-empty" id="owner-attendance-detail-empty">
              <h3>Belum ada rincian kehadiran.</h3>
              <p>Bukti jam masuk dan keluar akan tampil setelah absensi dicatat.</p>
            </div>
            <p class="owner-payroll-note">Gaji harian hanya dihitung untuk hari dengan absensi masuk. Izin, Sakit, dan tanpa absensi tidak memperoleh gaji pada hari tersebut. Insentif lembur dihitung otomatis sebesar 1,5% × upah per jam × durasi lembur. Upah per jam = gaji harian ÷ durasi shift terjadwal. Rincian jam masuk dan keluar ditampilkan pada tabel di atas.</p>
          </section>
        </main>
        <div data-component="footer"></div>
      </div>
    </div>
    <script src="../../js/components.js?v=20261122-profile-markup-v1"></script>
    <script src="../../js/app.js?v=20261122-owner-period-filters-v8"></script>
  </body>
</html>

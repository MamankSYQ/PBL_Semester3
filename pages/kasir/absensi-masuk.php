<?php
require __DIR__ . '/../../includes/auth.php';
require __DIR__ . '/../../includes/hydrate.php';
$u = require_role('Kasir');
?>
<!doctype html>
<html lang="id">
  <head>
    <?php washup_bootstrap($u); ?>

    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Absensi Masuk Kasir WASHUP" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Absensi Masuk | WASHUP</title>
    <link rel="icon" type="image/png" href="../../assets/favicon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Emblema+One&family=Open+Sans:wght@400;500;600;700;800&display=swap" />
    <link rel="stylesheet" href="../../css/tokens.css" />
    <link rel="stylesheet" href="../../css/style.css" />
    <link rel="stylesheet" href="../../css/base.css" />
    <link rel="stylesheet" href="../../css/petugas.css?v=20261122-attendance-modal-recap-eye-v5" />
    <link rel="stylesheet" href="../../css/sidebar-collapse.css" />
    <link rel="stylesheet" href="../../css/compact.css?v=20261122-attendance-gap-v6" />
  </head>
  <body class="petugas-page kasir-page kasir-attendance-page petugas-attendance-page" data-role="Kasir" data-page="checkin" data-attendance-mode="in" data-title="Absensi Masuk" data-logout-id="attendance-logout">
    <div class="dashboard-shell">
      <div data-component="sidebar"></div>
      <div class="dashboard-content">
        <div data-component="topbar"></div>
        <main class="dashboard-main attendance-main">
          <section class="queue-heading">
            <div><p class="eyebrow">KEHADIRAN KARYAWAN</p><h2>Absensi Masuk Kasir</h2></div>
          </section>
          <section class="attendance-card" aria-labelledby="attendance-title">
            <div class="attendance-card-heading"><span class="role-icon" aria-hidden="true">P</span><div><p class="eyebrow">DATA ABSENSI</p><h2 id="attendance-title">Kasir</h2></div></div>
            <dl class="attendance-list">
              <div><dt>Nama</dt><dd id="attendance-name">Petugas</dd></div><div><dt>Tanggal</dt><dd id="attendance-date">-</dd></div>
              <div><dt>Shift</dt><dd id="attendance-shift">-</dd></div><div><dt>Jam Masuk</dt><dd id="check-in-time">--</dd></div>
              <div><dt>Jam Keluar</dt><dd id="check-out-time">--</dd></div><div><dt>Status</dt><dd id="attendance-status">Belum Absen</dd></div>
            </dl>
            <section class="attendance-photo-section" aria-labelledby="photo-title">
              <div class="photo-section-heading"><p class="eyebrow">BUKTI FOTO ABSENSI</p><h3 id="photo-title">FOTO UNTUK ABSEN MASUK</h3></div>
              <input id="attendance-photo-input" type="file" accept="image/*" capture="user" hidden />
              <button class="secondary-dashboard-button photo-picker-button" id="photo-picker" type="button">Ambil Foto / Upload Foto</button>
              <div class="photo-preview" id="photo-preview" hidden>
                <img id="photo-preview-image" alt="Preview bukti foto absensi" />
                <div><strong id="photo-file-name">Foto dipilih</strong><p id="photo-preview-status">Periksa foto sebelum digunakan.</p></div>
                <div class="photo-preview-actions"><button class="primary-button dashboard-action" id="use-photo" type="button">Gunakan Foto</button><button class="secondary-dashboard-button" id="replace-photo" type="button">Ganti Foto</button></div>
                <div class="photo-confirmed-indicator" id="photo-confirmed-indicator" hidden aria-live="polite">Foto sudah dikonfirmasi</div>
              </div>
              <div class="saved-photo-grid">
                <div class="saved-photo" id="check-in-photo-card" hidden><span>Bukti Foto Masuk</span><img id="check-in-photo" alt="Bukti foto absen masuk" /></div>
                <div class="saved-photo" id="check-out-photo-card" hidden><span>Bukti Foto Keluar</span><img id="check-out-photo" alt="Bukti foto absen keluar" /></div>
              </div>
            </section>
            <button class="primary-button dashboard-action attendance-button" id="attendance-action" type="button">Absen Masuk</button>
            <button class="secondary-dashboard-button attendance-leave-trigger" id="attendance-leave-trigger" type="button">Ajukan Izin / Sakit</button>
            <p class="attendance-notice" id="attendance-notice" role="status" aria-live="polite"></p>
          </section>
          <dialog class="attendance-leave-dialog" id="attendance-leave-dialog" aria-labelledby="attendance-leave-title">
            <form id="attendance-leave-form" method="dialog">
              <div class="attendance-leave-heading">
                <div><p class="eyebrow">PELAPORAN KETIDAKHADIRAN</p><h2 id="attendance-leave-title">Ajukan Izin / Sakit</h2></div>
                <button class="attendance-leave-close" id="attendance-leave-close" type="button" aria-label="Tutup">×</button>
              </div>
              <p class="attendance-leave-note">Pengajuan Izin atau Sakit akan langsung tercatat pada rekap Owner dan tidak dihitung sebagai hari kerja bergaji.</p>
              <label for="attendance-leave-type">Jenis ketidakhadiran</label>
              <select id="attendance-leave-type" name="status" required><option value="Izin">Izin</option><option value="Sakit">Sakit</option></select>
              <label for="attendance-leave-reason">Keterangan</label>
              <textarea id="attendance-leave-reason" name="reason" rows="3" maxlength="255" required placeholder="Tuliskan alasan izin..."></textarea>
              <p class="attendance-leave-error" id="attendance-leave-error" role="alert"></p>
              <div class="attendance-leave-actions"><button class="secondary-dashboard-button" id="attendance-leave-cancel" type="button">Batal</button><button class="primary-button dashboard-action" type="submit">Kirim Pengajuan</button></div>
            </form>
          </dialog>
        </main>
        <div data-component="footer"></div>
      </div>
    </div>
    <script src="../../js/components.js?v=20261122-profile-markup-v1"></script>
    <script src="../../js/app.js?v=20261122-attendance-profile-fix-v1"></script>
  </body>
</html>

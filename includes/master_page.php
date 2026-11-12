<?php
/** @var array $cfg  konfigurasi halaman master, lihat pages/admin/*.php */
$role = 'admin';
$pageTitle = $cfg['title'];
$pageDescription = $cfg['desc'];
$h1 = $cfg['h1'];
$h1Id = 'master-page-heading';
$bodyClass = 'master-page';
$bodyAttrs = ' data-master="' . e($cfg['master']) . '"';
$css = ['style.css', 'admin-master.css'];
$logoutId = 'master-logout';
$footerLabel = $cfg['footer'];

require __DIR__ . '/header.php';
?>
        <main class="dashboard-main master-main">
          <section class="queue-heading">
            <div>
              <p class="eyebrow"><?= e($cfg['eyebrow'] ?? 'DATA MASTER') ?></p>
              <h2><?= e($cfg['h2']) ?></h2>
            </div>
            <button class="primary-button dashboard-action" id="master-add" type="button">Tambah Data</button>
          </section>

          <section class="queue-toolbar master-toolbar">
            <div>
              <label for="master-search"><?= e($cfg['search_label']) ?></label>
              <input id="master-search" type="search" placeholder="<?= e($cfg['search_ph']) ?>" />
            </div>
          </section>

          <section class="queue-panel">
            <div class="section-heading">
              <div>
                <p class="eyebrow"><?= e($cfg['panel_eyebrow']) ?></p>
                <h2 id="master-table-title"><?= e($cfg['panel_h2']) ?></h2>
              </div>
              <span class="badge badge-blue" id="master-result-count">0 data</span>
            </div>
            <div class="queue-table-wrap">
              <table class="queue-full-table master-table">
                <caption class="sr-only"><?= e($cfg['caption']) ?></caption>
                <thead><tr id="master-table-head"></tr></thead>
                <tbody id="master-table-body"></tbody>
              </table>
            </div>
            <div class="queue-empty" id="master-empty" hidden>
              <div class="queue-empty-box" aria-hidden="true">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="currentColor" d="M19 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 9.5h-4.2c-.4 1.5-1.7 2.5-3.3 2.5s-2.9-1-3.3-2.5H5V6h14v7.5z" />
                </svg>
              </div>
              <h3 id="master-empty-title"><?= e($cfg['empty_title']) ?></h3>
              <p><?= e($cfg['empty_text']) ?></p>
            </div>
          </section>
        </main>

<?php require __DIR__ . '/footer.php'; ?>

    <dialog class="queue-dialog master-dialog" id="master-dialog" aria-labelledby="master-dialog-title">
      <div class="dialog-heading">
        <div>
          <p class="eyebrow"><?= e($cfg['form_eyebrow']) ?></p>
          <h2 id="master-dialog-title"><?= e($cfg['form_title']) ?></h2>
        </div>
        <button class="dialog-close" id="master-dialog-close" type="button" aria-label="Tutup form">×</button>
      </div>
      <form id="master-form">
        <div class="master-form-fields" id="master-form-fields"></div>
        <p class="dialog-notice" id="master-dialog-notice" role="alert"></p>
        <div class="dialog-actions">
          <button class="secondary-dashboard-button" id="master-dialog-cancel" type="button">Batal</button>
          <button class="primary-button dashboard-action" type="submit">Simpan</button>
        </div>
      </form>
    </dialog>

    <dialog class="queue-dialog master-detail-dialog" id="master-detail-dialog" aria-labelledby="master-detail-title">
      <div class="dialog-heading">
        <div>
          <p class="eyebrow"><?= e($cfg['detail_eyebrow']) ?></p>
          <h2 id="master-detail-title"><?= e($cfg['detail_title']) ?></h2>
        </div>
        <button class="dialog-close" id="master-detail-close" type="button" aria-label="Tutup detail">×</button>
      </div>
      <div class="master-detail-grid" id="master-detail-content"></div>
    </dialog>

<?php require __DIR__ . '/scripts.php'; ?>

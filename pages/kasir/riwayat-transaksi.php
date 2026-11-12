<?php
declare(strict_types=1);
require __DIR__ . '/../../config/app.php';

$role = 'kasir';
$page = 'riwayat-transaksi';
$pageTitle = 'Riwayat Transaksi';
$pageDescription = 'Riwayat Transaksi WASHUP';
$h1 = 'Riwayat Transaksi';
$bodyClass = 'history-page';
$css = ['style.css'];
$layout = 'classic';
$logoutId = 'history-logout';
$footerLabel = 'Riwayat Transaksi';

require __DIR__ . '/../../includes/header.php';
?>
        <main class="dashboard-main queue-main"><section class="queue-heading"><div><p class="eyebrow">DATA TRANSAKSI</p><h2>Riwayat Transaksi</h2><p>Lihat seluruh transaksi yang telah dibuat.</p></div></section><section class="queue-toolbar history-toolbar" aria-label="Pencarian dan filter riwayat"><div><label for="history-search">Cari transaksi</label><input id="history-search" type="search" placeholder="Nomor transaksi, antrean, pelanggan, atau plat..." /></div><div><label for="history-service-filter">Status Pengerjaan</label><select id="history-service-filter"><option value="Semua">Semua</option><option value="Menunggu">Menunggu</option><option value="Sedang Dicuci">Sedang Dicuci</option><option value="Selesai">Selesai</option></select></div><div><label for="history-payment-filter">Status Pembayaran</label><select id="history-payment-filter"><option value="Semua">Semua</option><option value="Belum Dibayar">Belum Dibayar</option><option value="Lunas">Lunas</option></select></div><div><label for="history-date-filter">Tanggal Transaksi</label><input id="history-date-filter" type="date" /></div></section><section class="queue-panel"><div class="section-heading"><div><p class="eyebrow">ARSIP TRANSAKSI</p><h2>Daftar Transaksi</h2></div><span class="badge badge-blue" id="history-result-count">0 data</span></div><div class="queue-table-wrap"><table class="queue-full-table history-table"><caption class="sr-only">Riwayat transaksi Kasir</caption><thead><tr><th>No. Transaksi</th><th>No. Antrean</th><th>Tanggal/Waktu</th><th>Pelanggan</th><th>Plat</th><th>Kendaraan</th><th>Layanan</th><th>Harga</th><th>Status Pengerjaan</th><th>Status Pembayaran</th><th>Metode Pembayaran</th><th>Aksi</th></tr></thead><tbody id="history-table-body"></tbody></table></div><div class="queue-empty" id="history-empty" hidden><span class="queue-empty-icon" aria-hidden="true">↺</span><h3 id="history-empty-title">Belum ada riwayat transaksi.</h3><p id="history-empty-message">Transaksi yang dibuat Kasir akan tampil di sini.</p></div></section></main>

<?php require __DIR__ . '/../../includes/footer.php'; ?>
    <dialog class="queue-dialog" id="history-dialog" aria-labelledby="history-detail-title"><div class="dialog-heading"><div><p class="eyebrow">DETAIL TRANSAKSI</p><h2 id="history-detail-title">Detail Transaksi</h2></div><button class="dialog-close" id="history-dialog-close" type="button" aria-label="Tutup detail">×</button></div><div class="detail-grid"><div><span>Nomor Transaksi</span><strong id="history-detail-transaction">-</strong></div><div><span>Nomor Antrean</span><strong id="history-detail-queue">-</strong></div><div><span>Nama Pelanggan</span><strong id="history-detail-customer">-</strong></div><div><span>Nomor Telepon</span><strong id="history-detail-phone">-</strong></div><div><span>Nomor Plat</span><strong id="history-detail-plate">-</strong></div><div><span>Jenis Kendaraan</span><strong id="history-detail-vehicle">-</strong></div><div><span>Layanan</span><strong id="history-detail-service">-</strong></div><div><span>Harga</span><strong id="history-detail-price">-</strong></div><div><span>Status Pengerjaan</span><strong id="history-detail-service-status">-</strong></div><div><span>Status Pembayaran</span><strong id="history-detail-payment-status">-</strong></div><div><span>Metode Pembayaran</span><strong id="history-detail-payment-method">-</strong></div><div><span>Waktu Transaksi</span><strong id="history-detail-created-at">-</strong></div></div></dialog>

<?php require __DIR__ . '/../../includes/scripts.php'; ?>

<?php
declare(strict_types=1);
require __DIR__ . '/../../config/app.php';

$role = 'kasir';
$page = 'pembayaran';
$pageTitle = 'Pembayaran';
$pageDescription = 'Pembayaran WASHUP';
$h1 = 'Pembayaran';
$bodyClass = 'payment-page';
$css = ['style.css'];
$layout = 'classic';
$logoutId = 'payment-logout';
$footerLabel = 'Pembayaran';

require __DIR__ . '/../../includes/header.php';
?>
        <main class="dashboard-main queue-main"><section class="queue-heading"><div><p class="eyebrow">PEMBAYARAN TRANSAKSI</p><h2>Daftar Pembayaran</h2><p>Transaksi hanya dapat dibayar setelah kendaraan selesai dicuci.</p></div><div class="active-queue-count"><span>Siap Dibayar</span><strong id="payment-ready-count">0 transaksi</strong></div></section><section class="queue-panel"><div class="section-heading"><div><p class="eyebrow">DATA TRANSAKSI</p><h2>Transaksi Pelanggan</h2></div><span class="badge badge-blue" id="payment-result-count">0 data</span></div><div class="queue-table-wrap"><table class="queue-full-table"><caption class="sr-only">Daftar transaksi pembayaran</caption><thead><tr><th>No. Transaksi</th><th>No. Antrean</th><th>Pelanggan</th><th>Plat</th><th>Kendaraan</th><th>Layanan</th><th>Total Harga</th><th>Status Pengerjaan</th><th>Status Pembayaran</th><th>Aksi</th></tr></thead><tbody id="payment-table-body"></tbody></table></div><div class="queue-empty" id="payment-empty" hidden><span class="queue-empty-icon" aria-hidden="true">Rp</span><h3>Belum ada transaksi.</h3><p>Transaksi dari Kasir akan muncul di halaman ini.</p></div><p class="payment-notice" id="payment-notice" role="status" aria-live="polite"></p></section></main>

<?php require __DIR__ . '/../../includes/footer.php'; ?>
    <dialog class="queue-dialog" id="payment-dialog" aria-labelledby="payment-dialog-title"><div class="dialog-heading"><div><p class="eyebrow">DETAIL PEMBAYARAN</p><h2 id="payment-dialog-title">Konfirmasi Pembayaran</h2></div><button class="dialog-close" id="payment-dialog-close" type="button" aria-label="Tutup pembayaran">×</button></div><div class="detail-grid"><div><span>Nomor Transaksi</span><strong id="payment-detail-transaction">-</strong></div><div><span>Pelanggan</span><strong id="payment-detail-customer">-</strong></div><div><span>Nomor Plat</span><strong id="payment-detail-plate">-</strong></div><div><span>Kendaraan</span><strong id="payment-detail-vehicle">-</strong></div><div><span>Layanan</span><strong id="payment-detail-service">-</strong></div><div><span>Total</span><strong id="payment-detail-total">-</strong></div></div><div class="dialog-actions"><label for="payment-method">Metode Pembayaran</label><select id="payment-method"><option value="Tunai">Tunai</option><option value="QRIS">QRIS</option></select><button class="primary-button dashboard-action" id="confirm-payment" type="button">Konfirmasi Pembayaran</button></div><p class="dialog-notice" id="payment-dialog-notice" role="status" aria-live="polite"></p></dialog>

<?php require __DIR__ . '/../../includes/scripts.php'; ?>

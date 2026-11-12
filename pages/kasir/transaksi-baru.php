<?php
declare(strict_types=1);
require __DIR__ . '/../../config/app.php';

$role = 'kasir';
$page = 'transaksi-baru';
$pageTitle = 'Transaksi Baru';
$pageDescription = 'Transaksi Baru WASHUP';
$h1 = 'Transaksi Baru';
$bodyClass = 'transaction-page';
$css = ['style.css'];
$layout = 'classic';
$logoutId = 'transaction-logout';
$footerLabel = 'Transaksi Baru';

require __DIR__ . '/../../includes/header.php';
?>
        <main class="dashboard-main transaction-main">
          <section class="transaction-heading" aria-labelledby="transaction-title">
            <p class="eyebrow">PELAYANAN PELANGGAN</p>
            <h2 id="transaction-title">Masukkan data pelanggan, kendaraan, dan layanan.</h2>
          </section>

          <div class="transaction-layout">
            <form class="transaction-form" id="transaction-form" novalidate>
              <section class="form-section" aria-labelledby="customer-title">
                <div class="form-section-heading">
                  <span class="form-section-number">01</span>
                  <div>
                    <p class="eyebrow">DATA PELANGGAN</p>
                    <h3 id="customer-title">Informasi pelanggan</h3>
                  </div>
                </div>
                <div class="form-grid">
                  <div class="form-field">
                    <label for="customer-name">Nama Pelanggan</label>
                    <input id="customer-name" name="customerName" type="text" placeholder="Masukkan nama pelanggan" autocomplete="name" />
                    <p class="field-error" id="customer-name-error" aria-live="polite"></p>
                  </div>
                  <div class="form-field">
                    <label for="customer-phone">Nomor Telepon</label>
                    <input id="customer-phone" name="customerPhone" type="tel" placeholder="Masukkan nomor telepon" autocomplete="tel" />
                    <p class="field-error" id="customer-phone-error" aria-live="polite"></p>
                  </div>
                </div>
              </section>

              <section class="form-section" aria-labelledby="vehicle-title">
                <div class="form-section-heading">
                  <span class="form-section-number">02</span>
                  <div>
                    <p class="eyebrow">DATA KENDARAAN</p>
                    <h3 id="vehicle-title">Informasi kendaraan</h3>
                  </div>
                </div>
                <div class="form-grid">
                  <div class="form-field">
                    <label for="plate-number">Nomor Plat</label>
                    <input id="plate-number" name="plateNumber" type="text" placeholder="Masukkan nomor plat" />
                    <p class="field-error" id="plate-number-error" aria-live="polite"></p>
                  </div>
                  <div class="form-field">
                    <label for="vehicle-type">Jenis Kendaraan</label>
                    <select id="vehicle-type" name="vehicleType">
                      <option value="">Pilih kendaraan</option>
                      <option value="Mobil">Mobil</option>
                      <option value="Motor">Motor</option>
                    </select>
                    <p class="field-error" id="vehicle-type-error" aria-live="polite"></p>
                  </div>
                </div>
              </section>

              <section class="form-section" aria-labelledby="service-title">
                <div class="form-section-heading">
                  <span class="form-section-number">03</span>
                  <div>
                    <p class="eyebrow">LAYANAN</p>
                    <h3 id="service-title">Pilih layanan pencucian</h3>
                  </div>
                </div>
                <div class="form-field">
                  <label for="service-select">Layanan</label>
                  <select id="service-select" name="service" disabled>
                    <option value="">Pilih jenis kendaraan terlebih dahulu</option>
                  </select>
                  <p class="field-error" id="service-error" aria-live="polite"></p>
                </div>
                <div class="price-preview" aria-live="polite">
                  <span>Harga layanan</span>
                  <strong id="price-preview">Rp 0</strong>
                </div>
              </section>

              <p class="transaction-error" id="transaction-error" role="alert" aria-live="polite"></p>
              <div class="form-actions">
                <button class="secondary-dashboard-button" id="cancel-transaction" type="button">Batal</button>
                <button class="primary-button dashboard-action" type="submit">Simpan Transaksi</button>
              </div>
            </form>

            <aside class="transaction-summary" aria-labelledby="summary-title">
              <p class="eyebrow">PRATINJAU</p>
              <h3 id="summary-title">Ringkasan Transaksi</h3>
              <dl class="summary-list">
                <div><dt>Pelanggan</dt><dd id="summary-customer">-</dd></div>
                <div><dt>Nomor Plat</dt><dd id="summary-plate">-</dd></div>
                <div><dt>Kendaraan</dt><dd id="summary-vehicle">-</dd></div>
                <div><dt>Layanan</dt><dd id="summary-service">-</dd></div>
                <div><dt>Harga</dt><dd id="summary-price">Rp 0</dd></div>
              </dl>
              <div class="summary-hint">Nomor antrean dibuat saat transaksi disimpan.</div>
            </aside>
          </div>

          <section class="transaction-result" id="transaction-result" aria-live="polite" hidden>
            <div class="result-icon" aria-hidden="true">✓</div>
            <div>
              <p class="eyebrow">TRANSAKSI TERSIMPAN</p>
              <h2>Transaksi berhasil dibuat.</h2>
              <div class="result-details">
                <span>Nomor Transaksi <strong id="result-transaction-number">-</strong></span>
                <span>Nomor Antrean <strong id="result-queue-number">-</strong></span>
              </div>
              <div class="result-statuses">
                <div class="result-status result-status-service">
                  <span>Status Pengerjaan</span>
                  <strong id="result-service-status">Menunggu</strong>
                </div>
                <div class="result-status result-status-payment">
                  <span>Status Pembayaran</span>
                  <strong id="result-payment-status">Belum Dibayar</strong>
                </div>
              </div>
              <div class="result-details result-customer-details">
                <span>Pelanggan <strong id="result-customer">-</strong></span>
                <span>Kendaraan <strong id="result-vehicle">-</strong></span>
                <span>Layanan <strong id="result-service">-</strong></span>
                <span>Total <strong id="result-price">Rp 0</strong></span>
              </div>
              <div class="result-actions">
                <a class="primary-button dashboard-action" href="dashboard-kasir.php">Kembali ke Dashboard</a>
                <a class="secondary-dashboard-button" href="dashboard-kasir.php#antrean-section">Lihat Antrean</a>
              </div>
            </div>
          </section>
        </main>

<?php require __DIR__ . '/../../includes/footer.php'; ?>
    

<?php require __DIR__ . '/../../includes/scripts.php'; ?>

<?php
// POST api/transaksi.php {nama, telepon, plat, jenis, id_layanan, [id_antrean]}
//   - id_antrean kosong  → buat nomor antrean baru (urut per hari)
//   - id_antrean diisi   → kendaraan tambahan memakai nomor antrean yang sama; statusnya ikut antrean itu
require __DIR__ . '/../includes/auth.php';
$u = api_guard(['Kasir'], true);
$in = body(); $db = db();
$nama = trim($in['nama'] ?? ''); $plat = strtoupper(trim($in['plat'] ?? ''));
if ($nama === '' || $plat === '' || empty($in['id_layanan'])) json_out(['error' => 'Data belum lengkap'], 422);

$db->beginTransaction();
try {
  $lay = $db->prepare("SELECT * FROM layanan WHERE id_layanan = ? AND status_layanan = 'Aktif' AND deleted_at IS NULL");
  $lay->execute([(int)$in['id_layanan']]); $layanan = $lay->fetch();
  if (!$layanan || $layanan['jenis_kendaraan'] !== ($in['jenis'] ?? '')) throw new RuntimeException('Layanan tidak sesuai jenis kendaraan');

  $idAntrean = (int)($in['id_antrean'] ?? 0);
  if ($idAntrean) {
    $c = $db->prepare('SELECT id_antrean FROM antrean WHERE id_antrean = ? AND deleted_at IS NULL AND tanggal_antrean = CURRENT_DATE FOR UPDATE');
    $c->execute([$idAntrean]); if (!$c->fetch()) throw new RuntimeException('Nomor antrean tidak ditemukan');
  } else {
    $n = $db->query('SELECT COALESCE(MAX(nomor_antrean),0)+1 FROM antrean WHERE tanggal_antrean = CURRENT_DATE FOR UPDATE')->fetchColumn();
    $db->prepare('INSERT INTO antrean (nomor_antrean) VALUES (?)')->execute([$n]);
    $idAntrean = (int)$db->lastInsertId();
  }
  $db->prepare('INSERT INTO pelanggan (nama_pelanggan, no_telepon) VALUES (?, ?)')->execute([$nama, trim($in['telepon'] ?? '')]);
  $idPel = (int)$db->lastInsertId();
  $db->prepare('INSERT INTO kendaraan (id_pelanggan, id_antrean, nomor_plat, jenis_kendaraan) VALUES (?,?,?,?)')->execute([$idPel, $idAntrean, $plat, $layanan['jenis_kendaraan']]);
  $idKend = (int)$db->lastInsertId();

  $urut = $db->query("SELECT COUNT(*)+1 FROM transaksi WHERE tanggal_transaksi = CURRENT_DATE")->fetchColumn(); // termasuk yang sudah di-soft-delete
  $noTrx = 'TRX-' . date('Ymd') . '-' . str_pad($urut, 3, '0', STR_PAD_LEFT);
  $db->prepare('INSERT INTO transaksi (no_transaksi, id_kendaraan, id_antrean, id_karyawan, tanggal_transaksi, waktu_transaksi, total_harga)
                VALUES (?,?,?,?,CURRENT_DATE,CURRENT_TIME,?)')->execute([$noTrx, $idKend, $idAntrean, $u['id'], $layanan['harga']]);
  $idTrx = (int)$db->lastInsertId();
  $db->prepare('INSERT INTO detail_transaksi (id_transaksi, id_layanan, jumlah, harga_satuan, subtotal) VALUES (?,?,1,?,?)')
     ->execute([$idTrx, $layanan['id_layanan'], $layanan['harga'], $layanan['harga']]);
  $db->prepare('INSERT IGNORE INTO antrean_karyawan (id_antrean, id_karyawan) VALUES (?,?)')->execute([$idAntrean, $u['id']]);
  $db->commit();
  json_out(['ok' => true, 'id_transaksi' => $idTrx, 'no_transaksi' => $noTrx, 'id_antrean' => $idAntrean], 201);
} catch (Throwable $e) {
  $db->rollBack();
  json_out(['error' => $e instanceof RuntimeException ? $e->getMessage() : 'Gagal menyimpan transaksi'], 422);
}

<?php
// POST api/transaksi.php {nama, telepon, plat, jenis, id_layanan, [id_antrean]}   (Versi PostgreSQL)
//   - id_antrean kosong  → buat nomor antrean baru (urut per hari)
//   - id_antrean diisi   → kendaraan tambahan memakai nomor antrean yang sama; statusnya ikut antrean itu
require __DIR__ . '/../includes/auth.php';
$u = api_guard(['Kasir'], true);
$in = body(); $db = db();
$nama = trim($in['nama'] ?? ''); $plat = strtoupper(trim($in['plat'] ?? ''));
if ($nama === '' || $plat === '' || empty($in['id_layanan'])) json_out(['error' => 'Data belum lengkap'], 422);

// PostgreSQL: ambil ID baru lewat RETURNING (pengganti lastInsertId()).
function ins_id(PDO $db, string $sql, array $params, string $pk): int {
  $st = $db->prepare($sql . ' RETURNING ' . $pk);
  $st->execute($params);
  return (int)$st->fetchColumn();
}

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
    // PostgreSQL tidak mengizinkan FOR UPDATE bersama MAX(); pakai advisory lock per hari agar nomor tidak kembar.
    $db->query("SELECT pg_advisory_xact_lock(hashtext('antrean_' || CURRENT_DATE::text))");
    $n = (int)$db->query('SELECT COALESCE(MAX(nomor_antrean), 0) + 1 FROM antrean WHERE tanggal_antrean = CURRENT_DATE AND deleted_at IS NULL')->fetchColumn();
    $idAntrean = ins_id($db, 'INSERT INTO antrean (nomor_antrean) VALUES (?)', [$n], 'id_antrean');
  }
  $idPel = ins_id($db, 'INSERT INTO pelanggan (nama_pelanggan, no_telepon) VALUES (?, ?)',
                  [$nama, trim($in['telepon'] ?? '')], 'id_pelanggan');
  $idKend = ins_id($db, 'INSERT INTO kendaraan (id_pelanggan, id_antrean, nomor_plat, jenis_kendaraan) VALUES (?,?,?,?)',
                   [$idPel, $idAntrean, $plat, $layanan['jenis_kendaraan']], 'id_kendaraan');

  // Nomor urut: pakai MAX dari akhiran nomor (sama dengan api/sync.php) supaya tidak bentrok
  // dengan transaksi lain, dan dikunci per hari.
  $db->query("SELECT pg_advisory_xact_lock(hashtext('trx_' || CURRENT_DATE::text))");
  $urut = 1 + (int)$db->query("SELECT COALESCE(MAX(CAST(SPLIT_PART(no_transaksi, '-', 3) AS INTEGER)), 0) FROM transaksi
                               WHERE tanggal_transaksi = CURRENT_DATE AND deleted_at IS NULL AND no_transaksi ~ '^TRX-[0-9]{8}-[0-9]+'")->fetchColumn();
  $noTrx = 'TRX-' . date('Ymd') . '-' . str_pad((string)$urut, 3, '0', STR_PAD_LEFT);
  $idTrx = ins_id($db,
    'INSERT INTO transaksi (no_transaksi, id_kendaraan, id_antrean, id_karyawan, tanggal_transaksi, waktu_transaksi, total_harga)
     VALUES (?,?,?,?,CURRENT_DATE,LOCALTIME(0),?)',
    [$noTrx, $idKend, $idAntrean, $u['id'], $layanan['harga']], 'id_transaksi');
  $db->prepare('INSERT INTO detail_transaksi (id_transaksi, id_layanan, jumlah, harga_satuan, subtotal) VALUES (?,?,1,?,?)')
     ->execute([$idTrx, $layanan['id_layanan'], $layanan['harga'], $layanan['harga']]);
  $db->prepare('INSERT INTO antrean_karyawan (id_antrean, id_karyawan) VALUES (?,?) ON CONFLICT DO NOTHING')
     ->execute([$idAntrean, $u['id']]);
  $db->commit();
  json_out(['ok' => true, 'id_transaksi' => $idTrx, 'no_transaksi' => $noTrx, 'id_antrean' => $idAntrean], 201);
} catch (Throwable $e) {
  if ($db->inTransaction()) $db->rollBack();
  if (!($e instanceof RuntimeException)) error_log('[washup transaksi] ' . $e);
  json_out(['error' => $e instanceof RuntimeException ? $e->getMessage() : 'Gagal menyimpan transaksi'], 422);
}
<?php
// GET  api/antrean.php?status=Menunggu&q=...   → daftar antrean aktif (dengan kendaraan & transaksi yang memakainya)
// POST api/antrean.php {action:"status", id_antrean, status}  → ubah status SATU kali untuk semua kendaraan di nomor itu
// POST api/antrean.php {action:"hapus",  id_antrean}          → soft delete (deleted_at), baris tetap di database
require __DIR__ . '/../includes/auth.php';
$method = $_SERVER['REQUEST_METHOD'];
$u = api_guard(['Kasir', 'Petugas', 'Admin', 'Owner'], $method === 'POST');

if ($method === 'GET') {
  $sql = "SELECT a.id_antrean, a.nomor_antrean, a.status_antrean, a.waktu_masuk, a.waktu_mulai, a.waktu_selesai,
                 a.waktu_perubahan_terakhir, k.id_kendaraan, k.nomor_plat, k.jenis_kendaraan,
                 p.nama_pelanggan, p.no_telepon, t.id_transaksi, t.no_transaksi, t.total_harga, t.status_pembayaran,
                 GROUP_CONCAT(l.nama_layanan SEPARATOR ', ') AS layanan
          FROM antrean a
          JOIN transaksi t ON t.id_antrean = a.id_antrean AND t.deleted_at IS NULL
          JOIN kendaraan k ON k.id_kendaraan = t.id_kendaraan AND k.deleted_at IS NULL
          JOIN pelanggan p ON p.id_pelanggan = k.id_pelanggan
          LEFT JOIN detail_transaksi d ON d.id_transaksi = t.id_transaksi AND d.deleted_at IS NULL
          LEFT JOIN layanan l ON l.id_layanan = d.id_layanan
          WHERE a.deleted_at IS NULL AND a.tanggal_antrean = CURRENT_DATE";
  $args = [];
  if (!empty($_GET['status']) && $_GET['status'] !== 'Semua') { $sql .= ' AND a.status_antrean = ?'; $args[] = $_GET['status']; }
  if (!empty($_GET['q'])) { $sql .= ' AND (k.nomor_plat LIKE ? OR p.nama_pelanggan LIKE ?)'; array_push($args, "%{$_GET['q']}%", "%{$_GET['q']}%"); }
  $sql .= ' GROUP BY a.id_antrean, t.id_transaksi ORDER BY a.nomor_antrean';
  $st = db()->prepare($sql); $st->execute($args);
  json_out(['data' => $st->fetchAll()]);
}

$in = body(); $id = (int)($in['id_antrean'] ?? 0);
if ($in['action'] === 'status') {
  if ($u['role'] !== 'Kasir') json_out(['error' => 'Status pengerjaan hanya diperbarui oleh Kasir'], 403);
  $urut = ['Menunggu', 'Sedang Dicuci', 'Selesai'];
  $db = db(); $db->beginTransaction();
  $cur = $db->prepare('SELECT status_antrean FROM antrean WHERE id_antrean = ? AND deleted_at IS NULL FOR UPDATE');
  $cur->execute([$id]); $now = $cur->fetchColumn();
  $i = array_search($now, $urut, true); $j = array_search($in['status'] ?? '', $urut, true);
  if ($i === false || $j === false || $j < $i || $j > $i + 1) { $db->rollBack(); json_out(['error' => 'Perubahan status tidak valid'], 422); }
  // waktu_perubahan_terakhir ikut berubah otomatis (ON UPDATE CURRENT_TIMESTAMP).
  $db->prepare("UPDATE antrean SET status_antrean = ?,
                  waktu_mulai   = IF(? = 'Sedang Dicuci', CURRENT_TIME, waktu_mulai),
                  waktu_selesai = IF(? = 'Selesai', CURRENT_TIME, waktu_selesai)
                WHERE id_antrean = ?")->execute([$in['status'], $in['status'], $in['status'], $id]);
  $db->commit();
  json_out(['ok' => true]);
}
if ($in['action'] === 'hapus') {
  if (!in_array($u['role'], ['Kasir', 'Admin'], true)) json_out(['error' => 'Tidak punya akses'], 403);
  $db = db(); $db->beginTransaction();
  $db->prepare('UPDATE antrean   SET deleted_at = NOW() WHERE id_antrean = ? AND deleted_at IS NULL')->execute([$id]);
  $db->prepare('UPDATE transaksi SET deleted_at = NOW() WHERE id_antrean = ? AND deleted_at IS NULL')->execute([$id]);
  $db->prepare('UPDATE detail_transaksi SET deleted_at = NOW() WHERE deleted_at IS NULL AND id_transaksi IN (SELECT id_transaksi FROM transaksi WHERE id_antrean = ?)')->execute([$id]);
  $db->commit();
  json_out(['ok' => true]);
}
json_out(['error' => 'Aksi tidak dikenal'], 400);

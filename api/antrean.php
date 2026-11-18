<?php
// GET  api/antrean.php?status=Menunggu&q=...   → daftar antrean hari ini
// POST api/antrean.php {action:"status", id_antrean, status} → ubah status antrean
// POST api/antrean.php {action:"hapus", id_antrean} → soft delete antrean dan transaksinya
require __DIR__ . '/../includes/auth.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$u = api_guard(['Kasir', 'Petugas', 'Admin', 'Owner'], $method === 'POST');
$db = db();

if ($method === 'GET') {
    $sql = "SELECT a.id_antrean, a.nomor_antrean, a.status_antrean, a.waktu_masuk, a.waktu_mulai, a.waktu_selesai,
                   a.waktu_perubahan_terakhir, k.id_kendaraan, k.nomor_plat, k.jenis_kendaraan,
                   p.nama_pelanggan, p.no_telepon, t.id_transaksi, t.no_transaksi, t.total_harga, t.status_pembayaran,
                   (SELECT STRING_AGG(l.nama_layanan, ', ' ORDER BY l.nama_layanan)
                      FROM detail_transaksi d
                      JOIN layanan l ON l.id_layanan = d.id_layanan
                     WHERE d.id_transaksi = t.id_transaksi AND d.deleted_at IS NULL) AS layanan
            FROM antrean a
            JOIN transaksi t ON t.id_antrean = a.id_antrean AND t.deleted_at IS NULL
            JOIN kendaraan k ON k.id_kendaraan = t.id_kendaraan AND k.deleted_at IS NULL
            JOIN pelanggan p ON p.id_pelanggan = k.id_pelanggan AND p.deleted_at IS NULL
            WHERE a.deleted_at IS NULL AND a.tanggal_antrean = CURRENT_DATE";

    $params = [];
    $status = trim((string)($_GET['status'] ?? ''));
    if ($status !== '' && $status !== 'Semua') {
        if (!in_array($status, ['Menunggu', 'Sedang Dicuci', 'Selesai'], true)) {
            json_out(['error' => 'Filter status tidak valid.'], 422);
        }
        $sql .= ' AND a.status_antrean = ?';
        $params[] = $status;
    }

    $query = trim((string)($_GET['q'] ?? ''));
    if ($query !== '') {
        $sql .= ' AND (k.nomor_plat ILIKE ? OR p.nama_pelanggan ILIKE ?)';
        $pattern = '%' . str_replace(['%', '_'], ['\\%', '\\_'], $query) . '%';
        $params[] = $pattern;
        $params[] = $pattern;
    }

    $sql .= ' ORDER BY a.nomor_antrean, t.id_transaksi';
    $st = $db->prepare($sql);
    $st->execute($params);
    json_out(['data' => $st->fetchAll()]);
}

if ($method !== 'POST') json_out(['error' => 'Metode tidak diizinkan.'], 405);
$in = body();
$action = (string)($in['action'] ?? '');
$id = filter_var($in['id_antrean'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
if ($id === false || $id === null) json_out(['error' => 'ID antrean tidak valid.'], 422);

if ($action === 'status') {
    if ($u['role'] !== 'Kasir') json_out(['error' => 'Status pengerjaan hanya diperbarui oleh Kasir.'], 403);
    $sequence = ['Menunggu', 'Sedang Dicuci', 'Selesai'];
    $newStatus = (string)($in['status'] ?? '');
    if (!in_array($newStatus, $sequence, true)) json_out(['error' => 'Status pengerjaan tidak valid.'], 422);

    $db->beginTransaction();
    try {
        $current = $db->prepare('SELECT status_antrean FROM antrean WHERE id_antrean = ? AND deleted_at IS NULL FOR UPDATE');
        $current->execute([$id]);
        $oldStatus = $current->fetchColumn();
        $oldIndex = array_search($oldStatus, $sequence, true);
        $newIndex = array_search($newStatus, $sequence, true);
        if ($oldIndex === false || $newIndex < $oldIndex || $newIndex > $oldIndex + 1) {
            throw new UserError('Perubahan status tidak valid.');
        }

        $update = $db->prepare(
            "UPDATE antrean SET status_antrean = ?,
                    waktu_mulai = CASE WHEN ? = 'Sedang Dicuci' THEN LOCALTIME(0) ELSE waktu_mulai END,
                    waktu_selesai = CASE WHEN ? = 'Selesai' THEN LOCALTIME(0) ELSE waktu_selesai END
             WHERE id_antrean = ? AND deleted_at IS NULL"
        );
        $update->execute([$newStatus, $newStatus, $newStatus, $id]);
        $db->commit();
        json_out(['ok' => true]);
    } catch (Throwable $e) {
        if ($db->inTransaction()) $db->rollBack();
        if ($e instanceof UserError) json_out(['error' => $e->getMessage()], 422);
        error_log('[washup antrean status] ' . $e);
        json_out(['error' => 'Gagal memperbarui status antrean.'], 500);
    }
}

if ($action === 'hapus') {
    if (!in_array($u['role'], ['Kasir', 'Admin'], true)) json_out(['error' => 'Tidak punya akses.'], 403);
    $db->beginTransaction();
    try {
        $db->prepare('UPDATE antrean SET deleted_at = NOW() WHERE id_antrean = ? AND deleted_at IS NULL')->execute([$id]);
        $db->prepare('UPDATE transaksi SET deleted_at = NOW() WHERE id_antrean = ? AND deleted_at IS NULL')->execute([$id]);
        $db->prepare(
            'UPDATE detail_transaksi SET deleted_at = NOW()
             WHERE deleted_at IS NULL AND id_transaksi IN (SELECT id_transaksi FROM transaksi WHERE id_antrean = ?)'
        )->execute([$id]);
        $db->commit();
        json_out(['ok' => true]);
    } catch (Throwable $e) {
        if ($db->inTransaction()) $db->rollBack();
        error_log('[washup antrean delete] ' . $e);
        json_out(['error' => 'Gagal menghapus antrean.'], 500);
    }
}

json_out(['error' => 'Aksi tidak dikenal.'], 400);

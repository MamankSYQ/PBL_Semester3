<?php
// Padanan PHP dari import-demo.html lama: memasukkan data simulasi, tetapi ke DATABASE (bukan localStorage).
// Hanya Admin, hanya lewat POST + token CSRF, dan hanya bila belum ada transaksi/pengeluaran/absensi.
// Hapus file ini dari server setelah dipakai.
require __DIR__ . '/includes/auth.php';
require __DIR__ . '/includes/files.php';
$u = require_role('Admin');
$db = db();
$h = fn($v) => htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8');
$empty = (int)$db->query('SELECT (SELECT COUNT(*) FROM transaksi) + (SELECT COUNT(*) FROM pengeluaran) + (SELECT COUNT(*) FROM absensi)')->fetchColumn() === 0;
$message = ''; $success = false;

function demo_import(PDO $db): array {
  $raw = json_decode(file_get_contents(__DIR__ . '/sql/demo/washup-demo-data.json'), true)['localStorage'] ?? [];
  $d = fn($k) => is_string($raw[$k] ?? null) ? (json_decode($raw[$k], true) ?: []) : ($raw[$k] ?? []);
  $dt = fn($iso) => date('Y-m-d H:i:s', strtotime($iso));
  $one = function (string $sql, array $a) use ($db) { $s = $db->prepare($sql); $s->execute($a); return $s->fetchColumn(); };
  $n = ['transaksi' => 0, 'pengeluaran' => 0, 'absensi' => 0, 'jadwal' => 0];
  $ins = function (string $sql, array $params, string $pk) use ($db): int {
  $st = $db->prepare($sql . ' RETURNING ' . $pk);
  $st->execute($params);
  return (int)$st->fetchColumn();
};
  $shift = [];
  foreach ($d('washupShifts') as $r) {
  $id = $one('SELECT id_shift FROM shift WHERE nama_shift = ? AND deleted_at IS NULL', [$r['name']]);
  if (!$id) {
    $id = $ins('INSERT INTO shift (nama_shift, jam_mulai, jam_selesai) VALUES (?,?,?)',
               [$r['name'], $r['start'], $r['end']], 'id_shift');
  }
  $shift[$r['id']] = (int)$id;
}

$layanan = [];
foreach ($d('washupServices') as $r) {
  $id = $one('SELECT id_layanan FROM layanan WHERE nama_layanan = ? AND jenis_kendaraan = ? AND deleted_at IS NULL', [$r['name'], $r['vehicleType']]);
  if (!$id) {
    $id = $ins('INSERT INTO layanan (nama_layanan, jenis_kendaraan, harga) VALUES (?,?,?)',
               [$r['name'], $r['vehicleType'], $r['price']], 'id_layanan');
  }
  $layanan[$r['name'] . '|' . $r['vehicleType']] = (int)$id;
}
  $kasir = (int)($one("SELECT id_karyawan FROM karyawan WHERE role = 'Kasir' AND deleted_at IS NULL ORDER BY id_karyawan LIMIT 1", []) ?: $one("SELECT MIN(id_karyawan) FROM karyawan WHERE deleted_at IS NULL", []));

  $tx = $d('washupTransactions'); usort($tx, fn($a, $b) => strcmp($a['createdAt'], $b['createdAt']));
 foreach ($tx as $t) {
  $tgl = date('Y-m-d', strtotime($t['createdAt']));
  $jam = date('H:i:s', strtotime($t['createdAt']));
  $no  = (int)preg_replace('/\D/', '', $t['queueNumber']);

  $ant = $one('SELECT id_antrean FROM antrean WHERE tanggal_antrean = ? AND nomor_antrean = ? AND deleted_at IS NULL', [$tgl, $no]);
  if (!$ant) {
    $st = $t['serviceStatus'] ?? 'Menunggu';
    $ant = $ins(
      'INSERT INTO antrean (tanggal_antrean, nomor_antrean, waktu_masuk, status_antrean, waktu_mulai, waktu_selesai) VALUES (?,?,?,?,?,?)',
      [$tgl, $no, $jam, $st,
       $st === 'Menunggu' ? null : $jam,
       $st === 'Selesai' ? date('H:i:s', strtotime($t['paidAt'] ?? $t['createdAt'])) : null],
      'id_antrean'
    );
  }

  $pel = $ins('INSERT INTO pelanggan (nama_pelanggan, no_telepon) VALUES (?,?)',
              [$t['customerName'], $t['customerPhone'] ?? ''], 'id_pelanggan');

  $ken = $ins('INSERT INTO kendaraan (id_pelanggan, id_antrean, nomor_plat, jenis_kendaraan) VALUES (?,?,?,?)',
              [$pel, $ant, $t['plateNumber'], $t['vehicleType']], 'id_kendaraan');

  $trx = $ins(
    'INSERT INTO transaksi (no_transaksi, id_kendaraan, id_antrean, id_karyawan, tanggal_transaksi, waktu_transaksi, total_harga, metode_pembayaran, status_pembayaran, uang_diterima, kembalian, waktu_pembayaran)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
    [$t['transactionNumber'], $ken, $ant, $kasir, $tgl, $jam, $t['price'],
    $t['paymentMethod'] ?? null, $t['paymentStatus'] ?? 'Belum Dibayar',
    isset($t['amountReceived']) ? (int)$t['amountReceived'] : null,
    isset($t['change']) ? (int)$t['change'] : null,
    isset($t['paidAt']) ? $dt($t['paidAt']) : null],
    'id_transaksi'
  );

  $lid = $layanan[$t['service'] . '|' . $t['vehicleType']] ?? throw new UserError('Layanan demo tidak ditemukan: ' . $t['service']);
  $db->prepare('INSERT INTO detail_transaksi (id_transaksi, id_layanan, jumlah, harga_satuan, subtotal) VALUES (?,?,1,?,?)')
     ->execute([$trx, $lid, $t['price'], $t['price']]);

  $db->prepare('INSERT INTO antrean_karyawan (id_antrean, id_karyawan) VALUES (?,?) ON CONFLICT DO NOTHING')
     ->execute([$ant, $kasir]);

  $n['transaksi']++;
}
  foreach ($d('washupExpenses') as $r) {
    $qty = max(1, (int)$r['quantity']); $unit = (int)($r['unitPrice'] ?? 0) ?: (int)round($r['amount'] / $qty);
    $proof = str_starts_with((string)($r['proofData'] ?? ''), 'data:') ? save_upload($r['proofData'], 'nota', true) : null;
    $db->prepare('INSERT INTO pengeluaran (id_karyawan, tanggal_pengeluaran, keterangan, jumlah, harga_satuan, nominal_pengeluaran, bukti_nota) VALUES (?,?,?,?,?,?,?)')
       ->execute([$kasir, $r['date'], $r['description'], $qty, $unit, $qty * $unit, $proof]); $n['pengeluaran']++;
  }
  foreach ($d('washupPetugasAttendance') as $r) {
    $kid = $one('SELECT id_karyawan FROM karyawan WHERE username = ? AND deleted_at IS NULL', [$r['employeeId']]); if (!$kid) continue;
    $sid = $one('SELECT id_shift FROM shift WHERE nama_shift = ? AND deleted_at IS NULL', [$r['shift'] ?? '']) ?: null;
    $foto = fn($k) => str_starts_with((string)($r[$k] ?? ''), 'data:') ? save_upload($r[$k], 'absensi') : null;
    $db->prepare('INSERT INTO absensi (id_karyawan, id_shift, tanggal_absensi, jam_masuk, jam_keluar, status_absensi, foto_masuk, foto_keluar, verifikasi_masuk, verifikasi_keluar) VALUES (?,?,?,?,?,?,?,?,?,?)')
       ->execute([$kid, $sid, $r['date'], $r['checkIn'] ?? null, $r['checkOut'] ?? null, $r['status'] ?? 'Hadir', $foto('checkInPhoto'), $foto('checkOutPhoto'),
                  !empty($r['checkInVerified']) ? $dt($r['checkInVerifiedAt'] ?? $r['date']) : null, !empty($r['checkOutVerified']) ? $dt($r['checkOutVerifiedAt'] ?? $r['date']) : null]);
    $n['absensi']++;
  }
  foreach (['washupShiftSchedule' => 'jadwal_shift', 'washupShiftSchedulePublished' => 'jadwal_shift_terbit'] as $key => $table)
    foreach ($d($key) as $tgl => $rows) foreach ($rows as $user => $val) {
      $kid = $one('SELECT id_karyawan FROM karyawan WHERE username = ? AND deleted_at IS NULL', [$user]); if (!$kid) continue;
      $db->prepare("INSERT INTO $table (id_karyawan, tanggal, id_shift) VALUES (?,?,?)")->execute([$kid, $tgl, $val === 'libur' ? null : ($shift[$val] ?? null)]);
      if ($table === 'jadwal_shift') $n['jadwal']++;
    }
  foreach ($d('washupShiftSchedulePublishedAt') as $week => $iso)
  $db->prepare('INSERT INTO jadwal_terbit_minggu (minggu_mulai, waktu_terbit) VALUES (?,?)
                ON CONFLICT (minggu_mulai) DO UPDATE SET waktu_terbit = EXCLUDED.waktu_terbit')
     ->execute([$week, $dt($iso)]);
  return $n;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  if (!hash_equals(csrf_token(), $_POST['csrf'] ?? '')) { http_response_code(419); $message = 'Token tidak valid. Muat ulang halaman.'; }
  elseif (!$empty) $message = 'Database sudah berisi transaksi, pengeluaran, atau absensi. Impor demo hanya untuk database kosong.';
  else {
    $db->beginTransaction();
    try { $n = demo_import($db); $db->commit(); $success = true; $empty = false;
          $message = "Berhasil! Data demo masuk ke database: {$n['transaksi']} transaksi, {$n['pengeluaran']} pengeluaran, {$n['absensi']} absensi, {$n['jadwal']} jadwal shift."; }
    catch (Throwable $e) { $db->rollBack(); error_log('[washup demo] ' . $e); $message = 'Gagal: ' . ($e instanceof UserError ? $e->getMessage() : 'terjadi kesalahan di server.'); }
  }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Import Demo | WASHUP</title>
  <link rel="icon" type="image/png" href="assets/favicon.png" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Emblema+One&family=Open+Sans:wght@400;600;700&display=swap" />
  <link rel="stylesheet" href="css/tokens.css" />
  <link rel="stylesheet" href="css/landing.css" />
</head>
<body class="error-page">
  <main class="error-card">
    <h1>Import Data Simulasi WASHUP</h1>
    <p>Memasukkan data demo (transaksi, pengeluaran, absensi, jadwal shift) ke database. Hanya bisa dipakai saat database masih kosong.</p>
    <?php if ($message): ?><p role="status"><strong><?= $h($message) ?></strong></p><?php endif; ?>
    <?php if ($empty): ?>
      <form method="post"><input type="hidden" name="csrf" value="<?= $h(csrf_token()) ?>" /><button class="btn-login" type="submit">Import Data Demo</button></form>
    <?php endif; ?>
    <div class="error-actions"><a class="error-link" href="pages/admin/dashboard-admin.php">Ke Dashboard Admin</a></div>
  </main>
</body>
</html>

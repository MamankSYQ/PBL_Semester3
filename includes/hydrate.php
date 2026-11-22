<?php
// Membangun data awal halaman dalam bentuk yang sama dengan isi localStorage lama,
// sehingga js/app.js tetap bisa dipakai. Semua baris yang deleted_at-nya terisi (soft delete) tidak ikut.
// Versi PostgreSQL: parameter opsional ditulis (?::int IS NULL OR kolom = ?) karena PostgreSQL
// tidak bisa menebak tipe parameter pada "? IS NULL".
require_once __DIR__ . '/auth.php';

function iso(?string $date, ?string $time = null): ?string {
  return $date ? date('c', strtotime($date . ($time ? " $time" : ''))) : null;
}
function hhmm(?string $t): ?string { return $t ? substr($t, 0, 5) : null; }
function file_url(?string $path): string { return $path ? root_url() . '/' . $path : ''; }

function hy_users(PDO $db, ?int $id = null): array {
  $adminId = (int)$db->query("SELECT MIN(id_karyawan) FROM karyawan WHERE role='Admin' AND deleted_at IS NULL")->fetchColumn();
  $st = $db->prepare('SELECT * FROM karyawan WHERE deleted_at IS NULL AND (?::int IS NULL OR id_karyawan = ?) ORDER BY id_karyawan');
  $st->execute([$id, $id]);
  return array_map(fn($r) => ['id' => (string)$r['id_karyawan'], 'fullName' => $r['nama_karyawan'], 'username' => $r['username'],
    'phone' => (string)$r['no_telepon'], 'password' => '', 'role' => $r['role'], 'status' => $r['status_akun'],
    'protected' => (int)$r['id_karyawan'] === $adminId], $st->fetchAll());
}
function hy_services(PDO $db, ?int $id = null): array {
  $st = $db->prepare('SELECT * FROM layanan WHERE deleted_at IS NULL AND (?::int IS NULL OR id_layanan = ?) ORDER BY id_layanan');
  $st->execute([$id, $id]);
  return array_map(fn($r) => ['id' => (string)$r['id_layanan'], 'name' => $r['nama_layanan'], 'vehicleType' => $r['jenis_kendaraan'],
    'price' => (int)$r['harga'], 'status' => $r['status_layanan']], $st->fetchAll());
}
function hy_shifts(PDO $db, ?int $id = null): array {
  $st = $db->prepare('SELECT * FROM shift WHERE deleted_at IS NULL AND (?::int IS NULL OR id_shift = ?) ORDER BY id_shift');
  $st->execute([$id, $id]);
  return array_map(fn($r) => ['id' => (string)$r['id_shift'], 'name' => $r['nama_shift'], 'start' => hhmm($r['jam_mulai']),
    'end' => hhmm($r['jam_selesai']), 'status' => $r['status_shift']], $st->fetchAll());
}
// Status pengerjaan dibaca dari antrean, jadi semua kendaraan di nomor antrean yang sama menampilkan status yang sama.
function hy_transactions(PDO $db, ?int $id = null, ?int $antrean = null): array {
  $st = $db->prepare("SELECT t.*, a.nomor_antrean, a.status_antrean, k.nomor_plat, k.jenis_kendaraan, p.nama_pelanggan, p.no_telepon,
      (SELECT l.nama_layanan FROM detail_transaksi d JOIN layanan l ON l.id_layanan = d.id_layanan
        WHERE d.id_transaksi = t.id_transaksi AND d.deleted_at IS NULL ORDER BY d.id_detail_transaksi LIMIT 1) AS layanan
    FROM transaksi t JOIN antrean a ON a.id_antrean = t.id_antrean JOIN kendaraan k ON k.id_kendaraan = t.id_kendaraan
    JOIN pelanggan p ON p.id_pelanggan = k.id_pelanggan
    WHERE t.deleted_at IS NULL AND (?::int IS NULL OR t.id_transaksi = ?) AND (?::int IS NULL OR t.id_antrean = ?) ORDER BY t.id_transaksi");
  $st->execute([$id, $id, $antrean, $antrean]);
  return array_map(function ($r) {
    $o = ['id' => (string)$r['id_transaksi'], 'transactionNumber' => $r['no_transaksi'],
      'queueNumber' => 'A' . str_pad((string)$r['nomor_antrean'], 2, '0', STR_PAD_LEFT), 'customerName' => $r['nama_pelanggan'],
      'customerPhone' => (string)$r['no_telepon'], 'plateNumber' => $r['nomor_plat'], 'vehicleType' => $r['jenis_kendaraan'],
      'service' => (string)$r['layanan'], 'price' => (int)$r['total_harga'], 'serviceStatus' => $r['status_antrean'],
      'paymentStatus' => $r['status_pembayaran'], 'createdAt' => iso($r['tanggal_transaksi'], $r['waktu_transaksi'])];
    if ($r['metode_pembayaran']) $o['paymentMethod'] = $r['metode_pembayaran'];
    if ($r['waktu_pembayaran'])  $o['paidAt'] = iso($r['waktu_pembayaran']);
    if ($r['uang_diterima'] !== null) $o['amountReceived'] = (int)$r['uang_diterima'];
    if ($r['kembalian'] !== null)     $o['change'] = (int)$r['kembalian'];
    return $o;
  }, $st->fetchAll());
}
function hy_attendance(PDO $db, ?int $id = null, ?int $karyawan = null): array {
  $st = $db->prepare('SELECT a.*, k.username, k.nama_karyawan, s.nama_shift FROM absensi a JOIN karyawan k ON k.id_karyawan = a.id_karyawan
    LEFT JOIN shift s ON s.id_shift = a.id_shift
    WHERE a.deleted_at IS NULL AND (?::int IS NULL OR a.id_absensi = ?) AND (?::int IS NULL OR a.id_karyawan = ?) ORDER BY a.tanggal_absensi, a.id_absensi');
  $st->execute([$id, $id, $karyawan, $karyawan]);
  return array_map(function ($r) {
    $o = ['id' => (string)$r['id_absensi'], 'employeeId' => $r['username'], 'employeeName' => $r['nama_karyawan'],
    'date' => str_replace('-', '', $r['tanggal_absensi']), 'shift' => (string)$r['nama_shift'], 'status' => $r['status_absensi']];
    foreach (['In' => 'masuk', 'Out' => 'keluar'] as $k => $col) {
      if ($r["jam_$col"]) $o["check$k"] = hhmm($r["jam_$col"]);
      if ($r["foto_$col"]) $o["check{$k}Photo"] = file_url($r["foto_$col"]);
      $o["check{$k}Verified"] = $r["verifikasi_$col"] !== null;
      if ($r["verifikasi_$col"]) $o["check{$k}VerifiedAt"] = iso($r["verifikasi_$col"]);
    }
    return $o;
  }, $st->fetchAll());
}
function hy_expenses(PDO $db, ?int $id = null): array {
  $st = $db->prepare('SELECT * FROM pengeluaran WHERE deleted_at IS NULL AND (?::int IS NULL OR id_pengeluaran = ?) ORDER BY id_pengeluaran');
  $st->execute([$id, $id]);
  return array_map(fn($r) => ['id' => (string)$r['id_pengeluaran'], 'date' => $r['tanggal_pengeluaran'], 'description' => $r['keterangan'],
    'quantity' => (int)$r['jumlah'], 'unitPrice' => (int)$r['harga_satuan'], 'amount' => (int)$r['nominal_pengeluaran'],
    'proofName' => $r['bukti_nota'] ? basename($r['bukti_nota']) : '', 'proofData' => file_url($r['bukti_nota']),
    'createdAt' => strtotime($r['tanggal_pengeluaran']) * 1000, 'updatedAt' => strtotime($r['tanggal_pengeluaran']) * 1000], $st->fetchAll());
}
// Jadwal: { "YYYY-MM-DD": { username: idShift | "libur" } }
function hy_schedule(PDO $db, string $table): object {
  $rows = $db->query("SELECT j.tanggal, k.username, j.id_shift FROM $table j JOIN karyawan k ON k.id_karyawan = j.id_karyawan
                      WHERE j.deleted_at IS NULL AND k.deleted_at IS NULL ORDER BY j.tanggal")->fetchAll();
  $out = [];
  foreach ($rows as $r) $out[$r['tanggal']][$r['username']] = $r['id_shift'] === null ? 'libur' : (string)$r['id_shift'];
  return (object)array_map(fn($d) => (object)$d, $out);
}
function hy_published_at(PDO $db): object {
  $o = [];
  foreach ($db->query('SELECT minggu_mulai, waktu_terbit FROM jadwal_terbit_minggu') as $r) $o[$r['minggu_mulai']] = iso($r['waktu_terbit']);
  return (object)$o;
}

// Data per role. Semua kunci selalu ada (kosong bila tidak berhak) supaya app.js tidak mengisi data bawaan sendiri.
function hydrate_all(array $u): array {
  $db = db(); $role = $u['role'];
  $isAdmin = $role === 'Admin'; $isOwner = $role === 'Owner'; $isKasir = $role === 'Kasir'; $isPetugas = $role === 'Petugas';
  $users = hy_users($db);
  return [
    'washupUsers' => $users,
    'washupServices' => hy_services($db),
    'washupShifts' => hy_shifts($db),
    'washupTransactions' => hy_transactions($db),
    'washupExpenses' => ($isAdmin || $isOwner || $isKasir) ? hy_expenses($db) : [],
    'washupPetugasAttendance' => ($isPetugas || $isKasir)? hy_attendance($db, null, $u['id']): (($isAdmin || $isOwner) ? hy_attendance($db) : []),
    'washupShiftSchedule' => $isAdmin ? hy_schedule($db, 'jadwal_shift') : (object)[],
    'washupShiftSchedulePublished' => hy_schedule($db, 'jadwal_shift_terbit'),
    'washupShiftSchedulePublishedAt' => hy_published_at($db),
    // Layanan/shift bawaan lama dianggap "sudah dihapus" agar app.js tidak menambahkannya lagi dengan id berbeda.
    'washupDeletedServiceIds' => ['service-mobil-kecil', 'service-mobil-sedang', 'service-mobil-besar', 'service-motor-kecil', 'service-motor-sedang', 'service-motor-besar'],
    'washupDeletedShiftIds' => ['shift-pagi', 'shift-malam'],
  ];
}
// Dipanggil di <head> setiap halaman terproteksi.
function washup_bootstrap(array $u): void {
  $flags = JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT;
  $root = root_url();
  echo '<meta name="csrf-token" content="' . csrf_token() . "\" />\n<script nonce=\"" . csp_nonce() . "\">\n";
  echo 'sessionStorage.setItem("washupRole", ' . json_encode($u['role'], $flags) . ");\n";
  echo 'sessionStorage.setItem("washupUsername", ' . json_encode($u['username'], $flags) . ");\n";
  echo 'window.WASHUP_ROOT = ' . json_encode($root, $flags) . ";\nwindow.WASHUP_CSRF = " . json_encode(csrf_token(), $flags) . ";\n";
  echo 'window.__WASHUP_DATA = ' . json_encode(hydrate_all($u), $flags) . ";\n</script>\n";
  echo '<script src="' . $root . '/js/store.js"></script>' . "\n";
}
<?php
// Satu pintu penulisan data dari js/store.js.  (Versi PostgreSQL)
// POST { key: "washupTransactions", ops: [ {op:"create"|"update"|"delete", id, record, changed:[...]} ] }
// Semua penghapusan = soft delete (deleted_at). Aturan bisnis dan hak akses divalidasi di sini, bukan di browser.
require __DIR__ . '/../includes/auth.php';
require __DIR__ . '/../includes/hydrate.php';
require __DIR__ . '/../includes/files.php';
$u = api_guard(['Admin', 'Kasir', 'Petugas'], true);
$in = body(); $key = (string)($in['key'] ?? ''); $ops = is_array($in['ops'] ?? null) ? $in['ops'] : [];
$WRITE = ['washupUsers' => ['Admin'], 'washupServices' => ['Admin'], 'washupShifts' => ['Admin'],
  'washupShiftSchedule' => ['Admin'], 'washupShiftSchedulePublished' => ['Admin'], 'washupShiftSchedulePublishedAt' => ['Admin'],
  'washupTransactions' => ['Kasir'], 'washupExpenses' => ['Kasir'], 'washupPetugasAttendance' => ['Petugas', 'Admin']];
if (!isset($WRITE[$key])) json_out(['error' => 'Kunci data tidak dikenal'], 400);
if (!in_array($u['role'], $WRITE[$key], true)) json_out(['error' => 'Anda tidak punya akses untuk mengubah data ini.'], 403);
if (count($ops) > 200) json_out(['error' => 'Terlalu banyak perubahan sekaligus'], 413);

// ---------- helper ----------
// PostgreSQL: ambil ID baru lewat RETURNING (pengganti lastInsertId()).
function ins_id(PDO $db, string $sql, array $params, string $pk): int {
  $st = $db->prepare($sql . ' RETURNING ' . $pk);
  $st->execute($params);
  return (int)$st->fetchColumn();
}
function real_id($v): int {
  if (!preg_match('/^\d+$/', (string)$v)) throw new UserError('Data belum tersimpan di server. Muat ulang halaman lalu coba lagi.');
  return (int)$v;
}
function soft(PDO $db, string $table, string $pk, int $id): void {
  $db->prepare("UPDATE $table SET deleted_at = NOW() WHERE $pk = ? AND deleted_at IS NULL")->execute([$id]);
}
function upd(PDO $db, string $table, string $pk, int $id, array $cols): void {
  if (!$cols) return;   // nama kolom hanya dari peta tetap di bawah, bukan dari input
  $set = implode(', ', array_map(fn($c) => "$c = ?", array_keys($cols)));
  $db->prepare("UPDATE $table SET $set WHERE $pk = ? AND deleted_at IS NULL")->execute([...array_values($cols), $id]);
}
function pick(array $op, array $map): array {
  $r = $op['record'] ?? []; $ch = $op['changed'] ?? array_keys($map); $o = [];
  foreach ($map as $field => $col) if (in_array($field, $ch, true) && array_key_exists($field, $r)) $o[$col] = is_string($r[$field]) ? trim($r[$field]) : $r[$field];
  return $o;
}
function need_text(?string $v, string $label): string {
  if ($v === null || trim($v) === '') throw new UserError("$label wajib diisi.");
  return trim($v);
}
function hhmm_ok(?string $v, string $label): string {
  if (!preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', (string)$v)) throw new UserError("$label tidak valid.");
  return $v;
}
function res(array $op, array $record, array $extra = []): array { return ['id' => $op['id'] ?? null, 'record' => $record] + $extra; }
function find_shift_id(PDO $db, ?string $name): ?int {
  if (!$name) return null;
  $st = $db->prepare('SELECT id_shift FROM shift WHERE nama_shift = ? AND deleted_at IS NULL LIMIT 1'); $st->execute([$name]);
  return ($v = $st->fetchColumn()) === false ? null : (int)$v;
}

// ---------- Akun pengguna (Admin) ----------
function sync_users(PDO $db, array $u, array $ops): array {
  $out = []; $roles = ['Admin', 'Kasir', 'Petugas', 'Owner'];
  $map = ['fullName' => 'nama_karyawan', 'username' => 'username', 'phone' => 'no_telepon', 'role' => 'role', 'status' => 'status_akun'];
  $protected = (int)$db->query("SELECT MIN(id_karyawan) FROM karyawan WHERE role='Admin' AND deleted_at IS NULL")->fetchColumn();
  try {
    foreach ($ops as $op) {
      if ($op['op'] === 'create') {
        $r = $op['record'];
        $role = $r['role'] ?? ''; if (!in_array($role, $roles, true)) throw new UserError('Role tidak valid.');
        $pw = (string)($r['password'] ?? ''); if (strlen($pw) < 6) throw new UserError('Password minimal 6 karakter.');
        $newId = ins_id($db,
          'INSERT INTO karyawan (nama_karyawan, username, no_telepon, role, status_akun, password) VALUES (?,?,?,?,?,?)',
          [need_text($r['fullName'] ?? null, 'Nama lengkap'), strtolower(need_text($r['username'] ?? null, 'Username')), trim($r['phone'] ?? ''),
           $role, ($r['status'] ?? 'Aktif') === 'Nonaktif' ? 'Nonaktif' : 'Aktif', password_hash($pw, PASSWORD_DEFAULT)],
          'id_karyawan');
        $out[] = res($op, hy_users($db, $newId)[0]);
      } elseif ($op['op'] === 'update') {
        $id = real_id($op['id']); $cols = pick($op, $map);
        if (isset($cols['username'])) $cols['username'] = strtolower(need_text($cols['username'], 'Username'));
        if (isset($cols['role']) && !in_array($cols['role'], $roles, true)) throw new UserError('Role tidak valid.');
        if ($id === $protected && ((isset($cols['role']) && $cols['role'] !== 'Admin') || (isset($cols['status_akun']) && $cols['status_akun'] !== 'Aktif')))
          throw new UserError('Akun Admin utama tidak boleh dinonaktifkan atau diubah rolenya.');
        if ($id === $u['id'] && isset($cols['status_akun']) && $cols['status_akun'] !== 'Aktif') throw new UserError('Anda tidak bisa menonaktifkan akun sendiri.');
        $pw = (string)($op['record']['password'] ?? '');
        if (in_array('password', $op['changed'] ?? [], true) && $pw !== '') {
          if (strlen($pw) < 6) throw new UserError('Password minimal 6 karakter.');
          $cols['password'] = password_hash($pw, PASSWORD_DEFAULT);
        }
        upd($db, 'karyawan', 'id_karyawan', $id, $cols);
        $out[] = res($op, hy_users($db, $id)[0]);
      } elseif ($op['op'] === 'delete') {
        $id = real_id($op['id']);
        if ($id === $protected || $id === $u['id']) throw new UserError('Akun ini tidak boleh dihapus.');
        soft($db, 'karyawan', 'id_karyawan', $id); $out[] = ['id' => $op['id']];
      }
    }
  } catch (PDOException $e) {
    // PostgreSQL: 23505 = unique_violation (MySQL memakai 23000)
    if ($e->getCode() === '23505') throw new UserError('Username sudah dipakai akun lain.');
    throw $e;
  }
  return $out;
}

// ---------- Layanan & shift (Admin) ----------
function sync_services(PDO $db, array $u, array $ops): array {
  $out = []; $map = ['name' => 'nama_layanan', 'vehicleType' => 'jenis_kendaraan', 'price' => 'harga', 'status' => 'status_layanan'];
  foreach ($ops as $op) {
    if ($op['op'] === 'delete') { soft($db, 'layanan', 'id_layanan', real_id($op['id'])); $out[] = ['id' => $op['id']]; continue; }
    $c = pick($op, $map);
    if (isset($c['nama_layanan'])) $c['nama_layanan'] = need_text($c['nama_layanan'], 'Nama layanan');
    if (isset($c['jenis_kendaraan']) && !in_array($c['jenis_kendaraan'], ['Mobil', 'Motor'], true)) throw new UserError('Jenis kendaraan tidak valid.');
    if (isset($c['harga'])) { $c['harga'] = (int)$c['harga']; if ($c['harga'] < 1) throw new UserError('Harga harus lebih dari 0.'); }
    if (isset($c['status_layanan'])) $c['status_layanan'] = $c['status_layanan'] === 'Nonaktif' ? 'Nonaktif' : 'Aktif';
    if ($op['op'] === 'create') {
      if (count($c) < 4) throw new UserError('Data layanan belum lengkap.');
      $newId = ins_id($db,
        'INSERT INTO layanan (nama_layanan, jenis_kendaraan, harga, status_layanan) VALUES (?,?,?,?)',
        [$c['nama_layanan'], $c['jenis_kendaraan'], $c['harga'], $c['status_layanan']],
        'id_layanan');
      $out[] = res($op, hy_services($db, $newId)[0]);
    } else { $id = real_id($op['id']); upd($db, 'layanan', 'id_layanan', $id, $c); $out[] = res($op, hy_services($db, $id)[0]); }
  }
  return $out;
}
function sync_shifts(PDO $db, array $u, array $ops): array {
  $out = []; $map = ['name' => 'nama_shift', 'start' => 'jam_mulai', 'end' => 'jam_selesai', 'status' => 'status_shift'];
  foreach ($ops as $op) {
    if ($op['op'] === 'delete') { soft($db, 'shift', 'id_shift', real_id($op['id'])); $out[] = ['id' => $op['id']]; continue; }
    $c = pick($op, $map);
    if (isset($c['nama_shift'])) $c['nama_shift'] = need_text($c['nama_shift'], 'Nama shift');
    if (isset($c['jam_mulai'])) hhmm_ok($c['jam_mulai'], 'Jam mulai');
    if (isset($c['jam_selesai'])) hhmm_ok($c['jam_selesai'], 'Jam selesai');
    if (isset($c['status_shift'])) $c['status_shift'] = $c['status_shift'] === 'Nonaktif' ? 'Nonaktif' : 'Aktif';
    if ($op['op'] === 'create') {
      if (count($c) < 4) throw new UserError('Data shift belum lengkap.');
      $newId = ins_id($db,
        'INSERT INTO shift (nama_shift, jam_mulai, jam_selesai, status_shift) VALUES (?,?,?,?)',
        [$c['nama_shift'], $c['jam_mulai'], $c['jam_selesai'], $c['status_shift']],
        'id_shift');
      $out[] = res($op, hy_shifts($db, $newId)[0]);
    } else { $id = real_id($op['id']); upd($db, 'shift', 'id_shift', $id, $c); $out[] = res($op, hy_shifts($db, $id)[0]); }
  }
  return $out;
}

// ---------- Transaksi & antrean (Kasir) ----------
function antrean_set_status(PDO $db, int $idAntrean, string $to): void {
  $urut = ['Menunggu', 'Sedang Dicuci', 'Selesai'];
  $st = $db->prepare('SELECT status_antrean FROM antrean WHERE id_antrean = ? AND deleted_at IS NULL FOR UPDATE'); $st->execute([$idAntrean]);
  $from = $st->fetchColumn(); $i = array_search($from, $urut, true); $j = array_search($to, $urut, true);
  if ($i === false || $j === false) throw new UserError('Status pengerjaan tidak valid.');
  if ($j === $i) return;
  if ($j !== $i + 1) throw new UserError("Status tidak bisa diubah dari $from ke $to.");
  // waktu_perubahan_terakhir diisi otomatis oleh trigger trg_antrean_ubah (lihat washup_pg.sql);
  // berlaku untuk semua kendaraan di nomor antrean ini.
  $db->prepare("UPDATE antrean SET status_antrean = ?,
                  waktu_mulai   = CASE WHEN ?::text = 'Sedang Dicuci' THEN LOCALTIME(0) ELSE waktu_mulai END,
                  waktu_selesai = CASE WHEN ?::text = 'Selesai' THEN LOCALTIME(0) ELSE waktu_selesai END
                WHERE id_antrean = ?")->execute([$to, $to, $to, $idAntrean]);
}
function find_layanan(PDO $db, string $nama, string $jenis): array {
  $st = $db->prepare("SELECT * FROM layanan WHERE nama_layanan = ? AND jenis_kendaraan = ? AND deleted_at IS NULL ORDER BY (status_layanan = 'Aktif') DESC LIMIT 1");
  $st->execute([$nama, $jenis]);
  return $st->fetch() ?: throw new UserError('Layanan tidak ditemukan.');
}
function sync_transactions(PDO $db, array $u, array $ops): array {
  $out = [];
  foreach ($ops as $op) {
    if ($op['op'] === 'create') {
      $r = $op['record'];
      $nama = need_text($r['customerName'] ?? null, 'Nama pelanggan'); $plat = strtoupper(need_text($r['plateNumber'] ?? null, 'Nomor plat'));
      $jenis = $r['vehicleType'] ?? ''; if (!in_array($jenis, ['Mobil', 'Motor'], true)) throw new UserError('Jenis kendaraan tidak valid.');
      $ly = find_layanan($db, (string)($r['service'] ?? ''), $jenis);
      if ($ly['status_layanan'] !== 'Aktif') throw new UserError('Layanan ini sedang nonaktif.');
      if (!empty($r['shareQueue'])) {   // kendaraan tambahan memakai nomor antrean yang sudah ada (status ikut antrean itu)
        $st = $db->prepare('SELECT id_antrean FROM antrean WHERE tanggal_antrean = CURRENT_DATE AND nomor_antrean = ? AND deleted_at IS NULL FOR UPDATE');
        $st->execute([(int)preg_replace('/\D/', '', $r['shareQueue'])]);
        $idAnt = (int)($st->fetchColumn() ?: throw new UserError('Nomor antrean tidak ditemukan.'));
      } else {
        // PostgreSQL tidak mengizinkan FOR UPDATE bersama MAX(); pakai advisory lock per hari agar nomor tidak kembar.
        $db->query("SELECT pg_advisory_xact_lock(hashtext('antrean_' || CURRENT_DATE::text))");
        $n = 1 + (int)$db->query('SELECT COALESCE(MAX(nomor_antrean), 0) FROM antrean WHERE tanggal_antrean = CURRENT_DATE AND deleted_at IS NULL')->fetchColumn();
        $idAnt = ins_id($db, 'INSERT INTO antrean (nomor_antrean) VALUES (?)', [$n], 'id_antrean');
      }
      $idPel = ins_id($db, 'INSERT INTO pelanggan (nama_pelanggan, no_telepon) VALUES (?,?)',
                      [$nama, trim($r['customerPhone'] ?? '')], 'id_pelanggan');
      $idKen = ins_id($db, 'INSERT INTO kendaraan (id_pelanggan, id_antrean, nomor_plat, jenis_kendaraan) VALUES (?,?,?,?)',
                      [$idPel, $idAnt, $plat, $jenis], 'id_kendaraan');
      // nomor urut transaksi harian (format TRX-YYYYMMDD-NNN), dikunci agar tidak kembar
      $db->query("SELECT pg_advisory_xact_lock(hashtext('trx_' || CURRENT_DATE::text))");
      $urut = 1 + (int)$db->query("SELECT COALESCE(MAX(CAST(SPLIT_PART(no_transaksi, '-', 3) AS INTEGER)), 0) FROM transaksi
                                   WHERE tanggal_transaksi = CURRENT_DATE AND deleted_at IS NULL AND no_transaksi ~ '^TRX-[0-9]{8}-[0-9]+'")->fetchColumn();
      $idTrx = ins_id($db,
        'INSERT INTO transaksi (no_transaksi, id_kendaraan, id_antrean, id_karyawan, tanggal_transaksi, waktu_transaksi, total_harga) VALUES (?,?,?,?,CURRENT_DATE,LOCALTIME(0),?)',
        ['TRX-' . date('Ymd') . '-' . str_pad((string)$urut, 3, '0', STR_PAD_LEFT), $idKen, $idAnt, $u['id'], $ly['harga']],
        'id_transaksi');
      $db->prepare('INSERT INTO detail_transaksi (id_transaksi, id_layanan, jumlah, harga_satuan, subtotal) VALUES (?,?,1,?,?)')
         ->execute([$idTrx, $ly['id_layanan'], $ly['harga'], $ly['harga']]);
      $db->prepare('INSERT INTO antrean_karyawan (id_antrean, id_karyawan) VALUES (?,?) ON CONFLICT DO NOTHING')
         ->execute([$idAnt, $u['id']]);
      $out[] = res($op, hy_transactions($db, $idTrx)[0]);
    } elseif ($op['op'] === 'update') {
      $id = real_id($op['id']); $r = $op['record']; $ch = $op['changed'] ?? [];
      $st = $db->prepare('SELECT t.*, a.status_antrean, k.id_pelanggan, k.jenis_kendaraan FROM transaksi t JOIN antrean a ON a.id_antrean = t.id_antrean
                          JOIN kendaraan k ON k.id_kendaraan = t.id_kendaraan WHERE t.id_transaksi = ? AND t.deleted_at IS NULL FOR UPDATE');
      $st->execute([$id]); $t = $st->fetch() ?: throw new UserError('Transaksi tidak ditemukan.');
      $siblings = [];
      if (in_array('serviceStatus', $ch, true)) { antrean_set_status($db, (int)$t['id_antrean'], (string)$r['serviceStatus']); $siblings = hy_transactions($db, null, (int)$t['id_antrean']); }
      upd($db, 'pelanggan', 'id_pelanggan', (int)$t['id_pelanggan'], pick($op, ['customerName' => 'nama_pelanggan', 'customerPhone' => 'no_telepon']));
      $kc = pick($op, ['plateNumber' => 'nomor_plat', 'vehicleType' => 'jenis_kendaraan']);
      if (isset($kc['nomor_plat'])) $kc['nomor_plat'] = strtoupper(need_text($kc['nomor_plat'], 'Nomor plat'));
      upd($db, 'kendaraan', 'id_kendaraan', (int)$t['id_kendaraan'], $kc);
      if (array_intersect(['service', 'vehicleType'], $ch)) {
        $ly = find_layanan($db, (string)$r['service'], (string)$r['vehicleType']);
        $db->prepare('UPDATE detail_transaksi SET id_layanan = ?, harga_satuan = ?, subtotal = ? WHERE id_transaksi = ? AND deleted_at IS NULL')->execute([$ly['id_layanan'], $ly['harga'], $ly['harga'], $id]);
        upd($db, 'transaksi', 'id_transaksi', $id, ['total_harga' => $ly['harga']]);
      }
      if (array_intersect(['paymentStatus', 'paymentMethod', 'amountReceived', 'change'], $ch)) {
        $ps = ($r['paymentStatus'] ?? '') === 'Lunas' ? 'Lunas' : 'Belum Dibayar';
        $now = $db->prepare('SELECT status_antrean FROM antrean WHERE id_antrean = ?'); $now->execute([$t['id_antrean']]);
        if ($ps === 'Lunas' && $now->fetchColumn() !== 'Selesai') throw new UserError('Pembayaran hanya bisa dikonfirmasi setelah pengerjaan selesai.');
        $metode = $r['paymentMethod'] ?? null; if ($metode !== null && !in_array($metode, ['Tunai', 'QRIS'], true)) throw new UserError('Metode pembayaran tidak valid.');
        $db->prepare("UPDATE transaksi SET status_pembayaran = ?, metode_pembayaran = ?, uang_diterima = ?, kembalian = ?,
                      waktu_pembayaran = CASE WHEN ?::text = 'Lunas' THEN COALESCE(waktu_pembayaran, NOW()) ELSE NULL END WHERE id_transaksi = ?")
           ->execute([$ps, $metode, isset($r['amountReceived']) ? (int)$r['amountReceived'] : null, isset($r['change']) ? (int)$r['change'] : null, $ps, $id]);
      }
      $out[] = res($op, hy_transactions($db, $id)[0], ['siblings' => $siblings]);
    } elseif ($op['op'] === 'delete') {
      $id = real_id($op['id']);
      $st = $db->prepare('SELECT id_antrean FROM transaksi WHERE id_transaksi = ? AND deleted_at IS NULL'); $st->execute([$id]);
      if (($idAnt = $st->fetchColumn()) === false) { $out[] = ['id' => $op['id']]; continue; }
      soft($db, 'transaksi', 'id_transaksi', $id); soft($db, 'detail_transaksi', 'id_transaksi', $id);
      $left = $db->prepare('SELECT COUNT(*) FROM transaksi WHERE id_antrean = ? AND deleted_at IS NULL'); $left->execute([$idAnt]);
      if ((int)$left->fetchColumn() === 0) soft($db, 'antrean', 'id_antrean', (int)$idAnt);   // nomor antrean ditutup bila tak ada kendaraan lagi
      $out[] = ['id' => $op['id']];
    }
  }
  return $out;
}

// ---------- Pengeluaran (Kasir) ----------
function sync_expenses(PDO $db, array $u, array $ops): array {
  $out = [];
  foreach ($ops as $op) {
    if ($op['op'] === 'delete') { soft($db, 'pengeluaran', 'id_pengeluaran', real_id($op['id'])); $out[] = ['id' => $op['id']]; continue; }
    $r = $op['record'];
    $date = (string)($r['date'] ?? ''); if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || !strtotime($date)) throw new UserError('Tanggal tidak valid.');
    $desc = need_text($r['description'] ?? null, 'Keterangan'); $qty = (int)($r['quantity'] ?? 0);
    if ($qty < 1) throw new UserError('Jumlah barang minimal 1.');
    $unit = (int)($r['unitPrice'] ?? 0) ?: (int)round(((int)($r['amount'] ?? 0)) / $qty);
    if ($unit < 1) throw new UserError('Harga satuan harus lebih dari 0.');
    $proof = (string)($r['proofData'] ?? '');
    if ($op['op'] === 'create') {
      $path = str_starts_with($proof, 'data:') ? save_upload($proof, 'nota', true) : null;
      $newId = ins_id($db,
        'INSERT INTO pengeluaran (id_karyawan, tanggal_pengeluaran, keterangan, jumlah, harga_satuan, nominal_pengeluaran, bukti_nota) VALUES (?,?,?,?,?,?,?)',
        [$u['id'], $date, $desc, $qty, $unit, $qty * $unit, $path], 'id_pengeluaran');
      $out[] = res($op, hy_expenses($db, $newId)[0]);
    } else {
      $id = real_id($op['id']); $c = ['tanggal_pengeluaran' => $date, 'keterangan' => $desc, 'jumlah' => $qty, 'harga_satuan' => $unit, 'nominal_pengeluaran' => $qty * $unit];
      if (str_starts_with($proof, 'data:')) $c['bukti_nota'] = save_upload($proof, 'nota', true);
      upd($db, 'pengeluaran', 'id_pengeluaran', $id, $c); $out[] = res($op, hy_expenses($db, $id)[0]);
    }
  }
  return $out;
}

// ---------- Absensi (Petugas: absen sendiri; Admin: verifikasi) ----------
function sync_petugasattendance(PDO $db, array $u, array $ops): array {
  $out = [];
  foreach ($ops as $op) {
    $r = $op['record'] ?? []; $ch = $op['changed'] ?? array_keys($r);
    if ($op['op'] === 'delete') throw new UserError('Data absensi tidak bisa dihapus dari aplikasi.');
    if ($u['role'] === 'Admin') {   // Admin hanya boleh memverifikasi
      $id = real_id($op['id']); $c = [];
      foreach (['In' => 'masuk', 'Out' => 'keluar'] as $k => $col) if (in_array("check{$k}Verified", $ch, true)) $c["verifikasi_$col"] = !empty($r["check{$k}Verified"]) ? date('Y-m-d H:i:s') : null;
      upd($db, 'absensi', 'id_absensi', $id, $c); $out[] = res($op, hy_attendance($db, $id)[0]); continue;
    }
    $c = [];
    foreach (['checkIn' => 'jam_masuk', 'checkOut' => 'jam_keluar'] as $f => $col) if (in_array($f, $ch, true) && !empty($r[$f])) $c[$col] = hhmm_ok($r[$f], 'Jam absensi');
    foreach (['checkInPhoto' => 'foto_masuk', 'checkOutPhoto' => 'foto_keluar'] as $f => $col)
      if (in_array($f, $ch, true) && str_starts_with((string)($r[$f] ?? ''), 'data:')) $c[$col] = save_upload($r[$f], 'absensi');
    if (in_array('status', $ch, true) && isset($r['status'])) $c['status_absensi'] = need_text($r['status'], 'Status');
    if (in_array('shift', $ch, true)) $c['id_shift'] = find_shift_id($db, $r['shift'] ?? null);
    $cur = null;
    if ($op['op'] === 'update') { $id = real_id($op['id']); $s = $db->prepare('SELECT id_karyawan FROM absensi WHERE id_absensi = ? AND deleted_at IS NULL'); $s->execute([$id]); $cur = $s->fetchColumn(); }
    else { $s = $db->prepare('SELECT id_absensi FROM absensi WHERE id_karyawan = ? AND tanggal_absensi = CURRENT_DATE AND deleted_at IS NULL'); $s->execute([$u['id']]); $id = $s->fetchColumn() ?: 0; $cur = $id ? $u['id'] : null; }
    if ($op['op'] === 'update' && (int)$cur !== $u['id']) throw new UserError('Anda hanya bisa mengubah absensi sendiri.');
    if ($id) upd($db, 'absensi', 'id_absensi', (int)$id, $c);
    else {   // absensi hanya untuk hari ini; tanggal tidak diambil dari browser
      $id = ins_id($db,
        'INSERT INTO absensi (id_karyawan, tanggal_absensi, id_shift, jam_masuk, jam_keluar, foto_masuk, foto_keluar, status_absensi) VALUES (?,CURRENT_DATE,?,?,?,?,?,?)',
        [$u['id'], $c['id_shift'] ?? null, $c['jam_masuk'] ?? null, $c['jam_keluar'] ?? null, $c['foto_masuk'] ?? null, $c['foto_keluar'] ?? null, $c['status_absensi'] ?? 'Hadir'],
        'id_absensi');
    }
    $out[] = res($op, hy_attendance($db, (int)$id)[0]);
  }
  return $out;
}

// ---------- Jadwal shift (Admin) ----------
function upsert_schedule(PDO $db, string $table, array $ops): array {
  foreach ($ops as $op) {
    $date = (string)($op['date'] ?? ''); if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || !strtotime($date)) throw new UserError('Tanggal jadwal tidak valid.');
    $k = $db->prepare("SELECT id_karyawan FROM karyawan WHERE username = ? AND role IN ('Kasir','Petugas') AND deleted_at IS NULL"); $k->execute([$op['username'] ?? '']);
    if (($kid = $k->fetchColumn()) === false) continue;   // karyawan sudah dihapus: abaikan
    $c = $db->prepare("SELECT id_jadwal FROM $table WHERE id_karyawan = ? AND tanggal = ? AND deleted_at IS NULL"); $c->execute([$kid, $date]); $cur = $c->fetchColumn();
    $v = $op['value'] ?? null;
    if ($v === null) { if ($cur) soft($db, $table, 'id_jadwal', (int)$cur); continue; }
    $sid = $v === 'libur' ? null : real_id($v);
    if ($sid !== null && !find_shift_by_id($db, $sid)) throw new UserError('Shift tidak ditemukan.');
    if ($cur) $db->prepare("UPDATE $table SET id_shift = ? WHERE id_jadwal = ?")->execute([$sid, $cur]);
    else $db->prepare("INSERT INTO $table (id_karyawan, tanggal, id_shift) VALUES (?,?,?)")->execute([$kid, $date, $sid]);
  }
  return [];
}
function find_shift_by_id(PDO $db, int $id): bool { $s = $db->prepare('SELECT 1 FROM shift WHERE id_shift = ? AND deleted_at IS NULL'); $s->execute([$id]); return (bool)$s->fetchColumn(); }
function sync_shiftschedule(PDO $db, array $u, array $ops): array { return upsert_schedule($db, 'jadwal_shift', $ops); }
function sync_shiftschedulepublished(PDO $db, array $u, array $ops): array { return upsert_schedule($db, 'jadwal_shift_terbit', $ops); }
function sync_shiftschedulepublishedat(PDO $db, array $u, array $ops): array {
  foreach ($ops as $op) {
    $week = (string)($op['week'] ?? ''); if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $week)) throw new UserError('Tanggal minggu tidak valid.');
    if (($op['value'] ?? null) === null) $db->prepare('DELETE FROM jadwal_terbit_minggu WHERE minggu_mulai = ?')->execute([$week]);
    else $db->prepare('INSERT INTO jadwal_terbit_minggu (minggu_mulai, waktu_terbit) VALUES (?, NOW())
                       ON CONFLICT (minggu_mulai) DO UPDATE SET waktu_terbit = NOW()')->execute([$week]);
  }
  return [];
}

// ---------- jalankan ----------
$db = db(); $db->beginTransaction();
try {
  $handler = 'sync_' . strtolower(substr($key, 6));
  $results = $handler($db, $u, $ops);
  $db->commit();
  json_out(['ok' => true, 'results' => $results]);
} catch (UserError $e) {
  $db->rollBack(); json_out(['error' => $e->getMessage()], 422);
} catch (Throwable $e) {
  if ($db->inTransaction()) $db->rollBack();
  error_log('[washup sync] ' . $e); json_out(['error' => 'Gagal menyimpan ke server. Coba lagi.'], 500);
}
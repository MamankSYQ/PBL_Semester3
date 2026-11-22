<?php
// POST api/profil.php {username, passwordLama, passwordBaru?}
// Dipakai semua role untuk mengubah username/password MILIK SENDIRI.
// Sengaja terpisah dari api/sync.php: akun lain tidak bisa disentuh, dan role/status tidak bisa diubah dari sini.
require __DIR__ . '/../includes/auth.php';
$u = api_guard(['Admin', 'Kasir', 'Petugas', 'Owner'], true);
$in = body(); $db = db();

$old = (string)($in['passwordLama'] ?? '');
$new = (string)($in['passwordBaru'] ?? '');
$user = strtolower(trim((string)($in['username'] ?? $u['username'])));
if ($user === '') json_out(['error' => 'Username wajib diisi.'], 422);
if ($new !== '' && strlen($new) < 6) json_out(['error' => 'Password minimal 6 karakter.'], 422);

$st = $db->prepare('SELECT password FROM karyawan WHERE id_karyawan = ? AND deleted_at IS NULL');
$st->execute([$u['id']]);
$hash = $st->fetchColumn();
if ($hash === false || !password_verify($old, (string)$hash)) json_out(['error' => 'Password lama salah.'], 422);

try {
  if ($new !== '') {
    $db->prepare('UPDATE karyawan SET username = ?, password = ? WHERE id_karyawan = ? AND deleted_at IS NULL')
       ->execute([$user, password_hash($new, PASSWORD_DEFAULT), $u['id']]);
  } else {
    $db->prepare('UPDATE karyawan SET username = ? WHERE id_karyawan = ? AND deleted_at IS NULL')
       ->execute([$user, $u['id']]);
  }
} catch (PDOException $e) {
  if ($e->getCode() === '23505') json_out(['error' => 'Username sudah dipakai akun lain.'], 422);
  error_log('[washup profil] ' . $e);
  json_out(['error' => 'Gagal menyimpan perubahan.'], 500);
}

$_SESSION['user']['username'] = $user;
json_out(['ok' => true, 'username' => $user]);
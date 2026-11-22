<?php
// POST api/profil.php {username, passwordLama, passwordBaru?}
// Hanya pemilik akun yang dapat mengubah profil. Password lama selalu diverifikasi.
// Identitas akun Admin utama (nama, username, role, status) tetap; password boleh diganti sendiri.
require __DIR__ . '/../includes/auth.php';
$u = api_guard(['Admin', 'Kasir', 'Petugas', 'Owner'], true);
$in = body();
$db = db();

$oldPassword = (string)($in['passwordLama'] ?? '');
$newPassword = (string)($in['passwordBaru'] ?? '');

$st = $db->prepare(
    'SELECT username, password, is_system_account FROM karyawan WHERE id_karyawan = ? AND deleted_at IS NULL AND status_akun = ?'
);
$st->execute([$u['id'], 'Aktif']);
$account = $st->fetch();
if (!$account || !password_verify($oldPassword, (string)$account['password'])) {
    json_out(['error' => 'Password lama salah atau akun tidak aktif.'], 422);
}

$isSystemAccount = $account['is_system_account'] === true || $account['is_system_account'] === 1 || $account['is_system_account'] === '1' || $account['is_system_account'] === 't' || $account['is_system_account'] === 'true';
$username = strtolower(trim((string)($in['username'] ?? $account['username'])));
if (!preg_match('/^[a-z0-9._-]{3,40}$/', $username)) {
    json_out(['error' => 'Username harus 3–40 karakter dan hanya boleh berisi huruf, angka, titik, garis bawah, atau tanda hubung.'], 422);
}
if ($isSystemAccount && $username !== $account['username']) {
    json_out(['error' => 'Identitas akun Admin utama tidak dapat diubah.'], 403);
}
if ($newPassword !== '' && strlen($newPassword) < 8) {
    json_out(['error' => 'Password baru minimal 8 karakter.'], 422);
}

try {
    if ($newPassword !== '') {
        $sql = $isSystemAccount
            ? 'UPDATE karyawan SET password = ? WHERE id_karyawan = ? AND is_system_account = TRUE AND deleted_at IS NULL'
            : 'UPDATE karyawan SET username = ?, password = ? WHERE id_karyawan = ? AND deleted_at IS NULL';
        $params = $isSystemAccount
            ? [password_hash($newPassword, PASSWORD_DEFAULT), $u['id']]
            : [$username, password_hash($newPassword, PASSWORD_DEFAULT), $u['id']];
    } elseif (!$isSystemAccount) {
        $sql = 'UPDATE karyawan SET username = ? WHERE id_karyawan = ? AND deleted_at IS NULL';
        $params = [$username, $u['id']];
    } else {
        // Tidak ada perubahan identitas maupun password yang diminta.
        json_out(['ok' => true, 'username' => $account['username']]);
    }

    $db->prepare($sql)->execute($params);
} catch (PDOException $e) {
    if ($e->getCode() === '23505') json_out(['error' => 'Username sudah dipakai akun lain.'], 422);
    error_log('[washup profil] ' . $e);
    json_out(['error' => 'Gagal menyimpan perubahan.'], 500);
}

if (!$isSystemAccount) {
    $_SESSION['user']['username'] = $username;
}
json_out(['ok' => true, 'username' => $isSystemAccount ? $account['username'] : $username]);

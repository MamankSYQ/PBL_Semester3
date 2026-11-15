<?php
require __DIR__ . '/includes/auth.php';
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $st = db()->prepare("SELECT * FROM karyawan WHERE username = ? AND role = ? AND status_akun = 'Aktif' AND deleted_at IS NULL");
  $st->execute([trim($_POST['username'] ?? ''), $_POST['selectedRole'] ?? '']);
  $u = $st->fetch();
  if ($u && password_verify($_POST['password'] ?? '', $u['password'])) {
    session_regenerate_id(true);
    $_SESSION['user'] = ['id' => (int)$u['id_karyawan'], 'nama' => $u['nama_karyawan'], 'username' => $u['username'], 'role' => $u['role']];
    header('Location: pages/' . HOME_BY_ROLE[$u['role']]); exit;
  }
  $error = 'Username, password, atau role tidak sesuai.';
}
// Tampilan memakai markup login.html lama; hanya form & pesan error yang dinamis.
$html = file_get_contents(__DIR__ . '/login.html');
$html = str_replace('<form id="login-form" novalidate>', '<form id="login-form" method="post" novalidate>', $html);
$html = str_replace('<p class="form-error" id="login-error" role="alert" aria-live="polite"></p>',
  '<p class="form-error" id="login-error" role="alert" aria-live="polite">' . htmlspecialchars($error) . '</p>', $html);
echo $html;

<?php
require __DIR__ . '/includes/auth.php';
function h($v): string { return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'); }
if (current_user() && $_SERVER['REQUEST_METHOD'] === 'GET') { header('Location: pages/' . HOME_BY_ROLE[current_user()['role']]); exit; }
$error = '';
$selectedRole = in_array($_POST['selectedRole'] ?? '', ['Admin', 'Kasir', 'Petugas', 'Owner'], true) ? $_POST['selectedRole'] : 'Admin';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $st = db()->prepare("SELECT * FROM karyawan WHERE username = ? AND role = ? AND status_akun = 'Aktif' AND deleted_at IS NULL");
  $st->execute([strtolower(trim($_POST['username'] ?? '')), $selectedRole]);
  $u = $st->fetch();
  // password_verify juga dijalankan saat akun tidak ada, agar waktu respons tidak membocorkan username yang valid.
  $okPass = password_verify($_POST['password'] ?? '', $u['password'] ?? '$2y$10$usesomesillystringforsalt.invalidhashxxxxxxxxxxxxxxxxxxxx');
  if ($u && $okPass) {
    session_regenerate_id(true);
    $_SESSION['user'] = ['id' => (int)$u['id_karyawan'], 'nama' => $u['nama_karyawan'], 'username' => $u['username'], 'role' => $u['role']];
    header('Location: pages/' . HOME_BY_ROLE[$u['role']]); exit;
  }
  $error = 'Username, password, atau role tidak sesuai.';
}
?>
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Login WASHUP - Sistem Informasi Car Wash" />
    <link rel="icon" type="image/png" href="assets/favicon.png" />
    <title>Login | WASHUP</title>
    <link rel="stylesheet" href="css/tokens.css" />
    <link rel="stylesheet" href="css/style.css" />
    <link rel="stylesheet" href="css/login.css" />
    <link href="https://fonts.googleapis.com/css2?family=Emblema+One&family=Open+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  </head>
  <body class="login-page">
    <main class="login-layout">
      <section class="login-intro" aria-labelledby="login-brand-title">
        <a class="brand login-brand" href="index.php" aria-label="Kembali ke halaman awal WASHUP">
          <img class="washup-logo-icon" src="assets/logo-washup.png" width="68" height="52" alt="Logo mobil sedang dicuci WASHUP" />
          <span class="login-brand-copy">
            <strong>WASHUP</strong>
            <small>Web Administrasi Sistem Hasil Usaha Pelayanan</small>
          </span>
        </a>
      </section>

      <section class="login-card" aria-labelledby="login-title">
        <div class="login-card-heading">
          <p class="eyebrow">WASHUP</p>
          <h1 id="login-title">Selamat Datang</h1>
          <p id="login-brand-title">Silakan masuk ke akun Anda.</p>
        </div>

        <form id="login-form" method="post" novalidate>
          <div class="role-selector" role="group" aria-label="Pilih jenis akun">
            <?php foreach (['Admin', 'Kasir', 'Petugas', 'Owner'] as $r): $on = $r === $selectedRole; ?>
            <button class="role-option<?= $on ? ' is-active' : '' ?>" type="button" data-role="<?= $r ?>" aria-pressed="<?= $on ? 'true' : 'false' ?>"><?= $r ?></button>
            <?php endforeach; ?>

          </div>
          <input type="hidden" id="selected-role" name="selectedRole" value="<?= h($selectedRole) ?>" />
          <div class="form-field">
            <label for="username">Username</label>
            <input id="username" name="username" type="text" autocomplete="username" placeholder="Masukkan username" value="<?= h($_POST['username'] ?? '') ?>" required />
            <p class="field-error" id="username-error" aria-live="polite"></p>
          </div>

          <div class="form-field">
            <label for="password">Password</label>
            <div class="password-field">
              <input id="password" name="password" type="password" autocomplete="current-password" placeholder="Masukkan password" required />
              <button class="password-toggle" id="password-toggle" type="button" aria-label="Tampilkan password" aria-pressed="false" title="Tampilkan password">
                <svg class="eye-icon eye-open" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg class="eye-icon eye-closed" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 3l18 18M10.6 5.2A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a16 16 0 0 1-3.1 3.9M6.2 6.2C3.6 8 2 12 2 12s3.6 7 10 7a10.7 10.7 0 0 0 4.1-.8" />
                  <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                </svg>
              </button>
            </div>
            <p class="field-error" id="password-error" aria-live="polite"></p>
          </div>

          <p class="form-error" id="login-error" role="alert" aria-live="polite"><?= h($error) ?></p>
          <button class="primary-button login-button" type="submit">LOGIN</button>
        </form>

        <p class="login-footer">Silakan gunakan akun yang telah diberikan oleh Admin WASHUP.</p>
      </section>
    </main>

    <script src="js/app.js"></script>
  </body>
</html>

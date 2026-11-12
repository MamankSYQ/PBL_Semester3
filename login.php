<?php
declare(strict_types=1);
require __DIR__ . '/config/app.php';

if (current_user() !== null) {
    header('Location: ' . ROLE_HOME[current_user()['role']]);
    exit;
}

const LOGIN_ROLES = ['Admin', 'Kasir', 'Petugas', 'Owner'];

$selectedRole = 'Admin';
$username = '';
$errors = ['username' => '', 'password' => '', 'login' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $postedRole = (string) ($_POST['selectedRole'] ?? '');
    if (in_array($postedRole, LOGIN_ROLES, true)) {
        $selectedRole = $postedRole;
    }
    $username = trim((string) ($_POST['username'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');

    if ($username === '') {
        $errors['username'] = 'Username wajib diisi.';
    }
    if ($password === '') {
        $errors['password'] = 'Password wajib diisi.';
    }

    if ($errors['username'] === '' && $errors['password'] === '') {
        if (!csrf_valid($_POST['csrf'] ?? null)) {
            $errors['login'] = 'Sesi tidak valid. Muat ulang halaman lalu coba lagi.';
        } else {
            $account = demo_users()[strtolower($username)] ?? null;
            if ($account === null || !password_verify($password, $account['hash'])) {
                $errors['login'] = 'Username atau password salah.';
            } elseif ($account['role'] !== strtolower($selectedRole)) {
                $errors['login'] = 'Akun ini bukan akun ' . $selectedRole . '. Pilih jenis akun yang sesuai.';
            } else {
                session_regenerate_id(true);
                $_SESSION['user'] = [
                    'username' => strtolower($username),
                    'name'     => $account['name'],
                    'role'     => $account['role'],
                ];
                header('Location: ' . ROLE_HOME[$account['role']]);
                exit;
            }
        }
    }
}
?>
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Login WASHUP - Sistem Informasi Car Wash" />
    <title>Login | WASHUP</title>
    <link rel="stylesheet" href="css/style.css" />
    <link rel="stylesheet" href="css/login.css" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@1,900&display=swap" rel="stylesheet" />
  </head>
  <body class="login-page">
    <main class="login-layout">
      <section class="login-intro" aria-labelledby="login-brand-title">
        <a class="brand login-brand" href="index.php" aria-label="Kembali ke halaman awal WASHUP">
          <img class="washup-logo-icon" src="assets/logo-washup.png" alt="Logo mobil sedang dicuci WASHUP" />
          <span class="login-brand-copy">
            <strong>WASHUP</strong>
            <small>Web Administrasi Sistem Hasil Usaha Pelayanan</small>
          </span>
        </a>
      </section>

      <section class="login-card" aria-labelledby="login-title">
        <div class="login-card-heading">
          <p class="eyebrow">WASHUP</p>
          <h2 id="login-title">Selamat Datang</h2>
          <p id="login-brand-title">Silakan masuk ke akun Anda.</p>
        </div>

        <form id="login-form" method="post" action="login.php" novalidate>
          <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>" />
          <div class="role-selector" role="group" aria-label="Pilih jenis akun">
            <?php foreach (LOGIN_ROLES as $r): $on = $r === $selectedRole; ?>
            <button class="role-option<?= $on ? ' is-active' : '' ?>" type="button" data-role="<?= e($r) ?>" aria-pressed="<?= $on ? 'true' : 'false' ?>"><?= e($r) ?></button>
            <?php endforeach; ?>
          </div>
          <input type="hidden" id="selected-role" name="selectedRole" value="<?= e($selectedRole) ?>" />

          <div class="form-field">
            <label for="username">Username</label>
            <input id="username" name="username" type="text" autocomplete="username" placeholder="Masukkan username" value="<?= e($username) ?>" required />
            <p class="field-error" id="username-error" aria-live="polite"><?= e($errors['username']) ?></p>
          </div>

          <div class="form-field">
            <label for="password">Password</label>
            <div class="password-field">
              <input id="password" name="password" type="password" autocomplete="current-password" placeholder="Masukkan password" required />
              <button class="password-toggle" id="password-toggle" type="button" aria-label="Tampilkan password" aria-pressed="false">Lihat</button>
            </div>
            <p class="field-error" id="password-error" aria-live="polite"><?= e($errors['password']) ?></p>
          </div>

          <p class="form-error" id="login-error" role="alert" aria-live="polite"><?= e($errors['login']) ?></p>
          <button class="primary-button login-button" type="submit">LOGIN</button>
        </form>

        <p class="login-footer">Silakan gunakan akun yang telah diberikan oleh Admin WASHUP.</p>
      </section>
    </main>

    <script>
      // Pilihan peran dan tombol lihat password. Pengecekan login dilakukan di server.
      (function () {
        var roleInput = document.getElementById('selected-role');
        var buttons = document.querySelectorAll('.role-option');
        buttons.forEach(function (btn) {
          btn.addEventListener('click', function () {
            buttons.forEach(function (b) {
              b.classList.remove('is-active');
              b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('is-active');
            btn.setAttribute('aria-pressed', 'true');
            roleInput.value = btn.getAttribute('data-role');
          });
        });

        var pw = document.getElementById('password');
        var toggle = document.getElementById('password-toggle');
        toggle.addEventListener('click', function () {
          var show = pw.type === 'password';
          pw.type = show ? 'text' : 'password';
          toggle.textContent = show ? 'Sembunyikan' : 'Lihat';
          toggle.setAttribute('aria-pressed', show ? 'true' : 'false');
          toggle.setAttribute('aria-label', show ? 'Sembunyikan password' : 'Tampilkan password');
        });
      })();
    </script>
  </body>
</html>

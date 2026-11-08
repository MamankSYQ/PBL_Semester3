<?php
session_start();

function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function bridgeAndRedirect(array $user, string $url): void
{
    $role     = json_encode($user['role']);
    $username = json_encode(strtolower($user['username']));
    $target   = json_encode($url);
    echo '<!doctype html><html lang="id"><head><meta charset="UTF-8"><title>Mengalihkan...</title></head><body>'
       . '<p id="msg">Mengalihkan...</p>'
       . '<script>(function(){var ok=false;try{'
       . 'sessionStorage.setItem("washupRole",' . $role . ');'
       . 'sessionStorage.setItem("washupUsername",' . $username . ');'
       . 'ok=sessionStorage.getItem("washupRole")===' . $role . ';}catch(e){}'
       . 'if(ok){window.location.replace(' . $target . ');}'
       . 'else{document.getElementById("msg").innerHTML="Browser ini memblokir sessionStorage, jadi dashboard tidak bisa dibuka. '
       . 'Buka <b>http://localhost/...</b> di Chrome atau Edge biasa (bukan Simple Browser VS Code), lalu login lagi. '
       . '<a href=\"logout.php\">Logout</a>";}'
       . '})();</script>'
       . '<noscript><a href="' . e($url) . '">Lanjutkan</a></noscript></body></html>';
    exit;
}


$redirectByRole = [
    'Admin'   => 'dashboard-admin.html',
    'Kasir'   => 'dashboard-kasir.html',
    'Petugas' => 'dashboard-petugas.html',
    'Owner'   => 'dashboard-owner.html',
];


if (!empty($_SESSION['user'])) {
    $role = $_SESSION['user']['role'];
    bridgeAndRedirect($_SESSION['user'], $redirectByRole[$role] ?? 'index.html');
}


if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}


$demoUsers = [
    ['id' => 1, 'username' => 'admin',   'password' => password_hash('admin123',   PASSWORD_DEFAULT), 'role' => 'Admin'],
    ['id' => 2, 'username' => 'kasir',   'password' => password_hash('kasir123',   PASSWORD_DEFAULT), 'role' => 'Kasir'],
    ['id' => 3, 'username' => 'petugas', 'password' => password_hash('petugas123', PASSWORD_DEFAULT), 'role' => 'Petugas'],
    ['id' => 4, 'username' => 'owner',   'password' => password_hash('owner123',   PASSWORD_DEFAULT), 'role' => 'Owner'],
];

$allowedRoles = array_keys($redirectByRole);
$selectedRole = 'Admin';
$username     = '';
$errors       = ['username' => '', 'password' => '', 'login' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username     = trim($_POST['username'] ?? '');
    $password     = $_POST['password'] ?? '';
    $selectedRole = $_POST['selectedRole'] ?? 'Admin';
    $csrf         = $_POST['csrf_token'] ?? '';

    if (!hash_equals($_SESSION['csrf_token'], $csrf)) {
        $errors['login'] = 'Sesi tidak valid. Silakan muat ulang halaman.';
    } else {
        if (!in_array($selectedRole, $allowedRoles, true)) {
            $selectedRole = 'Admin';
        }
        if ($username === '') {
            $errors['username'] = 'Username wajib diisi.';
        }
        if ($password === '') {
            $errors['password'] = 'Password wajib diisi.';
        }

        if (!$errors['username'] && !$errors['password']) {
            // Cari user yang cocok dengan username dan role
            $user = false;
            foreach ($demoUsers as $candidate) {
                if (
                    strcasecmp($candidate['username'], $username) === 0
                    && $candidate['role'] === $selectedRole
                ) {
                    $user = $candidate;
                    break;
                }
            }

            if ($user && password_verify($password, $user['password'])) {
                session_regenerate_id(true);
                $_SESSION['user'] = [
                    'id'       => $user['id'],
                    'username' => $user['username'],
                    'role'     => $user['role'],
                ];
                unset($_SESSION['csrf_token']);
                bridgeAndRedirect($_SESSION['user'], $redirectByRole[$user['role']]);
            }

            $errors['login'] = 'Username, password, atau jenis akun tidak sesuai.';
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
        <a class="brand login-brand" href="index.html" aria-label="Kembali ke halaman awal WASHUP">
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
          <input type="hidden" name="csrf_token" value="<?= e($_SESSION['csrf_token']) ?>" />

          <div class="role-selector" role="group" aria-label="Pilih jenis akun">
            <?php foreach ($allowedRoles as $role): ?>
              <?php $active = ($role === $selectedRole); ?>
              <button
                class="role-option<?= $active ? ' is-active' : '' ?>"
                type="button"
                data-role="<?= e($role) ?>"
                aria-pressed="<?= $active ? 'true' : 'false' ?>"
              ><?= e($role) ?></button>
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

    <script src="js/app.js"></script>
  </body>
</html>
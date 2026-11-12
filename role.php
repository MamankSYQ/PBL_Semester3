<?php
declare(strict_types=1);
require __DIR__ . '/config/app.php';

$user = require_login();
$messages = [
    'petugas' => 'Dashboard Petugas akan dikembangkan pada tahap berikutnya.',
    'owner'   => 'Dashboard Owner akan dikembangkan pada tahap berikutnya.',
];
$message = $messages[$user['role']] ?? 'Halaman dashboard akan dikembangkan pada tahap berikutnya.';
?>
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Area kerja sementara WASHUP" />
    <title>Area Kerja | WASHUP</title>
    <link rel="stylesheet" href="css/style.css" />
  </head>
  <body class="role-page">
    <div class="app-shell role-shell">
      <header class="topbar">
        <a class="brand" href="index.php" aria-label="WASHUP Beranda">
          <span class="brand-mark">W</span>
          <span>
            <strong>WASHUP</strong>
            <small>Sistem Informasi Car Wash</small>
          </span>
        </a>
        <form method="post" action="logout.php">
          <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>" />
          <button class="secondary-button" id="logout-button" type="submit">Keluar</button>
        </form>
      </header>

      <main class="role-main">
        <section class="role-card" aria-labelledby="role-title">
          <span class="role-icon" aria-hidden="true">W</span>
          <p class="eyebrow">AREA KERJA SEMENTARA</p>
          <h1 id="role-title">Dashboard <span id="role-name"><?= e($user['name']) ?></span></h1>
          <p id="role-message"><?= e($message) ?></p>
          <span class="badge badge-blue">Login berhasil</span>
        </section>
      </main>

      <footer class="footer">
        <span>WASHUP</span>
        <span id="current-year"><?= date('Y') ?></span>
      </footer>
    </div>
  </body>
</html>

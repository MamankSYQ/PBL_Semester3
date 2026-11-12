<?php
/**
 * Pembuka halaman: <head>, sidebar, dan topbar.
 * Variabel yang dibaca dari halaman pemanggil:
 *   $role (admin|kasir), $page (slug menu aktif), $pageTitle, $pageDescription,
 *   $h1, $h1Id (opsional), $bodyClass, $bodyAttrs (opsional), $css (array), $logoutId (opsional),
 *   $layout ('modern' default | 'classic' untuk halaman kasir bergaya style.css)
 */
$user = require_role($role);

function nav_active(string $slug): string
{
    global $page;
    return $page === $slug ? ' active' : '';
}
function nav_current(string $slug): string
{
    global $page;
    return $page === $slug ? ' aria-current="page"' : '';
}

$css = $css ?? ['style.css'];
$fonts = $fonts ?? 'https://fonts.googleapis.com/css2?family=Emblema+One&family=Open+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@1,900&family=Roboto:wght@500&display=swap';
$logoutId = $logoutId ?? 'logout';
$layout = $layout ?? 'modern';
?>
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="<?= e($pageDescription) ?>" />
    <meta name="csrf-token" content="<?= e(csrf_token()) ?>" />
    <title><?= e($pageTitle) ?> | WASHUP</title>
    <?php foreach ($css as $file): ?>
    <link rel="stylesheet" href="../../css/<?= e($file) ?>" />
    <?php endforeach; ?>
    <link href="<?= e($fonts) ?>" rel="stylesheet" />
  </head>
  <body class="<?= e($bodyClass) ?>"<?= $bodyAttrs ?? '' ?>>
    <div class="dashboard-shell">
      <?php require __DIR__ . '/sidebar_' . $role . ($layout === 'classic' ? '_classic' : '') . '.php'; ?>

      <div class="dashboard-content">
<?php if ($layout === 'classic'): ?>
        <header class="dashboard-topbar">
          <div>
            <p class="eyebrow">WASHUP / <?= e(strtoupper($user['role'])) ?></p>
            <h1><?= e($h1) ?></h1>
          </div>
          <div class="user-summary" aria-label="Informasi pengguna">
            <span class="user-avatar" aria-hidden="true"><?= e(strtoupper(substr($user['name'], 0, 1))) ?></span>
            <span>
              <strong><?= e($user['name']) ?></strong>
              <small>Role: <?= e(ucfirst($user['role'])) ?></small>
            </span>
          </div>
        </header>
<?php else: ?>
        <header class="dashboard-topbar">
          <div class="topbar-title-wrap">
            <h1<?= isset($h1Id) ? ' id="' . e($h1Id) . '"' : '' ?>><?= e($h1) ?></h1>
          </div>
          <div class="user-summary" aria-label="Informasi pengguna">
            <div class="user-avatar-circle" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            </div>
            <div class="user-info">
              <strong><?= e($user['name']) ?></strong>
              <small>Role: <?= e(ucfirst($user['role'])) ?></small>
            </div>
          </div>
        </header>
<?php endif; ?>

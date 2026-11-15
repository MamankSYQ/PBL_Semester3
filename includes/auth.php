<?php
require_once __DIR__ . '/db.php';
if (session_status() === PHP_SESSION_NONE) {
  session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'secure' => !empty($_SERVER['HTTPS'])]);
  session_start();
}
const HOME_BY_ROLE = ['Admin' => 'admin/dashboard-admin.php', 'Kasir' => 'kasir/dashboard-kasir.php',
                      'Petugas' => 'petugas/dashboard-petugas.php', 'Owner' => 'owner/dashboard-owner.php'];
function base_url(): string { return rtrim(dirname(dirname($_SERVER['SCRIPT_NAME'])), '/'); }
function current_user(): ?array { return $_SESSION['user'] ?? null; }
function csrf_token(): string { return $_SESSION['csrf'] ??= bin2hex(random_bytes(16)); }
// Halaman: arahkan ke login jika belum masuk / beda role.
function require_role(string ...$roles): array {
  $u = current_user();
  if (!$u || !in_array($u['role'], $roles, true)) {
    header('Location: ' . dirname(dirname($_SERVER['SCRIPT_NAME'])) . '/../login.php'); exit;
  }
  return $u;
}
// API: balas JSON 401/403/419.
function api_guard(array $roles, bool $write = false): array {
  header('Content-Type: application/json; charset=utf-8');
  $u = current_user();
  if (!$u) json_out(['error' => 'Belum login'], 401);
  if (!in_array($u['role'], $roles, true)) json_out(['error' => 'Tidak punya akses'], 403);
  if ($write && !hash_equals($_SESSION['csrf'] ?? '', $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) json_out(['error' => 'Token tidak valid'], 419);
  return $u;
}
function json_out($data, int $code = 200): never { http_response_code($code); echo json_encode($data, JSON_UNESCAPED_UNICODE); exit; }
function body(): array { return json_decode(file_get_contents('php://input'), true) ?: []; }

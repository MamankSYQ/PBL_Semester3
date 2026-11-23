<?php
// Kebijakan CSP sama dengan _headers Netlify, ditambah nonce agar skrip inline pemuat data diizinkan.
function csp_nonce(): string { static $n; return $n ??= base64_encode(random_bytes(16)); }

/**
 * Deteksi HTTPS langsung atau melalui reverse proxy Render.
 * Render menghentikan TLS di edge proxy lalu meneruskan request ke container melalui HTTP.
 */
function request_is_https(): bool {
  $https = strtolower(trim((string)($_SERVER['HTTPS'] ?? '')));
  if ($https !== '' && $https !== 'off' && $https !== '0') return true;

  $forwardedProto = strtolower(trim(explode(',', (string)($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? ''))[0]));
  return $forwardedProto === 'https';
}

function send_security_headers(): void {
  if (headers_sent()) return;
  header("Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-" . csp_nonce() . "'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob: https://br-calm-flower-a1v8n2bl.storage.c-1.ap-southeast-1.aws.neon.tech; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");
  header('X-Frame-Options: DENY'); header('X-Content-Type-Options: nosniff');
  header('Referrer-Policy: strict-origin-when-cross-origin'); header('Permissions-Policy: camera=(self), microphone=(), geolocation=()');
  if (request_is_https()) header('Strict-Transport-Security: max-age=31536000');
}
send_security_headers();

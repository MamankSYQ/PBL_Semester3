<?php
// Kebijakan CSP sama dengan _headers Netlify, ditambah nonce agar skrip inline pemuat data diizinkan.
function csp_nonce(): string { static $n; return $n ??= base64_encode(random_bytes(16)); }
function send_security_headers(): void {
  if (headers_sent()) return;
  header("Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-" . csp_nonce() . "'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");
  header('X-Frame-Options: DENY'); header('X-Content-Type-Options: nosniff');
  header('Referrer-Policy: strict-origin-when-cross-origin'); header('Permissions-Policy: camera=(self), microphone=(), geolocation=()');
  if (!empty($_SERVER['HTTPS'])) header('Strict-Transport-Security: max-age=31536000');
}
send_security_headers();

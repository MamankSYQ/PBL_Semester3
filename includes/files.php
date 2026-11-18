<?php
require_once __DIR__ . '/auth.php';
// Foto/nota dikirim sebagai data URL, disimpan sebagai file; yang masuk database hanya path-nya.
function save_upload(string $dataUrl, string $dir, bool $allowPdf = false): string {
  if (!preg_match('#^data:([\w/+.-]+);base64,(.+)$#s', $dataUrl, $m)) throw new UserError('Format file tidak valid.');
  $bin = base64_decode($m[2], true);
  if ($bin === false || strlen($bin) > 1500000) throw new UserError('File terlalu besar (maksimal 1 MB) atau rusak.');
  $mime = (new finfo(FILEINFO_MIME_TYPE))->buffer($bin);
  $ext = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'] + ($allowPdf ? ['application/pdf' => 'pdf'] : []);
  if (!isset($ext[$mime])) throw new UserError('Jenis file tidak diizinkan.');
  $rel = "uploads/$dir/" . date('Ym') . '/' . bin2hex(random_bytes(12)) . '.' . $ext[$mime];
  $abs = __DIR__ . '/../' . $rel;
  if (!is_dir(dirname($abs)) && !mkdir(dirname($abs), 0755, true)) throw new UserError('Gagal menyimpan file.');
  file_put_contents($abs, $bin);
  return $rel;
}

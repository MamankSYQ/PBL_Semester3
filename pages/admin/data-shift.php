<?php
declare(strict_types=1);
require __DIR__ . '/../../config/app.php';

$page = 'data-shift';
$cfg = [
    'master' => 'shifts',
    'title' => 'Data Shift',
    'desc' => 'Data Shift WASHUP',
    'h1' => 'Data Shift',
    'h2' => 'Kelola data shift',
    'search_label' => 'Cari shift',
    'search_ph' => 'Cari nama atau shift...',
    'panel_eyebrow' => 'DAFTAR SHIFT',
    'panel_h2' => 'Data Shift',
    'caption' => 'Daftar data shift',
    'empty_title' => 'Belum ada shift.',
    'empty_text' => 'Tambahkan shift baru untuk mulai mengelola data.',
    'footer' => 'Kelola Data Shift',
    'form_eyebrow' => 'FORM SHIFT',
    'form_title' => 'Tambah Shift',
    'detail_eyebrow' => 'DETAIL SHIFT',
    'detail_title' => 'Detail Shift',
];

require __DIR__ . '/../../includes/master_page.php';

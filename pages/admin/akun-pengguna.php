<?php
declare(strict_types=1);
require __DIR__ . '/../../config/app.php';

$page = 'akun-pengguna';
$cfg = [
    'master' => 'users',
    'title' => 'Akun Pengguna',
    'desc' => 'Akun Pengguna WASHUP',
    'h1' => 'Akun Pengguna',
    'h2' => 'Kelola akun pengguna',
    'search_label' => 'Cari akun',
    'search_ph' => 'Cari username, role, atau status...',
    'panel_eyebrow' => 'DAFTAR AKUN',
    'panel_h2' => 'Akun Pengguna',
    'caption' => 'Daftar akun pengguna',
    'empty_title' => 'Belum ada daftar pengguna.',
    'empty_text' => 'Data akun pengguna akan muncul setelah akun ditambahkan.',
    'footer' => 'Akun Pengguna',
    'form_eyebrow' => 'FORM AKUN',
    'form_title' => 'Tambah Akun Pengguna',
    'detail_eyebrow' => 'DETAIL AKUN',
    'detail_title' => 'Detail Akun',
];

require __DIR__ . '/../../includes/master_page.php';

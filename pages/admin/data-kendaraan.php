<?php
declare(strict_types=1);
require __DIR__ . '/../../config/app.php';

$page = 'data-kendaraan';
$cfg = [
    'master' => 'vehicles',
    'title' => 'Data Kendaraan',
    'desc' => 'Data Kendaraan WASHUP',
    'h1' => 'Data Kendaraan',
    'h2' => 'Kelola data kendaraan',
    'search_label' => 'Cari data',
    'search_ph' => 'Cari plat, jenis, atau pemilik...',
    'panel_eyebrow' => 'DAFTAR DATA',
    'panel_h2' => 'Data Kendaraan',
    'caption' => 'Daftar data kendaraan',
    'empty_title' => 'Belum ada data.',
    'empty_text' => 'Tambahkan data baru untuk mulai mengelola master.',
    'footer' => 'Data Kendaraan',
    'form_eyebrow' => 'FORM DATA MASTER',
    'form_title' => 'Tambah Data',
    'detail_eyebrow' => 'DETAIL DATA MASTER',
    'detail_title' => 'Detail Data',
];

require __DIR__ . '/../../includes/master_page.php';

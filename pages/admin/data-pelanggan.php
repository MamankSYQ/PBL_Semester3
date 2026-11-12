<?php
declare(strict_types=1);
require __DIR__ . '/../../config/app.php';

$page = 'data-pelanggan';
$cfg = [
    'master' => 'customers',
    'title' => 'Data Pelanggan',
    'desc' => 'Data Pelanggan WASHUP',
    'h1' => 'Data Pelanggan',
    'eyebrow' => 'RINGKASAN ADMINISTRASI',
    'h2' => 'Kelola Data Pelanggan',
    'search_label' => 'Cari data',
    'search_ph' => 'Cari berdasarkan data...',
    'panel_eyebrow' => 'DAFTAR DATA',
    'panel_h2' => 'Data Pelanggan',
    'caption' => 'Daftar data pelanggan',
    'empty_title' => 'Belum ada data.',
    'empty_text' => 'Tambahkan data baru untuk mulai mengelola master.',
    'footer' => 'Data Pelanggan',
    'form_eyebrow' => 'FORM DATA MASTER',
    'form_title' => 'Tambah Data',
    'detail_eyebrow' => 'DETAIL DATA MASTER',
    'detail_title' => 'Detail Data',
];

require __DIR__ . '/../../includes/master_page.php';

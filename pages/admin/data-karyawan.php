<?php
declare(strict_types=1);
require __DIR__ . '/../../config/app.php';

$page = 'data-karyawan';
$cfg = [
    'master' => 'employees',
    'title' => 'Data Karyawan',
    'desc' => 'Data Karyawan WASHUP',
    'h1' => 'Data Karyawan',
    'h2' => 'Kelola data karyawan',
    'search_label' => 'Cari Karyawan',
    'search_ph' => 'Cari nama, jabatan, atau nomor telepon...',
    'panel_eyebrow' => 'DAFTAR KARYAWAN',
    'panel_h2' => 'Data Karyawan',
    'caption' => 'Daftar data karyawan',
    'empty_title' => 'Belum ada karyawan.',
    'empty_text' => 'Tambahkan karyawan baru untuk mulai mengelola data.',
    'footer' => 'Data Karyawan',
    'form_eyebrow' => 'FORM KARYAWAN',
    'form_title' => 'Tambah Karyawan',
    'detail_eyebrow' => 'DETAIL KARYAWAN',
    'detail_title' => 'Detail Karyawan',
];

require __DIR__ . '/../../includes/master_page.php';

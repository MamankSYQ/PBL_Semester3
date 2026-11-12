<?php
declare(strict_types=1);
require __DIR__ . '/../../config/app.php';

$page = 'absensi-lembur';
$cfg = [
    'master' => 'attendance',
    'title' => 'Absensi & Lembur',
    'desc' => 'Absensi dan Lembur WASHUP',
    'h1' => 'Data Absensi',
    'h2' => 'Kelola data absensi',
    'search_label' => 'Cari nama karyawan',
    'search_ph' => 'Cari nama karyawan...',
    'panel_eyebrow' => 'DAFTAR ABSENSI KARYAWAN',
    'panel_h2' => 'Data Absensi Karyawan',
    'caption' => 'Daftar absensi karyawan',
    'empty_title' => 'Belum ada daftar absensi.',
    'empty_text' => 'Data absensi karyawan akan muncul setelah pencatatan kehadiran dilakukan.',
    'footer' => 'Absensi dan Lembur',
    'form_eyebrow' => 'FORM ABSENSI',
    'form_title' => 'Tambah Data Absensi',
    'detail_eyebrow' => 'DETAIL ABSENSI',
    'detail_title' => 'Detail Absensi',
];

require __DIR__ . '/../../includes/master_page.php';

<?php
declare(strict_types=1);
require __DIR__ . '/../../config/app.php';

$page = 'layanan-tarif';
$cfg = [
    'master' => 'services',
    'title' => 'Layanan & Tarif',
    'desc' => 'Layanan dan Tarif WASHUP',
    'h1' => 'Layanan & Tarif',
    'eyebrow' => 'KONFIGURASI LAYANAN',
    'h2' => 'Kelola layanan dan tarif',
    'search_label' => 'Cari layanan',
    'search_ph' => 'Cari nama layanan atau jenis kendaraan...',
    'panel_eyebrow' => 'DAFTAR LAYANAN',
    'panel_h2' => 'Layanan dan Tarif',
    'caption' => 'Daftar layanan dan tarif',
    'empty_title' => 'Belum ada layanan.',
    'empty_text' => 'Tambahkan layanan baru untuk mulai mengelola tarif.',
    'footer' => 'Layanan dan Tarif',
    'form_eyebrow' => 'FORM LAYANAN',
    'form_title' => 'Tambah Layanan',
    'detail_eyebrow' => 'DETAIL LAYANAN',
    'detail_title' => 'Detail Layanan',
];

require __DIR__ . '/../../includes/master_page.php';

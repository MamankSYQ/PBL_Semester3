<?php
// Salin file ini menjadi config/config.local.php lalu isi kredensial database.
// config.local.php sudah masuk .gitignore dan tidak boleh diunggah ke repository.
return [
    'db_host' => '127.0.0.1',
    'db_port' => '5432',
    'db_name' => 'washup',
    'db_user' => 'postgres',
    'db_pass' => '',
    // Untuk koneksi database lokal gunakan 'disable' atau kosongkan.
    // Untuk koneksi remote seperti Supabase gunakan 'require'.
    'db_sslmode' => 'disable',
    'timezone' => 'Asia/Jakarta',
];

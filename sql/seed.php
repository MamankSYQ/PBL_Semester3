<?php
// Jalankan sekali dari terminal: php sql/seed.php  (lalu hapus file ini dari server)
require __DIR__ . '/../includes/db.php';
$akun = [['Admin WASHUP','admin','admin123','Admin'],['Kasir','kasir','kasir123','Kasir'],
         ['Petugas','petugas','petugas123','Petugas'],['Owner','owner','owner123','Owner']];
$st = db()->prepare('INSERT INTO karyawan (nama_karyawan, username, password, role) VALUES (?,?,?,?)');
foreach ($akun as [$nama, $user, $pass, $role]) $st->execute([$nama, $user, password_hash($pass, PASSWORD_DEFAULT), $role]);
echo "Akun awal dibuat. Segera ganti password lewat menu Akun Pengguna.\n";

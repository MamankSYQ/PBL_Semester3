# WASHUP (PHP + MySQL)

## Pasang
1. Hosting PHP 8.1+ dengan MySQL/MariaDB (bukan Netlify). Untuk lokal: XAMPP atau `php -S 127.0.0.1:8000`.
2. Impor `sql/washup.sql` ke MySQL.
3. Salin `config/config.php` → `config/config.local.php`, isi `db_host`, `db_name`, `db_user`, `db_pass`.
4. Jalankan sekali `php sql/seed.php` (akun awal: admin/kasir/petugas/owner, password `<username>123`), lalu hapus file itu. Ganti semua password.
5. Taruh `assets/logo-washup.png` dan `js/landing-cards.js` (dipakai `index.php`, belum ada di proyek). Pastikan folder `uploads/` bisa ditulis web server.
6. Opsional (database kosong, login Admin): buka `/import-demo.php` untuk memasukkan data simulasi, lalu hapus file itu.
7. Nginx: tutup akses ke `includes/`, `config/`, `sql/` (di Apache sudah ada `.htaccess`).

## Cara kerja
- `includes/hydrate.php` mengirim data dari database ke halaman; `js/store.js` mengirim perubahan ke `api/sync.php`.
- Aturan bisnis dan hak akses divalidasi di `api/sync.php` (bukan di browser).
- Hapus di web = soft delete (`deleted_at` terisi), baris tetap ada di database.
- Status pengerjaan ada di tabel `antrean`; semua kendaraan dengan nomor antrean yang sama memakai status itu. `waktu_perubahan_terakhir` berubah otomatis.

## Halaman
Semua halaman sudah `.php`: `index.php`, `login.php`, `logout.php`, `role.php` (mengalihkan ke dashboard role), `404.php` (status 404 asli; `.htaccess` memakai `ErrorDocument`), `import-demo.php`, dan `pages/<role>/*.php`.
Header keamanan (CSP dengan nonce, X-Frame-Options, dll.) dikirim PHP lewat `includes/security.php`; `_headers` hanya untuk Netlify dan tidak dipakai lagi.

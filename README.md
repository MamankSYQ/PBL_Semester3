# WASHUP — Sistem Informasi Car Wash

WASHUP menggunakan **PHP Native** sebagai backend, **PostgreSQL** sebagai database, dan HTML/CSS/JavaScript untuk antarmuka. Aplikasi memiliki halaman berdasarkan role Admin, Kasir, Petugas, dan Owner.

## 1. Persyaratan

- PHP 8.1 atau lebih baru.
- Ekstensi PHP `PDO` dan `PDO_PGSQL` aktif.
- PostgreSQL 14 atau lebih baru, atau proyek PostgreSQL di Supabase.
- Web server Apache/Nginx. Untuk pengembangan lokal dapat menggunakan Laragon.

Pastikan ekstensi aktif dengan:

```bash
php -m
```

Daftar tersebut harus memuat `PDO` dan `pdo_pgsql`.

## 2. Menyiapkan database

1. Buat database bernama `washup` di PostgreSQL (atau siapkan proyek Supabase).
2. Jalankan isi `sql/washup.sql` pada database tersebut. File ini hanya membuat struktur tabel, index, dan trigger.
3. Data master **shift** dan **layanan** tidak dibuat otomatis. Admin menambahkannya dari menu aplikasi.
4. Jangan menjalankan ulang file skema pada database yang sudah berisi tabel tanpa memeriksa keadaan database terlebih dahulu.

Contoh melalui `psql`:

```bash
psql -h 127.0.0.1 -p 5432 -U postgres -d washup -f sql/washup.sql
```

## 3. Konfigurasi koneksi PHP

1. Salin `config/config.php` menjadi `config/config.local.php`.
2. Isi `db_host`, `db_port`, `db_name`, `db_user`, dan `db_pass` sesuai database.
3. Untuk PostgreSQL lokal, `db_sslmode` dapat menggunakan `disable`. Untuk Supabase/remote database, gunakan `require` sesuai detail koneksi penyedia.
4. Jangan commit `config/config.local.php`; file tersebut sudah masuk `.gitignore`.

Contoh struktur `config/config.local.php`:

```php
<?php
return [
    'db_host' => '127.0.0.1',
    'db_port' => '5432',
    'db_name' => 'washup',
    'db_user' => 'postgres',
    'db_pass' => 'password-database',
    'db_sslmode' => 'disable',
    'timezone' => 'Asia/Jakarta',
];
```

Untuk Supabase, gunakan host, port, database, dan user yang ditampilkan pada menu **Connect** proyek Supabase. Jangan meletakkan kredensial database di JavaScript atau file yang dapat diakses publik.

## 4. Membuat akun Admin utama

Akun Admin utama dibuat satu kali melalui `sql/seed.php`. Akun ini memiliki `is_system_account = TRUE`, tidak dapat diedit/dihapus melalui menu Akun Pengguna, dan tidak dapat diubah identitasnya dari menu profil. Pemilik akun tetap dapat mengganti password sendiri setelah memasukkan password lama.

Atur password awal melalui environment variable sebelum menjalankan seed. Gunakan password kuat minimal 12 karakter.

**Windows PowerShell:**

```powershell
$env:WASHUP_ADMIN_PASSWORD = "isi-password-kuat-minimal-12-karakter"
php sql/seed.php
Remove-Item Env:WASHUP_ADMIN_PASSWORD
```

**Linux/macOS:**

```bash
WASHUP_ADMIN_PASSWORD='isi-password-kuat-minimal-12-karakter' php sql/seed.php
```

Username akun awal adalah `admin`. Script seed hanya dapat dijalankan melalui CLI, tidak melalui browser. Seed tidak membuat akun Kasir, Petugas, atau Owner; akun tersebut dibuat oleh Admin melalui menu Akun Pengguna.

## 5. Menjalankan aplikasi secara lokal

1. Letakkan folder proyek di document root Laragon (misalnya `C:\laragon\www\PBL_Semester3`).
2. Pastikan Apache dan PostgreSQL berjalan.
3. Buka `http://localhost/PBL_Semester3/`.
4. Login dengan akun Admin utama yang dibuat pada langkah sebelumnya.
5. Tambahkan layanan dan shift melalui menu Admin, kemudian buat akun Kasir, Petugas, dan Owner.

## 6. Data demo (opsional)

`import-demo.php` memasukkan data simulasi dari `sql/demo/washup-demo-data.json`. Fitur ini hanya untuk pengujian, hanya dapat dijalankan Admin, dan hanya tersedia ketika database belum memiliki transaksi, pengeluaran, atau absensi. Setelah selesai mengimpor, hapus/nonaktifkan `import-demo.php` dari server.

Data demo memerlukan data master shift dan layanan dari file demo; data master akan dibuat bila belum ditemukan.

## 7. Struktur backend

- `config/` — konfigurasi koneksi PostgreSQL.
- `includes/db.php` — koneksi PDO PostgreSQL.
- `includes/auth.php` — sesi login, role guard, dan token CSRF.
- `includes/hydrate.php` — mengambil data dari PostgreSQL untuk antarmuka.
- `api/sync.php` — validasi dan penyimpanan perubahan data aplikasi.
- `api/antrean.php` — daftar, perubahan status, dan penghapusan antrean.
- `api/transaksi.php` — pembuatan transaksi melalui endpoint transaksi.
- `api/profil.php` — perubahan username/password oleh pemilik akun.
- `sql/washup.sql` — struktur database PostgreSQL.
- `sql/seed.php` — pembuatan akun Admin sistem.

## 8. Aturan data penting

- Penghapusan data master/operasional menggunakan soft delete melalui kolom `deleted_at` jika kolom tersebut tersedia di tabel.
- `antrean_karyawan` merupakan tabel relasi dan `jadwal_terbit_minggu` merupakan catatan publikasi; keduanya tidak menggunakan `deleted_at`.
- `is_system_account` adalah penanda akun sistem, bukan role. Nilai `TRUE` hanya untuk satu akun Admin utama; akun lain otomatis `FALSE`.
- Password disimpan sebagai hash menggunakan `password_hash()`, bukan teks asli.
- `api/sync.php` tetap memeriksa role dan aturan bisnis di server. Menyembunyikan tombol di browser bukan pengganti validasi backend.
- Status pengerjaan antrean disimpan pada tabel `antrean`, sehingga kendaraan yang berada pada nomor antrean yang sama mengikuti status tersebut.

## 9. Catatan deployment

Untuk deployment, gunakan hosting yang mendukung PHP 8.1+ dan koneksi PostgreSQL. Vercel/Netlify statis tidak langsung menjalankan PHP Native tanpa runtime/container tambahan. Simpan konfigurasi database di environment/config privat pada server dan aktifkan HTTPS.

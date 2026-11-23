# WASHUP — Web Administrasi Sistem Hasil Usaha Pelayanan

WASHUP adalah aplikasi administrasi layanan yang dibuat menggunakan PHP, JavaScript, dan PostgreSQL. Aplikasi menggunakan Neon PostgreSQL untuk database serta Neon Object Storage (S3-compatible) untuk menyimpan foto absensi dan bukti nota.

> **Status deployment:** panduan ini disusun untuk pengembangan lokal dengan Laragon dan deployment Docker Web Service di Render. Pastikan semua pengujian lokal pada bagian **Checklist sebelum deploy** berhasil sebelum melakukan push dan deployment.

## Teknologi

- PHP 8.3 atau versi yang kompatibel dengan dependensi Composer.
- Apache dengan `mod_rewrite` dan `mod_headers`.
- PostgreSQL melalui PDO dan ekstensi `pdo_pgsql`.
- Composer untuk memasang AWS SDK for PHP.
- Neon PostgreSQL untuk data aplikasi.
- Neon Object Storage untuk file gambar/PDF dengan bucket Private.
- JavaScript untuk antarmuka dan sinkronisasi data melalui `api/sync.php`.
- Docker untuk deployment di Render.

## Struktur penting

```text
PBL_Semester3/
├── api/                 # Endpoint sinkronisasi aplikasi
├── assets/              # Aset tampilan
├── config/
│   ├── config.php       # Konfigurasi dasar dan pembacaan DB_* dari environment
│   └── config.local.php # Konfigurasi lokal/rahasia; tidak di-commit
├── includes/
│   ├── auth.php         # Autentikasi, sesi, dan URL dasar aplikasi
│   ├── db.php           # Koneksi PDO PostgreSQL dan cfg()
│   ├── files.php        # Upload dan presigned URL Neon Object Storage
│   ├── hydrate.php      # Menyediakan data awal untuk halaman
│   └── security.php     # Header keamanan dan CSP
├── js/
│   ├── app.js
│   ├── landing-cards.js  # Interaksi kartu di halaman utama
│   ├── components.js
│   └── store.js         # Sinkronisasi perubahan ke api/sync.php
├── pages/               # Halaman Admin, Kasir, Petugas, dan Owner
├── sql/
│   ├── washup.sql       # Skema untuk database PostgreSQL baru
│   └── seed.php         # Pembuatan akun awal melalui CLI
├── uploads/             # Folder placeholder/legacy; file baru disimpan di Object Storage
├── composer.json
├── composer.lock
├── Dockerfile
├── .dockerignore
├── .gitignore
└── README.md
```

## Persiapan lokal dengan Laragon

1. Pasang Laragon dengan PHP 8.3 (atau versi yang kompatibel), Apache, dan ekstensi `pdo_pgsql`, `fileinfo`, serta `openssl`.
2. Pastikan Composer dapat dijalankan. Jika perintah `composer` belum ada di PATH, jalankan Composer PHAR menggunakan executable PHP Laragon.
3. Buka terminal pada root project, yaitu folder yang berisi `composer.json`.
4. Pasang dependensi:

   ```powershell
   composer install
   ```

   Jika Composer belum terdaftar di PATH pada Windows, gunakan bentuk perintah berikut dan sesuaikan lokasi PHP/Composer di komputer:

   ```powershell
   & "C:\laragon\bin\php\php-8.3.33-Win32-vs16-x64\php.exe" "C:\composer\composer.phar" install
   ```

5. Pastikan folder `vendor/` terbentuk. Folder ini tidak perlu dimasukkan ke Git karena dependensi akan dipasang kembali saat image Docker dibuat.

## Konfigurasi database PostgreSQL

Aplikasi membaca konfigurasi dasar dari `config/config.php`. Untuk pengembangan lokal, buat `config/config.local.php` berdasarkan contoh berikut. File ini bersifat lokal dan **tidak boleh di-commit**.

```php
<?php

return [
    // Neon PostgreSQL
    'db_host' => 'HOST_NEON',
    'db_port' => '5432',
    'db_name' => 'washupPBL1',
    'db_user' => 'washupPBL1_owner',
    'db_pass' => 'PASSWORD_DATABASE',
    'db_sslmode' => 'require',
    'timezone' => 'Asia/Jakarta',

    // Neon Object Storage
    'AWS_ENDPOINT_URL_S3' => 'https://ENDPOINT_STORAGE_NEON',
    'AWS_REGION' => 'ap-southeast-1',
    'AWS_ACCESS_KEY_ID' => 'ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY' => 'SECRET_ACCESS_KEY',
    'NEON_STORAGE_BUCKET' => 'uploads',
];
```

Ganti semua nilai placeholder dengan nilai milik project Neon. Jangan menyalin kredensial ke README, source code publik, screenshot, atau repository.

### Database baru

Untuk membuat database PostgreSQL yang benar-benar kosong:

1. Buat database/branch tujuan di Neon.
2. Buka Neon SQL Editor dan pilih database yang benar.
3. Jalankan seluruh `sql/washup.sql` satu kali untuk membuat tabel, relasi, index, trigger, dan struktur lain yang diperlukan.
4. Pastikan koneksi aplikasi mengarah ke database yang sama.

### Database Neon yang sudah berisi tabel/data

**Jangan menjalankan seluruh `sql/washup.sql` pada database Neon yang sudah digunakan.** File tersebut adalah skema awal untuk database baru dan dapat berbenturan dengan objek yang sudah ada.

Untuk kebutuhan kolom penanda akun sistem, jalankan migrasi berikut hanya jika kolom tersebut belum ada:

```sql
ALTER TABLE karyawan
ADD COLUMN IF NOT EXISTS is_system_account BOOLEAN NOT NULL DEFAULT FALSE;
```

Pada database project yang sudah diperiksa, kolom `is_system_account` telah tersedia dan akun `admin` bernilai `TRUE`; jangan menjalankan migrasi yang sama berulang tanpa kebutuhan.

## Membuat akun awal

File `sql/seed.php`:

- Hanya dapat dijalankan melalui CLI, bukan browser.
- Menggunakan koneksi dari `includes/db.php` dan konfigurasi `config/config.local.php` atau environment yang sesuai.
- Dibuat idempotent: username aktif yang sudah ada tidak dibuat ulang dan password akun yang sudah ada tidak di-reset.
- Menandai akun Admin awal dengan `is_system_account = TRUE`; role lain bernilai `FALSE`.

Pastikan konfigurasi menunjuk ke database Neon yang benar sebelum menjalankan seed. Jalankan dari root project:

```powershell
php sql/seed.php
```

Jika PHP belum ada di PATH Windows, jalankan dengan executable PHP Laragon, misalnya:

```powershell
& "C:\laragon\bin\php\php-8.3.33-Win32-vs16-x64\php.exe" "sql\seed.php"
```

Password demo awal pada seed adalah `admin123`, `kasir123`, `petugas123`, dan `owner123` untuk username masing-masing apabila akun tersebut baru dibuat oleh seed. **Segera ganti password awal setelah login.** Seed tidak mengubah password untuk username aktif yang sudah ada.

Setelah proses inisialisasi selesai, jangan sediakan `sql/seed.php` pada server produksi. Hapus dari image produksi atau pastikan hanya dapat dijalankan melalui CLI dan direktori `sql/` tidak dapat diakses publik.

## Neon Object Storage

WASHUP menggunakan bucket Private bernama `uploads`. File baru disimpan sebagai object key, contohnya:

```text
absensi/202611/nama-file-acak.png
nota/202611/nama-file-acak.png
```

Kolom PostgreSQL (`foto_masuk`, `foto_keluar`, dan `bukti_nota`) menyimpan object key, bukan isi gambar/Base64. `includes/files.php` menggunakan AWS SDK for PHP untuk:

- Mengunggah gambar/PDF ke bucket menggunakan `PutObject`.
- Menghasilkan presigned URL `GetObject` agar file Private dapat ditampilkan.
- Mengembalikan object key untuk disimpan ke PostgreSQL.

Presigned URL pada implementasi saat ini berlaku sekitar **30 menit**. URL tersebut bersifat sementara; aplikasi perlu membuat URL baru dari object key saat data di-hydrate/dimuat ulang. Jangan menyimpan presigned URL sebagai nilai permanen di database.

### Variabel Object Storage

Siapkan variabel berikut:

| Nama | Keterangan |
|---|---|
| `AWS_ENDPOINT_URL_S3` | Endpoint S3-compatible dari Neon Storage |
| `AWS_REGION` | Region Neon Storage, pada project ini `ap-southeast-1` |
| `AWS_ACCESS_KEY_ID` | Access Key ID Storage |
| `AWS_SECRET_ACCESS_KEY` | Secret Access Key Storage |
| `NEON_STORAGE_BUCKET` | Nama bucket, yaitu `uploads` |

Credential Storage harus memiliki izin baca dan tulis yang diperlukan aplikasi. Jangan menggunakan password PostgreSQL sebagai credential Object Storage.

**Penting untuk Render:** `config/config.local.php` sengaja tidak di-commit. Karena itu, `includes/files.php` harus membaca credential Storage dari environment variable ketika key tidak tersedia pada hasil `cfg()`. Pastikan bagian pembacaan konfigurasi di `storage_client()` menggunakan fallback seperti berikut:

```php
$config = cfg();

$endpoint = $config['AWS_ENDPOINT_URL_S3'] ?? (getenv('AWS_ENDPOINT_URL_S3') ?: '');
$region = $config['AWS_REGION'] ?? (getenv('AWS_REGION') ?: '');
$accessKey = $config['AWS_ACCESS_KEY_ID'] ?? (getenv('AWS_ACCESS_KEY_ID') ?: '');
$secretKey = $config['AWS_SECRET_ACCESS_KEY'] ?? (getenv('AWS_SECRET_ACCESS_KEY') ?: '');
```

Dan untuk nama bucket:

```php
$config = cfg();
$bucket = $config['NEON_STORAGE_BUCKET'] ?? (getenv('NEON_STORAGE_BUCKET') ?: 'uploads');
```

Sesuaikan dengan versi PHP project dan pastikan kode tersebut sudah diuji. Tanpa fallback `getenv()`, konfigurasi Storage yang hanya dimasukkan ke Environment Variables Render tidak akan terbaca apabila `config.local.php` tidak ada.

## Cara kerja aplikasi

- `includes/hydrate.php` mengambil data PostgreSQL dan mengirim data awal ke halaman dalam bentuk yang digunakan oleh `js/app.js`.
- `js/store.js` mengirim perubahan melalui `api/sync.php`.
- `api/sync.php` memvalidasi autentikasi, hak akses, dan aturan bisnis di sisi server; validasi penting tidak hanya mengandalkan browser.
- Penghapusan data dari aplikasi menggunakan soft delete (`deleted_at` terisi); data tetap berada di database.
- Status pengerjaan dibaca dari tabel `antrean`. Kendaraan dengan nomor antrean yang sama menggunakan status antrean yang sama.
- `waktu_perubahan_terakhir` diperbarui sesuai mekanisme database yang sudah disediakan.
- Foto absensi dan bukti nota disimpan di Neon Object Storage, sedangkan PostgreSQL menyimpan object key.

## Halaman aplikasi

Halaman utama menggunakan PHP:

- `index.php` — halaman awal.
- `login.php` dan `logout.php` — autentikasi.
- `role.php` — mengarahkan pengguna ke dashboard sesuai role.
- `404.php` — halaman tidak ditemukan dengan status HTTP 404.
- `pages/<role>/*.php` — halaman Admin, Kasir, Petugas, dan Owner.
- `api/sync.php` — endpoint sinkronisasi data.

Header keamanan (CSP dengan nonce, X-Frame-Options, dan header terkait) dikirim oleh PHP melalui `includes/security.php`. File `_headers` adalah konfigurasi lama untuk Netlify dan tidak digunakan oleh Apache di Render. Apache menggunakan `.htaccess`. Cookie sesi mendeteksi HTTPS melalui `X-Forwarded-Proto` ketika berjalan di belakang reverse proxy Render.

## Menjalankan lokal

1. Jalankan Apache melalui Laragon.
2. Pastikan `config/config.local.php`, `vendor/`, dan koneksi ke Neon sudah benar.
3. Buka project melalui URL lokal sesuai folder instalasi Laragon, misalnya:

   ```text
   http://localhost/PBL_Semester3/PBL_Semester3/
   ```

4. Login dengan akun yang sudah tersedia di tabel `karyawan`.
5. Uji proses transaksi, absensi, pengeluaran, dan pembacaan foto.

## Deployment ke Render menggunakan Docker

WASHUP dipersiapkan sebagai **Docker Web Service** di Render, bukan Static Site. Langkah umum:

1. Push repository ke GitHub pada branch yang akan digunakan (misalnya `main`).
2. Di Render, pilih **New → Web Service**, hubungkan repository GitHub, lalu pilih runtime **Docker**.
3. Atur Dockerfile Path sesuai lokasi `Dockerfile` di repository. Jika Dockerfile berada di root repository, gunakan `./Dockerfile`.
4. Pastikan container menjalankan Apache pada port yang digunakan Render. Dockerfile project disiapkan untuk port `10000`; jangan mengubah port tanpa menyesuaikan konfigurasi Apache dan Render.
5. Tambahkan Environment Variables pada Render.
6. Deploy dan periksa build/deploy logs sebelum menguji website.

### Environment Variables Render

Masukkan nilai berikut melalui menu Environment pada Web Service Render. Jangan menaruh credential di Dockerfile atau repository.

| Key | Value |
|---|---|
| `DB_HOST` | Host Neon PostgreSQL |
| `DB_PORT` | `5432` |
| `DB_NAME` | `washupPBL1` |
| `DB_USER` | User PostgreSQL Neon |
| `DB_PASSWORD` | Password PostgreSQL terbaru |
| `DB_SSLMODE` | `require` |
| `AWS_ENDPOINT_URL_S3` | Endpoint Neon Object Storage |
| `AWS_REGION` | `ap-southeast-1` |
| `AWS_ACCESS_KEY_ID` | Access Key ID baru |
| `AWS_SECRET_ACCESS_KEY` | Secret Access Key baru |
| `NEON_STORAGE_BUCKET` | `uploads` |

`config.php` harus memetakan `DB_*` dari environment ke key konfigurasi database yang dibaca `db.php`. Sementara itu, seperti dijelaskan pada bagian Object Storage, `files.php` harus memiliki fallback `getenv()` untuk credential Storage karena `config.local.php` tidak tersedia di repository produksi.

### Persyaratan Dockerfile dan Composer

Karena `vendor/` tidak di-commit, Docker image harus memasang dependensi Composer saat build. Pastikan Dockerfile:

- Mengaktifkan ekstensi `pdo_pgsql` dan modul Apache yang diperlukan (`rewrite` dan `headers`).
- Menyediakan Composer di image build.
- Menyalin `composer.json` dan `composer.lock`, lalu menjalankan `composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader`.
- Menyalin source aplikasi ke document root Apache.
- Mengatur Apache untuk mendengarkan pada port Render yang digunakan.

Jangan menganggap deployment siap hanya karena build Docker berhasil. Pastikan `vendor/autoload.php` tersedia di image hasil build dan lakukan tes koneksi PostgreSQL serta Storage setelah deploy.

## Keamanan dan file yang tidak boleh di-commit

Pastikan `.gitignore` mengecualikan setidaknya:

```gitignore
/config/config.local.php
/config/config.neon-test.php
/vendor/
.env
.env.*
```

Pastikan `.dockerignore` juga mengecualikan credential lokal, `.git`, file editor, arsip backup, folder `vendor/` jika dependensi dipasang di dalam Docker build, serta `sql/seed.php` agar script seed tidak masuk ke image produksi. File `sql/seed.php` tetap dapat disimpan di repository dan dijalankan secara lokal melalui CLI ketika diperlukan.

Sebelum push, periksa:

```powershell
git check-ignore -v config/config.local.php config/config.neon-test.php vendor .env

git ls-files config/config.local.php config/config.neon-test.php

git status
```

Perintah `git ls-files` seharusnya tidak menampilkan file konfigurasi rahasia. Jika file rahasia sudah terlanjur dilacak Git, keluarkan dari index (tanpa menghapus file lokal) dan segera rotasi credential yang pernah ter-commit atau terlihat di screenshot.

File pengujian seperti `test-storage.php`, `test-neon.php`, dan `test-app-db.php` harus dihapus sebelum produksi. `import-demo.php` hanya untuk database kosong/pengujian; hapus atau pastikan tidak tersedia di produksi apabila tidak diperlukan. Jangan menyediakan script migrasi/seed atau endpoint diagnostik yang tidak diperlukan kepada publik.

## Checklist sebelum deploy

- [ ] Login Admin, Kasir, Petugas, dan Owner telah diuji.
- [ ] Dashboard masing-masing role tampil normal tanpa warning PHP.
- [ ] Transaksi baru masuk PostgreSQL dan tampil di riwayat.
- [ ] Absensi masuk dan keluar tersimpan dengan benar.
- [ ] Foto absensi berhasil diunggah ke Neon Storage dan dapat ditampilkan kembali.
- [ ] Pengeluaran dan bukti nota tersimpan; foto nota dapat ditampilkan kembali.
- [ ] Refresh halaman tidak menghilangkan data yang tersimpan.
- [ ] Presigned URL baru dibuat saat data di-hydrate; aplikasi tidak mengandalkan URL yang sudah kedaluwarsa.
- [ ] `config.local.php`, credential, `.env`, dan `vendor/` tidak ikut Git.
- [ ] File pengujian dan data demo yang tidak diperlukan sudah dikeluarkan dari produksi.
- [ ] Dockerfile memasang Composer dependencies dan mengaktifkan `pdo_pgsql`.
- [ ] Environment Variables Render sudah diisi dan tidak ada credential di source code.

## Catatan penting

- `sql/washup.sql` digunakan untuk database PostgreSQL baru. Jangan menjalankan seluruh file pada database Neon aktif yang sudah memiliki tabel dan data.
- `sql/seed.php` hanya dijalankan melalui CLI dan tidak perlu dijalankan ulang jika akun telah tersedia.
- Jangan menghapus bucket `uploads` atau objek di dalamnya ketika memperbarui aplikasi.
- Render filesystem container tidak boleh dijadikan penyimpanan permanen untuk foto; gunakan Neon Object Storage.
- Rotasi password database dan credential Storage jika pernah terlihat di screenshot, dibagikan, atau masuk ke Git.

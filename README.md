# WASHUP

Web Administrasi Sistem Hasil Usaha Pelayanan — sistem informasi untuk usaha car wash Maju Bersama Car Wash 2 (Kota Malang).

Website ini masih berupa prototipe front-end: semua data disimpan di `localStorage` browser dan belum terhubung ke database. Skema database rancangan ada di `sql/table.sql`.

## Teknologi

- HTML5
- CSS3
- JavaScript vanilla (tanpa framework dan tanpa npm)

## Cara Menjalankan

1. Buka folder proyek di VS Code.
2. Pasang extension **Live Server**.
3. Klik kanan `index.html` lalu pilih **Open with Live Server**.
4. Klik **Login WASHUP**, pilih jenis akun, lalu masuk dengan salah satu akun demo di bawah.

## Akun Demo

| Role | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `admin123` |
| Kasir | `kasir` | `kasir123` |
| Petugas | `petugas` | `petugas123` |
| Owner | `owner` | `owner123` |

Akun `admin` bawaan dilindungi (tidak bisa diedit atau dihapus). Akun bawaan lainnya dapat diedit atau dihapus, dan Admin dapat menambah akun lain lewat halaman **Akun Pengguna**.

## Struktur Folder

```text
PBL_Semester3/
├── index.html                  Halaman awal (publik)
├── login.html                  Login (pilih role, username, password)
├── role.html                   Halaman cadangan untuk role tanpa dashboard
├── 404.html                    Halaman "tidak ditemukan"
├── robots.txt, sitemap.xml     SEO dasar untuk washup-pbl-2026.netlify.app
├── assets/                     Logo dan favicon
├── css/
│   ├── tokens.css              Token desain: warna, font, jarak, radius, fokus (dimuat pertama)
│   ├── style.css               Gaya dasar lama yang masih dipakai
│   ├── base.css                Shell bersama semua role (sidebar, topbar, footer, tombol, tabel)
│   ├── sidebar-collapse.css    Sidebar yang bisa diciutkan
│   ├── compact.css             Ukuran ringkas untuk layar laptop (dimuat terakhir)
│   ├── landing.css, login.css  Halaman publik dan 404
│   └── admin.css, admin-master.css, kasir.css, owner.css, petugas.css   Isi halaman per role
├── js/
│   ├── components.js           Komponen sidebar, topbar, footer, dan popup Edit Profil semua role
│   └── app.js                  Logika halaman; bagian yang dijalankan ditentukan dari class <body>
├── pages/
│   ├── admin/    dashboard-admin, layanan-tarif, data-shift, verifikasi-absensi, akun-pengguna
│   ├── kasir/    dashboard-kasir, transaksi-baru, antrean, pembayaran, riwayat-transaksi, pengeluaran
│   ├── petugas/  dashboard-petugas, absensi-masuk, absensi-keluar, rekap-absensi
│   └── owner/    dashboard-owner, laporan-transaksi, laporan-keuangan, laporan-karyawan, statistik-layanan
└── sql/
    └── table.sql               Rancangan skema database
```

## Standar Desain

- Semua warna, font, dan jarak diambil dari `css/tokens.css`. Jangan menulis kode warna baru langsung di file CSS lain; tambahkan token bila perlu.
- Warna teks memakai `--wu-text`, `--wu-text-muted`, atau `--wu-accent-text` (sudah lolos kontras WCAG AA 4,5:1). `--wu-accent` dan `--wu-muted` hanya untuk garis, ikon, dan latar.
- Font maksimal dua: Open Sans (isi) dan Emblema One (logo).
- Tampilan diuji pada lebar 360 px, 768 px, dan 1280 px.

## Komponen

Sidebar, topbar, footer, dan popup Edit Profil untuk semua role dirender oleh `js/components.js`. Semua ikon (menu dan kartu ringkasan) berasal dari satu set ikon garis `WASHUP_ICONS` di file yang sama: di HTML cukup tulis `<div class="summary-icon-box" data-icon="car"></div>`, dan menu memakai `renderIcon("nama")`. Gunakan `data-icon="rupiah"` untuk ikon teks Rp. Untuk menambah menu, tambahkan item `{ page, href, label, icon }` pada role yang sesuai di `WASHUP_MENUS`. Setiap halaman yang memakai shell komponen memerlukan atribut body, contohnya:

```html
<body class="master-page" data-master="services" data-role="Admin" data-page="services" data-title="Layanan &amp; Tarif" data-footer="Layanan dan Tarif" data-logout-id="master-logout">
```

## Fitur per Role

- **Admin** — dashboard ringkasan; kelola Layanan & Tarif, Data Shift, Verifikasi Absensi, dan Akun Pengguna (tambah, edit, detail, hapus).
- **Kasir** — dashboard, transaksi baru (nomor transaksi dan antrean otomatis), antrean, pembayaran (Tunai/QRIS), riwayat transaksi, pengeluaran operasional.
- **Petugas** — dashboard antrean dengan pembaruan status (Menunggu → Sedang Dicuci → Selesai), absensi masuk/keluar dengan bukti foto, rekap absensi.
- **Owner** — dashboard, laporan transaksi, laporan keuangan (pendapatan dan pengeluaran), laporan karyawan, statistik layanan.

## Tarif Layanan Bawaan

Tarif berdasarkan ukuran kendaraan:

| Layanan | Harga |
| --- | --- |
| Cuci Mobil Kecil | Rp 30.000 |
| Cuci Mobil Sedang | Rp 35.000 |
| Cuci Mobil Besar | Rp 40.000 |
| Cuci Motor Kecil | Rp 12.000 |
| Cuci Motor Sedang | Rp 15.000 |
| Cuci Motor Besar | Rp 17.000 |

Admin dapat menambah layanan lain di halaman **Layanan & Tarif**.

## Penyimpanan Data (localStorage)

| Key | Isi |
| --- | --- |
| `washupTransactions` | Transaksi, status pengerjaan, dan status pembayaran |
| `washupServices` | Layanan & Tarif |
| `washupShifts` | Data Shift |
| `washupAttendanceRecords` | Data absensi lama yang digunakan pada laporan Owner |
| `washupPetugasAttendance` | Absen masuk/keluar Petugas beserta foto dan status verifikasi Admin |
| `washupUsers` | Akun Pengguna |
| `washupExpenses` | Pengeluaran operasional Kasir |

Role dan username yang sedang login disimpan di `sessionStorage` (`washupRole`, `washupUsername`). Untuk mengosongkan data, hapus key di atas lewat DevTools browser (tab Application → Local Storage).

## Alur Kerja Git Kelompok

- Kerjakan bagian masing-masing di branch sendiri, jangan langsung di `main`.
- Gabungkan ke `main` lewat Pull Request di GitHub agar anggota lain bisa memeriksa perubahan.
- Jangan menimpa `js/app.js` dengan salinan dari branch lain; gabungkan lewat merge agar pekerjaan anggota lain tidak hilang.
- Gunakan pesan commit yang jelas dengan awalan: `feat:` (fitur), `fix:` (perbaikan), `style:` (tampilan), `refactor:` (merapikan kode), `docs:` (dokumentasi).

## Pengujian

Belum ada pengujian otomatis. Sebelum commit, uji alur utama secara manual di Live Server:

1. **Kasir:** Transaksi Baru → nota → Pembayaran (Tunai) → status Lunas → muncul di Riwayat Transaksi.
2. **Petugas:** ubah status antrean → Absensi Masuk → Absensi Keluar → muncul di Rekap.
3. **Admin:** verifikasi absensi; tambah/edit akun → akun baru bisa login.
4. **Owner:** data transaksi, pengeluaran, dan absensi muncul di laporan.
5. Cek tampilan pada lebar 360 px, 768 px, dan 1280 px (DevTools → Toggle device toolbar).

## Deployment

Website statis, tanpa proses build dan tanpa environment variable.

- **Netlify (disarankan):** masuk ke app.netlify.com → *Add new site* → *Deploy manually* → seret folder proyek. Halaman `404.html` otomatis dipakai.
- **GitHub Pages:** pemilik repo membuka *Settings → Pages* → pilih branch `main` dan folder root.

Situs live: **https://washup-pbl-2026.netlify.app**. Jika alamat berubah, perbarui juga `robots.txt` dan `sitemap.xml`. File `_headers` berisi header keamanan (CSP, anti-clickjacking, HSTS) yang otomatis dipakai Netlify.

## Keamanan dan Data Pribadi

- Ini prototipe front-end. Akun demo dan password tersimpan di `localStorage` tanpa enkripsi, dan pemeriksaan hak akses hanya di browser. **Jangan memakai password asli.**
- Versi produksi wajib memakai backend: password di-hash, hak akses dicek di server, dan HTTPS.
- Data pelanggan (nama, plat nomor) dan foto absensi termasuk data pribadi (UU PDP). Versi produksi perlu kebijakan privasi dan pembatasan akses.

## Tim

Proyek PBL Semester 3, Politeknik Negeri Malang. Laporkan masalah lewat tab **Issues** di repository GitHub.

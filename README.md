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

Keempat akun bawaan dilindungi (tidak bisa diedit atau dihapus). Admin dapat menambah akun lain lewat halaman **Akun Pengguna**.

## Struktur Folder

```text
PBL_Semester3/
├── index.html                  Halaman awal
├── login.html                  Login (pilih role, username, password)
├── role.html                   Halaman sementara untuk role tanpa dashboard
├── assets/
│   └── logo-washup.png
├── css/
│   ├── style.css               Gaya dasar, dipakai semua halaman
│   ├── landing.css             Halaman awal
│   ├── login.css               Halaman login
│   ├── admin.css               Dashboard Admin
│   ├── admin-master.css        Halaman data Admin (pelanggan s.d. akun pengguna)
│   ├── kasir.css               Dashboard Kasir
│   └── petugas.css             Dashboard Petugas
├── js/
│   └── app.js                  Seluruh logika; bagian yang dijalankan ditentukan dari class <body>
├── pages/
│   ├── admin/
│   │   ├── dashboard-admin.html
│   │   ├── data-pelanggan.html
│   │   ├── data-kendaraan.html
│   │   ├── layanan-tarif.html
│   │   ├── data-karyawan.html
│   │   ├── data-shift.html
│   │   ├── absensi-lembur.html
│   │   └── akun-pengguna.html
│   ├── kasir/
│   │   ├── dashboard-kasir.html
│   │   ├── transaksi-baru.html
│   │   ├── antrean.html
│   │   ├── pembayaran.html
│   │   └── riwayat-transaksi.html
│   ├── petugas/
│   │   ├── dashboard-petugas.html
│   │   ├── antrean-petugas.html
│   │   └── absensi-petugas.html
│   └── owner/
│       ├── dashboard-owner.html
│       └── laporan-transaksi.html
└── sql/
    └── table.sql               Rancangan skema database
```

## Fitur per Role

- **Admin** — dashboard ringkasan; kelola Data Pelanggan, Data Kendaraan, Layanan & Tarif, Data Karyawan, Data Shift, Absensi & Lembur, dan Akun Pengguna (tambah, edit, detail, hapus).
- **Kasir** — dashboard, transaksi baru (nomor transaksi dan antrean otomatis), antrean, pembayaran (Tunai/QRIS), riwayat transaksi.
- **Petugas** — dashboard pengerjaan, antrean dengan pembaruan status (Menunggu → Sedang Dicuci → Selesai), absensi masuk/keluar dengan bukti foto.
- **Owner** — dashboard pendapatan dan laporan transaksi per periode.

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
| `washupCustomers` | Data Pelanggan |
| `washupVehicles` | Data Kendaraan |
| `washupServices` | Layanan & Tarif |
| `washupEmployees` | Data Karyawan |
| `washupShifts` | Data Shift |
| `washupAttendanceRecords` | Absensi & Lembur yang dicatat Admin |
| `washupPetugasAttendance` | Absen masuk/keluar Petugas beserta foto |
| `washupUsers` | Akun Pengguna |

Role dan username yang sedang login disimpan di `sessionStorage` (`washupRole`, `washupUsername`). Untuk mengosongkan data, hapus key di atas lewat DevTools browser (tab Application → Local Storage).

## Alur Kerja Git Kelompok

- Kerjakan bagian masing-masing di branch sendiri, jangan langsung di `main`.
- Gabungkan ke `main` lewat Pull Request di GitHub agar anggota lain bisa memeriksa perubahan.
- Jangan menimpa `js/app.js` dengan salinan dari branch lain; gabungkan lewat merge agar pekerjaan anggota lain tidak hilang.

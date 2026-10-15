# WASHUP

Sistem informasi sederhana untuk usaha car wash.

## Tahap 1 sampai 6: Persiapan Project, Login, Role, Dashboard, Transaksi, Antrean, dan Petugas

Tahap ini berisi halaman awal, login dummy, pembagian role, Dashboard Kasir, Transaksi Baru, halaman Antrean, serta area Petugas dengan penyimpanan lokal. Belum ada database backend, pembayaran, maupun fitur CRUD.

## Teknologi

- HTML5
- CSS3
- JavaScript vanilla

Project dibuat tanpa framework dan tanpa dependensi npm agar dapat dipelajari serta dijalankan langsung oleh mahasiswa pemula.

## Struktur Folder

```text
WASHUP/
├── index.html
├── login.html
├── role.html
├── dashboard-kasir.html
├── transaksi-baru.html
├── antrean.html
├── dashboard-petugas.html
├── antrean-petugas.html
├── absensi-petugas.html
├── css/
│   └── style.css
├── js/
│   └── app.js
└── README.md
```

## Cara Menjalankan

1. Buka folder project di VS Code.
2. Buka file `index.html` di browser.
3. Untuk pengalaman pengembangan yang lebih nyaman, gunakan extension Live Server di VS Code, lalu pilih **Open with Live Server** pada `index.html`.

## Akun Dummy

| Role | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `admin123` |
| Kasir | `kasir` | `kasir123` |
| Petugas | `petugas` | `petugas123` |
| Owner | `owner` | `owner123` |

## Status

Dashboard Kasir dan Transaksi Baru sudah tersedia. Data transaksi disimpan di `localStorage` browser dengan key `washupTransactions`, sehingga transaksi tetap ada saat berpindah halaman atau refresh.

Transaksi baru menghasilkan nomor transaksi, nomor antrean, harga otomatis berdasarkan jenis kendaraan/layanan, status `Menunggu`, dan status pembayaran `Belum Dibayar`. Dashboard menghitung tambahan transaksi lokal di atas data dasar dummy Tahap 3.

Halaman Antrean membaca key `washupTransactions` yang sama. Fitur yang tersedia: search nomor plat/nama pelanggan/nomor antrean, filter `serviceStatus`, detail transaksi, update status pengerjaan, dan perhitungan antrean aktif. Status pembayaran ditampilkan terpisah dan belum dapat diubah.

Area Petugas juga membaca `washupTransactions` yang sama. Petugas dapat melihat ringkasan dinamis, mencari/filter antrean, membuka Detail Pengerjaan, dan memperbarui `serviceStatus` tanpa mengubah `paymentStatus`. Absensi Petugas disimpan pada key `washupPetugasAttendance` dan mengikuti alur Absen Masuk lalu Absen Keluar.

Absensi Petugas memiliki bukti foto masuk dan foto keluar. Foto dipilih melalui kamera/upload, ditampilkan dalam preview, lalu dikonfirmasi sebelum disimpan sebagai Data URL di `localStorage`. Kedua foto disimpan pada property terpisah `checkInPhoto` dan `checkOutPhoto`.

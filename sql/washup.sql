-- WASHUP — skema MySQL/MariaDB (utf8mb4), berdasarkan PDM revisi.
-- Soft delete: setiap tabel punya `deleted_at`. Hapus di web = isi deleted_at, baris tetap ada di database.
-- INT(100) di MySQL hanya lebar tampilan; kapasitas tetap INT, jadi dipakai INT biasa.
CREATE DATABASE IF NOT EXISTS washup CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE washup;

CREATE TABLE karyawan (
  id_karyawan     INT AUTO_INCREMENT PRIMARY KEY,
  nama_karyawan   VARCHAR(100) NOT NULL,
  no_telepon      VARCHAR(20),
  alamat          VARCHAR(255),
  role            ENUM('Admin','Kasir','Petugas','Owner') NOT NULL,
  status_karyawan VARCHAR(100) NOT NULL DEFAULT 'Aktif',
  gaji_harian     INT NOT NULL DEFAULT 0,
  username        VARCHAR(100) NOT NULL,
  password        VARCHAR(255) NOT NULL,            -- hash password_hash(), bukan teks asli
  status_akun     ENUM('Aktif','Nonaktif') NOT NULL DEFAULT 'Aktif',
  deleted_at      DATETIME NULL,
  username_aktif  VARCHAR(100) AS (IF(deleted_at IS NULL, username, NULL)) STORED,
  UNIQUE KEY uq_username_aktif (username_aktif)     -- username bisa dipakai lagi setelah akun lama di-soft-delete
) ENGINE=InnoDB;

CREATE TABLE pelanggan (
  id_pelanggan   INT AUTO_INCREMENT PRIMARY KEY,
  nama_pelanggan VARCHAR(100) NOT NULL,
  no_telepon     VARCHAR(20),
  deleted_at     DATETIME NULL
) ENGINE=InnoDB;

-- Satu baris antrean = satu nomor antrean. Semua kendaraan/transaksi yang memakai id_antrean ini
-- membaca status yang sama. waktu_perubahan_terakhir ("lastupdated") berubah otomatis di setiap UPDATE.
CREATE TABLE antrean (
  id_antrean                INT AUTO_INCREMENT PRIMARY KEY,
  tanggal_antrean           DATE NOT NULL DEFAULT (CURRENT_DATE),
  nomor_antrean             INT NOT NULL,
  waktu_masuk               TIME NOT NULL DEFAULT (CURRENT_TIME),
  status_antrean            ENUM('Menunggu','Sedang Dicuci','Selesai') NOT NULL DEFAULT 'Menunggu',
  waktu_mulai               TIME NULL,
  waktu_selesai             TIME NULL,
  waktu_perubahan_terakhir  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at                DATETIME NULL,
  nomor_aktif               VARCHAR(20) AS (IF(deleted_at IS NULL, CONCAT(tanggal_antrean,'-',nomor_antrean), NULL)) STORED,
  UNIQUE KEY uq_nomor_per_hari (nomor_aktif)
) ENGINE=InnoDB;

CREATE TABLE kendaraan (
  id_kendaraan    INT AUTO_INCREMENT PRIMARY KEY,
  id_pelanggan    INT NOT NULL,
  id_antrean      INT NULL,
  nomor_plat      VARCHAR(20) NOT NULL,
  jenis_kendaraan VARCHAR(100) NOT NULL,
  merk_kendaraan  VARCHAR(100) NULL,
  tipe_kendaraan  VARCHAR(100) NULL,
  deleted_at      DATETIME NULL,
  FOREIGN KEY (id_pelanggan) REFERENCES pelanggan(id_pelanggan),
  FOREIGN KEY (id_antrean)   REFERENCES antrean(id_antrean),
  KEY idx_plat (nomor_plat)
) ENGINE=InnoDB;

CREATE TABLE layanan (
  id_layanan      INT AUTO_INCREMENT PRIMARY KEY,
  nama_layanan    VARCHAR(100) NOT NULL,
  jenis_kendaraan VARCHAR(100) NOT NULL,
  harga           INT NOT NULL,
  deskripsi       VARCHAR(255) NULL,
  status_layanan  ENUM('Aktif','Nonaktif') NOT NULL DEFAULT 'Aktif',
  deleted_at      DATETIME NULL
) ENGINE=InnoDB;

CREATE TABLE transaksi (
  id_transaksi       INT AUTO_INCREMENT PRIMARY KEY,
  no_transaksi       VARCHAR(30) NOT NULL,            -- contoh TRX-20261115-001
  id_kendaraan       INT NOT NULL,
  id_antrean         INT NOT NULL,
  id_karyawan        INT NOT NULL,                    -- kasir pembuat transaksi
  tanggal_transaksi  DATE NOT NULL,
  waktu_transaksi    TIME NOT NULL,
  total_harga        INT NOT NULL DEFAULT 0,
  diskon             INT NOT NULL DEFAULT 0,
  metode_pembayaran  ENUM('Tunai','QRIS') NULL,
  status_pembayaran  ENUM('Belum Dibayar','Lunas') NOT NULL DEFAULT 'Belum Dibayar',
  uang_diterima      INT NULL,
  kembalian          INT NULL,
  waktu_pembayaran   DATETIME NULL,
  deleted_at         DATETIME NULL,
  no_transaksi_aktif VARCHAR(30) AS (IF(deleted_at IS NULL, no_transaksi, NULL)) STORED,
  UNIQUE KEY uq_no_transaksi (no_transaksi_aktif),
  FOREIGN KEY (id_kendaraan) REFERENCES kendaraan(id_kendaraan),
  FOREIGN KEY (id_antrean)   REFERENCES antrean(id_antrean),
  FOREIGN KEY (id_karyawan)  REFERENCES karyawan(id_karyawan)
) ENGINE=InnoDB;

CREATE TABLE detail_transaksi (
  id_detail_transaksi INT AUTO_INCREMENT PRIMARY KEY,
  id_transaksi INT NOT NULL,
  id_layanan   INT NOT NULL,
  jumlah       INT NOT NULL DEFAULT 1,
  harga_satuan INT NOT NULL,
  subtotal     INT NOT NULL,
  deleted_at   DATETIME NULL,
  FOREIGN KEY (id_transaksi) REFERENCES transaksi(id_transaksi),
  FOREIGN KEY (id_layanan)   REFERENCES layanan(id_layanan)
) ENGINE=InnoDB;

CREATE TABLE antrean_karyawan (
  id_antrean  INT NOT NULL,
  id_karyawan INT NOT NULL,
  PRIMARY KEY (id_antrean, id_karyawan),
  FOREIGN KEY (id_antrean)  REFERENCES antrean(id_antrean),
  FOREIGN KEY (id_karyawan) REFERENCES karyawan(id_karyawan)
) ENGINE=InnoDB;

-- TAMBAHAN (tidak ada di PDM, tapi dipakai UI): master shift dan jadwal shift.
CREATE TABLE shift (
  id_shift     INT AUTO_INCREMENT PRIMARY KEY,
  nama_shift   VARCHAR(100) NOT NULL,
  jam_mulai    TIME NOT NULL,
  jam_selesai  TIME NOT NULL,
  status_shift ENUM('Aktif','Nonaktif') NOT NULL DEFAULT 'Aktif',
  deleted_at   DATETIME NULL
) ENGINE=InnoDB;

CREATE TABLE jadwal_shift (
  id_jadwal    INT AUTO_INCREMENT PRIMARY KEY,
  id_karyawan  INT NOT NULL,
  tanggal      DATE NOT NULL,
  id_shift     INT NULL,                    -- NULL = libur
  ditampilkan_ke_owner DATETIME NULL,       -- pengganti localStorage washupShiftSchedulePublished(At)
  deleted_at   DATETIME NULL,
  jadwal_aktif VARCHAR(30) AS (IF(deleted_at IS NULL, CONCAT(id_karyawan,'-',tanggal), NULL)) STORED,
  UNIQUE KEY uq_jadwal (jadwal_aktif),
  FOREIGN KEY (id_karyawan) REFERENCES karyawan(id_karyawan),
  FOREIGN KEY (id_shift)    REFERENCES shift(id_shift)
) ENGINE=InnoDB;

CREATE TABLE absensi (
  id_absensi        INT AUTO_INCREMENT PRIMARY KEY,
  id_karyawan       INT NOT NULL,
  id_shift          INT NULL,
  tanggal_absensi   DATE NOT NULL,
  jam_masuk         TIME NULL,
  jam_keluar        TIME NULL,
  status_absensi    VARCHAR(100) NOT NULL DEFAULT 'Hadir',
  keterangan        VARCHAR(255) NULL,
  foto_masuk        VARCHAR(255) NULL,      -- path file, bukan base64
  foto_keluar       VARCHAR(255) NULL,
  verifikasi_masuk  DATETIME NULL,          -- diisi Admin saat verifikasi
  verifikasi_keluar DATETIME NULL,
  deleted_at        DATETIME NULL,
  FOREIGN KEY (id_karyawan) REFERENCES karyawan(id_karyawan),
  FOREIGN KEY (id_shift)    REFERENCES shift(id_shift)
) ENGINE=InnoDB;

CREATE TABLE pengeluaran (
  id_pengeluaran      INT AUTO_INCREMENT PRIMARY KEY,
  id_karyawan         INT NOT NULL,
  tanggal_pengeluaran DATE NOT NULL,
  keterangan          VARCHAR(255) NOT NULL,
  jumlah              INT NOT NULL DEFAULT 1,       -- revisi PDM
  harga_satuan        INT NOT NULL,                 -- revisi PDM
  nominal_pengeluaran INT NOT NULL,                 -- = jumlah x harga_satuan
  bukti_nota          VARCHAR(255) NULL,            -- tambahan: foto nota
  deleted_at          DATETIME NULL,
  FOREIGN KEY (id_karyawan) REFERENCES karyawan(id_karyawan)
) ENGINE=InnoDB;

INSERT INTO shift (nama_shift, jam_mulai, jam_selesai) VALUES ('Shift Pagi','08:00','16:00'), ('Shift Malam','16:00','00:00');
INSERT INTO layanan (nama_layanan, jenis_kendaraan, harga) VALUES
 ('Cuci Mobil Kecil','Mobil',30000),('Cuci Mobil Sedang','Mobil',35000),('Cuci Mobil Besar','Mobil',40000),
 ('Cuci Motor Kecil','Motor',12000),('Cuci Motor Sedang','Motor',15000),('Cuci Motor Besar','Motor',17000);

CREATE TYPE role_karyawan      AS ENUM ('Admin','Kasir','Petugas','Owner');
CREATE TYPE status_aktif       AS ENUM ('Aktif','Nonaktif');
CREATE TYPE status_antrean_t   AS ENUM ('Menunggu','Sedang Dicuci','Selesai');
CREATE TYPE metode_bayar_t     AS ENUM ('Tunai','QRIS');
CREATE TYPE status_bayar_t     AS ENUM ('Belum Dibayar','Lunas');


CREATE OR REPLACE FUNCTION set_waktu_perubahan_terakhir() RETURNS trigger AS $$
BEGIN
  NEW.waktu_perubahan_terakhir := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TABLE karyawan (
  id_karyawan     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nama_karyawan   VARCHAR(100) NOT NULL,
  no_telepon      VARCHAR(20),
  alamat          VARCHAR(255),
  role            role_karyawan NOT NULL,
  status_karyawan VARCHAR(100) NOT NULL DEFAULT 'Aktif',
  gaji_harian     INT NOT NULL DEFAULT 0,
  username        VARCHAR(100) NOT NULL,
  password        VARCHAR(255) NOT NULL,           
  status_akun     status_aktif NOT NULL DEFAULT 'Aktif',
  deleted_at      TIMESTAMP NULL
);

CREATE UNIQUE INDEX uq_username_aktif ON karyawan (username) WHERE deleted_at IS NULL;

CREATE TABLE pelanggan (
  id_pelanggan   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nama_pelanggan VARCHAR(100) NOT NULL,
  no_telepon     VARCHAR(20),
  deleted_at     TIMESTAMP NULL
);


CREATE TABLE antrean (
  id_antrean                INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tanggal_antrean           DATE NOT NULL DEFAULT CURRENT_DATE,
  nomor_antrean             INT NOT NULL,
  waktu_masuk               TIME NOT NULL DEFAULT LOCALTIME(0),
  status_antrean            status_antrean_t NOT NULL DEFAULT 'Menunggu',
  waktu_mulai               TIME NULL,
  waktu_selesai             TIME NULL,
  waktu_perubahan_terakhir  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at                TIMESTAMP NULL
);
CREATE UNIQUE INDEX uq_nomor_per_hari ON antrean (tanggal_antrean, nomor_antrean) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_antrean_lastupdated
  BEFORE UPDATE ON antrean
  FOR EACH ROW EXECUTE FUNCTION set_waktu_perubahan_terakhir();

CREATE TABLE kendaraan (
  id_kendaraan    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_pelanggan    INT NOT NULL REFERENCES pelanggan(id_pelanggan),
  id_antrean      INT NULL REFERENCES antrean(id_antrean),
  nomor_plat      VARCHAR(20) NOT NULL,
  jenis_kendaraan VARCHAR(100) NOT NULL,
  merk_kendaraan  VARCHAR(100) NULL,
  tipe_kendaraan  VARCHAR(100) NULL,
  deleted_at      TIMESTAMP NULL
);
CREATE INDEX idx_plat ON kendaraan (nomor_plat);

CREATE TABLE layanan (
  id_layanan      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nama_layanan    VARCHAR(100) NOT NULL,
  jenis_kendaraan VARCHAR(100) NOT NULL,
  harga           INT NOT NULL,
  deskripsi       VARCHAR(255) NULL,
  status_layanan  status_aktif NOT NULL DEFAULT 'Aktif',
  deleted_at      TIMESTAMP NULL
);

CREATE TABLE transaksi (
  id_transaksi       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  no_transaksi       VARCHAR(30) NOT NULL,            
  id_kendaraan       INT NOT NULL REFERENCES kendaraan(id_kendaraan),
  id_antrean         INT NOT NULL REFERENCES antrean(id_antrean),
  id_karyawan        INT NOT NULL REFERENCES karyawan(id_karyawan),  
  tanggal_transaksi  DATE NOT NULL,
  waktu_transaksi    TIME NOT NULL,
  total_harga        INT NOT NULL DEFAULT 0,
  diskon             INT NOT NULL DEFAULT 0,
  metode_pembayaran  metode_bayar_t NULL,
  status_pembayaran  status_bayar_t NOT NULL DEFAULT 'Belum Dibayar',
  uang_diterima      INT NULL,
  kembalian          INT NULL,
  waktu_pembayaran   TIMESTAMP NULL,
  deleted_at         TIMESTAMP NULL
);
CREATE UNIQUE INDEX uq_no_transaksi ON transaksi (no_transaksi) WHERE deleted_at IS NULL;

CREATE TABLE detail_transaksi (
  id_detail_transaksi INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_transaksi INT NOT NULL REFERENCES transaksi(id_transaksi),
  id_layanan   INT NOT NULL REFERENCES layanan(id_layanan),
  jumlah       INT NOT NULL DEFAULT 1,
  harga_satuan INT NOT NULL,
  subtotal     INT NOT NULL,
  deleted_at   TIMESTAMP NULL
);

CREATE TABLE antrean_karyawan (
  id_antrean  INT NOT NULL REFERENCES antrean(id_antrean),
  id_karyawan INT NOT NULL REFERENCES karyawan(id_karyawan),
  PRIMARY KEY (id_antrean, id_karyawan)
);


CREATE TABLE shift (
  id_shift     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nama_shift   VARCHAR(100) NOT NULL,
  jam_mulai    TIME NOT NULL,
  jam_selesai  TIME NOT NULL,
  status_shift status_aktif NOT NULL DEFAULT 'Aktif',
  deleted_at   TIMESTAMP NULL
);

CREATE TABLE jadwal_shift (
  id_jadwal            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_karyawan          INT NOT NULL REFERENCES karyawan(id_karyawan),
  tanggal              DATE NOT NULL,
  id_shift             INT NULL REFERENCES shift(id_shift),   
  ditampilkan_ke_owner TIMESTAMP NULL,                        
  deleted_at           TIMESTAMP NULL
);
CREATE UNIQUE INDEX uq_jadwal ON jadwal_shift (id_karyawan, tanggal) WHERE deleted_at IS NULL;

CREATE TABLE absensi (
  id_absensi        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_karyawan       INT NOT NULL REFERENCES karyawan(id_karyawan),
  id_shift          INT NULL REFERENCES shift(id_shift),
  tanggal_absensi   DATE NOT NULL,
  jam_masuk         TIME NULL,
  jam_keluar        TIME NULL,
  status_absensi    VARCHAR(100) NOT NULL DEFAULT 'Hadir',
  keterangan        VARCHAR(255) NULL,
  foto_masuk        VARCHAR(255) NULL,      
  foto_keluar       VARCHAR(255) NULL,
  verifikasi_masuk  TIMESTAMP NULL,       
  verifikasi_keluar TIMESTAMP NULL,
  deleted_at        TIMESTAMP NULL
);

CREATE TABLE pengeluaran (
  id_pengeluaran      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_karyawan         INT NOT NULL REFERENCES karyawan(id_karyawan),
  tanggal_pengeluaran DATE NOT NULL,
  keterangan          VARCHAR(255) NOT NULL,
  jumlah              INT NOT NULL DEFAULT 1,       
  harga_satuan        INT NOT NULL,                
  nominal_pengeluaran INT NOT NULL,                
  bukti_nota          VARCHAR(255) NULL,            
  deleted_at          TIMESTAMP NULL
);


CREATE INDEX idx_kendaraan_pelanggan  ON kendaraan (id_pelanggan);
CREATE INDEX idx_kendaraan_antrean    ON kendaraan (id_antrean);
CREATE INDEX idx_transaksi_kendaraan  ON transaksi (id_kendaraan);
CREATE INDEX idx_transaksi_antrean    ON transaksi (id_antrean);
CREATE INDEX idx_transaksi_karyawan   ON transaksi (id_karyawan);
CREATE INDEX idx_detail_transaksi     ON detail_transaksi (id_transaksi);
CREATE INDEX idx_detail_layanan       ON detail_transaksi (id_layanan);
CREATE INDEX idx_antrean_karyawan_k   ON antrean_karyawan (id_karyawan);
CREATE INDEX idx_jadwal_shift         ON jadwal_shift (id_shift);
CREATE INDEX idx_absensi_karyawan     ON absensi (id_karyawan, tanggal_absensi);
CREATE INDEX idx_absensi_shift        ON absensi (id_shift);
CREATE INDEX idx_pengeluaran_karyawan ON pengeluaran (id_karyawan);


INSERT INTO shift (nama_shift, jam_mulai, jam_selesai) VALUES
 ('Shift Pagi','08:00','16:00'),
 ('Shift Malam','16:00','00:00');

INSERT INTO layanan (nama_layanan, jenis_kendaraan, harga) VALUES
 ('Cuci Mobil Kecil','Mobil',30000),('Cuci Mobil Sedang','Mobil',35000),('Cuci Mobil Besar','Mobil',40000),
 ('Cuci Motor Kecil','Motor',12000),('Cuci Motor Sedang','Motor',15000),('Cuci Motor Besar','Motor',17000);
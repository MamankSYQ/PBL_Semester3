CREATE TABLE pelanggan (
    id_pelanggan    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nama_pelanggan  VARCHAR(100) NOT NULL,
    no_telepon      VARCHAR(20)
);
 
CREATE TABLE kendaraan (
    id_kendaraan    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_pelanggan    INT NOT NULL,
    nomor_plat      VARCHAR(20) NOT NULL,
    jenis_kendaraan VARCHAR(100) NOT NULL,
    merk_kendaraan  VARCHAR(100) NOT NULL,
    tipe_kendaraan  VARCHAR(100) NOT NULL,
    CONSTRAINT fk_kendaraan_pelanggan FOREIGN KEY (id_pelanggan)
        REFERENCES pelanggan (id_pelanggan),
	CONSTRAINT fk_kendaraan_antrean FOREIGN KEY (id_antrean)
        REFERENCES antrean (id_antrean),
	CONSTRAINT cek_jenis_kendaraan CHECK (jenis_kendaraam IN ('mobil', 'motor'))
);
 
CREATE TABLE karyawan (
    id_karyawan      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nama_karyawan    VARCHAR(100) NOT NULL,
    no_telepon       VARCHAR(20),
    alamat           VARCHAR(255),
    jabatan          VARCHAR(100) NOT NULL,
    status_karyawan  VARCHAR(100) NOT NULL,
    gaji_harian      INT NOT NULL,
	CONSTRAINT cek_status_karyawan CHECK (status_karyawan IN ('aktif', 'tidak aktif')),
	CONSTRAINT cek_jabatan CHECK (jabatan IN ('petugas', 'kasir', 'admin'))
);
 
CREATE TABLE akun_pengguna (
    id_akun       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_karyawan   INT NOT NULL,
    username      VARCHAR(50) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,
    role          VARCHAR(100) NOT NULL,
    status_akun   VARCHAR(100) NOT NULL,
    CONSTRAINT fk_akun_karyawan FOREIGN KEY (id_karyawan)
        REFERENCES karyawan (id_karyawan),
	CONSTRAINT cek_status_akun CHECK (status_akun IN ('aktif', 'tidak aktif')),
	CONSTRAINT cek_role CHECK (role IN ('petugas', 'kasir', 'admin', 'owner'))
);
 
CREATE TABLE layanan (
    id_layanan      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nama_layanan    VARCHAR(100) NOT NULL,
    jenis_kendaraan VARCHAR(100) NOT NULL,
    harga           INT NOT NULL,
    deskripsi       VARCHAR(255),
    status_layanan  VARCHAR(100) NOT NULL,
	CONSTRAINT cek_status_layanan CHECK (status_layanan IN ('belum dicuci', 'sedang dicuci', 'sudah dicuci'))
);
	
 
CREATE TABLE transaksi (
    id_transaksi       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_akun            INT NOT NULL,
    id_kendaraan       INT NOT NULL,
    tanggal_transaksi  DATE NOT NULL,
    waktu_transaksi    TIME NOT NULL,
    total_harga        INT NOT NULL,
    metode_pembayaran  VARCHAR(100) NOT NULL,
    status_pembayaran  VARCHAR(100) NOT NULL,
    CONSTRAINT fk_transaksi_akun FOREIGN KEY (id_akun)
        REFERENCES akun_pengguna (id_akun),
    CONSTRAINT fk_transaksi_kendaraan FOREIGN KEY (id_kendaraan)
        REFERENCES kendaraan (id_kendaraan),
	CONSTRAINT fk_transaksi_antrean FOREIGN KEY (id_antrean)
        REFERENCES antrean (id_antrean),
	CONSTRAINT cek_metode_pembayaran CHECK (metode_pembayaran IN ('qris', 'tunai')),
	CONSTRAINT cek_status_pembayaran CHECK (status_pembayaran IN ('sudah bayar', 'belum bayar'))
);
 
CREATE TABLE detail_transaksi (
    id_detail_transaksi INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_transaksi        INT NOT NULL,
    id_layanan          INT NOT NULL,
    jumlah              INT NOT NULL,
    harga_satuan        INT NOT NULL,
    subtotal            INT NOT NULL,
    CONSTRAINT fk_detail_transaksi FOREIGN KEY (id_transaksi)
        REFERENCES transaksi (id_transaksi),
    CONSTRAINT fk_detail_layanan FOREIGN KEY (id_layanan)
        REFERENCES layanan (id_layanan)
);
 
CREATE TABLE antrean (
    id_antrean      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nomor_antrean   INT NOT NULL,
    waktu_masuk     TIME NOT NULL,
    status_antrean  VARCHAR(100) NOT NULL, 
    waktu_mulai     TIME,
    waktu_selesai   TIME,
	CONSTRAINT cek_status_antrean CHECK (status_antrean IN ('belum dicuci', 'sedang dicuci', 'sudah dicuci'))
);

CREATE TABLE riwayat_status_antrean (
	id_riwayat 					INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	status_lama 				VARCHAR(100),
	status_baru					VARCHAR(100) NOT NULL,
	waktu_perubahan_antrean		TIME NOT NULL,
	id_antrean					INT NOT NULL,
	CONSTRAINT fk_riwayatAntrean_antrean FOREIGN KEY (id_antrean)
        REFERENCES antrean (id_antrean),
	CONSTRAINT cek_status_lama CHECK (status_lama IN ('belum dicuci', 'sedang dicuci', 'sudah dicuci')),
	CONSTRAINT cek_status_baru CHECK (status_baru IN ('belum dicuci', 'sedang dicuci', 'sudah dicuci'))
); 
 
CREATE TABLE pengeluaran (
    id_pengeluaran       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_akun              INT NOT NULL,
    tanggal_pengeluaran  DATE NOT NULL,
    jenis_pengeluaran    VARCHAR(100) NOT NULL,
    keterangan           VARCHAR(255),
    nominal_pengeluaran  INT NOT NULL,
    CONSTRAINT fk_pengeluaran_akun FOREIGN KEY (id_akun)
        REFERENCES akun_pengguna (id_akun)
);
 
CREATE TABLE shift (
    id_shift     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nama_shift   VARCHAR(100) NOT NULL,
    jam_masuk    TIME NOT NULL,
    jam_selesai  TIME NOT NULL,
	CONSTRAINT cek_nama_shift CHECK (nama_shift IN ('pagi', 'malam'))
);
 
CREATE TABLE absensi (
    id_absensi       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_karyawan      INT NOT NULL,
    id_shift         INT NOT NULL,
    tanggal_absensi  DATE NOT NULL,
    jam_masuk        TIME,
    status_absensi   VARCHAR(100) NOT NULL,
    keterangan       VARCHAR(255),
    jam_keluar       TIME,
    CONSTRAINT fk_absensi_karyawan FOREIGN KEY (id_karyawan)
        REFERENCES karyawan (id_karyawan),
    CONSTRAINT fk_absensi_shift FOREIGN KEY (id_shift)
        REFERENCES shift (id_shift),
	CONSTRAINT cek_status_absensi CHECK (status_absensi IN ('sudah absen', 'belum absen'))
);
 
CREATE TABLE lembur (
    id_lembur        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_karyawan      INT NOT NULL,
    id_absensi       INT NOT NULL,
    tanggal_lembur   DATE NOT NULL,
    jam_mulai        TIME NOT NULL,
    jam_selesai      TIME NOT NULL,
    durasi_lembur    INT NOT NULL,
    insentif_lembur  INT NOT NULL,
    keterangan       VARCHAR(255),
    CONSTRAINT fk_lembur_karyawan FOREIGN KEY (id_karyawan)
        REFERENCES karyawan (id_karyawan),
    CONSTRAINT fk_lembur_absensi FOREIGN KEY (id_absensi)
        REFERENCES absensi (id_absensi)
);
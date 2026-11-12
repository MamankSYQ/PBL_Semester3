CREATE TABLE pelanggan (
    id_pelanggan    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nama_pelanggan  VARCHAR(100) NOT NULL,
    no_telepon      VARCHAR(20)
);

CREATE TABLE antrean (
    id_antrean                 INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nomor_antrean              INTEGER NOT NULL,
    waktu_masuk                TIME NOT NULL,
    status_antrean             VARCHAR(100) NOT NULL,
    waktu_mulai                TIME NOT NULL,
    waktu_selesai              TIME NOT NULL,
    waktu_perubahan_terakhir   TIMESTAMP
);

CREATE TABLE kendaraan (
    id_kendaraan     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_pelanggan     INTEGER NOT NULL,
    nomor_plat       VARCHAR(20) NOT NULL,
    jenis_kendaraan  VARCHAR(100) NOT NULL,
    merk_kendaraan   VARCHAR(100) NOT NULL,
    tipe_kendaraan   VARCHAR(100) NOT NULL,
    id_antrean       INTEGER,
    CONSTRAINT fk_kendaraan_pelanggan
        FOREIGN KEY (id_pelanggan) REFERENCES pelanggan (id_pelanggan)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_kendaraan_antrean
        FOREIGN KEY (id_antrean) REFERENCES antrean (id_antrean)
        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE karyawan (
    id_karyawan      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nama_karyawan    VARCHAR(100) NOT NULL,
    no_telepon       VARCHAR(20) NOT NULL,
    alamat           VARCHAR(255),
    role             VARCHAR(100) NOT NULL,
    status_karyawan  VARCHAR(100) NOT NULL,
    gaji_harian      BIGINT NOT NULL,
    username         VARCHAR(100) NOT NULL UNIQUE,
    password         VARCHAR(255) NOT NULL,
    status_akun      VARCHAR(100) NOT NULL
);

CREATE TABLE layanan (
    id_layanan       INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nama_layanan     VARCHAR(100) NOT NULL,
    jenis_kendaraan  VARCHAR(100) NOT NULL,
    harga            BIGINT NOT NULL,
    deskripsi        VARCHAR(255),
    status_layanan   VARCHAR(100) NOT NULL
);

CREATE TABLE transaksi (
    id_transaksi       INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_akun            INTEGER NOT NULL,
    id_kendaraan       INTEGER NOT NULL,
    tanggal_transaksi  DATE NOT NULL,
    waktu_transaksi    TIME NOT NULL,
    total_harga        BIGINT NOT NULL,
    metode_pembayaran  VARCHAR(100) NOT NULL,
    status_pembayaran  VARCHAR(100) NOT NULL,
    id_antrean         INTEGER NOT NULL,
    id_karyawan        INTEGER NOT NULL,
    CONSTRAINT fk_transaksi_kendaraan
        FOREIGN KEY (id_kendaraan) REFERENCES kendaraan (id_kendaraan)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_transaksi_antrean
        FOREIGN KEY (id_antrean) REFERENCES antrean (id_antrean)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_transaksi_karyawan
        FOREIGN KEY (id_karyawan) REFERENCES karyawan (id_karyawan)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE detail_transaksi (
    id_detail_transaksi  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_transaksi         INTEGER NOT NULL,
    id_layanan           INTEGER NOT NULL,
    jumlah               INTEGER NOT NULL,
    harga_satuan         BIGINT NOT NULL,
    subtotal             INTEGER NOT NULL,
    CONSTRAINT fk_detail_transaksi
        FOREIGN KEY (id_transaksi) REFERENCES transaksi (id_transaksi)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_detail_layanan
        FOREIGN KEY (id_layanan) REFERENCES layanan (id_layanan)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE antrean_karyawan (
    id_antrean   INTEGER NOT NULL,
    id_karyawan  INTEGER NOT NULL,
    PRIMARY KEY (id_antrean, id_karyawan),
    CONSTRAINT fk_ak_antrean
        FOREIGN KEY (id_antrean) REFERENCES antrean (id_antrean)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_ak_karyawan
        FOREIGN KEY (id_karyawan) REFERENCES karyawan (id_karyawan)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE absensi (
    id_absensi       INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_karyawan      INTEGER NOT NULL,
    id_shift         INTEGER NOT NULL,
    tanggal_absensi  DATE NOT NULL,
    jam_masuk        TIME NOT NULL,
    status_absensi   VARCHAR(100) NOT NULL,
    keterangan       VARCHAR(255),
    jam_keluar       TIME NOT NULL,
    shift            VARCHAR(100) NOT NULL,
    CONSTRAINT fk_absensi_karyawan
        FOREIGN KEY (id_karyawan) REFERENCES karyawan (id_karyawan)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE pengeluaran (
    id_pengeluaran       INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_karyawan          INTEGER NOT NULL,
    id_akun              INTEGER NOT NULL,
    tanggal_pengeluaran  DATE NOT NULL,
    jenis_pengeluaran    VARCHAR(100) NOT NULL,
    keterangan           VARCHAR(255),
    nominal_pengeluaran  BIGINT NOT NULL,
    CONSTRAINT fk_pengeluaran_karyawan
        FOREIGN KEY (id_karyawan) REFERENCES karyawan (id_karyawan)
        ON UPDATE CASCADE ON DELETE RESTRICT
);
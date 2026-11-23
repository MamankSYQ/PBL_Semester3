<?php
// Jalankan sekali dari terminal: php sql/seed.php
// Membuat akun awal yang belum ada. Akun yang sudah ada tidak direset password-nya.
// Hapus file ini dari server setelah proses seed selesai.

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("Seed hanya boleh dijalankan melalui CLI.\n");
}

require_once __DIR__ . '/../includes/db.php';

$akun = [
    ['Admin WASHUP', 'admin', 'admin123', 'Admin', true],
    ['Kasir', 'kasir', 'kasir123', 'Kasir', false],
    ['Petugas', 'petugas', 'petugas123', 'Petugas', false],
    ['Owner', 'owner', 'owner123', 'Owner', false],
];

$db = db();
$db->beginTransaction();

try {
    // Partial unique index uq_username_aktif menjadi target konflik username aktif.
    // DO NOTHING menjaga akun dan password yang sudah ada agar tidak tertimpa.
    $st = $db->prepare(
        'INSERT INTO karyawan
            (nama_karyawan, username, password, role, is_system_account)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (username) WHERE deleted_at IS NULL DO NOTHING
         RETURNING id_karyawan'
    );

    $created = 0;
    $skipped = 0;

    foreach ($akun as [$nama, $username, $password, $role, $isSystemAccount]) {
        $st->bindValue(1, $nama, PDO::PARAM_STR);
        $st->bindValue(2, $username, PDO::PARAM_STR);
        $st->bindValue(3, password_hash($password, PASSWORD_DEFAULT), PDO::PARAM_STR);
        $st->bindValue(4, $role, PDO::PARAM_STR);
        $st->bindValue(5, $isSystemAccount, PDO::PARAM_BOOL);
        $st->execute();

        if ($st->fetchColumn() !== false) {
            $created++;
        } else {
            $skipped++;
        }
    }

    // Pastikan akun Admin utama yang sudah ada juga ditandai sebagai akun sistem,
    // tanpa mengubah password, nama, status, atau data akun lainnya.
    $db->prepare(
        "UPDATE karyawan
         SET is_system_account = TRUE
         WHERE username = 'admin'
           AND role = 'Admin'
           AND deleted_at IS NULL"
    )->execute();

    $db->commit();

    echo "Seed selesai. Akun baru dibuat: {$created}. Akun yang sudah ada dan dilewati: {$skipped}.\n";
    echo "Admin utama ditandai sebagai akun sistem jika username admin dengan role Admin tersedia.\n";
    echo "Segera ganti password awal setelah login pertama.\n";
} catch (Throwable $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }

    fwrite(STDERR, "Seed gagal: {$e->getMessage()}\n");
    exit(1);
}

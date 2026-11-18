<?php
/**
 * Membuat satu akun Admin utama WASHUP.
 * Jalankan hanya dari terminal/CLI setelah schema PostgreSQL diterapkan:
 *   PowerShell: $env:WASHUP_ADMIN_PASSWORD = "Password-kuat-di-sini"; php sql/seed.php
 *   Bash:       WASHUP_ADMIN_PASSWORD='Password-kuat-di-sini' php sql/seed.php
 * Jangan simpan password ke file atau repository.
 */
require __DIR__ . '/../includes/db.php';

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("Akses ditolak. Script seed hanya boleh dijalankan dari CLI.\n");
}

$password = getenv('WASHUP_ADMIN_PASSWORD');
if (!is_string($password) || strlen($password) < 12 || trim($password) === '') {
    fwrite(STDERR, "WASHUP_ADMIN_PASSWORD wajib diatur dan minimal 12 karakter.\n");
    exit(1);
}

$db = db();
$db->beginTransaction();
try {
    // Mengunci tabel selama pemeriksaan agar dua proses seed tidak membuat akun bersamaan.
    $db->query('LOCK TABLE karyawan IN SHARE ROW EXCLUSIVE MODE');

    $systemAccount = $db->query(
        'SELECT id_karyawan FROM karyawan WHERE is_system_account = TRUE LIMIT 1'
    )->fetchColumn();
    if ($systemAccount !== false) {
        $db->rollBack();
        fwrite(STDOUT, "Akun Admin utama sudah tersedia. Tidak ada perubahan.\n");
        exit(0);
    }

    $existingAdmin = $db->prepare(
        "SELECT id_karyawan FROM karyawan WHERE username = 'admin' AND deleted_at IS NULL LIMIT 1"
    );
    $existingAdmin->execute();
    if ($existingAdmin->fetchColumn() !== false) {
        throw new RuntimeException(
            "Username 'admin' sudah digunakan akun lain. Periksa data akun sebelum menjalankan seed."
        );
    }

    $stmt = $db->prepare(
        "INSERT INTO karyawan (nama_karyawan, username, password, role, status_akun, is_system_account)
         VALUES (?, 'admin', ?, 'Admin', 'Aktif', TRUE)"
    );
    $stmt->execute(['Administrator WASHUP', password_hash($password, PASSWORD_DEFAULT)]);
    $db->commit();

    fwrite(STDOUT, "Akun Admin utama berhasil dibuat. Username: admin\n");
} catch (Throwable $e) {
    if ($db->inTransaction()) $db->rollBack();
    error_log('[washup seed] ' . $e);
    fwrite(STDERR, "Seed gagal: " . $e->getMessage() . "\n");
    exit(1);
}

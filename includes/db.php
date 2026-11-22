<?php
function cfg(): array {
    static $config = null;
    if ($config !== null) return $config;

    $config = require __DIR__ . '/../config/config.php';
    $localFile = __DIR__ . '/../config/config.local.php';
    if (is_file($localFile)) {
        $local = require $localFile;
        if (!is_array($local)) {
            throw new RuntimeException('config/config.local.php harus mengembalikan array konfigurasi.');
        }
        $config = array_merge($config, $local);
    }

    $config['timezone'] = $config['timezone'] ?? 'Asia/Jakarta';
    try {
        date_default_timezone_set($config['timezone']);
    } catch (Throwable $e) {
        throw new RuntimeException('Timezone pada konfigurasi WASHUP tidak valid.', 0, $e);
    }

    return $config;
}

function db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;

    $config = cfg();
    foreach (['db_host', 'db_name', 'db_user', 'db_pass'] as $key) {
        if (!array_key_exists($key, $config) || ($key !== 'db_pass' && trim((string)$config[$key]) === '')) {
            throw new RuntimeException("Konfigurasi database '$key' belum diisi.");
        }
    }

    if (!extension_loaded('pdo_pgsql')) {
        throw new RuntimeException('Ekstensi PHP PDO_PGSQL belum aktif. Aktifkan pdo_pgsql pada PHP.');
    }

    $port = (int)($config['db_port'] ?? 5432);
    if ($port < 1 || $port > 65535) {
        throw new RuntimeException('Port PostgreSQL tidak valid.');
    }

    $dsn = sprintf(
        'pgsql:host=%s;port=%d;dbname=%s',
        $config['db_host'],
        $port,
        $config['db_name']
    );
    $sslMode = $config['db_sslmode'] ?? null;
    if (is_string($sslMode) && $sslMode !== '') {
        $allowedModes = ['disable', 'allow', 'prefer', 'require', 'verify-ca', 'verify-full'];
        if (!in_array($sslMode, $allowedModes, true)) {
            throw new RuntimeException('Nilai db_sslmode tidak dikenali.');
        }
        $dsn .= ';sslmode=' . $sslMode;
    }

    try {
        $pdo = new PDO($dsn, (string)$config['db_user'], (string)$config['db_pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        $timezone = (string)$config['timezone'];
        $stmt = $pdo->prepare("SELECT set_config('TimeZone', ?, false)");
        $stmt->execute([$timezone]);
    } catch (PDOException $e) {
        error_log('[washup database] ' . $e->getMessage());
        throw new RuntimeException('Tidak dapat terhubung ke database PostgreSQL. Periksa konfigurasi koneksi.', 0, $e);
    }

    return $pdo;
}

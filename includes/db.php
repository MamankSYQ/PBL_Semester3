<?php

function cfg(): array {
    static $c;
    if ($c !== null) {
        return $c;
    }
    $c = require __DIR__ . '/../config/config.php';
    $local = __DIR__ . '/../config/config.local.php';

    if (is_file($local)) {
        $c = array_merge($c, require $local);
    }
    date_default_timezone_set($c['timezone']);
    return $c;
}

function db(): PDO {
    static $pdo;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $c = cfg();
    $dsn = sprintf(
        'pgsql:host=%s;port=%s;dbname=%s;sslmode=%s',
        $c['db_host'],
        $c['db_port'],
        $c['db_name'],
        $c['db_sslmode'] ?? 'prefer'
    );
    $pdo = new PDO(
        $dsn,
        $c['db_user'],
        $c['db_pass'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
    $pdo->exec(
        'SET TIME ZONE ' . $pdo->quote($c['timezone'])
    );
    return $pdo;
}

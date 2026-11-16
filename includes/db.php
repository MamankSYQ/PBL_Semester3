<?php
function cfg(): array {
  static $c; if ($c) return $c;
  $c = require __DIR__ . '/../config/config.php';
  $local = __DIR__ . '/../config/config.local.php';
  if (is_file($local)) $c = array_merge($c, require $local);
  date_default_timezone_set($c['timezone']);
  return $c;
}

function db(): PDO {
  static $pdo; if ($pdo) return $pdo;
  $c = cfg();
  $port = $c['db_port'] ?? '5432';
  $pdo = new PDO(
    "pgsql:host={$c['db_host']};port={$port};dbname={$c['db_name']}",
    $c['db_user'],
    $c['db_pass'],
    [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      PDO::ATTR_EMULATE_PREPARES => false,
    ]
  );
  $pdo->exec("SET TIME ZONE '" . $c['timezone'] . "'");
  return $pdo;
}
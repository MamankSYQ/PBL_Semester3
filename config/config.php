<?php

function env_value(string $key, string $default = ''): string {
    $value = getenv($key);
    return ($value === false || $value === '') ? $default : $value;
}

return [
    'db_host' => env_value('DB_HOST', '127.0.0.1'),
    'db_port' => env_value('DB_PORT', '5432'),
    'db_name' => env_value('DB_NAME', 'washup'),
    'db_user' => env_value('DB_USER', 'postgres'),
    'db_pass' => env_value('DB_PASSWORD', ''),
    'db_sslmode' => env_value('DB_SSLMODE', 'prefer'),
    'timezone' => 'Asia/Jakarta',
];

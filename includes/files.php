<?php

require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/db.php';
require_once dirname(__DIR__) . '/vendor/autoload.php';

use Aws\S3\S3Client;
use Aws\Exception\AwsException;

/**
 * Konfigurasi Neon Object Storage.
 */

function storage_client(): S3Client {
    static $client = null;

    if ($client instanceof S3Client) {
        return $client;
    }

    // Lokal: baca config.local.php melalui cfg().
    // Render: gunakan Environment Variables karena config.local.php tidak di-deploy.
    $config = cfg();

    $endpoint = $config['AWS_ENDPOINT_URL_S3'] ?? (getenv('AWS_ENDPOINT_URL_S3') ?: '');
    $region = $config['AWS_REGION'] ?? (getenv('AWS_REGION') ?: '');
    $accessKey = $config['AWS_ACCESS_KEY_ID'] ?? (getenv('AWS_ACCESS_KEY_ID') ?: '');
    $secretKey = $config['AWS_SECRET_ACCESS_KEY'] ?? (getenv('AWS_SECRET_ACCESS_KEY') ?: '');

    // Nilai kosong dari config lokal juga boleh fallback ke environment.
    $endpoint = $endpoint ?: (getenv('AWS_ENDPOINT_URL_S3') ?: '');
    $region = $region ?: (getenv('AWS_REGION') ?: '');
    $accessKey = $accessKey ?: (getenv('AWS_ACCESS_KEY_ID') ?: '');
    $secretKey = $secretKey ?: (getenv('AWS_SECRET_ACCESS_KEY') ?: '');

    if (!$endpoint || !$region || !$accessKey || !$secretKey) {
        throw new RuntimeException('Konfigurasi Neon Storage belum lengkap.');
    }

    $client = new S3Client([
        'version' => 'latest',
        'region' => $region,
        'endpoint' => $endpoint,
        'credentials' => [
            'key' => $accessKey,
            'secret' => $secretKey,
        ],
        'use_path_style_endpoint' => true,
    ]);

    return $client;
}


/**
 * Nama bucket Neon Storage.
 */
function storage_bucket(): string {
    $config = cfg();
    $bucket = $config['NEON_STORAGE_BUCKET'] ?? '';
    if ($bucket === '') {
        $bucket = getenv('NEON_STORAGE_BUCKET') ?: 'uploads';
    }
    return $bucket;
}

/**
 * Upload foto ke Neon Storage.
 * Mengembalikan object key untuk disimpan di PostgreSQL.
 */
function save_upload(
    string $dataUrl,
    string $dir,
    bool $allowPdf = false
): string {

    if (!preg_match(
        '#^data:([\w.+-]+/[\w.+-]+);base64,(.+)$#s',
        $dataUrl,
        $m
    )) {
        throw new UserError('Format file tidak valid.');
    }

    $bin = base64_decode($m[2], true);

    if ($bin === false || strlen($bin) > 1500000) {
        throw new UserError('Ukuran file maksimal 1,5 MB atau file rusak.');
    }

    $mime = (new finfo(FILEINFO_MIME_TYPE))->buffer($bin);

    $allowed = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    if ($allowPdf) {
        $allowed['application/pdf'] = 'pdf';
    }

    if (!isset($allowed[$mime])) {
        throw new UserError('Jenis file tidak diizinkan.');
    }

    $dir = preg_replace('/[^a-zA-Z0-9_-]/', '', $dir);

    if ($dir === '') {
        throw new UserError('Folder penyimpanan tidak valid.');
    }

    $key = $dir . '/' .
    date('Ym') . '/' .
    bin2hex(random_bytes(16)) . '.' .
    $allowed[$mime];

    try {
        storage_client()->putObject([
            'Bucket' => storage_bucket(),
            'Key' => $key,
            'Body' => $bin,
            'ContentType' => $mime,
        ]);
    } catch (AwsException $e) {
        error_log('[Neon Storage upload] ' . $e->getMessage());
        throw new RuntimeException('Gagal mengunggah file ke Neon Storage.');
    }

    return $key;
}

/**
 * Membuat URL sementara untuk membuka file Private.
 */
function storage_file_url(?string $key): string {

    if (!$key) {
        return '';
    }

    try {
        $client = storage_client();

        $command = $client->getCommand('GetObject', [
            'Bucket' => storage_bucket(),
            'Key' => $key,
        ]);

        $request = $client->createPresignedRequest(
            $command,
            '+30 minutes'
        );

        return (string) $request->getUri();

    } catch (Throwable $e) {
        error_log('[Neon Storage URL] ' . $e->getMessage());
        return '';
    }
}

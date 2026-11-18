<?php
require __DIR__ . '/includes/auth.php';
$u = current_user();
header('Location: ' . ($u ? 'pages/' . HOME_BY_ROLE[$u['role']] : 'login.php'));

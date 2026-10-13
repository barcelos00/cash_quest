<?php
// Identifica se estamos no computador local (XAMPP) ou no servidor online
$isLocal = ($_SERVER['HTTP_HOST'] === 'localhost' || $_SERVER['HTTP_HOST'] === '127.0.0.1');

if ($isLocal) {
    // Configurações do seu ambiente local (XAMPP)
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'controle_financeiro');
    define('DB_USER', 'root');
    define('DB_PASS', '');
} else {
    // Configurações do seu servidor online (InfinityFree)
    define('DB_HOST', 'sql306.infinityfree.com');
    define('DB_NAME', 'if0_43107147_cashquest');
    define('DB_USER', 'if0_43107147');
    define('DB_PASS', 'o1KOAELI3t'); // A sua senha real do painel
}
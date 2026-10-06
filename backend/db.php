<?php
$host = 'sql123.epizy.com'; // O seu Host Name
$dbname = 'if0_12345678_cashquest'; // O seu Database Name
$user = 'if0_12345678'; // O seu User Name
$pass = 'o1KOAElI3t'; // Sua senha
try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode(["erro" => "Falha na conexão com o banco."]));
}
?>
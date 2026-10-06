<?php
$host = 'COPIE_DO_PAINEL_INFINITYFREE'; // Ex: sql305.infinityfree.com
$dbname = 'if0_43107147_cashquest'; // O seu Database Name real
$user = 'if0_43107147'; // O seu User Name real
$pass = 'o1K0AEl13t'; // Sua senha (esta já está correta)

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die(json_encode(["erro" => "Falha na conexão com o banco."]));
}
?>
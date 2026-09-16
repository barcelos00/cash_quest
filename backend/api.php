<?php
require 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['usuario_id'])) {
    die(json_encode(["erro" => "nao_autenticado"]));
}

$usuario_id = $_SESSION['usuario_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $descricao = $_POST['descricao'];
    $valor = $_POST['valor'];
    $tipo = $_POST['tipo'];

    $stmt = $pdo->prepare("INSERT INTO transacoes (usuario_id, descricao, valor, tipo) VALUES (?, ?, ?, ?)");
    $stmt->execute([$usuario_id, $descricao, $valor, $tipo]);
    echo json_encode(["sucesso" => true]);
} else {
    $stmt = $pdo->prepare("SELECT * FROM transacoes WHERE usuario_id = ? ORDER BY data_registro DESC");
    $stmt->execute([$usuario_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
?>
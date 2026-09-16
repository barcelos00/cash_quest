<?php
require 'db.php';
header('Content-Type: application/json');

$acao = $_POST['acao'] ?? '';
$usuario = $_POST['usuario'] ?? '';
$senha = $_POST['senha'] ?? '';

if ($acao === 'registrar') {
    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
    try {
        $stmt = $pdo->prepare("INSERT INTO usuarios (usuario, senha) VALUES (?, ?)");
        $stmt->execute([$usuario, $senhaHash]);
        echo json_encode(["sucesso" => true, "msg" => "Usuário criado! Faça login."]);
    } catch (Exception $e) {
        echo json_encode(["sucesso" => false, "msg" => "Usuário já existe."]);
    }
} elseif ($acao === 'login') {
    $stmt = $pdo->prepare("SELECT id, senha FROM usuarios WHERE usuario = ?");
    $stmt->execute([$usuario]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($senha, $user['senha'])) {
        $_SESSION['usuario_id'] = $user['id'];
        echo json_encode(["sucesso" => true]);
    } else {
        echo json_encode(["sucesso" => false, "msg" => "Usuário ou senha inválidos."]);
    }
} elseif ($acao === 'logout') {
    session_destroy();
    echo json_encode(["sucesso" => true]);
}
?>
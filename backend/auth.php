<?php
session_start(); // OBRIGATÓRIO: Inicia a sessão para manter o utilizador logado
error_reporting(E_ALL);
ini_set('display_errors', 1);
require 'db.php';
header('Content-Type: application/json');

$acao = $_POST['acao'] ?? '';
$usuario = $_POST['usuario'] ?? '';
$senha = $_POST['senha'] ?? '';

if ($acao === 'registrar') {
    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
    try {
        // Cria um email fictício baseado no nome para satisfazer a regra da base de dados
        $emailFicticio = $usuario . "@cashquest.com";
        
        // Corrigido: Usando as colunas 'nome' e 'email' corretas da base de dados
        $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)");
        $stmt->execute([$usuario, $emailFicticio, $senhaHash]);
        echo json_encode(["sucesso" => true, "msg" => "Usuário criado! Faça login."]);
    } catch (Exception $e) {
        echo json_encode(["sucesso" => false, "msg" => "Usuário já existe."]);
    }
} elseif ($acao === 'login') {
    // Corrigido: Procura na coluna 'nome'
    $stmt = $pdo->prepare("SELECT id, senha FROM usuarios WHERE nome = ?");
    // Corrigido: Usa a variável '$usuario' recebida do formulário
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
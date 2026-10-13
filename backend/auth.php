<?php
session_start();
require 'db.php';
header('Content-Type: application/json');

$acao = $_POST['acao'] ?? '';

// ==========================================
// REGISTAR NOVO UTILIZADOR
// ==========================================
if ($acao === 'cadastro') {
    $nome = trim($_POST['usuario'] ?? '');
    $senha = $_POST['senha'] ?? '';

    if (empty($nome) || empty($senha)) {
        echo json_encode(["sucesso" => false, "mensagem" => "Preencha todos os campos."]);
        exit;
    }

    // Verifica se o utilizador já existe na coluna 'nome'
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE nome = ?");
    $stmt->execute([$nome]);
    if ($stmt->fetch()) {
        echo json_encode(["sucesso" => false, "mensagem" => "Este usuário já existe."]);
        exit;
    }

    // Insere na base de dados (preenchendo a coluna email automaticamente para evitar conflitos)
    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
    $emailTemporario = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $nome)) . "@cashquest.local";
    
    $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)");
    
    if ($stmt->execute([$nome, $emailTemporario, $senhaHash])) {
        echo json_encode(["sucesso" => true]);
    } else {
        echo json_encode(["sucesso" => false, "mensagem" => "Erro ao criar conta."]);
    }
    exit;
}

// ==========================================
// FAZER LOGIN
// ==========================================
if ($acao === 'login' || $_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = trim($_POST['usuario'] ?? '');
    $senha = $_POST['senha'] ?? '';

    if (empty($nome) || empty($senha)) {
        echo json_encode(["sucesso" => false, "mensagem" => "Preencha o usuário e a senha."]);
        exit;
    }

    // Procura o utilizador na coluna 'nome' da base de dados
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE nome = ?");
    $stmt->execute([$nome]);
    $dadosUsuario = $stmt->fetch(PDO::FETCH_ASSOC);

    // Valida a palavra-passe
    if ($dadosUsuario && password_verify($senha, $dadosUsuario['senha'])) {
        $_SESSION['usuario_id'] = $dadosUsuario['id'];
        $_SESSION['usuario_nome'] = $dadosUsuario['nome'];
        $_SESSION['ultimo_atividade'] = time();

        echo json_encode(["sucesso" => true]);
    } else {
        echo json_encode(["sucesso" => false, "mensagem" => "Usuário ou senha incorretos."]);
    }
    exit;
}

// ==========================================
// LOGOUT
// ==========================================
if ($acao === 'logout') {
    session_unset();
    session_destroy();
    echo json_encode(["sucesso" => true]);
    exit;
}
?>
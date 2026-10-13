<?php
session_start();
require 'db.php';
header('Content-Type: application/json');

//Bloqueia acesso sem login
if (!isset($_SESSION['usuario_id'])) {
    die(json_encode(["erro" => "nao_autenticado"]));
}

// SEGURANÇA EXTRA: Expiração após 30 minutos (1800 segundos) de inatividade
$tempo_limite = 1800; 
if (isset($_SESSION['ultimo_atividade']) && (time() - $_SESSION['ultimo_atividade'] > $tempo_limite)) {
    session_unset();
    session_destroy();
    die(json_encode(["erro" => "nao_autenticado"]));
}
// Atualiza o relógio a cada clique ou ação
$_SESSION['ultimo_atividade'] = time();

$usuario_id = $_SESSION['usuario_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $acao = $_POST['acao'] ?? 'inserir';

    // DELETAR TRANSAÇÃO
    if ($acao === 'deletar') {
        $id = $_POST['id'];
        $stmt = $pdo->prepare("DELETE FROM transacoes WHERE id = ? AND usuario_id = ?");
        $stmt->execute([$id, $usuario_id]);
        echo json_encode(["sucesso" => true]);
        exit;
    }

    // INSERIR TRANSAÇÃO (Segurança + Parcelas)
    $descricao = htmlspecialchars(trim($_POST['descricao'] ?? ''), ENT_QUOTES, 'UTF-8');
    $valorTotal = (float) ($_POST['valor'] ?? 0);
    $tipo = $_POST['tipo'] ?? '';
    
    // Barreira de Segurança
    if (empty($descricao) || $valorTotal <= 0 || !in_array($tipo, ['receita', 'despesa'])) {
        echo json_encode(["sucesso" => false, "erro" => "Dados inválidos ou manipulados."]);
        exit;
    }

    $data_registro = $_POST['data_registro'] ?? date('Y-m-d H:i:s');
    $parcelas = isset($_POST['parcelas']) ? (int) $_POST['parcelas'] : 1;

    // Lógica de Parcelamento
    if ($parcelas > 1) {
        $valorParcela = $valorTotal / $parcelas;
        
        for ($i = 0; $i < $parcelas; $i++) {
            $descParcela = $descricao . " (" . ($i + 1) . "/" . $parcelas . ")";
            $novaData = date('Y-m-d H:i:s', strtotime("+$i month", strtotime($data_registro)));
            
            $stmt = $pdo->prepare("INSERT INTO transacoes (usuario_id, descricao, valor, tipo, data_registro) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$usuario_id, $descParcela, $valorParcela, $tipo, $novaData]);
        }
    } else {
        // Inserção normal à vista
        $stmt = $pdo->prepare("INSERT INTO transacoes (usuario_id, descricao, valor, tipo, data_registro) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$usuario_id, $descricao, $valorTotal, $tipo, $data_registro]);
    }
    
    echo json_encode(["sucesso" => true]);

} else {
    // BUSCAR TRANSAÇÕES E CALCULAR SALDO
    $mes_ano = $_GET['mes'] ?? date('Y-m');
    $partes = explode('-', $mes_ano);
    $ano = $partes[0];
    $mes = $partes[1];

    $stmtSaldo = $pdo->prepare("
        SELECT 
            SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) - 
            SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) AS saldo_anterior
        FROM transacoes 
        WHERE usuario_id = ? AND DATE_FORMAT(data_registro, '%Y-%m') < ?
    ");
    $stmtSaldo->execute([$usuario_id, $mes_ano]);
    $resultadoSaldo = $stmtSaldo->fetch(PDO::FETCH_ASSOC);
    $saldo_anterior = $resultadoSaldo['saldo_anterior'] ?? 0;

    $stmtTransacoes = $pdo->prepare("
        SELECT * FROM transacoes 
        WHERE usuario_id = ? AND MONTH(data_registro) = ? AND YEAR(data_registro) = ?
        ORDER BY data_registro DESC
    ");
    $stmtTransacoes->execute([$usuario_id, $mes, $ano]);
    $transacoes = $stmtTransacoes->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "saldo_anterior" => (float) $saldo_anterior,
        "transacoes" => $transacoes
    ]);
}
?>
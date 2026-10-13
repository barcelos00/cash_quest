<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cash Quest - Painel</title>
    <link rel="stylesheet" href="style.css?v=4">
</head>
<body>
    <header>
        <div class="logo-container">
            <h1>Cash Quest</h1>
        </div>
        <button id="btnSair" class="btn-sair">Sair</button>
    </header>

    <main class="container">
        <!-- Filtro de Mês -->
        <section class="filtro-mes">
            <label for="filtroMes">Mês de Referência:</label>
            <input type="month" id="filtroMes">
        </section>

        <!-- Resumo Financeiro -->
        <section class="resumo">
            <div class="card saldo">
                <h3>Saldo Atual</h3>
                <p id="saldoDisplay">R$ 0,00</p>
            </div>
            <div class="card receitas">
                <h3>Receitas (Mês)</h3>
                <p id="receitasDisplay">R$ 0,00</p>
            </div>
            <div class="card despesas">
                <h3>Despesas (Mês)</h3>
                <p id="despesasDisplay">R$ 0,00</p>
            </div>
        </section>

        <!-- Formulário de Nova Transação (Com Parcelamento) -->
        <section class="nova-transacao">
            <h2>Adicionar Transação</h2>
            <form id="form-transacao">
                <input type="text" id="descricao" placeholder="Descrição (ex: TV Nova)" required>
                <input type="number" id="valor" step="0.01" placeholder="Valor Total (ex: 1200.00)" required>
                <select id="tipo" required>
                    <option value="despesa">Saidas/Gastos</option>
                    <option value="receita">Entrada de Saldo</option>
                </select>
                <select id="metodo_pagamento" required>
                    <option value="a_vista">À Vista</option>
                    <option value="cartao">Cartão de Crédito (Parcelar)</option>
                </select>
                <input type="number" id="parcelas" min="2" max="24" value="2" placeholder="Nº de Parcelas" style="display: none;">
                <input type="date" id="data_registro" required title="Data da transação">
                <button type="submit">Salvar</button>
            </form>
        </section>

        <!-- Lista de Transações -->
        <section class="historico">
            <h2>Histórico do Mês</h2>
            <div id="listaTransacoes" class="lista-transacoes">
                <!-- Transações aparecem aqui -->
            </div>
        </section>

        <!-- Gráficos Movidos para o Final -->
        <section class="graficos" style="margin-top: 40px;">
            <div class="chart-container">
                <h3>Comparativo</h3>
                <canvas id="graficoComparativo"></canvas>
            </div>
            <div class="chart-container">
                <h3>Evolução do Saldo</h3>
                <canvas id="graficoEvolucao"></canvas>
            </div>
        </section>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="app.js"></script>
</body>
</html>
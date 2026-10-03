// Variáveis globais para controlar os 3 gráficos
let chartPizza = null;
let chartBarras = null;
let chartLinha = null;

function mostrarToast(mensagem, tipo = 'success') {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toastMsg');
    toast.className = 'toast'; 
    toast.classList.add(tipo);
    msg.innerText = mensagem;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

async function carregarTransacoes() {
    const res = await fetch('../backend/api.php');
    const data = await res.json();

    if (data.erro === 'nao_autenticado') {
        window.location.href = 'login.html';
        return;
    }

    const tbody = document.getElementById('tabelaTransacoes');
    tbody.innerHTML = '';
    
    let saldo = 0, totalReceitas = 0, totalDespesas = 0;

    data.forEach(t => {
        const valorNum = parseFloat(t.valor);
        if (t.tipo === 'receita') {
            saldo += valorNum; totalReceitas += valorNum;
        } else {
            saldo -= valorNum; totalDespesas += valorNum;
        }

        const tipoClasse = t.tipo === 'receita' ? 'type-income' : 'type-expense';
        const tipoTexto = t.tipo === 'receita' ? 'Entrada' : 'Saída';
        const dataFormatada = t.data_registro ? new Date(t.data_registro).toLocaleDateString('pt-BR') : '-';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.descricao}</td>
            <td class="${tipoClasse}">R$ ${valorNum.toFixed(2).replace('.', ',')}</td>
            <td>${tipoTexto}</td>
            <td style="color: var(--muted);">${dataFormatada}</td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('displaySaldo').innerText = `R$ ${saldo.toFixed(2).replace('.', ',')}`;
    document.getElementById('displayReceitas').innerText = `R$ ${totalReceitas.toFixed(2).replace('.', ',')}`;
    document.getElementById('displayDespesas').innerText = `R$ ${totalDespesas.toFixed(2).replace('.', ',')}`;

    atualizarGraficos(data, totalReceitas, totalDespesas);
}

document.getElementById('formTransacao').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
        const res = await fetch('../backend/api.php', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.sucesso) {
            e.target.reset(); 
            carregarTransacoes(); 
            mostrarToast("Transação adicionada com sucesso!", "success");
        } else {
            mostrarToast("Erro ao salvar transação.", "error");
        }
    } catch (error) {
        mostrarToast("Erro de conexão.", "error");
    }
});

document.getElementById('btnSair').addEventListener('click', async () => {
    const formData = new FormData();
    formData.append('acao', 'logout');
    await fetch('../backend/auth.php', { method: 'POST', body: formData });
    window.location.href = 'login.html';
});

// Função para gerar os 3 gráficos
function atualizarGraficos(transacoes, receitas, despesas) {
    // Destrói os gráficos antigos se eles já existirem (para não sobrepor)
    if (chartPizza) chartPizza.destroy();
    if (chartBarras) chartBarras.destroy();
    if (chartLinha) chartLinha.destroy();

    // Se não tiver transações, não desenha nada
    if (receitas === 0 && despesas === 0) return;

    // ==========================================
    // 1. GRÁFICO DE PIZZA
    // ==========================================
    const ctxPizza = document.getElementById('graficoPizza');
    if (ctxPizza) {
        chartPizza = new Chart(ctxPizza, {
            type: 'pie',
            data: {
                labels: ['Entradas', 'Saídas'],
                datasets: [{
                    data: [receitas, despesas],
                    backgroundColor: ['#22c55e', '#ef4444'], // Verde e Vermelho
                    borderWidth: 0
                }]
            },
            options: { plugins: { legend: { labels: { color: '#f8fafc' } } } }
        });
    }

    // ==========================================
    // 2. GRÁFICO DE BARRAS
    // ==========================================
    const ctxBarras = document.getElementById('graficoBarras');
    if (ctxBarras) {
        chartBarras = new Chart(ctxBarras, {
            type: 'bar',
            data: {
                labels: ['Movimentações Totais'],
                datasets: [
                    { label: 'Entradas', data: [receitas], backgroundColor: '#22c55e', borderRadius: 6 },
                    { label: 'Saídas', data: [despesas], backgroundColor: '#ef4444', borderRadius: 6 }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
                    x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
                },
                plugins: { legend: { labels: { color: '#f8fafc' } } }
            }
        });
    }

    // ==========================================
    // 3. GRÁFICO DE LINHA (Tendência / Evolução)
    // ==========================================
    const historico = [...transacoes].reverse(); 
    let saldoAcumulado = 0;
    const labelsEvolucao = [];
    const dadosEvolucao = [];

    historico.forEach((t, index) => {
        const valor = parseFloat(t.valor);
        saldoAcumulado += t.tipo === 'receita' ? valor : -valor;
        labelsEvolucao.push(`Mov ${index + 1}`);
        dadosEvolucao.push(saldoAcumulado);
    });

    const ctxLinha = document.getElementById('graficoLinha');
    if (ctxLinha) {
        chartLinha = new Chart(ctxLinha, {
            type: 'line',
            data: {
                labels: labelsEvolucao,
                datasets: [{
                    label: 'Evolução do Saldo',
                    data: dadosEvolucao,
                    borderColor: '#6366f1', // Azul roxeado do tema
                    backgroundColor: 'rgba(99, 102, 241, 0.2)', // Fundo transparente
                    fill: true,
                    tension: 0.4, // Curva suave
                    pointStyle: 'triangle', // Setas
                    pointRadius: 6,
                    pointBackgroundColor: '#22c55e'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
                    x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
                },
                plugins: { legend: { labels: { color: '#f8fafc' } } }
            }
        });
    }
}

// Inicializa o sistema ao carregar a página
carregarTransacoes();
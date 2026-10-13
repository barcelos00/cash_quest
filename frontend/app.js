
// SEGURANÇA: Impede a visualização do cache se o utilizador usar o botão "Voltar" após o logout
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.location.reload(); 
    }
});

// Variáveis globais para os gráficos
let meuGraficoComparativo = null;
let meuGraficoEvolucao = null;

document.addEventListener("DOMContentLoaded", () => {
    const filtroMes = document.getElementById('filtroMes');
    const dataRegistroInput = document.getElementById('data_registro');
    
    // Configura datas iniciais
    const hoje = new Date();
    filtroMes.value = hoje.toISOString().slice(0, 7); 
    dataRegistroInput.value = hoje.toISOString().slice(0, 10); 

    carregarTransacoes();
    filtroMes.addEventListener('change', carregarTransacoes);

    // MÁGICA DO PARCELAMENTO
    const metodoPagamento = document.getElementById('metodo_pagamento');
    const parcelasInput = document.getElementById('parcelas');

    metodoPagamento.addEventListener('change', (e) => {
        if (e.target.value === 'cartao') {
            parcelasInput.style.display = 'block';
            parcelasInput.required = true;
        } else {
            parcelasInput.style.display = 'none';
            parcelasInput.required = false;
        }
    });
});

async function carregarTransacoes() {
    const mesSelecionado = document.getElementById('filtroMes').value;
    
    try {
        // Busca os dados ao PHP com ordem para ignorar cache antigo
        const resposta = await fetch(`../backend/api.php?mes=${mesSelecionado}`, { cache: 'no-store' });
        
        // MODO DETETIVE: Lê o que o PHP enviou como texto puro primeiro
        const textoResposta = await resposta.text();
        let dados;
        
        try {
            // Tenta converter para JSON. Se o PHP enviou um erro em HTML, isto vai falhar
            dados = JSON.parse(textoResposta);
        } catch (erroConversao) {
            alert("Erro vindo do PHP (Possível erro no servidor):\n" + textoResposta);
            return;
        }

        if (dados.erro === "nao_autenticado") {
            window.location.href = "login.html";
            return;
        }

        const saldoAnterior = dados.saldo_anterior || 0;
        const transacoesDoMes = dados.transacoes || [];

        let totalReceitasMes = 0;
        let totalDespesasMes = 0;

        const lista = document.getElementById('listaTransacoes');
        lista.innerHTML = ''; 

        // SALDO DO MÊS ANTERIOR 
        if (saldoAnterior !== 0) {
            const classeCor = saldoAnterior >= 0 ? 'positivo' : 'negativo';
            lista.innerHTML += `
                <div class="transacao-item saldo-transportado" style="background: var(--surface-solid); border-left: 4px solid var(--primary);">
                    <span><strong>Saldo do mês anterior</strong></span>
                    <span class="${classeCor}"><strong>R$ ${saldoAnterior.toFixed(2)}</strong></span>
                </div>
            `;
        }

        const transacoesAscendentes = [...transacoesDoMes].reverse(); 
        let saldoAcumulado = saldoAnterior;
        const labelsEvolucao = ['Início'];
        const dataEvolucao = [saldoAnterior];

        transacoesDoMes.forEach((t) => {
            const valor = parseFloat(t.valor);
            
            if (t.tipo === 'receita') {
                totalReceitasMes += valor;
            } else {
                totalDespesasMes += valor;
            }

            const dataFormatada = t.data_registro;

            lista.innerHTML += `
                <div class="transacao-item">
                    <div class="info">
                        <span class="descricao">${t.descricao}</span>
                        <span class="data" style="font-size: 0.8em; color: var(--muted); display: block;">${dataFormatada}</span>
                    </div>
                    <div class="acoes-transacao">
                        <span class="${t.tipo === 'receita' ? 'positivo' : 'negativo'}">
                            ${t.tipo === 'receita' ? '+' : '-'} R$ ${valor.toFixed(2)}
                        </span>
                        <button onclick="deletarTransacao(${t.id})" class="btn-remover" title="Apagar transação">X</button>
                    </div>
                </div>
            `;
        });

        transacoesAscendentes.forEach((t, index) => {
            const valor = parseFloat(t.valor);
            if (t.tipo === 'receita') saldoAcumulado += valor;
            else saldoAcumulado -= valor;
            
            labelsEvolucao.push(`Mov ${index + 1}`);
            dataEvolucao.push(saldoAcumulado);
        });

        const saldoAtual = saldoAnterior + totalReceitasMes - totalDespesasMes;

        document.getElementById('saldoDisplay').innerText = `R$ ${saldoAtual.toFixed(2)}`;
        document.getElementById('receitasDisplay').innerText = `R$ ${totalReceitasMes.toFixed(2)}`;
        document.getElementById('despesasDisplay').innerText = `R$ ${totalDespesasMes.toFixed(2)}`;

        desenharGraficos(totalReceitasMes, totalDespesasMes, labelsEvolucao, dataEvolucao);

    } catch (error) {
        alert("Erro grave de ligação ao servidor: " + error.message);
    }
}

function desenharGraficos(receitas, despesas, labelsEvolucao, dataEvolucao) {
    if(meuGraficoComparativo) meuGraficoComparativo.destroy();
    if(meuGraficoEvolucao) meuGraficoEvolucao.destroy();

    const ctxComp = document.getElementById('graficoComparativo').getContext('2d');
    meuGraficoComparativo = new Chart(ctxComp, {
        type: 'bar',
        data: {
            labels: ['Movimentações Totais'],
            datasets: [
                { label: 'Entradas', data: [receitas], backgroundColor: '#22c55e' },
                { label: 'Saídas', data: [despesas], backgroundColor: '#ef4444' }
            ]
        },
        options: { responsive: true, plugins: { legend: { labels: { color: '#fff' } } }, scales: { y: { ticks: { color: '#aaa' } }, x: { ticks: { color: '#aaa' } } } }
    });

    const ctxEvol = document.getElementById('graficoEvolucao').getContext('2d');
    meuGraficoEvolucao = new Chart(ctxEvol, {
        type: 'line',
        data: {
            labels: labelsEvolucao,
            datasets: [{
                label: 'Evolução do Saldo',
                data: dataEvolucao,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                fill: true,
                tension: 0.1,
                pointStyle: 'triangle',
                pointBackgroundColor: '#22c55e',
                pointRadius: 6
            }]
        },
        options: { responsive: true, plugins: { legend: { labels: { color: '#fff' } } }, scales: { y: { ticks: { color: '#aaa' } }, x: { ticks: { color: '#aaa' } } } }
    });
}

async function deletarTransacao(id) {
    if (!confirm("Tem certeza que deseja apagar esta transação? Esta ação não pode ser desfeita.")) return;
    
    const formData = new FormData();
    formData.append('acao', 'deletar');
    formData.append('id', id);

    try {
        const resposta = await fetch('../backend/api.php', { method: 'POST', body: formData });
        const resultado = await resposta.json();
        if (resultado.sucesso) carregarTransacoes(); 
    } catch (error) { alert("Erro ao tentar apagar a transação."); }
}

document.getElementById('form-transacao').addEventListener('submit', async (e) => {
    e.preventDefault();
    const descricao = document.getElementById('descricao').value;
    const valor = document.getElementById('valor').value;
    const tipo = document.getElementById('tipo').value;
    const metodo_pagamento = document.getElementById('metodo_pagamento').value;
    const parcelas = document.getElementById('parcelas').value;
    
    // Captura a data selecionada no calendário e adiciona a hora atual
    const data_registro = document.getElementById('data_registro').value;
    const horaAtual = new Date().toTimeString().slice(0, 8); 

    const formData = new FormData();
    formData.append('descricao', descricao);
    formData.append('valor', valor);
    formData.append('tipo', tipo);
    
    // Só envia as parcelas se for cartão
    if (metodo_pagamento === 'cartao') {
        formData.append('parcelas', parcelas);
    }
    
    // Junta a data escolhida com a hora atual (AAAA-MM-DD HH:MM:SS)
    formData.append('data_registro', data_registro + ' ' + horaAtual); 

    try {
        const resposta = await fetch('../backend/api.php', { method: 'POST', body: formData });
        const textoResposta = await resposta.text();
        
        let resultado;
        try {
            resultado = JSON.parse(textoResposta);
        } catch(e) {
            alert("Erro do PHP ao salvar:\n" + textoResposta);
            return;
        }

        if (resultado.erro === "nao_autenticado") {
            window.location.href = "login.html";
        } else if (resultado.erro) {
            alert("Não foi possível salvar: " + resultado.erro);
        } else if (resultado.sucesso) {
            document.getElementById('descricao').value = '';
            document.getElementById('valor').value = '';
            carregarTransacoes();
        }
    } catch (error) { 
        alert("Erro na comunicação com o servidor. Verifique o XAMPP."); 
    }
});

document.getElementById('btnSair').addEventListener('click', async () => {
    const formData = new FormData();
    formData.append('acao', 'logout');
    await fetch('../backend/auth.php', { method: 'POST', body: formData });
    window.location.href = 'login.html';
});
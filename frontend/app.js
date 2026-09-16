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

carregarTransacoes();
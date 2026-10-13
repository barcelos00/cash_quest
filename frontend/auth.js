// Função para alternar entre as abas de Entrar e Cadastrar
function mudarAba(tipo) {
    const btnLogin = document.getElementById('btnAbaLogin');
    const btnCadastro = document.getElementById('btnAbaCadastro');
    const formLogin = document.getElementById('form-login');
    const formCadastro = document.getElementById('form-cadastro');
    const msg = document.getElementById('msg');
    
    if (msg) msg.innerText = '';

    if (tipo === 'login') {
        if (btnLogin) btnLogin.classList.add('ativa');
        if (btnCadastro) btnCadastro.classList.remove('ativa');
        if (formLogin) formLogin.classList.add('ativa');
        if (formCadastro) formCadastro.classList.remove('ativa');
    } else {
        if (btnCadastro) btnCadastro.classList.add('ativa');
        if (btnLogin) btnLogin.classList.remove('ativa');
        if (formCadastro) formCadastro.classList.add('ativa');
        if (formLogin) formLogin.classList.remove('ativa');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Gestão do Login
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(formLogin);
            formData.append('acao', 'login');

            try {
                const resposta = await fetch('../backend/auth.php', { method: 'POST', body: formData });
                const resultado = await resposta.json();
                
                if (resultado.sucesso) {
                    // Redireciona corretamente para o dashboard na mesma pasta
                    window.location.href = 'dashboard.php';
                } else {
                    const msgDiv = document.getElementById('msg');
                    if (msgDiv) {
                        msgDiv.innerText = resultado.mensagem;
                        msgDiv.style.color = 'var(--danger)';
                    }
                }
            } catch (err) {
                console.error("Erro na comunicação:", err);
            }
        });
    }

    // Gestão do Cadastro
    const formCadastro = document.getElementById('form-cadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(formCadastro);
            formData.append('acao', 'cadastro');

            try {
                const resposta = await fetch('../backend/auth.php', { method: 'POST', body: formData });
                const resultado = await resposta.json();
                
                const msgDiv = document.getElementById('msg');
                if (resultado.sucesso) {
                    if (msgDiv) {
                        msgDiv.innerText = "Conta criada com sucesso! Redirecionando...";
                        msgDiv.style.color = 'var(--success)';
                    }
                    setTimeout(() => {
                        mudarAba('login'); // Alterna para a aba de login automaticamente
                    }, 1500);
                } else {
                    if (msgDiv) {
                        msgDiv.innerText = resultado.mensagem;
                        msgDiv.style.color = 'var(--danger)';
                    }
                }
            } catch (err) {
                console.error("Erro na comunicação:", err);
            }
        });
    }
});
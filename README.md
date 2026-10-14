# Cash Quest - Controle Financeiro Inteligente

Uma aplicação web moderna e segura para a gestão de finanças pessoais, desenvolvida com foco em performance, design limpo e automação de cálculos financeiros.



##  Sobre o Projeto
O **Cash Quest** foi criado para ajudar os utilizadores a dominar as suas finanças de forma simples e intuitiva. A plataforma permite o registo de receitas e despesas mensais, planeamento de compras parceladas no cartão de crédito, visualização de gráficos dinâmicos de evolução de património e controlo seguro de sessões por utilizador.



## Tecnologias Utilizadas

* **Frontend:** HTML5, CSS3 (com Design System baseado em variáveis e suporte a modo escuro) e JavaScript (Fetch API).
* **Gráficos e Visualização:** Chart.js para renderização de comparativos de entradas/saídas e linhas de evolução de saldo.
* **Backend:** PHP (com arquitetura orientada a serviços e PDO para segurança em base de dados).
* **Base de Dados:** MySQL.



## Principais Funcionalidades

1. **Dashboard Financeiro Completo:**
   * Filtro por mês de referência com cálculo automático do saldo transportado do mês anterior.
   * Visualização em tempo real do Saldo Atual, Receitas e Despesas mensais.

2. **Gestão de Transações e Parcelamento:**
   * Registo simplificado de entradas e saídas.
   * Sistema inteligente de parcelamento de cartão de crédito: o valor total é dividido automaticamente e distribuído pelos meses futuros correspondentes.

3. **Gráficos Dinâmicos:**
   * Gráfico de barras comparativo entre receitas e despesas.
   * Gráfico de linha mostrando a evolução acumulada do saldo ao longo das movimentações.

4. **Segurança Avançada:**
   * Sanitização rigorosa de dados de entrada (`htmlspecialchars`, tipagem estrita).
   * Controlo de sessões com temporizador de inatividade automática (30 minutos).
   * Proteção contra visualização de dados via cache após o encerramento de sessão (botão "Voltar" do navegador blindado).



## Estrutura do Projeto

```text
/
├── backend/
│   ├── api.php        # Endpoints seguros para transações (CRUD e saldo)
│   ├── auth.php       # Gestão de autenticação e sessões
│   └── db.php         # Conexão à base de dados via PDO
├── frontend/
│   ├── index.html     # Landing page de apresentação do projeto
│   ├── login.html     # Ecrã de autenticação de utilizadores
│   ├── cadastro.html  # Ecrã de registo de nova conta
│   ├── painel.php     # Painel principal de controlo financeiro
│   ├── app.js         # Lógica do painel e consumo da API
│   ├── auth.js        # Lógica de login e registo
│   └── style.css      # Folha de estilos global (Tema Escuro)
└── README.md          # Documentação do projeto


 Como Executar Localmente
Certifique-se de ter um ambiente local PHP/MySQL a funcionar (como o XAMPP).

Clone ou coloque a pasta do projeto no diretório do seu servidor local (ex: htdocs/cash-quest).

Importe a estrutura da base de dados MySQL necessária para as tabelas usuarios e transacoes.

Aceda através do seu navegador em: http://localhost/cash-quest/frontend/index.html.

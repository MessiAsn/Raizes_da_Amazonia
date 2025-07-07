/* Script dedicado para o Painel Administrativo */

// ========================================
// CONFIGURAÇÃO E CONSTANTES
// ========================================
const API_BASE_URL =
  window.RaizesAmazonia?.Config?.API_BASE_URL || "http://localhost:8000";

// Estado global do admin
let currentTab = "receitas";
let isAuthenticated = false;

// ========================================
// PAGINAÇÃO
// ========================================
const paginacao = {
  receitas: {
    paginaAtual: 1,
    itensPorPagina: 6,
    totalItens: 0,
    dados: [],
  },
  dicas: {
    paginaAtual: 1,
    itensPorPagina: 8,
    totalItens: 0,
    dados: [],
  },
};

// Função para calcular total de páginas
function calcularTotalPaginas(tipo) {
  const config = paginacao[tipo];
  return Math.ceil(config.totalItens / config.itensPorPagina);
}

// Função para obter itens da página atual
function obterItensPaginaAtual(tipo) {
  const config = paginacao[tipo];
  const inicio = (config.paginaAtual - 1) * config.itensPorPagina;
  const fim = inicio + config.itensPorPagina;
  return config.dados.slice(inicio, fim);
}

// Função para gerar HTML da paginação
function gerarPaginacao(tipo) {
  const config = paginacao[tipo];
  const totalPaginas = calcularTotalPaginas(tipo);

  if (totalPaginas <= 1) {
    return "";
  }

  let html = `
    <div class="pagination-container">
      <div class="pagination-info">
        Mostrando ${(config.paginaAtual - 1) * config.itensPorPagina + 1} - 
        ${Math.min(
          config.paginaAtual * config.itensPorPagina,
          config.totalItens
        )} 
        de ${config.totalItens} ${tipo}
      </div>
      <div class="pagination">
        <button class="pagination-btn pagination-prev ${
          config.paginaAtual === 1 ? "disabled" : ""
        }" 
                onclick="irParaPagina('${tipo}', ${config.paginaAtual - 1})"
                ${config.paginaAtual === 1 ? "disabled" : ""}>
          Anterior
        </button>
  `;

  // Lógica para mostrar números das páginas
  const maxBotoes = 5;
  let inicio = Math.max(1, config.paginaAtual - Math.floor(maxBotoes / 2));
  let fim = Math.min(totalPaginas, inicio + maxBotoes - 1);

  if (fim - inicio < maxBotoes - 1) {
    inicio = Math.max(1, fim - maxBotoes + 1);
  }

  // Primeira página e reticências se necessário
  if (inicio > 1) {
    html += `<button class="pagination-btn" onclick="irParaPagina('${tipo}', 1)">1</button>`;
    if (inicio > 2) {
      html += `<span class="pagination-ellipsis">...</span>`;
    }
  }

  // Páginas do meio
  for (let i = inicio; i <= fim; i++) {
    html += `<button class="pagination-btn ${
      i === config.paginaAtual ? "active" : ""
    }" 
             onclick="irParaPagina('${tipo}', ${i})">${i}</button>`;
  }

  // Última página e reticências se necessário
  if (fim < totalPaginas) {
    if (fim < totalPaginas - 1) {
      html += `<span class="pagination-ellipsis">...</span>`;
    }
    html += `<button class="pagination-btn" onclick="irParaPagina('${tipo}', ${totalPaginas})">${totalPaginas}</button>`;
  }

  html += `
        <button class="pagination-btn pagination-next ${
          config.paginaAtual === totalPaginas ? "disabled" : ""
        }" 
                onclick="irParaPagina('${tipo}', ${config.paginaAtual + 1})"
                ${config.paginaAtual === totalPaginas ? "disabled" : ""}>
          Próximo
        </button>
      </div>
      <div class="items-per-page">
        <label for="${tipo}-per-page">Itens por página:</label>
        <select id="${tipo}-per-page" onchange="alterarItensPorPagina('${tipo}', this.value)">
          <option value="4" ${
            config.itensPorPagina === 4 ? "selected" : ""
          }>4</option>
          <option value="6" ${
            config.itensPorPagina === 6 ? "selected" : ""
          }>6</option>
          <option value="8" ${
            config.itensPorPagina === 8 ? "selected" : ""
          }>8</option>
          <option value="12" ${
            config.itensPorPagina === 12 ? "selected" : ""
          }>12</option>
          <option value="20" ${
            config.itensPorPagina === 20 ? "selected" : ""
          }>20</option>
        </select>
      </div>
    </div>
  `;

  return html;
}

// Função para ir para uma página específica
function irParaPagina(tipo, pagina) {
  const totalPaginas = calcularTotalPaginas(tipo);

  if (pagina < 1 || pagina > totalPaginas) {
    return;
  }

  paginacao[tipo].paginaAtual = pagina;

  if (tipo === "receitas") {
    renderizarReceitasAdmin(paginacao.receitas.dados);
  } else if (tipo === "dicas") {
    renderizarDicasAdmin(paginacao.dicas.dados);
  }
}

// Função para alterar itens por página
function alterarItensPorPagina(tipo, novoValor) {
  paginacao[tipo].itensPorPagina = parseInt(novoValor);
  paginacao[tipo].paginaAtual = 1; // Voltar para primeira página

  if (tipo === "receitas") {
    renderizarReceitasAdmin(paginacao.receitas.dados);
  } else if (tipo === "dicas") {
    renderizarDicasAdmin(paginacao.dicas.dados);
  }
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

// Função para formatar datas de forma segura
function formatarDataSegura(dataString, incluirHora = false) {
  try {
    if (!dataString || dataString === null || dataString === undefined) {
      return "Data não disponível";
    }

    const data = new Date(dataString);

    // Verificar se a data é válida
    if (isNaN(data.getTime())) {
      return "Data inválida";
    }

    if (incluirHora) {
      return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return data.toLocaleDateString("pt-BR");
    }
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "Data inválida";
  }
}

// ========================================
// INICIALIZAÇÃO
// ========================================
document.addEventListener("DOMContentLoaded", function () {
  console.log("Painel Admin inicializando...");

  // Aguardar um pouco para garantir que o DOM está completamente carregado
  setTimeout(() => {
    console.log("Configurando painel admin...");

    // Verificar autenticação
    verificarAutenticacao();

    // Configurar navegação por tabs
    configurarTabs();

    // Configurar eventos
    configurarEventos();

    // Carregar dados iniciais
    carregarDadosIniciais();

    console.log("Painel Admin inicializado com sucesso!");
  }, 200);
});

// ========================================
// AUTENTICAÇÃO
// ========================================
function verificarAutenticacao() {
  // Verificar se o usuário está autenticado como admin
  const isAdmin = sessionStorage.getItem("isAdmin") === "true";

  if (!isAdmin) {
    // Se não está autenticado, solicitar senha
    const senha = prompt(
      "Digite a senha de administrador para acessar o painel:"
    );

    if (senha === "admin123") {
      sessionStorage.setItem("isAdmin", "true");
      isAuthenticated = true;
      mostrarMensagem(
        "Acesso autorizado! Bem-vindo ao painel administrativo.",
        "success"
      );
    } else {
      mostrarMensagem("Senha incorreta! Redirecionando...", "error");
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 2000);
      return;
    }
  } else {
    isAuthenticated = true;
    mostrarMensagem("Bem-vindo de volta ao painel administrativo!", "info");
  }
}

function logout() {
  sessionStorage.removeItem("isAdmin");
  mostrarMensagem("Logout realizado com sucesso!", "info");
  setTimeout(() => {
    window.location.href = "../index.html";
  }, 1500);
}

// ========================================
// NAVEGAÇÃO POR TABS
// ========================================
function configurarTabs() {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const tabId = this.getAttribute("data-tab");

      // Remover classe active de todos os botões e conteúdos
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Adicionar classe active ao botão clicado
      this.classList.add("active");

      // Mostrar o conteúdo correspondente
      const targetContent = document.getElementById(`tab-${tabId}`);
      if (targetContent) {
        targetContent.classList.add("active");
        targetContent.classList.add("fade-in");
      }

      // Atualizar estado atual
      currentTab = tabId;

      // Carregar conteúdo específico da aba
      carregarConteudoAba(tabId);

      console.log(`Mudou para aba: ${tabId}`);
    });
  });
}

// Função para carregar conteúdo específico de cada aba
function carregarConteudoAba(tabId) {
  switch (tabId) {
    case "receitas":
      carregarReceitasAdmin();
      break;
    case "dicas":
      carregarDicasAdmin();
      break;
    case "estatisticas":
      carregarEstatisticas();
      break;
  }
}

// ========================================
// CONFIGURAÇÃO DE EVENTOS
// ========================================
function configurarEventos() {
  console.log("Configurando eventos...");

  // Botão de logout
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    console.log("Botão logout encontrado");
    btnLogout.addEventListener("click", logout);
  } else {
    console.log("Botão logout não encontrado");
  }

  // Botão de nova receita
  const btnNovaReceita = document.getElementById("btn-nova-receita");
  if (btnNovaReceita) {
    console.log("✅ Botão nova receita encontrado");
    btnNovaReceita.addEventListener("click", abrirModalNovaReceitaAdmin);
  } else {
    console.log("❌ Botão nova receita não encontrado");
  }

  // Botão de nova dica
  const btnNovaDica = document.getElementById("btn-nova-dica");
  if (btnNovaDica) {
    console.log("✅ Botão nova dica encontrado");
    btnNovaDica.addEventListener("click", abrirModalNovaDicaAdmin);
  } else {
    console.log("❌ Botão nova dica não encontrado");
  }

  // Configurar formulários
  configurarFormularios();

  // Configurar event listeners para fechar modals
  configurarBotoesFecharModal();

  // Configurar previews de imagem
  configurarPreviewsImagem();
}

// Função para configurar event listeners dos formulários
// Função para configurar event listeners dos formulários
// Função para configurar event listeners dos formulários
function configurarFormularios() {
  console.log("Configurando formulários...");

  // Configurar formulários após um pequeno delay
  setTimeout(() => {
    configurarFormularioNovaReceita();
    configurarFormularioNovaDica();
    configurarFormularioEditarReceita();
    configurarFormularioEditarDica();
  }, 100);
}

function configurarFormularioNovaReceita() {
  const form = document.getElementById("form-nova-receita");
  if (form) {
    console.log("✅ Formulário nova receita encontrado");
    form.addEventListener("submit", adicionarReceita);
    console.log("✅ Event listener adicionado ao formulário nova receita");
  } else {
    console.log("❌ Formulário nova receita não encontrado");
  }
}

function configurarFormularioNovaDica() {
  const form = document.getElementById("form-nova-dica");
  if (form) {
    console.log("✅ Formulário nova dica encontrado");
    form.addEventListener("submit", adicionarDica);
    console.log("✅ Event listener adicionado ao formulário nova dica");
  } else {
    console.log("❌ Formulário nova dica não encontrado");
  }
}

function configurarFormularioEditarReceita() {
  const form = document.getElementById("form-editar-receita");
  if (form) {
    console.log("✅ Formulário editar receita encontrado");
    form.addEventListener("submit", salvarEdicaoReceita);
  } else {
    console.log("❌ Formulário editar receita não encontrado");
  }
}

function configurarFormularioEditarDica() {
  const form = document.getElementById("form-editar-dica");
  if (form) {
    console.log("✅ Formulário editar dica encontrado");
    form.addEventListener("submit", salvarEdicaoDica);
  } else {
    console.log("❌ Formulário editar dica não encontrado");
  }
}

// ========================================
// CARREGAMENTO DE DADOS
// ========================================
async function carregarDadosIniciais() {
  console.log("Carregando dados iniciais...");

  try {
    // Verificar se a aba de receitas está ativa
    const receitasTab = document.getElementById("tab-receitas");
    if (receitasTab && receitasTab.classList.contains("active")) {
      console.log("📖 Carregando receitas...");
      await carregarReceitasAdmin();
    }

    // Carregar estatísticas sempre
    await carregarEstatisticas();
  } catch (error) {
    console.error("❌ Erro ao carregar dados:", error);
    mostrarMensagemAdmin("❌ Erro ao carregar dados iniciais.", "error");
  }
}

async function carregarEstatisticas() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stats`);

    if (response.ok) {
      const stats = await response.json();
      renderizarEstatisticas(stats);
    } else {
      // Se a API de stats não existe, calcular manualmente
      const receitasResponse = await fetch(`${API_BASE_URL}/api/receitas`);
      const dicasResponse = await fetch(`${API_BASE_URL}/api/dicas`);

      const receitas = receitasResponse.ok ? await receitasResponse.json() : [];
      const dicas = dicasResponse.ok ? await dicasResponse.json() : [];

      // Calcular estatísticas detalhadas
      const stats = calcularEstatisticasDetalhadas(receitas, dicas);
      renderizarEstatisticas(stats);
    }
  } catch (error) {
    console.error("❌ Erro ao carregar estatísticas:", error);

    // Verificar se é erro de conexão
    const isConnectionError =
      error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError") ||
      error.message.includes("ERR_CONNECTION") ||
      !navigator.onLine;

    if (isConnectionError) {
      // Usar função específica para estatísticas
      document.getElementById("estatisticas-container").innerHTML = `
        <div class="erro-conexao">
          <div class="erro-content">
            <h3>Erro de Conexão</h3>
            <p>Não foi possível conectar com o servidor.</p>
            <p>Certifique-se de que o backend está rodando em <code>http://localhost:8000</code></p>
            <button onclick="carregarEstatisticas()" class="btn-retry">Tentar Novamente</button>
          </div>
        </div>
      `;
    } else {
      document.getElementById("estatisticas-container").innerHTML =
        '<div class="message error">❌ Erro ao carregar estatísticas.</div>';
    }
  }
}

function calcularEstatisticasDetalhadas(receitas, dicas) {
  // Garantir que receitas e dicas são arrays válidos
  const receitasArray = Array.isArray(receitas) ? receitas : [];
  const dicasArray = Array.isArray(dicas) ? dicas : [];

  console.log(
    "Debug estatísticas - Total receitas:",
    receitasArray.length,
    "Total dicas:",
    dicasArray.length
  );

  // Configurar datas corretamente
  const agora = new Date();
  const umaSemanaAtras = new Date();
  umaSemanaAtras.setDate(agora.getDate() - 7);
  umaSemanaAtras.setHours(0, 0, 0, 0); // Início do dia há 7 dias

  console.log("🕰️ Data atual:", agora.toISOString());
  console.log("🕰️ Uma semana atrás:", umaSemanaAtras.toISOString());

  // Estatísticas de receitas - corrigir o filtro de imagem
  const receitasComImagem = receitasArray.filter((r) => r && r.imagem).length;
  const receitasComHistoria = receitasArray.filter(
    (r) => r && r.historia && r.historia.trim().length > 0
  ).length;

  const receitasRecentes = receitasArray.filter((r) => {
    if (!r || !r.created_at) {
      console.log("❌ Receita sem data:", r?.nome || "Nome não disponível");
      return false;
    }

    try {
      const dataReceita = new Date(r.created_at);

      // Verificar se a data é válida
      if (isNaN(dataReceita.getTime())) {
        console.log(
          "❌ Data inválida para receita:",
          r.nome,
          "Data original:",
          r.created_at
        );
        return false;
      }

      const isRecente = dataReceita >= umaSemanaAtras;
      console.log(
        `📅 Receita: ${
          r.nome
        } | Data: ${dataReceita.toLocaleDateString()} | É recente: ${isRecente}`
      );

      return isRecente;
    } catch (error) {
      console.log("❌ Erro ao processar receita:", r.nome, error);
      return false;
    }
  }).length;

  console.log("📊 TOTAL RECEITAS RECENTES:", receitasRecentes);

  // Estatísticas de dicas
  const dicasRecentes = dicasArray.filter((d) => {
    if (!d || !d.created_at) {
      console.log(
        "❌ Dica sem data:",
        d?.texto?.substring(0, 30) || "Texto não disponível"
      );
      return false;
    }

    try {
      const dataDica = new Date(d.created_at);

      // Verificar se a data é válida
      if (isNaN(dataDica.getTime())) {
        console.log(
          "❌ Data inválida para dica:",
          d.texto?.substring(0, 30),
          "Data original:",
          d.created_at
        );
        return false;
      }

      const isRecente = dataDica >= umaSemanaAtras;
      console.log(
        `📅 Dica: ${d.texto?.substring(
          0,
          30
        )}... | Data: ${dataDica.toLocaleDateString()} | É recente: ${isRecente}`
      );

      return isRecente;
    } catch (error) {
      console.log(
        "❌ Erro ao processar dica:",
        d.texto?.substring(0, 30),
        error
      );
      return false;
    }
  }).length;

  console.log("📊 TOTAL DICAS RECENTES:", dicasRecentes);

  const mediaCaracteresDicas =
    dicasArray.length > 0
      ? Math.round(
          dicasArray.reduce(
            (sum, d) => sum + (d && (d.conteudo || d.texto || "")).length,
            0
          ) / dicasArray.length
        )
      : 0;

  // Classificar dicas por tamanho
  const dicasCurtas = dicasArray.filter(
    (d) => d && (d.conteudo || d.texto || "").length <= 100
  ).length;
  const dicasLongas = dicasArray.filter(
    (d) => d && (d.conteudo || d.texto || "").length > 100
  ).length;

  // Estatísticas de ingredientes (se existir no campo ingredientes)
  const todosIngredientes = receitasArray.flatMap((r) => {
    if (r && r.ingredientes) {
      return r.ingredientes.split("\n").filter((i) => i.trim().length > 0);
    }
    return [];
  });

  const ingredientesUnicos = [
    ...new Set(todosIngredientes.map((i) => i.toLowerCase().trim())),
  ];

  return {
    total_receitas: Number(receitasArray.length) || 0,
    total_dicas: Number(dicasArray.length) || 0,
    receitas_com_imagem: Number(receitasComImagem) || 0,
    receitas_sem_imagem: Number(receitasArray.length - receitasComImagem) || 0,
    receitas_com_historia: Number(receitasComHistoria) || 0,
    receitas_recentes: Number(receitasRecentes) || 0,
    dicas_recentes: Number(dicasRecentes) || 0,
    dicas_curtas: Number(dicasCurtas) || 0,
    dicas_longas: Number(dicasLongas) || 0,
    media_caracteres_dicas: Number(mediaCaracteresDicas) || 0,
    total_ingredientes_unicos: Number(ingredientesUnicos.length) || 0,
    percentual_receitas_com_imagem:
      receitasArray.length > 0
        ? Math.round((receitasComImagem / receitasArray.length) * 100)
        : 0,
    percentual_receitas_com_historia:
      receitasArray.length > 0
        ? Math.round((receitasComHistoria / receitasArray.length) * 100)
        : 0,
  };
}

function renderizarEstatisticas(stats) {
  // Garantir que stats é um objeto válido e todos os valores são números
  const safeStats = {
    total_receitas: Number(stats?.total_receitas) || 0,
    total_dicas: Number(stats?.total_dicas) || 0,
    receitas_com_imagem: Number(stats?.receitas_com_imagem) || 0,
    receitas_sem_imagem: Number(stats?.receitas_sem_imagem) || 0,
    receitas_com_historia: Number(stats?.receitas_com_historia) || 0,
    receitas_recentes: Number(stats?.receitas_recentes) || 0,
    dicas_recentes: Number(stats?.dicas_recentes) || 0,
    dicas_curtas: Number(stats?.dicas_curtas) || 0,
    dicas_longas: Number(stats?.dicas_longas) || 0,
    media_caracteres_dicas: Number(stats?.media_caracteres_dicas) || 0,
    total_ingredientes_unicos: Number(stats?.total_ingredientes_unicos) || 0,
    percentual_receitas_com_imagem:
      Number(stats?.percentual_receitas_com_imagem) || 0,
    percentual_receitas_com_historia:
      Number(stats?.percentual_receitas_com_historia) || 0,
  };

  const container = document.getElementById("estatisticas-container");
  container.innerHTML = `
    <!-- Métricas Principais -->
    <div class="stats-section">
      <h3>Métricas do Sistema</h3>
      <div class="stats-grid">
        <div class="stat-card primary">
          <div class="stat-number">${safeStats.total_receitas}</div>
          <div class="stat-label">Receitas Cadastradas</div>
        </div>
        <div class="stat-card secondary">
          <div class="stat-number">${safeStats.total_dicas}</div>
          <div class="stat-label">Dicas Publicadas</div>
        </div>
        <div class="stat-card info">
          <div class="stat-number">${
            safeStats.total_receitas + safeStats.total_dicas
          }</div>
          <div class="stat-label">Total de Conteúdo</div>
        </div>
      </div>
    </div>

    <!-- Análise de Qualidade -->
    <div class="stats-section">
      <h3>Indicadores de Qualidade</h3>
      <div class="stats-grid">
        <div class="stat-card success">
          <div class="stat-number">${safeStats.receitas_com_imagem}</div>
          <div class="stat-label">Receitas com Imagem</div>
          <div class="stat-percentage">${
            safeStats.percentual_receitas_com_imagem
          }%</div>
        </div>
        <div class="stat-card accent">
          <div class="stat-number">${safeStats.receitas_com_historia}</div>
          <div class="stat-label">Receitas Documentadas</div>
          <div class="stat-percentage">${
            safeStats.percentual_receitas_com_historia
          }%</div>
        </div>
        <div class="stat-card metric">
          <div class="stat-number">${safeStats.media_caracteres_dicas}</div>
          <div class="stat-label">Caracteres por Dica</div>
          <div class="stat-subtext">Média do conteúdo</div>
        </div>
      </div>
    </div>

    <!-- Ações do Sistema -->
    <div class="stats-section">
      <h3>Gerenciamento</h3>
      <div class="admin-actions-grid">
        <button class="admin-action-btn primary" data-action="nova-receita">
          <div class="action-content">
            <div class="action-title">Adicionar Receita</div>
            <div class="action-description">Cadastrar nova tradição culinária</div>
          </div>
        </button>
        <button class="admin-action-btn secondary" data-action="nova-dica">
          <div class="action-content">
            <div class="action-title">Publicar Dica</div>
            <div class="action-description">Compartilhar conhecimento</div>
          </div>
        </button>
      </div>
    </div>
  `;

  // Adicionar animações aos elementos
  const statCards = container.querySelectorAll(".stat-card");
  statCards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add("fade-in");
    }, index * 100);
  });

  // Adicionar event listeners para ações administrativas
  container.querySelectorAll(".admin-action-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const action = e.currentTarget.getAttribute("data-action");

      switch (action) {
        case "nova-receita":
          abrirModalNovaReceitaAdmin();
          break;
        case "nova-dica":
          abrirModalNovaDicaAdmin();
          break;
      }
    });
  });
}

// Função para navegar entre abas do dashboard
function navegarPara(aba) {
  const tabButton = document.querySelector(`[data-tab="${aba}"]`);
  if (tabButton) {
    tabButton.click();
    animarElemento(tabButton, "pulse-animation");
  }
}

function mostrarCarregamento(tipo, mostrar) {
  const loadingElement = document.getElementById(`loading-${tipo}`);
  if (loadingElement) {
    loadingElement.style.display = mostrar ? "block" : "none";
  }
}

// ========================================
// SISTEMA DE MENSAGENS E FEEDBACK VISUAL
// ========================================

// Sistema de notificações Toast melhorado
function mostrarMensagem(mensagem, tipo = "info", duracao = 4000) {
  // Use a função global se disponível, senão implementa localmente
  if (window.RaizesAmazonia?.UI?.showMessage) {
    return window.RaizesAmazonia.UI.showMessage(mensagem, tipo, duracao);
  }

  // Implementação local como fallback
  // Criar container de toasts se não existir
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  // Criar toast
  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;

  const toastId = "toast-" + Date.now();
  toast.id = toastId;

  // Definir ícones por tipo
  const icones = {
    success: "✓",
    error: "✗",
    warning: "!",
    info: "i",
  };

  const icone = icones[tipo] || "ℹ️";

  toast.innerHTML = `
    <div class="toast-header">
      <h4 class="toast-title">${icone} ${
    tipo.charAt(0).toUpperCase() + tipo.slice(1)
  }</h4>
      <button class="toast-close" data-toast-id="${toastId}">&times;</button>
    </div>
    <p class="toast-body">${mensagem}</p>
    <div class="toast-progress" id="progress-${toastId}"></div>
  `;

  // Adicionar event listener para fechar
  const closeButton = toast.querySelector(".toast-close");
  if (closeButton) {
    closeButton.addEventListener("click", () => fecharToast(toastId));
  }

  // Adicionar animação de entrada
  toast.classList.add("slide-in");
  toastContainer.appendChild(toast);

  // Animar barra de progresso
  const progressBar = document.getElementById(`progress-${toastId}`);
  setTimeout(() => {
    progressBar.style.width = "0%";
    progressBar.style.transition = `width ${duracao}ms linear`;
  }, 50);

  // Auto-remover após duração especificada
  const timeoutId = setTimeout(() => {
    fecharToast(toastId);
  }, duracao);

  // Pausar timer ao hover
  toast.addEventListener("mouseenter", () => {
    clearTimeout(timeoutId);
    progressBar.style.animationPlayState = "paused";
  });

  toast.addEventListener("mouseleave", () => {
    setTimeout(() => fecharToast(toastId), 1000);
  });

  console.log(`🔔 Mensagem ${tipo}: ${mensagem}`);
}

function fecharToast(toastId) {
  const toast = document.getElementById(toastId);
  if (toast) {
    toast.style.animation = "fadeOut 0.3s ease-in forwards";
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }
}

// Função para compatibilidade com código existente
function mostrarMensagemAdmin(mensagem, tipo = "info") {
  mostrarMensagem(mensagem, tipo);
}

// ========================================
// SISTEMA DE LOADING E FEEDBACK VISUAL
// ========================================

function mostrarCarregamento(secao, mostrar = true) {
  const elemento = document.getElementById(`loading-${secao}`);
  if (elemento) {
    if (mostrar) {
      elemento.style.display = "flex";
      elemento.classList.add("fade-in");
    } else {
      elemento.classList.remove("fade-in");
      setTimeout(() => {
        elemento.style.display = "none";
      }, 300);
    }
  }
}

function mostrarLoadingOverlay(mostrar = true) {
  let overlay = document.querySelector(".loading-overlay");

  if (mostrar) {
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "loading-overlay";
      overlay.innerHTML = `
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p style="color: white; margin-top: 1rem;">Processando...</p>
        </div>
      `;
      document.body.appendChild(overlay);
    }
    overlay.style.display = "flex";
  } else {
    if (overlay) {
      overlay.style.animation = "fadeOut 0.3s ease-out forwards";
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.remove();
        }
      }, 300);
    }
  }
}

// Estados visuais para botões
function setBotaoEstado(botaoOuId, estado, textoOriginal = null) {
  let botao;

  // Verificar se é um elemento HTML ou um ID/seletor
  if (typeof botaoOuId === "string") {
    // É um ID ou seletor
    botao =
      document.getElementById(botaoOuId) || document.querySelector(botaoOuId);
  } else if (botaoOuId && botaoOuId.nodeType === Node.ELEMENT_NODE) {
    // É um elemento HTML
    botao = botaoOuId;
  }

  if (!botao) {
    console.log("❌ Botão não encontrado:", botaoOuId);
    return;
  }

  // Salvar texto original se fornecido
  if (textoOriginal) {
    botao.dataset.textoOriginal = textoOriginal;
  }

  const textoSalvo = botao.dataset.textoOriginal || botao.textContent;

  switch (estado) {
    case "loading":
      botao.classList.add("btn-loading");
      botao.disabled = true;
      break;

    case "success":
      botao.classList.remove("btn-loading");
      botao.classList.add("success-state");
      botao.textContent = "✅ Sucesso!";
      botao.disabled = false;
      setTimeout(() => {
        botao.classList.remove("success-state");
        botao.textContent = textoSalvo;
      }, 2000);
      break;

    case "error":
      botao.classList.remove("btn-loading");
      botao.classList.add("error-state");
      botao.textContent = "❌ Erro";
      botao.disabled = false;
      setTimeout(() => {
        botao.classList.remove("error-state");
        botao.textContent = textoSalvo;
      }, 2000);
      break;

    default:
      botao.classList.remove("btn-loading", "success-state", "error-state");
      botao.textContent = textoSalvo;
      botao.disabled = false;
  }
}

// Animações para elementos
function animarElemento(elemento, animacao = "fade-in") {
  if (typeof elemento === "string") {
    elemento = document.querySelector(elemento);
  }

  if (elemento) {
    elemento.classList.add(animacao);
    elemento.addEventListener(
      "animationend",
      () => {
        elemento.classList.remove(animacao);
      },
      { once: true }
    );
  }
}

// ========================================
// CRUD DE RECEITAS
// ========================================

// Variável global para armazenar o ID da receita sendo editada
let receitaEditandoId = null;

// Função para carregar e exibir receitas no painel admin
async function carregarReceitasAdmin() {
  const container = document.getElementById("receitas-lista");

  if (!container) {
    console.error("Container receitas-lista não encontrado");
    return;
  }

  mostrarCarregamento("receitas", true);

  try {
    const response = await fetch(`${API_BASE_URL}/api/receitas`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const receitas = await response.json();
    renderizarReceitasAdmin(receitas);
    atualizarEstatisticasReceitas(receitas);
  } catch (error) {
    console.error("Erro ao carregar receitas:", error);
    mostrarMensagemAdmin(
      "Erro ao carregar receitas. Verifique se o backend está rodando.",
      "error"
    );
    mostrarErroConexaoAdmin();
  } finally {
    mostrarCarregamento("receitas", false);
  }
}

// Função para renderizar receitas na interface admin
function renderizarReceitasAdmin(todasReceitas) {
  const container = document.getElementById("receitas-lista");

  // Atualizar dados na paginação
  paginacao.receitas.dados = todasReceitas || [];
  paginacao.receitas.totalItens = paginacao.receitas.dados.length;

  if (!todasReceitas || todasReceitas.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Nenhuma receita encontrada</h3>
        <p>Comece adicionando sua primeira receita amazônica!</p>
        <button id="btn-primeira-receita" class="btn-primary">
          ➕ Adicionar Primeira Receita
        </button>
      </div>
    `;

    // Adicionar event listener para o botão da primeira receita
    const btnPrimeiraReceita = document.getElementById("btn-primeira-receita");
    if (btnPrimeiraReceita) {
      btnPrimeiraReceita.addEventListener("click", abrirModalNovaReceitaAdmin);
    }
    return;
  }

  // Obter receitas da página atual
  const receitasPagina = obterItensPaginaAtual("receitas");

  // Limpar container
  container.innerHTML = "";

  // Criar container para as receitas
  const receitasContainer = document.createElement("div");
  receitasContainer.className = "lista-items";

  receitasPagina.forEach((receita) => {
    const receitaCard = document.createElement("div");
    receitaCard.className = "item-card receita-card";
    receitaCard.setAttribute("data-receita-id", receita.id);

    receitaCard.innerHTML = `
      <h3>${receita.nome}</h3>
      <p class="receita-descricao">${receita.descricao}</p>
      <div class="receita-meta">
        <span class="receita-data">${formatarDataSegura(
          receita.created_at
        )}</span>
        ${
          receita.imagem
            ? '<span class="receita-imagem">🖼️ Com imagem</span>'
            : '<span class="receita-sem-imagem">Sem imagem</span>'
        }
      </div>
      <div class="card-actions">
        <button class="btn-secondary btn-view" title="Visualizar" data-action="view" data-id="${
          receita.id
        }">
          Ver
        </button>
        <button class="btn-primary btn-edit" title="Editar" data-action="edit" data-id="${
          receita.id
        }">
          Editar
        </button>
        <button class="btn-danger btn-delete" title="Excluir" data-action="delete" data-id="${
          receita.id
        }">
          Excluir
        </button>
      </div>
    `;

    receitasContainer.appendChild(receitaCard);

    // Adicionar event listeners para os botões de ação
    const btnView = receitaCard.querySelector('[data-action="view"]');
    const btnEdit = receitaCard.querySelector('[data-action="edit"]');
    const btnDelete = receitaCard.querySelector('[data-action="delete"]');

    if (btnView) {
      btnView.addEventListener("click", () => verReceitaDetalhes(receita.id));
    }

    if (btnEdit) {
      btnEdit.addEventListener("click", () => editarReceitaAdmin(receita.id));
    }

    if (btnDelete) {
      btnDelete.addEventListener("click", () =>
        deletarReceitaAdmin(receita.id)
      );
    }

    // Adicionar animação de entrada
    setTimeout(() => {
      receitaCard.classList.add("fade-in");
    }, 50);
  });

  // Adicionar container de receitas
  container.appendChild(receitasContainer);

  // Adicionar paginação
  const paginacaoHTML = gerarPaginacao("receitas");
  if (paginacaoHTML) {
    container.insertAdjacentHTML("beforeend", paginacaoHTML);
  }
}

// Função para abrir modal de nova receita
function abrirModalNovaReceitaAdmin() {
  console.log("🟢 Abrindo modal de nova receita...");

  // Limpar o formulário
  const form = document.getElementById("form-nova-receita");
  if (form) {
    console.log("✅ Formulário encontrado, limpando...");
    form.reset();
  } else {
    console.log("❌ Formulário não encontrado");
  }

  // Limpar preview de imagem
  const previewContainer = document.getElementById("preview-container");
  const imagemInput = document.getElementById("imagem");

  if (previewContainer) {
    previewContainer.style.display = "none";
  }
  if (imagemInput) {
    imagemInput.value = "";
  }

  console.log("🔵 Abrindo modal...");
  abrirModal("modal-nova-receita");
}

// Função para adicionar nova receita
async function adicionarReceita(event) {
  console.log("🟢 Função adicionarReceita chamada");
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;

  console.log("Validando campos...");
  // Validar campos obrigatórios
  const nome = formData.get("nome")?.trim();
  const descricao = formData.get("descricao")?.trim();
  const ingredientes = formData.get("ingredientes")?.trim();
  const modoPreparo = formData.get("modo_preparo")?.trim();

  console.log("Dados do formulário:", {
    nome,
    descricao,
    ingredientes,
    modoPreparo,
  });

  if (!nome || !descricao || !ingredientes || !modoPreparo) {
    console.log("❌ Campos obrigatórios não preenchidos");
    mostrarMensagemAdmin(
      "Por favor, preencha todos os campos obrigatórios.",
      "error"
    );
    animarElemento(form, "shake-animation");
    return;
  }

  // Mostrar estado de carregamento
  setBotaoEstado(submitButton, "loading", originalText);
  mostrarLoadingOverlay(true);

  try {
    const response = await fetch(`${API_BASE_URL}/api/receitas`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    const receita = await response.json();

    // Feedback de sucesso
    setBotaoEstado(submitButton, "success", originalText);
    mostrarMensagem("Receita criada com sucesso!", "success");

    // Animar o fechamento do modal
    const modal = document.getElementById("modal-nova-receita");
    if (modal) {
      animarElemento(modal, "bounce-animation");
      setTimeout(() => {
        fecharModal("modal-nova-receita");
      }, 600);
    }

    // Recarregar dados com animação
    await carregarReceitasAdmin();
  } catch (error) {
    console.error("Erro ao criar receita:", error);
    setBotaoEstado(submitButton, "error", originalText);
    mostrarMensagem("Erro ao criar receita: " + error.message, "error");
    animarElemento(form, "shake-animation");
  } finally {
    mostrarLoadingOverlay(false);
    setTimeout(() => {
      setBotaoEstado(submitButton, "normal", originalText);
    }, 2000);
  }
}

// Função para editar receita
function editarReceitaAdmin(id) {
  fetch(`${API_BASE_URL}/api/receitas/${id}`)
    .then((response) => response.json())
    .then((receita) => {
      abrirModalEditarReceitaAdmin(receita);
    })
    .catch((error) => {
      console.error("Erro ao carregar receita para edição:", error);
      mostrarMensagemAdmin("Erro ao carregar receita", "error");
    });
}

// Função para abrir modal de edição
function abrirModalEditarReceitaAdmin(receita) {
  receitaEditandoId = receita.id;

  document.getElementById("edit-nome").value = receita.nome;
  document.getElementById("edit-descricao").value = receita.descricao;
  document.getElementById("edit-ingredientes").value = receita.ingredientes;
  document.getElementById("edit-modo_preparo").value = receita.modo_preparo;
  document.getElementById("edit-historia").value = receita.historia || "";

  // Limpar preview de imagem
  document.getElementById("edit-preview-container").style.display = "none";
  document.getElementById("edit-imagem").value = "";

  abrirModal("modal-editar-receita");
}

// Função para salvar edição de receita
async function salvarEdicaoReceita(event) {
  event.preventDefault();

  if (!receitaEditandoId) return;

  const formData = new FormData();
  formData.append("nome", document.getElementById("edit-nome").value);
  formData.append("descricao", document.getElementById("edit-descricao").value);
  formData.append(
    "ingredientes",
    document.getElementById("edit-ingredientes").value
  );
  formData.append(
    "modo_preparo",
    document.getElementById("edit-modo_preparo").value
  );
  formData.append("historia", document.getElementById("edit-historia").value);

  const imagemFile = document.getElementById("edit-imagem").files[0];
  if (imagemFile) {
    formData.append("imagem", imagemFile);
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/receitas/${receitaEditandoId}`,
      {
        method: "PUT",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    mostrarMensagemAdmin("Receita atualizada com sucesso!", "success");
    fecharModal("modal-editar-receita");
    carregarReceitasAdmin();
    receitaEditandoId = null;
  } catch (error) {
    console.error("Erro ao atualizar receita:", error);
    mostrarMensagemAdmin("Erro ao atualizar receita", "error");
  }
}

// Função para deletar receita
async function deletarReceitaAdmin(id) {
  try {
    // Carregar dados da receita para mostrar no modal de confirmação
    const receita = await fetch(`${API_BASE_URL}/api/receitas/${id}`).then(
      (r) => r.json()
    );

    // Criar modal de confirmação personalizado
    const modalConfirm = document.createElement("div");
    modalConfirm.className = "modal-overlay";
    modalConfirm.innerHTML = `
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h3>Confirmar Exclusão</h3>
        </div>
        <div class="modal-body">
          <div class="confirm-content">
            <div class="receita-preview">
              ${
                receita.imagem
                  ? `<img src="${API_BASE_URL}${receita.imagem}" alt="${receita.nome}" class="preview-img">`
                  : `<div class="preview-placeholder" style="width: 100px; height: 100px; border-radius: 8px; background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%); display: flex; align-items: center; justify-content: center; color: #999; font-size: 12px; border: 2px dashed #ccc; margin: 0 auto 10px;">SEM IMAGEM</div>`
              }
              <h4>${receita.nome}</h4>
              <p>${receita.descricao}</p>
            </div>
            <div class="warning-text">
              <p><strong>Atenção:</strong> Esta ação não pode ser desfeita!</p>
              <p>Todos os dados da receita serão perdidos permanentemente.</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" data-action="fechar-confirm">❌ Cancelar</button>
          <button class="btn-danger" data-action="confirmar-exclusao" data-receita-id="${id}">Excluir Receita</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalConfirm);
    animarElemento(modalConfirm, "fade-in");

    // Adicionar event listeners para os botões do modal
    const btnFechar = modalConfirm.querySelector(
      '[data-action="fechar-confirm"]'
    );
    const btnConfirmar = modalConfirm.querySelector(
      '[data-action="confirmar-exclusao"]'
    );

    if (btnFechar) {
      btnFechar.addEventListener("click", fecharModalConfirm);
    }

    if (btnConfirmar) {
      btnConfirmar.addEventListener("click", () => {
        const receitaId = btnConfirmar.getAttribute("data-receita-id");
        confirmarExclusaoReceita(receitaId);
      });
    }
  } catch (error) {
    console.error("Erro ao carregar receita para confirmação:", error);
    // Fallback para confirmação simples
    if (confirm("Tem certeza que deseja excluir esta receita?")) {
      await confirmarExclusaoReceita(id);
    }
  }
}

// Função para confirmar exclusão de receita
async function confirmarExclusaoReceita(id) {
  mostrarLoadingOverlay(true);

  try {
    const response = await fetch(`${API_BASE_URL}/api/receitas/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    mostrarMensagem("Receita excluída com sucesso!", "success");
    fecharModalConfirm();
    await carregarReceitasAdmin();

    // Animar a remoção
    const receitaCard = document.querySelector(`[data-receita-id="${id}"]`);
    if (receitaCard) {
      animarElemento(receitaCard, "fadeOut");
      setTimeout(() => {
        if (receitaCard.parentNode) {
          receitaCard.remove();
        }
      }, 300);
    }
  } catch (error) {
    console.error("Erro ao deletar receita:", error);
    mostrarMensagem("Erro ao deletar receita", "error");
  } finally {
    mostrarLoadingOverlay(false);
  }
}

// Função para fechar modal de confirmação
function fecharModalConfirm() {
  const modal = document.querySelector(".modal-overlay");
  if (modal) {
    modal.style.animation = "fadeOut 0.3s ease-out forwards";
    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove();
      }
    }, 300);
  }
}

// Função para atualizar estatísticas de receitas
function atualizarEstatisticasReceitas(receitas) {
  const totalReceitas = receitas.length;
  const receitasComImagem = receitas.filter((r) => r.imagem).length;

  // Calcular percentual de receitas com imagem
  const percentualComImagem =
    totalReceitas > 0
      ? Math.round((receitasComImagem / totalReceitas) * 100)
      : 0;

  // Receitas recentes (últimos 7 dias) - usar a mesma lógica das estatísticas gerais
  const agora = new Date();
  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(agora.getDate() - 7);
  seteDiasAtras.setHours(0, 0, 0, 0); // Início do dia há 7 dias

  console.log("🔍 DEBUG RECEITAS - Data atual:", agora.toLocaleDateString());
  console.log(
    "🔍 DEBUG RECEITAS - Sete dias atrás:",
    seteDiasAtras.toLocaleDateString()
  );
  console.log("🔍 DEBUG RECEITAS - Total de receitas:", receitas.length);

  const receitasRecentes = receitas.filter((receita) => {
    if (!receita || !receita.created_at) {
      console.log(
        "🔍 DEBUG RECEITAS - Receita sem data:",
        receita?.nome || "Nome não disponível"
      );
      return false;
    }

    try {
      const dataReceita = new Date(receita.created_at);

      if (isNaN(dataReceita.getTime())) {
        console.log(
          "🔍 DEBUG RECEITAS - Data inválida:",
          receita.nome,
          receita.created_at
        );
        return false;
      }

      const isRecente = dataReceita >= seteDiasAtras;
      console.log(
        `🔍 DEBUG RECEITAS - ${
          receita.nome
        }: ${dataReceita.toLocaleDateString()} >= ${seteDiasAtras.toLocaleDateString()} = ${isRecente}`
      );
      return isRecente;
    } catch (error) {
      console.log(
        "🔍 DEBUG RECEITAS - Erro ao processar receita:",
        receita.nome,
        error
      );
      return false;
    }
  }).length;

  console.log(
    "🔍 DEBUG RECEITAS - TOTAL RECENTES ENCONTRADAS:",
    receitasRecentes
  );

  // Atualizar elementos no DOM
  document.getElementById("total-receitas").textContent = totalReceitas;
  document.getElementById("receitas-com-imagem").textContent =
    receitasComImagem;

  // Adicionar percentual se o elemento existir
  const percentualElement = document.getElementById(
    "percentual-receitas-imagem"
  );
  if (percentualElement) {
    percentualElement.textContent = `${percentualComImagem}%`;
  }

  // Adicionar receitas recentes se o elemento existir
  const recentesElement = document.getElementById("receitas-recentes");
  if (recentesElement) {
    recentesElement.textContent = receitasRecentes;
  }
}

// ========================================
// CRUD DE DICAS
// ========================================

// Variável global para armazenar o ID da dica sendo editada
let dicaEditandoId = null;

// Função para carregar e exibir dicas no painel admin
async function carregarDicasAdmin() {
  const container = document.getElementById("dicas-lista");

  if (!container) {
    console.error("Container dicas-lista não encontrado");
    return;
  }

  mostrarLoadingDicas(true);

  try {
    const response = await fetch(`${API_BASE_URL}/api/dicas`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const dicas = await response.json();
    renderizarDicasAdmin(dicas);
    atualizarEstatisticasDicas(dicas);
  } catch (error) {
    console.error("Erro ao carregar dicas:", error);

    // Verificar se é erro de conexão
    const isConnectionError =
      error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError") ||
      error.message.includes("ERR_CONNECTION") ||
      !navigator.onLine;

    if (isConnectionError) {
      mostrarErroConexaoDicas();
    } else {
      mostrarMensagemAdmin(
        "Erro ao carregar dicas. Verifique se o backend está rodando.",
        "error"
      );
    }
  } finally {
    mostrarLoadingDicas(false);
  }
}

// Função para renderizar dicas na interface admin
function renderizarDicasAdmin(todasDicas) {
  const container = document.getElementById("dicas-lista");

  // Atualizar dados na paginação
  paginacao.dicas.dados = todasDicas || [];
  paginacao.dicas.totalItens = paginacao.dicas.dados.length;

  if (!todasDicas || todasDicas.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Nenhuma dica encontrada</h3>
        <p>Comece adicionando sua primeira dica culinária!</p>
        <button id="btn-cadastrar-primeira-dica" class="btn-primary">
          ➕ Adicionar Primeira Dica
        </button>
      </div>
    `;

    // Adicionar event listener para o botão da primeira dica
    const btnPrimeiraDica = document.getElementById(
      "btn-cadastrar-primeira-dica"
    );
    if (btnPrimeiraDica) {
      btnPrimeiraDica.addEventListener("click", abrirModalNovaDicaAdmin);
    }
    return;
  }

  // Obter dicas da página atual
  const dicasPagina = obterItensPaginaAtual("dicas");

  // Limpar container
  container.innerHTML = "";

  // Criar container para as dicas
  const dicasContainer = document.createElement("div");
  dicasContainer.className = "lista-items";

  dicasPagina.forEach((dica) => {
    const dataFormatada = formatarDataSegura(
      dica.created_at,
      true // incluir hora
    );

    const tamanhoTexto = (dica.texto || dica.conteudo || "").length;
    let tamanhoLabel = "";

    if (tamanhoTexto > 200) {
      tamanhoLabel = "Muito longa";
    } else if (tamanhoTexto > 100) {
      tamanhoLabel = "Longa";
    } else {
      tamanhoLabel = "Curta";
    }

    // Truncar texto se muito longo para preview
    const textoCompleto = dica.texto || dica.conteudo || "";
    const textoPreview =
      tamanhoTexto > 150
        ? textoCompleto.substring(0, 150) + "..."
        : textoCompleto;

    const dicaCard = document.createElement("div");
    dicaCard.className = "item-card dica-card";
    dicaCard.setAttribute("data-dica-id", dica.id);

    dicaCard.innerHTML = `
      <h3>Dica #${String(dica.id).substring(0, 8)}</h3>
      <p class="dica-texto">${textoPreview}</p>
      <div class="dica-meta">
        <span class="dica-data">${dataFormatada}</span>
        <span class="dica-tamanho">${tamanhoLabel} (${tamanhoTexto} caracteres)</span>
      </div>
      <div class="card-actions">
        <button class="btn-primary btn-edit" title="Editar" data-action="edit" data-id="${
          dica.id
        }">
          Editar
        </button>
        <button class="btn-danger btn-delete" title="Excluir" data-action="delete" data-id="${
          dica.id
        }">
          Excluir
        </button>
      </div>
    `;

    dicasContainer.appendChild(dicaCard);

    // Adicionar event listeners para os botões de ação
    const btnEdit = dicaCard.querySelector('[data-action="edit"]');
    const btnDelete = dicaCard.querySelector('[data-action="delete"]');

    if (btnEdit) {
      btnEdit.addEventListener("click", () => editarDicaAdmin(dica.id));
    }

    if (btnDelete) {
      btnDelete.addEventListener("click", () => deletarDicaAdmin(dica.id));
    }

    // Adicionar animação de entrada
    setTimeout(() => {
      dicaCard.classList.add("fade-in");
    }, 50);
  });

  // Adicionar container de dicas
  container.appendChild(dicasContainer);

  // Adicionar paginação
  const paginacaoHTML = gerarPaginacao("dicas");
  if (paginacaoHTML) {
    container.insertAdjacentHTML("beforeend", paginacaoHTML);
  }
}

// Função para abrir modal de nova dica
function abrirModalNovaDicaAdmin() {
  console.log("🟢 Abrindo modal de nova dica...");

  // Limpar o formulário
  const form = document.getElementById("form-nova-dica");
  if (form) {
    console.log("✅ Formulário encontrado, limpando...");
    form.reset();
  } else {
    console.log("❌ Formulário não encontrado");
  }

  console.log("🔵 Abrindo modal...");
  abrirModal("modal-nova-dica");
}

// Função para adicionar nova dica
async function adicionarDica(event) {
  console.log("🟢 Função adicionarDica chamada");
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  const textoInput =
    form.querySelector('input[name="texto"]') ||
    form.querySelector('textarea[name="texto"]');

  console.log("Validando campo texto...");
  // Validar campo obrigatório
  const texto = formData.get("texto")?.trim();
  console.log("Texto da dica:", texto);

  if (!texto) {
    console.log("❌ Texto da dica não preenchido");
    mostrarMensagem("Por favor, digite o texto da dica.", "error");
    animarElemento(textoInput, "shake-animation");
    textoInput.focus();
    return;
  }

  if (texto.length < 10) {
    console.log("❌ Texto da dica muito curto");
    mostrarMensagem("A dica deve ter pelo menos 10 caracteres.", "error");
    animarElemento(textoInput, "shake-animation");
    textoInput.focus();
    return;
  }

  // Mostrar loading com feedback visual
  setBotaoEstado(submitButton, "loading", originalText);
  mostrarLoadingOverlay(true);

  try {
    const formData = new FormData();
    formData.append("texto", texto);

    const response = await fetch(`${API_BASE_URL}/api/dicas`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    const dica = await response.json();

    // Feedback de sucesso
    setBotaoEstado(submitButton, "success", originalText);
    mostrarMensagem("Dica criada com sucesso!", "success");

    // Animar fechamento do modal
    const modal = document.getElementById("modal-nova-dica");
    if (modal) {
      animarElemento(modal, "bounce-animation");
      setTimeout(() => {
        fecharModal("modal-nova-dica");
      }, 600);
    }

    // Recarregar dados
    await carregarDicasAdmin();
  } catch (error) {
    console.error("Erro ao criar dica:", error);
    setBotaoEstado(submitButton, "error", originalText);
    mostrarMensagem("Erro ao criar dica: " + error.message, "error");
    animarElemento(form, "shake-animation");
  } finally {
    mostrarLoadingOverlay(false);
    setTimeout(() => {
      setBotaoEstado(submitButton, "normal", originalText);
    }, 2000);
  }
}

// Função para editar dica
function editarDicaAdmin(id) {
  fetch(`${API_BASE_URL}/api/dicas`)
    .then((response) => response.json())
    .then((dicas) => {
      const dica = dicas.find((d) => d.id === id);
      if (dica) {
        abrirModalEditarDicaAdmin(dica);
      } else {
        mostrarMensagemAdmin("Dica não encontrada", "error");
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar dica para edição:", error);
      mostrarMensagemAdmin("Erro ao carregar dica", "error");
    });
}

// Função para abrir modal de edição
function abrirModalEditarDicaAdmin(dica) {
  dicaEditandoId = dica.id;

  document.getElementById("edit-texto-dica").value = dica.texto;

  abrirModal("modal-editar-dica");
}

// Função para salvar edição de dica
async function salvarEdicaoDica(event) {
  event.preventDefault();

  if (!dicaEditandoId) return;

  const texto = document.getElementById("edit-texto-dica").value.trim();

  if (!texto) {
    mostrarMensagemAdmin("Por favor, digite o texto da dica.", "error");
    return;
  }

  if (texto.length < 10) {
    mostrarMensagemAdmin("A dica deve ter pelo menos 10 caracteres.", "error");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("texto", texto);

    const response = await fetch(
      `${API_BASE_URL}/api/dicas/${dicaEditandoId}`,
      {
        method: "PUT",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    mostrarMensagemAdmin("Dica atualizada com sucesso!", "success");
    fecharModal("modal-editar-dica");
    carregarDicasAdmin();
    dicaEditandoId = null;
  } catch (error) {
    console.error("Erro ao atualizar dica:", error);
    mostrarMensagemAdmin("Erro ao atualizar dica", "error");
  }
}

// Função para deletar dica
async function deletarDicaAdmin(id) {
  // Buscar o texto da dica para confirmação
  try {
    const response = await fetch(`${API_BASE_URL}/api/dicas`);
    const dicas = await response.json();
    const dica = dicas.find((d) => d.id === id);

    if (!dica) {
      mostrarMensagemAdmin("Dica não encontrada", "error");
      return;
    }

    const textoPreview =
      dica.texto.length > 50 ? dica.texto.substring(0, 50) + "..." : dica.texto;

    if (
      !confirm(`Tem certeza que deseja excluir esta dica?\n\n"${textoPreview}"`)
    ) {
      return;
    }

    const deleteResponse = await fetch(`${API_BASE_URL}/api/dicas/${id}`, {
      method: "DELETE",
    });

    if (!deleteResponse.ok) {
      throw new Error(`HTTP ${deleteResponse.status}`);
    }

    mostrarMensagemAdmin("Dica excluída com sucesso!", "success");
    carregarDicasAdmin();
  } catch (error) {
    console.error("Erro ao deletar dica:", error);
    mostrarMensagemAdmin("Erro ao deletar dica", "error");
  }
}

// Função para atualizar estatísticas de dicas
function atualizarEstatisticasDicas(dicas) {
  const totalDicas = dicas.length;

  // Dicas recentes (últimos 7 dias) - usar a mesma lógica das estatísticas gerais
  const agora = new Date();
  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(agora.getDate() - 7);
  seteDiasAtras.setHours(0, 0, 0, 0); // Início do dia há 7 dias

  console.log("🔍 DEBUG DICAS - Data atual:", agora.toLocaleDateString());
  console.log(
    "🔍 DEBUG DICAS - Sete dias atrás:",
    seteDiasAtras.toLocaleDateString()
  );
  console.log("🔍 DEBUG DICAS - Total de dicas:", dicas.length);

  const dicasRecentes = dicas.filter((dica) => {
    if (!dica || !dica.created_at) {
      console.log(
        "🔍 DEBUG DICAS - Dica sem data:",
        dica?.texto?.substring(0, 30) || "Texto não disponível"
      );
      return false;
    }

    try {
      const dataDica = new Date(dica.created_at);

      if (isNaN(dataDica.getTime())) {
        console.log(
          "🔍 DEBUG DICAS - Data inválida:",
          dica.texto?.substring(0, 30),
          dica.created_at
        );
        return false;
      }

      const isRecente = dataDica >= seteDiasAtras;
      console.log(
        `🔍 DEBUG DICAS - ${dica.texto?.substring(
          0,
          30
        )}...: ${dataDica.toLocaleDateString()} >= ${seteDiasAtras.toLocaleDateString()} = ${isRecente}`
      );
      return isRecente;
    } catch (error) {
      console.log(
        "🔍 DEBUG DICAS - Erro ao processar dica:",
        dica.texto?.substring(0, 30),
        error
      );
      return false;
    }
  }).length;

  console.log("🔍 DEBUG DICAS - TOTAL RECENTES ENCONTRADAS:", dicasRecentes);

  // Atualizar elementos no DOM
  const totalElement = document.getElementById("total-dicas");
  const recentesElement = document.getElementById("dicas-recentes");

  if (totalElement) totalElement.textContent = totalDicas;
  if (recentesElement) recentesElement.textContent = dicasRecentes;
}

// Função para mostrar loading de dicas
function mostrarLoadingDicas(mostrar) {
  mostrarCarregamento("dicas", mostrar);
}

// Função para mostrar erro de conexão de dicas
function mostrarErroConexaoDicas() {
  const container = document.getElementById("dicas-lista");
  container.innerHTML = `
    <div class="erro-conexao">
      <div class="erro-content">
        <h3>Erro de Conexão</h3>
        <p>Não foi possível conectar com o servidor.</p>
        <p>Certifique-se de que o backend está rodando em <code>http://localhost:8000</code></p>
        <button onclick="carregarDicasAdmin()" class="btn-retry">Tentar Novamente</button>
      </div>
    </div>
  `;
}

// ========================================
// FUNÇÕES AUXILIARES PARA MODAIS
// ========================================

// Função para abrir modal
function abrirModal(modalId) {
  console.log(`🔵 Tentando abrir modal: ${modalId}`);
  const modal = document.getElementById(modalId);
  if (modal) {
    console.log(`✅ Modal encontrado: ${modalId}`);
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    console.log(`✅ Modal aberto: ${modalId}`);
  } else {
    console.log(`❌ Modal não encontrado: ${modalId}`);
  }
}

// Função para fechar modal
function fecharModal(modalId) {
  console.log(`🔴 Tentando fechar modal: ${modalId}`);
  const modal = document.getElementById(modalId);
  if (modal) {
    console.log(`✅ Modal encontrado, fechando: ${modalId}`);
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    console.log(`✅ Modal fechado: ${modalId}`);
  } else {
    console.log(`❌ Modal não encontrado para fechar: ${modalId}`);
  }
}

// Preview de imagem para nova receita
function previewImage(event) {
  const file = event.target.files[0];
  const container = document.getElementById("preview-container");
  const img = document.getElementById("preview-image");

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      img.src = e.target.result;
      container.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    container.style.display = "none";
  }
}

// Preview de imagem para edição
function previewEditImage(event) {
  const file = event.target.files[0];
  const container = document.getElementById("edit-preview-container");
  const img = document.getElementById("edit-preview-image");

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      img.src = e.target.result;
      container.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    container.style.display = "none";
  }
}

// Função para ver detalhes da receita
function verReceitaDetalhesAdmin(id) {
  window.open(`receita.html?id=${id}`, "_blank");
}

// Função para mostrar loading
function mostrarLoading(mostrar) {
  const container = document.getElementById("receitas-lista");
  if (!container) return;

  if (mostrar) {
    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Carregando receitas...</p>
      </div>
    `;
  }
}

// Função para mostrar erro de conexão
function mostrarErroConexaoAdmin() {
  const container = document.getElementById("receitas-lista");
  container.innerHTML = `
    <div class="erro-conexao">
      <div class="erro-content">
        <h3>Erro de Conexão</h3>
        <p>Não foi possível conectar com o servidor.</p>
        <p>Certifique-se de que o backend está rodando em <code>http://localhost:8000</code></p>
        <button onclick="carregarReceitasAdmin()" class="btn-retry">Tentar Novamente</button>
      </div>
    </div>
  `;
}

// ========================================
// FUNÇÕES DE TESTE E DEBUG
// ========================================

// Função para testar conexão com API
async function testarConexaoAPI() {
  console.log("🔗 Testando conexão com API...");

  try {
    const response = await fetch(`${API_BASE_URL}/`);
    const data = await response.text();
    console.log("✅ Conexão OK:", data);
    mostrarMensagemAdmin("✅ Conexão com API estabelecida!", "success");
    return true;
  } catch (error) {
    console.error("❌ Erro de conexão:", error);
    mostrarMensagemAdmin(
      "❌ Erro de conexão com API: " + error.message,
      "error"
    );
    return false;
  }
}

// Função para testar carregamento de receitas
async function testarCarregamentoReceitas() {
  console.log("📖 Testando carregamento de receitas...");

  try {
    const response = await fetch(`${API_BASE_URL}/api/receitas`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const receitas = await response.json();
    console.log("✅ Receitas carregadas:", receitas.length);
    mostrarMensagemAdmin(
      `✅ ${receitas.length} receita(s) encontrada(s)`,
      "success"
    );
    return receitas;
  } catch (error) {
    console.error("❌ Erro ao carregar receitas:", error);
    mostrarMensagemAdmin(
      "❌ Erro ao carregar receitas: " + error.message,
      "error"
    );
    return [];
  }
}

// Função para testar carregamento de dicas
async function testarCarregamentoDicas() {
  console.log("Testando carregamento de dicas...");

  try {
    const response = await fetch(`${API_BASE_URL}/api/dicas`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const dicas = await response.json();
    console.log("✅ Dicas carregadas:", dicas.length);
    mostrarMensagemAdmin(`✅ ${dicas.length} dica(s) encontrada(s)`, "success");
    return dicas;
  } catch (error) {
    console.error("❌ Erro ao carregar dicas:", error);
    mostrarMensagemAdmin(
      "❌ Erro ao carregar dicas: " + error.message,
      "error"
    );
    return [];
  }
}

// ========================================
// FUNÇÕES DE DEBUG E TESTE
// ========================================

// Função para testar manualmente os event listeners
function testarEventListeners() {
  console.log("🧪 Testando event listeners...");

  // Testar formulários
  const formNovaReceita = document.getElementById("form-nova-receita");
  const formNovaDica = document.getElementById("form-nova-dica");

  console.log("📋 Formulários encontrados:");
  console.log("- Nova receita:", formNovaReceita ? "SIM" : "NÃO");
  console.log("- Nova dica:", formNovaDica ? "SIM" : "NÃO");

  // Testar botões de fechar
  const botoesFechar = document.querySelectorAll("[data-close-modal]");
  console.log(`🔘 Botões de fechar encontrados: ${botoesFechar.length}`);

  // Testar botões principais
  const btnNovaReceita = document.getElementById("btn-nova-receita");
  const btnNovaDica = document.getElementById("btn-nova-dica");

  console.log("🔘 Botões principais encontrados:");
  console.log("- Nova receita:", btnNovaReceita ? "SIM" : "NÃO");
  console.log("- Nova dica:", btnNovaDica ? "SIM" : "NÃO");

  return {
    formNovaReceita,
    formNovaDica,
    botoesFechar: botoesFechar.length,
    btnNovaReceita,
    btnNovaDica,
  };
}

// Função para reconfigurar tudo manualmente
function reconfigurarTudo() {
  console.log("🔧 Reconfigurando todos os event listeners...");

  // Reconfigurar botões principais
  setTimeout(() => {
    configurarEventos();
    configurarFormularios();
    configurarBotoesFecharModal();
    configurarPreviewsImagem();
    console.log("✅ Reconfiguração completa!");
  }, 500);
}

// Expor funções no console para debug
window.adminDebug = {
  testar: testarEventListeners,
  reconfigurar: reconfigurarTudo,
  abrirReceita: () => abrirModalNovaReceitaAdmin(),
  abrirDica: () => abrirModalNovaDicaAdmin(),
};

// ========================================
// FUNÇÕES GLOBAIS (para compatibilidade)
// ========================================
window.mostrarMensagem = mostrarMensagem;
window.logout = logout;

// Alias para compatibilidade
window.mostrarMensagemAdmin = mostrarMensagem;

// ========================================
// LOG DE INICIALIZAÇÃO
// ========================================
console.log(`
🌿 ====================================
   PAINEL ADMINISTRATIVO
   Raízes da Amazônia
   Versão: 1.0.0
   Ambiente: ${API_BASE_URL}
==================================== 🌿
`);

// Função para configurar botões de fechar modal
function configurarBotoesFecharModal() {
  console.log("🔧 Configurando botões de fechar modal...");

  // Aguardar um pouco para garantir que o DOM está completamente carregado
  setTimeout(() => {
    // Botões de fechar modal com data-close-modal
    const botoesFechar = document.querySelectorAll("[data-close-modal]");
    console.log(`📋 Encontrados ${botoesFechar.length} botões de fechar modal`);

    botoesFechar.forEach((btn, index) => {
      const modalId = btn.getAttribute("data-close-modal");
      console.log(`🔧 Configurando botão ${index + 1} para modal: ${modalId}`);

      btn.addEventListener("click", (e) => {
        console.log(`� Clique no botão fechar modal: ${modalId}`);
        fecharModal(modalId);
      });
    });

    // Configurar fechamento ao clicar fora do modal (remover listener anterior se existir)
    document.removeEventListener("click", fecharModalAoClicarFora);
    document.addEventListener("click", fecharModalAoClicarFora);

    console.log("✅ Botões de fechar modal configurados");
  }, 100);
}

// Função separada para fechar modal ao clicar fora
function fecharModalAoClicarFora(event) {
  if (event.target.classList.contains("modal-overlay")) {
    const modal = event.target;
    console.log("🔴 Fechando modal ao clicar fora");
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

// Função para configurar previews de imagem
function configurarPreviewsImagem() {
  console.log("🖼️ Configurando previews de imagem...");

  // Preview para nova receita
  const imagemNovaReceita = document.getElementById("imagem");
  if (imagemNovaReceita) {
    console.log("✅ Configurando preview para nova receita");
    imagemNovaReceita.addEventListener("change", previewImage);
  } else {
    console.log("❌ Input de imagem para nova receita não encontrado");
  }

  // Preview para editar receita
  const imagemEditarReceita = document.getElementById("edit-imagem");
  if (imagemEditarReceita) {
    console.log("✅ Configurando preview para editar receita");
    imagemEditarReceita.addEventListener("change", previewEditImage);
  } else {
    console.log("❌ Input de imagem para editar receita não encontrado");
  }
}

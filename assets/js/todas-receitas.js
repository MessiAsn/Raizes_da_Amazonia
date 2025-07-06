/* JavaScript para página Todas as Receitas - Versão Simplificada (Somente Leitura) */

// Usar configuração centralizada do config.js
const API_BASE_URL =
  window.RaizesAmazonia?.Config?.API_BASE_URL || "http://localhost:8000";
const container = document.getElementById("card-container");
const paginationWrapper = document.getElementById("pagination-wrapper");
const loadingElement = document.getElementById("loading");

// Cache das receitas para filtros
let todasReceitas = [];
let receitasFiltradas = [];

// Inicialização
document.addEventListener("DOMContentLoaded", async function () {
  // Aguardar configuração ser carregada se disponível
  if (window.RaizesAmazonia?.DependencyManager) {
    await window.RaizesAmazonia.DependencyManager.waitForModule("core");
  }

  carregarTodasReceitas();
});
// ==============================================

/**
 * Função utilitária para confirmação dinâmica de deleção
 * Utiliza o sistema de modal centralizado do main.js
 * @param {string} itemNome - Nome do item a ser deletado
 * @param {string} itemTipo - Tipo do item (receita, dica, etc.)
 * @returns {Promise<boolean>} - true se confirmado, false se cancelado
 */
async function confirmarDelecao(itemNome, itemTipo = "item") {
  const titulo = "Confirmar Exclusão";
  const mensagem = `Tem certeza que deseja excluir ${itemTipo} ${itemNome}?\n\n⚠️ Esta ação não pode ser desfeita e todos os dados serão perdidos permanentemente.`;

  // Usar função global se disponível, senão usar fallback
  if (window.mostrarConfirmacao) {
    return await window.mostrarConfirmacao(
      titulo,
      mensagem,
      null, // onConfirm será tratado pelo retorno da Promise
      () => mostrarMensagem("Exclusão cancelada", "info")
    );
  }

  // Fallback simples
  return confirm(`${titulo}\n\n${mensagem}`);
}

// ==============================================
// CARREGAMENTO E RENDERIZAÇÃO
// ==============================================

async function carregarTodasReceitas() {
  mostrarLoading(true);

  try {
    console.log('🔄 Iniciando carregamento de receitas...');
    
    // Verificar se o ReceitaManager está disponível
    if (!window.RaizesAmazonia?.ReceitaManager) {
      console.log('⚠️ ReceitaManager não encontrado, usando fetch direto');
      
      const response = await fetch(`${API_BASE_URL}/api/receitas`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      todasReceitas = await response.json();
    } else {
      console.log('✅ Usando ReceitaManager');
      todasReceitas = await window.RaizesAmazonia.ReceitaManager.carregarReceitas();
    }
    
    console.log(`📖 ${todasReceitas.length} receitas carregadas`);
    receitasFiltradas = [...todasReceitas];

    renderizarReceitas(receitasFiltradas);
    atualizarContadorResultados(""); // Inicializar contador

    // Calcular e mostrar estatísticas
    mostrarEstatisticasLocal();
  } catch (error) {
    console.error("❌ Erro ao carregar receitas:", error);
    mostrarErroConexao();
  } finally {
    mostrarLoading(false);
  }
}

function renderizarReceitas(receitas) {
  // Atualizar dados na paginação
  paginacao.dados = receitas || [];
  paginacao.totalItens = paginacao.dados.length;
  paginacao.paginaAtual = 1; // Reset para primeira página ao filtrar
  
  renderizarReceitasComPaginacao();
}

function renderizarReceitasComPaginacao() {
  if (!container) {
    console.error('Container não encontrado!');
    return;
  }
  
  container.innerHTML = "";

  if (paginacao.dados.length === 0) {
    mostrarMensagemVazia();
    return;
  }

  // Obter receitas da página atual
  const receitasPagina = obterReceitasPaginaAtual();

  // Renderizar receitas da página atual
  receitasPagina.forEach((r) => {
    const card = document.createElement("div");
    card.className = "card";

    // Construir URL da imagem
    const imagemUrl = r.imagem ? `${API_BASE_URL}${r.imagem}` : null;

    card.innerHTML = `
            ${
              imagemUrl
                ? `<img src="${imagemUrl}" alt="${r.nome}" onerror="this.style.display='none'" />`
                : `<div class="no-image">
                         <div class="icon">📷</div>
                         <div class="text">Sem imagem</div>
                       </div>`
            }
            <h3>${r.nome}</h3>
            <p>${r.descricao}</p>
            <div class="card-actions">
                <button onclick="verReceitaDetalhes('${
                  r.id
                }')" class="card-button">Ver Receita</button>
            </div>
        `;

    container.appendChild(card);
  });

  // Limpar paginação anterior
  if (paginationWrapper) {
    paginationWrapper.innerHTML = "";
  }

  // Adicionar paginação se necessário
  const paginacaoHTML = gerarPaginacao();
  
  if (paginacaoHTML && paginationWrapper) {
    paginationWrapper.innerHTML = paginacaoHTML;
  } else if (paginacaoHTML && container) {
    // Fallback: adicionar no container principal
    const paginacaoElement = document.createElement('div');
    paginacaoElement.innerHTML = paginacaoHTML;
    container.appendChild(paginacaoElement);
  }
}

function mostrarMensagemVazia() {
  const mensagemVazia = document.createElement("div");
  mensagemVazia.className = "mensagem-vazia";
  mensagemVazia.innerHTML = `
        <h3>Nenhuma receita encontrada</h3>
        <p>Não há receitas disponíveis no momento.</p>
        <p>As receitas podem ser gerenciadas através do <a href="admin.html">painel administrativo</a>.</p>
    `;
  container.appendChild(mensagemVazia);
}

function mostrarErroConexao() {
  // Usar sistema centralizado de erro de conexão
  if (window.RaizesAmazonia?.UI?.mostrarErroConexao) {
    window.RaizesAmazonia.UI.mostrarErroConexao(
      "#card-container",
      "carregarTodasReceitas"
    );
  } else {
    // Fallback para caso o config.js não esteja carregado
    container.innerHTML = `
        <div class="erro-conexao">
            <div class="erro-content">
                <h3>⚠️ Erro de Conexão</h3>
                <p>Não foi possível conectar com o servidor.</p>
                <p>Certifique-se de que o backend está rodando em <code>http://localhost:8000</code></p>
                <button onclick="carregarTodasReceitas()" class="btn-retry">Tentar Novamente</button>
            </div>
        </div>
    `;
  }
}

function mostrarLoading(mostrar) {
  loadingElement.style.display = mostrar ? "block" : "none";
}

// Funções de filtro e busca
function buscarReceitas() {
  const termoBusca = document
    .getElementById("busca-receitas")
    .value.toLowerCase()
    .trim();

  // Controlar visibilidade do botão de limpar
  const btnLimpar = document.getElementById("btn-limpar-busca");
  btnLimpar.style.display = termoBusca ? "flex" : "none";

  if (termoBusca === "") {
    receitasFiltradas = [...todasReceitas];
  } else {
    // Busca apenas por nome da receita
    receitasFiltradas = todasReceitas.filter((receita) =>
      receita.nome.toLowerCase().includes(termoBusca)
    );
  }

  atualizarContadorResultados(termoBusca);
  renderizarReceitas(receitasFiltradas);
}

function limparBusca() {
  document.getElementById("busca-receitas").value = "";
  document.getElementById("btn-limpar-busca").style.display = "none";
  receitasFiltradas = [...todasReceitas];
  atualizarContadorResultados("");
  renderizarReceitas(receitasFiltradas);
  // Focar no campo de busca
  document.getElementById("busca-receitas").focus();
}

function atualizarContadorResultados(termoBusca) {
  const contador = document.getElementById("resultados-count");
  if (!contador) return;

  if (termoBusca) {
    const total = receitasFiltradas.length;
    const totalGeral = todasReceitas.length;

    if (total === 0) {
      contador.innerHTML = `<span style="color: #dc3545;">❌ Nenhuma receita encontrada para "${termoBusca}"</span>`;
      contador.className = "search-results-info";
    } else if (total === totalGeral) {
      contador.innerHTML = `📚 Mostrando todas as ${total} receitas`;
      contador.className = "search-results-info";
    } else {
      contador.innerHTML = `🔍 ${total} de ${totalGeral} receitas encontradas para "<strong>${termoBusca}</strong>"`;
      contador.className = "search-results-info highlight";
    }
  } else {
    const total = todasReceitas.length;
    if (total > 0) {
      const totalPaginas = calcularTotalPaginas();
      if (totalPaginas > 1) {
        contador.innerHTML = `📚 ${total} receitas disponíveis (${totalPaginas} páginas)`;
      } else {
        contador.innerHTML = `📚 Mostrando todas as ${total} receitas`;
      }
    } else {
      contador.innerHTML = "";
    }
    contador.className = "search-results-info";
  }
}

// Busca em tempo real com debounce para otimizar performance
let timeoutBusca;
function buscarComDebounce() {
  clearTimeout(timeoutBusca);
  timeoutBusca = setTimeout(buscarReceitas, 300); // 300ms de delay
}

// Event listeners melhorados para busca
document.addEventListener("DOMContentLoaded", function () {
  const campoBusca = document.getElementById("busca-receitas");

  if (campoBusca) {
    // Busca em tempo real
    campoBusca.addEventListener("input", buscarComDebounce);

    // Busca ao pressionar Enter (mantém compatibilidade)
    campoBusca.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        clearTimeout(timeoutBusca); // Cancel debounce
        buscarReceitas();
      }
    });

    // Limpar com Escape
    campoBusca.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        limparBusca();
      }
    });
  }
});

// Mostrar estatísticas baseadas nas receitas carregadas localmente
function mostrarEstatisticasLocal() {
  if (todasReceitas.length > 0) {
    const comImagem = todasReceitas.filter((r) => r.imagem).length;
    const semImagem = todasReceitas.length - comImagem;

    const statsElement = document.getElementById("stats-info");
    if (statsElement) {
      statsElement.innerHTML = `
        <div class="stats-content">
          <span class="stat-item">Total: ${todasReceitas.length}</span>
          <span class="stat-item">📷 Com imagem: ${comImagem}</span>
          <span class="stat-item">Sem imagem: ${semImagem}</span>
        </div>
      `;
      console.log("Estatísticas locais inseridas no DOM"); // Debug
    }
  } else {
    // Se não há receitas, ocultar estatísticas
    const statsElement = document.getElementById("stats-info");
    if (statsElement) {
      statsElement.style.display = "none";
    }
  }
}

// ========================================
// FUNÇÕES ESSENCIAIS
// ========================================

// Função para redirecionar para página de detalhes da receita
function verReceitaDetalhes(id) {
  window.location.href = `receita.html?id=${id}`;
}

// Sistema de Mensagens Simplificado
function mostrarMensagem(texto, tipo = "info", duracao = 6000) {
  // Use a função global se disponível, senão implementa localmente
  if (window.RaizesAmazonia?.UI?.showMessage) {
    return window.RaizesAmazonia.UI.showMessage(texto, tipo, duracao);
  }

  // Implementação local como fallback
  // Usar sistema centralizado se disponível
  if (window.RaizesAmazonia?.Messages?.show) {
    return window.RaizesAmazonia.Messages.show(texto, tipo, duracao);
  }

  // Fallback simples
  console.log(`[${tipo.toUpperCase()}] ${texto}`);
}

// Função para alternar para o modo admin (redireciona para painel dedicado)
window.toggleAdmin = function () {
  // Verificar se já está autenticado
  const isAdmin = sessionStorage.getItem("isAdmin") === "true";

  if (!isAdmin) {
    const senha = prompt("🔐 Digite a senha de administrador:");
    if (senha === "admin123") {
      sessionStorage.setItem("isAdmin", "true");
      mostrarMensagem(
        "✅ Redirecionando para o painel administrativo...",
        "success"
      );
      setTimeout(() => {
        window.location.href = "admin.html";
      }, 1500);
    } else {
      mostrarMensagem("Senha incorreta!", "error");
    }
  } else {
    // Já está autenticado, redirecionar direto
    mostrarMensagem(
      "🔄 Redirecionando para o painel administrativo...",
      "info"
    );
    setTimeout(() => {
      window.location.href = "admin.html";
    }, 1000);
  }
};

// ========================================
// SISTEMA DE PAGINAÇÃO
// ========================================
const paginacao = {
  paginaAtual: 1,
  itensPorPagina: 6,
  totalItens: 0,
  dados: []
};

// Função para calcular total de páginas
function calcularTotalPaginas() {
  return Math.ceil(paginacao.totalItens / paginacao.itensPorPagina);
}

// Função para obter receitas da página atual
function obterReceitasPaginaAtual() {
  const inicio = (paginacao.paginaAtual - 1) * paginacao.itensPorPagina;
  const fim = inicio + paginacao.itensPorPagina;
  return paginacao.dados.slice(inicio, fim);
}

// Função para gerar HTML da paginação
function gerarPaginacao() {
  const totalPaginas = calcularTotalPaginas();
  
  if (totalPaginas <= 1) {
    return '';
  }

  let html = `
    <div class="pagination-container">
      <div class="pagination-info">
        Mostrando ${(paginacao.paginaAtual - 1) * paginacao.itensPorPagina + 1} - 
        ${Math.min(paginacao.paginaAtual * paginacao.itensPorPagina, paginacao.totalItens)} 
        de ${paginacao.totalItens} receitas
      </div>
      <div class="pagination">
        <button class="pagination-btn pagination-prev ${paginacao.paginaAtual === 1 ? 'disabled' : ''}" 
                onclick="irParaPagina(${paginacao.paginaAtual - 1})"
                ${paginacao.paginaAtual === 1 ? 'disabled' : ''}>
          Anterior
        </button>
  `;

  // Lógica para mostrar números das páginas
  const maxBotoes = 5;
  let inicio = Math.max(1, paginacao.paginaAtual - Math.floor(maxBotoes / 2));
  let fim = Math.min(totalPaginas, inicio + maxBotoes - 1);

  if (fim - inicio < maxBotoes - 1) {
    inicio = Math.max(1, fim - maxBotoes + 1);
  }

  // Primeira página e reticências se necessário
  if (inicio > 1) {
    html += `<button class="pagination-btn" onclick="irParaPagina(1)">1</button>`;
    if (inicio > 2) {
      html += `<span class="pagination-ellipsis">...</span>`;
    }
  }

  // Páginas do meio
  for (let i = inicio; i <= fim; i++) {
    html += `<button class="pagination-btn ${i === paginacao.paginaAtual ? 'active' : ''}" 
             onclick="irParaPagina(${i})">${i}</button>`;
  }

  // Última página e reticências se necessário
  if (fim < totalPaginas) {
    if (fim < totalPaginas - 1) {
      html += `<span class="pagination-ellipsis">...</span>`;
    }
    html += `<button class="pagination-btn" onclick="irParaPagina(${totalPaginas})">${totalPaginas}</button>`;
  }

  html += `
        <button class="pagination-btn pagination-next ${paginacao.paginaAtual === totalPaginas ? 'disabled' : ''}" 
                onclick="irParaPagina(${paginacao.paginaAtual + 1})"
                ${paginacao.paginaAtual === totalPaginas ? 'disabled' : ''}>
          Próximo
        </button>
      </div>
      <div class="items-per-page">
        <label for="receitas-per-page">Receitas por página:</label>
        <select id="receitas-per-page" onchange="alterarItensPorPagina(this.value)">
          <option value="6" ${paginacao.itensPorPagina === 6 ? 'selected' : ''}>6</option>
          <option value="12" ${paginacao.itensPorPagina === 12 ? 'selected' : ''}>12</option>
          <option value="18" ${paginacao.itensPorPagina === 18 ? 'selected' : ''}>18</option>
          <option value="24" ${paginacao.itensPorPagina === 24 ? 'selected' : ''}>24</option>
        </select>
      </div>
    </div>
  `;

  return html;
}

// Função para ir para uma página específica
function irParaPagina(pagina) {
  const totalPaginas = calcularTotalPaginas();
  
  if (pagina < 1 || pagina > totalPaginas) {
    return;
  }

  paginacao.paginaAtual = pagina;
  renderizarReceitasComPaginacao();
  
  // Rolar para o topo dos resultados
  document.querySelector('.receitas').scrollIntoView({ 
    behavior: 'smooth',
    block: 'start'
  });
}

// Função para alterar itens por página
function alterarItensPorPagina(novoValor) {
  paginacao.itensPorPagina = parseInt(novoValor);
  paginacao.paginaAtual = 1; // Voltar para primeira página
  renderizarReceitasComPaginacao();
}

// ========================================

/* JavaScript para página Todas as Receitas - Versão Simplificada (Somente Leitura) */

// Usar configuração centralizada do config.js
const API_BASE_URL =
  window.RaizesAmazonia?.Config?.API_BASE_URL || "http://localhost:8000";
const container = document.getElementById("card-container");
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
      () => mostrarMensagem("❌ Exclusão cancelada", "info")
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
    // Usar o ReceitaManager centralizado
    todasReceitas =
      await window.RaizesAmazonia.ReceitaManager.carregarReceitas();
    receitasFiltradas = [...todasReceitas];

    renderizarReceitas(receitasFiltradas);
    atualizarContadorResultados(""); // Inicializar contador

    // Calcular e mostrar estatísticas
    mostrarEstatisticasLocal();
  } catch (error) {
    console.error("Erro ao carregar receitas:", error);
    mostrarErroConexao();
  } finally {
    mostrarLoading(false);
  }
}

function renderizarReceitas(receitas) {
  container.innerHTML = "";

  if (receitas.length === 0) {
    mostrarMensagemVazia();
    return;
  }

  receitas.forEach((r) => {
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
}

function mostrarMensagemVazia() {
  const mensagemVazia = document.createElement("div");
  mensagemVazia.className = "mensagem-vazia";
  mensagemVazia.innerHTML = `
        <h3>📝 Nenhuma receita encontrada</h3>
        <p>Não há receitas disponíveis no momento.</p>
        <p>As receitas podem ser gerenciadas através do <a href="admin.html">painel administrativo</a>.</p>
    `;
  container.appendChild(mensagemVazia);
}

function mostrarErroConexao() {
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
    contador.innerHTML =
      total > 0 ? `📚 Mostrando todas as ${total} receitas` : "";
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
          <span class="stat-item">📊 Total: ${todasReceitas.length}</span>
          <span class="stat-item">📷 Com imagem: ${comImagem}</span>
          <span class="stat-item">📝 Sem imagem: ${semImagem}</span>
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
      mostrarMensagem("❌ Senha incorreta!", "error");
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

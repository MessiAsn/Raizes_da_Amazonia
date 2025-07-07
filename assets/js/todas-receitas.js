const API_BASE_URL =
  window.RaizesAmazonia?.Config?.API_BASE_URL || "http://127.0.0.1:8000";
const container = document.getElementById("card-container");
const paginationWrapper = document.getElementById("pagination-wrapper");
const loadingElement = document.getElementById("loading");

let todasReceitas = [];
let receitasFiltradas = [];

document.addEventListener("DOMContentLoaded", async function () {
  if (window.RaizesAmazonia?.DependencyManager) {
    await window.RaizesAmazonia.DependencyManager.waitForModule("core");
  }

  carregarTodasReceitas();
});

/**
 * @param {string} itemNome
 * @param {string} itemTipo
 * @returns {Promise<boolean>}
 */
async function confirmarDelecao(itemNome, itemTipo = "item") {
  const titulo = "Confirmar Exclusão";
  const mensagem = `Tem certeza que deseja excluir ${itemTipo} ${itemNome}?\n\n⚠️ Esta ação não pode ser desfeita e todos os dados serão perdidos permanentemente.`;

  if (window.mostrarConfirmacao) {
    return await window.mostrarConfirmacao(titulo, mensagem, null, () =>
      mostrarMensagem("Exclusão cancelada", "info")
    );
  }

  return confirm(`${titulo}\n\n${mensagem}`);
}

async function carregarTodasReceitas() {
  mostrarLoading(true);

  try {
    console.log("🔄 Iniciando carregamento de receitas...");

    if (!window.RaizesAmazonia?.ReceitaManager) {
      console.log("⚠️ ReceitaManager não encontrado, usando fetch direto");

      const response = await fetch(`${API_BASE_URL}/api/receitas`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      todasReceitas = await response.json();
    } else {
      console.log("✅ Usando ReceitaManager");
      todasReceitas =
        await window.RaizesAmazonia.ReceitaManager.carregarReceitas();
    }

    console.log(`📖 ${todasReceitas.length} receitas carregadas`);
    receitasFiltradas = [...todasReceitas];

    renderizarReceitas(receitasFiltradas);
    atualizarContadorResultados("");

    mostrarEstatisticasLocal();
  } catch (error) {
    console.error("❌ Erro ao carregar receitas:", error);
    mostrarErroConexao();
  } finally {
    mostrarLoading(false);
  }
}

function renderizarReceitas(receitas) {
  paginacao.dados = receitas || [];
  paginacao.totalItens = paginacao.dados.length;
  paginacao.paginaAtual = 1;

  renderizarReceitasComPaginacao();
}

function renderizarReceitasComPaginacao() {
  if (!container) {
    console.error("Container não encontrado!");
    return;
  }

  container.innerHTML = "";

  if (paginacao.dados.length === 0) {
    mostrarMensagemVazia();
    return;
  }

  const receitasPagina = obterReceitasPaginaAtual();

  receitasPagina.forEach((r) => {
    const card = document.createElement("div");
    card.className = "card";

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

  if (paginationWrapper) {
    paginationWrapper.innerHTML = "";
  }

  const paginacaoHTML = gerarPaginacao();

  if (paginacaoHTML && paginationWrapper) {
    paginationWrapper.innerHTML = paginacaoHTML;
  } else if (paginacaoHTML && container) {
    const paginacaoElement = document.createElement("div");
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
  if (window.RaizesAmazonia?.UI?.mostrarErroConexao) {
    window.RaizesAmazonia.UI.mostrarErroConexao(
      "#card-container",
      "carregarTodasReceitas"
    );
  } else {
    container.innerHTML = `
        <div class="erro-conexao">
            <div class="erro-content">
                <h3>⚠️ Erro de Conexão</h3>
                <p>Não foi possível conectar com o servidor.</p>
                <p>Certifique-se de que o backend está rodando em <code>http://127.0.0.1:8000</code></p>
                <button onclick="carregarTodasReceitas()" class="btn-retry">Tentar Novamente</button>
            </div>
        </div>
    `;
  }
}

function mostrarLoading(mostrar) {
  loadingElement.style.display = mostrar ? "block" : "none";
}

function buscarReceitas() {
  const termoBusca = document
    .getElementById("busca-receitas")
    .value.toLowerCase()
    .trim();

  const btnLimpar = document.getElementById("btn-limpar-busca");
  btnLimpar.style.display = termoBusca ? "flex" : "none";

  if (termoBusca === "") {
    receitasFiltradas = [...todasReceitas];
  } else {
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

let timeoutBusca;
function buscarComDebounce() {
  clearTimeout(timeoutBusca);
  timeoutBusca = setTimeout(buscarReceitas, 300);
}
document.addEventListener("DOMContentLoaded", function () {
  const campoBusca = document.getElementById("busca-receitas");

  if (campoBusca) {
    campoBusca.addEventListener("input", buscarComDebounce);

    campoBusca.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        clearTimeout(timeoutBusca);
        buscarReceitas();
      }
    });

    campoBusca.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        limparBusca();
      }
    });
  }
});

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
      console.log("Estatísticas locais inseridas no DOM");
    }
  } else {
    const statsElement = document.getElementById("stats-info");
    if (statsElement) {
      statsElement.style.display = "none";
    }
  }
}

function verReceitaDetalhes(id) {
  window.location.href = `receita.html?id=${id}`;
}

function mostrarMensagem(texto, tipo = "info", duracao = 6000) {
  if (window.RaizesAmazonia?.UI?.showMessage) {
    return window.RaizesAmazonia.UI.showMessage(texto, tipo, duracao);
  }

  if (window.RaizesAmazonia?.Messages?.show) {
    return window.RaizesAmazonia.Messages.show(texto, tipo, duracao);
  }

  console.log(`[${tipo.toUpperCase()}] ${texto}`);
}

window.toggleAdmin = function () {
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
    mostrarMensagem(
      "🔄 Redirecionando para o painel administrativo...",
      "info"
    );
    setTimeout(() => {
      window.location.href = "admin.html";
    }, 1000);
  }
};

const paginacao = {
  paginaAtual: 1,
  itensPorPagina: 6,
  totalItens: 0,
  dados: [],
};

function calcularTotalPaginas() {
  return Math.ceil(paginacao.totalItens / paginacao.itensPorPagina);
}

function obterReceitasPaginaAtual() {
  const inicio = (paginacao.paginaAtual - 1) * paginacao.itensPorPagina;
  const fim = inicio + paginacao.itensPorPagina;
  return paginacao.dados.slice(inicio, fim);
}

function gerarPaginacao() {
  const totalPaginas = calcularTotalPaginas();

  if (paginacao.totalItens === 0) {
    return "";
  }

  let html = `
    <div class="pagination-container">
      <div class="pagination-info">
        Mostrando ${
          (paginacao.paginaAtual - 1) * paginacao.itensPorPagina + 1
        } - 
        ${Math.min(
          paginacao.paginaAtual * paginacao.itensPorPagina,
          paginacao.totalItens
        )} 
        de ${paginacao.totalItens} receitas
      </div>
      <div class="pagination">
        <button class="pagination-btn pagination-prev ${
          paginacao.paginaAtual === 1 ? "disabled" : ""
        }" 
                onclick="irParaPagina(${paginacao.paginaAtual - 1})"
                ${paginacao.paginaAtual === 1 ? "disabled" : ""}>
          Anterior
        </button>
  `;

  const maxBotoes = 5;
  let inicio = Math.max(1, paginacao.paginaAtual - Math.floor(maxBotoes / 2));
  let fim = Math.min(totalPaginas, inicio + maxBotoes - 1);

  if (fim - inicio < maxBotoes - 1) {
    inicio = Math.max(1, fim - maxBotoes + 1);
  }

  if (inicio > 1) {
    html += `<button class="pagination-btn" onclick="irParaPagina(1)">1</button>`;
    if (inicio > 2) {
      html += `<span class="pagination-ellipsis">...</span>`;
    }
  }

  for (let i = inicio; i <= fim; i++) {
    html += `<button class="pagination-btn ${
      i === paginacao.paginaAtual ? "active" : ""
    }" 
             onclick="irParaPagina(${i})">${i}</button>`;
  }

  if (fim < totalPaginas) {
    if (fim < totalPaginas - 1) {
      html += `<span class="pagination-ellipsis">...</span>`;
    }
    html += `<button class="pagination-btn" onclick="irParaPagina(${totalPaginas})">${totalPaginas}</button>`;
  }

  html += `
        <button class="pagination-btn pagination-next ${
          paginacao.paginaAtual === totalPaginas ? "disabled" : ""
        }" 
                onclick="irParaPagina(${paginacao.paginaAtual + 1})"
                ${paginacao.paginaAtual === totalPaginas ? "disabled" : ""}>
          Próximo
        </button>
      </div>
      <div class="items-per-page">
        <label for="receitas-per-page">Receitas por página:</label>
        <select id="receitas-per-page" onchange="alterarItensPorPagina(this.value)">
          <option value="6" ${
            paginacao.itensPorPagina === 6 ? "selected" : ""
          }>6</option>
          <option value="12" ${
            paginacao.itensPorPagina === 12 ? "selected" : ""
          }>12</option>
          <option value="18" ${
            paginacao.itensPorPagina === 18 ? "selected" : ""
          }>18</option>
          <option value="24" ${
            paginacao.itensPorPagina === 24 ? "selected" : ""
          }>24</option>
        </select>
      </div>
    </div>
  `;

  return html;
}

function irParaPagina(pagina) {
  const totalPaginas = calcularTotalPaginas();

  if (pagina < 1 || pagina > totalPaginas) {
    return;
  }

  paginacao.paginaAtual = pagina;
  renderizarReceitasComPaginacao();

  document.querySelector(".receitas").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function alterarItensPorPagina(novoValor) {
  paginacao.itensPorPagina = parseInt(novoValor);
  paginacao.paginaAtual = 1;
  renderizarReceitasComPaginacao();
}

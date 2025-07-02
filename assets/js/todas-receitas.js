/* JavaScript para página Todas as Receitas */

// Usar configuração centralizada do config.js
const API_BASE_URL =
  window.RaizesAmazonia?.Config?.API_BASE_URL || "http://localhost:8000";
const container = document.getElementById("card-container");
const loadingElement = document.getElementById("loading");

// Estado do admin é gerenciado pelo admin-system.js

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
  carregarEstatisticas();
});

// A verificação do status admin é feita automaticamente pelo admin-system.js

// ==============================================
// UTILITÁRIOS DE CONFIRMAÇÃO DINÂMICA
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
    const response = await fetch(`${API_BASE_URL}/api/receitas`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    todasReceitas = await response.json();
    receitasFiltradas = [...todasReceitas];

    renderizarReceitas(receitasFiltradas);

    // Tentar carregar estatísticas da API, se falhar usar dados locais
    setTimeout(() => mostrarEstatisticasLocal(), 1000);
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
                }')" class="card-button">${
      isAdmin ? "Ver" : "Ver Receita"
    }</button>
                ${
                  isAdmin
                    ? `
                        <button onclick="editarReceita('${r.id}')" class="btn-edit">Editar</button>
                        <button onclick="deletarReceita('${r.id}')" class="btn-delete">Excluir</button>
                        `
                    : ""
                }
            </div>
        `;

    container.appendChild(card);
  });

  // Botão de adicionar nova receita agora está fixo no HTML
}

function mostrarMensagemVazia() {
  const mensagemVazia = document.createElement("div");
  mensagemVazia.className = "mensagem-vazia";
  mensagemVazia.innerHTML = `
        <div class="vazia-content">
            <h3>🍽️ Ainda não há receitas!</h3>
            <p>${
              isAdmin
                ? "Seja o primeiro a adicionar uma deliciosa receita amazônica!"
                : "Em breve teremos deliciosas receitas amazônicas aqui!"
            }</p>
            ${
              isAdmin
                ? '<button onclick="abrirModalNovaReceita()" class="btn-primary">Adicionar Primeira Receita</button>'
                : ""
            }
        </div>
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

  if (termoBusca === "") {
    receitasFiltradas = [...todasReceitas];
  } else {
    receitasFiltradas = todasReceitas.filter(
      (receita) =>
        receita.nome.toLowerCase().includes(termoBusca) ||
        receita.descricao.toLowerCase().includes(termoBusca) ||
        (receita.ingredientes &&
          receita.ingredientes.toLowerCase().includes(termoBusca)) ||
        (receita.modo_preparo &&
          receita.modo_preparo.toLowerCase().includes(termoBusca))
    );
  }

  renderizarReceitas(receitasFiltradas);
}

// Permitir busca ao pressionar Enter
document
  .getElementById("busca-receitas")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      buscarReceitas();
    }
  });

// Carregar estatísticas
async function carregarEstatisticas() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stats`);

    if (response.ok) {
      const stats = await response.json();
      console.log("Estatísticas carregadas:", stats); // Debug

      let statsElement = document.getElementById("stats-info");

      if (statsElement) {
        statsElement.innerHTML = `
                <div class="stats-content">
                    <span class="stat-item">📊 Total: ${stats.total_receitas}</span>
                    <span class="stat-item">📷 Com imagem: ${stats.receitas_com_imagem}</span>
                    <span class="stat-item">📝 Sem imagem: ${stats.receitas_sem_imagem}</span>
                </div>
            `;
        console.log("Estatísticas inseridas no DOM"); // Debug
      } else {
        console.error("Elemento stats-info não encontrado"); // Debug
      }
    } else {
      console.error("Erro na resposta da API de stats:", response.status); // Debug
    }
  } catch (error) {
    console.error("Erro ao carregar estatísticas:", error);
    // Fallback: calcular estatísticas das receitas carregadas
    mostrarEstatisticasLocal();
  }
}

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

// Funções dos modais (similares ao main.js)
// Variável global para armazenar o ID da receita sendo editada
let receitaEditandoId = null;

function editarReceita(id) {
  if (!isAdmin) return;

  receitaEditandoId = id;

  fetch(`${API_BASE_URL}/api/receitas/${id}`)
    .then((response) => response.json())
    .then((receita) => {
      document.getElementById("edit-nome").value = receita.nome;
      document.getElementById("edit-descricao").value = receita.descricao;
      document.getElementById("edit-ingredientes").value = receita.ingredientes;
      document.getElementById("edit-modo_preparo").value = receita.modo_preparo;
      document.getElementById("edit-historia").value = receita.historia || "";

      // Limpar preview de imagem
      document.getElementById("edit-preview-container").style.display = "none";
      document.getElementById("edit-imagem").value = "";

      abrirModal("modal-editar-receita");
    })
    .catch((error) => {
      console.error("Erro ao carregar receita para edição:", error);
      mostrarMensagem("Erro ao carregar receita", "error");
    });
}

function salvarEdicaoReceita(event) {
  event.preventDefault();

  if (!isAdmin || !receitaEditandoId) return;

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

  fetch(`${API_BASE_URL}/api/receitas/${receitaEditandoId}`, {
    method: "PUT",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      mostrarMensagem("Receita atualizada com sucesso!", "success");
      fecharModal("modal-editar-receita");
      carregarTodasReceitas();
      receitaEditandoId = null;
    })
    .catch((error) => {
      console.error("Erro ao atualizar receita:", error);
      mostrarMensagem("Erro ao atualizar receita", "error");
    });
}

async function deletarReceita(id) {
  if (!isAdmin) return;

  // Buscar nome da receita para confirmação personalizada
  let nomeReceita = "esta receita";
  try {
    const receita = todasReceitas.find((r) => r.id === id);
    if (receita && receita.nome) {
      nomeReceita = `"${receita.nome}"`;
    }
  } catch (error) {
    console.log("Não foi possível buscar o nome da receita");
  }

  const confirmou = await confirmarDelecao(nomeReceita, "receita");

  if (!confirmou) {
    return;
  }

  try {
    mostrarMensagem("🗑️ Excluindo receita...", "info");

    const response = await fetch(`${API_BASE_URL}/api/receitas/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    mostrarMensagem("✅ Receita excluída com sucesso!", "success");
    carregarTodasReceitas();
  } catch (error) {
    console.error("Erro ao excluir receita:", error);
    mostrarMensagem("❌ Erro ao excluir receita", "error");
  }
}

function abrirModalNovaReceita() {
  if (!isAdmin) return;

  // Limpar formulário
  document.getElementById("form-nova-receita").reset();
  document.getElementById("preview-container").style.display = "none";

  abrirModal("modal-nova-receita");
}

function adicionarReceita(event) {
  event.preventDefault();

  if (!isAdmin) return;

  const formData = new FormData();
  formData.append("nome", document.getElementById("nome").value);
  formData.append("descricao", document.getElementById("descricao").value);
  formData.append(
    "ingredientes",
    document.getElementById("ingredientes").value
  );
  formData.append(
    "modo_preparo",
    document.getElementById("modo_preparo").value
  );
  formData.append("historia", document.getElementById("historia").value);

  const imagemFile = document.getElementById("imagem").files[0];
  if (imagemFile) {
    formData.append("imagem", imagemFile);
  }

  fetch(`${API_BASE_URL}/api/receitas`, {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      mostrarMensagem("Receita adicionada com sucesso!", "success");
      fecharModal("modal-nova-receita");
      carregarTodasReceitas();
    })
    .catch((error) => {
      console.error("Erro ao adicionar receita:", error);
      mostrarMensagem("Erro ao adicionar receita", "error");
    });
}

// Funções auxiliares para modais
function abrirModal(modalId) {
  document.getElementById(modalId).style.display = "flex";
  document.body.style.overflow = "hidden";
}

function fecharModal(modalId) {
  document.getElementById(modalId).style.display = "none";
  document.body.style.overflow = "auto";
}

// Fechar modal ao clicar fora dele
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("modal-overlay")) {
    event.target.style.display = "none";
    document.body.style.overflow = "auto";
  }
});

// Preview de imagem
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

// Função para redirecionar para página de detalhes da receita
function verReceitaDetalhes(id) {
  window.location.href = `receita.html?id=${id}`;
}

/* Sistema de Mensagens Personalizadas */
function mostrarMensagem(texto, tipo = "info", duracao = 6000) {
  // Usar sistema centralizado se disponível
  if (window.RaizesAmazonia?.Messages?.show) {
    return window.RaizesAmazonia.Messages.show(texto, tipo, duracao);
  }

  // Fallback para implementação local se sistema centralizado não estiver disponível
  // Remover mensagem existente se houver
  const mensagemExistente = document.querySelector(".mensagem-toast");
  if (mensagemExistente) {
    mensagemExistente.remove();
  }

  const mensagem = document.createElement("div");
  mensagem.className = `mensagem-toast mensagem-${tipo}`;

  // Definir ícones e cores por tipo
  const configs = {
    success: { icone: "✅", cor: "#28a745" },
    error: { icone: "❌", cor: "#dc3545" },
    warning: { icone: "⚠️", cor: "#ffc107" },
    info: { icone: "ℹ️", cor: "#17a2b8" },
  };

  const config = configs[tipo] || configs.info;

  mensagem.innerHTML = `
        <div class="mensagem-conteudo">
            <span class="mensagem-icone">${config.icone}</span>
            <span class="mensagem-texto">${texto}</span>
            <button class="mensagem-fechar" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;

  mensagem.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${config.cor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
        font-family: inherit;
    `;

  const conteudo = mensagem.querySelector(".mensagem-conteudo");
  conteudo.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.75rem;
    `;

  const botaoFechar = mensagem.querySelector(".mensagem-fechar");
  botaoFechar.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
    `;

  document.body.appendChild(mensagem);

  // Auto-remover após a duração especificada
  setTimeout(() => {
    if (mensagem.parentNode) {
      mensagem.remove();
    }
  }, duracao);
}

// Adicionar estilos de animação
const style = document.createElement("style");
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

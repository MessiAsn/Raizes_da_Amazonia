/* Sistema Principal - Raízes da Amazônia */

// Configuração da API
const API_BASE_URL = "http://localhost:8000";

// Funções de compatibilidade - Sistema de Mensagens Simplificado
function mostrarMensagem(texto, tipo = "info", duracao = 6000) {
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

  // Adicionar estilos de animação se não existir
  if (!document.querySelector("#mensagem-styles")) {
    const style = document.createElement("style");
    style.id = "mensagem-styles";
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(mensagem);

  // Auto-remover após a duração especificada
  setTimeout(() => {
    if (mensagem.parentNode) {
      mensagem.remove();
    }
  }, duracao);
}

// Funcoes de conveniencia
function mostrarSucesso(texto) {
  mostrarMensagem(texto, "success", 8000); // 8 segundos para sucessos
}

function mostrarErro(texto) {
  mostrarMensagem(texto, "error", 10000); // 10 segundos para erros
}

function mostrarAviso(texto) {
  mostrarMensagem(texto, "warning", 7000); // 7 segundos para avisos
}

function mostrarInfo(texto) {
  mostrarMensagem(texto, "info", 5000); // 5 segundos para informações
}

/* Carregamento de Receitas da API */
async function carregarReceitas() {
  const container = document.querySelector(".card-container");

  if (!container) {
    console.error("Container .card-container não encontrado!");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/receitas`);
    if (!response.ok) {
      throw new Error("Erro ao carregar receitas");
    }

    const receitas = await response.json();

    // Limpar container antes de adicionar receitas
    container.innerHTML = "";

    if (receitas.length === 0) {
      // Mostrar mensagem quando não há receitas
      const mensagemVazia = document.createElement("div");
      mensagemVazia.className = "mensagem-vazia";
      mensagemVazia.innerHTML = `
        <div class="vazia-content">
          <h3>🍽️ Ainda não há receitas!</h3>
          <p>Em breve teremos deliciosas receitas amazônicas aqui!</p>
        </div>
      `;
      container.appendChild(mensagemVazia);
    } else {
      // Mostrar apenas as primeiras 6 receitas na página principal
      const receitasParaMostrar = receitas.slice(0, 6);

      receitasParaMostrar.forEach((r) => {
        const card = document.createElement("div");
        card.className = "card";

        // Construir URL da imagem - usar do backend se disponível
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

      // Se há mais de 6 receitas, mostrar botão "Ver Mais"
      if (receitas.length > 6) {
        adicionarBotaoVerMais();
      }

      // Adicionar botão de nova receita se estiver em modo admin
      if (isAdmin) {
        adicionarBotaoNovaReceita();
      }
    }
  } catch (error) {
    console.error("Erro ao carregar receitas:", error);
    mostrarErroConexao(container);
  }
}

function mostrarErroConexao(container) {
  if (!container) {
    console.error("Container não disponível para mostrar erro");
    return;
  }

  container.innerHTML = `
    <div class="erro-conexao">
      <div class="erro-content">
        <h3>⚠️ Erro de Conexão</h3>
        <p>Não foi possível conectar com o servidor.</p>
        <p>Certifique-se de que o backend está rodando em <code>http://localhost:8000</code></p>
        <button onclick="carregarReceitas()" class="btn-retry">Tentar Novamente</button>
      </div>
    </div>
  `;
}

async function atualizarEstatisticas() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stats`);
    if (response.ok) {
      const stats = await response.json();

      // Verificar se existe elemento de estatísticas
      let statsElement = document.getElementById("stats-info");
      if (!statsElement) {
        // Criar elemento de estatísticas se não existir
        statsElement = document.createElement("div");
        statsElement.id = "stats-info";
        statsElement.className = "stats-info";

        // Inserir antes da seção de receitas
        const receitasSection = document.querySelector(".receitas");
        if (receitasSection) {
          receitasSection.insertBefore(
            statsElement,
            receitasSection.firstChild.nextSibling
          );
        }
      }

      statsElement.innerHTML = `
        <div class="stats-content">
          <span class="stat-item">📊 Total: ${stats.total_receitas}</span>
          <span class="stat-item">📷 Com imagem: ${stats.receitas_com_imagem}</span>
          <span class="stat-item">📝 Sem imagem: ${stats.receitas_sem_imagem}</span>
        </div>
      `;
    }
  } catch (error) {
    console.error("Erro ao carregar estatísticas:", error);
  }
}

function adicionarBotaoVerMais() {
  // Criar wrapper para centralização
  const wrapper = document.createElement("div");
  wrapper.className = "ver-mais-wrapper";

  const botaoContainer = document.createElement("div");
  botaoContainer.className = "card ver-mais-card";
  botaoContainer.innerHTML = `
    <div class="ver-mais-content">
      <span class="ver-mais-icon">👀</span>
      <h3>Ver Todas as Receitas</h3>
      <p>Explore nossa coleção completa de receitas amazônicas</p>
      <button class="btn-ver-mais" onclick="window.location.href='pages/todas-receitas.html'">Ver Mais</button>
    </div>
  `;

  wrapper.appendChild(botaoContainer);
  container.appendChild(wrapper);
}

// Função para redirecionar para página de detalhes da receita
function verReceitaDetalhes(id) {
  window.location.href = `pages/receita.html?id=${id}`;
}

async function deletarReceita(id) {
  // Simplificado: apenas solicitar confirmação
  const confirmou = confirm("Tem certeza que deseja excluir esta receita?");

  if (!confirmou) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/receitas/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      mostrarSucesso("✅ Receita excluída com sucesso!");
      carregarReceitas(); // Recarregar lista
    } else {
      const error = await response.json();
      throw new Error(error.detail || "Erro ao excluir receita");
    }
  } catch (error) {
    console.error("Erro ao excluir receita:", error);
    mostrarErro("❌ Erro ao excluir receita: " + error.message);
  }
}

// Funções de editar e deletar receitas foram movidas para ReceitaUtils
// As funções abaixo são mantidas apenas para compatibilidade

/*
async function editarReceita(id) {
  // Verificar se é admin
  if (!window.RaizesAmazonia.Admin.requireAdmin("🔑 Para editar receitas, digite a senha de administrador:")) {
    return;
  }

  try {
    // Buscar dados da receita atual
    const response = await fetch(`${API_BASE_URL}/api/receitas/${id}`);
    if (!response.ok) {
      throw new Error("Erro ao carregar dados da receita");
    }

    const receita = await response.json();
    mostrarInfo("🔍 Carregando dados da receita para edição...");

    // Abrir modal de edição com dados preenchidos
    abrirModalEditarReceita(receita);
  } catch (error) {
    console.error("Erro ao carregar receita para edição:", error);
    mostrarErro("❌ Erro ao carregar receita para edição: " + error.message);
  }
}
*/

/*
// Modal para editar receita
function abrirModalEditarReceita(receita) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>✏️ Editar Receita</h2>
        <button class="modal-close" onclick="fecharModal()">&times;</button>
      </div>
      <form id="formEditarReceita" enctype="multipart/form-data">
        <input type="hidden" id="receitaId" value="${receita.id}">
        
        <div class="form-group">
          <label for="nomeReceita">Nome da Receita *:</label>
          <input type="text" id="nomeReceita" name="nome" required 
                 placeholder="Ex: Tacacá, Açaí na tigela..." 
                 value="${receita.nome || ""}">
        </div>
        
        <div class="form-group">
          <label for="descricaoReceita">Descrição *:</label>
          <textarea id="descricaoReceita" name="descricao" rows="3" required 
                    placeholder="Breve descrição da receita...">${
                      receita.descricao || ""
                    }</textarea>
        </div>
        
        <div class="form-group">
          <label for="historiaReceita">História da Receita:</label>
          <textarea id="historiaReceita" name="historia" rows="4" 
                    placeholder="Conte a origem e tradição desta receita...">${
                      receita.historia || ""
                    }</textarea>
          <small class="form-help">Opcional: compartilhe a história e tradição por trás desta receita</small>
        </div>
        
        <div class="form-group">
          <label for="ingredientesReceita">Ingredientes *:</label>
          <textarea id="ingredientesReceita" name="ingredientes" rows="6" required 
                    placeholder="Liste os ingredientes, um por linha...">${
                      receita.ingredientes || ""
                    }</textarea>
          <small class="form-help">Liste cada ingrediente em uma linha separada</small>
        </div>
        
        <div class="form-group">
          <label for="modoPreparoReceita">Modo de Preparo *:</label>
          <textarea id="modoPreparoReceita" name="modo_preparo" rows="8" required 
                    placeholder="Descreva o passo a passo...">${
                      receita.modo_preparo || ""
                    }</textarea>
          <small class="form-help">Descreva cada passo em uma linha separada</small>
        </div>
        
        <div class="form-group">
          <label for="imagemReceita">Imagem da Receita:</label>
          <input type="file" id="imagemReceita" name="imagem" accept="image/*">
          <small class="form-help">Opcional: máximo 5MB (JPG, PNG, WebP)</small>
          ${
            receita.imagem
              ? `
            <div class="imagem-atual">
              <p>Imagem atual:</p>
              <img src="${API_BASE_URL}${receita.imagem}" alt="Imagem atual" 
                   style="max-width: 200px; max-height: 150px; border-radius: 5px; margin-top: 0.5rem;">
              <p><small>Selecione uma nova imagem para substituir</small></p>
            </div>
          `
              : ""
          }
          <div id="previewContainer" class="preview-container" style="display: none;">
            <p>Pré-visualização:</p>
            <img id="previewImage" style="max-width: 100%; max-height: 200px; border-radius: 5px;">
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" onclick="fecharModal()">Cancelar</button>
          <button type="submit" class="btn-submit">💾 Salvar Alterações</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Configurar preview da imagem
  const inputImagem = document.getElementById("imagemReceita");
  inputImagem.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      // Verificar tamanho do arquivo (5MB)
      if (file.size > 5 * 1024 * 1024) {
        mostrarAviso("⚠️ Arquivo muito grande! Máximo permitido: 5MB");
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        const preview = document.getElementById("previewImage");
        const container = document.getElementById("previewContainer");
        preview.src = e.target.result;
        container.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      document.getElementById("previewContainer").style.display = "none";
    }
  });

  // Configurar submit do formulário
  document
    .getElementById("formEditarReceita")
    .addEventListener("submit", salvarEdicaoReceita);
}
*/

/*
// Modal para nova receita
function abrirModalNovaReceita() {
  // Verificar se é admin
  if (!window.RaizesAmazonia.Admin.requireAdmin("🔑 Para criar receitas, digite a senha de administrador:")) {
    return;
  }

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Adicionar Nova Receita</h2>
        <button class="modal-close" onclick="fecharModal()">&times;</button>
      </div>
      <form id="formNovaReceita" enctype="multipart/form-data">
        <div class="form-group">
          <label for="nomeReceita">Nome da Receita *:</label>
          <input type="text" id="nomeReceita" name="nome" required placeholder="Ex: Tacacá, Açaí na tigela...">
        </div>
        
        <div class="form-group">
          <label for="descricaoReceita">Descrição *:</label>
          <textarea id="descricaoReceita" name="descricao" rows="3" required placeholder="Breve descrição da receita..."></textarea>
        </div>
        
        <div class="form-group">
          <label for="historiaReceita">Um Pouco da História:</label>
          <textarea id="historiaReceita" name="historia" rows="4" placeholder="Conte a origem e tradição desta receita..."></textarea>
        </div>
        
        <div class="form-group">
          <label for="ingredientesReceita">Ingredientes *:</label>
          <textarea id="ingredientesReceita" name="ingredientes" rows="6" required placeholder="Liste os ingredientes, um por linha ou separados por vírgula..."></textarea>
        </div>
        
        <div class="form-group">
          <label for="modoPreparoReceita">Modo de Preparo *:</label>
          <textarea id="modoPreparoReceita" name="modo_preparo" rows="8" required placeholder="Descreva o passo a passo do preparo..."></textarea>
        </div>
        
        <div class="form-group">
          <label for="imagemReceita">Imagem (opcional):</label>
          <input type="file" id="imagemReceita" name="imagem" accept="image/*">
          <small class="form-help">Formatos aceitos: JPG, PNG, GIF. Máximo: 5MB</small>
          <div class="preview-container">
            <img id="previewImagem" src="" alt="Preview" style="display: none;">
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" onclick="fecharModal()">Cancelar</button>
          <button type="submit" class="btn-submit">Adicionar Receita</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Preview da imagem
  document
    .getElementById("imagemReceita")
    .addEventListener("change", function (e) {
      const file = e.target.files[0];
      const preview = document.getElementById("previewImagem");

      if (file) {
        // Verificar tamanho do arquivo (5MB)
        if (file.size > 5 * 1024 * 1024) {
          mostrarAviso("⚠️ Arquivo muito grande! Máximo permitido: 5MB");
          this.value = "";
          preview.style.display = "none";
          return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
          preview.src = e.target.result;
          preview.style.display = "block";
        };
        reader.readAsDataURL(file);
      } else {
        preview.style.display = "none";
      }
    });

  // Submit do formulário
  document
    .getElementById("formNovaReceita")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      await criarReceita(this);
    });

  // Focar no primeiro campo
  setTimeout(() => {
    document.getElementById("nomeReceita").focus();
  }, 100);
}
*/

function fecharModal() {
  const modal = document.querySelector(".modal-overlay");
  if (modal) {
    modal.remove();
  }
}

/*
async function criarReceita(form) {
  const formData = new FormData(form);
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;

  // Validar campos obrigatórios
  const nome = formData.get("nome").trim();
  const descricao = formData.get("descricao").trim();
  const ingredientes = formData.get("ingredientes").trim();
  const modoPreparo = formData.get("modo_preparo").trim();

  if (!nome || !descricao || !ingredientes || !modoPreparo) {
    mostrarErro(
      "❌ Por favor, preencha todos os campos obrigatórios (Nome, Descrição, Ingredientes e Modo de Preparo)."
    );
    return;
  }

  mostrarInfo("🍽️ Criando nova receita...");
  submitButton.textContent = "Criando...";
  submitButton.disabled = true;

  try {
    const response = await fetch(`${API_BASE_URL}/api/receitas`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const novaReceita = await response.json();
      mostrarSucesso(
        "✅ Receita adicionada com sucesso! Sua nova receita está disponível na lista."
      );
      fecharModal();
      carregarReceitas(); // Recarregar lista
    } else {
      const error = await response.json();
      throw new Error(error.detail || "Erro ao criar receita");
    }
  } catch (error) {
    console.error("Erro ao criar receita:", error);
    mostrarErro("❌ Erro ao criar receita: " + error.message);
  } finally {
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }
}
*/

/*
// Função para salvar edição da receita
async function salvarEdicaoReceita(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData();

  // Pegar ID da receita
  const receitaId = document.getElementById("receitaId").value;

  // Validar campos obrigatórios
  const nome = form.nome.value.trim();
  const descricao = form.descricao.value.trim();
  const ingredientes = form.ingredientes.value.trim();
  const modo_preparo = form.modo_preparo.value.trim();

  if (!nome || !descricao || !ingredientes || !modo_preparo) {
    mostrarErro(
      "❌ Por favor, preencha todos os campos obrigatórios (Nome, Descrição, Ingredientes e Modo de Preparo)."
    );
    return;
  }

  // Adicionar dados ao FormData
  formData.append("nome", nome);
  formData.append("descricao", descricao);
  formData.append("historia", form.historia.value.trim());
  formData.append("ingredientes", ingredientes);
  formData.append("modo_preparo", modo_preparo);

  // Adicionar imagem se selecionada
  const imagemFile = form.imagem.files[0];
  if (imagemFile) {
    formData.append("imagem", imagemFile);
  }

  try {
    mostrarInfo("💾 Salvando alterações da receita...");

    const response = await fetch(`${API_BASE_URL}/api/receitas/${receitaId}`, {
      method: "PUT",
      body: formData,
    });

    if (response.ok) {
      mostrarSucesso(
        "✅ Receita atualizada com sucesso! As alterações foram salvas."
      );
      fecharModal();
      carregarReceitas(); // Recarregar lista
    } else {
      const error = await response.text();
      throw new Error(error);
    }
  } catch (error) {
    console.error("Erro ao atualizar receita:", error);
    mostrarErro("❌ Erro ao atualizar receita: " + error.message);
  }
}
*/

// Carregar receitas e dicas quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  // Verificar se estava logado como admin
  if (sessionStorage.getItem("isAdmin") === "true") {
    isAdmin = true;
  }

  // Verificar admin inicial
  verificarAdminInicial();

  carregarReceitas();

  // Aguardar um pouco antes de carregar as dicas para garantir que o DOM está completamente pronto
  setTimeout(() => {
    carregarDicas();
  }, 300);

  // Configurar formulário de contato
  const formContato = document.getElementById("form-contato");
  if (formContato) {
    formContato.addEventListener("submit", enviarContato);
  }
});

// Função para carregar dicas da API com retry logic
window.carregarDicas = async function carregarDicas(tentativas = 3) {
  try {
    // Aguardar um pouco para garantir que o DOM está pronto
    await new Promise((resolve) => setTimeout(resolve, 100));

    const response = await fetch(`${API_BASE_URL}/api/dicas`);

    if (!response.ok) {
      throw new Error(`Erro ao carregar dicas: ${response.status}`);
    }

    const dicas = await response.json();
    const dicasList = document.querySelector(".dicas-scroll ul");

    // Verificar se o elemento existe
    if (!dicasList) {
      console.log("Elemento .dicas-scroll ul não encontrado na página");
      // Se não encontrou e ainda tem tentativas, tenta novamente após um delay
      if (tentativas > 1) {
        console.log(
          `Tentando novamente... (${tentativas - 1} tentativas restantes)`
        );
        setTimeout(() => carregarDicas(tentativas - 1), 500);
      }
      return;
    }

    // Limpar lista existente
    dicasList.innerHTML = "";

    if (dicas.length === 0) {
      const li = document.createElement("li");
      li.innerHTML =
        '<em style="color: #666;">Nenhuma dica culinária cadastrada ainda.</em>';
      dicasList.appendChild(li);
      return;
    }

    dicas.forEach((dica) => {
      const li = document.createElement("li");
      li.textContent = dica.texto;

      // Adicionar botões de admin se estiver no modo admin
      if (typeof isAdmin !== "undefined" && isAdmin) {
        const actionsDiv = document.createElement("div");
        actionsDiv.className = "dica-actions";
        actionsDiv.style.cssText = `
          margin-top: 0.5rem;
          display: flex;
          gap: 0.5rem;
          opacity: 0;
          transition: opacity 0.3s ease;
        `;

        const editBtn = document.createElement("button");
        editBtn.textContent = "Editar";
        editBtn.className = "btn-small btn-edit";
        editBtn.onclick = () => editarDica(dica.id, dica.texto);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Excluir";
        deleteBtn.className = "btn-small btn-delete";
        deleteBtn.onclick = () => excluirDica(dica.id);

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        li.appendChild(actionsDiv);

        // Mostrar ações no hover
        li.addEventListener("mouseenter", () => {
          actionsDiv.style.opacity = "1";
        });

        li.addEventListener("mouseleave", () => {
          actionsDiv.style.opacity = "0";
        });
      }

      dicasList.appendChild(li);
    });
  } catch (error) {
    console.error("Erro ao carregar dicas:", error);

    // Se ainda tem tentativas, tenta novamente
    if (tentativas > 1) {
      console.log(
        `Erro ao carregar dicas. Tentando novamente... (${
          tentativas - 1
        } tentativas restantes)`
      );
      setTimeout(() => carregarDicas(tentativas - 1), 1000);
      return;
    }

    const dicasList = document.querySelector(".dicas-scroll ul");
    if (dicasList) {
      dicasList.innerHTML = "";

      const li = document.createElement("li");
      li.innerHTML =
        '<em style="color: #dc3545;">Erro ao carregar dicas. Verifique se o servidor está funcionando.</em>';
      dicasList.appendChild(li);
    }
  }
};

// Funções para gerenciar dicas (modo admin)
function mostrarConfirmacao(titulo, mensagem, onConfirm, onCancel = null) {
  return new Promise((resolve) => {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.style.zIndex = "15000"; // Maior que as mensagens toast

    modal.innerHTML = `
      <div class="modal-content" style="max-width: 400px; text-align: center;">
        <div class="confirmacao-header" style="margin-bottom: 1.5rem;">
          <h3 style="color: #dc3545; margin: 0; font-size: 1.5rem;">🗑️ ${titulo}</h3>
        </div>
        <div class="confirmacao-body" style="margin-bottom: 2rem;">
          <p style="margin: 0; line-height: 1.6; color: #555;">${mensagem}</p>
        </div>
        <div class="confirmacao-actions" style="display: flex; gap: 1rem; justify-content: center;">
          <button id="confirmar-cancelar" style="
            padding: 0.75rem 1.5rem;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
          ">Cancelar</button>
          <button id="confirmar-excluir" style="
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #dc3545 0%, #bb2d3b 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
          ">Sim, Excluir</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Adicionar eventos
    const btnCancelar = modal.querySelector("#confirmar-cancelar");
    const btnConfirmar = modal.querySelector("#confirmar-excluir");

    btnCancelar.addEventListener("mouseenter", () => {
      btnCancelar.style.background = "#5a6268";
    });

    btnCancelar.addEventListener("mouseleave", () => {
      btnCancelar.style.background = "#6c757d";
    });

    btnConfirmar.addEventListener("mouseenter", () => {
      btnConfirmar.style.background =
        "linear-gradient(135deg, #bb2d3b 0%, #a02834 100%)";
    });

    btnConfirmar.addEventListener("mouseleave", () => {
      btnConfirmar.style.background =
        "linear-gradient(135deg, #dc3545 0%, #bb2d3b 100%)";
    });

    function fecharModal() {
      modal.remove();
    }

    btnCancelar.addEventListener("click", () => {
      fecharModal();
      if (onCancel) onCancel();
      resolve(false);
    });

    btnConfirmar.addEventListener("click", () => {
      fecharModal();
      if (onConfirm) onConfirm();
      resolve(true);
    });

    // Fechar ao clicar fora
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        fecharModal();
        if (onCancel) onCancel();
        resolve(false);
      }
    });

    // Fechar com ESC
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        document.removeEventListener("keydown", handleEsc);
        fecharModal();
        if (onCancel) onCancel();
        resolve(false);
      }
    };

    document.addEventListener("keydown", handleEsc);
  });
}

/* Sistema de Autenticação Simples */
// A variável isAdmin agora é gerenciada pelo AdminManager

// Função para verificar se é admin antes de ações administrativas
async function verificarAdmin() {
  if (isAdmin) {
    return true;
  }

  const senha = prompt("🔑 Digite a senha de administrador:");

  if (senha === "admin123") {
    isAdmin = true;
    sessionStorage.setItem("isAdmin", "true");
    mostrarSucesso("✅ Login de administrador realizado!");
    return true;
  } else if (senha !== null) {
    mostrarErro("❌ Senha incorreta! Acesso negado.");
  }

  return false;
}

// Fazer logout
function logout() {
  isAdmin = false;
  sessionStorage.removeItem("isAdmin");
  mostrarInfo("👋 Logout realizado.");
}

/* Inicialização da página */
// Funções para gerenciar dicas (modo admin) - tornando globais
window.adicionarDica = async function adicionarDica() {
  const texto = prompt("Digite a nova dica culinária:");

  if (!texto || texto.trim() === "") {
    mostrarMensagem("Por favor, digite uma dica válida.", "warning");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("texto", texto.trim());

    const response = await fetch(`${API_BASE_URL}/api/dicas`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar dica: ${response.status}`);
    }

    mostrarMensagem("Dica adicionada com sucesso!", "success");
    carregarDicas(); // Recarregar lista
  } catch (error) {
    console.error("Erro ao adicionar dica:", error);
    mostrarMensagem("Erro ao adicionar dica. Tente novamente.", "error");
  }
};

window.editarDica = async function editarDica(id, textoAtual) {
  const novoTexto = prompt("Editar dica:", textoAtual);

  if (!novoTexto || novoTexto.trim() === "") {
    mostrarMensagem("Por favor, digite uma dica válida.", "warning");
    return;
  }

  if (novoTexto.trim() === textoAtual) {
    mostrarMensagem("Nenhuma alteração foi feita.", "info");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("texto", novoTexto.trim());

    const response = await fetch(`${API_BASE_URL}/api/dicas/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Erro ao atualizar dica: ${response.status}`);
    }

    mostrarMensagem("Dica atualizada com sucesso!", "success");
    carregarDicas(); // Recarregar lista
  } catch (error) {
    console.error("Erro ao editar dica:", error);
    mostrarMensagem("Erro ao editar dica. Tente novamente.", "error");
  }
};

window.excluirDica = async function excluirDica(id) {
  const confirmacao = await mostrarConfirmacao(
    "Confirmar Exclusão",
    "Tem certeza que deseja excluir esta dica? Esta ação não pode ser desfeita."
  );

  if (!confirmacao) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/dicas/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Erro ao excluir dica: ${response.status}`);
    }

    mostrarMensagem("Dica excluída com sucesso!", "success");
    carregarDicas(); // Recarregar lista
  } catch (error) {
    console.error("Erro ao excluir dica:", error);
    mostrarMensagem("Erro ao excluir dica. Tente novamente.", "error");
  }
};

// Função para enviar formulário de contato
async function enviarContato(event) {
  event.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const mensagem = document.getElementById("mensagem").value.trim();
  const submitButton = event.target.querySelector('button[type="submit"]');

  // Validação básica
  if (!nome || !email || !mensagem) {
    mostrarMensagem("Por favor, preencha todos os campos.", "warning");
    return;
  }

  // Validação de email básica
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    mostrarMensagem("Por favor, digite um email válido.", "warning");
    return;
  }

  // Desabilitar botão e mostrar loading
  const textoOriginal = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";
  submitButton.style.opacity = "0.6";
  submitButton.style.cursor = "not-allowed";

  // Mostrar feedback imediato
  mostrarMensagem("Enviando mensagem...", "info", 2000);

  try {
    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("email", email);
    formData.append("mensagem", mensagem);

    const response = await fetch(`${API_BASE_URL}/api/contato`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || `Erro ${response.status}`);
    }

    mostrarMensagem(
      result.message || "Mensagem enviada com sucesso!",
      "success"
    );

    // Limpar formulário
    document.getElementById("form-contato").reset();
  } catch (error) {
    console.error("Erro ao enviar contato:", error);

    if (error.message.includes("503")) {
      mostrarMensagem(
        "Serviço de email temporariamente indisponível. Tente novamente mais tarde.",
        "error"
      );
    } else {
      mostrarMensagem("Erro ao enviar mensagem. Tente novamente.", "error");
    }
  } finally {
    // Restaurar botão
    setTimeout(() => {
      submitButton.disabled = false;
      submitButton.textContent = textoOriginal;
      submitButton.style.opacity = "1";
      submitButton.style.cursor = "pointer";
    }, 1000); // Aguardar 1 segundo antes de reabilitar
  }
}

// =============================================
// SISTEMA DE ADMINISTRAÇÃO BÁSICO
// =============================================

// Variável global para controlar modo admin
let isAdmin = false;

// Função para alternar modo admin
window.toggleAdmin = function () {
  if (!isAdmin) {
    const senha = prompt("Digite a senha do administrador:");
    if (senha === "admin123") {
      isAdmin = true;
      sessionStorage.setItem("isAdmin", "true");
      atualizarModoAdmin();
      mostrarMensagem("✅ Modo administrador ativado!", "success");
    } else {
      mostrarMensagem("❌ Senha incorreta!", "error");
    }
  } else {
    isAdmin = false;
    sessionStorage.removeItem("isAdmin");
    atualizarModoAdmin();
    mostrarMensagem("ℹ️ Modo administrador desativado!", "info");
  }
};

// Função para atualizar interface do modo admin
function atualizarModoAdmin() {
  const adminButton = document.getElementById("admin-toggle");
  if (adminButton) {
    adminButton.textContent = isAdmin ? "Sair Admin" : "Admin";
    adminButton.style.backgroundColor = isAdmin ? "#dc3545" : "#2e7d32";
  }

  // Recarregar receitas e dicas para mostrar/ocultar botões de admin
  carregarReceitas();
  carregarDicas();
}

// Botão para adicionar nova receita (só aparece no modo admin)
function adicionarBotaoNovaReceita() {
  if (!isAdmin) return;

  const container = document.querySelector(".card-container");
  if (!container) return;

  // Verificar se já existe o botão
  if (container.querySelector(".add-receita-card")) return;

  const addCard = document.createElement("div");
  addCard.className = "card add-receita-card";
  addCard.innerHTML = `
    <div class="add-receita-content">
      <div class="add-icon">➕</div>
      <h3>Adicionar Nova Receita</h3>
      <p>Clique para adicionar uma nova receita amazônica</p>
      <button onclick="window.location.href='pages/todas-receitas.html'" class="card-button">Gerenciar Receitas</button>
    </div>
  `;

  // Adicionar no início do container
  container.insertBefore(addCard, container.firstChild);
}

// Função para verificar admin na inicialização
function verificarAdminInicial() {
  if (sessionStorage.getItem("isAdmin") === "true") {
    isAdmin = true;
    atualizarModoAdmin();
  }
}

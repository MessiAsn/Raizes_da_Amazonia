/* Modal Utilities - Sistema de Modais Reutilizável */

// Namespace principal da aplicação
window.RaizesAmazonia = window.RaizesAmazonia || {};

/**
 * ModalManager - Gerenciador de Modais Reutilizável
 * Centraliza a criação e gestão de modais para todo o sistema
 */
window.RaizesAmazonia.ModalManager = {
  
  /**
   * Criar modal de edição de receita
   */
  criarModalEditarReceita(receita) {
    const API_BASE_URL = window.RaizesAmazonia?.Config?.API_BASE_URL || "http://localhost:8000";
    
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.id = "modal-editar-receita";
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>✏️ Editar Receita</h2>
          <button class="modal-close" onclick="window.RaizesAmazonia.ModalManager.fecharModal('modal-editar-receita')">&times;</button>
        </div>
        <form id="form-editar-receita" enctype="multipart/form-data">
          <input type="hidden" id="edit-receita-id" value="${receita.id}">
          
          <div class="form-group">
            <label for="edit-nome">Nome da Receita *:</label>
            <input type="text" id="edit-nome" name="nome" required 
                   placeholder="Ex: Tacacá, Açaí na tigela..." 
                   value="${receita.nome || ""}">
          </div>
          
          <div class="form-group">
            <label for="edit-descricao">Descrição *:</label>
            <textarea id="edit-descricao" name="descricao" rows="3" required 
                      placeholder="Breve descrição da receita...">${receita.descricao || ""}</textarea>
          </div>
          
          <div class="form-group">
            <label for="edit-historia">História da Receita:</label>
            <textarea id="edit-historia" name="historia" rows="4" 
                      placeholder="Conte a origem e tradição desta receita...">${receita.historia || ""}</textarea>
            <small class="form-help">Opcional: compartilhe a história e tradição por trás desta receita</small>
          </div>
          
          <div class="form-group">
            <label for="edit-ingredientes">Ingredientes *:</label>
            <textarea id="edit-ingredientes" name="ingredientes" rows="6" required 
                      placeholder="Liste os ingredientes, um por linha...">${receita.ingredientes || ""}</textarea>
            <small class="form-help">Liste cada ingrediente em uma linha separada</small>
          </div>
          
          <div class="form-group">
            <label for="edit-modo_preparo">Modo de Preparo *:</label>
            <textarea id="edit-modo_preparo" name="modo_preparo" rows="8" required 
                      placeholder="Descreva o passo a passo...">${receita.modo_preparo || ""}</textarea>
            <small class="form-help">Descreva cada passo em uma linha separada</small>
          </div>
          
          <div class="form-group">
            <label for="edit-imagem">Imagem da Receita:</label>
            <input type="file" id="edit-imagem" name="imagem" accept="image/*">
            <small class="form-help">Opcional: máximo 5MB (JPG, PNG, WebP)</small>
            ${receita.imagem ? `
              <div class="imagem-atual">
                <p>Imagem atual:</p>
                <img src="${API_BASE_URL}${receita.imagem}" alt="Imagem atual" 
                     style="max-width: 200px; max-height: 150px; border-radius: 5px; margin-top: 0.5rem;">
                <p><small>Selecione uma nova imagem para substituir</small></p>
              </div>
            ` : ""}
            <div id="edit-preview-container" class="preview-container" style="display: none;">
              <p>Pré-visualização:</p>
              <img id="edit-preview-image" style="max-width: 100%; max-height: 200px; border-radius: 5px;">
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" onclick="window.RaizesAmazonia.ModalManager.fecharModal('modal-editar-receita')">Cancelar</button>
            <button type="submit" class="btn-submit">💾 Salvar Alterações</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    this.configurarPreviewImagem();
    this.configurarFormularioEdicao();
    return modal;
  },

  /**
   * Criar modal de nova receita
   */
  criarModalNovaReceita() {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.id = "modal-nova-receita";
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>➕ Adicionar Nova Receita</h2>
          <button class="modal-close" onclick="window.RaizesAmazonia.ModalManager.fecharModal('modal-nova-receita')">&times;</button>
        </div>
        <form id="form-nova-receita" enctype="multipart/form-data">
          <div class="form-group">
            <label for="nome">Nome da Receita *:</label>
            <input type="text" id="nome" name="nome" required placeholder="Ex: Tacacá, Açaí na tigela...">
          </div>
          
          <div class="form-group">
            <label for="descricao">Descrição *:</label>
            <textarea id="descricao" name="descricao" rows="3" required placeholder="Breve descrição da receita..."></textarea>
          </div>
          
          <div class="form-group">
            <label for="historia">História da Receita:</label>
            <textarea id="historia" name="historia" rows="4" placeholder="Conte a origem e tradição desta receita..."></textarea>
          </div>
          
          <div class="form-group">
            <label for="ingredientes">Ingredientes *:</label>
            <textarea id="ingredientes" name="ingredientes" rows="6" required placeholder="Liste os ingredientes, um por linha ou separados por vírgula..."></textarea>
          </div>
          
          <div class="form-group">
            <label for="modo_preparo">Modo de Preparo *:</label>
            <textarea id="modo_preparo" name="modo_preparo" rows="8" required placeholder="Descreva o passo a passo do preparo..."></textarea>
          </div>
          
          <div class="form-group">
            <label for="imagem">Imagem (opcional):</label>
            <input type="file" id="imagem" name="imagem" accept="image/*">
            <small class="form-help">Formatos aceitos: JPG, PNG, GIF. Máximo: 5MB</small>
            <div id="preview-container" class="preview-container" style="display: none;">
              <p>Pré-visualização:</p>
              <img id="preview-image" style="max-width: 100%; max-height: 200px; border-radius: 5px;">
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" onclick="window.RaizesAmazonia.ModalManager.fecharModal('modal-nova-receita')">Cancelar</button>
            <button type="submit" class="btn-submit">➕ Adicionar Receita</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    this.configurarPreviewImagemNova();
    this.configurarFormularioNova();
    this.abrirModal('modal-nova-receita');
    return modal;
  },

  /**
   * Configurar preview de imagem para edição
   */
  configurarPreviewImagem() {
    const inputImagem = document.getElementById("edit-imagem");
    if (inputImagem) {
      inputImagem.addEventListener("change", function (e) {
        const file = e.target.files[0];
        const container = document.getElementById("edit-preview-container");
        const preview = document.getElementById("edit-preview-image");

        if (file) {
          // Verificar tamanho do arquivo (5MB)
          if (file.size > 5 * 1024 * 1024) {
            if (window.mostrarMensagem) {
              window.mostrarMensagem("⚠️ Arquivo muito grande! Máximo permitido: 5MB", "warning");
            } else {
              alert("Arquivo muito grande! Máximo permitido: 5MB");
            }
            e.target.value = "";
            return;
          }

          const reader = new FileReader();
          reader.onload = function (e) {
            preview.src = e.target.result;
            container.style.display = "block";
          };
          reader.readAsDataURL(file);
        } else {
          container.style.display = "none";
        }
      });
    }
  },

  /**
   * Configurar preview de imagem para nova receita
   */
  configurarPreviewImagemNova() {
    const inputImagem = document.getElementById("imagem");
    if (inputImagem) {
      inputImagem.addEventListener("change", function (e) {
        const file = e.target.files[0];
        const container = document.getElementById("preview-container");
        const preview = document.getElementById("preview-image");

        if (file) {
          // Verificar tamanho do arquivo (5MB)
          if (file.size > 5 * 1024 * 1024) {
            if (window.mostrarMensagem) {
              window.mostrarMensagem("⚠️ Arquivo muito grande! Máximo permitido: 5MB", "warning");
            } else {
              alert("Arquivo muito grande! Máximo permitido: 5MB");
            }
            e.target.value = "";
            return;
          }

          const reader = new FileReader();
          reader.onload = function (e) {
            preview.src = e.target.result;
            container.style.display = "block";
          };
          reader.readAsDataURL(file);
        } else {
          container.style.display = "none";
        }
      });
    }
  },

  /**
   * Configurar formulário de edição
   */
  configurarFormularioEdicao() {
    const form = document.getElementById("form-editar-receita");
    if (form) {
      form.addEventListener("submit", this.salvarEdicaoReceita);
    }
  },

  /**
   * Configurar formulário de nova receita
   */
  configurarFormularioNova() {
    const form = document.getElementById("form-nova-receita");
    if (form) {
      form.addEventListener("submit", this.adicionarReceita);
    }
  },

  /**
   * Salvar edição da receita
   */
  async salvarEdicaoReceita(e) {
    e.preventDefault();
    
    const API_BASE_URL = window.RaizesAmazonia?.Config?.API_BASE_URL || "http://localhost:8000";
    const form = e.target;
    const formData = new FormData();

    // Pegar ID da receita
    const receitaId = document.getElementById("edit-receita-id").value;

    // Validar campos obrigatórios
    const nome = form.nome.value.trim();
    const descricao = form.descricao.value.trim();
    const ingredientes = form.ingredientes.value.trim();
    const modo_preparo = form.modo_preparo.value.trim();

    if (!nome || !descricao || !ingredientes || !modo_preparo) {
      if (window.mostrarMensagem) {
        window.mostrarMensagem("❌ Por favor, preencha todos os campos obrigatórios.", "error");
      } else {
        alert("Por favor, preencha todos os campos obrigatórios.");
      }
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
      if (window.mostrarMensagem) {
        window.mostrarMensagem("💾 Salvando alterações...", "info");
      }

      const response = await fetch(`${API_BASE_URL}/api/receitas/${receitaId}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        if (window.mostrarMensagem) {
          window.mostrarMensagem("✅ Receita atualizada com sucesso!", "success");
        } else {
          alert("Receita atualizada com sucesso!");
        }
        
        window.RaizesAmazonia.ModalManager.fecharModal("modal-editar-receita");
        
        // Recarregar lista de receitas
        if (typeof carregarReceitas === "function") {
          carregarReceitas();
        }
        if (typeof carregarTodasReceitas === "function") {
          carregarTodasReceitas();
        }
      } else {
        const error = await response.text();
        throw new Error(error);
      }
    } catch (error) {
      console.error("Erro ao atualizar receita:", error);
      if (window.mostrarMensagem) {
        window.mostrarMensagem("❌ Erro ao atualizar receita", "error");
      } else {
        alert("Erro ao atualizar receita");
      }
    }
  },

  /**
   * Adicionar nova receita - Integrado com sistema centralizado
   */
  async adicionarReceita(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    // Validar campos obrigatórios
    const formData = new FormData(form);
    const nome = formData.get("nome").trim();
    const descricao = formData.get("descricao").trim();
    const ingredientes = formData.get("ingredientes").trim();
    const modoPreparo = formData.get("modo_preparo").trim();

    if (!nome || !descricao || !ingredientes || !modoPreparo) {
      if (window.mostrarMensagem) {
        window.mostrarMensagem("❌ Por favor, preencha todos os campos obrigatórios.", "error");
      } else {
        alert("Por favor, preencha todos os campos obrigatórios.");
      }
      return;
    }

    submitButton.textContent = "Criando...";
    submitButton.disabled = true;

    try {
      // Usar o método centralizado do ReceitaManager
      if (window.RaizesAmazonia?.ReceitaManager?.criarReceita) {
        await window.RaizesAmazonia.ReceitaManager.criarReceita(form);
        
        // Fechar modal após sucesso
        window.RaizesAmazonia.ModalManager.fecharModal("modal-nova-receita");
        
        // Recarregar lista de receitas
        if (typeof carregarReceitas === "function") {
          carregarReceitas();
        }
        if (typeof carregarTodasReceitas === "function") {
          carregarTodasReceitas();
        }
      } else {
        throw new Error("Sistema de receitas não disponível");
      }
    } catch (error) {
      console.error("Erro ao criar receita:", error);
      if (window.mostrarMensagem) {
        window.mostrarMensagem("❌ Erro ao criar receita: " + error.message, "error");
      } else {
        alert("Erro ao criar receita: " + error.message);
      }
    } finally {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  },

  /**
   * Abrir modal
   */
  abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "flex";
      document.body.style.overflow = "hidden";
    }
  },

  /**
   * Fechar modal
   */
  fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
      
      // Se foi criado dinamicamente, remover do DOM
      if (modal.classList.contains('dynamic-modal')) {
        modal.remove();
      }
    }
  }
};

// Funções globais para compatibilidade
window.abrirModal = function(modalId) {
  window.RaizesAmazonia.ModalManager.abrirModal(modalId);
};

window.fecharModal = function(modalId) {
  window.RaizesAmazonia.ModalManager.fecharModal(modalId);
};

// Fechar modal ao clicar fora dele
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("modal-overlay")) {
    const modalId = event.target.id;
    if (modalId) {
      window.RaizesAmazonia.ModalManager.fecharModal(modalId);
    }
  }
});

// ==============================================
// FUNÇÕES GLOBAIS PARA DICAS
// ==============================================

/**
 * Função global para adicionar dica (compatibilidade com index.html)
 */
window.adicionarDica = async function() {
  // Verificar se é admin
  if (!window.RaizesAmazonia?.Admin?.isAdmin) {
    if (!window.RaizesAmazonia?.Admin?.verify()) {
      return;
    }
  }
  
  const conteudo = prompt("Digite o conteúdo da nova dica:");
  
  if (!conteudo || conteudo.trim().length < 10) {
    window.RaizesAmazonia?.Admin?.showMessage("A dica deve ter pelo menos 10 caracteres.", "error");
    return;
  }
  
  try {
    // Usar o DicaManager se disponível
    if (window.RaizesAmazonia?.DicaManager) {
      await window.RaizesAmazonia.DicaManager.criarDica(conteudo.trim());
      window.RaizesAmazonia?.Admin?.showMessage("Dica adicionada com sucesso!", "success");
      
      // Recarregar dicas na página
      if (typeof carregarDicas === 'function') {
        await carregarDicas();
      }
    } else {
      // Fallback
      const API_BASE_URL = window.RaizesAmazonia?.Config?.API_BASE_URL || "http://localhost:8000";
      const formData = new FormData();
      formData.append('conteudo', conteudo.trim());
      
      const response = await fetch(`${API_BASE_URL}/api/dicas`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
      
      const dica = await response.json();
      window.RaizesAmazonia?.Admin?.showMessage("Dica adicionada com sucesso!", "success");
      
      // Recarregar dicas na página
      if (typeof carregarDicas === 'function') {
        await carregarDicas();
      }
    }
    
  } catch (error) {
    console.error('Erro ao adicionar dica:', error);
    window.RaizesAmazonia?.Admin?.showMessage("Erro ao adicionar dica: " + error.message, "error");
  }
};

/**
 * Função para verificar se usuário é admin
 */
window.verificarAdmin = function() {
  return window.RaizesAmazonia?.Admin?.verify() || false;
};

/**
 * Função para toggle admin (compatibilidade)
 */
window.toggleAdmin = function() {
  if (window.RaizesAmazonia?.Admin) {
    window.RaizesAmazonia.Admin.toggle();
  } else {
    console.error('Sistema de Admin não carregado');
  }
};

console.log("%c[ModalManager] Sistema carregado com sucesso", "color: #28a745; font-weight: bold;");

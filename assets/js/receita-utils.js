/* Receita Utils - Funções Reutilizáveis para Gestão de Receitas */

// Namespace principal da aplicação
window.RaizesAmazonia = window.RaizesAmazonia || {};

/**
 * ReceitaUtils - Utilitários para gestão de receitas
 * Funções reutilizáveis que funcionam em qualquer página
 */
window.RaizesAmazonia.ReceitaUtils = {
  
  /**
   * Editar receita - Função unificada
   */
  async editarReceita(id) {
    // Verificar se é admin com múltiplas fontes
    let isUserAdmin = false;
    let adminSource = 'Nenhum';
    
    if (window.RaizesAmazonia?.adminManager) {
      isUserAdmin = window.RaizesAmazonia.adminManager.isLoggedIn;
      adminSource = 'AdminManager';
    } else if (typeof isAdmin !== 'undefined') {
      isUserAdmin = isAdmin;
      adminSource = 'Global isAdmin';
    } else if (sessionStorage.getItem('isAdmin') === 'true') {
      isUserAdmin = true;
      adminSource = 'SessionStorage';
    }
    
    console.log(`[ReceitaUtils.editarReceita] Admin check: ${isUserAdmin} via ${adminSource}`);
    
    if (!isUserAdmin) {
      if (window.mostrarMensagem) {
        window.mostrarMensagem("Acesso negado. Faça login como administrador.", "error");
      } else {
        alert("Acesso negado. Faça login como administrador.");
      }
      return;
    }

    const API_BASE_URL = window.RaizesAmazonia?.Config?.API_BASE_URL || "http://localhost:8000";
    
    try {
      if (window.mostrarMensagem) {
        window.mostrarMensagem("🔍 Carregando dados da receita...", "info");
      }

      // Buscar dados da receita atual
      const response = await fetch(`${API_BASE_URL}/api/receitas/${id}`);
      if (!response.ok) {
        throw new Error("Erro ao carregar dados da receita");
      }

      const receita = await response.json();

      // Verificar se já existe um modal de edição (páginas com HTML estático)
      let modal = document.getElementById("modal-editar-receita");
      
      if (modal) {
        // Modal já existe (todas-receitas.html), apenas preencher dados
        document.getElementById("edit-nome").value = receita.nome;
        document.getElementById("edit-descricao").value = receita.descricao;
        document.getElementById("edit-ingredientes").value = receita.ingredientes;
        document.getElementById("edit-modo_preparo").value = receita.modo_preparo;
        document.getElementById("edit-historia").value = receita.historia || "";
        
        // Armazenar ID para uso posterior
        if (document.getElementById("edit-receita-id")) {
          document.getElementById("edit-receita-id").value = receita.id;
        } else {
          // Criar campo hidden se não existir
          const hiddenInput = document.createElement("input");
          hiddenInput.type = "hidden";
          hiddenInput.id = "edit-receita-id";
          hiddenInput.value = receita.id;
          modal.querySelector("form").appendChild(hiddenInput);
        }

        // Limpar preview de imagem
        const previewContainer = document.getElementById("edit-preview-container");
        if (previewContainer) {
          previewContainer.style.display = "none";
        }
        
        const imagemInput = document.getElementById("edit-imagem");
        if (imagemInput) {
          imagemInput.value = "";
        }

        window.RaizesAmazonia.ModalManager.abrirModal("modal-editar-receita");
      } else {
        // Modal não existe (index.html), criar dinamicamente
        modal = window.RaizesAmazonia.ModalManager.criarModalEditarReceita(receita);
        modal.classList.add('dynamic-modal'); // Marcar para remoção
        window.RaizesAmazonia.ModalManager.abrirModal("modal-editar-receita");
      }
      
    } catch (error) {
      console.error("Erro ao carregar receita para edição:", error);
      if (window.mostrarMensagem) {
        window.mostrarMensagem("❌ Erro ao carregar receita para edição", "error");
      } else {
        alert("Erro ao carregar receita para edição");
      }
    }
  },

  /**
   * Deletar receita - Função unificada
   */
  async deletarReceita(id) {
    // Verificar se é admin com múltiplas fontes
    let isUserAdmin = false;
    let adminSource = 'Nenhum';
    
    if (window.RaizesAmazonia?.adminManager) {
      isUserAdmin = window.RaizesAmazonia.adminManager.isLoggedIn;
      adminSource = 'AdminManager';
    } else if (typeof isAdmin !== 'undefined') {
      isUserAdmin = isAdmin;
      adminSource = 'Global isAdmin';
    } else if (sessionStorage.getItem('isAdmin') === 'true') {
      isUserAdmin = true;
      adminSource = 'SessionStorage';
    }
    
    console.log(`[ReceitaUtils.deletarReceita] Admin check: ${isUserAdmin} via ${adminSource}`);
    
    if (!isUserAdmin) {
      if (window.mostrarMensagem) {
        window.mostrarMensagem("Acesso negado. Faça login como administrador.", "error");
      } else {
        alert("Acesso negado. Faça login como administrador.");
      }
      return;
    }

    const API_BASE_URL = window.RaizesAmazonia?.Config?.API_BASE_URL || "http://localhost:8000";
    
    // Buscar nome da receita para personalizar a mensagem
    let nomeReceita = "esta receita";
    try {
      const response = await fetch(`${API_BASE_URL}/api/receitas/${id}`);
      if (response.ok) {
        const receita = await response.json();
        nomeReceita = `"${receita.nome}"`;
      }
    } catch (error) {
      console.log("Não foi possível buscar o nome da receita");
    }

    // Usar função de confirmação se disponível
    let confirmou = false;
    if (window.mostrarConfirmacao) {
      confirmou = await window.mostrarConfirmacao(
        "Confirmar Exclusão",
        `Tem certeza que deseja excluir a receita ${nomeReceita}?\n\n⚠️ Esta ação não pode ser desfeita e todos os dados da receita serão perdidos permanentemente.`,
        null,
        () => {
          if (window.mostrarMensagem) {
            window.mostrarMensagem("❌ Exclusão cancelada", "info");
          }
        }
      );
    } else {
      // Fallback para confirm simples
      confirmou = confirm(`Tem certeza que deseja excluir a receita ${nomeReceita}?\n\nEsta ação não pode ser desfeita.`);
    }

    if (!confirmou) {
      return;
    }

    try {
      if (window.mostrarMensagem) {
        window.mostrarMensagem("🗑️ Excluindo receita...", "info");
      }

      const response = await fetch(`${API_BASE_URL}/api/receitas/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        if (window.mostrarMensagem) {
          window.mostrarMensagem(`✅ Receita ${nomeReceita} excluída com sucesso!`, "success");
        } else {
          alert(`Receita ${nomeReceita} excluída com sucesso!`);
        }
        
        // Recarregar lista de receitas
        if (typeof carregarReceitas === "function") {
          carregarReceitas();
        }
        if (typeof carregarTodasReceitas === "function") {
          carregarTodasReceitas();
        }
      } else {
        const error = await response.json();
        throw new Error(error.detail || "Erro ao excluir receita");
      }
    } catch (error) {
      console.error("Erro ao excluir receita:", error);
      if (window.mostrarMensagem) {
        window.mostrarMensagem("❌ Erro ao excluir receita: " + error.message, "error");
      } else {
        alert("Erro ao excluir receita: " + error.message);
      }
    }
  },

  /**
   * Abrir modal para nova receita - Função unificada
   */
  abrirModalNovaReceita() {
    // Verificar se é admin com múltiplas fontes
    let isUserAdmin = false;
    let adminSource = 'Nenhum';
    
    if (window.RaizesAmazonia?.adminManager) {
      isUserAdmin = window.RaizesAmazonia.adminManager.isLoggedIn;
      adminSource = 'AdminManager';
    } else if (typeof isAdmin !== 'undefined') {
      isUserAdmin = isAdmin;
      adminSource = 'Global isAdmin';
    } else if (sessionStorage.getItem('isAdmin') === 'true') {
      isUserAdmin = true;
      adminSource = 'SessionStorage';
    }
    
    console.log(`[ReceitaUtils.abrirModalNovaReceita] Admin check: ${isUserAdmin} via ${adminSource}`);
    
    if (!isUserAdmin) {
      if (window.mostrarMensagem) {
        window.mostrarMensagem("Acesso negado. Faça login como administrador.", "error");
      } else {
        alert("Acesso negado. Faça login como administrador.");
      }
      return;
    }

    // Verificar se já existe um modal estático
    let modal = document.getElementById("modal-nova-receita");
    
    if (modal) {
      // Modal já existe (todas-receitas.html), apenas limpar e abrir
      const form = document.getElementById("form-nova-receita");
      if (form) {
        form.reset();
      }
      
      // Limpar preview se existir
      const previewContainer = document.getElementById("preview-container");
      if (previewContainer) {
        previewContainer.style.display = "none";
      }
      
      window.RaizesAmazonia.ModalManager.abrirModal("modal-nova-receita");
    } else {
      // Modal não existe (index.html), criar dinamicamente
      modal = window.RaizesAmazonia.ModalManager.criarModalNovaReceita();
      modal.classList.add('dynamic-modal'); // Marcar para remoção
      window.RaizesAmazonia.ModalManager.abrirModal("modal-nova-receita");
      
      // Focar no primeiro campo após criação
      setTimeout(() => {
        const nomeInput = document.getElementById("nome");
        if (nomeInput) {
          nomeInput.focus();
        }
      }, 100);
    }
  },

  /**
   * Criar nova receita - Função unificada
   */
  criarReceita() {
    return this.abrirModalNovaReceita();
  }
};

// Funções globais para compatibilidade
window.editarReceita = function(id) {
  return window.RaizesAmazonia.ReceitaUtils.editarReceita(id);
};

window.deletarReceita = function(id) {
  return window.RaizesAmazonia.ReceitaUtils.deletarReceita(id);
};

window.abrirModalNovaReceita = function() {
  return window.RaizesAmazonia.ReceitaUtils.abrirModalNovaReceita();
};

window.criarReceita = function() {
  return window.RaizesAmazonia.ReceitaUtils.criarReceita();
};

console.log("%c[ReceitaUtils] Sistema carregado com sucesso", "color: #17a2b8; font-weight: bold;");

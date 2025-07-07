/* Receita Utils */

window.RaizesAmazonia = window.RaizesAmazonia || {};

window.RaizesAmazonia.ReceitaUtils = {
  async editarReceita(id) {
    let isUserAdmin = false;
    let adminSource = "Nenhum";

    if (window.RaizesAmazonia?.adminManager) {
      isUserAdmin = window.RaizesAmazonia.adminManager.isLoggedIn;
      adminSource = "AdminManager";
    } else if (typeof isAdmin !== "undefined") {
      isUserAdmin = isAdmin;
      adminSource = "Global isAdmin";
    } else if (sessionStorage.getItem("isAdmin") === "true") {
      isUserAdmin = true;
      adminSource = "SessionStorage";
    }

    console.log(
      `[ReceitaUtils.editarReceita] Admin check: ${isUserAdmin} via ${adminSource}`
    );

    if (!isUserAdmin) {
      if (window.mostrarMensagem) {
        window.mostrarMensagem(
          "Acesso negado. Faça login como administrador.",
          "error"
        );
      } else {
        alert("Acesso negado. Faça login como administrador.");
      }
      return;
    }

    const API_BASE_URL =
      window.RaizesAmazonia?.Config?.API_BASE_URL || "http://localhost:8000";

    try {
      if (window.mostrarMensagem) {
        window.mostrarMensagem("Carregando dados da receita...", "info");
      }

      const response = await fetch(`${API_BASE_URL}/api/receitas/${id}`);
      if (!response.ok) {
        throw new Error("Erro ao carregar dados da receita");
      }

      const receita = await response.json();

      let modal = document.getElementById("modal-editar-receita");

      if (modal) {
        document.getElementById("edit-nome").value = receita.nome;
        document.getElementById("edit-descricao").value = receita.descricao;
        document.getElementById("edit-ingredientes").value =
          receita.ingredientes;
        document.getElementById("edit-modo_preparo").value =
          receita.modo_preparo;
        document.getElementById("edit-historia").value = receita.historia || "";

        if (document.getElementById("edit-receita-id")) {
          document.getElementById("edit-receita-id").value = receita.id;
        } else {
          const hiddenInput = document.createElement("input");
          hiddenInput.type = "hidden";
          hiddenInput.id = "edit-receita-id";
          hiddenInput.value = receita.id;
          modal.querySelector("form").appendChild(hiddenInput);
        }

        const previewContainer = document.getElementById(
          "edit-preview-container"
        );
        if (previewContainer) {
          previewContainer.style.display = "none";
        }

        const imagemInput = document.getElementById("edit-imagem");
        if (imagemInput) {
          imagemInput.value = "";
        }

        window.RaizesAmazonia.ModalManager.abrirModal("modal-editar-receita");
      } else {
        modal =
          window.RaizesAmazonia.ModalManager.criarModalEditarReceita(receita);
        modal.classList.add("dynamic-modal");
        window.RaizesAmazonia.ModalManager.abrirModal("modal-editar-receita");
      }
    } catch (error) {
      console.error("Erro ao carregar receita para edição:", error);
      if (window.mostrarMensagem) {
        window.mostrarMensagem(
          "❌ Erro ao carregar receita para edição",
          "error"
        );
      } else {
        alert("Erro ao carregar receita para edição");
      }
    }
  },

  async deletarReceita(id) {
    let isUserAdmin = false;
    let adminSource = "Nenhum";

    if (window.RaizesAmazonia?.adminManager) {
      isUserAdmin = window.RaizesAmazonia.adminManager.isLoggedIn;
      adminSource = "AdminManager";
    } else if (typeof isAdmin !== "undefined") {
      isUserAdmin = isAdmin;
      adminSource = "Global isAdmin";
    } else if (sessionStorage.getItem("isAdmin") === "true") {
      isUserAdmin = true;
      adminSource = "SessionStorage";
    }

    console.log(
      `[ReceitaUtils.deletarReceita] Admin check: ${isUserAdmin} via ${adminSource}`
    );

    if (!isUserAdmin) {
      if (window.mostrarMensagem) {
        window.mostrarMensagem(
          "Acesso negado. Faça login como administrador.",
          "error"
        );
      } else {
        alert("Acesso negado. Faça login como administrador.");
      }
      return;
    }

    const API_BASE_URL =
      window.RaizesAmazonia?.Config?.API_BASE_URL || "http://localhost:8000";

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
      confirmou = confirm(
        `Tem certeza que deseja excluir a receita ${nomeReceita}?\n\nEsta ação não pode ser desfeita.`
      );
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
          window.mostrarMensagem(
            `✅ Receita ${nomeReceita} excluída com sucesso!`,
            "success"
          );
        } else {
          alert(`Receita ${nomeReceita} excluída com sucesso!`);
        }

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
        window.mostrarMensagem(
          "❌ Erro ao excluir receita: " + error.message,
          "error"
        );
      } else {
        alert("Erro ao excluir receita: " + error.message);
      }
    }
  },

  abrirModalNovaReceita() {
    let isUserAdmin = false;
    let adminSource = "Nenhum";

    if (window.RaizesAmazonia?.adminManager) {
      isUserAdmin = window.RaizesAmazonia.adminManager.isLoggedIn;
      adminSource = "AdminManager";
    } else if (typeof isAdmin !== "undefined") {
      isUserAdmin = isAdmin;
      adminSource = "Global isAdmin";
    } else if (sessionStorage.getItem("isAdmin") === "true") {
      isUserAdmin = true;
      adminSource = "SessionStorage";
    }

    console.log(
      `[ReceitaUtils.abrirModalNovaReceita] Admin check: ${isUserAdmin} via ${adminSource}`
    );

    if (!isUserAdmin) {
      if (window.mostrarMensagem) {
        window.mostrarMensagem(
          "Acesso negado. Faça login como administrador.",
          "error"
        );
      } else {
        alert("Acesso negado. Faça login como administrador.");
      }
      return;
    }

    let modal = document.getElementById("modal-nova-receita");

    if (modal) {
      const form = document.getElementById("form-nova-receita");
      if (form) {
        form.reset();
      }

      const previewContainer = document.getElementById("preview-container");
      if (previewContainer) {
        previewContainer.style.display = "none";
      }

      window.RaizesAmazonia.ModalManager.abrirModal("modal-nova-receita");
    } else {
      modal = window.RaizesAmazonia.ModalManager.criarModalNovaReceita();
      modal.classList.add("dynamic-modal");
      window.RaizesAmazonia.ModalManager.abrirModal("modal-nova-receita");

      setTimeout(() => {
        const nomeInput = document.getElementById("nome");
        if (nomeInput) {
          nomeInput.focus();
        }
      }, 100);
    }
  },

  criarReceita() {
    return this.abrirModalNovaReceita();
  },
};

// Funções globais para compatibilidade
window.editarReceita = function (id) {
  return window.RaizesAmazonia.ReceitaUtils.editarReceita(id);
};

window.deletarReceita = function (id) {
  return window.RaizesAmazonia.ReceitaUtils.deletarReceita(id);
};

window.abrirModalNovaReceita = function () {
  return window.RaizesAmazonia.ReceitaUtils.abrirModalNovaReceita();
};

window.criarReceita = function () {
  return window.RaizesAmazonia.ReceitaUtils.criarReceita();
};

console.log(
  "%c[ReceitaUtils] Sistema carregado com sucesso",
  "color: #17a2b8; font-weight: bold;"
);

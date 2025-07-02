/* Sistema de Administração Centralizado - Versão Modular */

// Namespace principal da aplicação
window.RaizesAmazonia = window.RaizesAmazonia || {};

// Módulo de Cache DOM para melhor performance
window.RaizesAmazonia.DOMCache = {
  _cache: new Map(),

  get(selector) {
    if (!this._cache.has(selector)) {
      const element = document.querySelector(selector);
      if (element) {
        this._cache.set(selector, element);
      }
    }
    return this._cache.get(selector) || null;
  },

  getAll(selector) {
    const cacheKey = `all_${selector}`;
    if (!this._cache.has(cacheKey)) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        this._cache.set(cacheKey, elements);
      }
    }
    return this._cache.get(cacheKey) || [];
  },

  clear() {
    this._cache.clear();
  },

  remove(selector) {
    this._cache.delete(selector);
    this._cache.delete(`all_${selector}`);
  },
};

// Módulo de Logging Estruturado
window.RaizesAmazonia.Logger = {
  _logs: [],

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message, data };

    this._logs.push(logEntry);

    // Manter apenas os últimos 100 logs
    if (this._logs.length > 100) {
      this._logs.shift();
    }

    // Console output com cores
    const colors = {
      error: "color: #dc3545; font-weight: bold;",
      warn: "color: #ffc107; font-weight: bold;",
      info: "color: #17a2b8;",
      success: "color: #28a745; font-weight: bold;",
      debug: "color: #6c757d;",
    };

    console.log(
      `%c[${level.toUpperCase()}] ${message}`,
      colors[level] || "",
      data || ""
    );
  },

  error(message, data) {
    this.log("error", message, data);
  },
  warn(message, data) {
    this.log("warn", message, data);
  },
  info(message, data) {
    this.log("info", message, data);
  },
  success(message, data) {
    this.log("success", message, data);
  },
  debug(message, data) {
    this.log("debug", message, data);
  },

  getLogs() {
    return [...this._logs];
  },
  clearLogs() {
    this._logs = [];
  },
};

// Módulo de Administração
window.RaizesAmazonia.Admin = {
  // Variável de estado
  _isAdmin: sessionStorage.getItem("isAdmin") === "true",

  // Configurações
  config: {
    password: "admin123", // Altere aqui
    sessionKey: "isAdmin",
    loginAttempts: 0,
    maxAttempts: 3,
    lockoutTime: 5 * 60 * 1000, // 5 minutos
  },

  // Getter/Setter para isAdmin
  get isAdmin() {
    return this._isAdmin;
  },

  set isAdmin(value) {
    this._isAdmin = value;
    if (value) {
      sessionStorage.setItem(this.config.sessionKey, "true");
    } else {
      sessionStorage.removeItem(this.config.sessionKey);
    }
    this.updateInterface();
  },

  // Método para mostrar mensagens com melhor performance
  showMessage(texto, tipo = "info", duracao = 3000) {
    const Logger = window.RaizesAmazonia.Logger;
    const DOMCache = window.RaizesAmazonia.DOMCache;

    Logger.info(`Admin Message: ${texto}`, { tipo, duracao });

    // Remover mensagem existente se houver (usando cache)
    let mensagemExistente = DOMCache.get(".admin-message");
    if (mensagemExistente) {
      mensagemExistente.remove();
      DOMCache.remove(".admin-message");
    }

    // Criar nova mensagem
    const mensagem = document.createElement("div");
    mensagem.className = `admin-message ${tipo}`;
    mensagem.textContent = texto;

    // Adicionar ao DOM
    document.body.appendChild(mensagem);

    // Remover após o tempo especificado
    setTimeout(() => {
      if (mensagem.parentNode) {
        mensagem.classList.add("slide-out");
        setTimeout(() => {
          if (mensagem.parentNode) {
            mensagem.parentNode.removeChild(mensagem);
          }
          DOMCache.remove(".admin-message");
        }, 300);
      }
    }, duracao);
  },

  // Método para verificar bloqueio por tentativas
  isLocked() {
    const lockTime = parseInt(sessionStorage.getItem("adminLockTime") || "0");
    if (lockTime && Date.now() < lockTime) {
      const remainingTime = Math.ceil((lockTime - Date.now()) / 1000 / 60);
      return remainingTime;
    }
    return false;
  },

  // Método para bloquear acesso
  lockAccess() {
    const lockTime = Date.now() + this.config.lockoutTime;
    sessionStorage.setItem("adminLockTime", lockTime.toString());
    this.config.loginAttempts = 0;
  },

  // Método principal para alternar modo admin com melhor segurança
  toggle() {
    const Logger = window.RaizesAmazonia.Logger;

    if (this.isAdmin) {
      // Logout admin
      this.isAdmin = false;
      Logger.info("Admin logout realizado");
      this.showMessage("Modo visitante ativado", "info");
    } else {
      // Verificar se está bloqueado
      const lockedTime = this.isLocked();
      if (lockedTime) {
        this.showMessage(
          `Acesso bloqueado. Tente novamente em ${lockedTime} minuto(s).`,
          "error"
        );
        return;
      }

      // Login admin
      const senha = prompt("Digite a senha de administrador:");
      if (senha === this.config.password) {
        this.isAdmin = true;
        this.config.loginAttempts = 0;
        sessionStorage.removeItem("adminLockTime");
        Logger.success("Admin login realizado com sucesso");
        this.showMessage("Modo administrador ativado", "success");
      } else if (senha !== null) {
        this.config.loginAttempts++;
        Logger.warn(
          `Tentativa de login falhada. Tentativas: ${this.config.loginAttempts}`
        );

        if (this.config.loginAttempts >= this.config.maxAttempts) {
          this.lockAccess();
          this.showMessage(
            "Muitas tentativas incorretas. Acesso bloqueado por 5 minutos.",
            "error"
          );
        } else {
          const remaining = this.config.maxAttempts - this.config.loginAttempts;
          this.showMessage(
            `Senha incorreta. ${remaining} tentativa(s) restante(s).`,
            "error"
          );
        }
        return;
      } else {
        Logger.debug("Login cancelado pelo usuário");
        return;
      }
    }
  },

  // Método para atualizar interface com cache otimizado
  updateInterface() {
    const Logger = window.RaizesAmazonia.Logger;
    const DOMCache = window.RaizesAmazonia.DOMCache;

    Logger.debug("Atualizando interface admin", { isAdmin: this.isAdmin });

    // Tentar chamar funções específicas da página se existirem
    if (typeof carregarReceitas === "function") {
      carregarReceitas(); // Página principal
    }

    if (typeof carregarDicas === "function") {
      carregarDicas(); // Atualizar dicas para mostrar/esconder botões de admin
    }

    if (
      typeof renderizarReceitas === "function" &&
      typeof receitasFiltradas !== "undefined"
    ) {
      renderizarReceitas(receitasFiltradas); // Página todas-receitas
    }

    if (
      typeof carregarTodasReceitas === "function" &&
      typeof carregarReceitas === "undefined"
    ) {
      carregarTodasReceitas(); // Página todas-receitas (se não for página principal)
    }

    // Mostrar/esconder botão de adicionar dica na página principal (usando cache)
    const btnAdicionarDica = DOMCache.get("#btn-adicionar-dica");
    if (btnAdicionarDica) {
      btnAdicionarDica.style.display = this.isAdmin ? "block" : "none";
    }
  },

  // Método para inicialização com melhor estrutura
  init() {
    const Logger = window.RaizesAmazonia.Logger;
    const DOMCache = window.RaizesAmazonia.DOMCache;

    Logger.info("Inicializando sistema de administração");

    // Verificar se já está logado
    this._isAdmin = sessionStorage.getItem(this.config.sessionKey) === "true";

    // Atualizar interface inicial se necessário
    if (this.isAdmin) {
      this.updateInterface();
    }

    // Configurar event listener para o botão de adicionar dica (usando cache)
    const btnAdicionarDica = DOMCache.get(".dicas-culinarias .btn-admin");
    if (btnAdicionarDica) {
      btnAdicionarDica.addEventListener("click", () => {
        if (this.isAdmin) {
          if (typeof adicionarDica === "function") {
            adicionarDica();
          } else {
            Logger.error("Função adicionarDica não encontrada");
          }
        } else {
          this.showMessage(
            "Acesso negado. Faça login como administrador.",
            "error"
          );
        }
      });
    }
  },

  // Método utilitário para verificar se é admin (compatibilidade)
  verify() {
    const Logger = window.RaizesAmazonia.Logger;

    if (this.isAdmin) {
      return true;
    }

    const lockedTime = this.isLocked();
    if (lockedTime) {
      this.showMessage(
        `Acesso bloqueado. Tente novamente em ${lockedTime} minuto(s).`,
        "error"
      );
      return false;
    }

    const senha = prompt("Digite a senha de administrador:");
    if (senha === this.config.password) {
      this.isAdmin = true;
      this.config.loginAttempts = 0;
      sessionStorage.removeItem("adminLockTime");
      Logger.success("Verificação admin bem-sucedida");
      this.showMessage("Modo administrador ativado", "success");
      return true;
    } else if (senha !== null) {
      this.config.loginAttempts++;
      Logger.warn(
        `Verificação admin falhada. Tentativas: ${this.config.loginAttempts}`
      );

      if (this.config.loginAttempts >= this.config.maxAttempts) {
        this.lockAccess();
        this.showMessage(
          "Muitas tentativas incorretas. Acesso bloqueado por 5 minutos.",
          "error"
        );
      } else {
        this.showMessage("Senha incorreta", "error");
      }
    }

    return false;
  },

  // Método para logout
  logout() {
    const Logger = window.RaizesAmazonia.Logger;

    this.isAdmin = false;
    Logger.info("Logout admin realizado");
    this.showMessage("Logout realizado. Modo visitante ativado", "info");
  },
};

// Funções de compatibilidade com código existente
function toggleAdmin() {
  window.RaizesAmazonia.Admin.toggle();
}

function updateAdminInterface() {
  window.RaizesAmazonia.Admin.updateInterface();
}

function verificarAdmin() {
  return window.RaizesAmazonia.Admin.verify();
}

function logout() {
  window.RaizesAmazonia.Admin.logout();
}

function showAdminMessage(texto, tipo = "info", duracao = 3000) {
  window.RaizesAmazonia.Admin.showMessage(texto, tipo, duracao);
}

// Getter para compatibilidade
Object.defineProperty(window, "isAdmin", {
  get() {
    return window.RaizesAmazonia.Admin.isAdmin;
  },
  set(value) {
    window.RaizesAmazonia.Admin.isAdmin = value;
  },
});

// Inicializar o sistema quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  window.RaizesAmazonia.Admin.init();
});

// Função de compatibilidade
function initAdminSystem() {
  window.RaizesAmazonia.Admin.init();
}

// Exportar para debug (console)
window.RaizesAmazonia.debug = {
  getLogs: () => window.RaizesAmazonia.Logger.getLogs(),
  clearLogs: () => window.RaizesAmazonia.Logger.clearLogs(),
  clearCache: () => window.RaizesAmazonia.DOMCache.clear(),
  getAdmin: () => window.RaizesAmazonia.Admin,
};

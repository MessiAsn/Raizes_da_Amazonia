/* Sistema de Administração Centralizado - Versão Modular */

window.RaizesAmazonia = window.RaizesAmazonia || {};

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

window.RaizesAmazonia.Logger = {
  _logs: [],

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message, data };

    this._logs.push(logEntry);

    if (this._logs.length > 100) {
      this._logs.shift();
    }

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

window.RaizesAmazonia.Admin = {
  _isAdmin: sessionStorage.getItem("isAdmin") === "true",

  config: {
    password: "admin123",
    sessionKey: "isAdmin",
    loginAttempts: 0,
    maxAttempts: 3,
    lockoutTime: 5 * 60 * 1000,
  },

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

  showMessage(texto, tipo = "info", duracao = 3000) {
    const Logger = window.RaizesAmazonia.Logger;
    const DOMCache = window.RaizesAmazonia.DOMCache;

    Logger.info(`Admin Message: ${texto}`, { tipo, duracao });

    let mensagemExistente = DOMCache.get(".admin-message");
    if (mensagemExistente) {
      mensagemExistente.remove();
      DOMCache.remove(".admin-message");
    }

    const mensagem = document.createElement("div");
    mensagem.className = `admin-message ${tipo}`;
    mensagem.textContent = texto;

    document.body.appendChild(mensagem);

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

  isLocked() {
    const lockTime = parseInt(sessionStorage.getItem("adminLockTime") || "0");
    if (lockTime && Date.now() < lockTime) {
      const remainingTime = Math.ceil((lockTime - Date.now()) / 1000 / 60);
      return remainingTime;
    }
    return false;
  },

  lockAccess() {
    const lockTime = Date.now() + this.config.lockoutTime;
    sessionStorage.setItem("adminLockTime", lockTime.toString());
    this.config.loginAttempts = 0;
  },

  toggle() {
    const Logger = window.RaizesAmazonia.Logger;

    if (this.isAdmin) {
      this.isAdmin = false;
      Logger.info("Admin logout realizado");
      this.showMessage("Modo visitante ativado", "info");
    } else {
      const lockedTime = this.isLocked();
      if (lockedTime) {
        this.showMessage(
          `Acesso bloqueado. Tente novamente em ${lockedTime} minuto(s).`,
          "error"
        );
        return;
      }

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

  updateInterface() {
    const Logger = window.RaizesAmazonia.Logger;
    const DOMCache = window.RaizesAmazonia.DOMCache;

    Logger.debug("Atualizando interface admin", { isAdmin: this.isAdmin });

    if (typeof carregarReceitas === "function") {
      carregarReceitas();
    }

    if (typeof carregarDicas === "function") {
      carregarDicas();
    }

    if (
      typeof renderizarReceitas === "function" &&
      typeof receitasFiltradas !== "undefined"
    ) {
      renderizarReceitas(receitasFiltradas);
    }

    if (
      typeof carregarTodasReceitas === "function" &&
      typeof carregarReceitas === "undefined"
    ) {
      carregarTodasReceitas();
    }

    const btnAdicionarDica = DOMCache.get("#btn-adicionar-dica");
    if (btnAdicionarDica) {
      btnAdicionarDica.style.display = this.isAdmin ? "block" : "none";
    }
  },

  init() {
    const Logger = window.RaizesAmazonia.Logger;
    const DOMCache = window.RaizesAmazonia.DOMCache;

    Logger.info("Inicializando sistema de administração");

    this._isAdmin = sessionStorage.getItem(this.config.sessionKey) === "true";

    if (this.isAdmin) {
      this.updateInterface();
    }

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

  logout() {
    const Logger = window.RaizesAmazonia.Logger;

    this.isAdmin = false;
    Logger.info("Logout admin realizado");
    this.showMessage("Logout realizado. Modo visitante ativado", "info");
  },
};

window.RaizesAmazonia.ReceitaManager = {
  _cache: new Map(),
  _cacheTimeout: 5 * 60 * 1000,

  async carregarReceitas(forceRefresh = false) {
    const Logger = window.RaizesAmazonia.Logger;
    const cacheKey = "receitas_list";

    if (!forceRefresh && this._cache.has(cacheKey)) {
      const cached = this._cache.get(cacheKey);
      const now = Date.now();

      if (now - cached.timestamp < this._cacheTimeout) {
        Logger.info("Receitas carregadas do cache");
        return cached.data;
      }
    }

    try {
      Logger.info("Carregando receitas da API...");
      const API_BASE_URL =
        window.RaizesAmazonia?.Config?.API_BASE_URL || "http://localhost:8000";

      const response = await fetch(`${API_BASE_URL}/api/receitas`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const receitas = await response.json();

      this._cache.set(cacheKey, {
        data: receitas,
        timestamp: Date.now(),
      });

      Logger.success(`${receitas.length} receitas carregadas com sucesso`);
      return receitas;
    } catch (error) {
      Logger.error("Erro ao carregar receitas:", error);
      throw error;
    }
  },

  async carregarReceita(id) {
    const Logger = window.RaizesAmazonia.Logger;

    try {
      const API_BASE_URL =
        window.RaizesAmazonia?.Config?.API_BASE_URL || "http://localhost:8000";

      const response = await fetch(`${API_BASE_URL}/api/receitas/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const receita = await response.json();
      Logger.info(`Receita ${id} carregada:`, receita.nome);
      return receita;
    } catch (error) {
      Logger.error(`Erro ao carregar receita ${id}:`, error);
      throw error;
    }
  },

  async criarReceita(formData) {
    const Logger = window.RaizesAmazonia.Logger;

    try {
      const API_BASE_URL =
        window.RaizesAmazonia?.Config?.API_BASE_URL || "http://localhost:8000";

      const response = await fetch(`${API_BASE_URL}/api/receitas`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const receita = await response.json();

      this._cache.delete("receitas_list");

      Logger.success("Receita criada:", receita.nome);
      return receita;
    } catch (error) {
      Logger.error("Erro ao criar receita:", error);
      throw error;
    }
  },

  async atualizarReceita(id, formData) {
    const Logger = window.RaizesAmazonia.Logger;

    try {
      const API_BASE_URL =
        window.RaizesAmazonia?.Config?.API_BASE_URL || "http://localhost:8000";

      const response = await fetch(`${API_BASE_URL}/api/receitas/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const receita = await response.json();

      this._cache.delete("receitas_list");

      Logger.success("Receita atualizada:", receita.nome);
      return receita;
    } catch (error) {
      Logger.error(`Erro ao atualizar receita ${id}:`, error);
      throw error;
    }
  },

  async deletarReceita(id) {
    const Logger = window.RaizesAmazonia.Logger;

    try {
      const API_BASE_URL =
        window.RaizesAmazonia?.Config?.API_BASE_URL || "http://localhost:8000";

      const response = await fetch(`${API_BASE_URL}/api/receitas/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this._cache.delete("receitas_list");

      Logger.success(`Receita ${id} deletada com sucesso`);
      return true;
    } catch (error) {
      Logger.error(`Erro ao deletar receita ${id}:`, error);
      throw error;
    }
  },

  clearCache() {
    this._cache.clear();
    window.RaizesAmazonia.Logger.info("Cache de receitas limpo");
  },
};

window.RaizesAmazonia.DicaManager = {
  _cache: new Map(),
  _cacheTimeout: 5 * 60 * 1000,

  async carregarDicas(forceRefresh = false) {
    const Logger = window.RaizesAmazonia.Logger;
    const cacheKey = "dicas_list";

    if (!forceRefresh && this._cache.has(cacheKey)) {
      const cached = this._cache.get(cacheKey);
      const now = Date.now();

      if (now - cached.timestamp < this._cacheTimeout) {
        Logger.info("Dicas carregadas do cache");
        return cached.data;
      }
    }

    try {
      Logger.info("Carregando dicas da API...");
      const API_BASE_URL =
        window.RaizesAmazonia?.Config?.API_BASE_URL || "http://localhost:8000";

      const response = await fetch(`${API_BASE_URL}/api/dicas`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const dicas = await response.json();

      this._cache.set(cacheKey, {
        data: dicas,
        timestamp: Date.now(),
      });

      Logger.success(`${dicas.length} dicas carregadas com sucesso`);
      return dicas;
    } catch (error) {
      Logger.error("Erro ao carregar dicas:", error);
      throw error;
    }
  },

  async criarDica(conteudo) {
    const Logger = window.RaizesAmazonia.Logger;

    try {
      const API_BASE_URL =
        window.RaizesAmazonia?.Config?.API_BASE_URL || "http://localhost:8000";

      const formData = new FormData();
      formData.append("conteudo", conteudo);

      const response = await fetch(`${API_BASE_URL}/api/dicas`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const dica = await response.json();

      this._cache.delete("dicas_list");

      Logger.success("Dica criada:", dica.conteudo.substring(0, 50) + "...");
      return dica;
    } catch (error) {
      Logger.error("Erro ao criar dica:", error);
      throw error;
    }
  },

  async atualizarDica(id, conteudo) {
    const Logger = window.RaizesAmazonia.Logger;

    try {
      const API_BASE_URL =
        window.RaizesAmazonia?.Config?.API_BASE_URL || "http://localhost:8000";

      const formData = new FormData();
      formData.append("conteudo", conteudo);

      const response = await fetch(`${API_BASE_URL}/api/dicas/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const dica = await response.json();

      this._cache.delete("dicas_list");

      Logger.success(
        "Dica atualizada:",
        dica.conteudo.substring(0, 50) + "..."
      );
      return dica;
    } catch (error) {
      Logger.error(`Erro ao atualizar dica ${id}:`, error);
      throw error;
    }
  },

  async deletarDica(id) {
    const Logger = window.RaizesAmazonia.Logger;

    try {
      const API_BASE_URL =
        window.RaizesAmazonia?.Config?.API_BASE_URL || "http://localhost:8000";

      const response = await fetch(`${API_BASE_URL}/api/dicas/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this._cache.delete("dicas_list");

      Logger.success(`Dica ${id} deletada com sucesso`);
      return true;
    } catch (error) {
      Logger.error(`Erro ao deletar dica ${id}:`, error);
      throw error;
    }
  },

  clearCache() {
    this._cache.clear();
    window.RaizesAmazonia.Logger.info("Cache de dicas limpo");
  },
};

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

Object.defineProperty(window, "isAdmin", {
  get() {
    return window.RaizesAmazonia.Admin.isAdmin;
  },
  set(value) {
    window.RaizesAmazonia.Admin.isAdmin = value;
  },
});

document.addEventListener("DOMContentLoaded", () => {
  window.RaizesAmazonia.Admin.init();
});

function initAdminSystem() {
  window.RaizesAmazonia.Admin.init();
}

window.RaizesAmazonia.debug = {
  getLogs: () => window.RaizesAmazonia.Logger.getLogs(),
  clearLogs: () => window.RaizesAmazonia.Logger.clearLogs(),
  clearCache: () => window.RaizesAmazonia.DOMCache.clear(),
  getAdmin: () => window.RaizesAmazonia.Admin,
};

/* AdminManager - Sistema de Administração Centralizado */

window.RaizesAmazonia = window.RaizesAmazonia || {};

window.RaizesAmazonia.AdminManager = class AdminManager {
  constructor() {
    this._isLoggedIn = sessionStorage.getItem("isAdmin") === "true";
    this._loginAttempts = parseInt(
      sessionStorage.getItem("adminAttempts") || "0"
    );
    this._lockoutTime = parseInt(
      sessionStorage.getItem("adminLockTime") || "0"
    );

    this.config = {
      password: window.RaizesAmazonia?.Config?.ADMIN_PASSWORD || "admin123",
      maxAttempts: window.RaizesAmazonia?.Config?.MAX_LOGIN_ATTEMPTS || 3,
      lockoutDuration:
        window.RaizesAmazonia?.Config?.LOCKOUT_TIME || 5 * 60 * 1000,
      sessionKey: "isAdmin",
      attemptsKey: "adminAttempts",
      lockTimeKey: "adminLockTime",
    };

    this._eventListeners = new Map();

    this.init();
  }

  init() {
    this.log("info", "AdminManager inicializado");

    if (this.isLocked()) {
      this.log("warn", "Sistema bloqueado devido a tentativas excessivas");
    }

    this.setupEventListeners();
    this.syncGlobalVariable();
    this.updateInterface();
  }

  syncGlobalVariable() {
    if (typeof window.isAdmin !== "undefined") {
      window.isAdmin = this._isLoggedIn;
    }
  }

  setupEventListeners() {
    document.addEventListener("keydown", (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === "A") {
        event.preventDefault();
        this.toggle();
      }
    });

    window.addEventListener("storage", (event) => {
      if (event.key === this.config.sessionKey) {
        this._isLoggedIn = event.newValue === "true";
        this.updateInterface();
      }
    });
  }

  get isLoggedIn() {
    return this._isLoggedIn;
  }

  set isLoggedIn(value) {
    this._isLoggedIn = value;
    sessionStorage.setItem(this.config.sessionKey, value.toString());

    if (typeof window.isAdmin !== "undefined") {
      window.isAdmin = value;
    }

    this.updateInterface();
    this.emit("statusChanged", { isLoggedIn: value });
  }

  isLocked() {
    if (this._lockoutTime && Date.now() < this._lockoutTime) {
      return Math.ceil((this._lockoutTime - Date.now()) / 1000 / 60);
    }
    return false;
  }

  lockAccess() {
    this._lockoutTime = Date.now() + this.config.lockoutDuration;
    this._loginAttempts = 0;

    sessionStorage.setItem(
      this.config.lockTimeKey,
      this._lockoutTime.toString()
    );
    sessionStorage.setItem(this.config.attemptsKey, "0");

    this.log("warn", "Acesso bloqueado por tentativas excessivas");
    this.showMessage(
      "Muitas tentativas incorretas. Acesso bloqueado por 5 minutos.",
      "error",
      8000
    );
  }

  clearLockout() {
    this._lockoutTime = 0;
    this._loginAttempts = 0;

    sessionStorage.removeItem(this.config.lockTimeKey);
    sessionStorage.removeItem(this.config.attemptsKey);
  }

  async login(password = null) {
    const lockedMinutes = this.isLocked();
    if (lockedMinutes) {
      this.showMessage(
        `Acesso bloqueado. Tente novamente em ${lockedMinutes} minuto(s).`,
        "error"
      );
      return false;
    }

    if (password === null) {
      password = prompt("Digite a senha de administrador:");
      if (password === null) {
        this.log("info", "Login cancelado pelo usuário");
        return false;
      }
    }

    if (password === this.config.password) {
      this.isLoggedIn = true;
      this.clearLockout();

      this.log("success", "Login administrativo realizado");
      this.showMessage("Modo administrador ativado", "success");

      return true;
    } else {
      this._loginAttempts++;
      sessionStorage.setItem(
        this.config.attemptsKey,
        this._loginAttempts.toString()
      );

      this.log(
        "warn",
        `Tentativa de login falhada. Tentativas: ${this._loginAttempts}`
      );

      if (this._loginAttempts >= this.config.maxAttempts) {
        this.lockAccess();
      } else {
        const remaining = this.config.maxAttempts - this._loginAttempts;
        this.showMessage(
          `Senha incorreta. ${remaining} tentativa(s) restante(s).`,
          "error"
        );
      }

      return false;
    }
  }

  logout() {
    this.isLoggedIn = false;
    this.log("info", "Logout administrativo realizado");
    this.showMessage("Modo visitante ativado", "info");
  }

  async toggle() {
    if (this.isLoggedIn) {
      this.logout();
    } else {
      await this.login();
    }
  }

  async requireAdmin(showPrompt = true) {
    if (this.isLoggedIn) {
      return true;
    }

    if (!showPrompt) {
      return false;
    }

    return await this.login();
  }

  checkPermission() {
    return this.isLoggedIn;
  }

  updateInterface() {
    this.log("debug", "Atualizando interface administrativa", {
      isLoggedIn: this._isLoggedIn,
    });

    document.querySelectorAll(".admin-only").forEach((element) => {
      element.style.display = this._isLoggedIn ? "" : "none";
    });

    document.querySelectorAll(".visitor-only").forEach((element) => {
      element.style.display = this._isLoggedIn ? "none" : "";
    });

    document
      .querySelectorAll(".card-actions .btn-edit, .card-actions .btn-delete")
      .forEach((element) => {
        element.style.display = this._isLoggedIn ? "" : "none";
      });

    const adminButton = document.querySelector(".admin-toggle");
    if (adminButton) {
      adminButton.textContent = this._isLoggedIn ? "Admin ✓" : "Admin";
      adminButton.className = `admin-toggle ${
        this._isLoggedIn ? "active" : ""
      }`;
    }

    this.refreshPageContent();
    this.emit("interfaceUpdated", { isLoggedIn: this._isLoggedIn });
  }

  refreshPageContent() {
    if (typeof carregarReceitas === "function") {
      carregarReceitas();
    }

    if (typeof carregarDicas === "function") {
      carregarDicas();
    }

    if (typeof carregarTodasReceitas === "function") {
      carregarTodasReceitas();
    } else if (
      typeof renderizarReceitas === "function" &&
      typeof receitasFiltradas !== "undefined"
    ) {
      renderizarReceitas(receitasFiltradas);
    }

    if (typeof carregarDetalhesReceita === "function") {
      const urlParams = new URLSearchParams(window.location.search);
      const receitaId = urlParams.get("id");
      if (receitaId) {
        carregarDetalhesReceita(receitaId);
      }
    }
  }

  on(eventName, callback) {
    if (!this._eventListeners.has(eventName)) {
      this._eventListeners.set(eventName, []);
    }
    this._eventListeners.get(eventName).push(callback);
  }

  off(eventName, callback) {
    if (this._eventListeners.has(eventName)) {
      const listeners = this._eventListeners.get(eventName);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(eventName, data = null) {
    if (this._eventListeners.has(eventName)) {
      this._eventListeners.get(eventName).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          this.log(
            "error",
            `Erro ao executar listener do evento ${eventName}`,
            error
          );
        }
      });
    }
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const prefix = `[AdminManager ${level.toUpperCase()}]`;

    const colors = {
      error: "color: #dc3545; font-weight: bold;",
      warn: "color: #ffc107; font-weight: bold;",
      info: "color: #17a2b8;",
      success: "color: #28a745; font-weight: bold;",
      debug: "color: #6c757d;",
    };

    console.log(`%c${prefix} ${message}`, colors[level] || "", data || "");

    if (window.RaizesAmazonia?.Logger) {
      window.RaizesAmazonia.Logger.log(level, message, data);
    }
  }

  showMessage(texto, tipo = "info", duracao = 4000) {
    if (window.RaizesAmazonia?.Messages?.show) {
      return window.RaizesAmazonia.Messages.show(texto, tipo, duracao);
    }

    if (typeof mostrarMensagem === "function") {
      return mostrarMensagem(texto, tipo, duracao);
    }

    this.showSimpleMessage(texto, tipo, duracao);
  }

  showSimpleMessage(texto, tipo, duracao) {
    const existing = document.querySelector(".admin-message");
    if (existing) {
      existing.remove();
    }

    const message = document.createElement("div");
    message.className = `admin-message admin-message-${tipo}`;
    message.textContent = texto;

    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      animation: slideInRight 0.3s ease-out;
    `;

    const colors = {
      success: "#28a745",
      error: "#dc3545",
      warning: "#ffc107",
      info: "#17a2b8",
    };

    message.style.backgroundColor = colors[tipo] || colors.info;

    document.body.appendChild(message);

    setTimeout(() => {
      if (message.parentNode) {
        message.style.animation = "slideOutRight 0.3s ease-in";
        setTimeout(() => {
          if (message.parentNode) {
            message.remove();
          }
        }, 300);
      }
    }, duracao);
  }

  getStatus() {
    return {
      isLoggedIn: this._isLoggedIn,
      loginAttempts: this._loginAttempts,
      isLocked: this.isLocked(),
      lockoutTime: this._lockoutTime,
    };
  }

  reset() {
    this._isLoggedIn = false;
    this._loginAttempts = 0;
    this._lockoutTime = 0;

    sessionStorage.removeItem(this.config.sessionKey);
    sessionStorage.removeItem(this.config.attemptsKey);
    sessionStorage.removeItem(this.config.lockTimeKey);

    this.updateInterface();
    this.log("info", "Sistema administrativo resetado");
  }
};

window.RaizesAmazonia.adminManager = new window.RaizesAmazonia.AdminManager();

function toggleAdmin() {
  return window.RaizesAmazonia.adminManager.toggle();
}

function verificarAdmin() {
  return window.RaizesAmazonia.adminManager.requireAdmin();
}

function logout() {
  return window.RaizesAmazonia.adminManager.logout();
}

function updateAdminInterface() {
  return window.RaizesAmazonia.adminManager.updateInterface();
}

Object.defineProperty(window, "isAdmin", {
  get() {
    return window.RaizesAmazonia.adminManager.isLoggedIn;
  },
  set(value) {
    window.RaizesAmazonia.adminManager.isLoggedIn = value;
  },
});

window.RaizesAmazonia.debug = window.RaizesAmazonia.debug || {};
window.RaizesAmazonia.debug.adminManager = window.RaizesAmazonia.adminManager;

if (!document.querySelector("#admin-manager-styles")) {
  const style = document.createElement("style");
  style.id = "admin-manager-styles";
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
    
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    
    .admin-message {
      transition: all 0.3s ease;
    }
  `;
  document.head.appendChild(style);
}

console.log(
  "%c[AdminManager] Sistema carregado com sucesso",
  "color: #28a745; font-weight: bold;"
);

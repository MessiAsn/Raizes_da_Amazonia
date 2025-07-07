/* Configuração Global - Raízes da Amazônia */

window.RaizesAmazonia = window.RaizesAmazonia || {};

window.RaizesAmazonia.Config = {
  API_BASE_URL:
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? "http://127.0.0.1:8000"
      : "https://raizesdaamazonia-production.up.railway.app", // ✅ URL do Railway configurada

  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_TIMEOUT: 5 * 60 * 1000,

  MESSAGE_DURATION: 6000,
  ANIMATION_DURATION: 300,

  ADMIN_PASSWORD: "admin123",
  MAX_LOGIN_ATTEMPTS: 3,
  LOCKOUT_TIME: 5 * 60 * 1000,

  MAX_FILE_SIZE: 5 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],

  ITEMS_PER_PAGE: 6,
  DEBUG: window.location.hostname === "localhost",
};

window.RaizesAmazonia.Utils = {
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  formatText(text) {
    return text ? text.trim() : "";
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  log(message, data = null) {
    if (window.RaizesAmazonia.Config.DEBUG) {
      console.log("[RaizesAmazonia]", message, data || "");
    }
  },
};

window.RaizesAmazonia.UI = {
  mostrarErroConexao(containerId = null, retryFunction = null) {
    const errorHTML = `
      <div class="erro-conexao">
        <div class="erro-content">
          <h3>⚠️ Erro de Conexão</h3>
          <p>Não foi possível conectar com o servidor.</p>
          <p>Certifique-se de que o backend está rodando em <code>http://127.0.0.1:8000</code></p>
          ${
            retryFunction
              ? `<button onclick="${retryFunction}()" class="btn-retry">Tentar Novamente</button>`
              : ""
          }
        </div>
      </div>
    `;

    if (containerId) {
      const container =
        document.getElementById(containerId) ||
        document.querySelector(containerId);
      if (container) {
        container.innerHTML = errorHTML;
        return;
      }
    }

    const containers = [
      "#card-container",
      ".card-container",
      "#lista-receitas",
      "#receitas-lista",
      "#lista-dicas",
      "#estatisticas-container",
      ".receita-container",
      ".container",
    ];

    for (const selector of containers) {
      const container = document.querySelector(selector);
      if (container) {
        container.innerHTML = errorHTML;
        return;
      }
    }

    if (window.RaizesAmazonia.UI.showMessage) {
      window.RaizesAmazonia.UI.showMessage(
        "❌ Erro de conexão com o servidor. Verifique se o backend está rodando.",
        "error",
        8000
      );
    }
  },

  showMessage(texto, tipo = "info", duracao = 4000) {
    const existingToasts = document.querySelectorAll(".toast-message");
    existingToasts.forEach((toast) => toast.remove());

    const toast = document.createElement("div");
    toast.className = `toast-message toast-${tipo}`;

    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: bold;
      z-index: 9999;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease-out;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const cores = {
      success: "#10b981",
      error: "#ef4444",
      warning: "#f59e0b",
      info: "#3b82f6",
    };

    toast.style.backgroundColor = cores[tipo] || cores.info;
    toast.textContent = texto;

    document.body.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = "slideOut 0.3s ease-in";
        setTimeout(() => toast.remove(), 300);
      }
    }, duracao);

    return toast;
  },
};

const toastStyles = document.createElement("style");
toastStyles.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;

if (!document.querySelector("#raizes-toast-styles")) {
  toastStyles.id = "raizes-toast-styles";
  document.head.appendChild(toastStyles);
}

window.RaizesAmazonia.API = {
  async request(endpoint, options = {}) {
    const config = window.RaizesAmazonia.Config;
    const url = `${config.API_BASE_URL}${endpoint}`;

    for (let attempt = 1; attempt <= config.RETRY_ATTEMPTS; attempt++) {
      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        window.RaizesAmazonia.Utils.log(
          `Tentativa ${attempt} falhada:`,
          error.message
        );

        if (attempt === config.RETRY_ATTEMPTS) {
          throw error;
        }

        await window.RaizesAmazonia.Utils.sleep(config.RETRY_DELAY * attempt);
      }
    }
  },

  async get(endpoint) {
    const response = await this.request(endpoint);
    return response.json();
  },

  async post(endpoint, data) {
    const response = await this.request(endpoint, {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
      headers:
        data instanceof FormData
          ? {}
          : {
              "Content-Type": "application/json",
            },
    });
    return response.json();
  },

  async put(endpoint, data) {
    const response = await this.request(endpoint, {
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
      headers:
        data instanceof FormData
          ? {}
          : {
              "Content-Type": "application/json",
            },
    });
    return response.json();
  },

  async delete(endpoint) {
    const response = await this.request(endpoint, {
      method: "DELETE",
    });
    return response.json();
  },
};

window.RaizesAmazonia.DependencyManager = {
  _loadedModules: new Set(),
  _moduleQueue: [],

  registerModule(moduleName) {
    this._loadedModules.add(moduleName);
    this._processQueue();
  },

  waitForModule(moduleName) {
    return new Promise((resolve) => {
      if (this._loadedModules.has(moduleName)) {
        resolve();
      } else {
        this._moduleQueue.push({ moduleName, resolve });
      }
    });
  },

  _processQueue() {
    this._moduleQueue = this._moduleQueue.filter((item) => {
      if (this._loadedModules.has(item.moduleName)) {
        item.resolve();
        return false;
      }
      return true;
    });
  },
};

window.RaizesAmazonia.Core = {
  init() {
    const utils = window.RaizesAmazonia.Utils;

    utils.log("Inicializando Raízes da Amazônia...");

    window.RaizesAmazonia.DependencyManager.registerModule("core");

    utils.log("Sistema inicializado com sucesso!");
  },
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.RaizesAmazonia.Core.init();
  });
} else {
  window.RaizesAmazonia.Core.init();
}

if (window.RaizesAmazonia.Config.DEBUG) {
  window.RaizesApp = window.RaizesAmazonia;
}

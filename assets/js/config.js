/* Configuração Global Centralizada - Raízes da Amazônia */

// Namespace principal da aplicação
window.RaizesAmazonia = window.RaizesAmazonia || {};

// ==============================================
// CONFIGURAÇÕES GLOBAIS
// ==============================================
window.RaizesAmazonia.Config = {
  // API Configuration
  API_BASE_URL: "http://localhost:8000",

  // Performance Settings
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_TIMEOUT: 5 * 60 * 1000, // 5 minutos

  // UI Settings
  MESSAGE_DURATION: 6000,
  ANIMATION_DURATION: 300,

  // Admin Settings
  ADMIN_PASSWORD: "admin123", // TODO: Mover para variável de ambiente
  MAX_LOGIN_ATTEMPTS: 3,
  LOCKOUT_TIME: 5 * 60 * 1000, // 5 minutos

  // File Upload Settings
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],

  // Pagination
  ITEMS_PER_PAGE: 6,

  // Debug Mode
  DEBUG: false,
};

// ==============================================
// UTILITÁRIOS GLOBAIS
// ==============================================
window.RaizesAmazonia.Utils = {
  /**
   * Validar email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Formatar texto
   */
  formatText(text) {
    return text ? text.trim() : "";
  },

  /**
   * Debounce para performance
   */
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

  /**
   * Sleep utility para delays
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  /**
   * Log condicional baseado no modo debug
   */
  log(message, data = null) {
    if (window.RaizesAmazonia.Config.DEBUG) {
      console.log("[RaizesAmazonia]", message, data || "");
    }
  },
};

// ==============================================
// API HELPER CENTRALIZADO
// ==============================================
window.RaizesAmazonia.API = {
  /**
   * Fazer requisição com retry automático
   */
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

  /**
   * GET request
   */
  async get(endpoint) {
    const response = await this.request(endpoint);
    return response.json();
  },

  /**
   * POST request
   */
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

  /**
   * PUT request
   */
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

  /**
   * DELETE request
   */
  async delete(endpoint) {
    const response = await this.request(endpoint, {
      method: "DELETE",
    });
    return response.json();
  },
};

// ==============================================
// GERENCIADOR DE DEPENDÊNCIAS
// ==============================================
window.RaizesAmazonia.DependencyManager = {
  _loadedModules: new Set(),
  _moduleQueue: [],

  /**
   * Registrar que um módulo foi carregado
   */
  registerModule(moduleName) {
    this._loadedModules.add(moduleName);
    this._processQueue();
  },

  /**
   * Aguardar módulo ser carregado
   */
  waitForModule(moduleName) {
    return new Promise((resolve) => {
      if (this._loadedModules.has(moduleName)) {
        resolve();
      } else {
        this._moduleQueue.push({ moduleName, resolve });
      }
    });
  },

  /**
   * Processar fila de dependências
   */
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

// ==============================================
// INICIALIZAÇÃO
// ==============================================
window.RaizesAmazonia.Core = {
  /**
   * Inicializar sistema principal
   */
  init() {
    const utils = window.RaizesAmazonia.Utils;

    utils.log("Inicializando Raízes da Amazônia...");

    // Registrar módulo principal
    window.RaizesAmazonia.DependencyManager.registerModule("core");

    utils.log("Sistema inicializado com sucesso!");
  },
};

// Auto-inicializar quando DOM estiver pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.RaizesAmazonia.Core.init();
  });
} else {
  window.RaizesAmazonia.Core.init();
}

// Exportar para debug
if (window.RaizesAmazonia.Config.DEBUG) {
  window.RaizesApp = window.RaizesAmazonia; // Alias mais curto para debug
}

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
// SISTEMA DE NOTIFICAÇÕES E ERROS
// ==============================================
window.RaizesAmazonia.UI = {
  /**
   * Mostrar erro de conexão padronizado
   */
  mostrarErroConexao(containerId = null, retryFunction = null) {
    const errorHTML = `
      <div class="erro-conexao">
        <div class="erro-content">
          <h3>⚠️ Erro de Conexão</h3>
          <p>Não foi possível conectar com o servidor.</p>
          <p>Certifique-se de que o backend está rodando em <code>http://localhost:8000</code></p>
          ${retryFunction ? `<button onclick="${retryFunction}()" class="btn-retry">Tentar Novamente</button>` : ''}
        </div>
      </div>
    `;

    // Se um container específico foi fornecido
    if (containerId) {
      const container = document.getElementById(containerId) || document.querySelector(containerId);
      if (container) {
        container.innerHTML = errorHTML;
        return;
      }
    }

    // Tentar containers padrão comuns
    const containers = [
      '#card-container',
      '.card-container',
      '#lista-receitas',
      '#receitas-lista',
      '#lista-dicas',
      '#estatisticas-container',
      '.receita-container',
      '.container'
    ];

    for (const selector of containers) {
      const container = document.querySelector(selector);
      if (container) {
        container.innerHTML = errorHTML;
        return;
      }
    }

    // Fallback: mostrar toast se não encontrar container
    if (window.RaizesAmazonia.UI.showMessage) {
      window.RaizesAmazonia.UI.showMessage(
        "❌ Erro de conexão com o servidor. Verifique se o backend está rodando.",
        "error",
        8000
      );
    }
  },

  /**
   * Sistema de mensagens toast centralizado
   */
  showMessage(texto, tipo = "info", duracao = 4000) {
    // Remove mensagens existentes
    const existingToasts = document.querySelectorAll('.toast-message');
    existingToasts.forEach(toast => toast.remove());

    // Criar toast
    const toast = document.createElement('div');
    toast.className = `toast-message toast-${tipo}`;
    
    // Estilos inline para garantir que funcione em todas as páginas
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

    // Cores por tipo
    const cores = {
      success: '#10b981',
      error: '#ef4444', 
      warning: '#f59e0b',
      info: '#3b82f6'
    };
    
    toast.style.backgroundColor = cores[tipo] || cores.info;
    toast.textContent = texto;

    // Adicionar ao DOM
    document.body.appendChild(toast);

    // Remover automaticamente
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
      }
    }, duracao);

    return toast;
  }
};

// Adicionar estilos CSS apenas para animações dos toasts
const toastStyles = document.createElement('style');
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

if (!document.querySelector('#raizes-toast-styles')) {
  toastStyles.id = 'raizes-toast-styles';
  document.head.appendChild(toastStyles);
}

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

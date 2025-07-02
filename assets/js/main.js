/* Sistema Principal - Raízes da Amazônia */

// Aguardar que todos os scripts sejam carregados
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Iniciando aplicação...");
  
  // Carregar receitas
  carregarReceitas();
  
  // Carregar dicas
  carregarDicas();

  // Configurar formulário de contato
  const formContato = document.getElementById("form-contato");
  if (formContato) {
    formContato.addEventListener("submit", enviarContato);
  }
});

// Sistema de mensagens simples
function mostrarMensagem(texto, tipo = "info", duracao = 3000) {
  // Remover mensagem existente se houver
  const mensagemExistente = document.querySelector(".mensagem");
  if (mensagemExistente) {
    mensagemExistente.remove();
  }

  const mensagem = document.createElement("div");
  mensagem.className = `mensagem mensagem-${tipo}`;

  // Definir cores por tipo
  const cores = {
    success: "#28a745",
    error: "#dc3545", 
    warning: "#ffc107",
    info: "#17a2b8"
  };

  const cor = cores[tipo] || cores.info;

  mensagem.innerHTML = `
    <span>${texto}</span>
    <button onclick="this.parentElement.remove()">&times;</button>
  `;

  mensagem.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${cor};
    color: white;
    padding: 1rem;
    border-radius: 5px;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 10px;
  `;

  document.body.appendChild(mensagem);

  // Auto-remover
  setTimeout(() => {
    if (mensagem.parentElement) {
      mensagem.remove();
    }
  }, duracao);
}

// Configuração da API
function getApiBaseUrl() {
  return "http://localhost:8000";
}

// Carregamento de Receitas
async function carregarReceitas() {
  try {
    console.log("Carregando receitas...");
    
    // Usar o ReceitaManager se disponível
    if (window.RaizesAmazonia?.ReceitaManager) {
      const receitas = await window.RaizesAmazonia.ReceitaManager.carregarReceitas();
      const container = document.querySelector(".card-container");
      
      if (container) {
        renderizarReceitas(receitas.slice(0, 6), container);
      }
      return;
    }
    
    // Fallback para fetch direto
    const response = await fetch(`${getApiBaseUrl()}/api/receitas`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const receitas = await response.json();
    const container = document.querySelector(".card-container");
    
    if (container) {
      renderizarReceitas(receitas.slice(0, 6), container);
    }
    
  } catch (error) {
    console.error("Erro ao carregar receitas:", error);
    mostrarErroConexao();
  }
}

function mostrarErroConexao() {
  const container = document.querySelector(".card-container");
  if (container) {
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
}

function renderizarReceitas(receitas, container) {
  container.innerHTML = "";

  if (receitas.length === 0) {
    container.innerHTML = `
      <div class="mensagem-vazia">
        <h3>Nenhuma receita encontrada</h3>
        <p>Não há receitas disponíveis no momento.</p>
      </div>
    `;
    return;
  }

  receitas.forEach(receita => {
    const card = document.createElement("div");
    card.className = "card";
    
    const imagemUrl = receita.imagem ? `${getApiBaseUrl()}${receita.imagem}` : null;
    
    card.innerHTML = `
      ${imagemUrl ? `<img src="${imagemUrl}" alt="${receita.nome}" />` : ''}
      <h3>${receita.nome}</h3>
      <p>${receita.descricao}</p>
      <div class="card-actions">
        <button onclick="verReceita('${receita.id}')" class="card-button">Ver Receita</button>
      </div>
    `;
    
    container.appendChild(card);
  });
}

function verReceita(id) {
  window.location.href = `pages/receita.html?id=${id}`;
}

// Carregamento de Dicas
async function carregarDicas() {
  try {
    console.log("Carregando dicas...");
    
    // Usar o DicaManager se disponível
    if (window.RaizesAmazonia?.DicaManager) {
      const dicas = await window.RaizesAmazonia.DicaManager.carregarDicas();
      const container = document.querySelector(".dicas-scroll ul");
      
      if (container) {
        renderizarDicas(dicas, container);
      }
      return;
    }
    
    // Fallback para fetch direto
    const response = await fetch(`${getApiBaseUrl()}/api/dicas`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const dicas = await response.json();
    const container = document.querySelector(".dicas-scroll ul");
    
    if (container) {
      renderizarDicas(dicas, container);
    }
    
  } catch (error) {
    console.error("Erro ao carregar dicas:", error);
    mostrarErroDicas();
  }
}

function renderizarDicas(dicas, container) {
  container.innerHTML = "";

  if (dicas.length === 0) {
    container.innerHTML = `<li class="mensagem-vazia">Nenhuma dica disponível no momento.</li>`;
    return;
  }

  dicas.forEach(dica => {
    const dicaElement = document.createElement("li");
    dicaElement.innerHTML = `
      <div class="dica-content">
        <span class="dica-icon">💡</span>
        <span class="dica-text">${dica.conteudo || dica.texto || ''}</span>
      </div>
    `;
    container.appendChild(dicaElement);
  });
}

function mostrarErroDicas() {
  const container = document.querySelector(".dicas-scroll ul");
  if (container) {
    container.innerHTML = `
      <li class="erro-dicas">
        <div class="erro-content">
          <span>⚠️</span>
          <span>Erro ao carregar dicas</span>
          <button onclick="carregarDicas()" class="btn-retry-small">Tentar Novamente</button>
        </div>
      </li>
    `;
  }
}

// Função para enviar formulário de contato
async function enviarContato(event) {
  event.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const mensagem = document.getElementById("mensagem").value.trim();

  if (!nome || !email || !mensagem) {
    mostrarMensagem("Preencha todos os campos.", "warning");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("email", email);
    formData.append("mensagem", mensagem);

    const response = await fetch(`${getApiBaseUrl()}/api/contato`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || `Erro ${response.status}`);
    }

    mostrarMensagem("Mensagem enviada com sucesso!", "success");
    document.getElementById("form-contato").reset();
    
  } catch (error) {
    console.error("Erro ao enviar contato:", error);
    mostrarMensagem("Erro ao enviar mensagem.", "error");
  }
}

// ========================================
// SISTEMA DE ADMINISTRAÇÃO
// ========================================

// Função para alternar para o modo admin (redireciona para painel dedicado)
window.toggleAdmin = function() {
  // Verificar se já está autenticado
  const isAdmin = sessionStorage.getItem("isAdmin") === "true";
  
  if (!isAdmin) {
    const senha = prompt("🔐 Digite a senha de administrador:");
    if (senha === "admin123") {
      sessionStorage.setItem("isAdmin", "true");
      mostrarMensagem("✅ Redirecionando para o painel administrativo...", "success");
      setTimeout(() => {
        window.location.href = "pages/admin.html";
      }, 1500);
    } else {
      mostrarMensagem("❌ Senha incorreta!", "error");
    }
  } else {
    // Já está autenticado, redirecionar direto
    mostrarMensagem("🔄 Redirecionando para o painel administrativo...", "info");
    setTimeout(() => {
      window.location.href = "pages/admin.html";
    }, 1000);
  }
};

// Inicialização da página

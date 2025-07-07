/* Sistema Principal - Raízes da Amazônia */

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Iniciando aplicação...");

  carregarReceitas();
  carregarDicas();

  const formContato = document.getElementById("form-contato");
  if (formContato) {
    formContato.addEventListener("submit", enviarContato);
  }
});

function mostrarMensagem(texto, tipo = "info", duracao = 3000) {
  if (window.RaizesAmazonia?.UI?.showMessage) {
    return window.RaizesAmazonia.UI.showMessage(texto, tipo, duracao);
  }

  const mensagemExistente = document.querySelector(".mensagem");
  if (mensagemExistente) {
    mensagemExistente.remove();
  }

  const mensagem = document.createElement("div");
  mensagem.className = `mensagem mensagem-${tipo}`;

  const cores = {
    success: "#28a745",
    error: "#dc3545",
    warning: "#ffc107",
    info: "#17a2b8",
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

  setTimeout(() => {
    if (mensagem.parentElement) {
      mensagem.remove();
    }
  }, duracao);
}

function getApiBaseUrl() {
  return window.RaizesAmazonia?.Config?.API_BASE_URL || "http://127.0.0.1:8000";
}

async function carregarReceitas() {
  try {
    console.log("Carregando receitas...");

    if (window.RaizesAmazonia?.ReceitaManager) {
      const receitas =
        await window.RaizesAmazonia.ReceitaManager.carregarReceitas();
      const container = document.querySelector(".card-container");

      if (container) {
        renderizarReceitas(receitas.slice(0, 6), container);
      }
      return;
    }

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
  if (window.RaizesAmazonia?.UI?.mostrarErroConexao) {
    window.RaizesAmazonia.UI.mostrarErroConexao(
      ".card-container",
      "carregarReceitas"
    );
  } else {
    const container = document.querySelector(".card-container");
    if (container) {
      container.innerHTML = `
        <div class="erro-conexao">
          <div class="erro-content">
            <h3>⚠️ Erro de Conexão</h3>
            <p>Não foi possível conectar com o servidor.</p>
            <p>Certifique-se de que o backend está rodando em <code>http://127.0.0.1:8000</code></p>
            <button onclick="carregarReceitas()" class="btn-retry">Tentar Novamente</button>
          </div>
        </div>
      `;
    }
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

  receitas.forEach((receita) => {
    const card = document.createElement("div");
    card.className = "card";

    const imagemUrl = receita.imagem
      ? `${getApiBaseUrl()}${receita.imagem}`
      : null;

    card.innerHTML = `
      ${
        imagemUrl
          ? `<img src="${imagemUrl}" alt="${receita.nome}" />`
          : `<div class="card-placeholder" style="height: 200px; background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%); display: flex; align-items: center; justify-content: center; color: #999; font-size: 48px; border: 2px dashed #ccc; border-radius: 8px;">📷</div>`
      }
      <h3>${receita.nome}</h3>
      <p>${receita.descricao}</p>
      <div class="card-actions">
        <button onclick="verReceita('${
          receita.id
        }')" class="card-button">Ver Receita</button>
      </div>
    `;

    container.appendChild(card);
  });
}

function verReceita(id) {
  window.location.href = `pages/receita.html?id=${id}`;
}

async function carregarDicas() {
  try {
    console.log("Carregando dicas...");

    if (window.RaizesAmazonia?.DicaManager) {
      const dicas = await window.RaizesAmazonia.DicaManager.carregarDicas();
      const container = document.querySelector(".dicas-scroll ul");

      if (container) {
        renderizarDicas(dicas, container);
      }
      return;
    }

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

  dicas.forEach((dica) => {
    const dicaElement = document.createElement("li");
    dicaElement.innerHTML = `
      <div class="dica-content">
        <span class="dica-text">${dica.conteudo || dica.texto || ""}</span>
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

window.toggleAdmin = function () {
  const isAdmin = sessionStorage.getItem("isAdmin") === "true";

  if (!isAdmin) {
    const senha = prompt("🔐 Digite a senha de administrador:");
    if (senha === "admin123") {
      sessionStorage.setItem("isAdmin", "true");
      mostrarMensagem(
        "✅ Redirecionando para o painel administrativo...",
        "success"
      );
      setTimeout(() => {
        window.location.href = "pages/admin.html";
      }, 1500);
    } else {
      mostrarMensagem("❌ Senha incorreta!", "error");
    }
  } else {
    mostrarMensagem(
      "🔄 Redirecionando para o painel administrativo...",
      "info"
    );
    setTimeout(() => {
      window.location.href = "pages/admin.html";
    }, 1000);
  }
};

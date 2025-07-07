const API_BASE_URL =
  window.RaizesAmazonia?.Config?.API_BASE_URL || "http://127.0.0.1:8000";

function getParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    id: params.get("id"),
  };
}

async function carregarReceitaAPI(id) {
  try {
    console.log(`📖 Carregando receita com ID: ${id}`);

    const response = await fetch(`${API_BASE_URL}/api/receitas/${id}`);

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const receita = await response.json();
    console.log("✅ Receita carregada:", receita);

    return receita;
  } catch (error) {
    console.error("❌ Erro ao carregar receita:", error);
    throw error;
  }
}

function processarIngredientes(ingredientesText) {
  if (!ingredientesText) return [];
  return ingredientesText
    .split("\n")
    .map((ing) => ing.trim())
    .filter((ing) => ing.length > 0);
}

function processarModoPreparo(modoPreparoText) {
  if (!modoPreparoText) return [];
  return modoPreparoText
    .split("\n")
    .map((passo) => passo.trim())
    .filter((passo) => passo.length > 0);
}

function renderizarReceita(receita) {
  document.title = `${receita.nome} - Raízes da Amazônia`;
  document.getElementById("titulo-receita").textContent = receita.nome;

  const imgElement = document.getElementById("foto-receita");
  if (receita.imagem) {
    imgElement.src = `${API_BASE_URL}${receita.imagem}`;
    imgElement.alt = receita.nome;
    imgElement.style.display = "block";
  } else {
    imgElement.style.display = "none";
    const placeholderDiv = document.createElement("div");
    placeholderDiv.className = "receita-imagem-placeholder";
    placeholderDiv.style.cssText = `
      width: 100%; 
      height: 300px; 
      background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%); 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      color: #999; 
      font-size: 48px; 
      border: 2px dashed #ccc; 
      border-radius: 8px;
      margin-bottom: 2rem;
    `;
    placeholderDiv.innerHTML = "📷";
    imgElement.parentNode.insertBefore(placeholderDiv, imgElement.nextSibling);
  }

  const historiaElement = document.getElementById("historia-receita");
  if (receita.historia && receita.historia.trim()) {
    historiaElement.textContent = receita.historia;
    historiaElement.parentElement.style.display = "block";
  } else {
    historiaElement.textContent =
      "Esta receita é uma delícia tradicional da culinária amazônica, passada de geração em geração.";
  }

  const ingredientesList = document.getElementById("ingredientes-lista");
  ingredientesList.innerHTML = "";
  const ingredientes = processarIngredientes(receita.ingredientes);

  if (ingredientes.length > 0) {
    ingredientes.forEach((ingrediente) => {
      const li = document.createElement("li");
      li.textContent = ingrediente;
      ingredientesList.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.textContent = "Ingredientes não especificados.";
    ingredientesList.appendChild(li);
  }

  const preparoList = document.getElementById("preparo-lista");
  preparoList.innerHTML = "";
  const passos = processarModoPreparo(receita.modo_preparo);

  if (passos.length > 0) {
    passos.forEach((passo) => {
      const li = document.createElement("li");
      li.textContent = passo;
      preparoList.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.textContent = "Modo de preparo não especificado.";
    preparoList.appendChild(li);
  }
}

function mostrarLoading(mostrar = true) {
  let loadingDiv = document.getElementById("loading-receita");

  if (mostrar) {
    if (!loadingDiv) {
      loadingDiv = document.createElement("div");
      loadingDiv.id = "loading-receita";
      loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        font-size: 18px;
        color: #333;
      `;
      loadingDiv.innerHTML = `
        <div style="text-align: center;">
          <div style="font-size: 32px; margin-bottom: 1rem;">📖</div>
          <div>Carregando receita...</div>
        </div>
      `;
      document.body.appendChild(loadingDiv);
    }
    loadingDiv.style.display = "flex";
  } else {
    if (loadingDiv) {
      loadingDiv.style.display = "none";
    }
  }
}

function mostrarErro(mensagem) {
  const isConnectionError =
    mensagem.includes("Failed to fetch") ||
    mensagem.includes("NetworkError") ||
    mensagem.includes("ERR_CONNECTION") ||
    mensagem.includes("Não foi possível carregar") ||
    !navigator.onLine;

  const container = document.querySelector(".receita-container");

  if (isConnectionError) {
    container.innerHTML = `
      <div class="erro-conexao">
        <div class="erro-content">
          <h3>⚠️ Erro de Conexão</h3>
          <p>Não foi possível conectar com o servidor.</p>
          <p>Certifique-se de que o backend está rodando em <code>http://127.0.0.1:8000</code></p>
          <button onclick="carregarDetalhes()" class="btn-retry">Tentar Novamente</button>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: #e74c3c;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">❌</h1>
        <h2>Erro ao carregar receita</h2>
        <p style="margin: 1rem 0; font-size: 1.1rem;">${mensagem}</p>
        <button onclick="window.location.href='../index.html'" 
                style="padding: 1rem 2rem; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 1rem;">
          ← Voltar para o Início
        </button>
      </div>
    `;
  }
}

async function carregarDetalhes() {
  const params = getParams();

  if (params.id) {
    await carregarDetalhesAPI(params.id);
  } else {
    mostrarErro("ID da receita não fornecido na URL.");
  }
}

async function carregarDetalhesAPI(id) {
  mostrarLoading(true);

  try {
    const receita = await carregarReceitaAPI(id);
    renderizarReceita(receita);
  } catch (error) {
    console.error("❌ Erro ao carregar receita:", error);
    mostrarErro(`Não foi possível carregar a receita. ${error.message}`);
  } finally {
    mostrarLoading(false);
  }
}

document.addEventListener("DOMContentLoaded", carregarDetalhes);

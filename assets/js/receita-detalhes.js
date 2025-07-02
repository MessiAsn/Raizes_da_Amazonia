// Configuração da API
const API_BASE_URL =
  window.RaizesAmazonia?.Config?.API_BASE_URL || "http://localhost:8000";

function getParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    id: params.get("id") || null,
  };
}

function formatarNome(nome) {
  return nome
    .replace(/-/g, " ") // Troca hífens por espaços
    .replace(/(?:^|\s)\S/g, (char) => char.toUpperCase()); // Capitaliza apenas a primeira letra de cada palavra
}

async function carregarDetalhes() {
  const { id } = getParams();

  // Se temos ID, buscar do backend
  if (id) {
    await carregarDetalhesDoBackend(id);
    return;
  }

  // Fallback se não temos ID
  mostrarErroSemDados();
}

async function carregarDetalhesDoBackend(id) {
  try {
    console.log(`Buscando receita com ID: ${id} da API: ${API_BASE_URL}`);

    const response = await fetch(`${API_BASE_URL}/api/receitas/${id}`);

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    const receita = await response.json();
    console.log("Receita carregada:", receita);

    // Preencher informações básicas
    document.getElementById("titulo-receita").textContent =
      receita.nome || "Receita";

    // Configurar imagem
    const fotoElement = document.getElementById("foto-receita");
    if (receita.imagem) {
      fotoElement.src = `${API_BASE_URL}${receita.imagem}`;
      fotoElement.alt = receita.nome;
      fotoElement.style.display = "block";
      fotoElement.onerror = () => {
        fotoElement.style.display = "none";
        console.warn("Falha ao carregar imagem:", receita.imagem);
      };
    } else {
      fotoElement.style.display = "none";
    }

    // Preencher dados da receita
    preencherDetalhesDoBackend(receita);
  } catch (error) {
    console.error("Erro ao carregar receita do backend:", error);
    mostrarErroConexao();
  }
}

function preencherDetalhesDoBackend(receita) {
  // Ingredientes do backend
  const ul = document.getElementById("ingredientes-lista");
  ul.innerHTML = "";
  if (receita.ingredientes) {
    let ingredientesArray = [];

    if (Array.isArray(receita.ingredientes)) {
      ingredientesArray = receita.ingredientes;
    } else if (typeof receita.ingredientes === "string") {
      // Processar string - dividir por quebras de linha
      ingredientesArray = receita.ingredientes
        .split(/\r?\n/)
        .filter((item) => item.trim());
    }

    ingredientesArray.forEach((ing) => {
      const li = document.createElement("li");
      li.textContent = ing.trim();
      ul.appendChild(li);
    });
  } else {
    ul.innerHTML = "<li>Ingredientes não informados.</li>";
  }

  // Modo de preparo do backend
  const ol = document.getElementById("preparo-lista");
  ol.innerHTML = "";
  if (receita.modo_preparo) {
    let preparoArray = [];

    if (Array.isArray(receita.modo_preparo)) {
      preparoArray = receita.modo_preparo;
    } else if (typeof receita.modo_preparo === "string") {
      // Processar string - dividir por quebras de linha
      preparoArray = receita.modo_preparo
        .split(/\r?\n/)
        .filter((item) => item.trim());
    }

    preparoArray.forEach((passo) => {
      const li = document.createElement("li");
      li.textContent = passo.trim();
      ol.appendChild(li);
    });
  } else {
    ol.innerHTML = "<li>Modo de preparo não informado.</li>";
  }

  // História do backend
  const historiaElemento = document.getElementById("historia-receita");
  historiaElemento.textContent = receita.historia || "História não disponível.";
}

function mostrarErroConexao() {
  document.getElementById("titulo-receita").textContent =
    "Erro ao Carregar Receita";
  document.getElementById("foto-receita").style.display = "none";
  document.getElementById("ingredientes-lista").innerHTML =
    "<li>❌ Erro de conexão com o servidor.</li>";
  document.getElementById("preparo-lista").innerHTML =
    "<li>❌ Não foi possível carregar os dados da receita.</li>";
  document.getElementById("historia-receita").textContent =
    "Erro ao conectar com o servidor. Verifique se o backend está funcionando.";
}

function mostrarErroSemDados() {
  document.getElementById("titulo-receita").textContent =
    "Receita Não Encontrada";
  document.getElementById("foto-receita").style.display = "none";
  document.getElementById("ingredientes-lista").innerHTML =
    "<li>❌ ID da receita não fornecido.</li>";
  document.getElementById("preparo-lista").innerHTML =
    "<li>❌ Parâmetros necessários não encontrados na URL.</li>";
  document.getElementById("historia-receita").textContent =
    "Não foi possível identificar qual receita carregar.";
}

carregarDetalhes();

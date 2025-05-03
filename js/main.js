const receitas = [
  {
    "nome": "Tacacá",
    "descricao": "Caldo quente de tucupi com goma de mandioca, jambu e camarão.",
    "imagem": "../imgs/tacaca.png",
    "link": "https://pt.wikipedia.org/wiki/Tacac%C3%A1"
  },
  {
    "nome": "X-Caboquinho",
    "descricao": "Sanduíche regional com tucumã, banana frita e queijo coalho.",
    "imagem": "../imgs/xcaboquinho.png",
    "link": "https://pt.wikipedia.org/wiki/X-caboquinho"
  },
  {
    "nome": "Pato no Tucupi",
    "descricao": "Pato cozido no tucupi com jambu, prato típico do norte.",
    "imagem": "../imgs/patotucupi.png",
    "link": "https://pt.wikipedia.org/wiki/Pato_no_tucupi"
  },
  {
    "nome": "Pirarucu de Casaca",
    "descricao": "Pirarucu desfiado, arroz, farofa e vegetais, prato tradicional do Amazonas.",
    "imagem": "../imgs/pirarucu-de-casaca.jpg",
    "link": "https://pt.wikipedia.org/wiki/Pirarucu_de_Casaca"
  },
  {
    "nome": "Curau",
    "descricao": "Sobremesa feita com milho verde, leite, açúcar e canela.",
    "imagem": "../imgs/curau.jpg",
    "link": "https://pt.wikipedia.org/wiki/Curau"
  },
  {
    "nome": "Moqueca",
    "descricao": "Prato cremoso de peixe cozido com leite de coco, azeite de dendê, pimentões e tomates.",
    "imagem": "../imgs/moqueca.jpg",
    "link": "https://pt.wikipedia.org/wiki/Moqueca"
  },
  {
    "nome": "Bobó de Camarão",
    "descricao": "Camarões cozidos em um creme de mandioca com leite de coco e azeite de dendê.",
    "imagem": "../imgs/bobo-de-camarao.jpg",
    "link": "https://pt.wikipedia.org/wiki/Bob%C3%B3_de_camar%C3%A3o"
  },
  {
    "nome": "Canjica",
    "descricao": "Prato doce feito com milho branco cozido com leite, açúcar e especiarias.",
    "imagem": "../imgs/canjica.jpg",
    "link": "https://pt.wikipedia.org/wiki/Canjica"
  }
];

const container = document.querySelector(".card-container");

receitas.forEach((r) => {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <img src="${r.imagem}" alt="${r.nome}" />
    <h3>${r.nome}</h3>
    <p>${r.descricao}</p>
    <a href="${r.link}" target="_blank"><button>Ver Receita</button></a>
  `;

  container.appendChild(card);
});

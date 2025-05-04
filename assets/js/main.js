/* Alimentação de Receitas */
const receitas = [
  {
    "nome": "Tacacá",
    "descricao": "Caldo quente de tucupi com goma de mandioca, jambu e camarão.",
    "imagem": "assets/imgs/tacaca.png",
    "link": "pages/receita.html?nome=Tacacá&descricao=Caldo+quente+de+tucupi+com+goma+de+mandioca%2C+jambu+e+camar%C3%A3o.&imagem=../assets%2Fimgs%2Ftacaca.png"
  },
  {
    "nome": "X-Caboquinho",
    "descricao": "Sanduíche regional com tucumã, banana frita e queijo coalho.",
    "imagem": "assets/imgs/xcaboquinho.png",
    "link": "pages/receita.html?nome=X-Caboquinho&descricao=Sandu%C3%ADche+regional+com+tucum%C3%A3%2C+banana+frita+e+queijo+coalho.&imagem=../assets%2Fimgs%2Fxcaboquinho.png"
  },
  {
    "nome": "Pato no Tucupi",
    "descricao": "Pato cozido no tucupi com jambu, prato típico do norte.",
    "imagem": "assets/imgs/patotucupi.jpg",
    "link": "pages/receita.html?nome=Pato+no+Tucupi&descricao=Pato+cozido+no+tucupi+com+jambu%2C+prato+t%C3%ADpico+do+norte.&imagem=../assets%2Fimgs%2Fpatotucupi.jpg"
  },
  {
    "nome": "Pirarucu de Casaca",
    "descricao": "Pirarucu desfiado, arroz, farofa e vegetais, prato tradicional do Amazonas.",
    "imagem": "assets/imgs/pirarucucasaca.jpg",
    "link": "pages/receita.html?nome=Bob%C3%B3+de+Camar%C3%A3o&descricao=Camar%C3%B5es+cozidos+em+um+creme+de+mandioca+com+leite+de+coco+e+azeite+de+dend%C3%AA.&imagem=../assets%2Fimgs%2Fbobocamarao.jpg"
  },
  {
    "nome": "Curau",
    "descricao": "Sobremesa feita com milho verde, leite, açúcar e canela.",
    "imagem": "assets/imgs/curau.jpg",
    "link": "pages/receita.html?nome=Curau&descricao=Sobremesa+feita+com+milho+verde%2C+leite%2C+a%C3%A7%C3%BAcar+e+canela.&imagem=../assets%2Fimgs%2Fcurau.jpg"
  },
  {
    "nome": "Moqueca",
    "descricao": "Prato cremoso de peixe cozido com leite de coco, azeite de dendê, pimentões e tomates.",
    "imagem": "assets/imgs/moqueca.jpg",
    "link": "pages/receita.html?nome=Moqueca&descricao=Prato+cremoso+de+peixe+cozido+com+leite+de+coco%2C+azeite+de+dend%C3%AA%2C+piment%C3%B5es+e+tomates.&imagem=../assets%2Fimgs%2Fmoqueca.jpg"
  },
  {
    "nome": "Bobó de Camarão",
    "descricao": "Camarões cozidos em um creme de mandioca com leite de coco e azeite de dendê.",
    "imagem": "assets/imgs/bobocamarao.jpg",
    "link": "pages/receita.html?nome=Bobó+de+Camarão&descricao=Camar%C3%B5es+cozidos+em+um+creme+de+mandioca+com+leite+de+coco+e+azeite+de+dend%C3%AA.&imagem=../assets%2Fimgs%2Fbobocamarao.jpg"
  },
  {
    "nome": "Canjica",
    "descricao": "Prato doce feito com milho branco cozido com leite, açúcar e especiarias.",
    "imagem": "assets/imgs/canjica.jpg",
    "link": "pages/receita.html?nome=Canjica&descricao=Prato+doce+feito+com+milho+branco+cozido+com+leite%2C+a%C3%A7%C3%BAcar+e+especiarias.&imagem=../assets%2Fimgs%2Fcanjica.jpg"
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
    <a href="${r.link}"><button>Ver Receita</button></a>
  `;

  container.appendChild(card);
});

/* Alimentação de Dicas */
const dicas = [
  "Prefira ingredientes regionais frescos para um sabor mais autêntico.",
  "Tucupi precisa ser fervido antes de ser utilizado em receitas, para eliminar toxinas.",
  "Jaraqui: para um prato mais saboroso, garanta que as escamas fiquem crocantes na fritura.",
  "A goma de tapioca deve descansar por 2 horas para garantir a textura perfeita.",
  "Use óleo de babaçu para dar um toque especial e amazônico às suas receitas.",
  "Para o prato de maniçoba, escolha folhas frescas e cozinhe por longas horas.",
  "Peixe fresco realça o sabor natural do prato e evita o gosto de ingredientes congelados.",
  "Ao preparar açaí, adicione farinha de tapioca e mel para um sabor tradicional da Amazônia.",
  "Pimenta de cheiro dá um toque marcante e regional ao prato.",
  "Molho de peixe com açaí é uma mistura exótica e surpreendente.",
  "Ao cozinhar tucupi, acrescente alho e chicória para um sabor mais encorpado.",
  "Use folha de bananeira para embalar e assar alimentos no forno ou churrasqueira.",
  "A farinha d’água é ideal para acompanhar peixes e pratos com açaí.",
  "Experimente defumar o peixe com madeira de árvores amazônicas para sabor autêntico.",
  "Cozinhe o jambu apenas até murchar, para preservar sua textura e leve dormência.",
  "O tucumã deve estar bem maduro para ser usado no X-Caboquinho.",
  "Cozinhe castanha-do-pará em caldas para criar sobremesas únicas.",
  "Use banana pacovã frita em pratos salgados como acompanhamento.",
  "Evite ferver o açaí: ele deve ser consumido cru e fresco para manter seus nutrientes.",
  "Adicione folhas de chicória-do-pará no final da preparação para aroma marcante.",
  "Farinha de tapioca é ótima para engrossar caldos e sopas regionais.",
  "Manter o tucupi em geladeira prolonga sua validade e mantém o sabor original.",
  "Use tucupi com camarão seco para realçar o sabor do prato.",
  "Cozinhe a maniçoba por pelo menos 3 dias, renovando a água, para eliminar toxinas.",
  "A manteiga de garrafa é excelente para frituras e dá um sabor nordestino aos pratos.",
  "Ferva a castanha antes de moê-la para evitar amargor.",
  "Evite congelar jambu: ele perde textura e aroma.",
  "Molhos com cupuaçu combinam bem com carnes grelhadas.",
  "Misture tucumã com queijo coalho para rechear pães e sanduíches.",
  "Use farinha de uarini em caldos para um sabor amazônico único.",
  "Adicione cebolinha e coentro apenas no final da cocção para manter o frescor.",
  "Experimente cozinhar peixes em folha de bananeira no vapor.",
  "Faça vinagrete com cupuaçu para acompanhar saladas tropicais.",
  "Misture tapioca com coco ralado para uma sobremesa rápida.",
  "Camarão seco triturado é ótimo para temperar arroz e farofas.",
  "Não lave a goma de mandioca após coada, para manter sua liga natural.",
  "O açaí fica ainda melhor servido com peixe assado e farinha de mandioca.",
  "Use o óleo do próprio peixe para refogar temperos regionais.",
  "Evite o uso excessivo de sal: os sabores naturais dos ingredientes amazônicos já são intensos.",
  "Experimente fazer caldos com espinhas e cabeças de peixe para aproveitar melhor o alimento.",
  "Frite a banana pacovã só quando estiver madura para obter uma textura cremosa por dentro.",
  "Prepare doce de cupuaçu com leite condensado para recheios de bolos e tortas.",
  "Misture farinha de castanha com tapioca para um café da manhã energético.",
  "Evite ferver o jambu por muito tempo para não perder suas propriedades anestésicas.",
  "O tucupi pode ser usado como base para sopas e caldos com legumes regionais.",
  "Aproveite a casca da mandioca para fazer farinha artesanal.",
  "Utilize o caroço do tucumã para fazer artesanato ou extrair óleo artesanal.",
  "Ao grelhar peixe amazônico, use folhas de chicória sob a grelha para evitar que grude.",
  "Corte o jambu com tesoura para facilitar o preparo e manter o formato das folhas."
];
const dicasList = document.querySelector(".dicas-scroll ul");

dicas.forEach((dica) => {
  const li = document.createElement("li");
  li.textContent = dica;
  dicasList.appendChild(li);
});
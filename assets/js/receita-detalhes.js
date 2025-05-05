// Função para obter parâmetros da URL
function getParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    nome: params.get("nome") ? decodeURIComponent(params.get("nome").toLowerCase().replace(/\s+/g, '-')) : "receita",
    descricao: params.get("descricao") || "",
    imagem: params.get("imagem") || "",
    historia: params.get("historia") ? decodeURIComponent(params.get("historia")) : ""
  };
}



// Detalhes das receitas com as chaves normalizadas (sem acento e em minúsculas)
const detalhesReceitas = {
    "tacacá": {
      historia: [
        "O Tacacá é um dos pratos mais emblemáticos da Amazônia, com raízes profundas na cultura indígena e na culinária paraense. A combinação de tucupi, jambu e camarões secos faz deste prato uma verdadeira experiência sensorial. O jambu, uma planta nativa, confere uma sensação única de formigamento na boca, que é um convite para explorar os sabores intensos da região. Tradicionalmente servido em cuia, o Tacacá não é apenas comida, mas um ritual que conecta as pessoas à terra e aos seus costumes."
      ],
      ingredientes: [
        "1 litro de tucupi (fervido por 30 minutos para neutralizar o ácido cianídrico)",
        "2 colheres de sopa de goma de mandioca (dissolvida em 200ml de água fria)",
        "100g de jambu fresco (apenas folhas e botões florais)",
        "150g de camarão seco médio (dessalgado por 2 horas em água gelada)",
        "4 dentes de alho roxo (amassados)",
        "1 colher de chá de sal rosa (ou a gosto)",
        "Pimenta-de-cheiro a gosto (opcional)"
      ],
      preparo: [
        "Prepare o tucupi: Em panela de barro, ferva o tucupi com alho e sal por exatos 30 minutos, removendo as impurezas que subirem à superfície",
        "Trate o jambu: Lave bem as folhas, branqueie em água fervente por 90 segundos e mergulhe imediatamente em água com gelo para manter a cor vibrante",
        "Prepare a goma: Dissolva completamente em água fria antes de levar ao fogo. Cozinhe em fogo baixo, mexendo constantemente com fouet até obter textura de mingau cremoso (cerca de 8-10 minutos)",
        "Montagem final: Em cuia de barro pré-aquecida, coloque 2 colheres de goma no fundo, 5-6 folhas de jambu e 8-10 camarões. Despeje o tucupi fumegante até cobrir",
        "Descanso: Deixe repousar por 2 minutos antes de servir para os sabores se harmonizarem"
      ]
    },
    "x-caboquinho": {
      historia: [
        "O X-Caboquinho nasceu nas ruas de Manaus, misturando ingredientes típicos da floresta com a simplicidade do pão. Tucumã e queijo coalho, juntos, formam uma combinação irresistível de sabor e textura, enquanto a banana pacovã caramelizada traz o doce equilibrado com a crocância do pão francês. Esse sanduíche é uma homenagem à riqueza da culinária amazônica e, ao mesmo tempo, uma forma de trazer a natureza para as mãos de quem prova."
      ],
      ingredientes: [
        "4 pães franceses artesanais (casca crocante, miolo macio)",
        "200g de tucumã da Amazônia (polpa sem fibras, fatiada em 5mm de espessura)",
        "200g de queijo coalho artesanal (fatias de 1cm de espessura)",
        "4 bananas pacovã orgânicas (maduras mas firmes, cortadas longitudinalmente em 3 partes)",
        "50ml de manteiga de garrafa clarificada (para fritar)",
        "Pó de guaraná nativo (para polvilhar - opcional)"
      ],
      preparo: [
        "Preparo das bananas: Em frigideira de ferro, aqueça a manteiga a 180°C. Frite as bananas por 2 minutos de cada lado até caramelizar, escorrendo em papel absorvente",
        "Preparo do queijo: Grelhe as fatias em chapa quente por 45 segundos de cada lado apenas para marcar, mantendo o interior cremoso",
        "Montagem: Abra os pães levemente tostados, coloque primeiro 1 fatia de queijo ainda quente, depois 3 fatias de tucumã ligeiramente sobrepostas, e finalize com 2 fatias de banana caramelizada",
        "Pressão: Pressione levemente por 10 segundos para integrar os sabores sem esmagar os ingredientes",
        "Finalização: Polvilhe com pó de guaraná e sirva imediatamente"
      ]
    },
    "pato-no-tucupi": {
      historia: [
        "O Pato no Tucupi é um prato tradicional do Pará, que tem suas raízes na culinária indígena e foi amplamente popularizado pelos paraenses. O tucupi, um caldo extraído da mandioca, é o elemento central que confere o sabor único e característico do prato. A mistura do tucupi com o pato caipira e o jambu cria um prato saboroso e cheio de tradição. É comum ser servido durante festas típicas como o Círio de Nazaré, celebrando a cultura paraense."
      ],
      ingredientes: [
        "1 pato caipira (cerca de 2kg, cortado em 8 pedaços com pele)",
        "1,5 litro de tucupi artesanal (já fervido)",
        "200g de jambu orgânico (folhas selecionadas)",
        "1 cebola roxa média (em cubos de 1cm)",
        "6 dentes de alho amazônico (triturados)",
        "3 colheres de sopa de azeite de dendê tradicional",
        "2 folhas de louro-da-mata frescas",
        "Sal grosso marinho (a gosto)"
      ],
      preparo: [
        "Marinada: Esfregue os pedaços de pato com alho triturado e sal grosso. Deixe descansar por 12 horas refrigerado em recipiente coberto",
        "Selação: Em panela de ferro, doure os pedaços na própria gordura em fogo médio-alto (cerca de 4 minutos por lado) até criar crosta dourada",
        "Cozimento lento: Adicione cebola, louro e tucupi. Cozinhe em fogo brando por 2 horas (ou 45min em panela de pressão), virando os pedaços a cada 30 minutos",
        "Ponto do jambu: Adicione as folhas de jambu e cozinhe por apenas 3 minutos (o suficiente para murchar levemente, mantendo o efeito característico)",
        "Finalização: Regue com azeite de dendê e sirva em terrina de barro, acompanhado de arroz branco e farofa d'água"
      ]
    },
    "pirarucu-de-casaca": {
      historia: [
        "O Pirarucu de Casaca é um prato típico da culinária amazônica, especialmente do estado do Amazonas. A base do prato é o pirarucu, um peixe gigante da região, combinado com arroz, farofa e legumes. Ele é conhecido por seu preparo que representa a rica biodiversidade da Amazônia, onde o peixe é protagonista, acompanhado de ingredientes simples, mas que trazem um sabor incomparável. A casaca é uma espécie de torta, com camadas de arroz e peixe, tornando esse prato uma verdadeira delícia regional."
      ],
      ingredientes: [
        "500g de pirarucu salgado (dessalgado por 24h com 3 trocas de água)",
        "2 xícaras de arroz agulhinha (cozido no caldo do peixe)",
        "1 xícara de farofa de mandioca (dourada com cubos de bacon)",
        "200g de mix de legumes (abóbora japonesa, chuchu e pimentão amarelo cortados em julienne)",
        "1 cebola roxa grande (em rodelas finas)",
        "2 ovos caipiras (cozidos por 8 minutos e cortados em rodelas)",
        "50g de azeitonas pretas (sem caroço)",
        "1 limão taiti (para regar)",
        "Salsinha e cebolinha (picadas para decorar)"
      ],
      preparo: [
        "Preparo do pirarucu: Cozinhe o peixe dessalgado em água limpa por 20 minutos. Desfie em lascas grossas e refogue rapidamente com alho e cebola",
        "Camadas: Em refratário de vidro, faça camadas na ordem: arroz, pirarucu, farofa, legumes. Repita até acabar os ingredientes, terminando com farofa",
        "Decoração: Arrume as rodelas de ovo cozido e azeitonas na superfície, formando padrão circular",
        "Finalização: Regue com suco de limão taiti, polvilhe as ervas frescas e leve ao forno a 180°C por 10 minutos apenas para aquecer",
        "Servir: Deixe repousar 5 minutos antes de levar à mesa"
      ]
    },
    "curau": {
      historia: [
        "O Curau é uma sobremesa tradicional da culinária brasileira, com forte presença nas festas juninas, especialmente no Norte e Nordeste. Feito a partir do milho verde, o curau tem um sabor doce e cremoso, que encanta gerações. Sua preparação simples, com leite, açúcar e manteiga, remete aos sabores das festas típicas e à rica produção agrícola do Brasil, especialmente no campo do milho."
      ],
        ingredientes: [
          "6 espigas de milho verde orgânico (variedade doce, grãos no ponto leitoso)",
          "1 litro de leite integral fresco",
          "1 xícara de açúcar demerara (ou ¾ xícara para versão menos doce)",
          "1 colher de sopa de manteiga da terra",
          "2 pauzinhos de canela-do-ceilão",
          "1 pitada de sal rosa (para balancear os sabores)",
          "Canela em pó fina (para polvilhar)",
          "1 colher de chá de essência de baunilha (opcional)"
        ],
        preparo: [
          "Preparo do milho: Descasque as espigas e raspe os grãos com faca afiada, aproveitando todo o leite do sabugo",
          "Extração: Bata o milho no liquidificador com 500ml do leite até obter um creme homogêneo. Passe por peneira fina, pressionando bem com uma colher",
          "Cozimento: Em panela de cobre (ou antiaderente grossa), misture o creme de milho com o leite restante, açúcar, canela em pau e sal. Cozinhe em fogo médio-baixo, mexendo sempre com colher de pau por 35-40 minutos",
          "Ponto ideal: Quando a mistura cobrir totalmente o dorso da colher e começar a soltar do fundo da panela",
          "Finalização: Retire os paus de canela, adicione a manteiga e a baunilha. Mexa até incorporar",
          "Servir: Em tigelas individuais, polvilhe canela em pó formando desenhos. Sirva morno ou gelado"
        ]
      },
      "moqueca": {
        historia: [
        "A Moqueca é um prato de forte influência afro-brasileira, muito consumido nas regiões costeiras do Brasil, especialmente na Bahia e Espírito Santo. Sua combinação de peixe, leite de coco e azeite de dendê traz uma mistura de sabores e aromas intensos, que refletem a diversidade cultural do país. A Moqueca é um prato símbolo da hospitalidade e das festas em família, sendo preparada com muito carinho e servida em grande parte durante eventos especiais e celebrações."
      ],
        ingredientes: [
          "500g de filé de robalo (ou badejo, com pele e escamas)",
          "400ml de leite de coco artesanal (primeira extração)",
          "1 pimentão vermelho (em rodelas de 1cm)",
          "1 pimentão amarelo (em rodelas de 1cm)",
          "2 tomates italianos maduros (sem sementes, em rodelas)",
          "1 cebola roxa grande (em rodelas grossas)",
          "3 colheres de sopa de azeite de dendê tradicional",
          "1 maço de coentro fresco (folhas separadas)",
          "Suco de 2 limões-sicilianos",
          "2 dentes de alho triturados",
          "Pimenta biquinho (para decorar)",
          "Sal marinho grosso (a gosto)"
        ],
        preparo: [
          "Marinada: Tempere os filés com suco de limão, alho e sal. Deixe por 15 minutos em frigorífico",
          "Montagem: Em panela de barro não esmaltada, alterne camadas: cebola, pimentões, tomates e peixe. Repita até acabar os ingredientes",
          "Cozimento: Adicione o leite de coco cuidadosamente, sem cobrir completamente o peixe. Tampe e cozinhe em fogo médio-baixo por 25 minutos sem mexer",
          "Técnica: A cada 5 minutos, baste o peixe com o caldo usando concha",
          "Finalização: Regue com azeite de dendê, decore com coentro e pimentas biquinho. Tampe por 2 minutos antes de servir",
          "Acompanhamento: Sirva com arroz branco soltinho e pirão feito com o caldo"
        ]
      },
      "bobó-de-camarão": {
        historia: [
          "O Bobó de Camarão é um prato clássico da culinária nordestina, com influências africanas, que destaca o uso da mandioca e do leite de coco. A receita é rica em sabor, combinando camarões frescos com o purê de mandioca, formando uma combinação cremosa e deliciosa. Esse prato é uma verdadeira celebração da gastronomia brasileira e é tradicionalmente servido em festas e reuniões familiares."
        ],
        ingredientes: [
          "500g de camarões médios (com cabeça, limpos mas com casca)",
          "1 kg de mandioca branca (descascada e cortada em pedaços)",
          "600ml de leite de coco fresco (dividido em 300ml + 300ml)",
          "3 colheres de sopa de azeite de dendê",
          "1 cebola roxa média (picada finamente)",
          "3 dentes de alho triturados",
          "1 pimenta dedo-de-moça (sem sementes, picada)",
          "1 maço de cheiro-verde (salsinha e cebolinha picados)",
          "1 limão-taiti (suco)",
          "1 colher de chá de gengibre ralado",
          "Sal marinho (a gosto)",
          "1 pitada de pimenta-do-reino moída na hora"
        ],
        preparo: [
          "Cozimento da mandioca: Em panela com água fervente e sal, cozinhe a mandioca por 20-25 minutos até desmanchar. Reserve 1 xícara da água do cozimento",
          "Purê: Escorra a mandioca, bata no liquidificador com 300ml de leite de coco e a água reservada até obter creme liso",
          "Caldo de camarão: Em frigideira, aqueça 1 colher de dendê e frite as cabeças dos camarões por 3 minutos. Esmague com garfo, adicione 1/2 xícara de água e coe, reservando o caldo",
          "Refogado: Em panela larga, refogue cebola, alho e pimenta no dendê restante. Acrescente os camarões e refogue por 2 minutos",
          "Montagem: Junte o purê de mandioca aos poucos, alternando com o leite de coco restante e o caldo de camarão. Ajuste o sal e cozinhe em fogo baixo por 10 minutos",
          "Finalização: Acrescente gengibre, suco de limão e cheiro-verde. Mexa delicadamente e sirva com arroz branco e farofa"
        ]
      },
      "canjica": {
        historia: [
          "A Canjica é uma sobremesa que carrega uma forte tradição nas festas de São João, especialmente no Nordeste do Brasil. Feita com milho branco, leite condensado e coco ralado, a canjica é uma iguaria doce e reconfortante. Sua preparação remonta às raízes indígenas e africanas, com o milho como ingrediente central, sendo uma das principais sobremesas das festas juninas, marcando a convivência e as celebrações ao redor da fogueira."
        ],
        ingredientes: [
          "500g de milho branco para canjica (de molho por 8 horas em água gelada)",
          "1,5 litro de leite integral fresco",
          "1 xícara de açúcar mascavo (ou mais a gosto)",
          "2 colheres de sopa de manteiga sem sal",
          "5 cravos-da-índia",
          "2 pedaços de canela em pau (cerca de 5cm cada)",
          "1 lata de leite condensado (opcional para versão mais cremosa)",
          "1/2 xícara de coco ralado fresco (para decorar)",
          "Canela em pó (para polvilhar)",
          "1 pitada de sal (para realçar os sabores)"
        ],
        preparo: [
          "Cozimento inicial: Escorra o milho e cozinhe em panela de pressão com água filtrada e cravos por 40 minutos após iniciar a pressão (ou 1h30 em panela comum)",
          "Preparo do creme: Transfira para panela larga, acrescente o leite, canela em pau e cozinhe em fogo brando por 1 hora, mexendo ocasionalmente",
          "Ponto final: Quando os grãos estiverem macios mas ainda inteiros, adicione açúcar, manteiga e sal. Cozinhe por mais 10 minutos",
          "Textura: Para versão cremosa, adicione o leite condensado nos últimos 5 minutos",
          "Repouso: Desligue o fogo, tampe parcialmente e deixe descansar por 30 minutos para absorver os sabores",
          "Servir: Quente ou frio, polvilhado com coco ralado e canela em desenhos. Acompanha café forte"
        ]
      }
  };
  
  function formatarNome(nome) {
    return nome
        .replace(/-/g, ' ')  // Troca hífens por espaços
        .replace(/(?:^|\s)\S/g, char => char.toUpperCase()); // Capitaliza apenas a primeira letra de cada palavra
}

function carregarDetalhes() {
    const { nome, descricao, imagem } = getParams();

    const nomeFormatado = formatarNome(nome); // Formata o nome para exibição

    document.getElementById("titulo-receita").textContent = nomeFormatado;
    document.getElementById("foto-receita").src = decodeURIComponent(imagem);
    document.getElementById("foto-receita").alt = nomeFormatado;

    const dados = detalhesReceitas[nome.toLowerCase()];

    if (dados) {
        const ul = document.getElementById("ingredientes-lista");
        dados.ingredientes.forEach(ing => {
            const li = document.createElement("li");
            li.textContent = ing;
            ul.appendChild(li);
        });

        const ol = document.getElementById("preparo-lista");
        dados.preparo.forEach(passo => {
            const li = document.createElement("li");
            li.textContent = passo;
            ol.appendChild(li);
        });

        // Preencher a história
        const historiaElemento = document.getElementById("historia-receita");
        historiaElemento.textContent = dados.historia || "História não disponível."; // Adiciona história ou mensagem padrão
    } else {
        document.getElementById("ingredientes-lista").innerHTML = "<li>Dados não disponíveis.</li>";
        document.getElementById("preparo-lista").innerHTML = "<li>Dados não disponíveis.</li>";
        document.getElementById("historia-receita").textContent = "História não disponível."; // Caso não haja dados
    }
}

carregarDetalhes();

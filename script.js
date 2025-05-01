const receitas = [
    {
      nome: "Tacacá",
      descricao: "Caldo quente de tucupi com goma de mandioca, jambu e camarão.",
      imagem: "https://cdn.gazetasp.com.br/upload/dn_arquivo/2024/11/tacaca-o-que-e.jpg",
      link: "https://pt.wikipedia.org/wiki/Tacac%C3%A1"
    },
    {
      nome: "X-Caboquinho",
      descricao: "Sanduíche regional com tucumã, banana frita e queijo coalho.",
      imagem: "https://receitadaboa.com.br/wp-content/uploads/2024/09/X-Caboquinho.jpg",
      link: "https://pt.wikipedia.org/wiki/X-caboquinho"
    },
    {
      nome: "Pato no Tucupi",
      descricao: "Pato cozido no tucupi com jambu, prato típico do norte.",
      imagem: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfy0KoAPD-7ehCrDkg3sc45UoQ6aQl9j1rHg&s",
      link: "https://pt.wikipedia.org/wiki/Pato_no_tucupi"
    }
  ];
  
  const container = document.getElementById("receitas");
  
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
  
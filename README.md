# 🌿 Raízes da Amazônia

Sistema web para compartilhamento de receitas tradicionais da Amazônia, desenvolvido com HTML, CSS, JavaScript e FastAPI (Python).

## Funcionalidades

### Receitas

- Visualizar receitas em cards interativos
- Adicionar novas receitas com imagens
- Editar receitas existentes
- Excluir receitas (com confirmação dinâmica)
- Upload e gerenciamento de imagens
- Página de detalhes individual

### Dicas Culinárias

- Sistema de dicas rotativas
- Adicionar/editar/remover dicas (modo admin)

### Sistema Administrativo

- Login/logout de administrador
- Interface diferenciada para admins
- Controle de tentativas de login
- Bloqueio temporário por tentativas incorretas

### Funcionalidades Extras

- Acessibilidade (controle de tamanho da fonte)
- Formulário de contato com envio por email
- Design responsivo
- Mensagens toast dinâmicas
- Sistema de modais reutilizáveis

## Como Executar

### Backend (Python FastAPI)

```bash
# Opção 1: Automática (Windows)
start_backend.bat

# Opção 2: Manual
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend

- Abra `index.html` no navegador
- Ou acesse através de um servidor local

### URLs Importantes

- **Sistema**: `index.html`
- **API**: `http://localhost:8000`
- **Docs da API**: `http://localhost:8000/docs`

## Modo Administrador

- **Senha padrão**: `admin123`
- **Como acessar**: Clique no botão admin ou use Ctrl+Shift+A
- **Funcionalidades admin**: Criar/editar/excluir receitas e dicas

## Tecnologias

### Frontend

- **HTML5** - Estrutura semântica
- **CSS3** - Design responsivo e moderno
- **JavaScript ES6+** - Funcionalidades interativas
- **Arquitetura modular** - Namespace organizado

### Backend

- **Python 3.8+** - Linguagem principal
- **FastAPI** - Framework web moderno
- **SQLite** - Banco de dados
- **Uvicorn** - Servidor ASGI

## Estrutura do Projeto

```
raizes_da_amazonia/
├── assets/
│   ├── css/           # Estilos por página/funcionalidade
│   ├── js/            # Scripts modulares
│   └── imgs/          # Imagens do projeto
├── pages/             # Páginas HTML
├── backend/           # API Python FastAPI
├── uploads/           # Uploads de imagens
└── index.html         # Página principal
```

## API Endpoints

| Método   | Endpoint             | Descrição                  |
| -------- | -------------------- | -------------------------- |
| `GET`    | `/api/receitas`      | Listar todas as receitas   |
| `GET`    | `/api/receitas/{id}` | Obter receita específica   |
| `POST`   | `/api/receitas`      | Criar nova receita         |
| `PUT`    | `/api/receitas/{id}` | Atualizar receita          |
| `DELETE` | `/api/receitas/{id}` | Excluir receita            |
| `GET`    | `/api/dicas`         | Listar dicas culinárias    |
| `POST`   | `/api/contato`       | Enviar mensagem de contato |

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## Autor

Desenvolvido para fins educacionais - Projeto de Desenvolvimento Web.

---

**Preservando as tradições culinárias da Amazônia através da tecnologia**

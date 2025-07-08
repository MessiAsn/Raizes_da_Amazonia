# 🌿 Raízes da Amazônia

Sistema web para compartilhamento de receitas tradicionais da Amazônia, desenvolvido com HTML, CSS, JavaScript e backend Flask (Python). O projeto foca na preservação e divulgação das tradições culinárias amazônicas através de uma plataforma moderna e acessível.

## Funcionalidades

### 🍽️ Gestão de Receitas

- **Visualização**: Cards interativos com design responsivo e padronizado
- **Adição**: Interface intuitiva para novas receitas com upload de imagens
- **Edição**: Modificação completa de receitas existentes
- **Exclusão**: Remoção segura com confirmação dinâmica
- **Detalhes**: Página individual para cada receita
- **Busca por Nome**: Sistema de busca em tempo real para encontrar receitas pelo nome
- **Navegação**: Interface otimizada com contador de resultados e filtros

### 🌿 Dicas Culinárias

- **Exibição rotativa**: Sistema de dicas que alterna automaticamente
- **Gestão admin**: Adicionar, editar e remover dicas
- **Categorização**: Organização por temas culinários

### 🔐 Sistema Administrativo

- **Autenticação**: Login/logout seguro de administrador
- **Interface diferenciada**: Botões e funcionalidades exclusivas
- **Controle de acesso**: Proteção contra tentativas maliciosas
- **Bloqueio de segurança**: Sistema de tentativas limitadas

### ✨ Funcionalidades Modernas

- **Acessibilidade**: Controle dinâmico de tamanho da fonte
- **Contato**: Formulário com envio automático por email
- **Design responsivo**: Adaptação a todos os dispositivos
- **Notificações**: Sistema de mensagens toast dinâmicas
- **Modais**: Sistema reutilizável de janelas modais
- **UX otimizada**: Transições suaves e feedback visual

## Como Executar

### 🚀 Backend (Python Flask)

```bash
# Opção 1: Automática (Windows)
start_backend.bat

# Opção 2: Manual
cd backend
pip install -r requirements.txt
python main.py

# Opção 3: Modo debug
python debug_server.py
```

### 🌐 Frontend

- **Desenvolvimento**: Abra `index.html` diretamente no navegador
- **Produção**: Configure um servidor web (Apache, Nginx, etc.)
- **Local**: Use Live Server do VS Code ou similar

### 📡 URLs e Endpoints

- **Sistema Principal**: `index.html`
- **Todas as Receitas**: `pages/todas-receitas.html`
- **API Backend**: `http://localhost:5000`
- **Uploads**: `http://localhost:5000/uploads/{filename}`

### ⚙️ Configuração de Email

1. Copie `config_email_exemplo.py` para `config_email.py`
2. Configure suas credenciais SMTP
3. Reinicie o backend

## 🔑 Modo Administrador

- **Senha padrão**: `admin123`
- **Ativação**:
  - Clique no botão "Admin" na navbar
  - Ou use o atalho `Ctrl+Shift+A`
- **Funcionalidades exclusivas**:
  - Criar, editar e excluir receitas
  - Gerenciar dicas culinárias
  - Acessar estatísticas do sistema
- **Segurança**: Sistema de bloqueio após tentativas incorretas

## 🛠️ Tecnologias

### Frontend

- **HTML5** - Estrutura semântica e acessível
- **CSS3** - Design responsivo com variáveis CSS e grid/flexbox
- **JavaScript ES6+** - Funcionalidades interativas modernas
- **Arquitetura modular** - Organização em namespaces e componentes
- **Design System** - Padronização visual centralizada

### Backend

- **Python 3.8+** - Linguagem principal
- **Flask** - Framework web minimalista e flexível
- **SQLite** - Banco de dados local e portátil
- **Werkzeug** - Servidor WSGI para desenvolvimento
- **SMTP** - Sistema de envio de emails integrado

### 🎨 Melhorias Recentes

- **CSS Centralizado**: Estilos comuns movidos para `common.css`
- **Cards Padronizados**: Design uniforme em todas as páginas
- **Responsividade Aprimorada**: Suporte a todos os dispositivos
- **Sistema de Admin**: Gestão centralizada de permissões
- **UX Melhorada**: Transições suaves e feedback visual

## 📁 Estrutura do Projeto

```
raizes_da_amazonia/
├── assets/
│   ├── css/
│   │   ├── common.css          # Estilos globais e componentes
│   │   ├── index.css           # Estilos da página principal
│   │   ├── todas-receitas.css  # Estilos da página de receitas
│   │   ├── receita.css         # Estilos da página de detalhes
│   │   ├── admin-button.css    # Estilos do sistema admin
│   │   └── aumento-fonte.css   # Funcionalidade de acessibilidade
│   ├── js/
│   │   ├── main.js             # Script principal (homepage)
│   │   ├── todas-receitas.js   # Script da página de receitas
│   │   ├── receita-detalhes.js # Script de detalhes
│   │   ├── admin-system.js     # Sistema de administração
│   │   ├── aumento-fonte.js    # Controle de fonte
│   │   └── config.js           # Configurações globais
│   └── imgs/
│       └── fundo.png           # Recursos visuais
├── pages/
│   ├── todas-receitas.html     # Listagem completa
│   ├── receita.html            # Detalhes individuais
│   ├── termos-uso.html         # Termos de uso
│   └── politica-privacidade.html # Política de privacidade
├── backend/
│   ├── main.py                 # Servidor Flask principal
│   ├── debug_server.py         # Servidor para desenvolvimento
│   ├── receitas.db             # Banco de dados SQLite
│   ├── requirements.txt        # Dependências Python
│   ├── config_email.py         # Configuração de email (user)
│   └── config_email_exemplo.py # Template de configuração
├── uploads/                    # Imagens das receitas
├── start_backend.bat          # Script de inicialização
├── index.html                 # Página principal
└── README.md                  # Documentação
```

## 📡 API Endpoints

| Método   | Endpoint              | Descrição                   |
| -------- | --------------------- | --------------------------- |
| `GET`    | `/api/receitas`       | Listar todas as receitas    |
| `GET`    | `/api/receitas/{id}`  | Obter receita específica    |
| `POST`   | `/api/receitas`       | Criar nova receita          |
| `PUT`    | `/api/receitas/{id}`  | Atualizar receita existente |
| `DELETE` | `/api/receitas/{id}`  | Excluir receita             |
| `GET`    | `/api/dicas`          | Listar dicas culinárias     |
| `POST`   | `/api/dicas`          | Criar nova dica             |
| `PUT`    | `/api/dicas/{id}`     | Atualizar dica              |
| `DELETE` | `/api/dicas/{id}`     | Excluir dica                |
| `POST`   | `/api/contato`        | Enviar mensagem de contato  |
| `POST`   | `/api/upload`         | Upload de imagem            |
| `GET`    | `/uploads/{filename}` | Acessar imagem carregada    |

### 🔒 Autenticação

A API utiliza autenticação baseada em sessão. Rotas protegidas requerem login administrativo através do frontend.

## 🤝 Contribuição

1. **Fork** o projeto
2. **Clone** sua fork: `git clone https://github.com/seu-usuario/raizes_da_amazonia.git`
3. **Crie uma branch** para sua feature: `git checkout -b feature/NovaFuncionalidade`
4. **Faça suas alterações** seguindo os padrões do projeto
5. **Commit** suas mudanças: `git commit -m 'feat: adiciona nova funcionalidade'`
6. **Push** para a branch: `git push origin feature/NovaFuncionalidade`
7. **Abra um Pull Request** com descrição detalhada

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Desenvolvimento

**Finalidade**: Projeto educacional - Desenvolvimento Web  
**Instituição**: Instituto Federal do Amazonas - Disciplina de DWEB

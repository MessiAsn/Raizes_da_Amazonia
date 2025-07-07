# Teste de Conexão Frontend-Backend

## Problemas Identificados e Corrigidos:

### 1. **Host do Backend**

- **Problema**: Backend configurado para `host="localhost"` que não aceita conexões externas
- **Correção**: Mudou para `host="127.0.0.1"` em desenvolvimento

### 2. **URLs Hardcoded**

- **Problema**: Vários arquivos tinham `http://localhost:8000` fixo
- **Correção**: Mudou para `http://127.0.0.1:8000` e configuração dinâmica

### 3. **Caminhos Relativos Problemáticos**

- **Problema**: Backend usava caminhos relativos (`../uploads`, `../assets`) que falhavam dependendo do diretório de execução
- **Correção**: Implementou caminhos absolutos baseados no diretório do script

### 4. **Configuração CORS**

- **Problema**: CORS muito restritivo
- **Correção**: Adicionou suporte para localhost, 127.0.0.1 e file:// em desenvolvimento

## Como Testar:

### 1. Iniciar o Backend:

```bash
cd backend
python main.py
```

### 2. Verificar se o servidor está rodando:

- Abra o navegador em: `http://127.0.0.1:8000`
- Deve mostrar a página principal
- Teste a API: `http://127.0.0.1:8000/api`

### 3. Testar o Frontend:

- Abra `index.html` diretamente no navegador, OU
- Acesse através do backend: `http://127.0.0.1:8000`

### 4. Testar Funcionalidades:

- [ ] Carregamento de receitas na página principal
- [ ] Página "Todas as Receitas"
- [ ] Página de detalhes de receita individual
- [ ] Painel administrativo
- [ ] Upload de imagens
- [ ] Formulário de contato

## URLs de Teste:

### Frontend via Backend (RECOMENDADO):

- Página Principal: `http://127.0.0.1:8000`
- Todas Receitas: `http://127.0.0.1:8000/pages/todas-receitas.html`
- Admin: `http://127.0.0.1:8000/pages/admin.html`

### API Endpoints:

- Status: `http://127.0.0.1:8000/api`
- Receitas: `http://127.0.0.1:8000/api/receitas`
- Dicas: `http://127.0.0.1:8000/api/dicas`
- Estatísticas: `http://127.0.0.1:8000/api/stats`

## Troubleshooting:

### Se ainda não funcionar:

1. **Verificar se o backend está rodando:**

   ```bash
   netstat -an | findstr 8000
   ```

2. **Verificar logs do console do navegador (F12)**

3. **Testar conexão direta da API:**

   ```bash
   curl http://127.0.0.1:8000/api
   ```

4. **Verificar firewall/antivírus**

5. **Tentar porta alternativa:**
   - Editar `main.py`: mude `PORT = 8000` para `PORT = 8080`
   - Atualizar URLs nos arquivos JS

## Notas Importantes:

- Use `127.0.0.1` ao invés de `localhost` (mais confiável)
- Sempre inicie o backend ANTES de abrir o frontend
- Se ainda tiver problemas, pode ser firewall/antivírus bloqueando a porta 8000

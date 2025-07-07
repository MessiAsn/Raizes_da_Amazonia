# 🚀 Tutorial Completo de Deploy - Raízes da Amazônia

## 📖 Visão Geral

Este tutorial ensina como fazer o deploy híbrido da aplicação:
- **Frontend** → Vercel (estático, rápido, CDN global)
- **Backend** → Railway (API Python FastAPI)

## ✅ Vantagens do Deploy Híbrido

- 🆓 **Gratuito** (planos generosos)
- ⚡ **Rápido** (CDN + containers otimizados)
- 🔒 **Seguro** (HTTPS automático)
- 📈 **Escalável** (deploy independente)
- 🛠️ **Fácil manutenção** (redeploy automático)

---

## 📋 Pré-requisitos

- ✅ Conta no [GitHub](https://github.com)
- ✅ Conta no [Railway](https://railway.app)
- ✅ Conta no [Vercel](https://vercel.com)
- ✅ Projeto commitado no GitHub

---

## 🚂 PARTE 1: Deploy do Backend (Railway)

### Passo 1: Preparar o Backend

```bash
# 1. Testar localmente primeiro
cd backend
pip install -r requirements.txt
python main.py

# 2. Verificar se está funcionando
# Abrir: http://127.0.0.1:8000/api

# 3. Commitar mudanças
git add .
git commit -m "Backend pronto para deploy"
git push origin main
```

### Passo 2: Deploy no Railway

1. **Acessar Railway:**
   - Ir para [railway.app](https://railway.app/)
   - Fazer login com GitHub

2. **Criar Projeto:**
   - Clicar em "New Project"
   - Selecionar "Deploy from GitHub repo"
   - Escolher o repositório `raizes_da_amazonia`

3. **Configurar Deploy:**
   - **Root Directory**: `backend`
   - **Build Command**: Detectado automaticamente
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Variáveis de Ambiente (Opcional):**
   ```
   ENVIRONMENT=production
   ```

5. **Aguardar Deploy:**
   - Railway fará o build e deploy automaticamente
   - Aguardar até aparecer "Deployed successfully"

### Passo 3: Obter URL do Backend

1. **Copiar URL:**
   - Na dashboard do Railway, copiar a URL gerada
   - Exemplo: `https://raizes-amazonia-backend-production.up.railway.app`
   - **⚠️ IMPORTANTE: Anotar esta URL!**

2. **Testar Backend:**
   ```bash
   # Testar se API está funcionando
   curl https://SUA-URL-RAILWAY.up.railway.app/api
   ```

---

## ⚡ PARTE 2: Configurar Frontend

### Passo 1: Atualizar URL do Backend

Editar `assets/js/config.js`:

```javascript
window.RaizesAmazonia.Config = {
  API_BASE_URL: window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000" 
    : "https://SUA-URL-RAILWAY.up.railway.app", // 👈 SUBSTITUIR AQUI
  
  // ...rest of config
};
```

### Passo 2: Commitar Mudança

```bash
git add assets/js/config.js
git commit -m "Atualizar URL do backend para produção"
git push origin main
```

---

## 🌐 PARTE 3: Deploy do Frontend (Vercel)

### Passo 1: Deploy no Vercel

1. **Acessar Vercel:**
   - Ir para [vercel.com](https://vercel.com/)
   - Fazer login com GitHub

2. **Criar Projeto:**
   - Clicar em "New Project"
   - Selecionar o repositório `raizes_da_amazonia`

3. **Configurar Projeto:**
   - **Framework Preset**: `Other`
   - **Root Directory**: `/` (raiz)
   - **Build Command**: (deixar vazio)
   - **Output Directory**: (deixar vazio)

4. **Deploy:**
   - Clicar em "Deploy"
   - Aguardar conclusão

### Passo 2: Obter URL do Frontend

1. **Copiar URL:**
   - Vercel fornecerá uma URL como: `https://raizes-amazonia.vercel.app`
   - **⚠️ IMPORTANTE: Anotar esta URL!**

---

## 🔧 PARTE 4: Configurar CORS no Backend

### Passo 1: Atualizar main.py

Editar `backend/main.py`:

```python
# Configurar CORS para produção
if ENVIRONMENT == "production":
    allowed_origins = [
        "https://SUA-URL-VERCEL.vercel.app",  # 👈 SUBSTITUIR AQUI
        "https://*.vercel.app",
    ]
else:
    allowed_origins = [
        "http://localhost:*",
        "http://127.0.0.1:*",
        "http://localhost",
        "http://127.0.0.1",
        "file://*",
        "*"
    ]
```

### Passo 2: Redeploy

```bash
git add backend/main.py
git commit -m "Configurar CORS para produção"
git push origin main
```

Railway fará redeploy automaticamente.

---

## 🧪 PARTE 5: Teste Final

### URLs para Testar:

- **Frontend**: `https://sua-url.vercel.app`
- **Backend API**: `https://sua-url.railway.app/api`
- **Admin**: `https://sua-url.vercel.app/pages/admin.html`

### Checklist de Testes:

- [ ] **Página principal carrega**
- [ ] **Receitas são listadas**
- [ ] **Busca funciona**
- [ ] **Página "Todas as Receitas" funciona**
- [ ] **Detalhes de receita funcionam**
- [ ] **Painel admin abre (senha: admin123)**
- [ ] **CRUD de receitas funciona**
- [ ] **Upload de imagens funciona**
- [ ] **CRUD de dicas funciona**
- [ ] **Formulário de contato funciona**
- [ ] **Botões de acessibilidade funcionam**

---

## 🛠️ Troubleshooting

### 🚨 Erro de CORS

**Sintoma:** Frontend não consegue conectar com backend

**Solução:**
1. Verificar se URL do Vercel está em `allowed_origins` no `main.py`
2. Verificar se `ENVIRONMENT=production` está configurado no Railway
3. Fazer redeploy do backend

### 🚨 Erro 404 nas APIs

**Sintoma:** `fetch failed` ou `404 Not Found`

**Solução:**
1. Verificar se URL do backend está correta no `config.js`
2. Testar API diretamente: `https://sua-url.railway.app/api`
3. Verificar logs no Railway

### 🚨 Imagens não carregam

**Sintoma:** Imagens aparecem quebradas

**Solução:**
1. Verificar se upload funciona no painel admin
2. Imagens são servidas pelo backend: `https://sua-url.railway.app/uploads/nome-da-imagem.jpg`
3. Verificar permissões de arquivo

### 🚨 500 Internal Server Error

**Sintoma:** Erro no backend

**Solução:**
1. Verificar logs no Railway Dashboard
2. Verificar se todas as dependências estão em `requirements.txt`
3. Verificar se banco SQLite está sendo criado corretamente

---

## 🔄 Atualizações Futuras

### Para o Backend:
```bash
# Fazer mudanças no código
git add .
git commit -m "Atualização do backend"
git push origin main
# Railway faz redeploy automaticamente
```

### Para o Frontend:
```bash
# Fazer mudanças no código
git add .
git commit -m "Atualização do frontend"
git push origin main
# Vercel faz redeploy automaticamente
```

---

## 💡 Dicas Importantes

### 🔒 Segurança
- Nunca commitar senhas ou chaves no código
- Usar variáveis de ambiente para configurações sensíveis
- Manter backup do banco de dados local

### 📊 Monitoramento
- Usar dashboards do Railway e Vercel para monitorar
- Configurar alertas para problemas
- Verificar logs regularmente

### 🚀 Performance
- Vercel otimiza automaticamente o frontend
- Imagens são servidas via CDN
- Backend tem cache automático

### 💰 Custos
- **Railway**: 500h/mês grátis
- **Vercel**: 100GB/mês grátis
- Suficiente para projetos acadêmicos

---

## 📱 URLs Finais do Projeto

Após o deploy completo, você terá:

- **🏠 Site Principal**: `https://sua-url.vercel.app`
- **📖 Todas as Receitas**: `https://sua-url.vercel.app/pages/todas-receitas.html`
- **🔍 Detalhes**: `https://sua-url.vercel.app/pages/receita.html?id=ID`
- **⚙️ Painel Admin**: `https://sua-url.vercel.app/pages/admin.html`
- **🔗 API Backend**: `https://sua-url.railway.app/api`

---

## 🎉 Conclusão

Parabéns! Seu projeto **Raízes da Amazônia** agora está disponível na internet com:

- ✅ **Frontend responsivo e rápido**
- ✅ **Backend escalável e confiável**
- ✅ **SSL/HTTPS automático**
- ✅ **Deploy automático via Git**
- ✅ **Custo zero**

**Projeto profissional pronto para apresentação! 🎓**

---

*Tutorial criado para o projeto acadêmico "Raízes da Amazônia" - Desenvolvimento Web*

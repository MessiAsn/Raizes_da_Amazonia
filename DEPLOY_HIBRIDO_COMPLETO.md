# 🚀 Deploy Híbrido: Frontend (Vercel) + Backend (Railway)

## ✅ Vantagens do Deploy Híbrido:

1. **Frontend estático super rápido** (Vercel CDN global)
2. **Backend robusto e escalável** (Railway)
3. **Custos otimizados** (ambos têm planos gratuitos generosos)
4. **Deploy independente** (frontend e backend podem ser atualizados separadamente)

## 📋 Pré-requisitos:

- Conta no GitHub
- Conta no Railway (railway.app)
- Conta no Vercel (vercel.com)
- Projeto commitado no GitHub

## 🔄 Ordem de Deploy:

### **1️⃣ PRIMEIRO: Deploy do Backend (Railway)**

```bash
# 1. Testar localmente
cd backend
pip install -r requirements.txt
python main.py

# 2. Commitar mudanças
git add .
git commit -m "Preparando backend para deploy"
git push
```

**No Railway:**

1. Criar novo projeto
2. Conectar repositório GitHub
3. Selecionar pasta `backend`
4. Configurar variáveis:
   - `ENVIRONMENT=production`
5. Deploy automático

**Anotar URL gerada:** `https://SEU-PROJETO.up.railway.app`

### **2️⃣ SEGUNDO: Atualizar Configuração do Frontend**

```javascript
// Em assets/js/config.js, substituir:
API_BASE_URL: window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://127.0.0.1:8000"
  : "https://SUA-URL-DO-RAILWAY.up.railway.app", // Colocar URL real aqui
```

### **3️⃣ TERCEIRO: Deploy do Frontend (Vercel)**

```bash
# Commitar a mudança da URL
git add assets/js/config.js
git commit -m "Atualizando URL do backend para produção"
git push
```

**No Vercel:**

1. Criar novo projeto
2. Conectar repositório GitHub
3. Framework: `Other`
4. Root Directory: `/` (raiz do projeto)
5. Deploy automático

### **4️⃣ QUARTO: Configurar CORS no Backend**

Atualizar `backend/main.py`:

```python
if ENVIRONMENT == "production":
    allowed_origins = [
        "https://seu-projeto.vercel.app",  # URL do Vercel
        "https://*.vercel.app",
    ]
```

Fazer redeploy no Railway.

## 🧪 Teste Final:

1. **Acessar frontend:** `https://seu-projeto.vercel.app`
2. **Verificar carregamento de receitas**
3. **Testar painel admin**
4. **Testar upload de imagens**
5. **Verificar formulário de contato**

## 🔧 Troubleshooting:

### Erro de CORS:

- Verificar se URL do Vercel está no `allowed_origins` do backend
- Verificar se `ENVIRONMENT=production` está configurado no Railway

### Erro 404 nas APIs:

- Verificar se URL do backend está correta no `config.js`
- Testar API diretamente: `https://seu-backend.up.railway.app/api`

### Imagens não carregam:

- Verificar se upload está funcionando no admin
- Imagens são servidas pelo backend: `https://seu-backend.up.railway.app/uploads/`

## 📱 URLs Finais:

- **Frontend:** `https://seu-projeto.vercel.app`
- **Backend API:** `https://seu-backend.up.railway.app/api`
- **Admin:** `https://seu-projeto.vercel.app/pages/admin.html`

## 💡 Dicas:

1. **Sempre testar localmente antes do deploy**
2. **Fazer deploy do backend primeiro**
3. **Verificar logs no Railway/Vercel em caso de erro**
4. **Usar nomes descritivos para os projetos**
5. **Documentar as URLs geradas**

## 🆓 Limites dos Planos Gratuitos:

**Railway:**

- 500 horas/mês
- 1GB RAM
- 1GB storage

**Vercel:**

- 100GB bandwidth/mês
- Deploys ilimitados
- Domínio personalizado gratuito

Perfeito para projetos acadêmicos! 🎓

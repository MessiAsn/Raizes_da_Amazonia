# 🚀 Deploy Guide - Raízes da Amazônia

## Deploy Híbrido: Railway + Vercel

### 📋 Pré-requisitos

- Conta no GitHub
- Conta no Railway
- Conta no Vercel

---

## 🚂 1. Deploy do Backend (Railway)

### Passo 1: Preparar o repositório

1. Faça commit de todas as alterações
2. Push para o GitHub

### Passo 2: Deploy no Railway

1. Acesse [railway.app](https://railway.app/)
2. Clique em "Start a New Project"
3. Selecione "Deploy from GitHub repo"
4. Escolha o repositório `raizes_da_amazonia`
5. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: Detectado automaticamente
   - **Start Command**: Detectado automaticamente

### Passo 3: Variáveis de ambiente (opcional)

```
ENVIRONMENT=production
```

### Passo 4: Obter URL do backend

1. Após o deploy, copie a URL gerada (ex: `https://seu-app.railway.app`)
2. **IMPORTANTE**: Anote esta URL para usar no frontend

---

## ⚡ 2. Deploy do Frontend (Vercel)

### Passo 1: Atualizar configuração

1. Edite o arquivo `assets/js/config.js`
2. Substitua `"https://seu-backend-railway.railway.app"` pela URL real do Railway

### Passo 2: Deploy no Vercel

1. Acesse [vercel.com](https://vercel.com/)
2. Clique em "New Project"
3. Selecione o repositório `raizes_da_amazonia`
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `/` (raiz)
   - **Build Command**: (deixe vazio)
   - **Output Directory**: (deixe vazio)

### Passo 3: Configurar domínio personalizado (opcional)

1. Vá em Settings > Domains
2. Adicione seu domínio personalizado

---

## 🔧 3. Pós-Deploy

### Atualizar CORS no backend

1. Edite `backend/main.py`
2. Atualize a lista de `allowed_origins` com sua URL do Vercel:

```python
allowed_origins = [
    "https://*.vercel.app",
    "https://sua-url.vercel.app",  # Sua URL real
]
```

### Testar funcionalidades

- ✅ Listagem de receitas
- ✅ Busca em tempo real
- ✅ Painel administrativo
- ✅ Upload de imagens
- ✅ CRUD completo

---

## 📱 4. URLs finais

- **Frontend**: `https://sua-url.vercel.app`
- **Backend**: `https://seu-app.railway.app`
- **Admin**: `https://sua-url.vercel.app/pages/admin.html`

---

## 🛠️ 5. Troubleshooting

### Erro de CORS

- Verificar se a URL do frontend está na lista `allowed_origins` do backend

### Erro 404 nas imagens

- Verificar se o caminho das imagens está correto no frontend

### API não responde

- Verificar se o backend está rodando no Railway
- Verificar logs no Railway Dashboard

---

## 🔄 6. Atualizações futuras

### Para atualizar o backend:

1. Faça push para o GitHub
2. Railway fará redeploy automaticamente

### Para atualizar o frontend:

1. Faça push para o GitHub
2. Vercel fará redeploy automaticamente

---

## 💡 Dicas

- **Gratuito**: Ambos os serviços têm planos gratuitos generosos
- **SSL**: HTTPS configurado automaticamente
- **CDN**: Vercel otimiza automaticamente o frontend
- **Logs**: Use os dashboards para monitorar aplicações

**Deploy realizado com sucesso! 🎉**

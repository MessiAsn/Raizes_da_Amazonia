# Deploy do Frontend no Vercel

## 1. Atualizar URL do Backend

**IMPORTANTE:** Após o deploy do backend no Railway, você receberá uma URL como:
`https://raizes-amazonia-backend-production.up.railway.app`

Atualizar o arquivo `assets/js/config.js`:

```javascript
API_BASE_URL: window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://127.0.0.1:8000"
  : "https://SUA-URL-DO-RAILWAY.up.railway.app", // Substituir pela URL real
```

## 2. Deploy no Vercel

1. **Criar conta no Vercel:** https://vercel.com
2. **Conectar repositório GitHub**
3. **Configurar projeto:**
   - Framework Preset: `Other`
   - Build Command: (deixar vazio)
   - Output Directory: (deixar vazio - Vercel serve arquivos estáticos da raiz)

## 3. Configuração já está pronta

O arquivo `vercel.json` já está configurado:

```json
{
  "version": 2,
  "routes": [
    {
      "src": "/",
      "dest": "/index.html"
    },
    {
      "src": "/pages/(.*)",
      "dest": "/pages/$1"
    },
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1"
    }
  ]
}
```

## 4. Após o deploy

1. Vercel fornecerá uma URL como: `https://seu-projeto.vercel.app`
2. Testar todas as funcionalidades
3. Verificar se frontend conecta com backend

## 5. Atualizar CORS no Backend

Atualizar `backend/main.py` com a URL do Vercel:

```python
if ENVIRONMENT == "production":
    allowed_origins = [
        "https://seu-projeto.vercel.app",  # URL do Vercel
        "https://*.vercel.app",
    ]
```

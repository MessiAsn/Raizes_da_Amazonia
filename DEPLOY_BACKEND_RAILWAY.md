# Deploy do Backend no Railway

## 1. Preparar o Backend

1. **Navegar para a pasta backend:**

   ```bash
   cd backend
   ```

2. **Testar localmente primeiro:**
   ```bash
   pip install -r requirements.txt
   python main.py
   ```

## 2. Deploy no Railway

1. **Criar conta no Railway:** https://railway.app
2. **Conectar repositório GitHub**
3. **Criar novo projeto**
4. **Configurar variáveis de ambiente:**
   - `ENVIRONMENT=production`
   - `PORT=8000` (Railway define automaticamente)

## 3. Arquivo de configuração (já existe)

O arquivo `railway.json` já está configurado:

```json
{
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## 4. Após o deploy

1. Railway fornecerá uma URL como: `https://seu-projeto-production.up.railway.app`
2. **ANOTAR ESTA URL** - você precisará dela para o frontend

## 5. Configurar email (opcional)

Criar `config_email.py` nas variáveis de ambiente do Railway:

```python
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USER = "seu_email@gmail.com"
EMAIL_PASSWORD = "sua_senha_de_app"
EMAIL_DESTINO = "contato@seusite.com"
```

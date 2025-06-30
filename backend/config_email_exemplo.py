# Configurações de Email - Exemplo
# Copie este arquivo para config_email.py e configure com seus dados

# Para Gmail:
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USER = "seu-email@gmail.com"
EMAIL_PASSWORD = (
    "sua-senha-de-app-16-caracteres"  # Use uma senha de app, não sua senha normal
)
EMAIL_DESTINO = (
    "email-que-recebera-mensagens@gmail.com"  # Seu email para receber as mensagens
)

# Para Outlook/Hotmail:
# EMAIL_HOST = "smtp-mail.outlook.com"
# EMAIL_PORT = 587
# EMAIL_USER = "seu-email@outlook.com"
# EMAIL_PASSWORD = "sua-senha"
# EMAIL_DESTINO = "seu-email@outlook.com"

# Para Yahoo:
# EMAIL_HOST = "smtp.mail.yahoo.com"
# EMAIL_PORT = 587
# EMAIL_USER = "seu-email@yahoo.com"
# EMAIL_PASSWORD = "sua-senha"
# EMAIL_DESTINO = "seu-email@yahoo.com"

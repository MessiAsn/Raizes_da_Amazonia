from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy import Column, String, DateTime, create_engine
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from datetime import datetime
import os
import shutil
import uuid
import smtplib
import traceback
from email import message

# Configuração do banco de dados
# SQLite é ideal para projetos acadêmicos por ser simples e não precisar de instalação
import os

# Garantir que o banco seja sempre criado na pasta backend, independente de onde o script é executado
DB_PATH = os.path.join(os.path.dirname(__file__), "receitas.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Modelo do banco de dados
class ReceitaDB(Base):
    __tablename__ = "receitas"

    id = Column(String, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    descricao = Column(String, nullable=False)
    historia = Column(String, nullable=True)
    ingredientes = Column(String, nullable=False)
    modo_preparo = Column(String, nullable=False)
    imagem = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# Modelo de Dicas Culinárias
class DicaDB(Base):
    __tablename__ = "dicas"

    id = Column(String, primary_key=True, index=True)
    texto = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# Criar as tabelas
Base.metadata.create_all(bind=engine)

# Configuração de email
try:
    from config_email import (
        EMAIL_HOST,
        EMAIL_PORT,
        EMAIL_USER,
        EMAIL_PASSWORD,
        EMAIL_DESTINO,
    )

    EMAIL_CONFIGURED = True
except ImportError:
    print(
        "⚠️  Configuração de email não encontrada. Funcionalidade de contato desabilitada."
    )
    EMAIL_CONFIGURED = False

app = FastAPI(title="Raízes da Amazônia API", version="1.0.0")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especifique os domínios permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir arquivos estáticos (imagens das receitas)
UPLOAD_DIR = "../uploads"  # Diretório uploads na raiz do projeto
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Servir arquivos estáticos do site (HTML, CSS, JS)
app.mount("/assets", StaticFiles(directory="../assets"), name="assets")
app.mount("/pages", StaticFiles(directory="../pages"), name="pages")


# Servir a página principal
@app.get("/")
async def serve_index():
    from fastapi.responses import FileResponse

    return FileResponse("../index.html")


# Modelos Pydantic
class ReceitaBase(BaseModel):
    nome: str
    descricao: str
    historia: Optional[str] = None
    ingredientes: str
    modo_preparo: str


class ReceitaResponse(ReceitaBase):
    id: str
    imagem: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Modelos Pydantic para Dicas
class DicaBase(BaseModel):
    texto: str


class DicaResponse(DicaBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# Dependency para obter sessão do banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/api")
async def root():
    return {
        "message": "API Raízes da Amazônia está funcionando!",
        "database": "SQLite conectado",
    }


@app.get("/api/receitas", response_model=List[ReceitaResponse])
async def get_receitas(db: Session = Depends(get_db)):
    """Retorna todas as receitas"""
    receitas = db.query(ReceitaDB).order_by(ReceitaDB.created_at.desc()).all()
    return receitas


@app.get("/api/receitas/{receita_id}", response_model=ReceitaResponse)
async def get_receita(receita_id: str, db: Session = Depends(get_db)):
    """Retorna uma receita específica pelo ID"""
    receita = db.query(ReceitaDB).filter(ReceitaDB.id == receita_id).first()
    if not receita:
        raise HTTPException(status_code=404, detail="Receita não encontrada")
    return receita


@app.post("/api/receitas", response_model=ReceitaResponse)
async def criar_receita(
    nome: str = Form(...),
    descricao: str = Form(...),
    historia: Optional[str] = Form(None),
    ingredientes: str = Form(...),
    modo_preparo: str = Form(...),
    imagem: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    """Cria uma nova receita com upload opcional de imagem"""

    # Gerar ID único
    receita_id = str(uuid.uuid4())
    imagem_path = None

    # Processar upload de imagem se fornecida
    if imagem and imagem.content_type.startswith("image/"):
        file_extension = os.path.splitext(imagem.filename)[1]
        filename = f"{receita_id}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(imagem.file, buffer)
            imagem_path = f"/uploads/{filename}"
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Erro ao salvar imagem: {str(e)}"
            )

    # Criar receita no banco
    nova_receita = ReceitaDB(
        id=receita_id,
        nome=nome,
        descricao=descricao,
        historia=historia,
        ingredientes=ingredientes,
        modo_preparo=modo_preparo,
        imagem=imagem_path,
        created_at=datetime.utcnow(),
    )

    db.add(nova_receita)
    db.commit()
    db.refresh(nova_receita)

    return nova_receita


@app.put("/api/receitas/{receita_id}")
async def atualizar_receita(
    receita_id: str,
    nome: str = Form(...),
    descricao: str = Form(...),
    historia: str = Form(""),
    ingredientes: str = Form(...),
    modo_preparo: str = Form(...),
    imagem: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    """Atualiza uma receita existente"""
    # Buscar receita existente
    receita = db.query(ReceitaDB).filter(ReceitaDB.id == receita_id).first()

    if not receita:
        raise HTTPException(status_code=404, detail="Receita não encontrada")

    # Processar nova imagem se fornecida
    imagem_path = receita.imagem  # Manter imagem atual por padrão

    if imagem and imagem.filename:
        # Verificar tipo de arquivo
        allowed_types = ["image/jpeg", "image/png", "image/webp"]
        if imagem.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="Tipo de arquivo não suportado. Use JPG, PNG ou WebP.",
            )

        # Verificar tamanho (5MB)
        contents = await imagem.read()
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=400, detail="Arquivo muito grande. Máximo: 5MB"
            )

        # Remover imagem antiga se existir
        if receita.imagem and receita.imagem.startswith("/uploads/"):
            old_image_path = receita.imagem.replace("/uploads/", f"{UPLOAD_DIR}/")
            if os.path.exists(old_image_path):
                os.remove(old_image_path)

        # Salvar nova imagem
        file_extension = imagem.filename.split(".")[-1].lower()
        filename = f"{receita_id}_{uuid.uuid4().hex[:8]}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        with open(file_path, "wb") as buffer:
            buffer.write(contents)

        imagem_path = f"/uploads/{filename}"

    # Atualizar dados da receita
    receita.nome = nome
    receita.descricao = descricao
    receita.historia = historia
    receita.ingredientes = ingredientes
    receita.modo_preparo = modo_preparo
    receita.imagem = imagem_path

    db.commit()
    db.refresh(receita)

    return receita


@app.delete("/api/receitas/{receita_id}")
async def deletar_receita(
    receita_id: str,
    db: Session = Depends(get_db),
):
    """Deleta uma receita"""
    receita = db.query(ReceitaDB).filter(ReceitaDB.id == receita_id).first()

    if not receita:
        raise HTTPException(status_code=404, detail="Receita não encontrada")

    # Remover arquivo de imagem se existir
    if receita.imagem and receita.imagem.startswith("/uploads/"):
        image_path = receita.imagem.replace("/uploads/", f"{UPLOAD_DIR}/")
        if os.path.exists(image_path):
            os.remove(image_path)

    # Remover receita do banco
    db.delete(receita)
    db.commit()

    return {"message": "Receita deletada com sucesso"}


# APIs para Dicas Culinárias


@app.get("/api/dicas", response_model=List[DicaResponse])
async def get_dicas(db: Session = Depends(get_db)):
    """Retorna todas as dicas culinárias"""
    dicas = db.query(DicaDB).order_by(DicaDB.created_at.desc()).all()
    return dicas


@app.post("/api/dicas", response_model=DicaResponse)
async def criar_dica(
    texto: str = Form(...),
    db: Session = Depends(get_db),
):
    """Cria uma nova dica culinária"""

    # Gerar ID único
    dica_id = str(uuid.uuid4())

    # Criar dica no banco
    nova_dica = DicaDB(
        id=dica_id,
        texto=texto,
        created_at=datetime.utcnow(),
    )

    db.add(nova_dica)
    db.commit()
    db.refresh(nova_dica)

    return nova_dica


@app.put("/api/dicas/{dica_id}")
async def atualizar_dica(
    dica_id: str,
    texto: str = Form(...),
    db: Session = Depends(get_db),
):
    """Atualiza uma dica culinária existente"""
    # Buscar dica existente
    dica = db.query(DicaDB).filter(DicaDB.id == dica_id).first()

    if not dica:
        raise HTTPException(status_code=404, detail="Dica não encontrada")

    # Atualizar dados da dica
    dica.texto = texto

    db.commit()
    db.refresh(dica)

    return dica


@app.delete("/api/dicas/{dica_id}")
async def deletar_dica(
    dica_id: str,
    db: Session = Depends(get_db),
):
    """Deleta uma dica culinária"""
    dica = db.query(DicaDB).filter(DicaDB.id == dica_id).first()

    if not dica:
        raise HTTPException(status_code=404, detail="Dica não encontrada")

    # Remover dica do banco
    db.delete(dica)
    db.commit()

    return {"message": "Dica deletada com sucesso"}


# Rota para envio de email de contato
@app.post("/api/contato")
async def enviar_contato(
    nome: str = Form(...), email: str = Form(...), mensagem: str = Form(...)
):
    """Envia email de contato"""

    if not EMAIL_CONFIGURED:
        raise HTTPException(
            status_code=503,
            detail="Serviço de email não configurado. Entre em contato pelo telefone ou redes sociais.",
        )

    try:
        # Mostrar feedback imediato
        print(f"📧 Enviando email de {nome} ({email})...")

        # Criar mensagem de email simples
        corpo_email = f"""From: {EMAIL_USER}
To: {EMAIL_DESTINO}
Subject: [Raizes da Amazonia] Nova mensagem de contato - {nome}

Nova mensagem de contato recebida no site Raizes da Amazonia:

Nome: {nome}
Email: {email}
Mensagem:
{mensagem}

---
Esta mensagem foi enviada atraves do formulario de contato do site.
Data: {datetime.now().strftime('%d/%m/%Y as %H:%M')}
"""

        # Conectar ao servidor SMTP e enviar
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_USER, EMAIL_DESTINO, corpo_email.encode("utf-8"))

        print(f"✅ Email enviado com sucesso!")
        return {
            "message": "Mensagem enviada com sucesso! Entraremos em contato em breve."
        }

    except Exception as e:
        print(f"❌ Erro ao enviar email: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor ao enviar email. Tente novamente mais tarde.",
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8000)

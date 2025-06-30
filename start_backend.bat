@echo off
echo Instalando dependencias...
cd backend
pip install -r requirements.txt

echo.
echo Iniciando servidor...
python main.py

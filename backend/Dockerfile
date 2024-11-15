# Usando uma imagem base oficial do Python
FROM python:3.10-slim

# Definir o diretório de trabalho
WORKDIR /app

# Copiar os arquivos de requisitos e instalar as dependências
COPY backend/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copiar o código do backend para o container
COPY backend/ .

# Expôr a porta onde o Flask estará rodando
EXPOSE 5000

# Comando para rodar o aplicativo Flask
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]

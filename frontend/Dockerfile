# Usando a imagem oficial do Node.js
FROM node:20

# Definir o diretório de trabalho
WORKDIR /app

# Copiar os arquivos do frontend
COPY frontend/package.json frontend/package-lock.json ./

# Instalar dependências
RUN npm install

# Copiar o restante dos arquivos do frontend
COPY frontend/ .

# Criar o build de produção
RUN npm run build

# Instalar um servidor HTTP para servir o conteúdo estático
RUN npm install -g serve

# Expôr a porta onde o React será servido (alterando para 8080)
EXPOSE 8080

# Comando para servir o frontend na porta 8080
CMD ["serve", "-s", "build", "-l", "8080"]

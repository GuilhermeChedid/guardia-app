FROM node:18-alpine

WORKDIR /app

# Copia os arquivos de dependências primeiro para aproveitar o cache
COPY package*.json ./

RUN npm install

# Copia o restante do código do projeto
COPY . .

# Expõe a porta que o app utiliza
EXPOSE 3000

# Comando para iniciar o servidor (ajuste o caminho se o seu server.js estiver em outra pasta, ex: src/server.js)
CMD ["node", "backend/src/server.js"]
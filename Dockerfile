FROM node:18-alpine

WORKDIR /app

# Copiar package.json primeiro
COPY package.json ./

# Instalar dependências
RUN npm install

# Copiar o resto do código
COPY . .

# Expor porta
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "start"]

FROM node:18-alpine

WORKDIR /app

# Adiciona o curl para o healthcheck funcionar
RUN apk add --no-cache curl

# Copiar package.json primeiro
COPY package.json ./

# Instalar dependências
RUN npm install

# Copiar o resto do código
COPY . .

# HEALTHCHECK necessário pro Coolify
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Expor porta
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "start"]

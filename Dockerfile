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
HEALTHCHECK --interval=15s --timeout=10s --start-period=20s --retries=5 \
  CMD curl -f http://localhost:3000/health || exit 1

# Expor porta
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "start"]

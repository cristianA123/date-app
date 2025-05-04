# Usamos Node.js versión 18
FROM node:18-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos primero los archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalamos dependencias y Prisma CLI
RUN npm install
RUN npm install -g @nestjs/cli
RUN npx prisma generate

# Copiamos todo el código fuente
COPY . .

# Puerto que expondrá el contenedor
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "run", "start:dev"]
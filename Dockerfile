FROM node:18.17-alpine

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Copia o package.json e package-lock.json
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código
COPY . .

# Copia o arquivo .env
COPY .env .env

# Expõe a porta 3000
EXPOSE 3000

# Inicia a aplicação
CMD [ "node", "src/index.mjs" ]
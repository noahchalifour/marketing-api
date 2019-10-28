FROM node

ENV DB_TYPE postgres

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD [ "node", "server.js" ]
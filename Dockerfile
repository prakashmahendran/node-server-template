FROM node:20.18.0-slim

WORKDIR /usr/src/app/~~name~~

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start"]

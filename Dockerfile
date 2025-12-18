FROM node:20.18.0-slim

WORKDIR /usr/src/app/service-name

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Keep config files, including openapi.yaml
RUN npm prune --production && rm -rf test .git

EXPOSE 8080

ENV NODE_ENV=production

CMD ["npm", "start"]

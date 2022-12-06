FROM node:16-alpine as development

WORKDIR /src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:16-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /src/app

COPY package*.json .

RUN npm ci --only=production

COPY --from=development /src/app/dist ./dist

CMD [ "node", "dist/app.js"]

# EXPOSE 8080
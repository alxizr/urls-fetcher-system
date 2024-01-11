FROM node:alpine as dev

WORKDIR /usr/src/app

COPY ./app/package*.json ./

RUN npm install

COPY ./app ./

RUN npm run build

WORKDIR /usr/src/app/app

CMD [ "npm", "run", "start:bootstrap" ]
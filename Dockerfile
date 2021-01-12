FROM node:15-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# COPY . .

EXPOSE 3000
CMD [ "nodemon", "start" ]
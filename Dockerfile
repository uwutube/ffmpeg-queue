FROM node:15-alpine

WORKDIR /usr/src/app
COPY package*.json ./

RUN apk add --no-cache ffmpeg
# COPY . .

EXPOSE 3000
CMD [ "nodemon", "start" ]
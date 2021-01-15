FROM node:15-alpine

WORKDIR /usr/src/app
COPY package*.json ./

RUN yarn install
COPY . .

RUN apk add --no-cache ffmpeg

EXPOSE 3000
CMD [ "yarn", "start" ]
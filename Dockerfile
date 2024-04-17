FROM node:16.15.0-alpine as build
WORKDIR ./
COPY . .

RUN yarn install

EXPOSE 3003
CMD ["node", "main.js"]

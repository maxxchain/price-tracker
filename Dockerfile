FROM node:16.15.0-alpine as build
WORKDIR /app
COPY . .

EXPOSE 3003
CMD ["node", "main.js"]

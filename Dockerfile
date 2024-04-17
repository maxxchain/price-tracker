
FROM node:14.18.0-alpine AS BUILD_IMAGE

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
COPY . .

ENV PATH /usr/src/app/node_modules/.bin:$PATH

RUN apk add --no-cache git
RUN yarn install
RUN yarn build


FROM node:14.18.0-alpine
#
WORKDIR /usr/src/app
#
COPY --from=BUILD_IMAGE /usr/src/app/build/. ./


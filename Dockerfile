# Build stage
FROM node:16.15.0-alpine as build
WORKDIR /app
COPY . .

RUN apk add --no-cache python3 make g++ \
    && yarn install \
    && yarn run build \
    && apk del python3 make g++

# Production stage
FROM node:16.15.0-alpine as production
WORKDIR /app
COPY --from=build /app/build ./build
RUN yarn global add serve
EXPOSE 3003
CMD ["serve", "-s", "-p", "3003", "--no-port-switching", "./build"]

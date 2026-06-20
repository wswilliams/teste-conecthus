# Stage 1: build
FROM node:20 AS development

WORKDIR /ws/frontend/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 4200
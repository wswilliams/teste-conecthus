FROM node:20 AS development

WORKDIR /ws/frontend/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4200

CMD ["npm", "run", "start"]
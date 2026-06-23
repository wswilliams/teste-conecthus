# Test Conecthus

Uma aplicação full-stack com frontend web, aplicativo mobile e backend NestJS, totalmente conteinerizada com Docker.

## Tecnologias Utilizadas

### Backend

* NestJS 11
* Node.js 20
* TypeScript
* Prisma ORM
* PostgreSQL
* Redis
* MQTT

### Frontend Web

* React 18
* Vite 5
* JavaScript (ES Modules)
* React Router DOM

### Mobile

* Expo 54
* React Native 0.81
* React 19
* React Navigation
* Async Storage
* Paho MQTT

### DevOps

* Docker
* Docker Compose
* Mosquitto MQTT Broker

### Testes

* Cypress (End-to-End Tests)
* Jest

---

## Pré-requisitos

Antes de rodar o projeto, verifique se as seguintes ferramentas estão instaladas:

* Docker 24+
* Docker Compose
* Node.js 20+
* npm 10+

---

## Como Rodar a Aplicação

### Usando Docker (Recomendado)

Inicie todos os serviços:

```bash
docker compose up --build -d
```

Depois que os containers estiverem em execução, acesse a aplicação em:

```text
http://localhost:4200
```

---

## Execução Local

### Backend

```bash
cd api
npm install
npm run start:dev
```

O backend estará disponível no Swagger UI:

```text
http://localhost:3000/api
```

---

### Frontend

```bash
cd frontend
npm install
npm run build
npm run start
```

O frontend estará disponível em:

```text
http://localhost:4200
```

### Mobile

```bash
cd mobile
npm install
npm run start
npx expo start --web --clear
```

Isso inicia o servidor de desenvolvimento do Expo. Use o aplicativo Expo Go no Android ou iOS para escanear o QR code exibido no terminal ou no Expo DevTools.

Se estiver usando um dispositivo físico, verifique se ele consegue acessar os endereços da API e do broker MQTT configurados em `mobile/app.json`. Variavel: `apiUrl` atualmente estar IP fixo modifique e adicione o IP da sua REDE

### Mobile na Web

```bash
cd mobile
npm install
npm run web or npx expo start --web --clear
```

Isso abre o aplicativo mobile no navegador com o Expo Web. Se o navegador não abrir automaticamente, use a URL local exibida pelo Expo no terminal.

O aplicativo mobile se conecta ao backend e ao broker MQTT configurados em `mobile/app.json`.

---

## Testes End-to-End

### Abrir o Cypress

```bash
cd e2e
npm install
npm run cypress:open
```

### Gerar relatório HTML de testes

```bash
npm run cypress:report
```

---

## Manutenção do Docker

### Remover todos os containers

```bash
docker rm -vf $(docker ps -aq)
```

### Remover todas as imagens

```bash
docker rmi -f $(docker images -aq)
```

### Remover recursos não utilizados

```bash
docker system prune -af
```

---

## Estrutura do Projeto

```text
.
├── api/          # Backend NestJS
├── frontend/     # Frontend web com React + Vite
├── mobile/       # Aplicativo mobile com Expo e React Native
├── e2e/          # Testes com Cypress
├── docker-compose.yml
└── README.md
```

---

## Observações de Desenvolvimento

* O frontend roda na porta **4200**
* O backend roda na porta **3000**
* O app mobile roda via Expo e usa o broker MQTT na porta **9001**
* O app web suporta login, CRUD de usuários e CRUD de tarefas integrados à API
* O app mobile suporta login, listagem de tarefas, criação de tarefas e notificações via MQTT
* O Docker Compose inicia todos os serviços necessários
* Os testes Cypress ficam no diretório `e2e`

---

## Autor

Desenvolvido como parte do processo técnico da Conecthus.

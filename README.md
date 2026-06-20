# Test Conecthus

A full-stack application built with **Angular 20**, **NestJS 11**, and **Node.js 20**, fully containerized using Docker.

## Tech Stack

### Frontend

* Angular 20
* TypeScript
* RxJS

### Backend

* NestJS 11
* Node.js 20
* TypeScript

### DevOps

* Docker
* Docker Compose

### Testing

* Cypress (End-to-End Tests)

---

## Prerequisites

Before running the project, make sure the following tools are installed:

* Docker 24+
* Docker Compose
* Node.js 20+
* npm 10+

---

## Running the Application

### Using Docker (Recommended)

Start all services:

```bash
docker compose up --build -d
```

Once the containers are running, access the application at:

```text
http://localhost:4200
```

---

## Running Locally

### Backend

```bash
cd api
npm install
npm run start:dev
```

Backend will be available at swagger ui:

```text
lhttp://localhost:3000/api
```

---

### Frontend

```bash
cd frontend
npm install
npm run build
npm run start
```

Frontend will be available at:

```text
http://localhost:4200
```

---

## End-to-End Testing

### Open Cypress

```bash
cd e2e
npm install
npm run cypress:open
```

### Generate HTML Test Report

```bash
npm run cypress:report
```

---

## Docker Maintenance

### Remove All Containers

```bash
docker rm -vf $(docker ps -aq)
```

### Remove All Images

```bash
docker rmi -f $(docker images -aq)
```

### Remove Unused Resources

```bash
docker system prune -af
```

---

## Project Structure

```text
.
├── api/          # NestJS backend
├── frontend/     # Angular frontend
├── e2e/          # Cypress tests
├── docker-compose.yml
└── README.md
```

---

## Development Notes

* Frontend runs on port **4200**
* Backend runs on port **3000**
* Docker Compose starts all required services
* Cypress tests are located in the `e2e` directory

---

## Author

Developed as part of the Conecthus technical assessment.

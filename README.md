# ERP (Enterprise Resource Planning) System

A modern, full-stack ERP web application with modular architecture, built with React, Node.js, Express, PostgreSQL, Prisma, and more.

## Features
- Modular ERP: HR, Accounting, Inventory, CRM, Projects, Reports
- Role-based authentication (JWT)
- Modern UI (React, Tailwind, shadcn/ui)
- RESTful API, Prisma ORM
- Dockerized for easy local development
- CI/CD, code quality tools, and more

## Monorepo Structure
```
ERP/
  backend/
  frontend/
  docker-compose.yml
  README.md
```

## Prerequisites
- Node.js (v18+ recommended)
- Docker & Docker Compose

## Getting Started

### 1. Clone the repository
```sh
git clone <repo-url>
cd ERP
```

### 2. Environment Variables
Copy and edit the backend environment file:
```sh
cp backend/.env.example backend/.env
```

### 3. Start with Docker Compose
```sh
docker-compose up --build
```
- This will start the backend, frontend, and a PostgreSQL database.

### 4. Database Migration & Seeding
In a new terminal:
```sh
docker-compose exec backend npx prisma migrate deploy
# Seed the database
# (You may need to run: docker-compose exec backend npx prisma db seed)
```

### 5. Access the App
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- Database: localhost:5432 (user: postgres, pass: postgres)

## Development
- `cd backend` or `cd frontend` and use `npm run dev` for local development.
- Lint, format, and test scripts are available in each package.

## Deployment
- See `docker-compose.yml` and Dockerfiles for production setup.
- You can deploy to Railway, Vercel, AWS, etc.

## Scripts
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Lint code

## API Documentation
- Swagger docs available at `/api/docs` (if enabled)
- Postman collection in `/docs` (if provided)

## License
MIT 
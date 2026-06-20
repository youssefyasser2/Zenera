# Zenera

A full-stack multi-tenant workforce management platform built with React, TypeScript, Node.js, MongoDB, and Redis.

Zenera helps organizations manage employees, schedules, shift assignments, and workforce operations through a centralized SaaS-style architecture while enforcing secure company-level data isolation.

🎥 **Project Walkthrough**

https://www.youtube.com/watch?v=iNVzlzLWM6c

---

# Overview

Zenera was designed to simulate real-world workforce management systems and explore production-oriented software engineering patterns including:

* Multi-tenant architecture
* Role-based access control (RBAC)
* JWT authentication and authorization
* Workforce scheduling workflows
* Secure REST API design
* Scalable backend architecture
* Dockerized development environments

---

# Technical Highlights

* Full-stack architecture with separate frontend and backend applications
* Layered backend design (Routes → Controllers → Services → Models)
* Multi-tenant company isolation
* JWT authentication with refresh-token workflow
* Role-based authorization (Admin, Manager, Employee)
* MongoDB schema modeling with Mongoose
* Redis integration for authentication workflows
* Protected API routes and centralized middleware
* Request validation and security hardening
* Dockerized local development environment
* Unit and integration testing support

---

# Project Metrics

* 2 Applications (Frontend + Backend)
* 40+ REST API Endpoints
* 3 User Roles
* Multi-Tenant Architecture
* JWT + Refresh Token Authentication
* Dockerized Development Environment
* MongoDB + Redis Integration

---

# Architecture

```text
                ┌─────────────────┐
                │ React Frontend  │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Express REST API│
                └────────┬────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
      ┌─────────────┐      ┌─────────────┐
      │  MongoDB    │      │    Redis    │
      └─────────────┘      └─────────────┘
```

---

# Core Features

## Authentication & Authorization

* User Registration
* Secure Login
* JWT Authentication
* Refresh Token Workflow
* Protected Routes
* Role-Based Access Control (RBAC)

## Workforce Management

* Employee Management
* Employee Profiles
* Company User Management
* Workforce Coordination
* Manager Controls

## Shift Management

* Create Shifts
* Assign Employees
* Schedule Validation
* Conflict Detection
* Company-Wide Shift Visibility

## Multi-Tenant Support

* Company Registration
* Company Isolation
* Tenant-Aware Authorization
* Cross-Company Access Protection

---

# Business Rules

* Managers can manage employees within their company.
* Employees can access only assigned resources.
* Users cannot access data belonging to another company.
* Shift assignments are validated before creation.
* Employee linking is restricted to the same organization.
* Authorization is enforced at both route and service levels.

---

# Technology Stack

## Frontend

* React
* TypeScript
* Vite
* Redux Toolkit
* React Router
* Tailwind CSS

## Backend

* Node.js
* Express.js
* TypeScript
* MongoDB
* Mongoose
* Redis

## Security

* JWT
* Refresh Tokens
* Cookie-Based Authentication
* RBAC Authorization

## Infrastructure

* Docker
* Docker Compose
  
---

# Project Structure

```text
zenera/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── validation/
│   │   ├── tests/
│   │   └── utils/
│   └── docker/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── store/
│   │   └── utils/
│   └── docker/
│
└── README.md
```

---

# Local Development

## Prerequisites

* Node.js 18+
* MongoDB
* Redis
* Docker (optional)

## Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

# Environment Variables

Backend:

```env
MONGO_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=
JWT_REFRESH_EXPIRES_IN=
REDIS_HOST=
REDIS_PORT=
```

Frontend:

```env
VITE_BASE_URL=
```

---

# Future Enhancements

* Real-Time Notifications
* Audit Logging
* Workforce Analytics
* Attendance Tracking
* Monitoring & Observability
* CI/CD Automation

---

# License

MIT

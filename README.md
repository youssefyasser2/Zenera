# Zenera

A full-stack workforce operations platform built to help organizations manage employees, schedules, shift assignments, and operational workflows through a centralized system.

The platform combines role-based access control, company-level data isolation, shift management, and workforce coordination to support day-to-day business operations.

## Demo

🎥 Project Walkthrough

https://www.youtube.com/watch?v=iNVzlzLWM6c

---

## Highlights

* Full-Stack Application
* Multi-Tenant Architecture
* JWT Authentication
* Role-Based Access Control (RBAC)
* Employee Management
* Shift Scheduling
* Company Isolation
* Workforce Operations Management
* Dockerized Development Environment
* Unit & Integration Testing

---

## Architecture

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
│   │   ├── database/
│   │   ├── tests/
│   │   └── utils/
│   ├── scripts/
│   └── docker/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── store/
│   │   └── utils/
│   └── docker/
│
└── README.md
```

---

## Features

### Authentication & Authorization

* User Registration
* Secure Login
* JWT Authentication
* Protected Routes
* Role-Based Access Control

### Workforce Management

* Employee Creation
* Employee Linking
* Employee Profiles
* Company User Management

### Shift Management

* Create Shifts
* Assign Employees
* Shift Scheduling
* Conflict Detection
* Company-wide Shift Visibility

### Multi-Tenant Support

* Company Registration
* Company Isolation
* Tenant-Aware Authorization
* Cross-Company Access Protection

### Operational Workflows

* Manager Dashboard
* Employee Dashboard
* Workforce Coordination
* Schedule Management

---

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Redux Toolkit
* Tailwind CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### Authentication

* JWT
* Cookie-Based Sessions

### Infrastructure

* Docker
* Docker Compose

### Testing

* Jest

---

## Business Rules

* Managers can create and manage employees within their company.
* Employees can only access resources assigned to them.
* Users cannot access data belonging to another company.
* Shift assignments are validated before creation.
* Employee linking is restricted to users within the same organization.

---

## Future Improvements

* Time Tracking
* Attendance Management
* Workforce Analytics
* Audit Logs
* Email Notifications
* Advanced Reporting
* Background Job Processing
* Real-Time Notifications
* Payroll Management

---

## Project Purpose

Zenera was developed as a graduation project to explore real-world workforce management challenges, including authentication, authorization, multi-tenant architecture, employee scheduling, role-based access control, and scalable full-stack application design.

The project focuses on building production-oriented software patterns commonly used in modern SaaS platforms while maintaining a clean and extensible architecture.

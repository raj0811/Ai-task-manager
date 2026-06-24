# AI Task Manager Backend

Backend service for AI Task Manager built with NestJS, MongoDB, Redis, and Gemini AI.

GitHub Repository: https://github.com/raj0811/Ai-task-manager-backend

---

## Overview

AI Task Manager Backend provides:

* User Authentication using JWT
* Project Management
* Task Management
* AI-generated task summaries using Gemini AI
* Redis caching for optimized performance
* MongoDB database
* Docker support

---

## Tech Stack

* NestJS
* TypeScript
* MongoDB
* Mongoose
* Redis
* JWT Authentication
* Gemini AI
* Docker
* Jest

---

## Features

### Authentication

* User Signup
* User Login
* JWT-based Authorization
* Protected APIs

### Project Management

* Create Project
* Update Project
* Delete Project
* Fetch Projects

### Task Management

* Create Task
* Update Task
* Delete Task
* Update Task Status
* Fetch Tasks with Filters
* Pagination Support

### AI Integration

Generate professional task summaries using Gemini AI.

### Redis Caching

Implemented Redis caching for:

* Project listing
* Task listing

Automatic cache invalidation on:

* Create
* Update
* Delete operations

---

## Environment Variables

Create a `.env` file:

```env
PORT=4000

MONGO_URI=<mongodb_connection_string>

JWT_SECRET=<jwt_secret>

GEMINI_API_KEY=<gemini_api_key>

REDIS_HOST=localhost
REDIS_PORT=6379
```

For Docker:

```env
REDIS_HOST=redis
REDIS_PORT=6379
```

---

## Project Structure

```txt
src
│
├── user
│   ├── user.controller.ts
│   ├── user.service.ts
│
├── project
│   ├── project.controller.ts
│   ├── project.service.ts
│
├── task
│   ├── task.controller.ts
│   ├── task.service.ts
│
├── redis
│   ├── redis.module.ts
│   ├── redis.service.ts
│
├── database
│   ├── Schema
│   ├── database.module.ts
│   └── database.service.ts
│
├── AuthGuards
│
├── app.module.ts
└── main.ts
```

---

## Installation

Clone Repository

```bash
git clone <repository_url>

cd fastigo.ai
```

Install Dependencies

```bash
npm install
```

---

## Run Application

Development

```bash
npm run start:dev
```

Production

```bash
npm run build

npm run start:prod
```

Application runs on:

```txt
http://localhost:4000
```

---

## API Endpoints

### Authentication

#### Create User

```http
POST /user/create
```

#### Login User

```http
POST /user/login
```

---

### Projects

#### Create Project

```http
POST /project/create
```

#### Update Project

```http
PUT /project/update/:id
```

#### Delete Project

```http
DELETE /project/delete/:id
```

#### Fetch Projects

```http
GET /project/fetch-all
```

---

### Tasks

#### Generate AI Summary

```http
POST /task/generate-summary
```

#### Create Task

```http
POST /task/create
```

#### Update Task

```http
PATCH /task/:taskId
```

#### Delete Task

```http
DELETE /task/delete/:taskId
```

#### Update Task Status

```http
PATCH /task/:taskId/status
```

#### Fetch Tasks

```http
GET /task/fetch-all
```

Supported Filters:

* status
* search
* startDate
* endDate
* dueStart
* dueEnd
* page
* limit

---

## Testing

Run Tests

```bash
npm run test
```

Watch Mode

```bash
npm run test:watch
```

Coverage

```bash
npm run test:cov
```

---

## Docker

Build Image

```bash
docker build -t ai-task-manager-backend .
```

Run Container

```bash
docker run -p 4000:4000 ai-task-manager-backend
```

---

## Performance Optimizations

* Redis Caching
* Cache Invalidation Strategy
* Pagination
* MongoDB Query Optimization
* Concurrent Query Execution using Promise.all

---

## Security

* JWT Authentication
* Protected Routes
* User Ownership Validation
* Request Validation
* Secure Environment Variables

---

## Future Enhancements

* Refresh Tokens
* Role Based Access Control
* Email Notifications
* Task Attachments
* Activity Logs
* Team Collaboration
* Real-time Updates using WebSockets

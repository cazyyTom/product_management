# Product_Management_Basecamp

A production-ready RESTful API for collaborative project management, built with Node.js, Express, and MongoDB.

## Features

- 🔐 JWT authentication with access & refresh tokens
- 📧 Email verification & password reset via Nodemailer
- 👥 Role-based access control (Admin, Project Admin, Member)
- 📋 Full project, task, subtask & note lifecycle management
- 📎 File attachments on tasks (Multer)
- ✅ Input validation on all endpoints (express-validator)
- 🛡️ Global error handling with descriptive responses

---

## Project Structure

```
project_management_basecamp/backend/
├── node_module
├── public/
│   └── images/              # Uploaded file storage
├── src/
│   ├── config/
│   │   └── constants.js     # Roles, statuses, cookie options
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── project.controller.js
│   │   ├── task.controller.js
│   │   ├── subtask.controller.js
│   │   ├── note.controller.js
│   │   └── healthcheck.controller.js
│   ├── db/
│   │   └── index.js         # MongoDB connection
│   ├── middlewares/
│   │   ├── auth.middleware.js        # JWT verification
│   │   ├── permission.middleware.js  # Role-based guards
│   │   ├── multer.middleware.js      # File uploads
│   │   └── errorHandler.middleware.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── project.model.js
│   │   ├── projectMember.model.js
│   │   ├── task.model.js
│   │   ├── subtask.model.js
│   │   └── note.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── project.routes.js
│   │   ├── task.routes.js
│   │   ├── note.routes.js
│   │   └── healthcheck.routes.js
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   ├── generateTokens.js
│   │   └── mailer.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── project.validator.js
│   │   ├── task.validator.js
│   │   ├── subtask.validator.js
│   │   ├── note.validator.js
│   │   └── validate.js
│   ├── app.js               # Express app setup
│   └── index.js             # Server entry point
├── .env.example
├── .gitignore
├── .prettierignore
├── .prettierrc
├── package-lock.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (Atlas)
- SMTP credentials (e.g. Gmail app password)

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd product_management_basecamp/backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env .env
# Edit .env with your values

# 4. Start development server
npm run dev
```

---

## Environment Variables

| Variable               | Description                              | Example                          |
| ---------------------- | ---------------------------------------- | -------------------------------- |
| `PORT`                 | Server port                              | `8000`                           |
| `NODE_ENV`             | Environment                              | `development`                    |
| `MONGODB_URI`          | MongoDB connection string                | `****` |
| `ACCESS_TOKEN_SECRET`  | JWT access token secret                  | `your-secret`                    |
| `ACCESS_TOKEN_EXPIRY`  | Access token expiry                      | `15m`                            |
| `REFRESH_TOKEN_SECRET` | JWT refresh token secret                 | `your-secret`                    |
| `REFRESH_TOKEN_EXPIRY` | Refresh token expiry                     | `7d`                             |
| `SMTP_HOST`            | SMTP server host                         | `****`                 |
| `SMTP_PORT`            | SMTP server port                         | `2525`                            |
| `SMTP_USER`            | SMTP username / email                    | `****`                  |
| `SMTP_PASS`            | SMTP password / app password             | `xxxx xxxx xxxx xxxx`            |
| `EMAIL_FROM`           | Sender display name + email              | `mail.taskmanager@example.com`    |
| `APP_URL`              | Backend base URL (used in email links)   | `http://localhost:8000`          |
| `CLIENT_URL`           | Frontend base URL (used in email links)  | `http://localhost:3000`          |

---

## API Reference

All endpoints are prefixed with `/api/v1`.

### Authentication — `/api/v1/auth`

| Method | Endpoint                              | Auth | Description                  |
| ------ | ------------------------------------- | ---- | ---------------------------- |
| POST   | `/register`                           | No   | Register a new user          |
| POST   | `/login`                              | No   | Log in & receive tokens      |
| POST   | `/logout`                             | Yes  | Invalidate refresh token     |
| GET    | `/current-user`                       | Yes  | Get logged-in user info      |
| POST   | `/change-password`                    | Yes  | Change password               |
| POST   | `/refresh-token`                      | No   | Refresh access token          |
| GET    | `/verify-email/:verificationToken`    | No   | Verify email address          |
| POST   | `/forgot-password`                    | No   | Request password reset email  |
| POST   | `/reset-password/:resetToken`         | No   | Reset password with token     |
| POST   | `/resend-email-verification`          | Yes  | Resend verification email     |

### Projects — `/api/v1/projects`

| Method | Endpoint                        | Role Required | Description              |
| ------ | ------------------------------- | ------------- | ------------------------ |
| GET    | `/`                             | Any member    | List my projects         |
| POST   | `/`                             | Authenticated | Create project           |
| GET    | `/:projectId`                   | Any member    | Get project details      |
| PUT    | `/:projectId`                   | Admin         | Update project           |
| DELETE | `/:projectId`                   | Admin         | Delete project           |
| GET    | `/:projectId/members`           | Any member    | List project members     |
| POST   | `/:projectId/members`           | Admin         | Add member by email      |
| PUT    | `/:projectId/members/:userId`   | Admin         | Update member role       |
| DELETE | `/:projectId/members/:userId`   | Admin         | Remove member            |

### Tasks — `/api/v1/tasks`

| Method | Endpoint                              | Role Required         | Description           |
| ------ | ------------------------------------- | --------------------- | --------------------- |
| GET    | `/:projectId`                         | Any member            | List project tasks    |
| POST   | `/:projectId`                         | Admin / Project Admin | Create task           |
| GET    | `/:projectId/t/:taskId`               | Any member            | Get task + subtasks   |
| PUT    | `/:projectId/t/:taskId`               | Admin / Project Admin | Update task           |
| DELETE | `/:projectId/t/:taskId`               | Admin / Project Admin | Delete task           |
| POST   | `/:projectId/t/:taskId/subtasks`      | Admin / Project Admin | Create subtask        |
| PUT    | `/:projectId/st/:subTaskId`           | Any member            | Update subtask        |
| DELETE | `/:projectId/st/:subTaskId`           | Admin / Project Admin | Delete subtask        |

> **Note:** Members can only update `isCompleted` on subtasks. Title updates require Admin or Project Admin.

### Notes — `/api/v1/notes`

| Method | Endpoint                   | Role Required | Description        |
| ------ | -------------------------- | ------------- | ------------------ |
| GET    | `/:projectId`              | Any member    | List project notes |
| POST   | `/:projectId`              | Admin         | Create note        |
| GET    | `/:projectId/n/:noteId`    | Any member    | Get note details   |
| PUT    | `/:projectId/n/:noteId`    | Admin         | Update note        |
| DELETE | `/:projectId/n/:noteId`    | Admin         | Delete note        |

### Health Check — `/api/v1/healthcheck`

| Method | Endpoint | Auth | Description              |
| ------ | -------- | ---- | ------------------------ |
| GET    | `/`      | No   | Service health & DB info |

---

## Permission Matrix

| Action                     | Admin | Project Admin | Member |
| -------------------------- | :---: | :-----------: | :----: |
| Create Project             |  ✅   |      ❌       |   ❌   |
| Update / Delete Project    |  ✅   |      ❌       |   ❌   |
| Manage Project Members     |  ✅   |      ❌       |   ❌   |
| Create / Update / Delete Tasks |  ✅   |      ✅       |   ❌   |
| View Tasks                 |  ✅   |      ✅       |   ✅   |
| Update Subtask (title)     |  ✅   |      ✅       |   ❌   |
| Update Subtask (isCompleted)|  ✅   |      ✅       |   ✅   |
| Create / Delete Subtasks   |  ✅   |      ✅       |   ❌   |
| Create / Update / Delete Notes |  ✅   |      ❌       |   ❌   |
| View Notes                 |  ✅   |      ✅       |   ✅   |

---

## Response Format

All responses follow a consistent envelope:

```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Operation successful",
  "success": true
}
```

Errors:

```json
{
  "statusCode": 422,
  "message": "Validation failed",
  "success": false,
  "errors": [
    { "field": "email", "message": "Please provide a valid email" }
  ]
}
```

---

## File Uploads

- Tasks support up to **5 file attachments** per request (`multipart/form-data`, field: `attachments`)
- Max file size: **5 MB**
- Allowed types: JPEG, PNG, GIF, WebP, PDF, TXT, DOC, DOCX
- Files are served statically at `GET /images/:filename`

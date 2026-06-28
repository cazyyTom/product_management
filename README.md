# PBM — Product Basecamp Management 

A full-stack project management platform for teams to track tasks, collaborate on notes, and manage project members with role-based access control.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Repository Structure](#4-repository-structure)
5. [Backend — Setup & Configuration](#5-backend--setup--configuration)
6. [Backend — Environment Variables](#6-backend--environment-variables)
7. [Backend — Data Models](#7-backend--data-models)
8. [Backend — Role & Permission System](#8-backend--role--permission-system)
9. [Backend — API Reference](#9-backend--api-reference)
10. [Frontend — Setup & Configuration](#10-frontend--setup--configuration)
11. [Frontend — Environment Variables](#11-frontend--environment-variables)
12. [Frontend — Project Structure](#12-frontend--project-structure)
13. [Frontend — Pages & Routes](#13-frontend--pages--routes)
14. [Frontend — Component Map](#14-frontend--component-map)
15. [Frontend — State & Data Flow](#15-frontend--state--data-flow)
16. [Running the Full Stack Locally](#16-running-the-full-stack-locally)
17. [Authentication Flow](#17-authentication-flow)
18. [File Uploads](#18-file-uploads)
19. [Email Configuration](#19-email-configuration)
20. [Deployment Notes](#20-deployment-notes)

---

## 1. Project Overview

PBM Basecamp is a collaborative project management tool built with a **Node.js / Express REST API** backend and a **React 19 + Vite** frontend. It provides:

- **User authentication** — register, email verification, login, JWT refresh, password reset
- **Projects** — create and manage projects; invite team members; assign roles
- **Tasks** — full CRUD with Kanban board and list view; assign to members; file attachments
- **Subtasks** — nested checklist items under each task; individual complete/delete
- **Notes** — rich freeform notes attached to a project; masonry grid display
- **System Status** — live healthcheck dashboard showing API, database, memory, and uptime

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (React 19)                   │
│  Vite dev server :3000  →  proxy /api  →  backend :8000  │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP / JSON + HttpOnly cookies
┌───────────────────────────▼─────────────────────────────┐
│           Express API  (Node.js)   :8000                 │
│                                                          │
│  verifyJWT  →  getProjectRole  →  requireRole  →  ctrl   │
│                                                          │
│  /api/v1/auth        /api/v1/projects                    │
│  /api/v1/tasks       /api/v1/notes                       │
│  /api/v1/healthcheck                                     │
└───────────────────────────┬─────────────────────────────┘
                            │ Mongoose ODM
┌───────────────────────────▼─────────────────────────────┐
│                    MongoDB Atlas                          │
│  users · projects · projectmembers                       │
│  tasks · subtasks · notes                                │
└─────────────────────────────────────────────────────────┘
```

**JWT strategy:**
- Access token — short-lived (15 min), sent as `Authorization: Bearer <token>` header
- Refresh token — long-lived (7 days), stored in an **HttpOnly cookie** (`refreshToken`)
- The frontend Axios interceptor silently refreshes the access token on any 401 response and retries the original request once before redirecting to `/login`

---

## 3. Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM `"type": "module"`) |
| Framework | Express 5 |
| Database | MongoDB via Mongoose 9 |
| Authentication | JSON Web Tokens (`jsonwebtoken`) + bcrypt |
| File uploads | Multer (local `public/images/`) |
| Email | Nodemailer + Mailgen templates |
| Validation | express-validator |
| Dev tooling | nodemon, Prettier |

### Frontend

| Layer | Technology |
|---|---|
| UI library | React 19 |
| Build tool | Vite 8 |
| Routing | React Router v7 |
| Styling | Tailwind CSS v3 |
| HTTP client | Axios 1 |
| Form state | React 19 `useActionState` |
| Data fetching | Custom `useFetch` hook |

---

## 4. Repository Structure

```
pbm/
├── backend/                   # Express API
│   ├── public/
│   │   └── images/            # Uploaded task attachments (served statically)
│   ├── src/
│   │   ├── app.js             # Express app setup, middleware, route mounting
│   │   ├── index.js           # Entry — DB connect, server listen
│   │   ├── config/
│   │   │   └── constants.js   # Enums: roles, task statuses, cookie options
│   │   ├── controllers/       # Business logic per resource
│   │   │   ├── auth.controller.js
│   │   │   ├── healthcheck.controller.js
│   │   │   ├── note.controller.js
│   │   │   ├── project.controller.js
│   │   │   ├── subtask.controller.js
│   │   │   └── task.controller.js
│   │   ├── db/
│   │   │   └── index.js       # Mongoose connection
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js        # verifyJWT
│   │   │   ├── errorHandler.middleware.js
│   │   │   ├── multer.middleware.js      # File upload + MIME validation
│   │   │   └── permission.middleware.js  # getProjectRole, requireRole
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── project.model.js
│   │   │   ├── projectMember.model.js
│   │   │   ├── task.model.js
│   │   │   ├── subtask.model.js
│   │   │   └── note.model.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── healthcheck.routes.js
│   │   │   ├── note.routes.js
│   │   │   ├── project.routes.js
│   │   │   └── task.routes.js
│   │   ├── utils/
│   │   │   ├── ApiError.js
│   │   │   ├── ApiResponse.js
│   │   │   ├── asyncHandler.js
│   │   │   ├── generateTokens.js
│   │   │   └── mailer.js
│   │   └── validators/        # express-validator chains
│   ├── .env                   # (not committed — see §6)
│   └── package.json
│
└── pbm-frontend/              # React 19 SPA
    ├── src/
    │   ├── api/               # Axios instance + per-resource service modules
    │   ├── components/
    │   │   ├── layout/        # AppLayout, Sidebar, Navbar, ProtectedRoute, AuthLayout
    │   │   ├── notes/         # NoteCard, NoteEditor, NoteViewer
    │   │   ├── projects/      # ProjectCard, CreateProjectModal, EditProjectModal, MemberManager
    │   │   ├── tasks/         # KanbanBoard, ListView, TaskCard, TaskDetailModal,
    │   │   │                  # CreateTaskModal, SubtaskList
    │   │   └── ui/            # Alert, Modal, ConfirmDialog, EmptyState, FormField, Spinner
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── hooks/
    │   │   ├── useFetch.js
    │   │   └── usePageTitle.jsx
    │   ├── pages/
    │   │   ├── auth/          # Login, Register, ForgotPassword, ResetPassword,
    │   │   │                  # VerifyEmail, Profile
    │   │   ├── notes/         # NotesPage
    │   │   ├── projects/      # ProjectsPage, ProjectDetailPage
    │   │   ├── status/        # StatusPage
    │   │   └── tasks/         # TasksPage
    │   ├── utils/
    │   │   └── taskConstants.js
    │   ├── App.jsx            # Router tree
    │   ├── main.jsx
    │   └── index.css          # Tailwind layers + global component classes
    ├── .env                   # (not committed — see §11)
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 5. Backend — Setup & Configuration

### Prerequisites

- Node.js ≥ 18
- A MongoDB instance (local or Atlas)
- An SMTP service (Mailtrap for dev, any provider for production)

### Installation

```bash
cd backend
npm install
```

### Running

```bash
# Development (auto-restart on file change)
npm run dev

# Production
npm start
```

The server starts on `PORT` (default `8000`). On boot it:
1. Connects to MongoDB
2. Creates `public/images/` if it does not exist
3. Prints the health-check URL to the console

---

## 6. Backend — Environment Variables

Create a `.env` file in `backend/` (never commit this):

```env
# Server
NODE_ENV=development
PORT=8000

# CORS — set to your frontend URL
CLIENT_URL=http://localhost:3000

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/<dbname>

# JWT — use long random strings in production
ACCESS_TOKEN_SECRET=change_me_access
REFRESH_TOKEN_SECRET=change_me_refresh
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# SMTP — Mailtrap sandbox shown below; swap for real provider in production
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=<mailtrap_user>
SMTP_PASS=<mailtrap_pass>
EMAIL_FROM=noreply@pbm.example.com

# Used in email links
APP_URL=http://localhost:8000
```

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | Full MongoDB connection string |
| `ACCESS_TOKEN_SECRET` | ✅ | JWT signing secret for access tokens |
| `REFRESH_TOKEN_SECRET` | ✅ | JWT signing secret for refresh tokens |
| `ACCESS_TOKEN_EXPIRY` | ✅ | e.g. `15m` |
| `REFRESH_TOKEN_EXPIRY` | ✅ | e.g. `7d` |
| `CLIENT_URL` | ✅ | Used by CORS and email links |
| `APP_URL` | ✅ | Used in email verification / password reset links |
| `SMTP_*` / `EMAIL_FROM` | ✅ | Email delivery |
| `PORT` | optional | Defaults to `8000` |
| `NODE_ENV` | optional | `development` or `production` |

---

## 7. Backend — Data Models

### User

| Field | Type | Notes |
|---|---|---|
| `username` | String | Unique, lowercase, indexed |
| `email` | String | Unique, lowercase |
| `password` | String | bcrypt (12 rounds), excluded from queries |
| `isEmailVerified` | Boolean | Default `false` |
| `emailVerificationToken` | String | SHA-256 hash, excluded from queries |
| `emailVerificationExpiry` | Date | 15-minute window |
| `forgotPasswordToken` | String | SHA-256 hash |
| `forgotPasswordExpiry` | Date | 15-minute window |
| `refreshToken` | String | Hashed, excluded from queries |

### Project

| Field | Type | Notes |
|---|---|---|
| `name` | String | Required |
| `description` | String | Optional |
| `createdBy` | ObjectId → User | |

### ProjectMember

| Field | Type | Notes |
|---|---|---|
| `project` | ObjectId → Project | |
| `user` | ObjectId → User | |
| `role` | String | `admin` \| `project_admin` \| `member` |

Unique compound index on `{ project, user }`.

### Task

| Field | Type | Notes |
|---|---|---|
| `title` | String | Required |
| `description` | String | |
| `project` | ObjectId → Project | |
| `assignedTo` | ObjectId → User | Nullable |
| `assignedBy` | ObjectId → User | Set to req.user on create |
| `status` | String | `todo` \| `in_progress` \| `done` |
| `attachments` | Array | `[{ url, mimetype, size }]` |

### SubTask

| Field | Type | Notes |
|---|---|---|
| `title` | String | Required |
| `task` | ObjectId → Task | |
| `project` | ObjectId → Project | |
| `isCompleted` | Boolean | Default `false` |
| `createdBy` | ObjectId → User | |

### Note

| Field | Type | Notes |
|---|---|---|
| `title` | String | Required |
| `content` | String | Required |
| `project` | ObjectId → Project | |
| `createdBy` | ObjectId → User | |

---

## 8. Backend — Role & Permission System

There are three roles, resolved per-project from the `ProjectMember` collection:

| Role | Constant | Description |
|---|---|---|
| `admin` | `UserRolesEnum.ADMIN` | Platform-level admin; full access to all projects |
| `project_admin` | `UserRolesEnum.PROJECT_ADMIN` | Can manage the project, its tasks, and notes |
| `member` | `UserRolesEnum.MEMBER` | Read access; can toggle subtask completion |

### Middleware chain for protected project routes

```
verifyJWT  →  getProjectRole  →  requireRole(...)  →  controller
```

- `verifyJWT` — validates the Bearer token and attaches `req.user`
- `getProjectRole` — finds the `ProjectMember` record for `req.user` + `:projectId`, attaches `req.project`, `req.projectMember`, `req.userRole`
- `adminOnly` — `admin` only
- `adminOrProjectAdmin` — `admin` or `project_admin`
- `allRoles` — any authenticated member

### Permission matrix

| Action | Required role |
|---|---|
| Create / update / delete project | `admin` |
| Add / update / remove members | `admin` |
| Get project & members | `admin`, `project_admin`, `member` |
| Create / update / delete task | `admin`, `project_admin` |
| Read tasks | `admin`, `project_admin`, `member` |
| Create / delete subtask | `admin`, `project_admin` |
| Toggle subtask complete | `admin`, `project_admin`, `member` |
| Create / update / delete note | `admin` |
| Read notes | `admin`, `project_admin`, `member` |

---

## 9. Backend — API Reference

All endpoints are prefixed with `/api/v1`. Responses follow:

```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Human readable message",
  "success": true
}
```

Errors follow:
```json
{
  "statusCode": 400,
  "message": "Validation error details",
  "success": false
}
```

---

### 🔐 Auth — `/api/v1/auth`

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| `POST` | `/register` | Public | `{ username, email, password }` | Create account; sends verification email |
| `POST` | `/login` | Public | `{ email, password }` | Returns `{ user, accessToken }`; sets `refreshToken` cookie |
| `POST` | `/logout` | 🔒 JWT | — | Clears refresh token cookie |
| `GET` | `/current-user` | 🔒 JWT | — | Returns the logged-in user object |
| `POST` | `/refresh-token` | Cookie | — | Exchanges refresh cookie for new access token |
| `GET` | `/verify-email/:token` | Public | — | Activates account from email link |
| `POST` | `/forgot-password` | Public | `{ email }` | Sends password reset email |
| `POST` | `/reset-password/:token` | Public | `{ newPassword }` | Sets new password |
| `POST` | `/change-password` | 🔒 JWT | `{ currentPassword, newPassword }` | In-session password change |
| `POST` | `/resend-email-verification` | 🔒 JWT | — | Resends verification email |

---

### 📁 Projects — `/api/v1/projects`

| Method | Endpoint | Auth | Role | Body | Description |
|---|---|---|---|---|---|
| `GET` | `/` | 🔒 JWT | — | — | List all projects the user belongs to |
| `POST` | `/` | 🔒 JWT | — | `{ name, description?, status? }` | Create a new project |
| `GET` | `/:projectId` | 🔒 JWT | Any member | — | Get project detail |
| `PUT` | `/:projectId` | 🔒 JWT | `admin` | `{ name?, description?, status? }` | Update project |
| `DELETE` | `/:projectId` | 🔒 JWT | `admin` | — | Delete project and cascade |
| `GET` | `/:projectId/members` | 🔒 JWT | Any member | — | List project members with roles |
| `POST` | `/:projectId/members` | 🔒 JWT | `admin` | `{ email, role }` | Add member by email |
| `PUT` | `/:projectId/members/:userId` | 🔒 JWT | `admin` | `{ role }` | Update member's role |
| `DELETE` | `/:projectId/members/:userId` | 🔒 JWT | `admin` | — | Remove member |

---

### ✅ Tasks — `/api/v1/tasks`

| Method | Endpoint | Auth | Role | Body / Form | Description |
|---|---|---|---|---|---|
| `GET` | `/:projectId` | 🔒 JWT | Any member | — | List all tasks in project (with populated subtasks) |
| `POST` | `/:projectId` | 🔒 JWT | `admin` / `project_admin` | `multipart/form-data`: `title`, `description?`, `status?`, `assignedTo?`, `attachments[]` (max 5 files, 5 MB each) | Create task |
| `GET` | `/:projectId/t/:taskId` | 🔒 JWT | Any member | — | Get task detail with subtasks |
| `PUT` | `/:projectId/t/:taskId` | 🔒 JWT | `admin` / `project_admin` | Same as POST | Update task |
| `DELETE` | `/:projectId/t/:taskId` | 🔒 JWT | `admin` / `project_admin` | — | Delete task + subtasks |

#### Subtasks

| Method | Endpoint | Auth | Role | Body | Description |
|---|---|---|---|---|---|
| `POST` | `/:projectId/t/:taskId/subtasks` | 🔒 JWT | `admin` / `project_admin` | `{ title }` | Add subtask |
| `PUT` | `/:projectId/st/:subTaskId` | 🔒 JWT | Any member | `{ title?, isCompleted? }` | Update subtask (all roles can toggle `isCompleted`) |
| `DELETE` | `/:projectId/st/:subTaskId` | 🔒 JWT | `admin` / `project_admin` | — | Delete subtask |

---

### 📝 Notes — `/api/v1/notes`

| Method | Endpoint | Auth | Role | Body | Description |
|---|---|---|---|---|---|
| `GET` | `/:projectId` | 🔒 JWT | Any member | — | List all notes in project |
| `POST` | `/:projectId` | 🔒 JWT | `admin` | `{ title, content }` | Create note |
| `GET` | `/:projectId/n/:noteId` | 🔒 JWT | Any member | — | Get single note |
| `PUT` | `/:projectId/n/:noteId` | 🔒 JWT | `admin` | `{ title?, content? }` | Update note |
| `DELETE` | `/:projectId/n/:noteId` | 🔒 JWT | `admin` | — | Delete note |

---

### 💚 Healthcheck — `/api/v1/healthcheck`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | 🔒 JWT | Returns API status, DB state, uptime, memory, environment, timestamp |

**Response `data` shape:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "uptime": "3600s",
  "environment": "development",
  "database": { "status": "connected" },
  "memory": { "heapUsed": "45 MB", "heapTotal": "78 MB" }
}
```

---

## 10. Frontend — Setup & Configuration

### Prerequisites

- Node.js ≥ 18
- Backend running on `http://localhost:8000`

### Installation

```bash
cd pbm-frontend
npm install
```

### Running

```bash
# Development — opens on http://localhost:3000
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Lint
npm run lint
```

The `vite.config.js` dev proxy forwards all `/api` requests to `http://localhost:8000`, so no CORS configuration is needed during development.

---

## 11. Frontend — Environment Variables

Create a `.env` file in `pbm-frontend/`:

```env
# Base URL of the Express API (no trailing slash)
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

In production, point this to your deployed API URL:

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
```

> All Vite environment variables must be prefixed with `VITE_` to be exposed to the browser bundle.

---

## 12. Frontend — Project Structure

```
src/
├── api/                        # HTTP service layer
│   ├── axiosInstance.js        # Axios + request/response interceptors
│   ├── auth.api.js
│   ├── projects.api.js
│   ├── tasks.api.js
│   ├── notes.api.js
│   ├── healthcheck.api.js
│   └── index.js                # Barrel re-export
│
├── context/
│   └── AuthContext.jsx         # useAuth() hook + AuthProvider
│
├── hooks/
│   ├── useFetch.js             # Generic data-fetching hook
│   └── usePageTitle.jsx        # Declarative Navbar title
│
├── utils/
│   └── taskConstants.js        # Status enums, labels, Kanban column config
│
├── components/
│   ├── layout/
│   │   ├── AppLayout.jsx       # Sidebar + Navbar + <Outlet />
│   │   ├── AuthLayout.jsx      # Split-screen auth shell
│   │   ├── Navbar.jsx          # Top bar, user dropdown, logout
│   │   ├── ProtectedRoute.jsx  # Auth guard wrapper
│   │   └── Sidebar.jsx         # Nav + project sub-nav
│   ├── ui/                     # Generic primitives
│   │   ├── Alert.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── EmptyState.jsx
│   │   ├── FormField.jsx
│   │   ├── Modal.jsx
│   │   └── Spinner.jsx
│   ├── projects/
│   │   ├── CreateProjectModal.jsx
│   │   ├── EditProjectModal.jsx
│   │   ├── MemberManager.jsx
│   │   └── ProjectCard.jsx
│   ├── tasks/
│   │   ├── CreateTaskModal.jsx
│   │   ├── KanbanBoard.jsx
│   │   ├── ListView.jsx
│   │   ├── SubtaskList.jsx
│   │   ├── TaskCard.jsx
│   │   └── TaskDetailModal.jsx
│   └── notes/
│       ├── NoteCard.jsx
│       ├── NoteEditor.jsx
│       └── NoteViewer.jsx
│
└── pages/
    ├── auth/
    │   ├── LoginPage.jsx
    │   ├── RegisterPage.jsx
    │   ├── ForgotPasswordPage.jsx
    │   ├── ResetPasswordPage.jsx
    │   ├── VerifyEmailPage.jsx
    │   └── ProfilePage.jsx
    ├── projects/
    │   ├── ProjectsPage.jsx
    │   └── ProjectDetailPage.jsx
    ├── tasks/
    │   └── TasksPage.jsx
    ├── notes/
    │   └── NotesPage.jsx
    └── status/
        └── StatusPage.jsx
```

---

## 13. Frontend — Pages & Routes

| Route | Page | Auth | Description |
|---|---|---|---|
| `/login` | `LoginPage` | Public | Email + password login |
| `/register` | `RegisterPage` | Public | Create account, shows verify-email prompt |
| `/forgot-password` | `ForgotPasswordPage` | Public | Request password reset email |
| `/reset-password/:token` | `ResetPasswordPage` | Public | Set new password from email link |
| `/verify-email/:token` | `VerifyEmailPage` | Public | Activates account from email link |
| `/projects` | `ProjectsPage` | 🔒 | Dashboard grid of all projects |
| `/projects/:projectId` | `ProjectDetailPage` | 🔒 | Tabbed view: Overview, Tasks, Notes, Members |
| `/projects/:projectId/tasks` | `TasksPage` | 🔒 | Kanban board + list view for tasks |
| `/projects/:projectId/notes` | `NotesPage` | 🔒 | Masonry note grid with editor |
| `/profile` | `ProfilePage` | 🔒 | Change password, email verification status |
| `/status` | `StatusPage` | 🔒 | Live API healthcheck dashboard |
| `/` | — | — | Redirects to `/projects` |
| `*` | 404 | — | Not-found page |

---

## 14. Frontend — Component Map

### Layout shell

```
App
└── BrowserRouter
    ├── AuthProvider        (authentication state + bootstrap)
    │   └── PageTitleProvider  (Navbar title state)
    │       ├── [public routes]  /login, /register, …
    │       └── ProtectedRoute   (redirects to /login if not authed)
    │           └── AppLayout
    │               ├── Sidebar   (nav + project sub-nav)
    │               ├── Navbar    (title + user dropdown)
    │               └── <Outlet />  →  page components
```

### Project management

```
ProjectsPage
├── ProjectCard × N
├── CreateProjectModal  (useActionState → POST /projects)
├── EditProjectModal    (useActionState → PUT /projects/:id)
└── ConfirmDialog       (DELETE /projects/:id)

ProjectDetailPage
├── Tabs: Overview | Tasks | Notes | Members
├── OverviewTab   (stat cards + team chips)
├── MemberManager (add/role-change/remove members)
├── EditProjectModal
└── ConfirmDialog
```

### Task board

```
TasksPage
├── View toggle: KanbanBoard | ListView
├── Filters: search + status + assignee
├── KanbanBoard
│   └── Column × 3  (todo | in_progress | done)
│       └── TaskCard × N
│           └── Inline status quick-change <select>
├── ListView
│   └── Sortable table rows → TaskCard data
├── CreateTaskModal   (useActionState → POST /tasks/:projectId)
└── TaskDetailModal
    ├── Inline edit: title, description, status, assignee
    ├── SubtaskList
    │   └── add / toggle / delete subtasks
    └── Attachment list
```

### Notes

```
NotesPage
├── Masonry NoteCard grid
├── NoteViewer  (read-only modal with Edit / Delete actions)
└── NoteEditor  (create or edit, Ctrl+S shortcut, char counter)
```

---

## 15. Frontend — State & Data Flow

### Authentication (`AuthContext`)

```
mount
  └── GET /auth/current-user
        ├── success → setUser(user), isLoading = false
        └── 401    → setUser(null), isLoading = false

login(email, password)
  └── POST /auth/login
        └── setAccessToken(token), setUser(user)

logout()
  └── POST /auth/logout
        └── clearAccessToken(), setUser(null)

"auth:logout" event (fired by Axios interceptor on refresh failure)
  └── clearAccessToken(), setUser(null)
```

### Token refresh (Axios interceptor)

```
Any 401 response
  └── POST /auth/refresh-token  (uses HttpOnly cookie automatically)
        ├── success → setAccessToken(newToken), retry original request
        └── failure → dispatch "auth:logout", redirect to /login
```

### Data fetching (`useFetch`)

```js
const { data, isLoading, error, refetch } = useFetch(
  () => getProjectTasks(projectId),
  [projectId]  // re-runs when deps change
);
```

- Cancels in-flight requests on unmount via `AbortController`
- Re-runs automatically when dependency array changes
- `refetch()` can be called manually after mutations

### Form submissions (`useActionState` — React 19)

```js
const [state, formAction, isPending] = useActionState(
  async (prevState, formData) => {
    // validate → API call → return { ok, message, fieldErrors }
  },
  { ok: false, message: null, fieldErrors: {} }
);
```

---

## 16. Running the Full Stack Locally

### Step 1 — Start the backend

```bash
cd backend
cp .env.example .env        # fill in your values
npm install
npm run dev
# → Server running on http://localhost:8000
# → Health check: http://localhost:8000/api/v1/healthcheck
```

### Step 2 — Start the frontend

```bash
cd pbm-frontend
cp .env.example .env        # VITE_API_BASE_URL=http://localhost:8000/api/v1
npm install
npm run dev
# → App running on http://localhost:3000
```

### Step 3 — Open the app

Navigate to `http://localhost:3000`, create an account, verify your email (check Mailtrap inbox), then log in.

> **Tip:** The Vite dev server proxies all `/api` requests to `:8000`, so you never need to change any API URLs during development.

---

## 17. Authentication Flow

```
Register
  ↓  POST /auth/register  { username, email, password }
  ↓  Email sent: "Verify your email" → link contains /verify-email/:token
  ↓  GET /auth/verify-email/:token
  ↓  Account activated

Login
  ↓  POST /auth/login  { email, password }
  ↓  Response: { user, accessToken }  +  Set-Cookie: refreshToken (HttpOnly)
  ↓  Frontend stores accessToken in memory (NOT localStorage)
  ↓  Every request: Authorization: Bearer <accessToken>

Token expiry (15 min)
  ↓  API returns 401
  ↓  Axios interceptor: POST /auth/refresh-token  (cookie sent automatically)
  ↓  New accessToken returned → retry original request transparently

Logout
  ↓  POST /auth/logout  (clears refreshToken cookie server-side)
  ↓  Frontend clears in-memory accessToken + user state

Password reset
  ↓  POST /auth/forgot-password  { email }
  ↓  Email sent: link contains /reset-password/:token
  ↓  POST /auth/reset-password/:token  { newPassword }
  ↓  Token invalidated, user can log in with new password
```

---

## 18. File Uploads

Task attachments are handled with **Multer**:

- **Max files per task:** 5
- **Max file size:** 5 MB per file
- **Allowed MIME types:** `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `application/pdf`, `text/plain`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Storage location:** `backend/public/images/` (served statically at `/images/<filename>`)
- **Frontend:** the `CreateTaskModal` and `TaskDetailModal` send `multipart/form-data` when files are selected; JSON is used otherwise

To add cloud storage (e.g. Cloudinary / S3) in production, replace `multer.middleware.js`'s `diskStorage` engine with the appropriate Multer storage adapter and update the `url` saved to the `attachments` array.

---

## 19. Email Configuration

The backend uses **Nodemailer** with **Mailgen** HTML templates for:

- Email address verification (sent on register and resend)
- Password reset link

**Development** — Use [Mailtrap](https://mailtrap.io) sandbox (free):

```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=<inbox_user>
SMTP_PASS=<inbox_pass>
```

**Production** — Replace with your SMTP provider (SendGrid, Resend, SES, etc.):

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<your_sendgrid_api_key>
EMAIL_FROM=noreply@yourdomain.com
```

---

## 20. Deployment Notes

### Backend

1. Set `NODE_ENV=production` — this makes the refresh token cookie `secure: true` (HTTPS only)
2. Ensure `CLIENT_URL` matches your deployed frontend origin exactly (used for CORS)
3. Use a process manager like **PM2** or deploy to a platform that manages restarts (Railway, Render, Fly.io)
4. Mount a persistent volume at `backend/public/images/` if you need attachments to survive deploys; or migrate to cloud object storage

### Frontend

```bash
cd pbm-frontend
npm run build
# Output: dist/  → deploy to Vercel, Netlify, Cloudflare Pages, or any static host
```

Set `VITE_API_BASE_URL` as a build-time environment variable on your hosting platform.

For single-page-app routing to work, configure your host to serve `index.html` for all paths:

- **Netlify:** add `_redirects` file: `/* /index.html 200`
- **Vercel:** add `vercel.json`: `{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }`
- **Nginx:** `try_files $uri /index.html;`

### CORS checklist

| Item | Value |
|---|---|
| Backend `CLIENT_URL` | Exact frontend origin, no trailing slash |
| Backend `credentials: true` in CORS config | ✅ (required for cookies) |
| Frontend `withCredentials: true` in Axios | ✅ (already set in `axiosInstance.js`) |
| `SameSite` cookie attribute | `strict` in development; consider `none` with `secure: true` for cross-origin production |

---

*Built by Devesh Tanwar — Product Basecamp Management v1.0*

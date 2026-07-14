# Product Basecamp Management (PBM)

Product Basecamp Management is a robust, full-stack project management platform designed to streamline team collaboration, task tracking, and workspace organization. Built on the MERN stack, it features interactive Kanban boards, granular subtask hierarchies, role-based access controls, and secure file attachments.

---

## 🚀 Features

* **Interactive Task Management:** Real-time task tracking using dynamic Kanban boards and List views. Drag-and-drop capabilities ensure seamless workflow transitions.
* **Granular Subtasks:** Break down complex tasks into manageable, deeply nested subtask hierarchies to track micro-deliverables.
* **Role-Based Access Control (RBAC):** Custom permission middlewares enforce strict access controls and validate project member roles (Owner, Admin, Member) at the API level.
* **Secure Authentication:** JWT-based user authentication, password hashing with bcrypt, and secure HTTP-only session management.
* **Collaborative Workspaces:** Create discrete projects, invite team members, assign roles, and maintain dedicated project documentation through collaborative notes.
* **Multipart File Uploads:** Integrated `multer` middleware allowing users to securely upload, manage, and attach resources directly to tasks and project notes.

---

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | React, Next.js, Tailwind CSS, Shadcn UI |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ORM |
| **Security & Auth** | JSON Web Tokens (JWT), Bcrypt |
| **File Management** | Multer |
| **Code Quality** | ESLint, Prettier |

---

## 🔐 Permission Matrix

Access within each workspace is strictly governed by the user's assigned role. The `permission.middleware.js` intercepts requests and validates them against this matrix.

| Action | Owner | Admin | Member |
| :--- | :---: | :---: | :---: |
| **View Project & Tasks** | ✅ | ✅ | ✅ |
| **Edit Assigned Tasks** | ✅ | ✅ | ✅ |
| **Create/Delete Tasks & Subtasks**| ✅ | ✅ | ❌ |
| **Manage Project Notes** | ✅ | ✅ | ❌ |
| **Upload/Remove Attachments** | ✅ | ✅ | ❌ |
| **Invite/Remove Members** | ✅ | ✅ | ❌ |
| **Update Member Roles** | ✅ | ❌ | ❌ |
| **Delete Entire Project** | ✅ | ❌ | ❌ |

---

## 📡 Detailed API Routing

The backend exposes a comprehensive RESTful API organized by controllers. All routes (except standard Auth) require a valid JWT Bearer token.

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/register` | Register a new user account | No |
| `POST` | `/login` | Authenticate user and return JWT | No |
| `GET` | `/me` | Get current authenticated user profile | Yes |

### Projects (`/api/projects`)
| Method | Endpoint | Description | Permission Level |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Fetch all projects for the logged-in user | Any |
| `POST` | `/` | Create a new project workspace | Any (Becomes Owner)|
| `GET` | `/:id` | Fetch specific project details | Member |
| `PUT` | `/:id` | Update project settings | Admin, Owner |
| `DELETE`| `/:id` | Delete project and associated data | Owner |

### Project Members (`/api/projects/:projectId/members`)
| Method | Endpoint | Description | Permission Level |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Add a new member to the project | Admin, Owner |
| `PUT` | `/:memberId` | Update a member's role | Owner |
| `DELETE`| `/:memberId` | Remove a member from the project | Admin, Owner |

### Tasks & Subtasks (`/api/tasks` & `/api/subtasks`)
| Method | Endpoint | Description | Permission Level |
| :--- | :--- | :--- | :--- |
| `GET` | `/project/:projectId`| Fetch all tasks for a project | Member |
| `POST` | `/` | Create a new task (supports Multer) | Admin, Owner |
| `PUT` | `/:id` | Update task status, assignee, or data | Member (if assigned)*|
| `DELETE`| `/:id` | Delete a task | Admin, Owner |
| `POST` | `/subtasks` | Add a subtask to a parent task | Admin, Owner |

### Notes (`/api/notes`)
| Method | Endpoint | Description | Permission Level |
| :--- | :--- | :--- | :--- |
| `GET` | `/project/:projectId`| Retrieve project documentation/notes | Member |
| `POST` | `/` | Create a new note | Admin, Owner |
| `PUT` | `/:id` | Update note content | Admin, Owner |
| `DELETE`| `/:id` | Delete a note | Admin, Owner |

---

## 📂 Project Structure

```text
product_management/
├── server/                           # Express.js Backend
│   ├── config/                       # Environment & constant configurations
│   ├── controllers/                  # Route logic handling
│   │   ├── auth.controller.js
│   │   ├── project.controller.js
│   │   ├── task.controller.js
│   │   └── ...
│   ├── db/                           # MongoDB connection setup
│   ├── middlewares/                  # Request interceptors
│   │   ├── auth.middleware.js        # JWT validation
│   │   ├── permission.middleware.js  # RBAC enforcement
│   │   ├── multer.middleware.js      # File upload handling
│   │   └── errorHandler.middleware.js# Global error catching
│   ├── models/                       # Mongoose schemas
│   │   ├── user.model.js
│   │   ├── project.model.js
│   │   ├── projectMember.model.js
│   │   └── ...
│   └── package.json
│
└── src/ & app/                       # Next.js Frontend
    ├── app/                          # Next.js App Router (Pages & Layouts)
    ├── components/                   # Reusable UI components
    │   ├── ui/                       # Shadcn base components
    │   ├── tasks/                    # Kanban and List views
    │   └── projects/                 # Project creation and management
    ├── hooks/                        # Custom React hooks (e.g., API fetching)
    ├── lib/                          # Utility functions and configurations
    └── store/                        # Global state management (Zustand/Redux)
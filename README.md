# 💧 HydroTrack - Water Intake & Hydration Tracker

A production-ready, full-stack Water Intake and Daily Hydration Tracking application engineered with robust architecture, JWT authentication, Role-Based Access Control (RBAC), interactive water wave visualization gauges, historical analytics, and automated testing.

---

## 🌟 Key Features

### 👤 User Capabilities
- **JWT Authentication & Session Persistence**: Secure registration and login with bcrypt password hashing and token expiration handling.
- **Dynamic Wave Hydration Gauge**: Real-time animated water level visualizer displaying percentage, remaining volume, and standard 250ml glass counts.
- **One-Click Instant Hydration Shortcuts**: Quickly log `+150ml` (cup), `+250ml` (glass), `+500ml` (bottle), and `+750ml` (flask).
- **Custom Drink Logging & Date Support**: Add custom amounts with optional notes and dates (handles timezone alignment cleanly).
- **Personal Daily Goal Setting**: Set customized recommended intake targets (e.g., 2,000ml to 3,500ml) with instant gauge updates.
- **Consumption History & Trends**: Interactive bar charts and collapsible daily logs over 7, 14, or 30-day periods.
- **Entry Management**: Delete any logged drink entry with automatic daily recalculation.

### 🛡️ Admin Capabilities (RBAC)
- **Administrative Control Center**: Dedicated admin dashboard at `/admin` accessible only to accounts with the `admin` role.
- **Platform Analytics**: Total registered users, active drinkers today, all-time water volume logged, and platform average consumption.
- **User Directory Management**: Search, filter, and inspect registered users with total intake summaries.
- **User History Inspection**: Inspect full intake history and timestamps for any registered user.
- **Set Individual User Goals**: Adjust the daily goal for any user directly from the admin interface.
- **Account Administration**: Delete user accounts and their associated logs (with self-deletion protection for admins).
- **Global Default Goal Setting**: Configure the platform-wide recommended daily goal for newly registered users.

---

## 🏗️ Architecture & Tech Stack

```mermaid
graph TD
    Client["React 18 + Vite (SPA)"]
    API["Express.js REST API (:5000)"]
    Auth["JWT + bcrypt Auth"]
    RBAC["Role-Based Middleware"]
    DB["MongoDB / Mongoose"]
    MemoryDB["mongodb-memory-server (Zero-Config Fallback)"]

    Client -->|HTTP / JSON (Axios Client)| API
    API --> Auth
    API --> RBAC
    API --> DB
    DB -.->|Fallback if no external DB| MemoryDB
```

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Lucide React, Vanilla CSS with custom glassmorphism design system |
| **Backend** | Node.js, Express 4, Mongoose 8, express-validator 7, jsonwebtoken, bcryptjs |
| **Database** | MongoDB (seamlessly connects to custom `MONGO_URI` or starts an embedded in-memory MongoDB instance automatically) |
| **Testing** | Jest, Supertest, mongodb-memory-server |

---

## ⚡ Quick Start Guide

### Prerequisites
- Node.js (v18.x, v20.x, or higher)
- npm (v9.x or higher)

### 1. One-Command Setup & Run (From Root Directory)
From the repository root (`/Assessment`):

```bash
# 1. Install dependencies for root, backend, and frontend
npm run install:all

# 2. Run both Backend (:5000) and Frontend (:5173) concurrently
npm run dev
```

The application will be accessible at:
- **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **Health Check Endpoint**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### 2. Running Individually (Separate Terminals)

#### Start Backend:
```bash
cd water-tracker-backend
npm install
npm run dev
```

#### Start Frontend:
```bash
cd water-tracker-frontend
npm install
npm run dev
```

---

## 🔑 Pre-Seeded Demo Accounts

The database automatically seeds these accounts on server startup, or you can run `npm run seed`:

| Role | Email | Password | Pre-loaded Data |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@watertracker.com` | `Admin@12345` | Administrative portal access, overview stats |
| **Regular User** | `user@watertracker.com` | `User@12345` | Seeded with 4 days of sample water intake history |

> 💡 **Tip**: The login page includes **1-Click Demo Buttons** (`Demo Admin` & `Demo User`) to automatically populate credentials for immediate evaluation!

---

## 📡 RESTful API Reference

All protected endpoints require an `Authorization: Bearer <token>` header.

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Private | Retrieve logged-in user profile |
| `PUT` | `/api/auth/profile` | Private | Update user profile name or personal daily goal |

### 2. Water Intake Logging (`/api/intake`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/intake` | Private | Log water intake (`amount`, `unit`, `date`, `note`) |
| `GET` | `/api/intake/today` | Private | Get today's total intake vs daily goal and list of entries |
| `GET` | `/api/intake/history` | Private | Get intake history and aggregated daily totals (`?days=14`) |
| `DELETE` | `/api/intake/:id` | Private | Delete a logged entry (authorized to owner or admin) |
| `GET` | `/api/intake/user/:userId` | Admin | Inspect any user's intake history |

### 3. User Management (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Admin | Get list of all registered users with total intake summaries |
| `GET` | `/api/users/:id` | Admin | Get user details by ID |
| `PATCH`| `/api/users/:id/goal` | Admin | Update recommended daily water goal for a specific user |
| `DELETE`| `/api/users/:id` | Admin | Delete user account & associated logs (rejects self-deletion) |

### 4. System Analytics & Settings (`/api/stats`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/stats/overview` | Admin | Platform metrics: total users, active users today, total volume |
| `GET` | `/api/stats/system-goal` | Public | Get system default recommended daily goal |
| `PUT` | `/api/stats/system-goal` | Admin | Update system baseline daily goal for new users |

---

## 🧪 Automated Testing

The backend includes a comprehensive Jest test suite verifying:
- Health check availability
- User registration and duplicate email rejection
- Password validation and JWT signing
- Water intake logging and boundary checks (rejects `0`, negative amounts, or amounts `> 10,000ml`)
- Ownership validation on intake entry deletion (rejects 403 when deleting another user's entry)
- Role-based authorization (rejects non-admins with 403 on admin endpoints)
- Admin user goal adjustments and user account deletion
- Admin self-deletion prevention

### Run Tests:
```bash
# From repository root:
npm test

# Or from water-tracker-backend:
cd water-tracker-backend
npm test
```

All 20 test suites execute against an isolated in-memory database with 100% pass rate.

---

## 🛡️ Edge Cases Handled

1. **Zero & Negative Intake Amounts**: Rejected with HTTP 400 validation error.
2. **Excessive Intake Volume**: Upper bound validation prevents entries exceeding 10,000ml (10L).
3. **Cross-User Entry Deletion**: Users cannot delete intake logs belonging to other users (HTTP 403).
4. **Admin Self-Deletion**: System prevents an admin from deleting their own account via both API and UI safeguards.
5. **Non-Admin Access to Admin Routes**: RBAC middleware intercepts and rejects non-admin users with HTTP 403.
6. **Timezone Offset Shift**: Date parser utility (`parseLocalDate`) prevents UTC midnight date rollback in historical charts and logs.
7. **Zero-Config Database**: Seamlessly falls back to an embedded in-memory MongoDB instance if no external MongoDB URI is provided or reachable.

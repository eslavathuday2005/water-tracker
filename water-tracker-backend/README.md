# 💧 Water Intake Tracker API (Backend)

> Production-grade RESTful API built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)** for tracking daily hydration goals, logging intake records, and role-based user management.

---

## 🚀 Features

- **JWT-Based Authentication**: Secure registration and login with bcrypt password hashing and token expiration.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `user` and `admin` roles, secured by dedicated middleware.
- **Water Intake Tracking**:
  - Log consumption in milliliters with timestamps and notes.
  - Real-time calculations of today's progress, percentage of goal reached, and remaining amount.
  - Comprehensive historical intake views with daily aggregates and entry-level breakdowns.
  - Self-deletion protection (users can only delete their own entries).
- **Admin Management Portal**:
  - View all registered users with summary statistics (total water consumed, logs count).
  - Inspect any specific user's water intake history.
  - Update user daily hydration goals or configure platform-wide default goals.
  - Delete user accounts with complete data cascade (with self-deletion protection).
  - Platform usage statistics (total users, total water logged, active users today, average hydration).
- **Edge Case Protection**:
  - Rejection of 0 or negative intake amounts with `400 Bad Request`.
  - Rejection of non-admin access to admin routes with `403 Forbidden`.
  - Rejection of admin deleting their own account with `400 Bad Request`.
  - Prevention of users deleting other users' logs (`403 Forbidden`).
  - Graceful fallback to default 2000ml goal if not explicitly set.
- **Flexible Database Architecture**:
  - Automatically connects to `MONGO_URI` (local or MongoDB Atlas).
  - **Zero-Config Fallback**: Automatically initializes an in-memory MongoDB server (`mongodb-memory-server`) if no URI is supplied, ensuring immediate testability out-of-the-box!

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Validation**: `express-validator`
- **Testing**: `jest`, `supertest`
- **Security & Utilities**: `cors`, `dotenv`

---

## 📁 Folder Structure

```
water-tracker-backend/
├── src/
│   ├── config/
│   │   ├── db.js             # Mongo connection + in-memory fallback
│   │   └── env.js            # Environment variable loader
│   ├── controllers/
│   │   ├── authController.js   # Register, login, profile management
│   │   ├── intakeController.js # Log water, today's summary, history, delete
│   │   ├── userController.js   # Admin user management & goal updates
│   │   └── statsController.js  # Platform usage analytics & system defaults
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification & user injection
│   │   ├── roleMiddleware.js   # Admin RBAC enforcement
│   │   ├── validateMiddleware.js # express-validator error formatting
│   │   └── errorMiddleware.js  # 404 & centralized error handler
│   ├── models/
│   │   ├── User.js             # User schema with bcrypt & token methods
│   │   ├── IntakeLog.js        # Intake log schema with compound indexes
│   │   └── SystemConfig.js     # Global hydration config
│   ├── routes/
│   │   ├── authRoutes.js       # /api/auth routes
│   │   ├── userRoutes.js       # /api/users routes (Admin protected)
│   │   ├── intakeRoutes.js     # /api/intake routes
│   │   └── statsRoutes.js      # /api/stats routes
│   ├── utils/
│   │   └── seed.js             # Default Admin & sample user seeder
│   ├── app.js                  # Express app setup & middleware pipeline
│   └── server.js               # Database connection & server listen
├── tests/
│   └── api.test.js             # Automated unit/integration test suite
├── .env.example                # Environment variable documentation
├── postman_collection.json     # Postman / Thunder Client collection
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` in the root of the backend folder:

```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | Port for the Express server to listen on | `5000` |
| `NODE_ENV` | Application environment mode | `development` |
| `MONGO_URI` | MongoDB connection string (Atlas or local). If empty, auto-uses in-memory MongoDB | `mongodb://localhost:27017/water_tracker` |
| `JWT_SECRET` | Secret key used for signing JWT access tokens | `your_super_secret_jwt_key` |
| `JWT_EXPIRE` | Expiry duration for JWT tokens | `7d` |
| `DEFAULT_DAILY_GOAL` | Default daily hydration target in milliliters | `2000` |
| `ADMIN_NAME` | Default seeded Admin full name | `Admin User` |
| `ADMIN_EMAIL` | Default seeded Admin email address | `admin@watertracker.com` |
| `ADMIN_PASSWORD` | Default seeded Admin password | `Admin@12345` |

---

## 🚀 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <backend-repo-url>
   cd water-tracker-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   Create a `.env` file or use the default in-memory configuration:
   ```bash
   cp .env.example .env
   ```

4. **Start the server**:
   ```bash
   # Production mode
   npm start

   # Development mode with hot-reloading
   npm run dev
   ```

5. The API will start on `http://localhost:5000`.

---

## 🧪 Pre-seeded Test Accounts

The server seeds these demo accounts on startup:

| Role | Email | Password | Daily Goal |
|---|---|---|---|
| **Admin** | `admin@watertracker.com` | `Admin@12345` | 2500 ml |
| **User** | `user@watertracker.com` | `User@12345` | 2000 ml (seeded with sample logs) |

---

## 📡 API Endpoint Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user (`name`, `email`, `password`) |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Private | Retrieve logged-in user profile |
| `PUT` | `/api/auth/profile` | Private | Update user's name or personal daily goal |

### Water Intake Logging (`/api/intake`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/intake` | Private | Log water intake (`amount`, `unit`, `note`, `date`) |
| `GET` | `/api/intake/today` | Private | Get today's total intake vs daily goal with % progress |
| `GET` | `/api/intake/history` | Private | Get past dates with daily totals & log entries |
| `DELETE` | `/api/intake/:id` | Private | Delete a logged entry (must own entry or be admin) |
| `GET` | `/api/intake/user/:userId` | Admin | View any user's intake history |

### User Management (`/api/users`) - Admin Only
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users` | Admin | View list of all registered users with intake summaries |
| `GET` | `/api/users/:id` | Admin | View single user details |
| `PATCH` | `/api/users/:id/goal` | Admin | Set/update recommended daily water intake goal |
| `DELETE` | `/api/users/:id` | Admin | Delete a user account (cannot delete own account) |

### System & Stats (`/api/stats`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/stats/overview` | Admin | View overall platform usage data & metrics |
| `GET` | `/api/stats/system-goal` | Public | Get system-wide recommended daily water goal |
| `PUT` | `/api/stats/system-goal` | Admin | Update system-wide recommended daily goal |
| `GET` | `/api/health` | Public | Health check endpoint |

---

## 🧪 Running Automated Tests

Run the automated Jest test suite covering authentication, RBAC, input validation, and all edge cases:

```bash
npm test
```

A Postman / Thunder Client collection is also provided at `postman_collection.json`.

---

## 🛡️ Edge Cases Handled

1. **Zero or Negative Intake Amount**: Logging `<= 0` returns `400 Bad Request` with clear error message.
2. **Unauthorized Log Deletion**: Attempting to delete another user's log returns `403 Forbidden`.
3. **Admin Self-Deletion Safeguard**: Admin attempting to delete their own account returns `400 Bad Request`.
4. **Non-Admin Route Access**: Regular users accessing `/api/users` or `/api/stats/overview` return `403 Forbidden`.
5. **Missing Daily Goal**: Gracefully defaults to 2000ml / system default.

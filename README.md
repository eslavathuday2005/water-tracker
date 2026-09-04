# 🌊 HydroTrack — Water Intake Tracker (Frontend)

> A modern, responsive, aquatic-glassmorphic Single Page Application built with **React**, **Vite**, and **Vanilla CSS** for tracking daily water consumption, visualizing hydration milestones, and administrative management.

---

## ✨ Features

- **Fluid Wave Animation**: Interactive circular water vessel that dynamically fills and undulates with SVG waves to visualize today's intake percentage against daily hydration targets.
- **Quick Logging Presets**: 1-click logging for standard sizes (+150ml Cup, +250ml Glass, +500ml Bottle, +750ml Flask) and custom milliliter inputs with notes.
- **Real-Time Hydration Feedback**: Live calculation of consumed amount, remaining milliliters, glass equivalents, and milestone motivation badges.
- **Intake History & Visual Trends**: Interactive multi-day consumption bar chart and date-by-date accordion with individual entry deletion.
- **Administrative Control Center**:
  - Platform metrics dashboard (Total users, all-time litres consumed, today's water, active users).
  - Registered user directory with search filters and live stats.
  - Inspection modal to review any user's historical logs.
  - User goal customizer & platform default goal adjuster.
  - User account deletion with **self-deletion safeguard** (Admin cannot delete self).
- **Authentication & RBAC**:
  - Secure JWT authentication flow with persistent login sessions.
  - Role-protected routes (`ProtectedRoute` and `AdminRoute`).
  - **1-Click Demo Accounts**: Instant "⚡ Demo Admin" and "⚡ Demo User" autofill buttons for rapid testing and evaluation.
- **Edge Case Handling**:
  - Client-side validation preventing 0 or negative intake.
  - Graceful default daily goal fallback (2,000ml).
  - Floating animated toasts for instant feedback on all actions.

---

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Vanilla CSS (Custom Design System with CSS Variables & Glassmorphism)
- **Icons**: `lucide-react`
- **Routing**: `react-router-dom` (v6)
- **HTTP Client**: `axios` (with JWT interceptors)

---

## 📁 Folder Structure

```
water-tracker-frontend/
├── src/
│   ├── api/
│   │   ├── axiosClient.js    # Axios instance with JWT interceptors & env config
│   │   ├── authApi.js        # Authentication endpoints
│   │   ├── intakeApi.js      # Water intake CRUD & history endpoints
│   │   └── userApi.js        # Admin management & platform analytics
│   ├── components/
│   │   ├── Navbar.jsx           # Responsive top navigation with user badge
│   │   ├── WaterWaveGauge.jsx   # Animated fluid SVG water gauge
│   │   ├── QuickAddModal.jsx    # Preset & custom intake logging modal
│   │   ├── SetGoalModal.jsx     # Goal configuration modal
│   │   ├── ProtectedRoute.jsx   # Auth guard for regular routes
│   │   └── AdminRoute.jsx       # RBAC guard for admin routes
│   ├── context/
│   │   ├── AuthContext.jsx      # Global authentication & user state
│   │   └── ToastContext.jsx     # Floating toast notifications
│   ├── pages/
│   │   ├── LoginPage.jsx          # Login with 1-click demo autofill
│   │   ├── RegisterPage.jsx       # User registration
│   │   ├── DashboardPage.jsx      # Today's logs & water wave gauge
│   │   ├── HistoryPage.jsx        # Historical chart & log breakdown
│   │   ├── AdminDashboardPage.jsx # Administrative management center
│   │   └── NotFoundPage.jsx       # 404 page
│   ├── App.jsx                  # Application routing & context providers
│   ├── index.css                # Aquatic glassmorphism design system
│   └── main.jsx                 # React root render
├── index.html                   # HTML template with Google Fonts
├── vite.config.js               # Vite configuration
├── .env.example                 # Frontend environment variables example
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

The backend API URL is configurable via `VITE_API_URL`.

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend REST API | `http://localhost:5000/api` |

---

## 🚀 Getting Started

1. **Navigate to the frontend directory**:
   ```bash
   cd water-tracker-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. Open your browser at `http://localhost:5173`.

---

## 🧪 Demo Credentials

For quick evaluation, click the demo buttons on the login page or use:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@watertracker.com` | `Admin@12345` |
| **User** | `user@watertracker.com` | `User@12345` |

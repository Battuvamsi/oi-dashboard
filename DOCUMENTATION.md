# OI Dashboard - Project Documentation

## 1. Project Overview
The **OI Dashboard** is a high-performance financial analytics tool designed to visualize real-time and historical Options Interest (OI) data for NIFTY, BANKNIFTY, and SENSEX. It features a modern, glassmorphic UI with dark mode support, real-time data polling, and interactive charts.

## 2. Tech Stack
- **Frontend:** React (Vite), TypeScript
- **Styling:** Tailwind CSS, Shadcn UI, Framer Motion
- **State Management:** React Hooks (useState, useEffect)
- **Routing:** React Router
- **Icons:** Lucide React
- **Backend/API:** External REST APIs (pollenprints.in)

---

## 3. API Specification

### Base URL
`https://ticker.pollenprints.in` (for market data)
`https://pollenprints.in` (for auth)

### A. Authentication

#### Login
- **Endpoint:** `POST https://pollenprints.in/api/login`
- **Description:** Authenticates a user.
- **Request Body:**
  
### 4. Feature & Business Logic Details

#### A. Timezone Handling & Graph Logic
The application strictly operates in **Indian Standard Time (IST)**, which is UTC+5:30. Since the backend/API returns timestamps in UTC, the frontend performs manual conversions to ensure accurate visualization.

**Graph Time Conversion Logic:**
1.  **Input Data:** The API returns data points with a `dateTime` field in UTC format (e.g., `2024-01-25T03:45:00Z`).
2.  **Conversion:** The frontend adds a fixed offset of **5.5 hours** (19,800,000 milliseconds) to the UTC timestamp to derive the IST time.
    *   `const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));`
3.  **Filtering:** The graph strictly filters data to show only the market hours:
    *   **Start:** 09:10 AM IST
    *   **End:** 04:00 PM IST
    *   *Logic:* `if (hours === 9 && minutes >= 10) ... if (hours > 9 && hours < 16) ... if (hours === 16 && minutes === 0)`
4.  **Display:** X-Axis labels and tooltips display the time in 24-hour format (HH:MM) based on the calculated IST time.

#### B. Dashboard Components
// ... keep existing code
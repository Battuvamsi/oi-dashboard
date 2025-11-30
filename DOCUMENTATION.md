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
  

# 🛡️ Green Guard — Admin implementation & Changes

This document summarizes the complete implementation of the Administrative Dashboard and the related reporting features.

## 📁 Consolidated Directory Structure

All admin-related logic and UI have been consolidated into dedicated `admin` folders for better maintainability.

### Frontend (`frontend/src/admin/`)

| File | Description |
|------|-------------|
| `AdminDashboard.tsx` | The core logic and UI components for the Admin Dashboard (Stats, User Management, NGO Verification, Reports). |
| `ReportUserModal.tsx` | A reusable modal component for submitting malicious activity reports. |
| `ADMIN_DOCS.md` | This documentation file. |

### Backend (`green-guard-backend/src/admin/`)

| File | Description |
|------|-------------|
| `admin.controller.js` | Business logic for platform stats, user banning, and NGO vetting. |
| `admin.routes.js` | Protected REST endpoints for administrative actions. |
| `userReport.controller.js` | Logic for handling report submissions and resolutions. |
| `userReport.routes.js` | API routes for the reporting system. |
| `seed-admin.js` | Script to initialize the admin account. |
| `user_reports_migration.sql` | Database schema for the reporting table. |

---

## 🛠️ Key Changes & Features

### 1. Unified Admin Dashboard

The dashboard at `/dashboard/admin` has been entirely refactored to use a modular structure. It includes:

- **Overview**: Real-time stats cards (Total Users, Plants, Adoptions, etc.).
- **User Management**: A table to view all users with the ability to **Ban/Unban** in one click.
- **NGO Verification**: A queue for reviewing and **Approvig/Rejecting** pending NGO registrations.
- **Report Management**: A dedicated tab to view and resolve/dismiss user reports.

### 2. Malicious Activity Reporting

A new reporting system was implemented to allow users and NGOs to report suspicious behavior:

- **Backend**: Created the `user_reports` table and endpoints.
- **Frontend**: Added "🚩 Report" buttons to adoption cards for both Adopters and NGOs.
- **Modal**: A custom `ReportUserModal` with category selection (Spam, Harassment, Fake NGO, etc.).

### 3. Authentication & Security

- **Route Guards**: The admin dashboard is strictly protected; non-admin users are automatically redirected to their respective dashboards or the login page.
- **Smart Redirects**: The root landing page now intelligently redirects logged-in users based on their role (Admin → Dashboard, NGO → NGO Dashboard, Adopter → My Adoptions).

### 4. Design System

- **Premium Emerald Theme**: Custom CSS utilities in `globals.css` provide a sleek, modern look using emerald greens and modern typography.
- **Interactive UI**: Added smooth animations (fadeIn, slideUp), custom stat cards, and responsive tables.

---

## 🔑 Admin Access

- **Login URL**: `http://localhost:3000/login`
- **Credentials**: `admin@greenguard.in` / `@rrm$2026`

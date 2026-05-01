# GreenGuard: Adopter Dashboard Testing Guide

This guide focuses on testing the **User (Adopter)** experience using the pre-seeded test data.

## 🏁 Prerequisites

1. **Frontend**: [http://localhost:3001](http://localhost:3001)
2. **Backend**: [http://localhost:5000](http://localhost:5000)

---

## 🧪 Test Case: Adopter Journey

### 1. Account Setup

- **Action**: Register a new account as an **Adopter**.
- **Expected**: You are redirected to the Dashboard (`/dashboard/adoptions`).
- **Success**: You see an empty state: "No adoptions yet".

### 2. Plant Discovery

- **Action**: Click the **"Browse Plants"** button or navigate to the **Map** ([http://localhost:3001/map](http://localhost:3001/map)).
- **Expected**:
  - You should see **3 plants** (Urban Ficus, Desert Aloe, Garden Hibiscus).
    - On the Map, they should appear around the **Pune/IST** region.
- **Success**: Plant cards load with images and "Available" badges.

### 3. Adoption Application

- **Action**:
  - Open the **Urban Ficus** details.
    - Click **"Adopt this Plant"**.
    - Fill out the form and submit.
- **Expected**: You receive a success notification.
- **Success**: The dashboard now shows your application with a **Pending** badge.

### 4. Community Engagement

- **Action**: Navigate to the **Feed** ([http://localhost:3001/feed](http://localhost:3001/feed)).
- **Expected**: You see a post from "Admin" welcoming you.
- **Action**: Click the **Like** heart icon.
- **Success**: The like count increments.

---

## 🧹 Post-Test Cleanup

Once you have finished testing, let me know and I will run the **Reset Script** to clear the temporary test data.

> [!TIP]
> Use the **Identify** page to test the AI plant identification by uploading any plant photo!

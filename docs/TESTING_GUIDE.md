# GreenGuard — Comprehensive Testing Guide

This guide outlines a systematic approach to verifying the functionality, security, and performance of the GreenGuard community portal.

---

## 1. Core Testing Strategy

Testing is split into three main layers:
- **Unit Testing**: Testing individual service methods (`api.ts`).
- **Integration Testing**: Verifying the frontend application communicates correctly with the Node.js backend.
- **Manual QA (End-to-End)**: Validating the full user journey across roles (Adopter, NGO, Admin).

---

## 2. Critical User Journeys (CUJs)

### A. The Adopter Journey
*   **Registration/Login**:
    - [ ] Sign up with valid email/password as 'Plant Adopter'.
    - [ ] Login with the newly created account.
    - [ ] Verify profile data (username, display name) load correctly in the Navbar.
*   **Plant Exploration**:
    - [ ] Browse the plant gallery (`/plants`).
    - [ ] Apply filters (Status, Category) and check if the list updates.
    - [ ] View a single plant's detail page (`/plants/[id]`).
*   **Adoption Flow**:
    - [ ] Click 'Adopt' on an available plant.
    - [ ] Submit the adoption questionnaire.
    - [ ] Verify the application appears in 'My Adoptions' with status 'Pending'.
*   **Map Interaction**:
    - [ ] Open the map (`/map`).
    - [ ] Click a pin and verify it shows the correct plant preview.
    - [ ] Verify color-coding: Green (Available), Yellow (Reserved/Pending), Blue (Adopted).

### B. The NGO Journey
*   **NGO Onboarding**:
    - [ ] Register as an 'NGO'.
    - [ ] Complete the onboarding form (Org Name, Website, Logo).
    - [ ] Verify you can't access dashboard features until onboarding is complete.
*   **Plant Listing**:
    - [ ] Create a new plant listing with multiple images.
    - [ ] Set geographical coordinates via the map picker.
    - [ ] Verify the plant appears in the public gallery and the NGO's list of 'Owned Plants'.
*   **Application Management**:
    - [ ] Receive an notification when someone applies for a plant.
    - [ ] View list of applications for owned plants.
    - [ ] Approve/Reject an application and verify the applicant's status updates.
*   **AI Feature**:
    - [ ] Upload a leaf image to the AI Identifier (`/ai-identifier`).
    - [ ] Verify species identification and health analysis results.

### C. The Admin Journey
*   **NGO Approval**:
    - [ ] Review pending NGOs and Approve/Reject them.
    - [ ] Verify status updates on the platform.
*   **Portal Health**:
    - [ ] Check 'Platform Stats' for total plants, users, and adoptions.
    - [ ] Search for a user in 'User Management' and verify 'Ban/Unban' functionality.

---

## 3. Edge Case Matrix

| Feature | Edge Case Scenario | Expected Behavior |
|---------|--------------------|-------------------|
| **Auth** | Login with incorrect password | Error: "Invalid email or password" |
| **Registration** | Register with an existing username | Error: "Username is already taken" |
| **Plant Adoption**| Adopt a plant that is already 'In Adoption' | Button should be disabled or hide form |
| **File Upload** | Upload non-image files (e.g., .exe) | Validation error: "Please upload image files only" |
| **AI ID** | Upload image of a non-plant (e.g., a car) | Handle gracefully: "No plant identified" |
| **Feed** | NGO posts with empty content | Form validation should block submit |

---

## 4. Technical Verification

### Supabase Triggers
> [!IMPORTANT]
> Verify that the recently added **OAuth Sync Trigger** works by manually inserting a user into `auth.users` in the Supabase SQL editor and checking if a corresponding row appears in `public.profiles`.

### PostGIS Queries
- **Spatial Search**: Test the `GET /api/plants/nearby` route with different coordinates. Ensure the results are sorted by distance correctly.

### Security
- **RLS**: Attempt to update a plant profile from an account that *isn't* the owner. Ensure the API returns a `403 Forbidden` or `401 Unauthorized`.
- **JWT**: Verify that modifying the token in `localStorage` blocks access to `/dashboard`.

---

## 5. Recommended Tools

If you want to automate these tests, we recommend:
1. **Playwright** (E2E): Best for testing cross-page navigations and map interactions.
2. **Postman / Insomnia**: For testing backend routes (`POST /api/adoption/apply`, etc.) without the frontend.
3. **Jest**: For unit testing API parsing logic in the `services/` layer.

---

## 6. QA Checklist Template

When releasing new changes, please fill this out:
- [ ] Backend server running? (`npm run dev`)
- [ ] Frontend server running? (`npm run dev`)
- [ ] Supabase connected and migrations applied?
- [ ] Mobile view layout verified?
- [ ] All forms have loading states/success messages?

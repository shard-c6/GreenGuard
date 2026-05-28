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

* **Registration/Login**:
  - [ ] Sign up as 'Plant Adopter'.
  - [ ] Login and verify profile details in the Navbar.
- **NGO Onboarding (Enhanced)**:
  - [ ] Register as an 'NGO'.
  - [ ] Complete the **Premium Onboarding Form**:
    - [ ] Provide **Darpan ID** (Govt. Unique ID).
    - [ ] Submit the detailed **Impact Questionnaire**.
  - [ ] Verify you are redirected to the **Onboarding Status** page.
  - [ ] Verify you cannot access NGO features until an Admin approves your account.
ck if the list updates.
  - [ ] View a single plant's detail page (`/plants/[id]`).
- **Adoption Flow**:
  - [ ] Click 'Adopt' on an available plant.
  - [ ] Submit the adoption questionnaire.
  - [ ] Verify the application appears in 'My Adoptions' with status 'Pending'.
- **Map Interaction**:
  - [ ] Open the map (`/map`).
  - [ ] Click a pin and verify it shows the correct plant preview.
  - [ ] Verify color-coding: Green (Available), Yellow (Reserved/Pending), Blue (Adopted).

### B. The NGO Journey

* **NGO Onboarding**:
  - [ ] Register as an 'NGO'.
  - [ ] Complete the onboarding form (Org Name, Website, Logo).
  - [ ] Verify you can't access dashboard features until onboarding is complete.
- **Plant Listing**:
  - [ ] Create a new plant listing with multiple images.
  - [ ] Set geographical coordinates via the map picker.
  - [ ] Verify the plant appears in the public gallery and the NGO's list of 'Owned Plants'.
- **Application Management**:
  - [ ] Receive an notification when someone applies for a plant.
  - [ ] View list of applications for owned plants.
  - [ ] Approve/Reject an application and verify the applicant's status updates.
- **AI Feature**:
  - [ ] Upload a leaf image to the AI Identifier (`/ai-identifier`).
  - [ ] Verify species identification and health analysis results.

### C. The Admin Journey

* **NGO Verification Portal**:
  - [ ] Go to the **Verification Tab** in the Admin Dashboard.
  - [ ] Review pending NGO applications.
  - [ ] Open the **Verification Modal**:
    - [ ] Inspect Darpan ID and Questionnaire answers.
  - [ ] Approve/Reject the NGO and verify their status updates.
- **Platform Dashboard**:
  - [ ] Verify the **Admin Dashboard** displays accurate stats for:
    - [ ] Total Users, Plants, Adoptions, Posts, and Reports.

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
| **Map** | Tag a post with location | Verify tree-icon appears on Map |

---

## 4. Technical Verification

### Supabase Triggers
>
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

## 7. Dummy Data (Seeding)

To quickly populate the project for testing, use the included seeder:

```bash
# From the backend directory
node scripts/seed.js
```

This will create:

- **Admin**: `admin@greenguard.in` / `@rrm$2026`
- **Approved NGO**: `greenearth@ngo.org` / `Password123!`
- **Sample Adopter**: `test_adopter@gmail.com` / `Password123!`
- 15+ Plants, 5 Adoptions, and 10 Social Posts.

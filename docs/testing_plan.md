# GreenGuard - Comprehensive Testing Plan

This document outlines the testing strategy for the GreenGuard platform, ensuring that all production-level features (NGO verification, plantation mapping, and social loops) function correctly.

## 1. Test Environments
- **Local Dev**: Node.js 20+, Supabase Local (or test project), React 18.
- **Data Status**: Use `backend/scripts/seed.js` to reset the database to a known state before each manual testing session.

## 2. Feature-Specific Test Cases

### A. NGO Verification Pipeline
| Case | Steps | Expected Result |
|:---|:---|:---|
| **Pending NGO UX** | Log in as `rootsofhope@ngo.org` | Dashboard should redirect to `/ngo/onboarding/status` with "Under Review" state. |
| **Admin Dossier Review** | Log in as Admin -> Go to Verification -> View Dossier for "Roots of Hope" | Modal should display Darpan ID, Questionnaire answers, and HQ info. |
| **Action: Reject** | Click Reject -> Enter Reason "Invalid Darpan ID" | NGO should be notified (in DB) and status should stay `/status` with "Needs Attention". |
| **Action: Approve** | Click Approve for a pending NGO | NGO status becomes `approved`. Next login redirects to the main NGO Dashboard. |

### B. Geolocation & Plantation Mapping
| Case | Steps | Expected Result |
|:---|:---|:---|
| **NGO Create Plantation** | Create post as Approved NGO -> Enable "Tag Location" -> Move pin to Central Park | API should store `POINT(lng lat)` in PostGIS and `post_type` as `plantation`. |
| **Map Sync** | Navigate to `/map` | A tree-style marker should appear at Central Park. Popup should show NGO name + Feed link. |
| **User View Impact** | Log in as Adopter -> Click Marker on map | Should see the recent photo of the plantation drive and "See Journey" button. |

### C. Social Feed & Engagement
| Case | Steps | Expected Result |
|:---|:---|:---|
| **Like Toggle** | Click Heart icon on any post | Count increments; state persists on refresh; secondary click decrements. |
| **Image Gallery** | View post with 5 images | Grid should properly display 2x2 layout with "+1" overlay or similar. |
| **Location Badge** | View NGO plantation post in Feed | Should see a "MapPin" icon with the human-readable address. |

## 3. Security & Validation (Manual)
- [ ] **Role Protection**: Try navigating to `/dashboard/admin` as an `adopter`. Should trigger 403 or redirect to Home.
- [ ] **NGO Scope**: Try deleting a plant belonging to another NGO via Postman. Should return `forbidden`.
- [ ] **Input Sanitization**: Enter HTML in the "Mission Statement" during onboarding. Verify it is escaped on rendering.

## 4. Run-Time Verification

### Seeding
Execute the following to reset and populate the test environment:
```bash
cd backend
node scripts/seed.js
```

### Type Checking
Ensure no regressions in the frontend:
```bash
cd frontend
npm run build # Triggers tsc and lint
```

---
**This plan is synchronized with Implementation Plan v1.1.**

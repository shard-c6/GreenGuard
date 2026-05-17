## 📝 Description

Please provide a clear summary of the changes made, the files touched, and the architectural justification.

Related Issue: Fixes # (issue number)

---

## 📂 Type of Change

Please check the options that are relevant:
- [ ] 🐛 Bugfix (non-breaking change which fixes an issue)
- [ ] ✨ New Feature (non-breaking change which adds functionality)
- [ ] ⚡ Performance / Refactoring (non-breaking change improving code speed, cleanliness, or structure)
- [ ] 📜 Documentation (updating guides, logs, or README)
- [ ] 💥 Breaking Change (fix or feature that would cause existing functionality to not work as expected)

---

## 🎨 UI/UX Visual Verification (For Frontend Changes)

> [!IMPORTANT]
> GreenGuard is a premium environmental platform built on state-of-the-art visual standards (Glassmorphism 2.0, Framer Motion, customized dark atmospheres). If your PR affects any visual component:
> 1. **Attach screenshots** of the UI under different screen sizes (mobile-first responsiveness).
> 2. **Attach a short screen recording (GIF/Video)** demonstrating hover effects, micro-animations, or active transitions.

*Insert your media/links here:*
- Before:
- After:

---

## 🧪 Testing and Verification Plan

Please outline how you verified these changes. Include the exact commands run, environment configurations, and manual checks.

### 1. Automated Tests
- Command to run: `npm test` or custom testing scripts
- Verification logs:
```text
// Paste test results or terminal outputs
```

### 2. Manual User Journey Checks
Following the [Adopter Dashboard Testing Guide](TESTING_GUIDE.md), check the boxes of flows you manually ran and verified:
- [ ] **Account Setup**: Registered a new Adopter and verified dashboard empty state.
- [ ] **Plant Discovery**: Verified cards loading with available badges and Leaflet Map coordinates in Pune/IST region.
- [ ] **Adoption Application**: Submitted a plant adoption form and verified dashboard pending status.
- [ ] **Community Engagement**: Liked a post in the community feed and verified the counter increments.

---

## 🔍 Pre-PR Submission Checklist

Before submitting this PR, please check all boxes that apply:
- [ ] **Signed Commits**: My commits are cryptographically signed using GPG or SSH keys as outlined in the [Security Key Setup Guide](docs/SECURITY_KEY_SETUP.md).
- [ ] **Technical Log Updated**: I have documented my changes in the daily progress tracker: [DAILY_LOG.md](DAILY_LOG.md).
- [ ] **Code Quality**: My code follows the repository's vanilla CSS design patterns, Next.js App Router conventions, and contains no debuggers/console logs.
- [ ] **Documentation**: I have updated the relevant project documents (`README.md`, guides, or diagrams) to reflect my changes.
- [ ] **Branch Match**: My branch name follows the naming convention (`feature/`, `bugfix/`, `docs/`, `refactor/`).

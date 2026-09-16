# 🛡️ Security Policy: GreenGuard

We take the security of GreenGuard, our AI botanical models, and our users' geospatial data extremely seriously. If you believe you have found a security vulnerability, we appreciate your help in disclosing it to us responsibly.

---

## 📞 Supported Versions

> [!IMPORTANT]
> GreenGuard is **pre-alpha and not yet in production use**. There is no deployment
> serving real users, and no version currently carries a security-support commitment.
> Do not deploy this for real NGOs or adopters until Phase 2 (Production Hardening)
> is complete — see [AUDIT_AND_ROADMAP.md](./docs/AUDIT_AND_ROADMAP.md).

| Branch | Status | Security fixes |
| :--- | :--- | :--- |
| `main` | Active development | Yes, on a best-effort basis |
| Tagged releases | None yet | — |

We will publish a supported-version policy when the platform reaches production.

---

## 🔒 Reporting a Vulnerability

**Please do not report security vulnerabilities via public GitHub issues.**

If you discover a vulnerability, please report it privately:

1. **Email Us**: Send an encrypted or detailed email to **<shardulchogale1983@gmail.com>** containing the details.
2. **Include Details**:
   - The component affected (e.g. `frontend`, `backend API`, `flora-genius-consultant` AI service, or the Postgres DB).
   - A description of the vulnerability and its potential impact.
   - Detailed step-by-step instructions or proof of concept to reproduce the issue.
   - Any suggested remediations or patches if you have them.

### What to Expect

- **Acknowledgement**: You will receive an email acknowledgement of your report within **24 to 48 hours**.
- **Investigation**: We will investigate and verify the report, keeping you updated on our progress.
- **Remediation**: Once verified, we will work on a patch or configuration fix.
- **Disclosure**: We will coordinate with you to release a security advisory alongside a patched release, giving you full credit for the discovery (unless you prefer to remain anonymous).

---

## 🤖 Automated Security Testing

We run automated security tooling against our own systems. This section records **what we run, against what, and under what authority**, so the scope is unambiguous to contributors and to anyone reviewing our practices.

### Authorization basis

Every target listed below is **owned and operated by the GreenGuard team**: this repository, the Vercel frontend deployment, both Hugging Face Spaces, and the Supabase project. We hold the accounts and we authorize the testing. We do **not** test third-party systems, and we do not test any host we do not control.

Contributors must not point any security tool at infrastructure they do not own. This applies especially to the dynamic tools below, which actively attempt exploitation rather than merely reading code.

### What we run

| Tool | Type | Target | Trigger |
| :--- | :--- | :--- | :--- |
| **CodeQL** | Static analysis | Repository source | Every push and pull request |
| **Secret scan** (`ci.yml`) | Credential literals | Repository source | Every push and pull request — **blocking** |
| **Dependabot** | Dependency CVEs | Manifests and lockfiles | Continuous |
| **[Strix](https://github.com/usestrix/strix)** | Autonomous AI pentesting | Codebase only, for now | Manual dispatch; weekly once enabled |

### Strix scope and limits

Strix runs AI agents that **dynamically execute against a target and validate findings with working proofs-of-concept**. That makes scope discipline essential.

**In scope today — codebase analysis only.** `.github/workflows/security-scan.yml` runs `strix --target ./` against our own source. It writes no data and generates no live traffic.

**Not in scope yet — black-box testing of the deployed application.** Pointing Strix at a running GreenGuard instance is gated on three things, because it will genuinely try to exploit what it finds:

1. Secret rotation, since a leaked key makes the exercise pointless
2. The AI service failing closed on a missing API key, since an autonomous agent will otherwise drive paid Gemini and PlantNet calls against our billing
3. A documented rate-limit baseline

When we do run it against a live instance, we will use a disposable environment with synthetic data, never one holding real NGO or adopter records.

**Operational rules**

- The Strix version is **pinned** in CI. Upstream's `curl | bash` installer executes whatever the URL serves at run time, which we do not accept in an automated pipeline.
- The workflow is **never a required status check**. Security findings need human triage; an agent should not gate merges.
- LLM credentials live in repository secrets and are never committed. The workflow fails fast if they are absent.
- Findings are triaged into issues. We record any finding we consciously accept, with the reason, rather than leaving it silently open.

### Reporting versus scanning

Automated tooling complements but does not replace responsible disclosure. If you find something, please still report it privately using the process above.

---

## 🔑 Hardening Your Local Workspace

We strongly recommend all contributors harden their Git workflows and local terminals when contributing code.

- **Enable Commit Signing**: Ensure all your commits are cryptographically verified. Read our [Security Key & Git Authentication Setup Guide](docs/SECURITY_KEY_SETUP.md) for a step-by-step tutorial on using hardware keys (YubiKeys) or standard SSH keys to securely sign your commits.
- **Environment Secrets**: Never commit `.env` files. Always populate values locally using `.env.example` as a template, and keep production tokens (such as Google Gemini API keys and Supabase SERVICE_ROLE_KEYs) stored in safe cloud secrets managers.

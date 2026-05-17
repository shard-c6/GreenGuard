# 🛡️ Security Policy: GreenGuard

We take the security of GreenGuard, our AI botanical models, and our users' geospatial data extremely seriously. If you believe you have found a security vulnerability, we appreciate your help in disclosing it to us responsibly.

---

## 📞 Supported Versions

We currently actively maintain and support the following versions of GreenGuard:

| Version | Supported          | Release Date |
| ------- | ------------------ | ------------ |
| v1.x    | ✅ Active Support   | May 2026     |
| v0.x    | ❌ End of Life     | Beta Testing |

If you are running an older beta version, please upgrade to the latest production release (`v1.x`) to ensure you have the latest security patches.

---

## 🔒 Reporting a Vulnerability

**Please do not report security vulnerabilities via public GitHub issues.**

If you discover a vulnerability, please report it privately:

1. **Email Us**: Send an encrypted or detailed email to **shardul.chogale@greenguard** containing the details.
2. **Include Details**:
   - The component affected (e.g. `frontend`, `backend API`, `flora-genius-consultant` AI service, or the Postgres DB).
   - A description of the vulnerability and its potential impact.
   - Detailed step-by-step instructions or proof of concept to reproduce the issue.
   - Any suggested remediations or patches if you have them.

### What to Expect:
- **Acknowledgement**: You will receive an email acknowledgement of your report within **24 to 48 hours**.
- **Investigation**: We will investigate and verify the report, keeping you updated on our progress.
- **Remediation**: Once verified, we will work on a patch or configuration fix.
- **Disclosure**: We will coordinate with you to release a security advisory alongside a patched release, giving you full credit for the discovery (unless you prefer to remain anonymous).

---

## 🔑 Hardening Your Local Workspace

We strongly recommend all contributors harden their Git workflows and local terminals when contributing code.

- **Enable Commit Signing**: Ensure all your commits are cryptographically verified. Read our [Security Key & Git Authentication Setup Guide](docs/SECURITY_KEY_SETUP.md) for a step-by-step tutorial on using hardware keys (YubiKeys) or standard SSH keys to securely sign your commits.
- **Environment Secrets**: Never commit `.env` files. Always populate values locally using `.env.example` as a template, and keep production tokens (such as Google Gemini API keys and Supabase SERVICE_ROLE_KEYs) stored in safe cloud secrets managers.

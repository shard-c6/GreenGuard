# 🔒 GitHub Security Key & Git Authentication Setup Guide

This guide details how to secure your Git authentication and commit integrity for the **GreenGuard** repository on macOS using hardware security keys, secure SSH protocols, and cryptographic commit signing.

---

## 🧭 Overview

Securing your repository interaction prevents unauthorized code execution and ensures your identity is verified. We will cover:
1. **GitHub account 2FA Setup** using a physical security key (YubiKey/Titan) or Touch ID.
2. **Secure SSH Git Authentication** using modern hardware-backed keys (`ed25519-sk`) or standard secure keys.
3. **Cryptographic Commit Signing** so your commits display the verified badge on GitHub.

---

## 🔑 Phase 1: Setup GitHub Account 2FA (Physical Security Key / Passkey)

GitHub supports FIDO2 WebAuthn security keys (like YubiKey, Titan Security Key, or macOS Touch ID) as 2FA factors.

### Step-by-step:
1. Go to [GitHub Settings -> Password and authentication](https://github.com/settings/security).
2. Under **Two-factor authentication**, click **Enable two-factor authentication** (or **Manage** if already enabled).
3. Under **Security keys / passkeys**, click **Add a security key**.
4. Choose a name (e.g., "YubiKey 5C" or "MacBook Touch ID").
5. When prompted by your browser, tap your physical key or touch your MacBook's Touch ID sensor.
6. Save your recovery codes in a secure vault.

---

## 💻 Phase 2: Secure SSH Authentication

Using SSH keys instead of HTTPS with personal access tokens is highly secure and convenient. We highly recommend generating a **hardware-backed SSH key** if you have a FIDO2 key, or a high-strength **Ed25519** key as a standard practice.

### Option A: Hardware-Backed SSH Key (`ed25519-sk`)
*Requires a FIDO2-compliant security key (e.g., YubiKey 5 series) plugged into your Mac.*

1. Open your terminal and run:
   ```bash
   ssh-keygen -t ed25519-sk -O resident -C "shardul.chogale@greenguard"
   ```
   > [!NOTE]
   > The `-O resident` flag ensures the key is stored directly on the physical security key, allowing you to easily import it on another computer using `ssh-add -K`.

2. Tap your physical security key when the light flashes.
3. If prompted, enter a secure PIN for your key.

---

### Option B: High-Strength Standard SSH Key (`ed25519`)
*If you do not have a physical USB/NFC security key, Touch ID or a local software key is excellent.*

1. Open your terminal and run:
   ```bash
   ssh-keygen -t ed25519 -C "shardul.chogale@greenguard"
   ```
2. Press Enter to accept the default file location (`~/.ssh/id_ed25519`).
3. Enter a strong, memorable passphrase.

---

### Step 3: Configure your SSH Agent on macOS
To prevent having to enter your passphrase/PIN every time, configure the macOS keychain:

1. Open or create your SSH config file:
   ```bash
   nano ~/.ssh/config
   ```
2. Paste the following configuration:
   ```text
   Host github.com
     AddKeysToAgent yes
     UseKeychain yes
     IdentityFile ~/.ssh/id_ed25519
     # Uncomment the line below if using a hardware security key instead
     # IdentityFile ~/.ssh/id_ed25519_sk
   ```
3. Save and close (Press `Ctrl+O`, `Enter`, then `Ctrl+X`).
4. Add the key to your local agent:
   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519
   ```

---

### Step 4: Add the SSH Key to your GitHub Account
1. Copy your public key to the clipboard:
   - For standard: `pbcopy < ~/.ssh/id_ed25519.pub`
   - For hardware key: `pbcopy < ~/.ssh/id_ed25519_sk.pub`
2. Navigate to [GitHub SSH and GPG Keys settings](https://github.com/settings/keys).
3. Click **New SSH key**.
4. Set Title (e.g., "macOS MacBook Pro" or "YubiKey Hardware SSH").
5. Select **Key type** as **Authentication Key**.
6. Paste your key in the **Key** field and click **Add SSH key**.

---

### Step 5: Switch your Local Repository Remote from HTTPS to SSH
Configure your local GreenGuard repo to use the secure SSH remote:

1. In the root of your repo, check the current remote:
   ```bash
   git remote -v
   ```
2. Change the origin remote to the SSH protocol:
   ```bash
   git remote set-url origin git@github.com:shard-c6/greeguard_complete.git
   ```
3. Test your SSH connection to GitHub:
   ```bash
   ssh -T git@github.com
   ```
   *Expected Output: `Hi shard-c6! You've successfully authenticated, but GitHub does not provide shell access.`*

---

## 🔏 Phase 3: Cryptographic Commit Signing

Showing a verified badge on your commits ensures that no one can spoof your name/email in Git. We can use your **SSH key** to sign commits directly (supported natively in Git 2.34+).

### Step 1: Configure Git to use SSH for Signing
1. Set the signing format to SSH:
   ```bash
   git config --global gpg.format ssh
   ```

2. Point Git to your public signing key:
   - For standard SSH key:
     ```bash
     git config --global user.signingkey ~/.ssh/id_ed25519.pub
     ```
   - For hardware-backed SSH key:
     ```bash
     git config --global user.signingkey ~/.ssh/id_ed25519_sk.pub
     ```

3. Enable global signing:
   ```bash
   git config --global commit.gpgsign true
   ```

### Step 2: Add your Signing Key to GitHub
1. Copy the public key again (e.g. `pbcopy < ~/.ssh/id_ed25519.pub`).
2. Go back to [GitHub SSH and GPG Keys settings](https://github.com/settings/keys).
3. Click **New SSH key**.
4. Set Title (e.g., "Signing Key - Standard SSH").
5. Select **Key type** as **Signing Key** (CRITICAL: Select Signing Key!).
6. Paste the key and click **Add SSH key**.

### Step 3: Verify Your First Signed Commit!
1. Make a small edit or commit a change:
   ```bash
   git commit -am "docs: updated security setup parameters"
   ```
2. View the local signature details:
   ```bash
   git log --show-signature -1
   ```
3. When pushed, GitHub will display the beautiful green **"Verified"** badge beside your name in the commit history!

---

## 🛟 Troubleshooting & Reference

- **Error: `key enrollment failed: device not found`**: Ensure your physical security key is plugged in firmly, or that macOS permissions allow browser/terminal hardware access.
- **Error: `Permission denied (publickey)`**: Verify that your public key is added on GitHub correctly, and that your `~/.ssh/config` lists the exact private key under `IdentityFile`.
- **Passphrase Prompt Every Time**: Make sure you have added `UseKeychain yes` and `AddKeysToAgent yes` to your `~/.ssh/config` file and run `ssh-add` with the `--apple-use-keychain` flag.

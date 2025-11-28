# K2Lin Crypto MKIII

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Electron%20%7C%20Web-lightgrey.svg)
![Version](https://img.shields.io/badge/version-0.3.2-green.svg)

**Secure Communication & Digital Camouflage System**

K2Lin Crypto MKIII is a modern, sci-fi themed cryptographic utility designed for secure messaging and data concealment. Built with a "Cyberpunk" aesthetic, it combines military-grade encryption with advanced steganography tools to protect your digital footprint.

Whether you are a privacy enthusiast, a developer, or an agent in the field, this tool provides the necessary countermeasures to keep your communications secure.

---

## 🚀 Key Features

*   **🛡️ Hybrid Vault**: seamless switching between **Symmetric (AES-256-GCM)** for personal storage and **Asymmetric (X25519 + AES-GCM)** for secure peer-to-peer communication.
*   **🪪 Digital Identity**: Generate unique, cryptographically secure Identity Cards to verify contacts and exchange public keys without exposing secrets.
*   **🖼️ Mimic Panel (Steganography)**: Hide encrypted payloads inside innocuous images using **LSB (Least Significant Bit)** encoding.
*   **🎭 NLP Camouflage**: Transform ciphertext into natural-looking text (Markov Chains) to evade heuristic scanning.
*   **🚨 Panic Mode**: A stealth "Genshin Impact" launcher disguise to quickly hide the application's true purpose in compromised environments.
*   **🌍 Cross-Platform**: Runs as a native Desktop application (Windows/macOS/Linux) or as a secure Web App.

---

## 📖 User Manual

### 1. The Vault (Encryption & Decryption)
The Vault is the core of the operation. It supports two modes:

*   **Symmetric (AES-256-GCM)**:
    *   **Best for**: Encrypting files for yourself or sharing with someone via a pre-agreed password.
    *   **Usage**:
        1.  Select **Symmetric (AES)**.
        2.  Enter a strong **Session Key** (Password).
        3.  Enter your message or drop a file.
        4.  Click **Encrypt**.
        5.  The output can be copied as Base64, Hex, or camouflaged text.
        6.  To **Decrypt**, simply paste the encrypted data and enter the same password.

*   **Asymmetric (X25519 / ECC)**:
    *   **Best for**: Sending messages to a specific person without sharing a password.
    *   **Usage**:
        1.  Select **Asymmetric (ECC)**.
        2.  **Target Recipient**: Choose a verified contact from your list (see Identity below).
        3.  Enter message and **Encrypt**.
        4.  Only the recipient (using their private key) can decrypt this message.

### 2. Digital Identity
To use Asymmetric encryption, you must first establish an identity.

*   **Generate**: Go to the **Identity** tab and click **Generate Identity**. This creates a local X25519 Keypair.
*   **Export**: Click **Download Card** to save your public identity as a PNG image. Share this image with friends!
*   **Import**: When you receive a friend's card, click **Import Card**. They will be added to your "Known Associates" wallet. You can now send them encrypted messages.

### 3. Mimic Panel (LSB Steganography)
Hide your encrypted data inside images.

*   **Embedding**:
    1.  Encrypt your data in the Vault first.
    2.  Go to **Mimic**.
    3.  Upload a carrier image (PNG, JPG, WebP).
    4.  Click **Embed Encrypted Data** (it pulls automatically from the Vault).
    5.  **Download Stego Image**.
    *   **⚠️ IMPORTANT**: Always save and share the image as a **PNG**. Services like Facebook, WhatsApp, or Twitter compress images, which destroys the hidden data. Use email, Signal (as file), or zip archives.

*   **Extraction**:
    1.  Upload a suspicious image to the Mimic panel.
    2.  If data is found, it will extract automatically.
    3.  Go back to the **Vault** to decrypt the payload.

### 4. Panic Mode
For situations where you need to hide the app instantly.

*   **Trigger**: Click the **Panic** button in the header.
*   **Effect**: The app transforms into a generic game launcher (styled like Genshin Impact).
*   **Exit**: Click "Privacy Policy" (or the hidden trigger area) and enter your PIN (default is usually blank or configured in Settings).

---

## 👨‍💻 Developer Guide

### Prerequisites
*   **Node.js**: v18 or higher recommended.
*   **npm**: Included with Node.js.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/k2lin-crypto3.git
    cd k2lin-crypto3
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```
    *Note: If you encounter issues with `sharp` (used for image processing), ensure you have the necessary build tools for your platform.*

### Development

Run the development server. This starts both the Electron main process and the React renderer with Hot Module Replacement (HMR).

```bash
npm run dev
```

### Building

The project uses `electron-builder` for desktop and `vite` for web.

*   **Windows**:
    ```bash
    npm run build:win
    ```
    Output is located in `dist/`.

*   **Web (Static/Vercel)**:
    The web build is optimized for Vercel but can be hosted anywhere.
    ```bash
    npm run build
    # The output 'out/renderer' can be served statically.
    ```

*   **Type Check**:
    Enforce TypeScript strictness before building.
    ```bash
    npm run typecheck
    ```

---

## 🛠️ Tech Stack

*   **Core**: [Electron](https://www.electronjs.org/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) (Animations)
*   **Encryption**:
    *   **AES-256-GCM**: Native Node `crypto` (Desktop) / Web Crypto API (Web).
    *   **X25519 (ECDH)**: Key exchange for asymmetric encryption.
    *   **Scrypt**: Key derivation.
*   **Steganography**:
    *   **Sharp**: High-performance image processing (Desktop).
    *   **Canvas API**: Pixel manipulation fallback (Web).
*   **State Management**: React Context + `electron-store` (Desktop) / `localStorage` (Web).

---

## 📜 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

**K2Lin Crypto MKIII** © 2024

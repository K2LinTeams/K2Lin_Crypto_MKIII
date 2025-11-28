# User Manual

This manual provides a comprehensive guide to using the features of K2Lin Crypto MKIII.

> **[PRTS System Log]:**
> Access Level: **Level 2 (Authorized Personnel Only)**
> System Module: **Standard Operations**
> Status: **Online**

## 1. The Vault (Crypt)

The Vault is the primary interface for encryption and decryption. It supports two modes of operation tailored for different use cases.

### Symmetric Encryption (AES-GCM)
**Best for**: Storing personal secrets or sharing files with a trusted party using a shared password.

1.  **Select Mode**: Click the **Symmetric (AES)** tab.
2.  **Set Password**: Enter a strong password in the "Session Key" field.
    > **[Warfarin's Medical Note]:** Do not use weak keys like "123456". If the key is lost, the data is lost forever. Even PRTS cannot recover data from the void.
3.  **Input Data**:
    *   **Text**: Type or paste your message into the input area.
    *   **File**: Drag and drop a file into the input area.
4.  **Encrypt**: Click the **Encrypt** button.
    *   The encrypted output will appear in the output area.
    *   You can copy the result as Base64 string.
5.  **Decrypt**:
    *   Paste the encrypted Base64 string into the input area.
    *   Ensure the correct password is entered.
    *   Click **Decrypt**.

### Asymmetric Encryption (ECC / X25519)
**Best for**: Sending secure messages to a specific contact without sharing a password beforehand.

1.  **Prerequisite**: You must have the recipient's **Identity Card** imported (see Section 2).
2.  **Select Mode**: Click the **Asymmetric (ECC)** tab.
3.  **Select Recipient**: Choose the contact from the dropdown menu.
4.  **Input Message**: Type your message.
5.  **Encrypt**: Click **Encrypt**.
    *   The system generates a one-time ephemeral key to encrypt the message tailored specifically for the recipient's private key.
    *   Only the holder of the corresponding Private Key can decrypt this.

---

## 2. Identity System

The Identity system allows you to verify contacts and exchange keys securely.

### Generating an Identity
1.  Navigate to the **Identity** panel.
2.  Click **Generate New Identity**.
3.  The system will create a new X25519 Keypair.
    *   **Private Key**: Stored securely in your local browser storage.
    *   **Public Key**: Can be shared freely.

    > **[PRTS ALERT]:** **Do NOT share your Private Key.** Treat it like a connection to the Originium network—exposure leads to catastrophic compromise.

4.  Your **Identity ID** (e.g., `1234 5678 9012`) is derived mathematically from your public key.

### Exporting Your Card
1.  Click **Download Identity Card**.
2.  This saves a PNG image containing your public key and ID.
3.  Send this image to your friends via email, chat, etc.

### Importing a Contact
1.  Receive an Identity Card (PNG) from a friend.
2.  Click **Import Contact** in the Identity panel.
3.  Select the image file.
4.  The contact is verified and added to your "Known Associates" wallet stack.

---

## 3. Mimic Panel (Steganography)

The Mimic panel allows you to hide encrypted data inside innocent-looking images.

### Embedding Data
1.  **Encrypt First**: Perform an encryption operation in the **Vault**. The result is automatically staged for embedding.
2.  **Go to Mimic**: Switch to the Mimic panel.
3.  **Upload Carrier**: Upload a standard image (PNG, JPG, WebP). This will be the "cover" image.
4.  **Embed**: Click **Embed Encrypted Data**.
    *   The app modifies the Least Significant Bits (LSB) of the image pixels to store your data.
5.  **Download**: Click **Download Stego Image**.
    > **[Closure's Workshop Tip]:** Always export as **PNG**. Other formats like JPG are "lossy"—they crush the hidden data like Originium slugs under a compactor.
    >
    > *Transmission via WhatsApp/WeChat will also sanitize the file. Use email or zip archives.*

### Extracting Data
1.  **Upload**: Upload a suspicious image to the Mimic panel.
2.  **Scan**: The system automatically scans for the hidden header.
3.  **Result**: If data is found, it is extracted and sent back to the **Vault** for decryption.

---

## 4. Panic Mode

Designed for emergency privacy.

*   **Trigger**: Click the **Panic** button (usually an exclamation mark icon) in the header.
*   **Behavior**: The entire application UI is instantly replaced by a fake "Game Launcher" screen (styled like Genshin Impact).
*   **Restoration**:
    *   Click the hidden trigger area (often the "Privacy Policy" link).
    *   Enter your PIN (if configured in Settings).
    *   The app restores to its previous state.

> **[PRTS LOG]:** Camouflage protocols disengaged. Welcome back, Doctor.

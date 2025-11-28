# Technical Specifications

This document outlines the cryptographic primitives and security architecture of K2Lin Crypto MKIII.

> **[PRTS System Log]:**
> Subject: **Source Code Analysis**
> Clearance: **Level 3 (Administrator)**

## 1. Cryptography

### Symmetric Encryption
*   **Algorithm**: AES-256-GCM (Galois/Counter Mode).
*   **Key Derivation**: `scrypt`.
    *   Parameters: `N=16384`, `r=8`, `p=1`.
    *   Salt Length: 16 bytes.
*   **IV (Initialization Vector)**: 12 bytes (96 bits), randomly generated per encryption.
*   **Tag Length**: 128 bits (16 bytes).

### Asymmetric Encryption
*   **Algorithm**: Hybrid Encryption Scheme (ECC + AES).
*   **Key Exchange**: X25519 (Curve25519 for ECDH).
*   **Payload Encryption**: AES-256-GCM.
    *   An ephemeral X25519 key pair is generated for each message.
    *   Shared secret is derived using ECDH.
    *   The message is encrypted with this shared secret.
    *   The ephemeral public key is attached to the payload.

> **[Dr. Kal'tsit's Note]:** We chose X25519 over RSA for its superior performance and smaller key size, reducing the computational load on mobile terminal devices.

### Identity Generation
*   **ID Format**: 12-digit numeric string (e.g., `0000 0000 0000`).
*   **Derivation**:
    1.  SHA-256 hash of the Public Key (SPKI format).
    2.  Convert hash to BigInt.
    3.  Modulo $10^{12}$.

---

## 2. Steganography

### Least Significant Bit (LSB)
*   **Method**: Sequential LSB replacement.
*   **Channels**: R, G, B channels are used; Alpha channel is preserved to maintain transparency.
*   **Capacity**: Approx. 3 bits per pixel (1 bit per channel).

### Obfuscation Layer
To prevent simple statistical detection, the raw payload is XOR-masked before embedding.

*   **Mask Key**: `0x7A, 0x21, 0x9F, 0x4D` (Cyclic 4-byte key).
*   **Header**: Custom `C3` signature header (`0x43, 0x33`) used for format verification.

> **[PRTS WARNING]:** This obfuscation is **NOT** encryption. It effectively hides the data from automated scanners, but a determined adversary with deep-dive analysis capabilities could uncover the pattern. Always encrypt data before embedding.

---

## 3. NLP Camouflage (Mimic)

*   **Algorithm**: Markov Chain Text Generation.
*   **Corpus**: Pre-loaded linguistic datasets (English/Chinese).
*   **Encoding**: High-entropy mapping of ciphertext bytes to natural language tokens.

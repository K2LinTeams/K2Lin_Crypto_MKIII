# K2Lin Crypto MKIII

A desktop application for cryptographic utilities, built with Electron, React, and TypeScript.

---

## About The Project

This project is a desktop application created using the Electron framework. The user interface is built with React and TypeScript, providing a modern and type-safe development experience. The name suggests it's intended for cryptographic-related tasks, potentially leveraging high-performance backend modules.

### Tech Stack

*   [Electron](https://www.electronjs.org/)
*   [React](https://reactjs.org/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Node.js](https://nodejs.org/)
*   [Rust](https://www.rust-lang.org/) (for core/backend components)

---

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have Node.js and npm installed on your system.
*   **Node.js** (which includes npm)
    ```sh
    # You can check your version with:
    node -v
    npm -v
    ```
*   **Rust Toolchain**
    ```sh
    # You can check your version with:
    rustc --version
    ```

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your_username/K2Lin_Crypto_MKIII.git
    ```
2.  Install NPM packages:
    ```bash
    npm install
    ```

## Development

To run the application in development mode with hot-reloading, use the following command:

```bash
$ npm run dev
```

## Building for Production

You can build the application for different platforms using the scripts below.

```bash
# For Windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

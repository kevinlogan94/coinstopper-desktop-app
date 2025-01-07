# Coin Stopper

**Coin Stopper** is a desktop application that empowers users to configure profiles, monitor Coinbase, and automate buy/sell decisions using a custom algorithm. Designed for local operation, all configurations and data remain securely on your machine.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Scripts](#scripts)
6. [Configuration](#configuration)


---

## Features

- **Profile Management**: Configure multiple trading profiles with specific strategies.
- **Coinbase Integration**: Securely connect and trade using your Coinbase account.
- **Custom Algorithm**: Automate trading decisions based on custom parameters.
- **Local-Only Storage**: All data is stored locally for enhanced privacy.
- **Real-Time Monitoring**: Stay updated with market changes and trading actions.

---

## Tech Stack

- **Frontend**: Vue.js with TypeScript
- **Electron (with Electron Forge)**: For creating a cross-platform desktop application
- **Backend**: None (local operations only)
- **API Integration**: Coinbase API
- **Build Tool**: Vite
- **Linting**: ESLint (configured for TypeScript and JavaScript)
- **Packaging**: Electron Forge (with support for Squirrel, ZIP, and DEB/RPM makers)
- **Charting Library**: Chart.js (used for visual data representation)

---

## Installation

### Prerequisites
- **Node.js** (latest stable version recommended)
- **npm** or **yarn**
- **Coinbase API Credentials**

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/coin-stopper.git
   ```
2. Navigate to the project directory:
   ```bash
   cd coin-stopper
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the application in development mode:
   ```bash
   npm start
   ```

---

## Usage

1. Launch the application:
   ```bash
   npm start
   ```
2. Connect your Coinbase account using your API credentials.
3. Set up and configure trading profiles.
4. Enable the algorithm to monitor and execute trades.

To package the app for local use:
```bash
npm run package
```

To create a production-ready distributable:
```bash
npm run make
```

---

## Scripts

Here are the available npm commands:

| Command             | Description                                                                 |
|---------------------|-----------------------------------------------------------------------------|
| `npm start`         | Launches the application in development mode using Electron Forge.         |
| `npm run package`   | Packages the app for local use (e.g., testing).                            |
| `npm run make`      | Creates production-ready distributables for all configured platforms.      |
| `npm run publish`   | Publishes the app to distribution channels (if configured).                |
| `npm run lint`      | Runs lint checks to ensure code quality.                                   |

---

## Configuration

- **Profiles**: Configure preferences like coin pairs, thresholds, and algorithms.
- **Local Storage**: All user data is securely stored in the application’s data directory.
- **Coinbase Credentials**: Ensure your API key and secret are correctly set up during the configuration process.

---

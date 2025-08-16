# Coin Stopper

**Coin Stopper** is a powerful, local-first desktop application designed to automate your cryptocurrency trading on Coinbase using a grid trading strategy. It allows you to create custom trading profiles, monitor the market in real-time, and have buys/sells executed automatically from the security of your own machine.

---

## Features

- **Profile Management**: Create and manage multiple trading profiles with unique strategies.
- **Secure Coinbase Integration**: Connect your Coinbase account via API keys to execute trades securely.
- **Trading Algorithm**: Automate trading using a built-in grid strategy algorithm. You control its behavior by defining the grid levels, investment amounts, and other custom parameters.
- **Local-First Privacy**: All your configuration, API keys, and trading data are stored locally on your machine. Nothing is sent to the cloud.
- **Real-Time Monitoring**: Keep an eye on market changes and your portfolio's performance with a clean, intuitive dashboard.
- **Portfolio Tracking**: Keep a ledger of your transactions and track your assets over time.

---

## Tech Stack

- **Framework**: [Electron](https://www.electronjs.org/) (with Electron Forge)
- **Frontend**: [Vue.js](https://vuejs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [PrimeVue](https://primevue.org/)
- **Charting**: [Chart.js](https://www.chartjs.org/)
- **API Integration**: [Coinbase API](https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_auth)
- **Build Tool**: [Vite](https://vitejs.dev/)

---

## Getting Started

Follow these instructions to get the application up and running on your local machine.

### Prerequisites

- **Node.js**: v18.x or later
- **npm**: v8.x or later
- **Coinbase API Credentials** (API Key and Secret)

### Installation & Launch

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/coin-stopper.git
    cd coin-stopper
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the application in development mode:**
    ```bash
    npm start
    ```

---

## Available Scripts

The project includes several scripts to help with development and distribution:

| Command         | Description                                                 |
| --------------- | ----------------------------------------------------------- |
| `npm start`     | Starts the application in development mode with hot-reloading. |
| `npm run package` | Packages the application for your current OS without creating an installer. |
| `npm run make`  | Builds and bundles the application into a distributable installer. |
| `npm run lint`  | Lints the codebase to check for errors and style issues.    |

---

## Configuration

- **Profiles**: Set up your trading strategies by defining coin pairs, buy/sell thresholds, and other algorithmic parameters within the app.
- **API Keys**: Your Coinbase API credentials are required to connect your account. These are stored securely on your local machine.
- **Data Storage**: All application data, including logs and transaction history, is stored in the user data directory on your computer.

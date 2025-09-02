# 🚀 CryptoPulse

CryptoPulse is a **frontend React app** that helps users track cryptocurrency markets, set price alerts, and personalize their dashboard.  
It uses the **CoinGecko API** for live market data and provides a clean, responsive UI built with React + Tailwind CSS.

---

## ✨ Features

- 📊 **Dashboard**
  - Live prices and percentage changes
  - Interactive charts with time range selection (24h, 7d, 30d)
  - Watchlist to save your favorite coins
  - Sortable & paginated markets table

- 🔔 **Alerts**
  - Create alerts when a coin goes **above** or **below** a target price
  - Alerts are stored locally in your browser
  - Triggered alerts get a timestamp

- ⚙️ **Settings**
  - Choose preferred currency (USD, EUR, GBP, NGN)
  - Light/Dark mode
  - Default coin & chart range
  - Toggle chart options (grid, smooth line)
  - Compact / comfortable UI density
  - Reset app data

- 📱 **Responsive**
  - Works smoothly on desktop & mobile
  - Mobile-friendly navigation menu

---

## 🛠️ Tech Stack

- **Frontend:** React + Vite + Tailwind CSS  
- **State Management:** Custom hooks + localStorage  
- **Data:** [CoinGecko API](https://www.coingecko.com/en/api)

---

## ⚡ Getting Started

Make sure you have **Node.js** (v16 or later) and **npm** installed.

```bash
# 1. Clone the repo
git clone https://github.com/your-username/cryptopulse.git
cd cryptopulse

# 2. Install dependencies
npm install

# 3. Run the app
npm run dev
## Project structure
src/
  components/   # Shared UI components (Button, Card, Navbar, etc.)
  pages/        # Dashboard, Alerts, Settings
  services/     # API helpers (coingecko.js, price.js)
  store/        # Custom hooks (useAuth, useAlerts, useLocal, useWatchlist)

  Notes
	•	This project is frontend only — no backend is required.
	•	Alerts, settings, and watchlist are saved in localStorage.
	•	Market data is fetched from CoinGecko and may be limited by rate limits.

⸻

 Built for Hackathon

This project was built as part of a Frontend Hackathon challenge.
It demonstrates clean UI, live API integration, and responsive design.
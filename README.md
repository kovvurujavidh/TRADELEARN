<div align="center">

# 📊 TradeLearn

### Your All-in-One Trading Journal & Learning Hub

A clean, modern web app to **log every trade**, **capture lessons**, and **build winning strategies** — all backed by a centralized **SQL Database** connecting your lapop, tablet, and mobile devices in real-time.

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](#)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](#)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](#)
[![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](#)
[![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](#)

</div>

---

## ✨ Features

### 💻 Full-Stack Architecture
| Feature | Description |
|---------|-------------|
| **Central Database** | Powered by SQLite (local) or PostgreSQL (cloud). No more lost data in browser storage! |
| **Multi-Device Sync** | Connect your Laptop and Mobile phone simultaneously on the same local network (Wi-Fi) |
| **REST API** | Full Express API handling thousands of trades and embedded photo uploads seamlessly |
| **Live Server Status** | Clean `🟢 DB Connected` header badge monitoring the live health payload in real-time |

### 📈 Record Trade Tab
| Feature | Description |
|---------|-------------|
| **Smart Form** | Log 15M Bias, Liquidity, Sweep, MSS, Displacement, Entry, SL, TP, Result |
| **Photo Upload** | Drag & drop up to 5 screenshots per trade (auto-compressed on front-end to save DB space) |
| **Notes & Description** | Write detailed notes about your setup |
| **Live Stats** | Total trades, Win/Loss count, Win Rate, Current Streak |
| **Breakdown Charts** | Visual bars for Bias, Liquidity, Sweep, MSS, Displacement |
| **Trade History** | Search, filter (Bull/Bear/Win/Loss/SSL/BSL), and sort |
| **Export/Import** | Full CSV parsing & exporting functionality + Master JSON bulk DB Backup |

### 📚 Learn Tab
| Feature | Description |
|---------|-------------|
| **Multiple Strategies** | Create, edit, and delete unlimited strategy cards |
| **Strategy Editor** | Full-screen modal to write your trading rules |
| **Learning Entries** | Save Patterns, Concepts, Mistakes, Wins, and Notes |
| **Key Rules** | Dedicated field for takeaways and rules to remember |
| **Category Filters** | Filter by Pattern / Concept / Mistake / Win / Note |

### 🎨 Design
- **Dark / Light Theme** — toggle with one click
- **Fully Responsive** — works beautifully on desktop, tablet, and mobile
- **Pastel Purple + Steel Blue** — calming, professional color scheme
- **Keyboard Shortcuts** — Escape to close modals, Arrow keys for lightbox

---

## 🚀 Quick Start (Local Setup)

The absolute easiest way to run the application perfectly synced between your computer and your phone.

### Prerequisites:
- Install [Node.js](https://nodejs.org/en)

```bash
# Clone the repository
git clone https://github.com/kovvurujavidh/TRADELEARN.git
cd TRADELEARN

# Install backend dependencies
npm install

# Start the server (Defaults to Port 3000 and SQLite Database)
npm start
```

### Accessing the App:

- **From your Desktop/Laptop**: Open your browser and go to `http://localhost:3000`
- **From your Mobile Phone**: 
  1. Ensure your phone and computer are on the **same Wi-Fi network**.
  2. The terminal will print out your computer's local network IP address (e.g. `http://192.168.1.5:3000`).
  3. Enter that exact URL into your phone's browser (Safari or Chrome).
  4. Both devices are now using the identical database! Changes made on one instantly appear on the other.

---

## 🌍 Deploying to the Cloud

If you want the app accessible from anywhere in the world (without keeping your computer running), you can deploy this full-stack app for free or cheap.

### Platforms

The repository is deployment-ready for **Railway**, **Render**, **Fly.io**, or **Heroku**. 
1. Create a Web Service/App on any provider.
2. Link your GitHub repository.
3. **Important Configuration:** Under Environment Variables in your hosting dashboard, add:
   ```
   DATABASE_URL=postgres://your_database_connection_url_here
   ```
4. The backend server automatically detects the `DATABASE_URL` and seamlessly switches from SQLite to PostgreSQL! Tables will auto-initialize on first run.

---

## 🛠️ Tech Stack

| Technology | Usage |
|-----------|-------|
| **Node.js + Express** | High-performance backend routing & REST API (`server.js`) |
| **SQLite + pg** | Database Abstraction Layer supporting 0-setup local DB and powerful production PG |
| **HTML5** | Semantic structure, forms, modals |
| **CSS3** | CSS Variables, Grid, Flexbox, Animations |
| **Vanilla JS** | Zero dependencies, pure frontend JavaScript performing asynchronous fetch calls |

---

## 📁 Project Structure

```
TRADELEARN/
├── package.json   # Node configurations and dependencies
├── server.js      # Express server handling routes and static files
├── db.js          # SQLite / PostgreSQL DB connection logic
├── data/          # (Auto-generated folder) local SQLite databases
├── index.html     # Main Single Page Application interface
├── style.css      # Component and layout styling
├── script.js      # Client-side API fetch logic and DOM manipulation
└── README.md      # This file
```

---

## 💻 Full DB Backup & Restore

Since everything is stored in an SQL database, keeping your data secure is easy:
1. Click **💾 Download Backup (.json)** in the UI to perform a complete DB export.
2. Store this `.json` file anywhere.
3. If you move from a local SQLite setup to a cloud Postgres deployed app, just open the new app, click **📂 Restore Backup**, drag the `.json` file in, and your full history will instantly populate across the new SQL tables.

---

## 📝 License

MIT License - feel free to use, modify, and distribute.

---

<div align="center">

**Built with ❤️ for traders who learn from every trade, now supercharged with SQL!**

</div>

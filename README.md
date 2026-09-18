<div align="center">

# 📊 TradeLearn

### Your All-in-One Trading Journal & Learning Hub

A clean, modern web app to **log every trade**, **capture lessons**, and **build winning strategies** — all stored locally in your browser.

[![Netlify Status](https://img.shields.io/badge/deployed-netlify-brightgreen?style=for-the-badge&logo=netlify)](https://app.netlify.com)
[![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](#)
[![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](#)

</div>

---

## ✨ Features

### 📈 Record Trade Tab
| Feature | Description |
|---------|-------------|
| **Smart Form** | Log 15M Bias, Liquidity, Sweep, MSS, Displacement, Entry, SL, TP, Result |
| **Photo Upload** | Drag & drop up to 5 screenshots per trade (auto-compressed) |
| **Notes & Description** | Write detailed notes about your setup |
| **Live Stats** | Total trades, Win/Loss count, Win Rate, Current Streak |
| **Breakdown Charts** | Visual bars for Bias, Liquidity, Sweep, MSS, Displacement |
| **View Trade** | Full-screen modal with complete trade analysis |
| **Trade History** | Search, filter (Bull/Bear/Win/Loss/SSL/BSL), and sort |
| **Export** | CSV, Excel (.xls), and Import from CSV |

### 📚 Learn Tab
| Feature | Description |
|---------|-------------|
| **Multiple Strategies** | Create, edit, and delete unlimited strategy cards |
| **Strategy Editor** | Full-screen modal to write your trading rules |
| **Learning Entries** | Save Patterns, Concepts, Mistakes, Wins, and Notes |
| **Key Rules** | Dedicated field for takeaways and rules to remember |
| **Photo Attachments** | Screenshot your charts and setups |
| **View Learning** | Full-screen modal with complete learning details |
| **Category Filters** | Filter by Pattern / Concept / Mistake / Win / Note |
| **Export** | CSV export for all learnings |

### 🎨 Design
- **Dark / Light Theme** — toggle with one click
- **Fully Responsive** — works beautifully on desktop, tablet, and mobile
- **Pastel Purple + Steel Blue** — calming, professional color scheme
- **Keyboard Shortcuts** — Escape to close modals, Arrow keys for lightbox

---

## 📸 Screenshots

<div align="center">

| Desktop - Trade Tab | Desktop - Learn Tab |
|:---:|:---:|
| *Stats + Form + History* | *Strategies + Learnings* |

| Mobile View | View Modal |
|:---:|:---:|
| *Compact mobile cards* | *Full trade analysis* |

</div>

---

## 🚀 Quick Start

### Option 1: Run Locally
```bash
# Clone the repo
git clone https://github.com/kovvurujavidh/TRADELEARN.git

# Open in browser
cd TRADELEARN
open index.html    # macOS
start index.html   # Windows
xdg-open index.html # Linux
```

### Option 2: Deploy to Netlify
1. Fork or clone this repo
2. Go to [app.netlify.com](https://app.netlify.com)
3. Drag the project folder onto the deploy area
4. Done! Your live URL is ready

---

## 🛠️ Tech Stack

| Technology | Usage |
|-----------|-------|
| **HTML5** | Semantic structure, forms, modals |
| **CSS3** | CSS Variables, Grid, Flexbox, Animations |
| **Vanilla JS** | Zero dependencies, pure JavaScript |
| **localStorage** | All data persists in your browser |

> **No frameworks. No libraries. No build tools.** Just three files that work anywhere.

---

## 📁 Project Structure

```
TRADELEARN/
├── index.html    # Main page with both tabs + all modals
├── style.css     # Complete styling (light/dark theme)
├── script.js     # All logic (CRUD, export, lightbox)
└── README.md     # This file
```

---

## 🎯 How It Works

### Adding a Trade
1. Switch to **Record Trade** tab
2. Fill in the form: Date, Bias, Liquidity, Sweep, MSS, Displacement, Entry, SL, TP, Result
3. Optionally add **Notes** and **Photos**
4. Click **Add Trade**

### Viewing Trade Details
1. In Trade History, click the **View** button
2. A full-screen modal shows all trade details
3. Click **Edit** in the modal to jump to the edit form

### Saving Learnings
1. Switch to **Learn** tab
2. Fill in: Date, Category, Title, Description, Key Rules
3. Add chart screenshots if needed
4. Click **Save Learning**

### Managing Strategies
1. In the Learn tab, click **+ New Strategy**
2. Name your strategy and write your rules
3. Click **Save Strategy**
4. Click any strategy card to view or edit it

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Escape` | Close any open modal or lightbox |
| `←` `→` | Navigate photos in lightbox |

---

## 📊 Data Storage

All data is stored in your browser's `localStorage`:

| Key | Data |
|-----|------|
| `tradeJournalData` | All trade entries |
| `tradeJournalLearns` | All learning entries |
| `tradeJournalStrategy` | All strategy cards |
| `tradeJournalTheme` | Light/Dark mode preference |

> **Note:** Data stays on your browser. No server, no account needed.

---

## 🌐 Browser Support

| Browser | Status |
|---------|--------|
| Chrome | ✅ Fully supported |
| Firefox | ✅ Fully supported |
| Safari | ✅ Fully supported |
| Edge | ✅ Fully supported |
| Mobile browsers | ✅ Fully responsive |

---

## 📝 License

MIT License - feel free to use, modify, and distribute.

---

<div align="center">

**Built with ❤️ for traders who learn from every trade**

⭐ Star this repo if you find it useful!

</div>

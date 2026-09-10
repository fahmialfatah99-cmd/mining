# ⛏ CryptoMine Tools v2.0

> **Real-time Crypto Mining Dashboard** — Connected to live mining pool APIs (2Miners) and real-time price data (CoinGecko).

![Version](https://img.shields.io/badge/version-2.0-yellow)
![React](https://img.shields.io/badge/React-18-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![API](https://img.shields.io/badge/API-Live-green)

---

## 🚀 Fitur Utama

### 1. 🔄 Auto-Switch Recommendation Engine
- **Analisis profitabilitas real-time** di semua coin yang didukung
- Otomatis merekomendasikan **coin paling profitable** untuk GPU kamu
- Perhitungan berdasarkan: network hashrate, block reward, difficulty, harga, dan biaya listrik
- ROI Score untuk setiap coin
- Ranking profitability dengan update setiap 2 menit

### 2. 📡 Pool Monitor
- Statistik pool **real-time** dari 2Miners API
- Active miners, pool hashrate, blocks found, last block time
- Network stats: hashrate, difficulty, block height, block reward
- Recent blocks table dengan status (confirmed/pending)
- Auto-refresh setiap 30 detik

### 3. 👛 Multi-Wallet Tracker
- Track **banyak wallet sekaligus** dalam satu dashboard
- Data tersimpan di localStorage (persisten)
- Summary total balance, total earned, combined hashrate
- Export data ke **CSV** untuk analisis lebih lanjut
- Per-wallet breakdown: hashrate, pending balance, total paid, workers

### 4. 🔍 Wallet Lookup
- Lookup statistik mining dari **wallet address** manapun
- Data langsung dari 2Miners API
- Worker-level monitoring (nama, hashrate, status online/offline)
- Mining activity: shares, stales, invalid shares
- Earnings breakdown dengan konversi USD

### 5. 🧮 Profit Calculator
- Kalkulator profitabilitas berdasarkan **hardware nyata**
- Database GPU: RTX 4090, 4080, 4070 Ti, 3090, 3080, 3070, RX 7900 XTX, dll
- Input: jumlah GPU, biaya listrik, pool fee
- Output: daily/monthly/yearly profit, revenue vs cost breakdown
- Market data live (harga, network hashrate, block reward)

### 6. 🌐 Network Stats
- **Perbandingan semua coin** dalam satu tabel
- Sort by: hashrate, miners, price, difficulty
- Visual bar chart comparison network hashrate
- Detail view untuk coin yang dipilih

### 7. 🔔 Alert System
- Set alert untuk: **price, hashrate, new block, difficulty**
- Kondisi: above/below threshold
- **Browser notifications** saat alert triggered
- Notification history log
- Data persisten di localStorage

### 8. 📊 Price Ticker
- Real-time price ticker berjalan di atas dashboard
- Harga, 24h change, volume, market cap
- Data dari CoinGecko API
- Auto-refresh setiap 30 detik

---

## 💰 Supported Cryptocurrencies

| Coin | Symbol | Algorithm | Pool |
|------|--------|-----------|------|
| Kaspa | KAS | kHeavyHash | 2Miners |
| Ethereum Classic | ETC | Ethash | 2Miners |
| Ergo | ERG | Autolykos | 2Miners |
| Zcash | ZEC | Equihash | 2Miners |
| Monero | XMR | RandomX | 2Miners |
| Ravencoin | RVN | KawPow | 2Miners |
| EthereumPoW | ETHW | Ethash | 2Miners |
| Bitcoin Cash | BCH | SHA-256 | 2Miners |

---

## 🛠️ Tech Stack

- **React 18** — UI framework
- **TypeScript** — Type safety
- **Tailwind CSS 4** — Styling
- **Vite** — Build tool
- **Canvas API** — Charts
- **Web Notifications API** — Alert system
- **LocalStorage API** — Data persistence

---

## 📡 APIs Used

### 2Miners API (Mining Pool Data)
```
GET {pool}.2miners.com/api/stats          → Pool statistics
GET {pool}.2miners.com/api/accounts/{id}  → Wallet info
GET {pool}.2miners.com/api/blocks         → Recent blocks
GET {pool}.2miners.com/api/payments       → Payment history
GET {pool}.2miners.com/api/miners         → Active miners
```

### CoinGecko API (Price Data)
```
GET api.coingecko.com/api/v3/simple/price → Real-time prices
```

---

## 🏗️ Project Structure

```
src/
├── App.tsx                          # Main app with routing
├── main.tsx                         # Entry point
├── index.css                        # Global styles + animations
├── components/
│   ├── PoolMonitor.tsx              # Real-time pool stats
│   ├── WalletLookup.tsx             # Single wallet lookup
│   ├── MultiWalletTracker.tsx       # Multi-wallet tracking
│   ├── ProfitCalculator.tsx         # Profitability calculator
│   ├── NetworkStats.tsx             # Cross-pool comparison
│   ├── AutoSwitchRecommendation.tsx # Auto-switch engine
│   ├── AlertSystem.tsx              # Alert notifications
│   └── PriceTicker.tsx              # Scrolling price ticker
└── utils/
    └── api.ts                       # API functions & helpers
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd cryptomine-tools

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Deploy
```bash
npm run build
# Output: dist/ folder (static files, deploy anywhere)
```

---

## 📖 Cara Penggunaan

### Auto-Switch (Rekomendasi Otomatis)
1. Pilih GPU kamu dari dropdown
2. Masukkan biaya listrik ($/kWh)
3. Sistem akan otomatis menghitung dan merekomendasikan coin paling profitable
4. Lihat ranking profitability di tabel bawah

### Track Wallet
1. Buka tab "Multi-Wallet"
2. Masukkan label, pilih pool, dan paste wallet address
3. Klik "Add" — wallet akan tersimpan otomatis
4. Data auto-refresh setiap 30 detik

### Set Alert
1. Buka tab "Alerts"
2. Klik "Enable Notifications" untuk browser notifications
3. Pilih type (price/hashrate/block/difficulty)
4. Pilih coin, kondisi (above/below), dan threshold
5. Alert akan trigger otomatis dan mengirim notifikasi

### Export Data
1. Di Multi-Wallet Tracker, klik tombol "Export CSV"
2. File akan ter-download otomatis

---

## ⚠️ Disclaimer

- **Ini bukan financial advice.** Selalu lakukan riset sendiri (DYOR).
- Estimasi profitabilitas berdasarkan kondisi saat ini dan bisa berubah.
- Data dari 2Miners API dan CoinGecko API — akurasi tergantung pada provider.
- Tools ini hanya untuk monitoring dan analisis, **bukan untuk melakukan mining secara langsung**.
- Untuk mining sebenarnya, gunakan software mining seperti:
  - **T-Rex Miner** (NVIDIA)
  - **lolMiner** (AMD/NVIDIA)
  - **XMRig** (CPU - Monero)
  - **Gminer** (Multi-algo)

---

## 🔮 Roadmap

- [ ] WebSocket real-time updates
- [ ] Historical hashrate charts (7d/30d)
- [ ] Mining rig temperature monitoring
- [ ] Payout history per wallet
- [ ] Share statistics visualization
- [ ] Multi-language support (ID/EN)
- [ ] Dark/Light theme toggle
- [ ] Mobile app (React Native)
- [ ] ASIC miner support
- [ ] Custom pool support (user-defined API)

---

## 📄 License

MIT License — Free to use, modify, and distribute.

---

## 🙏 Credits

- [2Miners](https://2miners.com/) — Mining pool API
- [CoinGecko](https://coingecko.com/) — Cryptocurrency price data
- Built with ❤️ using React + TypeScript + Tailwind CSS

---

<p align="center">
  <strong>CryptoMine Tools v2.0</strong><br>
  <em>Real-time mining intelligence at your fingertips</em>
</p>

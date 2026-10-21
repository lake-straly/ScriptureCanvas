# 📖 ScriptureCanvas

**A collaborative visual Bible study canvas with real-time peer-to-peer multiplayer, biblical cross-reference hyperlinks, original Greek & Hebrew word studies, and expository commentaries.**

[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.3-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![WebRTC](https://img.shields.io/badge/WebRTC-P2P%20Multiplayer-339933?style=flat&logo=webrtc&logoColor=white)](https://webrtc.org)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-Ready-F38020?style=flat&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com)

---

## ✨ Features

- **Infinite Interactive Canvas**: Move, zoom, organize, and link scripture cards, reflection stickies, original language lexicons, and Socratic prompts on an infinite workspace.
- **Dynamic Scripture Engine**: Search and fetch any verse or passage across 8 translations (`WEB`, `KJV`, `ASV`, `BBE`, `OEB`, `BSB`, `ESV`, `YLT`).
- **Real-Time Cross-Device Multiplayer**: Built-in encrypted WebRTC P2P mesh data channels (`trystero`). Collaborate live across devices anywhere in the world with zero accounts and zero server setup.
- **Expository Commentary Drawer**: Slide-out commentary reader powered by the open HelloAO API with classical commentaries:
  - Matthew Henry Bible Commentary
  - Jamieson-Fausset-Brown
  - John Calvin's Commentaries
  - John Gill Bible Commentary
  - Tyndale Open Study Notes
  - Adam Clarke Commentary
  - Keil & Delitzsch OT Commentary
- **Original Language Word Studies**: Instant Strong’s Greek & Hebrew word breakdown on each verse with definitions, transliterations, and theological notes.
- **Theological Connection Lines**: Draw visual hyperlinks between passages to map prophecies, fulfillments, thematic motifs, and direct OT citations.
- **iPad & Touch Support**: Full multi-touch pinch-to-zoom and two-finger pan drag for tablets and mobile devices.
- **Study Export**: One-click export to structured Markdown (`.md`) for Notion/Obsidian/Bear, copy to clipboard, or printable PDF handout.
- **Command Palette (`Cmd + K` / `Ctrl + K`)**: Rapid search across canvas cards, biblical passages, lexicon entries, and study actions.
- **Local Persistence & Crash Protection**: Auto-saves board state locally to protect against accidental refreshes, backed by a React `ErrorBoundary`.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm / pnpm / yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/lake-straly/ScriptureCanvas.git
cd ScriptureCanvas

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

---

## 🛠️ Production Build

```bash
npm run build
```

The output bundle is generated in the `dist/` directory.

---

## 🌐 Deploy to Cloudflare Pages

This application is 100% static and ready for instant deployment on Cloudflare Pages:

1. In the **Cloudflare Dashboard**, navigate to **Workers & Pages** ➔ **Create application** ➔ **Pages** ➔ **Connect to Git**.
2. Select `ScriptureCanvas`.
3. Set the build configuration:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
4. Click **Save and Deploy**.

*(SPA route fallbacks are automatically handled by `public/_redirects`).*

---

## 📄 License

Open-source and free for study, church, and personal devotion.

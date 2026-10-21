# ScriptureCanvas - Project Guidelines & Instructions

This document provides project context, architecture guidelines, and operational procedures for all AI pair-programming sessions in this workspace.

---

## 1. Project Overview & Tech Stack
**ScriptureCanvas** is a real-time collaborative visual Bible study canvas designed for small groups, scholars, and individual learners.
- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite.
- **Icons**: Lucide React (`lucide-react`).
- **P2P Multiplayer Mesh**: Trystero (`trystero`) WebRTC with public STUN fallbacks and BroadcastChannel for zero-latency local tab testing.
- **Bible & Commentary APIs**:
  - Passage fetching via HelloAO API (`https://bible.helloao.org/api/`).
  - Classical historical commentaries (Matthew Henry, John Calvin, etc.) via HelloAO commentary API.
  - Greek/Hebrew Strong's concordance lexicon data from local data modules.

---

## 2. GitHub & Deployment CI/CD Workflow
- **Git Remote**: `origin` is configured to `https://github.com/lake-straly/ScriptureCanvas.git`.
- **Default Branch**: `main`.
- **Hosting & CI/CD**: Cloudflare Pages / Workers is linked directly to this GitHub repository.
  - **Every commit pushed to `origin main` automatically triggers a Cloudflare production build and deploys live.**
- **Windows Shell Note**: When running package manager commands in PowerShell, always prefix with `cmd /c` (e.g. `cmd /c npm run build`, `cmd /c npm test`).

---

## 3. Core Architecture Rules

### A. Room Security & Authentication Gate
- **Zero-Leak URLs**: Never append password hashes, reversible strings, or `&locked=1` to the room URL. Invite links are strictly clean (e.g. `?room=STUDY-ROOM-777`).
- **Complete DOM Unmount**: The canvas, toolbar, navbar, and cards are **NEVER** mounted in the DOM when unauthenticated.
  - `connectionState === 'connecting'` renders `<RoomConnectingScreen />`.
  - `connectionState === 'locked'` renders `<RoomLockScreen />`.
  - Only `connectionState === 'ready'` renders the canvas and study cards.
- **Network P2P Handshake**: Authentication is enforced at the WebRTC protocol layer using cryptographic SHA-256 challenge-response (`AUTH_CHALLENGE` -> `AUTH_VERIFY` -> `AUTH_SUCCESS`). Host peers never transmit `SYNC_RESPONSE` to unauthenticated newcomers.

### B. Canvas Geometry & Connectors
- All cards have consistent **canvas-space dimensions** (e.g. `w-[500px]` for scripture cards, `w-[400px]` for prompt cards, `w-64` for sticky notes).
- The canvas viewport uses CSS `transform: translate(${pan.x}px, ${pan.y}px) scale(${zoom})`.
- Every node element must have `id={`node-${node.id}`}` and verse rows must have `id={`verse-${node.id}-${verse.verseNum}`}`.
- Connection anchor points are dynamically measured from DOM dimensions with exact fallback coordinates, ensuring connectors dock perfectly on both mobile screens and high-resolution desktop monitors.

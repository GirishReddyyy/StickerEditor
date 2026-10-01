# StickerEditor 🎨✨

A web-first, privacy-focused Sticker Editor web application with separate `frontend` and `backend` architecture. Users drop a friend's face into template stickers, crop & remove backgrounds automatically, trim sticker edges with smooth freehand curves, add customizable white borders, and export transparent 512x512 WebP / PNG stickers optimized for WhatsApp & Telegram.

---

## Architecture Overview

```
StickerEditor/
├── frontend/                     # React 18 + Vite + TypeScript + Tailwind CSS
│   ├── public/templates/         # Template artwork PNGs & JSON face slots
│   └── src/
│       ├── components/           # Canvas (Konva stage), CutOverlay, Toolbar, PropertiesPanel, PhotoUploadModal, ExportDialog
│       ├── lib/                  # faceDetect (MediaPipe), removeBg, smoothPath (Paper.js), applyCut, addOutline, exportSticker
│       ├── store/                # editorStore & projectStore (Zustand with 50-step capped history), authStore, uiStore
│       └── pages/                # Home, Templates, EditorPage, MyStickers, SharedSticker, AuthPage, AdminReportsPage, LegalPages
└── backend/                      # Node.js + Express + TypeScript + Security Middleware
    ├── src/
    │   ├── config/               # Zod Environment Validation
    │   ├── middleware/           # JWT Auth, Rate Limiters, Multer Upload, Request Validator, Error Handler
    │   ├── services/             # Persistent DB engine (Users, Templates, Stickers, Packs, Reports)
    │   ├── routes/               # Auth, Templates, Stickers, Admin moderation
    │   └── controllers/          # Business logic handlers
    ├── uploads/                  # Protected sticker file storage
    └── data/                     # Database storage
```

---

## Safety & Security Features

1. **Client-Side Face Privacy**:
   - Original photos are processed **100% inside the browser** using MediaPipe Tasks Vision and `@imgly/background-removal`.
   - Raw photos of friends are **NEVER uploaded or stored** on servers.
2. **Backend API Security**:
   - `helmet` for HTTP security headers (CSP, HSTS, X-Content-Type-Options).
   - Strict CORS configuration (origin validation).
   - Rate limiting on Auth (15 req/15min) and API endpoints (150 req/15min).
   - Input validation using `zod` for all requests.
   - Password hashing with `bcryptjs` (salt cost 12).
   - JWT authentication.
3. **File Upload Safety**:
   - Strict MIME-type checking (`image/png`, `image/webp`).
   - Hard file size cap (2 MB max per upload).
   - Storage isolation with cryptographically unique random filenames.
   - Server-side per-user quota (200 stickers limit).
4. **Safety & Moderation**:
   - Public reporting system (`/api/stickers/:id/report`).
   - Automatic quarantine for content receiving multiple distinct safety reports.
   - Admin moderation queue for reviewing reported content.

---

## Quick Start Guide

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:5173`

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Runs at `http://localhost:5000`

### 3. Run Unit Tests
```bash
cd frontend
npm run test
```
Runs Vitest unit tests covering stores, smoothPath, applyCut, and export size calculators.

---

## Export Specifications
- **WhatsApp**: 512x512 px WebP format compressed step-by-step to <100 KB with transparent background.
- **Telegram & PNG**: 512x512 px transparent PNG HD export.
- **Web Share API**: Native mobile share sheet triggering with direct download fallbacks.

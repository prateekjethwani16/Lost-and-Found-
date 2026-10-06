# 🔍 MERN Lost & Found Web App

A clean, minimalist, and user-friendly MERN stack application designed to report lost belongings and mark them as found.

---

## 🎨 Color Palette Used

- **Deep Pine Teal**: `#287A74` (Header, primary buttons, bold titles)
- **Medium Teal**: `#55A9A0` (Borders, accents, tag details, hover states)
- **Soft Mint**: `#AEEED3` (Subtle highlights, preview borders, cards)
- **Warm Cream Yellow**: `#FFF8B0` (Badges, tag highlights, warm contrasts)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (Installed)
- **MongoDB** (Service running on `mongodb://127.0.0.1:27017`)

### 2. Run Both Frontend and Backend (One Command)
From the project root folder:
```bash
npm run dev
```
- **Backend API**: Running on `http://localhost:5000`
- **Frontend App**: Running on `http://localhost:5173`

---

## 📁 Project Structure

```
Lost_and_found_MERN/
├── backend/
│   ├── models/
│   │   └── Item.js          # Mongoose schema for lost items
│   ├── uploads/             # Storage for local uploaded files
│   ├── .env                 # Environment variables (PORT, MONGO_URI)
│   ├── package.json         # Express, Mongoose, Multer, Cors
│   └── server.js            # Express server & REST API routes
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Simple, single-view Lost & Found interface
│   │   ├── App.css          # Styled with custom palette colors
│   │   ├── index.css        # Clean base styles & typography
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js       # Vite proxy configured for /api and /uploads
│   └── package.json         # React 19 + Vite
├── package.json             # Root script to run both servers together
└── README.md
```

---

## 💡 Key Features

- **No Logins or Passwords**: Straightforward and frictionless community board.
- **Upload Image & Description**:
  - Drag & drop or select an image directly from your computer with instant thumbnail preview.
  - Option to paste an image URL directly if desired.
  - Form validation with clear feedback.
- **"Found" Button**:
  - Each item card has a prominent **"✓ Found"** button.
  - Clicking it deletes the item from MongoDB and immediately removes the item's card div from the screen.
- **Clean UI**: Simple two-column layout on desktop, responsive on mobile, with no confusing toggle switches or multi-step dialogs.

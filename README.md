# ✦ SyncWrite - Real-Time Collaborative Document Editor

SyncWrite is a modern, production-ready real-time collaborative document editor built with **Node.js**, **Express**, **MySQL**, **Socket.IO**, and **React** with the **TipTap** rich-text framework.

---

## ✨ Features

- ⚡ **Real-Time Collaboration**: Instant text synchronization across multiple open browser sessions using Socket.IO.
- 👥 **Presence Awareness**: View online collaborators with color-coded avatars and live active editing locations.
- ⌨️ **Rich Text Editing**: Support for headings (H1-H3), bold, italic, underline, strikethrough, lists, text alignment, blockquotes, and hyperlinks.
- 🕒 **Version History & Previews**: Automatic version snapshot creation with preview diff capabilities and live 1-click restoration.
- 💬 **Real-Time Commenting & History**: Threaded comments and replies with status filters (`All`, `Active`, `Resolved`) and live socket updates.
- 🔒 **Role-Based Permissions**: Strict enforcement of document permissions (`owner`, `editor`, `commenter`, `viewer`).
- 📥 **Import & Export Options**:
  - Export document as **Markdown (.md)**
  - Export document as **HTML (.html)**
  - Print / Save as **PDF**
  - Import **Markdown (.md, .txt)** files directly into the editor.
- 🌙 **Dark & Light Mode**: System theme switcher with instant local storage persistence.
- ⌨️ **Keyboard Shortcuts & In-Page Search**: Quick helper modal (`Ctrl+/`) and live document search (`Ctrl+F`).
- 🔔 **Toast Notifications**: Interactive feedback for saves, imports, exports, and real-time events.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), TipTap Editor, Socket.io-client, React Router DOM, Vanilla CSS Design System
- **Backend**: Node.js, Express, Socket.IO, MySQL2 (`mysql2/promise`), JWT (`jsonwebtoken`), bcryptjs
- **Database**: MySQL

---

## 🚀 Quick Setup Guide

### 1. Database Setup
1. Ensure your **MySQL Server** is running on `localhost:3306`.
2. Import the schema script located in `database/schema.sql` into MySQL:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   *(Or copy and execute `database/schema.sql` in MySQL Workbench / phpMyAdmin / DBeaver).*

---

### 2. Backend Setup
1. Navigate to the `server/` folder:
   ```bash
   cd server
   ```
2. Create or verify the `.env` file in `server/`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=your_mysql_password
   DB_NAME=collaborative_editor
   JWT_SECRET=super_secret_jwt_key_12345
   ```
3. Install dependencies and start the server:
   ```bash
   npm install
   npm run dev   # Runs on http://localhost:5000
   ```

---

### 3. Frontend Setup
1. Navigate to the `client/` folder:
   ```bash
   cd client
   ```
2. Install dependencies and start the development server:
   ```bash
   npm install
   npm run dev   # Runs on http://localhost:5173
   ```
3. Open `http://localhost:5173` in your browser to start editing!

---

## 🔐 Permission Roles Summary

| Role | Edit Document Text | Add & Reply Comments | Resolve/Delete Comments | Access Document Settings / Share |
| :--- | :---: | :---: | :---: | :---: |
| **Owner** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Editor** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **Commenter** | ❌ Read-Only | ✅ Yes | ✅ Yes | ❌ No |
| **Viewer** | ❌ Read-Only | ❌ Read-Only | ❌ No | ❌ No |

---

## 📜 License
MIT License - Created for Collaborative Document Editing.
RTCDE  means Real Time Collaborative Document Editor

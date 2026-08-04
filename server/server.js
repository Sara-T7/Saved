require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

require("./config/db");

const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const sharingRoutes = require("./routes/sharingRoutes");
const versionRoutes = require("./routes/versionRoutes");
const commentRoutes = require("./routes/commentRoutes");

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "http://localhost:5173", credentials: true },
});

// Attach socket io instance to app for access in REST controllers
app.set("io", io);

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/sharing", sharingRoutes);
app.use("/api/versions", versionRoutes);
app.use("/api/comments", commentRoutes);

// Track active users per document: { docId: [ { socketId, userId, name, color, cursor, editingLocation } ] }
const docUsers = {};

// Debounce map for auto-save: { docId: timeoutId }
const saveTimers = {};

const db = require("./config/db");

function saveDocument(docId, content, editorInfo = null) {
  db.query(
    "UPDATE documents SET content=?, updated_at=NOW() WHERE id=?",
    [content, docId],
    (err) => {
      if (err) console.error("Auto-save error:", err);
    }
  );

  // Save version snapshot (only if we have editor info)
  const users = docUsers[docId] || [];
  const editorId = editorInfo?.userId || users[0]?.userId;
  if (!editorId) return;

  db.query(
    "SELECT MAX(version_number) as max_v FROM document_versions WHERE document_id=?",
    [docId],
    (err2, vrows) => {
      if (err2) {
        console.error("Version query error:", err2);
        return;
      }
      const nextVer = ((vrows[0]?.max_v) || 0) + 1;
      db.query(
        "INSERT INTO document_versions(document_id, content, version_number, created_by) VALUES(?,?,?,?)",
        [docId, content, nextVer, editorId],
        (err3, result) => {
          if (!err3 && result.insertId) {
            io.to(docId).emit("version-created", {
              id: result.insertId,
              document_id: docId,
              version_number: nextVer,
              created_at: new Date(),
              created_by_name: editorInfo?.name || users[0]?.name || "Editor",
              avatar_color: editorInfo?.color || users[0]?.color || "#6366f1",
            });
          }
        }
      );
    }
  );
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join document room
  socket.on("join-document", ({ docId, user }) => {
    socket.join(docId);
    socket.currentDocId = docId;
    socket.userInfo = user;

    // Determine user permission for this document
    db.query(
      `SELECT owner_id,
              (SELECT permission FROM document_shares WHERE document_id=? AND user_id=?) as share_perm
       FROM documents WHERE id=?`,
      [docId, user.userId, docId],
      (err, rows) => {
        let perm = "viewer";
        if (!err && rows.length) {
          if (rows[0].owner_id === user.userId) perm = "owner";
          else if (rows[0].share_perm) perm = rows[0].share_perm;
        }
        socket.docPermission = perm;
      }
    );

    if (!docUsers[docId]) docUsers[docId] = [];

    // Remove if already present
    docUsers[docId] = docUsers[docId].filter((u) => u.socketId !== socket.id);
    docUsers[docId].push({ socketId: socket.id, cursor: null, editingLocation: "Viewing", ...user });

    // Send current presence list to everyone in room
    io.to(docId).emit("presence-update", docUsers[docId]);

    // Send full document content to the new joiner from DB
    db.query("SELECT content, title FROM documents WHERE id=?", [docId], (err, rows) => {
      if (!err && rows.length) {
        socket.emit("load-document", { content: rows[0].content, title: rows[0].title });
      }
    });
  });

  // Receive content change from one client, broadcast to others
  socket.on("document-change", ({ docId, content }) => {
    // Only owner or editor can modify content
    if (socket.docPermission && socket.docPermission !== "owner" && socket.docPermission !== "editor") {
      return;
    }

    socket.to(docId).emit("document-change", content);

    // Debounced auto-save to DB (2 seconds after last change)
    if (saveTimers[docId]) clearTimeout(saveTimers[docId]);
    saveTimers[docId] = setTimeout(() => {
      saveDocument(docId, content, socket.userInfo);
    }, 2000);
  });

  // Title changed
  socket.on("title-change", ({ docId, title }) => {
    if (socket.docPermission && socket.docPermission !== "owner") return;
    socket.to(docId).emit("title-change", title);
    db.query("UPDATE documents SET title=? WHERE id=?", [title, docId], () => {});
  });

  // Cursor & Selection position
  socket.on("cursor-move", ({ docId, cursor, editingLocation }) => {
    if (socket.currentDocId && docUsers[socket.currentDocId]) {
      const u = docUsers[socket.currentDocId].find((user) => user.socketId === socket.id);
      if (u) {
        u.cursor = cursor;
        if (editingLocation) u.editingLocation = editingLocation;
      }
    }
    socket.to(docId).emit("cursor-move", {
      socketId: socket.id,
      userId: socket.userInfo?.userId,
      name: socket.userInfo?.name,
      color: socket.userInfo?.color,
      cursor,
      editingLocation,
    });
  });

  // Typing indicator
  socket.on("typing", ({ docId, isTyping }) => {
    socket.to(docId).emit("typing", { userId: socket.userInfo?.userId, name: socket.userInfo?.name, isTyping });
  });

  socket.on("disconnect", () => {
    const docId = socket.currentDocId;
    if (docId && docUsers[docId]) {
      docUsers[docId] = docUsers[docId].filter((u) => u.socketId !== socket.id);
      io.to(docId).emit("presence-update", docUsers[docId]);
    }
    console.log("User disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.json({ message: "SyncWrite Collaborative Editor API Running" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
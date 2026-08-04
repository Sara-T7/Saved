const db = require("../config/db");

// Create a new document
exports.createDocument = (req, res) => {
  const { title } = req.body;
  const owner_id = req.user.id;

  db.query(
    "INSERT INTO documents(title, content, owner_id) VALUES(?,?,?)",
    [title || "Untitled Document", "", owner_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to create document", error: err.message });
      res.json({ message: "Document created successfully", documentId: result.insertId });
    }
  );
};

// Get all documents owned by current user
exports.getDocuments = (req, res) => {
  const owner_id = req.user.id;
  db.query(
    `SELECT d.*, u.name as owner_name, u.avatar_color as owner_color
     FROM documents d
     JOIN users u ON d.owner_id = u.id
     WHERE d.owner_id=?
     ORDER BY d.updated_at DESC`,
    [owner_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Failed to fetch documents" });
      res.json(results);
    }
  );
};

// Get documents shared with current user
exports.getSharedDocuments = (req, res) => {
  const user_id = req.user.id;
  db.query(
    `SELECT d.*, u.name as owner_name, u.avatar_color as owner_color, ds.permission
     FROM documents d
     JOIN document_shares ds ON d.id = ds.document_id
     JOIN users u ON d.owner_id = u.id
     WHERE ds.user_id=?
     ORDER BY d.updated_at DESC`,
    [user_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Failed to fetch shared documents" });
      res.json(results);
    }
  );
};

// Get recent documents (owned + shared, last 10 by updated_at)
exports.getRecentDocuments = (req, res) => {
  const user_id = req.user.id;
  db.query(
    `(SELECT d.*, u.name as owner_name, u.avatar_color as owner_color, 'owner' as access
      FROM documents d JOIN users u ON d.owner_id=u.id WHERE d.owner_id=?)
     UNION
     (SELECT d.*, u.name as owner_name, u.avatar_color as owner_color, ds.permission as access
      FROM documents d
      JOIN document_shares ds ON d.id=ds.document_id
      JOIN users u ON d.owner_id=u.id
      WHERE ds.user_id=?)
     ORDER BY updated_at DESC
     LIMIT 10`,
    [user_id, user_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Failed to fetch recent documents" });
      res.json(results);
    }
  );
};

// Get a single document (owner or shared user)
exports.getDocument = (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  db.query(
    `SELECT d.*, u.name as owner_name, u.avatar_color as owner_color,
            (SELECT ds.permission FROM document_shares ds WHERE ds.document_id=d.id AND ds.user_id=?) as share_permission
     FROM documents d
     JOIN users u ON d.owner_id=u.id
     WHERE d.id=?`,
    [user_id, id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (!results.length) return res.status(404).json({ message: "Document not found" });

      const doc = results[0];

      // Check access
      if (doc.owner_id !== user_id && !doc.share_permission) {
        return res.status(403).json({ message: "Access denied" });
      }

      const permission = doc.owner_id === user_id ? "owner" : doc.share_permission;
      res.json({ ...doc, permission });
    }
  );
};

// Update document content (auto-save from REST, complements socket auto-save)
exports.updateDocument = (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const user_id = req.user.id;

  db.query(
    `UPDATE documents SET content=?, updated_at=NOW()
     WHERE id=? AND (owner_id=? OR EXISTS(SELECT 1 FROM document_shares WHERE document_id=? AND user_id=? AND permission='editor'))`,
    [content, id, user_id, id, user_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to save" });
      if (result.affectedRows === 0) return res.status(403).json({ message: "Not authorized to edit" });
      res.json({ message: "Saved" });
    }
  );
};

// Rename document
exports.renameDocument = (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const user_id = req.user.id;

  if (!title) return res.status(400).json({ message: "Title is required" });

  db.query(
    "UPDATE documents SET title=? WHERE id=? AND owner_id=?",
    [title, id, user_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to rename" });
      if (result.affectedRows === 0) return res.status(403).json({ message: "Not authorized" });
      res.json({ message: "Renamed" });
    }
  );
};

// Delete document
exports.deleteDocument = (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  db.query(
    "DELETE FROM documents WHERE id=? AND owner_id=?",
    [id, user_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Failed to delete" });
      if (result.affectedRows === 0) return res.status(403).json({ message: "Not authorized" });
      res.json({ message: "Document deleted" });
    }
  );
};

// Duplicate document
exports.duplicateDocument = (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  db.query("SELECT * FROM documents WHERE id=? AND owner_id=?", [id, user_id], (err, results) => {
    if (err || !results.length) return res.status(404).json({ message: "Document not found" });
    const doc = results[0];
    db.query(
      "INSERT INTO documents(title, content, owner_id) VALUES(?,?,?)",
      [`${doc.title} (Copy)`, doc.content, user_id],
      (err2, result) => {
        if (err2) return res.status(500).json({ message: "Failed to duplicate" });
        res.json({ message: "Duplicated", documentId: result.insertId });
      }
    );
  });
};
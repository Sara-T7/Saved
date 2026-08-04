const db = require("../config/db");

// Get all shares for a document
exports.getDocumentShares = (req, res) => {
  const { docId } = req.params;
  const user_id = req.user.id;

  // Only owner can view shares list
  db.query("SELECT owner_id FROM documents WHERE id=?", [docId], (err, rows) => {
    if (err || !rows.length) return res.status(404).json({ message: "Document not found" });
    if (rows[0].owner_id !== user_id) return res.status(403).json({ message: "Access denied" });

    db.query(
      `SELECT ds.id, ds.permission, u.id as user_id, u.name, u.email, u.avatar_color
       FROM document_shares ds
       JOIN users u ON ds.user_id = u.id
       WHERE ds.document_id=?`,
      [docId],
      (err2, results) => {
        if (err2) return res.status(500).json({ message: "Server error" });
        res.json(results);
      }
    );
  });
};

// Share document with a user by email
exports.shareDocument = (req, res) => {
  const { docId } = req.params;
  const { email, permission } = req.body;
  const owner_id = req.user.id;

  if (!["viewer", "commenter", "editor"].includes(permission))
    return res.status(400).json({ message: "Invalid permission level" });

  // Verify requester is owner
  db.query("SELECT owner_id FROM documents WHERE id=?", [docId], (err, rows) => {
    if (err || !rows.length) return res.status(404).json({ message: "Document not found" });
    if (rows[0].owner_id !== owner_id) return res.status(403).json({ message: "Only the owner can share" });

    // Find user by email
    db.query("SELECT id FROM users WHERE email=?", [email], (err2, users) => {
      if (err2) return res.status(500).json({ message: "Server error" });
      if (!users.length) return res.status(404).json({ message: "No user found with that email" });

      const target_user_id = users[0].id;
      if (target_user_id === owner_id)
        return res.status(400).json({ message: "Cannot share with yourself" });

      db.query(
        `INSERT INTO document_shares(document_id, user_id, permission) VALUES(?,?,?)
         ON DUPLICATE KEY UPDATE permission=VALUES(permission)`,
        [docId, target_user_id, permission],
        (err3) => {
          if (err3) return res.status(500).json({ message: "Failed to share document" });
          res.json({ message: "Document shared successfully" });
        }
      );
    });
  });
};

// Update share permission
exports.updateSharePermission = (req, res) => {
  const { shareId } = req.params;
  const { permission } = req.body;
  const owner_id = req.user.id;

  db.query(
    `UPDATE document_shares ds
     JOIN documents d ON ds.document_id = d.id
     SET ds.permission=?
     WHERE ds.id=? AND d.owner_id=?`,
    [permission, shareId, owner_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (result.affectedRows === 0) return res.status(403).json({ message: "Not authorized" });
      res.json({ message: "Permission updated" });
    }
  );
};

// Remove a share
exports.removeShare = (req, res) => {
  const { shareId } = req.params;
  const owner_id = req.user.id;

  db.query(
    `DELETE ds FROM document_shares ds
     JOIN documents d ON ds.document_id = d.id
     WHERE ds.id=? AND d.owner_id=?`,
    [shareId, owner_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (result.affectedRows === 0) return res.status(403).json({ message: "Not authorized" });
      res.json({ message: "Share removed" });
    }
  );
};

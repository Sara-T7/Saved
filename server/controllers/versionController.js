const db = require("../config/db");

// Get all versions for a document
exports.getVersions = (req, res) => {
  const { docId } = req.params;
  const user_id = req.user.id;

  // Access check
  db.query(
    `SELECT 1 FROM documents d
     LEFT JOIN document_shares ds ON d.id=ds.document_id AND ds.user_id=?
     WHERE d.id=? AND (d.owner_id=? OR ds.user_id IS NOT NULL)`,
    [user_id, docId, user_id],
    (err, access) => {
      if (err || !access.length) return res.status(403).json({ message: "Access denied" });

      db.query(
        `SELECT dv.id, dv.version_number, dv.created_at, u.name as created_by_name, u.avatar_color
         FROM document_versions dv
         JOIN users u ON dv.created_by = u.id
         WHERE dv.document_id=?
         ORDER BY dv.version_number DESC`,
        [docId],
        (err2, results) => {
          if (err2) return res.status(500).json({ message: "Server error" });
          res.json(results);
        }
      );
    }
  );
};

// Get content of a specific version
exports.getVersion = (req, res) => {
  const { versionId } = req.params;
  db.query(
    "SELECT * FROM document_versions WHERE id=?",
    [versionId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (!results.length) return res.status(404).json({ message: "Version not found" });
      res.json(results[0]);
    }
  );
};

// Restore a version (copy version content back to document)
exports.restoreVersion = (req, res) => {
  const { versionId } = req.params;
  const user_id = req.user.id;

  db.query("SELECT * FROM document_versions WHERE id=?", [versionId], (err, vrows) => {
    if (err || !vrows.length) return res.status(404).json({ message: "Version not found" });
    const version = vrows[0];

    db.query(
      `UPDATE documents SET content=?, updated_at=NOW()
       WHERE id=? AND (owner_id=? OR EXISTS(SELECT 1 FROM document_shares WHERE document_id=? AND user_id=? AND permission='editor'))`,
      [version.content, version.document_id, user_id, version.document_id, user_id],
      (err2, result) => {
        if (err2) return res.status(500).json({ message: "Failed to restore" });
        if (result.affectedRows === 0) return res.status(403).json({ message: "Not authorized to restore" });

        const io = req.app.get("io");
        if (io) {
          io.to(version.document_id).emit("version-restored", { content: version.content });
        }

        res.json({ message: "Version restored", content: version.content });
      }
    );
  });
};


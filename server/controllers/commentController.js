const db = require("../config/db");

// Get all comments for a document
exports.getComments = (req, res) => {
  const { docId } = req.params;

  db.query(
    `SELECT c.id, c.content, c.resolved, c.created_at,
            u.id as user_id, u.name as user_name, u.avatar_color
     FROM comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.document_id=?
     ORDER BY c.created_at ASC`,
    [docId],
    (err, comments) => {
      if (err) { console.error("getComments error:", err); return res.status(500).json({ message: "Server error" }); }

      if (!comments.length) return res.json([]);

      const commentIds = comments.map((c) => c.id);
      db.query(
        `SELECT cr.id, cr.comment_id, cr.content, cr.created_at,
                u.id as user_id, u.name as user_name, u.avatar_color
         FROM comment_replies cr
         JOIN users u ON cr.user_id = u.id
         WHERE cr.comment_id IN (?)
         ORDER BY cr.created_at ASC`,
        [commentIds],
        (err2, replies) => {
          if (err2) { console.error("getComments replies error:", err2); return res.status(500).json({ message: "Server error" }); }

          const result = comments.map((c) => ({
            ...c,
            replies: replies.filter((r) => r.comment_id === c.id),
          }));
          res.json(result);
        }
      );
    }
  );
};

// Add a comment
exports.addComment = (req, res) => {
  const { docId } = req.params;
  const { content } = req.body;
  const user_id = req.user.id;

  if (!content) return res.status(400).json({ message: "Comment cannot be empty" });

  db.query(
    "INSERT INTO comments(document_id, user_id, content) VALUES(?,?,?)",
    [docId, user_id, content],
    (err, result) => {
      if (err) { console.error("addComment error:", err); return res.status(500).json({ message: "Failed to add comment" }); }

      const commentId = result.insertId;

      // Fetch newly inserted comment with user details for socket emission
      db.query(
        `SELECT c.id, c.document_id, c.content, c.resolved, c.created_at,
                u.id as user_id, u.name as user_name, u.avatar_color
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.id=?`,
        [commentId],
        (err2, rows) => {
          if (!err2 && rows.length) {
            const newComment = { ...rows[0], replies: [] };
            const io = req.app.get("io");
            if (io) io.to(docId).emit("comment-added", newComment);
          }
        }
      );

      res.json({ message: "Comment added", commentId });
    }
  );
};

// Resolve / unresolve a comment
exports.resolveComment = (req, res) => {
  const { commentId } = req.params;
  const { resolved } = req.body;
  const user_id = req.user.id;

  db.query(
    `UPDATE comments c
     JOIN documents d ON c.document_id = d.id
     SET c.resolved=?
     WHERE c.id=? AND (c.user_id=? OR d.owner_id=? OR EXISTS(SELECT 1 FROM document_shares WHERE document_id=d.id AND user_id=? AND permission IN ('editor', 'commenter')))` ,
    [resolved ? 1 : 0, commentId, user_id, user_id, user_id],
    (err, result) => {
      if (err) { console.error("resolveComment error:", err); return res.status(500).json({ message: "Server error" }); }

      db.query("SELECT document_id FROM comments WHERE id=?", [commentId], (err2, rows) => {
        if (!err2 && rows.length) {
          const docId = rows[0].document_id;
          const io = req.app.get("io");
          if (io) io.to(docId).emit("comment-resolved", { commentId: Number(commentId), resolved: !!resolved });
        }
      });

      res.json({ message: resolved ? "Comment resolved" : "Comment unresolved" });
    }
  );
};

// Delete a comment (owner of comment or doc owner)
exports.deleteComment = (req, res) => {
  const { commentId } = req.params;
  const user_id = req.user.id;

  db.query("SELECT document_id FROM comments WHERE id=?", [commentId], (err, rows) => {
    if (err || !rows.length) return res.status(404).json({ message: "Comment not found" });
    const docId = rows[0].document_id;

    db.query(
      `DELETE c FROM comments c
       JOIN documents d ON c.document_id = d.id
       WHERE c.id=? AND (c.user_id=? OR d.owner_id=?)`,
      [commentId, user_id, user_id],
      (err2, result) => {
        if (err2) { console.error("deleteComment error:", err2); return res.status(500).json({ message: "Server error" }); }
        if (result.affectedRows === 0) return res.status(403).json({ message: "Not authorized" });

        const io = req.app.get("io");
        if (io) io.to(docId).emit("comment-deleted", { commentId: Number(commentId) });

        res.json({ message: "Comment deleted" });
      }
    );
  });
};

// Add a reply
exports.addReply = (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const user_id = req.user.id;

  if (!content) return res.status(400).json({ message: "Reply cannot be empty" });

  db.query(
    "INSERT INTO comment_replies(comment_id, user_id, content) VALUES(?,?,?)",
    [commentId, user_id, content],
    (err, result) => {
      if (err) { console.error("addReply error:", err); return res.status(500).json({ message: "Failed to add reply" }); }
      const replyId = result.insertId;

      db.query(
        `SELECT cr.id, cr.comment_id, cr.content, cr.created_at,
                u.id as user_id, u.name as user_name, u.avatar_color,
                c.document_id
         FROM comment_replies cr
         JOIN comments c ON cr.comment_id = c.id
         JOIN users u ON cr.user_id = u.id
         WHERE cr.id=?`,
        [replyId],
        (err2, rows) => {
          if (!err2 && rows.length) {
            const replyObj = rows[0];
            const io = req.app.get("io");
            if (io) io.to(replyObj.document_id).emit("reply-added", { commentId: Number(commentId), reply: replyObj });
          }
        }
      );

      res.json({ message: "Reply added", replyId });
    }
  );
};

// Delete a reply
exports.deleteReply = (req, res) => {
  const { replyId } = req.params;
  const user_id = req.user.id;

  db.query(
    `SELECT cr.comment_id, c.document_id
     FROM comment_replies cr
     JOIN comments c ON cr.comment_id = c.id
     WHERE cr.id=?`,
    [replyId],
    (err, rows) => {
      if (err || !rows.length) return res.status(404).json({ message: "Reply not found" });
      const { comment_id, document_id } = rows[0];

      db.query(
        "DELETE FROM comment_replies WHERE id=? AND user_id=?",
        [replyId, user_id],
        (err2, result) => {
          if (err2) return res.status(500).json({ message: "Server error" });
          if (result.affectedRows === 0) return res.status(403).json({ message: "Not authorized" });

          const io = req.app.get("io");
          if (io) io.to(document_id).emit("reply-deleted", { commentId: Number(comment_id), replyId: Number(replyId) });

          res.json({ message: "Reply deleted" });
        }
      );
    }
  );
};


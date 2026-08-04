const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getComments,
  addComment,
  resolveComment,
  deleteComment,
  addReply,
  deleteReply,
} = require("../controllers/commentController");

router.get("/:docId", authMiddleware, getComments);
router.post("/:docId", authMiddleware, addComment);
router.put("/:commentId/resolve", authMiddleware, resolveComment);
// ⚠️ IMPORTANT: /replies/:replyId MUST come before /:commentId
// otherwise Express treats "replies" as a commentId value
router.delete("/replies/:replyId", authMiddleware, deleteReply);
router.delete("/:commentId", authMiddleware, deleteComment);
router.post("/:commentId/replies", authMiddleware, addReply);

module.exports = router;

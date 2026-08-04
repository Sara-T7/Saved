const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createDocument,
  getDocuments,
  getSharedDocuments,
  getRecentDocuments,
  getDocument,
  updateDocument,
  renameDocument,
  deleteDocument,
  duplicateDocument,
} = require("../controllers/documentController");

router.post("/", authMiddleware, createDocument);
router.get("/", authMiddleware, getDocuments);
router.get("/shared", authMiddleware, getSharedDocuments);
router.get("/recent", authMiddleware, getRecentDocuments);
router.get("/:id", authMiddleware, getDocument);
router.put("/:id/content", authMiddleware, updateDocument);
router.put("/:id/rename", authMiddleware, renameDocument);
router.delete("/:id", authMiddleware, deleteDocument);
router.post("/:id/duplicate", authMiddleware, duplicateDocument);

module.exports = router;
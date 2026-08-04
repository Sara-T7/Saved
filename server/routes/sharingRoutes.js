const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getDocumentShares,
  shareDocument,
  updateSharePermission,
  removeShare,
} = require("../controllers/sharingController");

router.get("/:docId", authMiddleware, getDocumentShares);
router.post("/:docId", authMiddleware, shareDocument);
router.put("/share/:shareId", authMiddleware, updateSharePermission);
router.delete("/share/:shareId", authMiddleware, removeShare);

module.exports = router;

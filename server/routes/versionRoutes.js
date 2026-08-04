const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getVersions, getVersion, restoreVersion } = require("../controllers/versionController");

router.get("/:docId", authMiddleware, getVersions);
router.get("/version/:versionId", authMiddleware, getVersion);
router.post("/restore/:versionId", authMiddleware, restoreVersion);

module.exports = router;

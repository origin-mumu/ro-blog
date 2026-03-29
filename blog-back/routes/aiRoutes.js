const express = require("express");
const aiSessionController = require("../controllers/aiSessionController");

const router = express.Router();

router.get("/models", (req, res) => {
  const hasQwen = !!(
    process.env.AI_KEY_QWEN ||
    process.env.VITE_API_KEY ||
    process.env.DASHSCOPE_API_KEY
  );
  const hasMimo = !!(process.env.AI_KEY_MIMO || process.env.VITE_MIMO_API_KEY);
  res.json({
    success: true,
    models: [
      { id: "qwen-plus", name: "通义千问 Plus", configured: hasQwen },
      { id: "mimo", name: "小米 MiMo", configured: hasMimo },
    ],
  });
});

router.get("/character-cards", aiSessionController.getCharacterCards);
router.get("/sessions", aiSessionController.listSessions);
router.post("/sessions", aiSessionController.createSession);
router.patch("/sessions/:id", aiSessionController.updateSession);
router.delete("/sessions/:id", aiSessionController.deleteSession);
router.get("/sessions/:id/messages", aiSessionController.getMessages);
router.post("/sessions/:id/append", aiSessionController.appendPair);

module.exports = router;

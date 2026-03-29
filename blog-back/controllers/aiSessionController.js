const path = require("path");
const fs = require("fs");
const AiSession = require("../models/AiSession");
const AiMessage = require("../models/AiMessage");

function getClientId(req) {
  const raw = req.headers["x-client-id"] || req.headers["X-Client-Id"];
  return typeof raw === "string" && raw.length > 0 ? raw : null;
}

function loadCharacterCards() {
  const p = path.join(__dirname, "../config/aiCharacterCards.json");
  const txt = fs.readFileSync(p, "utf-8");
  return JSON.parse(txt);
}

exports.getCharacterCards = (req, res) => {
  try {
    res.json({ success: true, cards: loadCharacterCards() });
  } catch (e) {
    res.status(500).json({ success: false, message: "读取角色卡失败" });
  }
};

exports.listSessions = async (req, res) => {
  const clientId = getClientId(req);
  if (!clientId) {
    return res.status(400).json({ success: false, message: "缺少 X-Client-Id" });
  }
  try {
    const rows = await AiSession.findAll({
      where: { clientId },
      order: [["updatedAt", "DESC"]],
      limit: 80,
      attributes: ["id", "title", "characterKey", "modelId", "createdAt", "updatedAt"],
    });
    res.json({ success: true, sessions: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "列表失败" });
  }
};

exports.createSession = async (req, res) => {
  const clientId = getClientId(req);
  if (!clientId) {
    return res.status(400).json({ success: false, message: "缺少 X-Client-Id" });
  }
  const { title, characterKey, modelId } = req.body || {};
  try {
    const row = await AiSession.create({
      clientId,
      title: title || "新会话",
      characterKey: characterKey || "default",
      modelId: modelId || "qwen-plus",
    });
    res.json({
      success: true,
      session: {
        id: row.id,
        title: row.title,
        characterKey: row.characterKey,
        modelId: row.modelId,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "创建会话失败" });
  }
};

exports.updateSession = async (req, res) => {
  const clientId = getClientId(req);
  if (!clientId) {
    return res.status(400).json({ success: false, message: "缺少 X-Client-Id" });
  }
  const id = Number(req.params.id);
  const { title, characterKey, modelId } = req.body || {};
  try {
    const session = await AiSession.findOne({ where: { id, clientId } });
    if (!session) {
      return res.status(404).json({ success: false, message: "会话不存在" });
    }
    const patch = {};
    if (title != null) patch.title = String(title).slice(0, 255);
    if (characterKey != null) patch.characterKey = String(characterKey).slice(0, 64);
    if (modelId != null) patch.modelId = String(modelId).slice(0, 32);
    await session.update(patch);
    res.json({ success: true, session });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "更新失败" });
  }
};

exports.deleteSession = async (req, res) => {
  const clientId = getClientId(req);
  if (!clientId) {
    return res.status(400).json({ success: false, message: "缺少 X-Client-Id" });
  }
  const id = Number(req.params.id);
  try {
    const n = await AiSession.destroy({ where: { id, clientId } });
    if (!n) {
      return res.status(404).json({ success: false, message: "会话不存在" });
    }
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "删除失败" });
  }
};

exports.getMessages = async (req, res) => {
  const clientId = getClientId(req);
  if (!clientId) {
    return res.status(400).json({ success: false, message: "缺少 X-Client-Id" });
  }
  const id = Number(req.params.id);
  try {
    const session = await AiSession.findOne({ where: { id, clientId } });
    if (!session) {
      return res.status(404).json({ success: false, message: "会话不存在" });
    }
    const messages = await AiMessage.findAll({
      where: { sessionId: id },
      order: [["id", "ASC"]],
      attributes: ["id", "role", "content", "createdAt"],
    });
    res.json({
      success: true,
      session: {
        id: session.id,
        title: session.title,
        characterKey: session.characterKey,
        modelId: session.modelId,
      },
      messages,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "读取消息失败" });
  }
};

exports.appendPair = async (req, res) => {
  const clientId = getClientId(req);
  if (!clientId) {
    return res.status(400).json({ success: false, message: "缺少 X-Client-Id" });
  }
  const id = Number(req.params.id);
  const { userContent, assistantContent } = req.body || {};
  if (userContent == null || assistantContent == null) {
    return res.status(400).json({ success: false, message: "缺少 userContent 或 assistantContent" });
  }
  try {
    const session = await AiSession.findOne({ where: { id, clientId } });
    if (!session) {
      return res.status(404).json({ success: false, message: "会话不存在" });
    }
    await AiMessage.bulkCreate([
      { sessionId: id, role: "user", content: String(userContent) },
      { sessionId: id, role: "assistant", content: String(assistantContent) },
    ]);
    const u = String(userContent).trim();
    let newTitle = session.title;
    if (session.title === "新会话" && u.length > 0) {
      newTitle = u.length > 28 ? `${u.slice(0, 28)}…` : u;
    }
    await session.update({ title: newTitle, updatedAt: new Date() });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "保存失败" });
  }
};

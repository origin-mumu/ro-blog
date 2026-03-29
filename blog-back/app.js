require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const articleRoutes = require("./routes/articleRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const aiRoutes = require("./routes/aiRoutes");
const AiSession = require("./models/AiSession");
const AiMessage = require("./models/AiMessage");
const { attachAiChatWebSocket } = require("./services/aiChatSocket");

AiSession.hasMany(AiMessage, {
  foreignKey: "sessionId",
  onDelete: "CASCADE",
  as: "messages",
});
AiMessage.belongsTo(AiSession, { foreignKey: "sessionId" });

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/articles", articleRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/ai", aiRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "博客后端服务运行正常",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;

// 启动服务器函数
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ 数据库连接成功");
    await sequelize.sync({ force: false });
    console.log("✅ 数据库表同步完成");
    const server = app.listen(PORT, () => {
      console.log(`🚀 服务器运行在端口 ${PORT}`);
      console.log(`📝 文章API: http://localhost:${PORT}/api/articles`);
      console.log(`📂 分类API: http://localhost:${PORT}/api/categories`);
      console.log(`🤖 AI WebSocket: ws://localhost:${PORT}/api/ai/ws`);
    });
    attachAiChatWebSocket(server);
  } catch (error) {
    console.error("❌ 服务器启动失败:", error);
    process.exit(1);
  }
};

// 启动服务器
startServer();

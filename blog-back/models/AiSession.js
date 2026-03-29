const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AiSession = sequelize.define(
  "AiSession",
  {
    clientId: {
      type: DataTypes.STRING(64),
      allowNull: false,
      comment: "匿名客户端标识（与前端 X-Client-Id 对应）",
    },
    title: {
      type: DataTypes.STRING(255),
      defaultValue: "新会话",
    },
    characterKey: {
      type: DataTypes.STRING(64),
      defaultValue: "default",
      comment: "角色卡 key",
    },
    modelId: {
      type: DataTypes.STRING(32),
      defaultValue: "qwen-plus",
    },
  },
  {
    tableName: "ai_sessions",
    timestamps: true,
    updatedAt: true,
    createdAt: true,
  },
);

module.exports = AiSession;

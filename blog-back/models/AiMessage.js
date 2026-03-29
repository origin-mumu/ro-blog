const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AiMessage = sequelize.define(
  "AiMessage",
  {
    sessionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("user", "assistant", "system"),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "ai_messages",
    timestamps: true,
    updatedAt: false,
    createdAt: true,
  },
);

module.exports = AiMessage;

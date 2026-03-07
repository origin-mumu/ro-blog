const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Article = sequelize.define(
  "Article",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "文章标题",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "文章内容(Markdown)",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "文章描述/摘要",
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: "随笔",
      comment: "分类",
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: "标签数组",
    },
    cover_image: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "封面图URL",
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "阅读量",
    },
    status: {
      type: DataTypes.ENUM("published", "draft"),
      defaultValue: "published",
      comment: "文章状态",
    },
  },
  {
    timestamps: true,
    tableName: "articles",
  },
);

module.exports = Article;

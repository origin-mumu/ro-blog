const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Category = sequelize.define(
  "Category",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: "分类名称",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "分类描述",
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "分类颜色",
    },
    article_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "文章数量",
    },
  },
  {
    timestamps: true,
    tableName: "categories",
  },
);

module.exports = Category;

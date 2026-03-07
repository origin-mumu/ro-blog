const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
    timezone: "+08:00",
  },
);
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("数据库连接成功");
  } catch (error) {
    console.error("数据库连接失败:", error);
  }
};
testConnection();

module.exports = sequelize;

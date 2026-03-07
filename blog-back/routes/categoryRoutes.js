const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// 分类路由
router.get("/", categoryController.getAllCategories); // 获取所有分类
router.get("/:id", categoryController.getCategoryById); // 获取分类详情
router.post("/", categoryController.createCategory); // 创建新分类
router.put("/:id", categoryController.updateCategory); // 更新分类
router.delete("/:id", categoryController.deleteCategory); // 删除分类

module.exports = router;

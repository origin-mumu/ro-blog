const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");

// 文章路由
router.get("/", articleController.getAllArticles);
router.get("/:id", articleController.getArticleById);
router.post("/", articleController.createArticle);
router.put("/:id", articleController.updateArticle);
router.delete("/:id", articleController.deleteArticle);

// 分类和标签路由
router.get("/stats/summary", articleController.getBlogStats);

module.exports = router;

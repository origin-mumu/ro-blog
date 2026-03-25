const Article = require("../models/Article");
const Category = require("../models/Category");
const { Op } = require("sequelize");
const getAllArticles = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, tag } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (category) where.category = category;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }
    if (tag) {
      where.tags = { [Op.contains]: [tag] };
    }

    const articles = await Article.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: [
        "id",
        "title",
        "status",
        "description",
        "category",
        "tags",
        "cover_image",
        "view_count",
        "createdAt",
      ],
    });

    res.json({
      data: articles.rows,
      pagination: {
        current: parseInt(page),
        total: articles.count,
        pages: Math.ceil(articles.count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "获取文章列表失败",
      error: error.message,
    });
  }
};

// 获取文章详情
const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findByPk(id);

    if (!article) {
      return res.status(404).json({
        message: "文章不存在",
      });
    }

    // 增加阅读量
    await article.increment("view_count");

    res.json({
      data: article,
    });
  } catch (error) {
    res.status(500).json({
      message: "获取文章失败",
      error: error.message,
    });
  }
};

// 创建新文章
const createArticle = async (req, res) => {
  try {
    const { title, content, description, category, tags, cover_image, status } =
      req.body;
    const article = await Article.create({
      title,
      content,
      description,
      category,
      tags: tags || [],
      cover_image,
      status,
    });

    // 更新分类文章数量
    await updateCategoryCount(category);

    res.status(201).json({
      message: "文章创建成功",
      data: article,
    });
  } catch (error) {
    res.status(500).json({
      message: "创建文章失败",
      error: error.message,
    });
  }
};

// 更新文章
const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, description, category, tags, cover_image } =
      req.body;

    const article = await Article.findByPk(id);
    if (!article) {
      return res.status(404).json({
        message: "文章不存在",
      });
    }

    const oldCategory = article.category;
    await article.update({
      title,
      content,
      description,
      category,
      tags: tags || [],
      cover_image,
    });

    // 如果分类改变，更新两个分类的计数
    if (oldCategory !== category) {
      await updateCategoryCount(oldCategory);
      await updateCategoryCount(category);
    }

    res.json({
      message: "文章更新成功",
      data: article,
    });
  } catch (error) {
    res.status(500).json({
      message: "更新文章失败",
      error: error.message,
    });
  }
};

// 删除文章
const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findByPk(id);

    if (!article) {
      return res.status(404).json({
        message: "文章不存在",
      });
    }

    const category = article.category;
    await article.destroy();

    // 更新分类文章数量
    await updateCategoryCount(category);

    res.json({
      message: "文章删除成功",
    });
  } catch (error) {
    res.status(500).json({
      message: "删除文章失败",
      error: error.message,
    });
  }
};

// 获取博客统计信息
const getBlogStats = async (req, res) => {
  try {
    const totalArticles = await Article.count({
      where: { status: "published" },
    });
    const totalCategories = await Category.count();
    const totalViews = await Article.sum("view_count");

    // 热门文章
    const popularArticles = await Article.findAll({
      where: { status: "published" },
      order: [["createdAt", "DESC"]],
      limit: 4,
      attributes: [
        "id",
        "title",
        "view_count",
        "description",
        "createdAt",
        "category",
      ],
    });

    // 热门分类
    const popularCategories = await Category.findAll({
      order: [["article_count", "DESC"]],
      limit: 5,
    });

    res.json({
      data: {
        totalArticles,
        totalCategories,
        totalViews,
        popularArticles,
        popularCategories,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "获取统计信息失败",
      error: error.message,
    });
  }
};

// 辅助函数：更新分类文章数量
const updateCategoryCount = async (categoryName) => {
  try {
    const count = await Article.count({
      where: {
        category: categoryName,
        status: "published",
      },
    });

    const [category] = await Category.findOrCreate({
      where: { name: categoryName },
      defaults: { name: categoryName, article_count: count },
    });

    await category.update({ article_count: count });
  } catch (error) {
    console.error("更新分类计数失败:", error);
  }
};

module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  getBlogStats,
};

const Category = require("../models/Category");
const Article = require("../models/Article");

// 获取所有分类
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [["article_count", "DESC"]],
    });

    res.json({
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      message: "获取分类列表失败",
      error: error.message,
    });
  }
};

// 获取单个分类详情
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        message: "分类不存在",
      });
    }

    // 获取该分类下的文章
    const articles = await Article.findAll({
      where: {
        category: category.name,
        status: "published",
      },
      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "title",
        "description",
        "cover_image",
        "view_count",
        "createdAt",
      ],
    });

    res.json({
      data: {
        ...category.toJSON(),
        articles,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "获取分类详情失败",
      error: error.message,
    });
  }
};

// 创建新分类
const createCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    // 验证必填字段
    if (!name) {
      return res.status(400).json({
        message: "分类名称不能为空",
      });
    }

    // 检查分类名称是否已存在
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({
        message: "分类名称已存在",
      });
    }

    const category = await Category.create({
      name,
      description,
      color,
    });

    res.status(201).json({
      message: "分类创建成功",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      message: "创建分类失败",
      error: error.message,
    });
  }
};

// 更新分类
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        message: "分类不存在",
      });
    }

    // 如果修改了分类名称，检查是否重复
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ where: { name } });
      if (existingCategory) {
        return res.status(400).json({
          message: "分类名称已存在",
        });
      }
    }

    await category.update({
      name: name || category.name,
      description: description || category.description,
      color: color || category.color,
    });

    res.json({
      message: "分类更新成功",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      message: "更新分类失败",
      error: error.message,
    });
  }
};

// 删除分类
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        message: "分类不存在",
      });
    }

    // 检查该分类下是否有文章
    const articleCount = await Article.count({
      where: { category: category.name },
    });

    if (articleCount > 0) {
      return res.status(400).json({
        message: "该分类下有文章，无法删除",
        data: { articleCount },
      });
    }

    await category.destroy();

    res.json({
      message: "分类删除成功",
    });
  } catch (error) {
    res.status(500).json({
      message: "删除分类失败",
      error: error.message,
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

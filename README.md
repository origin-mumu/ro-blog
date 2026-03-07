# 个人博客系统

一个现代化的个人博客系统，采用前后端分离架构，支持文章管理、分类管理、数据统计等功能。

## 🌐 在线演示

- **前端博客**: http://47.94.128.65/

## 📋 项目特性

### 前端特性

- ✅ Vue 3 + TypeScript 现代化前端架构
- ✅ Element Plus UI 组件库
- ✅ 响应式设计，支持移动端
- ✅ 代码高亮和复制功能
- ✅ 文章搜索和分类筛选
- ✅ 数据可视化统计图表

### 后端特性

- ✅ Node.js + Express RESTful API
- ✅ MySQL 数据库 + Sequelize ORM
- ✅ 完整的 CRUD 操作
- ✅ 分页、搜索、过滤功能
- ✅ 阅读量统计
- ✅ 分类文章数自动更新

## 🏗️ 技术栈

### 前端技术栈 (ro-blog)

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI 组件**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP 客户端**: Axios
- **富文本编辑器**: WangEditor
- **图表库**: ECharts

### 后端技术栈 (blog-back)

- **运行时**: Node.js
- **框架**: Express.js
- **数据库**: MySQL
- **ORM**: Sequelize
- **跨域处理**: CORS
- **环境管理**: dotenv

## 📁 项目结构

```
blog/
├── ro-blog/                 # 前端博客系统
│   ├── src/
│   │   ├── api/            # API 接口
│   │   ├── components/     # 公共组件
│   │   ├── router/         # 路由配置
│   │   ├── views/          # 页面组件
│   │   └── utils/          # 工具函数
│   └── package.json
├── blog-back/              # 后端 API 服务
│   ├── config/             # 数据库配置
│   ├── controllers/        # 业务逻辑控制器
│   ├── models/            # 数据模型
│   ├── routes/            # 路由定义
│   └── app.js             # 应用入口
└── blog-admin/            # 管理后台（可选）
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- MySQL >= 5.7
- npm >= 7.0.0

### 后端启动

1. **安装依赖**

```bash
cd blog-back
npm install
```

2. **配置数据库**

```bash
# 复制环境变量文件
cp .env.example .env

# 编辑 .env 文件，配置数据库连接
DB_HOST=localhost
DB_NAME=blog_db
DB_USER=root
DB_PASS=your_password
DB_DIALECT=mysql
```

3. **启动服务**

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### 前端启动

1. **安装依赖**

```bash
cd ro-blog
npm install
```

2. **配置 API 地址**

```bash
# 编辑 src/utils/request.ts 中的 baseURL
baseURL: 'http://localhost:5000/api'
```

3. **启动开发服务器**

```bash
npm run dev
```

4. **构建生产版本**

```bash
npm run build
```

## 📊 API 接口

### 文章相关接口

- `GET /api/articles` - 获取文章列表（支持分页、搜索）
- `GET /api/articles/:id` - 获取文章详情
- `POST /api/articles` - 创建新文章
- `PUT /api/articles/:id` - 更新文章
- `DELETE /api/articles/:id` - 删除文章

### 分类相关接口

- `GET /api/categories` - 获取分类列表
- `GET /api/categories/:id` - 获取分类详情
- `POST /api/categories` - 创建新分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

### 统计接口

- `GET /api/articles/stats/summary` - 获取博客统计信息

## 🎯 功能模块

### 博客前台

- [x] 文章列表展示（分页、搜索）
- [x] 文章详情页（代码高亮、阅读统计）
- [x] 分类筛选
- [x] 响应式设计
- [x] 标签系统

### 管理后台

- [x] 文章管理（增删改查）
- [x] 分类管理
- [x] 富文本编辑器
- [x] 数据统计图表
- [x] 文章状态管理（发布/草稿）

## 🔧 部署说明

### 服务器部署

1. **安装 Node.js 和 MySQL**
2. **克隆项目到服务器**
3. **配置生产环境变量**
4. **构建前端项目**
5. **配置 Nginx 反向代理**
6. **使用 PM2 管理 Node.js 进程**

### Docker 部署（可选）

```bash
# 构建镜像
docker build -t blog-back .

# 运行容器
docker run -d -p 5000:5000 blog-back
```

## 📈 性能优化

- **前端**: Vite 构建优化、代码分割、懒加载
- **后端**: 数据库索引优化、查询性能优化
- **网络**: CDN 加速、Gzip 压缩

## 🐛 常见问题

### Q: 数据库连接失败

A: 检查 .env 文件中的数据库配置是否正确

### Q: 前端无法访问 API

A: 检查 request.ts 中的 baseURL 配置和后端 CORS 设置

### Q: 构建时报 TypeScript 错误

A: 确保所有 .vue 文件中的变量定义正确

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- 项目作者: 贾新科
- 邮箱: your-email@example.com
- 项目地址: https://github.com/your-username/blog

## 🙏 致谢

感谢以下开源项目的支持：

- Vue.js - 渐进式 JavaScript 框架
- Element Plus - Vue 3 组件库
- Express.js - Node.js Web 框架
- Sequelize - Node.js ORM

---

⭐ 如果这个项目对您有帮助，请给个 Star 支持一下！

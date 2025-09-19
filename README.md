# 🌐 Static Nav - 智能网站导航管理平台

一个现代化的网站导航管理平台，集成AI推荐、智能分类、多语言支持等功能，帮助用户高效管理和发现优质网站。

![React](https://img.shields.io/badge/React-19.1.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
![Vite](https://img.shields.io/badge/Vite-7.1.2-green)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.11-blue)

## ✨ 核心功能

### 🎯 网站管理
- **智能分类**：基于标签和分类的网站组织系统
- **批量操作**：支持批量添加、编辑、删除网站
- **数据导入**：支持浏览器书签导入和数据恢复
- **重复检测**：自动检测和处理重复网站

### 🤖 AI 智能功能
- **AI推荐**：基于用户偏好的智能网站推荐
- **内容增强**：AI自动获取和完善网站信息
- **详细介绍生成**：AI生成Markdown格式的网站详细介绍
- **流式输出**：实时显示AI生成过程
- **标签建议**：AI智能推荐相关标签

### 🔍 高级搜索与筛选
- **多维度筛选**：按标签、分类、评分、语言等筛选
- **智能搜索**：支持模糊搜索和关键词匹配
- **相关推荐**：基于标签相似度的网站推荐
- **分类浏览**：按整个分类快速筛选网站

### 🎨 用户体验
- **响应式设计**：完美适配桌面、平板、手机
- **多语言支持**：中文/英文界面切换
- **主题切换**：浅色/深色/跟随系统主题
- **现代化UI**：基于Radix UI和TailwindCSS的精美界面

### 📊 数据管理
- **本地存储**：数据存储在浏览器本地，保护隐私
- **数据备份**：支持数据导出和恢复
- **统计分析**：网站访问统计和使用分析
- **数据完整性**：自动检查和修复数据问题

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- npm 或 pnpm

### 安装依赖
```bash
npm install
# 或
pnpm install
```

### 环境配置
创建 `.env` 文件并配置必要的环境变量：

```bash
# AI 服务配置
VITE_AI_API_ENDPOINT=https://api.openai.com/v1/chat/completions
VITE_AI_API_KEY=your-openai-api-key
VITE_AI_MODEL=gpt-3.5-turbo
VITE_AI_MAX_TOKENS=2000
VITE_AI_TEMPERATURE=0.7

# Jina AI 配置（可选，用于网络搜索）
VITE_JINA_API_KEY=your-jina-api-key

# 应用配置（可选）
VITE_APP_TITLE=Static Nav
VITE_APP_DESCRIPTION=智能网站导航管理平台
```

详细的环境配置说明请参考 [环境配置文档](docs/ENVIRONMENT_SETUP.md)。

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 📁 项目结构

```
static-nav-vite/
├── src/
│   ├── components/          # React组件
│   │   ├── ai/             # AI相关组件
│   │   ├── data-management/ # 数据管理组件
│   │   ├── tag-management/  # 标签管理组件
│   │   ├── website/        # 网站相关组件
│   │   ├── website-form/   # 网站表单组件
│   │   └── ui/             # 基础UI组件
│   ├── contexts/           # React Context
│   ├── hooks/              # 自定义Hooks
│   ├── services/           # 服务层
│   ├── types/              # TypeScript类型定义
│   ├── utils/              # 工具函数
│   ├── data/               # 数据文件
│   ├── locales/            # 国际化文件
│   └── styles/             # 样式文件
├── docs/                   # 项目文档
├── scripts/                # 构建脚本
└── public/                 # 静态资源
```

## 🔧 技术栈

### 前端框架
- **React 19.1.1** - 用户界面框架
- **TypeScript 5.8.3** - 类型安全的JavaScript
- **Vite 7.1.2** - 现代化构建工具

### UI 组件库
- **Radix UI** - 无障碍的组件基础
- **TailwindCSS 4.1.11** - 实用优先的CSS框架
- **Lucide React** - 精美的图标库

### 路由和状态管理
- **React Router DOM** - 客户端路由
- **React Context** - 状态管理
- **Local Storage** - 数据持久化

### AI 和网络服务
- **OpenAI API** - AI推荐和内容生成
- **Jina AI** - 网络搜索和内容获取
- **Streaming API** - 实时流式输出

### 国际化和主题
- **react-i18next** - 国际化支持
- **next-themes** - 主题切换

### Markdown 支持
- **react-markdown** - Markdown渲染
- **remark-gfm** - GitHub风格Markdown
- **rehype-highlight** - 代码高亮

## 📖 功能文档

- [数据管理](docs/DATA_MANAGEMENT.md) - 数据结构和管理功能
- [相关推荐](docs/RELATED_RECOMMENDATIONS.md) - 智能推荐算法
- [网站图标优化](docs/WEBSITE_ICON_IMPROVEMENTS.md) - 图标显示和优化
- [导航改进](docs/NAVIGATION_IMPROVEMENTS.md) - 用户导航体验优化
- [Markdown支持](docs/MARKDOWN_SUPPORT.md) - Markdown功能说明
- [分享功能](docs/SHARE_FEATURE.md) - 数据分享和导入
- [环境配置](docs/ENVIRONMENT_SETUP.md) - 详细的环境配置指南

## 🎯 主要特性

### 智能推荐系统
- 基于标签相似度的推荐算法
- AI驱动的个性化推荐
- 实时网络搜索集成
- 多因子评分系统

### 现代化用户界面
- 响应式设计，完美适配各种设备
- 深色/浅色主题切换
- 流畅的动画和交互效果
- 无障碍设计支持

### 数据安全与隐私
- 本地数据存储，保护用户隐私
- 数据导出和备份功能
- 完整的数据恢复机制
- 数据完整性检查

## 🛠️ 开发指南

### 代码规范
项目使用 ESLint 和 TypeScript 确保代码质量：

```bash
npm run lint
```

### 环境检查
检查环境变量配置：

```bash
npm run env:check
```

### 数据生成
生成推荐数据：

```bash
npm run generate:data
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [React](https://reactjs.org/) - 用户界面框架
- [Vite](https://vitejs.dev/) - 构建工具
- [TailwindCSS](https://tailwindcss.com/) - CSS框架
- [Radix UI](https://www.radix-ui.com/) - 组件库
- [OpenAI](https://openai.com/) - AI服务
- [Jina AI](https://jina.ai/) - 搜索服务

---

**Static Nav** - 让网站管理更智能，让发现更简单 🚀

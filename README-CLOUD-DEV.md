# 云原生开发环境配置

本项目已配置云原生开发环境，支持通过 [cnb.cool](https://docs.cnb.cool/zh/workspaces/intro.html) 平台进行远程开发。

## 🚀 快速开始

### 1. 启动云原生开发环境

在仓库分支页面，点击右上角 `云原生开发` 按钮，一键创建开发环境。

### 2. 环境特性

- **声明式环境**：基于 Docker 生态，Dockerfile 声明开发环境
- **快速启动**：数秒内准备好代码和环境
- **按需使用**：按需获取开发资源，闲时快速回收

## 📁 项目结构

```
/workspace/
├── static-nav-vite/     # Vite + React + TypeScript 项目
├── static-nav-nuxt/     # Nuxt 3 + Vue 3 项目
├── static-nav-origin/   # React 项目
├── Dockerfile           # 开发环境镜像定义
├── .cnb.yml            # 云原生构建配置
└── scripts/            # 开发脚本
```

## 🛠️ 开发环境配置

### 技术栈

- **Node.js**: 22.x
- **包管理器**: pnpm
- **编辑器**: VSCode
- **语言**: TypeScript, JavaScript
- **框架**: React, Vue, Nuxt, Vite

### 端口配置

- **3000**: Nuxt 项目默认端口
- **5173**: Vite 项目默认端口
- **8080**: 备用端口

## 📋 开发命令

### 启动开发服务器

```bash
# Vite 项目
cd static-nav-vite
pnpm dev

# Nuxt 项目
cd static-nav-nuxt
pnpm dev

# React 项目
cd static-nav-origin
npm start
```

### 构建项目

```bash
# Vite 项目
cd static-nav-vite
pnpm build

# Nuxt 项目
cd static-nav-nuxt
pnpm build

# React 项目
cd static-nav-origin
npm run build
```

## 🔧 环境初始化

云原生开发环境启动时会自动执行以下操作：

1. 检查 Node.js 和 pnpm 版本
2. 为所有项目安装依赖
3. 配置开发工具和扩展
4. 显示可用的开发命令

## 🌐 访问地址

启动开发服务器后，可通过以下地址访问：

- **Vite 项目**: http://localhost:5173
- **Nuxt 项目**: http://localhost:3000
- **React 项目**: http://localhost:3001

## 📦 预装工具

- **编辑器**: VSCode
- **终端**: 支持多终端
- **包管理器**: pnpm, npm
- **开发工具**: git, curl, vim, nano, htop, tree

## 🔌 VSCode 扩展

环境预装了以下 VSCode 扩展：

- TypeScript 支持
- Tailwind CSS 支持
- Prettier 代码格式化
- ESLint 代码检查
- Vue 语言支持
- JSON 支持

## 📝 注意事项

1. 首次启动可能需要几分钟来构建 Docker 镜像
2. 所有依赖会自动安装，无需手动操作
3. 代码变更会自动保存
4. 环境支持热重载和实时预览

## 🆘 常见问题

### Q: 如何重启开发环境？
A: 在 cnb.cool 平台重新点击"云原生开发"按钮

### Q: 如何查看日志？
A: 在终端中运行相应的开发命令，日志会实时显示

### Q: 如何安装新的依赖？
A: 在项目目录中使用 `pnpm add <package>` 或 `npm install <package>`

## 📚 相关文档

- [云原生开发介绍](https://docs.cnb.cool/zh/workspaces/intro.html)
- [默认开发环境](https://docs.cnb.cool/zh/workspaces/default.html)
- [自定义开发环境](https://docs.cnb.cool/zh/workspaces/custom.html)

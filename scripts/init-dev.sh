#!/bin/sh

echo "🚀 正在初始化云原生开发环境..."

# 检查 Node.js 版本
echo "📦 Node.js 版本: $(node --version)"
echo "📦 pnpm 版本: $(pnpm --version)"

# 进入工作目录
cd /workspace

# 为每个项目安装依赖
echo "📦 正在安装 static-nav-vite 依赖..."
cd static-nav-vite
if [ -f "package.json" ]; then
    pnpm install
    echo "✅ static-nav-vite 依赖安装完成"
else
    echo "⚠️  static-nav-vite 项目不存在或没有 package.json"
fi

echo "📦 正在安装 static-nav-nuxt 依赖..."
cd ../static-nav-nuxt
if [ -f "package.json" ]; then
    pnpm install
    echo "✅ static-nav-nuxt 依赖安装完成"
else
    echo "⚠️  static-nav-nuxt 项目不存在或没有 package.json"
fi

echo "📦 正在安装 static-nav-origin 依赖..."
cd ../static-nav-origin
if [ -f "package.json" ]; then
    npm install
    echo "✅ static-nav-origin 依赖安装完成"
else
    echo "⚠️  static-nav-origin 项目不存在或没有 package.json"
fi

# 返回根目录
cd /workspace

echo "🎉 开发环境初始化完成！"
echo ""
echo "📋 可用的开发命令："
echo "  • static-nav-vite:   cd static-nav-vite && pnpm dev"
echo "  • static-nav-nuxt:   cd static-nav-nuxt && pnpm dev"
echo "  • static-nav-origin: cd static-nav-origin && npm start"
echo ""
echo "🌐 访问地址："
echo "  • Vite 项目: http://localhost:5173"
echo "  • Nuxt 项目: http://localhost:3000"
echo "  • React 项目: http://localhost:3001"

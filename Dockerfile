# 使用 Node.js 22 作为基础镜像
FROM node:22-alpine

# 设置工作目录
WORKDIR /workspace

# 安装 pnpm 包管理器
RUN npm install -g pnpm

# 安装常用开发工具
RUN apk add --no-cache \
    git \
    curl \
    wget \
    vim \
    nano \
    htop \
    tree \
    && rm -rf /var/cache/apk/*

# 设置环境变量
ENV NODE_ENV=development
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# 创建必要的目录
RUN mkdir -p /workspace/static-nav-vite \
    && mkdir -p /workspace/static-nav-nuxt \
    && mkdir -p /workspace/static-nav-origin

# 暴露常用端口
EXPOSE 3000 3001 5173 8080

# 设置默认命令
CMD ["/bin/sh"]

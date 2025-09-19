# 环境变量配置说明

## 🔧 环境变量配置

本项目支持多种AI服务和功能配置，通过环境变量进行管理。

### 📋 必需的环境变量

#### AI 服务配置

```bash
# AI API 端点（支持 OpenAI 或兼容的第三方API）
VITE_AI_API_ENDPOINT=https://api.openai.com/v1/chat/completions

# AI API 密钥
VITE_AI_API_KEY=sk-your-openai-api-key-here

# AI 模型名称
VITE_AI_MODEL=gpt-3.5-turbo

# AI 最大令牌数
VITE_AI_MAX_TOKENS=2000

# AI 温度参数 (0-2，控制创造性)
VITE_AI_TEMPERATURE=0.7
```

#### Jina AI 配置（可选）

```bash
# Jina AI API 密钥（用于网络搜索和AI推荐功能）
# 可从 https://jina.ai 获取
VITE_JINA_API_KEY=jina_your-jina-api-key-here
```

#### 应用配置（可选）

```bash
# 应用标题
VITE_APP_TITLE=Static Nav

# 应用描述
VITE_APP_DESCRIPTION=静态导航网站管理工具
```

## 🌐 获取API密钥

### OpenAI API Key

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 登录或注册账户
3. 进入 API Keys 页面
4. 点击 "Create new secret key"
5. 复制生成的密钥（格式：`sk-...`）

### Jina AI API Key

1. 访问 [Jina AI](https://jina.ai/)
2. 注册账户并登录
3. 进入 Dashboard 或 API Keys 页面
4. 创建新的API密钥
5. 复制生成的密钥（格式：`jina_...`）

## 🚀 部署配置

### 本地开发

1. 在项目根目录创建 `.env.local` 文件
2. 添加上述环境变量
3. 重启开发服务器

```bash
npm run dev
```

### Vercel 部署

1. 在 Vercel 项目设置中添加环境变量
2. 进入 Project Settings → Environment Variables
3. 添加所需的环境变量

### Netlify 部署

1. 在 Netlify 项目设置中添加环境变量
2. 进入 Site Settings → Environment Variables
3. 添加所需的环境变量

### Cloudflare Pages 部署

1. 在 Cloudflare Pages 项目设置中添加环境变量
2. 进入 Settings → Environment Variables
3. 添加所需的环境变量

## 🔒 安全注意事项

1. **永远不要** 将API密钥提交到版本控制系统
2. 使用 `.env.local` 文件进行本地开发
3. 在生产环境中使用平台提供的环境变量管理
4. 定期轮换API密钥
5. 为不同环境使用不同的API密钥

## 🧪 功能说明

### AI推荐功能

- **基础功能**：仅使用AI模型生成推荐
- **增强功能**：配置Jina AI Key后，会先进行网络搜索获取最新信息，然后结合搜索结果生成更准确的推荐

### Jina Search 集成

配置 `VITE_JINA_API_KEY` 后，AI推荐功能将：

1. 首先使用 [Jina Search API](https://s.jina.ai/) 搜索相关网站
2. 将搜索结果作为上下文提供给AI模型
3. 生成更准确、更新的网站推荐

## 🐛 故障排除

### API密钥无效

如果遇到API密钥错误：
1. 检查密钥格式是否正确
2. 确认密钥是否已激活
3. 检查是否有足够的API配额

### 环境变量未生效

如果环境变量未生效：
1. 确认变量名拼写正确（包括 `VITE_` 前缀）
2. 重启开发服务器
3. 检查浏览器开发者工具中的环境变量调试信息

### Jina Search 失败

如果网络搜索功能失败：
1. 检查 Jina API Key 是否正确配置
2. 确认网络连接正常
3. 查看浏览器控制台的错误信息

## 📞 技术支持

如需帮助，请：
1. 查看浏览器开发者工具中的错误信息
2. 检查网络连接和API配额
3. 参考官方API文档：
   - [OpenAI API](https://platform.openai.com/docs)
   - [Jina AI](https://jina.ai/reader)

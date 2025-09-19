# 环境变量配置指南

本项目支持通过环境变量配置AI服务，适用于各种托管平台。

## 环境变量列表

### AI服务配置

| 变量名 | 描述 | 默认值 | 必需 |
|--------|------|--------|------|
| `VITE_AI_API_ENDPOINT` | AI API端点 | `https://api.openai.com/v1/chat/completions` | 是 |
| `VITE_AI_API_KEY` | AI API密钥 | 空 | 是 |
| `VITE_AI_MODEL` | AI模型名称 | `gpt-3.5-turbo` | 否 |
| `VITE_AI_MAX_TOKENS` | 最大令牌数 | `2000` | 否 |
| `VITE_AI_TEMPERATURE` | 温度参数 | `0.7` | 否 |

### 应用配置

| 变量名 | 描述 | 默认值 | 必需 |
|--------|------|--------|------|
| `VITE_APP_TITLE` | 应用标题 | `Static Nav` | 否 |
| `VITE_APP_DESCRIPTION` | 应用描述 | `静态导航网站管理工具` | 否 |

## 配置方法

### 1. 本地开发环境

创建 `.env.local` 文件：

```bash
# AI服务配置
VITE_AI_API_ENDPOINT=https://api.openai.com/v1/chat/completions
VITE_AI_API_KEY=your_api_key_here
VITE_AI_MODEL=gpt-3.5-turbo
VITE_AI_MAX_TOKENS=2000
VITE_AI_TEMPERATURE=0.7

# 应用配置
VITE_APP_TITLE=Static Nav
VITE_APP_DESCRIPTION=静态导航网站管理工具
```

### 2. Cloudflare Pages

在 Cloudflare Pages 项目设置中添加环境变量：

1. 进入 Cloudflare Pages 项目
2. 点击 "Settings" → "Environment variables"
3. 添加以下变量：

```
VITE_AI_API_ENDPOINT = https://api.openai.com/v1/chat/completions
VITE_AI_API_KEY = your_api_key_here
VITE_AI_MODEL = gpt-3.5-turbo
VITE_AI_MAX_TOKENS = 2000
VITE_AI_TEMPERATURE = 0.7
```

### 3. Vercel

在 Vercel 项目设置中添加环境变量：

1. 进入 Vercel 项目
2. 点击 "Settings" → "Environment Variables"
3. 添加变量并选择环境（Production, Preview, Development）

### 4. Netlify

在 Netlify 项目设置中添加环境变量：

1. 进入 Netlify 项目
2. 点击 "Site settings" → "Environment variables"
3. 添加变量

### 5. GitHub Pages

GitHub Pages 不支持环境变量，建议：

1. 使用 GitHub Actions 构建时注入环境变量
2. 或者使用其他支持环境变量的托管平台

## 安全注意事项

### ⚠️ 重要安全提醒

1. **不要在前端代码中硬编码API密钥**
2. **不要将包含真实API密钥的 `.env.local` 文件提交到版本控制**
3. **在生产环境中使用环境变量配置**
4. **定期轮换API密钥**

### 推荐的API密钥管理方式

1. **环境变量**：在托管平台设置环境变量
2. **密钥管理服务**：使用 AWS Secrets Manager、Azure Key Vault 等
3. **代理服务**：通过后端代理API请求，避免前端直接暴露密钥

## 支持的AI服务

### OpenAI API
```bash
VITE_AI_API_ENDPOINT=https://api.openai.com/v1/chat/completions
VITE_AI_API_KEY=sk-your-openai-key
VITE_AI_MODEL=gpt-3.5-turbo
```

### Azure OpenAI
```bash
VITE_AI_API_ENDPOINT=https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions?api-version=2023-12-01-preview
VITE_AI_API_KEY=your-azure-key
VITE_AI_MODEL=gpt-35-turbo
```

### 其他兼容服务
```bash
VITE_AI_API_ENDPOINT=https://your-api-endpoint/v1/chat/completions
VITE_AI_API_KEY=your-api-key
VITE_AI_MODEL=your-model-name
```

## 故障排除

### 常见问题

1. **API密钥未生效**
   - 检查环境变量名称是否正确（必须以 `VITE_` 开头）
   - 确认在正确的环境中设置了变量
   - 重新部署应用

2. **API请求失败**
   - 检查API端点是否正确
   - 确认API密钥有效
   - 检查网络连接和防火墙设置

3. **环境变量读取失败**
   - 确认变量名称拼写正确
   - 检查托管平台的环境变量设置
   - 查看浏览器控制台错误信息

### 调试方法

1. **开发环境调试**：
   ```javascript
   // 在浏览器控制台中查看配置
   console.log('AI配置状态:', window.envConfig);
   ```

2. **检查环境变量**：
   ```javascript
   // 检查特定变量
   console.log('API端点:', import.meta.env.VITE_AI_API_ENDPOINT);
   ```

## 更新日志

- **v1.0.0**: 初始版本，支持基本的环境变量配置
- **v1.1.0**: 添加多平台支持（Cloudflare Pages、Vercel、Netlify）
- **v1.2.0**: 增强安全性和错误处理

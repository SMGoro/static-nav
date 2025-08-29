# AI 智能推荐功能

## 功能概述

AI智能推荐功能允许用户通过自然语言描述需求，让AI自动推荐相关的优质网站。所有AI推荐的网站都会自动添加"AI推荐"标签，便于识别和管理。

## 主要特性

### 1. 智能推荐
- 支持自然语言查询
- 基于用户需求推荐相关网站
- 自动生成网站描述和标签
- 智能分类和标签分配

### 2. 多API支持
- 支持OpenAI API
- 支持Claude API
- 支持Moonshot API
- 支持其他OpenAI兼容的第三方API

### 3. 自动标签管理
- 所有AI推荐的网站自动添加"AI推荐"标签
- 智能去重和标签优化
- 支持自定义标签

### 4. 配置管理
- 可视化配置界面
- 支持多种预设配置
- 配置测试功能
- 本地存储配置

## 使用方法

### 1. 配置AI服务

1. 访问AI推荐页面 (`/ai`)
2. 点击右上角的"配置"按钮
3. 选择或配置API服务：
   - **OpenAI GPT-3.5**: 适合一般推荐需求
   - **OpenAI GPT-4**: 更高质量的推荐
   - **Claude 3 Sonnet**: 优秀的推理能力
   - **Moonshot**: 国内可用的AI服务
4. 输入API密钥（如需要）
5. 点击"测试连接"验证配置
6. 保存配置

### 2. 获取AI推荐

1. 在查询框中详细描述您的需求
   ```
   例如：
   - "我需要一些设计灵感网站"
   - "推荐优秀的编程学习资源"
   - "找一些提高工作效率的工具"
   ```

2. 选择偏好分类（可选）
   - 开发工具
   - 设计资源
   - 学习平台
   - 效率工具
   - AI工具
   - 娱乐休闲
   - 新闻资讯
   - 其他

3. 设置推荐数量（3-10个）

4. 点击"获取AI推荐"

### 3. 管理推荐结果

1. **查看推荐理由**: AI会解释为什么推荐这些网站
2. **预览网站**: 点击"预览"按钮在新标签页打开网站
3. **添加网站**: 点击"添加"按钮将网站添加到导航
4. **查看置信度**: 显示AI推荐的置信度百分比

## 技术实现

### API兼容性

支持所有OpenAI兼容的API接口，包括：

```typescript
interface AIConfig {
  apiEndpoint: string;    // API端点
  apiKey?: string;        // API密钥（可选）
  model?: string;         // 模型名称
  maxTokens?: number;     // 最大令牌数
  temperature?: number;   // 创造性参数
}
```

### 推荐流程

1. **用户输入**: 接收用户的需求描述
2. **Prompt构建**: 构建结构化的AI提示词
3. **API调用**: 调用配置的AI服务
4. **响应解析**: 解析AI返回的JSON数据
5. **数据验证**: 验证和清理推荐数据
6. **标签处理**: 自动添加"AI推荐"标签
7. **结果展示**: 展示推荐结果和理由

### 数据结构

```typescript
interface AIWebsiteRecommendation {
  title: string;           // 网站标题
  description: string;     // 网站描述
  url: string;            // 网站URL
  category: string;       // 网站分类
  tags: string[];         // 标签列表（包含"AI推荐"）
  icon?: string;          // 网站图标
  features?: string[];    // 功能特性
  fullDescription?: string; // 详细描述
  language?: string;      // 语言支持
  isPaid?: boolean;       // 是否付费
  authoredBy?: string;    // 作者/团队
}
```

## 配置示例

### OpenAI配置
```json
{
  "apiEndpoint": "https://api.openai.com/v1/chat/completions",
  "apiKey": "sk-your-api-key",
  "model": "gpt-3.5-turbo",
  "maxTokens": 2000,
  "temperature": 0.7
}
```

### Claude配置
```json
{
  "apiEndpoint": "https://api.anthropic.com/v1/messages",
  "apiKey": "sk-ant-your-api-key",
  "model": "claude-3-sonnet-20240229",
  "maxTokens": 2000,
  "temperature": 0.7
}
```

### Moonshot配置
```json
{
  "apiEndpoint": "https://api.moonshot.cn/v1/chat/completions",
  "apiKey": "your-api-key",
  "model": "moonshot-v1-8k",
  "maxTokens": 2000,
  "temperature": 0.7
}
```

## 最佳实践

### 1. 查询优化
- 使用具体、详细的描述
- 包含关键词和领域信息
- 说明具体的使用场景

### 2. 配置建议
- 根据需求选择合适的模型
- 调整temperature参数控制创造性
- 设置合理的maxTokens限制

### 3. 结果管理
- 定期检查AI推荐的网站质量
- 利用"AI推荐"标签进行筛选
- 结合用户反馈优化推荐

## 故障排除

### 常见问题

1. **API连接失败**
   - 检查API端点是否正确
   - 验证API密钥是否有效
   - 确认网络连接正常

2. **推荐质量不佳**
   - 尝试更详细的查询描述
   - 调整temperature参数
   - 选择更高级的模型

3. **响应解析失败**
   - 检查API返回格式
   - 验证JSON结构
   - 查看控制台错误信息

### 调试技巧

1. 使用浏览器开发者工具查看网络请求
2. 检查API响应的原始数据
3. 查看控制台的错误日志
4. 使用配置页面的测试功能

## 未来改进

1. **智能过滤**: 基于用户历史推荐更精准的内容
2. **批量操作**: 支持批量添加推荐的网站
3. **推荐历史**: 保存和查看历史推荐记录
4. **用户反馈**: 收集用户对推荐的反馈
5. **个性化**: 基于用户偏好个性化推荐
6. **多语言**: 支持多语言查询和推荐

# 推荐数据生成器 CLI 工具

这个CLI工具用于基于现有的标签分类和网站数据生成推荐网站数据，保存到 `data/` 文件夹内作为默认数据展示。

## 功能特性

- 🎯 **智能推荐**: 基于现有标签分类和网站数据生成相关推荐
- 📊 **数据丰富**: 生成包含评分、评论、功能特性等完整信息的网站数据
- 🏷️ **标签扩展**: 自动生成新的推荐标签，扩展标签库
- 📁 **多格式输出**: 支持JSON和TypeScript格式输出
- 📈 **统计报告**: 生成详细的数据统计报告

## 使用方法

### 1. 基本使用

```bash
# 在项目根目录运行
npm run generate:recommendations

# 或者使用别名
npm run generate:data
```

### 2. 直接运行脚本

```bash
# 使用Node.js直接运行
node scripts/generate-recommendations.mjs
```

## 输出文件

运行后会在 `data/` 文件夹中生成以下文件：

### 数据文件
- `recommended-websites.json` - 推荐网站数据（JSON格式）
- `recommended-websites.ts` - 推荐网站数据（TypeScript格式）
- `recommended-tags.json` - 推荐标签数据（JSON格式）
- `recommended-tags.ts` - 推荐标签数据（TypeScript格式）

### 统计文件
- `generation-stats.json` - 生成统计报告

## 数据结构

### 推荐网站数据结构

```typescript
interface Website {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
  tags: string[];
  addedDate: string;
  clicks: number;
  featured: boolean;
  fullDescription?: string;
  screenshots?: string[];
  features?: string[];
  rating?: number;
  reviews?: Review[];
  relatedSites?: string[];
  lastUpdated?: string;
  language?: string;
  isPaid?: boolean;
  authoredBy?: string;
  isBuiltIn?: boolean;
  slug?: string;
}
```

### 推荐标签数据结构

```typescript
interface Tag {
  id: string;
  name: string;
  count: number;
  color: string;
  description?: string;
  category?: string;
  createdDate?: string;
  isCore?: boolean;
}
```

## 推荐算法

### 网站推荐逻辑

1. **分类匹配**: 根据现有标签的分类（技术、设计、效率、团队、商业等）生成对应类别的网站
2. **模板扩展**: 使用预定义的网站模板，包含真实的热门工具和平台
3. **数据丰富**: 自动生成评分、评论、点击量等模拟数据
4. **关联推荐**: 基于现有网站生成相关网站推荐

### 标签推荐逻辑

1. **分类扩展**: 为每个现有分类生成新的相关标签
2. **热门趋势**: 包含当前热门的技术和工具标签
3. **避免重复**: 自动过滤已存在的标签名称

## 支持的分类

- **技术**: 开发工具、AI工具、代码托管、部署平台等
- **设计**: 设计工具、UI/UX、CSS框架等
- **效率**: 生产力工具、任务管理、笔记等
- **团队**: 协作工具、项目管理等
- **商业**: 支付处理、营销工具等

## 自定义配置

可以通过修改 `scripts/generate-recommendations.mjs` 文件来自定义：

- 推荐网站数量
- 推荐标签数量
- 网站模板数据
- 标签模板数据
- 生成规则和算法

## 示例输出

```bash
🚀 开始生成推荐网站数据...
✅ 推荐数据生成完成！
📊 统计信息:
   - 推荐网站: 25 个
   - 推荐标签: 15 个
   - 特色网站: 8 个
   - 付费工具: 18 个
   - 免费工具: 7 个
📁 文件已保存到: /path/to/data
   - recommended-websites.json/ts
   - recommended-tags.json/ts
   - generation-stats.json
```

## 注意事项

1. 生成的数据是模拟数据，用于展示和测试
2. 网站URL和图标信息基于真实工具，但其他数据为模拟生成
3. 每次运行都会生成新的随机数据
4. 建议在开发环境中使用，生产环境请使用真实数据

## 故障排除

如果遇到问题，请检查：

1. Node.js版本是否支持ES模块
2. 文件路径是否正确
3. 是否有写入权限
4. 控制台错误信息

## 贡献

欢迎提交Issue和Pull Request来改进这个工具！


# 相关推荐功能说明

## 🎯 功能概述

相关推荐功能基于标签相似度算法，从已有网站数据中智能筛选和推荐与当前网站相关的其他网站。推荐结果按相同标签数量和综合评分排序，为用户提供个性化的网站发现体验。

## 🔧 核心算法

### 推荐评分算法

推荐系统采用多因子评分算法，综合考虑以下因素：

#### 1. 标签相似度（主要因子）

- **Jaccard相似度**：`相同标签数 / 总标签数（去重）`
- **基础相关性加分**：有相同标签时额外加0.3分
- **排序优先级**：相同标签数量越多，排序越靠前

#### 2. 网站质量评分

- **评分加成**：4分以上网站获得额外加分
- **热门程度**：基于访问量的受欢迎度加成
- **精选标识**：精选网站获得0.15分加成

#### 3. 分类相关性

- **域名相似性**：同一主域名网站获得高加成
- **描述关键词**：基于描述文本的语义相似性

### 推荐排序规则

1. **首要排序**：相同标签数量（降序）
2. **次要排序**：综合评分（降序）
3. **辅助因子**：评分、访问量、精选状态

## 📊 功能特性

### 智能推荐

- ✅ **标签匹配**：基于标签相似度的精准推荐
- ✅ **质量筛选**：优先推荐高质量、热门网站
- ✅ **多样性保证**：避免推荐过于相似的网站
- ✅ **实时更新**：基于最新数据动态生成推荐

### 用户体验

- ✅ **可视化展示**：清晰展示推荐理由和相关度
- ✅ **交互操作**：支持直接访问和查看详情
- ✅ **统计信息**：提供推荐质量统计数据
- ✅ **刷新功能**：支持重新生成推荐

### 数据分析

- ✅ **推荐统计**：平均相关度、相同标签数等指标
- ✅ **理由分析**：展示主要推荐理由分布
- ✅ **点击追踪**：记录用户访问行为

## 🎨 UI组件

### RelatedRecommendations 组件

```typescript
interface RelatedRecommendationsProps {
  currentWebsite: Website;
  maxResults?: number; // 默认6个
}
```

#### 功能特性

- **双标签页设计**：推荐列表 + 统计信息
- **排名显示**：清晰的推荐排序
- **相关度可视化**：分数、标签匹配数量
- **操作按钮**：访问网站、查看详情
- **加载状态**：友好的加载和空状态提示

#### 推荐卡片信息

- 网站基本信息（标题、描述、图标）
- 质量标识（精选、评分、访问量）
- 相关性指标（相同标签、相关度分数）
- 推荐理由说明
- 快捷操作按钮

## 🔍 使用示例

### 基本用法

```typescript
import { RelatedRecommendations } from './components/website/related-recommendations';

// 在网站详情页中使用
<RelatedRecommendations 
  currentWebsite={website} 
  maxResults={6} 
/>
```

### 服务层调用

```typescript
import { WebsiteRecommendationService } from './services/website-recommendation-service';

// 获取推荐结果
const recommendations = WebsiteRecommendationService.getRecommendations(
  currentWebsite,
  allWebsites,
  {
    maxResults: 6,
    minScore: 0.1,
    excludeCurrentWebsite: true,
    includeRating: true,
    includePopularity: true,
    includeFeatured: true
  }
);

// 获取统计信息
const stats = WebsiteRecommendationService.getRecommendationStats(recommendations);
```

## 📈 推荐效果示例

### 高质量推荐场景

**当前网站**：GitHub（标签：开发工具、代码托管、Git、开源、协作）

**推荐结果**：

1. **GitLab**（5个相同标签）- 相关度：0.95
2. **Bitbucket**（4个相同标签）- 相关度：0.87
3. **SourceForge**（3个相同标签）- 相关度：0.76
4. **VS Code**（2个相同标签）- 相关度：0.65

### 推荐理由示例

- "5个相同标签、精选推荐、热门网站"
- "4个相同标签、高评分(4.5)"
- "3个相同标签、同类型网站"
- "2个相同标签、热门网站(12150次访问)"

## 🎯 算法优化

### 当前优化策略

1. **标签权重**：核心标签获得更高权重
2. **质量过滤**：低质量网站自动过滤
3. **多样性保证**：避免推荐过于相似的网站
4. **实时性**：基于最新访问数据调整推荐

### 未来优化方向

1. **用户行为学习**：基于用户点击行为优化推荐
2. **语义分析**：基于描述文本的深度语义匹配
3. **协同过滤**：结合用户相似度的推荐算法
4. **A/B测试**：不同推荐策略的效果对比

## 🔧 配置选项

### RecommendationOptions

```typescript
interface RecommendationOptions {
  maxResults?: number;        // 最大推荐数量
  minScore?: number;          // 最低推荐分数
  excludeCurrentWebsite?: boolean; // 排除当前网站
  includeRating?: boolean;    // 包含评分因子
  includePopularity?: boolean; // 包含热门度因子
  includeFeatured?: boolean;  // 包含精选因子
}
```

### 默认配置

- `maxResults`: 6
- `minScore`: 0.1
- `excludeCurrentWebsite`: true
- `includeRating`: true
- `includePopularity`: true
- `includeFeatured`: true

## 📊 性能指标

### 推荐质量指标

- **覆盖率**：有推荐结果的网站比例
- **准确率**：用户点击推荐的比例
- **多样性**：推荐结果的多样性程度
- **新颖性**：推荐新网站的能力

### 系统性能

- **响应时间**：推荐生成耗时 < 100ms
- **内存使用**：轻量级算法，内存占用小
- **扩展性**：支持大规模网站数据

## 🚀 部署说明

相关推荐功能已完全集成到网站详情页面，无需额外配置即可使用。功能特点：

- ✅ **零配置**：开箱即用
- ✅ **自适应**：根据数据量自动调整
- ✅ **高性能**：客户端计算，响应迅速
- ✅ **可扩展**：支持自定义推荐策略

推荐功能将显著提升用户的网站发现体验，增加用户在平台上的停留时和探索深度。

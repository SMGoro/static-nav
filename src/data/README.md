# 数据结构文档

## 概述

为了更好地组织和管理网站数据，我们将原来的单一mock-data.ts文件拆分为了三个独立的数据文件，并添加了排序功能。

## 文件结构

```
src/data/
├── websites-basic.ts     # 网站基础信息
├── websites-detail.ts    # 网站详细信息  
├── tags.ts              # 标签分类数据
├── data-utils.ts        # 数据处理工具函数
├── mock-data.ts         # 主导出文件（兼容性）
└── README.md           # 本文档
```

## 数据类型

### WebsiteBasic - 网站基础信息
```typescript
interface WebsiteBasic {
  id: string;           // 唯一标识符
  title: string;        // 网站标题
  description: string;  // 简短描述
  url: string;         // 网站链接
  icon: string;        // 图标
  tags: string[];      // 标签数组
  sortOrder?: number;  // 排序字段（数值越小排序越靠前）
}
```

### WebsiteDetail - 网站详细信息
```typescript
interface WebsiteDetail {
  id: string;              // 对应基础信息的ID
  addedDate: string;       // 添加日期
  clicks: number;          // 点击次数
  featured: boolean;       // 是否为特色网站
  fullDescription?: string; // 详细描述
  screenshots?: string[];   // 截图数组
  features?: string[];      // 功能特性
  rating?: number;         // 评分
  reviews?: Review[];      // 用户评价
  relatedSites?: string[]; // 相关网站ID
  lastUpdated?: string;    // 最后更新时间
  language?: string;       // 支持语言
  isPaid?: boolean;        // 是否付费
  authoredBy?: string;     // 开发者/公司
  isBuiltIn?: boolean;     // 是否为内置数据
  slug?: string;          // SEO友好的URL
}
```

### Tag - 标签信息
```typescript
interface Tag {
  id: string;          // 标签ID
  name: string;        // 标签名称
  count: number;       // 使用次数
  color: string;       // 标签颜色
  description?: string; // 标签描述
  category?: string;   // 标签分类名称
  createdDate?: string; // 创建日期
  isCore?: boolean;    // 是否为核心标签
}
```

### TagCategory - 标签分类
```typescript
interface TagCategory {
  id: string;          // 分类ID
  name: string;        // 分类名称
  description?: string; // 分类描述
  tagIds: string[];    // 包含的标签ID列表
  createdDate?: string; // 创建日期
  color?: string;      // 分类主色调
  icon?: string;       // 分类图标
  sortOrder?: number;  // 排序字段
}
```

## 使用方法

### 导入数据
```typescript
// 导入分离的数据
import { websitesBasic, websitesDetail, tagCategories, mockTags } from '@/data/mock-data';

// 导入完整合并后的数据（向后兼容）
import { mockWebsites } from '@/data/mock-data';

// 导入工具函数
import { 
  mergeWebsiteData, 
  sortWebsitesByOrder,
  getTagCategoryById,
  getTagsFromCategory,
  sortCategoriesByOrder 
} from '@/data/data-utils';
```

### 使用工具函数
```typescript
// 合并基础信息和详细信息（会自动为缺失的详细信息创建默认值）
const websites = mergeWebsiteData(websitesBasic, websitesDetail);

// 按标签筛选
const filteredWebsites = filterWebsitesByTags(websitesBasic, ['开发工具', 'AI工具']);

// 按排序字段排序
const sortedWebsites = sortWebsitesByOrder(websites);

// 获取单个网站信息
const basicInfo = getWebsiteBasic(websitesBasic, 'website-id');
const detailInfo = getWebsiteDetail(websitesDetail, 'website-id');

// 标签分类相关操作
const category = getTagCategoryById(tagCategories, 'tech');
const categoryTags = getTagsFromCategory(category, mockTags);
const sortedCategories = sortCategoriesByOrder(tagCategories);

// 获取分类下的核心标签
const coreTags = getCoreTagsFromCategory(category, mockTags);

// 按使用次数排序分类中的标签
const popularTags = sortTagsByCount(category, mockTags);
```

## 排序功能

### sortOrder字段
- 数值越小，排序越靠前
- 如果没有设置sortOrder，会自动分配默认值
- 默认值为 `(index + 1) * 10`，保证有足够的空间插入新项

### 排序示例
```typescript
// 手动设置排序
const websites = [
  { id: '1', title: 'GitHub', sortOrder: 1 },    // 排第1
  { id: '2', title: 'Figma', sortOrder: 5 },     // 排第2  
  { id: '3', title: 'VS Code', sortOrder: 10 }   // 排第3
];
```

## 数据维护

### 添加新网站
1. 在 `websites-basic.ts` 中添加基础信息
2. 在 `websites-detail.ts` 中添加对应的详细信息
3. 确保两个文件中的ID一致
4. 设置合适的 `sortOrder` 值

### 添加新标签
1. 在 `tags.ts` 中添加新标签
2. 更新相关网站的tags数组
3. 更新标签的count值

### 管理标签分类
1. 在 `tags.ts` 中添加新的标签分类
2. 在 `tagCategories` 数组中定义分类信息
3. 在分类的 `tagIds` 中引用对应的标签ID
4. 设置合适的 `sortOrder` 控制分类显示顺序

### 最佳实践
- 保持ID的一致性
- 合理设置sortOrder值，留有调整空间
- 及时更新标签的使用次数
- 保持数据的完整性和一致性
- 标签与分类的关联要准确无误
- 分类图标使用Emoji或图标字体

## 标签分类详情

### 当前分类结构
```
技术 (tech) ⚙️
├── 开发工具, 代码托管, 人工智能, 部署平台
├── 前端, CDN, Next.js, 静态网站
└── ...

设计 (design) 🎨  
├── 设计工具, UI/UX, CSS框架
├── UI, 响应式, 实用优先
└── ...

效率 (productivity) ⚡
├── 生产力工具, 笔记, 任务管理
├── 任务跟踪
└── ...

团队 (collaboration) 👥
├── 协作, 敏捷开发
└── ...

AI & 创作 (ai) 🤖
├── AI工具, 内容生成
└── ...

商业 (business) 💼
├── 支付处理, 金融科技, 电商
└── ...
```

## 数据容错机制

### 缺失详细信息的处理
当网站基础信息存在但详细信息缺失时，`mergeWebsiteData` 函数会：

1. **自动创建默认详细信息**：
   - `addedDate`: 当前时间
   - `clicks`: 0
   - `featured`: false
   - `rating`: 0
   - `reviews`: []
   - `language`: '未知'
   - `isPaid`: false
   - `slug`: 使用网站ID作为默认slug

2. **Slug保证机制**：
   - 如果详细信息中的slug为空，自动使用网站ID
   - 确保每个网站都有有效的URL路径

3. **控制台警告**：
   - 当检测到缺失详细信息时，会在控制台输出警告信息
   - 帮助开发者发现数据不完整的情况

### 示例
```typescript
// 即使只有基础信息，也能正常工作
const incompleteBasic = [
  { id: 'test', title: 'Test Site', description: 'A test', url: 'https://test.com', icon: '🔧', tags: ['测试'] }
];
const emptyDetail = [];

// 会自动生成默认详细信息
const websites = mergeWebsiteData(incompleteBasic, emptyDetail);
// 结果：网站slug为'test'，其他字段为默认值
```

## 兼容性

- 现有代码可以继续使用 `mockWebsites` 导入完整数据
- 新代码建议使用分离的数据结构，按需导入
- 标签分类功能为新增功能，不影响现有标签系统
- 数据容错机制确保即使数据不完整也能正常工作
- 所有接口都保持向后兼容

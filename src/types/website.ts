// 网站基础信息接口
export interface WebsiteBasic {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
  tags: string[];
  sortOrder?: number; // 排序字段，数值越小排序越靠前，可选字段
}

// 网站详细信息接口
export interface WebsiteDetail {
  id: string;
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
  isBuiltIn?: boolean; // 是否为自带数据
  slug?: string; // SEO友好的URL
  aiGenerated?: boolean; // 是否由AI生成详细介绍
  aiGeneratedDate?: string; // AI生成日期
}

// 完整网站信息接口（合并基础和详细信息）
export interface Website extends WebsiteBasic {
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
  sortOrder?: number; // 重新声明为可选，保持向后兼容
  aiGenerated?: boolean; // 是否由AI生成详细介绍
  aiGeneratedDate?: string; // AI生成日期
}

export interface Tag {
  id: string;
  name: string;
  count: number;
  color: string;
  description?: string;
  category?: string;
  createdDate?: string;
  isCore?: boolean; // 是否为核心标签
}

// 标签分类接口
export interface TagCategory {
  id: string;
  name: string;
  description?: string;
  tagIds: string[]; // 包含的标签ID列表
  createdDate?: string;
  color?: string; // 分类主色调
  icon?: string; // 分类图标
  sortOrder?: number; // 排序字段
}

export interface Review {
  id: string;
  author: string;
  content: string;
  rating: number;
  date: string;
}

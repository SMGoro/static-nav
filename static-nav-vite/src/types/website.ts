export interface Website {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
  tags: string[];
  addedDate: string;
  clicks: number;
  featured: boolean;
  // 新增字段用于更丰富的详情展示
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
}

export interface Tag {
  id: string;
  name: string;
  count: number;
  color: string;
  description?: string;
  relatedTags?: string[]; // 关联标签的ID列表
  category?: string;
  createdDate?: string;
  isCore?: boolean; // 是否为核心标签
}

export interface TagRelation {
  id: string;
  fromTagId: string;
  toTagId: string;
  relationType: 'similar' | 'parent' | 'child' | 'complement' | 'alternative';
  strength: number; // 关系强度 0-1
  description?: string;
  createdDate?: string;
}

export interface Review {
  id: string;
  author: string;
  content: string;
  rating: number;
  date: string;
}

export interface TagNetwork {
  tags: Tag[];
  relations: TagRelation[];
  websites: Website[];
}
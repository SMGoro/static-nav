import { Tag, TagCategory } from '../types/website';

// 标签分类数据
export const tagCategories: TagCategory[] = [
  {
    id: 'tech',
    name: '技术',
    description: '技术开发和工程相关的工具和平台',
    tagIds: ['1', '6', '9', '12', '14', '19', '20', '21'],
    createdDate: '2024-01-01',
    color: '#3b82f6',
    icon: '⚙️',
    sortOrder: 1
  },
  {
    id: 'design',
    name: '设计',
    description: '设计和用户体验相关的工具',
    tagIds: ['2', '7', '13', '22', '23', '24'],
    createdDate: '2024-01-01',
    color: '#f59e0b',
    icon: '🎨',
    sortOrder: 2
  },
  {
    id: 'productivity',
    name: '效率',
    description: '提高工作效率和生产力的工具',
    tagIds: ['4', '8', '11', '18'],
    createdDate: '2024-01-01',
    color: '#8b5cf6',
    icon: '⚡',
    sortOrder: 3
  },
  {
    id: 'collaboration',
    name: '团队',
    description: '团队协作和沟通相关工具',
    tagIds: ['5', '17'],
    createdDate: '2024-01-01',
    color: '#ef4444',
    icon: '👥',
    sortOrder: 4
  },
  {
    id: 'ai',
    name: 'AI & 创作',
    description: '人工智能和内容创作工具',
    tagIds: ['3', '10'],
    createdDate: '2024-01-01',
    color: '#10b981',
    icon: '🤖',
    sortOrder: 5
  },
  {
    id: 'business',
    name: '商业',
    description: '商业和金融相关的服务',
    tagIds: ['15', '16', '25'],
    createdDate: '2024-01-01',
    color: '#06b6d4',
    icon: '💼',
    sortOrder: 6
  }
];

// 标签数据
export const mockTags: Tag[] = [
  { 
    id: '1', 
    name: '开发工具', 
    count: 15, 
    color: '#3b82f6',
    description: '用于软件开发的各种工具和平台',
    category: '技术',
    createdDate: '2024-01-01',
    isCore: true
  },
  { 
    id: '2', 
    name: '设计工具', 
    count: 8, 
    color: '#f59e0b',
    description: '界面设计和用户体验设计相关工具',
    category: '设计',
    createdDate: '2024-01-01',
    isCore: true
  },
  { 
    id: '3', 
    name: 'AI工具', 
    count: 6, 
    color: '#10b981',
    description: '人工智能和机器学习相关工具',
    category: '技术',
    createdDate: '2024-01-01',
    isCore: true
  },
  { 
    id: '4', 
    name: '生产力工具', 
    count: 12, 
    color: '#8b5cf6',
    description: '提高工作效率的各种应用和服务',
    category: '效率',
    createdDate: '2024-01-01',
    isCore: true
  },
  { 
    id: '5', 
    name: '协作', 
    count: 9, 
    color: '#ef4444',
    description: '团队协作和沟通工具',
    category: '团队',
    createdDate: '2024-01-01',
    isCore: false
  },
  { 
    id: '6', 
    name: '代码托管', 
    count: 4, 
    color: '#06b6d4',
    description: '代码版本控制和托管服务',
    category: '技术',
    createdDate: '2024-01-01',
    isCore: false
  },
  { 
    id: '7', 
    name: 'UI/UX', 
    count: 5, 
    color: '#f97316',
    description: '用户界面和用户体验设计',
    category: '设计',
    createdDate: '2024-01-01',
    isCore: false
  },
  { 
    id: '8', 
    name: '笔记', 
    count: 3, 
    color: '#84cc16',
    description: '笔记记录和知识管理工具',
    category: '效率',
    createdDate: '2024-01-01',
    isCore: false
  },
  {
    id: '9',
    name: '人工智能',
    count: 8,
    color: '#8b5cf6',
    description: 'AI技术和应用相关工具',
    category: '技术',
    createdDate: '2024-01-01',
    isCore: false
  },
  {
    id: '10',
    name: '内容生成',
    count: 5,
    color: '#ec4899',
    description: '自动内容创作和生成工具',
    category: '创作',
    createdDate: '2024-01-01',
    isCore: false
  },
  {
    id: '11',
    name: '任务管理',
    count: 7,
    color: '#06b6d4',
    description: '项目和任务管理工具',
    category: '效率',
    createdDate: '2024-01-01',
    isCore: false
  },
  {
    id: '12',
    name: '部署平台',
    count: 3,
    color: '#3b82f6',
    description: '网站和应用部署服务',
    category: '技术',
    createdDate: '2024-01-01',
    isCore: false
  },
  {
    id: '13',
    name: 'CSS框架',
    count: 2,
    color: '#f59e0b',
    description: 'CSS样式框架和工具',
    category: '设计',
    createdDate: '2024-01-01',
    isCore: false
  },
  {
    id: '14',
    name: '前端',
    count: 8,
    color: '#10b981',
    description: '前端开发相关工具和技术',
    category: '技术',
    createdDate: '2024-01-01',
    isCore: false
  },
  {
    id: '15',
    name: '支付处理',
    count: 2,
    color: '#8b5cf6',
    description: '在线支付和金融科技服务',
    category: '商业',
    createdDate: '2024-01-01',
    isCore: false
  },
  {
    id: '16',
    name: '金融科技',
    count: 1,
    color: '#ef4444',
    description: '金融科技和支付解决方案',
    category: '商业',
    createdDate: '2024-01-01',
    isCore: false
  },
  {
    id: '17',
    name: '敏捷开发',
    count: 1,
    color: '#06b6d4',
    description: '敏捷开发方法论和工具',
    category: '团队',
    createdDate: '2024-01-01',
    isCore: false
  },
  {
    id: '18',
    name: '任务跟踪',
    count: 1,
    color: '#84cc16',
    description: '任务和进度跟踪工具',
    category: '效率',
    createdDate: '2024-01-01',
    isCore: false
  },
  {
    id: '19',
    name: 'CDN',
    count: 1,
    color: '#f97316',
    description: '内容分发网络服务',
    category: '技术',
    createdDate: '2024-01-01',
    isCore: false
  },
  {
    id: '20',
    name: 'Next.js',
    count: 1,
    color: '#6366f1',
    description: 'React全栈框架',
    category: '技术',
    createdDate: '2024-01-01',
    isCore: false
  },
  {
    id: '21',
    name: '静态网站',
    count: 1,
    color: '#14b8a6',
    description: '静态网站生成和托管',
    category: '技术',
    createdDate: '2024-01-01',
    isCore: false
  },
  {
    id: '22',
    name: 'UI',
    count: 3,
    color: '#ec4899',
    description: '用户界面设计',
    category: '设计',
    createdDate: '2024-01-01',
    isCore: false
  },
  {
    id: '23',
    name: '响应式',
    count: 2,
    color: '#eab308',
    description: '响应式设计技术',
    category: '设计',
    createdDate: '2024-01-01',
    isCore: false
  },
  {
    id: '24',
    name: '实用优先',
    count: 1,
    color: '#f59e0b',
    description: '实用优先的设计理念',
    category: '设计',
    createdDate: '2024-01-01',
    isCore: false
  },
  {
    id: '25',
    name: '电商',
    count: 1,
    color: '#8b5cf6',
    description: '电子商务相关工具',
    category: '商业',
    createdDate: '2024-01-01',
    isCore: false
  }
];

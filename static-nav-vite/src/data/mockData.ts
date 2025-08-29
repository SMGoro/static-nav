import { Website, Tag, TagRelation } from '../types/website';

export const mockWebsites: Website[] = [
  {
    id: '1',
    title: 'GitHub',
    description: '全球最大的代码托管平台，开发者协作的首选工具',
    isBuiltIn: true,
    slug: 'github',
    fullDescription: 'GitHub 是一个基于 Git 的代码托管平台，为全世界的开发者提供代码管理、版本控制、项目协作等功能。它不仅是代码仓库，更是开源社区的聚集地，拥有数千万开发者和数亿个代码仓库。无论是个人项目还是企业级应用，GitHub 都能提供完善的解决方案。',
    url: 'https://github.com',
    icon: '🐱',
    tags: ['开发工具', '代码托管', 'Git', '开源', '协作'],
    category: '开发工具',
    addedDate: '2024-01-15',
    clicks: 15420,
    featured: true,
    screenshots: [
      'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=600&fit=crop'
    ],
    features: [
      '无限私有和公共仓库',
      'Pull Request 和 Code Review',
      'GitHub Actions CI/CD',
      '项目管理工具',
      '社区讨论功能',
      'GitHub Pages 静态网站托管'
    ],
    rating: 4.8,
    reviews: [
      {
        id: '1',
        author: '张开发',
        content: '作为开发者必备工具，GitHub 的功能非常全面，社区活跃度很高。',
        rating: 5,
        date: '2024-01-10'
      },
      {
        id: '2',
        author: '李程序员',
        content: '界面友好，协作功能强大，是代码管理的最佳选择。',
        rating: 5,
        date: '2024-01-08'
      }
    ],
    relatedSites: ['2', '3'],
    lastUpdated: '2024-01-14',
    language: '多语言',
    isPaid: false,
    authoredBy: 'Microsoft'
  },
  {
    id: '2',
    title: 'Figma',
    description: '现代化的协作式设计工具，支持实时协作和原型制作',
    isBuiltIn: true,
    slug: 'figma',
    fullDescription: 'Figma 是一款基于浏览器的设计工具，彻底改变了设计师和团队的协作方式。它提供了完整的设计到开发工作流程，包括界面设计、原型制作、设计系统管理等功能。最大的特色是实时协作，多个设计师可以同时在同一个文件中工作。',
    url: 'https://figma.com',
    icon: '🎨',
    tags: ['设计工具', 'UI/UX', '协作', '原型', '界面设计'],
    category: '设计工具',
    addedDate: '2024-01-12',
    clicks: 8930,
    featured: true,
    screenshots: [
      'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800&h=600&fit=crop'
    ],
    features: [
      '实时协作设计',
      '强大的组件系统',
      '自动布局功能',
      '交互原型制作',
      '设计系统管理',
      '开发者交接工具'
    ],
    rating: 4.7,
    reviews: [
      {
        id: '3',
        author: '王设计师',
        content: 'Figma 的协作功能太棒了，团队效率提升明显。',
        rating: 5,
        date: '2024-01-05'
      }
    ],
    relatedSites: ['1', '4'],
    lastUpdated: '2024-01-11',
    language: '多语言',
    isPaid: true,
    authoredBy: 'Figma Inc.'
  },
  {
    id: '3',
    title: 'VS Code',
    description: '微软开发的免费代码编辑器，支持丰富的扩展生态',
    isBuiltIn: true,
    slug: 'vscode',
    fullDescription: 'Visual Studio Code 是微软开发的免费、开源的代码编辑器。它轻量但功能强大，支持几乎所有主流编程语言，拥有丰富的扩展生态系统。内置 Git 支持、智能代码补全、调试功能等，是现代开发者的首选编辑器之一。',
    url: 'https://code.visualstudio.com',
    icon: '💻',
    tags: ['代码编辑器', 'IDE', '开发工具', '微软', 'Git'],
    category: '开发工具',
    addedDate: '2024-01-10',
    clicks: 12150,
    featured: false,
    screenshots: [
      'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&h=600&fit=crop'
    ],
    features: [
      '轻量级但功能强大',
      '丰富的扩展市场',
      '内置 Git 支持',
      '智能代码补全',
      '集成调试器',
      '多语言支持'
    ],
    rating: 4.6,
    reviews: [],
    relatedSites: ['1'],
    lastUpdated: '2024-01-09',
    language: '多语言',
    isPaid: false,
    authoredBy: 'Microsoft'
  },
  {
    id: '4',
    title: 'ChatGPT',
    description: 'OpenAI开发的AI聊天助手，提供智能对话和内容生成服务',
    isBuiltIn: true,
    slug: 'chatgpt',
    fullDescription: 'ChatGPT 是 OpenAI 开发的大型语言模型，能够进行自然语言对话、回答问题、生成内容、编程辅助等。它基于先进的 GPT 架构，具有强大的理解和生成能力，是 AI 助手领域的领导者。',
    url: 'https://chat.openai.com',
    icon: '🤖',
    tags: ['AI助手', '聊天', '内容生成', 'OpenAI', '人工智能'],
    category: 'AI工具',
    addedDate: '2024-01-08',
    clicks: 9876,
    featured: true,
    screenshots: [
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop'
    ],
    features: [
      '智能对话交流',
      '文本内容生成',
      '代码编程辅助',
      '多语言翻译',
      '创意写作支持',
      '学习辅导功能'
    ],
    rating: 4.5,
    reviews: [
      {
        id: '4',
        author: '刘用户',
        content: 'AI 助手真的很智能，能帮助解决各种问题。',
        rating: 4,
        date: '2024-01-03'
      }
    ],
    relatedSites: ['6'],
    lastUpdated: '2024-01-07',
    language: '多语言',
    isPaid: true,
    authoredBy: 'OpenAI'
  },
  {
    id: '5',
    title: 'Notion',
    description: '集文档、数据库、任务管理于一体的全能工作空间',
    isBuiltIn: true,
    slug: 'notion',
    fullDescription: 'Notion 是一个集成式的工作空间，将笔记、任务、数据库、维基等功能整合在一个平台中。它提供了灵活的页面结构和强大的数据库功能，适合个人和团队使用。通过模块化的设计，用户可以根据需求自定义工作流程。',
    url: 'https://notion.so',
    icon: '📝',
    tags: ['笔记', '数据库', '任务管理', '协作', '生产力'],
    category: '生产力工具',
    addedDate: '2024-01-06',
    clicks: 7234,
    featured: false,
    screenshots: [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop'
    ],
    features: [
      '灵活的页面结构',
      '强大的数据库功能',
      '团队协作空间',
      '模板库丰富',
      '多平台同步',
      'API 集成支持'
    ],
    rating: 4.4,
    reviews: [],
    relatedSites: ['7'],
    lastUpdated: '2024-01-05',
    language: '多语言',
    isPaid: true,
    authoredBy: 'Notion Labs'
  },
  {
    id: '6',
    title: 'Midjourney',
    description: 'AI图像生成工具，通过文字描述创造惊艳的艺术作品',
    isBuiltIn: true,
    slug: 'midjourney',
    fullDescription: 'Midjourney 是一个基于人工智能的图像生成工具，用户只需提供文字描述，就能生成高质量的艺术作品和图像。它在艺术创作、概念设计、营销素材制作等领域都有广泛应用。',
    url: 'https://midjourney.com',
    icon: '🎭',
    tags: ['AI绘画', '图像生成', '艺术创作', 'Discord', '人工智能'],
    category: 'AI工具',
    addedDate: '2024-01-04',
    clicks: 5432,
    featured: true,
    screenshots: [
      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&h=600&fit=crop'
    ],
    features: [
      '文字转图像生成',
      '多种艺术风格',
      '高分辨率输出',
      '批量生成功能',
      '社区分享平台',
      '商业使用授权'
    ],
    rating: 4.3,
    reviews: [],
    relatedSites: ['4'],
    lastUpdated: '2024-01-03',
    language: '英语',
    isPaid: true,
    authoredBy: 'Midjourney Inc.'
  }
];

export const mockTags: Tag[] = [
  { 
    id: '1', 
    name: '开发工具', 
    count: 15, 
    color: '#3b82f6',
    description: '用于软件开发的各种工具和平台',
    relatedTags: ['2', '3', '7'],
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
    relatedTags: ['1', '4', '8'],
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
    relatedTags: ['1', '9', '10'],
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
    relatedTags: ['2', '5', '11'],
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
    relatedTags: ['1', '2', '4'],
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
    relatedTags: ['1', '7'],
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
    relatedTags: ['2', '8'],
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
    relatedTags: ['4', '11'],
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
    relatedTags: ['3', '10'],
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
    relatedTags: ['3', '9'],
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
    relatedTags: ['4', '5'],
    category: '效率',
    createdDate: '2024-01-01',
    isCore: false
  }
];

export const mockTagRelations: TagRelation[] = [
  {
    id: '1',
    fromTagId: '1',
    toTagId: '6',
    relationType: 'parent',
    strength: 0.9,
    description: '开发工具包含代码托管'
  },
  {
    id: '2',
    fromTagId: '2',
    toTagId: '7',
    relationType: 'parent',
    strength: 0.8,
    description: '设计工具包含UI/UX设计'
  },
  {
    id: '3',
    fromTagId: '3',
    toTagId: '9',
    relationType: 'similar',
    strength: 0.95,
    description: 'AI工具与人工智能高度相关'
  },
  {
    id: '4',
    fromTagId: '1',
    toTagId: '5',
    relationType: 'complement',
    strength: 0.7,
    description: '开发工具通常需要协作功能'
  },
  {
    id: '5',
    fromTagId: '2',
    toTagId: '5',
    relationType: 'complement',
    strength: 0.8,
    description: '设计工具经常需要团队协作'
  },
  {
    id: '6',
    fromTagId: '4',
    toTagId: '8',
    relationType: 'complement',
    strength: 0.6,
    description: '生产力工具与笔记应用相辅相成'
  },
  {
    id: '7',
    fromTagId: '9',
    toTagId: '10',
    relationType: 'complement',
    strength: 0.85,
    description: '人工智能常用于内容生成'
  },
  {
    id: '8',
    fromTagId: '4',
    toTagId: '11',
    relationType: 'complement',
    strength: 0.9,
    description: '生产力工具包含任务管理'
  }
];

export const categories = [
  '全部',
  '开发工具',
  '设计工具',
  'AI工具',
  '生产力工具',
  '学习资源',
  '社交媒体',
  '电商购物',
  '新闻资讯',
  '娱乐影音',
  '其他'
];
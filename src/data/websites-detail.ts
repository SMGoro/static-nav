import { WebsiteDetail } from '../types/website';

export const websitesDetail: WebsiteDetail[] = [
  {
    id: '11',
    isBuiltIn: true,
    slug: 'github',
    fullDescription: 'GitHub 是一个基于 Git 的代码托管平台，为全世界的开发者提供代码管理、版本控制、项目协作等功能。它不仅是代码仓库，更是开源社区的聚集地，拥有数千万开发者和数亿个代码仓库。无论是个人项目还是企业级应用，GitHub 都能提供完善的解决方案。',
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
    relatedSites: ['1', '3'],
    lastUpdated: '2024-01-14',
    language: '多语言',
    isPaid: false,
    authoredBy: 'Microsoft'
  },
  {
    id: '2',
    isBuiltIn: true,
    slug: 'figma',
    fullDescription: 'Figma 是一款基于浏览器的设计工具，彻底改变了设计师和团队的协作方式。它提供了完整的设计到开发工作流程，包括界面设计、原型制作、设计系统管理等功能。最大的特色是实时协作，多个设计师可以同时在同一个文件中工作。',
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
    isBuiltIn: true,
    slug: 'vscode',
    fullDescription: 'Visual Studio Code 是微软开发的免费、开源的代码编辑器。它轻量但功能强大，支持几乎所有主流编程语言，拥有丰富的扩展生态系统。内置 Git 支持、智能代码补全、调试功能等，是现代开发者的首选编辑器之一。',
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
    isBuiltIn: true,
    slug: 'chatgpt',
    fullDescription: 'ChatGPT 是 OpenAI 开发的大型语言模型，能够进行自然语言对话、回答问题、生成内容、编程辅助等。它基于先进的 GPT 架构，具有强大的理解和生成能力，是 AI 助手领域的领导者。',
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
    isBuiltIn: true,
    slug: 'notion',
    fullDescription: 'Notion 是一个集成式的工作空间，将笔记、任务、数据库、维基等功能整合在一个平台中。它提供了灵活的页面结构和强大的数据库功能，适合个人和团队使用。通过模块化的设计，用户可以根据需求自定义工作流程。',
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
    isBuiltIn: true,
    slug: 'midjourney',
    fullDescription: 'Midjourney 是一个基于人工智能的图像生成工具，用户只需提供文字描述，就能生成高质量的艺术作品和图像。它在艺术创作、概念设计、营销素材制作等领域都有广泛应用。',
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
  },
  {
    id: '7',
    isBuiltIn: true,
    slug: 'vercel',
    fullDescription: 'Vercel 是一个专为前端开发者设计的部署平台，支持静态网站、Next.js、React、Vue 等现代框架的快速部署。提供全球 CDN、自动 HTTPS、预览部署等功能，让开发者专注于代码而不是基础设施。',
    addedDate: '2024-01-02',
    clicks: 8765,
    featured: true,
    screenshots: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop'
    ],
    features: [
      '零配置部署',
      '全球 CDN 加速',
      '自动 HTTPS',
      '预览部署',
      'Git 集成',
      '边缘函数支持'
    ],
    rating: 4.7,
    reviews: [
      {
        id: '5',
        author: '陈前端',
        content: '部署体验非常流畅，特别适合前端项目。',
        rating: 5,
        date: '2024-01-01'
      }
    ],
    relatedSites: ['1', '3'],
    lastUpdated: '2024-01-01',
    language: '多语言',
    isPaid: true,
    authoredBy: 'Vercel Inc.'
  },
  {
    id: '8',
    isBuiltIn: true,
    slug: 'tailwind-css',
    fullDescription: 'Tailwind CSS 是一个实用优先的 CSS 框架，提供了大量预定义的样式类，让开发者能够快速构建现代、响应式的用户界面。它采用原子化 CSS 的方法，提供了极高的灵活性和可定制性。',
    addedDate: '2023-12-30',
    clicks: 12340,
    featured: true,
    screenshots: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop'
    ],
    features: [
      '实用优先设计',
      '响应式设计',
      '高度可定制',
      'JIT 编译',
      '组件友好',
      '性能优化'
    ],
    rating: 4.8,
    reviews: [
      {
        id: '6',
        author: '李设计师',
        content: '改变了我的 CSS 开发方式，效率提升巨大。',
        rating: 5,
        date: '2023-12-28'
      }
    ],
    relatedSites: ['2', '7'],
    lastUpdated: '2023-12-29',
    language: '多语言',
    isPaid: false,
    authoredBy: 'Tailwind Labs'
  },
  {
    id: '9',
    isBuiltIn: true,
    slug: 'linear',
    fullDescription: 'Linear 是一个专为现代软件开发团队设计的项目管理工具，提供了简洁直观的界面和强大的功能。它专注于速度和效率，让团队能够更好地协作和交付产品。',
    addedDate: '2023-12-25',
    clicks: 6789,
    featured: false,
    screenshots: [
      'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop'
    ],
    features: [
      '极速界面',
      '智能工作流',
      '实时协作',
      'API 集成',
      '自动化规则',
      '详细分析'
    ],
    rating: 4.6,
    reviews: [],
    relatedSites: ['5'],
    lastUpdated: '2023-12-24',
    language: '英语',
    isPaid: true,
    authoredBy: 'Linear'
  },
  {
    id: '10',
    isBuiltIn: true,
    slug: 'stripe',
    fullDescription: 'Stripe 是一个全球领先的在线支付处理平台，为企业和开发者提供简单、安全的支付解决方案。支持信用卡、数字钱包、银行转账等多种支付方式，并提供完善的 API 和开发者工具。',
    addedDate: '2023-12-20',
    clicks: 9876,
    featured: true,
    screenshots: [
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop'
    ],
    features: [
      '全球支付支持',
      '安全合规',
      '开发者友好',
      '实时数据',
      '多种支付方式',
      '欺诈防护'
    ],
    rating: 4.5,
    reviews: [
      {
        id: '7',
        author: '王开发者',
        content: '集成简单，文档完善，支付体验很好。',
        rating: 4,
        date: '2023-12-18'
      }
    ],
    relatedSites: ['1'],
    lastUpdated: '2023-12-19',
    language: '多语言',
    isPaid: true,
    authoredBy: 'Stripe Inc.'
  }
];

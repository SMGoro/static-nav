#!/usr/bin/env node

/**
 * 推荐网站数据生成器 CLI 工具
 * 基于现有的标签分类和网站数据生成推荐网站
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 网站推荐数据模板
const websiteTemplates = {
  // 开发工具类
  '开发工具': [
    {
      title: 'Docker',
      description: '容器化平台，简化应用部署和管理',
      url: 'https://docker.com',
      icon: '🐳',
      tags: ['开发工具', '容器', '部署', 'DevOps'],
      features: ['容器化应用', '微服务架构', '跨平台部署', '资源隔离'],
      language: '多语言',
      isPaid: false,
      authoredBy: 'Docker Inc.'
    },
    {
      title: 'Postman',
      description: 'API开发和测试工具，简化接口调试',
      url: 'https://postman.com',
      icon: '📮',
      tags: ['开发工具', 'API', '测试', '调试'],
      features: ['API测试', '接口文档', '团队协作', '自动化测试'],
      language: '多语言',
      isPaid: true,
      authoredBy: 'Postman Inc.'
    },
    {
      title: 'JetBrains IntelliJ IDEA',
      description: '强大的Java集成开发环境',
      url: 'https://jetbrains.com/idea',
      icon: '☕',
      tags: ['开发工具', 'IDE', 'Java', '智能编程'],
      features: ['智能代码补全', '重构工具', '调试器', '版本控制集成'],
      language: '多语言',
      isPaid: true,
      authoredBy: 'JetBrains'
    }
  ],
  
  // 设计工具类
  '设计工具': [
    {
      title: 'Adobe Creative Suite',
      description: '专业创意设计软件套件',
      url: 'https://adobe.com/creativecloud',
      icon: '🎨',
      tags: ['设计工具', '创意', '专业设计', 'Adobe'],
      features: ['Photoshop图像处理', 'Illustrator矢量图', 'InDesign排版', 'After Effects动效'],
      language: '多语言',
      isPaid: true,
      authoredBy: 'Adobe Inc.'
    },
    {
      title: 'Sketch',
      description: 'Mac平台的专业UI设计工具',
      url: 'https://sketch.com',
      icon: '✏️',
      tags: ['设计工具', 'UI/UX', 'Mac', '界面设计'],
      features: ['矢量设计', '组件系统', '原型制作', '开发者交接'],
      language: '多语言',
      isPaid: true,
      authoredBy: 'Sketch B.V.'
    },
    {
      title: 'Canva',
      description: '在线设计平台，让设计变得简单',
      url: 'https://canva.com',
      icon: '🎭',
      tags: ['设计工具', '在线设计', '模板', '易用'],
      features: ['丰富模板库', '拖拽设计', '团队协作', '品牌套件'],
      language: '多语言',
      isPaid: true,
      authoredBy: 'Canva Pty Ltd'
    }
  ],

  // AI工具类
  'AI工具': [
    {
      title: 'Claude',
      description: 'Anthropic开发的AI助手，擅长分析和写作',
      url: 'https://claude.ai',
      icon: '🧠',
      tags: ['AI助手', '内容生成', '分析', 'Anthropic'],
      features: ['智能对话', '文档分析', '代码生成', '创意写作'],
      language: '多语言',
      isPaid: true,
      authoredBy: 'Anthropic'
    },
    {
      title: 'Perplexity AI',
      description: 'AI驱动的搜索引擎，提供准确答案',
      url: 'https://perplexity.ai',
      icon: '🔍',
      tags: ['AI工具', '搜索引擎', '问答', '研究'],
      features: ['实时搜索', '引用来源', '多语言支持', '专业研究'],
      language: '多语言',
      isPaid: true,
      authoredBy: 'Perplexity AI'
    },
    {
      title: 'Runway ML',
      description: 'AI视频和图像编辑平台',
      url: 'https://runwayml.com',
      icon: '🎬',
      tags: ['AI工具', '视频编辑', '图像生成', '创意'],
      features: ['AI视频编辑', '图像生成', '文本转视频', '创意工具'],
      language: '多语言',
      isPaid: true,
      authoredBy: 'Runway'
    }
  ],

  // 生产力工具类
  '生产力工具': [
    {
      title: 'Obsidian',
      description: '知识管理和笔记工具，支持双向链接',
      url: 'https://obsidian.md',
      icon: '🔗',
      tags: ['笔记', '知识管理', '双向链接', 'Markdown'],
      features: ['双向链接', '图谱视图', '插件生态', '本地存储'],
      language: '多语言',
      isPaid: false,
      authoredBy: 'Obsidian'
    },
    {
      title: 'Todoist',
      description: '智能任务管理应用',
      url: 'https://todoist.com',
      icon: '✅',
      tags: ['任务管理', '生产力', 'GTD', '团队协作'],
      features: ['智能调度', '项目组织', '团队协作', '自然语言输入'],
      language: '多语言',
      isPaid: true,
      authoredBy: 'Doist'
    },
    {
      title: 'Calendly',
      description: '智能日程安排工具',
      url: 'https://calendly.com',
      icon: '📅',
      tags: ['日程管理', '会议安排', '自动化', '生产力'],
      features: ['自动调度', '时区转换', '集成日历', '团队协调'],
      language: '多语言',
      isPaid: true,
      authoredBy: 'Calendly'
    }
  ],

  // 协作工具类
  '协作': [
    {
      title: 'Slack',
      description: '团队沟通和协作平台',
      url: 'https://slack.com',
      icon: '💬',
      tags: ['协作', '团队沟通', '工作流', '集成'],
      features: ['频道组织', '文件共享', '应用集成', '工作流自动化'],
      language: '多语言',
      isPaid: true,
      authoredBy: 'Slack Technologies'
    },
    {
      title: 'Microsoft Teams',
      description: '微软的团队协作和视频会议平台',
      url: 'https://teams.microsoft.com',
      icon: '👥',
      tags: ['协作', '视频会议', 'Office集成', '企业'],
      features: ['视频会议', '文件协作', 'Office集成', '企业安全'],
      language: '多语言',
      isPaid: true,
      authoredBy: 'Microsoft'
    },
    {
      title: 'Miro',
      description: '在线白板和协作平台',
      url: 'https://miro.com',
      icon: '🖼️',
      tags: ['协作', '白板', '头脑风暴', '可视化'],
      features: ['无限画布', '实时协作', '模板库', '集成工具'],
      language: '多语言',
      isPaid: true,
      authoredBy: 'Miro'
    }
  ],

  // 代码托管类
  '代码托管': [
    {
      title: 'GitLab',
      description: '完整的DevOps平台，包含代码托管和CI/CD',
      url: 'https://gitlab.com',
      icon: '🦊',
      tags: ['代码托管', 'DevOps', 'CI/CD', '开源'],
      features: ['Git仓库', 'CI/CD流水线', '项目管理', '安全扫描'],
      language: '多语言',
      isPaid: true,
      authoredBy: 'GitLab Inc.'
    },
    {
      title: 'Bitbucket',
      description: 'Atlassian的Git代码托管服务',
      url: 'https://bitbucket.org',
      icon: '🪣',
      tags: ['代码托管', 'Git', 'Atlassian', '企业'],
      features: ['Git仓库', 'Jira集成', 'Confluence集成', '分支策略'],
      language: '多语言',
      isPaid: true,
      authoredBy: 'Atlassian'
    }
  ],

  // 部署平台类
  '部署平台': [
    {
      title: 'Netlify',
      description: '现代化的静态网站部署平台',
      url: 'https://netlify.com',
      icon: '🌐',
      tags: ['部署平台', '静态网站', 'JAMstack', 'CDN'],
      features: ['零配置部署', '表单处理', '边缘函数', '分支预览'],
      language: '多语言',
      isPaid: true,
      authoredBy: 'Netlify Inc.'
    },
    {
      title: 'Railway',
      description: '现代化的应用部署平台',
      url: 'https://railway.app',
      icon: '🚂',
      tags: ['部署平台', '全栈应用', '数据库', '监控'],
      features: ['一键部署', '数据库托管', '环境变量', '实时监控'],
      language: '多语言',
      isPaid: true,
      authoredBy: 'Railway'
    }
  ],

  // 支付处理类
  '支付处理': [
    {
      title: 'PayPal',
      description: '全球领先的在线支付平台',
      url: 'https://paypal.com',
      icon: '💳',
      tags: ['支付处理', '电商', '国际支付', '安全'],
      features: ['全球支付', '买家保护', '移动支付', 'API集成'],
      language: '多语言',
      isPaid: true,
      authoredBy: 'PayPal Holdings'
    }
  ]
};

// 生成随机ID
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// 生成随机日期
function generateRandomDate(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
  return new Date(randomTime).toISOString().split('T')[0];
}

// 生成随机评分
function generateRating() {
  return Math.round((3.5 + Math.random() * 1.5) * 10) / 10;
}

// 生成随机点击量
function generateClicks() {
  return Math.floor(Math.random() * 50000) + 1000;
}

// 生成随机评论
function generateReviews() {
  const reviewTemplates = [
    { author: '张用户', content: '这个工具非常实用，大大提高了我的工作效率。' },
    { author: '李开发者', content: '界面简洁，功能强大，值得推荐。' },
    { author: '王设计师', content: '设计精美，用户体验很好。' },
    { author: '陈产品', content: '功能全面，满足了我的所有需求。' },
    { author: '刘经理', content: '团队协作效果显著，沟通更加高效。' }
  ];

  const numReviews = Math.floor(Math.random() * 3) + 1;
  const reviews = [];
  
  for (let i = 0; i < numReviews; i++) {
    const template = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)];
    reviews.push({
      id: generateId(),
      author: template.author,
      content: template.content,
      rating: Math.floor(Math.random() * 2) + 4, // 4-5星
      date: generateRandomDate('2023-01-01', '2024-01-01')
    });
  }
  
  return reviews;
}

// 生成相关网站ID
function generateRelatedSites(existingIds, currentId) {
  const availableIds = existingIds.filter(id => id !== currentId);
  const numRelated = Math.min(Math.floor(Math.random() * 3) + 1, availableIds.length);
  const shuffled = availableIds.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numRelated);
}

// 生成推荐网站数据
function generateRecommendedWebsites(existingWebsites, existingTags, count = 20) {
  const websites = [];
  const existingIds = existingWebsites.map(w => w.id);
  
  // 按标签分类生成网站
  const tagCategories = [...new Set(existingTags.map(tag => tag.category).filter(Boolean))];
  
  let generatedCount = 0;
  const maxPerCategory = Math.ceil(count / tagCategories.length);
  
  for (const category of tagCategories) {
    if (generatedCount >= count) break;
    
    const categoryTemplates = websiteTemplates[category] || [];
    const templatesToUse = categoryTemplates.slice(0, Math.min(maxPerCategory, categoryTemplates.length));
    
    for (const template of templatesToUse) {
      if (generatedCount >= count) break;
      
      const website = {
        id: generateId(),
        title: template.title,
        description: template.description,
        isBuiltIn: false, // 生成的推荐数据不是内置的
        slug: template.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        fullDescription: `${template.description} ${template.features.join('、')}等功能，为用户提供专业、高效的解决方案。`,
        url: template.url,
        icon: template.icon,
        tags: template.tags,
        addedDate: generateRandomDate('2023-06-01', '2024-01-01'),
        clicks: generateClicks(),
        featured: Math.random() > 0.7, // 30%概率设为推荐
        screenshots: [
          `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}?w=800&h=600&fit=crop`
        ],
        features: template.features,
        rating: generateRating(),
        reviews: generateReviews(),
        relatedSites: generateRelatedSites(existingIds, generateId()),
        lastUpdated: generateRandomDate('2023-06-01', '2024-01-01'),
        language: template.language,
        isPaid: template.isPaid,
        authoredBy: template.authoredBy
      };
      
      websites.push(website);
      existingIds.push(website.id);
      generatedCount++;
    }
  }
  
  return websites;
}

// 生成推荐标签数据
function generateRecommendedTags(existingTags, count = 10) {
  const newTags = [];
  const existingNames = existingTags.map(tag => tag.name);
  
  const tagTemplates = [
    { name: '机器学习', category: '技术', color: '#8b5cf6', description: '机器学习算法和工具' },
    { name: '区块链', category: '技术', color: '#f59e0b', description: '区块链技术和应用' },
    { name: '云计算', category: '技术', color: '#06b6d4', description: '云服务和基础设施' },
    { name: '数据分析', category: '技术', color: '#10b981', description: '数据分析和可视化工具' },
    { name: '移动开发', category: '技术', color: '#ef4444', description: '移动应用开发工具' },
    { name: '游戏开发', category: '技术', color: '#f97316', description: '游戏开发引擎和工具' },
    { name: '网络安全', category: '技术', color: '#84cc16', description: '网络安全和防护工具' },
    { name: '物联网', category: '技术', color: '#6366f1', description: '物联网开发平台' },
    { name: 'AR/VR', category: '技术', color: '#ec4899', description: '增强现实和虚拟现实' },
    { name: '自动化', category: '效率', color: '#14b8a6', description: '工作流程自动化工具' },
    { name: '时间管理', category: '效率', color: '#eab308', description: '时间管理和效率工具' },
    { name: '学习平台', category: '教育', color: '#3b82f6', description: '在线学习和教育平台' },
    { name: '健康管理', category: '生活', color: '#f59e0b', description: '健康和健身管理应用' },
    { name: '财务管理', category: '商业', color: '#10b981', description: '个人和企业财务管理' },
    { name: '营销工具', category: '商业', color: '#ef4444', description: '数字营销和推广工具' }
  ];
  
  let generatedCount = 0;
  for (const template of tagTemplates) {
    if (generatedCount >= count) break;
    if (existingNames.includes(template.name)) continue;
    
    const tag = {
      id: generateId(),
      name: template.name,
      count: Math.floor(Math.random() * 20) + 1,
      color: template.color,
      description: template.description,
      category: template.category,
      createdDate: generateRandomDate('2023-06-01', '2024-01-01'),
      isCore: false
    };
    
    newTags.push(tag);
    generatedCount++;
  }
  
  return newTags;
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始生成推荐网站数据...');
    
    // 现有数据（从mock-data.ts中提取）
    const existingWebsites = [
      { id: '1', title: 'GitHub' },
      { id: '2', title: 'Figma' },
      { id: '3', title: 'VS Code' },
      { id: '4', title: 'ChatGPT' },
      { id: '5', title: 'Notion' },
      { id: '6', title: 'Midjourney' },
      { id: '7', title: 'Vercel' },
      { id: '8', title: 'Tailwind CSS' },
      { id: '9', title: 'Linear' },
      { id: '10', title: 'Stripe' }
    ];
    
    const existingTags = [
      { name: '开发工具', category: '技术' },
      { name: '设计工具', category: '设计' },
      { name: 'AI工具', category: '技术' },
      { name: '生产力工具', category: '效率' },
      { name: '协作', category: '团队' },
      { name: '代码托管', category: '技术' },
      { name: 'UI/UX', category: '设计' },
      { name: '笔记', category: '效率' },
      { name: '人工智能', category: '技术' },
      { name: '内容生成', category: '创作' },
      { name: '任务管理', category: '效率' },
      { name: '部署平台', category: '技术' },
      { name: 'CSS框架', category: '设计' },
      { name: '前端', category: '技术' },
      { name: '支付处理', category: '商业' },
      { name: '金融科技', category: '商业' },
      { name: '敏捷开发', category: '团队' },
      { name: '任务跟踪', category: '效率' },
      { name: 'CDN', category: '技术' },
      { name: 'Next.js', category: '技术' },
      { name: '静态网站', category: '技术' },
      { name: 'UI', category: '设计' },
      { name: '响应式', category: '设计' },
      { name: '实用优先', category: '设计' },
      { name: '电商', category: '商业' }
    ];
    
    // 生成推荐数据
    const recommendedWebsites = generateRecommendedWebsites(existingWebsites, existingTags, 25);
    const recommendedTags = generateRecommendedTags(existingTags, 15);
    
    // 创建数据目录
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // 保存推荐网站数据
    const websitesData = {
      websites: recommendedWebsites,
      generatedAt: new Date().toISOString(),
      count: recommendedWebsites.length,
      description: '基于现有标签分类和网站数据生成的推荐网站'
    };
    
    fs.writeFileSync(
      path.join(dataDir, 'recommended-websites.json'),
      JSON.stringify(websitesData, null, 2),
      'utf-8'
    );
    
    // 保存推荐标签数据
    const tagsData = {
      tags: recommendedTags,
      generatedAt: new Date().toISOString(),
      count: recommendedTags.length,
      description: '基于现有标签分类生成的推荐标签'
    };
    
    fs.writeFileSync(
      path.join(dataDir, 'recommended-tags.json'),
      JSON.stringify(tagsData, null, 2),
      'utf-8'
    );
    
    // 生成TypeScript数据文件
    const tsWebsitesContent = `// 推荐网站数据 - 自动生成
// 生成时间: ${new Date().toLocaleString()}

import { Website } from '../src/types/website';

export const recommendedWebsites: Website[] = ${JSON.stringify(recommendedWebsites, null, 2)};
`;

    const tsTagsContent = `// 推荐标签数据 - 自动生成
// 生成时间: ${new Date().toLocaleString()}

import { Tag } from '../src/types/website';

export const recommendedTags: Tag[] = ${JSON.stringify(recommendedTags, null, 2)};
`;

    fs.writeFileSync(
      path.join(dataDir, 'recommended-websites.ts'),
      tsWebsitesContent,
      'utf-8'
    );
    
    fs.writeFileSync(
      path.join(dataDir, 'recommended-tags.ts'),
      tsTagsContent,
      'utf-8'
    );
    
    // 生成统计报告
    const stats = {
      generatedAt: new Date().toISOString(),
      websites: {
        total: recommendedWebsites.length,
        featured: recommendedWebsites.filter(w => w.featured).length,
        paid: recommendedWebsites.filter(w => w.isPaid).length,
        free: recommendedWebsites.filter(w => !w.isPaid).length
      },
      tags: {
        total: recommendedTags.length,
        categories: [...new Set(recommendedTags.map(t => t.category))].length
      },
      categories: {
        '技术': recommendedWebsites.filter(w => w.tags.some(t => existingTags.find(et => et.name === t)?.category === '技术')).length,
        '设计': recommendedWebsites.filter(w => w.tags.some(t => existingTags.find(et => et.name === t)?.category === '设计')).length,
        '效率': recommendedWebsites.filter(w => w.tags.some(t => existingTags.find(et => et.name === t)?.category === '效率')).length,
        '团队': recommendedWebsites.filter(w => w.tags.some(t => existingTags.find(et => et.name === t)?.category === '团队')).length,
        '商业': recommendedWebsites.filter(w => w.tags.some(t => existingTags.find(et => et.name === t)?.category === '商业')).length
      }
    };
    
    fs.writeFileSync(
      path.join(dataDir, 'generation-stats.json'),
      JSON.stringify(stats, null, 2),
      'utf-8'
    );
    
    console.log('✅ 推荐数据生成完成！');
    console.log(`📊 统计信息:`);
    console.log(`   - 推荐网站: ${stats.websites.total} 个`);
    console.log(`   - 推荐标签: ${stats.tags.total} 个`);
    console.log(`   - 特色网站: ${stats.websites.featured} 个`);
    console.log(`   - 付费工具: ${stats.websites.paid} 个`);
    console.log(`   - 免费工具: ${stats.websites.free} 个`);
    console.log(`📁 文件已保存到: ${dataDir}`);
    console.log(`   - recommended-websites.json/ts`);
    console.log(`   - recommended-tags.json/ts`);
    console.log(`   - generation-stats.json`);
    
  } catch (error) {
    console.error('❌ 生成推荐数据时出错:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.main || import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateRecommendedWebsites, generateRecommendedTags };
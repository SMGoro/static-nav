/**
 * 数据初始化工具
 * 确保新用户能够获得完整的默认数据
 */

import { Website, Tag } from '../types/website';
import { mockWebsites, mockTags } from '../data/mock-data';

export interface InitializationResult {
  success: boolean;
  message: string;
  dataCount: {
    websites: number;
    tags: number;
    categories: number;
  };
}

/**
 * 初始化默认数据
 */
export function initializeDefaultData(): InitializationResult {
  try {
    // 检查是否已有数据
    const existingData = localStorage.getItem('static-nav-data');
    const existingCategories = localStorage.getItem('tag_categories');
    const existingTags = localStorage.getItem('tag_data');

    let websitesCount = 0;
    let tagsCount = 0;
    let categoriesCount = 0;

  // 初始化主数据
  if (!existingData) {
    const defaultData = {
      websites: mockWebsites,
      tags: mockTags,
      version: '1.0.0',
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('static-nav-data', JSON.stringify(defaultData));
    websitesCount = mockWebsites.length;
    tagsCount = mockTags.length;
  }

    // 初始化分类数据
    if (!existingCategories) {
      const defaultCategories = [
        { id: 'cat_1', name: '开发工具', description: '编程开发相关工具和平台', color: '#3b82f6', createdDate: new Date().toISOString() },
        { id: 'cat_2', name: '设计工具', description: 'UI/UX设计和视觉设计工具', color: '#ef4444', createdDate: new Date().toISOString() },
        { id: 'cat_3', name: 'AI工具', description: '人工智能和机器学习工具', color: '#10b981', createdDate: new Date().toISOString() },
        { id: 'cat_4', name: '效率工具', description: '提高工作效率的应用和服务', color: '#8b5cf6', createdDate: new Date().toISOString() },
        { id: 'cat_5', name: '学习资源', description: '在线学习和教育资源', color: '#f59e0b', createdDate: new Date().toISOString() },
        { id: 'cat_6', name: '商业工具', description: '商业和金融相关工具', color: '#06b6d4', createdDate: new Date().toISOString() },
        { id: 'cat_7', name: '团队协作', description: '团队协作和沟通工具', color: '#84cc16', createdDate: new Date().toISOString() },
        { id: 'cat_8', name: '娱乐休闲', description: '娱乐和休闲相关应用', color: '#ec4899', createdDate: new Date().toISOString() },
      ];
      
      localStorage.setItem('tag_categories', JSON.stringify(defaultCategories));
      categoriesCount = defaultCategories.length;
    }

    // 初始化标签数据（如果不存在）
    if (!existingTags) {
      // 从网站数据中提取标签并创建标签记录
      const tagMap = new Map<string, Tag>();
      
      mockWebsites.forEach(website => {
        website.tags.forEach(tagName => {
          if (!tagMap.has(tagName)) {
            // 根据标签名称确定分类
            let category = '未分类';
            if (['开发工具', '代码托管', 'Git', '开源', '协作', '部署平台', '前端', 'CDN', 'Next.js', '静态网站'].includes(tagName)) {
              category = '开发工具';
            } else if (['设计工具', 'UI/UX', '协作', '原型', '界面设计', 'CSS框架', 'UI', '响应式', '实用优先'].includes(tagName)) {
              category = '设计工具';
            } else if (['AI助手', '聊天', '内容生成', 'OpenAI', '人工智能', 'AI绘画', '图像生成', '艺术创作', 'Discord'].includes(tagName)) {
              category = 'AI工具';
            } else if (['笔记', '数据库', '任务管理', '协作', '生产力', '项目管理', '团队协作', '敏捷开发', '任务跟踪'].includes(tagName)) {
              category = '效率工具';
            } else if (['支付处理', '金融科技', 'API', '电商', '开发者工具'].includes(tagName)) {
              category = '商业工具';
            }

            const tag: Tag = {
              id: `tag_${tagName.replace(/\s+/g, '_').toLowerCase()}`,
              name: tagName,
              count: 1,
              color: getCategoryColor(category),
              category: category,
              createdDate: new Date().toISOString(),
              isCore: false
            };
            tagMap.set(tagName, tag);
          } else {
            // 更新计数
            const existingTag = tagMap.get(tagName)!;
            existingTag.count = (existingTag.count || 0) + 1;
          }
        });
      });

      const tagsArray = Array.from(tagMap.values());
      localStorage.setItem('tag_data', JSON.stringify(tagsArray));
      tagsCount = tagsArray.length;
    }

    return {
      success: true,
      message: '默认数据初始化成功',
      dataCount: {
        websites: websitesCount,
        tags: tagsCount,
        categories: categoriesCount
      }
    };

  } catch (error) {
    console.error('初始化默认数据失败:', error);
    return {
      success: false,
      message: '初始化默认数据失败',
      dataCount: {
        websites: 0,
        tags: 0,
        categories: 0
      }
    };
  }
}

/**
 * 根据分类获取颜色
 */
function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    '开发工具': '#3b82f6',
    '设计工具': '#ef4444',
    'AI工具': '#10b981',
    '效率工具': '#8b5cf6',
    '学习资源': '#f59e0b',
    '商业工具': '#06b6d4',
    '团队协作': '#84cc16',
    '娱乐休闲': '#ec4899',
    '未分类': '#6b7280'
  };
  
  return colorMap[category] || '#6b7280';
}

/**
 * 检查数据完整性
 */
export function checkDataIntegrity(): {
  isComplete: boolean;
  missing: string[];
  recommendations: string[];
} {
  const missing: string[] = [];
  const recommendations: string[] = [];

  // 检查主数据
  if (!localStorage.getItem('static-nav-data')) {
    missing.push('主数据');
    recommendations.push('运行数据初始化');
  }

  // 检查分类数据
  if (!localStorage.getItem('tag_categories')) {
    missing.push('分类数据');
    recommendations.push('初始化默认分类');
  }

  // 检查标签数据
  if (!localStorage.getItem('tag_data')) {
    missing.push('标签数据');
    recommendations.push('初始化标签数据');
  }

  return {
    isComplete: missing.length === 0,
    missing,
    recommendations
  };
}

/**
 * 重置所有数据
 */
export function resetAllData(): void {
  try {
    localStorage.removeItem('static-nav-data');
    localStorage.removeItem('tag_categories');
    localStorage.removeItem('tag_data');
    localStorage.removeItem('ai_config');
    localStorage.removeItem('ai_chat_history');
    
    // 清理所有分享链接
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('static-nav-share-')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('所有数据已重置');
  } catch (error) {
    console.error('重置数据失败:', error);
    throw new Error('重置数据失败');
  }
}

/**
 * 获取数据统计
 */
export function getDataStatistics(): {
  totalWebsites: number;
  totalTags: number;
  totalCategories: number;
  storageSize: number;
} {
  let totalWebsites = 0;
  let totalTags = 0;
  let totalCategories = 0;
  let storageSize = 0;

  try {
    // 主数据
    const mainData = localStorage.getItem('static-nav-data');
    if (mainData) {
      const parsed = JSON.parse(mainData);
      totalWebsites = parsed.websites?.length || 0;
      totalTags = parsed.tags?.length || 0;
      storageSize += mainData.length;
    }

    // 分类数据
    const categoriesData = localStorage.getItem('tag_categories');
    if (categoriesData) {
      const parsed = JSON.parse(categoriesData);
      totalCategories = parsed.length || 0;
      storageSize += categoriesData.length;
    }

    // 标签数据
    const tagsData = localStorage.getItem('tag_data');
    if (tagsData) {
      const parsed = JSON.parse(tagsData);
      totalTags = Math.max(totalTags, parsed.length || 0);
      storageSize += tagsData.length;
    }

    // 其他数据
    const otherKeys = ['ai_config', 'ai_chat_history'];
    otherKeys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        storageSize += data.length;
      }
    });

  } catch (error) {
    console.error('获取数据统计失败:', error);
  }

  return {
    totalWebsites,
    totalTags,
    totalCategories,
    storageSize: Math.round(storageSize / 1024) // KB
  };
}

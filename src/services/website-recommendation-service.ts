/**
 * 网站推荐服务
 * 基于标签相似度和其他因素推荐相关网站
 */

import { Website } from '../types/website';

export interface RecommendationResult {
  website: Website;
  score: number;
  matchingTags: string[];
  matchingTagsCount: number;
  reason: string;
}

export interface RecommendationOptions {
  maxResults?: number;
  minScore?: number;
  excludeCurrentWebsite?: boolean;
  includeRating?: boolean;
  includePopularity?: boolean;
  includeFeatured?: boolean;
}

export class WebsiteRecommendationService {
  private static readonly DEFAULT_MAX_RESULTS = 6;
  private static readonly DEFAULT_MIN_SCORE = 0.1;

  /**
   * 获取相关网站推荐
   * @param currentWebsite 当前网站
   * @param allWebsites 所有网站数据
   * @param options 推荐选项
   * @returns 推荐结果列表
   */
  static getRecommendations(
    currentWebsite: Website,
    allWebsites: Website[],
    options: RecommendationOptions = {}
  ): RecommendationResult[] {
    const {
      maxResults = this.DEFAULT_MAX_RESULTS,
      minScore = this.DEFAULT_MIN_SCORE,
      excludeCurrentWebsite = true,
      includeRating = true,
      includePopularity = true,
      includeFeatured = true
    } = options;

    // 过滤掉当前网站
    const candidateWebsites = excludeCurrentWebsite 
      ? allWebsites.filter(w => w.id !== currentWebsite.id)
      : allWebsites;

    // 计算每个网站的推荐分数
    const recommendations = candidateWebsites
      .map(website => this.calculateRecommendationScore(currentWebsite, website, {
        includeRating,
        includePopularity,
        includeFeatured
      }))
      .filter(result => result.score >= minScore)
      .sort((a, b) => {
        // 首先按相同标签数量排序
        if (a.matchingTagsCount !== b.matchingTagsCount) {
          return b.matchingTagsCount - a.matchingTagsCount;
        }
        // 然后按总分排序
        return b.score - a.score;
      })
      .slice(0, maxResults);

    return recommendations;
  }

  /**
   * 计算推荐分数
   * @param currentWebsite 当前网站
   * @param candidateWebsite 候选网站
   * @param options 计算选项
   * @returns 推荐结果
   */
  private static calculateRecommendationScore(
    currentWebsite: Website,
    candidateWebsite: Website,
    options: {
      includeRating?: boolean;
      includePopularity?: boolean;
      includeFeatured?: boolean;
    }
  ): RecommendationResult {
    const currentTags = new Set(currentWebsite.tags || []);
    const candidateTags = candidateWebsite.tags || [];
    
    // 计算标签相似度
    const matchingTags = candidateTags.filter(tag => currentTags.has(tag));
    const matchingTagsCount = matchingTags.length;
    
    // 基础分数：标签相似度 (Jaccard相似度)
    const unionSize = new Set([...currentWebsite.tags, ...candidateTags]).size;
    const jaccardSimilarity = unionSize > 0 ? matchingTagsCount / unionSize : 0;
    
    let score = jaccardSimilarity;
    let reasonParts: string[] = [];

    // 如果有相同标签，基础分数更高
    if (matchingTagsCount > 0) {
      score += 0.3; // 基础相关性加分
      reasonParts.push(`${matchingTagsCount}个相同标签`);
    }

    // 评分加成
    if (options.includeRating && candidateWebsite.rating) {
      const ratingBonus = (candidateWebsite.rating - 3) * 0.1; // 3分以上加分
      score += Math.max(0, ratingBonus);
      if (candidateWebsite.rating >= 4) {
        reasonParts.push(`高评分(${candidateWebsite.rating})`);
      }
    }

    // 点击量/受欢迎程度加成
    if (options.includePopularity && candidateWebsite.clicks > 0) {
      const popularityBonus = Math.min(0.2, candidateWebsite.clicks / 10000); // 最多0.2分加成
      score += popularityBonus;
      if (candidateWebsite.clicks > 1000) {
        reasonParts.push(`热门网站(${candidateWebsite.clicks}次访问)`);
      }
    }

    // 精选网站加成
    if (options.includeFeatured && candidateWebsite.featured) {
      score += 0.15;
      reasonParts.push('精选推荐');
    }

    // 同类型网站加成（基于URL域名或描述关键词）
    const categoryBonus = this.calculateCategoryBonus(currentWebsite, candidateWebsite);
    score += categoryBonus;
    if (categoryBonus > 0.1) {
      reasonParts.push('同类型网站');
    }

    // 生成推荐理由
    const reason = reasonParts.length > 0 
      ? reasonParts.join('、') 
      : matchingTagsCount > 0 
        ? '标签相关' 
        : '可能感兴趣';

    return {
      website: candidateWebsite,
      score: Math.round(score * 1000) / 1000, // 保留3位小数
      matchingTags,
      matchingTagsCount,
      reason
    };
  }

  /**
   * 计算分类加成分数
   * @param currentWebsite 当前网站
   * @param candidateWebsite 候选网站
   * @returns 分类加成分数
   */
  private static calculateCategoryBonus(
    currentWebsite: Website,
    candidateWebsite: Website
  ): number {
    let bonus = 0;

    // 检查域名相似性
    try {
      const currentDomain = new URL(currentWebsite.url).hostname;
      const candidateDomain = new URL(candidateWebsite.url).hostname;
      
      // 同一主域名
      const currentMainDomain = currentDomain.split('.').slice(-2).join('.');
      const candidateMainDomain = candidateDomain.split('.').slice(-2).join('.');
      
      if (currentMainDomain === candidateMainDomain) {
        bonus += 0.3; // 同一主域名高加成
      }
    } catch {
      // URL解析失败，忽略域名比较
    }

    // 检查描述关键词相似性
    const currentKeywords = this.extractKeywords(currentWebsite.description);
    const candidateKeywords = this.extractKeywords(candidateWebsite.description);
    
    const commonKeywords = currentKeywords.filter(keyword => 
      candidateKeywords.includes(keyword)
    );
    
    if (commonKeywords.length > 0) {
      bonus += Math.min(0.2, commonKeywords.length * 0.05); // 最多0.2分加成
    }

    return bonus;
  }

  /**
   * 从描述中提取关键词
   * @param description 描述文本
   * @returns 关键词数组
   */
  private static extractKeywords(description: string): string[] {
    if (!description) return [];

    // 简单的关键词提取
    const keywords = description
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fff]/g, ' ') // 保留中英文字符
      .split(/\s+/)
      .filter(word => word.length > 2) // 过滤短词
      .filter(word => !this.isStopWord(word)); // 过滤停用词

    return [...new Set(keywords)]; // 去重
  }

  /**
   * 检查是否为停用词
   * @param word 单词
   * @returns 是否为停用词
   */
  private static isStopWord(word: string): boolean {
    const stopWords = new Set([
      // 英文停用词
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
      
      // 中文停用词
      '的', '是', '在', '有', '和', '与', '或', '但', '为', '了', '到', '从', '由', '把', '被',
      '让', '使', '对', '向', '往', '给', '于', '以', '用', '通过', '根据', '按照', '关于',
      
      // 技术相关常见词
      'website', 'site', 'web', 'app', 'application', 'tool', 'service', 'platform', 'system',
      '网站', '平台', '工具', '服务', '系统', '应用', '软件'
    ]);
    
    return stopWords.has(word.toLowerCase());
  }

  /**
   * 获取标签相关的网站推荐（简化版本）
   * @param tags 标签数组
   * @param allWebsites 所有网站数据
   * @param maxResults 最大结果数量
   * @returns 推荐网站列表
   */
  static getWebsitesByTags(
    tags: string[],
    allWebsites: Website[],
    maxResults: number = 10
  ): Website[] {
    if (!tags || tags.length === 0) return [];

    const tagSet = new Set(tags);
    
    return allWebsites
      .map(website => ({
        website,
        matchingCount: (website.tags || []).filter(tag => tagSet.has(tag)).length
      }))
      .filter(item => item.matchingCount > 0)
      .sort((a, b) => {
        // 按匹配标签数量排序
        if (a.matchingCount !== b.matchingCount) {
          return b.matchingCount - a.matchingCount;
        }
        // 相同匹配数量时，按评分排序
        const aRating = a.website.rating || 0;
        const bRating = b.website.rating || 0;
        if (aRating !== bRating) {
          return bRating - aRating;
        }
        // 最后按点击量排序
        return (b.website.clicks || 0) - (a.website.clicks || 0);
      })
      .slice(0, maxResults)
      .map(item => item.website);
  }

  /**
   * 获取推荐统计信息
   * @param recommendations 推荐结果
   * @returns 统计信息
   */
  static getRecommendationStats(recommendations: RecommendationResult[]): {
    totalCount: number;
    averageScore: number;
    averageMatchingTags: number;
    topReasons: string[];
  } {
    if (recommendations.length === 0) {
      return {
        totalCount: 0,
        averageScore: 0,
        averageMatchingTags: 0,
        topReasons: []
      };
    }

    const totalScore = recommendations.reduce((sum, r) => sum + r.score, 0);
    const totalMatchingTags = recommendations.reduce((sum, r) => sum + r.matchingTagsCount, 0);
    
    // 统计推荐理由
    const reasonCounts = new Map<string, number>();
    recommendations.forEach(r => {
      const reasons = r.reason.split('、');
      reasons.forEach(reason => {
        reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
      });
    });

    const topReasons = Array.from(reasonCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([reason]) => reason);

    return {
      totalCount: recommendations.length,
      averageScore: Math.round((totalScore / recommendations.length) * 1000) / 1000,
      averageMatchingTags: Math.round((totalMatchingTags / recommendations.length) * 10) / 10,
      topReasons
    };
  }
}

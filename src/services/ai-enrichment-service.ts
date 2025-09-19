import { Website } from '../types/website';
import { AIService, AIConfig } from './ai-service';
import { JinaReaderResult } from './jina-reader-service';

export interface AIEnrichmentRequest {
  website: Website;
  websiteContent?: JinaReaderResult;
  enrichmentType: 'description' | 'tags' | 'features' | 'related' | 'reviews' | 'analysis' | 'all';
}

export interface AIEnrichmentResponse {
  enhancedDescription?: string;
  suggestedTags?: string[];
  features?: string[];
  relatedSites?: Array<{
    title: string;
    url: string;
    description: string;
    reason: string;
  }>;
  reviews?: Array<{
    author: string;
    content: string;
    rating: number;
  }>;
  analysis?: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  confidence: number;
}

export class AIEnrichmentService {
  private aiService: AIService;

  constructor(config: AIConfig) {
    this.aiService = new AIService(config);
  }

  async enrichWebsite(request: AIEnrichmentRequest): Promise<AIEnrichmentResponse> {
    const { website, websiteContent, enrichmentType } = request;
    
    try {
      if (enrichmentType === 'all') {
        return await this.enrichAll(website, websiteContent);
      } else {
        return await this.enrichSpecific(website, enrichmentType, websiteContent);
      }
    } catch (error) {
      console.error('AI丰富内容失败:', error);
      throw error;
    }
  }

  private async enrichAll(website: Website, websiteContent?: JinaReaderResult): Promise<AIEnrichmentResponse> {
    const [description, tags, features, related, reviews, analysis] = await Promise.all([
      this.generateEnhancedDescription(website, websiteContent),
      this.generateSuggestedTags(website, websiteContent),
      this.extractFeatures(website, websiteContent),
      this.recommendRelatedSites(website, websiteContent),
      this.generateReviews(website, websiteContent),
      this.generateAnalysis(website, websiteContent)
    ]);

    return {
      enhancedDescription: description,
      suggestedTags: tags,
      features,
      relatedSites: related,
      reviews,
      analysis,
      confidence: websiteContent?.success ? 0.9 : 0.7
    };
  }

  private async enrichSpecific(website: Website, type: string, websiteContent?: JinaReaderResult): Promise<AIEnrichmentResponse> {
    const confidence = websiteContent?.success ? 0.9 : 0.7;
    
    switch (type) {
      case 'description':
        const description = await this.generateEnhancedDescription(website, websiteContent);
        return { enhancedDescription: description, confidence };
      
      case 'tags':
        const tags = await this.generateSuggestedTags(website, websiteContent);
        return { suggestedTags: tags, confidence };
      
      case 'features':
        const features = await this.extractFeatures(website, websiteContent);
        return { features, confidence };
      
      case 'related':
        const related = await this.recommendRelatedSites(website, websiteContent);
        return { relatedSites: related, confidence: confidence * 0.9 };
      
      case 'reviews':
        const reviews = await this.generateReviews(website, websiteContent);
        return { reviews, confidence: confidence * 0.8 };
      
      case 'analysis':
        const analysis = await this.generateAnalysis(website, websiteContent);
        return { analysis, confidence };
      
      default:
        throw new Error(`不支持的丰富类型: ${type}`);
    }
  }

  private async generateEnhancedDescription(website: Website, websiteContent?: JinaReaderResult): Promise<string> {
    let contentInfo = '';
    if (websiteContent?.success) {
      contentInfo = `

网站实际内容：
- 网站标题：${websiteContent.title || '未获取到'}
- 网站描述：${websiteContent.description || '未获取到'}
- 内容摘要：${websiteContent.content ? websiteContent.content.substring(0, 500) + '...' : '未获取到内容'}`;
    }

    const prompt = `请为以下网站生成一个更详细、更吸引人的描述：

网站基本信息：
- 标题：${website.title}
- 当前描述：${website.description}
- URL：${website.url}
- 当前标签：${website.tags.join(', ')}${contentInfo}

请基于以上信息生成一个200-300字的详细描述，突出网站的核心价值和特色功能。描述应该：
1. 保持专业性和准确性
2. 突出网站的独特优势
3. 包含具体的使用场景
4. 语言生动有趣
${websiteContent?.success ? '5. 结合实际网站内容，确保描述的准确性' : '5. 基于现有信息进行合理推测'}

请直接返回描述文本，不要包含其他格式。`;

    const response = await this.aiService.getRecommendations({
      query: prompt,
      maxResults: 1
    });

    return response.reasoning;
  }

  private async generateSuggestedTags(website: Website, websiteContent?: JinaReaderResult): Promise<string[]> {
    const prompt = `请为以下网站推荐合适的标签：

网站信息：
- 标题：${website.title}
- 描述：${website.description}
- URL：${website.url}

- 当前标签：${website.tags.join(', ')}

请推荐10-15个相关标签，要求：
1. 标签要准确反映网站功能
2. 包含技术标签、功能标签、场景标签
3. 避免过于宽泛的标签
4. 考虑用户搜索习惯

请以JSON格式返回：
{
  "suggestedTags": ["标签1", "标签2", "标签3"]
}`;

    const response = await this.aiService.getRecommendations({
      query: prompt,
      maxResults: 1
    });

    // 尝试从响应中提取标签
    const tagMatch = response.reasoning.match(/"suggestedTags":\s*\[(.*?)\]/);
    if (tagMatch) {
      const tagsStr = tagMatch[1];
      const tags = tagsStr.match(/"([^"]+)"/g)?.map(tag => tag.replace(/"/g, '')) || [];
      return tags;
    }

    return [];
  }

  private async extractFeatures(website: Website, websiteContent?: JinaReaderResult): Promise<string[]> {
    const prompt = `请分析以下网站并提取其主要功能特性：

网站信息：
- 标题：${website.title}
- 描述：${website.description}
- URL：${website.url}


请提取5-8个主要功能特性，要求：
1. 功能特性要具体明确
2. 突出网站的核心价值
3. 包含技术特性和用户体验特性
4. 使用简洁的语言描述

请以JSON格式返回：
{
  "features": ["特性1", "特性2", "特性3"]
}`;

    const response = await this.aiService.getRecommendations({
      query: prompt,
      maxResults: 1
    });

    // 尝试从响应中提取特性
    const featureMatch = response.reasoning.match(/"features":\s*\[(.*?)\]/);
    if (featureMatch) {
      const featuresStr = featureMatch[1];
      const features = featuresStr.match(/"([^"]+)"/g)?.map(feature => feature.replace(/"/g, '')) || [];
      return features;
    }

    return [];
  }

  private async recommendRelatedSites(website: Website, websiteContent?: JinaReaderResult): Promise<Array<{
    title: string;
    url: string;
    description: string;
    reason: string;
  }>> {
    const prompt = `请为以下网站推荐5个相关或互补的网站：

网站信息：
- 标题：${website.title}
- 描述：${website.description}
- URL：${website.url}

- 标签：${website.tags.join(', ')}

请推荐相关网站，要求：
1. 与当前网站功能互补或相似
2. 都是高质量、知名的网站
3. 提供推荐理由
4. 确保网站真实存在

请以JSON格式返回：
{
  "relatedSites": [
    {
      "title": "网站名称",
      "url": "网站URL",
      "description": "简短描述",
      "reason": "推荐理由"
    }
  ]
}`;

    const response = await this.aiService.getRecommendations({
      query: prompt,
      maxResults: 1
    });

    // 尝试从响应中提取相关网站
    const sitesMatch = response.reasoning.match(/"relatedSites":\s*\[(.*?)\]/);
    if (sitesMatch) {
      const sitesStr = sitesMatch[1];
      const sites = sitesStr.match(/\{[^}]*\}/g)?.map(siteStr => {
        try {
          return JSON.parse(siteStr);
        } catch {
          return null;
        }
      }).filter(Boolean) || [];
      return sites;
    }

    return [];
  }

  private async generateReviews(website: Website, websiteContent?: JinaReaderResult): Promise<Array<{
    author: string;
    content: string;
    rating: number;
  }>> {
    const prompt = `请为以下网站生成3个模拟用户评价：

网站信息：
- 标题：${website.title}
- 描述：${website.description}
- URL：${website.url}


请生成真实的用户评价，要求：
1. 评价要真实可信
2. 包含具体的使用体验
3. 评分在3-5星之间
4. 评价内容要多样化

请以JSON格式返回：
{
  "reviews": [
    {
      "author": "用户名",
      "content": "评价内容",
      "rating": 4.5
    }
  ]
}`;

    const response = await this.aiService.getRecommendations({
      query: prompt,
      maxResults: 1
    });

    // 尝试从响应中提取评价
    const reviewsMatch = response.reasoning.match(/"reviews":\s*\[(.*?)\]/);
    if (reviewsMatch) {
      const reviewsStr = reviewsMatch[1];
      const reviews = reviewsStr.match(/\{[^}]*\}/g)?.map(reviewStr => {
        try {
          return JSON.parse(reviewStr);
        } catch {
          return null;
        }
      }).filter(Boolean) || [];
      return reviews;
    }

    return [];
  }

  private async generateAnalysis(website: Website, websiteContent?: JinaReaderResult): Promise<{
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  }> {
    const prompt = `请对以下网站进行全面分析：

网站信息：
- 标题：${website.title}
- 描述：${website.description}
- URL：${website.url}

- 标签：${website.tags.join(', ')}

请从以下方面进行分析：
1. 网站优势（3-5点）
2. 潜在不足（2-3点）
3. 改进建议（3-5点）

请以JSON格式返回：
{
  "analysis": {
    "strengths": ["优势1", "优势2"],
    "weaknesses": ["不足1", "不足2"],
    "recommendations": ["建议1", "建议2"]
  }
}`;

    const response = await this.aiService.getRecommendations({
      query: prompt,
      maxResults: 1
    });

    // 尝试从响应中提取分析
    const analysisMatch = response.reasoning.match(/"analysis":\s*\{([^}]*)\}/);
    if (analysisMatch) {
      try {
        const analysisStr = `{${analysisMatch[1]}}`;
        const analysis = JSON.parse(analysisStr);
        return analysis;
      } catch {
        // 解析失败，返回空分析
      }
    }

    return { strengths: [], weaknesses: [], recommendations: [] };
  }
}

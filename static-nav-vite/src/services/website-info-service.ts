import { Website } from '../types/website';
import { AIService, AIConfig } from './ai-service';

export interface WebsiteInfo {
  title: string;
  description: string;
  url: string;
  icon: string;
  tags: string[];
  fullDescription?: string;
  features?: string[];
  language?: string;
  isPaid?: boolean;
  authoredBy?: string;
  metaDescription?: string;
  keywords?: string[];
  ogImage?: string;
  favicon?: string;
}

export class WebsiteInfoService {
  private aiService: AIService;

  constructor(aiConfig: AIConfig) {
    this.aiService = new AIService(aiConfig);
  }

  async getWebsiteInfo(url: string): Promise<WebsiteInfo> {
    try {
      const basicInfo = await this.fetchBasicInfo(url);
      const aiAnalysis = await this.analyzeWithAI(basicInfo);
      return this.mergeWebsiteInfo(basicInfo, aiAnalysis);
    } catch (error) {
      console.error('获取网站信息失败:', error);
      throw new Error('无法获取网站信息，请检查URL是否正确');
    }
  }

  private async fetchBasicInfo(url: string): Promise<Partial<WebsiteInfo>> {
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error('无法访问网站');
      }

      const data = await response.json();
      const html = data.contents;
      
      if (!html) {
        throw new Error('无法获取网站内容');
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const title = doc.querySelector('title')?.textContent?.trim() || '';
      const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const metaKeywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
      const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
      const favicon = doc.querySelector('link[rel="icon"]')?.getAttribute('href') || 
                     doc.querySelector('link[rel="shortcut icon"]')?.getAttribute('href') || '';
      
      const icon = this.extractWebsiteIcon(favicon, url, title);
      const keywords = metaKeywords ? metaKeywords.split(',').map(k => k.trim()) : [];
      
      return {
        title,
        description: metaDescription,
        url,
        icon,
        metaDescription,
        keywords,
        ogImage,
        favicon
      };
    } catch (error) {
      console.error('获取基本信息失败:', error);
      return {
        title: this.extractTitleFromUrl(url),
        description: '',
        url,
        icon: '🌐'
      };
    }
  }

  private async analyzeWithAI(basicInfo: Partial<WebsiteInfo>): Promise<{
    tags: string[];
    fullDescription: string;
    features: string[];
    language: string;
    isPaid: boolean;
    authoredBy: string;
    reasoning: string;
    confidence: number;
  }> {
    const prompt = `请分析以下网站信息，并提供详细的分类、标签和建议：

网站标题：${basicInfo.title || '未知'}
网站描述：${basicInfo.metaDescription || '无描述'}
网站URL：${basicInfo.url}
关键词：${basicInfo.keywords?.join(', ') || '无'}

请按照以下JSON格式返回分析结果：

{

  "tags": ["标签1", "标签2", "标签3"],
  "fullDescription": "详细的网站描述",
  "features": ["特性1", "特性2"],
  "language": "主要语言",
  "isPaid": false,
  "authoredBy": "作者或公司",
  "reasoning": "分析理由",
  "confidence": 0.9
}`;

    try {
      const response = await this.aiService.getRecommendations({
        query: prompt,
        maxResults: 1
      });

      const aiData = response.websites[0] || {} as {

        tags?: string[];
        fullDescription?: string;
        features?: string[];
        language?: string;
        isPaid?: boolean;
        authoredBy?: string;
      };
      
      return {

        tags: aiData.tags || [],
        fullDescription: aiData.fullDescription || basicInfo.metaDescription || '',
        features: aiData.features || [],
        language: aiData.language || '多语言',
        isPaid: aiData.isPaid || false,
        authoredBy: aiData.authoredBy || '',
        reasoning: response.reasoning || '',
        confidence: response.confidence || 0.8
      };
    } catch (error) {
      console.error('AI分析失败:', error);
      return {

        tags: ['网站'],
        fullDescription: basicInfo.metaDescription || '',
        features: [],
        language: '多语言',
        isPaid: false,
        authoredBy: '',
        reasoning: '无法进行AI分析',
        confidence: 0.5
      };
    }
  }

  private mergeWebsiteInfo(basicInfo: Partial<WebsiteInfo>, aiAnalysis: {
    tags: string[];
    fullDescription: string;
    features: string[];
    language: string;
    isPaid: boolean;
    authoredBy: string;
    reasoning: string;
    confidence: number;
  }): WebsiteInfo {
    return {
      title: basicInfo.title || this.extractTitleFromUrl(basicInfo.url || ''),
      description: basicInfo.metaDescription || aiAnalysis.fullDescription || '',
      url: basicInfo.url || '',
      icon: basicInfo.icon || '🌐',

      tags: [...(aiAnalysis.tags || []), '自动获取'],
      fullDescription: aiAnalysis.fullDescription || basicInfo.metaDescription || '',
      features: aiAnalysis.features || [],
      language: aiAnalysis.language || '多语言',
      isPaid: aiAnalysis.isPaid || false,
      authoredBy: aiAnalysis.authoredBy || '',
      metaDescription: basicInfo.metaDescription,
      keywords: basicInfo.keywords,
      ogImage: basicInfo.ogImage,
      favicon: basicInfo.favicon
    };
  }

  private extractTitleFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const domain = hostname.replace('www.', '');
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch {
      return '未知网站';
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private extractWebsiteIcon(favicon: string, url: string, _title: string): string {
    if (favicon) return '🌐';
    
    const domain = url.toLowerCase();
    if (domain.includes('github')) return '🐙';
    if (domain.includes('stackoverflow')) return '📚';
    if (domain.includes('medium')) return '📝';
    if (domain.includes('youtube')) return '📺';
    if (domain.includes('twitter')) return '🐦';
    if (domain.includes('linkedin')) return '💼';
    if (domain.includes('facebook')) return '📘';
    if (domain.includes('instagram')) return '📷';
    if (domain.includes('reddit')) return '🤖';
    if (domain.includes('discord')) return '💬';
    
    return '🌐';
  }

  convertToWebsite(websiteInfo: WebsiteInfo): Omit<Website, 'id'> {
    return {
      title: websiteInfo.title,
      description: websiteInfo.description,
      url: websiteInfo.url,
      icon: websiteInfo.icon,
      tags: websiteInfo.tags,

      addedDate: new Date().toISOString(),
      clicks: 0,
      featured: false,
      fullDescription: websiteInfo.fullDescription,
      features: websiteInfo.features,
      language: websiteInfo.language,
      isPaid: websiteInfo.isPaid,
      authoredBy: websiteInfo.authoredBy,
      isBuiltIn: false,
      slug: this.generateSlug(websiteInfo.title)
    };
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}

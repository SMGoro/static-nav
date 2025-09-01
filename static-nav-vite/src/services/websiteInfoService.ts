import { Website } from '../types/website';
import { AIService, AIConfig } from './aiService';

export interface WebsiteInfo {
  title: string;
  description: string;
  url: string;
  icon: string;
  category: string;
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
    category: string;
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
  "category": "网站分类",
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
        category?: string;
        tags?: string[];
        fullDescription?: string;
        features?: string[];
        language?: string;
        isPaid?: boolean;
        authoredBy?: string;
      };
      
      return {
        category: aiData.category || '其他',
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
        category: '其他',
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
    category: string;
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
      category: aiAnalysis.category || '其他',
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
    if (domain.includes('notion')) return '📋';
    if (domain.includes('figma')) return '🎨';
    if (domain.includes('behance')) return '🎨';
    if (domain.includes('dribbble')) return '🏀';
    if (domain.includes('codepen')) return '💻';
    if (domain.includes('jsfiddle')) return '💻';
    if (domain.includes('codesandbox')) return '🏖️';
    if (domain.includes('replit')) return '🔄';
    if (domain.includes('vercel')) return '▲';
    if (domain.includes('netlify')) return '🚀';
    if (domain.includes('heroku')) return '🦸';
    if (domain.includes('aws')) return '☁️';
    if (domain.includes('google')) return '🔍';
    if (domain.includes('microsoft')) return '🪟';
    if (domain.includes('apple')) return '🍎';
    if (domain.includes('amazon')) return '📦';
    if (domain.includes('shopify')) return '🛒';
    if (domain.includes('wordpress')) return '📝';
    if (domain.includes('wix')) return '🎨';
    if (domain.includes('squarespace')) return '⬜';
    if (domain.includes('webflow')) return '🌊';
    if (domain.includes('framer')) return '🎯';
    if (domain.includes('bubble')) return '🫧';
    if (domain.includes('airtable')) return '📊';
    if (domain.includes('roam')) return '🧠';
    if (domain.includes('obsidian')) return '💎';
    if (domain.includes('logseq')) return '📝';
    if (domain.includes('craft')) return '✂️';
    if (domain.includes('bear')) return '🐻';
    if (domain.includes('ulysses')) return '📖';
    if (domain.includes('scrivener')) return '✍️';
    if (domain.includes('grammarly')) return '✏️';
    if (domain.includes('hemingway')) return '📝';
    if (domain.includes('prowritingaid')) return '✍️';
    if (domain.includes('calibre')) return '📖';
    if (domain.includes('kindle')) return '📱';
    if (domain.includes('audible')) return '🎧';
    if (domain.includes('spotify')) return '🎵';
    if (domain.includes('apple-music')) return '🎵';
    if (domain.includes('tidal')) return '🌊';
    if (domain.includes('deezer')) return '🎵';
    if (domain.includes('pandora')) return '📻';
    if (domain.includes('lastfm')) return '📊';
    if (domain.includes('soundcloud')) return '☁️';
    if (domain.includes('bandcamp')) return '🎸';
    if (domain.includes('mixcloud')) return '☁️';
    if (domain.includes('anchor')) return '⚓';
    if (domain.includes('libsyn')) return '🎙️';
    if (domain.includes('buzzsprout')) return '🎙️';
    if (domain.includes('transistor')) return '📻';
    if (domain.includes('simplecast')) return '🎙️';
    if (domain.includes('megaphone')) return '📢';
    if (domain.includes('spreaker')) return '🎙️';
    if (domain.includes('iheartradio')) return '❤️';
    if (domain.includes('tunein')) return '📻';
    if (domain.includes('radio.com')) return '📻';
    if (domain.includes('pocketcasts')) return '🎧';
    if (domain.includes('overcast')) return '☁️';
    if (domain.includes('castbox')) return '📦';
    if (domain.includes('podbean')) return '🫘';
    if (domain.includes('blubrry')) return '🫘';
    
    return '🌐';
  }

  convertToWebsite(websiteInfo: WebsiteInfo): Omit<Website, 'id'> {
    return {
      title: websiteInfo.title,
      description: websiteInfo.description,
      url: websiteInfo.url,
      icon: websiteInfo.icon,
      tags: websiteInfo.tags,
      category: '其他', // 移除分类功能，使用默认值
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

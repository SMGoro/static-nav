import { Website } from '../types/website';
import { AIService, AIConfig } from './aiService';

export interface JinjaWebsiteInfo {
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
  technologies?: string[];
  socialMedia?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

export class JinjaWebsiteService {
  private aiService: AIService;

  constructor(aiConfig: AIConfig) {
    this.aiService = new AIService(aiConfig);
  }

  async getWebsiteInfo(url: string): Promise<JinjaWebsiteInfo> {
    try {
      const basicInfo = await this.fetchBasicInfo(url);
      const jinjaInfo = await this.parseWithJinja(basicInfo);
      const aiAnalysis = await this.analyzeWithAI(basicInfo, jinjaInfo);
      return this.mergeWebsiteInfo(basicInfo, jinjaInfo, aiAnalysis);
    } catch (error) {
      console.error('获取网站信息失败:', error);
      throw new Error('无法获取网站信息，请检查URL是否正确');
    }
  }

  private async fetchBasicInfo(url: string): Promise<Partial<JinjaWebsiteInfo>> {
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
      const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
      const ogDescription = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
      const favicon = doc.querySelector('link[rel="icon"]')?.getAttribute('href') || 
                     doc.querySelector('link[rel="shortcut icon"]')?.getAttribute('href') || '';
      
      const technologies = this.extractTechnologies(doc, html);
      const socialMedia = this.extractSocialMedia(doc);
      const contactInfo = this.extractContactInfo(doc, html);
      
      const icon = this.extractWebsiteIcon(favicon, url, title);
      const keywords = metaKeywords ? metaKeywords.split(',').map(k => k.trim()) : [];
      
      return {
        title: ogTitle || title,
        description: ogDescription || metaDescription,
        url,
        icon,
        metaDescription: ogDescription || metaDescription,
        keywords,
        ogImage,
        favicon,
        technologies,
        socialMedia,
        contactInfo
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

  private async parseWithJinja(basicInfo: Partial<JinjaWebsiteInfo>): Promise<Partial<JinjaWebsiteInfo>> {
    try {
      const jinjaPrompt = this.buildJinjaPrompt(basicInfo);
      
      const response = await this.aiService.getRecommendations({
        query: jinjaPrompt,
        maxResults: 1
      });

      if (response.websites.length > 0) {
        const jinjaData = response.websites[0];
        return {
          category: jinjaData.category || '其他',
          tags: jinjaData.tags || [],
          fullDescription: jinjaData.fullDescription || basicInfo.metaDescription || '',
          features: jinjaData.features || [],
          language: jinjaData.language || '多语言',
          isPaid: jinjaData.isPaid || false,
          authoredBy: jinjaData.authoredBy || ''
        };
      }
      
      return {};
    } catch (error) {
      console.error('Jinja解析失败:', error);
      return {};
    }
  }

  private async analyzeWithAI(basicInfo: Partial<JinjaWebsiteInfo>, jinjaInfo: Partial<JinjaWebsiteInfo>): Promise<{
    category: string;
    tags: string[];
    fullDescription: string;
    features: string[];
    language: string;
    isPaid: boolean;
    authoredBy: string;
    targetAudience: string;
    businessModel: string;
    techStack: string;
    marketPosition: string;
    reasoning: string;
    confidence: number;
  }> {
    const prompt = `请基于以下网站信息进行深度分析：

网站标题：${basicInfo.title || '未知'}
网站描述：${basicInfo.metaDescription || '无描述'}
网站URL：${basicInfo.url}
关键词：${basicInfo.keywords?.join(', ') || '无'}
技术栈：${basicInfo.technologies?.join(', ') || '无'}
社交媒体：${JSON.stringify(basicInfo.socialMedia || {})}
联系信息：${JSON.stringify(basicInfo.contactInfo || {})}

Jinja分析结果：
分类：${jinjaInfo.category || '未知'}
标签：${jinjaInfo.tags?.join(', ') || '无'}
特性：${jinjaInfo.features?.join(', ') || '无'}

请提供更详细的分析结果，包括：
1. 网站类型和用途
2. 目标用户群体
3. 主要功能和特性
4. 商业模式分析
5. 技术架构评估
6. 市场定位分析

请按照以下JSON格式返回：

{
  "category": "网站分类",
  "tags": ["标签1", "标签2", "标签3"],
  "fullDescription": "详细的网站描述",
  "features": ["特性1", "特性2"],
  "language": "主要语言",
  "isPaid": false,
  "authoredBy": "作者或公司",
  "targetAudience": "目标用户",
  "businessModel": "商业模式",
  "techStack": "技术栈",
  "marketPosition": "市场定位",
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
        targetAudience?: string;
        businessModel?: string;
        techStack?: string;
        marketPosition?: string;
      };
      
      return {
        category: aiData.category || jinjaInfo.category || '其他',
        tags: [...(aiData.tags || []), ...(jinjaInfo.tags || [])],
        fullDescription: aiData.fullDescription || jinjaInfo.fullDescription || basicInfo.metaDescription || '',
        features: [...(aiData.features || []), ...(jinjaInfo.features || [])],
        language: aiData.language || '多语言',
        isPaid: aiData.isPaid || jinjaInfo.isPaid || false,
        authoredBy: aiData.authoredBy || '',
        targetAudience: aiData.targetAudience || '',
        businessModel: aiData.businessModel || '',
        techStack: aiData.techStack || '',
        marketPosition: aiData.marketPosition || '',
        reasoning: response.reasoning || '',
        confidence: response.confidence || 0.8
      };
    } catch (error) {
      console.error('AI分析失败:', error);
      return {
        category: jinjaInfo.category || '其他',
        tags: jinjaInfo.tags || ['网站'],
        fullDescription: jinjaInfo.fullDescription || basicInfo.metaDescription || '',
        features: jinjaInfo.features || [],
        language: '多语言',
        isPaid: jinjaInfo.isPaid || false,
        authoredBy: '',
        targetAudience: '',
        businessModel: '',
        techStack: '',
        marketPosition: '',
        reasoning: '无法进行AI分析',
        confidence: 0.5
      };
    }
  }

  private buildJinjaPrompt(basicInfo: Partial<JinjaWebsiteInfo>): string {
    return `请使用jinja模板语法分析以下网站信息：

网站标题：{{ title }}
网站描述：{{ description }}
网站URL：{{ url }}
关键词：{{ keywords | join(', ') }}
技术栈：{{ technologies | join(', ') }}
社交媒体：{{ social_media | tojson }}
联系信息：{{ contact_info | tojson }}

请根据以下jinja模板分析网站：

{% if 'github' in url %}
网站类型：开发工具
分类：开发工具
标签：['Git', '代码托管', '开源', '协作']
特性：['版本控制', '代码审查', '项目管理', 'CI/CD']
{% elif 'figma' in url %}
网站类型：设计工具
分类：设计资源
标签：['设计', 'UI/UX', '原型设计', '协作']
特性：['实时协作', '原型设计', '设计系统', '插件生态']
{% elif 'notion' in url %}
网站类型：效率工具
分类：效率工具
标签：['笔记', '项目管理', '知识管理', '协作']
特性：['块级编辑', '数据库', '模板库', '多平台同步']
{% elif 'stackoverflow' in url %}
网站类型：技术问答
分类：开发工具
标签：['问答', '编程', '技术', '社区']
特性：['技术问答', '投票系统', '标签分类', '声誉系统']
{% elif 'medium' in url %}
网站类型：内容平台
分类：学习平台
标签：['博客', '写作', '内容创作', '分享']
特性：['文章发布', '阅读统计', '关注系统', '付费内容']
{% else %}
网站类型：{{ category | default('其他') }}
分类：{{ category | default('其他') }}
标签：{{ tags | default(['网站']) }}
特性：{{ features | default([]) }}
{% endif %}

付费模式：{{ '付费' if is_paid else '免费' }}
主要语言：{{ language | default('多语言') }}
作者：{{ authored_by | default('未知') }}

请返回JSON格式的分析结果。`;
  }

  private extractTechnologies(doc: Document, html: string): string[] {
    const technologies: string[] = [];
    
    const techPatterns = [
      { pattern: /react/i, name: 'React' },
      { pattern: /vue/i, name: 'Vue.js' },
      { pattern: /angular/i, name: 'Angular' },
      { pattern: /node\.js/i, name: 'Node.js' },
      { pattern: /python/i, name: 'Python' },
      { pattern: /django/i, name: 'Django' },
      { pattern: /flask/i, name: 'Flask' },
      { pattern: /ruby/i, name: 'Ruby' },
      { pattern: /rails/i, name: 'Ruby on Rails' },
      { pattern: /php/i, name: 'PHP' },
      { pattern: /wordpress/i, name: 'WordPress' },
      { pattern: /shopify/i, name: 'Shopify' },
      { pattern: /aws/i, name: 'AWS' },
      { pattern: /google cloud/i, name: 'Google Cloud' },
      { pattern: /azure/i, name: 'Azure' },
      { pattern: /docker/i, name: 'Docker' },
      { pattern: /kubernetes/i, name: 'Kubernetes' },
      { pattern: /mysql/i, name: 'MySQL' },
      { pattern: /postgresql/i, name: 'PostgreSQL' },
      { pattern: /mongodb/i, name: 'MongoDB' },
      { pattern: /redis/i, name: 'Redis' },
      { pattern: /nginx/i, name: 'Nginx' },
      { pattern: /apache/i, name: 'Apache' }
    ];

    techPatterns.forEach(tech => {
      if (tech.pattern.test(html)) {
        technologies.push(tech.name);
      }
    });

    return [...new Set(technologies)];
  }

  private extractSocialMedia(doc: Document): any {
    const socialMedia: any = {};
    
    const twitterHandle = doc.querySelector('meta[name="twitter:site"]')?.getAttribute('content');
    if (twitterHandle) {
      socialMedia.twitter = twitterHandle;
    }

    const fbAppId = doc.querySelector('meta[property="fb:app_id"]')?.getAttribute('content');
    if (fbAppId) {
      socialMedia.facebook = fbAppId;
    }

    const linkedInUrl = doc.querySelector('meta[property="linkedin:company"]')?.getAttribute('content');
    if (linkedInUrl) {
      socialMedia.linkedin = linkedInUrl;
    }

    const instagramUrl = doc.querySelector('meta[property="instagram:site"]')?.getAttribute('content');
    if (instagramUrl) {
      socialMedia.instagram = instagramUrl;
    }

    return socialMedia;
  }

  private extractContactInfo(doc: Document, html: string): any {
    const contactInfo: any = {};
    
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = html.match(emailRegex);
    if (emails && emails.length > 0) {
      contactInfo.email = emails[0];
    }

    const phoneRegex = /(\+?[\d\s\-\(\)]{10,})/g;
    const phones = html.match(phoneRegex);
    if (phones && phones.length > 0) {
      contactInfo.phone = phones[0];
    }

    const addressElements = doc.querySelectorAll('[itemprop="address"], .address, .contact-address');
    if (addressElements.length > 0) {
      contactInfo.address = addressElements[0].textContent?.trim();
    }

    return contactInfo;
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

  private mergeWebsiteInfo(
    basicInfo: Partial<JinjaWebsiteInfo>, 
    jinjaInfo: Partial<JinjaWebsiteInfo>, 
    aiAnalysis: any
  ): JinjaWebsiteInfo {
    return {
      title: basicInfo.title || this.extractTitleFromUrl(basicInfo.url || ''),
      description: basicInfo.metaDescription || aiAnalysis.fullDescription || '',
      url: basicInfo.url || '',
      icon: basicInfo.icon || '🌐',
      category: aiAnalysis.category || jinjaInfo.category || '其他',
      tags: [...(aiAnalysis.tags || []), ...(jinjaInfo.tags || []), 'Jinja解析'],
      fullDescription: aiAnalysis.fullDescription || jinjaInfo.fullDescription || basicInfo.metaDescription || '',
      features: [...(aiAnalysis.features || []), ...(jinjaInfo.features || [])],
      language: aiAnalysis.language || '多语言',
      isPaid: aiAnalysis.isPaid || jinjaInfo.isPaid || false,
      authoredBy: aiAnalysis.authoredBy || '',
      metaDescription: basicInfo.metaDescription,
      keywords: basicInfo.keywords,
      ogImage: basicInfo.ogImage,
      favicon: basicInfo.favicon,
      technologies: basicInfo.technologies,
      socialMedia: basicInfo.socialMedia,
      contactInfo: basicInfo.contactInfo
    };
  }

  convertToWebsite(websiteInfo: JinjaWebsiteInfo): Omit<Website, 'id'> {
    return {
      title: websiteInfo.title,
      description: websiteInfo.description,
      url: websiteInfo.url,
      icon: websiteInfo.icon,
      tags: websiteInfo.tags,
      category: websiteInfo.category,
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

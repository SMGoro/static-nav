export interface WebsiteContent {
  title: string;
  description: string;
  metaDescription?: string;
  metaKeywords?: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  textContent: string;
  links: {
    internal: string[];
    external: string[];
  };
  images: {
    src: string;
    alt: string;
  }[];
  technologies: string[];
  socialLinks: string[];
  contactInfo: {
    emails: string[];
    phones: string[];
  };
  language: string;
  favicon: string;
  ogImage?: string;
  structuredData: any[];
}

export interface AIFriendlyContent {
  basicInfo: {
    title: string;
    description: string;
    url: string;
    language: string;
  };
  contentAnalysis: {
    mainTopics: string[];
    keyFeatures: string[];
    targetAudience: string;
    contentType: string;
  };
  technicalInfo: {
    technologies: string[];
    platform: string;
    isEcommerce: boolean;
    isBlog: boolean;
    isPortfolio: boolean;
    isCorporate: boolean;
  };
  socialPresence: {
    hasContactInfo: boolean;
    socialPlatforms: string[];
    communityFeatures: boolean;
  };
  qualityIndicators: {
    contentRichness: number; // 1-10
    professionalLevel: number; // 1-10
    userEngagement: number; // 1-10
  };
}

export class ContentScrapingService {
  private corsProxies = [
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://thingproxy.freeboard.io/fetch/'
  ];

  async scrapeWebsiteContent(url: string): Promise<WebsiteContent> {
    try {
      // 尝试直接获取（可能因为CORS失败）
      let htmlContent = '';
      let success = false;

      // 方法1: 尝试直接fetch（对于支持CORS的网站）
      try {
        const response = await fetch(url, {
          mode: 'cors',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; WebsiteAnalyzer/1.0)'
          }
        });
        if (response.ok) {
          htmlContent = await response.text();
          success = true;
        }
      } catch (directError) {
        console.log('直接访问失败，尝试代理方式');
      }

      // 方法2: 使用CORS代理
      if (!success) {
        for (const proxy of this.corsProxies) {
          try {
            const proxyUrl = proxy + encodeURIComponent(url);
            const response = await fetch(proxyUrl);
            if (response.ok) {
              htmlContent = await response.text();
              success = true;
              break;
            }
          } catch (proxyError) {
            console.log(`代理 ${proxy} 失败:`, proxyError);
            continue;
          }
        }
      }

      // 方法3: 使用 link-preview-js 作为备用
      if (!success) {
        console.log('所有代理都失败，使用 link-preview-js 获取基本信息');
        return await this.fallbackToLinkPreview(url);
      }

      return this.parseHtmlContent(htmlContent, url);
    } catch (error) {
      console.error('网站内容抓取失败:', error);
      return await this.fallbackToLinkPreview(url);
    }
  }

  private async fallbackToLinkPreview(url: string): Promise<WebsiteContent> {
    const { getLinkPreview } = await import('link-preview-js');
    
    try {
      const preview = await getLinkPreview(url);
      const previewData = preview as Record<string, unknown>;
      
      return {
        title: (previewData.title as string) || '',
        description: (previewData.description as string) || '',
        metaDescription: (previewData.description as string) || '',
        metaKeywords: '',
        headings: { h1: [], h2: [], h3: [] },
        textContent: (previewData.description as string) || '',
        links: { internal: [], external: [] },
        images: (previewData.images as string[] || []).map(src => ({ src, alt: '' })),
        technologies: [],
        socialLinks: [],
        contactInfo: { emails: [], phones: [] },
        language: 'unknown',
        favicon: (previewData.favicons as string[])?.[0] || '',
        ogImage: (previewData.images as string[])?.[0],
        structuredData: []
      };
    } catch (error) {
      console.error('link-preview-js 也失败了:', error);
      throw new Error('无法获取网站内容');
    }
  }

  private parseHtmlContent(html: string, url: string): WebsiteContent {
    // 创建一个临时的DOM解析器
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 提取基本信息
    const title = doc.querySelector('title')?.textContent?.trim() || '';
    const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const metaKeywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
    const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
    const favicon = this.extractFavicon(doc, url);
    const language = doc.documentElement.lang || this.detectLanguage(html);

    // 提取标题层级
    const headings = {
      h1: Array.from(doc.querySelectorAll('h1')).map(h => h.textContent?.trim() || ''),
      h2: Array.from(doc.querySelectorAll('h2')).map(h => h.textContent?.trim() || ''),
      h3: Array.from(doc.querySelectorAll('h3')).map(h => h.textContent?.trim() || '')
    };

    // 提取文本内容
    const textContent = this.extractTextContent(doc);

    // 提取链接
    const links = this.extractLinks(doc, url);

    // 提取图片
    const images = this.extractImages(doc, url);

    // 检测技术栈
    const technologies = this.detectTechnologies(doc, html);

    // 提取社交链接
    const socialLinks = this.extractSocialLinks(doc);

    // 提取联系信息
    const contactInfo = this.extractContactInfo(textContent);

    // 提取结构化数据
    const structuredData = this.extractStructuredData(doc);

    return {
      title,
      description: metaDescription || headings.h1[0] || title,
      metaDescription,
      metaKeywords,
      headings,
      textContent,
      links,
      images,
      technologies,
      socialLinks,
      contactInfo,
      language,
      favicon,
      ogImage,
      structuredData
    };
  }

  private extractFavicon(doc: Document, url: string): string {
    const favicon = doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]')?.getAttribute('href');
    if (favicon) {
      return favicon.startsWith('http') ? favicon : new URL(favicon, url).href;
    }
    return new URL('/favicon.ico', url).href;
  }

  private detectLanguage(html: string): string {
    // 简单的语言检测
    const chineseChars = (html.match(/[\u4e00-\u9fff]/g) || []).length;
    const totalChars = html.length;
    
    if (chineseChars / totalChars > 0.1) return 'zh-CN';
    return 'en';
  }

  private extractTextContent(doc: Document): string {
    // 移除脚本和样式
    const scripts = doc.querySelectorAll('script, style, nav, footer, aside');
    scripts.forEach(el => el.remove());

    // 获取主要内容区域
    const mainContent = doc.querySelector('main, article, .content, .main, #content, #main');
    const content = mainContent || doc.body;

    return content?.textContent?.trim().slice(0, 5000) || ''; // 限制长度
  }

  private extractLinks(doc: Document, baseUrl: string): { internal: string[]; external: string[] } {
    const links = Array.from(doc.querySelectorAll('a[href]'));
    const internal: string[] = [];
    const external: string[] = [];

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        try {
          const url = new URL(href, baseUrl);
          if (url.hostname === new URL(baseUrl).hostname) {
            internal.push(url.href);
          } else {
            external.push(url.href);
          }
        } catch (e) {
          // 忽略无效链接
        }
      }
    });

    return {
      internal: [...new Set(internal)].slice(0, 20),
      external: [...new Set(external)].slice(0, 20)
    };
  }

  private extractImages(doc: Document, baseUrl: string): { src: string; alt: string }[] {
    const images = Array.from(doc.querySelectorAll('img[src]'));
    return images.map(img => ({
      src: new URL(img.getAttribute('src') || '', baseUrl).href,
      alt: img.getAttribute('alt') || ''
    })).slice(0, 10);
  }

  private detectTechnologies(doc: Document, html: string): string[] {
    const technologies: string[] = [];

    // 检测前端框架
    if (html.includes('react') || html.includes('React')) technologies.push('React');
    if (html.includes('vue') || html.includes('Vue')) technologies.push('Vue.js');
    if (html.includes('angular') || html.includes('Angular')) technologies.push('Angular');
    if (html.includes('jquery') || html.includes('jQuery')) technologies.push('jQuery');

    // 检测CSS框架
    if (html.includes('bootstrap')) technologies.push('Bootstrap');
    if (html.includes('tailwind')) technologies.push('Tailwind CSS');

    // 检测CMS
    if (html.includes('wp-content') || html.includes('wordpress')) technologies.push('WordPress');
    if (html.includes('drupal')) technologies.push('Drupal');

    // 检测电商平台
    if (html.includes('shopify')) technologies.push('Shopify');
    if (html.includes('woocommerce')) technologies.push('WooCommerce');

    // 检测分析工具
    if (html.includes('google-analytics') || html.includes('gtag')) technologies.push('Google Analytics');
    if (html.includes('gtm')) technologies.push('Google Tag Manager');

    return [...new Set(technologies)];
  }

  private extractSocialLinks(doc: Document): string[] {
    const socialPlatforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'github', 'tiktok'];
    const socialLinks: string[] = [];

    socialPlatforms.forEach(platform => {
      const links = doc.querySelectorAll(`a[href*="${platform}.com"]`);
      if (links.length > 0) {
        socialLinks.push(platform);
      }
    });

    return socialLinks;
  }

  private extractContactInfo(text: string): { emails: string[]; phones: string[] } {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

    const emails = [...new Set(text.match(emailRegex) || [])].slice(0, 5);
    const phones = [...new Set(text.match(phoneRegex) || [])].slice(0, 5);

    return { emails, phones };
  }

  private extractStructuredData(doc: Document): any[] {
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    const structuredData: any[] = [];

    scripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent || '');
        structuredData.push(data);
      } catch (e) {
        // 忽略解析错误
      }
    });

    return structuredData;
  }

  generateAIFriendlyContent(content: WebsiteContent, url: string): AIFriendlyContent {
    // 分析主要话题
    const mainTopics = this.analyzeMainTopics(content);
    
    // 识别关键功能
    const keyFeatures = this.identifyKeyFeatures(content);
    
    // 判断目标受众
    const targetAudience = this.identifyTargetAudience(content);
    
    // 确定内容类型
    const contentType = this.determineContentType(content);
    
    // 技术分析
    const technicalInfo = this.analyzeTechnicalInfo(content);
    
    // 社交存在分析
    const socialPresence = this.analyzeSocialPresence(content);
    
    // 质量指标
    const qualityIndicators = this.calculateQualityIndicators(content);

    return {
      basicInfo: {
        title: content.title,
        description: content.description,
        url,
        language: content.language
      },
      contentAnalysis: {
        mainTopics,
        keyFeatures,
        targetAudience,
        contentType
      },
      technicalInfo,
      socialPresence,
      qualityIndicators
    };
  }

  private analyzeMainTopics(content: WebsiteContent): string[] {
    const allText = [
      content.title,
      content.description,
      ...content.headings.h1,
      ...content.headings.h2,
      content.textContent.slice(0, 1000)
    ].join(' ').toLowerCase();

    const topicKeywords = {
      '设计': ['design', 'ui', 'ux', '设计', '界面', '用户体验'],
      '开发': ['development', 'programming', 'code', '开发', '编程', '代码'],
      '商业': ['business', 'commerce', 'shop', '商业', '电商', '购物'],
      '教育': ['education', 'learning', 'course', '教育', '学习', '课程'],
      '娱乐': ['entertainment', 'game', 'fun', '娱乐', '游戏', '有趣'],
      '新闻': ['news', 'blog', 'article', '新闻', '博客', '文章'],
      '工具': ['tool', 'utility', 'service', '工具', '实用', '服务'],
      '社交': ['social', 'community', 'chat', '社交', '社区', '聊天']
    };

    const topics: string[] = [];
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => allText.includes(keyword))) {
        topics.push(topic);
      }
    });

    return topics.length > 0 ? topics : ['通用'];
  }

  private identifyKeyFeatures(content: WebsiteContent): string[] {
    const features: string[] = [];
    const text = content.textContent.toLowerCase();

    // 基于内容识别功能
    const featurePatterns = {
      '免费使用': ['free', 'no cost', '免费', '无需付费'],
      '用户注册': ['sign up', 'register', 'account', '注册', '账户'],
      '在线工具': ['online tool', 'web app', '在线工具', '网页应用'],
      '移动应用': ['mobile app', 'ios', 'android', '手机应用', '移动端'],
      '云服务': ['cloud', 'saas', '云服务', '云端'],
      '开源项目': ['open source', 'github', '开源', '源代码'],
      '付费服务': ['premium', 'paid', 'subscription', '付费', '订阅'],
      '多语言支持': ['multilingual', 'international', '多语言', '国际化']
    };

    Object.entries(featurePatterns).forEach(([feature, patterns]) => {
      if (patterns.some(pattern => text.includes(pattern))) {
        features.push(feature);
      }
    });

    return features;
  }

  private identifyTargetAudience(content: WebsiteContent): string {
    const text = content.textContent.toLowerCase();
    
    if (text.includes('developer') || text.includes('开发者') || text.includes('programmer')) {
      return '开发者';
    }
    if (text.includes('designer') || text.includes('设计师')) {
      return '设计师';
    }
    if (text.includes('business') || text.includes('企业') || text.includes('company')) {
      return '企业用户';
    }
    if (text.includes('student') || text.includes('学生') || text.includes('education')) {
      return '学生/教育者';
    }
    
    return '普通用户';
  }

  private determineContentType(content: WebsiteContent): string {
    const { technologies, textContent, headings } = content;
    
    if (technologies.includes('WordPress') || technologies.includes('Drupal')) {
      return '内容管理系统';
    }
    if (technologies.includes('Shopify') || technologies.includes('WooCommerce')) {
      return '电商网站';
    }
    if (headings.h2.some(h => h.includes('blog') || h.includes('博客'))) {
      return '博客网站';
    }
    if (textContent.includes('portfolio') || textContent.includes('作品集')) {
      return '作品展示';
    }
    
    return '企业官网';
  }

  private analyzeTechnicalInfo(content: WebsiteContent) {
    return {
      technologies: content.technologies,
      platform: content.technologies.includes('WordPress') ? 'WordPress' : 
                content.technologies.includes('React') ? 'React' : '其他',
      isEcommerce: content.technologies.some(t => ['Shopify', 'WooCommerce'].includes(t)),
      isBlog: content.headings.h2.some(h => h.toLowerCase().includes('blog')),
      isPortfolio: content.textContent.toLowerCase().includes('portfolio'),
      isCorporate: content.textContent.toLowerCase().includes('company')
    };
  }

  private analyzeSocialPresence(content: WebsiteContent) {
    return {
      hasContactInfo: content.contactInfo.emails.length > 0 || content.contactInfo.phones.length > 0,
      socialPlatforms: content.socialLinks,
      communityFeatures: content.textContent.toLowerCase().includes('community') || 
                        content.textContent.toLowerCase().includes('forum')
    };
  }

  private calculateQualityIndicators(content: WebsiteContent) {
    // 内容丰富度 (1-10)
    const contentRichness = Math.min(10, Math.max(1, 
      (content.textContent.length / 1000) + 
      (content.headings.h1.length + content.headings.h2.length) / 2 +
      (content.images.length / 5)
    ));

    // 专业程度 (1-10)
    const professionalLevel = Math.min(10, Math.max(1,
      (content.technologies.length * 2) +
      (content.structuredData.length * 3) +
      (content.metaDescription ? 2 : 0) +
      (content.contactInfo.emails.length > 0 ? 2 : 0)
    ));

    // 用户参与度 (1-10)
    const userEngagement = Math.min(10, Math.max(1,
      (content.socialLinks.length * 2) +
      (content.links.external.length / 5) +
      (content.contactInfo.emails.length > 0 ? 3 : 0)
    ));

    return {
      contentRichness: Math.round(contentRichness),
      professionalLevel: Math.round(professionalLevel),
      userEngagement: Math.round(userEngagement)
    };
  }
}

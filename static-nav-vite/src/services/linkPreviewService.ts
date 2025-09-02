import { getLinkPreview } from 'link-preview-js';
import { Website } from '../types/website';

export interface LinkPreviewInfo {
  title: string;
  description: string;
  url: string;
  icon: string;
  tags: string[];
  image?: string;
  siteName?: string;
  favicon?: string;
}

export class LinkPreviewService {
  async getWebsiteInfo(url: string): Promise<LinkPreviewInfo> {
    try {
      const preview = await getLinkPreview(url);
      
      // 提取基本信息，处理不同的返回类型
      const previewData = preview as Record<string, unknown>;
      const title = (previewData.title as string) || this.extractTitleFromUrl(url);
      const description = (previewData.description as string) || '';
      const images = previewData.images as string[] | undefined;
      const image = images?.[0] || '';
      const siteName = (previewData.siteName as string) || '';
      const favicons = previewData.favicons as string[] | undefined;
      const favicon = favicons?.[0] || '';
      
      // 生成图标 - 直接使用 favicon 或默认 emoji
      const icon = favicon || '🌐';
      
      // 生成基础标签
      const tags = this.generateBasicTags(url, title, description);
      
      return {
        title,
        description,
        url,
        icon,
        tags,
        image,
        siteName,
        favicon
      };
    } catch (error) {
      console.error('获取网站预览信息失败:', error);
      // 返回基本信息
      return {
        title: this.extractTitleFromUrl(url),
        description: '',
        url,
        icon: '🌐',
        tags: ['网站']
      };
    }
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

  private generateBasicTags(url: string, title: string, description: string): string[] {
    const domain = url.toLowerCase();
    const content = `${title} ${description}`.toLowerCase();
    
    // 根据域名生成基础标签
    if (domain.includes('github') || domain.includes('gitlab') || domain.includes('bitbucket')) {
      return ['代码托管', '开发工具', 'Git'];
    }
    
    if (domain.includes('stackoverflow') || domain.includes('stackexchange')) {
      return ['问答', '技术', '编程'];
    }
    
    if (domain.includes('medium') || domain.includes('dev.to') || domain.includes('hashnode')) {
      return ['博客', '技术文章', '分享'];
    }
    
    if (domain.includes('youtube') || domain.includes('vimeo')) {
      return ['视频', '学习', '分享'];
    }
    
    if (domain.includes('figma') || domain.includes('sketch')) {
      return ['设计', 'UI/UX', '工具'];
    }
    
    if (domain.includes('notion') || domain.includes('airtable')) {
      return ['笔记', '效率工具'];
    }
    
    // 根据内容关键词生成标签
    if (content.includes('设计') || content.includes('design')) {
      return ['设计', '创意'];
    }
    
    if (content.includes('编程') || content.includes('code') || content.includes('开发')) {
      return ['编程', '开发', '技术'];
    }
    
    if (content.includes('学习') || content.includes('教程')) {
      return ['学习', '教程'];
    }
    
    // 默认标签
    return ['网站'];
  }

  convertToWebsite(websiteInfo: LinkPreviewInfo): Omit<Website, 'id'> {
    return {
      title: websiteInfo.title,
      description: websiteInfo.description,
      url: websiteInfo.url,
      icon: websiteInfo.icon,
      tags: websiteInfo.tags,
      addedDate: new Date().toISOString(),
      clicks: 0,
      featured: false,
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

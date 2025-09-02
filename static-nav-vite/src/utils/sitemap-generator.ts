import { AppData } from './data-manager';

export interface SitemapUrl {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export class SitemapGenerator {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  generateSitemap(data: AppData): string {
    const urls: SitemapUrl[] = [
      // 主页
      {
        url: this.baseUrl,
        changefreq: 'daily',
        priority: 1.0
      },
      // 功能页面
      {
        url: `${this.baseUrl}/ai`,
        changefreq: 'weekly',
        priority: 0.8
      },
      {
        url: `${this.baseUrl}/tags`,
        changefreq: 'weekly',
        priority: 0.8
      },
      {
        url: `${this.baseUrl}/filter`,
        changefreq: 'weekly',
        priority: 0.8
      },
      {
        url: `${this.baseUrl}/data`,
        changefreq: 'monthly',
        priority: 0.6
      },
      // 网站详情页面
      ...data.websites.map(website => ({
        url: `${this.baseUrl}/website/${website.slug || website.id}`,
        lastmod: website.lastUpdated || website.addedDate,
        changefreq: 'monthly' as const,
        priority: website.featured ? 0.9 : 0.7
      }))
    ];

    return this.generateXML(urls);
  }

  private generateXML(urls: SitemapUrl[]): string {
    const xmlUrls = urls.map(url => {
      const lastmod = url.lastmod ? `\n    <lastmod>${url.lastmod}</lastmod>` : '';
      const changefreq = url.changefreq ? `\n    <changefreq>${url.changefreq}</changefreq>` : '';
      const priority = url.priority ? `\n    <priority>${url.priority}</priority>` : '';
      
      return `  <url>
    <loc>${url.url}</loc>${lastmod}${changefreq}${priority}
  </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;
  }

  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

Sitemap: ${this.baseUrl}/sitemap.xml

# 禁止访问管理页面
Disallow: /data
Disallow: /test

# 允许访问网站详情页面
Allow: /website/
Allow: /ai
Allow: /tags
Allow: /filter`;
  }
}

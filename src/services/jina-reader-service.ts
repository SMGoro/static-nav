/**
 * Jina AI Reader 服务
 * 用于获取网站内容和信息
 */

export interface JinaReaderResult {
  success: boolean;
  title?: string;
  content?: string;
  description?: string;
  url?: string;
  error?: string;
  statusCode?: number;
}

export class JinaReaderService {
  private static readonly JINA_READER_BASE_URL = 'https://r.jina.ai/';
  private static readonly TIMEOUT = 30000; // 30秒超时

  /**
   * 使用Jina AI Reader获取网站内容
   * @param url 要获取内容的网站URL
   * @returns 网站内容信息
   */
  static async getWebsiteContent(url: string): Promise<JinaReaderResult> {
    try {
      // 确保URL格式正确
      const targetUrl = this.normalizeUrl(url);
      const jinaUrl = `${this.JINA_READER_BASE_URL}${encodeURIComponent(targetUrl)}`;

      console.log(`正在使用Jina AI Reader获取网站内容: ${jinaUrl}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

      const response = await fetch(jinaUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status
        };
      }

      const content = await response.text();
      
      if (!content || content.trim().length === 0) {
        return {
          success: false,
          error: '获取到的内容为空'
        };
      }

      // 解析内容，提取标题和描述
      const parsedContent = this.parseContent(content, targetUrl);

      return {
        success: true,
        ...parsedContent
      };

    } catch (error) {
      console.error('Jina AI Reader 获取内容失败:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: '请求超时，网站响应时间过长'
          };
        }
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          return {
            success: false,
            error: '网络连接失败，请检查网络连接或网站是否可访问'
          };
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 标准化URL格式
   */
  private static normalizeUrl(url: string): string {
    // 如果没有协议，默认添加https
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    return url;
  }

  /**
   * 解析Jina AI Reader返回的内容
   */
  private static parseContent(content: string, originalUrl: string): {
    title?: string;
    content: string;
    description?: string;
    url: string;
  } {
    const lines = content.split('\n').filter(line => line.trim());
    
    // 尝试提取标题（通常是第一行或包含标题信息的行）
    let title = '';
    let description = '';
    let cleanContent = content;

    // 查找可能的标题
    for (let i = 0; i < Math.min(lines.length, 10); i++) {
      const line = lines[i].trim();
      
      // 跳过URL行
      if (line.startsWith('http')) continue;
      
      // 如果是较短的行且不包含太多标点，可能是标题
      if (line.length > 10 && line.length < 200 && !title) {
        // 检查是否像标题（不以句号结尾，不包含太多逗号）
        const punctuationCount = (line.match(/[,.;:!?]/g) || []).length;
        if (punctuationCount < 3 && !line.endsWith('.')) {
          title = line;
          continue;
        }
      }
      
      // 寻找描述性段落
      if (line.length > 50 && line.length < 500 && !description) {
        description = line;
      }
    }

    // 清理内容，移除过多的空行
    cleanContent = content
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // 如果没有找到合适的描述，从内容中提取前几句
    if (!description && cleanContent.length > 100) {
      const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 20);
      if (sentences.length > 0) {
        description = sentences[0].trim() + '.';
        if (description.length > 300) {
          description = description.substring(0, 300) + '...';
        }
      }
    }

    return {
      title: title || undefined,
      content: cleanContent,
      description: description || undefined,
      url: originalUrl
    };
  }

  /**
   * 生成网站摘要信息
   */
  static generateWebsiteSummary(result: JinaReaderResult): string {
    if (!result.success || !result.content) {
      return '无法获取网站内容';
    }

    const { title, description, content } = result;
    let summary = '';

    if (title) {
      summary += `网站标题: ${title}\n\n`;
    }

    if (description) {
      summary += `网站描述: ${description}\n\n`;
    }

    // 提取内容要点
    const contentLines = content.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 30 && trimmed.length < 200;
    });

    if (contentLines.length > 0) {
      summary += '主要内容:\n';
      contentLines.slice(0, 5).forEach((line, index) => {
        summary += `${index + 1}. ${line.trim()}\n`;
      });
    }

    return summary || '网站内容较少或格式特殊';
  }

  /**
   * 检查Jina AI Reader服务是否可用
   */
  static async checkServiceAvailability(): Promise<boolean> {
    try {
      const testUrl = 'https://example.com';
      const jinaUrl = `${this.JINA_READER_BASE_URL}${encodeURIComponent(testUrl)}`;
      
      const response = await fetch(jinaUrl, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }
}

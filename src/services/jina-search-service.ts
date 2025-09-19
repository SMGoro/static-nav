/**
 * Jina Search 服务
 * 用于网络搜索和AI推荐功能
 * API 文档：https://s.jina.ai/
 */

export interface JinaSearchResult {
  success: boolean;
  results?: Array<{
    title: string;
    url: string;
    snippet: string;
    rank?: number;
  }>;
  error?: string;
  totalResults?: number;
  searchTime?: number;
}

export interface JinaSearchConfig {
  apiKey: string;
  maxResults?: number;
  timeout?: number;
}

export class JinaSearchService {
  private static readonly JINA_SEARCH_BASE_URL = 'https://s.jina.ai/';
  private static readonly DEFAULT_TIMEOUT = 15000; // 15秒超时
  private static readonly DEFAULT_MAX_RESULTS = 10;

  private config: JinaSearchConfig;

  constructor(config: JinaSearchConfig) {
    this.config = {
      maxResults: JinaSearchService.DEFAULT_MAX_RESULTS,
      timeout: JinaSearchService.DEFAULT_TIMEOUT,
      ...config
    };
  }

  /**
   * 搜索相关网站
   * @param query 搜索查询
   * @returns 搜索结果
   */
  async search(query: string): Promise<JinaSearchResult> {
    const startTime = Date.now();

    try {
      if (!this.config.apiKey) {
        return {
          success: false,
          error: '未配置Jina API Key，请在AI设置中添加'
        };
      }

      if (!query || query.trim().length === 0) {
        return {
          success: false,
          error: '搜索查询不能为空'
        };
      }

      console.log(`正在使用Jina Search搜索: ${query}`);
      console.log(`搜索URL: ${JinaSearchService.JINA_SEARCH_BASE_URL}${encodeURIComponent(query)}`);
      console.log(`API Key前缀: ${this.config.apiKey.substring(0, 10)}...`);
      console.log(`超时时间: ${this.config.timeout}ms`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const searchUrl = `${JinaSearchService.JINA_SEARCH_BASE_URL}${encodeURIComponent(query)}`;

      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Accept': 'application/json',
          'User-Agent': 'Static-Nav-AI-Assistant/1.0'
        },
        mode: 'cors', // 明确设置CORS模式
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          return {
            success: false,
            error: 'API Key无效或已过期，请检查Jina AI配置'
          };
        }

        if (response.status === 429) {
          return {
            success: false,
            error: 'API请求频率超限，请稍后重试'
          };
        }

        return {
          success: false,
          error: `搜索失败: HTTP ${response.status} ${response.statusText}`
        };
      }

      const contentType = response.headers.get('content-type');
      let searchResults;

      if (contentType && contentType.includes('application/json')) {
        // JSON响应格式
        searchResults = await response.json();
      } else {
        // 文本响应格式，需要解析
        const textContent = await response.text();
        searchResults = this.parseTextResponse(textContent);
      }

      const processedResults = this.processSearchResults(searchResults);
      const searchTime = Date.now() - startTime;

      return {
        success: true,
        results: processedResults.slice(0, this.config.maxResults),
        totalResults: processedResults.length,
        searchTime
      };

    } catch (error) {
      console.error('Jina Search 搜索失败:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: '搜索超时，请稍后重试'
          };
        }
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          return {
            success: false,
            error: '网络连接失败，请检查网络连接'
          };
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : '未知搜索错误'
      };
    }
  }

  /**
   * 解析文本响应格式
   */
  private parseTextResponse(textContent: string): any {
    try {
      // 尝试按行解析搜索结果
      const lines = textContent.split('\n').filter(line => line.trim());
      const results = [];

      let currentResult: any = {};
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // 检测标题行（通常是第一行或不包含URL的行）
        if (trimmedLine && !trimmedLine.startsWith('http') && !currentResult.title) {
          currentResult.title = trimmedLine;
        }
        // 检测URL行
        else if (trimmedLine.startsWith('http')) {
          currentResult.url = trimmedLine;
        }
        // 检测描述行
        else if (trimmedLine && currentResult.title && currentResult.url && !currentResult.snippet) {
          currentResult.snippet = trimmedLine;
          
          // 完成一个结果
          if (currentResult.title && currentResult.url) {
            results.push({ ...currentResult });
            currentResult = {};
          }
        }
      }

      // 处理最后一个结果
      if (currentResult.title && currentResult.url) {
        results.push(currentResult);
      }

      return { results };
    } catch (error) {
      console.warn('解析文本响应失败，返回原始内容:', error);
      return {
        results: [{
          title: '搜索结果',
          url: '#',
          snippet: textContent.substring(0, 200) + '...'
        }]
      };
    }
  }

  /**
   * 处理搜索结果
   */
  private processSearchResults(rawResults: any): Array<{
    title: string;
    url: string;
    snippet: string;
    rank: number;
  }> {
    if (!rawResults || !rawResults.results) {
      return [];
    }

    return rawResults.results
      .map((result: any, index: number) => ({
        title: result.title || result.name || '无标题',
        url: result.url || result.link || '#',
        snippet: result.snippet || result.description || result.content || '暂无描述',
        rank: index + 1
      }))
      .filter((result: any) => 
        result.title && 
        result.url && 
        result.url !== '#' &&
        result.url.startsWith('http')
      );
  }

  /**
   * 根据网站标签和描述搜索相关网站
   */
  async searchRelatedWebsites(websiteTitle: string, tags: string[], description: string): Promise<JinaSearchResult> {
    // 构建智能搜索查询
    const searchTerms = [
      websiteTitle,
      ...tags.slice(0, 3), // 取前3个最相关的标签
      ...this.extractKeywords(description)
    ];

    const query = searchTerms.join(' ').substring(0, 100); // 限制查询长度
    return this.search(query);
  }

  /**
   * 从描述中提取关键词
   */
  private extractKeywords(description: string): string[] {
    if (!description) return [];

    // 简单的关键词提取逻辑
    const words = description
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fff]/g, ' ') // 保留中英文字符
      .split(/\s+/)
      .filter(word => word.length > 2) // 过滤短词
      .filter(word => !this.isStopWord(word)); // 过滤停用词

    // 返回前5个关键词
    return [...new Set(words)].slice(0, 5);
  }

  /**
   * 检查是否为停用词
   */
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
      '的', '是', '在', '有', '和', '与', '或', '但', '为', '了', '到', '从', '由', '把', '被', '让', '使', '对', '向', '往', '给', '于', '以', '用', '通过', '根据', '按照', '关于'
    ]);
    
    return stopWords.has(word.toLowerCase());
  }

  /**
   * 检查Jina Search服务是否可用
   */
  static async checkServiceAvailability(apiKey: string): Promise<boolean> {
    try {
      const testQuery = 'test';
      const testUrl = `${JinaSearchService.JINA_SEARCH_BASE_URL}${encodeURIComponent(testQuery)}`;
      
      const response = await fetch(testUrl, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        signal: AbortSignal.timeout(5000)
      });
      
      return response.ok || response.status === 401; // 401表示需要认证，但服务可用
    } catch {
      return false;
    }
  }

  /**
   * 更新API Key
   */
  updateApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
  }

  /**
   * 获取当前配置
   */
  getConfig(): JinaSearchConfig {
    return { ...this.config };
  }
}

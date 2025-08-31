import { Website } from '../types/website';

export interface AIRecommendationRequest {
  query: string;
  category?: string;
  maxResults: number;
}

export interface AIRecommendationResponse {
  websites: AIWebsiteRecommendation[];
  reasoning: string;
  confidence: number;
}

export interface AIWebsiteRecommendation {
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
}

export interface AIConfig {
  apiEndpoint: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface StreamChunk {
  type: 'start' | 'content' | 'website' | 'reasoning' | 'confidence' | 'end' | 'error';
  data: Record<string, unknown> | AIWebsiteRecommendation;
  index?: number;
}

export class AIService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  async getRecommendations(request: AIRecommendationRequest): Promise<AIRecommendationResponse> {
    const prompt = this.buildPrompt(request);
    
    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的网站推荐助手，能够根据用户需求推荐高质量的网站。请严格按照JSON格式返回结果。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('AI响应格式错误');
      }

      return this.parseAIResponse(content);
    } catch (error) {
      console.error('AI推荐请求失败:', error);
      throw error;
    }
  }

  async getRecommendationsStream(
    request: AIRecommendationRequest, 
    onChunk: (chunk: StreamChunk) => void
  ): Promise<AIRecommendationResponse> {
    const prompt = this.buildPrompt(request);
    
    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的网站推荐助手，能够根据用户需求推荐高质量的网站。请严格按照JSON格式返回结果。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      let fullContent = '';
      let isFirstChunk = true;

      // 发送开始信号
      onChunk({ type: 'start', data: { message: '开始AI分析...' } });

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        // 解码响应数据
        const chunk = new TextDecoder().decode(value);
        
        // 处理SSE格式的数据
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              onChunk({ type: 'end', data: { message: 'AI分析完成' } });
              
              // 尝试解析完整的响应
              try {
                const result = this.parseAIResponse(fullContent);
                return result;
              } catch (error) {
                console.error('最终解析失败，返回默认响应:', error);
                return {
                  websites: [],
                  reasoning: 'AI响应解析失败，请重试',
                  confidence: 0.5
                };
              }
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              
              if (content) {
                if (isFirstChunk) {
                  onChunk({ type: 'content', data: { content: '正在分析您的需求...\n\n' } });
                  isFirstChunk = false;
                }
                
                fullContent += content;
                onChunk({ type: 'content', data: { content } });
                
                // 尝试解析JSON内容
                this.tryParseStreamingJSON(content, onChunk);
              }
            } catch {
              // 忽略JSON解析错误，继续处理流数据
            }
          }
        }
      }

      // 如果没有找到[DONE]，尝试解析已收集的内容
      try {
        return this.parseAIResponse(fullContent);
      } catch (error) {
        console.error('解析失败，返回默认响应:', error);
        return {
          websites: [],
          reasoning: 'AI响应不完整，请重试',
          confidence: 0.5
        };
      }
    } catch (error: unknown) {
      console.error('AI流式推荐请求失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      onChunk({ type: 'error', data: { error: errorMessage } });
      throw error;
    }
  }

  private tryParseStreamingJSON(content: string, onChunk: (chunk: StreamChunk) => void) {
    try {
      // 尝试解析JSON片段
      if (content.includes('"websites"')) {
        const match = content.match(/"websites":\s*\[(.*?)\]/);
        if (match) {
          const websitesStr = match[1];
          const websites = this.parseWebsitesFromString(websitesStr);
          console.log('解析到的网站数量:', websites.length);
          websites.forEach((website, index) => {
            console.log(`发送网站 ${index + 1}:`, website.title);
            onChunk({ type: 'website', data: website, index });
          });
        }
      }

      if (content.includes('"reasoning"')) {
        const match = content.match(/"reasoning":\s*"([^"]*)"/);
        if (match) {
          onChunk({ type: 'reasoning', data: { reasoning: match[1] } });
        }
      }

      if (content.includes('"confidence"')) {
        const match = content.match(/"confidence":\s*([0-9.]+)/);
        if (match) {
          onChunk({ type: 'confidence', data: { confidence: parseFloat(match[1]) } });
        }
      }
    } catch (error) {
      console.error('流式JSON解析错误:', error);
      // 忽略解析错误，继续处理
    }
  }

  private parseWebsitesFromString(websitesStr: string): AIWebsiteRecommendation[] {
    try {
      // 改进的JSON解析，处理流式数据
      const websites: AIWebsiteRecommendation[] = [];
      
      // 尝试解析完整的网站数组
      try {
        const parsed = JSON.parse(`[${websitesStr}]`);
        if (Array.isArray(parsed)) {
          parsed.forEach(website => {
            if (website.title && website.url) {
              websites.push(this.validateWebsite(website));
            }
          });
          return websites;
        }
      } catch {
        // 如果完整解析失败，尝试逐个解析
      }
      
      // 逐个解析网站对象
      const websiteMatches = websitesStr.match(/\{[^}]*\}/g);
      
      if (websiteMatches) {
        websiteMatches.forEach(match => {
          try {
            const website = JSON.parse(match);
            if (website.title && website.url) {
              websites.push(this.validateWebsite(website));
            }
          } catch {
            // 忽略单个网站解析错误
          }
        });
      }
      
      return websites;
    } catch (error) {
      console.error('解析网站字符串失败:', error);
      return [];
    }
  }

  private buildPrompt(request: AIRecommendationRequest): string {
    const categoryFilter = request.category ? `，重点关注${request.category}类别的网站` : '';
    
    return `请根据以下需求推荐${request.maxResults}个高质量的网站${categoryFilter}：

需求描述：${request.query}

请严格按照以下JSON格式返回结果，确保所有字段都完整：

{
  "websites": [
    {
      "title": "网站名称",
      "description": "简短描述",
      "url": "网站URL",
      "icon": "网站图标emoji",
      "category": "网站分类",
      "tags": ["标签1", "标签2", "标签3"],
      "fullDescription": "详细描述",
      "features": ["特性1", "特性2"],
      "language": "主要语言",
      "isPaid": false,
      "authoredBy": "作者或公司"
    }
  ],
  "reasoning": "推荐理由和说明",
  "confidence": 0.95
}

要求：
1. 确保所有网站都是真实存在的
2. 网站URL必须是有效的
3. 每个网站都要包含"AI推荐"标签
4. 推荐理由要详细说明为什么推荐这些网站
5. 置信度范围0-1，表示推荐的可靠性
6. 网站分类要准确，标签要相关
7. 确保JSON格式完全正确，可以被解析`;
  }

  private parseAIResponse(content: string): AIRecommendationResponse {
    try {
      // 清理内容，移除可能的markdown代码块标记
      const cleanContent = content
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .trim();

      // 尝试直接解析
      try {
        const parsed = JSON.parse(cleanContent);
        if (parsed.websites && Array.isArray(parsed.websites)) {
          return {
            websites: parsed.websites.map((site: unknown) => this.validateWebsite(site)),
            reasoning: parsed.reasoning || '基于您的需求进行了智能推荐',
            confidence: parsed.confidence || 0.8
          };
        }
      } catch {
        // 直接解析失败，尝试提取JSON
      }

      // 尝试提取JSON部分
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.websites && Array.isArray(parsed.websites)) {
            return {
              websites: parsed.websites.map((site: unknown) => this.validateWebsite(site)),
              reasoning: parsed.reasoning || '基于您的需求进行了智能推荐',
              confidence: parsed.confidence || 0.8
            };
          }
        } catch {
          // JSON提取解析失败
        }
      }

      // 如果都失败了，尝试手动解析关键信息
      const websites: unknown[] = [];
      const websiteMatches = cleanContent.match(/"title":\s*"([^"]+)"/g);
      if (websiteMatches) {
        websiteMatches.forEach((match, index) => {
          const title = match.match(/"title":\s*"([^"]+)"/)?.[1];
          if (title) {
            // 尝试提取其他信息
            const urlMatch = cleanContent.match(new RegExp(`"url":\\s*"([^"]+)"`, 'g'));
            const descMatch = cleanContent.match(new RegExp(`"description":\\s*"([^"]+)"`, 'g'));
            
            websites.push({
              title,
              url: urlMatch?.[index]?.match(/"url":\s*"([^"]+)"/)?.[1] || 'https://example.com',
              description: descMatch?.[index]?.match(/"description":\s*"([^"]+)"/)?.[1] || '暂无描述',
              icon: '🌐',
              category: '其他',
              tags: ['AI推荐'],
              fullDescription: '',
              features: [],
              language: '多语言',
              isPaid: false,
              authoredBy: ''
            });
          }
        });
      }

      if (websites.length > 0) {
        return {
          websites: websites.map(site => this.validateWebsite(site)),
          reasoning: '从AI响应中提取的推荐网站',
          confidence: 0.6
        };
      }

      throw new Error('无法解析AI响应内容');
    } catch (error) {
      console.error('解析AI响应失败:', error);
      throw new Error('AI响应格式错误，请重试');
    }
  }

  private validateWebsite(site: any): AIWebsiteRecommendation {
    // 确保包含"AI推荐"标签
    const tags = Array.isArray(site.tags) ? site.tags : [];
    if (!tags.includes('AI推荐')) {
      tags.push('AI推荐');
    }

    return {
      title: site.title || '未知网站',
      description: site.description || '',
      url: site.url || '',
      icon: site.icon || '🌐',
      category: site.category || '其他',
      tags: tags,
      fullDescription: site.fullDescription || site.description || '',
      features: Array.isArray(site.features) ? site.features : [],
      language: site.language || '多语言',
      isPaid: site.isPaid || false,
      authoredBy: site.authoredBy || ''
    };
  }

  convertToWebsite(aiSite: AIWebsiteRecommendation): Omit<Website, 'id'> {
    return {
      title: aiSite.title,
      description: aiSite.description,
      url: aiSite.url,
      icon: aiSite.icon,
      tags: aiSite.tags,
      category: aiSite.category,
      addedDate: new Date().toISOString(),
      clicks: 0,
      featured: false,
      fullDescription: aiSite.fullDescription,
      features: aiSite.features,
      language: aiSite.language,
      isPaid: aiSite.isPaid,
      authoredBy: aiSite.authoredBy,
      isBuiltIn: false,
      slug: this.generateSlug(aiSite.title)
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

  static getDefaultConfig(): AIConfig {
    return {
      apiEndpoint: 'https://api.openai.com/v1/chat/completions',
      apiKey: '',
      model: 'gpt-3.5-turbo',
      maxTokens: 2000,
      temperature: 0.7
    };
  }
}

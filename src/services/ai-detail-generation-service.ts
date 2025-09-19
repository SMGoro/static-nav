/**
 * AI详细介绍生成服务
 * 使用Jina Reader获取网站内容，然后通过AI生成Markdown格式的详细介绍
 */

import { JinaReaderService, JinaReaderResult } from './jina-reader-service';
import { AIService, AIConfig } from './ai-service';

export interface AIDetailGenerationRequest {
  websiteUrl: string;
  websiteTitle: string;
  websiteDescription?: string;
  existingTags?: string[];
  language?: 'zh' | 'en';
}

export interface AIDetailGenerationResult {
  success: boolean;
  detailedDescription?: string; // Markdown格式的详细介绍
  suggestedTags?: string[];
  keyFeatures?: string[];
  useCases?: string[];
  targetAudience?: string[];
  pros?: string[];
  cons?: string[];
  alternatives?: string[];
  error?: string;
  confidence?: number;
  sourceContent?: JinaReaderResult;
}

export interface AIDetailGenerationProgress {
  stage: 'fetching' | 'analyzing' | 'generating' | 'streaming' | 'completed' | 'error';
  progress: number;
  message: string;
  data?: Partial<AIDetailGenerationResult>;
  streamContent?: string; // 流式输出的内容
  isStreaming?: boolean;
}

export class AIDetailGenerationService {
  private aiConfig: AIConfig;
  private jinaApiKey?: string;

  constructor(aiConfig: AIConfig, jinaApiKey?: string) {
    this.aiConfig = aiConfig;
    this.jinaApiKey = jinaApiKey;
  }

  /**
   * 生成网站详细介绍（流式输出）
   */
  async generateDetailedDescriptionStream(
    request: AIDetailGenerationRequest,
    onProgress?: (progress: AIDetailGenerationProgress) => void
  ): Promise<AIDetailGenerationResult> {
    try {
      // 第一步：获取网站内容
      onProgress?.({
        stage: 'fetching',
        progress: 10,
        message: '正在获取网站内容...'
      });

      const contentResult = await JinaReaderService.getWebsiteContent(request.websiteUrl);
      
      if (!contentResult.success) {
        return {
          success: false,
          error: `获取网站内容失败: ${contentResult.error}`
        };
      }

      // 第二步：分析内容
      onProgress?.({
        stage: 'analyzing',
        progress: 30,
        message: '正在分析网站内容...'
      });

      // 第三步：开始流式生成
      onProgress?.({
        stage: 'streaming',
        progress: 50,
        message: '正在生成详细介绍...',
        isStreaming: true,
        streamContent: ''
      });

      const aiResult = await this.generateWithAIStream(request, contentResult, onProgress);

      onProgress?.({
        stage: 'completed',
        progress: 100,
        message: '详细介绍生成完成',
        data: aiResult,
        isStreaming: false
      });

      return {
        ...aiResult,
        sourceContent: contentResult
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      onProgress?.({
        stage: 'error',
        progress: 0,
        message: `生成失败: ${errorMessage}`,
        isStreaming: false
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * 生成网站详细介绍（非流式）
   */
  async generateDetailedDescription(
    request: AIDetailGenerationRequest,
    onProgress?: (progress: AIDetailGenerationProgress) => void
  ): Promise<AIDetailGenerationResult> {
    try {
      // 第一步：获取网站内容
      onProgress?.({
        stage: 'fetching',
        progress: 10,
        message: '正在获取网站内容...'
      });

      const contentResult = await JinaReaderService.getWebsiteContent(request.websiteUrl);
      
      if (!contentResult.success) {
        return {
          success: false,
          error: `获取网站内容失败: ${contentResult.error}`
        };
      }

      // 第二步：分析内容
      onProgress?.({
        stage: 'analyzing',
        progress: 30,
        message: '正在分析网站内容...'
      });

      // 第三步：生成详细介绍
      onProgress?.({
        stage: 'generating',
        progress: 50,
        message: '正在生成详细介绍...'
      });

      const aiResult = await this.generateWithAI(request, contentResult);

      onProgress?.({
        stage: 'completed',
        progress: 100,
        message: '详细介绍生成完成',
        data: aiResult
      });

      return {
        ...aiResult,
        sourceContent: contentResult
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '生成详细介绍失败';
      
      onProgress?.({
        stage: 'error',
        progress: 0,
        message: errorMessage
      });

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * 使用AI生成详细介绍
   */
  private async generateWithAI(
    request: AIDetailGenerationRequest,
    contentResult: JinaReaderResult
  ): Promise<AIDetailGenerationResult> {
    const language = request.language || 'zh';
    const isChineseMode = language === 'zh';

    const prompt = this.buildPrompt(request, contentResult, isChineseMode);

    try {
      const response = await fetch(this.aiConfig.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.aiConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: this.aiConfig.model,
          messages: [
            {
              role: 'system',
              content: isChineseMode 
                ? '你是一个专业的网站分析师和技术写作专家，擅长分析网站功能并生成详细的Markdown格式介绍。请严格按照JSON格式返回结果。'
                : 'You are a professional website analyst and technical writer, skilled at analyzing website features and generating detailed Markdown introductions. Please return results strictly in JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.aiConfig.maxTokens,
          temperature: this.aiConfig.temperature
        })
      });

      if (!response.ok) {
        throw new Error(`AI API请求失败: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('AI返回内容为空');
      }

      // 解析AI返回的JSON
      const parsedResult = this.parseAIResponse(content);
      
      return {
        success: true,
        confidence: 0.9,
        ...parsedResult
      };

    } catch (error) {
      console.error('AI生成详细介绍失败:', error);
      throw error;
    }
  }

  /**
   * 使用AI生成详细介绍（流式输出）
   */
  private async generateWithAIStream(
    request: AIDetailGenerationRequest,
    contentResult: JinaReaderResult,
    onProgress?: (progress: AIDetailGenerationProgress) => void
  ): Promise<AIDetailGenerationResult> {
    const language = request.language || 'zh';
    const isChineseMode = language === 'zh';

    const prompt = this.buildPrompt(request, contentResult, isChineseMode);

    try {
      const response = await fetch(this.aiConfig.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.aiConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: this.aiConfig.model,
          messages: [
            {
              role: 'system',
              content: isChineseMode 
                ? '你是一个专业的网站分析师和技术写作专家，擅长分析网站功能并生成详细的Markdown格式介绍。请严格按照JSON格式返回结果。'
                : 'You are a professional website analyst and technical writer, skilled at analyzing website features and generating detailed Markdown introductions. Please return results strictly in JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.aiConfig.maxTokens,
          temperature: this.aiConfig.temperature,
          stream: true // 启用流式输出
        })
      });

      if (!response.ok) {
        throw new Error(`AI API请求失败: ${response.status} ${response.statusText}`);
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      let fullContent = '';
      let currentProgress = 50;

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          // 解析SSE数据
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                break;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                
                if (content) {
                  fullContent += content;
                  currentProgress = Math.min(95, currentProgress + 1);
                  
                  // 实时更新流式内容
                  onProgress?.({
                    stage: 'streaming',
                    progress: currentProgress,
                    message: '正在生成详细介绍...',
                    isStreaming: true,
                    streamContent: fullContent
                  });
                }
              } catch (parseError) {
                // 忽略解析错误，继续处理下一行
                console.warn('解析流式数据失败:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      if (!fullContent) {
        throw new Error('AI返回内容为空');
      }

      // 解析AI返回的JSON
      const parsedResult = this.parseAIResponse(fullContent);
      
      return {
        success: true,
        confidence: 0.9,
        ...parsedResult
      };

    } catch (error) {
      console.error('AI流式生成详细介绍失败:', error);
      throw error;
    }
  }

  /**
   * 构建AI提示词
   */
  private buildPrompt(
    request: AIDetailGenerationRequest,
    contentResult: JinaReaderResult,
    isChineseMode: boolean
  ): string {
    const { websiteUrl, websiteTitle, websiteDescription, existingTags } = request;
    
    // 提取网站内容的关键信息
    const content = contentResult.content || '';
    const contentSummary = content.length > 3000 ? content.substring(0, 3000) + '...' : content;
    
    const existingTagsInfo = existingTags && existingTags.length > 0 
      ? `\n现有标签：${existingTags.join(', ')}`
      : '';

    if (isChineseMode) {
      return `请基于以下网站信息生成详细的Markdown格式介绍：

网站标题：${websiteTitle}
网站URL：${websiteUrl}
简短描述：${websiteDescription || '暂无'}${existingTagsInfo}

网站内容：
${contentSummary}

请严格按照以下JSON格式返回结果：

{
  "detailedDescription": "# 网站标题\\n\\n## 概述\\n\\n详细的Markdown格式介绍，包含：\\n- 网站主要功能\\n- 核心特性\\n- 使用场景\\n- 技术特点等",
  "suggestedTags": ["标签1", "标签2", "标签3"],
  "keyFeatures": ["核心功能1", "核心功能2", "核心功能3"],
  "useCases": ["使用场景1", "使用场景2", "使用场景3"],
  "targetAudience": ["目标用户1", "目标用户2"],
  "pros": ["优点1", "优点2", "优点3"],
  "cons": ["缺点1", "缺点2"],
  "alternatives": ["替代方案1", "替代方案2"]
}

要求：
1. detailedDescription必须是完整的Markdown格式，包含标题、段落、列表等
2. 内容要详细、准确、有价值
3. 基于实际网站内容生成，不要编造信息
4. 所有字段都必须填写，如果某个字段无法确定，请填写空数组或合理的默认值
5. 确保JSON格式正确，可以被解析`;
    } else {
      return `Please generate a detailed Markdown introduction based on the following website information:

Website Title: ${websiteTitle}
Website URL: ${websiteUrl}
Brief Description: ${websiteDescription || 'Not available'}${existingTagsInfo}

Website Content:
${contentSummary}

Please return results strictly in the following JSON format:

{
  "detailedDescription": "# Website Title\\n\\n## Overview\\n\\nDetailed Markdown introduction including:\\n- Main features\\n- Core capabilities\\n- Use cases\\n- Technical highlights",
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "keyFeatures": ["feature1", "feature2", "feature3"],
  "useCases": ["use case1", "use case2", "use case3"],
  "targetAudience": ["audience1", "audience2"],
  "pros": ["pro1", "pro2", "pro3"],
  "cons": ["con1", "con2"],
  "alternatives": ["alternative1", "alternative2"]
}

Requirements:
1. detailedDescription must be complete Markdown format with headers, paragraphs, lists, etc.
2. Content should be detailed, accurate, and valuable
3. Generate based on actual website content, don't make up information
4. All fields must be filled, use empty arrays or reasonable defaults if uncertain
5. Ensure JSON format is correct and parseable`;
    }
  }

  /**
   * 解析AI返回的响应
   */
  private parseAIResponse(content: string): Partial<AIDetailGenerationResult> {
    try {
      // 尝试提取JSON部分
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI返回内容中未找到JSON格式数据');
      }

      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      return {
        detailedDescription: parsed.detailedDescription || '',
        suggestedTags: parsed.suggestedTags || [],
        keyFeatures: parsed.keyFeatures || [],
        useCases: parsed.useCases || [],
        targetAudience: parsed.targetAudience || [],
        pros: parsed.pros || [],
        cons: parsed.cons || [],
        alternatives: parsed.alternatives || []
      };
    } catch (error) {
      console.error('解析AI响应失败:', error);
      console.log('原始AI响应:', content);
      
      // 降级处理：尝试从原始内容中提取有用信息
      return {
        detailedDescription: `# 网站详细介绍\n\n${content}`,
        suggestedTags: [],
        keyFeatures: [],
        useCases: [],
        targetAudience: [],
        pros: [],
        cons: [],
        alternatives: []
      };
    }
  }

  /**
   * 更新网站的详细介绍
   */
  async updateWebsiteDetail(
    websiteId: string,
    generatedDetail: AIDetailGenerationResult
  ): Promise<boolean> {
    try {
      // 获取现有网站数据
      const existingData = JSON.parse(localStorage.getItem('static-nav-data') || '{"websites": []}');
      
      // 查找目标网站
      const websiteIndex = existingData.websites.findIndex((w: any) => w.id === websiteId);
      
      if (websiteIndex === -1) {
        throw new Error('网站不存在');
      }

      // 更新网站信息
      const website = existingData.websites[websiteIndex];
      website.fullDescription = generatedDetail.detailedDescription;
      website.aiGenerated = true;
      website.aiGeneratedDate = new Date().toISOString();
      
      // 合并标签（去重）
      if (generatedDetail.suggestedTags && generatedDetail.suggestedTags.length > 0) {
        const existingTags = website.tags || [];
        const newTags = [...new Set([...existingTags, ...generatedDetail.suggestedTags])];
        website.tags = newTags;
      }

      // 添加AI生成的额外信息
      if (generatedDetail.keyFeatures) {
        website.features = generatedDetail.keyFeatures;
      }

      // 保存更新后的数据
      localStorage.setItem('static-nav-data', JSON.stringify(existingData));
      
      console.log(`网站 ${websiteId} 的详细介绍已更新`);
      return true;
    } catch (error) {
      console.error('更新网站详细介绍失败:', error);
      return false;
    }
  }

  /**
   * 检查服务是否可用
   */
  isServiceAvailable(): boolean {
    return this.aiConfig.apiKey !== '' && 
           (this.jinaApiKey !== undefined && this.jinaApiKey !== '');
  }

  /**
   * 获取服务状态
   */
  getServiceStatus(): {
    aiConfigured: boolean;
    jinaConfigured: boolean;
    message: string;
  } {
    const aiConfigured = this.aiConfig.apiKey !== '';
    const jinaConfigured = this.jinaApiKey !== undefined && this.jinaApiKey !== '';
    
    let message = '';
    if (!aiConfigured && !jinaConfigured) {
      message = '需要配置AI API和Jina API密钥';
    } else if (!aiConfigured) {
      message = '需要配置AI API密钥';
    } else if (!jinaConfigured) {
      message = '需要配置Jina API密钥';
    } else {
      message = '服务配置完整';
    }

    return {
      aiConfigured,
      jinaConfigured,
      message
    };
  }
}

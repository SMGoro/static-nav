import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { AIService, AIConfig } from '../../services/ai-service';
import { ContentScrapingService, type WebsiteContent, type AIFriendlyContent } from '../../services/content-scraping-service';
import { WebsiteFormData } from './types';

interface AIEnhancementSectionProps {
  formData: WebsiteFormData;
  onDataUpdate: (data: Partial<WebsiteFormData>) => void;
  aiConfig: AIConfig;
  isEditMode?: boolean;
}

export function AIEnhancementSection({ 
  formData, 
  onDataUpdate, 
  aiConfig, 
  isEditMode = false 
}: AIEnhancementSectionProps) {
  const [isAIEnhancing, setIsAIEnhancing] = useState(false);
  const [aiStreamContent, setAiStreamContent] = useState('');
  const [aiProgress, setAiProgress] = useState('');
  const [scrapedContent, setScrapedContent] = useState<WebsiteContent | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIFriendlyContent | null>(null);
  const [showAiWarningDialog, setShowAiWarningDialog] = useState(false);
  const [error, setError] = useState('');

  const handleAutoFillForAI = async () => {
    if (!formData.url.trim()) {
      throw new Error('请先输入网站URL');
    }

    try {
      const contentScrapingService = new ContentScrapingService();
      
      setAiProgress('分析网站结构...');
      const scrapedData = await contentScrapingService.scrapeWebsiteContent(formData.url);
      
      setAiProgress('生成AI友好的分析数据...');
      const aiAnalysisData = contentScrapingService.generateAIFriendlyContent(scrapedData, formData.url);
      
      setScrapedContent(scrapedData);
      setAiAnalysis(aiAnalysisData);
      
    } catch (error) {
      console.error('获取网站内容失败:', error);
      throw error;
    }
  };

  const performAIEnhancement = async () => {
    setIsAIEnhancing(true);
    setError('');
    setAiStreamContent('');
    setAiProgress('正在连接AI服务...');

    try {
      const aiService = new AIService(aiConfig);
      
      // 构建AI提示词
      let prompt = `请基于以下详细的网站分析信息生成准确的网站描述和标签：

## 基本信息
- 网站标题：${formData.title}
- 网站描述：${formData.description}
- 网站URL：${formData.url}
- 当前标签：${formData.tags.join(', ')}`;

      if (aiAnalysis && scrapedContent) {
        prompt += `

## 详细内容分析
- 主要话题：${aiAnalysis.contentAnalysis.mainTopics.join(', ')}
- 关键功能：${aiAnalysis.contentAnalysis.keyFeatures.join(', ')}
- 目标受众：${aiAnalysis.contentAnalysis.targetAudience}
- 内容类型：${aiAnalysis.contentAnalysis.contentType}
- 检测到的技术：${aiAnalysis.technicalInfo.technologies.join(', ')}
- 网站平台：${aiAnalysis.technicalInfo.platform}
- 是否电商：${aiAnalysis.technicalInfo.isEcommerce ? '是' : '否'}
- 是否博客：${aiAnalysis.technicalInfo.isBlog ? '是' : '否'}

## 网站内容摘要
${scrapedContent.textContent.slice(0, 500)}...`;
      }

      prompt += `

请基于以上信息生成：
1. 更准确详细的网站介绍（200-300字，要体现网站的核心价值和特色）
2. 精确的标签（5-8个，基于实际内容分析）
3. 主要功能特性（3-6个，基于网站实际功能）
4. 网站作者或公司信息（基于抓取到的信息推断）
5. 主要使用语言
6. 是否为付费服务（基于内容分析判断）

请以JSON格式返回：
{
  "fullDescription": "基于实际内容的详细网站介绍",
  "tags": ["精确标签1", "精确标签2", "精确标签3"],
  "features": ["实际功能1", "实际功能2", "实际功能3"],
  "authoredBy": "作者或公司（基于分析）",
  "language": "主要语言",
  "isPaid": false
}`;

      // 尝试使用流式输出
      let response;
      try {
        response = await aiService.getRecommendationsStream(
          {
            query: prompt,
            maxResults: 1
          },
          (chunk) => {
            switch (chunk.type) {
              case 'start':
                setAiProgress('AI开始分析...');
                break;
              case 'content':
                setAiProgress('正在生成内容...');
                setAiStreamContent(prev => prev + ((chunk.data as { content?: string }).content || ''));
                break;
              case 'end':
                setAiProgress('AI分析完成');
                break;
              case 'error':
                setAiProgress('AI分析出错');
                setError((chunk.data as { message?: string }).message || 'AI处理出错');
                break;
            }
          }
        );
      } catch (streamError) {
        console.warn('流式输出失败，使用普通模式:', streamError);
        setAiProgress('使用标准AI模式...');
        
        response = await aiService.getRecommendations({
          query: prompt,
          maxResults: 1
        });
      }

      // 解析AI响应
      let aiData = {
        fullDescription: formData.description,
        tags: formData.tags,
        features: formData.features,
        authoredBy: formData.authoredBy,
        language: formData.language,
        isPaid: formData.isPaid
      };

      // 尝试多种解析方式
      let parseSuccess = false;
      try {
        if (response.reasoning) {
          const jsonMatch = response.reasoning.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            aiData = { ...aiData, ...parsed };
            parseSuccess = true;
          }
        }
        
        if (!parseSuccess && response.websites && response.websites.length > 0) {
          const website = response.websites[0];
          const websiteData = {
            fullDescription: website.fullDescription || aiData.fullDescription,
            tags: website.tags || aiData.tags,
            features: website.features || aiData.features,
            authoredBy: website.authoredBy || aiData.authoredBy,
            language: website.language || aiData.language,
            isPaid: website.isPaid !== undefined ? website.isPaid : aiData.isPaid
          };
          
          if (websiteData.fullDescription !== aiData.fullDescription || 
              (websiteData.tags && websiteData.tags.length > aiData.tags.length)) {
            aiData = websiteData;
            parseSuccess = true;
          }
        }

        if (!parseSuccess && aiStreamContent) {
          const streamJsonMatch = aiStreamContent.match(/\{[\s\S]*\}/);
          if (streamJsonMatch) {
            try {
              const streamParsed = JSON.parse(streamJsonMatch[0]);
              aiData = { ...aiData, ...streamParsed };
              parseSuccess = true;
            } catch (streamParseError) {
              console.warn('流式内容JSON解析失败:', streamParseError);
            }
          }
        }

        if (!parseSuccess) {
          console.warn('所有解析方式都失败，使用默认值');
          setAiProgress('AI响应解析失败，请重试');
        }
      } catch (parseError) {
        console.warn('AI响应解析失败:', parseError);
        setAiProgress('AI响应解析失败，请重试');
      }

      // 更新表单数据 - 智能合并策略
      const updateData: Partial<WebsiteFormData> = {
        fullDescription: aiData.fullDescription || formData.fullDescription,
        tags: aiData.tags && aiData.tags.length > 0 
          ? (isEditMode 
              ? aiData.tags
              : [...new Set([...aiData.tags, ...formData.tags])])
          : formData.tags,
        features: aiData.features && aiData.features.length > 0
          ? (isEditMode
              ? aiData.features
              : [...new Set([...aiData.features, ...formData.features])])
          : formData.features,
        authoredBy: aiData.authoredBy || formData.authoredBy,
        language: aiData.language || formData.language,
        isPaid: aiData.isPaid !== undefined ? aiData.isPaid : formData.isPaid
      };

      onDataUpdate(updateData);
      setAiProgress('AI增强完成！');
      
      setTimeout(() => {
        setAiProgress('');
        setAiStreamContent('');
      }, 3000);

    } catch (error) {
      console.error('AI增强失败:', error);
      setError(error instanceof Error ? error.message : 'AI增强失败');
      setAiProgress('AI增强失败');
    } finally {
      setIsAIEnhancing(false);
    }
  };

  const handleAIEnhancement = async () => {
    if (!formData.title || !formData.url) {
      setError('请先填写网站标题和链接');
      return;
    }

    // 检查是否已获取网站内容
    if (!scrapedContent || !aiAnalysis) {
      setAiProgress('正在获取网站内容...');
      try {
        await handleAutoFillForAI();
        
        if (!scrapedContent || !aiAnalysis) {
          setShowAiWarningDialog(true);
          return;
        }
      } catch (error) {
        console.error('自动获取网站内容失败:', error);
        setShowAiWarningDialog(true);
        return;
      }
    }

    await performAIEnhancement();
  };

  const handleAiWarningChoice = async (continueWithoutContent: boolean) => {
    setShowAiWarningDialog(false);
    
    if (continueWithoutContent) {
      await performAIEnhancement();
    } else {
      setAiProgress('');
    }
  };

  return (
    <>
      <div className="p-4 bg-muted/30 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">AI智能增强</h3>
            <p className="text-sm text-muted-foreground">
              {scrapedContent && aiAnalysis 
                ? '基于抓取的网站内容进行AI智能分析和增强'
                : '使用AI自动生成详细介绍、功能特性、标签等内容'
              }
            </p>
            {scrapedContent && aiAnalysis && (
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600">已获取网站详细内容</span>
              </div>
            )}
          </div>
          <Button
            type="button"
            onClick={handleAIEnhancement}
            disabled={!formData.title || !formData.url || isAIEnhancing}
            className="gap-2"
            variant={scrapedContent && aiAnalysis ? "default" : "outline"}
          >
            {isAIEnhancing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                AI增强中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {scrapedContent && aiAnalysis ? 'AI增强' : 'AI增强 (需先获取内容)'}
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* AI流式输出展示 */}
        {(isAIEnhancing || aiProgress || aiStreamContent) && (
          <div className="space-y-3">
            {aiProgress && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-muted-foreground">{aiProgress}</span>
              </div>
            )}

            {aiStreamContent && (
              <Card className="bg-background/50 border">
                <CardContent className="p-3">
                  <div className="text-xs text-muted-foreground mb-2">AI生成内容预览：</div>
                  <div className="text-sm font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {aiStreamContent}
                    {isAIEnhancing && <span className="animate-pulse">|</span>}
                  </div>
                </CardContent>
              </Card>
            )}

            {isAIEnhancing && (
              <div className="w-full bg-muted rounded-full h-1">
                <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI警告对话框 */}
      {showAiWarningDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-yellow-700">无法获取网站内容</h3>
              
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  未能成功获取网站的详细内容信息。
                </p>
                <p className="text-sm text-muted-foreground">
                  这可能导致 AI 生成的内容不够准确，因为 AI 将基于有限的信息（仅标题和描述）进行分析。
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>建议：</strong>请先点击"自动获取"按钮获取网站详细信息，然后再使用 AI 增强功能以获得更准确的结果。
                </p>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline"
                  onClick={() => handleAiWarningChoice(false)}
                  className="w-full"
                >
                  取消，先获取网站信息
                </Button>
                <Button 
                  onClick={() => handleAiWarningChoice(true)}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  继续 AI 增强（可能不准确）
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

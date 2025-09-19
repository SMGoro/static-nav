import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { Search, Loader2, X } from 'lucide-react';
import { LinkPreviewService } from '../../services/link-preview-service';
import { ContentScrapingService, type WebsiteContent, type AIFriendlyContent } from '../../services/content-scraping-service';
import { WebsiteFormData } from './types';

interface AutoFillSectionProps {
  url: string;
  onUrlChange: (url: string) => void;
  onDataUpdate: (data: Partial<WebsiteFormData>) => void;
  isEditMode?: boolean;
}

export function AutoFillSection({ url, onUrlChange, onDataUpdate, isEditMode = false }: AutoFillSectionProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiProgress, setAiProgress] = useState('');
  const [scrapedContent, setScrapedContent] = useState<WebsiteContent | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIFriendlyContent | null>(null);
  const [showContentPreview, setShowContentPreview] = useState(false);
  const [error, setError] = useState('');

  const handleAutoFill = async () => {
    if (!url.trim()) {
      setError('请输入网站URL');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAiProgress('正在抓取网站内容...');

    try {
      const contentScrapingService = new ContentScrapingService();
      
      setAiProgress('分析网站结构...');
      const scrapedData = await contentScrapingService.scrapeWebsiteContent(url);
      setScrapedContent(scrapedData);
      
      setAiProgress('生成AI友好的分析数据...');
      const aiAnalysisData = contentScrapingService.generateAIFriendlyContent(scrapedData, url);
      setAiAnalysis(aiAnalysisData);
      
      setAiProgress('更新表单数据...');
      
      // 智能合并策略：新增模式合并，编辑模式替换
      const updateData: Partial<WebsiteFormData> = {
        title: scrapedData.title || '',
        description: scrapedData.description || '',
        icon: scrapedData.favicon || '🌐',
        tags: isEditMode 
          ? aiAnalysisData.contentAnalysis.mainTopics
          : aiAnalysisData.contentAnalysis.mainTopics,
        screenshots: scrapedData.ogImage ? [scrapedData.ogImage] : [],
        language: scrapedData.language || '多语言',
        features: isEditMode
          ? aiAnalysisData.contentAnalysis.keyFeatures
          : aiAnalysisData.contentAnalysis.keyFeatures
      };

      onDataUpdate(updateData);
      setAiProgress('网站内容抓取完成！');
      setShowContentPreview(true);
      
      setTimeout(() => {
        setAiProgress('');
      }, 3000);
      
    } catch (error) {
      console.error('网站内容抓取失败:', error);
      setError(error instanceof Error ? error.message : '内容抓取失败，请重试');
      
      // 备用方案：使用基础的 LinkPreviewService
      try {
        setAiProgress('使用备用方案获取基本信息...');
        const linkPreviewService = new LinkPreviewService();
        const websiteInfo = await linkPreviewService.getWebsiteInfo(url);
        
        onDataUpdate({
          title: websiteInfo.title,
          description: websiteInfo.description,
          icon: websiteInfo.icon,
          tags: websiteInfo.tags,
          screenshots: websiteInfo.image ? [websiteInfo.image] : []
        });
        
        setAiProgress('基本信息获取完成');
      } catch (fallbackError) {
        console.error('备用方案也失败了:', fallbackError);
        setError('无法获取网站信息，请检查URL是否正确');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="url">网站链接 *</Label>
      <div className="flex gap-2">
        <Input
          id="url"
          type="url"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://example.com"
          required
          className="flex-1"
        />
        <Button 
          type="button"
          onClick={handleAutoFill}
          disabled={!url.trim() || isAnalyzing}
          variant="outline"
          className="gap-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              获取中...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              自动获取
            </>
          )}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        输入网站URL后点击"自动获取"按钮，将深度抓取网站内容并进行智能分析
      </p>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* 内容抓取进度和预览 */}
      {(isAnalyzing || aiProgress || showContentPreview) && (
        <div className="mt-4 space-y-3">
          {/* 进度指示 */}
          {aiProgress && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-muted-foreground">{aiProgress}</span>
            </div>
          )}

          {/* 内容预览 */}
          {showContentPreview && scrapedContent && aiAnalysis && (
            <Card className="bg-background/50 border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-medium text-muted-foreground">抓取内容预览</div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowContentPreview(false)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-medium">检测技术：</span>
                    <span className="text-muted-foreground">
                      {aiAnalysis.technicalInfo.technologies.join(', ') || '未检测到'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">主要话题：</span>
                    <span className="text-muted-foreground">
                      {aiAnalysis.contentAnalysis.mainTopics.join(', ')}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">目标受众：</span>
                    <span className="text-muted-foreground">
                      {aiAnalysis.contentAnalysis.targetAudience}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">质量评分：</span>
                    <span className="text-muted-foreground">
                      内容 {aiAnalysis.qualityIndicators.contentRichness}/10, 
                      专业 {aiAnalysis.qualityIndicators.professionalLevel}/10, 
                      参与 {aiAnalysis.qualityIndicators.userEngagement}/10
                    </span>
                  </div>
                  {scrapedContent.textContent && (
                    <div>
                      <span className="font-medium">内容摘要：</span>
                      <div className="text-muted-foreground mt-1 max-h-20 overflow-y-auto">
                        {scrapedContent.textContent.slice(0, 200)}...
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

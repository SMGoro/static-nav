import { useState, useEffect } from 'react';
import { Website } from '../types/website';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { ArrowLeft, Plus, X, Sparkles, Search, Loader2 } from 'lucide-react';




import { LinkPreviewService } from '../services/linkPreviewService';
import { ContentScrapingService, type WebsiteContent, type AIFriendlyContent } from '../services/contentScrapingService';
import { AIService, AIConfig } from '../services/aiService';
import { AIConfigDialog } from './AIConfigDialog';

interface WebsiteFormProps {
  website?: Website;
  onSave: (website: Omit<Website, 'id'>) => void;
  onCancel: () => void;
}

export function WebsiteForm({ website, onSave, onCancel }: WebsiteFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    icon: '🌐',
    featured: false,
    tags: [] as string[],
    // 高级设置
    fullDescription: '',
    screenshots: [] as string[],
    language: '多语言',
    authoredBy: '',
    isPaid: false,
    features: [] as string[],
    rating: 0,
    reviews: [] as any[]
  });
  const [newTag, setNewTag] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig>(AIService.getDefaultConfig());
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isAIEnhancing, setIsAIEnhancing] = useState(false);
  const [aiStreamContent, setAiStreamContent] = useState('');
  const [aiProgress, setAiProgress] = useState('');
  const [scrapedContent, setScrapedContent] = useState<WebsiteContent | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIFriendlyContent | null>(null);
  const [showContentPreview, setShowContentPreview] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showAiWarningDialog, setShowAiWarningDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [newScreenshot, setNewScreenshot] = useState('');

  useEffect(() => {
    if (website) {
      console.log('初始化编辑表单，网站数据:', website);

      setFormData({
        title: website.title,
        description: website.description,
        url: website.url,
        icon: website.icon,
        featured: website.featured,
        tags: [...website.tags],
        fullDescription: website.fullDescription || '',
        screenshots: website.screenshots || [],
        language: website.language || '多语言',
        authoredBy: website.authoredBy || '',
        isPaid: website.isPaid || false,
        features: website.features || [],
        rating: website.rating || 0,
        reviews: website.reviews || []
      });
    } else {
      // 新增网站时的默认值
      setFormData({
        title: '',
        description: '',
        url: '',
        icon: '🌐',
        featured: false,
        tags: [],
        fullDescription: '',
        screenshots: [],
        language: '多语言',
        authoredBy: '',
        isPaid: false,
        features: [],
        rating: 0,
        reviews: []
      });
    }

    // 加载AI配置
    const savedConfig = localStorage.getItem('ai_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setAiConfig({ ...AIService.getDefaultConfig(), ...parsed });
      } catch (error) {
        console.error('加载AI配置失败:', error);
      }
    }
  }, [website]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 添加调试信息
    console.log('提交表单数据:', formData);
    console.log('验证结果:', {
      title: !!formData.title,
      url: !!formData.url,
      description: !!formData.description
    });
    
    if (!formData.title || !formData.url || !formData.description) {
      console.error('表单验证失败，缺少必填字段');
      setError('请填写所有必填字段');
      return;
    }
    
    // 生成SEO友好的slug
    const generateSlug = (title: string) => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    };
    
    const websiteData = {
      ...formData,
      addedDate: website?.addedDate || new Date().toISOString().split('T')[0],
      clicks: website?.clicks || 0,
      slug: website?.slug || generateSlug(formData.title),
      isBuiltIn: website?.isBuiltIn || false,
      lastUpdated: new Date().toISOString().split('T')[0],
      relatedSites: website?.relatedSites || []
    };
    
    console.log('准备保存的网站数据:', websiteData);
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await onSave(websiteData);
      console.log(`${website ? '编辑' : '添加'}网站成功:`, websiteData);
      
      // 根据操作类型处理成功后的逻辑
      if (website) {
        // 编辑模式：直接返回查看页面
        onCancel(); // 这会触发父组件的导航逻辑
      } else {
        // 添加模式：显示成功对话框
        setShowSuccessDialog(true);
      }
    } catch (error) {
      console.error('保存失败:', error);
      setError(error instanceof Error ? error.message : '保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // 通过URL自动获取网站信息（使用jinja模板）
  const handleAutoFill = async () => {
    if (!formData.url.trim()) {
      setError('请输入网站URL');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAiProgress('正在抓取网站内容...');

    try {
      // 使用内容抓取服务获取详细信息
      const contentScrapingService = new ContentScrapingService();
      
      setAiProgress('分析网站结构...');
      const scrapedData = await contentScrapingService.scrapeWebsiteContent(formData.url);
      setScrapedContent(scrapedData);
      
      setAiProgress('生成AI友好的分析数据...');
      const aiAnalysisData = contentScrapingService.generateAIFriendlyContent(scrapedData, formData.url);
      setAiAnalysis(aiAnalysisData);
      
      setAiProgress('更新表单数据...');
      
      // 更新表单数据
      setFormData(prev => ({
        ...prev,
        title: scrapedData.title || prev.title,
        description: scrapedData.description || prev.description,
        icon: scrapedData.favicon || prev.icon,
        tags: [...new Set([...prev.tags, ...aiAnalysisData.contentAnalysis.mainTopics])],
        screenshots: scrapedData.ogImage ? [scrapedData.ogImage] : prev.screenshots,
        language: scrapedData.language || prev.language,
        features: [...new Set([...prev.features, ...aiAnalysisData.contentAnalysis.keyFeatures])]
      }));

      setAiProgress('网站内容抓取完成！');
      
      // 显示内容预览选项
      setShowContentPreview(true);
      
      console.log('抓取到的网站内容:', scrapedData);
      console.log('AI分析结果:', aiAnalysisData);
      
      // 3秒后清除进度
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
        const websiteInfo = await linkPreviewService.getWebsiteInfo(formData.url);
        
        setFormData(prev => ({
          ...prev,
          title: websiteInfo.title,
          description: websiteInfo.description,
          icon: websiteInfo.icon,
          tags: [...websiteInfo.tags],
          screenshots: websiteInfo.image ? [websiteInfo.image] : prev.screenshots
        }));
        
        setAiProgress('基本信息获取完成');
      } catch (fallbackError) {
        console.error('备用方案也失败了:', fallbackError);
        setError('无法获取网站信息，请检查URL是否正确');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };



  const handleSaveConfig = (config: AIConfig) => {
    setAiConfig(config);
    localStorage.setItem('ai_config', JSON.stringify(config));
  };

  // 清空表单
  const clearForm = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      icon: '🌐',
      featured: false,
      tags: [],
      fullDescription: '',
      screenshots: [],
      language: '多语言',
      authoredBy: '',
      isPaid: false,
      features: [],
      rating: 0,
      reviews: []
    });
    setScrapedContent(null);
    setAiAnalysis(null);
    setShowContentPreview(false);
    setError('');
    setAiProgress('');
    setAiStreamContent('');
  };

  // 处理成功对话框的选择
  const handleSuccessDialogChoice = (continueAdding: boolean) => {
    setShowSuccessDialog(false);
    
    if (continueAdding) {
      // 继续添加：清空表单
      clearForm();
    } else {
      // 不继续添加：返回主页面
      onCancel();
    }
  };

  // 处理AI警告对话框的选择
  const handleAiWarningChoice = async (continueWithoutContent: boolean) => {
    setShowAiWarningDialog(false);
    
    if (continueWithoutContent) {
      // 用户选择继续：直接执行AI增强（不基于网站内容）
      await performAIEnhancement();
    } else {
      // 用户选择不继续：清除进度状态
      setAiProgress('');
    }
  };

  // AI增强功能（流式输出）
  const handleAIEnhancement = async () => {
    if (!formData.title || !formData.url) {
      setError('请先填写网站标题和链接');
      return;
    }

    // 检查是否已获取网站内容
    if (!scrapedContent || !aiAnalysis) {
      // 尝试自动获取网站内容
      setAiProgress('正在获取网站内容...');
      try {
        await handleAutoFillForAI();
        
        // 如果还是没有获取到内容，显示警告对话框
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

  // 为AI增强专门获取网站内容（不更新表单）
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
      
      // 只设置内容，不更新表单数据
      setScrapedContent(scrapedData);
      setAiAnalysis(aiAnalysisData);
      
      console.log('为AI增强获取的网站内容:', scrapedData);
      console.log('AI分析结果:', aiAnalysisData);
      
    } catch (error) {
      console.error('获取网站内容失败:', error);
      throw error;
    }
  };

  // 执行AI增强的核心逻辑
  const performAIEnhancement = async () => {
    setIsAIEnhancing(true);
    setError('');
    setAiStreamContent('');
    setAiProgress('正在连接AI服务...');

    try {
      const aiService = new AIService(aiConfig);
      // 构建增强的AI提示词，包含抓取到的详细内容
      let prompt = `请基于以下详细的网站分析信息生成准确的网站描述和标签：

## 基本信息
- 网站标题：${formData.title}
- 网站描述：${formData.description}
- 网站URL：${formData.url}
- 当前标签：${formData.tags.join(', ')}`;

      // 如果有抓取到的内容，添加详细分析
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
- 社交平台：${aiAnalysis.socialPresence.socialPlatforms.join(', ')}
- 有联系方式：${aiAnalysis.socialPresence.hasContactInfo ? '是' : '否'}

## 质量评估
- 内容丰富度：${aiAnalysis.qualityIndicators.contentRichness}/10
- 专业程度：${aiAnalysis.qualityIndicators.professionalLevel}/10
- 用户参与度：${aiAnalysis.qualityIndicators.userEngagement}/10

## 网站内容摘要
${scrapedContent.textContent.slice(0, 500)}...

## 页面结构
- H1标题：${scrapedContent.headings.h1.slice(0, 3).join(', ')}
- H2标题：${scrapedContent.headings.h2.slice(0, 5).join(', ')}
- 图片数量：${scrapedContent.images.length}
- 外部链接：${scrapedContent.links.external.length}`;
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

      // 尝试使用流式输出，如果失败则使用普通方法
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
                setAiStreamContent(prev => prev + ((chunk.data as any).content || ''));
                break;
              case 'website':
                setAiProgress('解析网站信息...');
                break;
              case 'reasoning':
                setAiProgress('完善推理逻辑...');
                break;
              case 'confidence':
                setAiProgress('评估置信度...');
                break;
              case 'end':
                setAiProgress('AI分析完成');
                break;
              case 'error':
                setAiProgress('AI分析出错');
                setError((chunk.data as any).message as string || 'AI处理出错');
                break;
            }
          }
        );
      } catch (streamError) {
        console.warn('流式输出失败，使用普通模式:', streamError);
        setAiProgress('使用标准AI模式...');
        
        // 备用方案：使用普通的 getRecommendations
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

      // 调试信息
      console.log('AI响应详情:', {
        reasoning: response.reasoning,
        websites: response.websites,
        streamContent: aiStreamContent,
        confidence: response.confidence
      });

      // 尝试多种解析方式
      let parseSuccess = false;
      try {
        // 方式1: 从 reasoning 中解析
        if (response.reasoning) {
          console.log('尝试从 reasoning 解析...');
          const jsonMatch = response.reasoning.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            aiData = { ...aiData, ...parsed };
            parseSuccess = true;
            console.log('从 reasoning 解析成功:', parsed);
          }
        }
        
        // 方式2: 从 websites[0] 中获取
        if (!parseSuccess && response.websites && response.websites.length > 0) {
          console.log('尝试从 websites[0] 解析...');
          const website = response.websites[0];
          const websiteData = {
            fullDescription: website.fullDescription || aiData.fullDescription,
            tags: website.tags || aiData.tags,
            features: website.features || aiData.features,
            authoredBy: website.authoredBy || aiData.authoredBy,
            language: website.language || aiData.language,
            isPaid: website.isPaid !== undefined ? website.isPaid : aiData.isPaid
          };
          
          // 检查是否有有效数据
          if (websiteData.fullDescription !== aiData.fullDescription || 
              (websiteData.tags && websiteData.tags.length > aiData.tags.length)) {
            aiData = websiteData;
            parseSuccess = true;
            console.log('从 websites[0] 解析成功:', websiteData);
          }
        }

        // 方式3: 从流式内容中解析
        if (!parseSuccess && aiStreamContent) {
          console.log('尝试从流式内容解析...');
          const streamJsonMatch = aiStreamContent.match(/\{[\s\S]*\}/);
          if (streamJsonMatch) {
            try {
              const streamParsed = JSON.parse(streamJsonMatch[0]);
              aiData = { ...aiData, ...streamParsed };
              parseSuccess = true;
              console.log('从流式内容解析成功:', streamParsed);
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

      // 更新表单数据
      setFormData(prev => ({
        ...prev,
        fullDescription: aiData.fullDescription || prev.fullDescription,
        tags: aiData.tags && aiData.tags.length > 0 
          ? [...new Set([...aiData.tags, ...prev.tags])] 
          : prev.tags,
        features: aiData.features && aiData.features.length > 0
          ? [...new Set([...aiData.features, ...prev.features])]
          : prev.features,
        authoredBy: aiData.authoredBy || prev.authoredBy,
        language: aiData.language || prev.language,
        isPaid: aiData.isPaid !== undefined ? aiData.isPaid : prev.isPaid
      }));

      setAiProgress('AI增强完成！');
      
      // 3秒后清除进度信息
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

  // 添加功能特性
  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  // 删除功能特性
  const removeFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  // 添加截图
  const addScreenshot = () => {
    if (newScreenshot.trim() && !formData.screenshots.includes(newScreenshot.trim())) {
      setFormData(prev => ({
        ...prev,
        screenshots: [...prev.screenshots, newScreenshot.trim()]
      }));
      setNewScreenshot('');
    }
  };

  // 删除截图
  const removeScreenshot = (screenshot: string) => {
    setFormData(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter(s => s !== screenshot)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1>{website ? '编辑网站' : '添加网站'}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{website ? '编辑网站信息' : '添加新网站'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            {/* URL输入和自动获取 */}
            <div className="space-y-2">
              <Label htmlFor="url">网站链接 *</Label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                  required
                  className="flex-1"
                />
                <Button 
                  type="button"
                  onClick={handleAutoFill}
                  disabled={!formData.url.trim() || isAnalyzing}
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
                    <div className="bg-background/50 rounded-md p-3 border">
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
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">网站名称 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="输入网站名称"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="icon">图标</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="🌐"
                  className="text-center"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">网站描述 *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="输入网站描述..."
                rows={3}
                required
              />
            </div>

            {/* 标签管理 */}
            <div className="space-y-2">
              <Label>标签</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="添加标签"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addTag();
                  }} 
                  size="sm" 
                  variant="outline"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge 
                    key={`${tag}-${index}`} 
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      className="ml-1 hover:bg-destructive/20 rounded-sm p-0.5"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeTag(tag);
                      }}
                    >
                      <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* AI增强区域 */}
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

              {/* AI流式输出展示 */}
              {(isAIEnhancing || aiProgress || aiStreamContent) && (
                <div className="space-y-3">
                  {/* 进度指示 */}
                  {aiProgress && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-muted-foreground">{aiProgress}</span>
                    </div>
                  )}

                  {/* 流式内容展示 */}
                  {aiStreamContent && (
                    <div className="bg-background/50 rounded-md p-3 border">
                      <div className="text-xs text-muted-foreground mb-2">AI生成内容预览：</div>
                      <div className="text-sm font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {aiStreamContent}
                        {isAIEnhancing && <span className="animate-pulse">|</span>}
                      </div>
                    </div>
                  )}

                  {/* 进度条 */}
                  {isAIEnhancing && (
                    <div className="w-full bg-muted rounded-full h-1">
                      <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 精选设置和高级设置切换 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                />
                <Label htmlFor="featured">设为精选</Label>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="gap-2"
              >
                {showAdvanced ? '隐藏' : '显示'}高级设置
              </Button>
            </div>

            {/* 高级设置 */}
            {showAdvanced && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <h3 className="text-lg font-semibold">高级设置</h3>
                
                {/* 详细介绍 */}
                <div className="space-y-2">
                  <Label htmlFor="fullDescription">详细介绍</Label>
                  <Textarea
                    id="fullDescription"
                    value={formData.fullDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullDescription: e.target.value }))}
                    placeholder="输入网站的详细介绍..."
                    rows={4}
                  />
                </div>

                {/* 功能特性 */}
                <div className="space-y-2">
                  <Label>功能特性</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="添加功能特性"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    />
                    <Button type="button" onClick={addFeature} size="sm" variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-background rounded border">
                        <span className="text-sm">{feature}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeature(feature)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 网站截图 */}
                <div className="space-y-2">
                  <Label>网站截图</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newScreenshot}
                      onChange={(e) => setNewScreenshot(e.target.value)}
                      placeholder="添加截图URL"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addScreenshot())}
                    />
                    <Button type="button" onClick={addScreenshot} size="sm" variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {formData.screenshots.map((screenshot, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={screenshot} 
                          alt={`截图 ${index + 1}`} 
                          className="w-full h-24 object-cover rounded border"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im0xNSA5LTYgNi02LTYiIHN0cm9rZT0iIzk0YTNiOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
                          }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeScreenshot(screenshot)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 其他设置 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">主要语言</Label>
                    <select
                      id="language"
                      value={formData.language}
                      onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="中文">中文</option>
                      <option value="English">English</option>
                      <option value="多语言">多语言</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="authoredBy">作者/公司</Label>
                    <Input
                      id="authoredBy"
                      value={formData.authoredBy}
                      onChange={(e) => setFormData(prev => ({ ...prev, authoredBy: e.target.value }))}
                      placeholder="网站作者或公司名称"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="isPaid"
                      checked={formData.isPaid}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPaid: checked }))}
                    />
                    <Label htmlFor="isPaid">付费服务</Label>
                  </div>
                </div>
              </div>
            )}

            {/* 保存按钮 */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {website ? '保存中...' : '添加中...'}
                  </>
                ) : (
                  website ? '保存修改' : '添加网站'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* AI配置对话框 */}
      <AIConfigDialog
        isOpen={showConfigDialog}
        onClose={() => setShowConfigDialog(false)}
        onSave={handleSaveConfig}
        currentConfig={aiConfig}
      />

      {/* 添加成功对话框 */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <CardTitle className="text-green-700">网站添加成功！</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                网站 "{formData.title}" 已成功添加到导航中
              </p>
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={() => handleSuccessDialogChoice(true)}
                  className="w-full"
                >
                  继续添加网站
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleSuccessDialogChoice(false)}
                  className="w-full"
                >
                  返回主页面
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI警告对话框 */}
      {showAiWarningDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <CardTitle className="text-yellow-700">无法获取网站内容</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
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
    </div>
  );
}
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Bot, 
  Sparkles, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Globe,
  FileText,
  Tags,
  Users,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { Website } from '../../types/website';
import { 
  AIDetailGenerationService, 
  AIDetailGenerationResult, 
  AIDetailGenerationProgress 
} from '../../services/ai-detail-generation-service';
import { AIService } from '../../services/ai-service';
import { Markdown } from '../ui/markdown';

interface AIDetailGeneratorProps {
  website: Website;
  onDetailGenerated: (detail: AIDetailGenerationResult) => void;
  onWebsiteUpdated?: (updatedWebsite: Website) => void;
}

const STORAGE_KEY = 'ai_config';

export function AIDetailGenerator({ website, onDetailGenerated, onWebsiteUpdated }: AIDetailGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<AIDetailGenerationProgress | null>(null);
  const [result, setResult] = useState<AIDetailGenerationResult | null>(null);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState('preview');
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [useStreamMode, setUseStreamMode] = useState(true);

  // 获取AI配置
  const getAIConfig = () => {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig);
      } catch {
        return AIService.getDefaultConfig();
      }
    }
    return AIService.getDefaultConfig();
  };

  // 检查服务可用性
  const checkServiceAvailability = () => {
    const aiConfig = getAIConfig();
    const service = new AIDetailGenerationService(aiConfig, aiConfig.jinaApiKey);
    return service.getServiceStatus();
  };

  const handleGenerateDetail = async () => {
    setIsGenerating(true);
    setError('');
    setResult(null);
    setProgress(null);
    setStreamingContent('');
    setIsStreaming(false);

    try {
      const aiConfig = getAIConfig();
      const service = new AIDetailGenerationService(aiConfig, aiConfig.jinaApiKey);

      // 检查服务状态
      const status = service.getServiceStatus();
      if (!status.aiConfigured || !status.jinaConfigured) {
        throw new Error(status.message);
      }

      const request = {
        websiteUrl: website.url,
        websiteTitle: website.title,
        websiteDescription: website.description,
        existingTags: website.tags,
        language: 'zh' as const
      };

      // 根据模式选择生成方法
      const generationMethod = useStreamMode 
        ? service.generateDetailedDescriptionStream.bind(service)
        : service.generateDetailedDescription.bind(service);

      const generationResult = await generationMethod(
        request,
        (progressUpdate) => {
          setProgress(progressUpdate);
          
          // 处理流式内容
          if (progressUpdate.isStreaming && progressUpdate.streamContent) {
            setIsStreaming(true);
            setStreamingContent(progressUpdate.streamContent);
          } else if (progressUpdate.stage === 'completed') {
            setIsStreaming(false);
          }
        }
      );

      if (generationResult.success) {
        setResult(generationResult);
        onDetailGenerated(generationResult);
        
        toast.success('AI详细介绍生成成功！', {
          description: '已生成详细的网站介绍，您可以预览并应用到网站。',
          duration: 3000,
        });
      } else {
        throw new Error(generationResult.error || '生成详细介绍失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '生成详细介绍失败';
      setError(errorMessage);
      setIsStreaming(false);
      
      toast.error('生成详细介绍失败', {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyDetail = async () => {
    if (!result) return;

    try {
      const aiConfig = getAIConfig();
      const service = new AIDetailGenerationService(aiConfig, aiConfig.jinaApiKey);
      
      const success = await service.updateWebsiteDetail(website.id, result);
      
      if (success) {
        // 创建更新后的网站对象
        const updatedWebsite: Website = {
          ...website,
          fullDescription: result.detailedDescription || website.fullDescription,
          tags: result.suggestedTags ? 
            [...new Set([...website.tags, ...result.suggestedTags])] : 
            website.tags,
          features: result.keyFeatures || website.features,
          aiGenerated: true,
          aiGeneratedDate: new Date().toISOString()
        };

        onWebsiteUpdated?.(updatedWebsite);
        
        toast.success('详细介绍已应用！', {
          description: '网站的详细介绍已更新，页面将自动刷新。',
          duration: 3000,
        });

        // 刷新页面以显示更新后的内容
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error('应用详细介绍失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '应用详细介绍失败';
      
      toast.error('应用失败', {
        description: errorMessage,
        duration: 5000,
      });
    }
  };

  const serviceStatus = checkServiceAvailability();
  const canGenerate = serviceStatus.aiConfigured && serviceStatus.jinaConfigured && !isGenerating;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          AI生成详细介绍
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          使用AI分析网站内容并生成详细的Markdown格式介绍
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 服务状态检查 */}
        {(!serviceStatus.aiConfigured || !serviceStatus.jinaConfigured) && (
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              {serviceStatus.message}。请前往AI配置页面完成设置。
            </AlertDescription>
          </Alert>
        )}

        {/* 生成模式选择 */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="stream-mode"
              checked={useStreamMode}
              onChange={(e) => setUseStreamMode(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="stream-mode" className="text-sm font-medium">
              流式输出模式
            </label>
          </div>
          <div className="text-xs text-muted-foreground">
            {useStreamMode ? '实时显示生成过程' : '生成完成后显示结果'}
          </div>
        </div>

        {/* 生成按钮 */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleGenerateDetail}
            disabled={!canGenerate}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {isStreaming ? '流式生成中...' : '生成中...'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                生成详细介绍
              </>
            )}
          </Button>

          {result && (
            <Button
              onClick={handleApplyDetail}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              应用到网站
            </Button>
          )}
        </div>

        {/* 进度显示 */}
        {progress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {progress.message}
              </span>
              <span>{progress.progress}%</span>
            </div>
            <Progress value={progress.progress} className="h-2" />
          </div>
        )}

        {/* 错误显示 */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 流式内容显示 */}
        {isStreaming && streamingContent && (
          <Card className="border-dashed border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                实时生成中...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  <Markdown>{streamingContent}</Markdown>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 生成结果 */}
        {result && result.success && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium">生成完成</span>
              {result.confidence && (
                <Badge variant="secondary">
                  置信度: {Math.round(result.confidence * 100)}%
                </Badge>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="preview" className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  预览
                </TabsTrigger>
                <TabsTrigger value="features" className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  特性
                </TabsTrigger>
                <TabsTrigger value="tags" className="flex items-center gap-1">
                  <Tags className="w-4 h-4" />
                  标签
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  分析
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="space-y-4">
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                  <Markdown>{result.detailedDescription || '暂无详细介绍'}</Markdown>
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-4">
                {result.keyFeatures && result.keyFeatures.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      核心功能
                    </h4>
                    <div className="space-y-1">
                      {result.keyFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.useCases && result.useCases.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      使用场景
                    </h4>
                    <div className="space-y-1">
                      {result.useCases.map((useCase, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-blue-500" />
                          {useCase}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tags" className="space-y-4">
                {result.suggestedTags && result.suggestedTags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">建议标签</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.suggestedTags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {result.targetAudience && result.targetAudience.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">目标用户</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.targetAudience.map((audience, index) => (
                        <Badge key={index} variant="outline">
                          {audience}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                {result.pros && result.pros.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2 text-green-600">
                      <ThumbsUp className="w-4 h-4" />
                      优点
                    </h4>
                    <div className="space-y-1">
                      {result.pros.map((pro, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {pro}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.cons && result.cons.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2 text-red-600">
                      <ThumbsDown className="w-4 h-4" />
                      缺点
                    </h4>
                    <div className="space-y-1">
                      {result.cons.map((con, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <AlertCircle className="w-3 h-3 text-red-500" />
                          {con}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.alternatives && result.alternatives.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      替代方案
                    </h4>
                    <div className="space-y-1">
                      {result.alternatives.map((alternative, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Globe className="w-3 h-3 text-blue-500" />
                          {alternative}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* 使用提示 */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• AI将访问网站并分析内容，生成详细的Markdown格式介绍</p>
          <p>• 生成的内容包括功能特性、使用场景、优缺点分析等</p>
          <p>• 您可以预览生成的内容，确认无误后应用到网站</p>
        </div>
      </CardContent>
    </Card>
  );
}

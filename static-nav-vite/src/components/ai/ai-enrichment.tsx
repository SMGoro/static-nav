import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { 
  Bot, 
  Wand2, 
  AlertCircle, 
  Loader2,
  Sparkles,
  Tags,
  FileText,
  Link,
  CheckCircle,
  Star,
  TrendingUp,
  MessageSquare,
  Zap
} from 'lucide-react';
import { Website } from '../../types/website';
import { AIEnrichmentService, AIEnrichmentResponse } from '../../services/ai-enrichment-service';
import { AIConfig } from '../../services/ai-service';

interface AIEnrichmentProps {
  website: Website;
  onUpdateWebsite: (updates: Partial<Website>) => void;
  aiConfig: AIConfig;
}

// 暂时注释掉未使用的接口
// interface AIEnrichmentData {
//   enhancedDescription?: string;
//   suggestedTags?: string[];
//   relatedSites?: Array<{
//     title: string;
//     url: string;
//     description: string;
//     reason: string;
//   }>;
//   features?: string[];
//   rating?: number;
//   reviews?: Array<{
//     author: string;
//     content: string;
//     rating: number;
//   }>;
//   analysis?: {
//     strengths: string[];
//     weaknesses: string[];
//     recommendations: string[];
//   };
// }

// interface EnrichmentTask {
//   id: string;
//   name: string;
//   description: string;
//   status: 'pending' | 'running' | 'completed' | 'failed';
//   progress: number;
//   result?: any;
//   error?: string;
// }

export function AIEnrichment({ website, onUpdateWebsite, aiConfig }: AIEnrichmentProps) {
  const [isEnriching, setIsEnriching] = useState(false);
  const [error, setError] = useState<string>('');
  const [enrichmentData, setEnrichmentData] = useState<AIEnrichmentResponse | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentTask, setCurrentTask] = useState<string>('');
  const [progress, setProgress] = useState(0);

  const enrichmentService = new AIEnrichmentService(aiConfig);

  const enrichmentTasks = [
    {
      id: 'description',
      name: '智能描述生成',
      description: '基于网站内容生成更详细的描述',
      icon: FileText
    },
    {
      id: 'tags',
      name: '标签优化',
      description: '分析网站内容并推荐相关标签',
      icon: Tags
    },
    {
      id: 'features',
      name: '功能特性提取',
      description: '识别网站的主要功能特性',
      icon: Zap
    },
    {
      id: 'related',
      name: '相关网站推荐',
      description: '推荐相似或互补的网站',
      icon: Link
    },
    {
      id: 'reviews',
      name: '用户评价生成',
      description: '基于网站特点生成模拟用户评价',
      icon: MessageSquare
    },
    {
      id: 'analysis',
      name: '网站分析报告',
      description: '生成网站优势和改进建议',
      icon: TrendingUp
    }
  ];

  const handleStartEnrichment = async (type: 'all' | string = 'all') => {
    setIsEnriching(true);
    setError('');
    setProgress(0);
    setCurrentTask(type === 'all' ? '全面分析' : enrichmentTasks.find(t => t.id === type)?.name || '');

    try {
      const result = await enrichmentService.enrichWebsite({
        website,
        enrichmentType: type as 'description' | 'tags' | 'features' | 'related' | 'reviews' | 'analysis' | 'all'
      });

      setEnrichmentData(result);
      setActiveTab('overview');
    } catch (error) {
      console.error('AI丰富内容失败:', error);
      setError(error instanceof Error ? error.message : 'AI丰富内容失败');
    } finally {
      setIsEnriching(false);
      setProgress(100);
      setCurrentTask('');
    }
  };

  const handleApplyEnrichment = (type: keyof AIEnrichmentResponse) => {
    if (!enrichmentData) return;

    const data = enrichmentData[type];
    if (!data) return;

    switch (type) {
      case 'enhancedDescription': {
        onUpdateWebsite({ fullDescription: data as string });
        break;
      }
      case 'suggestedTags': {
        const newTags = [...website.tags, ...(data as string[])];
        onUpdateWebsite({ tags: [...new Set(newTags)] });
        break;
      }
      case 'features': {
        onUpdateWebsite({ features: data as string[] });
        break;
      }
      case 'reviews': {
        const reviews = (data as Array<{author: string; content: string; rating: number}>).map((review, index) => ({
          id: `ai-review-${index}`,
          author: review.author,
          content: review.content,
          rating: review.rating,
          date: new Date().toISOString()
        }));
        onUpdateWebsite({ reviews });
        break;
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              AI 内容丰富
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={() => handleStartEnrichment('all')}
                disabled={isEnriching}
                className="gap-2"
              >
                {isEnriching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    全面分析
                  </>
                )}
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            使用AI技术自动生成网站描述、标签、功能特性等丰富内容
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {isEnriching && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{currentTask}</span>
                    <span className="text-sm text-muted-foreground">
                      {progress}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">
                    AI正在分析网站内容，请稍候...
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isEnriching && !enrichmentData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrichmentTasks.map((task) => (
                  <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <task.icon className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{task.name}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartEnrichment(task.id)}
                            className="w-full"
                          >
                            开始分析
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {enrichmentData && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  概览
                </TabsTrigger>
                <TabsTrigger value="details" className="gap-2">
                  <FileText className="w-4 h-4" />
                  详细内容
                </TabsTrigger>
                <TabsTrigger value="apply" className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  应用更改
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrichmentData.enhancedDescription && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          增强描述
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {enrichmentData.enhancedDescription}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {enrichmentData.suggestedTags && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Tags className="w-5 h-5" />
                          推荐标签
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {enrichmentData.suggestedTags.slice(0, 6).map((tag) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                          {enrichmentData.suggestedTags.length > 6 && (
                            <Badge variant="outline">
                              +{enrichmentData.suggestedTags.length - 6}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {enrichmentData.features && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="w-5 h-5" />
                          功能特性
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {enrichmentData.features.slice(0, 3).map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              {feature}
                            </div>
                          ))}
                          {enrichmentData.features.length > 3 && (
                            <div className="text-sm text-muted-foreground">
                              还有 {enrichmentData.features.length - 3} 个特性
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {enrichmentData.relatedSites && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Link className="w-5 h-5" />
                          相关网站
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {enrichmentData.relatedSites.slice(0, 3).map((site, index) => (
                            <div key={index} className="text-sm">
                              <div className="font-medium">{site.title}</div>
                              <div className="text-muted-foreground">{site.reason}</div>
                            </div>
                          ))}
                          {enrichmentData.relatedSites.length > 3 && (
                            <div className="text-sm text-muted-foreground">
                              还有 {enrichmentData.relatedSites.length - 3} 个推荐
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {enrichmentData.reviews && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5" />
                          用户评价
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {enrichmentData.reviews.slice(0, 2).map((review, index) => (
                            <div key={index} className="text-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{review.author}</span>
                                <div className="flex gap-0.5">
                                  {Array.from({ length: 5 }, (_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-muted-foreground line-clamp-2">
                                {review.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {enrichmentData.analysis && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          分析报告
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm font-medium text-green-600 mb-1">优势</div>
                            <div className="text-sm text-muted-foreground">
                              {enrichmentData.analysis.strengths.length} 个优势点
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-orange-600 mb-1">建议</div>
                            <div className="text-sm text-muted-foreground">
                              {enrichmentData.analysis.recommendations.length} 个改进建议
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                {enrichmentData.enhancedDescription && (
                  <Card>
                    <CardHeader>
                      <CardTitle>增强描述</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={enrichmentData.enhancedDescription}
                        readOnly
                        rows={6}
                        className="font-mono text-sm"
                      />
                    </CardContent>
                  </Card>
                )}

                {enrichmentData.suggestedTags && (
                  <Card>
                    <CardHeader>
                      <CardTitle>推荐标签</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {enrichmentData.suggestedTags.map((tag, index) => (
                          <Badge key={`${tag}-${index}`} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {enrichmentData.features && (
                  <Card>
                    <CardHeader>
                      <CardTitle>功能特性</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {enrichmentData.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {enrichmentData.relatedSites && (
                  <Card>
                    <CardHeader>
                      <CardTitle>相关网站推荐</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {enrichmentData.relatedSites.map((site, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium">{site.title}</h4>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(site.url, '_blank')}
                              >
                                访问
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{site.description}</p>
                            <p className="text-sm text-blue-600">{site.reason}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {enrichmentData.reviews && (
                  <Card>
                    <CardHeader>
                      <CardTitle>用户评价</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {enrichmentData.reviews.map((review, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{review.author}</span>
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">{review.rating}</span>
                            </div>
                            <p className="text-muted-foreground">{review.content}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {enrichmentData.analysis && (
                  <Card>
                    <CardHeader>
                      <CardTitle>网站分析报告</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium text-green-600 mb-3">网站优势</h4>
                          <div className="space-y-2">
                            {enrichmentData.analysis.strengths.map((strength, index) => (
                              <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{strength}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-orange-600 mb-3">改进建议</h4>
                          <div className="space-y-2">
                            {enrichmentData.analysis.recommendations.map((rec, index) => (
                              <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                                <TrendingUp className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="apply" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>应用AI生成的内容</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      选择要应用到网站的内容，这些更改将直接更新到网站信息中
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {enrichmentData.enhancedDescription && (
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">增强描述</h4>
                            <p className="text-sm text-muted-foreground">
                              应用AI生成的详细描述
                            </p>
                          </div>
                          <Button
                            onClick={() => handleApplyEnrichment('enhancedDescription')}
                            size="sm"
                          >
                            应用
                          </Button>
                        </div>
                      )}

                      {enrichmentData.suggestedTags && (
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">推荐标签</h4>
                            <p className="text-sm text-muted-foreground">
                              添加 {enrichmentData.suggestedTags.length} 个推荐标签
                            </p>
                          </div>
                          <Button
                            onClick={() => handleApplyEnrichment('suggestedTags')}
                            size="sm"
                          >
                            应用
                          </Button>
                        </div>
                      )}

                      {enrichmentData.features && (
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">功能特性</h4>
                            <p className="text-sm text-muted-foreground">
                              应用 {enrichmentData.features.length} 个功能特性
                            </p>
                          </div>
                          <Button
                            onClick={() => handleApplyEnrichment('features')}
                            size="sm"
                          >
                            应用
                          </Button>
                        </div>
                      )}

                      {enrichmentData.reviews && (
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">用户评价</h4>
                            <p className="text-sm text-muted-foreground">
                              添加 {enrichmentData.reviews.length} 个用户评价
                            </p>
                          </div>
                          <Button
                            onClick={() => handleApplyEnrichment('reviews')}
                            size="sm"
                          >
                            应用
                          </Button>
                        </div>
                      )}

                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-medium text-blue-700 dark:text-blue-300">
                              提示
                            </p>
                            <p className="text-blue-600 dark:text-blue-400 mt-1">
                              应用更改后，您可以在网站详情页中查看更新后的内容。
                              相关网站推荐和分析报告仅供参考，不会直接应用到网站信息中。
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

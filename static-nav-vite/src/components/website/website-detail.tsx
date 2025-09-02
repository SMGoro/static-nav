import { useState } from 'react';
import { Website } from '../../types/website';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { IconXl } from '../ui/icon';
import { WebsitePreview } from './website-preview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { AIEnrichment } from '../ai/ai-enrichment';
import { 
  ArrowLeft, 
  ExternalLink, 
  Share2, 
  Edit, 
  Calendar, 
  BarChart3,
  Star,
  Globe,
  CreditCard,
  User,
  CheckCircle,
  MessageSquare,
  ThumbsUp,
  Eye,
  Zap,
  Bot
} from 'lucide-react';

interface WebsiteDetailProps {
  website: Website;
  onBack: () => void;
  onEdit: (website: Website) => void;
  onShare: (website: Website) => void;
}

export function WebsiteDetail({ website, onBack, onEdit, onShare }: WebsiteDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const handleVisitWebsite = () => {
    window.open(website.url, '_blank');
    // 这里可以增加访问统计的逻辑
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-500 fill-current' 
            : i < rating 
            ? 'text-yellow-500 fill-current opacity-50' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onShare(website)} className="gap-2">
                <Share2 className="w-4 h-4" />
                分享
              </Button>
              <Button variant="outline" onClick={() => onEdit(website)} className="gap-2">
                <Edit className="w-4 h-4" />
                编辑
              </Button>
              <Button onClick={handleVisitWebsite} className="gap-2 shadow-lg">
                <ExternalLink className="w-4 h-4" />
                访问网站
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* 头部信息 */}
        <div className="mb-8">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8">
              <div className="flex items-start gap-6">
                <div className="p-4 bg-background rounded-2xl shadow-lg">
                  <IconXl 
                    icon={website.icon}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl mb-2">{website.title}</h1>
                      <p className="text-muted-foreground text-lg mb-3">{website.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          {website.url}
                        </span>
                        {website.authoredBy && (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {website.authoredBy}
                          </span>
                        )}
                        {website.language && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            {website.language}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {website.featured && (
                        <Badge className="mb-2 gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          精选推荐
                        </Badge>
                      )}
                      {website.rating && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex gap-0.5">
                            {renderStars(website.rating)}
                          </div>
                          <span className="text-sm font-medium">{website.rating}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        {(website.clicks || 0).toLocaleString()} 次访问
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">

                    {website.isPaid && (
                      <Badge variant="outline" className="gap-1">
                        <CreditCard className="w-3 h-3" />
                        付费服务
                      </Badge>
                    )}
                    {website.tags.slice(0, 5).map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                    {website.tags.length > 5 && (
                      <Badge variant="outline">
                        +{website.tags.length - 5} 更多
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 详细信息标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="gap-2">
              <Zap className="w-4 h-4" />
              概览
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              功能特性
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              用户评价
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              统计信息
            </TabsTrigger>
            <TabsTrigger value="ai-enrichment" className="gap-2">
              <Bot className="w-4 h-4" />
              AI丰富
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 主要内容 */}
              <div className="lg:col-span-2 space-y-6">
                {/* 网站预览 - 总是显示，优先显示截图，没有截图时显示 iframe */}
                <WebsitePreview website={website} />

                <Card>
                  <CardHeader>
                    <CardTitle>详细介绍</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {website.fullDescription || website.description}
                    </p>
                  </CardContent>
                </Card>

                {/* 相关网站推荐 */}
                {website.relatedSites && website.relatedSites.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>相关推荐</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm mb-4">
                        基于标签和分类为您推荐的相似网站
                      </p>
                      <div className="text-sm text-muted-foreground">
                        推荐功能即将上线...
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* 侧边栏信息 */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      快速信息
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">

                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">访问次数</span>
                      <span>{(website.clicks || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">收费模式</span>
                      <Badge variant={website.isPaid ? "destructive" : "secondary"}>
                        {website.isPaid ? "付费" : "免费"}
                      </Badge>
                    </div>
                    {website.language && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">语言支持</span>
                        <span>{website.language}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">添加时间</span>
                      <span className="text-sm">
                        {new Date(website.addedDate).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    {website.lastUpdated && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">更新时间</span>
                        <span className="text-sm">
                          {new Date(website.lastUpdated).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>标签云</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {website.tags.map((tag, index) => (
                        <Badge key={`${tag}-${index}`} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>主要功能特性</CardTitle>
                <p className="text-sm text-muted-foreground">
                  了解这个网站提供的核心功能和服务
                </p>
              </CardHeader>
              <CardContent>
                {website.features && website.features.length > 0 ? (
                  <div className="grid gap-3">
                    {website.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">暂无功能特性信息</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>用户评价</CardTitle>
                  {website.rating && (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {renderStars(website.rating)}
                      </div>
                      <span>{website.rating} 分</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {website.reviews && website.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {website.reviews.map((review) => (
                      <div key={review.id} className="flex gap-4 p-4 rounded-lg bg-muted/30">
                        <Avatar>
                          <AvatarFallback>
                            {review.author.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{review.author}</span>
                            <div className="flex gap-0.5">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.date).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                          <p className="text-muted-foreground">{review.content}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                              <ThumbsUp className="w-4 h-4" />
                              有用
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">暂无用户评价</p>
                    <p className="text-sm text-muted-foreground">
                      成为第一个评价这个网站的用户吧！
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                      <Eye className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl">{(website.clicks || 0).toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">总访问量</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                      <Star className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl">{website.rating || 'N/A'}</div>
                      <div className="text-sm text-muted-foreground">用户评分</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                      <MessageSquare className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl">{website.reviews?.length || 0}</div>
                      <div className="text-sm text-muted-foreground">用户评价</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                      <Calendar className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-2xl">
                        {Math.floor((Date.now() - new Date(website.addedDate).getTime()) / (1000 * 60 * 60 * 24))}
                      </div>
                      <div className="text-sm text-muted-foreground">收录天数</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>访问趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  访问趋势图表功能即将上线...
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-enrichment" className="space-y-6">
            <AIEnrichment
              website={website}
              onUpdateWebsite={(updates) => {
                // 这里需要实现更新网站的逻辑
                console.log('更新网站信息:', updates);
                // TODO: 调用父组件的更新函数
              }}
              aiConfig={{
                apiEndpoint: 'https://api.openai.com/v1/chat/completions',
                apiKey: '',
                model: 'gpt-3.5-turbo',
                maxTokens: 2000,
                temperature: 0.7
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { WebsiteIcon } from '../ui/website-icon';
import { 
  Sparkles, 
  RefreshCw,
  BarChart3,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Website } from '../../types/website';
import { WebsiteRecommendationService, RecommendationResult } from '../../services/website-recommendation-service';
import { dataManager } from '../../utils/data-manager';

interface RelatedRecommendationsProps {
  currentWebsite: Website;
  maxResults?: number;
}

export function RelatedRecommendations({ currentWebsite, maxResults = 6 }: RelatedRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommendations');

  // 获取推荐数据
  const generateRecommendations = useMemo(() => {
    return () => {
      try {
        setIsLoading(true);
        
        // 获取所有网站数据
        const localData = dataManager.getLocalData();
        const allWebsites = localData.websites || [];
        
        // 生成推荐
        const results = WebsiteRecommendationService.getRecommendations(
          currentWebsite,
          allWebsites,
          {
            maxResults,
            minScore: 0.1,
            excludeCurrentWebsite: true,
            includeRating: true,
            includePopularity: true,
            includeFeatured: true
          }
        );
        
        setRecommendations(results);
      } catch (error) {
        console.error('生成推荐失败:', error);
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    };
  }, [currentWebsite, maxResults]);

  useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  // 获取统计信息
  const stats = useMemo(() => {
    return WebsiteRecommendationService.getRecommendationStats(recommendations);
  }, [recommendations]);

  // 处理网站访问（跳转到外部网站）
  const handleVisitWebsite = (website: Website) => {
    // 增加点击量
    try {
      const localData = dataManager.getLocalData();
      const websiteIndex = localData.websites.findIndex(w => w.id === website.id);
      if (websiteIndex !== -1) {
        localData.websites[websiteIndex].clicks = (localData.websites[websiteIndex].clicks || 0) + 1;
        dataManager.saveLocalData(localData);
      }
    } catch (error) {
      console.error('更新点击量失败:', error);
    }
    
    // 打开网站
    window.open(website.url, '_blank');
  };

  // 处理查看详情（跳转到网站详情页）
  const handleViewDetails = (website: Website) => {
    // 增加点击量
    try {
      const localData = dataManager.getLocalData();
      const websiteIndex = localData.websites.findIndex(w => w.id === website.id);
      if (websiteIndex !== -1) {
        localData.websites[websiteIndex].clicks = (localData.websites[websiteIndex].clicks || 0) + 1;
        dataManager.saveLocalData(localData);
      }
    } catch (error) {
      console.error('更新点击量失败:', error);
    }
    
    const slug = website.slug || website.id;
    window.open(`/website/${slug}`, '_blank');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            相关推荐
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin" />
              正在生成推荐...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            相关推荐
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>暂无相关推荐</p>
            <p className="text-sm mt-1">当前网站的标签较少，无法找到相关网站</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateRecommendations}
              className="mt-3"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              重新生成
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            相关推荐
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={generateRecommendations}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          基于标签相似度为您推荐相关网站
        </p>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recommendations">推荐列表</TabsTrigger>
            <TabsTrigger value="stats">推荐统计</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {recommendations.slice(0, 6).map((recommendation, index) => (
                <CompactRecommendationCard
                  key={recommendation.website.id}
                  recommendation={recommendation}
                  rank={index + 1}
                  onVisit={() => handleViewDetails(recommendation.website)}
                  onViewDetails={() => handleVisitWebsite(recommendation.website)}
                />
              ))}
            </div>
            
            {/* 显示更多推荐 */}
            {recommendations.length > 6 && (
              <div className="mt-6">
                <details className="group">
                  <summary className="flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors">
                    <span className="text-sm font-medium">查看更多推荐 ({recommendations.length - 6} 个)</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {recommendations.slice(6).map((recommendation, index) => (
                      <CompactRecommendationCard
                        key={recommendation.website.id}
                        recommendation={recommendation}
                        rank={index + 7}
                        onVisit={() => handleViewDetails(recommendation.website)}
                        onViewDetails={() => handleVisitWebsite(recommendation.website)}
                      />
                    ))}
                  </div>
                </details>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.totalCount}</div>
                <div className="text-sm text-muted-foreground">推荐网站</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.averageScore}</div>
                <div className="text-sm text-muted-foreground">平均相关度</div>
              </div>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.averageMatchingTags}</div>
              <div className="text-sm text-muted-foreground">平均相同标签数</div>
            </div>

            {stats.topReasons.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">主要推荐理由</h4>
                <div className="flex flex-wrap gap-2">
                  {stats.topReasons.map((reason, index) => (
                    <Badge key={index} variant="secondary">
                      {reason}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface CompactRecommendationCardProps {
  recommendation: RecommendationResult;
  rank: number;
  onVisit: () => void; // 现在是跳转到详情页
  onViewDetails: () => void; // 现在是跳转到外部网站
}

function CompactRecommendationCard({ recommendation, rank, onVisit, onViewDetails }: CompactRecommendationCardProps) {
  const { website } = recommendation;

  return (
    <Card 
      className="group hover:shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer relative overflow-hidden"
      onClick={onVisit}
    >
      {/* 外部链接按钮 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails();
        }}
        className="absolute top-2 right-2 w-6 h-6 bg-background/80 hover:bg-background border rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title="访问外部网站"
      >
        <ExternalLink className="w-3 h-3" />
      </button>

      <CardContent className="p-3 h-full flex flex-col items-center justify-center text-center min-h-[100px]">
        {/* 网站图标 */}
        <div className="mb-2">
          <WebsiteIcon 
            icon={website.icon}
            title={website.title}
            url={website.url}
            size="md"
            className="mx-auto"
          />
        </div>

        {/* 网站标题 */}
        <h4 className="font-medium text-xs truncate w-full group-hover:text-primary transition-colors leading-tight">
          {website.title}
        </h4>
      </CardContent>
    </Card>
  );
}

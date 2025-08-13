import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Bot, Sparkles, Search, TrendingUp } from 'lucide-react';
import { Website } from '../types/website';
import { mockWebsites } from '../data/mockData';

interface AIRecommendationProps {
  onAddWebsite: (website: Omit<Website, 'id'>) => void;
}

export function AIRecommendation({ onAddWebsite }: AIRecommendationProps) {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<Website[]>([]);

  // 模拟AI推荐功能
  const handleAIRecommend = async () => {
    setIsAnalyzing(true);
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 基于查询返回模拟推荐
    const filtered = mockWebsites.filter(site => 
      site.title.toLowerCase().includes(query.toLowerCase()) ||
      site.description.toLowerCase().includes(query.toLowerCase()) ||
      site.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    setRecommendations(filtered.slice(0, 3));
    setIsAnalyzing(false);
  };

  const mockTrendingSites = [
    { name: 'ChatGPT', category: 'AI工具', trend: '+150%' },
    { name: 'Midjourney', category: 'AI生成', trend: '+200%' },
    { name: 'Notion AI', category: '效率工具', trend: '+80%' },
    { name: 'GitHub Copilot', category: '开发工具', trend: '+120%' }
  ];

  const aiFeatures = [
    {
      title: '智能分类',
      description: 'AI自动识别网站类型并分配适当的标签和分类',
      icon: '🏷️'
    },
    {
      title: '内容生成',
      description: '自动生成网站描述和相关标签',
      icon: '✏️'
    },
    {
      title: '相似推荐',
      description: '基于用户偏好推荐相似的优质网站',
      icon: '🔍'
    },
    {
      title: '趋势分析',
      description: '分析热门网站趋势，发现新兴优质资源',
      icon: '📈'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl flex items-center justify-center gap-2">
          <Bot className="w-8 h-8 text-primary" />
          AI 智能推荐
        </h1>
        <p className="text-muted-foreground">
          让AI帮您发现和管理优质网站资源
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI推荐查询 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                智能推荐
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label>描述您需要的网站类型</label>
                <Textarea
                  placeholder="例如：我需要一些设计灵感网站，或者优秀的编程学习资源..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  rows={3}
                />
              </div>
              
              <Button 
                onClick={handleAIRecommend}
                disabled={!query.trim() || isAnalyzing}
                className="w-full gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    AI 分析中...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    获取AI推荐
                  </>
                )}
              </Button>

              {recommendations.length > 0 && (
                <div className="space-y-3 mt-6">
                  <h3>推荐结果：</h3>
                  {recommendations.map((site) => (
                    <div key={site.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{site.icon}</span>
                          <div>
                            <h4>{site.title}</h4>
                            <p className="text-sm text-muted-foreground">{site.description}</p>
                            <div className="flex gap-1 mt-2">
                              {site.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          添加
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI功能特性</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiFeatures.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-3 p-3 border rounded-lg">
                    <span className="text-2xl">{feature.icon}</span>
                    <div>
                      <h4>{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                热门趋势
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockTrendingSites.map((site, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{site.name}</p>
                    <p className="text-sm text-muted-foreground">{site.category}</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    {site.trend}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI统计</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">本月推荐</span>
                <span>156 个网站</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">推荐准确率</span>
                <span>94.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">用户满意度</span>
                <span>4.8/5.0</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
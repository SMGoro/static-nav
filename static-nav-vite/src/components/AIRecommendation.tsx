import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Bot, Sparkles, Search, TrendingUp, Settings, Plus, CheckCircle, AlertCircle, History } from 'lucide-react';
import { Website } from '../types/website';
import { AIService, AIConfig, AIRecommendationRequest, AIRecommendationResponse, StreamChunk, AIWebsiteRecommendation } from '../services/aiService';
import { AIConfigDialog } from './AIConfigDialog';
import { AIChatHistory, ChatMessage } from './AIChatHistory';
import { BatchAddDialog } from './BatchAddDialog';
import { StreamingPreview } from './StreamingPreview';
import { AIWebsiteCard } from './AIWebsiteCard';
import { dataManager } from '../utils/dataManager';

interface AIRecommendationProps {
  onAddWebsite: (website: Omit<Website, 'id'>) => void;
}

const STORAGE_KEY = 'ai_config';
const CHAT_HISTORY_KEY = 'ai_chat_history';

export function AIRecommendation({ onAddWebsite }: AIRecommendationProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [maxResults, setMaxResults] = useState<number>(5);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendationResponse | null>(null);
  const [aiConfig, setAiConfig] = useState<AIConfig>(AIService.getDefaultConfig());
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [showBatchAddDialog, setShowBatchAddDialog] = useState(false);
  const [error, setError] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState('recommend');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamData, setStreamData] = useState({
    content: '',
    websites: [] as AIWebsiteRecommendation[],
    reasoning: '',
    confidence: 0,
    progress: 0
  });
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // 加载AI配置和聊天记录
  useEffect(() => {
    // 加载AI配置
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setAiConfig({ ...AIService.getDefaultConfig(), ...parsed });
      } catch (error) {
        console.error('加载AI配置失败:', error);
      }
    }

    // 加载聊天记录
    const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setChatHistory(parsed);
      } catch (error) {
        console.error('加载聊天记录失败:', error);
      }
    }
  }, []);

  // 保存聊天记录
  const saveChatHistory = (history: ChatMessage[]) => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
  };

  const handleAIRecommend = async () => {
    if (!query.trim()) {
      setError('请输入您的需求描述');
      return;
    }

    // 重置流式数据
    setStreamData({
      content: '',
      websites: [],
      reasoning: '',
      confidence: 0,
      progress: 0
    });

    setIsStreaming(true);
    setIsAnalyzing(true);
    setError('');
    setRecommendations(null);

    // 创建AbortController用于取消请求
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const aiService = new AIService(aiConfig);
      
      const request: AIRecommendationRequest = {
        query: query.trim(),
        category: category === 'all' ? undefined : category,
        maxResults
      };

      // 使用流式传输
      const result = await aiService.getRecommendationsStream(request, (chunk: StreamChunk) => {
        handleStreamChunk(chunk);
      });

      setRecommendations(result);

      // 保存到聊天记录
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        query: query.trim(),
        response: result,
        category: category === 'all' ? undefined : category,
        maxResults
      };

      const updatedHistory = [newMessage, ...chatHistory.slice(0, 49)]; // 保留最近50条记录
      setChatHistory(updatedHistory);
      saveChatHistory(updatedHistory);

      // 切换到推荐结果标签页
      setActiveTab('recommend');
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('AI推荐被用户取消');
      } else {
        console.error('AI推荐失败:', error);
        setError(error instanceof Error ? error.message : 'AI推荐失败，请检查配置');
      }
    } finally {
      setIsStreaming(false);
      setIsAnalyzing(false);
      setAbortController(null);
    }
  };

  const handleStreamChunk = (chunk: StreamChunk) => {
    switch (chunk.type) {
      case 'start':
        setStreamData(prev => ({ ...prev, progress: 10 }));
        break;
      case 'content':
        if ('content' in chunk.data) {
          setStreamData(prev => ({
            ...prev,
            content: prev.content + (chunk.data as Record<string, unknown>).content,
            progress: Math.min(prev.progress + 5, 80)
          }));
        }
        break;
      case 'website':
        if ('title' in chunk.data) {
          setStreamData(prev => ({
            ...prev,
            websites: [...prev.websites, chunk.data as AIWebsiteRecommendation],
            progress: Math.min(prev.progress + 10, 90)
          }));
        }
        break;
      case 'reasoning':
        if ('reasoning' in chunk.data) {
          setStreamData(prev => ({
            ...prev,
            reasoning: (chunk.data as Record<string, unknown>).reasoning as string,
            progress: Math.min(prev.progress + 5, 95)
          }));
        }
        break;
      case 'confidence':
        if ('confidence' in chunk.data) {
          setStreamData(prev => ({
            ...prev,
            confidence: (chunk.data as Record<string, unknown>).confidence as number,
            progress: 100
          }));
        }
        break;
      case 'end':
        setStreamData(prev => ({ ...prev, progress: 100 }));
        break;
      case 'error':
        if ('error' in chunk.data) {
          setError((chunk.data as Record<string, unknown>).error as string);
        }
        break;
    }
  };

  const handleStopStreaming = () => {
    if (abortController) {
      abortController.abort();
    }
    setIsStreaming(false);
    setIsAnalyzing(false);
  };

  const handleAddWebsite = (aiSite: AIWebsiteRecommendation) => {
    try {
      console.log('=== 开始添加网站 ===');
      console.log('AI推荐网站:', aiSite);
      
      const aiService = new AIService(aiConfig);
      const website = aiService.convertToWebsite(aiSite);
      
      console.log('转换后的网站:', website);
      console.log('网站URL:', website.url);
      console.log('网站标题:', website.title);
      
      // 检查是否已存在相同URL或标题的网站
      const existingData = dataManager.getLocalData();
      const existingWebsite = existingData.websites.find((w: Website) => 
        w.url === website.url || w.title === website.title
      );
      
      if (existingWebsite) {
        console.warn('发现重复网站:', existingWebsite);
        console.warn('重复原因:', {
          urlMatch: existingWebsite.url === website.url,
          titleMatch: existingWebsite.title === website.title
        });
      }
      
      onAddWebsite(website);
      console.log('网站添加成功:', website.title);
      console.log('=== 添加网站完成 ===');
      
      // 显示成功提示
      alert(`成功添加网站：${website.title}`);
    } catch (error) {
      console.error('添加网站失败:', error);
      alert('添加网站失败，请重试');
    }
  };

  const handleBatchAdd = (websites: Omit<Website, 'id'>[]) => {
    try {
      console.log('=== 开始批量添加网站 ===');
      console.log('批量添加网站数量:', websites.length);
      
      // 获取当前数据
      const existingData = dataManager.getLocalData();
      const newWebsites: Website[] = [];
      
      websites.forEach((website, index) => {
        console.log(`=== 处理第${index + 1}个网站 ===`);
        console.log('网站信息:', website);
        
        // 检查是否已存在相同URL或标题的网站
        const existingWebsite = existingData.websites.find((w: Website) => 
          w.url === website.url || w.title === website.title
        );
        
        if (existingWebsite) {
          console.warn(`第${index + 1}个网站发现重复:`, existingWebsite);
        } else {
          // 创建新网站对象
          const newWebsite: Website = {
            ...website,
            id: dataManager.generateShareId(),
            slug: website.slug || dataManager.generateSlug(website.title)
          };
          newWebsites.push(newWebsite);
          console.log(`第${index + 1}个网站准备添加:`, newWebsite.title);
        }
      });
      
      if (newWebsites.length > 0) {
        // 批量添加到数据中
        const updatedData = {
          ...existingData,
          websites: [...existingData.websites, ...newWebsites],
          lastUpdated: new Date().toISOString()
        };
        
        // 保存数据
        dataManager.saveLocalData(updatedData);
        
        console.log('=== 批量添加网站完成 ===');
        console.log(`成功添加 ${newWebsites.length} 个网站`);
        
        // 显示批量添加成功提示
        alert(`成功添加${newWebsites.length}个网站！`);
        
        // 刷新页面数据（如果需要）
        window.location.reload();
      } else {
        alert('没有新的网站可以添加，所有网站都已存在');
      }
    } catch (error) {
      console.error('批量添加网站失败:', error);
      alert('批量添加网站失败，请重试');
    }
  };

  const handleSaveConfig = (config: AIConfig) => {
    setAiConfig(config);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  };

  const handleDeleteMessage = (id: string) => {
    const updatedHistory = chatHistory.filter(msg => msg.id !== id);
    setChatHistory(updatedHistory);
    saveChatHistory(updatedHistory);
  };

  const handleRetryMessage = (message: ChatMessage) => {
    setQuery(message.query);
    setCategory(message.category || 'all');
    setMaxResults(message.maxResults);
    handleAIRecommend();
  };

  const handleCopyMessage = async (message: ChatMessage) => {
    const text = `查询：${message.query}\n\n推荐结果：\n${message.response.websites.map(site => 
      `- ${site.title} (${site.url})`
    ).join('\n')}`;
    
    try {
      await navigator.clipboard.writeText(text);
      alert('推荐结果已复制到剪贴板！');
    } catch {
      alert('复制失败，请手动复制');
    }
  };

  const handleClearHistory = () => {
    if (confirm('确定要清空所有聊天记录吗？')) {
      setChatHistory([]);
      localStorage.removeItem(CHAT_HISTORY_KEY);
    }
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

  const categories = [
    '开发工具', '设计资源', '学习平台', '效率工具', 
    'AI工具', '娱乐休闲', '新闻资讯', '其他'
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl flex items-center justify-center gap-2">
          <Bot className="w-8 h-8 text-primary" />
          AI 智能推荐
        </h1>
        <p className="text-muted-foreground">
          让AI帮您发现和管理优质网站资源
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommend" className="gap-2">
            <Sparkles className="w-4 h-4" />
            智能推荐
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            聊天记录 ({chatHistory.length})
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <CheckCircle className="w-4 h-4" />
            功能特性
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommend" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI推荐查询 */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      智能推荐
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowConfigDialog(true)}
                      className="gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      配置
                    </Button>
                  </div>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label>偏好分类</label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择分类（可选）" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">不限分类</SelectItem>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label>推荐数量</label>
                      <Select value={maxResults.toString()} onValueChange={(value) => setMaxResults(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[3, 5, 8, 10].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num} 个</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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

                  {error && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  {/* 流式预览 */}
                  {(isStreaming || streamData.progress > 0) && (
                    <div className="mt-6">
                      <StreamingPreview
                        isStreaming={isStreaming}
                        onStop={handleStopStreaming}
                        onRetry={handleAIRecommend}
                        onAddWebsite={handleAddWebsite}
                        streamData={streamData}
                      />
                    </div>
                  )}

                  {recommendations && (
                    <div className="space-y-4 mt-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">推荐结果</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            置信度：{(recommendations.confidence * 100).toFixed(1)}%
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowBatchAddDialog(true)}
                            className="gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            批量添加
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-muted/30">
                        <p className="text-sm text-muted-foreground mb-3">
                          <strong>推荐理由：</strong>{recommendations.reasoning}
                        </p>
                      </div>

                      <div className="space-y-3">
                        {recommendations.websites.map((site, index) => (
                          <AIWebsiteCard
                            key={`${site.title}-${site.url}-${index}`}
                            website={site}
                            onAdd={handleAddWebsite}
                            onPreview={(url) => window.open(url, '_blank')}
                            showAddButton={true}
                            showPreviewButton={true}
                            variant="default"
                          />
                        ))}
                      </div>
                    </div>
                  )}
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

              <Card>
                <CardHeader>
                  <CardTitle>使用提示</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <p className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      详细描述您的需求，AI会提供更准确的推荐
                    </p>
                    <p className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      选择偏好分类可以缩小推荐范围
                    </p>
                    <p className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      AI推荐的网站会自动添加"AI推荐"标签
                    </p>
                    <p className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      添加前可以预览网站确认是否符合需求
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <AIChatHistory
            messages={chatHistory}
            onDeleteMessage={handleDeleteMessage}
            onRetryMessage={handleRetryMessage}
            onCopyMessage={handleCopyMessage}
            onClearHistory={handleClearHistory}
            onAddWebsite={handleAddWebsite}
            onBatchAddWebsites={handleBatchAdd}
          />
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
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
                      <h4 className="font-medium">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI配置对话框 */}
      <AIConfigDialog
        isOpen={showConfigDialog}
        onClose={() => setShowConfigDialog(false)}
        onSave={handleSaveConfig}
        currentConfig={aiConfig}
      />

      {/* 批量添加对话框 */}
      {recommendations && (
        <BatchAddDialog
          isOpen={showBatchAddDialog}
          onClose={() => setShowBatchAddDialog(false)}
          websites={recommendations.websites}
          onAddWebsites={handleBatchAdd}
        />
      )}
    </div>
  );
}
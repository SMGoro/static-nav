import { useState, useEffect } from 'react';
import { Website } from '../types/website';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { ArrowLeft, Plus, X, Bot, Sparkles, Search, Loader2, MessageSquare, Globe } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LinkPreviewService } from '../services/linkPreviewService';
import { AIService, AIConfig } from '../services/aiService';
import { AIConfigDialog } from './AIConfigDialog';

interface WebsiteFormEnhancedProps {
  website?: Website;
  onSave: (website: Omit<Website, 'id'>) => void;
  onCancel: () => void;
}

export function WebsiteFormEnhanced({ website, onSave, onCancel }: WebsiteFormEnhancedProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    icon: '🌐',
    featured: false,
    tags: [] as string[],
    // 高级设置
    fullDescription: '',
    authoredBy: '',
    language: '多语言',
    image: ''
  });
  const [newTag, setNewTag] = useState('');
  const [activeTab, setActiveTab] = useState('manual');
  const [aiQuery, setAiQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig>(AIService.getDefaultConfig());
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  useEffect(() => {
    if (website) {
      setFormData({
        title: website.title,
        description: website.description,
        url: website.url,
        icon: website.icon,
        featured: website.featured,
        tags: [...website.tags],
        fullDescription: website.fullDescription || '',
        authoredBy: website.authoredBy || '',
        language: website.language || '多语言',
        image: website.screenshots?.[0] || ''
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.url || !formData.description) {
      setError('请填写所有必填字段');
      return;
    }
    
    const generateSlug = (title: string) => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    };
    
    onSave({
      ...formData,
      addedDate: website?.addedDate || new Date().toISOString().split('T')[0],
      clicks: website?.clicks || 0,
      slug: website?.slug || generateSlug(formData.title),
      isBuiltIn: false,
      fullDescription: formData.fullDescription,
      authoredBy: formData.authoredBy,
      language: formData.language,
      screenshots: formData.image ? [formData.image] : undefined
    });
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

  // 通过URL自动获取网站信息
  const handleAutoFill = async () => {
    if (!formData.url.trim()) {
      setError('请输入网站URL');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const linkPreviewService = new LinkPreviewService();
      const websiteInfo = await linkPreviewService.getWebsiteInfo(formData.url);
      
      setFormData(prev => ({
        ...prev,
        title: websiteInfo.title,
        description: websiteInfo.description,
        icon: websiteInfo.icon,
        tags: [...websiteInfo.tags],
        image: websiteInfo.image || ''
      }));
    } catch (error) {
      console.error('自动获取网站信息失败:', error);
      setError(error instanceof Error ? error.message : '自动获取失败');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // AI聊天对话添加网站
  const handleAIChat = async () => {
    if (!aiQuery.trim()) {
      setError('请输入您的需求描述');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const aiService = new AIService(aiConfig);
      const response = await aiService.getRecommendations({
        query: aiQuery,
        maxResults: 1
      });

      if (response.websites.length > 0) {
        const aiSite = response.websites[0];
        const website = aiService.convertToWebsite(aiSite);
        
        setFormData({
          title: website.title,
          description: website.description,
          url: website.url,
          icon: website.icon,
          featured: false,
          tags: website.tags,
          fullDescription: '',
          authoredBy: '',
          language: '多语言',
          image: ''
        });

        setActiveTab('manual');
      } else {
        setError('AI未能生成网站信息，请重试');
      }
    } catch (error) {
      console.error('AI聊天失败:', error);
      setError(error instanceof Error ? error.message : 'AI聊天失败');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveConfig = (config: AIConfig) => {
    setAiConfig(config);
    localStorage.setItem('ai_config', JSON.stringify(config));
  };

  // AI自动填写功能
  const handleAIAutoFill = async () => {
    if (!formData.url.trim()) {
      setError('请先输入网站URL');
      return;
    }

    setIsAIGenerating(true);
    setError('');

    try {
      // 首先获取网站基本信息
      const linkPreviewService = new LinkPreviewService();
      const websiteInfo = await linkPreviewService.getWebsiteInfo(formData.url);
      
      // 使用AI优化信息
      const aiService = new AIService(aiConfig);
      const prompt = `请基于以下网站信息生成更详细的介绍和标签：

网站标题：${websiteInfo.title}
网站描述：${websiteInfo.description}
网站URL：${websiteInfo.url}
当前标签：${websiteInfo.tags.join(', ')}

请生成：
1. 更详细的网站介绍（200-300字）
2. 更准确的标签（5-8个）
3. 网站作者信息
4. 主要语言

请以JSON格式返回：
{
  "fullDescription": "详细的网站介绍",
  "tags": ["标签1", "标签2", "标签3"],
  "authoredBy": "作者或公司",
  "language": "主要语言"
}`;

      const response = await aiService.getRecommendations({
        query: prompt,
        maxResults: 1
      });

      // 解析AI响应
      let aiData = {
        fullDescription: websiteInfo.description,
        tags: websiteInfo.tags,
        authoredBy: '',
        language: '多语言'
      };

      try {
        const jsonMatch = response.reasoning.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          aiData = { ...aiData, ...parsed };
        }
      } catch (parseError) {
        console.warn('AI响应解析失败，使用默认值:', parseError);
      }

      // 更新表单数据
      setFormData(prev => ({
        ...prev,
        title: websiteInfo.title,
        description: websiteInfo.description,
        icon: websiteInfo.icon,
        tags: [...new Set([...aiData.tags, ...websiteInfo.tags])],
        fullDescription: aiData.fullDescription,
        authoredBy: aiData.authoredBy,
        language: aiData.language,
        image: websiteInfo.image || ''
      }));

    } catch (error) {
      console.error('AI自动填写失败:', error);
      setError(error instanceof Error ? error.message : 'AI自动填写失败');
    } finally {
      setIsAIGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1>{website ? '编辑网站' : '添加网站'}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manual" className="gap-2">
            <Plus className="w-4 h-4" />
            手动添加
          </TabsTrigger>
          <TabsTrigger value="auto" className="gap-2">
            <Globe className="w-4 h-4" />
            URL自动获取
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Bot className="w-4 h-4" />
            AI聊天添加
          </TabsTrigger>
        </TabsList>

        {/* 手动添加标签页 */}
        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{website ? '编辑网站信息' : '手动添加新网站'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      variant="outline" 
                      onClick={handleAIAutoFill}
                      disabled={!formData.url.trim() || isAIGenerating}
                      className="gap-2"
                    >
                      {isAIGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          AI生成中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          AI自动填写
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    AI将自动获取网站信息并生成详细的介绍和标签
                  </p>
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



                <div className="space-y-2">
                  <Label>标签</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="添加标签"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} size="sm" variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={`${tag}-${index}`} variant="secondary" className="gap-1 pr-1">
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

                {showAdvanced && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <h3 className="text-lg font-semibold">高级设置</h3>
                    
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="authoredBy">作者/公司</Label>
                        <Input
                          id="authoredBy"
                          value={formData.authoredBy}
                          onChange={(e) => setFormData(prev => ({ ...prev, authoredBy: e.target.value }))}
                          placeholder="网站作者或公司名称"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="language">主要语言</Label>
                        <Select 
                          value={formData.language} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择语言" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="中文">中文</SelectItem>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="多语言">多语言</SelectItem>
                            <SelectItem value="其他">其他</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="image">网站图片</Label>
                      <Input
                        id="image"
                        value={formData.image}
                        onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="网站截图或logo图片URL"
                      />
                      {formData.image && (
                        <div className="w-full max-w-md">
                          <img 
                            src={formData.image} 
                            alt="网站预览" 
                            className="w-full h-32 object-cover rounded-lg border"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    取消
                  </Button>
                  <Button type="submit">
                    {website ? '保存修改' : '添加网站'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* URL自动获取标签页 */}
        <TabsContent value="auto" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                URL自动获取网站信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="auto-url">网站URL *</Label>
                <div className="flex gap-2">
                  <Input
                    id="auto-url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleAutoFill}
                    disabled={!formData.url.trim() || isAnalyzing}
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
                  输入网站URL，将自动获取网站标题、描述、图标等信息
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">获取结果预览</h3>
                
                {formData.image && (
                  <div className="space-y-2">
                    <Label>网站图片</Label>
                    <div className="w-full max-w-md">
                      <img 
                        src={formData.image} 
                        alt="网站预览" 
                        className="w-full h-48 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>网站名称</Label>
                    <Input value={formData.title} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>图标</Label>
                    <Input value={formData.icon} readOnly className="text-center" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>描述</Label>
                  <Textarea value={formData.description} readOnly rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>标签</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={`${tag}-${index}`} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                  取消
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!formData.title || !formData.url}
                >
                  确认添加
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI聊天添加标签页 */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  AI聊天添加网站
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConfigDialog(true)}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  AI配置
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ai-query">描述您需要的网站</Label>
                <Textarea
                  id="ai-query"
                  placeholder="例如：我需要一个设计灵感网站，或者优秀的编程学习资源..."
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  详细描述您需要的网站类型、功能或用途，AI将为您推荐合适的网站
                </p>
              </div>

              <Button 
                onClick={handleAIChat}
                disabled={!aiQuery.trim() || isAnalyzing}
                className="w-full gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI分析中...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    开始AI聊天
                  </>
                )}
              </Button>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">AI推荐结果</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>网站名称</Label>
                    <Input value={formData.title} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>图标</Label>
                    <Input value={formData.icon} readOnly className="text-center" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>描述</Label>
                  <Textarea value={formData.description} readOnly rows={3} />
                </div>

                <div className="space-y-2">
                  <Label>标签</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={`${tag}-${index}`} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                  取消
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!formData.title || !formData.url}
                >
                  确认添加
                </Button>
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
    </div>
  );
}

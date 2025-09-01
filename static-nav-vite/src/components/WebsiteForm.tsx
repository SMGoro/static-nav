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


import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

import { JinjaWebsiteService } from '../services/jinjaWebsiteService';
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
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
  const [activeTab, setActiveTab] = useState('manual');
  const [aiQuery, setAiQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig>(AIService.getDefaultConfig());
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (website) {
      console.log('初始化编辑表单，网站数据:', website);

      setFormData({
        title: website.title,
        description: website.description,
        url: website.url,
        icon: website.icon,
        featured: website.featured,
        tags: [...website.tags]
      });
    } else {
      // 新增网站时的默认值
      setFormData({
        title: '',
        description: '',
        url: '',
        icon: '🌐',
        featured: false,
        tags: []
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
      isBuiltIn: website?.isBuiltIn || false // 保持原有的isBuiltIn状态
    };
    
    console.log('准备保存的网站数据:', websiteData);
    
    try {
      onSave(websiteData);
      setError(''); // 清除错误信息
      console.log(`${website ? '编辑' : '添加'}网站成功:`, websiteData);
    } catch (error) {
      console.error('保存失败:', error);
      setError('保存失败，请重试');
      throw error; // 重新抛出错误，让App组件处理
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
    console.log('删除标签:', tag);
    console.log('删除前的标签:', formData.tags);
    setFormData(prev => {
      const newTags = prev.tags.filter(t => t !== tag);
      console.log('删除后的标签:', newTags);
      return {
        ...prev,
        tags: newTags
      };
    });
  };

  // 通过URL自动获取网站信息（使用jinja模板）
  const handleAutoFill = async () => {
    if (!formData.url.trim()) {
      setError('请输入网站URL');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const jinjaWebsiteService = new JinjaWebsiteService(aiConfig);
      const websiteInfo = await jinjaWebsiteService.getWebsiteInfo(formData.url);
      
      setFormData(prev => ({
        ...prev,
        title: websiteInfo.title,
        description: websiteInfo.description,
        icon: websiteInfo.icon,
        tags: [...websiteInfo.tags]
      }));



      // 显示jinja解析的额外信息
      if (websiteInfo.technologies && websiteInfo.technologies.length > 0) {
        console.log('检测到的技术栈:', websiteInfo.technologies);
      }
      if (websiteInfo.socialMedia) {
        console.log('社交媒体信息:', websiteInfo.socialMedia);
      }
      if (websiteInfo.contactInfo) {
        console.log('联系信息:', websiteInfo.contactInfo);
      }
      
      console.log('自动获取网站信息成功:', websiteInfo);
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
          tags: website.tags
        });

        setActiveTab('manual');
        

        
        console.log('AI推荐网站成功:', website);
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

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{website ? '编辑网站信息' : '手动添加新网站'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}
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
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com"
                required
              />
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
                {(() => { console.log('渲染标签:', formData.tags); return null; })()}
                {formData.tags.map((tag, index) => (
                  <span 
                    key={`${tag}-${index}`} 
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-md border"
                  >
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removeTag(tag)}
                    />
                  </span>
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
            </div>

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
                  输入网站URL，使用jinja模板智能解析网站信息，包括技术栈、社交媒体、联系信息等
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Jinja解析结果预览</h3>
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
                <div className="space-y-2">
                  <Label>Jinja解析信息</Label>
                  <div className="p-3 bg-muted/30 rounded-lg text-sm">
                    <p className="text-muted-foreground">
                      使用jinja模板智能解析，支持技术栈检测、社交媒体信息提取、联系信息识别等高级功能。
                    </p>
                    <p className="text-muted-foreground mt-2">
                      详细解析结果请查看浏览器控制台。
                    </p>
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
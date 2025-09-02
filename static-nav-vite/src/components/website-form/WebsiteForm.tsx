import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { AIService, AIConfig } from '../../services/aiService';
import { AIConfigDialog } from '../AIConfigDialog';
import { WebsiteFormProps, WebsiteFormData, createDefaultFormData, generateSlug } from './types';
import { TagManager } from './TagManager';
import { AutoFillSection } from './AutoFillSection';
import { AIEnhancementSection } from './AIEnhancementSection';
import { AdvancedSettings } from './AdvancedSettings';
import { SuccessDialog } from './SuccessDialog';

export function WebsiteForm({ website, onSave, onCancel }: WebsiteFormProps) {
  const [formData, setFormData] = useState<WebsiteFormData>(createDefaultFormData());
  const [aiConfig, setAiConfig] = useState<AIConfig>(AIService.getDefaultConfig());
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        screenshots: website.screenshots || [],
        language: website.language || '多语言',
        authoredBy: website.authoredBy || '',
        isPaid: website.isPaid || false,
        features: website.features || [],
        rating: website.rating || 0,
        reviews: website.reviews || []
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
    
    if (!formData.title || !formData.url || !formData.description) {
      setError('请填写所有必填字段');
      return;
    }
    
    const websiteData = {
      ...formData,
      addedDate: website?.addedDate || new Date().toISOString().split('T')[0],
      clicks: website?.clicks || 0,
      slug: website?.slug || generateSlug(formData.title),
      isBuiltIn: website?.isBuiltIn || false,
      lastUpdated: new Date().toISOString().split('T')[0],
      relatedSites: website?.relatedSites || []
    };
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await onSave(websiteData);
      
      if (website) {
        // 编辑模式：直接返回查看页面
        onCancel();
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

  const clearForm = () => {
    setFormData(createDefaultFormData());
    setError('');
  };

  const handleSuccessDialogChoice = (continueAdding: boolean) => {
    setShowSuccessDialog(false);
    
    if (continueAdding) {
      clearForm();
    } else {
      onCancel();
    }
  };

  const handleSaveConfig = (config: AIConfig) => {
    setAiConfig(config);
    localStorage.setItem('ai_config', JSON.stringify(config));
  };

  const updateFormData = (data: Partial<WebsiteFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
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
            <AutoFillSection
              url={formData.url}
              onUrlChange={(url) => updateFormData({ url })}
              onDataUpdate={updateFormData}
              isEditMode={!!website}
            />

            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">网站名称 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  placeholder="输入网站名称"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="icon">图标</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => updateFormData({ icon: e.target.value })}
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
                onChange={(e) => updateFormData({ description: e.target.value })}
                placeholder="输入网站描述..."
                rows={3}
                required
              />
            </div>

            {/* 标签管理 */}
            <TagManager
              tags={formData.tags}
              onTagsChange={(tags) => updateFormData({ tags })}
            />

            {/* AI增强区域 */}
            <AIEnhancementSection
              formData={formData}
              onDataUpdate={updateFormData}
              aiConfig={aiConfig}
              isEditMode={!!website}
            />

            {/* 高级设置 */}
            <AdvancedSettings
              formData={formData}
              onDataUpdate={updateFormData}
              showAdvanced={showAdvanced}
              onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
            />

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
      <SuccessDialog
        isOpen={showSuccessDialog}
        websiteTitle={formData.title}
        onChoice={handleSuccessDialogChoice}
      />
    </div>
  );
}

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Plus, X } from 'lucide-react';
import { WebsiteFormData } from './types';

interface AdvancedSettingsProps {
  formData: WebsiteFormData;
  onDataUpdate: (data: Partial<WebsiteFormData>) => void;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
}

export function AdvancedSettings({ 
  formData, 
  onDataUpdate, 
  showAdvanced, 
  onToggleAdvanced 
}: AdvancedSettingsProps) {
  const [newFeature, setNewFeature] = useState('');
  const [newScreenshot, setNewScreenshot] = useState('');

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      onDataUpdate({
        features: [...formData.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    onDataUpdate({
      features: formData.features.filter(f => f !== feature)
    });
  };

  const addScreenshot = () => {
    if (newScreenshot.trim() && !formData.screenshots.includes(newScreenshot.trim())) {
      onDataUpdate({
        screenshots: [...formData.screenshots, newScreenshot.trim()]
      });
      setNewScreenshot('');
    }
  };

  const removeScreenshot = (screenshot: string) => {
    onDataUpdate({
      screenshots: formData.screenshots.filter(s => s !== screenshot)
    });
  };

  return (
    <>
      {/* 精选设置和高级设置切换 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="featured"
            checked={formData.featured}
            onCheckedChange={(checked) => onDataUpdate({ featured: checked })}
          />
          <Label htmlFor="featured">设为精选</Label>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleAdvanced}
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
              onChange={(e) => onDataUpdate({ fullDescription: e.target.value })}
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
                onChange={(e) => onDataUpdate({ language: e.target.value })}
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
                onChange={(e) => onDataUpdate({ authoredBy: e.target.value })}
                placeholder="网站作者或公司名称"
              />
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="isPaid"
                checked={formData.isPaid}
                onCheckedChange={(checked) => onDataUpdate({ isPaid: checked })}
              />
              <Label htmlFor="isPaid">付费服务</Label>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

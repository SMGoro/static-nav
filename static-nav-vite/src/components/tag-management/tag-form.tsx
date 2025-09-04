import React, { useState, useEffect } from 'react';
import { Tag } from '../../types/website';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Save } from 'lucide-react';
import { generateId, getRandomColor } from '../../utils/common';

interface TagFormData {
  name: string;
  description: string;
  color: string;
  category: string;
  isCore: boolean;
}

interface TagFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tag: Tag) => void;
  editingTag?: Tag | null;
  existingCategories: string[];
  allWebsiteTags?: Record<string, number>;
}

const defaultColors = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
  '#8b5cf6', '#06b6d4', '#84cc16', '#f97316',
  '#ec4899', '#6366f1', '#14b8a6', '#eab308'
];

export function TagForm({ 
  isOpen, 
  onClose, 
  onSave, 
  editingTag, 
  existingCategories,
  allWebsiteTags = {}
}: TagFormProps) {
  const [formData, setFormData] = useState<TagFormData>({
    name: '',
    description: '',
    color: getRandomColor(defaultColors),
    category: '',
    isCore: false,
  });

  const [errors, setErrors] = useState<Partial<TagFormData>>({});

  // 重置表单数据
  useEffect(() => {
    if (editingTag) {
      setFormData({
        name: editingTag.name,
        description: editingTag.description || '',
        color: editingTag.color,
        category: editingTag.category || '',
        isCore: editingTag.isCore || false,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: getRandomColor(defaultColors),
        category: '',
        isCore: false,
      });
    }
    setErrors({});
  }, [editingTag, isOpen]);

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Partial<TagFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = '标签名称不能为空';
    } else if (formData.name.length > 50) {
      newErrors.name = '标签名称不能超过50个字符';
    }

    if (!formData.category.trim()) {
      newErrors.category = '请选择或输入分类';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = '描述不能超过200个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理保存
  const handleSave = () => {
    if (!validateForm()) return;

    const tagData: Tag = editingTag ? {
      ...editingTag,
      name: formData.name.trim(),
      description: formData.description.trim(),
      color: formData.color,
      category: formData.category.trim(),
      isCore: formData.isCore,
    } : {
      id: generateId('tag_'),
      name: formData.name.trim(),
      description: formData.description.trim(),
      color: formData.color,
      category: formData.category.trim(),
      isCore: formData.isCore,
      count: allWebsiteTags[formData.name.trim()] || 0,
      createdDate: new Date().toISOString(),
    };

    onSave(tagData);
    onClose();
  };

  // 处理输入变化
  const handleInputChange = (field: keyof TagFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingTag ? '编辑标签' : '添加标签'}
          </DialogTitle>
          <DialogDescription>
            {editingTag ? '修改标签信息' : '创建新的标签'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 标签名称 */}
          <div className="space-y-2">
            <Label htmlFor="tag-name">标签名称 *</Label>
            <Input
              id="tag-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="输入标签名称"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* 分类 */}
          <div className="space-y-2">
            <Label htmlFor="tag-category">分类 *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="选择或输入分类" />
              </SelectTrigger>
              <SelectContent>
                {existingCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="或输入新分类"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={errors.category ? 'border-red-500' : ''}
            />
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          {/* 颜色选择 */}
          <div className="space-y-2">
            <Label>标签颜色</Label>
            <div className="flex gap-2 flex-wrap">
              {defaultColors.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleInputChange('color', color)}
                />
              ))}
            </div>
            <Input
              type="color"
              value={formData.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              className="w-20 h-10"
            />
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <Label htmlFor="tag-description">描述</Label>
            <Textarea
              id="tag-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="输入标签描述（可选）"
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {formData.description.length}/200
            </p>
          </div>

          {/* 核心标签 */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is-core"
              checked={formData.isCore}
              onCheckedChange={(checked) => handleInputChange('isCore', checked)}
            />
            <Label htmlFor="is-core">核心标签</Label>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            {editingTag ? '保存' : '添加'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState, useMemo } from 'react';
import { Tag, Website } from '../../types/website';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Folder, 
  Tag as TagIcon,
  Save,
  X,
  Settings
} from 'lucide-react';
import { generateId } from '../../utils/common';

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdDate: string;
}

interface CategoryManagerProps {
  tags: Tag[];
  websites: Website[];
  allWebsiteTags: Record<string, number>;
  categories: Category[];
  onTagsUpdate: (tags: Tag[]) => void;
  onCategoriesUpdate: (categories: Category[]) => void;
  onFilterByCategory?: (categoryName: string) => void;
}

const defaultColors = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
  '#8b5cf6', '#06b6d4', '#84cc16', '#f97316',
  '#ec4899', '#6366f1', '#14b8a6', '#eab308'
];

export function CategoryManager({ 
  tags, 
  websites, 
  allWebsiteTags, 
  categories,
  onTagsUpdate,
  onCategoriesUpdate,
  onFilterByCategory
}: CategoryManagerProps) {
  
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    color: defaultColors[0]
  });
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [editingCategoryForTags, setEditingCategoryForTags] = useState<Category | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // 获取所有网站标签（未分类的）
  const uncategorizedTags = useMemo(() => {
    const categorizedTagNames = new Set(tags.map(t => t.name));
    return Object.keys(allWebsiteTags).filter(tagName => !categorizedTagNames.has(tagName));
  }, [tags, allWebsiteTags]);

  // 按分类分组标签
  const tagsByCategory = useMemo(() => {
    const grouped: Record<string, { tag: Tag; websiteCount: number }[]> = {};
    
    categories.forEach(category => {
      grouped[category.id] = [];
    });

    tags.forEach(tag => {
      if (tag.category) {
        const category = categories.find(c => c.name === tag.category);
        if (category) {
          grouped[category.id].push({
            tag,
            websiteCount: allWebsiteTags[tag.name] || 0
          });
        }
      }
    });

    return grouped;
  }, [tags, categories, allWebsiteTags]);

  // 重置表单
  const resetForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      color: defaultColors[0]
    });
  };

  // 开始添加分类
  const handleStartAddCategory = () => {
    resetForm();
    setEditingCategory(null);
    setIsAddingCategory(true);
  };

  // 开始编辑分类
  const handleStartEditCategory = (category: Category) => {
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      color: category.color
    });
    setEditingCategory(category);
    setIsAddingCategory(true);
  };

  // 保存分类
  const handleSaveCategory = () => {
    if (!categoryForm.name.trim()) return;

    if (editingCategory) {
      // 编辑现有分类
      const updatedCategory = {
        ...editingCategory,
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        color: categoryForm.color
      };
      onCategoriesUpdate(categories.map(c => c.id === editingCategory.id ? updatedCategory : c));
    } else {
      // 添加新分类
      const newCategory: Category = {
        id: generateId('cat_'),
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        color: categoryForm.color,
        createdDate: new Date().toISOString()
      };
      onCategoriesUpdate([...categories, newCategory]);
    }

    setIsAddingCategory(false);
    resetForm();
  };

  // 删除分类
  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('确定要删除这个分类吗？分类下的标签将变为未分类状态。')) {
      onCategoriesUpdate(categories.filter(c => c.id !== categoryId));
    }
  };

  // 将标签添加到分类
  const handleAddTagToCategory = (tagName: string, categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const existingTag = tags.find(t => t.name === tagName);
    if (existingTag) {
      // 更新现有标签的分类
      const updatedTags = tags.map(t => 
        t.name === tagName ? { ...t, category: category.name } : t
      );
      onTagsUpdate(updatedTags);
    } else {
      // 创建新标签
      const newTag: Tag = {
        id: generateId('tag_'),
        name: tagName,
        count: allWebsiteTags[tagName] || 0,
        color: category.color,
        category: category.name,
        createdDate: new Date().toISOString()
      };
      onTagsUpdate([...tags, newTag]);
    }
  };

  // 从分类中移除标签
  const handleRemoveTagFromCategory = (tagId: string) => {
    const updatedTags = tags.map(t => 
      t.id === tagId ? { ...t, category: undefined } : t
    );
    onTagsUpdate(updatedTags);
  };

  // 开始编辑分类的标签
  const handleStartEditCategoryTags = (category: Category) => {
    setEditingCategoryForTags(category);
    // 获取当前分类下的标签
    const currentTags = tags.filter(t => t.category === category.name).map(t => t.name);
    setSelectedTags(currentTags);
    setIsEditingTags(true);
  };

  // 保存分类标签编辑
  const handleSaveCategoryTags = () => {
    if (!editingCategoryForTags) return;

    // 更新标签分类
    const updatedTags = tags.map(tag => {
      const isSelected = selectedTags.includes(tag.name);
      const wasInCategory = tag.category === editingCategoryForTags.name;
      
      if (isSelected && !wasInCategory) {
        // 添加到分类
        return { ...tag, category: editingCategoryForTags.name };
      } else if (!isSelected && wasInCategory) {
        // 从分类中移除
        return { ...tag, category: undefined };
      }
      return tag;
    });

    // 处理未分类的标签（需要创建新的Tag对象）
    const existingTagNames = new Set(tags.map(t => t.name));
    const newTags = selectedTags
      .filter(tagName => !existingTagNames.has(tagName))
      .map(tagName => ({
        id: generateId('tag_'),
        name: tagName,
        count: allWebsiteTags[tagName] || 0,
        color: editingCategoryForTags.color,
        category: editingCategoryForTags.name,
        createdDate: new Date().toISOString(),
        isCore: false
      }));

    onTagsUpdate([...updatedTags, ...newTags]);
    setIsEditingTags(false);
    setEditingCategoryForTags(null);
    setSelectedTags([]);
  };

  // 处理标签选择
  const handleTagSelection = (tagName: string, checked: boolean) => {
    if (checked) {
      setSelectedTags(prev => [...prev, tagName]);
    } else {
      setSelectedTags(prev => prev.filter(name => name !== tagName));
    }
  };

  return (
    <div className="space-y-6">
      {/* 分类管理头部 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">分类管理</h2>
          <p className="text-muted-foreground">管理标签分类，组织网站标签</p>
        </div>
        <Button onClick={handleStartAddCategory}>
          <Plus className="w-4 h-4 mr-2" />
          添加分类
        </Button>
      </div>

      {/* 分类列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => {
          const categoryTags = tagsByCategory[category.id] || [];
          const totalWebsites = categoryTags.reduce((sum, item) => sum + item.websiteCount, 0);

          return (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <CardTitle 
                      className={`text-lg ${onFilterByCategory ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
                      onClick={onFilterByCategory ? () => onFilterByCategory(category.name) : undefined}
                      title={onFilterByCategory ? '点击筛选此分类的网站' : ''}
                    >
                      {category.name}
                    </CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartEditCategoryTags(category)}
                      className="h-8 w-8 p-0"
                      title="编辑标签"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartEditCategory(category)}
                      className="h-8 w-8 p-0"
                      title="编辑分类"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      title="删除分类"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {category.description && (
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">标签数量</span>
                  <Badge variant="outline">{categoryTags.length}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">网站数量</span>
                  <Badge variant="outline">{totalWebsites}</Badge>
                </div>

                {/* 分类下的标签 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">标签列表</Label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {categoryTags.map(({ tag, websiteCount }) => (
                      <div key={tag.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <div className="flex items-center gap-2">
                          <TagIcon className="w-3 h-3" />
                          <span className="text-sm">{tag.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {websiteCount}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTagFromCategory(tag.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 添加标签到分类 */}
                {uncategorizedTags.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">添加标签</Label>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {uncategorizedTags.slice(0, 5).map(tagName => (
                        <div key={tagName} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                          <div className="flex items-center gap-2">
                            <TagIcon className="w-3 h-3" />
                            <span className="text-sm">{tagName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {allWebsiteTags[tagName]}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddTagToCategory(tagName, category.id)}
                              className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 未分类标签 */}
      {uncategorizedTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TagIcon className="w-5 h-5" />
              未分类标签 ({uncategorizedTags.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {uncategorizedTags.map(tagName => (
                <div key={tagName} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <span className="text-sm">{tagName}</span>
                  <Badge variant="outline" className="text-xs">
                    {allWebsiteTags[tagName]}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 分类表单对话框 */}
      <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? '编辑分类' : '添加分类'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? '修改分类信息' : '创建新的标签分类'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* 分类名称 */}
            <div className="space-y-2">
              <Label htmlFor="category-name">分类名称 *</Label>
              <Input
                id="category-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="输入分类名称"
              />
            </div>

            {/* 分类描述 */}
            <div className="space-y-2">
              <Label htmlFor="category-description">分类描述</Label>
              <Textarea
                id="category-description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="输入分类描述（可选）"
                rows={3}
              />
            </div>

            {/* 颜色选择 */}
            <div className="space-y-2">
              <Label>分类颜色</Label>
              <div className="flex gap-2 flex-wrap">
                {defaultColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      categoryForm.color === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setCategoryForm(prev => ({ ...prev, color }))}
                  />
                ))}
              </div>
              <Input
                type="color"
                value={categoryForm.color}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                className="w-20 h-10"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddingCategory(false)}>
              取消
            </Button>
            <Button onClick={handleSaveCategory}>
              <Save className="w-4 h-4 mr-2" />
              {editingCategory ? '保存' : '添加'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 标签编辑对话框 */}
      <Dialog open={isEditingTags} onOpenChange={setIsEditingTags}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              编辑分类标签 - {editingCategoryForTags?.name}
            </DialogTitle>
            <DialogDescription>
              选择属于此分类的标签
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4">
            {/* 所有可用标签 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">所有标签</Label>
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border rounded-md p-3">
                {Object.keys(allWebsiteTags).map(tagName => {
                  const websiteCount = allWebsiteTags[tagName];
                  const isSelected = selectedTags.includes(tagName);
                  
                  return (
                    <div key={tagName} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded">
                      <Checkbox
                        id={`tag-${tagName}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => handleTagSelection(tagName, checked as boolean)}
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <Label 
                          htmlFor={`tag-${tagName}`}
                          className="text-sm font-medium cursor-pointer flex-1"
                        >
                          {tagName}
                        </Label>
                        <Badge variant="outline" className="text-xs">
                          {websiteCount} 个网站
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 已选择的标签 */}
            {selectedTags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">已选择的标签 ({selectedTags.length})</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/30">
                  {selectedTags.map(tagName => (
                    <Badge key={tagName} variant="secondary" className="text-xs">
                      {tagName} ({allWebsiteTags[tagName]} 个网站)
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditingTags(false)}>
              取消
            </Button>
            <Button onClick={handleSaveCategoryTags}>
              <Save className="w-4 h-4 mr-2" />
              保存
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useState, useMemo, useEffect } from 'react';
import { Tag, Website } from '../../types/website';

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdDate: string;
}
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Plus, 
  Tag as TagIcon, 
  BarChart3,
  Folder,
  Settings
} from 'lucide-react';
import { mockTags } from '../../data/mock-data';
import { getRandomColor } from '../../utils/common';
import { TagOverview } from './tag-overview';
import { TagList } from './tag-list';
import { TagForm } from './tag-form';
import { CategoryManager } from './category-manager';

interface TagManagementProps {
  websites: Website[];
  onFilterByTag?: (tagName: string) => void;
  onFilterByCategory?: (categoryName: string) => void;
}

export function TagManagement({ websites, onFilterByTag, onFilterByCategory }: TagManagementProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // 加载分类数据
  useEffect(() => {
    const savedCategories = localStorage.getItem('tag_categories');
    if (savedCategories) {
      try {
        const categories = JSON.parse(savedCategories);
        setCategories(categories);
      } catch (error) {
        console.error('解析分类数据失败:', error);
        setDefaultCategories();
      }
    } else {
      setDefaultCategories();
    }
  }, []);

  // 设置默认分类
  const setDefaultCategories = () => {
    const defaultCategories = [
      { id: 'cat_1', name: '开发工具', description: '编程开发相关工具和平台', color: '#3b82f6', createdDate: new Date().toISOString() },
      { id: 'cat_2', name: '设计工具', description: 'UI/UX设计和视觉设计工具', color: '#ef4444', createdDate: new Date().toISOString() },
      { id: 'cat_3', name: 'AI工具', description: '人工智能和机器学习工具', color: '#10b981', createdDate: new Date().toISOString() },
      { id: 'cat_4', name: '效率工具', description: '提高工作效率的应用和服务', color: '#8b5cf6', createdDate: new Date().toISOString() },
      { id: 'cat_5', name: '学习资源', description: '在线学习和教育资源', color: '#f59e0b', createdDate: new Date().toISOString() },
      { id: 'cat_6', name: '商业工具', description: '商业和金融相关工具', color: '#06b6d4', createdDate: new Date().toISOString() },
      { id: 'cat_7', name: '团队协作', description: '团队协作和沟通工具', color: '#84cc16', createdDate: new Date().toISOString() },
      { id: 'cat_8', name: '娱乐休闲', description: '娱乐和休闲相关应用', color: '#ec4899', createdDate: new Date().toISOString() },
    ];
    setCategories(defaultCategories);
    localStorage.setItem('tag_categories', JSON.stringify(defaultCategories));
  };

  // 保存分类数据
  const saveCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
    localStorage.setItem('tag_categories', JSON.stringify(newCategories));
  };

  // 保存标签数据
  const saveTags = (newTags: Tag[]) => {
    setTags(newTags);
    localStorage.setItem('tag_data', JSON.stringify(newTags));
  };

  // 从网站数据中提取所有标签并计算使用频率
  const allWebsiteTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    websites.forEach(website => {
      website.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    return tagCounts;
  }, [websites]);

  // 从网站数据和保存的标签数据中生成标签对象
  const generatedTags = useMemo(() => {
    const tagMap = new Map<string, Tag>();
    
    // 首先从localStorage加载保存的标签数据
    const savedTags = localStorage.getItem('tag_data');
    if (savedTags) {
      try {
        const parsedTags = JSON.parse(savedTags);
        parsedTags.forEach((tag: any) => {
          tagMap.set(tag.name, {
            id: tag.id,
            name: tag.name,
            count: tag.count || 0,
            color: tag.color || getRandomColor(),
            category: tag.category,
            createdDate: tag.createdDate || new Date().toISOString(),
            isCore: tag.isCore || false
          });
        });
      } catch (error) {
        console.error('解析保存的标签数据失败:', error);
      }
    }
    
    // 然后从网站数据中提取所有标签，更新计数
    Object.entries(allWebsiteTags).forEach(([tagName, count]) => {
      if (tagMap.has(tagName)) {
        // 更新现有标签的计数
        const existingTag = tagMap.get(tagName)!;
        existingTag.count = count;
      } else {
        // 创建新标签
        const newTag: Tag = {
          id: `tag_${tagName.replace(/\s+/g, '_').toLowerCase()}`,
          name: tagName,
          count: count,
          color: getRandomColor(),
          category: undefined, // 未分类
          createdDate: new Date().toISOString(),
          isCore: false
        };
        tagMap.set(tagName, newTag);
      }
    });
    
    return Array.from(tagMap.values());
  }, [allWebsiteTags]);

  // 当网站数据变化时，更新标签列表
  React.useEffect(() => {
    setTags(generatedTags);
  }, [generatedTags]);

  // 获取现有分类名称
  const existingCategories = categories.map(c => c.name);

  // 添加/编辑标签
  const handleSaveTag = (tag: Tag) => {
    if (editingTag) {
      setTags(prev => prev.map(t => t.id === tag.id ? tag : t));
    } else {
      setTags(prev => [...prev, tag]);
    }
    setEditingTag(null);
  };

  // 删除标签
  const handleDeleteTag = (tagId: string) => {
    setTags(prev => prev.filter(t => t.id !== tagId));
  };

  // 开始添加标签
  const handleStartAddTag = () => {
    setEditingTag(null);
    setIsAddingTag(true);
  };

  // 开始编辑标签
  const handleStartEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setIsAddingTag(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">标签管理</h1>
          <p className="text-muted-foreground">
            管理网站标签，建立标签关系网络，优化内容分类
          </p>
        </div>
        <Button onClick={handleStartAddTag}>
          <Plus className="w-4 h-4 mr-2" />
          添加标签
        </Button>
      </div>

      {/* 标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            数据概览
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center gap-2">
            <TagIcon className="w-4 h-4" />
            标签管理
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Folder className="w-4 h-4" />
            分类管理
          </TabsTrigger>
        </TabsList>

        {/* 数据概览 */}
        <TabsContent value="overview" className="space-y-6">
          <TagOverview 
            tags={tags}
            websites={websites}
            allWebsiteTags={allWebsiteTags}
          />
        </TabsContent>

        {/* 标签管理 */}
        <TabsContent value="tags" className="space-y-6">
          <TagList
            tags={tags}
            websites={websites}
            allWebsiteTags={allWebsiteTags}
            categories={categories}
            onEditTag={handleStartEditTag}
            onDeleteTag={handleDeleteTag}
            onFilterByTag={onFilterByTag}
          />
        </TabsContent>

        {/* 分类管理 */}
        <TabsContent value="categories" className="space-y-6">
          <CategoryManager
            tags={tags}
            websites={websites}
            allWebsiteTags={allWebsiteTags}
            categories={categories}
            onTagsUpdate={saveTags}
            onCategoriesUpdate={saveCategories}
            onFilterByCategory={onFilterByCategory}
          />
        </TabsContent>
      </Tabs>

      {/* 标签表单对话框 */}
      <TagForm
        isOpen={isAddingTag}
        onClose={() => setIsAddingTag(false)}
        onSave={handleSaveTag}
        editingTag={editingTag}
        existingCategories={existingCategories}
        allWebsiteTags={allWebsiteTags}
      />
    </div>
  );
}

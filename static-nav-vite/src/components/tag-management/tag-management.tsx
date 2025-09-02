import React, { useState } from 'react';
import { Tag, TagRelation, Website } from '../../types/website';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Plus, 
  Network, 
  Tag as TagIcon, 
  BarChart3,
  Link
} from 'lucide-react';
import { mockTags, mockTagRelations } from '../../data/mock-data';
import { TagNetwork } from '../tag-network';
import { TagOverview } from './tag-overview';
import { TagList } from './tag-list';
import { TagForm } from './tag-form';
import { TagRelationManager } from './tag-relation-manager';

interface TagManagementProps {
  websites: Website[];
}

export function TagManagement({ websites }: TagManagementProps) {
  const [tags, setTags] = useState<Tag[]>(mockTags);
  const [relations, setRelations] = useState<TagRelation[]>(mockTagRelations);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  // 获取现有分类
  const existingCategories = Array.from(new Set(tags.map(t => t.category).filter(Boolean))) as string[];

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
    setRelations(prev => prev.filter(r => r.fromTagId !== tagId && r.toTagId !== tagId));
    if (selectedTag?.id === tagId) {
      setSelectedTag(null);
    }
  };

  // 添加关系
  const handleAddRelation = (relation: TagRelation) => {
    setRelations(prev => [...prev, relation]);
  };

  // 编辑关系
  const handleEditRelation = (relation: TagRelation) => {
    setRelations(prev => prev.map(r => r.id === relation.id ? relation : r));
  };

  // 删除关系
  const handleDeleteRelation = (relationId: string) => {
    setRelations(prev => prev.filter(r => r.id !== relationId));
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

  // 选择标签（用于网络视图）
  const handleSelectTag = (tag: Tag) => {
    setSelectedTag(tag);
    setActiveTab('network');
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            数据概览
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center gap-2">
            <TagIcon className="w-4 h-4" />
            标签管理
          </TabsTrigger>
          <TabsTrigger value="relations" className="flex items-center gap-2">
            <Link className="w-4 h-4" />
            关系管理
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            网络视图
          </TabsTrigger>
        </TabsList>

        {/* 数据概览 */}
        <TabsContent value="overview" className="space-y-6">
          <TagOverview 
            tags={tags}
            relations={relations}
            websites={websites}
          />
        </TabsContent>

        {/* 标签管理 */}
        <TabsContent value="tags" className="space-y-6">
          <TagList
            tags={tags}
            relations={relations}
            websites={websites}
            onEditTag={handleStartEditTag}
            onDeleteTag={handleDeleteTag}
            onSelectTag={handleSelectTag}
          />
        </TabsContent>

        {/* 关系管理 */}
        <TabsContent value="relations" className="space-y-6">
          <TagRelationManager
            tags={tags}
            relations={relations}
            onAddRelation={handleAddRelation}
            onEditRelation={handleEditRelation}
            onDeleteRelation={handleDeleteRelation}
          />
        </TabsContent>

        {/* 网络视图 */}
        <TabsContent value="network" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5" />
                标签关系网络
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TagNetwork 
                tags={tags}
                relations={relations}
                websites={websites}
                selectedTag={selectedTag}
                onTagSelect={setSelectedTag}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 标签表单对话框 */}
      <TagForm
        isOpen={isAddingTag}
        onClose={() => setIsAddingTag(false)}
        onSave={handleSaveTag}
        editingTag={editingTag}
        existingCategories={existingCategories}
      />
    </div>
  );
}

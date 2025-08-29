import { useState } from 'react';
import { Tag, TagRelation, Website } from '../types/website';
import { TagNetwork } from './TagNetwork';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { ScrollArea } from './ui/scroll-area';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Network, 
  Tag as TagIcon, 
  Search,
  Filter,
  BarChart3,
  Link,
  Save,
  X,
  Settings,
  Palette,
  Users,
  TrendingUp,
  Layers,
  Zap
} from 'lucide-react';
import { mockTags, mockTagRelations } from '../data/mockData';

interface TagManagementProps {
  websites: Website[];
}

interface TagFormData {
  name: string;
  description: string;
  color: string;
  category: string;
  isCore: boolean;
}

interface RelationFormData {
  fromTagId: string;
  toTagId: string;
  relationType: 'similar' | 'parent' | 'child' | 'complement' | 'alternative';
  strength: number;
  description: string;
}

export function TagManagement({ websites }: TagManagementProps) {
  const [tags, setTags] = useState<Tag[]>(mockTags);
  const [relations, setRelations] = useState<TagRelation[]>(mockTagRelations);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [isAddingRelation, setIsAddingRelation] = useState(false);
  const [editingRelation, setEditingRelation] = useState<TagRelation | null>(null);
  
  const [tagForm, setTagForm] = useState<TagFormData>({
    name: '',
    description: '',
    color: '#3b82f6',
    category: '技术',
    isCore: false
  });

  const [relationForm, setRelationForm] = useState<RelationFormData>({
    fromTagId: '',
    toTagId: '',
    relationType: 'similar',
    strength: 0.5,
    description: ''
  });

  // 筛选标签
  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (tag.description && tag.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || tag.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // 获取标签统计信息
  const getTagStats = (tag: Tag) => {
    const websiteCount = websites.filter(w => w.tags.includes(tag.name)).length;
    const relatedCount = relations.filter(r => r.fromTagId === tag.id || r.toTagId === tag.id).length;
    const avgStrength = relations
      .filter(r => r.fromTagId === tag.id || r.toTagId === tag.id)
      .reduce((sum, r) => sum + r.strength, 0) / Math.max(relatedCount, 1);
    return { websiteCount, relatedCount, avgStrength };
  };

  // 添加/编辑标签
  const handleSaveTag = () => {
    if (editingTag) {
      const updatedTag: Tag = {
        ...editingTag,
        ...tagForm,
        relatedTags: editingTag.relatedTags || []
      };
      setTags(prev => prev.map(t => t.id === editingTag.id ? updatedTag : t));
      setEditingTag(null);
    } else {
      const newTag: Tag = {
        id: Date.now().toString(),
        count: 0,
        createdDate: new Date().toISOString(),
        relatedTags: [],
        ...tagForm
      };
      setTags(prev => [...prev, newTag]);
      setIsAddingTag(false);
    }
    setTagForm({
      name: '',
      description: '',
      color: '#3b82f6',
      category: '技术',
      isCore: false
    });
  };

  // 删除标签
  const handleDeleteTag = (tagId: string) => {
    setTags(prev => prev.filter(t => t.id !== tagId));
    setRelations(prev => prev.filter(r => r.fromTagId !== tagId && r.toTagId !== tagId));
    if (selectedTag?.id === tagId) {
      setSelectedTag(null);
    }
  };

  // 添加/编辑关系
  const handleSaveRelation = () => {
    if (editingRelation) {
      const updatedRelation: TagRelation = {
        ...editingRelation,
        ...relationForm
      };
      setRelations(prev => prev.map(r => r.id === editingRelation.id ? updatedRelation : r));
      setEditingRelation(null);
    } else {
      const newRelation: TagRelation = {
        id: Date.now().toString(),
        ...relationForm
      };
      setRelations(prev => [...prev, newRelation]);
      setIsAddingRelation(false);
    }
    setRelationForm({
      fromTagId: '',
      toTagId: '',
      relationType: 'similar',
      strength: 0.5,
      description: ''
    });
  };

  // 删除关系
  const handleDeleteRelation = (relationId: string) => {
    setRelations(prev => prev.filter(r => r.id !== relationId));
  };

  // 获取相关网站
  const getRelatedWebsites = (tag: Tag) => {
    return websites.filter(w => w.tags.includes(tag.name));
  };

  // 获取标签的关联关系
  const getTagRelations = (tag: Tag) => {
    return relations.filter(r => r.fromTagId === tag.id || r.toTagId === tag.id);
  };

  // 批量操作
  const handleBatchOperation = (operation: string, selectedTagIds: string[]) => {
    switch (operation) {
      case 'delete':
        setTags(prev => prev.filter(t => !selectedTagIds.includes(t.id)));
        setRelations(prev => prev.filter(r => 
          !selectedTagIds.includes(r.fromTagId) && !selectedTagIds.includes(r.toTagId)
        ));
        break;
      case 'core':
        setTags(prev => prev.map(t => 
          selectedTagIds.includes(t.id) ? { ...t, isCore: true } : t
        ));
        break;
      case 'category':
        // 这里可以实现批量更改分类
        break;
    }
  };

  const categories = ['all', '技术', '设计', '效率', '团队', '创作', '学习', '娱乐'];
  const relationTypes = [
    { value: 'similar', label: '相似关系', color: '#10b981' },
    { value: 'parent', label: '父子关系', color: '#3b82f6' },
    { value: 'child', label: '子级关系', color: '#6366f1' },
    { value: 'complement', label: '互补关系', color: '#f59e0b' },
    { value: 'alternative', label: '替代关系', color: '#ef4444' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">标签管理</h1>
          <p className="text-muted-foreground mt-1">
            管理标签分类，维护标签关系网络，优化网站组织结构
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddingRelation} onOpenChange={setIsAddingRelation}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Link className="w-4 h-4" />
                添加关系
              </Button>
            </DialogTrigger>
          </Dialog>
          <Dialog open={isAddingTag} onOpenChange={setIsAddingTag}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                添加标签
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                <TagIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-lg">{tags.length}</div>
                <div className="text-xs text-muted-foreground">总标签</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                <Network className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="text-lg">{relations.length}</div>
                <div className="text-xs text-muted-foreground">关系数</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                <Zap className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="text-lg">{tags.filter(t => t.isCore).length}</div>
                <div className="text-xs text-muted-foreground">核心标签</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900">
                <Layers className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <div className="text-lg">{categories.length - 1}</div>
                <div className="text-xs text-muted-foreground">分类数</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                <TrendingUp className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <div className="text-lg">
                  {Math.round(relations.reduce((sum, r) => sum + r.strength, 0) / relations.length * 100) || 0}%
                </div>
                <div className="text-xs text-muted-foreground">平均关联度</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-cyan-100 dark:bg-cyan-900">
                <Users className="w-4 h-4 text-cyan-600" />
              </div>
              <div>
                <div className="text-lg">
                  {Math.round(tags.reduce((sum, tag) => sum + getTagStats(tag).websiteCount, 0) / tags.length) || 0}
                </div>
                <div className="text-xs text-muted-foreground">平均使用</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            概览
          </TabsTrigger>
          <TabsTrigger value="tags" className="gap-2">
            <TagIcon className="w-4 h-4" />
            标签管理
          </TabsTrigger>
          <TabsTrigger value="relations" className="gap-2">
            <Link className="w-4 h-4" />
            关系管理
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Layers className="w-4 h-4" />
            分类管理
          </TabsTrigger>
          <TabsTrigger value="network" className="gap-2">
            <Network className="w-4 h-4" />
            关系网络
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 标签使用统计 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  标签使用统计
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tags
                    .map(tag => ({ ...tag, ...getTagStats(tag) }))
                    .sort((a, b) => b.websiteCount - a.websiteCount)
                    .slice(0, 10)
                    .map(tag => (
                      <div key={tag.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="text-sm">{tag.name}</span>
                          {tag.isCore && (
                            <Badge variant="outline" className="text-xs">核心</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {tag.websiteCount} 个网站
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* 分类分布 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  分类分布
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.filter(c => c !== 'all').map(category => {
                    const categoryTags = tags.filter(t => t.category === category);
                    const totalWebsites = categoryTags.reduce((sum, tag) => 
                      sum + getTagStats(tag).websiteCount, 0
                    );
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm">{category}</span>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{categoryTags.length} 标签</span>
                          <span>•</span>
                          <span>{totalWebsites} 网站</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 关系类型统计 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5" />
                  关系类型统计
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {relationTypes.map(type => {
                    const count = relations.filter(r => r.relationType === type.value).length;
                    const percentage = relations.length > 0 ? (count / relations.length * 100).toFixed(1) : '0';
                    return (
                      <div key={type.value} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: type.color }}
                          />
                          <span className="text-sm">{type.label}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {count} ({percentage}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 最新活动 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  最新活动
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>新增 "人工智能" 标签</span>
                    <span className="ml-auto">2小时前</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>更新 "开发工具" 关系网络</span>
                    <span className="ml-auto">1天前</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>优化标签分类结构</span>
                    <span className="ml-auto">3天前</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tags" className="space-y-6">
          {/* 搜索和筛选 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="搜索标签..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部分类</SelectItem>
                    {categories.filter(c => c !== 'all').map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 标签列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTags.map(tag => {
              const stats = getTagStats(tag);
              const tagRelations = getTagRelations(tag);
              
              return (
                <Card key={tag.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <Badge variant={tag.isCore ? "default" : "secondary"}>
                          {tag.name}
                        </Badge>
                        {tag.isCore && (
                          <Badge variant="outline" className="text-xs">
                            核心
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingTag(tag);
                            setTagForm({
                              name: tag.name,
                              description: tag.description || '',
                              color: tag.color,
                              category: tag.category || '技术',
                              isCore: tag.isCore || false
                            });
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteTag(tag.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {tag.description && (
                      <p className="text-sm text-muted-foreground">
                        {tag.description}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <div className="text-lg">{stats.websiteCount}</div>
                        <div className="text-xs text-muted-foreground">网站</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg">{stats.relatedCount}</div>
                        <div className="text-xs text-muted-foreground">关联</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg">{(stats.avgStrength * 100).toFixed(0)}%</div>
                        <div className="text-xs text-muted-foreground">强度</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {tag.category || '未分类'}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setSelectedTag(tag);
                          setActiveTab('network');
                        }}
                        className="text-xs"
                      >
                        查看网络
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="relations" className="space-y-6">
          {/* 关系列表 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>关系管理</span>
                <Button onClick={() => setIsAddingRelation(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  添加关系
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {relations.map(relation => {
                  const fromTag = tags.find(t => t.id === relation.fromTagId);
                  const toTag = tags.find(t => t.id === relation.toTagId);
                  if (!fromTag || !toTag) return null;
                  
                  const relationType = relationTypes.find(t => t.value === relation.relationType);
                  
                  return (
                    <div key={relation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge style={{ backgroundColor: fromTag.color + '20', color: fromTag.color }}>
                          {fromTag.name}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: relationType?.color }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {relationType?.label}
                          </span>
                        </div>
                        <Badge style={{ backgroundColor: toTag.color + '20', color: toTag.color }}>
                          {toTag.name}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          强度: {(relation.strength * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingRelation(relation);
                            setRelationForm({
                              ...relation,
                              description: relation.description || ''
                            });
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteRelation(relation.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          {/* 分类管理 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.filter(c => c !== 'all').map(category => {
              const categoryTags = tags.filter(t => t.category === category);
              const totalWebsites = categoryTags.reduce((sum, tag) => 
                sum + getTagStats(tag).websiteCount, 0
              );
              
              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{category}</span>
                      <Badge variant="outline">{categoryTags.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      {totalWebsites} 个相关网站
                    </div>
                    
                    <div className="space-y-2">
                      {categoryTags.slice(0, 5).map(tag => (
                        <div key={tag.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span className="text-sm">{tag.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {getTagStats(tag).websiteCount}
                          </span>
                        </div>
                      ))}
                      {categoryTags.length > 5 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{categoryTags.length - 5} 更多
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <TagNetwork
            tags={tags}
            relations={relations}
            websites={websites}
            selectedTag={selectedTag}
            onTagSelect={setSelectedTag}
          />
        </TabsContent>
      </Tabs>

      {/* 添加/编辑标签对话框 */}
      <Dialog open={isAddingTag || !!editingTag} onOpenChange={(open) => {
        if (!open) {
          setIsAddingTag(false);
          setEditingTag(null);
          setTagForm({
            name: '',
            description: '',
            color: '#3b82f6',
            category: '技术',
            isCore: false
          });
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTag ? '编辑标签' : '添加标签'}
            </DialogTitle>
            <DialogDescription>
              {editingTag ? '修改现有标签的信息和属性。' : '创建一个新的标签，设置其名称、描述、颜色和分类。'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tag-name">标签名称</Label>
              <Input
                id="tag-name"
                value={tagForm.name}
                onChange={(e) => setTagForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="输入标签名称"
              />
            </div>
            <div>
              <Label htmlFor="tag-description">描述</Label>
              <Textarea
                id="tag-description"
                value={tagForm.description}
                onChange={(e) => setTagForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="输入标签描述"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tag-color">颜色</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="tag-color"
                    type="color"
                    value={tagForm.color}
                    onChange={(e) => setTagForm(prev => ({ ...prev, color: e.target.value }))}
                    className="w-16 h-10"
                  />
                  <Input
                    value={tagForm.color}
                    onChange={(e) => setTagForm(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="tag-category">分类</Label>
                <Select 
                  value={tagForm.category} 
                  onValueChange={(value) => setTagForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== 'all').map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="tag-core">核心标签</Label>
              <Switch
                id="tag-core"
                checked={tagForm.isCore}
                onCheckedChange={(checked) => setTagForm(prev => ({ ...prev, isCore: checked }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddingTag(false);
                  setEditingTag(null);
                }}
              >
                取消
              </Button>
              <Button onClick={handleSaveTag} disabled={!tagForm.name}>
                <Save className="w-4 h-4 mr-2" />
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 添加/编辑关系对话框 */}
      <Dialog open={isAddingRelation || !!editingRelation} onOpenChange={(open) => {
        if (!open) {
          setIsAddingRelation(false);
          setEditingRelation(null);
          setRelationForm({
            fromTagId: '',
            toTagId: '',
            relationType: 'similar',
            strength: 0.5,
            description: ''
          });
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRelation ? '编辑关系' : '添加关系'}
            </DialogTitle>
            <DialogDescription>
              {editingRelation ? '修改现有标签关系的类型和强度。' : '在两个标签之间建立新的关系连接。'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>源标签</Label>
                <Select 
                  value={relationForm.fromTagId}
                  onValueChange={(value) => setRelationForm(prev => ({ ...prev, fromTagId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择标签" />
                  </SelectTrigger>
                  <SelectContent>
                    {tags.map(tag => (
                      <SelectItem key={tag.id} value={tag.id}>
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>目标标签</Label>
                <Select 
                  value={relationForm.toTagId}
                  onValueChange={(value) => setRelationForm(prev => ({ ...prev, toTagId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择标签" />
                  </SelectTrigger>
                  <SelectContent>
                    {tags.filter(t => t.id !== relationForm.fromTagId).map(tag => (
                      <SelectItem key={tag.id} value={tag.id}>
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>关系类型</Label>
              <Select 
                value={relationForm.relationType}
                onValueChange={(value: any) => setRelationForm(prev => ({ ...prev, relationType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {relationTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: type.color }}
                        />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>关系强度: {(relationForm.strength * 100).toFixed(0)}%</Label>
              <Slider
                value={[relationForm.strength * 100]}
                onValueChange={([value]) => setRelationForm(prev => ({ ...prev, strength: value / 100 }))}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>
            <div>
              <Label>描述</Label>
              <Textarea
                value={relationForm.description}
                onChange={(e) => setRelationForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="描述这个关系"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddingRelation(false);
                  setEditingRelation(null);
                }}
              >
                取消
              </Button>
              <Button 
                onClick={handleSaveRelation} 
                disabled={!relationForm.fromTagId || !relationForm.toTagId}
              >
                <Save className="w-4 h-4 mr-2" />
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
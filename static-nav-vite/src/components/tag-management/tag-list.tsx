import React, { useState } from 'react';
import { Tag, TagRelation, Website } from '../../types/website';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Edit, Trash2, Search, Network } from 'lucide-react';

interface TagListProps {
  tags: Tag[];
  relations: TagRelation[];
  websites: Website[];
  onEditTag: (tag: Tag) => void;
  onDeleteTag: (tagId: string) => void;
  onSelectTag: (tag: Tag) => void;
}

export function TagList({ 
  tags, 
  relations, 
  websites, 
  onEditTag, 
  onDeleteTag, 
  onSelectTag 
}: TagListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = ['all', ...Array.from(new Set(tags.map(t => t.category).filter(Boolean)))];

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

  return (
    <div className="space-y-4">
      {/* 搜索和筛选 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="搜索标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="选择分类" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category!}>
                {category === 'all' ? '全部分类' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 标签列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTags.map(tag => {
          const stats = getTagStats(tag);
          
          return (
            <Card key={tag.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: tag.color }}
                    />
                    <CardTitle className="text-lg">{tag.name}</CardTitle>
                    {tag.isCore && (
                      <Badge variant="secondary" className="text-xs">核心</Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectTag(tag)}
                      className="h-8 w-8 p-0"
                    >
                      <Network className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditTag(tag)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteTag(tag.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tag.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {tag.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline">{tag.category}</Badge>
                    <span className="text-muted-foreground">
                      {new Date(tag.createdDate || '').toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-semibold text-blue-600">
                        {stats.websiteCount}
                      </div>
                      <div className="text-xs text-muted-foreground">网站</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-green-600">
                        {stats.relatedCount}
                      </div>
                      <div className="text-xs text-muted-foreground">关联</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-purple-600">
                        {stats.avgStrength.toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">强度</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTags.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>没有找到匹配的标签</p>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Tag, Website } from '../../types/website';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Edit, Trash2, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdDate: string;
}

interface TagListProps {
  tags: Tag[];
  websites: Website[];
  allWebsiteTags: Record<string, number>;
  categories: Category[];
  onEditTag: (tag: Tag) => void;
  onDeleteTag: (tagId: string) => void;
  onFilterByTag?: (tagName: string) => void;
}

export function TagList({ 
  tags, 
  websites, 
  allWebsiteTags,
  categories,
  onEditTag, 
  onDeleteTag,
  onFilterByTag
}: TagListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'websiteCount' | 'createdDate'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const categoryNames = ['all', ...categories.map(c => c.name)];

  // 筛选和排序标签
  const filteredAndSortedTags = React.useMemo(() => {
    let filtered = tags.filter(tag => {
      const matchesSearch = tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (tag.description && tag.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || tag.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    // 排序
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'websiteCount':
          const countA = allWebsiteTags[a.name] || 0;
          const countB = allWebsiteTags[b.name] || 0;
          comparison = countA - countB;
          break;
        case 'createdDate':
          comparison = new Date(a.createdDate || '').getTime() - new Date(b.createdDate || '').getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [tags, searchQuery, filterCategory, sortBy, sortOrder, allWebsiteTags]);

  // 获取标签统计信息
  const getTagStats = (tag: Tag) => {
    const websiteCount = allWebsiteTags[tag.name] || 0;
    return { websiteCount };
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
            {categoryNames.map(category => (
              <SelectItem key={category} value={category!}>
                {category === 'all' ? '全部分类' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(value: 'name' | 'websiteCount' | 'createdDate') => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="排序方式" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">按名称</SelectItem>
            <SelectItem value="websiteCount">按网站数量</SelectItem>
            <SelectItem value="createdDate">按创建时间</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="w-full sm:w-auto"
        >
          {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* 标签列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedTags.map(tag => {
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
                    {onFilterByTag && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onFilterByTag(tag.name)}
                        className="h-8 w-8 p-0"
                        title="筛选此标签的网站"
                      >
                        <Filter className="h-4 w-4" />
                      </Button>
                    )}
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
                  
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-blue-600">
                      {stats.websiteCount}
                    </div>
                    <div className="text-sm text-muted-foreground">使用此标签的网站数量</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAndSortedTags.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>没有找到匹配的标签</p>
        </div>
      )}
    </div>
  );
}

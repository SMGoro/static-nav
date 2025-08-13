import { useState, useMemo } from 'react';
import { Website } from '../types/website';
import { WebsiteCard } from './WebsiteCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { 
  Search, 
  Plus, 
  Filter, 
  Star, 
  Grid3X3, 
  List,
  SortAsc,
  SortDesc,
  X,
  Settings,
  Tag as TagIcon
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { categories, mockTags } from '../data/mockData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from './ui/dropdown-menu';

type SortType = 'default' | 'name' | 'clicks' | 'date';
type ViewType = 'grid' | 'list';

interface NavigationProps {
  websites: Website[];
  onAddWebsite: () => void;
  onEditWebsite: (website: Website) => void;
  onDeleteWebsite: (id: string) => void;
  onViewWebsite: (website: Website) => void;
  onShareWebsite: (website: Website) => void;
  onAdvancedFilter?: () => void;
}

export function Navigation({
  websites,
  onAddWebsite,
  onEditWebsite,
  onDeleteWebsite,
  onViewWebsite,
  onShareWebsite,
  onAdvancedFilter
}: NavigationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFeatured, setShowFeatured] = useState(false);
  const [sortBy, setSortBy] = useState<SortType>('default');
  const [viewType, setViewType] = useState<ViewType>('grid');

  // 获取常用标签（按使用频率排序，取前8个）
  const popularTags = useMemo(() => {
    const tagsWithCounts = mockTags.map(tag => {
      const count = websites.filter(website => 
        website.tags.includes(tag.name)
      ).length;
      return { ...tag, count };
    }).filter(tag => tag.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    
    return tagsWithCounts;
  }, [websites]);

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('全部');
    setSelectedTags([]);
    setShowFeatured(false);
    setSortBy('default');
  };

  const filteredWebsites = useMemo(() => {
    let filtered = websites.filter(website => {
      const matchesSearch = website.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           website.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           website.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === '全部' || website.category === selectedCategory;
      const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => website.tags.includes(tag));
      const matchesFeatured = !showFeatured || website.featured;
      
      return matchesSearch && matchesCategory && matchesTags && matchesFeatured;
    });

    // 排序
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'clicks':
        filtered.sort((a, b) => b.clicks - a.clicks);
        break;
      case 'date':
        filtered.sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());
        break;
      default:
        break;
    }

    return filtered;
  }, [websites, searchQuery, selectedCategory, selectedTags, showFeatured, sortBy]);

  const hasActiveFilters = searchQuery || selectedCategory !== '全部' || selectedTags.length > 0 || showFeatured;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 页面标题和操作按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl">网站导航</h1>
          <p className="text-muted-foreground mt-1">
            发现优质网站资源，提升工作效率
          </p>
        </div>
        <div className="flex gap-2">
          {onAdvancedFilter && (
            <Button variant="outline" onClick={onAdvancedFilter} className="gap-2">
              <Settings className="w-4 h-4" />
              高级筛选
            </Button>
          )}
          <Button onClick={onAddWebsite} className="gap-2 shadow-lg">
            <Plus className="w-4 h-4" />
            添加网站
          </Button>
        </div>
      </div>

      {/* 搜索和筛选区域 */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* 主要筛选控件 */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="搜索网站..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-input-background border-border"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    筛选
                    {(selectedTags.length > 0 || showFeatured) && (
                      <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                        {selectedTags.length + (showFeatured ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80">
                  <DropdownMenuLabel>筛选选项</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => setShowFeatured(!showFeatured)}>
                    <Star className="w-4 h-4 mr-2" />
                    只看精选 {showFeatured && '✓'}
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <TagIcon className="w-4 h-4 mr-2" />
                      常用标签
                      {selectedTags.length > 0 && (
                        <Badge variant="secondary" className="ml-auto px-1 py-0 text-xs">
                          {selectedTags.length}
                        </Badge>
                      )}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-56">
                      <div className="p-2 space-y-2">
                        <div className="grid grid-cols-2 gap-1">
                          {popularTags.map(tag => (
                            <div
                              key={tag.id}
                              onClick={() => toggleTag(tag.name)}
                              className="cursor-pointer"
                            >
                              <Badge
                                variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                                className="w-full justify-center text-xs transition-colors"
                                style={selectedTags.includes(tag.name) ? {
                                  backgroundColor: tag.color,
                                  borderColor: tag.color,
                                  color: 'white'
                                } : {
                                  borderColor: tag.color + '40',
                                  color: tag.color
                                }}
                              >
                                {tag.name}
                              </Badge>
                            </div>
                          ))}
                        </div>
                        {selectedTags.length > 0 && (
                          <>
                            <Separator />
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setSelectedTags([])}
                              className="w-full text-xs gap-1"
                            >
                              <X className="w-3 h-3" />
                              清除标签
                            </Button>
                          </>
                        )}
                      </div>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={clearFilters}>
                    <X className="w-4 h-4 mr-2" />
                    清除所有筛选
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    {sortBy === 'name' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                    排序
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy('default')}>
                    默认排序 {sortBy === 'default' && '✓'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('name')}>
                    按名称排序 {sortBy === 'name' && '✓'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('clicks')}>
                    按访问量排序 {sortBy === 'clicks' && '✓'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('date')}>
                    按添加时间排序 {sortBy === 'date' && '✓'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex border rounded-lg p-1">
                <Button
                  variant={viewType === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewType('grid')}
                  className="px-3"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewType === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewType('list')}
                  className="px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* 已选择的筛选条件显示 */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">已选择:</span>
                {showFeatured && (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="w-3 h-3" />
                    精选
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setShowFeatured(false)} />
                  </Badge>
                )}
                {selectedTags.map(tagName => {
                  const tag = popularTags.find(t => t.name === tagName);
                  return tag ? (
                    <Badge
                      key={tagName}
                      className="gap-1 cursor-pointer"
                      style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color }}
                    >
                      {tagName}
                      <X className="w-3 h-3" onClick={() => toggleTag(tagName)} />
                    </Badge>
                  ) : null;
                })}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-xs gap-1 ml-auto"
                >
                  <X className="w-3 h-3" />
                  清除全部
                </Button>
              </div>
            )}

            {/* 筛选结果统计 */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                显示 {filteredWebsites.length} 个网站
                {hasActiveFilters && <span> （已筛选）</span>}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 网站卡片网格 */}
      {filteredWebsites.length > 0 ? (
        <div className={
          viewType === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }>
          {filteredWebsites.map((website) => (
            <WebsiteCard
              key={website.id}
              website={website}
              onEdit={onEditWebsite}
              onDelete={onDeleteWebsite}
              onView={onViewWebsite}
              onShare={onShareWebsite}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg mb-2">没有找到匹配的网站</h3>
          <p className="text-muted-foreground mb-4">
            {hasActiveFilters ? '请尝试调整筛选条件' : '还没有添加任何网站'}
          </p>
          <Button onClick={hasActiveFilters ? clearFilters : onAddWebsite} className="gap-2">
            {hasActiveFilters ? (
              <>
                <X className="w-4 h-4" />
                清除筛选
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                添加第一个网站
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
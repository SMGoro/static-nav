import { useState, useMemo } from 'react';
import { Website, Tag } from '../types/website';
import { WebsiteCard } from './website/website-card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { 
  Search, 
  Filter, 
  X, 
  Grid3X3,
  List,
  ArrowLeft,
  Download,
  Share2,
  BarChart3
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { mockTags } from '../data/mock-data';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

interface DetailedTagFilterProps {
  websites: Website[];
  onBack: () => void;
  onEditWebsite: (website: Website) => void;
  onDeleteWebsite: (id: string) => void;
  onViewWebsite: (website: Website) => void;
  onShareWebsite: (website: Website) => void;
}

interface FilterState {
  searchQuery: string;
  selectedCategory: string;
  selectedTags: string[];
  showFeatured: boolean;
  isPaidFilter: string; // 'all' | 'free' | 'paid'
  clicksRange: [number];
  dateRange: string; // 'all' | 'week' | 'month' | 'year'
  ratingRange: [number];
  languageFilter: string;
  sortBy: string;
  viewType: 'grid' | 'list';
}

export function DetailedTagFilter({
  websites,
  onBack,
  onEditWebsite,
  onDeleteWebsite,
  onViewWebsite,
  onShareWebsite
}: DetailedTagFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedCategory: '全部',
    selectedTags: [],
    showFeatured: false,
    isPaidFilter: 'all',
    clicksRange: [0],
    dateRange: 'all',
    ratingRange: [0],
    languageFilter: 'all',
    sortBy: 'default',
    viewType: 'grid'
  });

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // 按分类分组标签
  const tagsByCategory = useMemo(() => {
    const grouped = mockTags.reduce((acc, tag) => {
      const category = tag.category || '其他';
      if (!acc[category]) {
        acc[category] = [];
      }
      
      // 计算实际使用的标签数量
      const count = websites.filter(w => w.tags.includes(tag.name)).length;
      acc[category].push({ ...tag, count });
      return acc;
    }, {} as Record<string, (Tag & { count: number })[]>);

    // 对每个分类内的标签按计数排序
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => b.count - a.count);
    });

    return grouped;
  }, [websites]);

  // 获取筛选后的网站
  const filteredWebsites = useMemo(() => {
    const maxClicks = Math.max(...websites.map(w => w.clicks));
    const maxRating = 5;

    let filtered = websites.filter(website => {
      // 基础筛选
      const matchesSearch = website.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                           website.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                           website.tags.some(tag => tag.toLowerCase().includes(filters.searchQuery.toLowerCase()));
      
      const matchesCategory = true; // 移除分类筛选，始终匹配
      const matchesTags = filters.selectedTags.length === 0 || filters.selectedTags.every(tag => website.tags.includes(tag));
      const matchesFeatured = !filters.showFeatured || website.featured;

      // 高级筛选
      const matchesPaid = filters.isPaidFilter === 'all' || 
                         (filters.isPaidFilter === 'free' && !website.isPaid) ||
                         (filters.isPaidFilter === 'paid' && website.isPaid);

      const matchesClicks = website.clicks >= (filters.clicksRange[0] / 100) * maxClicks;

      const matchesRating = !website.rating || website.rating >= (filters.ratingRange[0] / 100) * maxRating;

      const matchesLanguage = filters.languageFilter === 'all' || 
                             website.language === filters.languageFilter;

      // 日期筛选
      let matchesDate = true;
      if (filters.dateRange !== 'all') {
        const websiteDate = new Date(website.addedDate);
        const now = new Date();
        const diffTime = now.getTime() - websiteDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (filters.dateRange) {
          case 'week':
            matchesDate = diffDays <= 7;
            break;
          case 'month':
            matchesDate = diffDays <= 30;
            break;
          case 'year':
            matchesDate = diffDays <= 365;
            break;
        }
      }

      return matchesSearch && matchesCategory && matchesTags && matchesFeatured && 
             matchesPaid && matchesClicks && matchesRating && matchesLanguage && matchesDate;
    });

    // 排序
    switch (filters.sortBy) {
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'clicks':
        filtered.sort((a, b) => b.clicks - a.clicks);
        break;
      case 'date':
        filtered.sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [websites, filters]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleTag = (tagName: string) => {
    updateFilter('selectedTags', 
      filters.selectedTags.includes(tagName) 
        ? filters.selectedTags.filter(t => t !== tagName)
        : [...filters.selectedTags, tagName]
    );
  };

  const clearAllFilters = () => {
    setFilters({
      searchQuery: '',
      selectedCategory: '全部',
      selectedTags: [],
      showFeatured: false,
      isPaidFilter: 'all',
      clicksRange: [0],
      dateRange: 'all',
      ratingRange: [0],
      languageFilter: 'all',
      sortBy: 'default',
      viewType: 'grid'
    });
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const hasActiveFilters = filters.searchQuery || filters.selectedCategory !== '全部' || 
                          filters.selectedTags.length > 0 || filters.showFeatured ||
                          filters.isPaidFilter !== 'all' || filters.clicksRange[0] > 0 ||
                          filters.dateRange !== 'all' || filters.ratingRange[0] > 0 ||
                          filters.languageFilter !== 'all';

  const languages = Array.from(new Set(websites.map(w => w.language).filter(Boolean)));

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部工具栏 */}
      <div className="border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
            <div>
              <h1 className="text-xl">高级筛选</h1>
              <p className="text-sm text-muted-foreground">
                找到 {filteredWebsites.length} 个匹配的网站
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              分享筛选
            </Button>
            <div className="flex border rounded-lg p-1">
              <Button
                variant={filters.viewType === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => updateFilter('viewType', 'grid')}
                className="px-3"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={filters.viewType === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => updateFilter('viewType', 'list')}
                className="px-3"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* 侧边栏筛选面板 */}
        <div className="w-80 border-r bg-card">
          <ScrollArea className="h-[calc(100vh-73px)]">
            <div className="p-4 space-y-6">
              {/* 搜索 */}
              <div>
                <Label className="text-sm mb-2 block">搜索</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="搜索网站..."
                    value={filters.searchQuery}
                    onChange={(e) => updateFilter('searchQuery', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 分类筛选 */}
              <div>

              </div>

              {/* 基础筛选选项 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="featured" className="text-sm">只显示精选</Label>
                  <Switch
                    id="featured"
                    checked={filters.showFeatured}
                    onCheckedChange={(checked) => updateFilter('showFeatured', checked)}
                  />
                </div>
              </div>

              <Separator />

              {/* 标签筛选 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm">标签筛选</Label>
                  {filters.selectedTags.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => updateFilter('selectedTags', [])}
                      className="text-xs gap-1"
                    >
                      <X className="w-3 h-3" />
                      清除
                    </Button>
                  )}
                </div>

                {/* 已选择的标签 */}
                {filters.selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4 p-2 bg-muted/30 rounded">
                    {filters.selectedTags.map(tagName => {
                      const tag = mockTags.find(t => t.name === tagName);
                      return tag ? (
                        <Badge
                          key={tagName}
                          className="gap-1 cursor-pointer text-xs"
                          style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color }}
                          onClick={() => toggleTag(tagName)}
                        >
                          {tagName}
                          <X className="w-3 h-3" />
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}

                {/* 分类标签 */}
                <div className="space-y-3">
                  {Object.entries(tagsByCategory).map(([categoryName, categoryTags]) => (
                    <Collapsible
                      key={categoryName}
                      open={expandedCategories.has(categoryName)}
                      onOpenChange={() => toggleCategory(categoryName)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                          <span className="text-sm">{categoryName}</span>
                          <Badge variant="outline" className="text-xs">
                            {categoryTags.filter(t => t.count > 0).length}
                          </Badge>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 mt-2">
                        {categoryTags.filter(tag => tag.count > 0).map(tag => (
                          <div
                            key={tag.id}
                            className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer"
                            onClick={() => toggleTag(tag.name)}
                          >
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: tag.color }}
                              />
                              <span className="text-sm">{tag.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{tag.count}</span>
                              {filters.selectedTags.includes(tag.name) && (
                                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </div>

              <Separator />

              {/* 高级筛选 */}
              <div className="space-y-4">
                <Label className="text-sm">高级筛选</Label>
                
                {/* 收费模式 */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">收费模式</Label>
                  <Select value={filters.isPaidFilter} onValueChange={(value) => updateFilter('isPaidFilter', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="free">免费</SelectItem>
                      <SelectItem value="paid">付费</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 访问量筛选 */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    最低访问量: {Math.round((filters.clicksRange[0] / 100) * Math.max(...websites.map(w => w.clicks)))}
                  </Label>
                  <Slider
                    value={filters.clicksRange}
                    onValueChange={(value) => updateFilter('clicksRange', value as [number])}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* 评分筛选 */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    最低评分: {(filters.ratingRange[0] / 100 * 5).toFixed(1)} 星
                  </Label>
                  <Slider
                    value={filters.ratingRange}
                    onValueChange={(value) => updateFilter('ratingRange', value as [number])}
                    max={100}
                    step={10}
                    className="w-full"
                  />
                </div>

                {/* 添加时间 */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">添加时间</Label>
                  <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部时间</SelectItem>
                      <SelectItem value="week">最近一周</SelectItem>
                      <SelectItem value="month">最近一个月</SelectItem>
                      <SelectItem value="year">最近一年</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 语言筛选 */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">语言</Label>
                  <Select value={filters.languageFilter} onValueChange={(value) => updateFilter('languageFilter', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部语言</SelectItem>
                      {languages.map(lang => (
                        <SelectItem key={lang} value={lang!}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 排序 */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">排序方式</Label>
                  <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">默认排序</SelectItem>
                      <SelectItem value="name">按名称排序</SelectItem>
                      <SelectItem value="clicks">按访问量排序</SelectItem>
                      <SelectItem value="date">按添加时间排序</SelectItem>
                      <SelectItem value="rating">按评分排序</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* 筛选统计 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    筛选统计
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">匹配网站</span>
                    <span>{filteredWebsites.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">总网站数</span>
                    <span>{websites.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">匹配率</span>
                    <span>{((filteredWebsites.length / websites.length) * 100).toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* 重置按钮 */}
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  onClick={clearAllFilters}
                  className="w-full gap-2"
                >
                  <X className="w-4 h-4" />
                  清除所有筛选
                </Button>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* 主内容区域 */}
        <div className="flex-1 p-6">
          {filteredWebsites.length > 0 ? (
            <div className={
              filters.viewType === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                <Filter className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg mb-2">没有找到匹配的网站</h3>
              <p className="text-muted-foreground mb-4">
                请尝试调整筛选条件
              </p>
              <Button onClick={clearAllFilters} className="gap-2">
                <X className="w-4 h-4" />
                清除筛选条件
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useState, useMemo } from 'react';
import { Website, Tag } from '../types/website';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  Search, 
  Filter, 
  X, 
  Star,
  DollarSign,
  Eye,
  Calendar,
  Globe,
  RotateCcw
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

interface FilterState {
  searchQuery: string;
  selectedTags: string[];
  selectedCategories: string[]; // 新增：选中的分类
  showFeatured: boolean;
  isPaidFilter: string; // 'all' | 'free' | 'paid'
  clicksRange: [number, number];
  dateRange: string; // 'all' | 'week' | 'month' | 'year'
  ratingRange: [number, number];
  languageFilter: string;
  sortBy: string;
}

interface AdvancedFilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  websites: Website[];
  onFiltersChange: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

export function AdvancedFilterSidebar({
  isOpen,
  onClose,
  websites,
  onFiltersChange,
  initialFilters = {}
}: AdvancedFilterSidebarProps) {
  // 获取动态范围
  const dynamicClicksRange = useMemo((): [number, number] => {
    const clicks = websites.map(w => w.clicks || 0);
    return clicks.length > 0 ? [Math.min(...clicks), Math.max(...clicks)] : [0, 100000];
  }, [websites]);

  const dynamicRatingRange = useMemo((): [number, number] => {
    const ratings = websites.map(w => w.rating || 0).filter(r => r > 0);
    return ratings.length > 0 ? [Math.min(...ratings), Math.max(...ratings)] : [0, 5];
  }, [websites]);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedTags: [],
    selectedCategories: [],
    showFeatured: false,
    isPaidFilter: 'all',
    clicksRange: dynamicClicksRange,
    dateRange: 'all',
    ratingRange: dynamicRatingRange,
    languageFilter: 'all',
    sortBy: 'default',
    ...initialFilters
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
      if (count > 0) {
        acc[category].push({ ...tag, count });
      }
      return acc;
    }, {} as Record<string, (Tag & { count: number })[]>);

    // 对每个分类内的标签按计数排序
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => b.count - a.count);
    });

    return grouped;
  }, [websites]);

  // 获取点击量范围
  const clicksRange = useMemo(() => {
    const clicks = websites.map(w => w.clicks || 0);
    if (clicks.length === 0) return [0, 100000];
    return [Math.min(...clicks), Math.max(...clicks)];
  }, [websites]);

  // 获取评分范围
  const ratingRange = useMemo(() => {
    const ratings = websites.map(w => w.rating || 0).filter(r => r > 0);
    if (ratings.length === 0) return [0, 5];
    return [Math.min(...ratings), Math.max(...ratings)];
  }, [websites]);

  // 获取语言选项
  const languageOptions = useMemo(() => {
    const languages = new Set(websites.map(w => w.language).filter(Boolean));
    return Array.from(languages).sort();
  }, [websites]);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      searchQuery: '',
      selectedTags: [],
      selectedCategories: [],
      showFeatured: false,
      isPaidFilter: 'all',
      clicksRange: dynamicClicksRange,
      dateRange: 'all',
      ratingRange: dynamicRatingRange,
      languageFilter: 'all',
      sortBy: 'default'
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const toggleTag = (tagName: string) => {
    const newTags = filters.selectedTags.includes(tagName)
      ? filters.selectedTags.filter(t => t !== tagName)
      : [...filters.selectedTags, tagName];
    updateFilters({ selectedTags: newTags });
  };

  const toggleCategoryFilter = (category: string) => {
    const newCategories = filters.selectedCategories.includes(category)
      ? filters.selectedCategories.filter(c => c !== category)
      : [...filters.selectedCategories, category];
    updateFilters({ selectedCategories: newCategories });
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

  const hasActiveFilters = filters.searchQuery || 
    filters.selectedTags.length > 0 || 
    filters.selectedCategories.length > 0 ||
    filters.showFeatured || 
    filters.isPaidFilter !== 'all' ||
    filters.clicksRange[0] > 0 ||
    filters.clicksRange[1] < 100000 ||
    filters.dateRange !== 'all' ||
    filters.ratingRange[0] > 0 ||
    filters.ratingRange[1] < 5 ||
    filters.languageFilter !== 'all';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            高级筛选
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6 pb-6">
            {/* 搜索 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  搜索
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Input
                  placeholder="搜索网站名称、描述..."
                  value={filters.searchQuery}
                  onChange={(e) => updateFilters({ searchQuery: e.target.value })}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* 标签筛选 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  标签筛选
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {Object.entries(tagsByCategory).map(([category, tags]) => (
                  <Collapsible
                    key={category}
                    open={expandedCategories.has(category)}
                    onOpenChange={() => toggleCategory(category)}
                  >
                    <div className="flex items-center gap-2">
                      <Button
                        variant={filters.selectedCategories.includes(category) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleCategoryFilter(category)}
                        className="flex-shrink-0 text-xs h-7"
                      >
                        {filters.selectedCategories.includes(category) ? '✓' : '+'} {category}
                      </Button>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="flex-1 justify-between p-2 h-auto"
                        >
                          <span className="text-xs text-muted-foreground">
                            {tags.length} 个标签
                          </span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-1">
                        {tags.map(tag => (
                          <Button
                            key={tag.id}
                            variant={filters.selectedTags.includes(tag.name) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleTag(tag.name)}
                            className="justify-start text-xs h-8"
                            style={filters.selectedTags.includes(tag.name) ? {
                              backgroundColor: tag.color,
                              borderColor: tag.color,
                              color: 'white'
                            } : {
                              borderColor: tag.color + '40',
                              color: tag.color
                            }}
                          >
                            {tag.name}
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {tag.count}
                            </Badge>
                          </Button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>

            {/* 精选筛选 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  精选筛选
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={filters.showFeatured}
                    onCheckedChange={(checked) => updateFilters({ showFeatured: checked })}
                  />
                  <Label htmlFor="featured" className="text-sm">
                    只显示精选网站
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* 付费筛选 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  付费筛选
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Select
                  value={filters.isPaidFilter}
                  onValueChange={(value) => updateFilters({ isPaidFilter: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="free">免费</SelectItem>
                    <SelectItem value="paid">付费</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* 点击量筛选 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  点击量范围
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    {filters.clicksRange[0].toLocaleString()} - {filters.clicksRange[1].toLocaleString()}
                  </Label>
                  <Slider
                    value={filters.clicksRange}
                    onValueChange={(value) => updateFilters({ clicksRange: value as [number, number] })}
                    min={clicksRange[0]}
                    max={clicksRange[1]}
                    step={100}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 评分筛选 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  评分范围
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    {filters.ratingRange[0]} - {filters.ratingRange[1]} 星
                  </Label>
                  <Slider
                    value={filters.ratingRange}
                    onValueChange={(value) => updateFilters({ ratingRange: value as [number, number] })}
                    min={ratingRange[0]}
                    max={ratingRange[1]}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 添加时间筛选 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  添加时间
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Select
                  value={filters.dateRange}
                  onValueChange={(value) => updateFilters({ dateRange: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部时间</SelectItem>
                    <SelectItem value="week">最近一周</SelectItem>
                    <SelectItem value="month">最近一月</SelectItem>
                    <SelectItem value="year">最近一年</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* 语言筛选 */}
            {languageOptions.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    语言筛选
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Select
                    value={filters.languageFilter}
                    onValueChange={(value) => updateFilters({ languageFilter: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部语言</SelectItem>
                      {languageOptions.map(lang => (
                        <SelectItem key={lang} value={lang || ''}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {/* 排序方式 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">排序方式</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => updateFilters({ sortBy: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">默认排序</SelectItem>
                    <SelectItem value="name">按名称排序</SelectItem>
                    <SelectItem value="clicks">按点击量排序</SelectItem>
                    <SelectItem value="rating">按评分排序</SelectItem>
                    <SelectItem value="date">按添加时间排序</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <div className="space-y-2">
              <Button
                onClick={clearAllFilters}
                variant="outline"
                className="w-full gap-2"
                disabled={!hasActiveFilters}
              >
                <RotateCcw className="w-4 h-4" />
                清除所有筛选
              </Button>
              <Button
                onClick={onClose}
                className="w-full"
              >
                应用筛选
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

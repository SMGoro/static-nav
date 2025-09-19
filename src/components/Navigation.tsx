import React, { useState, useMemo } from 'react';
import { Website } from '../types/website';
import { WebsiteCard } from './website/website-card';
import { Pagination } from './Pagination';
import { AdvancedFilterSidebar } from './advanced-filter-sidebar';
import { useI18n } from '../contexts/i18n-context';
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
  Tag as TagIcon,
  Share
} from 'lucide-react';

import { mockTags, tagCategories } from '../data/mock-data';
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

interface FilterState {
  searchQuery: string;
  selectedTags: string[];
  selectedCategories: string[];
  showFeatured: boolean;
  isPaidFilter: string;
  clicksRange: [number, number];
  dateRange: string;
  ratingRange: [number, number];
  languageFilter: string;
  sortBy: string;
}

interface NavigationProps {
  websites: Website[];
  onAddWebsite: () => void;
  onEditWebsite: (website: Website) => void;
  onDeleteWebsite: (id: string) => void;
  onViewWebsite: (website: Website) => void;
  onShareWebsite: (website: Website) => void;
  onCreateShare?: () => void;
}

export function Navigation({
  websites,
  onAddWebsite,
  onEditWebsite,
  onDeleteWebsite,
  onViewWebsite,
  onShareWebsite,
  onCreateShare
}: NavigationProps) {
  const { t } = useI18n();
  // 高级筛选状态
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    searchQuery: '',
    selectedTags: [],
    selectedCategories: [],
    showFeatured: false,
    isPaidFilter: 'all',
    clicksRange: [0, 100000],
    dateRange: 'all',
    ratingRange: [0, 5],
    languageFilter: 'all',
    sortBy: 'default'
  });

  // 基础状态
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<ViewType>('grid');
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);


  // 处理高级筛选更新
  const handleAdvancedFiltersChange = (newFilters: FilterState) => {
    setAdvancedFilters(newFilters);
    setSearchQuery(newFilters.searchQuery);
    setCurrentPage(1);
  };

  // 获取动态范围
  const dynamicClicksRange = useMemo((): [number, number] => {
    const clicks = websites.map(w => w.clicks || 0);
    return clicks.length > 0 ? [Math.min(...clicks), Math.max(...clicks)] : [0, 100000];
  }, [websites]);

  const dynamicRatingRange = useMemo((): [number, number] => {
    const ratings = websites.map(w => w.rating || 0).filter(r => r > 0);
    return ratings.length > 0 ? [Math.min(...ratings), Math.max(...ratings)] : [0, 5];
  }, [websites]);

  const clearFilters = () => {
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
    setAdvancedFilters(clearedFilters);
    setSearchQuery('');
    setCurrentPage(1);
  };

  // 过滤和排序网站
  const allFilteredWebsites = useMemo(() => {
    const filters = advancedFilters;
    
    const filtered = websites.filter(website => {
      // 搜索匹配
      const matchesSearch = !filters.searchQuery || 
        website.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        website.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        website.tags.some(tag => tag.toLowerCase().includes(filters.searchQuery.toLowerCase()));
      
      // 标签匹配
      const matchesTags = filters.selectedTags.length === 0 || 
        filters.selectedTags.every(tag => website.tags.includes(tag));
      
      // 分类匹配 - 如果选中了分类，则显示该分类下所有标签的网站
      const matchesCategories = filters.selectedCategories.length === 0 || 
        filters.selectedCategories.some(categoryName => {
          const category = tagCategories.find(cat => cat.name === categoryName);
          if (!category) return false;
          
          // 获取该分类下的所有标签名称
          const categoryTagNames = category.tagIds.map(tagId => {
            const tag = mockTags.find(t => t.id === tagId);
            return tag?.name;
          }).filter(Boolean);
          
          // 检查网站是否包含该分类下的任何标签
          return categoryTagNames.some(tagName => tagName && website.tags.includes(tagName));
        });
      
      // 精选匹配
      const matchesFeatured = !filters.showFeatured || website.featured;
      
      // 付费状态匹配
      const matchesPaid = filters.isPaidFilter === 'all' || 
        (filters.isPaidFilter === 'free' && !website.isPaid) ||
        (filters.isPaidFilter === 'paid' && website.isPaid);
      
      // 点击量匹配
      const clicks = website.clicks || 0;
      const matchesClicks = clicks >= filters.clicksRange[0] && clicks <= filters.clicksRange[1];
      
      // 评分匹配
      const rating = website.rating || 0;
      const matchesRating = rating >= filters.ratingRange[0] && rating <= filters.ratingRange[1];
      
      // 添加时间匹配
      const matchesDate = filters.dateRange === 'all' || (() => {
        const addedDate = new Date(website.addedDate);
        const now = new Date();
        const diffTime = now.getTime() - addedDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (filters.dateRange) {
          case 'week': return diffDays <= 7;
          case 'month': return diffDays <= 30;
          case 'year': return diffDays <= 365;
          default: return true;
        }
      })();
      
      // 语言匹配
      const matchesLanguage = filters.languageFilter === 'all' || 
        website.language === filters.languageFilter;
      
      return matchesSearch && matchesTags && matchesCategories && matchesFeatured && matchesPaid && 
             matchesClicks && matchesRating && matchesDate && matchesLanguage;
    });

    // 排序
    switch (filters.sortBy) {
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'clicks':
        filtered.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'date':
        filtered.sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());
        break;
      default:
        break;
    }

    return filtered;
  }, [websites, advancedFilters]);

  // 分页计算
  const totalPages = Math.ceil(allFilteredWebsites.length / itemsPerPage);
  const paginatedWebsites = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return allFilteredWebsites.slice(startIndex, startIndex + itemsPerPage);
  }, [allFilteredWebsites, currentPage, itemsPerPage]);

  // 当筛选条件改变时重置到第一页
  const resetToFirstPage = () => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  // 监听筛选条件变化
  React.useEffect(() => {
    resetToFirstPage();
  }, [advancedFilters, itemsPerPage]);

  // 监听localStorage中的标签和分类筛选
  React.useEffect(() => {
    const filterByTag = localStorage.getItem('filterByTag');
    const filterByCategory = localStorage.getItem('filterByCategory');
    
    if (filterByTag) {
      handleAdvancedFiltersChange({
        ...advancedFilters,
        selectedTags: [filterByTag]
      });
      localStorage.removeItem('filterByTag');
    }
    
    if (filterByCategory) {
      // 获取该分类下的所有标签
      const categoryTags = websites
        .filter(website => website.tags.some(tag => {
          // 这里需要根据实际的分类逻辑来筛选
          // 暂时使用简单的标签匹配
          return tag === filterByCategory;
        }))
        .flatMap(website => website.tags)
        .filter((tag, index, array) => array.indexOf(tag) === index); // 去重
      
      handleAdvancedFiltersChange({
        ...advancedFilters,
        selectedTags: categoryTags
      });
      localStorage.removeItem('filterByCategory');
    }
  }, []);

  // 分页处理函数
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const hasActiveFilters = advancedFilters.searchQuery || 
    advancedFilters.selectedTags.length > 0 || 
    advancedFilters.showFeatured ||
    advancedFilters.isPaidFilter !== 'all' ||
    advancedFilters.clicksRange[0] > dynamicClicksRange[0] ||
    advancedFilters.clicksRange[1] < dynamicClicksRange[1] ||
    advancedFilters.dateRange !== 'all' ||
    advancedFilters.ratingRange[0] > dynamicRatingRange[0] ||
    advancedFilters.ratingRange[1] < dynamicRatingRange[1] ||
    advancedFilters.languageFilter !== 'all';

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* 页面标题和操作按钮 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <h2 className="text-lg sm:text-xl">网站导航</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            发现优质网站资源，提升工作效率
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onCreateShare && (
            <Button variant="outline" onClick={onCreateShare} className="gap-2 text-sm">
              <Share className="w-4 h-4" />
              <span className="hidden sm:inline">创建分享</span>
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => setShowAdvancedFilter(true)} 
            className="gap-2 text-sm"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">高级筛选</span>
          </Button>
          <Button variant="outline" onClick={onAddWebsite} className="gap-2 shadow-lg text-sm">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">添加网站</span>
          </Button>
        </div>
      </div>

      {/* 搜索区域 */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* 搜索控件 */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={t('common.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-input-background border-border"
                />
              </div>
              
              <div className="flex flex-wrap gap-2 sm:gap-4">
                <div className="flex border rounded-lg p-1">
                  <Button
                    variant={viewType === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewType('grid')}
                    className="px-2 sm:px-3"
                    title={t('common.grid')}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewType === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewType('list')}
                    className="px-2 sm:px-3"
                    title={t('common.list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* 已选择的筛选条件显示 */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">已选择:</span>
                {advancedFilters.showFeatured && (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="w-3 h-3" />
                    精选
                    <X className="w-3 h-3 cursor-pointer" onClick={() => handleAdvancedFiltersChange({...advancedFilters, showFeatured: false})} />
                  </Badge>
                )}
                {advancedFilters.selectedTags.map(tagName => (
                  <Badge
                    key={tagName}
                    variant="secondary"
                    className="gap-1 cursor-pointer"
                  >
                    {tagName}
                    <X className="w-3 h-3" onClick={() => {
                      const newTags = advancedFilters.selectedTags.filter(t => t !== tagName);
                      handleAdvancedFiltersChange({...advancedFilters, selectedTags: newTags});
                    }} />
                  </Badge>
                ))}
                {advancedFilters.isPaidFilter !== 'all' && (
                  <Badge variant="outline" className="gap-1">
                    {advancedFilters.isPaidFilter === 'free' ? t('common.free') : t('common.paid')}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => handleAdvancedFiltersChange({...advancedFilters, isPaidFilter: 'all'})} />
                  </Badge>
                )}
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
                显示 {allFilteredWebsites.length} 个网站
                {hasActiveFilters && <span> （已筛选）</span>}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 网站卡片网格 */}
      {allFilteredWebsites.length > 0 ? (
        <>
          <div className={
            viewType === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-6"
              : "space-y-2"
          }>
            {paginatedWebsites.map((website) => (
              <WebsiteCard
                key={website.id}
                website={website}
                onEdit={onEditWebsite}
                onDelete={onDeleteWebsite}
                onView={onViewWebsite}
                onShare={onShareWebsite}
                viewType={viewType}
              />
            ))}
          </div>
          
          {/* 分页组件 */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={allFilteredWebsites.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg mb-2">{t('messages.noResults')}</h3>
          <p className="text-muted-foreground mb-4">
            {hasActiveFilters ? t('messages.noResults') : t('messages.noData')}
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

      {/* 高级筛选侧边栏 */}
      <AdvancedFilterSidebar
        isOpen={showAdvancedFilter}
        onClose={() => setShowAdvancedFilter(false)}
        websites={websites}
        onFiltersChange={handleAdvancedFiltersChange}
        initialFilters={advancedFilters}
      />
    </div>
  );
}
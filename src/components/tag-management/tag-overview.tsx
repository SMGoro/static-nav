import React from 'react';
import { Tag, Website } from '../../types/website';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { BarChart3, Users, TrendingUp, Layers, Tag as TagIcon } from 'lucide-react';

interface TagOverviewProps {
  tags: Tag[];
  websites: Website[];
  allWebsiteTags: Record<string, number>;
}

export function TagOverview({ tags, websites, allWebsiteTags }: TagOverviewProps) {
  const categories = Array.from(new Set(tags.map(t => t.category).filter(Boolean)));
  
  // 计算统计信息
  const totalWebsiteTags = Object.keys(allWebsiteTags).length;
  const totalTagUsage = Object.values(allWebsiteTags).reduce((sum, count) => sum + count, 0);
  const mostUsedTags = Object.entries(allWebsiteTags)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 总体统计 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">管理标签数</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tags.length}</div>
            <p className="text-xs text-muted-foreground">
              核心标签: {tags.filter(t => t.isCore).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">网站标签数</CardTitle>
            <TagIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWebsiteTags}</div>
            <p className="text-xs text-muted-foreground">
              总使用次数: {totalTagUsage}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">网站总数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{websites.length}</div>
            <p className="text-xs text-muted-foreground">
              平均标签数: {(websites.reduce((sum, w) => sum + w.tags.length, 0) / Math.max(websites.length, 1)).toFixed(1)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">分类总数</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              未分类: {tags.filter(t => !t.category).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 分类统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">分类统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categories.map(category => {
              const categoryTags = tags.filter(t => t.category === category);
              const totalWebsites = categoryTags.reduce((sum, tag) => 
                sum + (allWebsiteTags[tag.name] || 0), 0
              );
              return (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm">{category}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{categoryTags.length} 标签</Badge>
                    <Badge variant="outline">{totalWebsites} 网站</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 最常用标签 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">最常用标签</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mostUsedTags.map(([tagName, count]) => (
              <div key={tagName} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TagIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{tagName}</span>
                </div>
                <Badge variant="outline">{count} 个网站</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
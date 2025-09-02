import React from 'react';
import { Tag, TagRelation, Website } from '../../types/website';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { BarChart3, Users, TrendingUp, Layers } from 'lucide-react';

interface TagOverviewProps {
  tags: Tag[];
  relations: TagRelation[];
  websites: Website[];
}

export function TagOverview({ tags, relations, websites }: TagOverviewProps) {
  const categories = ['all', ...Array.from(new Set(tags.map(t => t.category)))];
  
  const relationTypes = [
    { value: 'similar', label: '相似', color: 'bg-blue-100 text-blue-800' },
    { value: 'parent', label: '父级', color: 'bg-green-100 text-green-800' },
    { value: 'child', label: '子级', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'complement', label: '互补', color: 'bg-purple-100 text-purple-800' },
    { value: 'alternative', label: '替代', color: 'bg-red-100 text-red-800' }
  ];

  const getTagStats = (tag: Tag) => {
    const websiteCount = websites.filter(w => w.tags.includes(tag.name)).length;
    const relatedCount = relations.filter(r => r.fromTagId === tag.id || r.toTagId === tag.id).length;
    const avgStrength = relations
      .filter(r => r.fromTagId === tag.id || r.toTagId === tag.id)
      .reduce((sum, r) => sum + r.strength, 0) / Math.max(relatedCount, 1);
    
    return { websiteCount, relatedCount, avgStrength };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* 总体统计 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">标签总数</CardTitle>
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
          <CardTitle className="text-sm font-medium">关联关系</CardTitle>
          <Layers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{relations.length}</div>
          <p className="text-xs text-muted-foreground">
            平均强度: {relations.length > 0 ? (relations.reduce((sum, r) => sum + r.strength, 0) / relations.length).toFixed(1) : '0'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">分类数量</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{categories.length - 1}</div>
          <p className="text-xs text-muted-foreground">
            最大分类: {Math.max(...categories.filter(c => c !== 'all').map(c => 
              tags.filter(t => t.category === c).length
            ))} 个标签
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">使用率</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {tags.length > 0 ? Math.round(tags.filter(t => getTagStats(t).websiteCount > 0).length / tags.length * 100) : 0}%
          </div>
          <p className="text-xs text-muted-foreground">
            {tags.filter(t => getTagStats(t).websiteCount > 0).length} 个标签被使用
          </p>
        </CardContent>
      </Card>

      {/* 分类统计 */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">分类统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categories.filter(c => c !== 'all').map(category => {
              const categoryTags = tags.filter(t => t.category === category);
              const totalWebsites = categoryTags.reduce((sum, tag) => 
                sum + getTagStats(tag).websiteCount, 0
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

      {/* 关系类型统计 */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">关系类型分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {relationTypes.map(type => {
              const count = relations.filter(r => r.relationType === type.value).length;
              const percentage = relations.length > 0 ? (count / relations.length * 100).toFixed(1) : '0';
              return (
                <div key={type.value} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={type.color}>{type.label}</Badge>
                    <span className="text-sm text-muted-foreground">{percentage}%</span>
                  </div>
                  <Badge variant="outline">{count}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

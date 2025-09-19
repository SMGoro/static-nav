import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Search, 
  Trash2, 
  CheckCircle, 
  Copy, 
  ExternalLink,
  Star,
  Clock,
  Eye
} from 'lucide-react';
import { Website } from '../../types/website';
import { dataManager } from '../../utils/data-manager';

interface DuplicateGroup {
  [key: string]: Website[];
}

interface DuplicateManagerProps {
  websites: Website[];
  onWebsitesUpdate: (websites: Website[]) => void;
}

export function DuplicateManager({ websites, onWebsitesUpdate }: DuplicateManagerProps) {
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup>({});
  const [selectedForDeletion, setSelectedForDeletion] = useState<Set<string>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // 分析重复网站
  const analyzeDuplicates = async () => {
    setIsAnalyzing(true);
    try {
      // 使用dataManager的重复检测方法
      const duplicates = dataManager.findDuplicateWebsites(websites);
      setDuplicateGroups(duplicates);
      setAnalysisComplete(true);
      
      // 自动选择推荐删除的网站
      const autoSelected = new Set<string>();
      Object.values(duplicates).forEach(group => {
        if (group.length > 1) {
          const recommended = dataManager.getRecommendedWebsite(group);
          // 选择除推荐网站外的所有网站进行删除
          group.forEach(site => {
            if (site.id !== recommended.id) {
              autoSelected.add(site.id);
            }
          });
        }
      });
      setSelectedForDeletion(autoSelected);
    } catch (error) {
      console.error('分析重复网站失败:', error);
      alert('分析重复网站失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 删除选中的重复网站
  const deleteSelectedDuplicates = async () => {
    if (selectedForDeletion.size === 0) {
      alert('请选择要删除的网站');
      return;
    }

    const confirmMessage = `确定要删除 ${selectedForDeletion.size} 个重复网站吗？此操作不可撤销。`;
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    try {
      const updatedWebsites = websites.filter(site => !selectedForDeletion.has(site.id));
      onWebsitesUpdate(updatedWebsites);
      
      // 重新分析
      await analyzeDuplicates();
      
      alert(`成功删除 ${selectedForDeletion.size} 个重复网站`);
      setSelectedForDeletion(new Set());
    } catch (error) {
      console.error('删除重复网站失败:', error);
      alert('删除重复网站失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsDeleting(false);
    }
  };

  // 切换网站选择状态
  const toggleWebsiteSelection = (websiteId: string) => {
    const newSelected = new Set(selectedForDeletion);
    if (newSelected.has(websiteId)) {
      newSelected.delete(websiteId);
    } else {
      newSelected.add(websiteId);
    }
    setSelectedForDeletion(newSelected);
  };

  // 选择整个组
  const selectGroup = (group: Website[], selectAll: boolean) => {
    const newSelected = new Set(selectedForDeletion);
    if (selectAll) {
      group.forEach(site => newSelected.add(site.id));
    } else {
      group.forEach(site => newSelected.delete(site.id));
    }
    setSelectedForDeletion(newSelected);
  };

  // 获取网站的推荐标记
  const isRecommended = (website: Website, group: Website[]) => {
    const recommended = dataManager.getRecommendedWebsite(group);
    return website.id === recommended.id;
  };

  // 格式化网站信息
  const formatWebsiteInfo = (website: Website) => {
    const info = [];
    if (website.featured) info.push('精选');
    if (website.clicks > 0) info.push(`${website.clicks} 点击`);
    if (website.addedDate) {
      const date = new Date(website.addedDate);
      info.push(`添加于 ${date.toLocaleDateString()}`);
    }
    return info.join(' • ');
  };

  const duplicateGroupsArray = Object.entries(duplicateGroups);
  const totalDuplicates = duplicateGroupsArray.reduce((sum, [_, group]) => sum + group.length - 1, 0);

  return (
    <div className="space-y-6">
      {/* 分析控制 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            重复网站检测
          </CardTitle>
          <CardDescription>
            检测并管理重复的网站条目，基于URL和标题进行智能匹配
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={analyzeDuplicates}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              {isAnalyzing ? '分析中...' : '开始分析'}
            </Button>
            
            {analysisComplete && (
              <div className="flex items-center gap-4">
                <Badge variant={totalDuplicates > 0 ? "destructive" : "default"}>
                  {totalDuplicates > 0 ? `发现 ${totalDuplicates} 个重复网站` : '未发现重复网站'}
                </Badge>
                
                {totalDuplicates > 0 && (
                  <Button 
                    onClick={deleteSelectedDuplicates}
                    disabled={isDeleting || selectedForDeletion.size === 0}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    删除选中的 ({selectedForDeletion.size})
                  </Button>
                )}
              </div>
            )}
          </div>

          {analysisComplete && totalDuplicates === 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                太好了！没有发现重复的网站。您的数据库很干净。
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 重复网站列表 */}
      {analysisComplete && totalDuplicates > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5" />
              重复网站组 ({duplicateGroupsArray.length})
            </CardTitle>
            <CardDescription>
              每组显示相似的网站，推荐保留的网站已标记。您可以选择要删除的网站。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {duplicateGroupsArray.map(([groupKey, group], groupIndex) => (
                <div key={groupKey} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-lg">
                      重复组 {groupIndex + 1} ({group.length} 个网站)
                    </h4>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectGroup(group, true)}
                      >
                        全选
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectGroup(group, false)}
                      >
                        全不选
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {group.map((website) => {
                      const recommended = isRecommended(website, group);
                      const selected = selectedForDeletion.has(website.id);
                      
                      return (
                        <div
                          key={website.id}
                          className={`flex items-start gap-3 p-3 border rounded-lg ${
                            recommended ? 'border-green-200 bg-green-50' : 
                            selected ? 'border-red-200 bg-red-50' : 'border-gray-200'
                          }`}
                        >
                          <Checkbox
                            checked={selected}
                            onCheckedChange={() => toggleWebsiteSelection(website.id)}
                            disabled={recommended}
                          />
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h5 className="font-medium flex items-center gap-2">
                                  {website.title}
                                  {recommended && (
                                    <Badge variant="default" className="bg-green-100 text-green-800">
                                      <Star className="h-3 w-3 mr-1" />
                                      推荐保留
                                    </Badge>
                                  )}
                                  {website.featured && (
                                    <Badge variant="secondary">
                                      精选
                                    </Badge>
                                  )}
                                </h5>
                                <p className="text-sm text-muted-foreground">
                                  {website.url}
                                </p>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(website.url, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {website.clicks} 点击
                              </span>
                              {website.addedDate && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(website.addedDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              {website.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {website.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{website.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                            
                            {website.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {website.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

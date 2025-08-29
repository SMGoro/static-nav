import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Plus, 
  CheckCircle, 
  AlertTriangle, 
  Globe, 
  Copy,
  ExternalLink,
  Info
} from 'lucide-react';
import { AIWebsiteRecommendation } from '../services/aiService';
import { Website } from '../types/website';
import { dataManager } from '../utils/dataManager';

interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingWebsite?: Website;
  reason: 'url' | 'title' | 'none';
}

interface BatchAddDialogProps {
  isOpen: boolean;
  onClose: () => void;
  websites: AIWebsiteRecommendation[];
  onAddWebsites: (websites: Omit<Website, 'id'>[]) => void;
}

export function BatchAddDialog({ isOpen, onClose, websites, onAddWebsites }: BatchAddDialogProps) {
  const [selectedWebsites, setSelectedWebsites] = useState<Set<number>>(new Set());
  const [duplicateResults, setDuplicateResults] = useState<DuplicateCheckResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  // 检查重复内容
  useEffect(() => {
    if (isOpen && websites.length > 0) {
      setIsChecking(true);
      const results = websites.map(website => checkDuplicate(website));
      setDuplicateResults(results);
      setIsChecking(false);
    }
  }, [isOpen, websites]);

  const checkDuplicate = (website: AIWebsiteRecommendation): DuplicateCheckResult => {
    const existingData = dataManager.getLocalData();
    
    // 检查URL重复
    const urlDuplicate = existingData.websites.find(existing => 
      existing.url.toLowerCase() === website.url.toLowerCase()
    );
    if (urlDuplicate) {
      return { isDuplicate: true, existingWebsite: urlDuplicate, reason: 'url' };
    }
    
    // 检查标题重复
    const titleDuplicate = existingData.websites.find(existing => 
      existing.title.toLowerCase() === website.title.toLowerCase()
    );
    if (titleDuplicate) {
      return { isDuplicate: true, existingWebsite: titleDuplicate, reason: 'title' };
    }
    
    return { isDuplicate: false, reason: 'none' };
  };

  const toggleWebsite = (index: number) => {
    const newSelected = new Set(selectedWebsites);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedWebsites(newSelected);
  };

  const selectAll = () => {
    const newSelected = new Set(websites.map((_, index) => index));
    setSelectedWebsites(newSelected);
  };

  const selectNone = () => {
    setSelectedWebsites(new Set());
  };

  const selectNewOnly = () => {
    const newSelected = new Set(
      websites
        .map((_, index) => ({ index, isDuplicate: duplicateResults[index]?.isDuplicate }))
        .filter(item => !item.isDuplicate)
        .map(item => item.index)
    );
    setSelectedWebsites(newSelected);
  };

  const handleAddSelected = () => {
    const selectedWebsitesList = Array.from(selectedWebsites).map(index => websites[index]);
    const websitesToAdd = selectedWebsitesList.map(website => ({
      title: website.title,
      description: website.description,
      url: website.url,
      icon: website.icon || '🌐',
      tags: website.tags,
      category: website.category,
      addedDate: new Date().toISOString(),
      clicks: 0,
      featured: false,
      fullDescription: website.fullDescription,
      features: website.features,
      language: website.language,
      isPaid: website.isPaid,
      authoredBy: website.authoredBy,
      isBuiltIn: false,
      slug: generateSlug(website.title)
    }));
    
    onAddWebsites(websitesToAdd);
    onClose();
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const newWebsites = websites.filter((_, index) => !duplicateResults[index]?.isDuplicate);
  const duplicateWebsites = websites.filter((_, index) => duplicateResults[index]?.isDuplicate);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            批量添加网站
          </DialogTitle>
          <DialogDescription>
            选择要添加到导航的网站，系统已自动检测重复内容
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 统计信息 */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">{newWebsites.length}</div>
                    <div className="text-sm text-muted-foreground">新网站</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="text-2xl font-bold">{duplicateWebsites.length}</div>
                    <div className="text-sm text-muted-foreground">重复网站</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">{selectedWebsites.size}</div>
                    <div className="text-sm text-muted-foreground">已选择</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 快速选择按钮 */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              全选
            </Button>
            <Button variant="outline" size="sm" onClick={selectNone}>
              全不选
            </Button>
            <Button variant="outline" size="sm" onClick={selectNewOnly}>
              仅选择新网站
            </Button>
          </div>

          {/* 网站列表 */}
          <Tabs defaultValue="new" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new" className="gap-2">
                <Plus className="w-4 h-4" />
                新网站 ({newWebsites.length})
              </TabsTrigger>
              <TabsTrigger value="duplicates" className="gap-2">
                <AlertTriangle className="w-4 h-4" />
                重复网站 ({duplicateWebsites.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="space-y-3">
              {isChecking ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">检查重复内容中...</p>
                </div>
              ) : newWebsites.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>没有新的网站可以添加</p>
                </div>
              ) : (
                newWebsites.map((website, index) => {
                  const originalIndex = websites.findIndex(w => w.url === website.url);
                  return (
                    <div key={`new-${website.title}-${website.url}-${originalIndex}`} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedWebsites.has(originalIndex)}
                          onCheckedChange={() => toggleWebsite(originalIndex)}
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{website.icon}</span>
                              <div>
                                <h4 className="font-medium">{website.title}</h4>
                                <p className="text-sm text-muted-foreground">{website.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">{website.category}</Badge>
                              {website.isPaid && (
                                <Badge variant="outline" className="text-xs">付费</Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-3 flex items-center gap-4">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Globe className="w-3 h-3" />
                              <span className="truncate max-w-48">{website.url}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(website.url, '_blank')}
                              className="h-6 px-2 text-xs"
                            >
                              <ExternalLink className="w-3 h-3" />
                              预览
                            </Button>
                          </div>
                          
                          <div className="mt-2 flex flex-wrap gap-1">
                            {website.tags.slice(0, 4).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {website.tags.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{website.tags.length - 4}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="duplicates" className="space-y-3">
              {duplicateWebsites.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>没有重复的网站</p>
                </div>
              ) : (
                duplicateWebsites.map((website, index) => {
                  const originalIndex = websites.findIndex(w => w.url === website.url);
                  const duplicateResult = duplicateResults[originalIndex];
                  const existingWebsite = duplicateResult?.existingWebsite;
                  
                  return (
                    <div key={`duplicate-${website.title}-${website.url}-${originalIndex}`} className="border rounded-lg p-4 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedWebsites.has(originalIndex)}
                          onCheckedChange={() => toggleWebsite(originalIndex)}
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{website.icon}</span>
                              <div>
                                <h4 className="font-medium">{website.title}</h4>
                                <p className="text-sm text-muted-foreground">{website.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive" className="text-xs">
                                {duplicateResult?.reason === 'url' ? 'URL重复' : '标题重复'}
                              </Badge>
                            </div>
                          </div>
                          
                          {existingWebsite && (
                            <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border">
                              <div className="flex items-center gap-2 mb-2">
                                <Info className="w-4 h-4 text-orange-500" />
                                <span className="text-sm font-medium">已存在的网站：</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{existingWebsite.icon}</span>
                                <div>
                                  <p className="text-sm font-medium">{existingWebsite.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    添加时间：{new Date(existingWebsite.addedDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-3 flex items-center gap-4">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Globe className="w-3 h-3" />
                              <span className="truncate max-w-48">{website.url}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(website.url, '_blank')}
                              className="h-6 px-2 text-xs"
                            >
                              <ExternalLink className="w-3 h-3" />
                              预览
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>
          </Tabs>

          {/* 操作按钮 */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button 
              onClick={handleAddSelected}
              disabled={selectedWebsites.size === 0}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              添加选中的网站 ({selectedWebsites.size})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

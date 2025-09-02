import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { 
  Search, 
  Edit, 
  Trash2, 
  Star, 
  StarOff, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  Download,
  Save,
  X
} from 'lucide-react';
import { Website, Tag } from '../../types/website';
import { dataManager } from '../../utils/data-manager';

interface BatchWebsiteManagerProps {
  websites: Website[];
  tags: Tag[];
  onWebsitesUpdate: (websites: Website[]) => void;
  onTagsUpdate: (tags: Tag[]) => void;
}

interface EditingWebsite extends Website {
  isEditing?: boolean;
}

const ITEMS_PER_PAGE = 20;

export function BatchWebsiteManager({ 
  websites, 
  tags, 
  onWebsitesUpdate
}: BatchWebsiteManagerProps) {
  // 状态管理
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedWebsites, setSelectedWebsites] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [editingWebsites, setEditingWebsites] = useState<EditingWebsite[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    tags: [] as string[],
    featured: undefined as boolean | undefined,
    description: ''
  });
  
  // 初始化编辑数据
  useEffect(() => {
    setEditingWebsites(websites.map(w => ({ ...w, isEditing: false })));
  }, [websites]);
  
  // 过滤和搜索
  const filteredWebsites = useMemo(() => {
    return editingWebsites.filter(website => {
      const matchesSearch = !searchTerm || 
        website.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        website.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        website.url.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTag = selectedTag === 'all' || website.tags.includes(selectedTag);
      
      return matchesSearch && matchesTag;
    });
  }, [editingWebsites, searchTerm, selectedTag]);
  
  // 分页
  const totalPages = Math.ceil(filteredWebsites.length / ITEMS_PER_PAGE);
  const paginatedWebsites = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredWebsites.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredWebsites, currentPage]);
  
  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageIds = new Set(paginatedWebsites.map(w => w.id));
      setSelectedWebsites(prev => new Set([...prev, ...currentPageIds]));
    } else {
      const currentPageIds = new Set(paginatedWebsites.map(w => w.id));
      setSelectedWebsites(prev => new Set([...prev].filter(id => !currentPageIds.has(id))));
    }
  };
  
  // 单个选择
  const handleSelectWebsite = (websiteId: string, checked: boolean) => {
    setSelectedWebsites(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(websiteId);
      } else {
        newSet.delete(websiteId);
      }
      return newSet;
    });
  };
  
  // 开始编辑
  const startEditing = (websiteId: string) => {
    setEditingWebsites(prev => 
      prev.map(w => w.id === websiteId ? { ...w, isEditing: true } : w)
    );
  };
  
  // 取消编辑
  const cancelEditing = (websiteId: string) => {
    setEditingWebsites(prev => 
      prev.map(w => {
        if (w.id === websiteId) {
          const original = websites.find(orig => orig.id === websiteId);
          return original ? { ...original, isEditing: false } : w;
        }
        return w;
      })
    );
  };
  
  // 保存编辑
  const saveEditing = (websiteId: string) => {
    const editedWebsite = editingWebsites.find(w => w.id === websiteId);
    if (!editedWebsite) return;
    
    const updatedWebsites = websites.map(w => 
      w.id === websiteId 
        ? { ...editedWebsite, isEditing: false, lastUpdated: new Date().toISOString() }
        : w
    );
    
    onWebsitesUpdate(updatedWebsites);
    setEditingWebsites(prev => 
      prev.map(w => w.id === websiteId ? { ...w, isEditing: false } : w)
    );
  };
  
  // 更新编辑中的网站
  const updateEditingWebsite = (websiteId: string, field: keyof Website, value: any) => {
    setEditingWebsites(prev => 
      prev.map(w => w.id === websiteId ? { ...w, [field]: value } : w)
    );
  };
  
  // 删除网站
  const deleteWebsites = (websiteIds: string[]) => {
    if (!confirm(`确定要删除选中的 ${websiteIds.length} 个网站吗？此操作不可恢复！`)) {
      return;
    }
    
    const updatedWebsites = websites.filter(w => !websiteIds.includes(w.id));
    onWebsitesUpdate(updatedWebsites);
    setSelectedWebsites(new Set());
  };
  
  // 批量编辑
  const applyBulkEdit = () => {
    const selectedIds = Array.from(selectedWebsites);
    const updatedWebsites = websites.map(website => {
      if (selectedIds.includes(website.id)) {
        const updates: Partial<Website> = {
          lastUpdated: new Date().toISOString()
        };
        
        if (bulkEditData.tags.length > 0) {
          updates.tags = [...new Set([...website.tags, ...bulkEditData.tags])];
        }
        
        if (bulkEditData.featured !== undefined) {
          updates.featured = bulkEditData.featured;
        }
        
        if (bulkEditData.description.trim()) {
          updates.description = bulkEditData.description.trim();
        }
        
        return { ...website, ...updates };
      }
      return website;
    });
    
    onWebsitesUpdate(updatedWebsites);
    setSelectedWebsites(new Set());
    setShowEditDialog(false);
    setBulkEditData({ tags: [], featured: undefined, description: '' });
  };
  
  // 切换精选状态
  const toggleFeatured = (websiteId: string) => {
    const updatedWebsites = websites.map(w => 
      w.id === websiteId 
        ? { ...w, featured: !w.featured, lastUpdated: new Date().toISOString() }
        : w
    );
    onWebsitesUpdate(updatedWebsites);
  };
  
  // 导出选中的网站
  const exportSelected = () => {
    const selectedIds = Array.from(selectedWebsites);
    const selectedWebsiteData = websites.filter(w => selectedIds.includes(w.id));
    
    dataManager.exportData({
      websites: selectedWebsiteData,
      tags,
      tagRelations: [],
      version: '1.0.0',
      lastUpdated: new Date().toISOString()
    }, `selected-websites-${new Date().toISOString().split('T')[0]}.json`);
  };
  
  const isAllCurrentPageSelected = paginatedWebsites.length > 0 && 
    paginatedWebsites.every(w => selectedWebsites.has(w.id));
  
  return (
    <div className="w-full max-w-none p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">批量管理网站</h1>
          <p className="text-muted-foreground mt-1">
            管理和编辑您的网站数据，支持批量操作和分页浏览
          </p>
        </div>
      </div>
      
      {/* 搜索和过滤 */}
      <Card>
        <CardHeader>
          <CardTitle>搜索和过滤</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="搜索网站标题、描述或URL..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="选择标签" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有标签</SelectItem>
                {tags.map(tag => (
                  <SelectItem key={tag.id} value={tag.name}>
                    {tag.name} ({tag.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            找到 {filteredWebsites.length} 个网站
            {selectedWebsites.size > 0 && ` · 已选择 ${selectedWebsites.size} 个`}
          </div>
        </CardContent>
      </Card>
      
      {/* 批量操作 */}
      {selectedWebsites.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>批量操作</CardTitle>
            <CardDescription>
              已选择 {selectedWebsites.size} 个网站
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    批量编辑
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>批量编辑网站</DialogTitle>
                    <DialogDescription>
                      对选中的 {selectedWebsites.size} 个网站进行批量编辑
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>添加标签</Label>
                      <Input
                        placeholder="输入标签名称，用逗号分隔"
                        value={bulkEditData.tags.join(', ')}
                        onChange={(e) => setBulkEditData(prev => ({
                          ...prev,
                          tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                        }))}
                      />
                    </div>
                    
                    <div>
                      <Label>精选状态</Label>
                      <Select 
                        value={bulkEditData.featured?.toString() || 'unchanged'} 
                        onValueChange={(value) => setBulkEditData(prev => ({
                          ...prev,
                          featured: value === 'unchanged' ? undefined : value === 'true'
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unchanged">保持不变</SelectItem>
                          <SelectItem value="true">设为精选</SelectItem>
                          <SelectItem value="false">取消精选</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>描述（留空保持不变）</Label>
                      <Textarea
                        placeholder="新的描述内容"
                        value={bulkEditData.description}
                        onChange={(e) => setBulkEditData(prev => ({
                          ...prev,
                          description: e.target.value
                        }))}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                      取消
                    </Button>
                    <Button onClick={applyBulkEdit}>
                      应用更改
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportSelected}
              >
                <Download className="w-4 h-4 mr-2" />
                导出选中
              </Button>
              
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => deleteWebsites(Array.from(selectedWebsites))}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                删除选中
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 网站列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>网站列表</CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isAllCurrentPageSelected}
                onCheckedChange={handleSelectAll}
              />
              <Label className="text-sm">全选当前页</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedWebsites.map(website => (
              <div key={website.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedWebsites.has(website.id)}
                    onCheckedChange={(checked) => handleSelectWebsite(website.id, checked as boolean)}
                  />
                  
                  <img 
                    src={website.icon} 
                    alt={website.title}
                    className="w-8 h-8 rounded flex-shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMEMzLjU4IDAgMCAzLjU4IDAgOFMzLjU4IDE2IDggMTZTMTYgMTIuNDIgMTYgOFMxMi40MiAwIDggMFpNOCAxNEMzLjU4IDE0IDIgMTIuNDIgMiA4UzMuNTggMiA4IDJTMTQgMy41OCAxNCA4UzEyLjQyIDE0IDggMTRaIiBmaWxsPSIjOTk5Ii8+Cjwvc3ZnPgo=';
                    }}
                  />
                  
                  <div className="flex-1 space-y-2">
                    {website.isEditing ? (
                      <div className="space-y-3">
                        <Input
                          value={website.title}
                          onChange={(e) => updateEditingWebsite(website.id, 'title', e.target.value)}
                          placeholder="网站标题"
                        />
                        <Input
                          value={website.url}
                          onChange={(e) => updateEditingWebsite(website.id, 'url', e.target.value)}
                          placeholder="网站URL"
                        />
                        <Textarea
                          value={website.description}
                          onChange={(e) => updateEditingWebsite(website.id, 'description', e.target.value)}
                          placeholder="网站描述"
                          rows={2}
                        />
                        <Input
                          value={website.tags.join(', ')}
                          onChange={(e) => updateEditingWebsite(website.id, 'tags', 
                            e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                          )}
                          placeholder="标签，用逗号分隔"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveEditing(website.id)}>
                            <Save className="w-4 h-4 mr-1" />
                            保存
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => cancelEditing(website.id)}>
                            <X className="w-4 h-4 mr-1" />
                            取消
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{website.title}</h3>
                          {website.featured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{website.description}</p>
                        <p className="text-xs text-muted-foreground">{website.url}</p>
                        <div className="flex flex-wrap gap-1">
                          {website.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {!website.isEditing && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleFeatured(website.id)}
                      >
                        {website.featured ? (
                          <StarOff className="w-4 h-4" />
                        ) : (
                          <Star className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditing(website.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteWebsites([website.id])}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                第 {currentPage} 页，共 {totalPages} 页 · 
                显示 {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredWebsites.length)} 
                / {filteredWebsites.length} 项
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  上一页
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  下一页
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

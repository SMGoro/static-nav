import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  Copy, 
  RefreshCw, 
  SkipForward,
  Globe,
  Tag as TagIcon,
  Info
} from 'lucide-react';
import { ShareData, DuplicateCheckResult } from '../utils/dataManager';

interface ImportConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shareData: ShareData | null;
  duplicateResult: DuplicateCheckResult | null;
  onImport: (replaceDuplicates: boolean) => void;
}

export function ImportConfirmDialog({ 
  isOpen, 
  onClose, 
  shareData, 
  duplicateResult, 
  onImport 
}: ImportConfirmDialogProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!shareData || !duplicateResult) return null;

  const handleImportNew = () => {
    onImport(false);
    onClose();
  };

  const handleImportReplace = () => {
    onImport(true);
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            导入确认
          </DialogTitle>
          <DialogDescription>
            检测到重复数据，请选择导入方式
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 概览信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">分享数据概览</CardTitle>
              <CardDescription>
                {shareData.message || '无标题分享'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {duplicateResult.newWebsites.length}
                  </div>
                  <div className="text-sm text-muted-foreground">新网站</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {duplicateResult.newTags.length}
                  </div>
                  <div className="text-sm text-muted-foreground">新标签</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {duplicateResult.duplicateWebsites.length}
                  </div>
                  <div className="text-sm text-muted-foreground">重复网站</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {duplicateResult.duplicateTags.length}
                  </div>
                  <div className="text-sm text-muted-foreground">重复标签</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 详细内容 */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">概览</TabsTrigger>
              <TabsTrigger value="new">新增内容</TabsTrigger>
              <TabsTrigger value="duplicates">重复内容</TabsTrigger>
              <TabsTrigger value="actions">操作</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  检测到 {duplicateResult.duplicateWebsites.length} 个重复网站和 {duplicateResult.duplicateTags.length} 个重复标签。
                  请选择如何处理这些重复数据。
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      新增内容 ({duplicateResult.newWebsites.length + duplicateResult.newTags.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{duplicateResult.newWebsites.length} 个新网站</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TagIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{duplicateResult.newTags.length} 个新标签</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                      重复内容 ({duplicateResult.duplicateWebsites.length + duplicateResult.duplicateTags.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{duplicateResult.duplicateWebsites.length} 个重复网站</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TagIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{duplicateResult.duplicateTags.length} 个重复标签</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="new" className="space-y-4">
              {duplicateResult.newWebsites.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">新增网站</CardTitle>
                    <CardDescription>
                      这些网站将直接添加到您的数据中
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {duplicateResult.newWebsites.slice(0, 5).map((website) => (
                        <div
                          key={website.id}
                          className="flex items-center gap-3 p-3 border rounded-lg"
                        >
                          <div className="text-2xl">{website.icon}</div>
                          <div className="flex-1">
                            <div className="font-medium">{website.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {website.description}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {website.featured && (
                                <Badge variant="default" className="text-xs">
                                  精选
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                其他
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {duplicateResult.newWebsites.length > 5 && (
                        <div className="text-center text-sm text-muted-foreground py-2">
                          还有 {duplicateResult.newWebsites.length - 5} 个新网站...
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {duplicateResult.newTags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">新增标签</CardTitle>
                    <CardDescription>
                      这些标签将直接添加到您的数据中
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {duplicateResult.newTags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="text-xs"
                          style={{
                            borderColor: tag.color + '40',
                            color: tag.color
                          }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="duplicates" className="space-y-4">
              {duplicateResult.duplicateWebsites.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">重复网站</CardTitle>
                    <CardDescription>
                      这些网站已存在于您的数据中
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {duplicateResult.duplicateWebsites.slice(0, 5).map((website) => (
                        <div
                          key={website.id}
                          className="flex items-center gap-3 p-3 border rounded-lg bg-orange-50 dark:bg-orange-950/20"
                        >
                          <div className="text-2xl">{website.icon}</div>
                          <div className="flex-1">
                            <div className="font-medium">{website.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {website.description}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                重复
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                其他
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {duplicateResult.duplicateWebsites.length > 5 && (
                        <div className="text-center text-sm text-muted-foreground py-2">
                          还有 {duplicateResult.duplicateWebsites.length - 5} 个重复网站...
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {duplicateResult.duplicateTags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">重复标签</CardTitle>
                    <CardDescription>
                      这些标签已存在于您的数据中
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {duplicateResult.duplicateTags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="text-xs"
                          style={{
                            borderColor: tag.color + '40',
                            color: tag.color
                          }}
                        >
                          {tag.name} (重复)
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">选择导入方式</CardTitle>
                  <CardDescription>
                    请选择如何处理重复数据
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={handleImportNew}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                      variant="outline"
                    >
                      <Copy className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-medium">仅导入新内容</div>
                        <div className="text-xs text-muted-foreground">
                          跳过重复数据，只添加新内容
                        </div>
                      </div>
                    </Button>

                    <Button
                      onClick={handleImportReplace}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                      variant="default"
                    >
                      <RefreshCw className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-medium">替换重复内容</div>
                        <div className="text-xs text-muted-foreground">
                          用分享数据替换重复内容
                        </div>
                      </div>
                    </Button>

                    <Button
                      onClick={handleSkip}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                      variant="outline"
                    >
                      <SkipForward className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-medium">取消导入</div>
                        <div className="text-xs text-muted-foreground">
                          不导入任何内容
                        </div>
                      </div>
                    </Button>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>仅导入新内容：</strong>只添加您本地没有的网站和标签<br />
                      <strong>替换重复内容：</strong>用分享数据中的内容替换您本地的重复内容<br />
                      <strong>取消导入：</strong>不进行任何操作
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

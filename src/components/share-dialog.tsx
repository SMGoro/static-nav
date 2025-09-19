import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Share, Copy, ExternalLink, Calendar, Users, Tag, Link } from 'lucide-react';
import { ShareData, dataManager } from '../utils/data-manager';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shareData: ShareData | null;
  onImport?: (shareData: ShareData) => void;
}

export function ShareDialog({ isOpen, onClose, shareData, onImport }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [isCreatingShare, setIsCreatingShare] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(undefined);
  const [generatedShareUrl, setGeneratedShareUrl] = useState<string>('');

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCreateShare = async () => {
    setIsCreatingShare(true);
    try {
      const localData = dataManager.getLocalData();
      const shareUrl = dataManager.createShareLink(localData, shareMessage, expiresInDays);
      setGeneratedShareUrl(shareUrl);
    } catch (error) {
      console.error('Failed to create share link:', error);
      alert('创建分享链接失败');
    } finally {
      setIsCreatingShare(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      alert('分享链接已复制到剪贴板');
    } catch (error) {
      alert('复制失败');
      console.error('复制失败:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const formatExpiresAt = (expiresAt: string) => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diff = expires.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days <= 0) return '已过期';
    if (days === 1) return '今天过期';
    return `${days}天后过期`;
  };

  const handleImport = () => {
    if (onImport && shareData) {
      onImport(shareData);
      onClose();
    }
  };

  // 如果是创建分享模式
  if (!shareData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link className="w-5 h-5" />
              创建分享链接
            </DialogTitle>
            <DialogDescription>
              生成包含您本地数据的分享链接
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* 分享设置 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">分享设置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="message">分享说明（可选）</Label>
                  <Textarea
                    id="message"
                    placeholder="添加分享说明..."
                    value={shareMessage}
                    onChange={(e) => setShareMessage(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expires">过期时间（可选）</Label>
                  <select
                    id="expires"
                    value={expiresInDays || ''}
                    onChange={(e) => setExpiresInDays(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">永不过期</option>
                    <option value="1">1天后过期</option>
                    <option value="7">7天后过期</option>
                    <option value="30">30天后过期</option>
                    <option value="90">90天后过期</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* 生成按钮 */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  onClick={handleCreateShare}
                  disabled={isCreatingShare}
                  className="w-full gap-2"
                >
                  {isCreatingShare ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      生成中...
                    </>
                  ) : (
                    <>
                      <Link className="w-4 h-4" />
                      生成分享链接
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* 生成的分享链接 */}
            {generatedShareUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">分享链接</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={generatedShareUrl}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      onClick={() => copyToClipboard(generatedShareUrl)}
                      variant={copied ? "default" : "outline"}
                      className="gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      {copied ? '已复制' : '复制'}
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.open(generatedShareUrl, '_blank')}
                      variant="outline"
                      className="gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      在新窗口打开
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 如果是查看分享内容模式
  const shareUrl = `${window.location.origin}${window.location.pathname}?share=${shareData.shareId}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="w-5 h-5" />
            分享详情
          </DialogTitle>
          <DialogDescription>
            查看分享的网站和标签信息
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 分享信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {shareData.message || '无标题分享'}
              </CardTitle>
              <CardDescription>
                分享ID: {shareData.shareId}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {shareData.websites.length} 个网站
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {shareData.tags.length} 个标签
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  创建于: {formatDate(shareData.createdAt)}
                </span>
              </div>

              {shareData.expiresAt && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {formatExpiresAt(shareData.expiresAt)}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 分享链接 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">分享链接</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  onClick={() => copyToClipboard(shareUrl)}
                  variant={copied ? "default" : "outline"}
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? '已复制' : '复制'}
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => window.open(shareUrl, '_blank')}
                  variant="outline"
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  在新窗口打开
                </Button>
                
                {onImport && (
                  <Button
                    onClick={handleImport}
                    className="gap-2"
                  >
                    <Share className="w-4 h-4" />
                    导入到我的数据
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 网站预览 */}
          {shareData.websites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">网站预览</CardTitle>
                <CardDescription>
                  显示前5个网站，共{shareData.websites.length}个
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {shareData.websites.slice(0, 5).map((website) => (
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
                  
                  {shareData.websites.length > 5 && (
                    <div className="text-center text-sm text-muted-foreground py-2">
                      还有 {shareData.websites.length - 5} 个网站...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 标签预览 */}
          {shareData.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">标签预览</CardTitle>
                <CardDescription>
                  显示前10个标签，共{shareData.tags.length}个
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {shareData.tags.slice(0, 10).map((tag) => (
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
                  
                  {shareData.tags.length > 10 && (
                    <Badge variant="secondary" className="text-xs">
                      +{shareData.tags.length - 10}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
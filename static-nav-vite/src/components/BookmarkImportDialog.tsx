import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Upload, FileText, AlertCircle, CheckCircle, Folder } from 'lucide-react';
import { bookmarkParser } from '../utils/bookmarkParser';
import { Website, Tag } from '../types/website';

interface BookmarkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (websites: Website[], tags: Tag[]) => void;
}

interface ImportPreview {
  websites: Website[];
  tags: Tag[];
  folders: string[];
  duplicates: {
    websites: Website[];
    tags: Tag[];
  };
}

export function BookmarkImportDialog({ open, onOpenChange, onImport }: BookmarkImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [step, setStep] = useState<'select' | 'preview' | 'complete'>('select');

  // 重置状态
  const resetState = () => {
    setIsProcessing(false);
    setProgress(0);
    setError(null);
    setPreview(null);
    setStep('select');
  };

  // 处理文件选择
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.name.toLowerCase().endsWith('.html') && file.type !== 'text/html') {
      setError('请选择HTML格式的收藏夹文件');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(10);

    try {
      // 读取文件内容
      const content = await readFileAsText(file);
      setProgress(30);

      // 解析收藏夹
      const parsed = bookmarkParser.parseBookmarkHTML(content);
      setProgress(60);

      // 检查重复项（这里简化处理，实际项目中可能需要与现有数据比较）
      const duplicates = {
        websites: [] as Website[],
        tags: [] as Tag[]
      };

      setProgress(90);

      // 设置预览数据
      setPreview({
        websites: parsed.websites,
        tags: parsed.tags,
        folders: parsed.folders,
        duplicates
      });

      setProgress(100);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : '解析收藏夹文件失败');
    } finally {
      setIsProcessing(false);
      // 清空文件输入
      if (event.target) event.target.value = '';
    }
  };

  // 读取文件为文本
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          resolve(content);
        } else {
          reject(new Error('文件内容为空'));
        }
      };
      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsText(file, 'utf-8');
    });
  };

  // 确认导入
  const handleConfirmImport = () => {
    if (!preview) return;

    onImport(preview.websites, preview.tags);
    setStep('complete');
    
    // 延迟关闭对话框
    setTimeout(() => {
      onOpenChange(false);
      resetState();
    }, 1500);
  };

  // 处理对话框关闭
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-4xl max-h-[120vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            导入浏览器收藏夹
          </DialogTitle>
          <DialogDescription>
            支持导入Chrome、Firefox、Safari等浏览器导出的HTML格式收藏夹文件
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {step === 'select' && (
            <div className="space-y-4">
            <div>
              <Label htmlFor="bookmark-file">选择收藏夹文件</Label>
              <div className="mt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html,text/html"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="bookmark-file"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-20 border-dashed"
                  disabled={isProcessing}
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <div className="text-sm font-medium">
                      {isProcessing ? '正在处理...' : '点击选择HTML文件'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      支持 .html 格式的收藏夹文件
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>处理进度</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">如何导出收藏夹：</div>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• <strong>Chrome:</strong> 设置 → 书签 → 书签管理器 → 整理 → 导出书签</li>
                    <li>• <strong>Firefox:</strong> 书签 → 管理所有书签 → 导入和备份 → 导出书签为HTML</li>
                    <li>• <strong>Safari:</strong> 文件 → 导出书签</li>
                    <li>• <strong>Edge:</strong> 设置 → 收藏夹 → 导出收藏夹</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
            </div>
          )}

          {step === 'preview' && preview && (
            <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                成功解析收藏夹文件！找到 {preview.websites.length} 个网站，{preview.folders.length} 个文件夹
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">导入统计</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-muted p-3 rounded">
                    <div className="font-medium">网站数量</div>
                    <div className="text-2xl font-bold text-primary">{preview.websites.length}</div>
                  </div>
                  <div className="bg-muted p-3 rounded">
                    <div className="font-medium">文件夹数量</div>
                    <div className="text-2xl font-bold text-primary">{preview.folders.length}</div>
                  </div>
                </div>
              </div>

              {preview.folders.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Folder className="w-4 h-4" />
                    文件夹列表
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {preview.folders.map(folder => (
                      <Badge key={folder} variant="secondary">
                        {folder}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">网站预览（前5个）</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {preview.websites.slice(0, 5).map((website, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 border rounded">
                      <img 
                        src={website.icon} 
                        alt={website.title}
                        className="w-6 h-6 rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMEMzLjU4IDAgMCAzLjU4IDAgOFMzLjU4IDE2IDggMTZTMTYgMTIuNDIgMTYgOFMxMi40MiAwIDggMFpNOCAxNEMzLjU4IDE0IDIgMTIuNDIgMiA4UzMuNTggMiA4IDJTMTQgMy41OCAxNCA4UzEyLjQyIDE0IDggMTRaIiBmaWxsPSIjOTk5Ii8+Cjwvc3ZnPgo=';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{website.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{website.url}</div>
                      </div>
                      <div className="flex gap-1">
                        {website.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                  {preview.websites.length > 5 && (
                    <div className="text-center text-sm text-muted-foreground py-2">
                      还有 {preview.websites.length - 5} 个网站...
                    </div>
                  )}
                </div>
              </div>

              {preview.duplicates.websites.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    发现 {preview.duplicates.websites.length} 个重复的网站，将会被跳过
                  </AlertDescription>
                </Alert>
              )}
            </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">导入完成！</h3>
              <p className="text-muted-foreground">
                已成功导入 {preview?.websites.length} 个网站
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === 'select' && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
          )}
          
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('select')}>
                重新选择
              </Button>
              <Button onClick={handleConfirmImport}>
                确认导入
              </Button>
            </>
          )}
          
          {step === 'complete' && (
            <Button onClick={() => onOpenChange(false)}>
              完成
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

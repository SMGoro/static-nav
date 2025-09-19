import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink, 
  Info,
  X
} from 'lucide-react';

interface ContentFetchErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  onContinueWithoutContent: () => void;
  error: string;
  websiteUrl: string;
  isRetrying?: boolean;
}

export function ContentFetchErrorDialog({
  isOpen,
  onClose,
  onRetry,
  onContinueWithoutContent,
  error,
  websiteUrl,
  isRetrying = false
}: ContentFetchErrorDialogProps) {
  
  const getErrorType = (error: string) => {
    if (error.includes('超时') || error.includes('timeout')) {
      return {
        type: 'timeout',
        title: '请求超时',
        description: '网站响应时间过长，可能是网络较慢或网站服务器负载较高。'
      };
    }
    
    if (error.includes('网络') || error.includes('Failed to fetch') || error.includes('NetworkError')) {
      return {
        type: 'network',
        title: '网络连接失败',
        description: '无法连接到目标网站，请检查网络连接或网站是否可访问。'
      };
    }
    
    if (error.includes('HTTP') && error.includes('404')) {
      return {
        type: 'notfound',
        title: '页面不存在',
        description: '目标页面不存在或已被删除。'
      };
    }
    
    if (error.includes('HTTP') && error.includes('403')) {
      return {
        type: 'forbidden',
        title: '访问被拒绝',
        description: '网站拒绝了访问请求，可能需要特殊权限或存在访问限制。'
      };
    }
    
    if (error.includes('内容为空')) {
      return {
        type: 'empty',
        title: '内容为空',
        description: '网站返回了空内容，可能是动态加载的页面或内容受保护。'
      };
    }
    
    return {
      type: 'unknown',
      title: '获取失败',
      description: '无法获取网站内容，可能是网站结构特殊或存在技术限制。'
    };
  };

  const errorInfo = getErrorType(error);

  const handleOpenWebsite = () => {
    window.open(websiteUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            无法获取网站内容
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 错误信息 */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium">{errorInfo.title}</div>
                <div className="text-sm text-muted-foreground">
                  {errorInfo.description}
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* 网站信息 */}
          <div className="space-y-2">
            <div className="text-sm font-medium">目标网站:</div>
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <div className="flex-1 text-sm font-mono truncate" title={websiteUrl}>
                {websiteUrl}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenWebsite}
                className="flex-shrink-0"
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* 错误详情 */}
          <div className="space-y-2">
            <div className="text-sm font-medium">错误详情:</div>
            <div className="p-2 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>

          {/* 建议操作 */}
          <div className="space-y-2">
            <div className="text-sm font-medium">建议操作:</div>
            <div className="space-y-1 text-sm text-muted-foreground">
              {errorInfo.type === 'timeout' && (
                <>
                  <div>• 稍后重试，等待网络状况改善</div>
                  <div>• 检查网站是否正常运行</div>
                </>
              )}
              {errorInfo.type === 'network' && (
                <>
                  <div>• 检查网络连接是否正常</div>
                  <div>• 确认网站URL是否正确</div>
                  <div>• 尝试直接访问网站</div>
                </>
              )}
              {errorInfo.type === 'forbidden' && (
                <>
                  <div>• 网站可能有访问限制</div>
                  <div>• 尝试直接访问网站获取信息</div>
                </>
              )}
              {errorInfo.type === 'empty' && (
                <>
                  <div>• 网站可能使用JavaScript动态加载内容</div>
                  <div>• 手动访问网站获取信息</div>
                </>
              )}
              <div>• 继续AI增强，使用现有信息</div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              取消
            </Button>
            
            <Button
              variant="outline"
              onClick={onRetry}
              disabled={isRetrying}
              className="flex-1"
            >
              {isRetrying ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              重试
            </Button>
          </div>
          
          <Button
            onClick={onContinueWithoutContent}
            className="w-full"
          >
            继续AI增强
            <Badge variant="secondary" className="ml-2 text-xs">
              使用现有信息
            </Badge>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

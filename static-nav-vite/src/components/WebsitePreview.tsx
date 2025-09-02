import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ExternalLink, Image, Monitor, RefreshCw, AlertTriangle } from 'lucide-react';
import { Website } from '../types/website';

interface WebsitePreviewProps {
  website: Website;
  showTitle?: boolean;
  className?: string;
}

export function WebsitePreview({ website, showTitle = true, className = "" }: WebsitePreviewProps) {
  const [currentScreenshot, setCurrentScreenshot] = useState(0);
  const [previewMode, setPreviewMode] = useState<'image' | 'iframe'>('image');
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  // 检查是否有截图
  const hasScreenshots = website.screenshots && website.screenshots.length > 0;

  // 初始化预览模式
  useEffect(() => {
    setPreviewMode(hasScreenshots ? 'image' : 'iframe');
  }, [hasScreenshots]);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setIframeError(false);
  };

  const handleIframeError = () => {
    setIframeError(true);
    setIframeLoaded(false);
  };

  const refreshIframe = () => {
    setIframeLoaded(false);
    setIframeError(false);
    // 强制重新加载 iframe
    const iframe = document.querySelector(`#iframe-${website.id}`) as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  const renderImagePreview = () => (
    <div className="space-y-4">
      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
        <img
          src={website.screenshots![currentScreenshot]}
          alt={`${website.title} 截图 ${currentScreenshot + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // 图片加载失败时切换到 iframe 模式
            console.warn('图片加载失败，切换到 iframe 模式');
            setPreviewMode('iframe');
          }}
        />
      </div>
      {website.screenshots!.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {website.screenshots!.map((screenshot, index) => (
            <button
              key={index}
              onClick={() => setCurrentScreenshot(index)}
              className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-colors ${
                index === currentScreenshot ? 'border-primary' : 'border-border'
              }`}
            >
              <img
                src={screenshot}
                alt={`预览图 ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderIframePreview = () => (
    <div className="space-y-4">
      <div className="aspect-video rounded-lg overflow-hidden bg-muted relative">
        {!iframeLoaded && !iframeError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">加载网站预览中...</p>
            </div>
          </div>
        )}
        
        {iframeError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center space-y-3">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto" />
              <div className="space-y-2">
                <p className="text-sm font-medium">无法加载网站预览</p>
                <p className="text-xs text-muted-foreground">
                  该网站可能不支持嵌入预览或存在访问限制
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={refreshIframe}
                    className="gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    重试
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(website.url, '_blank')}
                    className="gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    访问网站
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <iframe
          id={`iframe-${website.id}`}
          src={website.url}
          className={`w-full h-full border-0 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          referrerPolicy="no-referrer-when-downgrade"
          title={`${website.title} 预览`}
        />
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Monitor className="w-3 h-3" />
          <span>实时网站预览</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => window.open(website.url, '_blank')}
          className="gap-1 h-6 px-2"
        >
          <ExternalLink className="w-3 h-3" />
          在新窗口打开
        </Button>
      </div>
    </div>
  );

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">网站预览</CardTitle>
            <div className="flex items-center gap-2">
              {hasScreenshots && (
                <div className="flex rounded-md border">
                  <Button
                    size="sm"
                    variant={previewMode === 'image' ? 'default' : 'ghost'}
                    onClick={() => setPreviewMode('image')}
                    className="gap-1 rounded-r-none border-r h-7 px-2"
                  >
                    <Image className="w-3 h-3" />
                    截图
                  </Button>
                  <Button
                    size="sm"
                    variant={previewMode === 'iframe' ? 'default' : 'ghost'}
                    onClick={() => setPreviewMode('iframe')}
                    className="gap-1 rounded-l-none h-7 px-2"
                  >
                    <Monitor className="w-3 h-3" />
                    实时
                  </Button>
                </div>
              )}
              {!hasScreenshots && (
                <Badge variant="secondary" className="text-xs">
                  <Monitor className="w-3 h-3 mr-1" />
                  实时预览
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className={showTitle ? "" : "p-0"}>
        {previewMode === 'image' && hasScreenshots ? renderImagePreview() : renderIframePreview()}
      </CardContent>
    </Card>
  );
}

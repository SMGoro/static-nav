import { useState } from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Website } from '../../types/website';

interface WebsitePreviewMiniProps {
  website: Website;
  className?: string;
}

export function WebsitePreviewMini({ website, className = "" }: WebsitePreviewMiniProps) {
  const [imageError, setImageError] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  // 检查是否有截图
  const hasScreenshots = website.screenshots && website.screenshots.length > 0;

  const handleImageError = () => {
    setImageError(true);
  };

  const handleIframeError = () => {
    setIframeError(true);
  };

  const renderImagePreview = () => (
    <img
      src={website.screenshots![0]}
      alt={`${website.title} 预览`}
      className="w-full h-full object-cover"
      onError={handleImageError}
    />
  );

  const renderIframePreview = () => (
    <>
      {iframeError ? (
        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
          <div className="text-center space-y-2">
            <AlertTriangle className="w-6 h-6 mx-auto" />
            <p className="text-xs">无法预览</p>
            <button
              onClick={() => window.open(website.url, '_blank')}
              className="text-xs text-primary hover:underline flex items-center gap-1 mx-auto"
            >
              <ExternalLink className="w-3 h-3" />
              访问网站
            </button>
          </div>
        </div>
      ) : (
        <iframe
          src={website.url}
          className="w-full h-full border-0"
          onError={handleIframeError}
          sandbox="allow-same-origin allow-scripts"
          referrerPolicy="no-referrer-when-downgrade"
          title={`${website.title} 预览`}
        />
      )}
    </>
  );

  return (
    <div className={`aspect-video rounded-lg overflow-hidden bg-muted ${className}`}>
      {hasScreenshots && !imageError ? renderImagePreview() : renderIframePreview()}
    </div>
  );
}

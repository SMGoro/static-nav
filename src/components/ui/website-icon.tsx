import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Globe } from 'lucide-react';

interface WebsiteIconProps {
  icon?: string;
  title: string;
  url?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackClassName?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6 text-sm',
  md: 'w-8 h-8 text-base',
  lg: 'w-10 h-10 text-lg',
  xl: 'w-12 h-12 text-xl'
};

export function WebsiteIcon({ 
  icon, 
  title, 
  url, 
  size = 'md', 
  className,
  fallbackClassName 
}: WebsiteIconProps) {
  const [iconError, setIconError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 重置错误状态当icon改变时
  useEffect(() => {
    if (icon) {
      setIconError(false);
      setIsLoading(true);
    }
  }, [icon]);

  // 判断是否为有效的图片URL
  const isImageUrl = (str: string): boolean => {
    if (!str) return false;
    
    // 检查是否为HTTP/HTTPS URL
    if (str.startsWith('http://') || str.startsWith('https://')) {
      return true;
    }
    
    // 检查是否为相对路径的图片
    if (str.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i)) {
      return true;
    }
    
    // 检查是否为data URL
    if (str.startsWith('data:image/')) {
      return true;
    }
    
    return false;
  };

  // 判断是否为SVG内容
  const isSvgContent = (str: string): boolean => {
    if (!str) return false;
    return str.trim().startsWith('<svg') && str.trim().endsWith('</svg>');
  };

  // 生成favicon URL
  const getFaviconUrl = (websiteUrl: string): string => {
    try {
      const domain = new URL(websiteUrl).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return '';
    }
  };

  // 处理图片加载错误
  const handleImageError = () => {
    setIconError(true);
    setIsLoading(false);
  };

  // 处理图片加载成功
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // 获取第一个字符作为fallback
  const getInitial = (text: string): string => {
    if (!text) return '?';
    
    // 优先使用中文字符
    const chineseMatch = text.match(/[\u4e00-\u9fff]/);
    if (chineseMatch) {
      return chineseMatch[0];
    }
    
    // 使用英文字符
    const englishMatch = text.match(/[a-zA-Z]/);
    if (englishMatch) {
      return englishMatch[0].toUpperCase();
    }
    
    // 使用数字
    const numberMatch = text.match(/[0-9]/);
    if (numberMatch) {
      return numberMatch[0];
    }
    
    return text.charAt(0).toUpperCase() || '?';
  };

  const baseClasses = cn(
    'flex items-center justify-center rounded-lg bg-muted flex-shrink-0',
    sizeClasses[size],
    className
  );

  // 如果有有效的图标且没有错误
  if (icon && !iconError) {
    // SVG内容
    if (isSvgContent(icon)) {
      return (
        <div 
          className={baseClasses}
          dangerouslySetInnerHTML={{ __html: icon }}
        />
      );
    }
    
    // 图片URL
    if (isImageUrl(icon)) {
      return (
        <div className={baseClasses}>
          <img
            src={icon}
            alt={`${title} icon`}
            className="w-full h-full object-cover rounded-lg"
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
              <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      );
    }
    
    // Emoji或其他字符
    return (
      <div className={baseClasses}>
        <span className="text-center leading-none">
          {icon}
        </span>
      </div>
    );
  }

  // 尝试使用网站URL生成favicon
  if (url && !iconError) {
    const faviconUrl = getFaviconUrl(url);
    if (faviconUrl) {
      return (
        <div className={baseClasses}>
          <img
            src={faviconUrl}
            alt={`${title} favicon`}
            className="w-full h-full object-cover rounded-lg"
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
              <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      );
    }
  }

  // Fallback: 显示首字母或Globe图标
  return (
    <div className={cn(
      baseClasses,
      'bg-gradient-to-br from-primary/10 to-primary/20 text-primary',
      fallbackClassName
    )}>
      {title ? (
        <span className="font-medium leading-none">
          {getInitial(title)}
        </span>
      ) : (
        <Globe className="w-1/2 h-1/2" />
      )}
    </div>
  );
}

// 预加载图标的Hook
export function usePreloadIcon(icon?: string, url?: string) {
  const [isPreloaded, setIsPreloaded] = useState(false);

  useEffect(() => {
    if (!icon && !url) return;

    const preloadImage = (src: string) => {
      const img = new Image();
      img.onload = () => setIsPreloaded(true);
      img.onerror = () => setIsPreloaded(false);
      img.src = src;
    };

    if (icon && (icon.startsWith('http') || icon.startsWith('data:'))) {
      preloadImage(icon);
    } else if (url) {
      try {
        const domain = new URL(url).hostname;
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        preloadImage(faviconUrl);
      } catch {
        setIsPreloaded(false);
      }
    }
  }, [icon, url]);

  return isPreloaded;
}

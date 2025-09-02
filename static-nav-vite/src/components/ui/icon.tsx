import React from 'react';
import { cn } from '../../lib/utils';

interface IconProps {
  icon: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
}

export function Icon({ icon, className, size = 'md', fallback = '🌐' }: IconProps) {
  const [imageError, setImageError] = React.useState(false);
  
  // 检测图标类型
  const isEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(icon);
  const isImageUrl = icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('data:');
  const isSvg = icon.trim().startsWith('<svg') || icon.includes('svg');
  
  // 尺寸类名映射
  const sizeClasses = {
    sm: 'w-6 h-6 text-lg',
    md: 'w-8 h-8 text-xl',
    lg: 'w-10 h-10 text-2xl',
    xl: 'w-12 h-12 text-3xl'
  };

  const containerClasses = cn(
    'flex items-center justify-center rounded-lg bg-muted/30',
    sizeClasses[size],
    className
  );

  // 如果是emoji
  if (isEmoji) {
    return (
      <div className={containerClasses}>
        <span className="leading-none">{icon}</span>
      </div>
    );
  }
  
  // 如果图片加载失败，显示默认图标
  if (imageError) {
    return (
      <div className={containerClasses}>
        <span className="leading-none">{fallback}</span>
      </div>
    );
  }

  // 如果是图片URL
  if (isImageUrl && !imageError) {
    return (
      <div className={containerClasses}>
        <img
          src={icon}
          alt="网站图标"
          className="w-full h-full object-cover rounded"
          onError={() => {
            console.warn(`图片加载失败: ${icon}`);
            setImageError(true);
          }}
          onLoad={() => {
            setImageError(false);
          }}
        />
      </div>
    );
  }

  // 如果是SVG
  if (isSvg) {
    return (
      <div 
        className={containerClasses}
        dangerouslySetInnerHTML={{ __html: icon }}
      />
    );
  }

  // 默认作为emoji处理
  return (
    <div className={containerClasses}>
      <span className="leading-none">{icon || fallback}</span>
    </div>
  );
}

// 便捷的尺寸组件
export function IconSm({ icon, className, fallback }: Omit<IconProps, 'size'>) {
  return <Icon icon={icon} size="sm" className={className} fallback={fallback} />;
}

export function IconMd({ icon, className, fallback }: Omit<IconProps, 'size'>) {
  return <Icon icon={icon} size="md" className={className} fallback={fallback} />;
}

export function IconLg({ icon, className, fallback }: Omit<IconProps, 'size'>) {
  return <Icon icon={icon} size="lg" className={className} fallback={fallback} />;
}

export function IconXl({ icon, className, fallback }: Omit<IconProps, 'size'>) {
  return <Icon icon={icon} size="xl" className={className} fallback={fallback} />;
}

import React, { useState, useEffect } from 'react';
import { ConnectivityService, ConnectivityResult } from '../../services/connectivity-service';
import { RefreshCw } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface ConnectivityIndicatorProps {
  url: string;
  autoCheck?: boolean;
  className?: string;
}

export function ConnectivityIndicator({ url, autoCheck = true, className = '' }: ConnectivityIndicatorProps) {
  const [result, setResult] = useState<ConnectivityResult>({
    status: 'checking',
    method: 'fetch'
  });
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnectivity = async () => {
    setIsChecking(true);
    setResult({ status: 'checking', method: 'fetch' });

    try {
      const connectivityResult = await ConnectivityService.checkConnectivity(url);
      setResult(connectivityResult);
      setLastChecked(new Date());
    } catch (error) {
      setResult({
        status: 'error',
        error: error instanceof Error ? error.message : '检测失败',
        method: 'fetch'
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (autoCheck && url) {
      checkConnectivity();
    }
  }, [url, autoCheck]);

  const getStatusColor = () => {
    switch (result.status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-red-500';
      case 'error':
        return 'bg-orange-500';
      case 'timeout':
        return 'bg-yellow-500';
      case 'checking':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (result.status) {
      case 'online':
        return '网站正常';
      case 'offline':
        return '网站离线';
      case 'error':
        return '检测异常';
      case 'timeout':
        return '连接超时';
      case 'checking':
        return '检测中...';
      default:
        return '未知状态';
    }
  };

  const formatLastChecked = () => {
    if (!lastChecked) return '';
    
    const now = new Date();
    const diff = now.getTime() - lastChecked.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) {
      return '刚刚检测';
    } else if (minutes < 60) {
      return `${minutes}分钟前检测`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `${hours}小时前检测`;
    }
  };

  const getTooltipContent = () => {
    return (
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
          <span className="font-medium">{getStatusText()}</span>
        </div>
        
        {result.responseTime && (
          <div className="text-xs text-muted-foreground">
            响应时间: {result.responseTime}ms
          </div>
        )}
        
        {lastChecked && (
          <div className="text-xs text-muted-foreground">
            {formatLastChecked()}
          </div>
        )}
        
        {result.error && (
          <div className="text-xs text-red-400">
            错误: {result.error}
          </div>
        )}
        
        <div className="text-xs text-muted-foreground pt-1 border-t">
          点击重新检测
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={checkConnectivity}
            disabled={isChecking}
            className={`
              relative inline-flex items-center justify-center
              w-8 h-8 rounded-full border-2 border-background
              transition-all duration-200 hover:scale-110
              focus:outline-none focus:ring-2 focus:ring-primary/20
              ${getStatusColor()}
              ${isChecking ? 'animate-pulse' : ''}
              ${className}
            `}
            title={getStatusText()}
          >
            {isChecking && (
              <RefreshCw className="w-3 h-3 text-white animate-spin" />
            )}
            
            {/* 状态指示点 */}
            {!isChecking && (
              <div className="w-2 h-2 bg-white rounded-full"></div>
            )}
            
            {/* 脉冲动画（仅在线状态） */}
            {result.status === 'online' && !isChecking && (
              <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20"></div>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end" className="max-w-xs">
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

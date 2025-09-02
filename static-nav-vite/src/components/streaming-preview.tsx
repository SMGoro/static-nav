import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Bot, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  StopCircle,
  RotateCcw
} from 'lucide-react';
import { AIWebsiteRecommendation } from '../services/ai-service';
import { AIWebsiteCard } from './ai/ai-website-card';

interface StreamingPreviewProps {
  isStreaming: boolean;
  onStop: () => void;
  onRetry: () => void;
  onAddWebsite?: (website: AIWebsiteRecommendation) => void;
  streamData: {
    content: string;
    websites: AIWebsiteRecommendation[];
    reasoning: string;
    confidence: number;
    progress: number;
  };
}

export function StreamingPreview({ 
  isStreaming, 
  onStop, 
  onRetry, 
  onAddWebsite,
  streamData 
}: StreamingPreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [showFullContent, setShowFullContent] = useState(false);

  // 自动滚动到底部
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [streamData.content]);

  const formatProgress = (progress: number) => {
    if (progress < 30) return '分析需求中...';
    if (progress < 60) return '搜索相关网站...';
    if (progress < 90) return '生成推荐结果...';
    return '完成推荐分析';
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-blue-500';
    if (progress < 60) return 'bg-yellow-500';
    if (progress < 90) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI 实时生成预览
          </CardTitle>
          <div className="flex items-center gap-2">
            {isStreaming ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onStop}
                className="gap-1 text-red-600 hover:text-red-700"
              >
                <StopCircle className="w-4 h-4" />
                停止生成
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                重新生成
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 进度条 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {formatProgress(streamData.progress)}
            </span>
            <span className="font-medium">{streamData.progress}%</span>
          </div>
          <Progress 
            value={streamData.progress} 
            className="h-2"
          />
          <div className={`w-2 h-2 rounded-full ${getProgressColor(streamData.progress)} animate-pulse`} />
        </div>

        {/* 实时内容预览 */}
        <div className="space-y-4">
          {/* 生成内容 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">生成内容</span>
              {isStreaming && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-xs text-muted-foreground">实时生成中...</span>
                </div>
              )}
            </div>
            <div 
              ref={contentRef}
              className={`p-3 bg-muted/30 rounded-lg font-mono text-sm ${
                showFullContent ? 'max-h-96 overflow-y-auto' : 'max-h-32 overflow-hidden'
              }`}
            >
              <pre className="whitespace-pre-wrap break-words">
                {streamData.content || '等待AI开始生成...'}
              </pre>
              {streamData.content.length > 200 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullContent(!showFullContent)}
                  className="mt-2 text-xs"
                >
                  {showFullContent ? '收起' : '展开全部'}
                </Button>
              )}
            </div>
          </div>

          {/* 推荐理由 */}
          {streamData.reasoning && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">推荐理由</span>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm">{streamData.reasoning}</p>
              </div>
            </div>
          )}

          {/* 置信度 */}
          {streamData.confidence > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">推荐置信度</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress 
                  value={streamData.confidence * 100} 
                  className="flex-1 h-2"
                />
                <span className="text-sm font-medium">
                  {(streamData.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          {/* 网站列表 */}
          {streamData.websites.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">
                  推荐网站 ({streamData.websites.length})
                </span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {streamData.websites.map((website, index) => (
                  <AIWebsiteCard
                    key={`${website.title}-${website.url}-${index}`}
                    website={website}
                    onAdd={onAddWebsite || (() => {})}
                    onPreview={(url) => window.open(url, '_blank')}
                    showAddButton={!!onAddWebsite}
                    showPreviewButton={true}
                    variant="compact"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 状态指示器 */}
        <div className="flex items-center justify-center pt-4 border-t">
          {isStreaming ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>AI正在实时生成推荐内容...</span>
            </div>
          ) : streamData.progress === 100 ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>AI推荐生成完成</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <span>等待开始生成...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

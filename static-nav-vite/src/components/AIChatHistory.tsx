import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { IconMd } from './ui/icon';
import { 
  MessageSquare, 
  Clock, 
  Copy, 
  Trash2, 
  RefreshCw,
  Bot,
  User,
  CheckCircle
} from 'lucide-react';
import { AIRecommendationResponse, AIWebsiteRecommendation } from '../services/aiService';

export interface ChatMessage {
  id: string;
  timestamp: string;
  query: string;
  response: AIRecommendationResponse;
  maxResults: number;
}

interface AIChatHistoryProps {
  messages: ChatMessage[];
  onDeleteMessage: (id: string) => void;
  onRetryMessage: (message: ChatMessage) => void;
  onCopyMessage: (message: ChatMessage) => void;
  onClearHistory: () => void;
  onAddWebsite?: (website: AIWebsiteRecommendation) => void;
  onBatchAddWebsites?: (websites: AIWebsiteRecommendation[]) => void;
}

export function AIChatHistory({ 
  messages, 
  onDeleteMessage, 
  onRetryMessage, 
  onCopyMessage, 
  onClearHistory,
  onAddWebsite,
  onBatchAddWebsites
}: AIChatHistoryProps) {
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleExpanded = (id: string) => {
    setExpandedMessage(expandedMessage === id ? null : id);
  };

  if (messages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            聊天记录
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>暂无聊天记录</p>
            <p className="text-sm">开始使用AI推荐功能后，您的查询记录将显示在这里</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            聊天记录 ({messages.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearHistory}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            清空记录
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="border rounded-lg p-4">
                {/* 消息头部 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">您的查询</span>
                    <Badge variant="outline" className="text-xs">
                      {message.maxResults} 个结果
                    </Badge>

                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatTime(message.timestamp)}
                  </div>
                </div>

                {/* 查询内容 */}
                <div className="mb-3 p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm">{message.query}</p>
                </div>

                {/* AI响应 */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">AI推荐</span>
                    <Badge variant="outline" className="text-xs">
                      {(message.response.confidence * 100).toFixed(1)}% 置信度
                    </Badge>
                  </div>
                  
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>推荐理由：</strong>{message.response.reasoning}
                    </p>
                    
                    {expandedMessage === message.id ? (
                      <div className="space-y-2">
                        {message.response.websites.map((site, index) => (
                                                  <div key={`${site.title}-${site.url}-${index}`} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border">
                          <IconMd 
                            icon={site.icon} 
                          />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{site.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{site.description}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {onAddWebsite && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onAddWebsite(site)}
                                  className="h-6 w-6 p-0"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                        {onBatchAddWebsites && message.response.websites.length > 0 && (
                          <div className="pt-2 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onBatchAddWebsites(message.response.websites)}
                              className="w-full gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              添加所有推荐网站
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          推荐了 {message.response.websites.length} 个网站
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(message.id)}
                          className="h-6 px-2 text-xs"
                        >
                          查看详情
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRetryMessage(message)}
                    className="gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    重新推荐
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCopyMessage(message)}
                    className="gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    复制结果
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteMessage(message.id)}
                    className="gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                    删除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

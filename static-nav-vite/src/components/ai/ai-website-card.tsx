import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { IconLg, IconMd } from '../ui/icon';
import { ExternalLink, Plus, CheckCircle } from 'lucide-react';
import { AIWebsiteRecommendation } from '../../services/ai-service';

interface AIWebsiteCardProps {
  website: AIWebsiteRecommendation;
  onAdd: (website: AIWebsiteRecommendation) => void;
  onPreview: (url: string) => void;
  showAddButton?: boolean;
  showPreviewButton?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export function AIWebsiteCard({ 
  website, 
  onAdd, 
  onPreview, 
  showAddButton = true,
  showPreviewButton = true,
  variant = 'default'
}: AIWebsiteCardProps) {
  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAdd(website);
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPreview(website.url);
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border">
        <IconMd 
          icon={website.icon} 
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{website.title}</p>
          <p className="text-xs text-muted-foreground truncate">{website.description}</p>
        </div>
        <div className="flex items-center gap-1">
          
          {showAddButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAdd}
              className="h-6 w-6 p-0"
            >
              <CheckCircle className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-primary/10">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <IconLg 
                icon={website.icon} 
              />
              <div className="flex-1">
                <h3 className="font-medium text-card-foreground hover:text-primary transition-colors">
                  {website.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 mb-3">{website.description}</p>
                
                <div className="flex items-center gap-2 mb-2">
                  {website.isPaid && (
                    <Badge variant="outline" className="text-xs">付费</Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {website.tags.slice(0, 4).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {website.tags.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{website.tags.length - 4}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="truncate max-w-48">{website.url}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 ml-4">
              {showAddButton && (
                <Button 
                  size="sm" 
                  onClick={handleAdd}
                  className="gap-1"
                >
                  <Plus className="w-3 h-3" />
                  添加
                </Button>
              )}
              {showPreviewButton && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handlePreview}
                >
                  <ExternalLink className="w-3 h-3" />
                  预览
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 默认样式 - 与主网站卡片保持一致
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-primary/10">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <IconLg 
              icon={website.icon} 
            />
            <div className="flex-1">
              <h3 className="font-medium text-card-foreground hover:text-primary transition-colors">
                {website.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 mb-3">{website.description}</p>
              
              <div className="flex items-center gap-2 mb-2">
                {website.isPaid && (
                  <Badge variant="outline" className="text-xs">付费</Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-1">
                {website.tags.slice(0, 4).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {website.tags.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{website.tags.length - 4}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 ml-4">
            {showAddButton && (
              <Button 
                size="sm" 
                onClick={handleAdd}
                className="gap-1"
              >
                <Plus className="w-3 h-3" />
                添加
              </Button>
            )}
            {showPreviewButton && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={handlePreview}
              >
                <ExternalLink className="w-3 h-3" />
                预览
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

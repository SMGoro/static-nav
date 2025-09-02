import { Website } from '../types/website';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { IconLg } from './ui/icon';
import { ExternalLink, Star, MoreHorizontal, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface WebsiteCardProps {
  website: Website;
  onEdit: (website: Website) => void;
  onDelete: (id: string) => void;
  onView: (website: Website) => void;
  onShare: (website: Website) => void;
}

export function WebsiteCard({ website, onEdit, onDelete, onView, onShare }: WebsiteCardProps) {
  const handleVisitWebsite = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(website.url, '_blank');
    // 这里可以添加访问量统计逻辑
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-primary/10 cursor-pointer">
      {/* 如果有slug，使用路由链接 */}
      {website.slug ? (
        <Link to={`/website/${website.slug}`} className="block">
          <div className="p-1">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <IconLg 
                      icon={website.icon} 
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-card-foreground hover:text-primary transition-colors truncate">
                        {website.title}
                      </h3>
                      {website.featured && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-muted-foreground">精选</span>
                        </div>
                      )}
                      {website.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(website.rating!) 
                                    ? 'text-yellow-500 fill-current' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">{website.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onView(website);
                      }}>
                        查看详情
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onEdit(website);
                      }}>
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onShare(website);
                      }}>
                        分享
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(website.id);
                        }}
                        className="text-destructive"
                      >
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {website.description}
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {website.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {website.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{website.tags.length - 3}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    <span>{(website.clicks || 0).toLocaleString()}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleVisitWebsite}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    访问
                  </Button>
                </div>
              </CardContent>
            </div>
          </Link>
        ) : (
          /* 如果没有slug，使用原来的点击事件 */
          <div onClick={() => onView(website)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <IconLg 
                icon={website.icon} 
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-card-foreground hover:text-primary transition-colors truncate">
                  {website.title}
                </h3>
                {website.featured && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-muted-foreground">精选</span>
                  </div>
                )}
                {website.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(website.rating!) 
                              ? 'text-yellow-500 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{website.rating}</span>
                  </div>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onView(website);
                }}>
                  查看详情
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onEdit(website);
                }}>
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation();
                  onShare(website);
                }}>
                  分享
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(website.id);
                  }}
                  className="text-destructive"
                >
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {website.description}
          </p>
          
          {/* 标签 */}
          <div className="flex flex-wrap gap-1 mb-4">
            
            {website.isPaid && (
              <Badge variant="outline" className="text-xs">
                付费
              </Badge>
            )}
            {website.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {website.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{website.tags.length - 2}
              </Badge>
            )}
          </div>
          
          {/* 底部信息和按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {(website.clicks || 0).toLocaleString()}
              </span>
              {website.language && website.language !== '多语言' && (
                <span>{website.language}</span>
              )}
            </div>
            <Button 
              size="sm" 
              className="gap-1 hover:shadow-md transition-shadow"
              onClick={handleVisitWebsite}
            >
              <ExternalLink className="w-3 h-3" />
              访问
            </Button>
          </div>
        </CardContent>
      </div>
        )}
    </Card>
  );
}
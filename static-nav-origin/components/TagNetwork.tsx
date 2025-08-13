import { useEffect, useRef, useState } from 'react';
import { Tag, TagRelation, Website } from '../types/website';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ZoomIn, ZoomOut, RotateCcw, Filter } from 'lucide-react';

interface TagNetworkProps {
  tags: Tag[];
  relations: TagRelation[];
  websites: Website[];
  selectedTag?: Tag | null;
  onTagSelect: (tag: Tag | null) => void;
}

interface NetworkNode {
  id: string;
  tag: Tag;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  fixed?: boolean;
}

interface NetworkLink {
  source: NetworkNode;
  target: NetworkNode;
  relation: TagRelation;
  strength: number;
}

export function TagNetwork({ tags, relations, websites, selectedTag, onTagSelect }: TagNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [links, setLinks] = useState<NetworkLink[]>([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState<NetworkNode | null>(null);
  const [strengthThreshold, setStrengthThreshold] = useState([0.5]);
  const [relationFilter, setRelationFilter] = useState<string>('all');

  const width = 800;
  const height = 600;

  // 初始化网络数据
  useEffect(() => {
    const nodeMap = new Map<string, NetworkNode>();
    
    // 创建节点
    const newNodes: NetworkNode[] = tags.map(tag => {
      const websiteCount = websites.filter(w => w.tags.includes(tag.name)).length;
      const radius = Math.max(20, Math.min(50, 15 + websiteCount * 2));
      
      const node: NetworkNode = {
        id: tag.id,
        tag,
        x: Math.random() * (width - 100) + 50,
        y: Math.random() * (height - 100) + 50,
        vx: 0,
        vy: 0,
        radius
      };
      nodeMap.set(tag.id, node);
      return node;
    });

    // 创建连接
    const newLinks: NetworkLink[] = relations
      .filter(rel => rel.strength >= strengthThreshold[0])
      .filter(rel => relationFilter === 'all' || rel.relationType === relationFilter)
      .map(relation => {
        const source = nodeMap.get(relation.fromTagId);
        const target = nodeMap.get(relation.toTagId);
        if (source && target) {
          return {
            source,
            target,
            relation,
            strength: relation.strength
          };
        }
        return null;
      })
      .filter(Boolean) as NetworkLink[];

    setNodes(newNodes);
    setLinks(newLinks);
  }, [tags, relations, websites, strengthThreshold, relationFilter]);

  // 力导向布局算法
  useEffect(() => {
    if (nodes.length === 0) return;

    const simulation = () => {
      const alpha = 0.1;
      const centerForce = 0.01;
      const repelForce = 1000;
      const linkForce = 0.05;

      nodes.forEach(node => {
        // 中心引力
        const centerX = width / 2;
        const centerY = height / 2;
        node.vx += (centerX - node.x) * centerForce;
        node.vy += (centerY - node.y) * centerForce;

        // 节点间排斥力
        nodes.forEach(other => {
          if (node === other) return;
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 100) {
            const force = repelForce / (distance * distance);
            node.vx += (dx / distance) * force;
            node.vy += (dy / distance) * force;
          }
        });
      });

      // 连接弹簧力
      links.forEach(link => {
        const dx = link.target.x - link.source.x;
        const dy = link.target.y - link.source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const targetDistance = 100 + (1 - link.strength) * 50;
        const force = (distance - targetDistance) * linkForce * link.strength;
        
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;
        
        link.source.vx += fx;
        link.source.vy += fy;
        link.target.vx -= fx;
        link.target.vy -= fy;
      });

      // 更新位置
      nodes.forEach(node => {
        if (!node.fixed) {
          node.vx *= 0.9; // 阻尼
          node.vy *= 0.9;
          node.x += node.vx * alpha;
          node.y += node.vy * alpha;

          // 边界约束
          node.x = Math.max(node.radius, Math.min(width - node.radius, node.x));
          node.y = Math.max(node.radius, Math.min(height - node.radius, node.y));
        }
      });

      setNodes([...nodes]);
    };

    const interval = setInterval(simulation, 50);
    return () => clearInterval(interval);
  }, [nodes, links, width, height]);

  // 绘制网络图
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, width, height);
    
    // 应用缩放和平移
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // 绘制连接线
    links.forEach(link => {
      ctx.beginPath();
      ctx.moveTo(link.source.x, link.source.y);
      ctx.lineTo(link.target.x, link.target.y);
      
      // 根据关系类型设置线条样式
      const alpha = link.strength * 0.8;
      switch (link.relation.relationType) {
        case 'parent':
          ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
          ctx.lineWidth = 3;
          break;
        case 'similar':
          ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
          ctx.lineWidth = 2;
          break;
        case 'complement':
          ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`;
          ctx.lineWidth = 2;
          break;
        default:
          ctx.strokeStyle = `rgba(156, 163, 175, ${alpha})`;
          ctx.lineWidth = 1;
      }
      ctx.stroke();

      // 绘制关系强度标签
      if (link.strength > 0.8) {
        const midX = (link.source.x + link.target.x) / 2;
        const midY = (link.source.y + link.target.y) / 2;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((link.strength * 100).toFixed(0) + '%', midX, midY);
      }
    });

    // 绘制节点
    nodes.forEach(node => {
      const isSelected = selectedTag?.id === node.tag.id;
      const isConnected = selectedTag ? links.some(link => 
        (link.source.id === selectedTag.id && link.target.id === node.tag.id) ||
        (link.target.id === selectedTag.id && link.source.id === node.tag.id)
      ) : false;

      // 绘制节点圆圈
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      
      if (isSelected) {
        ctx.fillStyle = '#3b82f6';
        ctx.strokeStyle = '#1d4ed8';
        ctx.lineWidth = 3;
      } else if (isConnected) {
        ctx.fillStyle = node.tag.color + '80';
        ctx.strokeStyle = node.tag.color;
        ctx.lineWidth = 2;
      } else {
        ctx.fillStyle = node.tag.color + '40';
        ctx.strokeStyle = node.tag.color;
        ctx.lineWidth = 1;
      }
      
      ctx.fill();
      ctx.stroke();

      // 绘制标签文字
      ctx.fillStyle = isSelected || isConnected ? '#ffffff' : '#000000';
      ctx.font = `${Math.max(10, node.radius / 3)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.tag.name, node.x, node.y);

      // 绘制计数
      if (node.tag.count > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.font = '8px sans-serif';
        ctx.fillText(node.tag.count.toString(), node.x, node.y + node.radius + 10);
      }
    });

    ctx.restore();
  }, [nodes, links, zoom, pan, selectedTag]);

  // 鼠标事件处理
  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    // 检查是否点击了节点
    const clickedNode = nodes.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius;
    });

    if (clickedNode) {
      setDragNode(clickedNode);
      clickedNode.fixed = true;
      onTagSelect(clickedNode.tag);
    } else {
      setIsDragging(true);
      onTagSelect(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    if (dragNode) {
      dragNode.x = x;
      dragNode.y = y;
      dragNode.vx = 0;
      dragNode.vy = 0;
    } else if (isDragging) {
      setPan(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    }
  };

  const handleMouseUp = () => {
    if (dragNode) {
      dragNode.fixed = false;
      setDragNode(null);
    }
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    onTagSelect(null);
  };

  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>标签关系网络</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleZoom(0.1)}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleZoom(-0.1)}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={resetView}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm mb-2 block">关系强度阈值</label>
              <Slider
                value={strengthThreshold}
                onValueChange={setStrengthThreshold}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground mt-1">
                当前: {(strengthThreshold[0] * 100).toFixed(0)}%
              </div>
            </div>
            
            <div>
              <label className="text-sm mb-2 block">关系类型</label>
              <Select value={relationFilter} onValueChange={setRelationFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="parent">父子关系</SelectItem>
                  <SelectItem value="similar">相似关系</SelectItem>
                  <SelectItem value="complement">互补关系</SelectItem>
                  <SelectItem value="alternative">替代关系</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm mb-2 block">缩放比例</label>
              <div className="text-sm text-muted-foreground">
                {(zoom * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* 图例 */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-blue-500"></div>
              <span>父子关系</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-green-500"></div>
              <span>相似关系</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-amber-500"></div>
              <span>互补关系</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-gray-400"></div>
              <span>其他关系</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 网络图 */}
      <Card>
        <CardContent className="p-6">
          <div ref={containerRef} className="relative">
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              className="border rounded-lg cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            
            {/* 选中标签信息 */}
            {selectedTag && (
              <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm p-4 rounded-lg border shadow-lg max-w-xs">
                <div className="flex items-center gap-2 mb-2">
                  <Badge style={{ backgroundColor: selectedTag.color }}>
                    {selectedTag.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {selectedTag.count} 个网站
                  </span>
                </div>
                {selectedTag.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedTag.description}
                  </p>
                )}
                {selectedTag.relatedTags && selectedTag.relatedTags.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    关联标签: {selectedTag.relatedTags.length} 个
                  </div>
                )}
              </div>
            )}

            {/* 操作提示 */}
            <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm p-2 rounded">
              点击节点选择 • 拖拽移动视图 • 滚轮缩放
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
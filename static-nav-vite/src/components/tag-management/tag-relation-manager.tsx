import React, { useState } from 'react';
import { Tag, TagRelation } from '../../types/website';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Plus, Edit, Trash2, Link, Save } from 'lucide-react';
import { generateId } from '../../utils/common';

interface RelationFormData {
  fromTagId: string;
  toTagId: string;
  relationType: 'similar' | 'parent' | 'child' | 'complement' | 'alternative';
  strength: number;
  description: string;
}

interface TagRelationManagerProps {
  tags: Tag[];
  relations: TagRelation[];
  onAddRelation: (relation: TagRelation) => void;
  onEditRelation: (relation: TagRelation) => void;
  onDeleteRelation: (relationId: string) => void;
}

const relationTypes = [
  { value: 'similar', label: '相似', color: 'bg-blue-100 text-blue-800', description: '内容或主题相似的标签' },
  { value: 'parent', label: '父级', color: 'bg-green-100 text-green-800', description: '更广泛的分类标签' },
  { value: 'child', label: '子级', color: 'bg-yellow-100 text-yellow-800', description: '更具体的子分类标签' },
  { value: 'complement', label: '互补', color: 'bg-purple-100 text-purple-800', description: '相互补充的标签' },
  { value: 'alternative', label: '替代', color: 'bg-red-100 text-red-800', description: '可替代使用的标签' }
];

export function TagRelationManager({ 
  tags, 
  relations, 
  onAddRelation, 
  onEditRelation, 
  onDeleteRelation 
}: TagRelationManagerProps) {
  const [isAddingRelation, setIsAddingRelation] = useState(false);
  const [editingRelation, setEditingRelation] = useState<TagRelation | null>(null);
  
  const [relationForm, setRelationForm] = useState<RelationFormData>({
    fromTagId: '',
    toTagId: '',
    relationType: 'similar',
    strength: 5,
    description: '',
  });

  // 重置表单
  const resetForm = () => {
    setRelationForm({
      fromTagId: '',
      toTagId: '',
      relationType: 'similar',
      strength: 5,
      description: '',
    });
  };

  // 开始添加关系
  const handleStartAddRelation = () => {
    resetForm();
    setEditingRelation(null);
    setIsAddingRelation(true);
  };

  // 开始编辑关系
  const handleStartEditRelation = (relation: TagRelation) => {
    setRelationForm({
      fromTagId: relation.fromTagId,
      toTagId: relation.toTagId,
      relationType: relation.relationType,
      strength: relation.strength,
      description: relation.description || '',
    });
    setEditingRelation(relation);
    setIsAddingRelation(true);
  };

  // 保存关系
  const handleSaveRelation = () => {
    if (!relationForm.fromTagId || !relationForm.toTagId) return;
    if (relationForm.fromTagId === relationForm.toTagId) return;

    const relationData: TagRelation = editingRelation ? {
      ...editingRelation,
      fromTagId: relationForm.fromTagId,
      toTagId: relationForm.toTagId,
      relationType: relationForm.relationType,
      strength: relationForm.strength,
      description: relationForm.description,
    } : {
      id: generateId('relation_'),
      fromTagId: relationForm.fromTagId,
      toTagId: relationForm.toTagId,
      relationType: relationForm.relationType,
      strength: relationForm.strength,
      description: relationForm.description,
      createdDate: new Date().toISOString(),
    };

    if (editingRelation) {
      onEditRelation(relationData);
    } else {
      onAddRelation(relationData);
    }

    setIsAddingRelation(false);
    setEditingRelation(null);
    resetForm();
  };

  // 关闭对话框
  const handleCloseDialog = () => {
    setIsAddingRelation(false);
    setEditingRelation(null);
    resetForm();
  };

  // 获取可用的目标标签（排除已选择的源标签）
  const getAvailableToTags = () => {
    return tags.filter(tag => tag.id !== relationForm.fromTagId);
  };

  return (
    <div className="space-y-6">
      {/* 头部操作 */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">标签关系管理</h3>
          <p className="text-sm text-muted-foreground">
            管理标签之间的关联关系，建立知识网络
          </p>
        </div>
        <Button onClick={handleStartAddRelation}>
          <Plus className="w-4 h-4 mr-2" />
          添加关系
        </Button>
      </div>

      {/* 关系类型说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">关系类型说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {relationTypes.map(type => (
              <div key={type.value} className="flex items-start gap-2">
                <Badge className={type.color}>{type.label}</Badge>
                <span className="text-sm text-muted-foreground">
                  {type.description}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 关系列表 */}
      <div className="space-y-3">
        {relations.map(relation => {
          const fromTag = tags.find(t => t.id === relation.fromTagId);
          const toTag = tags.find(t => t.id === relation.toTagId);
          if (!fromTag || !toTag) return null;
          
          const relationType = relationTypes.find(t => t.value === relation.relationType);
          
          return (
            <div key={relation.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge 
                    style={{ backgroundColor: fromTag.color }}
                    className="text-white"
                  >
                    {fromTag.name}
                  </Badge>
                  <Link className="h-4 w-4 text-muted-foreground" />
                  <Badge 
                    style={{ backgroundColor: toTag.color }}
                    className="text-white"
                  >
                    {toTag.name}
                  </Badge>
                </div>
                
                <Badge className={relationType?.color}>
                  {relationType?.label}
                </Badge>
                
                <div className="text-sm text-muted-foreground">
                  强度: {relation.strength}/10
                </div>
                
                {relation.description && (
                  <div className="text-sm text-muted-foreground max-w-xs truncate">
                    {relation.description}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStartEditRelation(relation)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteRelation(relation.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}

        {relations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>还没有创建任何标签关系</p>
            <p className="text-sm">点击"添加关系"开始建立标签之间的联系</p>
          </div>
        )}
      </div>

      {/* 添加/编辑关系对话框 */}
      <Dialog open={isAddingRelation} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingRelation ? '编辑关系' : '添加关系'}
            </DialogTitle>
            <DialogDescription>
              建立标签之间的关联关系
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* 源标签 */}
            <div className="space-y-2">
              <Label>源标签</Label>
              <Select 
                value={relationForm.fromTagId} 
                onValueChange={(value) => setRelationForm(prev => ({ ...prev, fromTagId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择源标签" />
                </SelectTrigger>
                <SelectContent>
                  {tags.map(tag => (
                    <SelectItem key={tag.id} value={tag.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 目标标签 */}
            <div className="space-y-2">
              <Label>目标标签</Label>
              <Select 
                value={relationForm.toTagId} 
                onValueChange={(value) => setRelationForm(prev => ({ ...prev, toTagId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择目标标签" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableToTags().map(tag => (
                    <SelectItem key={tag.id} value={tag.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 关系类型 */}
            <div className="space-y-2">
              <Label>关系类型</Label>
              <Select 
                value={relationForm.relationType} 
                onValueChange={(value: any) => setRelationForm(prev => ({ ...prev, relationType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {relationTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Badge className={type.color} variant="secondary">
                          {type.label}
                        </Badge>
                        <span className="text-sm">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 关系强度 */}
            <div className="space-y-2">
              <Label>关系强度: {relationForm.strength}/10</Label>
              <Slider
                value={[relationForm.strength]}
                onValueChange={(value) => setRelationForm(prev => ({ ...prev, strength: value[0] }))}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            {/* 描述 */}
            <div className="space-y-2">
              <Label>描述（可选）</Label>
              <Textarea
                value={relationForm.description}
                onChange={(e) => setRelationForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="描述这个关系的具体含义..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={handleCloseDialog}>
              取消
            </Button>
            <Button 
              onClick={handleSaveRelation}
              disabled={!relationForm.fromTagId || !relationForm.toTagId || relationForm.fromTagId === relationForm.toTagId}
            >
              <Save className="w-4 h-4 mr-2" />
              {editingRelation ? '保存' : '添加'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

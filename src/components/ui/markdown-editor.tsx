import React, { useState } from 'react';
import { Textarea } from './textarea';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Badge } from './badge';
import { Markdown } from './markdown';
import { 
  Eye, 
  Edit3, 
  HelpCircle, 
  Bold, 
  Italic, 
  Link, 
  List, 
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showToolbar?: boolean;
  showPreview?: boolean;
  minHeight?: string;
  maxHeight?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = '输入内容，支持 Markdown 语法...',
  className = '',
  showToolbar = true,
  showPreview = true,
  minHeight = '200px',
  maxHeight = '400px'
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [showHelp, setShowHelp] = useState(false);

  // 插入Markdown语法的辅助函数
  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newValue = 
      value.substring(0, start) + 
      before + textToInsert + after + 
      value.substring(end);
    
    onChange(newValue);

    // 重新聚焦并设置光标位置
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const toolbarButtons = [
    {
      icon: Heading1,
      tooltip: '标题 1',
      action: () => insertMarkdown('# ', '', '标题')
    },
    {
      icon: Heading2,
      tooltip: '标题 2',
      action: () => insertMarkdown('## ', '', '标题')
    },
    {
      icon: Heading3,
      tooltip: '标题 3',
      action: () => insertMarkdown('### ', '', '标题')
    },
    {
      icon: Bold,
      tooltip: '粗体',
      action: () => insertMarkdown('**', '**', '粗体文本')
    },
    {
      icon: Italic,
      tooltip: '斜体',
      action: () => insertMarkdown('*', '*', '斜体文本')
    },
    {
      icon: Link,
      tooltip: '链接',
      action: () => insertMarkdown('[', '](https://example.com)', '链接文本')
    },
    {
      icon: List,
      tooltip: '无序列表',
      action: () => insertMarkdown('- ', '', '列表项')
    },
    {
      icon: ListOrdered,
      tooltip: '有序列表',
      action: () => insertMarkdown('1. ', '', '列表项')
    },
    {
      icon: Quote,
      tooltip: '引用',
      action: () => insertMarkdown('> ', '', '引用内容')
    },
    {
      icon: Code,
      tooltip: '代码',
      action: () => insertMarkdown('`', '`', '代码')
    }
  ];

  const markdownHelp = [
    { syntax: '# 标题', description: '一级标题' },
    { syntax: '## 标题', description: '二级标题' },
    { syntax: '### 标题', description: '三级标题' },
    { syntax: '**粗体**', description: '粗体文本' },
    { syntax: '*斜体*', description: '斜体文本' },
    { syntax: '[链接](URL)', description: '创建链接' },
    { syntax: '- 项目', description: '无序列表' },
    { syntax: '1. 项目', description: '有序列表' },
    { syntax: '> 引用', description: '引用块' },
    { syntax: '`代码`', description: '行内代码' },
    { syntax: '```\n代码块\n```', description: '代码块' },
    { syntax: '---', description: '分隔线' }
  ];

  return (
    <div className={`markdown-editor ${className}`}>
      {showPreview ? (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'preview')}>
          <div className="flex items-center justify-between mb-2">
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="edit" className="gap-2">
                <Edit3 className="w-4 h-4" />
                编辑
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="w-4 h-4" />
                预览
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Markdown
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(!showHelp)}
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="edit" className="mt-0">
            <div className="space-y-2">
              {showToolbar && (
                <div className="flex flex-wrap gap-1 p-2 border rounded-t-lg bg-muted/50">
                  <TooltipProvider>
                    {toolbarButtons.map((button, index) => (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={button.action}
                            className="h-8 w-8 p-0"
                          >
                            <button.icon className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{button.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                </div>
              )}
              
              <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`font-mono resize-none ${showToolbar ? 'rounded-t-none' : ''}`}
                style={{ 
                  minHeight,
                  maxHeight,
                  height: 'auto'
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            <div 
              className="border rounded-lg p-4 bg-background overflow-auto"
              style={{ 
                minHeight,
                maxHeight
              }}
            >
              {value.trim() ? (
                <Markdown>{value}</Markdown>
              ) : (
                <div className="text-muted-foreground text-center py-8">
                  暂无内容预览
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-2">
          {showToolbar && (
            <div className="flex flex-wrap gap-1 p-2 border rounded-t-lg bg-muted/50">
              <TooltipProvider>
                {toolbarButtons.map((button, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={button.action}
                        className="h-8 w-8 p-0"
                      >
                        <button.icon className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{button.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          )}
          
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`font-mono resize-none ${showToolbar ? 'rounded-t-none' : ''}`}
            style={{ 
              minHeight,
              maxHeight
            }}
          />
        </div>
      )}

      {/* Markdown 语法帮助 */}
      {showHelp && (
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Markdown 语法帮助
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {markdownHelp.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <code className="bg-muted px-2 py-1 rounded text-xs font-mono flex-shrink-0">
                    {item.syntax}
                  </code>
                  <span className="text-muted-foreground">{item.description}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

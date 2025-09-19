import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { cn } from '../../lib/utils';

// 导入代码高亮样式
import 'highlight.js/styles/github.css';

interface MarkdownProps {
  children: string;
  className?: string;
  enableHtml?: boolean;
  enableBreaks?: boolean;
  enableGfm?: boolean;
  enableCodeHighlight?: boolean;
}

export function Markdown({
  children,
  className,
  enableHtml = false,
  enableBreaks = true,
  enableGfm = true,
  enableCodeHighlight = true
}: MarkdownProps) {
  // 构建插件数组
  const remarkPlugins = [];
  const rehypePlugins = [];

  if (enableGfm) {
    remarkPlugins.push(remarkGfm);
  }

  if (enableBreaks) {
    remarkPlugins.push(remarkBreaks);
  }

  if (enableHtml) {
    rehypePlugins.push(rehypeRaw);
  }

  if (enableCodeHighlight) {
    rehypePlugins.push(rehypeHighlight);
  }

  return (
    <div className={cn('prose prose-sm max-w-none dark:prose-invert', className)}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={{
          // 自定义组件样式
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-4 text-foreground border-b pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mb-3 text-foreground">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-medium mb-2 text-foreground">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-medium mb-2 text-foreground">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-3 text-muted-foreground leading-relaxed">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-3 space-y-1 text-muted-foreground">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-3 space-y-1 text-muted-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-muted-foreground">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 py-2 mb-3 bg-muted/50 rounded-r">
              <div className="text-muted-foreground italic">
                {children}
              </div>
            </blockquote>
          ),
          code: ({ children, className, ...props }: any) => {
            const inline = props.inline;
            if (inline) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">
                  {children}
                </code>
              );
            }
            return (
              <code className={className}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-3 border">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline underline-offset-2"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3">
              <table className="min-w-full border-collapse border border-border">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="border border-border px-3 py-2 text-left font-medium text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-3 py-2 text-muted-foreground">
              {children}
            </td>
          ),
          hr: () => (
            <hr className="my-6 border-border" />
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-muted-foreground">
              {children}
            </em>
          ),
          del: ({ children }) => (
            <del className="line-through text-muted-foreground/70">
              {children}
            </del>
          )
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

// 简化版Markdown组件，用于简短内容
export function MarkdownInline({
  children,
  className
}: {
  children: string;
  className?: string;
}) {
  return (
    <span className={cn('inline-markdown', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <span>{children}</span>,
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          code: ({ children }) => (
            <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
              {children}
            </code>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline underline-offset-2"
            >
              {children}
            </a>
          )
        }}
      >
        {children}
      </ReactMarkdown>
    </span>
  );
}

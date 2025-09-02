import { Website, Tag } from '../types/website';

export interface BookmarkItem {
  title: string;
  url: string;
  icon?: string;
  addDate?: string;
  folder?: string;
}

export interface ParsedBookmarks {
  websites: Website[];
  tags: Tag[];
  folders: string[];
}

class BookmarkParser {
  // 解析HTML格式的收藏夹文件
  parseBookmarkHTML(htmlContent: string): ParsedBookmarks {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    const websites: Website[] = [];
    const folders = new Set<string>();
    const bookmarkItems: BookmarkItem[] = [];
    
    // 检测书签文件类型
    const isNetscape = htmlContent.includes('<!DOCTYPE NETSCAPE-Bookmark-file-1>');
    console.log(`书签文件类型: ${isNetscape ? 'Netscape格式' : '其他格式'}`);
    
    // 首先找到根DL元素（通常是文档中的第一个DL）
    const rootDL = doc.querySelector('dl');
    
    if (rootDL) {
      console.log('找到根DL元素，开始解析...');
      // 从根开始，构建文件夹树并收集书签
      this.parseBookmarkStructure(rootDL, bookmarkItems, folders, '');
    } else {
      console.error('未找到根DL元素，无法解析书签文件');
    }
    
    // 如果没有找到任何文件夹，尝试其他方法
    if (folders.size === 0) {
      console.log('尝试备用解析方法...');
      // 直接查找所有H3元素（文件夹）和A元素（书签）
      const allH3 = doc.querySelectorAll('h3');
      const allA = doc.querySelectorAll('a');
      
      console.log(`找到 ${allH3.length} 个H3元素, ${allA.length} 个A元素`);
      
      // 处理所有文件夹
      allH3.forEach(h3 => {
        const folderName = h3.textContent?.trim();
        if (folderName) {
          folders.add(folderName);
        }
      });
      
      // 处理所有书签
      allA.forEach(a => {
        const href = a.getAttribute('href');
        const title = a.textContent?.trim();
        const icon = a.getAttribute('icon');
        const addDate = a.getAttribute('add_date');
        
        if (href && title) {
          // 尝试确定书签所在的文件夹
          let folder = undefined;
          let parent = a.parentElement;
          while (parent) {
            const h3 = parent.querySelector('h3');
            if (h3) {
              folder = h3.textContent?.trim();
              break;
            }
            parent = parent.parentElement;
          }
          
          bookmarkItems.push({
            title,
            url: href,
            icon: icon || undefined,
            addDate: addDate || undefined,
            folder: folder
          });
        }
      });
    }
    
    // 转换为网站数据
    bookmarkItems.forEach((item, index) => {
      // 处理标签：将文件夹路径拆分为多个标签
      const tags = ['书签导入'];
      if (item.folder) {
        // 拆分路径并添加每个文件夹作为单独的标签
        const folderParts = item.folder.split('/');
        folderParts.forEach(part => {
          const trimmedPart = part.trim();
          if (trimmedPart && !tags.includes(trimmedPart)) {
            tags.push(trimmedPart);
          }
        });
      }
      
      const website: Website = {
        id: this.generateId(),
        title: item.title || '未命名网站',
        description: `从收藏夹导入：${item.folder || '根目录'}`,
        url: item.url,
        icon: item.icon || this.getDefaultIcon(item.url),
        tags: tags,
        addedDate: item.addDate ? new Date(parseInt(item.addDate) * 1000).toISOString() : new Date().toISOString(),
        clicks: 0,
        featured: false,
        slug: this.generateSlug(item.title || `bookmark-${index}`),
        lastUpdated: new Date().toISOString(),
        language: '多语言',
        isPaid: false
      };
      
      websites.push(website);
    });
    
    // 创建标签数据
    const tags: Tag[] = [];
    const folderArray = Array.from(folders);
    
    // 收集所有文件夹部分作为标签
    const allFolderParts = new Set<string>();
    
    // 添加文件夹标签（包括拆分后的每个部分）
    folderArray.forEach(folder => {
      // 拆分路径并添加每个部分
      const parts = folder.split('/');
      parts.forEach(part => {
        const trimmedPart = part.trim();
        if (trimmedPart) {
          allFolderParts.add(trimmedPart);
        }
      });
    });
    
    // 为每个文件夹部分创建标签
    Array.from(allFolderParts).forEach(folderPart => {
      const websiteCount = websites.filter(w => w.tags.includes(folderPart)).length;
      if (websiteCount > 0) {
        tags.push({
          id: this.generateId(),
          name: folderPart,
          count: websiteCount,
          color: this.getRandomColor(),
          description: `从收藏夹文件夹"${folderPart}"导入的标签`,
          category: '收藏夹',
          createdDate: new Date().toISOString(),
          isCore: false
        });
      }
    });
    
    // 添加"书签导入"标签
    tags.push({
      id: this.generateId(),
      name: '书签导入',
      count: websites.length,
      color: '#3b82f6',
      description: '从浏览器收藏夹导入的网站',
      category: '导入',
      createdDate: new Date().toISOString(),
      isCore: false
    });
    
    console.log(`解析完成：找到 ${bookmarkItems.length} 个网站，${folderArray.length} 个文件夹`);
    
    return {
      websites,
      tags,
      folders: folderArray
    };
  }
  
  /**
   * 解析书签结构
   * 这个方法更准确地处理书签HTML的嵌套结构
   */
  private parseBookmarkStructure(
    node: Element,
    bookmarkItems: BookmarkItem[],
    folders: Set<string>,
    currentFolder: string
  ): void {
    // 书签HTML结构通常是这样的：
    // <DL>
    //   <DT><H3>文件夹名</H3>
    //     <DL>
    //       <DT><A HREF="...">书签</A>
    //       ...
    //     </DL>
    //   </DT>
    //   <DT><A HREF="...">书签</A></DT>
    //   ...
    // </DL>
    
    // 处理所有直接子元素
    Array.from(node.children).forEach(child => {
      // 只处理DT元素
      if (child.tagName.toLowerCase() === 'dt') {
        // 查找所有子元素
        const h3Elements = child.getElementsByTagName('h3');
        const aElements = child.getElementsByTagName('a');
        
        // 检查是否是文件夹（有H3子元素）
        if (h3Elements.length > 0) {
          const h3 = h3Elements[0];
          const folderName = h3.textContent?.trim();
          if (folderName) {
            // 检查是否有特殊属性（如收藏夹栏）
            const isSpecialFolder = h3.hasAttribute('personal_toolbar_folder') || 
                                    h3.getAttribute('personal_toolbar_folder') === 'true';
            
            // 构建文件夹名称，特殊处理收藏夹栏
            let processedFolderName = folderName;
            if (isSpecialFolder) {
              processedFolderName = '收藏夹栏';
            }
            
            // 构建完整的文件夹路径
            const fullFolderPath = currentFolder ? `${currentFolder}/${processedFolderName}` : processedFolderName;
            folders.add(fullFolderPath);
            console.log(`找到文件夹: ${fullFolderPath} ${isSpecialFolder ? '(收藏夹栏)' : ''}`);
            
            // 查找文件夹内容（DL元素）
            // 1. 检查DT内部是否有DL
            const innerDLs = child.getElementsByTagName('dl');
            if (innerDLs.length > 0) {
              this.parseBookmarkStructure(innerDLs[0], bookmarkItems, folders, fullFolderPath);
            } else {
              // 2. 检查DT的下一个兄弟元素
              let nextElement = child.nextElementSibling;
              while (nextElement) {
                if (nextElement.tagName.toLowerCase() === 'dl') {
                  this.parseBookmarkStructure(nextElement, bookmarkItems, folders, fullFolderPath);
                  break;
                }
                nextElement = nextElement.nextElementSibling;
              }
            }
          }
        } 
        // 检查是否是书签（有A子元素）
        else if (aElements.length > 0) {
          const link = aElements[0];
          const href = link.getAttribute('href');
          const title = link.textContent?.trim();
          const icon = link.getAttribute('icon');
          const addDate = link.getAttribute('add_date');
          
          if (href && title) {
            bookmarkItems.push({
              title,
              url: href,
              icon: icon || undefined,
              addDate: addDate || undefined,
              folder: currentFolder || undefined
            });
          }
        }
      }
      // 直接处理DL元素（某些浏览器导出格式）
      else if (child.tagName.toLowerCase() === 'dl') {
        this.parseBookmarkStructure(child, bookmarkItems, folders, currentFolder);
      }
    });
  }
  
  // 导出为浏览器收藏夹格式
  exportToBookmarkHTML(websites: Website[], title: string = 'Static Nav 导出'): string {
    const timestamp = Math.floor(Date.now() / 1000);
    
    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>${title}</TITLE>
<H1>${title}</H1>
<DL><p>
`;
    
    // 按标签分组网站
    const websitesByTag = new Map<string, Website[]>();
    
    websites.forEach(website => {
      website.tags.forEach(tag => {
        if (!websitesByTag.has(tag)) {
          websitesByTag.set(tag, []);
        }
        websitesByTag.get(tag)!.push(website);
      });
    });
    
    // 生成文件夹结构
    websitesByTag.forEach((siteList, tagName) => {
      if (tagName === '书签导入') return; // 跳过导入标签
      
      html += `    <DT><H3 ADD_DATE="${timestamp}" LAST_MODIFIED="${timestamp}">${tagName}</H3>\n`;
      html += `    <DL><p>\n`;
      
      siteList.forEach(website => {
        const addDate = Math.floor(new Date(website.addedDate).getTime() / 1000);
        const iconData = website.icon.startsWith('data:') ? website.icon : '';
        
        html += `        <DT><A HREF="${website.url}" ADD_DATE="${addDate}"`;
        if (iconData) {
          html += ` ICON="${iconData}"`;
        }
        html += `>${website.title}</A>\n`;
      });
      
      html += `    </DL><p>\n`;
    });
    
    html += `</DL><p>\n`;
    
    return html;
  }
  
  // 生成唯一ID
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  // 生成SEO友好的slug
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  
  // 获取默认图标
  private getDefaultIcon(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMEMzLjU4IDAgMCAzLjU4IDAgOFMzLjU4IDE2IDggMTZTMTYgMTIuNDIgMTYgOFMxMi40MiAwIDggMFpNOCAxNEMzLjU4IDE0IDIgMTIuNDIgMiA4UzMuNTggMiA4IDJTMTQgMy41OCAxNCA4UzEyLjQyIDE0IDggMTRaIiBmaWxsPSIjOTk5Ii8+Cjwvc3ZnPgo=';
    }
  }
  
  // 获取随机颜色
  private getRandomColor(): string {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
      '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
      '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
      '#ec4899', '#f43f5e'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

export const bookmarkParser = new BookmarkParser();

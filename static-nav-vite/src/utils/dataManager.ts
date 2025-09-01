import { Website, Tag, TagRelation } from '../types/website';
import { mockWebsites, mockTags, mockTagRelations } from '../data/mockData';

export interface AppData {
  websites: Website[];
  tags: Tag[];
  tagRelations: TagRelation[];
  version: string;
  lastUpdated: string;
}

export interface ShareData {
  websites: Website[];
  tags: Tag[];
  message?: string;
  shareId: string;
  createdAt: string;
  expiresAt?: string;
}

export interface DuplicateCheckResult {
  duplicateWebsites: Website[];
  duplicateTags: Tag[];
  newWebsites: Website[];
  newTags: Tag[];
  hasDuplicates: boolean;
}

class DataManager {
  private readonly STORAGE_KEY = 'static-nav-data';
  private readonly SHARE_PREFIX = 'static-nav-share-';
  private readonly VERSION = '1.0.0';

  // 获取本地存储的数据
  getLocalData(): AppData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        // 验证数据格式
        if (this.validateData(data)) {
          return data;
        }
      }
    } catch (error) {
      console.error('Failed to load local data:', error);
    }
    
    // 返回默认数据
    return this.getDefaultData();
  }

  // 保存数据到本地存储
  saveLocalData(data: AppData): void {
    try {
      const dataToSave = {
        ...data,
        version: this.VERSION,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save local data:', error);
      throw new Error('保存数据失败');
    }
  }

  // 导出数据为JSON文件（只包含用户数据）
  exportData(data: AppData, filename?: string): void {
    try {
      // 只导出用户添加的数据
      const userWebsites = data.websites.filter(website => !website.isBuiltIn);
      const userTags = data.tags.filter(tag => !tag.isCore);
      
      const exportData = {
        websites: userWebsites,
        tags: userTags,
        tagRelations: data.tagRelations.filter(relation => {
          const fromTag = userTags.find(tag => tag.id === relation.fromTagId);
          const toTag = userTags.find(tag => tag.id === relation.toTagId);
          return fromTag && toTag;
        }),
        version: this.VERSION,
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `static-nav-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw new Error('导出数据失败');
    }
  }

  // 从JSON文件导入数据
  importData(file: File): Promise<AppData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          
          if (this.validateData(data)) {
            // 合并数据，保留现有ID
            const mergedData = this.mergeData(this.getLocalData(), data);
            resolve(mergedData);
          } else {
            reject(new Error('数据格式无效'));
          }
        } catch (error) {
          console.error('Failed to parse import file:', error);
          reject(new Error('文件格式错误'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('读取文件失败'));
      };
      
      reader.readAsText(file);
    });
  }

  // 创建分享链接 - 使用base64编码，只包含新增网站的标签
  createShareLink(data: AppData, message?: string, expiresInDays?: number): string {
    try {
      // 只包含用户添加的数据，不包含自带数据
      const userWebsites = data.websites.filter(website => !website.isBuiltIn);
      
      // 只包含新增网站使用的标签，不包含默认标签
      const usedTagNames = new Set<string>();
      userWebsites.forEach(website => {
        website.tags.forEach(tagName => {
          usedTagNames.add(tagName);
        });
      });
      
      const userTags = data.tags.filter(tag => 
        !tag.isCore && usedTagNames.has(tag.name)
      );
      
      // 创建精简的分享数据
      const shareData = {
        websites: userWebsites.map(website => ({
          title: website.title,
          description: website.description,
          url: website.url,
          icon: website.icon,
  
          featured: website.featured,
          rating: website.rating,
          tags: website.tags,
          addedDate: website.addedDate,
          lastUpdated: website.lastUpdated
        })),
        tags: userTags.map(tag => ({
          name: tag.name,
          color: tag.color,
          description: tag.description,
          count: tag.count,
          category: tag.category,
          createdDate: tag.createdDate
        })),
        message: message,
        createdAt: new Date().toISOString(),
        expiresAt: expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString() : undefined,
        version: this.VERSION
      };
      
      // 转换为JSON字符串并进行base64编码
      const jsonString = JSON.stringify(shareData);
      const base64Data = btoa(encodeURIComponent(jsonString));
      
      // 返回分享链接
      const baseUrl = window.location.origin + window.location.pathname;
      return `${baseUrl}?share=${base64Data}`;
    } catch (error) {
      console.error('Failed to create share link:', error);
      throw new Error('创建分享链接失败');
    }
  }

  // 从分享链接加载数据
  loadShareData(shareId: string): ShareData | null {
    try {
      // base64解码
      const jsonString = decodeURIComponent(atob(shareId));
      const shareData = JSON.parse(jsonString);
      
      // 检查是否过期
      if (shareData.expiresAt && new Date(shareData.expiresAt) < new Date()) {
        console.warn('Share data has expired');
        return null;
      }
      
      // 转换为ShareData格式
      const result: ShareData = {
        websites: shareData.websites.map((website: Partial<Website>) => ({
          ...website,
          id: website.id || this.generateShareId(),
          slug: website.slug || this.generateSlug(website.title || ''),
          addedDate: website.addedDate || new Date().toISOString(),
          lastUpdated: website.lastUpdated || new Date().toISOString(),
          clicks: website.clicks || 0,
          featured: website.featured || false,
          rating: website.rating || 0,
          isPaid: website.isPaid || false,
          language: website.language || '多语言'
        } as Website)),
        tags: shareData.tags.map((tag: Partial<Tag>) => ({
          ...tag,
          id: tag.id || this.generateShareId(),
          count: tag.count || 0,
          createdDate: tag.createdDate || new Date().toISOString(),
          isCore: false,
          category: tag.category || '技术',
          relatedTags: tag.relatedTags || []
        } as Tag)),
        message: shareData.message,
        shareId: shareId,
        createdAt: shareData.createdAt || new Date().toISOString(),
        expiresAt: shareData.expiresAt
      };
      
      return result;
    } catch (error) {
      console.error('Failed to load share data:', error);
      return null;
    }
  }

  // 检查重复数据
  checkDuplicates(existingData: AppData, shareData: ShareData): DuplicateCheckResult {
    const duplicateWebsites: Website[] = [];
    const duplicateTags: Tag[] = [];
    const newWebsites: Website[] = [];
    const newTags: Tag[] = [];

    // 检查重复网站（基于URL和标题）
    shareData.websites.forEach(shareWebsite => {
      const isDuplicate = existingData.websites.some(existingWebsite => 
        existingWebsite.url === shareWebsite.url || 
        existingWebsite.title === shareWebsite.title
      );
      
      if (isDuplicate) {
        duplicateWebsites.push(shareWebsite);
      } else {
        newWebsites.push(shareWebsite);
      }
    });

    // 检查重复标签（基于名称）
    shareData.tags.forEach(shareTag => {
      const isDuplicate = existingData.tags.some(existingTag => 
        existingTag.name === shareTag.name
      );
      
      if (isDuplicate) {
        duplicateTags.push(shareTag);
      } else {
        newTags.push(shareTag);
      }
    });

    return {
      duplicateWebsites,
      duplicateTags,
      newWebsites,
      newTags,
      hasDuplicates: duplicateWebsites.length > 0 || duplicateTags.length > 0
    };
  }

  // 合并分享数据到本地数据
  mergeShareData(existingData: AppData, shareData: ShareData, replaceDuplicates: boolean = false): AppData {
    const merged: AppData = {
      websites: [...existingData.websites],
      tags: [...existingData.tags],
      tagRelations: [...existingData.tagRelations],
      version: this.VERSION,
      lastUpdated: new Date().toISOString()
    };

    // 处理网站数据
    shareData.websites.forEach(shareWebsite => {
      const existingIndex = merged.websites.findIndex(existingWebsite => 
        existingWebsite.url === shareWebsite.url || 
        existingWebsite.title === shareWebsite.title
      );
      
      if (existingIndex >= 0) {
        if (replaceDuplicates) {
          // 替换现有网站
          merged.websites[existingIndex] = {
            ...shareWebsite,
            id: merged.websites[existingIndex].id, // 保持原有ID
            clicks: Math.max(merged.websites[existingIndex].clicks, shareWebsite.clicks || 0)
          };
        }
        // 如果不替换，则跳过
      } else {
        // 添加新网站
        merged.websites.push({
          ...shareWebsite,
          id: this.generateShareId()
        });
      }
    });

    // 处理标签数据
    shareData.tags.forEach(shareTag => {
      const existingIndex = merged.tags.findIndex(existingTag => 
        existingTag.name === shareTag.name
      );
      
      if (existingIndex >= 0) {
        if (replaceDuplicates) {
          // 替换现有标签
          merged.tags[existingIndex] = {
            ...shareTag,
            id: merged.tags[existingIndex].id, // 保持原有ID
            count: Math.max(merged.tags[existingIndex].count, shareTag.count || 0)
          };
        }
        // 如果不替换，则跳过
      } else {
        // 添加新标签
        merged.tags.push({
          ...shareTag,
          id: this.generateShareId()
        });
      }
    });

    return merged;
  }

  // 获取所有分享链接 - 由于数据现在存储在URL中，这个方法不再需要
  getAllShares(): ShareData[] {
    // 返回空数组，因为分享数据现在直接存储在URL中
    return [];
  }

  // 删除分享链接 - 由于数据现在存储在URL中，这个方法不再需要
  deleteShare(shareId: string): void {
    // 不需要删除，因为数据直接存储在URL中
    console.log('Share data is stored in URL, no need to delete from storage');
  }

  // 清理过期的分享链接 - 由于数据现在存储在URL中，这个方法不再需要
  cleanupExpiredShares(): void {
    // 不需要清理，因为数据直接存储在URL中，过期检查在loadShareData中进行
    console.log('Share data is stored in URL, no need to cleanup');
  }

  // 验证数据格式
  private validateData(data: any): data is AppData {
    return (
      data &&
      Array.isArray(data.websites) &&
      Array.isArray(data.tags) &&
      Array.isArray(data.tagRelations) &&
      typeof data.version === 'string'
    );
  }

  // 合并数据
  private mergeData(existing: AppData, imported: AppData): AppData {
    const merged: AppData = {
      websites: [...existing.websites],
      tags: [...existing.tags],
      tagRelations: [...existing.tagRelations],
      version: this.VERSION,
      lastUpdated: new Date().toISOString()
    };

    // 合并网站数据，避免重复
    imported.websites.forEach(importedSite => {
      const existingIndex = merged.websites.findIndex(site => site.id === importedSite.id);
      if (existingIndex >= 0) {
        // 更新现有网站
        merged.websites[existingIndex] = {
          ...merged.websites[existingIndex],
          ...importedSite,
          clicks: Math.max(merged.websites[existingIndex].clicks, importedSite.clicks)
        };
      } else {
        // 添加新网站
        merged.websites.push(importedSite);
      }
    });

    // 合并标签数据
    imported.tags.forEach(importedTag => {
      const existingIndex = merged.tags.findIndex(tag => tag.id === importedTag.id);
      if (existingIndex >= 0) {
        // 更新现有标签
        merged.tags[existingIndex] = {
          ...merged.tags[existingIndex],
          ...importedTag,
          count: Math.max(merged.tags[existingIndex].count, importedTag.count)
        };
      } else {
        // 添加新标签
        merged.tags.push(importedTag);
      }
    });

    // 合并标签关系
    imported.tagRelations.forEach(importedRelation => {
      const existingIndex = merged.tagRelations.findIndex(
        relation => relation.id === importedRelation.id
      );
      if (existingIndex >= 0) {
        merged.tagRelations[existingIndex] = importedRelation;
      } else {
        merged.tagRelations.push(importedRelation);
      }
    });

    return merged;
  }

  // 生成分享ID
  generateShareId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // 生成SEO友好的slug
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // 移除特殊字符
      .replace(/\s+/g, '-') // 空格替换为连字符
      .replace(/-+/g, '-') // 多个连字符替换为单个
      .trim();
  }

  // 获取默认数据
  public getDefaultData(): AppData {
    return {
      websites: mockWebsites,
      tags: mockTags,
      tagRelations: mockTagRelations,
      version: this.VERSION,
      lastUpdated: new Date().toISOString()
    };
  }

  // 重置数据
  resetData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      // 清理所有分享链接
      this.cleanupExpiredShares();
    } catch (error) {
      console.error('Failed to reset data:', error);
      throw new Error('重置数据失败');
    }
  }

  // 获取数据统计
  getDataStats(data: AppData) {
    return {
      totalWebsites: data.websites.length,
      totalTags: data.tags.length,
      totalRelations: data.tagRelations.length,
      featuredWebsites: data.websites.filter(w => w.featured).length,
      totalClicks: data.websites.reduce((sum, w) => sum + w.clicks, 0),
      lastUpdated: data.lastUpdated
    };
  }
}

export const dataManager = new DataManager();

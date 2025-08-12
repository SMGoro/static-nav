import type { NavigationData, Website } from '~/types'

export class DataManager {
  private static instance: DataManager
  private data: NavigationData | null = null

  private constructor() {}

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager()
    }
    return DataManager.instance
  }

  // 加载初始数据
  async loadInitialData(): Promise<NavigationData> {
    try {
      // 尝试从本地存储加载
      const savedData = this.loadFromLocalStorage()
      if (savedData) {
        this.data = savedData
        return savedData
      }

      // 从data文件加载默认数据
      const response = await fetch('/data/websites.json')
      const defaultData = await response.json()
      this.data = defaultData
      this.saveToLocalStorage(defaultData)
      return defaultData
    } catch (error) {
      console.error('加载数据失败:', error)
      // 返回空数据
      const emptyData: NavigationData = {
        id: 'static-nav-data',
        title: '静态导航站',
        description: '发现和收藏优质网站资源，构建你的个人知识库',
        websites: [],
        tags: [],
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }
      this.data = emptyData
      return emptyData
    }
  }

  // 获取当前数据
  getData(): NavigationData | null {
    return this.data
  }

  // 更新数据
  updateData(data: NavigationData) {
    this.data = data
    this.saveToLocalStorage(data)
  }

  // 添加网站
  addWebsite(website: Omit<Website, 'id' | 'createdAt' | 'updatedAt'>): Website {
    if (!this.data) {
      throw new Error('数据未初始化')
    }

    const newWebsite: Website = {
      ...website,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }

    this.data.websites.unshift(newWebsite)
    this.data.updatedAt = new Date().toISOString().split('T')[0]
    
    // 更新标签列表
    this.updateTags()
    
    this.saveToLocalStorage(this.data)
    return newWebsite
  }

  // 更新网站
  updateWebsite(id: string, updates: Partial<Website>): Website | null {
    if (!this.data) {
      throw new Error('数据未初始化')
    }

    const index = this.data.websites.findIndex(w => w.id === id)
    if (index === -1) {
      return null
    }

    const updatedWebsite = {
      ...this.data.websites[index],
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0]
    }

    this.data.websites[index] = updatedWebsite
    this.data.updatedAt = new Date().toISOString().split('T')[0]
    
    // 更新标签列表
    this.updateTags()
    
    this.saveToLocalStorage(this.data)
    return updatedWebsite
  }

  // 删除网站
  deleteWebsite(id: string): boolean {
    if (!this.data) {
      throw new Error('数据未初始化')
    }

    const index = this.data.websites.findIndex(w => w.id === id)
    if (index === -1) {
      return false
    }

    this.data.websites.splice(index, 1)
    this.data.updatedAt = new Date().toISOString().split('T')[0]
    
    // 更新标签列表
    this.updateTags()
    
    this.saveToLocalStorage(this.data)
    return true
  }

  // 更新浏览量
  incrementViewCount(id: string): void {
    if (!this.data) return

    const website = this.data.websites.find(w => w.id === id)
    if (website) {
      website.viewCount++
      this.saveToLocalStorage(this.data)
    }
  }

  // 切换收藏状态
  toggleFavorite(id: string): void {
    if (!this.data) return

    const website = this.data.websites.find(w => w.id === id)
    if (website) {
      website.isFavorite = !website.isFavorite
      this.saveToLocalStorage(this.data)
    }
  }

  // 更新标签列表
  private updateTags(): void {
    if (!this.data) return

    const tagSet = new Set<string>()
    this.data.websites.forEach(website => {
      website.tags.forEach(tag => tagSet.add(tag))
    })
    this.data.tags = Array.from(tagSet).sort()
  }

  // 导出数据
  exportData(): string {
    if (!this.data) {
      throw new Error('数据未初始化')
    }

    const exportData = {
      ...this.data,
      exportedAt: new Date().toISOString()
    }

    return JSON.stringify(exportData, null, 2)
  }

  // 导入数据
  importData(jsonString: string): NavigationData {
    try {
      const importedData = JSON.parse(jsonString) as NavigationData
      
      // 验证数据结构
      if (!importedData.websites || !Array.isArray(importedData.websites)) {
        throw new Error('无效的数据格式')
      }

      // 确保所有网站都有必要的字段
      const validatedWebsites = importedData.websites.map(website => ({
        id: website.id || Date.now().toString(),
        name: website.name || '未命名网站',
        url: website.url || '#',
        description: website.description || '',
        icon: website.icon || '🌐',
        rating: website.rating || 4.0,
        tags: website.tags || [],
        viewCount: website.viewCount || 0,
        isFeatured: website.isFeatured || false,
        isFavorite: website.isFavorite || false,
        createdAt: website.createdAt || new Date().toISOString().split('T')[0],
        updatedAt: website.updatedAt || new Date().toISOString().split('T')[0]
      }))

      const validatedData: NavigationData = {
        id: importedData.id || 'static-nav-data',
        title: importedData.title || '静态导航站',
        description: importedData.description || '发现和收藏优质网站资源，构建你的个人知识库',
        websites: validatedWebsites,
        tags: importedData.tags || [],
        createdAt: importedData.createdAt || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }

      this.data = validatedData
      this.updateTags()
      this.saveToLocalStorage(validatedData)
      
      return validatedData
    } catch (error) {
      console.error('导入数据失败:', error)
      throw new Error('数据格式无效')
    }
  }

  // 生成分享URL
  generateShareUrl(): string {
    if (!this.data) {
      throw new Error('数据未初始化')
    }

    const shareData = {
      title: this.data.title,
      description: this.data.description,
      websites: this.data.websites,
      tags: this.data.tags,
      sharedAt: new Date().toISOString()
    }

    const encodedData = btoa(JSON.stringify(shareData))
    return `${window.location.origin}${window.location.pathname}?data=${encodedData}`
  }

  // 从URL加载数据
  loadFromUrl(): NavigationData | null {
    const urlParams = new URLSearchParams(window.location.search)
    const encodedData = urlParams.get('data')
    
    if (!encodedData) {
      return null
    }

    try {
      const decodedData = atob(encodedData)
      const shareData = JSON.parse(decodedData)
      
      const importedData: NavigationData = {
        id: 'shared-data',
        title: shareData.title || '分享的导航数据',
        description: shareData.description || '',
        websites: shareData.websites || [],
        tags: shareData.tags || [],
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }

      this.data = importedData
      this.updateTags()
      this.saveToLocalStorage(importedData)
      
      return importedData
    } catch (error) {
      console.error('从URL加载数据失败:', error)
      return null
    }
  }

  // 保存到本地存储
  private saveToLocalStorage(data: NavigationData): void {
    try {
      localStorage.setItem('static-nav-data', JSON.stringify(data))
    } catch (error) {
      console.error('保存到本地存储失败:', error)
    }
  }

  // 从本地存储加载
  private loadFromLocalStorage(): NavigationData | null {
    try {
      const savedData = localStorage.getItem('static-nav-data')
      if (savedData) {
        return JSON.parse(savedData)
      }
    } catch (error) {
      console.error('从本地存储加载失败:', error)
    }
    return null
  }

  // 清除本地存储
  clearLocalStorage(): void {
    try {
      localStorage.removeItem('static-nav-data')
    } catch (error) {
      console.error('清除本地存储失败:', error)
    }
  }

  // 重置为默认数据
  async resetToDefault(): Promise<NavigationData> {
    this.clearLocalStorage()
    return await this.loadInitialData()
  }
}

// 导出单例实例
export const dataManager = DataManager.getInstance()

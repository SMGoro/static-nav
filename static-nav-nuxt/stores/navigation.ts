import { defineStore } from 'pinia'
import type { Website, NavigationData, SearchFilters } from '~/types'

export const useNavigationStore = defineStore('navigation', () => {
  // 状态
  const websites = ref<Website[]>([
    {
      id: '1',
      name: 'ChatGPT',
      url: 'https://chat.openai.com',
      description: 'OpenAI开发的AI聊天助手,提供智能对话和内容生成服务',
      icon: '🤖',
      rating: 4.5,
      tags: ['AI工具', '付费', 'AI助手', '聊天'],
      viewCount: 9876,
      isFeatured: true,
      isFavorite: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Figma',
      url: 'https://figma.com',
      description: '现代化的协作式设计工具,支持实时协作和原型制作',
      icon: '🎨',
      rating: 4.7,
      tags: ['设计工具', '付费', 'UI/UX'],
      viewCount: 8765,
      isFeatured: true,
      isFavorite: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '3',
      name: 'GitHub',
      url: 'https://github.com',
      description: '全球最大的代码托管平台,开发者协作的首选工具',
      icon: '🐙',
      rating: 4.8,
      tags: ['开发工具', '代码托管'],
      viewCount: 12345,
      isFeatured: true,
      isFavorite: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '4',
      name: 'Midjourney',
      url: 'https://midjourney.com',
      description: 'AI图像生成工具,通过文字描述创造惊艳的艺术作品',
      icon: '🎭',
      rating: 4.3,
      tags: ['AI工具', '付费', 'AI绘画', '图像生成', '英语'],
      viewCount: 6543,
      isFeatured: false,
      isFavorite: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '5',
      name: 'Notion',
      url: 'https://notion.so',
      description: '集文档、数据库、任务管理于一体的全能工作空间',
      icon: '📝',
      rating: 4.4,
      tags: ['生产力工具', '付费', '笔记', '数据库'],
      viewCount: 7654,
      isFeatured: false,
      isFavorite: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: '6',
      name: 'VS Code',
      url: 'https://code.visualstudio.com',
      description: '微软开发的免费代码编辑器,支持丰富的扩展生态',
      icon: '💻',
      rating: 4.6,
      tags: ['开发工具', '代码编辑器', 'IDE'],
      viewCount: 10987,
      isFeatured: false,
      isFavorite: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ])

  const filters = ref<SearchFilters>({
    query: '',
    selectedTags: [],
    sortBy: 'name',
    sortOrder: 'asc',
    layout: 'grid'
  })

  const isDarkMode = ref(false)

  // 计算属性
  const allTags = computed(() => {
    const tagCounts: Record<string, number> = {}
    websites.value.forEach(website => {
      website.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })
    return Object.entries(tagCounts).map(([name, count]) => ({ name, count }))
  })

  const filteredWebsites = computed(() => {
    let filtered = websites.value

    // 搜索过滤
    if (filters.value.query) {
      const query = filters.value.query.toLowerCase()
      filtered = filtered.filter(website =>
        website.name.toLowerCase().includes(query) ||
        website.description.toLowerCase().includes(query) ||
        website.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // 标签过滤
    if (filters.value.selectedTags.length > 0) {
      filtered = filtered.filter(website =>
        filters.value.selectedTags.some(tag => website.tags.includes(tag))
      )
    }

    // 排序
    filtered.sort((a, b) => {
      let aValue: any = a[filters.value.sortBy]
      let bValue: any = b[filters.value.sortBy]

      if (filters.value.sortBy === 'name') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (filters.value.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  })

  const totalWebsites = computed(() => websites.value.length)
  const filteredCount = computed(() => filteredWebsites.value.length)

  // 方法
  const addWebsite = (website: Omit<Website, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newWebsite: Website = {
      ...website,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    websites.value.push(newWebsite)
  }

  const updateWebsite = (id: string, updates: Partial<Website>) => {
    const index = websites.value.findIndex(w => w.id === id)
    if (index !== -1) {
      websites.value[index] = {
        ...websites.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
    }
  }

  const deleteWebsite = (id: string) => {
    const index = websites.value.findIndex(w => w.id === id)
    if (index !== -1) {
      websites.value.splice(index, 1)
    }
  }

  const toggleTag = (tag: string) => {
    const index = filters.value.selectedTags.indexOf(tag)
    if (index === -1) {
      filters.value.selectedTags.push(tag)
    } else {
      filters.value.selectedTags.splice(index, 1)
    }
  }

  const clearFilters = () => {
    filters.value.query = ''
    filters.value.selectedTags = []
  }

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const exportData = (): NavigationData => {
    return {
      id: Date.now().toString(),
      title: '我的导航站',
      description: '个人收藏的优质网站',
      websites: websites.value,
      tags: allTags.value.map(tag => tag.name),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  const importData = (data: NavigationData) => {
    websites.value = data.websites
  }

  const generateShareUrl = (): string => {
    const data = exportData()
    const encoded = btoa(JSON.stringify(data))
    return `${window.location.origin}${window.location.pathname}?data=${encoded}`
  }

  const loadFromUrl = () => {
    if (process.client) {
      const urlParams = new URLSearchParams(window.location.search)
      const dataParam = urlParams.get('data')
      if (dataParam) {
        try {
          const data = JSON.parse(atob(dataParam))
          importData(data)
        } catch (error) {
          console.error('Failed to load data from URL:', error)
        }
      }
    }
  }

  return {
    // 状态
    websites,
    filters,
    isDarkMode,
    
    // 计算属性
    allTags,
    filteredWebsites,
    totalWebsites,
    filteredCount,
    
    // 方法
    addWebsite,
    updateWebsite,
    deleteWebsite,
    toggleTag,
    clearFilters,
    toggleDarkMode,
    exportData,
    importData,
    generateShareUrl,
    loadFromUrl
  }
})

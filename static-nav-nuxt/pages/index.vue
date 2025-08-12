<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
    <!-- 头部导航 -->
    <header class="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span class="text-white text-xl">🚀</span>
            </div>
            <h1 class="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              静态导航
            </h1>
          </div>

          <!-- 导航菜单 -->
          <nav class="hidden md:flex items-center space-x-1">
            <NuxtLink
              to="/"
              class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
              :class="isActive('/') ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
            >
              <span>🏠</span>
              <span>首页</span>
            </NuxtLink>
            <NuxtLink
              to="/ai"
              class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
              :class="isActive('/ai') ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
            >
              <span>✨</span>
              <span>AI推荐</span>
            </NuxtLink>
            <button
              @click="showFavorites = !showFavorites"
              class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
              :class="showFavorites ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' : 'text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
            >
              <span>❤️</span>
              <span>我的收藏</span>
            </button>
          </nav>

          <!-- 右侧操作 -->
          <div class="flex items-center space-x-3">
            <!-- 添加网站按钮 -->
            <button
              @click="showAddModal = true"
              class="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span>➕</span>
              <span>添加网站</span>
            </button>

            <!-- 数据管理按钮 -->
            <button
              @click="showDataManager = true"
              class="flex items-center justify-center w-10 h-10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title="数据管理"
            >
              <span>⚙️</span>
            </button>
            
            <!-- 深色模式切换 -->
            <button
              @click="toggleDarkMode"
              class="flex items-center justify-center w-10 h-10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span v-if="isDarkMode">☀️</span>
              <span v-else>🌙</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 英雄区域 -->
      <div class="text-center mb-12">
        <div class="mb-8">
          <h1 class="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-600 to-slate-900 dark:from-white dark:via-blue-400 dark:to-white bg-clip-text text-transparent mb-6">
            发现优质网站
          </h1>
          <p class="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            构建你的个人知识库，收藏和管理最实用的网站资源
          </p>
        </div>

        <!-- 搜索框 -->
        <div class="max-w-2xl mx-auto">
          <div class="relative group">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索网站、标签或描述..."
              class="w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-800 dark:text-white transition-all duration-300 group-hover:border-slate-300 dark:group-hover:border-slate-500 text-lg"
            />
            <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">🔍</span>
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 text-center border border-slate-200/50 dark:border-slate-700/50">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ totalWebsites }}</div>
          <div class="text-sm text-slate-600 dark:text-slate-400">总网站数</div>
        </div>
        <div class="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 text-center border border-slate-200/50 dark:border-slate-700/50">
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ featuredCount }}</div>
          <div class="text-sm text-slate-600 dark:text-slate-400">精选网站</div>
        </div>
        <div class="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 text-center border border-slate-200/50 dark:border-slate-700/50">
          <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ allTags.length }}</div>
          <div class="text-sm text-slate-600 dark:text-slate-400">标签分类</div>
        </div>
        <div class="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 text-center border border-slate-200/50 dark:border-slate-700/50">
          <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ totalViews }}</div>
          <div class="text-sm text-slate-600 dark:text-slate-400">总浏览量</div>
        </div>
      </div>

      <!-- 筛选和排序 -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <!-- 标签筛选 -->
        <div class="flex flex-wrap gap-2">
          <button
            @click="clearFilters"
            class="px-3 py-1.5 text-sm rounded-full transition-all duration-200"
            :class="selectedTags.length === 0 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'"
          >
            全部
          </button>
          <button
            v-for="tag in allTags.slice(0, 8)"
            :key="tag"
            @click="toggleTag(tag)"
            class="px-3 py-1.5 text-sm rounded-full transition-all duration-200"
            :class="selectedTags.includes(tag) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'"
          >
            {{ tag }}
          </button>
          <span v-if="allTags.length > 8" class="px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400">
            +{{ allTags.length - 8 }}
          </span>
        </div>

        <!-- 排序和布局 -->
        <div class="flex items-center space-x-4">
          <!-- 排序 -->
          <select
            v-model="sortBy"
            class="px-3 py-2 bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
          >
            <option value="name">按名称</option>
            <option value="rating">按评分</option>
            <option value="viewCount">按浏览量</option>
            <option value="createdAt">按添加时间</option>
          </select>

          <!-- 布局切换 -->
          <div class="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              @click="layout = 'grid'"
              class="p-2 rounded transition-colors"
              :class="layout === 'grid' ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            >
              <span class="text-lg">⊞</span>
            </button>
            <button
              @click="layout = 'list'"
              class="p-2 rounded transition-colors"
              :class="layout === 'list' ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            >
              <span class="text-lg">☰</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 网站列表 -->
      <div 
        class="gap-6"
        :class="layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'"
      >
        <div
          v-for="website in filteredAndSortedWebsites"
          :key="website.id"
          class="group relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          :class="layout === 'list' ? 'flex items-center space-x-4' : ''"
        >
          <!-- 背景装饰 -->
          <div class="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div class="relative z-10 w-full" :class="layout === 'list' ? 'flex items-center space-x-4' : ''">
            <!-- 图标和基本信息 -->
            <div :class="layout === 'list' ? 'flex items-center space-x-4 flex-1' : ''">
              <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-xl flex items-center justify-center shadow-sm text-2xl">
                {{ website.icon }}
              </div>
              
              <div class="flex-1 min-w-0" :class="layout === 'list' ? 'flex items-center justify-between' : 'mt-4'">
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
                    {{ website.name }}
                  </h3>
                  <div class="flex items-center space-x-3 mt-1">
                    <div class="flex items-center">
                      <span class="text-yellow-400">⭐</span>
                      <span class="text-sm text-slate-600 dark:text-slate-400 ml-1 font-medium">{{ website.rating }}</span>
                    </div>
                    <div class="flex items-center text-slate-500 dark:text-slate-400">
                      <span class="mr-1">👁️</span>
                      <span class="text-sm font-medium">{{ formatNumber(website.viewCount) }}</span>
                    </div>
                  </div>
                </div>
                
                <!-- 精选标签 -->
                <div v-if="website.isFeatured" class="flex-shrink-0 ml-4">
                  <span class="text-yellow-500 text-xs font-medium flex items-center px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 rounded-full border border-yellow-200 dark:border-yellow-800">
                    <span class="mr-1">⭐</span>
                    精选
                  </span>
                </div>
              </div>
            </div>

            <!-- 描述 -->
            <p 
              class="text-slate-600 dark:text-slate-300 text-sm mb-4 leading-relaxed"
              :class="layout === 'list' ? 'flex-1 max-w-md' : 'line-clamp-2'"
            >
              {{ website.description }}
            </p>

            <!-- 标签 -->
            <div class="flex flex-wrap gap-2 mb-6" :class="layout === 'list' ? 'flex-1' : ''">
              <span
                v-for="tag in website.tags.slice(0, 3)"
                :key="tag"
                class="tag text-xs px-2.5 py-1 rounded-full transition-all duration-200 hover:scale-105"
                :class="selectedTags.includes(tag) ? 'tag-primary shadow-sm scale-105' : ''"
              >
                {{ tag }}
              </span>
              <span
                v-if="website.tags.length > 3"
                class="tag text-xs px-2.5 py-1 rounded-full text-slate-500 bg-slate-100 dark:bg-slate-700"
              >
                +{{ website.tags.length - 3 }}
              </span>
            </div>

            <!-- 底部操作 -->
            <div class="flex justify-between items-center" :class="layout === 'list' ? 'flex-shrink-0' : ''">
              <a
                :href="website.url"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-primary flex items-center space-x-2 flex-1 justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                @click="incrementViewCount(website.id)"
              >
                <span>🔗</span>
                <span>访问网站</span>
              </a>
              
              <!-- 操作按钮 -->
              <div class="flex items-center space-x-2 ml-3">
                <button
                  @click="toggleFavorite(website.id)"
                  class="p-2 rounded-lg transition-colors"
                  :class="website.isFavorite ? 'text-red-500 hover:text-red-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'"
                >
                  <span class="text-lg">{{ website.isFavorite ? '❤️' : '🤍' }}</span>
                </button>
                <button
                  @click="editWebsite(website)"
                  class="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <span class="text-lg">✏️</span>
                </button>
                <button
                  @click="deleteWebsite(website.id)"
                  class="p-2 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <span class="text-lg">🗑️</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredAndSortedWebsites.length === 0" class="text-center py-16">
        <div class="w-24 h-24 mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
          <span class="text-4xl">🔍</span>
        </div>
        <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">没有找到网站</h3>
        <p class="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
          {{ searchQuery || selectedTags.length > 0 ? '尝试调整搜索条件或筛选标签' : '开始添加你的第一个网站吧，构建你的个人知识库' }}
        </p>
        <button
          @click="showAddModal = true"
          class="btn-primary flex items-center space-x-2 mx-auto"
        >
          <span>➕</span>
          <span>添加网站</span>
        </button>
      </div>
    </main>

    <!-- 网站编辑模态框 -->
    <WebsiteModal
      :is-open="showAddModal"
      :website="editingWebsite"
      @close="closeWebsiteModal"
      @saved="handleWebsiteSaved"
    />

    <!-- 数据管理模态框 -->
    <DataManager
      :is-open="showDataManager"
      :data="navigationData"
      @close="showDataManager = false"
      @data-updated="handleDataUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import type { NavigationData, Website } from '~/types'
import { dataManager } from '~/utils/dataManager'

const route = useRoute()
const isDarkMode = ref(false)
const searchQuery = ref('')
const selectedTags = ref<string[]>([])
const sortBy = ref<'name' | 'rating' | 'viewCount' | 'createdAt'>('name')
const sortOrder = ref<'asc' | 'desc'>('asc')
const layout = ref<'grid' | 'list'>('grid')
const showFavorites = ref(false)
const showAddModal = ref(false)
const showDataManager = ref(false)
const editingWebsite = ref<Website | null>(null)

// 数据状态 - 使用静态数据
const websites = ref([
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
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02'
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
    createdAt: '2024-01-03',
    updatedAt: '2024-01-03'
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
    createdAt: '2024-01-04',
    updatedAt: '2024-01-04'
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
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05'
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
    createdAt: '2024-01-06',
    updatedAt: '2024-01-06'
  }
])

// 计算属性
const allTags = computed(() => {
  const tags = new Set<string>()
  websites.value.forEach(website => {
    website.tags.forEach(tag => tags.add(tag))
  })
  return Array.from(tags).sort()
})

const filteredWebsites = computed(() => {
  let filtered = websites.value

  // 收藏过滤
  if (showFavorites.value) {
    filtered = filtered.filter(website => website.isFavorite)
  }

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(website =>
      website.name.toLowerCase().includes(query) ||
      website.description.toLowerCase().includes(query) ||
      website.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // 标签过滤
  if (selectedTags.value.length > 0) {
    filtered = filtered.filter(website =>
      selectedTags.value.some(tag => website.tags.includes(tag))
    )
  }

  return filtered
})

const filteredAndSortedWebsites = computed(() => {
  const sorted = [...filteredWebsites.value].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortBy.value) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'rating':
        aValue = a.rating
        bValue = b.rating
        break
      case 'viewCount':
        aValue = a.viewCount
        bValue = b.viewCount
        break
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
        break
      default:
        return 0
    }

    if (sortOrder.value === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  return sorted
})

const totalWebsites = computed(() => websites.value.length)
const featuredCount = computed(() => websites.value.filter(w => w.isFeatured).length)
const totalViews = computed(() => websites.value.reduce((sum, w) => sum + w.viewCount, 0))

// 方法
const isActive = (path: string) => {
  return route.path === path
}

const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

const clearFilters = () => {
  selectedTags.value = []
  searchQuery.value = ''
  showFavorites.value = false
}

const incrementViewCount = (id: string) => {
  const website = websites.value.find(w => w.id === id)
  if (website) {
    website.viewCount++
  }
}

const toggleFavorite = (id: string) => {
  const website = websites.value.find(w => w.id === id)
  if (website) {
    website.isFavorite = !website.isFavorite
  }
}

const editWebsite = (website: Website) => {
  editingWebsite.value = website
  showAddModal.value = true
}

const deleteWebsite = (id: string) => {
  if (confirm('确定要删除这个网站吗？')) {
    const index = websites.value.findIndex(w => w.id === id)
    if (index > -1) {
      websites.value.splice(index, 1)
    }
  }
}

const closeWebsiteModal = () => {
  showAddModal.value = false
  editingWebsite.value = null
}

const handleWebsiteSaved = (websiteData: Omit<Website, 'id' | 'createdAt' | 'updatedAt'>) => {
  if (editingWebsite.value) {
    // 编辑现有网站
    const index = websites.value.findIndex(w => w.id === editingWebsite.value!.id)
    if (index > -1) {
      websites.value[index] = {
        ...websites.value[index],
        ...websiteData,
        updatedAt: new Date().toISOString().split('T')[0]
      }
    }
  } else {
    // 添加新网站
    const newWebsite = {
      ...websiteData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    } as Website
    websites.value.unshift(newWebsite)
  }
}

const handleDataUpdated = (data: NavigationData) => {
  websites.value = data.websites
}

// 生命周期
onMounted(() => {
  // 检查系统偏好
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

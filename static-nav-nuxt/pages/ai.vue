<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
    <!-- 头部导航 -->
    <header class="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="heroicons:squares-2x2" class="w-6 h-6 text-white" />
            </div>
            <h1 class="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              静态导航
            </h1>
          </div>

          <!-- 导航链接 -->
          <nav class="hidden md:flex items-center space-x-1">
            <NuxtLink
              to="/"
              class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
              :class="isActive('/') ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
            >
              <Icon name="heroicons:home" class="w-5 h-5" />
              <span>首页</span>
            </NuxtLink>
            <NuxtLink
              to="/ai"
              class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
              :class="isActive('/ai') ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
            >
              <Icon name="heroicons:sparkles" class="w-5 h-5" />
              <span>AI推荐</span>
            </NuxtLink>
          </nav>

          <!-- 右侧操作 -->
          <div class="flex items-center space-x-3">
            <!-- 深色模式切换 -->
            <button
              @click="store.toggleDarkMode()"
              class="flex items-center justify-center w-10 h-10 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Icon v-if="store.isDarkMode" name="heroicons:sun" class="w-5 h-5" />
              <Icon v-else name="heroicons:moon" class="w-5 h-5" />
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
          <h1 class="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-purple-600 to-slate-900 dark:from-white dark:via-purple-400 dark:to-white bg-clip-text text-transparent mb-6">
            AI 智能推荐
          </h1>
          <p class="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            基于你的收藏和偏好，AI为你推荐最相关的优质网站
          </p>
        </div>

        <!-- 推荐输入 -->
        <div class="max-w-2xl mx-auto">
          <div class="relative group">
            <input
              v-model="recommendationQuery"
              type="text"
              placeholder="描述你需要的网站类型或功能..."
              class="w-full pl-12 pr-4 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 dark:bg-slate-800 dark:text-white transition-all duration-300 group-hover:border-slate-300 dark:group-hover:border-slate-500 text-lg"
            />
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors">✨</span>
          </div>
          <button
            @click="generateRecommendations"
            :disabled="isGenerating"
            class="mt-4 btn-primary bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 flex items-center space-x-2 mx-auto"
          >
            <span v-if="isGenerating" class="animate-spin">🔄</span>
            <span v-else>✨</span>
            <span>{{ isGenerating ? '生成中...' : '生成推荐' }}</span>
          </button>
        </div>
      </div>

      <!-- 推荐结果 -->
      <div v-if="recommendations.length > 0" class="space-y-6">
        <h2 class="text-2xl font-semibold text-slate-900 dark:text-white flex items-center">
          <span class="mr-2">💡</span>
          为你推荐
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="recommendation in recommendations"
            :key="recommendation.name"
            class="group relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <!-- 背景装饰 -->
            <div class="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div class="relative z-10">
              <!-- 头部 -->
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-3 flex-1 min-w-0">
                  <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-700 dark:to-purple-600 rounded-xl flex items-center justify-center shadow-sm text-2xl">🚀</div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors truncate">
                      {{ recommendation.name }}
                    </h3>
                    <p class="text-sm text-slate-500 dark:text-slate-400">
                      {{ recommendation.url }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- 描述 -->
              <p class="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3 leading-relaxed">
                {{ recommendation.description }}
              </p>

              <!-- 推荐理由 -->
               <div class="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                 <div class="flex items-start space-x-2">
                   <span class="mt-0.5 flex-shrink-0">✨</span>
                   <p class="text-sm text-purple-700 dark:text-purple-300">{{ recommendation.reason }}</p>
                 </div>
               </div>

              <!-- 标签 -->
              <div class="flex flex-wrap gap-2 mb-6">
                <span
                  v-for="tag in recommendation.tags"
                  :key="tag"
                  class="tag text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                >
                  {{ tag }}
                </span>
              </div>

              <!-- 操作按钮 -->
              <div class="flex space-x-2">
                 <a
                  :href="recommendation.url"
                  target="_blank"
                  rel="noopener noreferrer"
                   class="flex-1 btn-primary bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 flex items-center justify-center space-x-2"
                >
                   <span>🔗</span>
                   <span>访问</span>
                </a>
                <button
                  @click="addToCollection(recommendation)"
                  class="px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
                >
                   <span>➕</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!isGenerating" class="text-center py-16">
        <div class="w-24 h-24 mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">✨</div>
        <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">开始你的AI推荐之旅</h3>
        <p class="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
          输入你的需求，AI将为你推荐最相关的优质网站
        </p>
      </div>

      <!-- 加载状态 -->
      <div v-if="isGenerating" class="text-center py-16">
        <div class="w-24 h-24 mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center"><span class="animate-spin">🔄</span></div>
        <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">AI正在思考...</h3>
        <p class="text-slate-500 dark:text-slate-400">
          正在为你生成个性化推荐
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { AIRecommendation } from '~/types'
import { dataManager } from '~/utils/dataManager'

const route = useRoute()
const store = useNavigationStore()
const recommendationQuery = ref('')
const recommendations = ref<AIRecommendation[]>([])
const isGenerating = ref(false)

const isActive = (path: string) => {
  return route.path === path
}

const generateRecommendations = async () => {
  if (!recommendationQuery.value.trim()) {
    alert('请输入你的需求描述')
    return
  }

  isGenerating.value = true
  
  // 模拟AI推荐生成
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 基于查询生成推荐
  const mockRecommendations: AIRecommendation[] = [
    {
      name: 'Notion AI',
      url: 'https://notion.so',
      description: '集成了AI功能的全能工作空间，支持智能写作、内容生成和任务管理',
      tags: ['AI工具', '生产力', '笔记'],
      reason: '基于你的需求，这是一个功能强大的AI辅助工具，可以帮助提高工作效率'
    },
    {
      name: 'ChatGPT',
      url: 'https://chat.openai.com',
      description: 'OpenAI开发的AI聊天助手，提供智能对话和内容生成服务',
      tags: ['AI工具', '聊天', '内容生成'],
      reason: '这是目前最流行的AI对话工具，可以满足你的各种AI需求'
    },
    {
      name: 'Midjourney',
      url: 'https://midjourney.com',
      description: 'AI图像生成工具，通过文字描述创造惊艳的艺术作品',
      tags: ['AI工具', '图像生成', '艺术'],
      reason: '如果你需要AI图像生成功能，这是目前最好的选择之一'
    }
  ]
  
  recommendations.value = mockRecommendations
  isGenerating.value = false
}

const addToCollection = (recommendation: AIRecommendation) => {
  dataManager.addWebsite({
    name: recommendation.name,
    url: recommendation.url,
    description: recommendation.description,
    icon: '🚀',
    rating: 4.5,
    tags: recommendation.tags,
    isFeatured: false,
    viewCount: 0,
    isFavorite: false
  })
  
  alert('已添加到收藏！')
}

// 生命周期
onMounted(() => {
  if (store.isDarkMode) {
    document.documentElement.classList.add('dark')
  }
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click="closeModal"
  >
    <div
      class="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200/50 dark:border-slate-700/50"
      @click.stop
    >
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white flex items-center">
            <span class="mr-2">⚙️</span>
            数据管理
          </h2>
          <button
            @click="closeModal"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <span class="text-lg">✕</span>
          </button>
        </div>

        <div class="space-y-6">
          <!-- 导出数据 -->
          <div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
              <span class="mr-2">📤</span>
              导出数据
            </h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
              将你的网站数据导出为JSON文件，可以备份或分享给其他人
            </p>
            <button
              @click="exportData"
              class="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <span>💾</span>
              <span>导出数据</span>
            </button>
          </div>

          <!-- 导入数据 -->
          <div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
              <span class="mr-2">📥</span>
              导入数据
            </h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
              从JSON文件导入网站数据，会覆盖当前的所有数据
            </p>
            <div class="space-y-3">
              <input
                ref="fileInput"
                type="file"
                accept=".json"
                @change="handleFileImport"
                class="hidden"
              />
              <button
                @click="fileInput && fileInput.click()"
                class="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <span>📁</span>
                <span>选择文件</span>
              </button>
              <div class="text-xs text-slate-500 dark:text-slate-400 text-center">
                支持从其他用户分享的JSON文件导入
              </div>
            </div>
          </div>

          <!-- 分享URL -->
          <div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center">
              <span class="mr-2">🔗</span>
              分享数据
            </h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
              生成包含所有网站数据的分享链接
            </p>
            <div class="space-y-3">
              <button
                @click="generateShareUrl"
                class="w-full btn-primary bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 flex items-center justify-center space-x-2"
              >
                <span>🔗</span>
                <span>生成分享链接</span>
              </button>
              <div v-if="shareUrl" class="space-y-2">
                <div class="flex items-center space-x-2">
                  <input
                    :value="shareUrl"
                    readonly
                    class="flex-1 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm"
                  />
                  <button
                    @click="copyShareUrl"
                    class="px-3 py-2 bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-500 transition-colors text-sm"
                  >
                    📋
                  </button>
                </div>
                <div class="text-xs text-slate-500 dark:text-slate-400 text-center">
                  复制链接分享给其他人，他们可以一键导入你的网站数据
                </div>
              </div>
            </div>
          </div>

          <!-- 重置数据 -->
          <div class="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
            <h3 class="text-lg font-semibold text-red-900 dark:text-red-300 mb-3 flex items-center">
              <span class="mr-2">⚠️</span>
              重置数据
            </h3>
            <p class="text-sm text-red-700 dark:text-red-400 mb-4">
              将数据重置为默认状态，此操作不可撤销
            </p>
            <button
              @click="resetData"
              class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              重置为默认数据
            </button>
          </div>

          <!-- 统计信息 -->
          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center">
              <span class="mr-2">📊</span>
              数据统计
            </h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.totalWebsites }}</div>
                <div class="text-blue-700 dark:text-blue-300">总网站数</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.totalTags }}</div>
                <div class="text-blue-700 dark:text-blue-300">标签分类</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.featuredCount }}</div>
                <div class="text-blue-700 dark:text-blue-300">精选网站</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ stats.totalViews }}</div>
                <div class="text-blue-700 dark:text-blue-300">总浏览量</div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-6">
          <button
            @click="closeModal"
            class="btn-secondary"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NavigationData } from '~/types'

const props = defineProps<{
  isOpen: boolean
  data: NavigationData | null
}>()

const emit = defineEmits<{
  close: []
  dataUpdated: [data: NavigationData]
}>()

const fileInput = ref<HTMLInputElement>()
const shareUrl = ref('')

const stats = computed(() => {
  if (!props.data) {
    return {
      totalWebsites: 0,
      totalTags: 0,
      featuredCount: 0,
      totalViews: 0
    }
  }

  return {
    totalWebsites: props.data.websites.length,
    totalTags: props.data.tags.length,
    featuredCount: props.data.websites.filter(w => w.isFeatured).length,
    totalViews: props.data.websites.reduce((sum, w) => sum + w.viewCount, 0)
  }
})

const exportData = () => {
  if (!props.data) return

  const exportData = {
    ...props.data,
    exportedAt: new Date().toISOString()
  }

  const dataStr = JSON.stringify(exportData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `static-nav-data-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  // 显示成功提示
  alert('数据导出成功！')
}

const handleFileImport = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const importedData = JSON.parse(content) as NavigationData
      
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
        id: importedData.id || 'imported-data',
        title: importedData.title || '导入的导航数据',
        description: importedData.description || '',
        websites: validatedWebsites,
        tags: importedData.tags || [],
        createdAt: importedData.createdAt || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }

      emit('dataUpdated', validatedData)
      alert('数据导入成功！')
    } catch (error) {
      console.error('导入数据失败:', error)
      alert('数据格式无效，请检查文件内容')
    }
  }
  
  reader.readAsText(file)
  
  // 清空文件输入
  if (target) {
    target.value = ''
  }
}

const generateShareUrl = () => {
  if (!props.data) return

  const shareData = {
    title: props.data.title,
    description: props.data.description,
    websites: props.data.websites,
    tags: props.data.tags,
    sharedAt: new Date().toISOString()
  }

  const encodedData = btoa(JSON.stringify(shareData))
  shareUrl.value = `${window.location.origin}${window.location.pathname}?data=${encodedData}`
}

const copyShareUrl = async () => {
  if (!shareUrl.value) return

  try {
    await navigator.clipboard.writeText(shareUrl.value)
    alert('分享链接已复制到剪贴板！')
  } catch (error) {
    console.error('复制失败:', error)
    alert('复制失败，请手动复制链接')
  }
}

const resetData = async () => {
  if (!confirm('确定要重置数据吗？此操作不可撤销！')) {
    return
  }

  try {
    const response = await fetch('/data/websites.json')
    const defaultData = await response.json()
    emit('dataUpdated', defaultData)
    alert('数据已重置为默认状态！')
  } catch (error) {
    console.error('重置数据失败:', error)
    alert('重置数据失败，请刷新页面重试')
  }
}

const closeModal = () => {
  shareUrl.value = ''
  emit('close')
}
</script>

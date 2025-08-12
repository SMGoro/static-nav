<template>
  <div class="group relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
    <!-- 背景装饰 -->
    <div class="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    
    <div class="relative z-10">
      <!-- 头部区域 -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center space-x-3 flex-1 min-w-0">
          <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-xl flex items-center justify-center shadow-sm text-2xl">
            {{ website.icon }}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
              {{ website.name }}
            </h3>
            <div class="flex items-center space-x-3 mt-1">
              <div class="flex items-center">
                <Icon name="heroicons:star" class="w-4 h-4 text-yellow-400" />
                <span class="text-sm text-slate-600 dark:text-slate-400 ml-1 font-medium">{{ website.rating }}</span>
              </div>
              <div class="flex items-center text-slate-500 dark:text-slate-400">
                <Icon name="heroicons:eye" class="w-4 h-4 mr-1" />
                <span class="text-sm font-medium">{{ formatNumber(website.viewCount) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="flex items-center space-x-2 flex-shrink-0">
          <button
            v-if="website.isFeatured"
            class="text-yellow-500 text-xs font-medium flex items-center px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 rounded-full border border-yellow-200 dark:border-yellow-800"
          >
            <Icon name="heroicons:star" class="w-3 h-3 mr-1" />
            精选
          </button>
          <div class="relative">
            <button
              @click="showActions = !showActions"
              class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <Icon name="heroicons:ellipsis-vertical" class="w-4 h-4" />
            </button>
            <div
              v-if="showActions"
              class="absolute right-0 top-10 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 py-2 z-20 min-w-[140px] animate-fade-in"
            >
              <button
                @click="editWebsite"
                class="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center space-x-2"
              >
                <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                <span>编辑</span>
              </button>
              <button
                @click="deleteWebsite"
                class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-2"
              >
                <Icon name="heroicons:trash" class="w-4 h-4" />
                <span>删除</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 描述 -->
      <p class="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2 leading-relaxed">
        {{ website.description }}
      </p>

      <!-- 标签 -->
      <div class="flex flex-wrap gap-2 mb-6">
        <span
          v-for="tag in displayTags"
          :key="tag"
          class="tag text-xs px-2.5 py-1 rounded-full transition-all duration-200 hover:scale-105"
          :class="{ 'tag-primary shadow-sm scale-105': store.filters.selectedTags.includes(tag) }"
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
      <div class="flex justify-between items-center">
        <a
          :href="website.url"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-primary flex items-center space-x-2 flex-1 justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          @click="incrementViewCount"
        >
          <Icon name="heroicons:arrow-top-right-on-square" class="w-4 h-4" />
          <span>访问网站</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Website } from '~/types'

const props = defineProps<{
  website: Website
}>()

const emit = defineEmits<{
  edit: [website: Website]
}>()

const store = useNavigationStore()
const showActions = ref(false)

const displayTags = computed(() => {
  return props.website.tags.slice(0, 3)
})

const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

const incrementViewCount = () => {
  store.updateWebsite(props.website.id, {
    viewCount: props.website.viewCount + 1
  })
}

const editWebsite = () => {
  emit('edit', props.website)
  showActions.value = false
}

const deleteWebsite = () => {
  if (confirm('确定要删除这个网站吗？')) {
    store.deleteWebsite(props.website.id)
  }
  showActions.value = false
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

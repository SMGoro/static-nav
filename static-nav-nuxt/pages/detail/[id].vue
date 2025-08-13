<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
    <header class="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">← 返回首页</NuxtLink>
        <div class="flex items-center space-x-3">
          <button @click="toggleDark" class="w-10 h-10 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">{{ isDark ? '☀️' : '🌙' }}</button>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="website" class="bg-white/90 dark:bg-slate-800/90 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-3xl">{{ website.icon }}</div>
            <div>
              <h1 class="text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                {{ website.name }}
                <span v-if="website.isFeatured" class="text-xs px-2 py-0.5 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">⭐ 精选</span>
              </h1>
              <a :href="website.url" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 break-all">{{ website.url }}</a>
            </div>
          </div>
          <div class="text-slate-500 dark:text-slate-400">
            👁️ {{ formatNumber(website.viewCount) }}
          </div>
        </div>

        <p class="mt-4 text-slate-700 dark:text-slate-300 leading-relaxed">{{ website.description }}</p>

        <div class="flex flex-wrap gap-2 mt-4">
          <span v-for="tag in website.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <div class="mt-6 flex items-center gap-3">
          <a :href="website.url" target="_blank" rel="noopener noreferrer" class="btn-primary flex items-center gap-2"><span>🔗</span><span>访问网站</span></a>
          <button @click="addOrToggleFavorite" class="btn-secondary flex items-center gap-2">
            <span>{{ website.isFavorite ? '❤️' : '🤍' }}</span>
            <span>{{ website.isFavorite ? '已收藏' : '收藏' }}</span>
          </button>
        </div>
      </div>

      <div v-else class="text-center text-slate-500 dark:text-slate-400 py-16">未找到该网站</div>

      <div v-if="sharedPayload && !alreadyImported" class="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <div class="flex items-start justify-between">
          <div class="text-slate-700 dark:text-slate-300">检测到分享内容，是否将该网站添加到你的收藏？</div>
          <button @click="importShared" class="btn-primary py-2 px-4">一键导入</button>
        </div>
      </div>
    </main>
  </div>
  
</template>

<script setup lang="ts">
import type { Website } from '~/types'
import { dataManager } from '~/utils/dataManager'

const route = useRoute()
const isDark = ref(false)
const website = ref<Website | null>(null)
const sharedPayload = ref<any | null>(null)
const alreadyImported = ref(false)

const formatNumber = (num: number): string => {
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num.toString()
}

const load = async () => {
  let data = dataManager.getData()
  if (!data) {
    const shared = dataManager.loadFromUrl()
    data = shared || await dataManager.loadInitialData()
  }
  const id = route.params.id as string
  website.value = data?.websites.find(w => w.id === id) || null

  const shareParam = route.query.share as string | undefined
  if (shareParam) {
    try {
      const decoded = atob(shareParam)
      sharedPayload.value = JSON.parse(decoded)
      if (sharedPayload.value?.website) {
        alreadyImported.value = !!data?.websites.some(w => w.url === sharedPayload.value.website.url)
      }
    } catch {}
  }
}

const addOrToggleFavorite = () => {
  if (!website.value) return
  dataManager.updateWebsite(website.value.id, { isFavorite: !website.value.isFavorite })
  const latest = dataManager.getData()
  if (latest) website.value = latest.websites.find(w => w.id === website.value!.id) || null
}

const importShared = () => {
  if (!sharedPayload.value?.website) return
  const w = sharedPayload.value.website
  dataManager.addWebsite({
    name: w.name,
    url: w.url,
    description: w.description,
    icon: w.icon || '🌐',
    rating: Number(w.rating) || 4.0,
    tags: Array.isArray(w.tags) ? w.tags : [],
    isFeatured: !!w.isFeatured,
    viewCount: 0,
    isFavorite: false
  })
  alreadyImported.value = true
  alert('已导入到收藏')
}

const toggleDark = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

onMounted(load)
</script>


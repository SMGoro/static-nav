<template>
  <div
    v-if="isOpen && website"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click="emitClose"
  >
    <div
      class="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full border border-slate-200/50 dark:border-slate-700/50"
      @click.stop
    >
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
            <span class="mr-2">🔗</span>
            分享网站
          </h2>
          <button
            @click="emitClose"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        <div class="space-y-4">
          <div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
            <div class="text-sm text-slate-600 dark:text-slate-300 mb-2">复制分享链接</div>
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
          </div>

          <div class="text-xs text-slate-500 dark:text-slate-400">
            对方打开链接后可在详情页查看网站信息并添加到自己的收藏。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Website } from '~/types'

const props = defineProps<{
  isOpen: boolean
  website: Website | null
}>()

const emit = defineEmits<{ close: [] }>()

const shareUrl = computed(() => {
  if (!props.website) return ''
  const payload = {
    website: {
      id: props.website.id,
      name: props.website.name,
      url: props.website.url,
      description: props.website.description,
      icon: props.website.icon,
      rating: props.website.rating,
      tags: props.website.tags,
      isFeatured: props.website.isFeatured
    },
    sharedAt: new Date().toISOString()
  }
  const encoded = btoa(JSON.stringify(payload))
  return `${window.location.origin}/detail/${props.website.id}?share=${encoded}`
})

const copyShareUrl = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    alert('分享链接已复制到剪贴板！')
  } catch (e) {
    alert('复制失败，请手动复制')
  }
}

const emitClose = () => emit('close')
</script>


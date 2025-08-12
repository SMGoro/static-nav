<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click="closeModal"
  >
    <div
      class="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-200/50 dark:border-slate-700/50"
      @click.stop
    >
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white flex items-center">
            <span class="mr-2">✅</span>
            {{ isEditing ? '编辑网站' : '添加网站' }}
          </h2>
          <button
            @click="closeModal"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <span class="text-lg">✕</span>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              网站名称 *
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-all duration-200"
              placeholder="输入网站名称"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              网站地址 *
            </label>
            <input
              v-model="form.url"
              type="url"
              required
              class="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-all duration-200"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              图标
            </label>
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-xl flex items-center justify-center shadow-sm text-2xl">
                {{ form.icon || form.name.charAt(0).toUpperCase() }}
              </div>
              <input
                v-model="form.icon"
                type="text"
                class="flex-1 px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-all duration-200"
                placeholder="🎨 或输入emoji"
              />
            </div>
            <div class="mt-2 text-xs text-slate-500 dark:text-slate-400">
              推荐使用emoji作为图标，或者输入网站名称的首字母
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              描述 *
            </label>
            <textarea
              v-model="form.description"
              required
              rows="3"
              class="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-700 dark:text-white resize-none transition-all duration-200"
              placeholder="简要描述网站的功能和特点"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              评分
            </label>
            <div class="flex items-center space-x-3">
              <div class="flex items-center space-x-1">
                <button
                  v-for="i in 5"
                  :key="i"
                  type="button"
                  class="text-2xl cursor-pointer transition-colors"
                  :class="i <= form.rating ? 'text-yellow-400' : 'text-slate-300'"
                  @click="form.rating = i"
                >
                  ⭐
                </button>
              </div>
              <input
                v-model="form.rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                class="w-20 px-3 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white text-center"
              />
              <span class="text-sm text-slate-500 dark:text-slate-400">/ 5</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              标签
            </label>
            <div class="flex flex-wrap gap-2 mb-3">
              <span
                v-for="tag in form.tags"
                :key="tag"
                class="tag flex items-center space-x-1"
              >
                <span>{{ tag }}</span>
                <button
                  type="button"
                  @click="removeTag(tag)"
                  class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <span class="text-sm">✕</span>
                </button>
              </span>
            </div>
            <div class="flex space-x-2">
              <input
                v-model="newTag"
                type="text"
                @keyup.enter="addTag"
                class="flex-1 px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-all duration-200"
                placeholder="输入标签"
              />
              <button
                type="button"
                @click="addTag"
                class="px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
              >
                添加
              </button>
            </div>
          </div>

          <div class="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <label class="flex items-center cursor-pointer">
              <input
                v-model="form.isFeatured"
                type="checkbox"
                class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-3 text-sm text-slate-700 dark:text-slate-300 font-medium">设为精选网站</span>
            </label>
          </div>

          <div class="flex space-x-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="flex-1 btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              class="flex-1 btn-primary"
            >
              {{ isEditing ? '更新' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Website } from '~/types'

const props = defineProps<{
  isOpen: boolean
  website?: Website | null
}>()

const emit = defineEmits<{
  close: []
  saved: [website: Omit<Website, 'id' | 'createdAt' | 'updatedAt'>]
}>()

const newTag = ref('')

const form = reactive({
  name: '',
  url: '',
  description: '',
  icon: '',
  rating: 4.0,
  tags: [] as string[],
  isFeatured: false
})

const isEditing = computed(() => !!props.website)

const resetForm = () => {
  form.name = ''
  form.url = ''
  form.description = ''
  form.icon = ''
  form.rating = 4.0
  form.tags = []
  form.isFeatured = false
  newTag.value = ''
}

// 监听props变化来填充表单
watch(() => props.website, (website) => {
  if (website) {
    form.name = website.name
    form.url = website.url
    form.description = website.description
    form.icon = website.icon
    form.rating = website.rating
    form.tags = [...website.tags]
    form.isFeatured = website.isFeatured
  } else {
    // 重置表单
    form.name = ''
    form.url = ''
    form.description = ''
    form.icon = ''
    form.rating = 4.0
    form.tags = []
    form.isFeatured = false
    newTag.value = ''
  }
}, { immediate: true })

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag)
    newTag.value = ''
  }
}

const removeTag = (tag: string) => {
  const index = form.tags.indexOf(tag)
  if (index > -1) {
    form.tags.splice(index, 1)
  }
}

const handleSubmit = () => {
  const websiteData = {
    name: form.name,
    url: form.url,
    description: form.description,
    icon: form.icon || form.name.charAt(0).toUpperCase(),
    rating: form.rating,
    tags: form.tags,
    isFeatured: form.isFeatured,
    viewCount: 0,
    isFavorite: false
  }

  emit('saved', websiteData as Omit<Website, 'id' | 'createdAt' | 'updatedAt'>)
  closeModal()
}

const closeModal = () => {
  resetForm()
  emit('close')
}
</script>

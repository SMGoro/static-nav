/**
 * 应用常量定义
 */

// 分页相关常量
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  PAGE_SIZE_OPTIONS: [6, 12, 24, 48],
  MAX_PAGE_SIZE: 100,
} as const;

// AI相关常量
export const AI_CONSTANTS = {
  MAX_RESULTS: 10,
  DEFAULT_MAX_RESULTS: 5,
  STREAM_TIMEOUT: 30000, // 30秒
  MAX_RETRY_ATTEMPTS: 3,
} as const;

// 文件上传常量
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_BOOKMARK_TYPES: ['text/html', 'application/x-netscape-bookmarks'],
} as const;

// 网站相关常量
export const WEBSITE = {
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_TAGS_COUNT: 20,
  TITLE_DISPLAY_LENGTH: 15,
  DESCRIPTION_DISPLAY_LENGTH: 100,
} as const;

// 标签相关常量
export const TAG = {
  MAX_NAME_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 200,
  POPULAR_TAGS_COUNT: 8,
} as const;

// 动画和UI常量
export const UI = {
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  LOADING_DELAY: 100,
} as const;

// 网络请求常量
export const NETWORK = {
  REQUEST_TIMEOUT: 10000, // 10秒
  RETRY_DELAY: 1000, // 1秒
  MAX_CONCURRENT_REQUESTS: 5,
} as const;

// 数据验证常量
export const VALIDATION = {
  URL_PATTERN: /^https?:\/\/.+/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MIN_PASSWORD_LENGTH: 6,
} as const;

// 颜色常量
export const COLORS = {
  TAG_COLORS: [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316',
    '#ec4899', '#6366f1', '#14b8a6', '#eab308'
  ],
  STATUS_COLORS: {
    SUCCESS: '#10b981',
    ERROR: '#ef4444',
    WARNING: '#f59e0b',
    INFO: '#3b82f6',
  }
} as const;

// 排序选项
export const SORT_OPTIONS = [
  { value: 'default', label: '默认排序' },
  { value: 'name', label: '按名称' },
  { value: 'clicks', label: '按点击量' },
  { value: 'date', label: '按添加时间' },
  { value: 'updated', label: '按更新时间' },
] as const;

// 视图类型
export const VIEW_TYPES = [
  { value: 'grid', label: '网格视图', icon: 'Grid' },
  { value: 'list', label: '列表视图', icon: 'List' },
  { value: 'card', label: '卡片视图', icon: 'Card' },
] as const;

// 导出格式
export const EXPORT_FORMATS = [
  { value: 'json', label: 'JSON格式', extension: '.json' },
  { value: 'csv', label: 'CSV格式', extension: '.csv' },
  { value: 'html', label: 'HTML收藏夹', extension: '.html' },
] as const;

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  TIMEOUT_ERROR: '请求超时，请稍后重试',
  PARSE_ERROR: '数据解析失败，请检查文件格式',
  VALIDATION_ERROR: '数据验证失败，请检查输入内容',
  STORAGE_ERROR: '存储空间不足或访问被拒绝',
  UNKNOWN_ERROR: '发生未知错误，请稍后重试',
} as const;

// 成功消息
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: '保存成功',
  DELETE_SUCCESS: '删除成功',
  IMPORT_SUCCESS: '导入成功',
  EXPORT_SUCCESS: '导出成功',
  COPY_SUCCESS: '复制成功',
  SHARE_SUCCESS: '分享成功',
} as const;


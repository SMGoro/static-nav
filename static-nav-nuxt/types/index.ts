export interface Website {
  id: string
  name: string
  url: string
  description: string
  icon: string
  rating: number
  tags: string[]
  viewCount: number
  isFeatured: boolean
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

export interface NavigationData {
  id: string
  title: string
  description: string
  websites: Website[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Tag {
  name: string
  count: number
  color?: string
}

export interface SearchFilters {
  query: string
  selectedTags: string[]
  sortBy: 'name' | 'rating' | 'viewCount' | 'createdAt'
  sortOrder: 'asc' | 'desc'
  layout: 'grid' | 'list'
}

export interface AIRecommendation {
  name: string
  url: string
  description: string
  tags: string[]
  reason: string
}

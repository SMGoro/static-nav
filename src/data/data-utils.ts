import { Website, WebsiteBasic, WebsiteDetail, Tag, TagCategory } from '../types/website';

/**
 * 合并网站基础信息和详细信息
 * @param basicData 基础信息数组
 * @param detailData 详细信息数组
 * @returns 完整的网站信息数组
 */
export function mergeWebsiteData(
  basicData: WebsiteBasic[], 
  detailData: WebsiteDetail[]
): Website[] {
  const detailMap = new Map(detailData.map(detail => [detail.id, detail]));
  
  return basicData
    .map((basic, index) => {
      const detail = detailMap.get(basic.id);
      
      // 如果没有详细信息，创建默认的详细信息
      const defaultDetail: WebsiteDetail = {
        id: basic.id,
        addedDate: new Date().toISOString(),
        clicks: 0,
        featured: false,
        rating: 0,
        reviews: [],
        relatedSites: [],
        lastUpdated: new Date().toISOString(),
        language: '未知',
        isPaid: false,
        isBuiltIn: false,
        slug: basic.id // 默认使用ID作为slug
      };
      
      const finalDetail = detail || defaultDetail;
      
      // 确保slug存在，如果为空则使用ID
      const slug = finalDetail.slug || basic.id;
      
      if (!detail) {
        console.warn(`No detail data found for website ID: ${basic.id}, title: ${basic.title}. Using default values.`);
      }
      
      return {
        ...basic,
        ...finalDetail,
        slug, // 确保slug始终存在
        sortOrder: basic.sortOrder ?? (index + 1) * 10 // 提供默认sortOrder
      } as Website;
    })
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999)); // 按sortOrder排序，处理undefined
}

/**
 * 根据ID获取网站基础信息
 * @param basicData 基础信息数组
 * @param id 网站ID
 * @returns 网站基础信息或undefined
 */
export function getWebsiteBasic(basicData: WebsiteBasic[], id: string): WebsiteBasic | undefined {
  return basicData.find(website => website.id === id);
}

/**
 * 根据ID获取网站详细信息
 * @param detailData 详细信息数组
 * @param id 网站ID
 * @returns 网站详细信息或undefined
 */
export function getWebsiteDetail(detailData: WebsiteDetail[], id: string): WebsiteDetail | undefined {
  return detailData.find(website => website.id === id);
}

/**
 * 根据标签筛选网站基础信息
 * @param basicData 基础信息数组
 * @param tags 标签数组
 * @returns 筛选后的网站基础信息数组
 */
export function filterWebsitesByTags(basicData: WebsiteBasic[], tags: string[]): WebsiteBasic[] {
  if (tags.length === 0) return basicData;
  
  return basicData.filter(website =>
    tags.some(tag => website.tags.includes(tag))
  );
}

/**
 * 按排序字段排序网站数据
 * @param websites 网站数组
 * @returns 排序后的网站数组
 */
export function sortWebsitesByOrder<T extends { sortOrder?: number }>(websites: T[]): T[] {
  return [...websites].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
}

/**
 * 根据分类ID获取标签分类
 * @param categories 标签分类数组
 * @param categoryId 分类ID
 * @returns 标签分类或undefined
 */
export function getTagCategoryById(categories: TagCategory[], categoryId: string): TagCategory | undefined {
  return categories.find(category => category.id === categoryId);
}

/**
 * 根据标签ID获取其所属分类
 * @param categories 标签分类数组
 * @param tagId 标签ID
 * @returns 标签分类或undefined
 */
export function findCategoryByTagId(categories: TagCategory[], tagId: string): TagCategory | undefined {
  return categories.find(category => 
    category.tagIds.includes(tagId)
  );
}

/**
 * 根据分类获取对应的标签列表
 * @param category 标签分类
 * @param allTags 所有标签数据
 * @returns 分类下的标签数组
 */
export function getTagsFromCategory(category: TagCategory, allTags: Tag[]): Tag[] {
  const tagMap = new Map(allTags.map(tag => [tag.id, tag]));
  return category.tagIds
    .map(tagId => tagMap.get(tagId))
    .filter((tag): tag is Tag => tag !== undefined);
}

/**
 * 获取分类下的核心标签
 * @param category 标签分类
 * @param allTags 所有标签数据
 * @returns 核心标签数组
 */
export function getCoreTagsFromCategory(category: TagCategory, allTags: Tag[]): Tag[] {
  const categoryTags = getTagsFromCategory(category, allTags);
  return categoryTags.filter(tag => tag.isCore);
}

/**
 * 按标签使用次数排序分类中的标签
 * @param category 标签分类
 * @param allTags 所有标签数据
 * @returns 排序后的标签数组
 */
export function sortTagsByCount(category: TagCategory, allTags: Tag[]): Tag[] {
  const categoryTags = getTagsFromCategory(category, allTags);
  return categoryTags.sort((a, b) => b.count - a.count);
}

/**
 * 按排序字段排序标签分类
 * @param categories 标签分类数组
 * @returns 排序后的分类数组
 */
export function sortCategoriesByOrder(categories: TagCategory[]): TagCategory[] {
  return [...categories].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
}

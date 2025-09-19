import { Website, Tag, TagCategory, WebsiteBasic, WebsiteDetail } from '../types/website';
import { websitesBasic } from './websites-basic';
import { websitesDetail } from './websites-detail';
import { tagCategories, mockTags } from './tags';
import { mergeWebsiteData } from './data-utils';

// 导出分离的数据
export { websitesBasic, websitesDetail, tagCategories, mockTags };

// 兼容性：导出合并后的完整网站数据
export const mockWebsites: Website[] = mergeWebsiteData(websitesBasic, websitesDetail);

// 数据统计信息
export const dataStats = {
  websitesCount: websitesBasic.length,
  tagsCount: mockTags.length,
  tagCategoriesCount: tagCategories.length,
  featuredWebsitesCount: websitesDetail.filter(w => w.featured).length,
  paidWebsitesCount: websitesDetail.filter(w => w.isPaid).length,
  freeWebsitesCount: websitesDetail.filter(w => !w.isPaid).length
};
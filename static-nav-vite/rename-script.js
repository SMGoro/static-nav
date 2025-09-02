#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// 将PascalCase转换为kebab-case
function pascalToKebab(str) {
  return str
    // 处理连续的大写字母（如AI, SEO等）
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    // 处理普通的PascalCase
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

// 文件重命名映射
const renameMap = new Map();

// 需要重命名的文件列表
const filesToRename = [
  'src/components/Pagination.tsx',
  'src/components/tag-management/TagList.tsx',
  'src/components/tag-management/TagManagement.tsx',
  'src/components/tag-management/TagRelationManager.tsx',
  'src/components/tag-management/TagForm.tsx',
  'src/components/tag-management/TagOverview.tsx',
  'src/components/SEOHead.tsx',
  'src/components/data-management/BookmarkImportDialog.tsx',
  'src/components/data-management/DuplicateManager.tsx',
  'src/components/data-management/ImportConfirmDialog.tsx',
  'src/components/data-management/BatchAddDialog.tsx',
  'src/components/data-management/DataManager.tsx',
  'src/components/data-management/BatchWebsiteManager.tsx',
  'src/components/data-management/DataRestoreManager.tsx',
  'src/components/website/WebsiteDetailPage.tsx',
  'src/components/website/WebsiteCard.tsx',
  'src/components/website/WebsitePreview.tsx',
  'src/components/website/WebsiteDetail.tsx',
  'src/components/website/WebsitePreviewMini.tsx',
  'src/components/TestShare.tsx',
  'src/components/ShareTest.tsx',
  'src/components/figma/ImageWithFallback.tsx',
  'src/components/TagNetwork.tsx',
  'src/components/ai/AIWebsiteCard.tsx',
  'src/components/ai/AIConfigDialog.tsx',
  'src/components/ai/AIRecommendation.tsx',
  'src/components/ai/AIEnrichment.tsx',
  'src/components/ai/AIChatHistory.tsx',
  'src/components/website-form/SuccessDialog.tsx',
  'src/components/website-form/AdvancedSettings.tsx',
  'src/components/website-form/AIEnhancementSection.tsx',
  'src/components/website-form/AutoFillSection.tsx',
  'src/components/website-form/WebsiteForm.tsx',
  'src/components/website-form/TagManager.tsx',
  'src/components/ThemeToggle.tsx',
  'src/components/DetailedTagFilter.tsx',
  'src/components/ShareDialog.tsx',
  'src/components/Navigation.tsx',
  'src/components/StreamingPreview.tsx',
  'src/components/ErrorBoundary.tsx'
];

// 生成重命名映射
filesToRename.forEach(filePath => {
  const dir = path.dirname(filePath);
  const fileName = path.basename(filePath, '.tsx');
  const newFileName = pascalToKebab(fileName);
  const newFilePath = path.join(dir, newFileName + '.tsx');
  
  renameMap.set(filePath, newFilePath);
  console.log(`${filePath} -> ${newFilePath}`);
});

// 输出重命名映射到JSON文件
const renameMapObject = Object.fromEntries(renameMap);
fs.writeFileSync('rename-map.json', JSON.stringify(renameMapObject, null, 2));

console.log('\nRename mapping saved to rename-map.json');
console.log(`Total files to rename: ${renameMap.size}`);

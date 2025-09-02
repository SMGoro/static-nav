#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// 更全面的导入映射
const fixes = [
  // App.tsx路径修正
  { pattern: /from ['"]\.\.\/contexts\/theme-context['"]/g, replacement: "from './contexts/theme-context'" },
  { pattern: /from ['"]\.\.\/utils\/data-manager['"]/g, replacement: "from './utils/data-manager'" },
  
  // Services内部导入修正
  { pattern: /from ['"]\.\/(aiService|ai-service)['"]/g, replacement: "from './ai-service'" },
  { pattern: /from ['"]\.\/(aiEnrichmentService|ai-enrichment-service)['"]/g, replacement: "from './ai-enrichment-service'" },
  { pattern: /from ['"]\.\/(contentScrapingService|content-scraping-service)['"]/g, replacement: "from './content-scraping-service'" },
  { pattern: /from ['"]\.\/(linkPreviewService|link-preview-service)['"]/g, replacement: "from './link-preview-service'" },
  { pattern: /from ['"]\.\/(websiteInfoService|website-info-service)['"]/g, replacement: "from './website-info-service'" },
  { pattern: /from ['"]\.\/(dataManager|data-manager)['"]/g, replacement: "from './data-manager'" },
  
  // 从其他文件夹引用services的修正
  { pattern: /from ['"]\.\.\/\.\.\/services\/(aiService|ai-service)['"]/g, replacement: "from '../../services/ai-service'" },
  { pattern: /from ['"]\.\.\/\.\.\/services\/(aiEnrichmentService|ai-enrichment-service)['"]/g, replacement: "from '../../services/ai-enrichment-service'" },
  { pattern: /from ['"]\.\.\/\.\.\/services\/(contentScrapingService|content-scraping-service)['"]/g, replacement: "from '../../services/content-scraping-service'" },
  { pattern: /from ['"]\.\.\/\.\.\/services\/(linkPreviewService|link-preview-service)['"]/g, replacement: "from '../../services/link-preview-service'" },
  { pattern: /from ['"]\.\.\/\.\.\/services\/(websiteInfoService|website-info-service)['"]/g, replacement: "from '../../services/website-info-service'" },
  
  // Utils引用修正
  { pattern: /from ['"]\.\.\/\.\.\/utils\/(dataManager|data-manager)['"]/g, replacement: "from '../../utils/data-manager'" },
  { pattern: /from ['"]\.\.\/\.\.\/utils\/(bookmarkParser|bookmark-parser)['"]/g, replacement: "from '../../utils/bookmark-parser'" },
  
  // 同级utils引用修正
  { pattern: /from ['"]\.\/(dataManager|data-manager)['"]/g, replacement: "from './data-manager'" },
  { pattern: /from ['"]\.\/(bookmarkParser|bookmark-parser)['"]/g, replacement: "from './bookmark-parser'" },
  { pattern: /from ['"]\.\/(sitemapGenerator|sitemap-generator)['"]/g, replacement: "from './sitemap-generator'" },
];

function getAllTsFiles(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist') {
      files = files.concat(getAllTsFiles(fullPath));
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  fixes.forEach(fix => {
    if (fix.pattern.test(content)) {
      content = content.replace(fix.pattern, fix.replacement);
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed imports in: ${filePath}`);
  }
  
  return hasChanges;
}

// 主函数
const srcDir = './src';
const allFiles = getAllTsFiles(srcDir);

let totalFixed = 0;
for (const file of allFiles) {
  try {
    if (fixImportsInFile(file)) {
      totalFixed++;
    }
  } catch (error) {
    console.error(`Error fixing ${file}:`, error.message);
  }
}

console.log(`\nTotal files fixed: ${totalFixed}`);


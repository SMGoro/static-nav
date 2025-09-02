#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// 重命名映射
const importMappings = [
  // App.tsx -> app.tsx
  { from: /from ['"]\.\/(app|App)['"]/g, to: "from './app'" },
  
  // ThemeContext -> theme-context
  { from: /from ['"]\.\.?\/?contexts\/ThemeContext['"]/g, to: "from '../contexts/theme-context'" },
  { from: /from ['"]\.\/contexts\/ThemeContext['"]/g, to: "from './contexts/theme-context'" },
  
  // Utils files
  { from: /from ['"]\.\.?\/?utils\/dataManager['"]/g, to: "from '../utils/data-manager'" },
  { from: /from ['"]\.\/utils\/dataManager['"]/g, to: "from './utils/data-manager'" },
  { from: /from ['"]\.\.?\/?utils\/bookmarkParser['"]/g, to: "from '../utils/bookmark-parser'" },
  { from: /from ['"]\.\/utils\/bookmarkParser['"]/g, to: "from './utils/bookmark-parser'" },
  { from: /from ['"]\.\.?\/?utils\/sitemapGenerator['"]/g, to: "from '../utils/sitemap-generator'" },
  
  // Hooks
  { from: /from ['"]\.\.?\/?hooks\/useLocalStorage['"]/g, to: "from '../hooks/use-local-storage'" },
  
  // Data
  { from: /from ['"]\.\.?\/?data\/mockData['"]/g, to: "from '../data/mock-data'" },
  { from: /from ['"]\.\/data\/mockData['"]/g, to: "from './data/mock-data'" },
  
  // Services
  { from: /from ['"]\.\.?\/?services\/aiEnrichmentService['"]/g, to: "from '../services/ai-enrichment-service'" },
  { from: /from ['"]\.\/services\/aiEnrichmentService['"]/g, to: "from './services/ai-enrichment-service'" },
  { from: /from ['"]\.\.?\/?services\/aiService['"]/g, to: "from '../services/ai-service'" },
  { from: /from ['"]\.\/services\/aiService['"]/g, to: "from './services/ai-service'" },
  { from: /from ['"]\.\.?\/?services\/contentScrapingService['"]/g, to: "from '../services/content-scraping-service'" },
  { from: /from ['"]\.\/services\/contentScrapingService['"]/g, to: "from './services/content-scraping-service'" },
  { from: /from ['"]\.\.?\/?services\/websiteInfoService['"]/g, to: "from '../services/website-info-service'" },
  { from: /from ['"]\.\/services\/websiteInfoService['"]/g, to: "from './services/website-info-service'" },
  { from: /from ['"]\.\.?\/?services\/linkPreviewService['"]/g, to: "from '../services/link-preview-service'" },
  { from: /from ['"]\.\/services\/linkPreviewService['"]/g, to: "from './services/link-preview-service'" },
];

function getAllFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist') {
      files = files.concat(getAllFiles(fullPath, extensions));
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function updateImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  importMappings.forEach(mapping => {
    if (mapping.from.test(content)) {
      content = content.replace(mapping.from, mapping.to);
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated imports in: ${filePath}`);
  }
  
  return hasChanges;
}

// 主函数
const rootDir = '.';
const allFiles = getAllFiles(rootDir);

let totalUpdated = 0;

for (const file of allFiles) {
  try {
    if (updateImportsInFile(file)) {
      totalUpdated++;
    }
  } catch (error) {
    console.error(`Error updating ${file}:`, error.message);
  }
}

console.log(`\nTotal files updated: ${totalUpdated}`);


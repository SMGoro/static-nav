#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// 修复根目录下组件的导入路径
const rootComponentFixes = [
  {
    pattern: /from ['"]\.\.\/\.\.\/types\/website['"]/g,
    replacement: "from '../types/website'"
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/utils\/dataManager['"]/g,
    replacement: "from '../utils/data-manager'"
  },
  {
    pattern: /from ['"]\.\.\/\.\.\/services\/(.*?)['"]/g,
    replacement: "from '../services/$1'"
  }
];

// 修复utils和services中的导入路径
const utilsServicesFixes = [
  {
    pattern: /from ['"]\.\.\/\.\.\/types\/website['"]/g,
    replacement: "from '../types/website'"
  }
];

function fixImportsInFile(filePath, fixes) {
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

// 修复根目录下的组件
const rootComponents = [
  'src/components/detailed-tag-filter.tsx',
  'src/components/navigation.tsx',
  'src/components/seo-head.tsx',
  'src/components/share-dialog.tsx',
  'src/components/share-test.tsx',
  'src/components/streaming-preview.tsx',
  'src/components/tag-network.tsx',
  'src/components/test-share.tsx'
];

// 修复utils和services
const utilsAndServices = [
  'src/utils/bookmarkParser.ts',
  'src/utils/dataManager.ts',
  'src/services/aiEnrichmentService.ts',
  'src/services/aiService.ts',
  'src/services/linkPreviewService.ts',
  'src/services/websiteInfoService.ts',
  'src/data/mockData.ts'
];

let totalFixed = 0;

// 修复根目录组件
for (const file of rootComponents) {
  try {
    if (fixImportsInFile(file, rootComponentFixes)) {
      totalFixed++;
    }
  } catch (error) {
    console.error(`Error fixing ${file}:`, error.message);
  }
}

// 修复utils和services
for (const file of utilsAndServices) {
  try {
    if (fixImportsInFile(file, utilsServicesFixes)) {
      totalFixed++;
    }
  } catch (error) {
    console.error(`Error fixing ${file}:`, error.message);
  }
}

console.log(`\nTotal files fixed: ${totalFixed}`);


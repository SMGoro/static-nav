#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// 手动定义需要修复的导入映射
const manualFixes = [
  // 修复对重命名文件的引用
  {
    pattern: /from ['"]\.\/(website\/)?WebsiteCard['"]/g,
    replacement: "from './website/website-card'"
  },
  {
    pattern: /from ['"]\.\/(ai\/)?AIWebsiteCard['"]/g,
    replacement: "from './ai/ai-website-card'"
  },
  {
    pattern: /from ['"]\.\.(\/ai)?\/AIConfigDialog['"]/g,
    replacement: "from '../ai/ai-config-dialog'"
  },
  {
    pattern: /from ['"]\.\.(\/ai)?\/AIEnrichment['"]/g,
    replacement: "from '../ai/ai-enrichment'"
  },
  {
    pattern: /from ['"]\.\.\/types\/website['"]/g,
    replacement: "from '../../types/website'"
  },
  {
    pattern: /from ['"]\.\.\/services\/(aiService|aiEnrichmentService)['"]/g,
    replacement: "from '../../services/$1'"
  },
  {
    pattern: /from ['"]\.\.\/utils\/dataManager['"]/g,
    replacement: "from '../../utils/dataManager'"
  }
];

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  manualFixes.forEach(fix => {
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

function getAllTsxFiles(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllTsxFiles(fullPath));
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// 主函数
const srcDir = './src';
const allFiles = getAllTsxFiles(srcDir);

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


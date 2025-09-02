#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取重命名映射
const renameMapPath = path.join(__dirname, 'rename-map.json');
const renameMap = JSON.parse(fs.readFileSync(renameMapPath, 'utf8'));

// 创建导入路径映射
const importMap = new Map();

Object.entries(renameMap).forEach(([oldPath, newPath]) => {
  // 移除src/前缀和.tsx后缀来创建导入路径
  const oldImport = oldPath.replace('src/', './').replace('.tsx', '');
  const newImport = newPath.replace('src/', './').replace('.tsx', '');
  importMap.set(oldImport, newImport);
  
  // 也处理相对路径
  const oldFilename = path.basename(oldPath, '.tsx');
  const newFilename = path.basename(newPath, '.tsx');
  importMap.set('./' + oldFilename, './' + newFilename);
  importMap.set('../' + oldFilename, '../' + newFilename);
});

// 获取所有需要更新的文件
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

// 更新文件中的导入
function updateImportsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let updatedContent = content;
  let hasChanges = false;
  
  // 更新from语句中的导入路径
  importMap.forEach((newPath, oldPath) => {
    // 匹配import语句
    const importRegex = new RegExp(`from ['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
    if (importRegex.test(updatedContent)) {
      updatedContent = updatedContent.replace(importRegex, `from '${newPath}'`);
      hasChanges = true;
      console.log(`Updated import in ${filePath}: ${oldPath} -> ${newPath}`);
    }
  });
  
  if (hasChanges) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Updated file: ${filePath}`);
  }
  
  return hasChanges;
}

// 主函数
function main() {
  const srcDir = path.join(__dirname, 'src');
  const allFiles = getAllTsxFiles(srcDir);
  
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
}

main();


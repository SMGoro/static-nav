#!/usr/bin/env node

console.log('🚀 开始测试推荐数据生成器...');

try {
  // 测试基本功能
  console.log('✅ 脚本开始运行');
  
  // 测试文件系统操作
  import fs from 'fs';
  import path from 'path';
  import { fileURLToPath } from 'url';
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  console.log('✅ 模块导入成功');
  console.log('📁 当前目录:', __dirname);
  
  // 创建data目录
  const dataDir = path.join(__dirname, '../data');
  console.log('📁 数据目录:', dataDir);
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('✅ 创建data目录成功');
  } else {
    console.log('✅ data目录已存在');
  }
  
  // 创建测试文件
  const testData = {
    message: '测试数据生成成功',
    timestamp: new Date().toISOString(),
    count: 5
  };
  
  fs.writeFileSync(
    path.join(dataDir, 'test.json'),
    JSON.stringify(testData, null, 2),
    'utf-8'
  );
  
  console.log('✅ 测试文件创建成功');
  console.log('📊 测试完成！');
  
} catch (error) {
  console.error('❌ 测试失败:', error.message);
  console.error('错误详情:', error);
  process.exit(1);
}


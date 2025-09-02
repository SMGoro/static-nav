# Website Form Components

这个文件夹包含了网站表单相关的所有组件，将原来的 `WebsiteForm.tsx` 和 `WebsiteFormEnhanced.tsx` 进行了功能拆分和精简化。

## 文件结构

```
website-form/
├── README.md                    # 说明文档
├── index.ts                     # 导出文件
├── types.ts                     # 共享类型定义
├── WebsiteForm.tsx             # 主表单组件
├── TagManager.tsx              # 标签管理组件
├── AutoFillSection.tsx         # 自动获取功能组件
├── AIEnhancementSection.tsx    # AI增强功能组件
├── AdvancedSettings.tsx        # 高级设置组件
└── SuccessDialog.tsx           # 成功对话框组件
```

## 组件说明

### 1. `WebsiteForm.tsx` - 主表单组件
- **功能**: 整合所有子组件，处理表单提交和状态管理
- **职责**: 
  - 表单数据管理
  - 提交处理
  - 子组件协调
  - AI配置管理

### 2. `TagManager.tsx` - 标签管理组件
- **功能**: 标签的添加、删除和显示
- **特点**: 
  - 独立的标签状态管理
  - 防重复添加
  - 优化的删除按钮交互

### 3. `AutoFillSection.tsx` - 自动获取功能组件
- **功能**: URL自动获取网站信息
- **特点**: 
  - 内容抓取服务集成
  - 进度显示
  - 备用方案处理
  - 内容预览

### 4. `AIEnhancementSection.tsx` - AI增强功能组件
- **功能**: AI智能增强网站信息
- **特点**: 
  - 流式输出支持
  - 内容检查机制
  - 警告对话框
  - 智能合并策略

### 5. `AdvancedSettings.tsx` - 高级设置组件
- **功能**: 高级设置选项管理
- **包含**: 
  - 详细介绍
  - 功能特性管理
  - 截图管理
  - 语言和作者设置

### 6. `SuccessDialog.tsx` - 成功对话框组件
- **功能**: 添加成功后的用户选择
- **选项**: 
  - 继续添加网站
  - 返回主页面

### 7. `types.ts` - 类型定义
- **包含**: 
  - `WebsiteFormData` 接口
  - `WebsiteFormProps` 接口
  - 工具函数

## 使用方式

```tsx
import { WebsiteForm } from './components/website-form';

// 在父组件中使用
<WebsiteForm
  website={website}
  onSave={handleSave}
  onCancel={handleCancel}
/>
```

## 优化点

### 1. 代码精简
- 删除了重复的代码
- 移除了不必要的状态管理
- 简化了事件处理逻辑

### 2. 功能拆分
- 每个组件职责单一
- 便于维护和测试
- 提高代码复用性

### 3. 类型安全
- 统一的类型定义
- 严格的 TypeScript 检查
- 避免了 `any` 类型的使用

### 4. 用户体验
- 智能的数据合并策略
- 清晰的进度反馈
- 友好的错误处理

## 数据流

```
WebsiteForm (主组件)
├── formData (状态)
├── updateFormData (更新函数)
├── AutoFillSection (自动获取)
├── TagManager (标签管理)
├── AIEnhancementSection (AI增强)
├── AdvancedSettings (高级设置)
└── SuccessDialog (成功对话框)
```

## 智能合并策略

- **新增模式**: 合并用户输入和AI生成的内容
- **编辑模式**: AI生成的内容直接替换原有内容
- **去重处理**: 自动去除重复的标签和功能特性

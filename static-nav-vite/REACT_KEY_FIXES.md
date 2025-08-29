# React Key 重复问题修复

## 问题描述

在React应用中，当渲染列表时，每个元素都需要一个唯一的`key`属性。当多个元素使用相同的key值时，React会发出警告：

```
Encountered two children with the same key, `代码托管`. Keys should be unique so that components maintain their identity across updates.
```

## 问题原因

在多个组件中，标签数组的渲染使用了`key={tag}`，当标签数组中有重复的标签时（如"AI推荐"、"代码托管"、"开源"等），就会产生重复的key值。

## 修复方案

将所有使用`key={tag}`的地方改为`key={`${tag}-${index}`}`，确保即使有重复的标签，key值也是唯一的。

## 修复的组件

### 1. WebsiteForm.tsx
- **位置**: 第310行、第418行、第534行
- **修复前**: `key={tag}`
- **修复后**: `key={`${tag}-${index}`}`

### 2. WebsiteFormEnhanced.tsx
- **位置**: 第299行、第408行、第514行
- **修复前**: `key={tag}`
- **修复后**: `key={`${tag}-${index}`}`

### 3. AIEnrichment.tsx
- **位置**: 第462行
- **修复前**: `key={tag}`
- **修复后**: `key={`${tag}-${index}`}`

### 4. WebsiteDetail.tsx
- **位置**: 第319行
- **修复前**: `key={tag}`
- **修复后**: `key={`${tag}-${index}`}`

### 5. WebsiteDetailPage.tsx
- **位置**: 第358行
- **修复前**: `key={tag}`
- **修复后**: `key={`${tag}-${index}`}`

## 修复代码示例

### 修复前
```tsx
{formData.tags.map((tag) => (
  <Badge key={tag} variant="secondary">
    {tag}
  </Badge>
))}
```

### 修复后
```tsx
{formData.tags.map((tag, index) => (
  <Badge key={`${tag}-${index}`} variant="secondary">
    {tag}
  </Badge>
))}
```

## 验证

修复后，控制台不再出现React key重复的警告信息。

## 注意事项

1. **性能考虑**: 使用索引作为key的一部分可能会影响React的优化，但在标签重复的情况下是必要的
2. **最佳实践**: 理想情况下，应该确保标签数组中没有重复项，或者使用更稳定的唯一标识符
3. **向后兼容**: 这个修复不会影响现有功能，只是消除了控制台警告

## 相关链接

- [React Keys 官方文档](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key)
- [React Key 最佳实践](https://react.dev/learn/rendering-lists#where-to-get-your-key)

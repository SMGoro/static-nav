import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  RotateCcw, 
  AlertTriangle, 
  Database, 
  Download,
  Trash2,
  CheckCircle,
  Info
} from 'lucide-react';
import { dataManager, AppData } from '../../utils/data-manager';

interface DataRestoreManagerProps {
  currentData: AppData;
  onDataRestore: (data: AppData) => void;
}

export function DataRestoreManager({ currentData, onDataRestore }: DataRestoreManagerProps) {
  const [isRestoring, setIsRestoring] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  // 获取初始数据统计
  const getInitialDataStats = () => {
    const initialData = dataManager.getDefaultData();
    return {
      websites: initialData.websites.length,
      tags: initialData.tags.length,
    };
  };

  // 获取当前数据统计
  const getCurrentDataStats = () => {
    return {
      websites: currentData.websites.length,
      tags: currentData.tags.length,
    };
  };

  // 创建备份
  const createBackup = async () => {
    setIsCreatingBackup(true);
    try {
      // 导出当前数据作为备份
      dataManager.exportData(currentData, `backup-${new Date().toISOString().split('T')[0]}`);
      alert('备份创建成功！备份文件已下载到您的设备。');
    } catch (error) {
      console.error('创建备份失败:', error);
      alert('创建备份失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsCreatingBackup(false);
    }
  };

  // 恢复到初始数据
  const restoreToInitialData = async () => {
    const currentStats = getCurrentDataStats();
    const initialStats = getInitialDataStats();
    
    const confirmMessage = `确定要恢复到初始数据吗？

当前数据：
• ${currentStats.websites} 个网站
• ${currentStats.tags} 个标签

将恢复为：
• ${initialStats.websites} 个网站
• ${initialStats.tags} 个标签

此操作将清除所有自定义数据，建议先创建备份。`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setIsRestoring(true);
    try {
      const initialData = dataManager.getDefaultData();
      onDataRestore(initialData);
      alert('数据已成功恢复到初始状态！');
    } catch (error) {
      console.error('恢复数据失败:', error);
      alert('恢复数据失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsRestoring(false);
    }
  };

  // 清空所有数据
  const clearAllData = async () => {
    const confirmMessage = `⚠️ 危险操作：清空所有数据

这将删除：
• 所有网站 (${currentData.websites.length} 个)
• 所有标签 (${currentData.tags.length} 个)

此操作不可撤销！强烈建议先创建备份。

确定要继续吗？`;

    if (!confirm(confirmMessage)) {
      return;
    }

    // 二次确认
    const secondConfirm = confirm('最后确认：您真的要清空所有数据吗？此操作无法撤销！');
    if (!secondConfirm) {
      return;
    }

    setIsRestoring(true);
    try {
      const emptyData: AppData = {
        websites: [],
        tags: [],
        version: currentData.version,
        lastUpdated: new Date().toISOString()
      };
      onDataRestore(emptyData);
      alert('所有数据已清空！');
    } catch (error) {
      console.error('清空数据失败:', error);
      alert('清空数据失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsRestoring(false);
    }
  };

  const currentStats = getCurrentDataStats();
  const initialStats = getInitialDataStats();
  const hasCustomData = currentStats.websites > initialStats.websites || 
                       currentStats.tags > initialStats.tags;

  return (
    <div className="space-y-6">
      {/* 数据恢复控制 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            数据恢复管理
          </CardTitle>
          <CardDescription>
            恢复到初始数据状态或清空所有数据。建议在执行操作前先创建备份。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 当前数据状态 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{currentStats.websites}</div>
              <div className="text-sm text-muted-foreground">网站数量</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{currentStats.tags}</div>
              <div className="text-sm text-muted-foreground">标签数量</div>
            </div>
          </div>

          {/* 状态提示 */}
          {hasCustomData ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                检测到自定义数据。当前数据包含 {currentStats.websites - initialStats.websites} 个额外网站和 {currentStats.tags - initialStats.tags} 个额外标签。
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                当前使用的是初始数据状态。
              </AlertDescription>
            </Alert>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={createBackup}
              disabled={isCreatingBackup}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isCreatingBackup ? '创建中...' : '创建备份'}
            </Button>

            <Button
              onClick={restoreToInitialData}
              disabled={isRestoring}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              {isRestoring ? '恢复中...' : '恢复初始数据'}
            </Button>

            <Button
              onClick={clearAllData}
              disabled={isRestoring}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isRestoring ? '清空中...' : '清空所有数据'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 初始数据预览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            初始数据预览
          </CardTitle>
          <CardDescription>
            恢复后将包含以下初始数据
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-blue-600">{initialStats.websites}</div>
              <div className="text-sm text-muted-foreground">初始网站</div>
              <div className="text-xs text-muted-foreground mt-1">
                包含精选的优质网站
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-green-600">{initialStats.tags}</div>
              <div className="text-sm text-muted-foreground">初始标签</div>
              <div className="text-xs text-muted-foreground mt-1">
                基础分类标签
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 安全提示 */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>重要提示：</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• 恢复操作将覆盖当前所有数据，无法撤销</li>
            <li>• 建议在执行任何恢复操作前先创建备份</li>
            <li>• 清空数据操作将删除所有内容，请谨慎使用</li>
            <li>• 备份文件可以通过"导入导出"功能重新导入</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}

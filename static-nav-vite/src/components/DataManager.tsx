import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Download, Upload, Trash2, Share, Copy, Database } from 'lucide-react';
import { dataManager, AppData, ShareData } from '../utils/dataManager';

export function DataManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shareMessage, setShareMessage] = useState('');
  const [shareExpiresIn, setShareExpiresIn] = useState('7');
  const [shareUrl, setShareUrl] = useState('');
  
  // 状态
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isCreatingShare, setIsCreatingShare] = useState(false);
  const [isImportingShare, setIsImportingShare] = useState(false);
  
  // 数据
  const [currentData, setCurrentData] = useState<AppData>(dataManager.getLocalData());
  
  // 计算统计
  const stats = dataManager.getDataStats(currentData);
  
  // 导出数据
  const exportData = async () => {
    try {
      setIsExporting(true);
      dataManager.exportData(currentData);
      alert('数据导出成功');
    } catch (error) {
      alert('数据导出失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsExporting(false);
    }
  };
  
  // 选择文件
  const selectFile = () => {
    fileInputRef.current?.click();
  };
  
  // 处理文件选择
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setIsImporting(true);
      const importedData = await dataManager.importData(file);
      setCurrentData(importedData);
      dataManager.saveLocalData(importedData);
      alert('数据导入成功');
    } catch (error) {
      alert('数据导入失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsImporting(false);
      // 清空文件输入
      if (event.target) event.target.value = '';
    }
  };
  
  // 重置数据
  const resetData = async () => {
    if (!confirm('确定要重置所有数据吗？此操作不可恢复！')) {
      return;
    }
    
    try {
      setIsResetting(true);
      dataManager.resetData();
      setCurrentData(dataManager.getLocalData());

      alert('数据重置成功');
    } catch (error) {
      alert('数据重置失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsResetting(false);
    }
  };
  
  // 创建分享
  const createShare = async () => {
    try {
      setIsCreatingShare(true);
      const expiresIn = parseInt(shareExpiresIn);
      const shareLink = dataManager.createShareLink(
        currentData,
        shareMessage,
        expiresIn > 0 ? expiresIn : undefined
      );
      
      // 复制到剪贴板
      await navigator.clipboard.writeText(shareLink);
      alert('分享链接已创建并复制到剪贴板');
      
      // 清空输入
      setShareMessage('');
      setShareExpiresIn('7');
      
      // 分享链接已创建
    } catch (error) {
      alert('创建分享链接失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsCreatingShare(false);
    }
  };
  
  // 复制分享链接
  const copyShareLink = async (shareId: string) => {
    try {
      const baseUrl = window.location.origin + window.location.pathname;
      const shareLink = `${baseUrl}?share=${shareId}`;
      await navigator.clipboard.writeText(shareLink);
      alert('分享链接已复制到剪贴板');
    } catch (error) {
      alert('复制失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };
  

  
  // 导入分享
  const importShare = async () => {
    if (!shareUrl) return;
    
    try {
      setIsImportingShare(true);
      
      // 提取分享数据
      let shareData = shareUrl;
      if (shareUrl.includes('?share=')) {
        shareData = shareUrl.split('?share=')[1];
      }
      
      const loadedShareData = dataManager.loadShareData(shareData);
      if (!loadedShareData) {
        throw new Error('分享链接无效或已过期');
      }
      
      // 合并数据
      const mergedData: AppData = {
        websites: [...currentData.websites, ...loadedShareData.websites],
        tags: [...currentData.tags, ...loadedShareData.tags],
        tagRelations: [...currentData.tagRelations],
        version: currentData.version,
        lastUpdated: new Date().toISOString()
      };
      
      setCurrentData(mergedData);
      dataManager.saveLocalData(mergedData);
      
      alert(`成功导入 ${loadedShareData.websites.length} 个网站和 ${loadedShareData.tags.length} 个标签`);
      setShareUrl('');
    } catch (error) {
      alert('导入分享失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsImportingShare(false);
    }
  };
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };
  
  // 格式化过期时间
  const formatExpiresAt = (expiresAt: string) => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diff = expires.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days <= 0) return '已过期';
    if (days === 1) return '今天过期';
    return `${days}天后过期`;
  };
  

  
  return (
    <div className="w-full max-w-none p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">数据管理</h1>
          <p className="text-muted-foreground mt-1">
            管理您的网站数据，支持导入导出和分享功能
          </p>
        </div>
      </div>

      {/* 数据统计 */}
      <Card>
        <CardHeader>
          <CardTitle>数据统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalWebsites}</div>
              <div className="text-sm text-muted-foreground">网站总数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalTags}</div>
              <div className="text-sm text-muted-foreground">标签总数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.featuredWebsites}</div>
              <div className="text-sm text-muted-foreground">精选网站</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalClicks}</div>
              <div className="text-sm text-muted-foreground">总点击量</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            最后更新: {formatDate(stats.lastUpdated)}
          </div>
        </CardContent>
      </Card>

      {/* 数据操作 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 导入导出 */}
        <Card>
          <CardHeader>
            <CardTitle>导入导出</CardTitle>
            <CardDescription>
              备份和恢复您的网站数据
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button 
                onClick={exportData} 
                className="w-full gap-2"
                disabled={isExporting}
              >
                <Download className="w-4 h-4" />
                {isExporting ? '导出中...' : '导出数据'}
              </Button>
              <p className="text-xs text-muted-foreground">
                将当前数据导出为JSON文件
              </p>
            </div>

            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button 
                onClick={selectFile} 
                variant="outline" 
                className="w-full gap-2"
                disabled={isImporting}
              >
                <Upload className="w-4 h-4" />
                {isImporting ? '导入中...' : '导入数据'}
              </Button>
              <p className="text-xs text-muted-foreground">
                从JSON文件导入数据（会合并到现有数据）
              </p>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={resetData} 
                variant="destructive" 
                className="w-full gap-2"
                disabled={isResetting}
              >
                <Trash2 className="w-4 h-4" />
                {isResetting ? '重置中...' : '重置数据'}
              </Button>
              <p className="text-xs text-muted-foreground">
                清空所有数据（不可恢复）
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 分享管理 */}
        <Card>
          <CardHeader>
            <CardTitle>分享管理</CardTitle>
            <CardDescription>
              创建和管理分享链接
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button 
                onClick={createShare} 
                className="w-full gap-2"
                disabled={isCreatingShare}
              >
                <Share className="w-4 h-4" />
                {isCreatingShare ? '创建中...' : '创建分享链接'}
              </Button>
              <p className="text-xs text-muted-foreground">
                创建当前数据的分享链接
              </p>
            </div>

            <div className="space-y-2">
              <Input
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                placeholder="分享说明（可选）"
                className="w-full"
              />
              <Select value={shareExpiresIn} onValueChange={setShareExpiresIn}>
                <SelectTrigger>
                  <SelectValue placeholder="选择过期时间" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1天</SelectItem>
                  <SelectItem value="7">7天</SelectItem>
                  <SelectItem value="30">30天</SelectItem>
                  <SelectItem value="0">永不过期</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>



      {/* 导入分享 */}
      <Card>
        <CardHeader>
          <CardTitle>导入分享</CardTitle>
          <CardDescription>
            从分享链接导入数据
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              onChange={(e) => setShareUrl(e.target.value)}
              placeholder="输入分享链接或分享ID"
              className="flex-1"
            />
            <Button 
              onClick={importShare} 
              disabled={!shareUrl || isImportingShare}
            >
              {isImportingShare ? '导入中...' : '导入'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            支持完整的分享链接或仅分享ID
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Share, Copy, ExternalLink } from 'lucide-react';
import { dataManager } from '../utils/dataManager';

export function ShareTest() {
  const [shareUrl, setShareUrl] = useState('');
  const [testResult, setTestResult] = useState('');

  const handleCreateShare = () => {
    try {
      const localData = dataManager.getLocalData();
      const url = dataManager.createShareLink(localData, '测试分享', 7);
      setShareUrl(url);
      setTestResult('✅ 分享链接生成成功');
    } catch (error) {
      setTestResult(`❌ 生成失败: ${error}`);
    }
  };

  const handleTestImport = () => {
    if (!shareUrl) {
      setTestResult('❌ 请先生成分享链接');
      return;
    }

    try {
      const urlParams = new URL(shareUrl).searchParams;
      const shareData = urlParams.get('share');
      
      if (!shareData) {
        setTestResult('❌ 无效的分享链接');
        return;
      }

      const loadedShareData = dataManager.loadShareData(shareData);
      if (!loadedShareData) {
        setTestResult('❌ 无法加载分享数据');
        return;
      }

      const localData = dataManager.getLocalData();
      const duplicateCheck = dataManager.checkDuplicates(localData, loadedShareData);
      
      setTestResult(`✅ 导入测试成功
- 分享数据: ${loadedShareData.websites.length} 个网站, ${loadedShareData.tags.length} 个标签
- 重复检测: ${duplicateCheck.duplicateWebsites.length} 个重复网站, ${duplicateCheck.duplicateTags.length} 个重复标签
- 新内容: ${duplicateCheck.newWebsites.length} 个新网站, ${duplicateCheck.newTags.length} 个新标签`);
    } catch (error) {
      setTestResult(`❌ 导入测试失败: ${error}`);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setTestResult('✅ 分享链接已复制到剪贴板');
    } catch (error) {
      setTestResult('❌ 复制失败');
    }
  };

  const openInNewTab = () => {
    if (!shareUrl) return;
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">分享功能测试</h1>
        <p className="text-muted-foreground">测试分享链接的生成和导入功能</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share className="w-5 h-5" />
              生成分享链接
            </CardTitle>
            <CardDescription>
              测试分享链接的生成功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleCreateShare} className="w-full gap-2">
              <Share className="w-4 h-4" />
              生成测试分享链接
            </Button>
            
            {shareUrl && (
              <div className="space-y-2">
                <Label>生成的分享链接:</Label>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="flex-1" />
                  <Button onClick={copyToClipboard} variant="outline" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button onClick={openInNewTab} variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              测试导入功能
            </CardTitle>
            <CardDescription>
              测试分享链接的导入和重复检测功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleTestImport} 
              disabled={!shareUrl}
              className="w-full gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              测试导入功能
            </Button>
            
            <div className="text-sm text-muted-foreground">
              点击按钮测试分享链接的导入功能，包括重复数据检测
            </div>
          </CardContent>
        </Card>
      </div>

      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle>测试结果</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
              {testResult}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>功能说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">分享功能特性:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 使用Base64编码分享数据</li>
                <li>• 支持设置分享说明和过期时间</li>
                <li>• 自动检测重复数据</li>
                <li>• 支持选择导入方式（新建/替换/跳过）</li>
                <li>• 纯前端实现，无需服务器</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">测试步骤:</h3>
              <ol className="space-y-1 text-sm text-muted-foreground">
                <li>1. 点击"生成测试分享链接"</li>
                <li>2. 复制生成的链接</li>
                <li>3. 点击"测试导入功能"</li>
                <li>4. 查看测试结果</li>
                <li>5. 在新标签页中打开链接测试完整流程</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


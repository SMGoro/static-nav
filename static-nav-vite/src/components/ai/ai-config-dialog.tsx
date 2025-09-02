import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Settings, Globe, Zap, Save, TestTube } from 'lucide-react';
import { AIConfig, AIService } from '../../services/ai-service';

interface AIConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: AIConfig) => void;
  currentConfig?: AIConfig;
}

const STORAGE_KEY = 'ai_config';

export function AIConfigDialog({ isOpen, onClose, onSave, currentConfig }: AIConfigDialogProps) {
  const [config, setConfig] = useState<AIConfig>(AIService.getDefaultConfig());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      // 从localStorage加载配置
      const savedConfig = localStorage.getItem(STORAGE_KEY);
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          setConfig({ ...AIService.getDefaultConfig(), ...parsed });
        } catch (error) {
          console.error('加载AI配置失败:', error);
        }
      } else if (currentConfig) {
        setConfig(currentConfig);
      }
    }
  }, [isOpen, currentConfig]);

  const handleSave = () => {
    // 保存到localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    onSave(config);
    onClose();
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult('');
    
    try {
      const aiService = new AIService(config);
      const result = await aiService.getRecommendations({
        query: '推荐一些优秀的编程学习网站',
        maxResults: 1
      });
      
      setTestResult(`✅ 连接成功！AI推荐了 ${result.websites.length} 个网站，置信度：${(result.confidence * 100).toFixed(1)}%`);
    } catch (error) {
      setTestResult(`❌ 连接失败：${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const updateConfig = (updates: Partial<AIConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            AI 配置设置
          </DialogTitle>
          <DialogDescription>
            配置AI推荐服务的API接口和参数
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* API配置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                API 配置
              </CardTitle>
              <CardDescription>
                配置OpenAI兼容的API接口
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiEndpoint">API 端点</Label>
                <Input
                  id="apiEndpoint"
                  value={config.apiEndpoint}
                  onChange={(e) => updateConfig({ apiEndpoint: e.target.value })}
                  placeholder="https://api.openai.com/v1/chat/completions"
                />
                <p className="text-xs text-muted-foreground">
                  支持OpenAI API或兼容的第三方API
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API 密钥</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={config.apiKey || ''}
                  onChange={(e) => updateConfig({ apiKey: e.target.value })}
                  placeholder="sk-..."
                />
                <p className="text-xs text-muted-foreground">
                 某些API可能需要密钥，某些可能不需要
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model">模型</Label>
                  <Input
                    id="model"
                    value={config.model}
                    onChange={(e) => updateConfig({ model: e.target.value })}
                    placeholder="gpt-3.5-turbo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTokens">最大令牌数</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={config.maxTokens}
                    onChange={(e) => updateConfig({ maxTokens: parseInt(e.target.value) || 2000 })}
                    placeholder="2000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">温度 (创造性)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={config.temperature}
                  onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) || 0.7 })}
                  placeholder="0.7"
                />
                <p className="text-xs text-muted-foreground">
                  0-2，数值越高创造性越强，但可能不够准确
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 预设配置 */}
          <Card>
            <CardHeader>
              <CardTitle>预设配置</CardTitle>
              <CardDescription>
                快速选择常用的API配置
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => updateConfig({
                    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
                    model: 'gpt-3.5-turbo',
                    maxTokens: 2000,
                    temperature: 0.7
                  })}
                  className="justify-start"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  OpenAI GPT-3.5
                </Button>

                <Button
                  variant="outline"
                  onClick={() => updateConfig({
                    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
                    model: 'gpt-4',
                    maxTokens: 3000,
                    temperature: 0.7
                  })}
                  className="justify-start"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  OpenAI GPT-4
                </Button>

                <Button
                  variant="outline"
                  onClick={() => updateConfig({
                    apiEndpoint: 'https://api.anthropic.com/v1/messages',
                    model: 'claude-3-sonnet-20240229',
                    maxTokens: 2000,
                    temperature: 0.7
                  })}
                  className="justify-start"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Claude 3 Sonnet
                </Button>

                <Button
                  variant="outline"
                  onClick={() => updateConfig({
                    apiEndpoint: 'https://api.moonshot.cn/v1/chat/completions',
                    model: 'moonshot-v1-8k',
                    maxTokens: 2000,
                    temperature: 0.7
                  })}
                  className="justify-start"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Moonshot
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 测试连接 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                测试连接
              </CardTitle>
              <CardDescription>
                测试AI服务是否正常工作
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleTest}
                disabled={isTesting || !config.apiEndpoint}
                className="w-full gap-2"
              >
                {isTesting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    测试中...
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4" />
                    测试连接
                  </>
                )}
              </Button>

              {testResult && (
                <div className={`p-3 rounded-lg text-sm ${
                  testResult.startsWith('✅') 
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {testResult}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              保存配置
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

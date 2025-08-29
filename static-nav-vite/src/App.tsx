import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Website } from './types/website';
import { Navigation } from './components/Navigation';

import { WebsiteForm } from './components/WebsiteForm';
import { ShareDialog } from './components/ShareDialog';
import { ImportConfirmDialog } from './components/ImportConfirmDialog';
import { AIRecommendation } from './components/AIRecommendation';
import { TagManagement } from './components/TagManagement';
import { DetailedTagFilter } from './components/DetailedTagFilter';
import { DataManager } from './components/DataManager';
import { WebsiteDetailPage } from './components/WebsiteDetailPage';
import { ShareTest } from './components/ShareTest';
import { ThemeToggle } from './components/ThemeToggle';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SEOHead } from './components/SEOHead';

import { Button } from './components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from './components/ui/sheet';
import { Bot, Home, Plus, Tag, Filter, Menu, X, Database, TestTube } from 'lucide-react';
import { dataManager, AppData, ShareData, DuplicateCheckResult } from './utils/dataManager';

// 主应用内容组件
function AppContent() {
  const [appData, setAppData] = useState<AppData>(dataManager.getLocalData());

  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [duplicateResult, setDuplicateResult] = useState<DuplicateCheckResult | null>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // 保存数据到本地存储
  const saveData = (newData: AppData) => {
    setAppData(newData);
    dataManager.saveLocalData(newData);
  };

  // 初始化数据 - 如果是第一次访问且没有数据，则加载默认数据
  useEffect(() => {
    // 检查URL参数中是否有分享数据
    const urlParams = new URLSearchParams(window.location.search);
    const shareData = urlParams.get('share');
    
    if (shareData) {
      // 如果有分享数据，尝试加载
      const loadedShareData = dataManager.loadShareData(shareData);
      if (loadedShareData) {
        // 检查重复数据
        const duplicateCheck = dataManager.checkDuplicates(appData, loadedShareData);
        
        if (duplicateCheck.hasDuplicates) {
          // 如果有重复数据，显示确认对话框
          setShareData(loadedShareData);
          setDuplicateResult(duplicateCheck);
          setShowImportConfirm(true);
        } else {
          // 如果没有重复数据，直接导入
          const mergedData = dataManager.mergeShareData(appData, loadedShareData, false);
          saveData(mergedData);
          // 显示成功提示
          alert(`成功导入 ${loadedShareData.websites.length} 个网站和 ${loadedShareData.tags.length} 个标签！`);
        }
        // 清除URL参数
        window.history.replaceState({}, '', window.location.pathname);
      } else {
        alert('分享链接无效或已过期');
      }
    } else {
      // 如果没有分享数据，检查本地数据
      const localData = dataManager.getLocalData();
      if (localData.websites.length === 0) {
        // 如果没有数据，加载默认的mock数据
        const defaultData = dataManager.getDefaultData();
        saveData(defaultData);
      }
    }
  }, []); // 只在组件挂载时执行一次

  const websites = appData.websites;

  const handleViewWebsite = (website: Website) => {
    navigate(`/website/${website.slug || website.id}`);
  };

  const handleAddWebsite = () => {
    setEditingWebsite(null);
    navigate('/add');
    setMobileMenuOpen(false);
  };

  const handleEditWebsite = (website: Website) => {
    setEditingWebsite(website);
    navigate(`/edit/${website.slug || website.id}`);
  };

  const handleSaveWebsite = (websiteData: Omit<Website, 'id'>) => {
    const newAppData = { ...appData };
    
    if (editingWebsite) {
      // 编辑现有网站
      newAppData.websites = newAppData.websites.map(site => 
        site.id === editingWebsite.id 
          ? { ...websiteData, id: editingWebsite.id }
          : site
      );
    } else {
      // 添加新网站
      const newWebsite: Website = {
        ...websiteData,
        id: dataManager.generateShareId() // 使用更可靠的ID生成方法
      };
      newAppData.websites = [...newAppData.websites, newWebsite];
    }
    
    saveData(newAppData);
    
    // 只有在编辑模式下才跳转到主页，AI推荐添加时不跳转
    if (editingWebsite) {
      navigate('/');
    }
    setEditingWebsite(null);
  };

  const handleDeleteWebsite = (id: string) => {
    const newAppData = {
      ...appData,
      websites: appData.websites.filter(site => site.id !== id)
    };
    saveData(newAppData);
  };

  const handleShareWebsite = (website: Website) => {
    // 创建单个网站的分享数据
    const shareData: ShareData = {
      websites: [website],
      tags: appData.tags.filter(tag => website.tags.includes(tag.name)),
      shareId: dataManager.generateShareId(),
      createdAt: new Date().toISOString()
    };
    setShareData(shareData);
  };

  const handleAdvancedFilter = () => {
    navigate('/filter');
    setMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  // 根据当前路径渲染对应的组件
  const renderCurrentView = () => {
    const path = location.pathname;
    
    if (path === '/') {
      return (
        <Navigation
          websites={websites}
          onAddWebsite={handleAddWebsite}
          onEditWebsite={handleEditWebsite}
          onDeleteWebsite={handleDeleteWebsite}
          onViewWebsite={handleViewWebsite}
          onShareWebsite={handleShareWebsite}
          onCreateShare={() => setShowShareDialog(true)}
          onAdvancedFilter={handleAdvancedFilter}
        />
      );
    }
    
    if (path === '/add') {
      return (
        <WebsiteForm
          website={undefined}
          onSave={handleSaveWebsite}
          onCancel={() => navigate('/')}
        />
      );
    }
    
    if (path.startsWith('/edit/')) {
      const websiteId = path.split('/edit/')[1];
      const website = websites.find(w => w.id === websiteId || w.slug === websiteId);
      if (website) {
        return (
          <WebsiteForm
            website={website}
            onSave={handleSaveWebsite}
            onCancel={() => navigate('/')}
          />
        );
      }
      return <Navigate to="/" replace />;
    }
    
    if (path === '/ai') {
      return (
        <AIRecommendation
          onAddWebsite={handleSaveWebsite}
        />
      );
    }
    
    if (path === '/tags') {
      return (
        <TagManagement
          websites={websites}
        />
      );
    }
    
    if (path === '/filter') {
      return (
        <DetailedTagFilter
          websites={websites}
          onBack={() => navigate('/')}
          onEditWebsite={handleEditWebsite}
          onDeleteWebsite={handleDeleteWebsite}
          onViewWebsite={handleViewWebsite}
          onShareWebsite={handleShareWebsite}
        />
      );
    }
    
    if (path === '/data') {
      return (
        <DataManager />
      );
    }
    
    if (path === '/test') {
      return (
        <ShareTest />
      );
    }
    
    return <Navigate to="/" replace />;
  };

  const showHeader = !location.pathname.startsWith('/website/') && location.pathname !== '/filter';

  const navigationItems = [
    {
      key: '/',
      icon: Home,
      label: '首页',
      action: () => handleNavigation('/')
    },
    {
      key: '/tags',
      icon: Tag,
      label: '标签管理',
      action: () => handleNavigation('/tags')
    },
    {
      key: '/filter',
      icon: Filter,
      label: '高级筛选',
      action: () => handleNavigation('/filter')
    },
    {
      key: '/ai',
      icon: Bot,
      label: 'AI推荐',
      action: () => handleNavigation('/ai')
    },
    {
      key: '/data',
      icon: Database,
      label: '数据管理',
      action: () => handleNavigation('/data')
    },
    {
      key: '/test',
      icon: TestTube,
      label: '分享测试',
      action: () => handleNavigation('/test')
    },
    {
      key: '/add',
      icon: Plus,
      label: '添加网站',
      action: handleAddWebsite
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead />
      {/* 顶部导航栏 */}
      {showHeader && (
        <header className="border-b bg-card sticky top-0 z-50">
          <div className="w-full px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              {/* 左侧：Logo 和导航 */}
              <div className="flex items-center min-w-0">
                <h1 className="text-sm sm:text-xl mr-3 sm:mr-6 flex-shrink-0">导航站</h1>
                
                {/* 桌面端导航 */}
                <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
                  {navigationItems.map((item) => (
                    <Button
                      key={item.key}
                      variant={location.pathname === item.key ? 'default' : 'ghost'}
                      onClick={item.action}
                      className="gap-1.5 px-2 xl:px-3 text-sm"
                      size="sm"
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="hidden xl:inline">{item.label}</span>
                    </Button>
                  ))}
                </nav>

                {/* 平板端导航 - 只显示图标 */}
                <nav className="hidden md:flex lg:hidden items-center space-x-1">
                  {navigationItems.map((item) => (
                    <Button
                      key={item.key}
                      variant={location.pathname === item.key ? 'default' : 'ghost'}
                      onClick={item.action}
                      className="px-2"
                      size="sm"
                      title={item.label}
                    >
                      <item.icon className="w-4 h-4" />
                    </Button>
                  ))}
                </nav>

                {/* 移动端菜单按钮 */}
                <div className="md:hidden">
                  <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm" className="px-2">
                        <Menu className="w-4 h-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between p-4 border-b">
                          <h2 className="text-lg">导航菜单</h2>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-2"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <nav className="flex-1 p-4">
                          <div className="space-y-2">
                            {navigationItems.map((item) => (
                              <Button
                                key={item.key}
                                variant={location.pathname === item.key ? 'default' : 'ghost'}
                                onClick={item.action}
                                className="w-full justify-start gap-3 h-12"
                              >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                              </Button>
                            ))}
                          </div>
                        </nav>
                        <div className="p-4 border-t">
                          <div className="text-sm text-muted-foreground text-center">
                            共收录 {websites.length} 个网站
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
              
              {/* 右侧：统计信息和主题切换 */}
              <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                <div className="text-xs sm:text-sm text-muted-foreground hidden lg:block">
                  共收录 {websites.length} 个网站
                </div>
                <div className="text-xs text-muted-foreground hidden md:block lg:hidden">
                  {websites.length} 个网站
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>
      )}

      {/* 主内容区域 */}
      <main className="flex-1">
        {renderCurrentView()}
      </main>

      {/* 分享对话框 */}
      <ShareDialog
        shareData={shareData}
        isOpen={!!shareData || showShareDialog}
        onClose={() => {
          setShareData(null);
          setShowShareDialog(false);
        }}
        onImport={(importedShareData) => {
          const mergedData: AppData = {
            websites: [...appData.websites, ...importedShareData.websites],
            tags: [...appData.tags, ...importedShareData.tags],
            tagRelations: [...appData.tagRelations],
            version: appData.version,
            lastUpdated: new Date().toISOString()
          };
          saveData(mergedData);
        }}
      />

      {/* 导入确认对话框 */}
      <ImportConfirmDialog
        isOpen={showImportConfirm}
        onClose={() => {
          setShowImportConfirm(false);
          setShareData(null);
          setDuplicateResult(null);
        }}
        shareData={shareData}
        duplicateResult={duplicateResult}
        onImport={(replaceDuplicates) => {
          if (shareData) {
            const mergedData = dataManager.mergeShareData(appData, shareData, replaceDuplicates);
            saveData(mergedData);
            // 显示成功提示
            alert(`成功导入 ${shareData.websites.length} 个网站和 ${shareData.tags.length} 个标签！`);
          }
        }}
      />
    </div>
  );
}

// 主应用组件（带路由）
function AppWithRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/add" element={<AppContent />} />
        <Route path="/edit/:id" element={<AppContent />} />
        <Route path="/ai" element={<AppContent />} />
        <Route path="/tags" element={<AppContent />} />
        <Route path="/filter" element={<AppContent />} />
        <Route path="/data" element={<AppContent />} />
        <Route path="/test" element={<AppContent />} />
        <Route path="/website/:slug" element={<WebsiteDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppWithRouter />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
import { useState } from 'react';
import { Website } from './types/website';
import { Navigation } from './components/Navigation';
import { WebsiteDetail } from './components/WebsiteDetail';
import { WebsiteForm } from './components/WebsiteForm';
import { ShareDialog } from './components/ShareDialog';
import { AIRecommendation } from './components/AIRecommendation';
import { TagManagement } from './components/TagManagement';
import { DetailedTagFilter } from './components/DetailedTagFilter';
import { ThemeToggle } from './components/ThemeToggle';
import { ThemeProvider } from './contexts/ThemeContext';
import { mockWebsites } from './data/mockData';
import { Button } from './components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from './components/ui/sheet';
import { Bot, Home, Plus, Tag, Filter, Menu, X } from 'lucide-react';

type ViewType = 'navigation' | 'detail' | 'form' | 'ai' | 'tags' | 'filter';

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewType>('navigation');
  const [websites, setWebsites] = useState<Website[]>(mockWebsites);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [editingWebsite, setEditingWebsite] = useState<Website | null>(null);
  const [shareWebsite, setShareWebsite] = useState<Website | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleViewWebsite = (website: Website) => {
    setSelectedWebsite(website);
    setCurrentView('detail');
  };

  const handleAddWebsite = () => {
    setEditingWebsite(null);
    setCurrentView('form');
    setMobileMenuOpen(false);
  };

  const handleEditWebsite = (website: Website) => {
    setEditingWebsite(website);
    setCurrentView('form');
  };

  const handleSaveWebsite = (websiteData: Omit<Website, 'id'>) => {
    if (editingWebsite) {
      // 编辑现有网站
      setWebsites(prev => prev.map(site => 
        site.id === editingWebsite.id 
          ? { ...websiteData, id: editingWebsite.id }
          : site
      ));
    } else {
      // 添加新网站
      const newWebsite: Website = {
        ...websiteData,
        id: Date.now().toString()
      };
      setWebsites(prev => [...prev, newWebsite]);
    }
    setCurrentView('navigation');
    setEditingWebsite(null);
  };

  const handleDeleteWebsite = (id: string) => {
    setWebsites(prev => prev.filter(site => site.id !== id));
  };

  const handleShareWebsite = (website: Website) => {
    setShareWebsite(website);
  };

  const handleAdvancedFilter = () => {
    setCurrentView('filter');
    setMobileMenuOpen(false);
  };

  const handleNavigation = (view: ViewType) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'navigation':
        return (
          <Navigation
            websites={websites}
            onAddWebsite={handleAddWebsite}
            onEditWebsite={handleEditWebsite}
            onDeleteWebsite={handleDeleteWebsite}
            onViewWebsite={handleViewWebsite}
            onShareWebsite={handleShareWebsite}
            onAdvancedFilter={handleAdvancedFilter}
          />
        );
      
      case 'detail':
        return selectedWebsite ? (
          <WebsiteDetail
            website={selectedWebsite}
            onBack={() => setCurrentView('navigation')}
            onEdit={handleEditWebsite}
            onShare={handleShareWebsite}
          />
        ) : null;
      
      case 'form':
        return (
          <WebsiteForm
            website={editingWebsite}
            onSave={handleSaveWebsite}
            onCancel={() => setCurrentView('navigation')}
          />
        );
      
      case 'ai':
        return (
          <AIRecommendation
            onAddWebsite={handleSaveWebsite}
          />
        );

      case 'tags':
        return (
          <TagManagement
            websites={websites}
          />
        );

      case 'filter':
        return (
          <DetailedTagFilter
            websites={websites}
            onBack={() => setCurrentView('navigation')}
            onEditWebsite={handleEditWebsite}
            onDeleteWebsite={handleDeleteWebsite}
            onViewWebsite={handleViewWebsite}
            onShareWebsite={handleShareWebsite}
          />
        );
      
      default:
        return null;
    }
  };

  const showHeader = currentView !== 'filter'; // 详细筛选页面有自己的头部

  const navigationItems = [
    {
      key: 'navigation' as ViewType,
      icon: Home,
      label: '首页',
      action: () => handleNavigation('navigation')
    },
    {
      key: 'tags' as ViewType,
      icon: Tag,
      label: '标签管理',
      action: () => handleNavigation('tags')
    },
    {
      key: 'filter' as ViewType,
      icon: Filter,
      label: '高级筛选',
      action: () => handleNavigation('filter')
    },
    {
      key: 'ai' as ViewType,
      icon: Bot,
      label: 'AI推荐',
      action: () => handleNavigation('ai')
    },
    {
      key: 'add',
      icon: Plus,
      label: '添加网站',
      action: handleAddWebsite
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      {showHeader && (
        <header className="border-b bg-card sticky top-0 z-50">
          <div className="w-full px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              {/* 左侧：Logo 和导航 */}
              <div className="flex items-center min-w-0">
                <h1 className="text-lg sm:text-xl mr-3 sm:mr-6 flex-shrink-0">导航站</h1>
                
                {/* 桌面端导航 */}
                <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
                  {navigationItems.map((item) => (
                    <Button
                      key={item.key}
                      variant={currentView === item.key ? 'default' : 'ghost'}
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
                      variant={currentView === item.key ? 'default' : 'ghost'}
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
                                variant={currentView === item.key ? 'default' : 'ghost'}
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
        website={shareWebsite}
        isOpen={!!shareWebsite}
        onClose={() => setShareWebsite(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
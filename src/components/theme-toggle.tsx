import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useTheme } from '../contexts/theme-context';
import { useI18n } from '../contexts/i18n-context';

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme();
  const { t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          {actualTheme === 'dark' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {theme === 'system' ? t('theme.system') : actualTheme === 'dark' ? t('theme.dark') : t('theme.light')}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className="gap-2"
        >
          <Sun className="w-4 h-4" />
          {t('theme.light')}
          {theme === 'light' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className="gap-2"
        >
          <Moon className="w-4 h-4" />
          {t('theme.dark')}
          {theme === 'dark' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className="gap-2"
        >
          <Monitor className="w-4 h-4" />
          {t('theme.system')}
          {theme === 'system' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
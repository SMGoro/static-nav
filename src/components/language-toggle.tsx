import React from 'react';
import { useI18n } from '../contexts/i18n-context';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Languages, Check } from 'lucide-react';

interface LanguageToggleProps {
  variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'destructive' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  variant = 'ghost',
  size = 'sm',
  showLabel = true,
  className = ''
}) => {
  const { currentLanguage, setLanguage, supportedLanguages, t } = useI18n();

  const currentLang = supportedLanguages.find(lang => lang.code === currentLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`gap-2 ${className}`}
          title={t('language.switchLanguage')}
        >
          <Languages className="w-4 h-4" />
          {showLabel && (
            <span className="hidden sm:inline">
              {currentLang?.nativeName || currentLang?.name}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {supportedLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLanguage(language.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{language.nativeName}</span>
              <span className="text-xs text-muted-foreground">
                {language.name}
              </span>
            </div>
            {currentLanguage === language.code && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// 简化版本的语言切换器（只显示图标）
export const LanguageToggleIcon: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <LanguageToggle
      variant="ghost"
      size="icon"
      showLabel={false}
      className={className}
    />
  );
};

// 带标签的语言切换器
export const LanguageToggleWithLabel: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <LanguageToggle
      variant="outline"
      size="sm"
      showLabel={true}
      className={className}
    />
  );
};

import { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Plus, X } from 'lucide-react';

interface TagManagerProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  label?: string;
  placeholder?: string;
}

export function TagManager({ 
  tags, 
  onTagsChange, 
  label = "标签",
  placeholder = "添加标签" 
}: TagManagerProps) {
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onTagsChange([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    onTagsChange(tags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2 mb-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
        />
        <Button 
          type="button" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addTag();
          }} 
          size="sm" 
          variant="outline"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Badge 
            key={`${tag}-${index}`} 
            variant="secondary"
            className="gap-1 pr-1"
          >
            <span>{tag}</span>
            <button
              type="button"
              className="ml-1 hover:bg-destructive/20 rounded-sm p-0.5"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeTag(tag);
              }}
            >
              <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}

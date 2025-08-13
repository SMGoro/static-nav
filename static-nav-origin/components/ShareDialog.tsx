import { useState } from 'react';
import { Website } from '../types/website';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Copy, Check, Share2 } from 'lucide-react';

interface ShareDialogProps {
  website: Website | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareDialog({ website, isOpen, onClose }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  
  if (!website) return null;

  const shareUrl = `${window.location.origin}/website/${website.id}`;
  const shareText = `${website.title} - ${website.description}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareToSocial = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    
    let shareLink = '';
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'weibo':
        shareLink = `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedText}`;
        break;
      default:
        return;
    }
    
    window.open(shareLink, '_blank', 'width=600,height=400');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            分享网站
          </DialogTitle>
          <DialogDescription>
            分享 "{website.title}" 给其他人
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="share-url">分享链接</Label>
            <div className="flex gap-2">
              <Input
                id="share-url"
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                onClick={copyToClipboard}
                className="gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    复制
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>分享到社交平台</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => shareToSocial('weibo')}
                className="justify-start"
              >
                📱 微博
              </Button>
              <Button
                variant="outline"
                onClick={() => shareToSocial('twitter')}
                className="justify-start"
              >
                🐦 Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => shareToSocial('facebook')}
                className="justify-start"
              >
                📘 Facebook
              </Button>
              <Button
                variant="outline"
                onClick={() => shareToSocial('linkedin')}
                className="justify-start"
              >
                💼 LinkedIn
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>关闭</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
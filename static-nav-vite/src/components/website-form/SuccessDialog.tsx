import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface SuccessDialogProps {
  isOpen: boolean;
  websiteTitle: string;
  onChoice: (continueAdding: boolean) => void;
}

export function SuccessDialog({ isOpen, websiteTitle, onChoice }: SuccessDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-green-700">网站添加成功！</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            网站 "{websiteTitle}" 已成功添加到导航中
          </p>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => onChoice(true)}
              className="w-full"
            >
              继续添加网站
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onChoice(false)}
              className="w-full"
            >
              返回主页面
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

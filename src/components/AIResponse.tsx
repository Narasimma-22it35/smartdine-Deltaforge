import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIResponseProps {
  message: string;
  isVisible: boolean;
}

const AIResponse = ({ message, isVisible }: AIResponseProps) => {
  if (!isVisible || !message) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div 
        className={cn(
          "max-w-3xl mx-auto p-6 rounded-2xl bg-card shadow-card border border-primary/10",
          "animate-slide-up"
        )}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 gradient-warm rounded-xl flex items-center justify-center shadow-soft">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-primary mb-2">SmartDine AI</p>
            <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIResponse;

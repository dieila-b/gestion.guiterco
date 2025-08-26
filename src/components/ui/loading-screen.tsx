
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  progress?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Chargement...", 
  progress 
}) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-4 p-6 rounded-lg bg-card shadow-lg">
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          {progress !== undefined && (
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-2">{message}</p>
        {progress !== undefined && (
          <p className="text-xs text-muted-foreground">
            {Math.round(progress)}%
          </p>
        )}
      </div>
    </div>
  );
};

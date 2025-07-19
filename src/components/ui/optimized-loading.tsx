
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface OptimizedLoadingProps {
  type?: 'skeleton' | 'spinner' | 'inline';
  lines?: number;
  className?: string;
  text?: string;
}

export const OptimizedLoading: React.FC<OptimizedLoadingProps> = ({ 
  type = 'skeleton', 
  lines = 3, 
  className = '',
  text = 'Chargement...'
}) => {
  if (type === 'spinner') {
    return (
      <div className={`flex items-center justify-center py-4 ${className}`}>
        <LoadingSpinner size="md" />
        <span className="ml-2 text-sm text-gray-600">{text}</span>
      </div>
    );
  }

  if (type === 'inline') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" />
        <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
        <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        <span className="text-sm text-gray-600 ml-2">{text}</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-4 border rounded-lg ${className}`}>
    <Skeleton className="h-6 w-3/4 mb-2" />
    <Skeleton className="h-4 w-1/2 mb-4" />
    <Skeleton className="h-8 w-full" />
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ 
  rows = 5, 
  cols = 4 
}) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

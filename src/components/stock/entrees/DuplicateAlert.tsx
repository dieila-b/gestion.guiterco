
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface DuplicateAlertProps {
  message: string;
  onDismiss: () => void;
}

export const DuplicateAlert = ({ message, onDismiss }: DuplicateAlertProps) => {
  if (!message) return null;
  
  return (
    <Alert className="border border-orange-200 bg-orange-50 mb-4">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800 flex justify-between items-center">
        <span>{message}</span>
        <button 
          onClick={onDismiss}
          className="ml-2 text-orange-600 hover:text-orange-800 font-medium"
        >
          ✕
        </button>
      </AlertDescription>
    </Alert>
  );
};

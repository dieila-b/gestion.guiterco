
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface UserEditErrorBoundaryProps {
  error?: Error | string;
  onRetry?: () => void;
  onCancel?: () => void;
}

const UserEditErrorBoundary = ({ error, onRetry, onCancel }: UserEditErrorBoundaryProps) => {
  const errorMessage = typeof error === 'string' ? error : error?.message || 'Une erreur inconnue est survenue';

  return (
    <div className="p-6 space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur lors du chargement</AlertTitle>
        <AlertDescription className="mt-2">
          {errorMessage}
        </AlertDescription>
      </Alert>

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Fermer
          </Button>
        )}
        {onRetry && (
          <Button onClick={onRetry} className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Réessayer</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default UserEditErrorBoundary;

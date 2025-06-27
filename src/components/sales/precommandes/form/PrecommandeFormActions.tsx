
import React from 'react';
import { Button } from '@/components/ui/button';

interface PrecommandeFormActionsProps {
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const PrecommandeFormActions = ({ onSave, onCancel, isLoading }: PrecommandeFormActionsProps) => {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={onCancel} disabled={isLoading}>
        Annuler
      </Button>
      <Button onClick={onSave} disabled={isLoading}>
        {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
      </Button>
    </div>
  );
};

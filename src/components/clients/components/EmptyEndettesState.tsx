
import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const EmptyEndettesState: React.FC = () => {
  return (
    <div className="text-center py-8 text-gray-500">
      <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-green-500" />
      <p className="text-lg font-medium text-green-600">Excellent !</p>
      <p>Aucun client n'a de factures impayées</p>
    </div>
  );
};

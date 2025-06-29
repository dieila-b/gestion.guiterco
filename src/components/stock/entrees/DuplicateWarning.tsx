

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { EntreeStock } from '@/components/stock/types';

interface DuplicateWarningProps {
  entrees: EntreeStock[] | undefined;
}

export const DuplicateWarning = ({ entrees }: DuplicateWarningProps) => {
  if (!entrees) return null;

  // Détecter les doublons potentiels
  const duplicates = entrees.reduce((acc, entree, index) => {
    const duplicateEntries = entrees.filter((other, otherIndex) => {
      if (index >= otherIndex) return false;
      
      const sameArticle = entree.article_id === other.article_id;
      const sameQuantite = entree.quantite === other.quantite;
      const sameDate = new Date(entree.created_at).toDateString() === new Date(other.created_at).toDateString();
      const sameLocation = (entree.entrepot_id === other.entrepot_id && 
                           entree.point_vente_id === other.point_vente_id);
      
      return sameArticle && sameQuantite && sameDate && sameLocation;
    });
    
    if (duplicateEntries.length > 0) {
      acc.push({
        original: entree,
        duplicates: duplicateEntries
      });
    }
    
    return acc;
  }, [] as Array<{ original: EntreeStock; duplicates: EntreeStock[] }>);

  if (duplicates.length === 0) return null;

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <div className="font-semibold mb-2">⚠️ Doublons détectés dans les entrées de stock</div>
        <div className="text-sm space-y-1">
          {duplicates.map((duplicate, index) => (
            <div key={index}>
              • <span className="font-medium">{duplicate.original.article?.nom}</span> - 
              Quantité: {duplicate.original.quantite} - 
              {duplicate.duplicates.length + 1} entrées similaires le même jour
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-orange-700">
          Ces doublons peuvent fausser vos calculs de stock. Vérifiez et supprimez les entrées non justifiées.
        </div>
      </AlertDescription>
    </Alert>
  );
};


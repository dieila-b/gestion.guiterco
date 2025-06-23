
import React from 'react';
import { formatCurrency } from '@/lib/currency';

interface LigneEdition {
  id?: string;
  article_id: string;
  quantite: number;
  quantite_livree: number;
  prix_unitaire: number;
  statut_ligne: string;
  isNew?: boolean;
}

interface PrecommandeSummaryProps {
  lignes: LigneEdition[];
}

const PrecommandeSummary = ({ lignes }: PrecommandeSummaryProps) => {
  const total = lignes.reduce((sum, ligne) => sum + (ligne.quantite * ligne.prix_unitaire), 0);

  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="font-semibold">Total de la précommande:</span>
        <span className="font-bold text-lg">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
};

export default PrecommandeSummary;

import React from 'react';
import { useVenteComptoir } from '@/hooks/useVenteComptoir';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StockPDVDiagnosticProps {
  selectedPDV?: string;
}

const StockPDVDiagnostic: React.FC<StockPDVDiagnosticProps> = ({ selectedPDV }) => {
  const { stockPDV, pointsDeVente } = useVenteComptoir(selectedPDV);

  return (
    <Card className="mb-4 border-blue-200">
      <CardHeader>
        <CardTitle className="text-sm text-blue-600">Diagnostic Stock PDV</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div>
          <strong>Points de vente disponibles:</strong> {pointsDeVente?.length || 0}
          {pointsDeVente?.map(pdv => (
            <Badge key={pdv.id} variant="outline" className="ml-1">{pdv.nom}</Badge>
          ))}
        </div>
        <div>
          <strong>PDV sélectionné:</strong> {selectedPDV || 'Aucun'}
        </div>
        <div>
          <strong>Articles en stock:</strong> {stockPDV?.length || 0}
        </div>
        {stockPDV && stockPDV.length > 0 && (
          <div className="mt-2">
            <strong>Premiers articles:</strong>
            <ul className="list-disc ml-4 mt-1">
              {stockPDV.slice(0, 3).map((item) => (
                <li key={item.id} className="text-xs">
                  {item.article?.nom || 'N/A'} - 
                  Qty: {item.quantite_disponible} - 
                  Prix: {item.article?.prix_vente || 'N/A'} - 
                  Cat: {item.article?.categorie || 'N/A'}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockPDVDiagnostic;

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Package, AlertTriangle, CheckCircle } from 'lucide-react';
import type { LignePrecommandeComplete } from '@/types/precommandes';

interface StockAvailabilityBadgeProps {
  lignes: LignePrecommandeComplete[];
}

const StockAvailabilityBadge = ({ lignes }: StockAvailabilityBadgeProps) => {
  if (!lignes || lignes.length === 0) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-600">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Aucun produit
      </Badge>
    );
  }

  // Calculer la disponibilité globale
  let totalDemande = 0;
  let totalDisponible = 0;
  let articlesDetails: string[] = [];

  lignes.forEach(ligne => {
    const quantiteRestante = ligne.quantite - (ligne.quantite_livree || 0);
    totalDemande += quantiteRestante;
    
    if (ligne.article && ligne.stock_disponible) {
      const stockTotal = ligne.stock_disponible.total || 0;
      totalDisponible += Math.min(stockTotal, quantiteRestante);
      
      articlesDetails.push(
        `${ligne.article.nom}: ${stockTotal} disponible(s) / ${quantiteRestante} demandé(s)`
      );
    }
  });

  const pourcentageDisponible = totalDemande > 0 ? (totalDisponible / totalDemande) * 100 : 0;

  let badgeColor = '';
  let icon = null;
  let label = '';

  if (pourcentageDisponible >= 100) {
    badgeColor = 'bg-green-100 text-green-800';
    icon = <CheckCircle className="h-3 w-3 mr-1" />;
    label = 'Stock OK';
  } else if (pourcentageDisponible >= 50) {
    badgeColor = 'bg-orange-100 text-orange-800';
    icon = <Package className="h-3 w-3 mr-1" />;
    label = 'Stock partiel';
  } else {
    badgeColor = 'bg-red-100 text-red-800';
    icon = <AlertTriangle className="h-3 w-3 mr-1" />;
    label = 'Stock insuffisant';
  }

  const tooltipContent = (
    <div className="space-y-1">
      <div className="font-semibold">Disponibilité du stock:</div>
      {articlesDetails.map((detail, index) => (
        <div key={index} className="text-xs">{detail}</div>
      ))}
      <div className="text-xs font-medium mt-2">
        Total: {totalDisponible}/{totalDemande} unités ({Math.round(pourcentageDisponible)}%)
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`text-xs cursor-help ${badgeColor}`}>
            {icon}
            {label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StockAvailabilityBadge;

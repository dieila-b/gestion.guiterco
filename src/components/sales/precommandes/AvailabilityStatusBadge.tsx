
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import type { LignePrecommandeComplete } from '@/types/precommandes';

interface AvailabilityStatusBadgeProps {
  lignes: LignePrecommandeComplete[];
  dateLivraisonPrevue?: string;
}

const AvailabilityStatusBadge = ({ lignes, dateLivraisonPrevue }: AvailabilityStatusBadgeProps) => {
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

  const isFullyAvailable = totalDemande > 0 && totalDisponible >= totalDemande;

  if (isFullyAvailable) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="bg-green-100 text-green-800 cursor-help">
              <CheckCircle className="h-3 w-3 mr-1" />
              Disponible
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <div className="space-y-1">
              <div className="font-semibold">Stock disponible:</div>
              {articlesDetails.map((detail, index) => (
                <div key={index} className="text-xs">{detail}</div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className="bg-orange-100 text-orange-800 cursor-help">
            <Clock className="h-3 w-3 mr-1" />
            {dateLivraisonPrevue 
              ? `Livraison prévue le ${formatDate(dateLivraisonPrevue)}`
              : 'Livraison en attente'
            }
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <div className="space-y-1">
            <div className="font-semibold">Disponibilité du stock:</div>
            {articlesDetails.map((detail, index) => (
              <div key={index} className="text-xs">{detail}</div>
            ))}
            <div className="text-xs font-medium mt-2">
              Total: {totalDisponible}/{totalDemande} unités disponibles
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AvailabilityStatusBadge;

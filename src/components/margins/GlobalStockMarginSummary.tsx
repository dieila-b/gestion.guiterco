import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, DollarSign, Percent } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { ResumeMargesGlobalesStock } from '@/types/margins';

interface GlobalStockMarginSummaryProps {
  resume: ResumeMargesGlobalesStock | undefined;
  isLoading: boolean;
}

const GlobalStockMarginSummary = ({ resume, isLoading }: GlobalStockMarginSummaryProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getTauxMargeColor = (taux: number) => {
    if (taux >= 25) return 'text-green-600 bg-green-50 border-green-200';
    if (taux >= 15) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (taux >= 5) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Aucune donnée de résumé disponible</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Articles en Stock</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{resume.total_articles_en_stock}</div>
          <p className="text-xs text-muted-foreground">
            articles avec stock disponible
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valeur Stock (Coût)</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(resume.valeur_totale_stock_cout)}</div>
          <p className="text-xs text-muted-foreground">
            coût total du stock
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valeur Stock (Vente)</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(resume.valeur_totale_stock_vente)}</div>
          <p className="text-xs text-muted-foreground">
            valeur potentielle de vente
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Marge Totale Potentielle</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(resume.marge_totale_globale)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge 
              variant="outline" 
              className={getTauxMargeColor(resume.taux_marge_moyen_pondere)}
            >
              {formatPercentage(resume.taux_marge_moyen_pondere)}
            </Badge>
            <p className="text-xs text-muted-foreground">
              taux moyen pondéré
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalStockMarginSummary;
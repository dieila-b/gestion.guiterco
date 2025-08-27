import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, TrendingUp, Info, DollarSign, BarChart3 } from 'lucide-react';
import { useRapportMargePeriode } from '@/hooks/useMargins';
import { useRefreshOperations } from '@/hooks/diagnostics/useRefreshOperations';
import { formatCurrency } from '@/lib/currency';
import PeriodSelector from './PeriodSelector';

const GlobalMarginAnalysis = () => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // Premier jour du mois
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());

  const { data: rapport, isLoading, refetch } = useRapportMargePeriode(startDate, endDate);
  const { handleRefreshData } = useRefreshOperations();

  const handlePeriodChange = (newStartDate: Date, newEndDate: Date) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const handleRefresh = async () => {
    await refetch();
    handleRefreshData();
  };

  const handleExport = () => {
    console.log('Export des marges globales');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analyse Globale des Marges
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Vue d'ensemble des performances de marge sur la période
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Chargement...' : 'Actualiser'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Sélecteur de période */}
          <PeriodSelector
            startDate={startDate}
            endDate={endDate}
            onPeriodChange={handlePeriodChange}
          />

          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : rapport ? (
            <div className="space-y-6">
              {/* Métriques principales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
                  <div className="text-sm text-blue-600 mb-1">Total Ventes</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatCurrency(rapport.total_ventes || 0)}
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-gradient-to-r from-red-50 to-red-100">
                  <div className="text-sm text-red-600 mb-1">Total Coûts</div>
                  <div className="text-2xl font-bold text-red-900">
                    {formatCurrency(rapport.total_couts || 0)}
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-green-100">
                  <div className="text-sm text-green-600 mb-1">Bénéfice Total</div>
                  <div className="text-2xl font-bold text-green-900">
                    {formatCurrency(rapport.benefice_total || 0)}
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-purple-100">
                  <div className="text-sm text-purple-600 mb-1">Taux Marge Moyen</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {(rapport.taux_marge_moyen || 0).toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* Informations supplémentaires */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Performance Période</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nombre de factures:</span>
                      <span className="font-medium">{rapport.nombre_factures || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vente moyenne par facture:</span>
                      <span className="font-medium">
                        {formatCurrency((rapport.total_ventes || 0) / Math.max(rapport.nombre_factures || 1, 1))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bénéfice moyen par facture:</span>
                      <span className="font-medium">
                        {formatCurrency((rapport.benefice_total || 0) / Math.max(rapport.nombre_factures || 1, 1))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Indicateurs Clés</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ratio coût/vente:</span>
                      <span className="font-medium">
                        {rapport.total_ventes > 0 ? 
                          (((rapport.total_couts || 0) / rapport.total_ventes) * 100).toFixed(1) + '%' : 
                          '0%'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Marge brute:</span>
                      <span className="font-medium text-green-600">
                        {rapport.total_ventes > 0 ? 
                          (((rapport.benefice_total || 0) / rapport.total_ventes) * 100).toFixed(1) + '%' : 
                          '0%'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Période analysée:</span>
                      <span className="font-medium">
                        Du {startDate.toLocaleDateString('fr-FR')} au {endDate.toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message informatif */}
              <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Analyse Globale Activée</p>
                  <p>
                    Cette vue affiche les données de marge consolidées pour la période sélectionnée. 
                    Utilisez le sélecteur de période ci-dessus pour analyser différentes plages de dates.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500">Aucune donnée de marge disponible pour cette période</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalMarginAnalysis;
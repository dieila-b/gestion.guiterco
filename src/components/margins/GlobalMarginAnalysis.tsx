import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useRapportMargePeriode } from '@/hooks/useMargins';
import GlobalMarginStatsCards from './GlobalMarginStatsCards';

const GlobalMarginAnalysis = () => {
  const [dateDebut, setDateDebut] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [dateFin, setDateFin] = useState<Date>(new Date());

  const { data: rapport, isLoading, refetch } = useRapportMargePeriode(dateDebut, dateFin);

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    // Fonctionnalité d'export à implémenter si nécessaire
    console.log('Export des données de marge pour la période:', { dateDebut, dateFin });
  };

  const setPeriodQuickSelect = (period: 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'thisYear') => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (period) {
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date();
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'thisQuarter':
        // Calculer le trimestre actuel (0-3)
        const currentQuarter = Math.floor(now.getMonth() / 3);
        // Premier mois du trimestre actuel (0, 3, 6, ou 9)
        const quarterStartMonth = currentQuarter * 3;
        // Date de début du trimestre
        startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
        // Date de fin du trimestre (dernier jour du 3ème mois)
        endDate = new Date(now.getFullYear(), quarterStartMonth + 3, 0);
        
        // Si nous sommes encore dans le trimestre, utiliser la date actuelle comme fin
        if (endDate > now) {
          endDate = new Date();
        }
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date();
        break;
    }

    console.log(`📅 Période sélectionnée (${period}):`, {
      debut: startDate.toLocaleDateString('fr-FR'),
      fin: endDate.toLocaleDateString('fr-FR'),
      quarterInfo: period === 'thisQuarter' ? {
        currentQuarter: Math.floor(now.getMonth() / 3) + 1,
        quarterStartMonth: Math.floor(now.getMonth() / 3) * 3,
        months: `${format(startDate, 'MMMM', { locale: fr })} - ${format(endDate, 'MMMM', { locale: fr })}`
      } : null
    });

    setDateDebut(startDate);
    setDateFin(endDate);
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec sélection de période */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Analyse Globale des Marges</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Analysez la rentabilité de vos ventes sur une période donnée
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
          <div className="flex flex-wrap items-center gap-4">
            {/* Sélecteurs de date */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Période :</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateDebut, 'dd/MM/yyyy', { locale: fr })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateDebut}
                    onSelect={(date) => date && setDateDebut(date)}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
              <span className="text-muted-foreground">à</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dateFin, 'dd/MM/yyyy', { locale: fr })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFin}
                    onSelect={(date) => date && setDateFin(date)}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Boutons de sélection rapide */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Raccourcis :</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPeriodQuickSelect('thisMonth')}
                className="text-xs"
              >
                Ce mois
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPeriodQuickSelect('lastMonth')}
                className="text-xs"
              >
                Mois dernier
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPeriodQuickSelect('thisQuarter')}
                className="text-xs"
              >
                Ce trimestre
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPeriodQuickSelect('thisYear')}
                className="text-xs"
              >
                Cette année
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cartes de statistiques */}
      {rapport && (
        <GlobalMarginStatsCards rapport={rapport} isLoading={isLoading} />
      )}

      {rapport && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Résumé de la période</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Période analysée</h4>
                <p className="text-sm text-gray-600">
                  Du {format(dateDebut, 'dd MMMM yyyy', { locale: fr })} au {format(dateFin, 'dd MMMM yyyy', { locale: fr })}
                </p>
                <p className="text-sm text-gray-600">
                  {rapport.nombre_factures} facture{rapport.nombre_factures !== 1 ? 's' : ''} analysée{rapport.nombre_factures !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Performance</h4>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    (rapport.taux_marge_moyen || 0) >= 20 ? 'bg-green-500' : 
                    (rapport.taux_marge_moyen || 0) >= 10 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-600">
                    Marge {(rapport.taux_marge_moyen || 0) >= 20 ? 'excellente' : 
                           (rapport.taux_marge_moyen || 0) >= 10 ? 'correcte' : 'faible'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GlobalMarginAnalysis;

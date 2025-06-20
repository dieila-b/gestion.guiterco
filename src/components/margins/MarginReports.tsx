
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FileText, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useArticlesWithMargins, useFacturesWithMargins, useRapportMargePeriode } from '@/hooks/useMargins';
import MarginStatsCards from './MarginStatsCards';
import ArticleMarginTable from './ArticleMarginTable';
import FactureMarginTable from './FactureMarginTable';

const MarginReports = () => {
  const [dateDebut, setDateDebut] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [dateFin, setDateFin] = useState<Date>(new Date());

  const { data: articles, isLoading: articlesLoading } = useArticlesWithMargins();
  const { data: factures, isLoading: facturesLoading } = useFacturesWithMargins();
  const { data: rapport, isLoading: rapportLoading } = useRapportMargePeriode(dateDebut, dateFin);

  return (
    <div className="space-y-6">
      {/* Header avec sélection de période */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analyse des Marges Commerciales
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Suivi détaillé des coûts, marges et bénéfices
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("justify-start text-left font-normal")}>
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
                  <Button variant="outline" className={cn("justify-start text-left font-normal")}>
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
          </div>
        </CardHeader>
      </Card>

      {/* Statistiques globales */}
      {rapport && (
        <MarginStatsCards rapport={rapport} isLoading={rapportLoading} />
      )}

      {/* Tableaux détaillés */}
      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="articles">Marges par Article</TabsTrigger>
          <TabsTrigger value="factures">Marges par Facture</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Analyse des Marges par Article
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Détail des coûts et marges pour chaque article du catalogue
              </p>
            </CardHeader>
            <CardContent>
              <ArticleMarginTable articles={articles || []} isLoading={articlesLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factures" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Analyse des Marges par Facture
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Bénéfices et taux de marge pour chaque facture de vente
              </p>
            </CardHeader>
            <CardContent>
              <FactureMarginTable factures={factures || []} isLoading={facturesLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarginReports;

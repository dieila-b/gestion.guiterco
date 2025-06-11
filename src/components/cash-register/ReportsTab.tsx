
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileText, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DailyReport from './reports/DailyReport';
import DateRangeReports from './reports/DateRangeReports';
import ClientsReports from './reports/ClientsReports';
import UnpaidInvoicesReports from './reports/UnpaidInvoicesReports';

const ReportsTab: React.FC = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Rapport quotidien
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">Résumé des transactions d'aujourd'hui</p>
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Rapport mensuel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">Résumé du mois en cours</p>
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Rapport annuel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">Synthèse de l'année en cours</p>
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rapports financiers avancés</CardTitle>
          <CardDescription>Générez des rapports détaillés selon vos critères</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily-report" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="daily-report">Rapport Quotidien</TabsTrigger>
              <TabsTrigger value="date-range">Date à Date</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="unpaid">Factures Impayées</TabsTrigger>
            </TabsList>

            <TabsContent value="daily-report" className="mt-6">
              <DailyReport />
            </TabsContent>

            <TabsContent value="date-range" className="mt-6">
              <DateRangeReports />
            </TabsContent>

            <TabsContent value="clients" className="mt-6">
              <ClientsReports />
            </TabsContent>

            <TabsContent value="unpaid" className="mt-6">
              <UnpaidInvoicesReports />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsTab;

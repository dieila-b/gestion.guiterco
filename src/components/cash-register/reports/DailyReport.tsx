
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon, Download, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useDailySalesReport } from '@/hooks/useDailySalesReport';
import { Badge } from '@/components/ui/badge';

const DailyReport: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { data: salesData, isLoading, error } = useDailySalesReport(selectedDate);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const getEtatBadge = (etat: string) => {
    switch (etat) {
      case 'payé':
        return <Badge className="bg-green-100 text-green-800">Payé</Badge>;
      case 'partiel':
        return <Badge className="bg-orange-100 text-orange-800">Partiel</Badge>;
      case 'impayé':
        return <Badge className="bg-red-100 text-red-800">Impayé</Badge>;
      default:
        return <Badge variant="secondary">{etat}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Chargement du rapport...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Erreur lors du chargement du rapport</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sélecteur de date */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Sélectionnez une date</CardTitle>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                locale={fr}
              />
            </PopoverContent>
          </Popover>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">Rapport pour le</p>
            <p className="font-medium">{format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}</p>
          </div>

          <Button variant="outline" className="w-full mt-4">
            <Download className="mr-2 h-4 w-4" />
            Exporter PDF
          </Button>
        </CardContent>
      </Card>

      {/* Contenu principal */}
      <div className="lg:col-span-3 space-y-6">
        {/* Totaux */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total des ventes</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(salesData?.totalVentes || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Montant encaissé</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(salesData?.montantEncaisse || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Reste à payer</p>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(salesData?.resteAPayer || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ventes par produit */}
        <Card>
          <CardHeader>
            <CardTitle>Ventes par produit</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead className="text-right">Quantité vendue</TableHead>
                  <TableHead className="text-right">Montant des ventes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesData?.ventesParProduit?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.produit}</TableCell>
                    <TableCell className="text-right">{item.quantiteVendue}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.montantVentes)}</TableCell>
                  </TableRow>
                ))}
                {(!salesData?.ventesParProduit || salesData.ventesParProduit.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Aucune vente de produit pour cette date
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Ventes par client */}
        <Card>
          <CardHeader>
            <CardTitle>Ventes par client</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Montant total</TableHead>
                  <TableHead className="text-right">Montant payé</TableHead>
                  <TableHead className="text-right">Reste à payer</TableHead>
                  <TableHead className="text-center">État</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesData?.ventesParClient?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.client}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.montantTotal)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.montantPaye)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.resteAPayer)}</TableCell>
                    <TableCell className="text-center">{getEtatBadge(item.etat)}</TableCell>
                  </TableRow>
                ))}
                {(!salesData?.ventesParClient || salesData.ventesParClient.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Aucune vente client pour cette date
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DailyReport;

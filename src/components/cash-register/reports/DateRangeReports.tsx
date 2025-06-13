import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileText, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useFacturesVente } from '@/hooks/useSales';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currency';

const DateRangeReports: React.FC = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [showResults, setShowResults] = useState(false);

  const { data: factures } = useFacturesVente();

  const filteredFactures = factures?.filter(facture => {
    if (!startDate || !endDate) return false;
    const factureDate = new Date(facture.date_facture);
    return factureDate >= startDate && factureDate <= endDate;
  }) || [];

  const totalCA = filteredFactures.reduce((sum, f) => sum + f.montant_ttc, 0);
  const totalTVA = filteredFactures.reduce((sum, f) => sum + f.tva, 0);
  const totalHT = filteredFactures.reduce((sum, f) => sum + f.montant_ht, 0);

  const handleGenerateReport = () => {
    setShowResults(true);
  };

  const handleExportPDF = () => {
    // Logique d'export PDF
    console.log('Export PDF pour la période:', startDate, 'à', endDate);
  };

  const handleExportExcel = () => {
    // Logique d'export Excel
    console.log('Export Excel pour la période:', startDate, 'à', endDate);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date de début</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd/MM/yyyy", { locale: fr }) : "Sélectionner une date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                locale={fr}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Date de fin</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "dd/MM/yyyy", { locale: fr }) : "Sélectionner une date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                locale={fr}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleGenerateReport} disabled={!startDate || !endDate}>
          <Filter className="mr-2 h-4 w-4" />
          Générer le rapport
        </Button>
        {showResults && (
          <>
            <Button variant="outline" onClick={handleExportPDF}>
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </>
        )}
      </div>

      {showResults && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Chiffre d'affaires HT</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(totalHT)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">TVA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(totalTVA)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total TTC</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(totalCA)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Détail des factures ({filteredFactures.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Montant HT</TableHead>
                    <TableHead>TVA</TableHead>
                    <TableHead>Montant TTC</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFactures.map((facture) => (
                    <TableRow key={facture.id}>
                      <TableCell className="font-medium">{facture.numero_facture}</TableCell>
                      <TableCell>{format(new Date(facture.date_facture), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                      <TableCell>
                        {facture.client ? facture.client.nom : 'Client non spécifié'}
                      </TableCell>
                      <TableCell>{formatCurrency(facture.montant_ht)}</TableCell>
                      <TableCell>{formatCurrency(facture.tva)}</TableCell>
                      <TableCell>{formatCurrency(facture.montant_ttc)}</TableCell>
                      <TableCell>
                        <Badge variant={facture.statut_paiement === 'payee' ? 'outline' : 'secondary'}>
                          {facture.statut_paiement}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DateRangeReports;

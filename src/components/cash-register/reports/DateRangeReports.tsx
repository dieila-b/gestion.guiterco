
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
import { useFacturesVenteQuery } from '@/hooks/useSales';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/currency';

const DateRangeReports: React.FC = () => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [showResults, setShowResults] = useState(false);

  const { data: factures } = useFacturesVenteQuery();

  // Filtrage des factures par dates sélectionnées
  const filteredFactures = factures?.filter(facture => {
    if (!startDate || !endDate) return false;
    const dateFacture = new Date(facture.date_facture);
    // On considère toute la journée pour endDate
    dateFacture.setHours(0,0,0,0);
    const endDay = new Date(endDate);
    endDay.setHours(23,59,59,999);
    return dateFacture >= startDate && dateFacture <= endDay;
  }) || [];

  // Calcul des totaux
  const totalVentes = filteredFactures.reduce((sum, f) => sum + (f.montant_ttc || 0), 0);
  const montantEncaisse = filteredFactures.reduce((sum, f) => {
    // Somme tous les versements liés à la facture
    return sum + ((f.versements ?? []).reduce((sv, v) => sv + (v.montant || 0), 0));
  }, 0);
  const resteAPayer = totalVentes - montantEncaisse;

  // Ventes par produit
  const produitStats: { produit: string, quantiteVendue: number, montantVendu: number }[] = [];
  const produitMap = new Map<string, { produit: string, quantiteVendue: number, montantVendu: number }>();
  filteredFactures.forEach(facture => {
    facture.lignes_facture?.forEach(ligne => {
      const nomProduit = ligne.article?.nom || "Produit inconnu";
      if (!produitMap.has(nomProduit)) {
        produitMap.set(nomProduit, { produit: nomProduit, quantiteVendue: 0, montantVendu: 0 });
      }
      const stats = produitMap.get(nomProduit)!;
      stats.quantiteVendue += ligne.quantite;
      stats.montantVendu += ligne.montant_ligne;
    });
  });
  produitMap.forEach(stat => {
    produitStats.push(stat);
  });

  // Ventes par client
  const clientStats: { client: string, montantTotal: number, montantPaye: number, resteAPayer: number }[] = [];
  const clientMap = new Map<string, { client: string, montantTotal: number, montantPaye: number, resteAPayer: number }>();
  filteredFactures.forEach(facture => {
    const clientNom = facture.client?.nom || "Client inconnu";
    if (!clientMap.has(clientNom)) {
      clientMap.set(clientNom, { client: clientNom, montantTotal: 0, montantPaye: 0, resteAPayer: 0 });
    }
    const stat = clientMap.get(clientNom)!;
    stat.montantTotal += facture.montant_ttc;
    const montantVerse = (facture.versements ?? []).reduce((s, v) => s + (v.montant || 0), 0);
    stat.montantPaye += montantVerse;
    // Reste à payer sera calculé juste après
  });
  clientMap.forEach(stat => {
    stat.resteAPayer = stat.montantTotal - stat.montantPaye;
    clientStats.push(stat);
  });

  const handleGenerateReport = () => setShowResults(true);
  const handleExportPDF = () => { /* TODO: Export PDF fonctionnalité */ };
  const handleExportExcel = () => { /* TODO: Export Excel fonctionnalité */ };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:gap-8 gap-4">
        <div className="flex-1 space-y-2 max-w-[300px]">
          <Label>Date de début</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full text-left font-normal", !startDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd/MM/yyyy", { locale: fr }) : "Sélectionner une date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus locale={fr} />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex-1 space-y-2 max-w-[300px]">
          <Label>Date de fin</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full text-left font-normal", !endDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "dd/MM/yyyy", { locale: fr }) : "Sélectionner une date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus locale={fr} />
            </PopoverContent>
          </Popover>
        </div>
        <div className="md:mb-0 mb-2">
          <Button onClick={handleGenerateReport} disabled={!startDate || !endDate}>
            <Filter className="mr-2 h-4 w-4" /> Générer le rapport
          </Button>
        </div>
        {showResults &&
          <div className="flex items-end gap-2 ml-auto">
            <Button variant="outline" onClick={handleExportPDF}>
              <FileText className="mr-2 h-4 w-4" /> Imprimer Ventes/Client
            </Button>
            <Button variant="outline" onClick={handleExportExcel}>
              <Download className="mr-2 h-4 w-4" /> Imprimer Ventes/Produit
            </Button>
          </div>
        }
      </div>

      {showResults && (
        <div className="space-y-8 mt-2">
          <div className="flex flex-col md:flex-row gap-4">
            <Card className="flex-1 bg-zinc-900 text-white shadow-none border-0 min-w-[180px]">
              <CardContent className="flex flex-col items-start px-6 py-4">
                <div className="text-xs text-zinc-400 mb-2">Total des ventes</div>
                <div className="text-2xl font-bold">{formatCurrency(totalVentes)}</div>
              </CardContent>
            </Card>
            <Card className="flex-1 bg-zinc-900 text-white shadow-none border-0 min-w-[180px]">
              <CardContent className="flex flex-col items-start px-6 py-4">
                <div className="text-xs text-zinc-400 mb-2">Montant encaissé</div>
                <div className="text-2xl font-bold text-green-500">{formatCurrency(montantEncaisse)}</div>
              </CardContent>
            </Card>
            <Card className="flex-1 bg-zinc-900 text-white shadow-none border-0 min-w-[180px]">
              <CardContent className="flex flex-col items-start px-6 py-4">
                <div className="text-xs text-zinc-400 mb-2">Reste à payer</div>
                <div className="text-2xl font-bold text-orange-400">{formatCurrency(resteAPayer)}</div>
              </CardContent>
            </Card>
          </div>

          <div>
            <div className="font-semibold text-lg mb-2">Ventes par produit</div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Quantité vendue</TableHead>
                    <TableHead>Montant vendu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produitStats.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-zinc-400">Aucune vente sur cette période</TableCell>
                    </TableRow>
                  ) : (
                    produitStats.map((prod) => (
                      <TableRow key={prod.produit}>
                        <TableCell>{prod.produit}</TableCell>
                        <TableCell>{prod.quantiteVendue}</TableCell>
                        <TableCell>{formatCurrency(prod.montantVendu)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <div className="font-semibold text-lg mb-2">Ventes par client</div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Montant total</TableHead>
                    <TableHead>Montant payé</TableHead>
                    <TableHead>Reste à payer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientStats.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-zinc-400">Aucune vente sur cette période</TableCell>
                    </TableRow>
                  ) : (
                    clientStats.map((client) => (
                      <TableRow key={client.client}>
                        <TableCell>{client.client}</TableCell>
                        <TableCell>{formatCurrency(client.montantTotal)}</TableCell>
                        <TableCell className="text-green-500">{formatCurrency(client.montantPaye)}</TableCell>
                        <TableCell className="text-orange-400">{formatCurrency(client.resteAPayer)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeReports;

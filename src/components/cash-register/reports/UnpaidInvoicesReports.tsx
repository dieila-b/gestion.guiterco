
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Filter, AlertTriangle } from 'lucide-react';
import { useFacturesVenteQuery } from '@/hooks/useSales';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';

const UnpaidInvoicesReports: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [showResults, setShowResults] = useState(false);

  const { data: factures } = useFacturesVenteQuery();

  const unpaidFactures = factures?.filter(facture => 
    facture.statut_paiement !== 'payee'
  ) || [];

  const filteredFactures = unpaidFactures.filter(facture => {
    if (filterType === 'all') return true;
    if (filterType === 'overdue') {
      return facture.date_echeance && new Date(facture.date_echeance) < new Date();
    }
    if (filterType === 'partial') {
      return facture.statut_paiement === 'partiellement_payee';
    }
    if (filterType === 'pending') {
      return facture.statut_paiement === 'en_attente';
    }
    return true;
  });

  const totalUnpaid = filteredFactures.reduce((sum, f) => sum + f.montant_ttc, 0);
  const overdueFactures = filteredFactures.filter(f => 
    f.date_echeance && new Date(f.date_echeance) < new Date()
  );
  const totalOverdue = overdueFactures.reduce((sum, f) => sum + f.montant_ttc, 0);

  const getRetardDays = (dateEcheance: string | null | undefined) => {
    if (!dateEcheance) return 0;
    const today = new Date();
    const echeance = new Date(dateEcheance);
    return Math.max(0, differenceInDays(today, echeance));
  };

  const getRetardBadge = (retardDays: number) => {
    if (retardDays === 0) return null;
    if (retardDays <= 7) return <Badge variant="secondary">Retard {retardDays}j</Badge>;
    if (retardDays <= 30) return <Badge variant="destructive">Retard {retardDays}j</Badge>;
    return <Badge variant="destructive">Retard {retardDays}j ⚠️</Badge>;
  };

  const handleGenerateReport = () => {
    setShowResults(true);
  };

  const handleExportPDF = () => {
    console.log('Export PDF factures impayées');
  };

  const handleExportExcel = () => {
    console.log('Export Excel factures impayées');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Filtrer par statut</Label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un filtre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les impayées</SelectItem>
              <SelectItem value="overdue">En retard uniquement</SelectItem>
              <SelectItem value="partial">Partiellement payées</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleGenerateReport}>
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
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />
                  Total impayé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalUnpaid)}</p>
                <p className="text-sm text-muted-foreground">{filteredFactures.length} factures</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                  En retard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOverdue)}</p>
                <p className="text-sm text-muted-foreground">{overdueFactures.length} factures</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Taux de recouvrement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {factures && factures.length > 0 ? (((factures.length - unpaidFactures.length) / factures.length * 100).toFixed(1)) : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Factures payées</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Détail des factures impayées ({filteredFactures.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date facture</TableHead>
                    <TableHead>Échéance</TableHead>
                    <TableHead>Montant TTC</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Retard</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFactures.map((facture) => {
                    const retardDays = getRetardDays(facture.date_echeance);
                    return (
                      <TableRow key={facture.id}>
                        <TableCell className="font-medium">{facture.numero_facture}</TableCell>
                        <TableCell>
                          {facture.client ? facture.client.nom : 'Client non spécifié'}
                        </TableCell>
                        <TableCell>
                          {format(new Date(facture.date_facture), 'dd/MM/yyyy', { locale: fr })}
                        </TableCell>
                        <TableCell>
                          {facture.date_echeance 
                            ? format(new Date(facture.date_echeance), 'dd/MM/yyyy', { locale: fr })
                            : 'Non définie'
                          }
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(facture.montant_ttc)}</TableCell>
                        <TableCell>
                          <Badge variant={
                            facture.statut_paiement === 'en_retard' ? 'destructive' :
                            facture.statut_paiement === 'partiellement_payee' ? 'secondary' : 'default'
                          }>
                            {facture.statut_paiement}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getRetardBadge(retardDays)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UnpaidInvoicesReports;


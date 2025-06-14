
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash, Printer, Ticket } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';
import type { FactureVente } from '@/types/sales';

interface FacturesVenteTableProps {
  factures: FactureVente[];
  isLoading: boolean;
}

const FacturesVenteTable = ({ factures, isLoading }: FacturesVenteTableProps) => {
  const getStatusBadgeColor = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'payee': return 'bg-green-100 text-green-800 border-green-300';
      case 'partiellement_payee': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'en_retard': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'payee': return 'Payée';
      case 'partiellement_payee': return 'Partielle';
      case 'en_retard': return 'En retard';
      default: return statut;
    }
  };

  const calculatePaidAmount = (facture: FactureVente) => {
    return facture.statut_paiement === 'payee' ? facture.montant_ttc : 0;
  };

  const calculateRemainingAmount = (facture: FactureVente) => {
    const paid = calculatePaidAmount(facture);
    return facture.montant_ttc - paid;
  };

  const handleEdit = (facture: FactureVente) => {
    console.log('Modifier facture:', facture.id);
    // TODO: Implémenter la modification
  };

  const handleDelete = (facture: FactureVente) => {
    console.log('Supprimer facture:', facture.id);
    // TODO: Implémenter la suppression
  };

  const handlePrint = (facture: FactureVente) => {
    console.log('Imprimer facture:', facture.id);
    // TODO: Implémenter l'impression
  };

  const handleTicket = (facture: FactureVente) => {
    console.log('Ticket facture:', facture.id);
    // TODO: Implémenter le ticket
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          Chargement des factures...
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold text-left">N° Facture</TableHead>
            <TableHead className="font-semibold text-left">Date</TableHead>
            <TableHead className="font-semibold text-left">Client</TableHead>
            <TableHead className="font-semibold text-center">Articles</TableHead>
            <TableHead className="font-semibold text-right">Total</TableHead>
            <TableHead className="font-semibold text-right">Payé</TableHead>
            <TableHead className="font-semibold text-right">Restant</TableHead>
            <TableHead className="font-semibold text-center">Paiement</TableHead>
            <TableHead className="font-semibold text-center">Livraison</TableHead>
            <TableHead className="font-semibold text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {factures && factures.length > 0 ? (
            factures.map((facture) => (
              <TableRow key={facture.id} className="hover:bg-muted/30">
                <TableCell className="font-medium text-blue-600">
                  {facture.numero_facture}
                </TableCell>
                <TableCell>
                  {format(new Date(facture.date_facture), 'dd/MM/yyyy', { locale: fr })}
                </TableCell>
                <TableCell className="font-medium">
                  {facture.client ? facture.client.nom : 'Client non spécifié'}
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-medium">0</span>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(facture.montant_ttc)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(calculatePaidAmount(facture))}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(calculateRemainingAmount(facture))}
                </TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant="outline" 
                    className={`${getStatusBadgeColor(facture.statut_paiement)} font-medium`}
                  >
                    {getStatusLabel(facture.statut_paiement)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                    Livrée
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(facture)}
                      className="h-8 w-8 p-0 hover:bg-orange-100"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4 text-orange-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(facture)}
                      className="h-8 w-8 p-0 hover:bg-red-100"
                      title="Supprimer"
                    >
                      <Trash className="h-4 w-4 text-red-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePrint(facture)}
                      className="h-8 w-8 p-0 hover:bg-blue-100"
                      title="Imprimer"
                    >
                      <Printer className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTicket(facture)}
                      className="h-8 w-8 p-0 hover:bg-green-100"
                      title="Ticket"
                    >
                      <Ticket className="h-4 w-4 text-green-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8">
                <div className="text-muted-foreground">
                  Aucune facture de vente trouvée
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default FacturesVenteTable;


import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';

interface FacturesImpayeesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FacturesImpayeesModal: React.FC<FacturesImpayeesModalProps> = ({ isOpen, onClose }) => {
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: facturesImpayees, isLoading } = useQuery({
    queryKey: ['factures-impayees-jour', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('factures_vente')
        .select(`
          id,
          numero_facture,
          date_facture,
          montant_ttc,
          statut_paiement,
          client:client_id(nom, prenom),
          versements:versements_clients(montant)
        `)
        .gte('date_facture', `${today} 00:00:00`)
        .lte('date_facture', `${today} 23:59:59`)
        .neq('statut_paiement', 'payee')
        .order('date_facture', { ascending: false });

      if (error) throw error;

      return (data || []).map(facture => {
        const montantPaye = facture.versements?.reduce((sum, v) => sum + (v.montant || 0), 0) || 0;
        const montantRestant = facture.montant_ttc - montantPaye;
        
        return {
          ...facture,
          montantPaye,
          montantRestant
        };
      });
    },
    enabled: isOpen
  });

  const totalImpaye = facturesImpayees?.reduce((sum, facture) => sum + facture.montantRestant, 0) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Factures impayées du jour - {format(new Date(), 'dd/MM/yyyy')}</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 p-4 bg-red-50 rounded-lg">
          <p className="text-lg font-semibold text-red-800">
            Total impayé : {formatCurrency(totalImpaye)}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <p>Chargement des factures impayées...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Facture</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Heure</TableHead>
                <TableHead className="text-right">Montant Total</TableHead>
                <TableHead className="text-right">Montant Payé</TableHead>
                <TableHead className="text-right">Reste à Payer</TableHead>
                <TableHead className="text-center">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facturesImpayees?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Aucune facture impayée aujourd'hui
                  </TableCell>
                </TableRow>
              ) : (
                facturesImpayees?.map((facture) => (
                  <TableRow key={facture.id}>
                    <TableCell className="font-medium">{facture.numero_facture}</TableCell>
                    <TableCell>
                      {facture.client ? `${facture.client.prenom} ${facture.client.nom}` : 'Client anonyme'}
                    </TableCell>
                    <TableCell>{format(new Date(facture.date_facture), 'HH:mm')}</TableCell>
                    <TableCell className="text-right">{formatCurrency(facture.montant_ttc)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(facture.montantPaye)}</TableCell>
                    <TableCell className="text-right font-bold text-red-600">
                      {formatCurrency(facture.montantRestant)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-red-100 text-red-800">
                        {facture.statut_paiement === 'partiellement_payee' ? 'Partiel' : 'Impayé'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FacturesImpayeesModal;

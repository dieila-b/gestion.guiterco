
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';

interface VentesDuJourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VentesDuJourModal: React.FC<VentesDuJourModalProps> = ({ isOpen, onClose }) => {
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: ventesJour, isLoading } = useQuery({
    queryKey: ['ventes-jour', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('factures_vente')
        .select(`
          id,
          numero_facture,
          date_facture,
          montant_ttc,
          statut_paiement,
          client:client_id(nom, prenom)
        `)
        .gte('date_facture', `${today} 00:00:00`)
        .lte('date_facture', `${today} 23:59:59`)
        .order('date_facture', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: isOpen
  });

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'paye':
        return <Badge className="bg-green-100 text-green-800">Payé</Badge>;
      case 'partiel':
        return <Badge className="bg-orange-100 text-orange-800">Partiel</Badge>;
      case 'impaye':
        return <Badge className="bg-red-100 text-red-800">Impayé</Badge>;
      default:
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ventes du jour - {format(new Date(), 'dd/MM/yyyy')}</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <p>Chargement des ventes...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Facture</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Heure</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="text-center">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ventesJour?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Aucune vente aujourd'hui
                  </TableCell>
                </TableRow>
              ) : (
                ventesJour?.map((vente) => (
                  <TableRow key={vente.id}>
                    <TableCell className="font-medium">{vente.numero_facture}</TableCell>
                    <TableCell>
                      {vente.client ? `${vente.client.prenom} ${vente.client.nom}` : 'Client anonyme'}
                    </TableCell>
                    <TableCell>{format(new Date(vente.date_facture), 'HH:mm')}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(vente.montant_ttc)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatutBadge(vente.statut_paiement)}
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

export default VentesDuJourModal;


import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';

interface MargeDuJourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MargeDuJourModal: React.FC<MargeDuJourModalProps> = ({ isOpen, onClose }) => {
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: margesJour, isLoading } = useQuery({
    queryKey: ['marges-jour', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lignes_facture_vente')
        .select(`
          quantite,
          prix_unitaire_brut,
          article:article_id(
            nom,
            prix_achat,
            prix_unitaire
          ),
          facture:facture_vente_id(
            numero_facture,
            date_facture,
            statut_paiement
          )
        `)
        .eq('facture.statut_paiement', 'payee');

      if (error) throw error;

      // Filtrer par date du jour
      const filteredData = (data || []).filter(ligne => {
        if (!ligne.facture?.date_facture) return false;
        const factureDate = format(new Date(ligne.facture.date_facture), 'yyyy-MM-dd');
        return factureDate === today;
      });

      return filteredData.map(ligne => {
        const prixAchat = ligne.article?.prix_achat || ligne.article?.prix_unitaire || 0;
        const prixVente = ligne.prix_unitaire_brut;
        const quantite = ligne.quantite;
        const margeUnitaire = prixVente - prixAchat;
        const margeTotal = margeUnitaire * quantite;

        return {
          ...ligne,
          prixAchat,
          prixVente,
          margeUnitaire,
          margeTotal
        };
      });
    },
    enabled: isOpen
  });

  const totalMarge = margesJour?.reduce((sum, ligne) => sum + ligne.margeTotal, 0) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Marge du jour - {format(new Date(), 'dd/MM/yyyy')}</DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 p-4 bg-green-50 rounded-lg">
          <p className="text-lg font-semibold text-green-800">
            Marge totale du jour : {formatCurrency(totalMarge)}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <p>Chargement des marges...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article</TableHead>
                <TableHead>N° Facture</TableHead>
                <TableHead className="text-right">Qté</TableHead>
                <TableHead className="text-right">Prix Achat</TableHead>
                <TableHead className="text-right">Prix Vente</TableHead>
                <TableHead className="text-right">Marge Unit.</TableHead>
                <TableHead className="text-right">Marge Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {margesJour?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Aucune marge calculable aujourd'hui
                  </TableCell>
                </TableRow>
              ) : (
                margesJour?.map((ligne, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{ligne.article?.nom}</TableCell>
                    <TableCell>{ligne.facture?.numero_facture}</TableCell>
                    <TableCell className="text-right">{ligne.quantite}</TableCell>
                    <TableCell className="text-right">{formatCurrency(ligne.prixAchat)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(ligne.prixVente)}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(ligne.margeUnitaire)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-700">
                      {formatCurrency(ligne.margeTotal)}
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

export default MargeDuJourModal;

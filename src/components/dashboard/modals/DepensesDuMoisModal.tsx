
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { formatCurrency } from '@/lib/currency';

interface DepensesDuMoisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DepensesDuMoisModal: React.FC<DepensesDuMoisModalProps> = ({ isOpen, onClose }) => {
  const now = new Date();
  const debutMois = format(startOfMonth(now), 'yyyy-MM-dd');
  const finMois = format(endOfMonth(now), 'yyyy-MM-dd');

  const { data: depensesMois, isLoading } = useQuery({
    queryKey: ['depenses-mois', debutMois, finMois],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sorties_financieres')
        .select(`
          id,
          description,
          montant,
          date_sortie,
          categorie:categories_depenses(nom, couleur)
        `)
        .gte('date_sortie', `${debutMois} 00:00:00`)
        .lte('date_sortie', `${finMois} 23:59:59`)
        .order('date_sortie', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: isOpen
  });

  const totalDepenses = depensesMois?.reduce((sum, depense) => sum + depense.montant, 0) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Dépenses du mois - {format(now, 'MMMM yyyy')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 p-4 bg-red-50 rounded-lg">
          <p className="text-lg font-semibold text-red-800">
            Total des dépenses du mois : {formatCurrency(totalDepenses)}
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <p>Chargement des dépenses...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-right">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {depensesMois?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Aucune dépense ce mois-ci
                  </TableCell>
                </TableRow>
              ) : (
                depensesMois?.map((depense) => (
                  <TableRow key={depense.id}>
                    <TableCell>{format(new Date(depense.date_sortie), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell className="font-medium">{depense.description}</TableCell>
                    <TableCell>
                      <span 
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ 
                          backgroundColor: depense.categorie?.couleur + '20',
                          color: depense.categorie?.couleur 
                        }}
                      >
                        {depense.categorie?.nom || 'Non catégorisé'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold text-red-600">
                      {formatCurrency(depense.montant)}
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

export default DepensesDuMoisModal;

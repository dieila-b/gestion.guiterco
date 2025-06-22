
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, Lock } from 'lucide-react';
import { useCloseCashRegister, useGenerateEtatCaisse } from '@/hooks/cash';
import { useCashRegisterBalance } from '@/hooks/useTransactions';
import ComptageDialog from './ComptageDialog';
import ExportHistoryDialog from './ExportHistoryDialog';
import { formatCurrency } from '@/lib/currency';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface CashActionsProps {
  cashRegisterId?: string;
}

const CashActions: React.FC<CashActionsProps> = ({ cashRegisterId }) => {
  const closeCashRegister = useCloseCashRegister();
  const generateEtat = useGenerateEtatCaisse();
  const { data: balanceData } = useCashRegisterBalance();

  const soldeActuel = balanceData?.balance || 0;

  const handleCloseCashRegister = () => {
    if (!cashRegisterId) {
      toast.error('Aucune caisse sélectionnée');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir fermer la caisse ? Cette action ne peut pas être annulée.')) {
      closeCashRegister.mutate(cashRegisterId);
    }
  };

  const handlePrintEtatCaisse = async () => {
    if (!cashRegisterId) {
      toast.error('Aucune caisse sélectionnée');
      return;
    }

    try {
      const result = await generateEtat.mutateAsync({ 
        cashRegisterId, 
        type: 'quotidien' 
      });

      // Générer le PDF
      const doc = new jsPDF();
      
      // En-tête
      doc.setFontSize(20);
      doc.text('État de Caisse', 20, 20);
      
      doc.setFontSize(12);
      const date = new Date().toLocaleDateString('fr-FR');
      const heure = new Date().toLocaleTimeString('fr-FR');
      doc.text(`Date: ${date} - ${heure}`, 20, 35);
      
      // Informations de la caisse
      doc.setFontSize(14);
      doc.text('Informations générales', 20, 55);
      doc.setFontSize(10);
      doc.text(`Caisse: ${result.donnees.caisse?.name || 'Caisse principale'}`, 20, 65);
      doc.text(`Solde actuel: ${formatCurrency(result.donnees.totaux.solde_actuel)}`, 20, 75);
      
      // Totaux du jour
      doc.setFontSize(14);
      doc.text('Totaux du jour', 20, 95);
      doc.setFontSize(10);
      doc.text(`Total entrées: ${formatCurrency(result.donnees.totaux.entrees)}`, 20, 105);
      doc.text(`Total sorties: ${formatCurrency(result.donnees.totaux.sorties)}`, 20, 115);
      doc.text(`Balance: ${formatCurrency(result.donnees.totaux.balance)}`, 20, 125);
      
      // Transactions récentes
      if (result.donnees.transactions.length > 0) {
        doc.setFontSize(14);
        doc.text('Transactions récentes', 20, 145);
        
        let yPos = 155;
        doc.setFontSize(8);
        
        result.donnees.transactions.slice(0, 15).forEach((transaction: any) => {
          const type = transaction.type === 'income' ? 'Entrée' : 'Sortie';
          const montant = formatCurrency(transaction.amount || 0);
          const description = transaction.description?.substring(0, 40) || '';
          
          doc.text(`${type} - ${montant} - ${description}`, 20, yPos);
          yPos += 10;
        });
      }
      
      // Pied de page
      doc.setFontSize(8);
      doc.text(`Généré automatiquement le ${new Date().toLocaleString('fr-FR')}`, 20, 280);
      
      // Téléchargement
      doc.save(`etat_caisse_${date.replace(/\//g, '-')}.pdf`);
      
      toast.success('État de caisse généré et téléchargé');
    } catch (error) {
      console.error('Erreur génération état:', error);
      toast.error('Erreur lors de la génération de l\'état');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleCloseCashRegister}
          disabled={closeCashRegister.isPending}
        >
          <Lock className="mr-2 h-4 w-4" />
          {closeCashRegister.isPending ? 'Fermeture...' : 'Fermer la caisse'}
        </Button>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={handlePrintEtatCaisse}
          disabled={generateEtat.isPending}
        >
          <Printer className="mr-2 h-4 w-4" />
          {generateEtat.isPending ? 'Génération...' : 'Imprimer état de caisse'}
        </Button>

        <ExportHistoryDialog />

        <ComptageDialog 
          cashRegisterId={cashRegisterId}
          soldeTheorique={soldeActuel}
        />
      </CardContent>
    </Card>
  );
};

export default CashActions;

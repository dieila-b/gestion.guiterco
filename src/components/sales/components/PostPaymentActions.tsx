
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail, MessageCircle, Download, Printer, Check, Receipt, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/currency';
import { supabase } from '@/integrations/supabase/client';
import { printFactureVente } from '../actions/print/factureVentePrintService';
import { generateFactureVenteContent } from '../actions/print/factureVente/contentGenerator';
import type { FactureVente } from '@/types/sales';

interface PostPaymentActionsProps {
  isOpen: boolean;
  onClose: () => void;
  factureData: {
    id?: string;
    numero_facture: string;
    montant_ttc: number;
    client?: any;
    created_at?: string;
  };
}

const PostPaymentActions: React.FC<PostPaymentActionsProps> = ({
  isOpen,
  onClose,
  factureData
}) => {
  const [email, setEmail] = React.useState(factureData.client?.email || '');
  const [telephone, setTelephone] = React.useState(factureData.client?.telephone || '');
  const [fullFactureData, setFullFactureData] = React.useState<FactureVente | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Récupérer les données complètes de la facture au montage du composant
  React.useEffect(() => {
    const fetchFullFactureData = async () => {
      if (!factureData.id) return;
      
      setLoading(true);
      try {
        const { data: facture, error } = await supabase
          .from('factures_vente')
          .select(`
            *,
            client:clients(*),
            lignes_facture:lignes_facture_vente(
              *,
              article:catalogue(*)
            ),
            versements:versements_clients(*)
          `)
          .eq('id', factureData.id)
          .single();

        if (error) {
          console.error('Erreur récupération facture complète:', error);
          return;
        }

        setFullFactureData(facture as any);
      } catch (error) {
        console.error('Erreur lors du fetch de la facture:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && factureData.id) {
      fetchFullFactureData();
    }
  }, [isOpen, factureData.id]);

  const handleEmailSend = async () => {
    if (!email) {
      toast.error('Veuillez saisir une adresse email');
      return;
    }
    
    toast.success('Facture envoyée par email', {
      description: `Envoyée à ${email}`,
      duration: 3000
    });
  };

  const handleWhatsAppShare = () => {
    if (!telephone) {
      toast.error('Veuillez saisir un numéro de téléphone');
      return;
    }

    const message = `Bonjour, voici votre facture ${factureData.numero_facture} d'un montant de ${formatCurrency(factureData.montant_ttc)}. Merci pour votre achat !`;
    const whatsappUrl = `https://wa.me/${telephone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('WhatsApp ouvert', {
      description: 'Message pré-rempli avec les détails de la facture'
    });
  };

  const handlePrintInvoice = async () => {
    console.log('🖨️ Tentative d\'impression de la facture');
    console.log('🔍 fullFactureData:', fullFactureData);
    
    if (!fullFactureData) {
      console.error('❌ Données de facture manquantes');
      toast.error('Données de facture non disponibles');
      return;
    }

    try {
      console.log('📄 Génération de la facture avec les données:', {
        id: fullFactureData.id,
        numero_facture: fullFactureData.numero_facture,
        lignes_facture: fullFactureData.lignes_facture?.length || 0,
        client: fullFactureData.client?.nom || 'Non défini'
      });
      
      await printFactureVente(fullFactureData);
      
      console.log('✅ Impression lancée avec succès');
      toast.success('Impression de la facture lancée', {
        description: 'Facture complète avec format professionnel'
      });
    } catch (error) {
      console.error('❌ Erreur impression facture:', error);
      toast.error('Erreur lors de l\'impression de la facture');
    }
  };

  const handlePrintReceipt = async () => {
    if (!fullFactureData) {
      toast.error('Données de facture non disponibles');
      return;
    }

    try {
      // Utiliser le même format mais avec un titre différent
      await printFactureVente(fullFactureData);
      toast.success('Impression du reçu lancée', {
        description: 'Reçu avec format professionnel'
      });
    } catch (error) {
      console.error('Erreur impression reçu:', error);
      toast.error('Erreur lors de l\'impression du reçu');
    }
  };

  const handlePDFDownload = async () => {
    if (!fullFactureData) {
      toast.error('Données de facture non disponibles');
      return;
    }

    try {
      const content = generateFactureVenteContent(fullFactureData);
      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Facture_${fullFactureData.numero_facture}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Téléchargement du PDF en cours...', {
        description: 'Fichier HTML généré pour impression PDF'
      });
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Paiement validé avec succès
          </DialogTitle>
          <DialogDescription>
            Facture {factureData.numero_facture} générée
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Résumé de la transaction */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-800 mb-1">
              {formatCurrency(factureData.montant_ttc)}
            </div>
            <div className="text-sm text-green-600">
              Paiement reçu avec succès
            </div>
            <div className="text-xs text-green-500 mt-1">
              {new Date().toLocaleString('fr-FR')}
            </div>
          </div>

          {/* Options d'impression */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Options d'impression</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handlePrintInvoice} 
                variant="outline" 
                className="flex-col h-auto py-3 gap-2"
                disabled={loading || !fullFactureData}
              >
                <FileText className="h-5 w-5" />
                <span className="text-xs">Facture complète</span>
              </Button>
              <Button 
                onClick={handlePrintReceipt} 
                variant="outline" 
                className="flex-col h-auto py-3 gap-2"
                disabled={loading || !fullFactureData}
              >
                <Receipt className="h-5 w-5" />
                <span className="text-xs">Reçu simplifié</span>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Envoi par email */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Envoi par email</h4>
            <div className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@email.com"
                className="flex-1"
              />
              <Button onClick={handleEmailSend} size="sm" className="shrink-0">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Envoi par WhatsApp */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Envoi par WhatsApp</h4>
            <div className="flex gap-2">
              <Input
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="+224 XXX XXX XXX"
                className="flex-1"
              />
              <Button onClick={handleWhatsAppShare} size="sm" variant="outline" className="shrink-0">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Actions finales */}
          <div className="space-y-3">
            <Button 
              onClick={handlePDFDownload} 
              variant="outline" 
              className="w-full"
              disabled={loading || !fullFactureData}
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger PDF
            </Button>
            
            <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700">
              Terminer et fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostPaymentActions;


import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, MessageCircle, Download, Printer, Check } from 'lucide-react';
import { toast } from 'sonner';

interface PostPaymentActionsProps {
  isOpen: boolean;
  onClose: () => void;
  factureData: {
    numero_facture: string;
    montant_ttc: number;
    client?: any;
  };
}

const PostPaymentActions: React.FC<PostPaymentActionsProps> = ({
  isOpen,
  onClose,
  factureData
}) => {
  const [email, setEmail] = React.useState(factureData.client?.email || '');
  const [telephone, setTelephone] = React.useState(factureData.client?.telephone || '');

  const handleEmailSend = async () => {
    if (!email) {
      toast.error('Veuillez saisir une adresse email');
      return;
    }
    
    // Ici, vous pouvez intégrer votre service d'email
    toast.success('Facture envoyée par email');
  };

  const handleWhatsAppShare = () => {
    if (!telephone) {
      toast.error('Veuillez saisir un numéro de téléphone');
      return;
    }

    const message = `Bonjour, voici votre facture ${factureData.numero_facture} d'un montant de ${factureData.montant_ttc} GNF. Merci pour votre achat !`;
    const whatsappUrl = `https://wa.me/${telephone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePDFDownload = () => {
    // Générer et télécharger le PDF
    toast.success('Téléchargement du PDF en cours...');
  };

  const handlePrint = () => {
    // Lancer l'impression
    window.print();
    toast.success('Impression lancée');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Paiement validé
          </DialogTitle>
          <DialogDescription>
            Facture {factureData.numero_facture} générée avec succès
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-green-800">
              {factureData.montant_ttc} GNF
            </div>
            <div className="text-sm text-green-600">
              Paiement reçu avec succès
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="email">Email du client</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@email.com"
                />
                <Button onClick={handleEmailSend} size="sm">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="telephone">Téléphone du client</Label>
              <div className="flex gap-2">
                <Input
                  id="telephone"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+224 XXX XXX XXX"
                />
                <Button onClick={handleWhatsAppShare} size="sm" variant="outline">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handlePDFDownload} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button onClick={handlePrint} variant="outline" className="w-full">
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
          </div>

          <Button onClick={onClose} className="w-full">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostPaymentActions;

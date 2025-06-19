
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useFactureAchatArticles } from '@/hooks/useFactureAchatArticles';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';

interface PrintFactureAchatDialogProps {
  facture: any;
}

const numberToWords = (num: number): string => {
  const ones = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  
  if (num === 0) return 'zéro';
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? '-' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 100)] + ' cent' + (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '');
  
  return num.toString(); // Fallback pour les nombres plus grands
};

export const PrintFactureAchatDialog = ({ facture }: PrintFactureAchatDialogProps) => {
  const [open, setOpen] = useState(false);
  const { data: articles } = useFactureAchatArticles(facture.id);

  const handlePrint = () => {
    const printContent = document.getElementById('facture-print-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Facture ${facture.numero_facture}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 0; 
                  padding: 20px; 
                  font-size: 12px;
                  color: #000;
                }
                .facture-header {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 30px;
                  align-items: flex-start;
                }
                .company-info {
                  flex: 1;
                }
                .company-logo {
                  width: 80px;
                  height: 80px;
                  margin-bottom: 10px;
                  background: #e3f2fd;
                  border-radius: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: bold;
                  color: #1976d2;
                }
                .company-name {
                  font-weight: bold;
                  font-size: 16px;
                  margin-bottom: 5px;
                }
                .company-details {
                  font-size: 11px;
                  line-height: 1.4;
                  color: #666;
                }
                .invoice-info {
                  text-align: right;
                  flex: 1;
                }
                .invoice-title {
                  font-size: 24px;
                  font-weight: bold;
                  margin-bottom: 20px;
                  text-align: center;
                  width: 100%;
                }
                .invoice-details {
                  background: #f5f5f5;
                  padding: 15px;
                  border-radius: 5px;
                  margin-bottom: 20px;
                }
                .client-info {
                  background: #f9f9f9;
                  padding: 15px;
                  border-radius: 5px;
                  margin-bottom: 20px;
                }
                .articles-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 20px;
                }
                .articles-table th {
                  background: #f0f0f0;
                  padding: 10px 8px;
                  text-align: left;
                  border: 1px solid #ddd;
                  font-weight: bold;
                  font-size: 11px;
                }
                .articles-table td {
                  padding: 8px;
                  border: 1px solid #ddd;
                  font-size: 11px;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .delivered { color: #4caf50; font-weight: bold; }
                .remaining { color: #ff9800; font-weight: bold; }
                .totals-section {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 30px;
                }
                .totals-left {
                  flex: 1;
                }
                .totals-right {
                  width: 300px;
                  border: 1px solid #ddd;
                  padding: 15px;
                }
                .total-line {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 8px;
                }
                .total-line.final {
                  font-weight: bold;
                  font-size: 14px;
                  border-top: 1px solid #333;
                  padding-top: 8px;
                  margin-top: 10px;
                }
                .status-section {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 20px;
                }
                .status-box {
                  flex: 1;
                  margin-right: 20px;
                  border: 1px solid #ddd;
                  padding: 15px;
                  border-radius: 5px;
                }
                .status-box:last-child {
                  margin-right: 0;
                }
                .status-badge {
                  display: inline-block;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 10px;
                  font-weight: bold;
                }
                .badge-partial {
                  background: #fff3cd;
                  color: #856404;
                  border: 1px solid #ffeaa7;
                }
                .badge-delivered {
                  background: #d4edda;
                  color: #155724;
                  border: 1px solid #c3e6cb;
                }
                .legal-mention {
                  font-size: 10px;
                  text-align: center;
                  margin-top: 30px;
                  font-style: italic;
                  color: #666;
                }
                .highlight-box {
                  background: #fff3cd;
                  border: 1px solid #ffeaa7;
                  padding: 10px;
                  margin: 10px 0;
                  border-radius: 4px;
                  font-size: 11px;
                }
                @media print {
                  body { margin: 0; padding: 15px; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    }
  };

  const calculateTotals = () => {
    if (!articles || articles.length === 0) {
      return {
        montantTotal: facture.montant_ttc,
        remise: 0,
        netAPayer: facture.montant_ttc
      };
    }
    
    const montantTotal = articles.reduce((sum: number, article: any) => sum + (article.montant_ligne || 0), 0);
    const remise = 0; // À calculer selon votre logique métier
    const netAPayer = montantTotal - remise;
    
    return { montantTotal, remise, netAPayer };
  };

  const getPaymentStatus = () => {
    switch (facture.statut_paiement) {
      case 'paye': return { label: 'Payé', badge: 'badge-delivered' };
      case 'partiellement_paye': return { label: 'Partiellement payé', badge: 'badge-partial' };
      case 'en_retard': return { label: 'En retard', badge: 'badge-partial' };
      default: return { label: 'En attente', badge: 'badge-partial' };
    }
  };

  const totals = calculateTotals();
  const paymentStatus = getPaymentStatus();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-3 text-xs bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
        >
          Imprimer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="no-print">
          <DialogTitle>Aperçu de la facture d'achat</DialogTitle>
        </DialogHeader>
        
        <div id="facture-print-content" className="bg-white p-6">
          {/* En-tête avec logo et informations société */}
          <div className="facture-header">
            <div className="company-info">
              <div className="company-logo">
                <img src="/lovable-uploads/932def2b-197f-4495-8a0a-09c753a4a892.png" alt="Logo" style={{width: '60px', height: '60px', objectFit: 'contain'}} />
              </div>
              <div className="company-name">U CONNEXT</div>
              <div className="company-details">
                Adresse: Madina-Gare routière Kankan C/Matam<br/>
                Téléphone: 623 26 87 81<br/>
                Email: uconnext@gmail.com
              </div>
            </div>
            
            <div className="invoice-info">
              <div className="invoice-details">
                <h3 style={{margin: '0 0 10px 0', fontSize: '14px'}}>Information de la facture</h3>
                <p><strong>Date:</strong> {format(new Date(facture.date_facture), 'dd/MM/yyyy', { locale: fr })}</p>
                <p><strong>Facture N°:</strong> {facture.numero_facture}</p>
                {facture.date_echeance && (
                  <p><strong>Échéance:</strong> {format(new Date(facture.date_echeance), 'dd/MM/yyyy', { locale: fr })}</p>
                )}
              </div>
            </div>
          </div>

          <div className="invoice-title">FACTURE</div>

          {/* Informations fournisseur */}
          <div className="client-info">
            <h3 style={{margin: '0 0 10px 0', fontSize: '14px'}}>FOURNISSEUR:</h3>
            <p><strong>Nom:</strong> {facture.fournisseur}</p>
            <p><strong>Code:</strong> {facture.fournisseur_id || 'N/A'}</p>
          </div>

          {/* Tableau des articles */}
          {articles && articles.length > 0 && (
            <table className="articles-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th className="text-right">Prix unitaire</th>
                  <th className="text-center">Remise</th>
                  <th className="text-right">Prix net</th>
                  <th className="text-center">Qté</th>
                  <th className="text-center">Livré</th>
                  <th className="text-center">Restant</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article: any) => {
                  const delivered = article.quantite || 0;
                  const remaining = 0; // À calculer selon votre logique
                  return (
                    <tr key={article.id}>
                      <td>{article.catalogue?.nom || 'Article'}</td>
                      <td className="text-right">{formatCurrency(article.prix_unitaire)}</td>
                      <td className="text-center">0</td>
                      <td className="text-right">{formatCurrency(article.prix_unitaire)}</td>
                      <td className="text-center">{article.quantite}</td>
                      <td className="text-center delivered">{delivered}</td>
                      <td className="text-center remaining">{remaining}</td>
                      <td className="text-right">{formatCurrency(article.montant_ligne)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Section totaux */}
          <div className="totals-section">
            <div className="totals-left"></div>
            <div className="totals-right">
              <div className="total-line">
                <span>Montant Total</span>
                <span>{formatCurrency(totals.montantTotal)}</span>
              </div>
              <div className="total-line">
                <span>Remise</span>
                <span>{formatCurrency(totals.remise)}</span>
              </div>
              <div className="total-line final">
                <span>Net à Payer</span>
                <span>{formatCurrency(totals.netAPayer)}</span>
              </div>
            </div>
          </div>

          {/* Section statuts */}
          <div className="status-section">
            <div className="status-box">
              <h4 style={{margin: '0 0 10px 0', fontSize: '12px'}}>Statut de paiement</h4>
              <p>
                <strong>Statut:</strong> 
                <span className={`status-badge ${paymentStatus.badge}`} style={{marginLeft: '10px'}}>
                  {paymentStatus.label}
                </span>
              </p>
              <p><strong>Montant payé:</strong> {formatCurrency(facture.montant_paye || 0)}</p>
              <p><strong>Montant restant:</strong> {formatCurrency((facture.montant_ttc || 0) - (facture.montant_paye || 0))}</p>
            </div>
            
            <div className="status-box">
              <h4 style={{margin: '0 0 10px 0', fontSize: '12px'}}>Statut de livraison</h4>
              <p>
                <strong>Statut:</strong> 
                <span className="status-badge badge-delivered" style={{marginLeft: '10px'}}>
                  Partiellement livré
                </span>
              </p>
            </div>
          </div>

          {/* Messages informatifs */}
          {facture.statut_paiement === 'partiellement_paye' && (
            <div className="highlight-box">
              Un paiement partiel a été effectué sur cette facture.
            </div>
          )}
          
          {articles && articles.length > 0 && (
            <div className="highlight-box">
              Cette commande a été partiellement livrée.
            </div>
          )}

          {/* Observations */}
          {facture.observations && (
            <div style={{marginBottom: '20px'}}>
              <h4 style={{fontSize: '12px', marginBottom: '5px'}}>Observations:</h4>
              <p style={{fontSize: '11px', color: '#666'}}>{facture.observations}</p>
            </div>
          )}

          {/* Mention légale */}
          <div className="legal-mention">
            Arrêtée la présente facture à la somme de {numberToWords(Math.floor(totals.netAPayer))} francs guinéens
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 no-print">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Fermer
          </Button>
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

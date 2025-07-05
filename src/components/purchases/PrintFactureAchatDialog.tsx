
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
  
  return num.toString();
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
                @page {
                  size: A4;
                  margin: 20mm;
                }
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 0; 
                  padding: 0; 
                  font-size: 11px;
                  line-height: 1.4;
                  color: #333;
                }
                .invoice-container {
                  max-width: 210mm;
                  margin: 0 auto;
                  background: white;
                  padding: 20px;
                }
                .header-section {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  margin-bottom: 30px;
                  border-bottom: 2px solid #e0e0e0;
                  padding-bottom: 20px;
                }
                .company-info {
                  flex: 1;
                  max-width: 50%;
                }
                .company-logo {
                  width: 80px;
                  height: 80px;
                  margin-bottom: 15px;
                  background: #f5f5f5;
                  border-radius: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border: 1px solid #ddd;
                }
                .company-logo img {
                  max-width: 70px;
                  max-height: 70px;
                  object-fit: contain;
                }
                .company-name {
                  font-size: 18px;
                  font-weight: bold;
                  color: #2c3e50;
                  margin-bottom: 8px;
                }
                .company-details {
                  font-size: 10px;
                  line-height: 1.5;
                  color: #666;
                }
                .invoice-info {
                  flex: 1;
                  max-width: 45%;
                  text-align: right;
                }
                .invoice-title {
                  font-size: 28px;
                  font-weight: bold;
                  color: #2c3e50;
                  margin-bottom: 20px;
                  text-align: center;
                  text-transform: uppercase;
                  letter-spacing: 2px;
                }
                .invoice-details {
                  background: #f8f9fa;
                  padding: 15px;
                  border-radius: 6px;
                  border: 1px solid #e9ecef;
                }
                .invoice-details h3 {
                  margin: 0 0 12px 0;
                  font-size: 12px;
                  color: #495057;
                  text-transform: uppercase;
                  font-weight: 600;
                }
                .invoice-details p {
                  margin: 6px 0;
                  font-size: 11px;
                }
                .supplier-section {
                  margin: 25px 0;
                  background: #fff8e1;
                  padding: 20px;
                  border-radius: 6px;
                  border-left: 4px solid #ffc107;
                }
                .supplier-section h3 {
                  margin: 0 0 15px 0;
                  font-size: 14px;
                  color: #e65100;
                  text-transform: uppercase;
                  font-weight: 600;
                }
                .supplier-info {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 15px;
                }
                .supplier-field {
                  display: flex;
                  align-items: center;
                }
                .supplier-field label {
                  font-weight: 600;
                  margin-right: 8px;
                  color: #6c757d;
                  min-width: 60px;
                }
                .articles-section {
                  margin: 30px 0;
                }
                .articles-table {
                  width: 100%;
                  border-collapse: collapse;
                  border: 1px solid #dee2e6;
                  margin-bottom: 20px;
                }
                .articles-table th {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 12px 8px;
                  text-align: center;
                  font-weight: 600;
                  font-size: 10px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  border: 1px solid #5a6cb8;
                }
                .articles-table td {
                  padding: 10px 8px;
                  border: 1px solid #dee2e6;
                  font-size: 10px;
                  text-align: center;
                }
                .articles-table tbody tr:nth-child(even) {
                  background-color: #f8f9fa;
                }
                .articles-table tbody tr:hover {
                  background-color: #e3f2fd;
                }
                .product-name {
                  text-align: left !important;
                  font-weight: 500;
                  color: #2c3e50;
                }
                .quantity-delivered {
                  color: #28a745;
                  font-weight: 600;
                }
                .quantity-remaining {
                  color: #dc3545;
                  font-weight: 600;
                }
                .totals-section {
                  display: flex;
                  justify-content: space-between;
                  margin: 30px 0;
                  gap: 30px;
                }
                .totals-left {
                  flex: 1;
                }
                .totals-right {
                  width: 320px;
                  background: #f8f9fa;
                  border: 2px solid #dee2e6;
                  border-radius: 8px;
                  padding: 20px;
                }
                .totals-right h4 {
                  margin: 0 0 15px 0;
                  font-size: 12px;
                  color: #495057;
                  text-transform: uppercase;
                  font-weight: 600;
                  text-align: center;
                  border-bottom: 1px solid #dee2e6;
                  padding-bottom: 8px;
                }
                .total-line {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 10px;
                  font-size: 11px;
                }
                .total-line.final {
                  font-weight: bold;
                  font-size: 14px;
                  color: #2c3e50;
                  border-top: 2px solid #495057;
                  padding-top: 12px;
                  margin-top: 15px;
                }
                .status-section {
                  display: flex;
                  gap: 20px;
                  margin: 30px 0;
                }
                .status-box {
                  flex: 1;
                  background: white;
                  border: 1px solid #dee2e6;
                  border-radius: 8px;
                  padding: 20px;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .status-box h4 {
                  margin: 0 0 15px 0;
                  font-size: 12px;
                  color: #495057;
                  text-transform: uppercase;
                  font-weight: 600;
                  border-bottom: 1px solid #dee2e6;
                  padding-bottom: 8px;
                }
                .status-info {
                  margin-bottom: 10px;
                  font-size: 11px;
                }
                .status-badge {
                  display: inline-block;
                  padding: 4px 12px;
                  border-radius: 12px;
                  font-size: 9px;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                  margin-left: 8px;
                }
                .badge-partial {
                  background: #fff3cd;
                  color: #856404;
                  border: 1px solid #ffeaa7;
                }
                .badge-paid {
                  background: #d4edda;
                  color: #155724;
                  border: 1px solid #c3e6cb;
                }
                .badge-delivered {
                  background: #d4edda;
                  color: #155724;
                  border: 1px solid #c3e6cb;
                }
                .highlight-messages {
                  margin: 25px 0;
                }
                .message-box {
                  background: #fff3cd;
                  border: 1px solid #ffeaa7;
                  border-radius: 6px;
                  padding: 12px;
                  margin: 10px 0;
                  font-size: 10px;
                  color: #856404;
                  display: flex;
                  align-items: center;
                }
                .message-box::before {
                  content: "ℹ️";
                  margin-right: 8px;
                  font-size: 14px;
                }
                .observations-section {
                  margin: 25px 0;
                  background: #f8f9fa;
                  padding: 15px;
                  border-radius: 6px;
                  border-left: 4px solid #6c757d;
                }
                .observations-section h4 {
                  margin: 0 0 10px 0;
                  font-size: 12px;
                  color: #495057;
                  font-weight: 600;
                }
                .legal-mention {
                  margin-top: 40px;
                  padding: 20px;
                  background: #e9ecef;
                  border-radius: 6px;
                  text-align: center;
                  font-size: 11px;
                  font-weight: 500;
                  color: #495057;
                  font-style: italic;
                  border: 1px dashed #adb5bd;
                }
                @media print {
                  body { margin: 0; padding: 10px; }
                  .no-print { display: none !important; }
                  .invoice-container { max-width: none; padding: 0; }
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
    console.log('🧮 Calcul des montants avec remises pour facture achat:', {
      facture_id: facture.id,
      numero_facture: facture.numero_facture,
      articles_count: articles?.length || 0,
      bon_commande: facture.bon_commande
    });

    if (!articles || articles.length === 0) {
      // Si pas d'articles détaillés, utiliser les montants de la facture et du bon de commande
      const montantTotalBrut = facture.montant_ttc || 0;
      const remiseTotale = facture.bon_commande?.remise || 0;
      const netAPayer = montantTotalBrut;
      
      console.log('📊 Calculs sans articles détaillés:', {
        montantTotalBrut,
        remiseTotale,
        netAPayer
      });
      
      return {
        montantTotalBrut,
        remiseTotale,
        netAPayer
      };
    }
    
    // Calculer à partir des articles avec remises
    let montantTotalBrut = 0;
    let remiseTotale = 0;
    
    articles.forEach((article: any) => {
      const prixUnitaireBrut = article.prix_unitaire || 0;
      const quantite = article.quantite || 0;
      const remiseUnitaire = article.remise_unitaire || 0;
      
      const montantLigneBrut = prixUnitaireBrut * quantite;
      const remiseLigne = remiseUnitaire * quantite;
      
      montantTotalBrut += montantLigneBrut;
      remiseTotale += remiseLigne;
    });
    
    // Ajouter la remise globale du bon de commande si elle existe
    const remiseGlobaleBonCommande = facture.bon_commande?.remise || 0;
    remiseTotale += remiseGlobaleBonCommande;
    
    const netAPayer = montantTotalBrut - remiseTotale;
    
    console.log('📊 Calculs avec articles détaillés:', {
      montantTotalBrut,
      remiseTotale,
      remiseGlobaleBonCommande,
      netAPayer
    });
    
    return {
      montantTotalBrut,
      remiseTotale,
      netAPayer
    };
  };

  const getPaymentStatus = () => {
    // Calculer le montant payé total (acompte BC + règlements)
    const acompteBC = facture.bon_commande?.montant_paye || 0;
    const reglementsTotal = facture.reglements?.reduce((sum: number, reglement: any) => {
      return sum + (reglement.montant || 0);
    }, 0) || 0;
    
    const montantPaye = acompteBC + reglementsTotal;
    const montantTotal = facture.montant_ttc || 0;
    
    if (montantPaye === 0) {
      return { label: 'Non payé', badge: 'badge-partial' };
    } else if (montantPaye >= montantTotal) {
      return { label: 'Payé', badge: 'badge-paid' };
    } else {
      return { label: 'Partiellement payé', badge: 'badge-partial' };
    }
  };

  const getDeliveryStatus = () => {
    if (!articles || articles.length === 0) {
      return { label: 'Livré', badge: 'badge-delivered' };
    }
    
    const totalArticles = articles.length;
    const articlesLivres = articles.filter((article: any) => (article.quantite_livree || 0) > 0).length;
    
    if (articlesLivres === totalArticles) {
      return { label: 'Livré', badge: 'badge-delivered' };
    } else if (articlesLivres > 0) {
      return { label: 'Partiellement livré', badge: 'badge-partial' };
    } else {
      return { label: 'En attente', badge: 'badge-partial' };
    }
  };

  const totals = calculateTotals();
  const paymentStatus = getPaymentStatus();
  const deliveryStatus = getDeliveryStatus();

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
        
        <div id="facture-print-content" className="invoice-container">
          {/* En-tête avec logo et informations société */}
          <div className="header-section">
            <div className="company-info">
              <div className="company-logo">
                <img src="/lovable-uploads/932def2b-197f-4495-8a0a-09c753a4a892.png" alt="U CONNEXT Logo" />
              </div>
              <div className="company-name">U CONNEXT</div>
              <div className="company-details">
                <strong>Adresse :</strong> Madina-Gare routière Kankan C/Matam<br/>
                <strong>Téléphone :</strong> 623 26 87 81<br/>
                <strong>Email :</strong> uconnext@gmail.com
              </div>
            </div>
            
            <div className="invoice-info">
              <div className="invoice-details">
                <h3>Informations de la facture</h3>
                <p><strong>Date :</strong> {format(new Date(facture.date_facture), 'dd/MM/yyyy', { locale: fr })}</p>
                <p><strong>N° Facture :</strong> {facture.numero_facture}</p>
                {facture.date_echeance && (
                  <p><strong>Échéance :</strong> {format(new Date(facture.date_echeance), 'dd/MM/yyyy', { locale: fr })}</p>
                )}
              </div>
            </div>
          </div>

          <div className="invoice-title">Facture d'Achat</div>

          {/* Informations fournisseur */}
          <div className="supplier-section">
            <h3>Informations Fournisseur</h3>
            <div className="supplier-info">
              <div className="supplier-field">
                <label>Nom :</label>
                <span>{facture.fournisseur}</span>
              </div>
              <div className="supplier-field">
                <label>Code :</label>
                <span>{facture.fournisseur_id || 'N/A'}</span>
              </div>
              <div className="supplier-field">
                <label>Téléphone :</label>
                <span>N/A</span>
              </div>
              <div className="supplier-field">
                <label>Email :</label>
                <span>N/A</span>
              </div>
            </div>
          </div>

          {/* Tableau des articles */}
          <div className="articles-section">
            {articles && articles.length > 0 ? (
              <table className="articles-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Prix unitaire</th>
                    <th>Remise</th>
                    <th>Prix net</th>
                    <th>Qté</th>
                    <th>Livré</th>
                    <th>Restant</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article: any) => {
                    const delivered = article.quantite_livree || 0;
                    const ordered = article.quantite || 0;
                    const remaining = Math.max(0, ordered - delivered);
                    const remiseUnitaire = article.remise_unitaire || 0;
                    const prixUnitaireBrut = article.prix_unitaire || 0;
                    const prixNet = prixUnitaireBrut - remiseUnitaire;
                    
                    return (
                      <tr key={article.id}>
                        <td className="product-name">{article.catalogue?.nom || 'Article'}</td>
                        <td>{formatCurrency(prixUnitaireBrut)}</td>
                        <td className="discount-amount">{remiseUnitaire > 0 ? formatCurrency(remiseUnitaire) : '0 GNF'}</td>
                        <td>{formatCurrency(prixNet)}</td>
                        <td>{ordered}</td>
                        <td className="quantity-delivered">{delivered}</td>
                        <td className="quantity-remaining">{remaining}</td>
                        <td>{formatCurrency(article.montant_ligne)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="message-box">
                Aucun article détaillé disponible pour cette facture.
              </div>
            )}
          </div>

          {/* Section totaux avec remises */}
          <div className="totals-section">
            <div className="totals-left"></div>
            <div className="totals-right">
              <h4>Récapitulatif des montants</h4>
              <div className="total-line">
                <span>Montant Total Brut</span>
                <span>{formatCurrency(totals.montantTotalBrut)}</span>
              </div>
              {totals.remiseTotale > 0 && (
                <div className="total-line">
                  <span>Remise Totale</span>
                  <span className="discount-amount">{formatCurrency(totals.remiseTotale)}</span>
                </div>
              )}
              <div className="total-line final">
                <span>Net à Payer</span>
                <span>{formatCurrency(totals.netAPayer)}</span>
              </div>
            </div>
          </div>

          {/* Section statuts */}
          <div className="status-section">
            <div className="status-box">
              <h4>Statut de paiement</h4>
              <div className="status-info">
                <strong>Statut :</strong>
                <span className={`status-badge ${paymentStatus.badge}`}>
                  {paymentStatus.label}
                </span>
              </div>
              <div className="status-info">
                <strong>Montant payé :</strong> {formatCurrency(facture.montant_paye || 0)}
              </div>
              <div className="status-info">
                <strong>Reste à payer :</strong> {formatCurrency(Math.max(0, (facture.montant_ttc || 0) - (facture.montant_paye || 0)))}
              </div>
            </div>
            
            <div className="status-box">
              <h4>Statut de livraison</h4>
              <div className="status-info">
                <strong>Statut :</strong>
                <span className={`status-badge ${deliveryStatus.badge}`}>
                  {deliveryStatus.label}
                </span>
              </div>
            </div>
          </div>

          {/* Messages informatifs */}
          <div className="highlight-messages">
            {paymentStatus.label === 'Partiellement payé' && (
              <div className="message-box">
                Un paiement partiel a été effectué sur cette facture.
              </div>
            )}
            
            {deliveryStatus.label === 'Partiellement livré' && (
              <div className="message-box">
                Cette commande a été partiellement livrée.
              </div>
            )}
            
            {totals.remiseTotale > 0 && (
              <div className="message-box">
                Une remise de {formatCurrency(totals.remiseTotale)} a été appliquée sur cette facture.
              </div>
            )}
          </div>

          {/* Observations */}
          {facture.observations && (
            <div className="observations-section">
              <h4>Observations :</h4>
              <p>{facture.observations}</p>
            </div>
          )}

          {/* Mention légale */}
          <div className="legal-mention">
            Arrêtée la présente facture à la somme de <strong>{numberToWords(Math.floor(totals.netAPayer))} francs guinéens</strong>
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


import React from 'react';
import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { FactureVente } from '@/types/sales';

interface FacturePDFGeneratorProps {
  facture: FactureVente;
  onGenerate?: () => void;
}

const FacturePDFGenerator: React.FC<FacturePDFGeneratorProps> = ({ facture, onGenerate }) => {
  
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20;

    // En-tête entreprise
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('VOTRE ENTREPRISE', 20, yPosition);
    
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('123 Rue de l\'Entreprise', 20, yPosition);
    yPosition += 5;
    doc.text('75001 Paris, France', 20, yPosition);
    yPosition += 5;
    doc.text('Tél: +33 1 23 45 67 89', 20, yPosition);
    yPosition += 5;
    doc.text('Email: contact@entreprise.com', 20, yPosition);

    // Numéro de facture (coin droit)
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`FACTURE ${facture.numero_facture}`, pageWidth - 80, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${format(new Date(facture.date_facture), 'dd/MM/yyyy', { locale: fr })}`, pageWidth - 80, 30);

    yPosition = 60;

    // Informations client
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURÉ À:', 20, yPosition);
    
    yPosition += 10;
    doc.setFont('helvetica', 'normal');
    doc.text(facture.client?.nom || 'Client', 20, yPosition);
    if (facture.client?.nom_entreprise) {
      yPosition += 5;
      doc.text(facture.client.nom_entreprise, 20, yPosition);
    }
    if (facture.client?.telephone) {
      yPosition += 5;
      doc.text(`Tél: ${facture.client.telephone}`, 20, yPosition);
    }
    if (facture.client?.email) {
      yPosition += 5;
      doc.text(`Email: ${facture.client.email}`, 20, yPosition);
    }
    if (facture.client?.adresse) {
      yPosition += 5;
      doc.text(facture.client.adresse, 20, yPosition);
    }
    
    // Code client
    yPosition += 5;
    doc.text(`Code client: ${facture.client?.id?.substring(0, 8) || 'N/A'}`, 20, yPosition);

    yPosition += 20;

    // Tableau des articles
    const tableStartY = yPosition;
    const columnWidths = [60, 25, 20, 25, 20, 25, 20, 25];
    const headers = ['Produit', 'Prix unit.', 'Remise', 'Prix net', 'Qté', 'Qté livrée', 'Reste', 'Total'];
    
    // En-têtes du tableau
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPosition, columnWidths.reduce((a, b) => a + b, 0), 10, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    let xPos = 20;
    headers.forEach((header, index) => {
      doc.text(header, xPos + 2, yPosition + 7);
      xPos += columnWidths[index];
    });

    yPosition += 10;

    // Lignes du tableau
    doc.setFont('helvetica', 'normal');
    const lignes = facture.lignes_facture || [];
    
    lignes.forEach((ligne) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      xPos = 20;
      const rowData = [
        ligne.article?.nom || 'Article',
        formatCurrency(ligne.prix_unitaire),
        '0,00 €', // Remise (à implémenter si nécessaire)
        formatCurrency(ligne.prix_unitaire),
        ligne.quantite.toString(),
        (ligne.quantite_livree || 0).toString(),
        (ligne.quantite - (ligne.quantite_livree || 0)).toString(),
        formatCurrency(ligne.montant_ligne)
      ];

      rowData.forEach((data, index) => {
        const textAlign = index === 0 ? 'left' : 'right';
        const textX = textAlign === 'left' ? xPos + 2 : xPos + columnWidths[index] - 2;
        doc.text(data, textX, yPosition + 7);
        xPos += columnWidths[index];
      });

      // Ligne de séparation
      doc.line(20, yPosition + 10, 20 + columnWidths.reduce((a, b) => a + b, 0), yPosition + 10);
      yPosition += 12;
    });

    yPosition += 10;

    // Résumé financier
    const resumeX = pageWidth - 80;
    doc.setFont('helvetica', 'bold');
    doc.text('RÉSUMÉ', resumeX, yPosition);
    
    yPosition += 10;
    doc.setFont('helvetica', 'normal');
    doc.text(`Montant HT: ${formatCurrency(facture.montant_ht)}`, resumeX, yPosition);
    yPosition += 5;
    doc.text(`TVA (${facture.taux_tva || 20}%): ${formatCurrency(facture.tva)}`, resumeX, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL TTC: ${formatCurrency(facture.montant_ttc)}`, resumeX, yPosition);

    yPosition += 20;

    // Statut de paiement
    const montantPaye = facture.versements?.reduce((sum, v) => sum + v.montant, 0) || 0;
    const montantRestant = facture.montant_ttc - montantPaye;
    
    doc.setFont('helvetica', 'bold');
    doc.text('STATUT DE PAIEMENT', 20, yPosition);
    yPosition += 8;
    
    doc.setFont('helvetica', 'normal');
    let statutPaiement = 'Non payé';
    if (montantPaye >= facture.montant_ttc) {
      statutPaiement = 'Payé';
    } else if (montantPaye > 0) {
      statutPaiement = 'Partiellement payé';
    }
    
    doc.text(`Statut: ${statutPaiement}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Montant payé: ${formatCurrency(montantPaye)}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Montant restant: ${formatCurrency(montantRestant)}`, 20, yPosition);

    yPosition += 15;

    // Statut de livraison
    doc.setFont('helvetica', 'bold');
    doc.text('STATUT DE LIVRAISON', 20, yPosition);
    yPosition += 8;
    
    doc.setFont('helvetica', 'normal');
    let statutLivraison = 'En attente';
    if (facture.statut_livraison === 'livree') {
      statutLivraison = 'Livré';
    } else if (facture.statut_livraison === 'partiellement_livree') {
      statutLivraison = 'Partiellement livré';
    }
    
    doc.text(`Statut: ${statutLivraison}`, 20, yPosition);

    // Générer le PDF
    const fileName = `Facture_${facture.numero_facture}_${format(new Date(facture.date_facture), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
    
    if (onGenerate) {
      onGenerate();
    }
  };

  return (
    <Button
      onClick={generatePDF}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <FileText className="h-4 w-4" />
      Générer PDF
    </Button>
  );
};

export default FacturePDFGenerator;

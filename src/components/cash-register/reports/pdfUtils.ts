
// Utilitaires pour génération de rapports PDF
import jsPDF from "jspdf";

export function generateDailyReportPDF({ date, ventes, totalVentes, montantEncaisse, resteAPayer, ventesParProduit, ventesParClient }) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Rapport Journalier", 14, 15);
  doc.setFontSize(11);
  doc.text(`Date : ${date}`, 14, 24);
  doc.text(`Total des ventes : ${totalVentes}`, 14, 32);
  doc.text(`Montant encaissé : ${montantEncaisse}`, 14, 38);
  doc.text(`Reste à payer : ${resteAPayer}`, 14, 44);

  let y = 55;
  doc.setFontSize(13);
  doc.text("Ventes par produit :", 14, y);
  y += 7;
  ventesParProduit.forEach(item => {
    doc.setFontSize(11);
    doc.text(
      `Produit: ${item.produit}, Quantité: ${item.quantiteVendue}, Montant: ${item.montantVentes}`,
      14,
      y
    );
    y += 7;
  });

  y += 6;
  doc.setFontSize(13);
  doc.text("Ventes par client :", 14, y);
  y += 7;
  ventesParClient.forEach(item => {
    doc.setFontSize(11);
    doc.text(
      `Client: ${item.client}, Montant total: ${item.montantTotal}, Payé: ${item.montantPaye}, Reste: ${item.resteAPayer}, État: ${item.etat}`,
      14,
      y
    );
    y += 7;
  });

  doc.save(`rapport_journalier_${date}.pdf`);
}

// Pour simplifier, les deux suivants acceptent déjà des totaux calculés/listes -- à ajuster au besoin
export function generateMonthlyReportPDF({ mois, totalVentes, montantEncaisse, resteAPayer, nbFactures, nbClients }) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Rapport Mensuel", 14, 15);
  doc.setFontSize(11);
  doc.text(`Mois : ${mois}`, 14, 24);
  doc.text(`Total des ventes : ${totalVentes}`, 14, 32);
  doc.text(`Montant encaissé : ${montantEncaisse}`, 14, 38);
  doc.text(`Reste à payer : ${resteAPayer}`, 14, 44);
  doc.text(`Nombre de factures : ${nbFactures}`, 14, 50);
  doc.text(`Nombre de clients : ${nbClients}`, 14, 56);
  doc.save(`rapport_mensuel_${mois}.pdf`);
}

export function generateYearlyReportPDF({ annee, totalVentes, montantEncaisse, resteAPayer, nbFactures, nbClients }) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Rapport Annuel", 14, 15);
  doc.setFontSize(11);
  doc.text(`Année : ${annee}`, 14, 24);
  doc.text(`Total des ventes : ${totalVentes}`, 14, 32);
  doc.text(`Montant encaissé : ${montantEncaisse}`, 14, 38);
  doc.text(`Reste à payer : ${resteAPayer}`, 14, 44);
  doc.text(`Nombre de factures : ${nbFactures}`, 14, 50);
  doc.text(`Nombre de clients : ${nbClients}`, 14, 56);
  doc.save(`rapport_annuel_${annee}.pdf`);
}


import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileText, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DailyReport from './reports/DailyReport';
import DateRangeReports from './reports/DateRangeReports';
import ClientsReports from './reports/ClientsReports';
import UnpaidInvoicesReports from './reports/UnpaidInvoicesReports';
import { toast } from "@/components/ui/use-toast";
import { useFacturesVenteQuery } from '@/hooks/useSales';
import { generateDailyReportPDF, generateMonthlyReportPDF, generateYearlyReportPDF } from "./reports/pdfUtils";

interface ReportsTabProps {
  defaultTab?: string;
}

const ReportsTab: React.FC<ReportsTabProps> = ({ defaultTab = "daily-report" }) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  // Fetch all sales data for summary reports (monthly/yearly)
  const { data: factures, isLoading } = useFacturesVenteQuery();

  // Pour rapport quotidien (détaillé dans DailyReport)
  const handleExportDailyPDF = async () => {
    try {
      // On récupère les infos du jour courant pour la carte
      const today = new Date();
      const dateStr = format(today, "yyyy-MM-dd");

      // Filter factures of today only
      const todayFactures = factures
        ? factures.filter(f =>
            format(new Date(f.date_facture), "yyyy-MM-dd") === dateStr)
        : [];

      const totalVentes = todayFactures.reduce((sum, f) => sum + f.montant_ttc, 0);
      const montantEncaisse = todayFactures.reduce((sum, f) => {
        // Somme des paiements (versements) rattachés
        if (!f.versements || f.versements.length === 0) return sum;
        return sum + f.versements.reduce((s, v) => s + (v.montant || 0), 0);
      }, 0);
      const resteAPayer = totalVentes - montantEncaisse;

      // Regroupement par produit
      const produitMap = new Map();
      todayFactures.forEach(facture => {
        facture.lignes_facture?.forEach(ligne => {
          const nomProduit = ligne.article?.nom || "Produit inconnu";
          if (!produitMap.has(nomProduit)) {
            produitMap.set(nomProduit, {
              produit: nomProduit,
              quantiteVendue: 0,
              montantVentes: 0,
            });
          }
          const prod = produitMap.get(nomProduit);
          prod.quantiteVendue += ligne.quantite;
          prod.montantVentes += ligne.montant_ligne;
        });
      });
      const ventesParProduit = Array.from(produitMap.values());

      // Regroupement par client
      const clientMap = new Map();
      todayFactures.forEach(facture => {
        const clientNom = facture.client?.nom || 'Client inconnu';
        if (!clientMap.has(clientNom)) {
          clientMap.set(clientNom, {
            client: clientNom,
            montantTotal: 0,
            montantPaye: 0,
            resteAPayer: 0,
            etat: "impayé",
          });
        }
        const cl = clientMap.get(clientNom);
        cl.montantTotal += facture.montant_ttc;
        // Paiements
        const montantVerse = facture.versements?.reduce((s, v) => s + (v.montant || 0), 0) || 0;
        cl.montantPaye += montantVerse;
      });
      clientMap.forEach(cl => {
        cl.resteAPayer = cl.montantTotal - cl.montantPaye;
        if (cl.montantPaye >= cl.montantTotal) cl.etat = "payé";
        else if (cl.montantPaye > 0) cl.etat = "partiel";
        else cl.etat = "impayé";
      });
      const ventesParClient = Array.from(clientMap.values());

      generateDailyReportPDF({
        date: dateStr,
        ventes: todayFactures,
        totalVentes: totalVentes.toFixed(2) + " €",
        montantEncaisse: montantEncaisse.toFixed(2) + " €",
        resteAPayer: resteAPayer.toFixed(2) + " €",
        ventesParProduit,
        ventesParClient,
      });

      toast({ title: "PDF généré", description: "Rapport journalier téléchargé." });
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de générer le PDF.", variant: "destructive" });
      console.error("Erreur export rapport journalier :", err);
    }
  };

  // Rapport Mensuel
  const handleExportMonthlyPDF = () => {
    try {
      const now = new Date();
      const month = format(now, "yyyy-MM");
      // Filtre sur le mois courant
      const monthlyFactures = factures
        ? factures.filter(f =>
            format(new Date(f.date_facture), "yyyy-MM") === month)
        : [];
      const totalVentes = monthlyFactures.reduce((sum, f) => sum + f.montant_ttc, 0);
      const montantEncaisse = monthlyFactures.reduce((sum, f) => {
        if (!f.versements || f.versements.length === 0) return sum;
        return sum + f.versements.reduce((s, v) => s + (v.montant || 0), 0);
      }, 0);
      const resteAPayer = totalVentes - montantEncaisse;

      // Statistiques complémentaires
      const nbFactures = monthlyFactures.length;
      const clientsUnic = new Set(monthlyFactures.map(f => f.client?.nom || "Client inconnu"));

      generateMonthlyReportPDF({
        mois: month,
        totalVentes: totalVentes.toFixed(2) + " €",
        montantEncaisse: montantEncaisse.toFixed(2) + " €",
        resteAPayer: resteAPayer.toFixed(2) + " €",
        nbFactures,
        nbClients: clientsUnic.size,
      });

      toast({ title: "PDF généré", description: "Rapport mensuel téléchargé." });
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de générer le rapport mensuel.", variant: "destructive" });
      console.error("Erreur export rapport mensuel :", err);
    }
  };

  // Rapport Annuel
  const handleExportYearlyPDF = () => {
    try {
      const now = new Date();
      const annee = format(now, "yyyy");
      const yearFactures = factures
        ? factures.filter(f =>
            format(new Date(f.date_facture), "yyyy") === annee)
        : [];
      const totalVentes = yearFactures.reduce((sum, f) => sum + f.montant_ttc, 0);
      const montantEncaisse = yearFactures.reduce((sum, f) => {
        if (!f.versements || f.versements.length === 0) return sum;
        return sum + f.versements.reduce((s, v) => s + (v.montant || 0), 0);
      }, 0);
      const resteAPayer = totalVentes - montantEncaisse;

      // Statistiques complémentaires
      const nbFactures = yearFactures.length;
      const clientsUnic = new Set(yearFactures.map(f => f.client?.nom || "Client inconnu"));

      generateYearlyReportPDF({
        annee,
        totalVentes: totalVentes.toFixed(2) + " €",
        montantEncaisse: montantEncaisse.toFixed(2) + " €",
        resteAPayer: resteAPayer.toFixed(2) + " €",
        nbFactures,
        nbClients: clientsUnic.size,
      });

      toast({ title: "PDF généré", description: "Rapport annuel téléchargé." });
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de générer le rapport annuel.", variant: "destructive" });
      console.error("Erreur export rapport annuel :", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Rapport quotidien
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">Résumé des transactions d'aujourd'hui</p>
            <Button variant="outline" className="w-full" onClick={handleExportDailyPDF} disabled={isLoading}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Rapport mensuel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">Résumé du mois en cours</p>
            <Button variant="outline" className="w-full" onClick={handleExportMonthlyPDF} disabled={isLoading}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Rapport annuel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">Synthèse de l'année en cours</p>
            <Button variant="outline" className="w-full" onClick={handleExportYearlyPDF} disabled={isLoading}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rapports financiers avancés</CardTitle>
          <CardDescription>Générez des rapports détaillés selon vos critères</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="daily-report">Rapport Quotidien</TabsTrigger>
              <TabsTrigger value="date-range">Date à Date</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="unpaid">Factures Impayées</TabsTrigger>
            </TabsList>

            <TabsContent value="daily-report" className="mt-6">
              <DailyReport />
            </TabsContent>

            <TabsContent value="date-range" className="mt-6">
              <DateRangeReports />
            </TabsContent>

            <TabsContent value="clients" className="mt-6">
              <ClientsReports />
            </TabsContent>

            <TabsContent value="unpaid" className="mt-6">
              <UnpaidInvoicesReports />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsTab;

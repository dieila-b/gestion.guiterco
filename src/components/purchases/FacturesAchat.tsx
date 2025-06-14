
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Printer } from "lucide-react";
import { useFacturesAchat } from "@/hooks/useFacturesAchat";
import { useFactureAchatArticles } from "@/hooks/useFactureAchatArticles";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatCurrency } from "@/lib/currency";
import { EditFactureAchatDialog } from "./EditFactureAchatDialog";
import { DeleteFactureAchatDialog } from "./DeleteFactureAchatDialog";
import { PrintFactureAchatDialog } from "./PrintFactureAchatDialog";

// Ticket (mini-impression) : composant simplifié pour le ticket imprimable
const TicketFactureAchatDialog = ({ facture }: { facture: any }) => {
  const [open, setOpen] = React.useState(false);
  const { data: articles } = useFactureAchatArticles(facture.id);

  return (
    <>
      <Button variant="ghost" size="sm" title="Ticket" onClick={() => setOpen(true)}>
        <Printer className="h-4 w-4" />
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center print:bg-transparent">
          <div className="bg-white rounded shadow p-4 w-80 print:w-full print:shadow-none relative">
            <h2 className="text-center font-bold text-lg mb-2">Ticket Achat</h2>
            <div className="flex justify-between text-xs mb-1">
              <span>Facture : {facture.numero_facture}</span>
              <span>{format(new Date(facture.date_facture), "dd/MM/yy", { locale: fr })}</span>
            </div>
            <div className="text-xs mb-2">Fournisseur : {(facture.fournisseur_nom || facture.fournisseur) ?? "NC"}</div>
            <div className="border-b border-gray-200 mb-1"></div>
            {articles && articles.length ? (
              <table className="text-xs w-full mb-1">
                <tbody>
                  {articles.map((art: any) => (
                    <tr key={art.id}>
                      <td className="pr-1">{art.catalogue?.nom ?? "Article"}</td>
                      <td className="text-right">{art.quantite} x {formatCurrency(art.prix_unitaire)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-xs text-muted-foreground mb-1">Aucun article</div>
            )}
            <div className="text-xs flex justify-between font-bold">
              <span>Total TTC</span>
              <span>{formatCurrency(facture.montant_ttc)}</span>
            </div>
            <div className="flex mt-3 justify-end">
              <Button size="sm" variant="outline" onClick={() => setOpen(false)}>Fermer</Button>
              <Button
                size="sm"
                className="ml-2 bg-blue-600 hover:bg-blue-700 text-white print:hidden"
                onClick={() => {
                  setTimeout(() => window.print(), 200);
                }}
              >
                <Printer className="h-3 w-3 mr-1" /> Imprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const FacturesAchat = () => {
  const { facturesAchat, isLoading } = useFacturesAchat();

  // articles associés à chaque facture
  // tableau | undefined
  // Récupération "inline" des articles de chaque facture
  const useArticlesCount = (factureId: string) => {
    const { data } = useFactureAchatArticles(factureId);
    return data?.length || 0;
  };

  // Calcule le montant payé et restant (à affiner si la logique existe)
  const getPaidAmount = (facture: any) => {
    if (facture.statut_paiement === "paye") return facture.montant_ttc;
    if (facture.statut_paiement === "partiellement_paye") return Number(facture.montant_paye || 0);
    return 0;
  };
  const getRemainingAmount = (facture: any) =>
    Math.max(0, (facture.montant_ttc || 0) - getPaidAmount(facture));

  // Détail livraison
  const getLivraisonColumn = (facture: any) =>
    facture.bon_livraison?.numero_bon ?? "—";

  // Couleurs badge paiement
  const getStatusBadgeColor = (statut: string) => {
    switch (statut) {
      case "en_attente":
        return "default";
      case "partiellement_paye":
        return "secondary";
      case "paye":
        return "outline";
      case "en_retard":
        return "destructive";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Chargement…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Factures d'achat</h2>
        {/* Création de facture (fonctionnalité à ajouter) */}
        <Button>
          Nouvelle facture
        </Button>
      </div>
      <div className="grid gap-4">
        {facturesAchat && facturesAchat.length > 0 ? (
          facturesAchat.map((facture: any) => (
            <Card key={facture.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  {facture.numero_facture}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusBadgeColor(facture.statut_paiement)}>
                    {facture.statut_paiement}
                  </Badge>
                  {/* Actions compactes dans le header aussi (optionnel) */}
                  <PrintFactureAchatDialog facture={facture} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-10 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">N° Facture</p>
                    <p className="font-medium">{facture.numero_facture}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {format(new Date(facture.date_facture), "dd/MM/yyyy", { locale: fr })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fournisseur</p>
                    <p className="font-medium">
                      {(facture.fournisseur_nom || facture.fournisseur) ?? "Non spécifié"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Articles</p>
                    <p className="font-medium">{useArticlesCount(facture.id)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-medium">{formatCurrency(facture.montant_ttc)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payé</p>
                    <p className="font-medium">{formatCurrency(getPaidAmount(facture))}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Restant</p>
                    <p className="font-medium">{formatCurrency(getRemainingAmount(facture))}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Paiement</p>
                    <Badge variant={getStatusBadgeColor(facture.statut_paiement)}>
                      {facture.statut_paiement}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Livraison</p>
                    <p className="font-medium">{getLivraisonColumn(facture)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Actions</p>
                    <div className="flex gap-1">
                      <EditFactureAchatDialog facture={facture} />
                      <DeleteFactureAchatDialog
                        factureId={facture.id}
                        numeroFacture={facture.numero_facture}
                      />
                      <PrintFactureAchatDialog facture={facture} />
                      <TicketFactureAchatDialog facture={facture} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              Aucune facture d'achat trouvée
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FacturesAchat;

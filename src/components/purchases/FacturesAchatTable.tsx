
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Printer, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/currency';
import { useFactureAchatArticles } from '@/hooks/useFactureAchatArticles';
import { useAllReglementsAchat } from '@/hooks/useReglementsAchat';
import { EditFactureAchatDialog } from './EditFactureAchatDialog';
import { DeleteFactureAchatDialog } from './DeleteFactureAchatDialog';
import { PrintFactureAchatDialog } from './PrintFactureAchatDialog';

interface FacturesAchatTableProps {
  facturesAchat: any[];
}

const TicketFactureAchatDialog = ({ facture }: { facture: any }) => {
  const [open, setOpen] = React.useState(false);
  const { data: articles } = useFactureAchatArticles(facture.id);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} title="Ticket">
        <Receipt className="h-4 w-4" />
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center print:bg-transparent">
          <div className="bg-white rounded shadow p-4 w-80 print:w-full print:shadow-none relative">
            <h2 className="text-center font-bold text-lg mb-2">Ticket Achat</h2>
            <div className="flex justify-between text-xs mb-1">
              <span>Facture : {facture.numero_facture}</span>
              <span>{format(new Date(facture.date_facture), "dd/MM/yy", { locale: fr })}</span>
            </div>
            <div className="text-xs mb-2">Fournisseur : {facture.fournisseur}</div>
            <div className="border-b border-gray-200 mb-1"></div>
            {articles && articles.length > 0 ? (
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

export const FacturesAchatTable = ({ facturesAchat }: FacturesAchatTableProps) => {
  const { reglements } = useAllReglementsAchat();

  const useArticlesCount = (factureId: string) => {
    const { data } = useFactureAchatArticles(factureId);
    return data?.length || 0;
  };

  const getPaidAmount = (facture: any) => {
    return reglements?.[facture.id] || 0;
  };

  const getRemainingAmount = (facture: any) => {
    const paidAmount = getPaidAmount(facture);
    return Math.max(0, (facture.montant_ttc || 0) - paidAmount);
  };

  const getStatusBadgeVariant = (statut: string) => {
    switch (statut) {
      case 'paye':
        return 'default';
      case 'partiellement_paye':
        return 'secondary';
      case 'en_attente':
        return 'outline';
      case 'en_retard':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N° Facture</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Fournisseur</TableHead>
            <TableHead className="text-center">Articles</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Payé</TableHead>
            <TableHead className="text-right">Restant</TableHead>
            <TableHead>Paiement</TableHead>
            <TableHead>Livraison</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {facturesAchat && facturesAchat.length > 0 ? (
            facturesAchat.map((facture) => (
              <TableRow key={facture.id}>
                <TableCell className="font-medium">{facture.numero_facture}</TableCell>
                <TableCell>
                  {format(new Date(facture.date_facture), 'dd/MM/yyyy', { locale: fr })}
                </TableCell>
                <TableCell>{facture.fournisseur}</TableCell>
                <TableCell className="text-center">{useArticlesCount(facture.id)}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(facture.montant_ttc)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(getPaidAmount(facture))}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(getRemainingAmount(facture))}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(facture.statut_paiement)}>
                    {facture.statut_paiement}
                  </Badge>
                </TableCell>
                <TableCell>
                  {facture.bon_livraison?.numero_bon || '—'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <EditFactureAchatDialog facture={facture} />
                    <DeleteFactureAchatDialog
                      factureId={facture.id}
                      numeroFacture={facture.numero_facture}
                    />
                    <PrintFactureAchatDialog facture={facture} />
                    <TicketFactureAchatDialog facture={facture} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                Aucune facture d'achat trouvée
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

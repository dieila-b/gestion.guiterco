
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { useToast } from '@/hooks/use-toast';

type CashRegister = {
  id: number;
  name: string;
  balance: number;
  status: string;
  lastUpdated: Date;
};

type Transaction = {
  id: number;
  type: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
  paymentMethod: string;
};

interface CashRegisterOverviewProps {
  activeRegister: CashRegister | undefined;
  mockTransactions: Transaction[];
  handleOpenRegister: () => void;
  handleCloseRegister: () => void;
  handlePrint: () => void;
  formatCurrency: (amount: number) => string;
}

const CashRegisterOverview: React.FC<CashRegisterOverviewProps> = ({
  activeRegister,
  mockTransactions,
  handleOpenRegister,
  handleCloseRegister,
  handlePrint,
  formatCurrency
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Solde actif</CardTitle>
            <CardDescription>Caisse principale</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(activeRegister?.balance || 0)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Dernière mise à jour: {activeRegister?.lastUpdated ? format(activeRegister.lastUpdated, 'dd/MM/yyyy HH:mm') : 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Entrées du jour</CardTitle>
            <CardDescription>Total des recettes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(203.75)}</p>
            <p className="text-sm text-muted-foreground mt-1">3 transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Dépenses du jour</CardTitle>
            <CardDescription>Total des sorties</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(80.50)}</p>
            <p className="text-sm text-muted-foreground mt-1">2 transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Balance du jour</CardTitle>
            <CardDescription>Entrées - Sorties</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(123.25)}</p>
            <p className="text-sm text-muted-foreground mt-1">5 transactions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Dernières transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTransactions.slice(0, 4).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-2 border-b">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{format(transaction.date, 'dd/MM/yyyy HH:mm')}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {transaction.paymentMethod === 'cash' ? 'Espèces' : 'Carte'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeRegister?.status === 'open' ? (
              <Button variant="outline" className="w-full" onClick={handleCloseRegister}>
                Fermer la caisse
              </Button>
            ) : (
              <Button className="w-full" onClick={handleOpenRegister}>
                Ouvrir la caisse
              </Button>
            )}
            <Button variant="outline" className="w-full" onClick={handlePrint}>
              Imprimer état de caisse
            </Button>
            <Button variant="outline" className="w-full">
              Effectuer un comptage
            </Button>
            <Button variant="outline" className="w-full">
              Exporter les transactions
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CashRegisterOverview;

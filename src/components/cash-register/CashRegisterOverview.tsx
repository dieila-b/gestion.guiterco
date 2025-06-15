import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { CashRegister, Transaction } from './types';

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
              Dernière mise à jour: {activeRegister?.updated_at ? format(new Date(activeRegister.updated_at), 'dd/MM/yyyy HH:mm') : 'N/A'}
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 flex flex-col">
          <TransactionsOverviewTable />
        </div>
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

import TransactionsOverviewTable from "./TransactionsOverviewTable";
export default CashRegisterOverview;

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';

// Mock data
const mockCashRegisters = [
  { id: 1, name: 'Caisse principale', balance: 1250.0, status: 'open', lastUpdated: new Date() },
  { id: 2, name: 'Caisse secondaire', balance: 435.75, status: 'closed', lastUpdated: new Date(Date.now() - 86400000) },
];

const mockTransactions = [
  { id: 1, type: 'income', description: 'Vente #F2023-089', amount: 125.50, date: new Date(), category: 'sales', paymentMethod: 'cash' },
  { id: 2, type: 'expense', description: 'Fournitures bureau', amount: 45.00, date: new Date(), category: 'supplies', paymentMethod: 'cash' },
  { id: 3, type: 'income', description: 'Vente #F2023-090', amount: 78.25, date: new Date(), category: 'sales', paymentMethod: 'card' },
  { id: 4, type: 'expense', description: 'Repas client', amount: 35.50, date: new Date(Date.now() - 86400000), category: 'entertainment', paymentMethod: 'cash' },
];

const CashRegisters: React.FC = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [newTransactionOpen, setNewTransactionOpen] = useState(false);
  const [transactionType, setTransactionType] = useState('income');
  const [selectedRegister, setSelectedRegister] = useState<number | null>(1);

  const handleOpenRegister = () => {
    toast({
      title: "Caisse ouverte",
      description: "La caisse a été ouverte avec un solde initial de 0.00€",
    });
  };

  const handleCloseRegister = () => {
    toast({
      title: "Caisse fermée",
      description: "La caisse a été fermée avec un solde final de 1250.00€",
    });
  };

  const handleAddTransaction = () => {
    setNewTransactionOpen(false);
    toast({
      title: "Transaction ajoutée",
      description: `Nouvelle ${transactionType === 'income' ? 'entrée' : 'dépense'} ajoutée à la caisse`,
    });
  };

  const handlePrint = () => {
    toast({
      title: "Impression",
      description: "Le rapport de caisse a été envoyé à l'impression",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const activeRegister = mockCashRegisters.find(register => register.id === selectedRegister);

  return (
    <AppLayout title="Gestion des caisses">
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="reports">Rapports</TabsTrigger>
          </TabsList>
          <div className="space-x-2">
            <Dialog open={newTransactionOpen} onOpenChange={setNewTransactionOpen}>
              <DialogTrigger asChild>
                <Button>Nouvelle transaction</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouvelle transaction</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select defaultValue={transactionType} onValueChange={setTransactionType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Entrée</SelectItem>
                          <SelectItem value="expense">Dépense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Montant</Label>
                      <Input id="amount" type="number" step="0.01" min="0" placeholder="0.00" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" placeholder="Description de la transaction" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Catégorie</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sales">Ventes</SelectItem>
                          <SelectItem value="supplies">Fournitures</SelectItem>
                          <SelectItem value="entertainment">Divertissement</SelectItem>
                          <SelectItem value="utilities">Services</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment">Moyen de paiement</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Espèces</SelectItem>
                          <SelectItem value="card">Carte bancaire</SelectItem>
                          <SelectItem value="transfer">Virement</SelectItem>
                          <SelectItem value="check">Chèque</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, 'PPP', { locale: fr }) : <span>Choisir une date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddTransaction}>Ajouter</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des transactions</CardTitle>
              <CardDescription>Toutes les entrées et sorties de caisse</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="search" className="sr-only">Recherche</Label>
                    <Input id="search" placeholder="Rechercher une transaction..." />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les transactions</SelectItem>
                      <SelectItem value="income">Entrées</SelectItem>
                      <SelectItem value="expense">Dépenses</SelectItem>
                    </SelectContent>
                  </Select>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, 'dd/MM/yyyy') : <span>Date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="rounded-md border">
                  <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b bg-muted/50">
                    <div>Description</div>
                    <div>Type</div>
                    <div>Date</div>
                    <div className="text-right">Montant</div>
                  </div>
                  <div className="divide-y">
                    {mockTransactions.map((transaction) => (
                      <div key={transaction.id} className="grid grid-cols-4 gap-4 p-4 items-center">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">{transaction.category}</p>
                        </div>
                        <div>
                          <span className={`status-badge ${transaction.type === 'income' ? 'completed' : 'cancelled'}`}>
                            {transaction.type === 'income' ? 'Entrée' : 'Dépense'}
                          </span>
                        </div>
                        <div>
                          {format(transaction.date, 'dd/MM/yyyy HH:mm')}
                        </div>
                        <div className={`text-right font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapports financiers</CardTitle>
              <CardDescription>Générer des rapports de caisse</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Période</Label>
                    <Select defaultValue="day">
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une période" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Jour</SelectItem>
                        <SelectItem value="week">Semaine</SelectItem>
                        <SelectItem value="month">Mois</SelectItem>
                        <SelectItem value="custom">Période personnalisée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Caisse</Label>
                    <Select defaultValue="1">
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une caisse" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Caisse principale</SelectItem>
                        <SelectItem value="2">Caisse secondaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Button className="w-full sm:w-auto">Générer le rapport</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Rapport quotidien</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm">Résumé des transactions d'aujourd'hui</p>
                      <Button variant="outline" className="w-full">Télécharger</Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Rapport mensuel</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm">Résumé du mois en cours</p>
                      <Button variant="outline" className="w-full">Télécharger</Button>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Rapport annuel</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm">Synthèse de l'année en cours</p>
                      <Button variant="outline" className="w-full">Télécharger</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default CashRegisters;

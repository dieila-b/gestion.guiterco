
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import ProtectedContent from '@/components/auth/ProtectedContent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Warehouse, Store, ArrowRightLeft, ArrowUp, ArrowDown } from 'lucide-react';

const Stock = () => {
  return (
    <AppLayout title="Gestion du Stock">
      <ProtectedContent menu="Stock">
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Warehouse className="h-6 w-6" />
            <div>
              <h1 className="text-2xl font-bold">Gestion du Stock</h1>
              <p className="text-muted-foreground">Suivi des stocks entrepôts et points de vente</p>
            </div>
          </div>

          <Tabs defaultValue="entrepots" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <ProtectedContent menu="Stock" submenu="Entrepôts" fallback={null}>
                <TabsTrigger value="entrepots" className="flex items-center space-x-2">
                  <Warehouse className="h-4 w-4" />
                  <span>Entrepôts</span>
                </TabsTrigger>
              </ProtectedContent>
              
              <ProtectedContent menu="Stock" submenu="PDV" fallback={null}>
                <TabsTrigger value="pdv" className="flex items-center space-x-2">
                  <Store className="h-4 w-4" />
                  <span>PDV</span>
                </TabsTrigger>
              </ProtectedContent>
              
              <ProtectedContent menu="Stock" submenu="Transferts" fallback={null}>
                <TabsTrigger value="transferts" className="flex items-center space-x-2">
                  <ArrowRightLeft className="h-4 w-4" />
                  <span>Transferts</span>
                </TabsTrigger>
              </ProtectedContent>
              
              <ProtectedContent menu="Stock" submenu="Entrées" fallback={null}>
                <TabsTrigger value="entrees" className="flex items-center space-x-2">
                  <ArrowUp className="h-4 w-4" />
                  <span>Entrées</span>
                </TabsTrigger>
              </ProtectedContent>
              
              <ProtectedContent menu="Stock" submenu="Sorties" fallback={null}>
                <TabsTrigger value="sorties" className="flex items-center space-x-2">
                  <ArrowDown className="h-4 w-4" />
                  <span>Sorties</span>
                </TabsTrigger>
              </ProtectedContent>
            </TabsList>

            <ProtectedContent menu="Stock" submenu="Entrepôts">
              <TabsContent value="entrepots" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Stock Entrepôts</CardTitle>
                    <CardDescription>
                      Gestion des stocks dans les entrepôts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Module de gestion des stocks entrepôts en cours de développement.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </ProtectedContent>

            <ProtectedContent menu="Stock" submenu="PDV">
              <TabsContent value="pdv" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Stock Points de Vente</CardTitle>
                    <CardDescription>
                      Gestion des stocks dans les points de vente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Module de gestion des stocks PDV en cours de développement.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </ProtectedContent>

            <ProtectedContent menu="Stock" submenu="Transferts">
              <TabsContent value="transferts" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Transferts de Stock</CardTitle>
                    <CardDescription>
                      Gestion des transferts entre entrepôts et points de vente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Module de transferts de stock en cours de développement.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </ProtectedContent>

            <ProtectedContent menu="Stock" submenu="Entrées">
              <TabsContent value="entrees" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Entrées de Stock</CardTitle>
                    <CardDescription>
                      Gestion des entrées de stock
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Module d'entrées de stock en cours de développement.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </ProtectedContent>

            <ProtectedContent menu="Stock" submenu="Sorties">
              <TabsContent value="sorties" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sorties de Stock</CardTitle>
                    <CardDescription>
                      Gestion des sorties de stock
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Module de sorties de stock en cours de développement.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </ProtectedContent>
          </Tabs>
        </div>
      </ProtectedContent>
    </AppLayout>
  );
};

export default Stock;

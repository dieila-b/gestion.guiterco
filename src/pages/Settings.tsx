
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import ProtectedContent from '@/components/auth/ProtectedContent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Users, 
  Warehouse, 
  Store, 
  UserCheck, 
  ShoppingCart,
  Shield
} from 'lucide-react';
import ZoneGeographique from '@/components/settings/ZoneGeographique';
import Fournisseurs from '@/components/settings/Fournisseurs';
import DepotsStockage from '@/components/settings/DepotsStockage';
import DepotsPDV from '@/components/settings/DepotsPDV';
import ClientsSettings from '@/components/settings/ClientsSettings';
import UtilisateursInternes from '@/components/settings/UtilisateursInternes';
import AccesPermissions from '@/components/settings/AccesPermissions';

const settingsCards = [
  {
    id: 'zone-geo',
    title: 'Zone Géographique',
    description: 'Gérez les emplacements, régions et zones géographiques',
    icon: MapPin,
    color: 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15',
    menu: 'Paramètres',
    submenu: null
  },
  {
    id: 'fournisseurs',
    title: 'Fournisseurs',
    description: 'Gérez vos fournisseurs et leurs catalogues',
    icon: ShoppingCart,
    color: 'bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/15',
    menu: 'Paramètres',
    submenu: 'Fournisseurs'
  },
  {
    id: 'depots-stockage',
    title: 'Dépôts de stockage',
    description: 'Gérez vos entrepôts et zones de stockage',
    icon: Warehouse,
    color: 'bg-green-500/10 border-green-500/20 hover:bg-green-500/15',
    menu: 'Paramètres',
    submenu: null
  },
  {
    id: 'depots-pdv',
    title: 'Dépôts PDV',
    description: 'Gérez vos points de vente',
    icon: Store,
    color: 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15',
    menu: 'Paramètres',
    submenu: null
  },
  {
    id: 'clients',
    title: 'Clients',
    description: 'Gérez vos clients et leurs informations',
    icon: Users,
    color: 'bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/15',
    menu: 'Clients',
    submenu: null
  },
  {
    id: 'utilisateurs-internes',
    title: 'Utilisateurs internes',
    description: 'Gérez les utilisateurs et leurs droits d\'accès',
    icon: UserCheck,
    color: 'bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/15',
    menu: 'Paramètres',
    submenu: 'Utilisateurs'
  },
  {
    id: 'acces-permissions',
    title: 'Accès & Permissions',
    description: 'Configurez les rôles et permissions utilisateurs',
    icon: Shield,
    color: 'bg-red-500/10 border-red-500/20 hover:bg-red-500/15',
    menu: 'Paramètres',
    submenu: 'Permissions'
  }
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <AppLayout title="Paramètres">
      <ProtectedContent menu="Paramètres">
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <div className="w-4 h-4 rounded bg-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Paramètres</h1>
              <p className="text-muted-foreground">Espace administrateur</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-8 w-full">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="zone-geo">Zone Géo</TabsTrigger>
              
              <ProtectedContent menu="Paramètres" submenu="Fournisseurs" fallback={null}>
                <TabsTrigger value="fournisseurs">Fournisseurs</TabsTrigger>
              </ProtectedContent>
              
              <TabsTrigger value="depots-stockage">Dépôts Stock</TabsTrigger>
              <TabsTrigger value="depots-pdv">Dépôts PDV</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              
              <ProtectedContent menu="Paramètres" submenu="Utilisateurs" fallback={null}>
                <TabsTrigger value="utilisateurs-internes">Utilisateurs</TabsTrigger>
              </ProtectedContent>
              
              <ProtectedContent menu="Paramètres" submenu="Permissions" fallback={null}>
                <TabsTrigger value="acces-permissions">Permissions</TabsTrigger>
              </ProtectedContent>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {settingsCards.map((card) => {
                  const IconComponent = card.icon;
                  return (
                    <ProtectedContent 
                      key={card.id}
                      menu={card.menu} 
                      submenu={card.submenu}
                      fallback={null}
                    >
                      <Card 
                        className={`cursor-pointer transition-all duration-200 ${card.color}`}
                        onClick={() => setActiveTab(card.id)}
                      >
                        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                          <IconComponent className="h-6 w-6 mr-3" />
                          <div className="flex-1">
                            <CardTitle className="text-lg">{card.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {card.description}
                            </CardDescription>
                          </div>
                        </CardHeader>
                      </Card>
                    </ProtectedContent>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="zone-geo" className="mt-6">
              <ZoneGeographique />
            </TabsContent>

            <ProtectedContent menu="Paramètres" submenu="Fournisseurs">
              <TabsContent value="fournisseurs" className="mt-6">
                <Fournisseurs />
              </TabsContent>
            </ProtectedContent>

            <TabsContent value="depots-stockage" className="mt-6">
              <DepotsStockage />
            </TabsContent>

            <TabsContent value="depots-pdv" className="mt-6">
              <DepotsPDV />
            </TabsContent>

            <TabsContent value="clients" className="mt-6">
              <ClientsSettings />
            </TabsContent>

            <ProtectedContent menu="Paramètres" submenu="Utilisateurs">
              <TabsContent value="utilisateurs-internes" className="mt-6">
                <UtilisateursInternes />
              </TabsContent>
            </ProtectedContent>

            <ProtectedContent menu="Paramètres" submenu="Permissions">
              <TabsContent value="acces-permissions" className="mt-6">
                <AccesPermissions />
              </TabsContent>
            </ProtectedContent>
          </Tabs>
        </div>
      </ProtectedContent>
    </AppLayout>
  );
};

export default Settings;


import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import StrictProtectedRoute from '@/components/auth/StrictProtectedRoute';
import ConditionalRender from '@/components/auth/ConditionalRender';
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

  const renderSettingsCard = (card: typeof settingsCards[0]) => (
    <ConditionalRender
      key={card.id}
      menu={card.menu}
      submenu={card.submenu}
      action="read"
      hide={true}
    >
      <Card 
        className={`cursor-pointer transition-all duration-200 ${card.color}`}
        onClick={() => setActiveTab(card.id)}
      >
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <card.icon className="h-5 w-5" />
            <CardTitle className="text-base">{card.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm">
            {card.description}
          </CardDescription>
        </CardContent>
      </Card>
    </ConditionalRender>
  );

  return (
    <StrictProtectedRoute menu="Paramètres" action="read" showDetailedError>
      <AppLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Paramètres</h1>
            <p className="text-muted-foreground mt-2">
              Configurez et gérez les paramètres de votre application
            </p>
          </div>

          <Tabs value="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {settingsCards.map(renderSettingsCard)}
              </div>
            </TabsContent>
          </Tabs>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              <ConditionalRender menu="Paramètres" action="read" hide>
                <TabsTrigger value="zone-geo">Zones</TabsTrigger>
              </ConditionalRender>
              <ConditionalRender menu="Paramètres" submenu="Fournisseurs" action="read" hide>
                <TabsTrigger value="fournisseurs">Fournisseurs</TabsTrigger>
              </ConditionalRender>
              <ConditionalRender menu="Paramètres" action="read" hide>
                <TabsTrigger value="depots-stockage">Entrepôts</TabsTrigger>
              </ConditionalRender>
              <ConditionalRender menu="Paramètres" action="read" hide>
                <TabsTrigger value="depots-pdv">PDV</TabsTrigger>
              </ConditionalRender>
              <ConditionalRender menu="Clients" action="read" hide>
                <TabsTrigger value="clients">Clients</TabsTrigger>
              </ConditionalRender>
              <ConditionalRender menu="Paramètres" submenu="Utilisateurs" action="read" hide>
                <TabsTrigger value="utilisateurs-internes">Utilisateurs</TabsTrigger>
              </ConditionalRender>
              <ConditionalRender menu="Paramètres" submenu="Permissions" action="read" hide>
                <TabsTrigger value="acces-permissions">Permissions</TabsTrigger>
              </ConditionalRender>
            </TabsList>

            <StrictProtectedRoute menu="Paramètres" action="read">
              <TabsContent value="zone-geo">
                <ZoneGeographique />
              </TabsContent>
            </StrictProtectedRoute>

            <StrictProtectedRoute menu="Paramètres" submenu="Fournisseurs" action="read">
              <TabsContent value="fournisseurs">
                <Fournisseurs />
              </TabsContent>
            </StrictProtectedRoute>

            <StrictProtectedRoute menu="Paramètres" action="read">
              <TabsContent value="depots-stockage">
                <DepotsStockage />
              </TabsContent>
            </StrictProtectedRoute>

            <StrictProtectedRoute menu="Paramètres" action="read">
              <TabsContent value="depots-pdv">
                <DepotsPDV />
              </TabsContent>
            </StrictProtectedRoute>

            <StrictProtectedRoute menu="Clients" action="read">
              <TabsContent value="clients">
                <ClientsSettings />
              </TabsContent>
            </StrictProtectedRoute>

            <StrictProtectedRoute menu="Paramètres" submenu="Utilisateurs" action="read">
              <TabsContent value="utilisateurs-internes">
                <UtilisateursInternes />
              </TabsContent>
            </StrictProtectedRoute>

            <StrictProtectedRoute menu="Paramètres" submenu="Permissions" action="read">
              <TabsContent value="acces-permissions">
                <AccesPermissions />
              </TabsContent>
            </StrictProtectedRoute>
          </Tabs>
        </div>
      </AppLayout>
    </StrictProtectedRoute>
  );
};

export default Settings;

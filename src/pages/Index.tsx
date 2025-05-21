
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const statCards = [
  { title: "Ventes du jour", value: "0.00€", description: "0 transactions" },
  { title: "Achats en attente", value: "3", description: "Total: 850.50€" },
  { title: "Factures impayées", value: "5", description: "Total: 1,250.00€" },
  { title: "Alertes de stock", value: "2", description: "Articles sous seuil" },
];

const recentActivity = [
  { id: 1, type: "Vente", description: "Facture #F2023-056", amount: "125.50€", date: "14/05/2023", status: "completed" },
  { id: 2, type: "Achat", description: "Bon de commande #BC2023-023", amount: "450.00€", date: "13/05/2023", status: "pending" },
  { id: 3, type: "Caisse", description: "Dépôt initial", amount: "200.00€", date: "13/05/2023", status: "completed" },
];

const quickLinks = [
  { title: "Nouvelle vente", path: "/sales/new" },
  { title: "Nouvel achat", path: "/purchases/new" },
  { title: "Ouvrir caisse", path: "/cash-registers/open" },
  { title: "Voir inventaire", path: "/stocks" },
];

const Index = () => {
  return (
    <AppLayout title="Dashboard">
      <div className="grid gap-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <Card key={i} className="animate-fade-in card-hover-effect" style={{ animationDelay: `${i * 0.1}s` }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{card.value}</p>
                <CardDescription>{card.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="animate-fade-in lg:col-span-2" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>Transactions des dernières 24 heures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-2 border-b">
                    <div>
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-muted-foreground">{activity.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{activity.amount}</p>
                      <span className={`status-badge ${activity.status}`}>
                        {activity.status === 'completed' ? 'Terminé' : 'En attente'}
                      </span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2">Voir toutes les transactions</Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Links */}
          <Card className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>Accès direct aux opérations courantes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickLinks.map((link, i) => (
                <Button key={i} variant="outline" className="w-full justify-between" asChild>
                  <Link to={link.path}>
                    {link.title}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;

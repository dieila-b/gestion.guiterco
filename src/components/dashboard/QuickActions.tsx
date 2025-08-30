
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart, Package, FileText, Users } from 'lucide-react';

const QuickActions = () => {
  const actions = [
    {
      title: "Nouvelle vente",
      description: "Créer une nouvelle facture de vente",
      icon: <ShoppingCart className="h-5 w-5" />,
      action: () => console.log("Nouvelle vente")
    },
    {
      title: "Ajouter produit",
      description: "Ajouter un nouveau produit au catalogue",
      icon: <Plus className="h-5 w-5" />,
      action: () => console.log("Ajouter produit")
    },
    {
      title: "Gérer stock",
      description: "Mise à jour des quantités en stock",
      icon: <Package className="h-5 w-5" />,
      action: () => console.log("Gérer stock")
    },
    {
      title: "Rapport de vente",
      description: "Générer un rapport de vente",
      icon: <FileText className="h-5 w-5" />,
      action: () => console.log("Rapport de vente")
    },
    {
      title: "Nouveau client",
      description: "Ajouter un nouveau client",
      icon: <Users className="h-5 w-5" />,
      action: () => console.log("Nouveau client")
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions rapides</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 justify-start"
              onClick={action.action}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {action.icon}
                </div>
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;

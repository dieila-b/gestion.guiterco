
import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Users, ShoppingCart, Package } from 'lucide-react';

const DashboardHome = () => {
  const stats = [
    {
      title: 'Ventes aujourd\'hui',
      value: '0 GNF',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Clients',
      value: '0',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Commandes',
      value: '0',
      icon: ShoppingCart,
      color: 'text-orange-600'
    },
    {
      title: 'Produits',
      value: '0',
      icon: Package,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
          <div className="space-y-3">
            <p className="text-gray-500">Aucune activité récente pour le moment.</p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="space-y-3">
            <p className="text-gray-500">Les modules seront bientôt disponibles.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;

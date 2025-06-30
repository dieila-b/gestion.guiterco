
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Target, TrendingUp, BarChart } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import type { RapportMargePeriode } from '@/types/margins';

interface GlobalMarginStatsCardsProps {
  rapport: RapportMargePeriode;
  isLoading: boolean;
}

const GlobalMarginStatsCards = ({ rapport, isLoading }: GlobalMarginStatsCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium bg-gray-200 h-4 w-20 rounded"></CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gray-200 h-8 w-24 rounded mb-2"></div>
              <div className="text-xs text-muted-foreground bg-gray-200 h-3 w-16 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Chiffre d'affaires",
      value: formatCurrency(rapport.total_ventes || 0),
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: `${rapport.nombre_factures || 0} factures`
    },
    {
      title: "Coûts totaux",
      value: formatCurrency(rapport.total_couts || 0),
      icon: Target,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "Coûts d'achat"
    },
    {
      title: "Bénéfice",
      value: formatCurrency(rapport.benefice_total || 0),
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "CA - Coûts"
    },
    {
      title: "Taux de marge",
      value: `${rapport.taux_marge_moyen || 0}%`,
      icon: BarChart,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Marge globale"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default GlobalMarginStatsCards;

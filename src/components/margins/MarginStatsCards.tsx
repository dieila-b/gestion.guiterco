
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Target, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import type { RapportMargePeriode } from '@/types/margins';

interface MarginStatsCardsProps {
  rapport: RapportMargePeriode;
  isLoading: boolean;
}

const MarginStatsCards = ({ rapport, isLoading }: MarginStatsCardsProps) => {
  const stats = [
    {
      title: "Chiffre d'Affaires",
      value: rapport.total_ventes,
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      format: (value: number) => formatCurrency(value)
    },
    {
      title: "Coûts Totaux",
      value: rapport.total_couts,
      icon: Target,
      color: "text-red-600",
      bgColor: "bg-red-50",
      format: (value: number) => formatCurrency(value)
    },
    {
      title: "Bénéfice Total",
      value: rapport.benefice_total,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      format: (value: number) => formatCurrency(value)
    },
    {
      title: "Taux de Marge Moyen",
      value: rapport.taux_marge_moyen,
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      format: (value: number) => `${value.toFixed(2)}%`
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stat.format(stat.value)}
            </p>
            {stat.title === "Taux de Marge Moyen" && (
              <p className={`text-sm ${stat.value >= 20 ? 'text-green-600' : stat.value >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                {stat.value >= 20 ? 'Excellente marge' : stat.value >= 10 ? 'Marge correcte' : 'Marge faible'}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MarginStatsCards;

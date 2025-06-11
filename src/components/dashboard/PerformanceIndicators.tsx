
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Archive, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

const PerformanceIndicators = () => {
  const { data: stats, isLoading, error } = useDashboardStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  if (error) {
    console.error('Error loading dashboard stats:', error);
    return (
      <div className="text-center text-red-500 p-4">
        Erreur lors du chargement des indicateurs
      </div>
    );
  }

  const indicators = [
    {
      title: "Articles en Catalogue",
      value: stats?.totalCatalogue || 0,
      icon: Package,
      color: "from-blue-500 to-blue-600",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      format: (value: number) => formatNumber(value)
    },
    {
      title: "Stock Global",
      value: stats?.stockGlobal || 0,
      icon: Archive,
      color: "from-purple-500 to-purple-600",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
      format: (value: number) => formatNumber(value)
    },
    {
      title: "Valeur Stock (Achat)",
      value: stats?.valeurStockAchat || 0,
      icon: TrendingDown,
      color: "from-orange-500 to-orange-600",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
      format: (value: number) => formatCurrency(value)
    },
    {
      title: "Valeur Stock (Vente)",
      value: stats?.valeurStockVente || 0,
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
      format: (value: number) => formatCurrency(value)
    },
    {
      title: "Marge Globale Stock",
      value: stats?.margeGlobaleStock || 0,
      percentage: stats?.margePourcentage || 0,
      icon: BarChart3,
      color: "from-indigo-500 to-indigo-600",
      textColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
      format: (value: number) => formatCurrency(value)
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {indicators.map((indicator, index) => (
        <Card key={indicator.title} className="relative overflow-hidden border-0 shadow-lg animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
          <div className={`absolute inset-0 bg-gradient-to-br ${indicator.color} opacity-5`} />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {indicator.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${indicator.bgColor}`}>
                <indicator.icon className={`h-4 w-4 ${indicator.textColor}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                {indicator.percentage !== undefined && (
                  <Skeleton className="h-4 w-16" />
                )}
              </div>
            ) : (
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {indicator.format(indicator.value)}
                </p>
                {indicator.percentage !== undefined && (
                  <p className={`text-sm ${indicator.percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {indicator.percentage >= 0 ? '+' : ''}{indicator.percentage.toFixed(1)}%
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PerformanceIndicators;

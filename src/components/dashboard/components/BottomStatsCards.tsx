
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import type { AdvancedDashboardStats } from '@/hooks/useAdvancedDashboardStats';

interface BottomStatsCardsProps {
  stats: AdvancedDashboardStats | undefined;
  isLoading: boolean;
}

const BottomStatsCards: React.FC<BottomStatsCardsProps> = ({ stats, isLoading }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Stock Global Achat */}
      <Card className="bg-white border shadow-sm">
        <CardContent className="p-4 flex items-center space-x-3">
          <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center">
            <Star className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Stock Global Achat</div>
            <div className="text-lg font-bold">
              {isLoading ? <Skeleton className="h-6 w-24" /> : formatCurrency(stats?.stockGlobalAchat || 0)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock global vente */}
      <Card className="bg-white border shadow-sm">
        <CardContent className="p-4 flex items-center space-x-3">
          <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
            <Star className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Stock global vente</div>
            <div className="text-lg font-bold">
              {isLoading ? <Skeleton className="h-6 w-24" /> : formatCurrency(stats?.stockGlobalVente || 0)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marge globale en stock */}
      <Card className="bg-white border shadow-sm">
        <CardContent className="p-4 flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
            <Star className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Marge globale en stock</div>
            <div className="text-lg font-bold">
              {isLoading ? <Skeleton className="h-6 w-24" /> : formatCurrency(stats?.margeGlobaleStock || 0)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BottomStatsCards;


import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, CreditCard, Package, Star } from 'lucide-react';
import { formatNumber } from '../utils/formatters';
import type { AdvancedDashboardStats } from '@/hooks/useAdvancedDashboardStats';

interface IconStatsCardsProps {
  stats: AdvancedDashboardStats | undefined;
  isLoading: boolean;
}

const IconStatsCards: React.FC<IconStatsCardsProps> = ({ stats, isLoading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Nombre d'articles */}
      <Card className="bg-white border shadow-sm">
        <CardContent className="p-4 flex items-center space-x-3">
          <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Nombre d'article</div>
            <div className="text-xl font-bold">
              {isLoading ? <Skeleton className="h-6 w-16" /> : formatNumber(stats?.nombreArticles || 0)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Règlement fournisseur */}
      <Card className="bg-white border shadow-sm">
        <CardContent className="p-4 flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Règlement fournisseur</div>
            <div className="text-xl font-bold">
              {isLoading ? <Skeleton className="h-6 w-16" /> : formatNumber(stats?.reglementsFournisseurs || 0)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nombre de client */}
      <Card className="bg-white border shadow-sm">
        <CardContent className="p-4 flex items-center space-x-3">
          <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Nombre de client</div>
            <div className="text-xl font-bold">
              {isLoading ? <Skeleton className="h-6 w-16" /> : formatNumber(stats?.nombreClients || 0)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Global */}
      <Card className="bg-white border shadow-sm">
        <CardContent className="p-4 flex items-center space-x-3">
          <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
            <Star className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Stock Global</div>
            <div className="text-xl font-bold">
              {isLoading ? <Skeleton className="h-6 w-16" /> : formatNumber(stats?.stockGlobal || 0)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IconStatsCards;

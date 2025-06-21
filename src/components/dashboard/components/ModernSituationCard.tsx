
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import type { AdvancedDashboardStats } from '@/hooks/useAdvancedDashboardStats';

interface ModernSituationCardProps {
  stats: AdvancedDashboardStats | undefined;
  isLoading: boolean;
}

const ModernSituationCard: React.FC<ModernSituationCardProps> = ({ stats, isLoading }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Situation actuelle</h2>
      <Card className="bg-white border border-gray-100 shadow-sm">
        <CardContent className="p-8">
          <div className="flex items-start space-x-6">
            <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Star className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">Solde Avoir :</span>
                <span className="font-bold text-xl text-green-600">
                  {isLoading ? <Skeleton className="h-6 w-32" /> : formatCurrency(stats?.soldeAvoir || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">Solde Devoir :</span>
                <span className="font-bold text-xl text-gray-800">
                  {isLoading ? <Skeleton className="h-6 w-32" /> : formatCurrency(stats?.soldeDevoir || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 pt-4 border-t border-gray-200">
                <span className="text-gray-600 font-medium">Situation normale :</span>
                <span className="font-bold text-xl text-gray-800">
                  {isLoading ? <Skeleton className="h-6 w-32" /> : formatCurrency(stats?.situationNormale || 0)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernSituationCard;

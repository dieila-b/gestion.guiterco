
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import type { AdvancedDashboardStats } from '@/hooks/useAdvancedDashboardStats';

interface SituationCardProps {
  stats: AdvancedDashboardStats | undefined;
  isLoading: boolean;
}

const SituationCard: React.FC<SituationCardProps> = ({ stats, isLoading }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Situation actuelle</h2>
      <Card className="bg-white border shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center">
              <Star className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Solde Avoir :</span>
                <span className="font-bold text-lg">
                  {isLoading ? <Skeleton className="h-6 w-32" /> : formatCurrency(stats?.soldeAvoir || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Solde Devoir :</span>
                <span className="font-bold text-lg">
                  {isLoading ? <Skeleton className="h-6 w-32" /> : formatCurrency(stats?.soldeDevoir || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-gray-600">Situation normale :</span>
                <span className="font-bold text-xl text-green-600">
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

export default SituationCard;

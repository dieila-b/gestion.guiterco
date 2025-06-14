
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  totalVentes: number;
  montantEncaisse: number;
  resteAPayer: number;
  formatCurrency: (n: number) => string;
}

const StatsCards: React.FC<StatsCardsProps> = ({ totalVentes, montantEncaisse, resteAPayer, formatCurrency }) => (
  <div className="flex flex-col md:flex-row gap-4 mb-6">
    <Card className="flex-1 min-w-[160px] bg-white shadow border border-zinc-100">
      <CardContent className="p-5">
        <div className="text-xs text-zinc-500 mb-2">Total des ventes</div>
        <div className="text-2xl font-bold">{formatCurrency(totalVentes)}</div>
      </CardContent>
    </Card>
    <Card className="flex-1 min-w-[160px] bg-white shadow border border-zinc-100">
      <CardContent className="p-5">
        <div className="text-xs text-zinc-500 mb-2">Montant encaissé</div>
        <div className="text-2xl font-bold text-green-600">{formatCurrency(montantEncaisse)}</div>
      </CardContent>
    </Card>
    <Card className="flex-1 min-w-[160px] bg-white shadow border border-zinc-100">
      <CardContent className="p-5">
        <div className="text-xs text-zinc-500 mb-2">Reste à payer</div>
        <div className="text-2xl font-bold text-orange-500">{formatCurrency(resteAPayer)}</div>
      </CardContent>
    </Card>
  </div>
);

export default StatsCards;

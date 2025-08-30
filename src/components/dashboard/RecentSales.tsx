
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar';

const RecentSales = () => {
  const recentSales = [
    {
      customer: "Marie Dupont",
      email: "marie.dupont@email.com",
      amount: "+125,50 €",
      initials: "MD"
    },
    {
      customer: "Pierre Martin",
      email: "pierre.martin@email.com",
      amount: "+89,90 €",
      initials: "PM"
    },
    {
      customer: "Sophie Bernard",
      email: "sophie.bernard@email.com",
      amount: "+234,00 €",
      initials: "SB"
    },
    {
      customer: "Lucas Petit",
      email: "lucas.petit@email.com",
      amount: "+67,20 €",
      initials: "LP"
    },
    {
      customer: "Camille Moreau",
      email: "camille.moreau@email.com",
      amount: "+156,80 €",
      initials: "CM"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventes récentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentSales.map((sale, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{sale.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">{sale.customer}</p>
                  <p className="text-sm text-muted-foreground">{sale.email}</p>
                </div>
              </div>
              <div className="font-medium text-green-600">{sale.amount}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentSales;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package } from 'lucide-react';

const StockAlerts = () => {
  const stockAlerts = [
    {
      product: "iPhone 15 Pro Max",
      stock: 2,
      level: "critique",
      location: "Entrepôt A"
    },
    {
      product: "Samsung Galaxy S24",
      stock: 5,
      level: "bas",
      location: "PDV Centre"
    },
    {
      product: "iPad Air M2",
      stock: 1,
      level: "critique",
      location: "Entrepôt B"
    },
    {
      product: "AirPods Pro 2",
      stock: 8,
      level: "bas",
      location: "PDV Nord"
    }
  ];

  const getBadgeVariant = (level: string) => {
    return level === "critique" ? "destructive" : "secondary";
  };

  const getIcon = (level: string) => {
    return level === "critique" ? 
      <AlertTriangle className="h-4 w-4" /> : 
      <Package className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Alertes stock
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stockAlerts.map((alert, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getIcon(alert.level)}
                <div>
                  <p className="text-sm font-medium">{alert.product}</p>
                  <p className="text-xs text-muted-foreground">{alert.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{alert.stock}</span>
                <Badge variant={getBadgeVariant(alert.level)}>
                  {alert.level}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StockAlerts;

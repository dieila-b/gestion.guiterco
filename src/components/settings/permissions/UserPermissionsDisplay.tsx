
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface UserPermissionsDisplayProps {
  userId: string;
  userName: string;
  userRole: string;
}

const UserPermissionsDisplay = ({ userId, userName, userRole }: UserPermissionsDisplayProps) => {
  // Mock data - remplacez par de vraies données depuis votre base
  const permissions = [
    {
      menu: 'Dashboard',
      submenu: null,
      actions: [
        { action: 'read', granted: true }
      ]
    },
    {
      menu: 'Ventes',
      submenu: 'Factures',
      actions: [
        { action: 'read', granted: true },
        { action: 'write', granted: true }
      ]
    },
    {
      menu: 'Stock',
      submenu: 'Entrepôts',
      actions: [
        { action: 'read', granted: true },
        { action: 'write', granted: false }
      ]
    },
    {
      menu: 'Paramètres',
      submenu: 'Utilisateurs',
      actions: [
        { action: 'read', granted: true },
        { action: 'write', granted: true },
        { action: 'delete', granted: true }
      ]
    }
  ];

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'read':
        return <Eye className="h-3 w-3" />;
      case 'write':
        return <Edit className="h-3 w-3" />;
      case 'delete':
        return <Trash2 className="h-3 w-3" />;
      default:
        return <Shield className="h-3 w-3" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'read':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'write':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'delete':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Permissions de {userName}</span>
          </CardTitle>
          <CardDescription>
            Rôle : <Badge variant="outline">{userRole}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {permissions.map((permission, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">
                    {permission.menu}
                    {permission.submenu && (
                      <span className="text-muted-foreground ml-2">
                        → {permission.submenu}
                      </span>
                    )}
                  </h4>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {permission.actions.map((actionItem, actionIndex) => (
                    <div
                      key={actionIndex}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                        actionItem.granted 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <Badge 
                        variant="outline" 
                        className={`${getActionColor(actionItem.action)} text-xs`}
                      >
                        <div className="flex items-center space-x-1">
                          {getActionIcon(actionItem.action)}
                          <span className="capitalize">{actionItem.action}</span>
                        </div>
                      </Badge>
                      
                      {actionItem.granted ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPermissionsDisplay;

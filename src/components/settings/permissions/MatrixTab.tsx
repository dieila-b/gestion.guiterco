
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Grid3x3, Save, RefreshCw } from 'lucide-react';
import { useRoles } from '@/hooks/usePermissions';

// Même structure que dans PermissionsTab pour la cohérence
const MATRIX_STRUCTURE = [
  { menu: 'Dashboard', submenu: null, actions: ['read'] },
  { menu: 'Ventes', submenu: 'Vente au Comptoir', actions: ['read', 'write'] },
  { menu: 'Ventes', submenu: 'Factures', actions: ['read', 'write'] },
  { menu: 'Ventes', submenu: 'Précommandes', actions: ['read', 'write'] },
  { menu: 'Ventes', submenu: 'Devis', actions: ['read', 'write'] },
  { menu: 'Ventes', submenu: 'Factures impayées', actions: ['read', 'write'] },
  { menu: 'Ventes', submenu: 'Retours Clients', actions: ['read', 'write'] },
  { menu: 'Stock', submenu: 'Entrepôts', actions: ['read', 'write'] },
  { menu: 'Stock', submenu: 'PDV', actions: ['read', 'write'] },
  { menu: 'Stock', submenu: 'Transferts', actions: ['read', 'write'] },
  { menu: 'Stock', submenu: 'Entrées', actions: ['read', 'write'] },
  { menu: 'Stock', submenu: 'Sorties', actions: ['read', 'write'] },
  { menu: 'Achats', submenu: 'Bons de commande', actions: ['read', 'write'] },
  { menu: 'Achats', submenu: 'Bons de livraison', actions: ['read', 'write'] },
  { menu: 'Achats', submenu: 'Factures', actions: ['read', 'write'] },
  { menu: 'Clients', submenu: null, actions: ['read', 'write', 'delete'] },
  { menu: 'Caisse', submenu: null, actions: ['read', 'write'] },
  { menu: 'Caisse', submenu: 'Dépenses', actions: ['read', 'write'] },
  { menu: 'Caisse', submenu: 'Aperçu du jour', actions: ['read'] },
  { menu: 'Marges', submenu: null, actions: ['read'] },
  { menu: 'Rapports', submenu: null, actions: ['read', 'write'] },
  { menu: 'Paramètres', submenu: 'Zone Géographique', actions: ['read', 'write'] },
  { menu: 'Paramètres', submenu: 'Fournisseurs', actions: ['read', 'write'] },
  { menu: 'Paramètres', submenu: 'Dépôts Stock', actions: ['read', 'write'] },
  { menu: 'Paramètres', submenu: 'Dépôts PDV', actions: ['read', 'write'] },
  { menu: 'Paramètres', submenu: 'Utilisateurs', actions: ['read', 'write'] },
  { menu: 'Paramètres', submenu: 'Permissions', actions: ['read', 'write'] }
];

export default function MatrixTab() {
  const { data: roles = [], isLoading } = useRoles();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Créer une structure plate pour la matrice
  const matrixItems = MATRIX_STRUCTURE.flatMap(item => 
    item.actions.map(action => ({
      key: `${item.menu}-${item.submenu || 'null'}-${action}`,
      menu: item.menu,
      submenu: item.submenu,
      action: action,
      label: item.submenu ? `${item.submenu} (${action})` : `${item.menu} (${action})`
    }))
  );

  const handlePermissionChange = (key: string, checked: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [key]: checked
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    
    try {
      // TODO: Implémenter la sauvegarde en base
      console.log('Saving permissions for role:', selectedRole, permissions);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving permissions:', error);
    }
  };

  const handleReset = () => {
    setPermissions({});
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Grid3x3 className="w-5 h-5" />
              Matrice des Permissions
            </CardTitle>
            <div className="flex gap-2">
              {hasChanges && (
                <>
                  <Button variant="outline" onClick={handleReset}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Réinitialiser
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sélection du rôle */}
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm font-medium">Sélectionner un rôle:</span>
              {roles.map(role => (
                <Badge
                  key={role.id}
                  variant={selectedRole === role.id ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => {
                    setSelectedRole(role.id);
                    setHasChanges(false);
                  }}
                >
                  {role.name}
                </Badge>
              ))}
            </div>

            {selectedRole && (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">Menu / Sous-menu</TableHead>
                      <TableHead className="w-1/6">Action</TableHead>
                      <TableHead className="w-1/6 text-center">Lecture</TableHead>
                      <TableHead className="w-1/6 text-center">Écriture</TableHead>
                      <TableHead className="w-1/6 text-center">Suppression</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MATRIX_STRUCTURE.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.menu}
                          {item.submenu && (
                            <div className="text-sm text-muted-foreground ml-4">
                              └─ {item.submenu}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {item.actions.map(action => (
                              <Badge key={action} variant="outline" className="text-xs">
                                {action}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.actions.includes('read') && (
                            <Checkbox
                              checked={permissions[`${item.menu}-${item.submenu || 'null'}-read`] || false}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(`${item.menu}-${item.submenu || 'null'}-read`, checked as boolean)
                              }
                            />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.actions.includes('write') && (
                            <Checkbox
                              checked={permissions[`${item.menu}-${item.submenu || 'null'}-write`] || false}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(`${item.menu}-${item.submenu || 'null'}-write`, checked as boolean)
                              }
                            />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.actions.includes('delete') && (
                            <Checkbox
                              checked={permissions[`${item.menu}-${item.submenu || 'null'}-delete`] || false}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(`${item.menu}-${item.submenu || 'null'}-delete`, checked as boolean)
                              }
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!selectedRole && (
              <div className="text-center text-muted-foreground py-8">
                <Grid3x3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Sélectionnez un rôle pour voir et modifier sa matrice de permissions</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

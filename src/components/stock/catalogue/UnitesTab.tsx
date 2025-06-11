
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { useUnites } from '@/hooks/useUnites';

const UnitesTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: unites, isLoading } = useUnites();

  const filteredUnites = unites?.filter(unite =>
    unite.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unite.symbole.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unite.type_unite.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Unités de Mesure</CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Unité
          </Button>
        </div>
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Rechercher une unité..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Symbole</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUnites?.map((unite) => (
                <TableRow key={unite.id}>
                  <TableCell className="font-medium">{unite.nom}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{unite.symbole}</Badge>
                  </TableCell>
                  <TableCell className="capitalize">{unite.type_unite}</TableCell>
                  <TableCell>
                    <Badge variant={unite.statut === 'actif' ? 'default' : 'secondary'}>
                      {unite.statut}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default UnitesTab;

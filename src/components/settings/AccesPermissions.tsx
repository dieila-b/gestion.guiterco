
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Grid3x3, Users, Shield, Settings } from 'lucide-react'
import PermissionsMatrix from './permissions/PermissionsMatrix'
import RolesManagement from './permissions/RolesManagement'

export default function AccesPermissions() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Accès et Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="matrix" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="matrix" className="flex items-center gap-2">
                <Grid3x3 className="w-4 h-4" />
                Matrice des Permissions
              </TabsTrigger>
              <TabsTrigger value="roles" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Gestion des Rôles
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="matrix" className="mt-6">
              <PermissionsMatrix />
            </TabsContent>
            
            <TabsContent value="roles" className="mt-6">
              <RolesManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

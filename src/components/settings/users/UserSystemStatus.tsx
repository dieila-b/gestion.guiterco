
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSecureUserOperations } from '@/hooks/useSecureUserOperations';
import { RefreshCw, CheckCircle, AlertCircle, XCircle, Shield } from 'lucide-react';

const UserSystemStatus = () => {
  const { systemDiagnostic, refreshSession } = useSecureUserOperations();

  const handleRunDiagnostic = async () => {
    try {
      const results = await systemDiagnostic.mutateAsync();
      console.log('📊 System diagnostic completed:', results);
    } catch (error) {
      console.error('❌ Diagnostic failed:', error);
    }
  };

  const handleRefreshSession = async () => {
    try {
      await refreshSession.mutateAsync();
    } catch (error) {
      console.error('❌ Session refresh failed:', error);
    }
  };

  const getStatusIcon = (statut: string) => {
    if (statut.includes('✅')) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (statut.includes('⚠️')) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    if (statut.includes('❌')) return <XCircle className="h-4 w-4 text-red-500" />;
    return <Shield className="h-4 w-4 text-blue-500" />;
  };

  const getStatusVariant = (statut: string) => {
    if (statut.includes('✅')) return 'default';
    if (statut.includes('⚠️')) return 'secondary';
    if (statut.includes('❌')) return 'destructive';
    return 'outline';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>État du système utilisateur</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefreshSession}
              disabled={refreshSession.isPending}
            >
              {refreshSession.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Session
            </Button>
            <Button
              size="sm"
              onClick={handleRunDiagnostic}
              disabled={systemDiagnostic.isPending}
            >
              {systemDiagnostic.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              Diagnostic
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {systemDiagnostic.data && systemDiagnostic.data.length > 0 ? (
          <div className="space-y-3">
            {systemDiagnostic.data.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(item.statut)}
                  <div>
                    <p className="font-medium">{item.composant}</p>
                    <p className="text-sm text-muted-foreground">{item.details}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusVariant(item.statut)}>
                    {item.statut}
                  </Badge>
                  {item.recommandation !== 'Aucune action' && (
                    <Badge variant="outline" className="text-xs">
                      {item.recommandation}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Cliquez sur "Diagnostic" pour vérifier l'état du système
            </p>
          </div>
        )}
        
        {refreshSession.data && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700">
                Session renouvelée avec succès - {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserSystemStatus;

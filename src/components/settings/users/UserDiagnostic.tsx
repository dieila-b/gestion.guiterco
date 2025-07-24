import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { checkUserSync, testDirectLogin, createTestUser } from './UserSyncUtils';
import { Loader2, TestTube2, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export function UserDiagnostic() {
  const [loading, setLoading] = useState(false);
  const [syncReport, setSyncReport] = useState<any>(null);
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('');
  const [testResults, setTestResults] = useState<any>(null);

  const handleSyncCheck = async () => {
    setLoading(true);
    try {
      const result = await checkUserSync();
      setSyncReport(result);
    } catch (error) {
      console.error('Erreur vérification sync:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async () => {
    if (!testEmail || !testPassword) return;
    
    setLoading(true);
    try {
      const result = await testDirectLogin(testEmail, testPassword);
      setTestResults(result);
    } catch (error) {
      console.error('Erreur test connexion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async () => {
    if (!testEmail || !testPassword) return;
    
    setLoading(true);
    try {
      const result = await createTestUser(testEmail, testPassword);
      setTestResults(result);
    } catch (error) {
      console.error('Erreur création test:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Diagnostic de Synchronisation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={handleSyncCheck}
              disabled={loading}
              variant="outline"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserCheck className="h-4 w-4 mr-2" />
              )}
              Vérifier la Synchronisation
            </Button>
          </div>

          {syncReport && (
            <Alert className={syncReport.success ? "border-green-200" : "border-red-200"}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">
                    {syncReport.success ? "✅ Vérification terminée" : "❌ Erreur de vérification"}
                  </div>
                  {syncReport.report && (
                    <div className="space-y-1 text-sm">
                      <div>Utilisateurs internes: <Badge variant="secondary">{syncReport.report.internalUsersCount}</Badge></div>
                      <div>Vérifications Auth: <Badge variant="secondary">{syncReport.report.authUsersVerified}</Badge></div>
                      {syncReport.report.orphanedInternal.length > 0 && (
                        <div>Comptes orphelins: <Badge variant="destructive">{syncReport.report.orphanedInternal.length}</Badge></div>
                      )}
                    </div>
                  )}
                  {syncReport.error && (
                    <div className="text-red-600 text-sm">{syncReport.error}</div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube2 className="h-5 w-5" />
            Test de Connexion Direct
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Email de test</label>
              <Input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Mot de passe</label>
              <Input
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleTestLogin}
              disabled={loading || !testEmail || !testPassword}
              variant="outline"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <TestTube2 className="h-4 w-4 mr-2" />
              )}
              Tester Connexion
            </Button>
            
            <Button 
              onClick={handleCreateTest}
              disabled={loading || !testEmail || !testPassword}
              variant="outline"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <TestTube2 className="h-4 w-4 mr-2" />
              )}
              Créer Utilisateur Test
            </Button>
          </div>

          {testResults && (
            <Alert className={testResults.success ? "border-green-200" : "border-red-200"}>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">
                    {testResults.success ? "✅ Test réussi" : "❌ Test échoué"}
                  </div>
                  {testResults.user && (
                    <div className="space-y-1 text-sm">
                      <div>ID: <code className="text-xs">{testResults.user.id}</code></div>
                      <div>Email: <code className="text-xs">{testResults.user.email}</code></div>
                      <div>Confirmé: <Badge variant={testResults.user.email_confirmed_at ? "default" : "destructive"}>
                        {testResults.user.email_confirmed_at ? "Oui" : "Non"}
                      </Badge></div>
                    </div>
                  )}
                  {testResults.error && (
                    <div className="text-red-600 text-sm">
                      <div>Erreur: {testResults.error}</div>
                      {testResults.details && (
                        <div className="mt-1">
                          <div>Status: {testResults.details.status}</div>
                          <div>Type: {testResults.details.name}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <div className="font-medium">Instructions de Diagnostic</div>
            <div className="text-sm space-y-1">
              <div>1. Cliquez sur "Vérifier la Synchronisation" pour analyser les comptes</div>
              <div>2. Utilisez "Test de Connexion Direct" avec les identifiants d'un utilisateur créé</div>
              <div>3. Si nécessaire, créez un utilisateur de test pour valider le processus</div>
              <div>4. Consultez la console développeur (F12) pour plus de détails</div>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
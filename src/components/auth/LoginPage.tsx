import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, Mail } from 'lucide-react';
import { useAuth } from './AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user, isInternalUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Rediriger si l'utilisateur est déjà connecté et autorisé
  useEffect(() => {
    if (!authLoading && user && isInternalUser) {
      console.log('✅ Utilisateur déjà connecté et autorisé, redirection...');
      navigate('/');
    }
  }, [user, isInternalUser, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔑 Tentative de connexion depuis LoginPage pour:', email);
      const { error } = await signIn(email, password);

      if (error) {
        console.log('❌ Erreur de connexion:', error.message);
        
        if (error.message.includes('Invalid login credentials')) {
          setError('Email ou mot de passe incorrect');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Votre compte doit être confirmé par email avant la première connexion');
        } else if (error.message.includes('User not found')) {
          setError('Aucun compte trouvé avec cet email');
        } else {
          setError('Erreur de connexion. Veuillez réessayer.');
        }
      } else {
        console.log('✅ Connexion réussie depuis LoginPage');
        // La redirection se fera automatiquement via useEffect
      }
    } catch (err) {
      console.error('❌ Erreur inattendue lors de la connexion:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Afficher un loader pendant que l'authentification se charge
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* --- Zone du logo et du titre --- */}
        <div className="text-center">
          <img
            src="/logo_GIC.png"
            alt="GIC"
            className="mx-auto h-20 w-auto mb-4"
          />
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Gestion GuIterCo</h1>
          <p className="mt-2 text-sm text-gray-600">
            Portail interne — Accès réservé aux utilisateurs autorisés
          </p>
        </div>

        {/* --- Formulaire de connexion --- */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Connexion</CardTitle>
            <CardDescription className="text-center">
              Connectez-vous avec votre compte autorisé
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@entreprise.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Mot de passe
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="bg-blue-50 rounded-md p-3">
                <p className="text-xs text-blue-700">
                  <strong>Accès restreint :</strong> Seuls les utilisateurs internes autorisés peuvent se connecter. 
                  Contactez votre administrateur si vous rencontrez des difficultés.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;

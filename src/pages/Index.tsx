
import React from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UserMenu from '@/components/layout/UserMenu';

const Index = () => {
  const { utilisateurInterne, isInternalUser } = useAuth();

  console.log('🏠 Index - État utilisateur:', {
    utilisateurInterne: !!utilisateurInterne,
    isInternalUser,
    hostname: window.location.hostname
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                GestCompta
              </h1>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Tableau de bord
          </h2>
          <p className="text-gray-600">
            Bienvenue dans l'application de gestion comptable
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>État de l'authentification</CardTitle>
              <CardDescription>
                Informations sur l'utilisateur connecté
              </CardDescription>
            </CardHeader>
            <CardContent>
              {utilisateurInterne ? (
                <div className="space-y-2">
                  <p><strong>Nom :</strong> {utilisateurInterne.prenom} {utilisateurInterne.nom}</p>
                  <p><strong>Email :</strong> {utilisateurInterne.email}</p>
                  <p><strong>Rôle :</strong> {utilisateurInterne.role.nom}</p>
                  <p><strong>Statut :</strong> 
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      {utilisateurInterne.statut}
                    </span>
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Aucun utilisateur connecté</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Informations sur l'environnement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Environnement :</strong> {import.meta.env.DEV ? 'Développement' : 'Production'}</p>
                <p><strong>Domaine :</strong> {window.location.hostname}</p>
                <p><strong>Utilisateur autorisé :</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    isInternalUser ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isInternalUser ? 'Oui' : 'Non'}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>
                Fonctionnalités principales de l'application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  L'application est maintenant opérationnelle !
                </p>
                <p className="text-sm text-green-600">
                  ✅ Authentification configurée
                </p>
                <p className="text-sm text-green-600">
                  ✅ Cookies de domaine corrigés
                </p>
                <p className="text-sm text-green-600">
                  ✅ Composants React chargés
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;

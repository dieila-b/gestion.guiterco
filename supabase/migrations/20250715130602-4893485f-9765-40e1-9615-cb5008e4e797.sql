
-- Créer la table user_roles pour lier les utilisateurs aux rôles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, role_id)
);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON public.user_roles(is_active);

-- Ajouter des politiques RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Politique pour que tous les utilisateurs authentifiés puissent voir les rôles
CREATE POLICY "Tous peuvent voir les rôles utilisateurs" 
  ON public.user_roles 
  FOR SELECT 
  USING (true);

-- Politique pour que seuls les administrateurs puissent modifier les rôles
CREATE POLICY "Seuls les admins peuvent modifier les rôles utilisateurs" 
  ON public.user_roles 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 
      FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
      AND r.name = 'Administrateur'
      AND ur.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
      AND r.name = 'Administrateur'
      AND ur.is_active = true
    )
  );

-- Trigger pour mettre à jour updated_at si nécessaire
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

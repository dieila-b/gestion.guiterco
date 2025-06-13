
-- Vérifier la structure de la table clients
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'clients' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Vérifier les contraintes et clés étrangères
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND (tc.table_name = 'clients' OR ccu.table_name = 'clients');

-- Vérifier les politiques RLS sur la table clients
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'clients';

-- Si la table clients n'existe pas ou a des problèmes, la créer/corriger
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nom TEXT NOT NULL,
    nom_entreprise TEXT,
    statut_client TEXT CHECK (statut_client IN ('particulier', 'entreprise')) DEFAULT 'particulier',
    type_client TEXT CHECK (type_client IN ('occasionnel', 'regulier', 'vip')) DEFAULT 'occasionnel',
    email TEXT,
    telephone TEXT,
    whatsapp TEXT,
    adresse TEXT,
    ville TEXT,
    limite_credit DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS si ce n'est pas déjà fait
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Clients are publicly readable" ON public.clients;
DROP POLICY IF EXISTS "Clients are publicly writable" ON public.clients;

-- Créer des politiques RLS permissives pour permettre la lecture et l'écriture
CREATE POLICY "Clients are publicly readable" 
ON public.clients FOR SELECT 
USING (true);

CREATE POLICY "Clients are publicly writable" 
ON public.clients FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Clients are publicly updatable" 
ON public.clients FOR UPDATE 
USING (true);

CREATE POLICY "Clients are publicly deletable" 
ON public.clients FOR DELETE 
USING (true);

-- Créer un trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON public.clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

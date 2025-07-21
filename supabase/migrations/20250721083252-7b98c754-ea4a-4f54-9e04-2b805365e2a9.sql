
-- Add missing columns to utilisateurs_internes table
ALTER TABLE public.utilisateurs_internes 
ADD COLUMN poste character varying,
ADD COLUMN date_embauche timestamp with time zone;

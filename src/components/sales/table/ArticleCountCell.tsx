
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { FactureVente } from '@/types/sales';

interface ArticleCountCellProps {
  facture: FactureVente;
}

const ArticleCountCell = ({ facture }: ArticleCountCellProps) => {
  const [articleCount, setArticleCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getArticleCount = async () => {
      // Priorité 1: utiliser nb_articles si disponible et valide
      if (typeof facture.nb_articles === 'number' && facture.nb_articles > 0) {
        console.log('📦 Utilisation nb_articles:', facture.nb_articles);
        setArticleCount(facture.nb_articles);
        return;
      }
      
      // Priorité 2: compter les lignes_facture si disponibles
      if (facture.lignes_facture && Array.isArray(facture.lignes_facture) && facture.lignes_facture.length > 0) {
        const count = facture.lignes_facture.length;
        console.log('📦 Utilisation lignes_facture.length:', count);
        setArticleCount(count);
        return;
      }
      
      // Priorité 3: requête directe à la base de données
      console.log('📦 Requête directe pour facture:', facture.numero_facture);
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('lignes_facture_vente')
          .select('id')
          .eq('facture_vente_id', facture.id);
        
        if (error) {
          console.error('❌ Erreur lors de la récupération du nombre d\'articles:', error);
          setArticleCount(0);
        } else {
          const count = data?.length || 0;
          console.log('📦 Nombre d\'articles récupéré en direct:', count);
          setArticleCount(count);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la récupération du nombre d\'articles:', error);
        setArticleCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    getArticleCount();
  }, [facture.id, facture.nb_articles, facture.lignes_facture]);

  if (isLoading) {
    return <span className="text-gray-400">...</span>;
  }

  return (
    <span className="font-medium text-lg text-blue-600">
      {articleCount}
    </span>
  );
};

export default ArticleCountCell;


import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MenuStructure {
  menu_id: string;
  menu_nom: string;
  menu_icone: string;
  menu_ordre: number;
  sous_menu_id?: string;
  sous_menu_nom?: string;
  sous_menu_description?: string;
  sous_menu_ordre?: number;
  permission_id?: string;
  action?: string;
  permission_description?: string;
}

export interface GroupedMenuStructure {
  menu_id: string;
  menu_nom: string;
  menu_icone: string;
  menu_ordre: number;
  sous_menus: {
    sous_menu_id?: string;
    sous_menu_nom?: string;
    sous_menu_description?: string;
    sous_menu_ordre?: number;
    permissions: {
      permission_id: string;
      action: string;
      permission_description?: string;
    }[];
  }[];
}

export const useMenusStructure = () => {
  return useQuery({
    queryKey: ['menus-structure'],
    queryFn: async () => {
      console.log('🔍 Récupération de la structure des menus...');
      
      const { data, error } = await supabase.rpc('get_permissions_structure');

      if (error) {
        console.error('❌ Erreur lors de la récupération de la structure:', error);
        throw error;
      }

      console.log('✅ Structure récupérée:', data?.length || 0, 'éléments');
      return data as MenuStructure[];
    }
  });
};

export const useGroupedMenusStructure = () => {
  const { data: rawData, ...rest } = useMenusStructure();

  const groupedData = rawData ? groupMenusStructure(rawData) : [];

  return {
    data: groupedData,
    ...rest
  };
};

function groupMenusStructure(data: MenuStructure[]): GroupedMenuStructure[] {
  const menuMap = new Map<string, GroupedMenuStructure>();

  data.forEach(item => {
    // Créer le menu s'il n'existe pas
    if (!menuMap.has(item.menu_id)) {
      menuMap.set(item.menu_id, {
        menu_id: item.menu_id,
        menu_nom: item.menu_nom,
        menu_icone: item.menu_icone,
        menu_ordre: item.menu_ordre,
        sous_menus: []
      });
    }

    const menu = menuMap.get(item.menu_id)!;

    // Trouver ou créer le sous-menu
    let sousMenu = menu.sous_menus.find(sm => 
      (sm.sous_menu_id === item.sous_menu_id) ||
      (sm.sous_menu_id === undefined && item.sous_menu_id === null)
    );

    if (!sousMenu) {
      sousMenu = {
        sous_menu_id: item.sous_menu_id || undefined,
        sous_menu_nom: item.sous_menu_nom || undefined,
        sous_menu_description: item.sous_menu_description || undefined,
        sous_menu_ordre: item.sous_menu_ordre || 0,
        permissions: []
      };
      menu.sous_menus.push(sousMenu);
    }

    // Ajouter la permission si elle existe
    if (item.permission_id && item.action) {
      const existingPermission = sousMenu.permissions.find(p => p.permission_id === item.permission_id);
      if (!existingPermission) {
        sousMenu.permissions.push({
          permission_id: item.permission_id,
          action: item.action,
          permission_description: item.permission_description
        });
      }
    }
  });

  // Trier les résultats
  const result = Array.from(menuMap.values())
    .sort((a, b) => a.menu_ordre - b.menu_ordre)
    .map(menu => ({
      ...menu,
      sous_menus: menu.sous_menus
        .sort((a, b) => (a.sous_menu_ordre || 0) - (b.sous_menu_ordre || 0))
        .map(sousMenu => ({
          ...sousMenu,
          permissions: sousMenu.permissions.sort((a, b) => {
            const order = { read: 1, write: 2, delete: 3, export: 4, import: 5 };
            return (order[a.action as keyof typeof order] || 99) - (order[b.action as keyof typeof order] || 99);
          })
        }))
    }));

  return result;
}

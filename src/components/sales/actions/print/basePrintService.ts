
export const openPrintWindow = (content: string, title: string = 'Print'): void => {
  console.log('🪟 Ouverture de la fenêtre d\'impression');
  console.log('📄 Longueur du contenu:', content.length);
  
  const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
  
  if (!printWindow) {
    console.error('❌ Impossible d\'ouvrir la fenêtre d\'impression');
    return;
  }
  
  try {
    console.log('📝 Écriture du contenu dans la fenêtre');
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
    
    console.log('✅ Contenu écrit avec succès');
    
    // Attendre que le contenu soit chargé avant d'imprimer
    printWindow.onload = () => {
      console.log('🔄 Fenêtre chargée, lancement de l\'impression');
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
    
    // Fallback si onload ne se déclenche pas
    setTimeout(() => {
      if (printWindow && !printWindow.closed) {
        console.log('⏰ Fallback: lancement de l\'impression après délai');
        printWindow.print();
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'écriture dans la fenêtre:', error);
  }
};

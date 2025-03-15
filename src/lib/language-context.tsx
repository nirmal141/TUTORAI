import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define supported languages
export type Language = 'english' | 'spanish' | 'french';

// Define the context type
type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'english',
  setLanguage: () => {},
  t: (key: string) => key,
});

// Define props for provider component
interface LanguageProviderProps {
  children: ReactNode;
}

// Translations object
const translations: Record<Language, Record<string, string>> = {
  english: {
    // General
    'app.title': 'TutorAI',
    'app.description': 'Your AI teaching assistant',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.courses': 'Courses',
    'nav.professors': 'Professors',
    'nav.resources': 'Resources',
    'nav.models': 'Models',
    'nav.settings': 'Settings',
    'nav.institutions': 'Institutions',
    'nav.professor_dashboard': 'Professor Dashboard',
    
    // Settings
    'settings.title': 'Settings',
    'settings.description': 'Manage your application preferences and account settings',
    'settings.general': 'General Settings',
    'settings.theme': 'Theme',
    'settings.language': 'Language',
    'settings.notifications': 'Notification Settings',
    'settings.email': 'Email Notifications',
    'settings.desktop': 'Desktop Notifications',
    'settings.privacy': 'Privacy Settings',
    'settings.share_data': 'Share Usage Data',
    
    // Resources
    'resources.title': 'Teaching Resources',
    'resources.description': 'Upload and manage educational resources for students',
    'resources.upload': 'Upload Resources',
    'resources.search': 'Search resources...',
    'resources.all_subjects': 'All Subjects',
    'resources.mathematics': 'Mathematics',
    'resources.physics': 'Physics',
    'resources.chemistry': 'Chemistry',
    'resources.biology': 'Biology',
    'resources.computer_science': 'Computer Science',
    'resources.other': 'Other',
    'resources.uploading': 'Uploading...',
    'resources.no_resources': 'No resources found',
    'resources.no_resources_match': 'No resources match your search criteria',
    'resources.upload_first': 'Upload your first resource to get started',
    'resources.views': 'Views',
    'resources.downloads': 'Downloads',
    'resources.chats': 'Chats',
    'resources.chat_with_document': 'Chat with this document',
    'resources.download': 'Download',
    'resources.delete': 'Delete',
    'resources.chat_with': 'Chat with',
    'resources.document_preview': 'Document preview not available',
    'resources.document_file': 'This is a document file',
    'resources.click_download': 'Click here to download',
    'resources.preview_unavailable': 'Preview not available for this file type',
    'resources.ask_about': 'Ask about this document...',
    'resources.ai_responses': 'AI responses are generated based on the document content',
    'resources.ask_questions': 'Ask questions about this document',
    'resources.ai_analyze': 'The AI will analyze the content and provide answers based on what\'s in the document.',
    'resources.try_asking': 'Try asking specific questions about the content, facts, or details.',
    'resources.error_upload': 'Failed to upload file',
    'resources.error_delete': 'Failed to delete resource',
    'resources.error_download': 'Failed to download file',
    'resources.error_chat': 'Sorry, I encountered an error analyzing this document',
    'resources.error_server': 'The server might be down or the PDF extraction failed',
    'resources.try_again': 'Please try again',
    
    // Languages
    'language.english': 'English',
    'language.spanish': 'Spanish',
    'language.french': 'French',
    
    // Theme
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.system': 'System',
    'theme.label': 'Theme',
    
    // Chat
    'chat.send': 'Send',
    'chat.message': 'Message',
    'chat.close': 'Close',
    'chat.expand': 'Expand',
    'chat.collapse': 'Collapse',
    'chat.loading': 'Loading...',
    'chat.message_placeholder': 'Type your message...',
    'chat.thinking': 'Thinking...',
    'chat.ask_about_document': 'Ask about this document...',
    'chat.clear': 'Clear Chat',
    'chat.upload': 'Upload',
    'chat.assistant': 'Assistant',
    'chat.academic_sources': 'Academic Sources Found',
    'chat.document': 'Document',
    'chat.documents': 'Documents',
    'chat.available': 'Available',
    'chat.searching_web': 'Searching the web for relevant information...',
    'chat.web_search': 'Web Search',
    'chat.upload_content': 'Upload Content',
    'chat.uploaded_documents': 'Uploaded Documents',
    'chat.active_document': 'Active document',
    'chat.activate_document': 'Activate document',
    'chat.remove_document': 'Remove document',
    'chat.upload_document': 'Upload Document',
    'chat.supported_formats': 'Supported formats',
    'chat.youtube_video': 'YouTube Video',
    'chat.paste_youtube_url': 'Paste YouTube URL',
    'chat.process': 'Process',
    'chat.processing_content': 'Processing your content...',
    'chat.this_may_take_a_moment': 'This may take a moment',
    'chat.done': 'Done',
    'chat.using_document': 'Using document',
    'chat.results_from_web_search': 'Results from web search',
    'chat.chat_history': 'Chat History',
    'chat.no_chat_history_yet': 'No chat history yet',
    'chat.clear_all_history': 'Clear All History',
    'chat.start_conversation': 'Start a conversation',
    'chat.assistant_help': 'Ask me any questions and I\'ll help you with your teaching needs.',
    'chat.minimize': 'Minimize',
    'chat.maximize': 'Maximize',
    
    // Common actions
    'actions.save': 'Save',
    'actions.cancel': 'Cancel',
    'actions.delete': 'Delete',
    'actions.edit': 'Edit',
    'actions.add': 'Add',
    'actions.remove': 'Remove',
    'actions.search': 'Search',
    'actions.filter': 'Filter',
    'actions.sort': 'Sort',
    'actions.back': 'Back',
    'actions.next': 'Next',
    'actions.submit': 'Submit',
    'actions.close': 'Close',
    
    // Error messages
    'error.general': 'An error occurred',
    'error.try_again': 'Please try again',
    'error.not_found': 'Not found',
    'error.unauthorized': 'Unauthorized access',
    'error.permission': 'You don\'t have permission to access this page',
    'error.go_back': 'Go Back',
    
    // Loading states
    'loading.general': 'Loading...',
    'loading.resources': 'Loading resources...',
    'loading.data': 'Loading data...',
  },
  
  spanish: {
    // General
    'app.title': 'TutorAI',
    'app.description': 'Tu asistente de enseñanza con IA',
    
    // Navigation
    'nav.dashboard': 'Panel',
    'nav.courses': 'Cursos',
    'nav.professors': 'Profesores',
    'nav.resources': 'Recursos',
    'nav.models': 'Modelos',
    'nav.settings': 'Configuración',
    'nav.institutions': 'Instituciones',
    'nav.professor_dashboard': 'Panel de Profesor',
    
    // Settings
    'settings.title': 'Configuración',
    'settings.description': 'Administra tus preferencias de aplicación y configuración de cuenta',
    'settings.general': 'Configuración General',
    'settings.theme': 'Tema',
    'settings.language': 'Idioma',
    'settings.notifications': 'Configuración de Notificaciones',
    'settings.email': 'Notificaciones por Correo',
    'settings.desktop': 'Notificaciones de Escritorio',
    'settings.privacy': 'Configuración de Privacidad',
    'settings.share_data': 'Compartir Datos de Uso',
    
    // Resources
    'resources.title': 'Recursos de Enseñanza',
    'resources.description': 'Sube y administra recursos educativos para estudiantes',
    'resources.upload': 'Subir Recursos',
    'resources.search': 'Buscar recursos...',
    'resources.all_subjects': 'Todas las Materias',
    'resources.mathematics': 'Matemáticas',
    'resources.physics': 'Física',
    'resources.chemistry': 'Química',
    'resources.biology': 'Biología',
    'resources.computer_science': 'Informática',
    'resources.other': 'Otro',
    'resources.uploading': 'Subiendo...',
    'resources.no_resources': 'No se encontraron recursos',
    'resources.no_resources_match': 'Ningún recurso coincide con tus criterios de búsqueda',
    'resources.upload_first': 'Sube tu primer recurso para comenzar',
    'resources.views': 'Vistas',
    'resources.downloads': 'Descargas',
    'resources.chats': 'Chats',
    'resources.chat_with_document': 'Chatear con este documento',
    'resources.download': 'Descargar',
    'resources.delete': 'Eliminar',
    'resources.chat_with': 'Chatear con',
    'resources.document_preview': 'Vista previa del documento no disponible',
    'resources.document_file': 'Este es un archivo de documento',
    'resources.click_download': 'Haz clic aquí para descargar',
    'resources.preview_unavailable': 'Vista previa no disponible para este tipo de archivo',
    'resources.ask_about': 'Pregunta sobre este documento...',
    'resources.ai_responses': 'Las respuestas de IA se generan basadas en el contenido del documento',
    'resources.ask_questions': 'Haz preguntas sobre este documento',
    'resources.ai_analyze': 'La IA analizará el contenido y proporcionará respuestas basadas en lo que contiene el documento.',
    'resources.try_asking': 'Intenta hacer preguntas específicas sobre el contenido, hechos o detalles.',
    'resources.error_upload': 'Error al subir el archivo',
    'resources.error_delete': 'Error al eliminar el recurso',
    'resources.error_download': 'Error al descargar el archivo',
    'resources.error_chat': 'Lo siento, encontré un error al analizar este documento',
    'resources.error_server': 'El servidor podría estar caído o la extracción del PDF falló',
    'resources.try_again': 'Por favor intenta de nuevo',
    
    // Languages
    'language.english': 'Inglés',
    'language.spanish': 'Español',
    'language.french': 'Francés',
    
    // Theme
    'theme.light': 'Claro',
    'theme.dark': 'Oscuro',
    'theme.system': 'Sistema',
    'theme.label': 'Tema',
    
    // Chat
    'chat.send': 'Enviar',
    'chat.message': 'Mensaje',
    'chat.close': 'Cerrar',
    'chat.expand': 'Expandir',
    'chat.collapse': 'Colapsar',
    'chat.loading': 'Cargando...',
    'chat.message_placeholder': 'Escribe tu mensaje...',
    'chat.thinking': 'Pensando...',
    'chat.ask_about_document': 'Pregunta sobre este documento...',
    'chat.clear': 'Limpiar Chat',
    'chat.upload': 'Subir',
    'chat.assistant': 'Asistente',
    'chat.academic_sources': 'Fuentes Académicas Encontradas',
    'chat.document': 'Documento',
    'chat.documents': 'Documentos',
    'chat.available': 'Disponibles',
    'chat.searching_web': 'Buscando información relevante en la web...',
    'chat.web_search': 'Búsqueda Web',
    'chat.upload_content': 'Subir Contenido',
    'chat.uploaded_documents': 'Documentos Subidos',
    'chat.active_document': 'Documento activo',
    'chat.activate_document': 'Activar documento',
    'chat.remove_document': 'Eliminar documento',
    'chat.upload_document': 'Subir Documento',
    'chat.supported_formats': 'Formatos soportados',
    'chat.youtube_video': 'Video de YouTube',
    'chat.paste_youtube_url': 'Pegar URL de YouTube',
    'chat.process': 'Procesar',
    'chat.processing_content': 'Procesando tu contenido...',
    'chat.this_may_take_a_moment': 'Esto puede tomar un momento',
    'chat.done': 'Hecho',
    'chat.using_document': 'Usando documento',
    'chat.results_from_web_search': 'Resultados de la búsqueda web',
    'chat.chat_history': 'Historial de Chat',
    'chat.no_chat_history_yet': 'Aún no hay historial de chat',
    'chat.clear_all_history': 'Borrar Todo el Historial',
    'chat.start_conversation': 'Inicia una conversación',
    'chat.assistant_help': 'Hazme cualquier pregunta y te ayudaré con tus necesidades de enseñanza.',
    'chat.minimize': 'Minimizar',
    'chat.maximize': 'Maximizar',
    
    // Common actions
    'actions.save': 'Guardar',
    'actions.cancel': 'Cancelar',
    'actions.delete': 'Eliminar',
    'actions.edit': 'Editar',
    'actions.add': 'Añadir',
    'actions.remove': 'Quitar',
    'actions.search': 'Buscar',
    'actions.filter': 'Filtrar',
    'actions.sort': 'Ordenar',
    'actions.back': 'Atrás',
    'actions.next': 'Siguiente',
    'actions.submit': 'Enviar',
    'actions.close': 'Cerrar',
    
    // Error messages
    'error.general': 'Ha ocurrido un error',
    'error.try_again': 'Por favor intenta de nuevo',
    'error.not_found': 'No encontrado',
    'error.unauthorized': 'Acceso no autorizado',
    'error.permission': 'No tienes permiso para acceder a esta página',
    'error.go_back': 'Volver',
    
    // Loading states
    'loading.general': 'Cargando...',
    'loading.resources': 'Cargando recursos...',
    'loading.data': 'Cargando datos...',
  },
  
  french: {
    // General
    'app.title': 'TutorAI',
    'app.description': 'Votre assistant d\'enseignement IA',
    
    // Navigation
    'nav.dashboard': 'Tableau de Bord',
    'nav.courses': 'Cours',
    'nav.professors': 'Professeurs',
    'nav.resources': 'Ressources',
    'nav.models': 'Modèles',
    'nav.settings': 'Paramètres',
    'nav.institutions': 'Institutions',
    'nav.professor_dashboard': 'Tableau de Bord du Professeur',
    
    // Settings
    'settings.title': 'Paramètres',
    'settings.description': 'Gérez vos préférences d\'application et paramètres de compte',
    'settings.general': 'Paramètres Généraux',
    'settings.theme': 'Thème',
    'settings.language': 'Langue',
    'settings.notifications': 'Paramètres de Notification',
    'settings.email': 'Notifications par Email',
    'settings.desktop': 'Notifications sur Bureau',
    'settings.privacy': 'Paramètres de Confidentialité',
    'settings.share_data': 'Partager les Données d\'Utilisation',
    
    // Resources
    'resources.title': 'Ressources d\'Enseignement',
    'resources.description': 'Téléchargez et gérez des ressources éducatives pour les étudiants',
    'resources.upload': 'Télécharger des Ressources',
    'resources.search': 'Rechercher des ressources...',
    'resources.all_subjects': 'Toutes les Matières',
    'resources.mathematics': 'Mathématiques',
    'resources.physics': 'Physique',
    'resources.chemistry': 'Chimie',
    'resources.biology': 'Biologie',
    'resources.computer_science': 'Informatique',
    'resources.other': 'Autre',
    'resources.uploading': 'Téléchargement en cours...',
    'resources.no_resources': 'Aucune ressource trouvée',
    'resources.no_resources_match': 'Aucune ressource ne correspond à vos critères de recherche',
    'resources.upload_first': 'Téléchargez votre première ressource pour commencer',
    'resources.views': 'Vues',
    'resources.downloads': 'Téléchargements',
    'resources.chats': 'Discussions',
    'resources.chat_with_document': 'Discuter avec ce document',
    'resources.download': 'Télécharger',
    'resources.delete': 'Supprimer',
    'resources.chat_with': 'Discuter avec',
    'resources.document_preview': 'Aperçu du document non disponible',
    'resources.document_file': 'Ceci est un fichier document',
    'resources.click_download': 'Cliquez ici pour télécharger',
    'resources.preview_unavailable': 'Aperçu non disponible pour ce type de fichier',
    'resources.ask_about': 'Posez des questions sur ce document...',
    'resources.ai_responses': 'Les réponses de l\'IA sont générées en fonction du contenu du document',
    'resources.ask_questions': 'Posez des questions sur ce document',
    'resources.ai_analyze': 'L\'IA analysera le contenu et fournira des réponses basées sur ce que contient le document.',
    'resources.try_asking': 'Essayez de poser des questions spécifiques sur le contenu, les faits ou les détails.',
    'resources.error_upload': 'Échec du téléchargement du fichier',
    'resources.error_delete': 'Échec de la suppression de la ressource',
    'resources.error_download': 'Échec du téléchargement du fichier',
    'resources.error_chat': 'Désolé, j\'ai rencontré une erreur lors de l\'analyse de ce document',
    'resources.error_server': 'Le serveur pourrait être en panne ou l\'extraction du PDF a échoué',
    'resources.try_again': 'Veuillez réessayer',
    
    // Languages
    'language.english': 'Anglais',
    'language.spanish': 'Espagnol',
    'language.french': 'Français',
    
    // Theme
    'theme.light': 'Clair',
    'theme.dark': 'Sombre',
    'theme.system': 'Système',
    'theme.label': 'Thème',
    
    // Chat
    'chat.send': 'Envoyer',
    'chat.message': 'Message',
    'chat.close': 'Fermer',
    'chat.expand': 'Agrandir',
    'chat.collapse': 'Réduire',
    'chat.loading': 'Chargement...',
    'chat.message_placeholder': 'Tapez votre message...',
    'chat.thinking': 'Réflexion...',
    'chat.ask_about_document': 'Poser une question sur ce document...',
    'chat.clear': 'Effacer Chat',
    'chat.upload': 'Télécharger',
    'chat.assistant': 'Assistant',
    'chat.academic_sources': 'Sources Académiques Trouvées',
    'chat.document': 'Document',
    'chat.documents': 'Documents',
    'chat.available': 'Disponibles',
    'chat.searching_web': 'Recherche d\'informations pertinentes sur le web...',
    'chat.web_search': 'Recherche Web',
    'chat.upload_content': 'Télécharger du Contenu',
    'chat.uploaded_documents': 'Documents Téléchargés',
    'chat.active_document': 'Document actif',
    'chat.activate_document': 'Activer le document',
    'chat.remove_document': 'Supprimer le document',
    'chat.upload_document': 'Télécharger un Document',
    'chat.supported_formats': 'Formats pris en charge',
    'chat.youtube_video': 'Vidéo YouTube',
    'chat.paste_youtube_url': 'Coller l\'URL YouTube',
    'chat.process': 'Traiter',
    'chat.processing_content': 'Traitement de votre contenu...',
    'chat.this_may_take_a_moment': 'Cela peut prendre un moment',
    'chat.done': 'Terminé',
    'chat.using_document': 'Utilisation du document',
    'chat.results_from_web_search': 'Résultats de la recherche web',
    'chat.chat_history': 'Historique des Discussions',
    'chat.no_chat_history_yet': 'Pas encore d\'historique de chat',
    'chat.clear_all_history': 'Effacer Tout l\'Historique',
    'chat.start_conversation': 'Commencez une conversation',
    'chat.assistant_help': 'Posez-moi des questions et je vous aiderai avec vos besoins d\'enseignement.',
    'chat.minimize': 'Réduire',
    'chat.maximize': 'Agrandir',
    
    // Common actions
    'actions.save': 'Enregistrer',
    'actions.cancel': 'Annuler',
    'actions.delete': 'Supprimer',
    'actions.edit': 'Modifier',
    'actions.add': 'Ajouter',
    'actions.remove': 'Supprimer',
    'actions.search': 'Rechercher',
    'actions.filter': 'Filtrer',
    'actions.sort': 'Trier',
    'actions.back': 'Retour',
    'actions.next': 'Suivant',
    'actions.submit': 'Soumettre',
    'actions.close': 'Fermer',
    
    // Error messages
    'error.general': 'Une erreur s\'est produite',
    'error.try_again': 'Veuillez réessayer',
    'error.not_found': 'Non trouvé',
    'error.unauthorized': 'Accès non autorisé',
    'error.permission': 'Vous n\'avez pas la permission d\'accéder à cette page',
    'error.go_back': 'Retour',
    
    // Loading states
    'loading.general': 'Chargement...',
    'loading.resources': 'Chargement des ressources...',
    'loading.data': 'Chargement des données...',
  }
};

// Translation function
const translate = (language: Language, key: string): string => {
  return translations[language][key] || key;
};

// Provider component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Get language from localStorage or use english as default
  const getInitialLanguage = (): Language => {
    const savedLanguage = localStorage.getItem('language');
    return (savedLanguage as Language) || 'english';
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  // Update language and save to localStorage
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // Translation function
  const t = (key: string): string => {
    return translate(language, key);
  };

  // Update language when component mounts
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && Object.keys(translations).includes(savedLanguage)) {
      setLanguageState(savedLanguage as Language);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext); 
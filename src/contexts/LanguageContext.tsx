import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'de' | 'en' | 'fr';

type TranslationMap = Record<string, Record<string, string>>;

const translations: Record<Language, TranslationMap> = {
  de: {
    nav: {
      home: 'Home',
      products: 'Kollektion',
      favorites: 'Favoriten',
      profile: 'Profil',
      cart: 'Warenkorb',
      blog: 'Blog',
      contact: 'Kontakt',
      about: 'Über uns',
      login: 'Anmelden',
      logout: 'Abmelden',
      account: 'Mein Konto',
      orders: 'Bestellungen',
      returns: 'Retouren',
    },
    hero: {
      title: 'Exklusive Parfüms',
      subtitle: 'Entdecke deine Signature-Duft',
      cta: 'Jetzt entdecken',
    },
    product: {
      addToCart: 'In den Warenkorb',
      addToFavorites: 'Zu Favoriten',
      removeFromFavorites: 'Aus Favoriten entfernen',
      outOfStock: 'Nicht verfügbar',
      inStock: 'Auf Lager',
      price: 'Preis',
      size: 'Größe',
      quantity: 'Menge',
      description: 'Beschreibung',
      reviews: 'Bewertungen',
      writeReview: 'Bewertung schreiben',
      inspiredBy: 'Inspiriert von',
      ingredients: 'Inhaltsstoffe',
      scentPyramid: 'Duftpyramide',
      share: 'Teilen',
      freeShipping: 'Gratis ab 50€',
      securePayment: 'Sichere Zahlung',
      returnPolicy: '14 Tage Rückgabe',
    },
    filter: {
      title: 'Filter',
      category: 'Kategorie',
      price: 'Preis',
      gender: 'Geschlecht',
      season: 'Jahreszeit',
      occasion: 'Anlass',
      clearAll: 'Alle löschen',
      activeFilters: 'Aktive Filter',
      noResults: 'Keine Produkte gefunden',
    },
    blog: {
      title: 'ALDENAIR Journal',
      subtitle: 'Duftguides, Tipps und Geschichten aus der Welt der Parfümerie',
      readMore: 'Weiterlesen',
      allArticles: 'Alle Artikel',
      searchPlaceholder: 'Artikel durchsuchen...',
      minRead: 'Min. Lesezeit',
      all: 'Alle',
    },
    chat: {
      title: 'ALDENAIR Duftberater',
      subtitle: 'Online • Antwortet sofort',
      placeholder: 'Deine Frage...',
      welcome: 'Willkommen bei ALDENAIR! 👋 Wie kann ich dir bei der Duftauswahl helfen?',
    },
    auth: {
      login: 'Anmelden',
      signup: 'Registrieren',
      email: 'E-Mail',
      password: 'Passwort',
      forgotPassword: 'Passwort vergessen?',
      noAccount: 'Noch kein Konto?',
      hasAccount: 'Bereits ein Konto?',
    },
    common: {
      loading: 'Lädt...',
      error: 'Fehler',
      success: 'Erfolg',
      cancel: 'Abbrechen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      back: 'Zurück',
      next: 'Weiter',
      submit: 'Absenden',
      search: 'Suchen',
      all: 'Alle',
      more: 'Mehr',
      less: 'Weniger',
    },
    footer: {
      shop: 'Shop',
      service: 'Service',
      legal: 'Rechtliches',
      newsletter: 'Newsletter',
      allProducts: 'Alle Produkte',
      men: 'Herren',
      women: 'Damen',
      unisex: 'Unisex',
      contact: 'Kontakt',
      faq: 'FAQ',
      returns: 'Rückgabe',
      shipping: 'Versand',
      privacy: 'Datenschutz',
      terms: 'AGB',
      imprint: 'Impressum',
    },
  },
  en: {
    nav: {
      home: 'Home',
      products: 'Collection',
      favorites: 'Favorites',
      profile: 'Profile',
      cart: 'Cart',
      blog: 'Blog',
      contact: 'Contact',
      about: 'About',
      login: 'Sign In',
      logout: 'Sign Out',
      account: 'My Account',
      orders: 'Orders',
      returns: 'Returns',
    },
    hero: {
      title: 'Exclusive Perfumes',
      subtitle: 'Discover your signature scent',
      cta: 'Discover now',
    },
    product: {
      addToCart: 'Add to Cart',
      addToFavorites: 'Add to Favorites',
      removeFromFavorites: 'Remove from Favorites',
      outOfStock: 'Out of Stock',
      inStock: 'In Stock',
      price: 'Price',
      size: 'Size',
      quantity: 'Quantity',
      description: 'Description',
      reviews: 'Reviews',
      writeReview: 'Write a Review',
      inspiredBy: 'Inspired by',
      ingredients: 'Ingredients',
      scentPyramid: 'Scent Pyramid',
      share: 'Share',
      freeShipping: 'Free over 50€',
      securePayment: 'Secure Payment',
      returnPolicy: '14 Day Returns',
    },
    filter: {
      title: 'Filter',
      category: 'Category',
      price: 'Price',
      gender: 'Gender',
      season: 'Season',
      occasion: 'Occasion',
      clearAll: 'Clear all',
      activeFilters: 'Active Filters',
      noResults: 'No products found',
    },
    blog: {
      title: 'ALDENAIR Journal',
      subtitle: 'Scent guides, tips and stories from the world of perfumery',
      readMore: 'Read more',
      allArticles: 'All Articles',
      searchPlaceholder: 'Search articles...',
      minRead: 'min read',
      all: 'All',
    },
    chat: {
      title: 'ALDENAIR Scent Advisor',
      subtitle: 'Online • Responds instantly',
      placeholder: 'Your question...',
      welcome: 'Welcome to ALDENAIR! 👋 How can I help you choose a fragrance?',
    },
    auth: {
      login: 'Sign In',
      signup: 'Sign Up',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot password?',
      noAccount: 'No account yet?',
      hasAccount: 'Already have an account?',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      search: 'Search',
      all: 'All',
      more: 'More',
      less: 'Less',
    },
    footer: {
      shop: 'Shop',
      service: 'Service',
      legal: 'Legal',
      newsletter: 'Newsletter',
      allProducts: 'All Products',
      men: 'Men',
      women: 'Women',
      unisex: 'Unisex',
      contact: 'Contact',
      faq: 'FAQ',
      returns: 'Returns',
      shipping: 'Shipping',
      privacy: 'Privacy Policy',
      terms: 'Terms',
      imprint: 'Imprint',
    },
  },
  fr: {
    nav: {
      home: 'Accueil',
      products: 'Collection',
      favorites: 'Favoris',
      profile: 'Profil',
      cart: 'Panier',
      blog: 'Blog',
      contact: 'Contact',
      about: 'À propos',
      login: 'Connexion',
      logout: 'Déconnexion',
      account: 'Mon Compte',
      orders: 'Commandes',
      returns: 'Retours',
    },
    hero: {
      title: 'Parfums Exclusifs',
      subtitle: 'Découvrez votre parfum signature',
      cta: 'Découvrir',
    },
    product: {
      addToCart: 'Ajouter au panier',
      addToFavorites: 'Ajouter aux favoris',
      removeFromFavorites: 'Retirer des favoris',
      outOfStock: 'Rupture de stock',
      inStock: 'En stock',
      price: 'Prix',
      size: 'Taille',
      quantity: 'Quantité',
      description: 'Description',
      reviews: 'Avis',
      writeReview: 'Écrire un avis',
      inspiredBy: 'Inspiré de',
      ingredients: 'Ingrédients',
      scentPyramid: 'Pyramide olfactive',
      share: 'Partager',
      freeShipping: 'Gratuit dès 50€',
      securePayment: 'Paiement sécurisé',
      returnPolicy: 'Retour sous 14 jours',
    },
    filter: {
      title: 'Filtre',
      category: 'Catégorie',
      price: 'Prix',
      gender: 'Genre',
      season: 'Saison',
      occasion: 'Occasion',
      clearAll: 'Tout effacer',
      activeFilters: 'Filtres actifs',
      noResults: 'Aucun produit trouvé',
    },
    blog: {
      title: 'Journal ALDENAIR',
      subtitle: 'Guides parfum, conseils et histoires du monde de la parfumerie',
      readMore: 'Lire la suite',
      allArticles: 'Tous les articles',
      searchPlaceholder: 'Rechercher des articles...',
      minRead: 'min de lecture',
      all: 'Tous',
    },
    chat: {
      title: 'Conseiller ALDENAIR',
      subtitle: 'En ligne • Répond instantanément',
      placeholder: 'Votre question...',
      welcome: 'Bienvenue chez ALDENAIR ! 👋 Comment puis-je vous aider à choisir un parfum ?',
    },
    auth: {
      login: 'Connexion',
      signup: 'Inscription',
      email: 'E-mail',
      password: 'Mot de passe',
      forgotPassword: 'Mot de passe oublié ?',
      noAccount: 'Pas encore de compte ?',
      hasAccount: 'Déjà un compte ?',
    },
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      cancel: 'Annuler',
      save: 'Sauvegarder',
      delete: 'Supprimer',
      edit: 'Modifier',
      back: 'Retour',
      next: 'Suivant',
      submit: 'Envoyer',
      search: 'Rechercher',
      all: 'Tous',
      more: 'Plus',
      less: 'Moins',
    },
    footer: {
      shop: 'Boutique',
      service: 'Service',
      legal: 'Mentions légales',
      newsletter: 'Newsletter',
      allProducts: 'Tous les produits',
      men: 'Homme',
      women: 'Femme',
      unisex: 'Unisexe',
      contact: 'Contact',
      faq: 'FAQ',
      returns: 'Retours',
      shipping: 'Livraison',
      privacy: 'Confidentialité',
      terms: 'CGV',
      imprint: 'Mentions légales',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  availableLanguages: { code: Language; label: string; flag: string }[];
}

const availableLanguages: { code: Language; label: string; flag: string }[] = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('aldenair_language');
    if (stored && stored in translations) {
      return stored as Language;
    }
    const browserLang = navigator.language.split('-')[0];
    if (browserLang in translations) {
      return browserLang as Language;
    }
    return 'de';
  });

  useEffect(() => {
    localStorage.setItem('aldenair_language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    const keys = key.split('.');
    if (keys.length !== 2) return key;
    const [group, item] = keys;
    return translations[language]?.[group]?.[item] || translations['de']?.[group]?.[item] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

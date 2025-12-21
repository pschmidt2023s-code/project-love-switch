import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'de' | 'en' | 'fr';

const translations = {
  de: {
    nav: {
      home: 'Startseite',
      products: 'Produkte',
      favorites: 'Favoriten',
      profile: 'Profil',
      cart: 'Warenkorb',
    },
    hero: {
      title: 'Exklusive Parfüms',
      subtitle: 'Entdecke deine Signature-Duft',
      cta: 'Jetzt entdecken',
    },
    product: {
      addToCart: 'In den Warenkorb',
      addToFavorites: 'Zu Favoriten',
      outOfStock: 'Nicht verfügbar',
      inStock: 'Auf Lager',
      price: 'Preis',
      size: 'Größe',
    },
    common: {
      loading: 'Lädt...',
      error: 'Fehler',
      success: 'Erfolg',
      cancel: 'Abbrechen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
    },
  },
  en: {
    nav: {
      home: 'Home',
      products: 'Products',
      favorites: 'Favorites',
      profile: 'Profile',
      cart: 'Cart',
    },
    hero: {
      title: 'Exclusive Perfumes',
      subtitle: 'Discover your signature scent',
      cta: 'Discover now',
    },
    product: {
      addToCart: 'Add to Cart',
      addToFavorites: 'Add to Favorites',
      outOfStock: 'Out of Stock',
      inStock: 'In Stock',
      price: 'Price',
      size: 'Size',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
    },
  },
  fr: {
    nav: {
      home: 'Accueil',
      products: 'Produits',
      favorites: 'Favoris',
      profile: 'Profil',
      cart: 'Panier',
    },
    hero: {
      title: 'Parfums Exclusifs',
      subtitle: 'Découvrez votre parfum signature',
      cta: 'Découvrir',
    },
    product: {
      addToCart: 'Ajouter au panier',
      addToFavorites: 'Ajouter aux favoris',
      outOfStock: 'Rupture de stock',
      inStock: 'En stock',
      price: 'Prix',
      size: 'Taille',
    },
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      cancel: 'Annuler',
      save: 'Sauvegarder',
      delete: 'Supprimer',
      edit: 'Modifier',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

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
    let value: any = translations[language];
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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

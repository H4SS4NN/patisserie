// Configuration des catégories de gâteaux avec leurs goûts disponibles
export interface FlavorOption {
  name: string;
  image?: string; // URL de l'image pour ce goût
}

export interface CategoryConfig {
  name: string;
  flavors: FlavorOption[];
  hasParts?: boolean;
  parts?: number[];
}

export const CATEGORIES: Record<string, CategoryConfig> = {
  'Tartes et tartelettes': {
    name: 'Tartes et tartelettes',
    flavors: [
      { name: 'Citron' },
      { name: 'Pistache' },
      { name: 'Framboise' },
      { name: 'Fraise' },
      { name: 'Abricot' },
      { name: 'Bordaloue' },
    ],
    hasParts: false,
  },
  'Cookies': {
    name: 'Cookies',
    flavors: [
      { name: 'Snikers' },
      { name: 'Pistache framboise' },
      { name: 'Citron' },
      { name: 'El morjene' },
    ],
    hasParts: false,
  },
  'Entremets': {
    name: 'Entremets',
    flavors: [
      { name: 'Fraisier' },
      { name: 'Royal' },
      { name: '3 chocolat' },
      { name: 'Cheescake' },
      { name: 'Citron' },
      { name: 'framboise' },
      { name: 'Spéculos' },
      { name: 'Pistache' },
    ],
    hasParts: false,
  },
  'Flanc': {
    name: 'Flanc',
    flavors: [
      { name: 'Pistache', image: '/images/flanc-pistache.jpg' }, // Exemple: ajoutez l'URL de l'image
      { name: 'Praliné', image: '/images/flanc-praline.jpg' },
      { name: 'Coco', image: '/images/flanc-coco.jpg' },
      { name: 'Vanille', image: '/images/flanc-vanille.jpg' },
    ],
    hasParts: false,
  },
  'Layer cake': {
    name: 'Layer cake',
    flavors: [{ name: 'Vanille choco' }],
    hasParts: true,
    parts: [8, 12, 16],
  },
};

export function getFlavorsForCategory(category: string): FlavorOption[] {
  return CATEGORIES[category]?.flavors || [];
}

export function getFlavorNamesForCategory(category: string): string[] {
  return getFlavorsForCategory(category).map((f) => f.name);
}

export function categoryHasParts(category: string): boolean {
  return CATEGORIES[category]?.hasParts || false;
}

export function getPartsForCategory(category: string): number[] {
  return CATEGORIES[category]?.parts || [];
}

export const CATEGORY_NAMES = Object.keys(CATEGORIES);


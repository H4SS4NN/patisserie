// Configuration des catégories de gâteaux avec leurs goûts disponibles
export interface FlavorOption {
  name: string;
  image?: string; // URL de l'image pour ce goût
}

export interface CategoryConfig {
  name: string;
  flavors: FlavorOption[];
  hasParts?: boolean; // Si true, permet de choisir le nombre de parts (8, 12, 16)
  parts?: number[]; // Options de parts disponibles
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
      { name: 'Pistache' },
      { name: 'Praliné' },
      { name: 'Coco' },
      { name: 'Vanille' },
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

// Helper pour obtenir les goûts d'une catégorie
export function getFlavorsForCategory(category: string): FlavorOption[] {
  return CATEGORIES[category]?.flavors || [];
}

export function getFlavorNamesForCategory(category: string): string[] {
  return getFlavorsForCategory(category).map((f) => f.name);
}

// Helper pour vérifier si une catégorie a des parts
export function categoryHasParts(category: string): boolean {
  return CATEGORIES[category]?.hasParts || false;
}

// Helper pour obtenir les parts disponibles
export function getPartsForCategory(category: string): number[] {
  return CATEGORIES[category]?.parts || [];
}

// Liste de toutes les catégories
export const CATEGORY_NAMES = Object.keys(CATEGORIES);


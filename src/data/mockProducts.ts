import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  // ================= 1. COLLIERS & PENDENTIFS =================
  {
    id: 'prod-001',
    title: 'Collier cœur doré',
    slug: 'collier-coeur-dore',
    category: 'Colliers & Pendentifs',
    shortDescription: 'Collier raffiné en or 18k orné d\'un pendentif cœur délicat sur fine chaîne dorée. Symbole intemporel d\'amour et d\'élégance.',
    description: `Sublime collier en or 18 carats avec pendentif cœur sculpté et finition miroir haute brillance. Une pièce emblématique qui apporte une touche de douceur et d'éclat à toutes vos tenues de fête ou du quotidien.\n\nLivré dans son écrin de luxe Maison Céleste avec certificat d'authenticité.`,
    bulletPoints: [
      'Pendentif cœur finition or 18 carats anti-ternissement',
      'Chaîne maille forçat diamantée très solide et hypoallergénique',
      'Longueur réglable : 42 cm + 5 cm d\'extension de confort',
      'Résistant à l\'eau et aux parfums du quotidien',
      'Écrin prestige et pochon en velours offerts'
    ],
    price: 1700,
    compareAtPrice: 2200,
    images: [
      '/images/products/collier-coeur-dore-1.jpg',
      '/images/products/collier-coeur-dore-2.jpg'
    ],
    colors: [
      { name: 'Doré Or 18k', hex: '#D4AF37', imageIndex: 0 },
    ],
    sizes: ['Standard Ajustable (42-47 cm)'],
    variants: [
      { id: 'v1', colorName: 'Doré Or 18k', colorHex: '#D4AF37', size: 'Standard Ajustable (42-47 cm)', stock: 25 },
    ],
    totalStock: 25,
    rating: 5.0,
    reviewCount: 48,
    isFeatured: true,
    isActive: true,
    badge: '-23%',
    createdAt: '2026-03-01',
  },
  {
    id: 'prod-002',
    title: 'Collier pendentif rond',
    slug: 'collier-pendentif-rond',
    category: 'Colliers & Pendentifs',
    shortDescription: 'Collier médaille ronde ciselée en or jaune 18k avec reflets scintillants. Un médaillon chic et moderne.',
    description: `La pureté des lignes géométriques alliée à l'élégance de l'or. Ce collier met en valeur un médaillon circulaire poli avec liseré travaillé qui capte chaque rayon de lumière. Parfait seul ou superposé.`,
    bulletPoints: [
      'Médaillon rond or 18k ciselé haute précision',
      'Chaîne gourmette fine avec fermoir sécurisé',
      'Acier inoxydable chirurgical étanche 316L',
      'Longueur adaptable selon vos décolletés'
    ],
    price: 1900,
    compareAtPrice: 2500,
    images: [
      '/images/products/collier-pendentif-rond-1.jpg',
      '/images/products/collier-pendentif-rond-2.jpg'
    ],
    colors: [
      { name: 'Doré Or 18k', hex: '#D4AF37', imageIndex: 0 },
    ],
    sizes: ['Standard Ajustable (45 cm)'],
    variants: [
      { id: 'v2', colorName: 'Doré Or 18k', colorHex: '#D4AF37', size: 'Standard Ajustable (45 cm)', stock: 20 },
    ],
    totalStock: 20,
    rating: 4.9,
    reviewCount: 36,
    isFeatured: true,
    isActive: true,
    badge: '-24%',
    createdAt: '2026-03-02',
  },

  // ================= 2. BRACELETS & JONCS =================
  {
    id: 'prod-003',
    title: 'Bracelet perles blanches',
    slug: 'bracelet-perles-blanches',
    category: 'Bracelets & Joncs',
    shortDescription: 'Somptueux bracelet de perles blanches naturelles d\'eau douce rehaussé d\'un fermoir délicat en or. Douceur et pureté absolue.',
    description: `Une merveille de délicatesse. Ce bracelet est composé de perles blanches d'eau douce sélectionnées pour leur nacre lustrée et leur éclat naturel. Il apporte une grâce incomparable à votre poignet pour les mariages et occasions spéciales.`,
    bulletPoints: [
      'Véritables perles blanches baroques lustrées de première qualité',
      'Fermoir mousqueton doré or fin 18k avec chaînette de réglage',
      'Montage sur fil de soie tressé ultra-résistant',
      'Confortable et léger au quotidien'
    ],
    price: 2500,
    compareAtPrice: 3200,
    images: [
      '/images/products/bracelet-perles-blanches-1.jpg',
      '/images/products/bracelet-perles-blanches-2.jpg'
    ],
    colors: [
      { name: 'Perles Blanches & Or', hex: '#FAF9F6', imageIndex: 0 },
    ],
    sizes: ['Taille Ajustable (16-21 cm)'],
    variants: [
      { id: 'v3', colorName: 'Perles Blanches & Or', colorHex: '#FAF9F6', size: 'Taille Ajustable (16-21 cm)', stock: 18 },
    ],
    totalStock: 18,
    rating: 5.0,
    reviewCount: 52,
    isFeatured: true,
    isActive: true,
    badge: '-22%',
    createdAt: '2026-03-03',
  },
  {
    id: 'prod-004',
    title: 'Bracelet chaîne dorée',
    slug: 'bracelet-chaine-doree',
    category: 'Bracelets & Joncs',
    shortDescription: 'Bracelet fin en maille dorée étincelante plaqué or 18k. Parfait à porter seul ou en accumulation.',
    description: `L'accessoire intemporel par excellence. Ce bracelet chaîne en maillons forçat diamantés sublime votre poignet avec subtilité et modernité. Résiste à l'eau et conserve sa brillance jour après jour.`,
    bulletPoints: [
      'Maille forçat diamantée en acier chirurgical plaqué or 18k',
      'Longueur 17 cm avec rallonge de 4 cm pour tous les poignets',
      'Anti-ternissement et hypoallergénique',
      'Fermoir mousqueton renforcé'
    ],
    price: 1800,
    compareAtPrice: 2300,
    images: [
      '/images/products/bracelet-chaine-doree-1.jpg',
      '/images/products/bracelet-chaine-doree-2.jpg'
    ],
    colors: [
      { name: 'Doré Or 18k', hex: '#D4AF37', imageIndex: 0 },
    ],
    sizes: ['Longueur Ajustable (17-21 cm)'],
    variants: [
      { id: 'v4', colorName: 'Doré Or 18k', colorHex: '#D4AF37', size: 'Longueur Ajustable (17-21 cm)', stock: 22 },
    ],
    totalStock: 22,
    rating: 4.8,
    reviewCount: 29,
    isFeatured: true,
    isActive: true,
    badge: '-22%',
    createdAt: '2026-03-04',
  },

  // ================= 3. BAGUES & ALLIANCES =================
  {
    id: 'prod-005',
    title: 'Bague en or avec pierre rouge',
    slug: 'bague-en-or-pierre-rouge',
    category: 'Bagues & Alliances',
    shortDescription: 'Bague majestueuse en or 18k sertie d\'un rubis rouge éclatant entouré d\'un halo de micro-zircones taille diamant.',
    description: `Une création digne de la haute joaillerie. La pierre centrale rouge rubis facettée capte la lumière avec intensité, magnifiée par une couronne scintillante de micro-oxydes de zirconium. La bague parfaite pour marquer les moments inoubliables.`,
    bulletPoints: [
      'Pierre centrale ovale rouge rubis intense 8x6 mm',
      'Pavage halo d\'oxydes de zirconium AAA+ taille brillant',
      'Monture solide plaquée or 18k garantie anti-oxydation',
      'Anneau ajustable ergonomique pour un confort optimal'
    ],
    price: 2600,
    compareAtPrice: 3500,
    images: [
      '/images/products/bague-or-pierre-rouge-1.jpg',
      '/images/products/bague-or-pierre-rouge-2.jpg'
    ],
    colors: [
      { name: 'Or 18k & Rubis Rouge', hex: '#B22222', imageIndex: 0 },
    ],
    sizes: ['Taille Ajustable (52 à 58)', 'Taille 54 Fixe', 'Taille 56 Fixe'],
    variants: [
      { id: 'v5-1', colorName: 'Or 18k & Rubis Rouge', colorHex: '#B22222', size: 'Taille Ajustable (52 à 58)', stock: 15 },
      { id: 'v5-2', colorName: 'Or 18k & Rubis Rouge', colorHex: '#B22222', size: 'Taille 54 Fixe', stock: 8 },
      { id: 'v5-3', colorName: 'Or 18k & Rubis Rouge', colorHex: '#B22222', size: 'Taille 56 Fixe', stock: 7 },
    ],
    totalStock: 30,
    rating: 5.0,
    reviewCount: 44,
    isFeatured: true,
    isActive: true,
    badge: '-26%',
    createdAt: '2026-03-05',
  },
  {
    id: 'prod-006',
    title: 'Bague solitaire argentée',
    slug: 'bague-solitaire-argentee',
    category: 'Bagues & Alliances',
    shortDescription: 'Bague solitaire en argent 925 rhodié avec diamant de synthèse 4 griffes d\'un éclat spectaculaire. L\'alliance parfaite.',
    description: `L'élégance pure et éternelle du solitaire. Montée sur un anneau en argent fin rhodié anti-oxydation, la pierre centrale facettée offre les feux et le scintillement d'un vrai diamant. Le choix numéro 1 pour fiançailles et cadeaux précieux.`,
    bulletPoints: [
      'Pierre solitaire taille brillant 58 facettes',
      'Monture classique 4 griffes en argent fin 925 rhodié',
      'Éclat diamant étincelant garanti',
      'Livrées dans son écrin de velours Maison Céleste'
    ],
    price: 2400,
    compareAtPrice: 3100,
    images: [
      '/images/products/bague-solitaire-argentee-1.jpg',
      '/images/products/bague-solitaire-argentee-2.jpg'
    ],
    colors: [
      { name: 'Argent 925 Pur', hex: '#C0C0C0', imageIndex: 0 },
    ],
    sizes: ['Taille Ajustable (52 à 58)', 'Taille 54 Fixe', 'Taille 56 Fixe'],
    variants: [
      { id: 'v6-1', colorName: 'Argent 925 Pur', colorHex: '#C0C0C0', size: 'Taille Ajustable (52 à 58)', stock: 16 },
      { id: 'v6-2', colorName: 'Argent 925 Pur', colorHex: '#C0C0C0', size: 'Taille 54 Fixe', stock: 10 },
      { id: 'v6-3', colorName: 'Argent 925 Pur', colorHex: '#C0C0C0', size: 'Taille 56 Fixe', stock: 8 },
    ],
    totalStock: 34,
    rating: 4.9,
    reviewCount: 38,
    isFeatured: true,
    isActive: true,
    badge: '-23%',
    createdAt: '2026-03-06',
  },

  // ================= 4. COFFRETS & PACKS =================
  {
    id: 'prod-007',
    title: 'Coffret cadeau bijoux',
    slug: 'coffret-cadeau-bijoux',
    category: 'Coffrets & Packs',
    shortDescription: 'Coffret cadeau de prestige composé d\'une parure collier et boucles d\'oreilles dorées, dans un écrin rose poudré avec ruban satiné.',
    description: `Le cadeau d'exception prêt à offrir. Ce coffret luxueux réunit un collier pendentif fleur et ses boucles d'oreilles assorties en or 18k, lovés dans un coussin en velours blanc doux, habillé d'un ruban satiné haut de gamme. Effet wahou garanti au déballage.`,
    bulletPoints: [
      'Parure complète : 1 collier pendentif doré + 1 paire de boucles d\'oreilles assorties',
      'Écrin rigide rose poudré avec finitions dorées et ruban noué',
      'Carte personnalisée de vœux offerte',
      'Sac cadeau de présentation boutique inclus'
    ],
    price: 3900,
    compareAtPrice: 4900,
    images: [
      '/images/products/coffret-cadeau-bijoux-1.jpg',
      '/images/products/coffret-cadeau-bijoux-2.jpg'
    ],
    colors: [
      { name: 'Coffret Rose Poudré & Doré', hex: '#FADADD', imageIndex: 0 },
    ],
    sizes: ['Coffret Parure Complète'],
    variants: [
      { id: 'v7', colorName: 'Coffret Rose Poudré & Doré', colorHex: '#FADADD', size: 'Coffret Parure Complète', stock: 15 },
    ],
    totalStock: 15,
    rating: 5.0,
    reviewCount: 65,
    isFeatured: true,
    isActive: true,
    badge: '-20%',
    createdAt: '2026-03-07',
  },
  {
    id: 'prod-008',
    title: 'Coffret parfum de luxe',
    slug: 'coffret-parfum-de-luxe',
    category: 'Coffrets & Packs',
    shortDescription: 'Eau de parfum envoûtante aux notes florales et ambrées dans son flacon de cristal taillé avec son coffret signature doré.',
    description: `Une fragrance sophistiquée qui laisse un sillage inoubliable. Alliant la fraîcheur de la bergamote, la noblesse du jasmin impérial et la sensualité du bois d'ambre, ce parfum incarne la féminité moderne et le luxe absolu. Présenté dans un flacon sculptural avec bouchon or ciselé.`,
    bulletPoints: [
      'Eau de parfum concentrée 100 ml longue tenue (plus de 24h)',
      'Pyramide olfactive : Jasmin d\'Orient, Vanille de Madagascar, Ambre Précieux',
      'Flacon en verre cristallin lourd avec capuchon magnétique doré',
      'Boîte coffret rigide gaufrée or ornée du sceau de la maison'
    ],
    price: 4500,
    compareAtPrice: 5800,
    images: [
      '/images/products/coffret-parfum-1.jpg',
      '/images/products/coffret-parfum-2.jpg'
    ],
    colors: [
      { name: 'Flacon Cristal & Or', hex: '#E5C158', imageIndex: 0 },
    ],
    sizes: ['Flacon 100 ml'],
    variants: [
      { id: 'v8', colorName: 'Flacon Cristal & Or', colorHex: '#E5C158', size: 'Flacon 100 ml', stock: 18 },
    ],
    totalStock: 18,
    rating: 4.9,
    reviewCount: 41,
    isFeatured: true,
    isActive: true,
    badge: '-22%',
    createdAt: '2026-03-08',
  },

  // ================= 5. MONTRES & ACCESSOIRES =================
  {
    id: 'prod-009',
    title: 'Montre élégante pour femme',
    slug: 'montre-elegante-femme',
    category: 'Montres & Accessoires',
    shortDescription: 'Montre féminine raffinée avec bracelet maillons dorés polis et cadran blanc épuré. Mouvement à quartz de haute précision.',
    description: `L'alliance parfaite de l'horlogerie et de la joaillerie. Cette montre habille le poignet d'une allure aristocratique avec son bracelet articulé en acier chirurgical doré or jaune et son cadran minimaliste orné d'index dorés. Étanche et résistante aux chocs.`,
    bulletPoints: [
      'Mouvement à quartz japonais de haute précision',
      'Verre minéral trempé inrayable',
      'Bracelet en acier inoxydable poli plaqué or 18k ajustable',
      'Fermoir déployant papillon invisible',
      'Garantie horlogère 1 an incluse'
    ],
    price: 3800,
    compareAtPrice: 4800,
    images: [
      '/images/products/montre-elegante-femme-1.jpg',
      '/images/products/montre-elegante-femme-2.jpg'
    ],
    colors: [
      { name: 'Doré Or 18k & Cadran Blanc', hex: '#D4AF37', imageIndex: 0 },
    ],
    sizes: ['Cadran 32 mm (Maillons ajustables)'],
    variants: [
      { id: 'v9', colorName: 'Doré Or 18k & Cadran Blanc', colorHex: '#D4AF37', size: 'Cadran 32 mm (Maillons ajustables)', stock: 14 },
    ],
    totalStock: 14,
    rating: 4.9,
    reviewCount: 33,
    isFeatured: true,
    isActive: true,
    badge: '-21%',
    createdAt: '2026-03-09',
  },
  {
    id: 'prod-010',
    title: 'Sac en cuir noir',
    slug: 'sac-en-cuir-noir',
    category: 'Montres & Accessoires',
    shortDescription: 'Sac à main structuré en cuir noir premium avec fermoir et finitions métalliques dorées. Bandoulière amovible et poignée élégante.',
    description: `Le sac iconique indispensable à toute garde-robe chic. Confectionné dans un cuir grainé de haute qualité, il présente une silhouette trapèze structurée, une poignée rigide et un fermoir bijou doré. Son intérieur compartimenté accueille aisément tous vos essentiels.`,
    bulletPoints: [
      'Cuir synthétique grainé haut de gamme résistant à l\'usure',
      'Attaches et fermoirs métalliques massifs plaqués or',
      'Double portée : main avec poignée rigide ou épaule avec bandoulière réglable',
      'Poche intérieure zippée et doublure textile satinée'
    ],
    price: 4900,
    compareAtPrice: 6500,
    images: [
      '/images/products/sac-cuir-noir-1.jpg',
      '/images/products/sac-cuir-noir-2.jpg'
    ],
    colors: [
      { name: 'Noir Ébène & Métal Doré', hex: '#1C1C1C', imageIndex: 0 },
    ],
    sizes: ['Taille Unique (26 x 19 x 10 cm)'],
    variants: [
      { id: 'v10', colorName: 'Noir Ébène & Métal Doré', colorHex: '#1C1C1C', size: 'Taille Unique (26 x 19 x 10 cm)', stock: 12 },
    ],
    totalStock: 12,
    rating: 5.0,
    reviewCount: 47,
    isFeatured: true,
    isActive: true,
    badge: '-25%',
    createdAt: '2026-03-10',
  },

  // ================= 6. CAFTANS & PRÊT-À-PORTER =================
  {
    id: 'prod-011',
    title: 'Caftan rouge brodé doré',
    slug: 'caftan-rouge-brode-dore',
    category: 'Caftans & Prêt-à-Porter',
    shortDescription: 'Somptueux caftan royal en velours de soie rouge rubis, richement orné de broderies dorées au fil de skalli et sfifa traditionnelle.',
    description: `Une pièce maîtresse de la haute couture traditionnelle algérienne. Taillé dans un velours de soie lourd couleur rouge rubis impérial, ce caftan est brodé à la main au fil d'or skalli pur. Il est rehaussé de boutons aâkads dorés sur toute la longueur et fourni avec sa ceinture mdamma dorée assortie pour cintrer la silhouette avec majesté.`,
    bulletPoints: [
      'Velours de soie premium rouge rubis au tombé fluide et somptueux',
      'Broderies dorées artisanales au fil de skalli résistant',
      'Sfifa et aâkads dorés travaillés à la main',
      'Ceinture mdamma assortie ajustable incluse',
      'Idéal pour mariages, fiançailles et fêtes traditionnelles algériennes'
    ],
    price: 14500,
    compareAtPrice: 18000,
    images: [
      '/images/products/caftan-rouge-1.jpg',
      '/images/products/caftan-rouge-2.jpg'
    ],
    colors: [
      { name: 'Rouge Rubis & Or Skalli', hex: '#8B0000', imageIndex: 0 },
    ],
    sizes: ['M (38-40)', 'L (42-44)', 'XL (46)', 'Sur Mesure'],
    variants: [
      { id: 'v11-1', colorName: 'Rouge Rubis & Or Skalli', colorHex: '#8B0000', size: 'M (38-40)', stock: 6 },
      { id: 'v11-2', colorName: 'Rouge Rubis & Or Skalli', colorHex: '#8B0000', size: 'L (42-44)', stock: 5 },
      { id: 'v11-3', colorName: 'Rouge Rubis & Or Skalli', colorHex: '#8B0000', size: 'XL (46)', stock: 4 },
      { id: 'v11-4', colorName: 'Rouge Rubis & Or Skalli', colorHex: '#8B0000', size: 'Sur Mesure', stock: 8 },
    ],
    totalStock: 23,
    rating: 5.0,
    reviewCount: 59,
    isFeatured: true,
    isActive: true,
    badge: '-19%',
    createdAt: '2026-03-11',
  },
  {
    id: 'prod-012',
    title: 'Robe de soirée noire',
    slug: 'robe-soiree-noire',
    category: 'Caftans & Prêt-à-Porter',
    shortDescription: 'Robe longue de soirée noire chic et vaporeuse. Coupe flatteuse et dos sublime pour vos mariages et réceptions d\'exception.',
    description: `L'incarnation du glamour moderne. Cette robe longue noire épouse subtilement la taille avant de s'évaser en un drapé gracieux jusqu'au sol. Son tissu crêpe georgette de qualité supérieure offre un tombé fluide et une allure sensationnelle sous les projecteurs.`,
    bulletPoints: [
      'Tissu crêpe georgette haut de gamme doublé, non transparent',
      'Coupe fluide et élégante qui allonge la silhouette',
      'Fermeture zippée invisible au dos avec finitions haute couture',
      'Confortable et légère à porter toute la soirée'
    ],
    price: 8500,
    compareAtPrice: 11000,
    images: [
      '/images/products/robe-soiree-noire-1.jpg',
      '/images/products/robe-soiree-noire-2.jpg'
    ],
    colors: [
      { name: 'Noir Profond', hex: '#111111', imageIndex: 0 },
    ],
    sizes: ['S (36)', 'M (38)', 'L (40)', 'XL (42)'],
    variants: [
      { id: 'v12-1', colorName: 'Noir Profond', colorHex: '#111111', size: 'S (36)', stock: 8 },
      { id: 'v12-2', colorName: 'Noir Profond', colorHex: '#111111', size: 'M (38)', stock: 10 },
      { id: 'v12-3', colorName: 'Noir Profond', colorHex: '#111111', size: 'L (40)', stock: 6 },
      { id: 'v12-4', colorName: 'Noir Profond', colorHex: '#111111', size: 'XL (42)', stock: 4 },
    ],
    totalStock: 28,
    rating: 4.9,
    reviewCount: 37,
    isFeatured: true,
    isActive: true,
    badge: '-23%',
    createdAt: '2026-03-12',
  },
];

export const INITIAL_CATEGORIES = [
  'Tous les produits',
  'Colliers & Pendentifs',
  'Bracelets & Joncs',
  'Bagues & Alliances',
  'Coffrets & Packs',
  'Montres & Accessoires',
  'Caftans & Prêt-à-Porter',
];

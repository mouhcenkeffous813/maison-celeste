import React, { useState, useRef, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  X,
  Image as ImageIcon,
  UploadCloud,
  Star,
  Layers,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Tag,
  Palette,
  Sliders
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductColor, ProductVariant } from '../../types';
import { formatPrice, calculateDiscountPercentage } from '../../utils/formatters';
import { compressImageFile } from '../../utils/imageCompressor';

export const AdminProducts: React.FC = () => {
  const {
    products,
    config,
    createProduct,
    updateProduct,
    deleteProduct,
    showToast,
    categories,
    addCategory,
    deleteCategory,
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');

  // Dynamic Category Management
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [newCategoryManagerInput, setNewCategoryManagerInput] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  // Available categories guaranteed from StoreContext & existing products
  const availableCategories = useMemo(() => {
    const set = new Set<string>(categories);
    products.forEach(p => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    return Array.from(set);
  }, [categories, products]);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Colliers & Pendentifs');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [bulletPoints, setBulletPoints] = useState<string[]>(['']);
  const [price, setPrice] = useState<number>(3500);
  const [compareAtPrice, setCompareAtPrice] = useState<number>(4500);
  const [badge, setBadge] = useState('Nouveauté');

  // Images state
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Variant Builder State: Colors & Sizes with full inline editability
  const [colors, setColors] = useState<ProductColor[]>([
    { name: 'Rose Poudré', hex: '#D48C98', imageIndex: 0 },
    { name: 'Noir Nuit', hex: '#1C1C1C', imageIndex: 0 }
  ]);

  const [sizes, setSizes] = useState<string[]>(['S (36-38)', 'M (38-40)', 'L (42)']);

  // Per-variant stocks state { "Rose Poudré_M (38-40)": 8, ... }
  const [variantStocks, setVariantStocks] = useState<Record<string, number>>({});

  // Quick photos available on the store
  const sampleLocalPhotos = [
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
  ];

  // Quick Color Presets for Algerian Boutiques
  const popularColors = [
    { name: 'Rose Poudré', hex: '#D48C98' },
    { name: 'Noir Nuit', hex: '#1C1C1C' },
    { name: 'Blanc Soie', hex: '#FAF9F6' },
    { name: 'Beige Crème', hex: '#EBE2D5' },
    { name: 'Doré 18k', hex: '#D4AF37' },
    { name: 'Argenté', hex: '#C0C0C0' },
    { name: 'Bordeaux Royal', hex: '#681B26' },
    { name: 'Vert Émeraude', hex: '#1E4938' },
    { name: 'Bleu Nuit', hex: '#1B263B' },
  ];

  // Open modal for new product
  const handleOpenCreate = () => {
    setEditingProductId(null);
    setTitle('');
    setCategory(availableCategories[0] || 'Colliers & Pendentifs');
    setIsAddingNewCategory(false);
    setNewCategoryInput('');
    setShortDescription('');
    setDescription('');
    setBulletPoints([
      'Finitions luxueuses et soignées à la main',
      'Matériaux nobles haute brillance anti-ternissement',
      'Écrin cadeau et pochon velours offerts'
    ]);
    setPrice(1900);
    setCompareAtPrice(2500);
    setImages([
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80'
    ]);
    setColors([
      { name: 'Doré 18k', hex: '#D4AF37', imageIndex: 0 },
      { name: 'Argenté', hex: '#E5E4E2', imageIndex: 1 }
    ]);
    setSizes(['Standard Ajustable']);
    setVariantStocks({});
    setBadge('Nouveauté');
    setIsModalOpen(true);
  };

  // Open modal for editing existing product
  const handleOpenEdit = (p: Product) => {
    setEditingProductId(p.id);
    setTitle(p.title);
    setCategory(p.category);
    setIsAddingNewCategory(false);
    setNewCategoryInput('');
    setShortDescription(p.shortDescription || '');
    setDescription(p.description || '');
    setBulletPoints(p.bulletPoints && p.bulletPoints.length > 0 ? p.bulletPoints : ['']);
    setPrice(p.price);
    setCompareAtPrice(p.compareAtPrice);
    setImages(p.images && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80']);
    setColors(p.colors && p.colors.length > 0 ? p.colors : [{ name: 'Standard', hex: '#D48C98', imageIndex: 0 }]);
    setSizes(p.sizes && p.sizes.length > 0 ? p.sizes : ['Standard']);
    setBadge(p.badge || '');

    // Map existing variants stock
    const stocksMap: Record<string, number> = {};
    if (p.variants && p.variants.length > 0) {
      p.variants.forEach(v => {
        const key = `${v.colorName}_${v.size}`;
        stocksMap[key] = v.stock;
      });
    }
    setVariantStocks(stocksMap);
    setIsModalOpen(true);
  };

  // ================= 1. GESTION DES IMAGES =================
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const compressedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await compressImageFile(file, 1200, 1200, 0.85);
        compressedUrls.push(dataUrl);
      }
      setImages(prev => [...prev, ...compressedUrls]);
      showToast(`${compressedUrls.length} image(s) ajoutée(s) avec succès !`, 'success');
    } catch (err) {
      console.error('Erreur téléversement:', err);
      showToast("Erreur lors de l'import de l'image", 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setImages(prev => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
      showToast('Image ajoutée à la galerie', 'success');
    }
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const filtered = images.filter((_, i) => i !== index);
    setImages([target, ...filtered]);
    showToast('Image définie comme couverture', 'info');
  };

  const handleRemoveImage = (index: number) => {
    if (images.length > 1) {
      setImages(images.filter((_, i) => i !== index));
      showToast('Image retirée', 'info');
    } else {
      showToast('Le produit doit avoir au moins une image', 'error');
    }
  };

  // ================= 2. MODIFICATION DIRECTE DES COULEURS =================
  const handleUpdateColorName = (index: number, newName: string) => {
    const oldName = colors[index].name;
    const copy = [...colors];
    copy[index] = { ...copy[index], name: newName };
    setColors(copy);

    // Update variant stock keys
    setVariantStocks(prev => {
      const next: Record<string, number> = {};
      Object.keys(prev).forEach(key => {
        const [col, ...rest] = key.split('_');
        const sizePart = rest.join('_');
        if (col === oldName) {
          next[`${newName}_${sizePart}`] = prev[key];
        } else {
          next[key] = prev[key];
        }
      });
      return next;
    });
  };

  const handleUpdateColorHex = (index: number, newHex: string) => {
    const copy = [...colors];
    copy[index] = { ...copy[index], hex: newHex };
    setColors(copy);
  };

  const handleUpdateColorImage = (colorIndex: number, imageIndex: number) => {
    const copy = [...colors];
    copy[colorIndex] = { ...copy[colorIndex], imageIndex };
    setColors(copy);
  };

  const handleAddNewColor = (name = 'Nouvelle Couleur', hex = '#D48C98') => {
    setColors(prev => [...prev, { name, hex, imageIndex: 0 }]);
    showToast(`Couleur "${name}" ajoutée`, 'success');
  };

  const handleRemoveColor = (index: number) => {
    if (colors.length <= 1) {
      showToast('Conservez au moins une couleur pour le produit', 'error');
      return;
    }
    const removedName = colors[index].name;
    setColors(colors.filter((_, i) => i !== index));
    showToast(`Couleur "${removedName}" supprimée`, 'info');
  };

  // ================= 3. MODIFICATION DIRECTE DES TAILLES / POINTURES =================
  const handleUpdateSizeName = (index: number, newName: string) => {
    const oldSize = sizes[index];
    const copy = [...sizes];
    copy[index] = newName;
    setSizes(copy);

    // Update variant stock keys
    setVariantStocks(prev => {
      const next: Record<string, number> = {};
      Object.keys(prev).forEach(key => {
        const [col, ...rest] = key.split('_');
        const currentSize = rest.join('_');
        if (currentSize === oldSize) {
          next[`${col}_${newName}`] = prev[key];
        } else {
          next[key] = prev[key];
        }
      });
      return next;
    });
  };

  const handleAddNewSize = (sizeName = 'Nouvelle Taille') => {
    setSizes(prev => [...prev, sizeName]);
    showToast(`Taille "${sizeName}" ajoutée`, 'success');
  };

  const handleRemoveSize = (index: number) => {
    if (sizes.length <= 1) {
      showToast('Conservez au moins une taille ou pointure', 'error');
      return;
    }
    const removed = sizes[index];
    setSizes(sizes.filter((_, i) => i !== index));
    showToast(`Taille "${removed}" supprimée`, 'info');
  };

  // Apply complete preset lists (Shoes 36-41, Clothing S-XL, Jewellery, Perfume)
  const handleApplyPresetSizes = (presetName: string, presetList: string[]) => {
    setSizes(presetList);
    showToast(`Modèle "${presetName}" appliqué : ${presetList.join(', ')}`, 'success');
  };

  // ================= 4. GESTION DES STOCKS =================
  const handleVariantStockChange = (colorName: string, size: string, stock: number) => {
    const key = `${colorName}_${size}`;
    setVariantStocks(prev => ({
      ...prev,
      [key]: Math.max(0, stock)
    }));
  };

  const generateVariantsMatrix = (): ProductVariant[] => {
    const list: ProductVariant[] = [];
    colors.forEach(c => {
      sizes.forEach(s => {
        const key = `${c.name}_${s}`;
        const stock = variantStocks[key] !== undefined ? variantStocks[key] : 8;
        list.push({
          id: `v_${c.name}_${s}`.replace(/\s+/g, '_'),
          colorName: c.name,
          colorHex: c.hex,
          size: s,
          stock,
        });
      });
    });
    return list;
  };

  // Bullet points
  const handleAddBulletPoint = () => setBulletPoints([...bulletPoints, '']);
  const handleBulletPointChange = (idx: number, val: string) => {
    const copy = [...bulletPoints];
    copy[idx] = val;
    setBulletPoints(copy);
  };
  const handleRemoveBulletPoint = (idx: number) => {
    setBulletPoints(bulletPoints.filter((_, i) => i !== idx));
  };

  // ================= 5. SOUMISSION & ENREGISTREMENT =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Veuillez saisir un titre pour le produit', 'error');
      return;
    }

    if (images.length === 0) {
      showToast('Veuillez ajouter au moins une photo pour le produit', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const cleanBulletPoints = bulletPoints.filter(b => b.trim().length > 0);
      const variants = generateVariantsMatrix();
      const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

      if (editingProductId) {
        await updateProduct(editingProductId, {
          title: title.trim(),
          category,
          shortDescription: shortDescription.trim(),
          description: description.trim() || shortDescription.trim(),
          bulletPoints: cleanBulletPoints.length > 0 ? cleanBulletPoints : ['Qualité supérieure garantie'],
          price: Number(price),
          compareAtPrice: Number(compareAtPrice),
          images,
          colors,
          sizes,
          variants,
          totalStock,
          badge: badge.trim() || undefined,
        });
        showToast('Modifications enregistrées avec succès !', 'success');
      } else {
        await createProduct({
          title: title.trim(),
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          category,
          shortDescription: shortDescription.trim(),
          description: description.trim() || shortDescription.trim(),
          bulletPoints: cleanBulletPoints.length > 0 ? cleanBulletPoints : ['Qualité supérieure garantie'],
          price: Number(price),
          compareAtPrice: Number(compareAtPrice),
          images,
          colors,
          sizes,
          variants,
          totalStock,
          rating: 5.0,
          reviewCount: 1,
          isFeatured: false,
          isActive: true,
          badge: badge.trim() || undefined,
        });
        showToast('Nouveau produit créé avec succès !', 'success');
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleProductActive = async (p: Product) => {
    await updateProduct(p.id, { isActive: !p.isActive });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
            Gestion des Produits, Couleurs & Pointures
          </h2>
          <p className="text-xs text-stone-500">
            Personnalisez vos photos, modifiez directement vos couleurs et pointures, et gérez vos stocks en direct.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Button to open Category Manager */}
          <button
            onClick={() => setIsCategoryManagerOpen(true)}
            className="px-3.5 py-2.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
            title="Gérer, ajouter et supprimer des catégories"
          >
            <Layers className="w-4 h-4 text-store-primary" />
            <span>Gérer les Catégories ({categories.length})</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-store-primary hover:bg-store-primary-hover text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-soft transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un Produit</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setSelectedFilterCategory('all')}
          className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedFilterCategory === 'all'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white text-stone-600 border border-store-border hover:bg-stone-50'
          }`}
        >
          Toutes ({products.length})
        </button>
        {availableCategories.map((cat: string) => {
          const count = products.filter(p => p.category === cat).length;
          return (
            <div key={cat} className="flex items-center group">
              <button
                onClick={() => setSelectedFilterCategory(cat)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedFilterCategory === cat
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-store-border hover:bg-stone-50'
                }`}
              >
                {cat} ({count})
              </button>
            </div>
          );
        })}

        {/* Shortcut to Category Manager */}
        <button
          onClick={() => setIsCategoryManagerOpen(true)}
          className="px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap border border-dashed border-store-primary/60 text-store-primary bg-store-primary/5 hover:bg-store-primary/15 transition-all flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Gérer / Supprimer</span>
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products
          .filter(p => selectedFilterCategory === 'all' || p.category === selectedFilterCategory)
          .map(product => {
          const discount = calculateDiscountPercentage(product.price, product.compareAtPrice);
          return (
            <div
              key={product.id}
              className={`bg-white rounded-3xl border ${
                product.isActive ? 'border-store-border' : 'border-dashed border-stone-300 opacity-70'
              } p-4 shadow-card flex flex-col justify-between`}
            >
              <div>
                {/* Image & Badges */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-stone-100 mb-3">
                  <img
                    src={product.images[0] || '/logo-icon.svg'}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  {discount > 0 && (
                    <span className="absolute top-2 right-2 bg-store-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      -{discount}%
                    </span>
                  )}
                  {product.badge && (
                    <span className="absolute top-2 left-2 bg-stone-900/80 text-white text-[9px] px-2 py-0.5 rounded-full">
                      {product.badge}
                    </span>
                  )}
                  <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                    {product.images.length} photo(s)
                  </span>
                </div>

                {/* Category & Stock */}
                <div className="flex items-center justify-between text-[11px] text-store-primary font-semibold mb-1">
                  <span>{product.category}</span>
                  <span className={`font-bold ${product.totalStock > 0 ? 'text-stone-700' : 'text-rose-500'}`}>
                    Stock: {product.totalStock} pcs {product.totalStock === 0 && '(Épuisé)'}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-stone-900 line-clamp-2 leading-snug">
                  {product.title}
                </h3>

                {/* Price */}
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-mono font-bold text-base text-stone-900">
                    {formatPrice(product.price, config.currency)}
                  </span>
                  {product.compareAtPrice > product.price && (
                    <span className="text-xs text-stone-400 line-through">
                      {formatPrice(product.compareAtPrice, config.currency)}
                    </span>
                  )}
                </div>

                {/* Colors & Sizes summary */}
                <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                  <div className="flex items-center gap-1.5">
                    {product.colors.map((c, i) => (
                      <span
                        key={i}
                        className="w-3 h-3 rounded-full border border-stone-300 shadow-xs"
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                    <span className="text-[11px] font-medium text-stone-500 ml-1">
                      {product.colors.length} coul.
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-stone-700">
                    {product.sizes.length} taille(s)/pt.
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => toggleProductActive(product)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    product.isActive
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {product.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{product.isActive ? 'Actif' : 'Masqué'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(product)}
                    className="px-3 py-1.5 rounded-xl bg-store-secondary hover:bg-store-primary hover:text-white text-stone-800 transition-colors flex items-center gap-1.5 text-xs font-bold"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Supprimer définitivement "${product.title}" ?`)) {
                        deleteProduct(product.id);
                      }
                    }}
                    className="p-1.5 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= MODAL DE MODIFICATION DU PRODUIT ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-8 shadow-2xl z-10 my-6 max-h-[92vh] overflow-y-auto animate-scaleUp">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-5">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                  {editingProductId ? 'Modifier le Produit' : 'Nouveau Produit'}
                </h3>
                <p className="text-xs text-stone-500">
                  Personnalisez vos photos, vos couleurs et vos pointures avec accès de modification direct.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* ================= SECTION 1 : INFORMATIONS PRINCIPALES ================= */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Titre de l'article <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ex: Caftan Sirène ou Escarpins Satin"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary font-medium"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                        Catégorie <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNewCategory(!isAddingNewCategory);
                          if (!isAddingNewCategory) {
                            setNewCategoryInput('');
                          }
                        }}
                        className="text-[11px] font-bold text-store-primary hover:underline flex items-center gap-1 transition-colors"
                      >
                        {isAddingNewCategory ? (
                          <span>📋 Choisir existante</span>
                        ) : (
                          <span>➕ Nouvelle Catégorie</span>
                        )}
                      </button>
                    </div>

                    {isAddingNewCategory ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          required
                          placeholder="Nom de la nouvelle catégorie..."
                          value={newCategoryInput}
                          onChange={e => {
                            setNewCategoryInput(e.target.value);
                            setCategory(e.target.value);
                          }}
                          className="flex-1 px-3 py-2 text-xs sm:text-sm bg-store-base rounded-xl border-2 border-store-primary focus:outline-none font-bold text-stone-900"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (newCategoryInput.trim()) {
                              await addCategory(newCategoryInput.trim());
                              setCategory(newCategoryInput.trim());
                              setIsAddingNewCategory(false);
                            }
                          }}
                          className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <select
                        value={category}
                        onChange={e => {
                          if (e.target.value === '__NEW__') {
                            setIsAddingNewCategory(true);
                            setNewCategoryInput('');
                          } else {
                            setCategory(e.target.value);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary font-semibold text-stone-900"
                      >
                        {availableCategories.map((cat: string) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                        <option value="__NEW__" className="text-store-primary font-bold">
                          ➕ + Ajouter une nouvelle catégorie...
                        </option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Price, Old price, Promo badge */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Prix Actuel (DA) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={50}
                      value={price}
                      onChange={e => setPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary font-mono font-bold text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Ancien Prix Barré (DA)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={compareAtPrice}
                      onChange={e => setCompareAtPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary font-mono text-stone-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Badge Promo
                    </label>
                    <input
                      type="text"
                      placeholder="ex: -20%, Coup de Cœur"
                      value={badge}
                      onChange={e => setBadge(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary font-medium"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Description Courte (Accroche) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Points forts de la pièce..."
                    value={shortDescription}
                    onChange={e => setShortDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary resize-none"
                  />
                </div>
              </div>

              {/* ================= SECTION 2 : GALERIE PHOTOS ================= */}
              <div className="bg-store-secondary/40 rounded-3xl p-5 border border-store-border space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-store-primary" />
                      <span>Galerie Photos ({images.length} photos)</span>
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Importez vos photos depuis votre téléphone ou ordinateur.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* File Upload Button */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 rounded-2xl border-2 border-dashed border-store-primary/60 bg-white hover:bg-store-primary-light/40 transition-all cursor-pointer flex flex-col items-center justify-center text-center group"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    <div className="w-9 h-9 rounded-full bg-store-secondary text-store-primary flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-stone-900">
                      {isUploading ? 'Chargement en cours...' : '📁 Téléverser des photos (Appareil)'}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Cliquez pour parcourir vos fichiers
                    </span>
                  </div>

                  {/* Add by URL */}
                  <div className="p-4 rounded-2xl border border-store-border bg-white flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-800 block mb-1">
                        Ou coller un lien URL web
                      </span>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={newImageUrl}
                        onChange={e => setNewImageUrl(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="mt-2 w-full py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold"
                    >
                      Ajouter par URL
                    </button>
                  </div>
                </div>

                {/* Photos List */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative rounded-2xl overflow-hidden border-2 bg-white shadow-xs p-1.5 flex flex-col justify-between ${
                        idx === 0 ? 'border-store-primary ring-2 ring-store-primary/20' : 'border-stone-200'
                      }`}
                    >
                      <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 relative mb-1.5">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1.5 left-1.5 bg-store-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            <span>Couverture</span>
                          </span>
                        )}
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded font-mono">
                          #{idx + 1}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1 pt-0.5">
                        {idx !== 0 ? (
                          <button
                            type="button"
                            onClick={() => handleSetCover(idx)}
                            className="text-[10px] font-bold text-store-primary hover:underline"
                          >
                            Mettre 1ère
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-stone-400">Principale</span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ================= SECTION 3 : ÉDITION DIRECTE DES COULEURS ================= */}
              <div className="bg-store-secondary/40 rounded-3xl p-5 border border-store-border space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-store-primary" />
                      <span>Gestion & Modification des Couleurs ({colors.length})</span>
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Vous avez un accès direct pour renommer chaque couleur, ajuster sa teinte HEX et lui associer une photo.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddNewColor()}
                    className="px-3 py-1.5 bg-store-primary hover:bg-store-primary-hover text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter une couleur</span>
                  </button>
                </div>

                {/* Popular Palette Quick Add */}
                <div className="bg-white p-3 rounded-2xl border border-store-border">
                  <p className="text-[11px] font-bold text-stone-600 mb-1.5 uppercase tracking-wider">
                    Suggestions de couleurs rapides en 1 clic :
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {popularColors.map(pc => (
                      <button
                        key={pc.name}
                        type="button"
                        onClick={() => handleAddNewColor(pc.name, pc.hex)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-50 hover:bg-stone-100 border border-stone-200 text-[11px] transition-colors"
                      >
                        <span className="w-2.5 h-2.5 rounded-full border border-stone-300" style={{ backgroundColor: pc.hex }} />
                        <span>+ {pc.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editable Colors List (Direct inline inputs!) */}
                <div className="space-y-2">
                  {colors.map((color, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-2xl border border-store-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Left: Color Picker & Color Name Input */}
                      <div className="flex items-center gap-2.5 flex-1">
                        <div className="relative flex-shrink-0">
                          <input
                            type="color"
                            value={color.hex}
                            onChange={e => handleUpdateColorHex(idx, e.target.value)}
                            className="w-10 h-10 rounded-xl border border-stone-300 cursor-pointer p-0.5"
                            title="Cliquez pour changer la couleur"
                          />
                        </div>

                        <div className="flex-1">
                          <label className="block text-[10px] text-stone-400 font-bold uppercase">
                            Nom de la couleur #{idx + 1}
                          </label>
                          <input
                            type="text"
                            value={color.name}
                            onChange={e => handleUpdateColorName(idx, e.target.value)}
                            placeholder="ex: Rose Poudré, Or, Argent..."
                            className="w-full px-3 py-1.5 text-xs font-bold text-stone-900 bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary"
                          />
                        </div>
                      </div>

                      {/* Right: Associated Image & Delete */}
                      <div className="flex items-center gap-2">
                        {images.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <label className="text-[10px] text-stone-500 font-medium">
                              Photo liée :
                            </label>
                            <select
                              value={color.imageIndex ?? 0}
                              onChange={e => handleUpdateColorImage(idx, Number(e.target.value))}
                              className="px-2 py-1 text-xs bg-store-base border border-stone-300 rounded-lg focus:outline-none"
                            >
                              {images.map((_, i) => (
                                <option key={i} value={i}>
                                  Photo #{i + 1} {i === 0 ? '(Couverture)' : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveColor(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Supprimer cette couleur"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ================= SECTION 4 : ÉDITION DIRECTE DES TAILLES / POINTURES ================= */}
              <div className="bg-store-secondary/40 rounded-3xl p-5 border border-store-border space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-store-primary" />
                      <span>Gestion des Tailles & Pointures ({sizes.length})</span>
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Modifiez directement chaque taille ou pointure en tapant dedans (ex: 36, 37, 38 ou S, M, L).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddNewSize()}
                    className="px-3 py-1.5 bg-store-primary hover:bg-store-primary-hover text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ajouter une taille</span>
                  </button>
                </div>

                {/* Presets by Product Type */}
                <div className="bg-white p-3 rounded-2xl border border-store-border space-y-2">
                  <p className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                    Changer de type en 1 clic selon votre article :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyPresetSizes('Chaussures & Escarpins', ['36', '37', '38', '39', '40', '41'])}
                      className="px-3 py-1.5 rounded-xl bg-store-secondary hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1 border border-store-border transition-colors"
                    >
                      <span>👠 Pointures Chaussures (36, 37, 38, 39, 40, 41)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPresetSizes('Robes & Caftans', ['S (36-38)', 'M (38-40)', 'L (42)', 'XL (44)', 'XXL (46)'])}
                      className="px-3 py-1.5 rounded-xl bg-store-secondary hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1 border border-store-border transition-colors"
                    >
                      <span>👗 Vêtements (S, M, L, XL, XXL)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPresetSizes('Bijoux & Accessoires', ['Standard Ajustable', 'Doré 18k', 'Argent 925'])}
                      className="px-3 py-1.5 rounded-xl bg-store-secondary hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1 border border-store-border transition-colors"
                    >
                      <span>💍 Bijoux (Standard, Doré, Argent)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPresetSizes('Taille Unique', ['Format Unique'])}
                      className="px-3 py-1.5 rounded-xl bg-store-secondary hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1 border border-store-border transition-colors"
                    >
                      <span>🏷️ Format / Taille Unique</span>
                    </button>
                  </div>
                </div>

                {/* Editable Sizes List (Direct Text Inputs!) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {sizes.map((size, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-2.5 rounded-2xl border border-store-border shadow-xs flex items-center justify-between gap-2"
                    >
                      <div className="flex-1">
                        <label className="block text-[9px] text-stone-400 font-bold uppercase">
                          Taille / Pointure #{idx + 1}
                        </label>
                        <input
                          type="text"
                          value={size}
                          onChange={e => handleUpdateSizeName(idx, e.target.value)}
                          placeholder="ex: 37 ou M"
                          className="w-full px-2.5 py-1 text-xs font-bold text-stone-900 bg-store-base rounded-lg border border-store-border focus:outline-none focus:border-store-primary"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveSize(idx)}
                        className="p-1.5 text-stone-400 hover:text-rose-500 rounded-lg"
                        title="Supprimer cette taille"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ================= SECTION 5 : GESTION DES STOCKS PAR VARIANTE ================= */}
              <div className="bg-store-secondary/40 rounded-3xl p-5 border border-store-border space-y-4">
                <div>
                  <h4 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-store-primary" />
                    <span>Tableau des Stocks par Combinaison ({colors.length * sizes.length} variantes)</span>
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Ajustez la quantité disponible pour chaque combinaison. Mettez <strong>0</strong> pour afficher "Épuisé" sur la boutique.
                  </p>
                </div>

                <div className="max-h-64 overflow-y-auto rounded-2xl border border-stone-200 bg-white divide-y divide-stone-100">
                  {colors.map(col =>
                    sizes.map(siz => {
                      const key = `${col.name}_${siz}`;
                      const currentVal =
                        variantStocks[key] !== undefined ? variantStocks[key] : 8;
                      const isOutOfStock = currentVal === 0;

                      return (
                        <div
                          key={key}
                          className={`p-3 flex items-center justify-between gap-3 text-xs ${
                            isOutOfStock ? 'bg-rose-50/50' : 'hover:bg-stone-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-xs flex-shrink-0"
                              style={{ backgroundColor: col.hex }}
                            />
                            <span className="font-bold text-stone-900">{col.name}</span>
                            <span className="text-stone-300">/</span>
                            <span className="font-bold text-store-primary bg-store-primary/10 px-2 py-0.5 rounded-md">
                              {siz}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isOutOfStock
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isOutOfStock ? 'Rupture (Épuisé)' : 'En Stock'}
                            </span>

                            <div className="flex items-center gap-1.5">
                              <label className="text-[11px] text-stone-500">Qté :</label>
                              <input
                                type="number"
                                min={0}
                                value={currentVal}
                                onChange={e =>
                                  handleVariantStockChange(col.name, siz, Number(e.target.value))
                                }
                                className="w-16 px-2 py-1 text-center font-mono font-bold text-xs bg-store-base border border-stone-300 rounded-lg focus:outline-none focus:border-store-primary"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-2xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-8 py-3.5 bg-store-primary hover:bg-store-primary-hover text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-soft flex items-center gap-2 transition-all active:scale-[0.98]"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingProductId ? 'Sauvegarder les modifications' : 'Créer le produit'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ================= MODAL GESTION DES CATÉGORIES (AJOUT & SUPPRESSION) ================= */}
      {isCategoryManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-store-border flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 border-b border-store-border flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-store-primary/10 flex items-center justify-center text-store-primary">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900">
                    Gestion des Catégories
                  </h3>
                  <p className="text-xs text-stone-500">
                    Ajoutez ou supprimez vos catégories de boutique en toute sécurité.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCategoryManagerOpen(false);
                  setCategoryToDelete(null);
                }}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              {/* Form to add a new category */}
              <div className="bg-store-base p-4 rounded-2xl border border-store-border shadow-xs">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                  ➕ Ajouter une Nouvelle Catégorie
                </label>
                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    if (!newCategoryManagerInput.trim()) return;
                    await addCategory(newCategoryManagerInput.trim());
                    setNewCategoryManagerInput('');
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    required
                    placeholder="ex: Parfums & Brumes, Coffrets Cadeaux..."
                    value={newCategoryManagerInput}
                    onChange={e => setNewCategoryManagerInput(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-white rounded-xl border border-store-border focus:outline-none focus:border-store-primary font-medium"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-store-primary hover:bg-store-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter</span>
                  </button>
                </form>
              </div>

              {/* List of categories with count and delete button */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Catégories Actuelles ({categories.length})
                  </p>
                  <span className="text-[11px] text-stone-400">
                    Cliquez sur 🗑️ pour supprimer
                  </span>
                </div>

                <div className="space-y-2">
                  {categories.map(cat => {
                    const count = products.filter(p => p.category === cat).length;
                    const isDeleting = categoryToDelete === cat;
                    const fallback = categories.find(c => c !== cat) || 'Général';

                    return (
                      <div
                        key={cat}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isDeleting
                            ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-200'
                            : 'bg-white border-store-border hover:border-store-primary/40'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-2.5 h-2.5 rounded-full bg-store-primary flex-shrink-0" />
                            <span className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                              {cat}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-600 flex-shrink-0">
                              {count} {count > 1 ? 'articles' : 'article'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => setCategoryToDelete(isDeleting ? null : cat)}
                              className={`p-2 rounded-xl transition-all ${
                                isDeleting
                                  ? 'bg-rose-200 text-rose-800'
                                  : 'text-stone-400 hover:text-rose-600 hover:bg-rose-50'
                              }`}
                              title={`Supprimer la catégorie « ${cat} »`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Confirmation panel if this category is marked for deletion */}
                        {isDeleting && (
                          <div className="mt-3 pt-3 border-t border-rose-200 text-xs">
                            <p className="text-rose-900 font-semibold mb-1.5">
                              ⚠️ Confirmer la suppression de la catégorie « {cat} » ?
                            </p>
                            <p className="text-[11px] text-rose-700 mb-3 leading-relaxed">
                              {count > 0 ? (
                                <>
                                  Les <strong>{count} article(s)</strong> de cette catégorie seront automatiquement transférés vers <strong>« {fallback} »</strong> pour éviter toute perte.
                                </>
                              ) : (
                                'Cette catégorie ne contient aucun produit et sera retirée instantanément.'
                              )}
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={async () => {
                                  if (categories.length <= 1) {
                                    showToast('Vous devez conserver au moins 1 catégorie dans votre boutique.', 'error');
                                    return;
                                  }
                                  await deleteCategory(cat);
                                  setCategoryToDelete(null);
                                  if (selectedFilterCategory === cat) {
                                    setSelectedFilterCategory('all');
                                  }
                                }}
                                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Oui, Supprimer</span>
                              </button>
                              <button
                                onClick={() => setCategoryToDelete(null)}
                                className="px-3.5 py-1.5 bg-white border border-stone-300 text-stone-700 font-semibold text-xs rounded-xl hover:bg-stone-100 transition-all"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-store-border bg-stone-50 flex justify-end">
              <button
                onClick={() => {
                  setIsCategoryManagerOpen(false);
                  setCategoryToDelete(null);
                }}
                className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-all shadow-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

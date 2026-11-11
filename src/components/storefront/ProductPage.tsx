import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  User,
  Phone,
  MapPin,
  Building,
  Home as HomeIcon,
  ShoppingBag,
  Sparkles,
  AlertCircle,
  MessageCircle,
  ThumbsUp,
  Plus,
  Minus,
  Share2,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../../context/StoreContext';
import { Product, ProductVariant, Order } from '../../types';
import { calculateDiscountPercentage, formatPrice, validateAlgerianPhone, formatAlgerianPhone } from '../../utils/formatters';

interface ProductPageProps {
  productId: string;
}

export const ProductPage: React.FC<ProductPageProps> = ({ productId }) => {
  const {
    products,
    wilayas,
    config,
    reviews,
    createOrder,
    openProductPage,
    setCurrentView,
    addReview,
    showToast,
  } = useStore();

  const product = products.find(p => p.id === productId) || products[0];

  // Carousel Image State
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Variant Selection State
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors && product.colors.length > 0 ? product.colors[0].name : ''
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : ''
  );

  // When product changes, reset variants
  useEffect(() => {
    if (product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0].name);
    }
    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
    setActiveImageIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  // Handle color change and auto-sync carousel image if configured
  const handleColorSelect = (colorName: string, imageIndex?: number) => {
    setSelectedColor(colorName);
    if (imageIndex !== undefined && imageIndex < product.images.length) {
      setActiveImageIndex(imageIndex);
    }
  };

  // Check stock for a specific size with currently selected color
  const getVariantStock = (size: string, color: string): number => {
    const variant = product.variants.find(
      v => v.size === size && v.colorName === color
    );
    return variant ? variant.stock : 10; // Fallback stock
  };

  const isCurrentVariantAvailable = useMemo(() => {
    if (!product.variants || product.variants.length === 0) return true;
    const variant = product.variants.find(
      v => v.colorName === selectedColor && v.size === selectedSize
    );
    return variant ? variant.stock > 0 : true;
  }, [product, selectedColor, selectedSize]);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedWilayaId, setSelectedWilayaId] = useState<number>(16); // Default Alger (16)
  const [selectedCommune, setSelectedCommune] = useState<string>('Alger Centre');
  const [address, setAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState<'home' | 'desk'>('home');
  const [quantity, setQuantity] = useState(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewWilaya, setNewReviewWilaya] = useState('Alger');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  // Target element for scroll-to-form
  const orderFormRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Scroll listener for sticky bottom bar
  useEffect(() => {
    const handleScroll = () => {
      if (orderFormRef.current) {
        const rect = orderFormRef.current.getBoundingClientRect();
        // Show sticky bar once user scrolls past top of order form or is on mobile
        setShowStickyBar(rect.top > window.innerHeight || rect.bottom < 150);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Wilaya details & communes calculation
  const currentWilaya = useMemo(() => {
    return wilayas.find(w => w.id === selectedWilayaId) || wilayas[15]; // Default 16 - Alger
  }, [wilayas, selectedWilayaId]);

  // Update commune when wilaya changes
  useEffect(() => {
    if (currentWilaya && currentWilaya.communes.length > 0) {
      if (!currentWilaya.communes.includes(selectedCommune)) {
        setSelectedCommune(currentWilaya.communes[0]);
      }
    }
  }, [currentWilaya]);

  // Real-time Pricing Calculations
  const productSubtotal = product.price * quantity;
  const isFreeShipping = productSubtotal >= config.freeShippingThreshold;
  
  const shippingFee = useMemo(() => {
    if (!currentWilaya) return 0;
    if (isFreeShipping) return 0;
    return deliveryType === 'home' ? currentWilaya.homeDeliveryPrice : currentWilaya.stopDeskPrice;
  }, [currentWilaya, deliveryType, isFreeShipping]);

  const grandTotal = productSubtotal + shippingFee;
  const discount = calculateDiscountPercentage(product.price, product.compareAtPrice);

  // Product reviews
  const productReviews = reviews.filter(r => r.productId === product.id);

  const isSubmittingRef = useRef(false);

  // Form Submission
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isSubmittingRef.current) return;
    const errors: Record<string, string> = {};

    if (!customerName.trim()) {
      errors.customerName = 'Veuillez saisir votre nom complet.';
    }

    if (!customerPhone.trim()) {
      errors.customerPhone = 'Veuillez renseigner votre numéro de téléphone.';
    } else if (!validateAlgerianPhone(customerPhone)) {
      errors.customerPhone = 'Numéro invalide (ex: 0555123456, 10 chiffres).';
    }

    if (!address.trim()) {
      errors.address = 'Veuillez indiquer votre adresse de livraison.';
    }

    if (!isCurrentVariantAvailable) {
      errors.variant = 'Cette variante est actuellement en rupture de stock.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('Veuillez corriger les champs requis', 'error');
      if (orderFormRef.current) {
        orderFormRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    setFormErrors({});
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const order = await createOrder({
        customerName: customerName.trim(),
        customerPhone: formatAlgerianPhone(customerPhone.trim()),
        wilayaId: currentWilaya.id,
        wilayaName: currentWilaya.name,
        commune: selectedCommune,
        address: address.trim(),
        deliveryType,
        productId: product.id,
        productTitle: product.title,
        productImage: product.images[activeImageIndex] || product.images[0],
        selectedColor,
        selectedSize,
        quantity,
        unitPrice: product.price,
        productTotal: productSubtotal,
        shippingFee,
        grandTotal,
        status: 'pending',
        notes: `Commande Storefront COD - ${deliveryType === 'home' ? 'À Domicile' : 'Stop Desk'}`,
      });

      // Confetti celebration!
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#D48C98', '#E05A6D', '#F9F1F0', '#2B2B2B', '#FFD700'],
      });

      setCompletedOrder(order);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      showToast('Une erreur est survenue lors de la validation.', 'error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 500);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) {
      showToast('Veuillez remplir votre nom et votre commentaire', 'error');
      return;
    }

    await addReview({
      productId: product.id,
      author: newReviewAuthor.trim(),
      wilaya: newReviewWilaya,
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      verifiedPurchase: true,
    });

    setIsReviewModalOpen(false);
    setNewReviewAuthor('');
    setNewReviewComment('');
    setNewReviewRating(5);
  };

  const scrollToForm = () => {
    if (orderFormRef.current) {
      orderFormRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Related products (same category or others)
  const relatedProducts = products
    .filter(p => p.id !== product.id && (p.category === product.category || p.isFeatured))
    .slice(0, 4);

  return (
    <div className="pb-28">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-stone-500">
        <button onClick={() => setCurrentView('home')} className="hover:text-store-primary">
          Accueil
        </button>
        <span>/</span>
        <span className="hover:text-stone-700">{product.category}</span>
        <span>/</span>
        <span className="text-stone-900 font-medium truncate max-w-[180px] sm:max-w-none">
          {product.title}
        </span>
      </div>

      {/* Main Order Success State */}
      {completedOrder ? (
        <div className="max-w-2xl mx-auto px-4 py-8 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-10 text-center shadow-luxury">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full mb-2">
              COMMANDE CONFIRMÉE AVEC SUCCÈS
            </span>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
              Merci pour votre commande, {completedOrder.customerName} !
            </h2>

            <p className="text-sm text-stone-600 mb-6">
              Votre numéro de commande est{' '}
              <strong className="text-stone-900 font-mono bg-stone-100 px-2 py-0.5 rounded">
                {completedOrder.orderNumber}
              </strong>
              . Notre service client va vous contacter par téléphone ou WhatsApp dans les plus brefs délais pour confirmer l'expédition.
            </p>

            {/* Recap Box */}
            <div className="bg-store-secondary/40 rounded-2xl p-4 sm:p-6 text-left border border-store-border mb-6 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={completedOrder.productImage}
                  alt={completedOrder.productTitle}
                  className="w-14 h-14 object-cover rounded-xl border border-stone-200"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                    {completedOrder.productTitle}
                  </h4>
                  <p className="text-xs text-stone-600">
                    Variante : <strong>{completedOrder.selectedColor}</strong> | Taille :{' '}
                    <strong>{completedOrder.selectedSize}</strong>
                  </p>
                  <p className="text-xs text-stone-500">
                    Quantité : {completedOrder.quantity} x {formatPrice(completedOrder.unitPrice, config.currency)}
                  </p>
                </div>
              </div>

              <div className="border-t border-store-border pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Destination</span>
                  <span className="font-medium text-stone-900">
                    {completedOrder.wilayaName} ({completedOrder.commune})
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Mode de livraison</span>
                  <span className="font-medium text-stone-900">
                    {completedOrder.deliveryType === 'home' ? 'À Domicile' : 'Au Bureau (Stop Desk)'}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Frais de livraison</span>
                  <span className="font-medium text-stone-900">
                    {completedOrder.shippingFee === 0 ? 'GRATUIT' : formatPrice(completedOrder.shippingFee, config.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Montant Total à Payer (COD)</span>
                  <span className="text-store-primary font-mono text-base">
                    {formatPrice(completedOrder.grandTotal, config.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Bonjour, je viens de passer la commande ${completedOrder.orderNumber} au nom de ${completedOrder.customerName}. Je souhaite confirmer ma commande.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Confirmer plus vite sur WhatsApp</span>
              </a>

              <button
                onClick={() => {
                  setCompletedOrder(null);
                  setCurrentView('home');
                }}
                className="py-3 px-5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors"
              >
                Continuer mes achats
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Product Page View */
        <div className="max-w-6xl mx-auto px-4 mt-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* LEFT / TOP: Image Gallery (5 cols desktop) */}
            <div className="lg:col-span-5 space-y-3">
              {/* Main Image Carousel */}
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-store-border shadow-card select-none">
                <img
                  src={product.images[activeImageIndex] || product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover object-center transition-all duration-300"
                />

                {/* Discount Badge */}
                {discount > 0 && (
                  <div className="absolute top-4 right-4 bg-store-accent text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                    -{discount}% PROMO
                  </div>
                )}

                {/* Carousel Left / Right Arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIndex(prev =>
                          prev === 0 ? product.images.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-stone-800 shadow-md backdrop-blur-xs transition-transform active:scale-90"
                      aria-label="Image précédente"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveImageIndex(prev =>
                          prev === product.images.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-stone-800 shadow-md backdrop-blur-xs transition-transform active:scale-90"
                      aria-label="Image suivante"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Image Dots Indicator on Mobile */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                  {product.images.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        activeImageIndex === idx
                          ? 'w-6 bg-store-primary'
                          : 'w-1.5 bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Clickable Thumbnails Row */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto py-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        activeImageIndex === idx
                          ? 'border-store-primary ring-2 ring-store-primary/20 scale-105'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Guarantees Box */}
              <div className="bg-store-secondary/50 rounded-2xl p-4 border border-store-border space-y-2.5 hidden sm:block">
                <div className="flex items-center gap-2.5 text-xs text-stone-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Paiement en espèces à la livraison après inspection</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-stone-700">
                  <Truck className="w-4 h-4 text-store-primary flex-shrink-0" />
                  <span>Livraison express 24h - 48h dans les 58 Wilayas</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-stone-700">
                  <RotateCcw className="w-4 h-4 text-stone-500 flex-shrink-0" />
                  <span>Possibilité d'échange de taille sans tracas</span>
                </div>
              </div>
            </div>

            {/* RIGHT: Product Details + Variant Builder + High Conversion COD Form (7 cols desktop) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Product Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-store-primary tracking-wider uppercase bg-store-primary/10 px-2.5 py-0.5 rounded-full">
                    {product.category}
                  </span>
                  
                  {/* Rating Badge */}
                  <div className="flex items-center gap-1 text-xs text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-bold text-stone-800">{product.rating}</span>
                    <span className="text-stone-500 text-[11px]">({product.reviewCount} avis)</span>
                  </div>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-snug">
                  {product.title}
                </h1>

                {/* Price Display matching Screenshot 3 */}
                <div className="mt-2.5 flex items-baseline gap-2.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-rose-500 font-mono">
                    {formatPrice(product.price, config.currency)}
                  </span>
                  {product.compareAtPrice > product.price && (
                    <span className="text-sm sm:text-base text-rose-300 line-through decoration-rose-300">
                      {formatPrice(product.compareAtPrice, config.currency)}
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="text-xs font-bold text-white bg-rose-500 px-2 py-0.5 rounded-full shadow-xs">
                      -{discount}%
                    </span>
                  )}
                </div>

                {/* Short Description */}
                <p className="mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
                  {product.shortDescription}
                </p>

                {/* Key Bullet Points */}
                {product.bulletPoints && product.bulletPoints.length > 0 && (
                  <ul className="mt-3 space-y-1.5 text-xs text-stone-700 bg-store-secondary/30 p-3 rounded-xl border border-store-border/60">
                    {product.bulletPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-store-primary flex-shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* ================= SECTION 2 : DYNAMIC VARIANT SELECTOR ================= */}
              <div className="bg-white rounded-2xl border border-store-border p-4 sm:p-5 shadow-xs space-y-4">
                
                {/* 1. Colors Swatches */}
                {product.colors && product.colors.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                        Couleur : <span className="text-store-primary font-normal">{selectedColor}</span>
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {product.colors.length} disponibles
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {product.colors.map((color, idx) => {
                        const isSelected = selectedColor === color.name;
                        return (
                          <button
                            key={color.name}
                            type="button"
                            onClick={() => handleColorSelect(color.name, color.imageIndex)}
                            className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                              isSelected
                                ? 'border-store-primary bg-store-secondary text-stone-900 shadow-xs ring-2 ring-store-primary/30'
                                : 'border-stone-200 bg-white hover:border-stone-400 text-stone-700'
                            }`}
                          >
                            <span
                              className="w-4 h-4 rounded-full border border-stone-300 shadow-xs"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span>{color.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Sizes / Pointures / Models */}
                {product.sizes && product.sizes.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                        Taille / Pointure : <span className="text-store-primary font-normal">{selectedSize}</span>
                      </span>
                      {!isCurrentVariantAvailable && (
                        <span className="text-[11px] text-rose-500 font-semibold">
                          ⚠️ Variante en rupture de stock
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {product.sizes.map(size => {
                        const isSelected = selectedSize === size;
                        const stock = getVariantStock(size, selectedColor);
                        const isOutOfStock = stock <= 0;

                        return (
                          <button
                            key={size}
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => setSelectedSize(size)}
                            className={`relative px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                              isOutOfStock
                                ? 'bg-stone-100 text-stone-300 border-stone-200 line-through cursor-not-allowed opacity-60'
                                : isSelected
                                ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                                : 'bg-white text-stone-800 border-stone-200 hover:border-stone-400 hover:bg-stone-50'
                            }`}
                          >
                            {size}
                            {isOutOfStock && (
                              <span className="ml-1 text-[9px] font-normal no-underline">
                                (Épuisé)
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ================= SECTION 3 : DIRECT HIGH-CONVERTING COD ORDER FORM ================= */}
              <div
                ref={orderFormRef}
                id="order-form"
                className="bg-white rounded-3xl border-2 border-store-primary/40 p-4 sm:p-6 shadow-luxury relative overflow-hidden"
              >
                {/* Visual Top Header */}
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-store-primary animate-ping" />
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Remplissez le formulaire pour commander
                  </h3>
                </div>
                <p className="text-xs text-stone-500 mb-4">
                  Paiement sécurisé en espèces à la livraison. Pas besoin de carte bancaire !
                </p>

                {/* Reminder Pill of Selected Variant */}
                <div className="mb-4 p-2.5 bg-store-secondary rounded-xl border border-store-border flex items-center justify-between text-xs text-stone-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-store-primary" />
                    <span>
                      Sélection : <strong>{selectedColor || 'Standard'}</strong> | Taille :{' '}
                      <strong>{selectedSize || 'Standard'}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={scrollToForm}
                    className="text-[11px] text-store-primary hover:underline font-semibold"
                  >
                    Modifier
                  </button>
                </div>

                <form onSubmit={handleOrderSubmit} className="space-y-4">
                  {/* Two Columns: Full Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Nom & Prénom <span className="text-store-accent">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="ex: Fatima Zohra"
                          value={customerName}
                          onChange={e => setCustomerName(e.target.value)}
                          className={`w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-store-base rounded-xl border ${
                            formErrors.customerName ? 'border-rose-500' : 'border-store-border'
                          } focus:outline-none focus:border-store-primary transition-colors`}
                        />
                      </div>
                      {formErrors.customerName && (
                        <p className="text-[11px] text-rose-500 mt-1">{formErrors.customerName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Numéro de Téléphone <span className="text-store-accent">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          placeholder="05 / 06 / 07 XX XX XX"
                          value={customerPhone}
                          onChange={e => setCustomerPhone(e.target.value)}
                          className={`w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-store-base rounded-xl border ${
                            formErrors.customerPhone ? 'border-rose-500' : 'border-store-border'
                          } focus:outline-none focus:border-store-primary transition-colors`}
                        />
                      </div>
                      {formErrors.customerPhone && (
                        <p className="text-[11px] text-rose-500 mt-1">{formErrors.customerPhone}</p>
                      )}
                    </div>
                  </div>

                  {/* Two Cascading Columns: Wilaya (58) & Commune */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Wilaya (58 Wilayas) <span className="text-store-accent">*</span>
                      </label>
                      <select
                        value={selectedWilayaId}
                        onChange={e => setSelectedWilayaId(Number(e.target.value))}
                        className="w-full px-3 py-2.5 text-xs sm:text-sm bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary font-medium"
                      >
                        {wilayas.map(w => (
                          <option key={w.id} value={w.id}>
                            {w.code} - {w.name} ({w.arName})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Commune <span className="text-store-accent">*</span>
                      </label>
                      <select
                        value={selectedCommune}
                        onChange={e => setSelectedCommune(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs sm:text-sm bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary font-medium"
                      >
                        {currentWilaya.communes.map(c => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Full-width Address */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Votre Adresse Complète <span className="text-store-accent">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <textarea
                        rows={2}
                        required
                        placeholder="Quartier, N° Rue, Bâtiment, Point de repère..."
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-store-base rounded-xl border ${
                          formErrors.address ? 'border-rose-500' : 'border-store-border'
                        } focus:outline-none focus:border-store-primary transition-colors resize-none`}
                      />
                    </div>
                    {formErrors.address && (
                      <p className="text-[11px] text-rose-500 mt-1">{formErrors.address}</p>
                    )}
                  </div>

                  {/* Delivery Location Radios (Domicile vs Stop Desk) */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Mode & Lieu de Livraison
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      
                      {/* Option 1: A Domicile */}
                      <label
                        className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                          deliveryType === 'home'
                            ? 'border-store-primary bg-store-secondary/60 ring-2 ring-store-primary/30'
                            : 'border-store-border bg-white hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="deliveryType"
                            checked={deliveryType === 'home'}
                            onChange={() => setDeliveryType('home')}
                            className="text-store-primary focus:ring-store-primary"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                              <HomeIcon className="w-3.5 h-3.5 text-store-primary" />
                              <span>À Domicile</span>
                            </div>
                            <p className="text-[10px] text-stone-500">Livré chez vous en main propre</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-store-primary">
                          {isFreeShipping
                            ? 'GRATUIT'
                            : formatPrice(currentWilaya.homeDeliveryPrice, config.currency)}
                        </span>
                      </label>

                      {/* Option 2: Stop Desk */}
                      <label
                        className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                          deliveryType === 'desk'
                            ? 'border-store-primary bg-store-secondary/60 ring-2 ring-store-primary/30'
                            : 'border-store-border bg-white hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="deliveryType"
                            checked={deliveryType === 'desk'}
                            onChange={() => setDeliveryType('desk')}
                            className="text-store-primary focus:ring-store-primary"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                              <Building className="w-3.5 h-3.5 text-stone-600" />
                              <span>Au Bureau (Stop Desk)</span>
                            </div>
                            <p className="text-[10px] text-stone-500">Agence Yalidine / ZR Express</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-stone-700">
                          {isFreeShipping
                            ? 'GRATUIT'
                            : formatPrice(currentWilaya.stopDeskPrice, config.currency)}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Real-time Order Summary Calculator */}
                  <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 text-xs space-y-2">
                    <div className="flex justify-between text-stone-600">
                      <span>Prix des produits ({quantity} {quantity > 1 ? 'articles' : 'article'})</span>
                      <span className="font-semibold text-stone-900">
                        {formatPrice(productSubtotal, config.currency)}
                      </span>
                    </div>

                    <div className="flex justify-between text-stone-600">
                      <span>
                        Frais de livraison ({currentWilaya.name} -{' '}
                        {deliveryType === 'home' ? 'Domicile' : 'Stop Desk'})
                      </span>
                      <span className={`font-semibold ${isFreeShipping ? 'text-emerald-600 font-bold' : 'text-stone-900'}`}>
                        {isFreeShipping ? 'GRATUIT !' : formatPrice(shippingFee, config.currency)}
                      </span>
                    </div>

                    {isFreeShipping && (
                      <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>Félicitations ! Vous bénéficiez de la livraison offerte</span>
                      </div>
                    )}

                    <div className="border-t border-stone-200 pt-2 flex justify-between items-baseline text-stone-900">
                      <span className="font-bold text-sm">Coût total :</span>
                      <span className="font-serif text-xl sm:text-2xl font-black text-emerald-600 font-mono">
                        {formatPrice(grandTotal, config.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Quantity & COMMANDER Button matching Screenshot 3 */}
                  <div className="pt-2 flex items-center gap-3">
                    {/* Quantity Picker */}
                    <div className="flex items-center border border-store-border rounded-2xl bg-store-base overflow-hidden p-1">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-600 hover:bg-stone-200 active:scale-95 transition-all"
                        aria-label="Diminuer la quantité"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-stone-900 font-mono">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-600 hover:bg-stone-200 active:scale-95 transition-all"
                        aria-label="Augmenter la quantité"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Submit COMMANDER Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting || !isCurrentVariantAvailable}
                      className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2.5 text-white ${
                        !isCurrentVariantAvailable
                          ? 'bg-stone-400 cursor-not-allowed'
                          : 'bg-rose-500 hover:bg-rose-600 active:scale-[0.98]'
                      }`}
                    >
                      <span className="bg-white/25 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold">
                        {formatPrice(grandTotal, config.currency)}
                      </span>
                      <span>{isSubmitting ? 'Validation...' : 'COMMANDER'}</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-center text-stone-500 flex items-center justify-center gap-1.5 pt-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>Livraison prévue sous {config.deliveryTimeEstimate} • Paiement à la réception</span>
                  </p>
                </form>
              </div>

            </div>
          </div>

          {/* ================= SECTION 4 : RELATED PRODUCTS (Screenshot 3) ================= */}
          {relatedProducts.length > 0 && (
            <div className="mt-12 pt-8 border-t border-store-border">
              <h3 className="font-sans font-bold text-lg sm:text-xl text-stone-900 mb-4">
                Produits connexes
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
                {relatedProducts.map(rel => {
                  const relDiscount = calculateDiscountPercentage(rel.price, rel.compareAtPrice);
                  return (
                    <div
                      key={rel.id}
                      onClick={() => openProductPage(rel.id)}
                      className="bg-white rounded-2xl border border-store-border overflow-hidden shadow-card hover:shadow-luxury transition-all cursor-pointer flex flex-col justify-between p-2.5 sm:p-3"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 relative mb-2">
                        <img
                          src={rel.images[0]}
                          alt={rel.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                        {relDiscount > 0 && (
                          <span className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            -{relDiscount}%
                          </span>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-semibold text-stone-900 line-clamp-2 leading-snug">
                            {rel.title}
                          </h4>
                          <div className="flex items-baseline gap-1.5 mt-1.5 mb-2">
                            <span className="text-xs font-bold text-stone-900">
                              {formatPrice(rel.price, config.currency)}
                            </span>
                            {rel.compareAtPrice > rel.price && (
                              <span className="text-[10px] text-rose-400 line-through">
                                {formatPrice(rel.compareAtPrice, config.currency)}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="w-full py-1.5 rounded-lg border border-rose-200 text-rose-500 bg-rose-50/40 text-[11px] font-bold tracking-wider uppercase hover:bg-rose-100 transition-colors"
                        >
                          COMMANDER
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= SECTION 5 : CUSTOMER REVIEWS (Screenshot 3) ================= */}
          <div className="mt-12 pt-8 border-t border-store-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-sans font-bold text-lg sm:text-xl text-stone-900">
                  Avis des clients ({productReviews.length})
                </h3>
                <p className="text-xs text-stone-500">
                  Notes et retours authentiques de clientes à travers les 58 Wilayas
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-amber-500 text-sm font-bold bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{product.rating} / 5</span>
                </div>

                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  AJOUTEZ UN AVIS
                </button>
              </div>
            </div>

            {/* Reviews List */}
            {productReviews.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-2xl border border-store-border text-xs text-stone-500">
                Soyez la première à donner votre avis sur cet article !
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productReviews.map(rev => (
                  <div
                    key={rev.id}
                    className="bg-white p-4 rounded-2xl border border-store-border shadow-card space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-store-secondary text-store-primary font-serif font-bold text-xs flex items-center justify-center">
                          {rev.author[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-900">{rev.author}</p>
                          <p className="text-[10px] text-stone-500">{rev.wilaya}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rev.rating ? 'fill-current' : 'text-stone-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-stone-700 leading-relaxed font-light">
                      "{rev.comment}"
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-stone-400 border-t border-stone-100">
                      <span className="text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Achat vérifié
                      </span>
                      <span>{rev.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SECTION 6 : STICKY BOTTOM BAR (MOBILE-FIRST) ================= */}
      {!completedOrder && showStickyBar && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-store-border p-3 shadow-2xl animate-slideUp">
          <div className="max-w-md mx-auto flex items-center gap-3">
            {/* Small quantity */}
            <div className="flex items-center border border-store-border rounded-xl bg-store-base p-1">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-stone-200"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-xs font-bold text-stone-900 font-mono">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-stone-200"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Quick Commander Button matching Screenshot 3 */}
            <button
              onClick={scrollToForm}
              className="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md hover:bg-rose-600 active:scale-[0.98]"
            >
              <span className="bg-white/25 px-2 py-0.5 rounded text-[11px] font-mono font-bold">
                {formatPrice(grandTotal, config.currency)}
              </span>
              <span>COMMANDER</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL : AJOUTER UN AVIS ================= */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsReviewModalOpen(false)}
          />

          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 animate-scaleUp">
            <h3 className="font-serif text-lg font-bold text-stone-900 mb-1">
              Partagez votre avis sur ce produit
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Votre retour aide nos futures clientes dans leur choix.
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Note globale
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newReviewRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-stone-700 ml-2">
                    {newReviewRating} / 5 étoiles
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Votre Prénom / Nom
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Amira K."
                  value={newReviewAuthor}
                  onChange={e => setNewReviewAuthor(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Votre Ville / Wilaya
                </label>
                <input
                  type="text"
                  placeholder="ex: Alger (Hydra)"
                  value={newReviewWilaya}
                  onChange={e => setNewReviewWilaya(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Votre Commentaire
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Qualité du tissu, tombé, rapidité de la livraison..."
                  value={newReviewComment}
                  onChange={e => setNewReviewComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-store-primary hover:bg-store-primary-hover text-white rounded-xl shadow-soft"
                >
                  Publier mon avis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


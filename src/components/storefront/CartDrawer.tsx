import React, { useState, useMemo } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Sparkles,
  MapPin,
  Building,
  Home as HomeIcon,
  Phone,
  User,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../../context/StoreContext';
import { formatPrice, formatAlgerianPhone, validateAlgerianPhone } from '../../utils/formatters';
import { trackingManager } from '../../services/trackingManager';
import { Order } from '../../types';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotalCount,
    cartSubtotal,
    config,
    wilayas,
    createOrder,
    showToast,
    setCurrentView,
  } = useStore();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedWilayaId, setSelectedWilayaId] = useState<number>(16); // Alger
  const [selectedCommune, setSelectedCommune] = useState<string>('Alger Centre');
  const [address, setAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState<'home' | 'desk'>('home');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const currentWilaya = useMemo(() => {
    return wilayas.find(w => w.id === selectedWilayaId) || wilayas[0] || {
      id: 16,
      name: 'Alger',
      communes: ['Alger Centre'],
      homeDeliveryPrice: 400,
      stopDeskPrice: 250,
    };
  }, [wilayas, selectedWilayaId]);

  const communes = currentWilaya?.communes || ['Centre'];

  const isFreeShipping =
    Boolean(config.freeShippingEnabled) &&
    config.freeShippingThreshold > 0 &&
    cartSubtotal >= config.freeShippingThreshold;

  const shippingFee = useMemo(() => {
    if (isFreeShipping) return 0;
    return deliveryType === 'home' ? currentWilaya.homeDeliveryPrice : currentWilaya.stopDeskPrice;
  }, [cartSubtotal, isFreeShipping, deliveryType, currentWilaya]);

  const grandTotal = cartSubtotal + shippingFee;

  const handleWilayaChange = (id: number) => {
    setSelectedWilayaId(id);
    const target = wilayas.find(w => w.id === id);
    if (target && target.communes.length > 0) {
      setSelectedCommune(target.communes[0]);
    }
  };

  const handleMultiOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || cart.length === 0) return;

    const errors: Record<string, string> = {};
    if (!customerName.trim() || customerName.trim().length < 3) {
      errors.name = 'Veuillez saisir votre nom complet';
    }
    if (!validateAlgerianPhone(customerPhone.trim())) {
      errors.phone = 'Numéro algérien invalide (ex: 0550 12 34 56)';
    }
    if (!address.trim()) {
      errors.address = 'Veuillez préciser votre adresse ou point de repère';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('Veuillez remplir les champs obligatoires', 'error');
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      // Create multi-item summary
      const firstItem = cart[0];
      const itemsSummary = cart.map(i => `${i.productTitle} (x${i.quantity})`).join(', ');

      const order = await createOrder({
        customerName: customerName.trim(),
        customerPhone: formatAlgerianPhone(customerPhone.trim()),
        wilayaId: currentWilaya.id,
        wilayaName: currentWilaya.name,
        commune: selectedCommune,
        address: address.trim(),
        deliveryType,
        productId: firstItem.productId,
        productTitle: cart.length === 1 ? firstItem.productTitle : `Panier Multi-articles (${cartTotalCount} articles)`,
        productImage: firstItem.productImage,
        selectedColor: firstItem.selectedColor || 'Mixte',
        selectedSize: firstItem.selectedSize || 'Mixte',
        quantity: cartTotalCount,
        unitPrice: Math.round(cartSubtotal / cartTotalCount),
        productTotal: cartSubtotal,
        shippingFee,
        grandTotal,
        items: cart.map(item => ({
          productId: item.productId,
          productTitle: item.productTitle,
          productImage: item.productImage,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
        })),
        status: 'pending',
        notes: `Commande Panier Multi-Articles: ${itemsSummary}`,
      });

      // Confetti!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D48C98', '#E05A6D', '#F9F1F0', '#2B2B2B', '#FFD700'],
        });
      } catch {}

      // Track Purchase in Pixels
      trackingManager.trackEvent({
        eventName: 'Purchase',
        eventId: `purchase-${order.orderNumber}`,
        contentName: `Panier Multi-Articles (${cartTotalCount})`,
        value: grandTotal,
        currency: config.currency === 'DA' ? 'DZD' : config.currency,
        quantity: cartTotalCount,
      });

      setCompletedOrder(order);
      clearCart();
    } catch (err) {
      showToast('Une erreur est survenue lors de la commande', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Slide-over panel */}
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col z-10 animate-slideLeft">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-store-primary/20 text-store-primary flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-stone-900 text-base">
                Votre Panier
              </h2>
              <p className="text-[11px] text-stone-500">
                {cartTotalCount} article{cartTotalCount > 1 ? 's' : ''} sélectionné{cartTotalCount > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full hover:bg-stone-200/70 text-stone-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* SUCCESS SCREEN */}
          {completedOrder ? (
            <div className="text-center py-8 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold bg-stone-100 px-3 py-1 rounded-full text-stone-700">
                  {completedOrder.orderNumber}
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-900 mt-2">
                  Merci {completedOrder.customerName} !
                </h3>
                <p className="text-xs text-stone-600 mt-1 max-w-xs mx-auto">
                  Votre commande groupée de <strong>{completedOrder.quantity} articles</strong> a été enregistrée avec succès. Notre service client vous contactera sous peu pour confirmer l'expédition.
                </p>
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-500">Destination :</span>
                  <span className="font-semibold text-stone-900">{completedOrder.wilayaName} ({completedOrder.commune})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Mode :</span>
                  <span className="font-semibold text-stone-900">
                    {completedOrder.deliveryType === 'home' ? 'À Domicile' : 'Stop Desk'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-stone-200">
                  <span>Total à payer à réception :</span>
                  <span className="text-store-primary">{formatPrice(completedOrder.grandTotal, config.currency)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setCompletedOrder(null);
                  setIsCheckingOut(false);
                  setIsCartOpen(false);
                  setCurrentView('home');
                }}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Continuer mes achats
              </button>
            </div>
          ) : cart.length === 0 ? (
            /* EMPTY CART */
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 stroke-1" />
              </div>
              <div>
                <p className="font-serif text-base font-bold text-stone-800">
                  Votre panier est vide
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  Découvrez nos bijoux et pièces couture d'exception pour commencer votre sélection.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setCurrentView('home');
                }}
                className="px-5 py-2.5 bg-store-primary hover:bg-store-primary-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
              >
                Découvrir la collection
              </button>
            </div>
          ) : isCheckingOut ? (
            /* CHECKOUT FORM IN DRAWER */
            <form onSubmit={handleMultiOrderSubmit} className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <h3 className="font-serif font-bold text-sm text-stone-900">
                  Coordonnées de Livraison (58 Wilayas)
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="text-xs text-store-primary hover:underline font-medium"
                >
                  ← Voir les articles
                </button>
              </div>

              {/* Nom & Téléphone */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Nom et Prénom *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="ex: Amina Benali"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary"
                  />
                </div>
                {formErrors.name && (
                  <p className="text-[10px] text-rose-500 mt-0.5">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Numéro de téléphone *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="0550 12 34 56"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary font-mono"
                  />
                </div>
                {formErrors.phone && (
                  <p className="text-[10px] text-rose-500 mt-0.5">{formErrors.phone}</p>
                )}
              </div>

              {/* Wilaya & Commune */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Wilaya *
                  </label>
                  <select
                    value={selectedWilayaId}
                    onChange={e => handleWilayaChange(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-xs bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary font-medium"
                  >
                    {wilayas.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.code} - {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Commune *
                  </label>
                  <select
                    value={selectedCommune}
                    onChange={e => setSelectedCommune(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary"
                  >
                    {communes.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Adresse */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Adresse exacte / Point de repère *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Quartier, N° rue, près de..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary"
                />
                {formErrors.address && (
                  <p className="text-[10px] text-rose-500 mt-0.5">{formErrors.address}</p>
                )}
              </div>

              {/* Delivery Type */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDeliveryType('home')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    deliveryType === 'home'
                      ? 'border-store-primary bg-store-secondary/40 ring-1 ring-store-primary'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-stone-900">
                    <HomeIcon className="w-3.5 h-3.5 text-store-primary" />
                    <span>À Domicile</span>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    {formatPrice(currentWilaya.homeDeliveryPrice, config.currency)}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('desk')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    deliveryType === 'desk'
                      ? 'border-store-primary bg-store-secondary/40 ring-1 ring-store-primary'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-stone-900">
                    <Building className="w-3.5 h-3.5 text-store-primary" />
                    <span>Stop Desk</span>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    {formatPrice(currentWilaya.stopDeskPrice, config.currency)}
                  </p>
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-store-primary hover:bg-store-primary-hover text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-soft transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              >
                <span>{isSubmitting ? 'Validation...' : 'Confirmer Ma Commande COD'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Bouton Secondaire : Continuer Mes Achats / Modifier Panier */}
              <button
                type="button"
                onClick={() => setIsCheckingOut(false)}
                className="w-full py-2.5 px-4 rounded-xl border border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-600 hover:text-stone-900 text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 mt-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← CONTINUER MES ACHATS / MODIFIER</span>
              </button>
            </form>
          ) : (
            /* CART ITEMS LIST */
            <div className="space-y-3">
              {cart.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-100"
                >
                  <img
                    src={item.productImage}
                    alt={item.productTitle}
                    className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs text-stone-900 truncate">
                      {item.productTitle}
                    </h4>
                    {(item.selectedColor || item.selectedSize) && (
                      <p className="text-[11px] text-stone-500 truncate">
                        {item.selectedColor} {item.selectedSize ? `• ${item.selectedSize}` : ''}
                      </p>
                    )}
                    <p className="font-serif font-bold text-xs text-store-primary mt-1">
                      {formatPrice(item.unitPrice, config.currency)}
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center bg-white border border-stone-200 rounded-lg">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-stone-100 text-stone-600 rounded-l-lg"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold font-mono">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-stone-100 text-stone-600 rounded-r-lg"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-500 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer with Subtotal & Proceed button */}
        {!completedOrder && cart.length > 0 && !isCheckingOut && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50/50 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Sous-total articles :</span>
                <span className="font-semibold font-mono text-stone-900">
                  {formatPrice(cartSubtotal, config.currency)}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Livraison estimée :</span>
                <span className="text-stone-500 font-mono">
                  {isFreeShipping
                    ? 'Offerte'
                    : `dès ${formatPrice(currentWilaya.homeDeliveryPrice, config.currency)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-stone-200 text-stone-900">
                <span>Total estimé :</span>
                <span className="text-store-primary font-serif font-black text-base">
                  {formatPrice(grandTotal, config.currency)}
                </span>
              </div>
            </div>

            {/* Bouton Principal : Passer la Commande */}
            <button
              onClick={() => {
                setIsCheckingOut(true);
                trackingManager.trackEvent({
                  eventName: 'InitiateCheckout',
                  contentName: `Panier (${cartTotalCount} articles)`,
                  value: cartSubtotal,
                  currency: config.currency === 'DA' ? 'DZD' : config.currency,
                });
              }}
              className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-soft transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span>Passer la commande ({cartTotalCount})</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Bouton Secondaire : Continuer Mes Achats */}
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="w-full py-2.5 px-4 rounded-xl border border-stone-200 hover:border-stone-300 hover:bg-white text-stone-600 hover:text-stone-900 text-xs font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← CONTINUER MES ACHATS</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};


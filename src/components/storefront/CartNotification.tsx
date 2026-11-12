import React, { useEffect } from 'react';
import { CheckCircle2, ShoppingBag, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatPrice } from '../../utils/formatters';

export const CartNotification: React.FC = () => {
  const { addedItemNotification, dismissAddedNotification, setIsCartOpen, cartTotalCount, config } = useStore();

  useEffect(() => {
    if (!addedItemNotification) return;
    const timer = setTimeout(() => {
      dismissAddedNotification();
    }, 6000);
    return () => clearTimeout(timer);
  }, [addedItemNotification, dismissAddedNotification]);

  if (!addedItemNotification) return null;

  return (
    <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-slideUp">
      <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-2xl border border-store-border/80 dark:border-stone-800 text-stone-900 dark:text-stone-100 space-y-3">
        {/* Header with Success Badge and Close button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Produit ajouté à votre panier !
            </span>
          </div>
          <button
            onClick={dismissAddedNotification}
            className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 transition-colors"
            aria-label="Fermer la notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product preview */}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800">
          <img
            src={addedItemNotification.productImage}
            alt={addedItemNotification.productTitle}
            className="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0"
          />
          <div className="min-w-0 flex-1 text-xs">
            <h4 className="font-semibold text-stone-900 dark:text-white truncate">
              {addedItemNotification.productTitle}
            </h4>
            {(addedItemNotification.selectedColor || addedItemNotification.selectedSize) && (
              <p className="text-[11px] text-stone-500 truncate">
                {addedItemNotification.selectedColor} {addedItemNotification.selectedSize ? `• ${addedItemNotification.selectedSize}` : ''}
              </p>
            )}
            <p className="font-bold text-store-primary mt-0.5">
              {formatPrice(addedItemNotification.unitPrice, config.currency)}
            </p>
          </div>
        </div>

        {/* Action Buttons: Continuer mes achats vs Voir mon panier */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={dismissAddedNotification}
            className="py-2.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-semibold tracking-wide transition-all text-center"
          >
            Continuer mes achats
          </button>

          <button
            type="button"
            onClick={() => {
              dismissAddedNotification();
              setIsCartOpen(true);
            }}
            className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider shadow-soft transition-all flex items-center justify-center gap-1.5 active:scale-95 text-center"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-store-primary shrink-0" />
            <span className="truncate">Voir mon panier ({cartTotalCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};


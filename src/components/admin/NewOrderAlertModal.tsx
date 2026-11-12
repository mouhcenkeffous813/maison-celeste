import React, { useEffect } from 'react';
import { Sparkles, MessageCircle, X, ShoppingBag, MapPin, Phone, ArrowRight, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order } from '../../types';
import { formatPrice } from '../../utils/formatters';

interface NewOrderAlertModalProps {
  order: Order | null;
  onClose: () => void;
  onOpenDetails?: (order: Order) => void;
  currency: string;
  generateWhatsAppLink: (order: Order) => string;
}

export const NewOrderAlertModal: React.FC<NewOrderAlertModalProps> = ({
  order,
  onClose,
  onOpenDetails,
  currency,
  generateWhatsAppLink,
}) => {
  useEffect(() => {
    if (order) {
      // Trigger golden celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.15 },
          colors: ['#FFD700', '#D48C98', '#10B981', '#F59E0B', '#FFFFFF'],
        });
      } catch {
        // ignore
      }

      // Auto dismiss after 14 seconds if not clicked
      const timer = setTimeout(() => {
        onClose();
      }, 14000);
      return () => clearTimeout(timer);
    }
  }, [order]);

  if (!order) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-none animate-slideDown">
      <div className="pointer-events-auto bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white rounded-3xl p-5 shadow-2xl border-2 border-amber-400/80 backdrop-blur-md relative overflow-hidden ring-4 ring-amber-400/20">
        
        {/* Glow effect in background */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
              <span className="text-xs font-black tracking-widest uppercase text-amber-300">
                NOUVELLE COMMANDE REÇUE !
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded-full text-stone-300 border border-white/10">
              {order.orderNumber}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Order Details Body */}
        <div className="py-3 flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center flex-shrink-0 text-amber-300 shadow-sm">
            <ShoppingBag className="w-7 h-7" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <h4 className="font-serif font-bold text-base text-white truncate">
                {order.customerName}
              </h4>
              <span className="font-mono font-black text-lg text-emerald-400">
                +{formatPrice(order.grandTotal, currency)}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-stone-300 mt-1">
              <div className="flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                <span className="truncate">{order.wilayaName} ({order.commune})</span>
              </div>
              <div className="flex items-center gap-1 text-stone-400">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-mono">{order.customerPhone}</span>
              </div>
            </div>

            <p className="text-[11px] text-stone-400 mt-1 truncate">
              Article : <strong className="text-stone-200">{order.productTitle}</strong> (x{order.quantity})
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2">
          {/* WhatsApp Direct */}
          <a
            href={generateWhatsAppLink(order)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Confirmer sur WhatsApp</span>
          </a>

          {/* Details / Close */}
          {onOpenDetails && (
            <button
              onClick={() => {
                onOpenDetails(order);
                onClose();
              }}
              className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
            >
              <span>Détails</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onClose}
            className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white text-xs font-semibold transition-colors"
          >
            Masquer
          </button>
        </div>
      </div>
    </div>
  );
};


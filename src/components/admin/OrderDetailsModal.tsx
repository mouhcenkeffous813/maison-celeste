import React, { useState } from 'react';
import {
  X,
  Printer,
  MessageCircle,
  Phone,
  MapPin,
  Home,
  Building,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  Copy,
  Layers,
  ShoppingBag,
  ExternalLink,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Order, OrderStatus, StoreConfig } from '../../types';
import { formatPrice } from '../../utils/formatters';

interface OrderDetailsModalProps {
  order: Order;
  config: StoreConfig;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<any>;
  onPrintSlip: (order: Order) => void;
  generateWhatsAppLink: (order: Order) => string;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  config,
  onClose,
  onUpdateStatus,
  onPrintSlip,
  generateWhatsAppLink,
  showToast,
}) => {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdatingStatus(true);
    try {
      await onUpdateStatus(order.id, newStatus);
      setCurrentStatus(newStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(order.customerPhone);
    setCopiedPhone(true);
    showToast('Numéro copié dans le presse-papiers', 'info');
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const unitPrice = order.unitPrice || (order.quantity > 0 ? Math.round(order.productTotal / order.quantity) : order.productTotal);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl z-10 my-4 text-stone-900 animate-scaleUp space-y-4">
        
        {/* ================= MODAL HEADER ================= */}
        <div className="flex items-start justify-between border-b border-stone-100 pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base sm:text-lg font-black text-stone-900">
                {order.orderNumber}
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-store-secondary text-stone-700">
                COD Algérie
              </span>
            </div>
            <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>
                Reçue le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= STATUS SELECTOR BAR ================= */}
        <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-700">Statut de la commande :</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={currentStatus}
              disabled={isUpdatingStatus}
              onChange={e => handleStatusChange(e.target.value as OrderStatus)}
              className={`text-xs font-bold rounded-xl px-3 py-1.5 border transition-all cursor-pointer focus:outline-none ${
                currentStatus === 'pending'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : currentStatus === 'confirmed'
                  ? 'bg-blue-100 text-blue-900 border-blue-300'
                  : currentStatus === 'processing'
                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                  : currentStatus === 'shipped'
                  ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                  : currentStatus === 'delivered'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-rose-100 text-rose-900 border-rose-300'
              }`}
            >
              <option value="pending">⏳ En attente de confirmation</option>
              <option value="confirmed">✅ Confirmée par téléphone</option>
              <option value="processing">📦 En préparation colis</option>
              <option value="shipped">🚚 Expédiée (Yalidine / ZR)</option>
              <option value="delivered">🎉 Livrée & Payée</option>
              <option value="cancelled">❌ Annulée / Retour</option>
            </select>
          </div>
        </div>

        {/* ================= PRODUCT & PROMINENT QUANTITY SECTION ================= */}
        <div className="bg-store-secondary/40 rounded-2xl p-4 border border-store-border space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-store-primary" />
              <span>Article Commandé</span>
            </h4>

            {/* High-Contrast Prominent Quantity Badge */}
            <div className="flex items-center gap-1 bg-stone-900 text-white px-3 py-1 rounded-xl shadow-xs">
              <span className="text-[11px] uppercase font-bold tracking-wider text-stone-300">Quantité :</span>
              <span className="font-mono text-sm font-black text-rose-300">
                x{order.quantity}
              </span>
              <span className="text-[11px] font-semibold text-white">
                ({order.quantity} {order.quantity > 1 ? 'pièces' : 'pièce'})
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3.5 bg-white p-3 rounded-xl border border-store-border">
            <img
              src={order.productImage}
              alt={order.productTitle}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-stone-200 shrink-0 shadow-xs"
            />
            <div className="flex-1 min-w-0">
              <p className="font-serif font-bold text-sm text-stone-900 leading-snug">
                {order.productTitle}
              </p>

              {/* Variant breakdown */}
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                {order.selectedColor && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-800 font-medium border border-stone-200">
                    <span>Couleur :</span>
                    <strong className="text-stone-900">{order.selectedColor}</strong>
                  </span>
                )}

                {order.selectedSize && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-900 font-medium border border-rose-200">
                    <span>Taille / Pointure :</span>
                    <strong className="text-store-primary font-bold">{order.selectedSize}</strong>
                  </span>
                )}
              </div>

              {/* Price per unit & subtotal */}
              <div className="mt-2 text-xs flex items-center justify-between text-stone-600 font-mono">
                <span>
                  {formatPrice(unitPrice, config.currency)} × <strong>{order.quantity}</strong>
                </span>
                <span className="font-bold text-stone-900">
                  Sous-total : {formatPrice(order.productTotal, config.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Financial Calculation */}
          <div className="bg-white rounded-xl p-3 border border-stone-200 text-xs space-y-1.5">
            <div className="flex justify-between text-stone-600">
              <span>Articles ({order.quantity} {order.quantity > 1 ? 'unités' : 'unité'}) :</span>
              <span className="font-mono font-semibold text-stone-900">
                {formatPrice(order.productTotal, config.currency)}
              </span>
            </div>

            <div className="flex justify-between text-stone-600">
              <span className="flex items-center gap-1">
                <span>Frais de livraison :</span>
                <span className="text-[10px] text-stone-500">
                  ({order.wilayaName} • {order.deliveryType === 'home' ? 'À Domicile' : 'Stop Desk'})
                </span>
              </span>
              <span className={`font-mono font-semibold ${order.shippingFee === 0 ? 'text-emerald-600 font-bold' : 'text-stone-900'}`}>
                {order.shippingFee === 0 ? 'GRATUIT' : formatPrice(order.shippingFee, config.currency)}
              </span>
            </div>

            <div className="border-t border-stone-200 pt-2 flex justify-between items-baseline">
              <div>
                <span className="font-bold text-stone-900 text-sm">TOTAL À ENCAISSER (COD) :</span>
                <p className="text-[10px] text-stone-500">Montant en espèces à percevoir par le livreur</p>
              </div>
              <span className="font-mono text-lg sm:text-xl font-black text-store-primary">
                {formatPrice(order.grandTotal, config.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* ================= CUSTOMER & DELIVERY INFORMATION ================= */}
        <div className="border border-stone-200 rounded-2xl p-4 space-y-2.5 text-xs bg-white">
          <h4 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-store-primary" />
            <span>Coordonnées & Adresse de Livraison</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Nom */}
            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
              <span className="text-[10px] text-stone-500 uppercase font-bold block">Nom du client</span>
              <span className="font-bold text-stone-900 text-sm">{order.customerName}</span>
            </div>

            {/* Téléphone with Quick Actions */}
            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Téléphone</span>
                <span className="font-mono font-bold text-stone-900 text-sm">{order.customerPhone}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                  title="Copier le numéro"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <a
                  href={`tel:${order.customerPhone}`}
                  className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                  title="Appeler le client"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Wilaya, Commune & Delivery Mode */}
          <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Destination</span>
                <span className="font-bold text-stone-900">
                  {order.wilayaName} • {order.commune}
                </span>
              </div>

              <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 ${
                order.deliveryType === 'home'
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-purple-100 text-purple-900'
              }`}>
                {order.deliveryType === 'home' ? (
                  <>
                    <Home className="w-3 h-3" />
                    <span>À Domicile</span>
                  </>
                ) : (
                  <>
                    <Building className="w-3 h-3" />
                    <span>Stop Desk (Bureau)</span>
                  </>
                )}
              </span>
            </div>

            <div className="pt-1 text-stone-700">
              <span className="text-[10px] text-stone-500 font-bold uppercase block">Adresse complète</span>
              <p className="font-medium bg-white p-2 rounded-lg border border-stone-200 mt-0.5">
                {order.address}
              </p>
            </div>
          </div>

          {/* Notes if any */}
          {order.notes && (
            <div className="text-[11px] bg-amber-50 border border-amber-200 text-amber-900 p-2 rounded-xl">
              <strong className="block text-[10px] uppercase font-bold text-amber-800">Note interne / Client :</strong>
              <span>{order.notes}</span>
            </div>
          )}
        </div>

        {/* ================= FOOTER ACTION BUTTONS ================= */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          {/* Print Delivery Slip */}
          <button
            type="button"
            onClick={() => onPrintSlip(order)}
            className="py-2.5 px-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-stone-300" />
            <span>Imprimer Bordereau</span>
          </button>

          {/* WhatsApp Direct */}
          <a
            href={generateWhatsAppLink(order)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Client</span>
          </a>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};


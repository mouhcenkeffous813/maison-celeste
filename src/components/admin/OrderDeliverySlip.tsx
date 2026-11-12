import React from 'react';
import { Printer, X, CheckCircle2, Phone, MapPin, Truck, Building, Home, ShieldCheck } from 'lucide-react';
import { Order, StoreConfig } from '../../types';
import { formatPrice } from '../../utils/formatters';

interface OrderDeliverySlipProps {
  order: Order;
  config: StoreConfig;
  onClose: () => void;
}

export const OrderDeliverySlip: React.FC<OrderDeliverySlipProps> = ({ order, config, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl z-10 my-4 text-stone-900 animate-scaleUp print:p-0 print:m-0 print:shadow-none print:w-full print:max-w-none">
        
        {/* Screen Controls (Hidden when printing) */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-6 print:hidden">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Bordereau de Livraison COD (Colis Express)
            </h3>
            <p className="text-xs text-stone-500">
              Prêt à imprimer et coller sur le colis pour Yalidine / ZR Express / Transporteur.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer le Bordereau</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= PRINTABLE SLIP CONTENT ================= */}
        <div className="border-2 border-stone-800 rounded-2xl p-6 sm:p-8 bg-white print:border-black print:p-6 print:rounded-none">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-stone-800 pb-4">
            <div>
              <h1 className="font-serif text-2xl font-black uppercase tracking-wider text-stone-900">
                {config.storeName}
              </h1>
              <p className="text-[11px] text-stone-600 font-sans mt-0.5">
                {config.storeTagline || 'Haute Couture & Accessoires de Luxe Algérie'}
              </p>
              <p className="text-xs font-mono font-bold text-stone-800 mt-1">
                Tél Expéditeur : {config.phone}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block bg-black text-white px-3 py-1 text-xs font-mono font-bold uppercase tracking-widest rounded print:bg-black print:text-white">
                BORDEREAU COD
              </span>
              <p className="font-mono text-base font-black text-stone-900 mt-1">
                {order.orderNumber}
              </p>
              <p className="text-[10px] text-stone-500 font-mono">
                Date: {new Date(order.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          {/* Delivery Mode Banner */}
          <div className="my-4 p-3 bg-stone-100 rounded-xl border border-stone-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {order.deliveryType === 'home' ? (
                <>
                  <Home className="w-5 h-5 text-stone-900" />
                  <span className="font-black text-sm uppercase tracking-wider">
                    LIVRAISON À DOMICILE
                  </span>
                </>
              ) : (
                <>
                  <Building className="w-5 h-5 text-stone-900" />
                  <span className="font-black text-sm uppercase tracking-wider">
                    LIVRAISON AU BUREAU (STOP DESK)
                  </span>
                </>
              )}
            </div>
            <span className="font-mono text-xs font-bold bg-white px-2.5 py-1 rounded border border-stone-400">
              WILAYA : {order.wilayaName.toUpperCase()}
            </span>
          </div>

          {/* Client Destination Details */}
          <div className="grid grid-cols-2 gap-4 py-2 text-xs border-b border-stone-200">
            <div>
              <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wider mb-1">
                DESTINATAIRE (CLIENT) :
              </p>
              <p className="font-black text-sm text-stone-900">{order.customerName}</p>
              <p className="font-mono text-sm font-bold text-stone-800 mt-0.5">
                📞 {order.customerPhone}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-stone-500 uppercase font-bold tracking-wider mb-1">
                ADRESSE DE LIVRAISON :
              </p>
              <p className="font-bold text-stone-900">
                {order.wilayaName} - {order.commune}
              </p>
              <p className="text-stone-700 leading-snug mt-0.5">{order.address}</p>
            </div>
          </div>

          {/* Product Recap */}
          <div className="py-4 border-b-2 border-stone-800">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-300 text-[10px] uppercase text-stone-500">
                  <th className="py-1">Description de l'article</th>
                  <th className="py-1">Variante / Pointure</th>
                  <th className="py-1 text-center">Quantité</th>
                  <th className="py-1 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {order.items && order.items.length > 1 ? (
                  order.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2 font-bold text-stone-900">{it.productTitle}</td>
                      <td className="py-2 font-semibold text-stone-700">
                        {it.selectedColor} {it.selectedSize ? `• ${it.selectedSize}` : ''}
                      </td>
                      <td className="py-2 text-center font-bold font-mono">{it.quantity}</td>
                      <td className="py-2 text-right font-mono font-bold">
                        {formatPrice(it.totalPrice, config.currency)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-2.5 font-bold text-stone-900">{order.productTitle}</td>
                    <td className="py-2.5 font-semibold text-stone-700">
                      {order.selectedColor} • {order.selectedSize}
                    </td>
                    <td className="py-2.5 text-center font-bold font-mono">{order.quantity}</td>
                    <td className="py-2.5 text-right font-mono font-bold">
                      {formatPrice(order.productTotal, config.currency)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3} className="py-1.5 text-right text-stone-600">
                    Frais de livraison ({order.wilayaName} - {order.deliveryType === 'home' ? 'Domicile' : 'Stop Desk'}) :
                  </td>
                  <td className="py-1.5 text-right font-mono font-bold text-stone-800">
                    {order.shippingFee === 0 ? 'GRATUIT' : formatPrice(order.shippingFee, config.currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Prominent COD Amount Box */}
          <div className="mt-4 p-4 bg-stone-900 text-white rounded-2xl flex items-center justify-between print:bg-black print:text-white">
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-stone-300">
                MONTANT TOTAL COD À PERCEVOIR DU CLIENT :
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5">
                (Paiement en espèces à la livraison)
              </p>
            </div>

            <div className="text-right">
              <span className="font-serif text-2xl sm:text-3xl font-black font-mono">
                {formatPrice(order.grandTotal, config.currency)}
              </span>
            </div>
          </div>

          {/* Courier Instructions & Barcode Simulation */}
          <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-500">
            <div>
              <p className="font-bold text-stone-800">INSTRUCTIONS AU TRANSPORTEUR :</p>
              <p>Merci de contacter le client 30 minutes avant passage.</p>
              <p>Autoriser la vérification de conformité avant encaissement.</p>
            </div>

            <div className="text-right font-mono text-[9px] text-stone-600">
              <div className="tracking-[4px] font-bold text-stone-900 text-xs">
                ||| | ||||| || |||||| | |||
              </div>
              <span>{order.orderNumber}</span>
            </div>
          </div>

        </div>

        {/* Bottom Screen Close */}
        <div className="mt-4 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};


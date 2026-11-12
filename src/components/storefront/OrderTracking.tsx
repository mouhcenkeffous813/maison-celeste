import React, { useState } from 'react';
import { Search, Package, Phone, CheckCircle2, Clock, Truck, Home, Building, MessageCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import { formatPrice } from '../../utils/formatters';

export const OrderTracking: React.FC = () => {
  const { orders, config, setCurrentView, showToast } = useStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searched, setSearched] = useState(false);
  const [foundOrders, setFoundOrders] = useState<Order[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = phoneNumber.trim();
    if (!cleanQuery) {
      showToast('Veuillez entrer votre numéro de téléphone ou N° de commande', 'error');
      return;
    }

    const digitsOnly = cleanQuery.replace(/\D/g, '');
    const matches = orders.filter(o => {
      if (digitsOnly && o.customerPhone.replace(/\D/g, '').includes(digitsOnly)) {
        return true;
      }
      return o.orderNumber.toLowerCase().includes(cleanQuery.toLowerCase());
    });
    setFoundOrders(matches);
    setSearched(true);
  };

  const getStatusStep = (status: OrderStatus): number => {
    switch (status) {
      case 'pending': return 1;
      case 'confirmed': return 2;
      case 'processing': return 3;
      case 'shipped': return 4;
      case 'delivered': return 5;
      case 'cancelled': return 0;
      default: return 1;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">En attente de confirmation</span>;
      case 'confirmed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Confirmée</span>;
      case 'processing':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">En préparation</span>;
      case 'shipped':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Expédiée / En cours de route</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Livrée</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Annulée / Retour</span>;
    }
  };

  const steps = [
    { label: 'Reçue', desc: 'En attente' },
    { label: 'Confirmée', desc: 'Validée' },
    { label: 'Préparation', desc: 'Emballée' },
    { label: 'Expédiée', desc: 'En route' },
    { label: 'Livrée', desc: 'Encaissée' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Back to Home Button */}
      <div className="mb-6">
        <button
          onClick={() => setCurrentView('home')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-stone-200 text-stone-700 hover:text-stone-900 hover:bg-stone-50 text-xs font-bold shadow-xs transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-store-primary" />
          <span>← Retour à la boutique</span>
        </button>
      </div>

      {/* Header */}
      <div className="text-center max-w-lg mx-auto mb-8">
        <div className="w-12 h-12 rounded-2xl bg-store-secondary text-store-primary flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
          Suivi de Commande en Direct
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-stone-500">
          Renseignez le numéro de téléphone utilisé lors de votre commande pour connaître son statut en temps réel.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white rounded-3xl border border-store-border p-4 sm:p-6 shadow-card max-w-lg mx-auto mb-10">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ex: 0555123456 ou CMD-DZ-1234"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              className="w-full pl-10 pr-3 py-3 text-xs sm:text-sm bg-store-base rounded-2xl border border-store-border focus:outline-none focus:border-store-primary font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <Search className="w-4 h-4" />
            <span>Rechercher</span>
          </button>
        </form>
      </div>

      {/* Results */}
      {searched && (
        <div className="space-y-6">
          {foundOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-store-border p-8 text-center max-w-lg mx-auto shadow-xs">
              <AlertCircle className="w-10 h-10 text-stone-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-stone-800 mb-1">Aucune commande trouvée</h3>
              <p className="text-xs text-stone-500 mb-4">
                Aucune commande ne correspond au numéro "{phoneNumber}". Vérifiez la saisie ou contactez-nous directement.
              </p>
              <a
                href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour, je souhaite suivre ma commande avec le numéro ${phoneNumber}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Assistance WhatsApp</span>
              </a>
            </div>
          ) : (
            foundOrders.map(order => {
              const currentStep = getStatusStep(order.status);
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-store-border p-5 sm:p-7 shadow-card space-y-6"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm sm:text-base font-bold text-stone-900">
                          {order.orderNumber}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs text-stone-500 mt-1">
                        Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-stone-500">Montant COD à régler :</p>
                      <p className="font-serif text-lg sm:text-xl font-bold text-store-primary">
                        {formatPrice(order.grandTotal, config.currency)}
                      </p>
                    </div>
                  </div>

                  {/* Visual Status Progress */}
                  {order.status !== 'cancelled' ? (
                    <div className="py-2">
                      <div className="relative">
                        <div className="overflow-hidden h-1.5 mb-4 text-xs flex rounded bg-stone-100">
                          <div
                            style={{ width: `${(Math.max(1, currentStep) / 5) * 100}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-store-primary transition-all duration-500"
                          />
                        </div>
                        <div className="grid grid-cols-5 text-center text-[10px] sm:text-xs">
                          {steps.map((st, i) => (
                            <div key={i} className="flex flex-col items-center">
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] mb-1 ${
                                  i + 1 <= currentStep
                                    ? 'bg-store-primary text-white'
                                    : 'bg-stone-200 text-stone-500'
                                }`}
                              >
                                {i + 1}
                              </span>
                              <span className="font-semibold text-stone-800 leading-tight">{st.label}</span>
                              <span className="text-stone-400 text-[9px] hidden sm:inline">{st.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-50 rounded-xl text-xs text-rose-800 border border-rose-200">
                      Cette commande a été annulée ou signalée en retour. Contactez notre équipe pour plus de précisions.
                    </div>
                  )}

                  {/* Order Details Grid */}
                  <div className="bg-store-secondary/40 rounded-2xl p-4 border border-store-border/70 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={order.productImage}
                        alt={order.productTitle}
                        className="w-14 h-14 object-cover rounded-xl border border-stone-200"
                      />
                      <div>
                        <p className="font-bold text-stone-900">{order.productTitle}</p>
                        <p className="text-stone-600">
                          Couleur: {order.selectedColor} | Taille: {order.selectedSize}
                        </p>
                        <p className="text-stone-500">Quantité : {order.quantity}</p>
                      </div>
                    </div>

                    <div className="space-y-1 text-stone-600 sm:border-l sm:border-stone-200 sm:pl-4">
                      <p>
                        <strong className="text-stone-800">Client :</strong> {order.customerName}
                      </p>
                      <p>
                        <strong className="text-stone-800">Destination :</strong> {order.wilayaName} ({order.commune})
                      </p>
                      <p>
                        <strong className="text-stone-800">Mode :</strong>{' '}
                        {order.deliveryType === 'home' ? 'Livraison à Domicile' : 'Stop Desk (Agence)'}
                      </p>
                    </div>
                  </div>

                  {/* WhatsApp Help */}
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-stone-500">Besoin d'aide sur cette commande ?</p>
                    <a
                      href={`https://wa.me/${config.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Bonjour, je vous contacte au sujet de ma commande ${order.orderNumber}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Contacter sur WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};


import React, { useState } from 'react';
import {
  Search,
  Download,
  MessageCircle,
  Phone,
  MapPin,
  Building,
  Home,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  Filter,
  Eye,
  Trash2,
  Printer
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import { formatPrice, searchMatches } from '../../utils/formatters';
import { OrderDeliverySlip } from './OrderDeliverySlip';
import { OrderDetailsModal } from './OrderDetailsModal';

export const AdminOrders: React.FC = () => {
  const {
    orders,
    config,
    updateOrderStatus,
    generateWhatsAppLink,
    exportOrdersToCsv,
    showToast,
  } = useStore();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);

  const statusFilters = [
    { id: 'all', label: 'Toutes', count: orders.length },
    { id: 'pending', label: 'En attente', count: orders.filter(o => o.status === 'pending').length },
    { id: 'confirmed', label: 'Confirmées', count: orders.filter(o => o.status === 'confirmed').length },
    { id: 'processing', label: 'En préparation', count: orders.filter(o => o.status === 'processing').length },
    { id: 'shipped', label: 'Expédiées', count: orders.filter(o => o.status === 'shipped').length },
    { id: 'delivered', label: 'Livrées', count: orders.filter(o => o.status === 'delivered').length },
    { id: 'cancelled', label: 'Annulées', count: orders.filter(o => o.status === 'cancelled').length },
  ];

  const filteredOrders = orders.filter(o => {
    // Status filter
    if (activeFilter !== 'all' && o.status !== activeFilter) return false;

    // Search filter with accent-insensitivity (ex: setif finds Sétif)
    if (!search.trim()) return true;
    return (
      searchMatches(o.orderNumber, search) ||
      searchMatches(o.customerName, search) ||
      searchMatches(o.customerPhone, search) ||
      searchMatches(o.wilayaName, search) ||
      searchMatches(o.commune, search) ||
      searchMatches(o.productTitle, search) ||
      searchMatches(`${o.selectedColor} ${o.selectedSize}`, search)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
            Gestion des Commandes (CRM COD Algérie)
          </h2>
          <p className="text-xs text-stone-500">
            Gérez la validation téléphonique, l'expédition Yalidine/ZR Express et le recouvrement.
          </p>
        </div>

        {/* CSV Export Button */}
        <button
          onClick={exportOrdersToCsv}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Exporter CSV (Yalidine / ZR Express)</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {statusFilters.map(tab => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-store-border hover:bg-stone-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input Bar */}
      <div className="bg-white rounded-2xl border border-store-border p-3 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par N° commande, client, téléphone, wilaya, produit..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-store-base rounded-xl border border-store-border focus:outline-none focus:border-store-primary font-medium"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-store-border overflow-hidden shadow-card">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-500">
            Aucune commande ne correspond aux critères de recherche.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-store-secondary/40 text-stone-600 uppercase text-[10px] font-bold border-b border-store-border">
                <tr>
                  <th className="py-3 px-3.5">N° / Date</th>
                  <th className="py-3 px-3.5">Client & Contact</th>
                  <th className="py-3 px-3.5">Destination & Mode</th>
                  <th className="py-3 px-3.5">Produit & Variantes</th>
                  <th className="py-3 px-3.5">Montant COD</th>
                  <th className="py-3 px-3.5">Statut</th>
                  <th className="py-3 px-3.5 text-right">Actions Directes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-store-secondary/20 transition-colors">
                    {/* Order ID & Date */}
                    <td className="py-3.5 px-3.5">
                      <span className="font-mono font-bold text-stone-900 block">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-3.5">
                      <p className="font-bold text-stone-900">{order.customerName}</p>
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="text-stone-600 font-mono text-[11px] flex items-center gap-1 hover:text-store-primary"
                      >
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span>{order.customerPhone}</span>
                      </a>
                    </td>

                    {/* Wilaya & Address */}
                    <td className="py-3.5 px-3.5 max-w-[160px]">
                      <p className="font-bold text-stone-900">
                        {order.wilayaName} <span className="font-normal text-stone-500">({order.commune})</span>
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-semibold flex items-center gap-1 ${
                            order.deliveryType === 'home'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {order.deliveryType === 'home' ? (
                            <>
                              <Home className="w-2.5 h-2.5" />
                              <span>Domicile</span>
                            </>
                          ) : (
                            <>
                              <Building className="w-2.5 h-2.5" />
                              <span>Stop Desk</span>
                            </>
                          )}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-400 truncate mt-0.5" title={order.address}>
                        {order.address}
                      </p>
                    </td>

                    {/* Product & Variant */}
                    <td className="py-3.5 px-3.5 max-w-[220px]">
                      {order.items && order.items.length > 1 ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-stone-900 text-white text-[10px] font-bold">
                              Panier ({order.items.length} articles)
                            </span>
                            <span className="text-[10px] font-bold text-rose-500">
                              Total x{order.quantity}
                            </span>
                          </div>
                          <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                            {order.items.map((it, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[11px] bg-stone-50 p-1 rounded-lg border border-stone-100">
                                <img
                                  src={it.productImage}
                                  alt=""
                                  className="w-5 h-5 rounded object-cover shrink-0 border border-stone-200"
                                />
                                <div className="min-w-0 flex-1 truncate">
                                  <span className="font-semibold text-stone-900 truncate block">
                                    {it.productTitle}
                                  </span>
                                  <span className="text-[9px] text-stone-500 block truncate">
                                    {it.selectedColor} {it.selectedSize ? `• ${it.selectedSize}` : ''} • <strong className="text-stone-800">x{it.quantity}</strong>
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <img
                            src={order.productImage}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-stone-200"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-stone-900 truncate" title={order.productTitle}>
                              {order.productTitle}
                            </p>
                            <div className="flex items-center gap-1 text-[10px] text-stone-500">
                              <span className="font-semibold text-stone-800">{order.selectedColor}</span>
                              <span>•</span>
                              <span className="font-semibold text-stone-800">{order.selectedSize}</span>
                              <span>•</span>
                              <span>Qté: {order.quantity}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Total Price */}
                    <td className="py-3.5 px-3.5">
                      <span className="font-serif text-sm font-bold text-stone-900 font-mono block">
                        {formatPrice(order.grandTotal, config.currency)}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        (Livraison: {order.shippingFee === 0 ? 'Gratuite' : `${order.shippingFee} DA`})
                      </span>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-3.5">
                      <select
                        value={order.status}
                        onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className={`text-xs font-semibold rounded-xl px-2.5 py-1.5 border focus:outline-none transition-colors ${
                          order.status === 'pending'
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : order.status === 'confirmed'
                            ? 'bg-blue-50 text-blue-900 border-blue-300'
                            : order.status === 'processing'
                            ? 'bg-purple-50 text-purple-900 border-purple-300'
                            : order.status === 'shipped'
                            ? 'bg-indigo-50 text-indigo-900 border-indigo-300'
                            : order.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            : 'bg-rose-50 text-rose-900 border-rose-300'
                        }`}
                      >
                        <option value="pending">⏳ En attente</option>
                        <option value="confirmed">✅ Confirmée</option>
                        <option value="processing">📦 En préparation</option>
                        <option value="shipped">🚚 Expédiée</option>
                        <option value="delivered">🎉 Livrée & Payée</option>
                        <option value="cancelled">❌ Annulée / Retour</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1-Click Print Delivery Slip */}
                        <button
                          onClick={() => setSelectedOrderForPrint(order)}
                          className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                          title="Imprimer le Bordereau de Livraison (Colis)"
                        >
                          <Printer className="w-3.5 h-3.5 text-stone-300" />
                          <span className="hidden md:inline">Bordereau</span>
                        </button>

                        {/* 1-Click WhatsApp Button */}
                        <a
                          href={generateWhatsAppLink(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                          title="Envoyer confirmation WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">WhatsApp</span>
                        </a>

                        {/* View Details Modal Trigger */}
                        <button
                          onClick={() => setSelectedOrderDetails(order)}
                          className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-600 transition-colors"
                          title="Détails complets de la commande"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <OrderDetailsModal
          order={selectedOrderDetails}
          config={config}
          onClose={() => setSelectedOrderDetails(null)}
          onUpdateStatus={updateOrderStatus}
          onPrintSlip={(ord) => {
            setSelectedOrderForPrint(ord);
            setSelectedOrderDetails(null);
          }}
          generateWhatsAppLink={generateWhatsAppLink}
          showToast={showToast}
        />
      )}

      {/* Printable Delivery Slip Modal */}
      {selectedOrderForPrint && (
        <OrderDeliverySlip
          order={selectedOrderForPrint}
          config={config}
          onClose={() => setSelectedOrderForPrint(null)}
        />
      )}
    </div>
  );
};


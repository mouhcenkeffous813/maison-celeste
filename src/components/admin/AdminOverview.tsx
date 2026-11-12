import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Phone,
  MessageCircle,
  Truck,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  MapPin,
  Tag,
  Home,
  Building,
  DollarSign,
  Printer,
  ChevronRight,
  Flame,
  Award,
  Eye,
  CalendarDays,
  XCircle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatPrice, searchMatches, normalizeString } from '../../utils/formatters';
import { OrderStatus, Order } from '../../types';
import { OrderDeliverySlip } from './OrderDeliverySlip';
import { OrderDetailsModal } from './OrderDetailsModal';

export type DateFilterPreset = 'all' | 'today' | 'yesterday' | '7days' | '30days' | 'this_month' | 'last_month' | 'custom';

export const AdminOverview: React.FC<{ onNavigateToOrders: () => void }> = ({ onNavigateToOrders }) => {
  const { orders, products, wilayas, config, updateOrderStatus, generateWhatsAppLink, showToast } = useStore();

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilterPreset>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedWilaya, setSelectedWilaya] = useState<string>('all');
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Filter orders by Date range, Status, and accent-insensitive Search query
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysStr = sevenDaysAgo.toISOString().split('T')[0];

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysStr = thirtyDaysAgo.toISOString().split('T')[0];

    const thisMonthPrefix = todayStr.substring(0, 7);

    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthPrefix = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;

    return orders.filter(order => {
      // 1. Date filter
      if (dateFilter !== 'all') {
        const orderDateStr = order.createdAt.split('T')[0];

        if (dateFilter === 'today') {
          if (orderDateStr !== todayStr) return false;
        } else if (dateFilter === 'yesterday') {
          if (orderDateStr !== yesterdayStr) return false;
        } else if (dateFilter === '7days') {
          if (orderDateStr < sevenDaysStr) return false;
        } else if (dateFilter === '30days') {
          if (orderDateStr < thirtyDaysStr) return false;
        } else if (dateFilter === 'this_month') {
          if (!orderDateStr.startsWith(thisMonthPrefix)) return false;
        } else if (dateFilter === 'last_month') {
          if (!orderDateStr.startsWith(prevMonthPrefix)) return false;
        } else if (dateFilter === 'custom') {
          if (customStartDate && orderDateStr < customStartDate) return false;
          if (customEndDate && orderDateStr > customEndDate) return false;
        }
      }

      // 2. Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      // 3. Wilaya filter
      if (selectedWilaya !== 'all' && order.wilayaName !== selectedWilaya) {
        return false;
      }

      // 4. Accent-insensitive & case-insensitive Search
      // "setif" matches "Sétif", "alger" matches "Alger", etc.
      if (search.trim()) {
        const matchesClient = searchMatches(order.customerName, search);
        const matchesPhone = searchMatches(order.customerPhone, search);
        const matchesWilaya = searchMatches(order.wilayaName, search);
        const matchesCommune = searchMatches(order.commune, search);
        const matchesProduct = searchMatches(order.productTitle, search);
        const matchesOrderNum = searchMatches(order.orderNumber, search);
        const matchesVariant = searchMatches(`${order.selectedColor} ${order.selectedSize}`, search);

        return (
          matchesClient ||
          matchesPhone ||
          matchesWilaya ||
          matchesCommune ||
          matchesProduct ||
          matchesOrderNum ||
          matchesVariant
        );
      }

      return true;
    });
  }, [orders, search, dateFilter, customStartDate, customEndDate, statusFilter, selectedWilaya]);

  // General KPIs based on filtered set
  const totalRevenue = filteredOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const pendingOrders = filteredOrders.filter(o => o.status === 'pending');
  const deliveredOrders = filteredOrders.filter(o => o.status === 'delivered');
  const validOrdersCount = filteredOrders.filter(o => o.status !== 'cancelled').length;
  
  const deliveryRate = filteredOrders.length > 0
    ? Math.round((deliveredOrders.length / filteredOrders.length) * 100)
    : 0;

  const averageOrderValue = validOrdersCount > 0
    ? Math.round(totalRevenue / validOrdersCount)
    : 0;

  // ================= CREATIVE STATS 1: TOP BEST SELLERS (DYNAMIQUEMENT SELON LA PÉRIODE) =================
  const bestSellersStats = useMemo(() => {
    const counts: Record<string, { productTitle: string; productImage: string; count: number; revenue: number }> = {};
    filteredOrders.forEach(o => {
      if (o.status !== 'cancelled') {
        if (!counts[o.productId]) {
          counts[o.productId] = {
            productTitle: o.productTitle,
            productImage: o.productImage,
            count: 0,
            revenue: 0,
          };
        }
        counts[o.productId].count += o.quantity;
        counts[o.productId].revenue += o.grandTotal;
      }
    });

    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [filteredOrders]);

  // ================= CREATIVE STATS 2: TOP WILAYAS D'ALGÉRIE (DYNAMIQUEMENT SELON LA PÉRIODE) =================
  const topWilayasStats = useMemo(() => {
    const counts: Record<string, { wilayaName: string; count: number; totalDA: number }> = {};
    filteredOrders.forEach(o => {
      if (!counts[o.wilayaName]) {
        counts[o.wilayaName] = { wilayaName: o.wilayaName, count: 0, totalDA: 0 };
      }
      counts[o.wilayaName].count += 1;
      counts[o.wilayaName].totalDA += o.grandTotal;
    });

    const totalOrders = filteredOrders.length || 1;
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => ({
        ...item,
        percentage: Math.round((item.count / totalOrders) * 100),
      }));
  }, [filteredOrders]);

  // ================= CREATIVE STATS 3: TOP TAILLES & POINTURES (DYNAMIQUEMENT SELON LA PÉRIODE) =================
  const topSizesStats = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredOrders.forEach(o => {
      const sizeKey = o.selectedSize || 'Standard';
      counts[sizeKey] = (counts[sizeKey] || 0) + o.quantity;
    });

    const totalQty = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([size, count]) => ({
        size,
        count,
        percentage: Math.round((count / totalQty) * 100),
      }));
  }, [filteredOrders]);

  // ================= CREATIVE STATS 4: DOMICILE VS STOP DESK (DYNAMIQUEMENT SELON LA PÉRIODE) =================
  const deliveryModeStats = useMemo(() => {
    let homeCount = 0;
    let deskCount = 0;
    filteredOrders.forEach(o => {
      if (o.deliveryType === 'home') homeCount++;
      else deskCount++;
    });
    const total = filteredOrders.length || 1;
    return {
      homeCount,
      deskCount,
      homePercent: Math.round((homeCount / total) * 100),
      deskPercent: Math.round((deskCount / total) * 100),
    };
  }, [filteredOrders]);

  // Unique list of wilayas in current orders for quick filter dropdown
  const uniqueOrderWilayas = useMemo(() => {
    const set = new Set<string>();
    orders.forEach(o => set.add(o.wilayaName));
    return Array.from(set).sort();
  }, [orders]);

  return (
    <div className="space-y-6">
      
      {/* ================= SEARCH & INTERACTIVE FILTERS BAR ================= */}
      <div className="bg-white rounded-3xl border border-store-border p-4 sm:p-5 shadow-card space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Accent-Insensitive Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par wilaya (ex: setif pour Sétif), client, tel, produit..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-store-base rounded-2xl border border-store-border focus:outline-none focus:border-store-primary font-medium"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Date Range Filter Pills (Presets) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'Toutes les dates' },
              { id: 'today', label: "Aujourd'hui" },
              { id: 'yesterday', label: 'Hier' },
              { id: '7days', label: '7 derniers jours' },
              { id: '30days', label: '30 jours' },
              { id: 'this_month', label: 'Ce mois-ci' },
              { id: 'last_month', label: 'Mois dernier' },
              { id: 'custom', label: 'Personnalisé 📅' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setDateFilter(tab.id as DateFilterPreset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  dateFilter === tab.id
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Range Pickers (Visible when custom is selected) */}
        {dateFilter === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
            <div className="flex items-center gap-1.5 text-stone-700 font-bold">
              <CalendarDays className="w-4 h-4 text-store-primary" />
              <span>Intervalle de dates personnalisé :</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-stone-500 font-medium">Du :</label>
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:border-store-primary"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-stone-500 font-medium">Au :</label>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:border-store-primary"
              />
            </div>

            {(customStartDate || customEndDate) && (
              <button
                onClick={() => {
                  setCustomStartDate('');
                  setCustomEndDate('');
                }}
                className="text-[11px] text-stone-500 hover:text-stone-800 underline ml-auto"
              >
                Effacer l'intervalle
              </button>
            )}
          </div>
        )}

        {/* Secondary Filter Dropdowns (Status & Wilaya) + Active Summary */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 text-xs">
          <div className="flex items-center gap-1.5 text-stone-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtres :</span>
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-store-base border border-store-border rounded-xl text-xs font-medium focus:outline-none focus:border-store-primary"
          >
            <option value="all">Tous les Statuts</option>
            <option value="pending">⏳ En attente de confirmation</option>
            <option value="confirmed">✅ Confirmée</option>
            <option value="processing">📦 En préparation</option>
            <option value="shipped">🚚 Expédiée</option>
            <option value="delivered">🎉 Livrée & Payée</option>
            <option value="cancelled">❌ Annulée</option>
          </select>

          {/* Wilaya Dropdown */}
          <select
            value={selectedWilaya}
            onChange={e => setSelectedWilaya(e.target.value)}
            className="px-3 py-1.5 bg-store-base border border-store-border rounded-xl text-xs font-medium focus:outline-none focus:border-store-primary"
          >
            <option value="all">Toutes les Wilayas</option>
            {uniqueOrderWilayas.map(w => (
              <option key={w} value={w}>
                📍 {w}
              </option>
            ))}
          </select>

          {/* Active Results Counter Pill */}
          <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-xl">
            {filteredOrders.length} {filteredOrders.length > 1 ? 'commandes' : 'commande'} trouvée{filteredOrders.length > 1 ? 's' : ''}
          </span>

          {(search || dateFilter !== 'all' || customStartDate || customEndDate || statusFilter !== 'all' || selectedWilaya !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setDateFilter('all');
                setCustomStartDate('');
                setCustomEndDate('');
                setStatusFilter('all');
                setSelectedWilaya('all');
              }}
              className="px-2.5 py-1 text-[11px] text-rose-600 hover:underline font-bold ml-auto flex items-center gap-1"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Réinitialiser les filtres</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= 5 KPI CARDS ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Chiffre d'Affaires */}
        <div className="bg-white p-4 rounded-3xl border border-store-border shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Chiffre d'Affaires</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className="font-serif text-lg sm:text-xl font-black text-stone-900 font-mono">
              {formatPrice(totalRevenue, config.currency)}
            </p>
            <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Commandes actives</p>
          </div>
        </div>

        {/* Total Commandes */}
        <div className="bg-white p-4 rounded-3xl border border-store-border shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Commandes</span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className="font-serif text-lg sm:text-xl font-black text-stone-900 font-mono">
              {filteredOrders.length}
            </p>
            <p className="text-[10px] text-stone-500 font-medium mt-0.5">Sur la sélection</p>
          </div>
        </div>

        {/* À Confirmer */}
        <div className="bg-white p-4 rounded-3xl border border-store-border shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">À Confirmer</span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className="font-serif text-lg sm:text-xl font-black text-amber-700 font-mono">
              {pendingOrders.length}
            </p>
            <p className="text-[10px] text-amber-600 font-medium mt-0.5">Validation requise</p>
          </div>
        </div>

        {/* Taux de Livraison */}
        <div className="bg-white p-4 rounded-3xl border border-store-border shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Taux de Succès</span>
            <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className="font-serif text-lg sm:text-xl font-black text-stone-900 font-mono">
              {deliveryRate}%
            </p>
            <p className="text-[10px] text-purple-600 font-medium mt-0.5">
              Colis livrés / payés ({deliveredOrders.length}/{filteredOrders.length})
            </p>
          </div>
        </div>

        {/* Panier Moyen COD */}
        <div className="bg-white p-4 rounded-3xl border border-store-border shadow-card flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-stone-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Panier Moyen</span>
            <div className="w-7 h-7 rounded-xl bg-rose-50 text-store-primary flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <p className="font-serif text-lg sm:text-xl font-black text-stone-900 font-mono">
              {formatPrice(averageOrderValue, config.currency)}
            </p>
            <p className="text-[10px] text-stone-500 font-medium mt-0.5">Montant moyen / colis</p>
          </div>
        </div>
      </div>

      {/* ================= CRÉATIVE STATS GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* STATS 1: TOP MEILLEURES VENTES (Best-Sellers) */}
        <div className="bg-white rounded-3xl border border-store-border p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-sm font-bold text-stone-900">
                Top Meilleures Ventes
              </h3>
            </div>
            <span className="text-[10px] font-bold text-stone-400 uppercase">Articles Phares</span>
          </div>

          <div className="space-y-3">
            {bestSellersStats.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-store-secondary text-store-primary font-mono text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <img
                  src={item.productImage}
                  alt={item.productTitle}
                  className="w-10 h-10 object-cover rounded-xl border border-stone-200 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-stone-900 truncate" title={item.productTitle}>
                    {item.productTitle}
                  </p>
                  <p className="text-[10px] text-stone-500">
                    <strong className="text-stone-800 font-mono">{item.count}</strong> pièces vendues •{' '}
                    <span className="text-store-primary font-bold font-mono">
                      {formatPrice(item.revenue, config.currency)}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STATS 2: TOP WILAYAS LES PLUS COMMANDÉES */}
        <div className="bg-white rounded-3xl border border-store-border p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-sm font-bold text-stone-900">
                Top Wilayas Actives
              </h3>
            </div>
            <span className="text-[10px] font-bold text-stone-400 uppercase">Algérie (58)</span>
          </div>

          <div className="space-y-3">
            {topWilayasStats.map((w, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-900 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-store-primary" />
                    <span>{w.wilayaName}</span>
                  </span>
                  <span className="text-[11px] text-stone-600 font-mono">
                    <strong>{w.count}</strong> colis ({w.percentage}%)
                  </span>
                </div>
                <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-store-primary rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(15, w.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STATS 3 & 4: TAILLES/POINTURES & MODE DE LIVRAISON */}
        <div className="bg-white rounded-3xl border border-store-border p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Tag className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-sm font-bold text-stone-900">
                Tailles / Pointures & Logistique
              </h3>
            </div>
            <span className="text-[10px] font-bold text-stone-400 uppercase">Répartition</span>
          </div>

          {/* Sizes / Pointures Pills */}
          <div>
            <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider mb-2">
              Tailles / Pointures les plus commandées :
            </p>
            <div className="flex flex-wrap gap-1.5">
              {topSizesStats.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-store-base border border-stone-200 text-xs shadow-xs"
                >
                  <span className="font-bold text-stone-900">{item.size}</span>
                  <span className="text-[10px] font-mono text-store-primary font-bold bg-store-primary/10 px-1 rounded">
                    {item.count} ({item.percentage}%)
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Delivery Mode Split (Home vs Stop Desk) */}
          <div className="pt-2 border-t border-stone-100">
            <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider mb-2">
              Mode de Livraison Privilégié :
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-blue-50/70 p-2.5 rounded-2xl border border-blue-200">
                <div className="flex items-center gap-1.5 text-blue-800 font-bold">
                  <Home className="w-3.5 h-3.5" />
                  <span>Domicile</span>
                </div>
                <p className="font-mono text-base font-black text-blue-900 mt-1">
                  {deliveryModeStats.homePercent}%
                </p>
                <p className="text-[10px] text-blue-600">{deliveryModeStats.homeCount} colis</p>
              </div>

              <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-1.5 text-stone-800 font-bold">
                  <Building className="w-3.5 h-3.5 text-stone-600" />
                  <span>Stop Desk</span>
                </div>
                <p className="font-mono text-base font-black text-stone-900 mt-1">
                  {deliveryModeStats.deskPercent}%
                </p>
                <p className="text-[10px] text-stone-500">{deliveryModeStats.deskCount} colis</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ================= COMMANDES FILTRÉES & ACTIONS DIRECTES ================= */}
      <div className="bg-white rounded-3xl border border-store-border p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
              <span>Commandes Récentes</span>
              <span className="text-xs font-mono font-normal bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                {filteredOrders.length} résultats
              </span>
            </h3>
            <p className="text-xs text-stone-500">
              {search ? `Recherche avec "${search}" (Sétif/setif inclus)` : 'Cliquez pour traiter ou imprimer le bordereau de colis.'}
            </p>
          </div>

          <button
            onClick={onNavigateToOrders}
            className="text-xs font-bold text-store-primary hover:underline flex items-center gap-1"
          >
            <span>Ouvrir le CRM Complet</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-10 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-500">
            Aucune commande ne correspond à votre recherche "{search}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-store-secondary/40 text-stone-600 uppercase text-[10px] font-bold border-b border-store-border">
                <tr>
                  <th className="py-2.5 px-3">N° / Date</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Wilaya & Commune</th>
                  <th className="py-2.5 px-3">Article & Variante</th>
                  <th className="py-2.5 px-3">Montant Total</th>
                  <th className="py-2.5 px-3">Statut</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.slice(0, 8).map(order => (
                  <tr key={order.id} className="hover:bg-store-secondary/20 transition-colors">
                    {/* Order ID */}
                    <td className="py-3 px-3 font-mono">
                      <span className="font-bold text-stone-900">{order.orderNumber}</span>
                      <p className="text-[10px] text-stone-400 font-sans">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-3">
                      <p className="font-semibold text-stone-900">{order.customerName}</p>
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="text-stone-500 font-mono text-[11px] flex items-center gap-1 hover:text-store-primary"
                      >
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span>{order.customerPhone}</span>
                      </a>
                    </td>

                    {/* Wilaya (Supports Sétif / setif) */}
                    <td className="py-3 px-3">
                      <p className="font-bold text-stone-900">{order.wilayaName}</p>
                      <span className="text-[10px] text-stone-500">{order.commune}</span>
                      <span className="text-[9px] ml-1 px-1.5 py-0.2 rounded bg-stone-100 text-stone-600">
                        {order.deliveryType === 'home' ? 'Domicile' : 'Stop Desk'}
                      </span>
                    </td>

                    {/* Product & Variant */}
                    <td className="py-3 px-3 max-w-[200px]">
                      {order.items && order.items.length > 1 ? (
                        <div>
                          <p className="font-bold text-xs text-stone-900 truncate flex items-center gap-1">
                            <span className="px-1.5 py-0.5 rounded bg-stone-900 text-white text-[9px]">Panier</span>
                            <span>{order.items.length} articles (x{order.quantity})</span>
                          </p>
                          <p className="text-[10px] text-stone-500 truncate mt-0.5" title={order.items.map(i => `${i.productTitle} (x${i.quantity})`).join(', ')}>
                            {order.items.map(i => i.productTitle).join(', ')}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-stone-900 truncate" title={order.productTitle}>
                            {order.productTitle}
                          </p>
                          <p className="text-[10px] text-stone-500">
                            {order.selectedColor} • <strong className="text-stone-700">{order.selectedSize}</strong>
                          </p>
                        </div>
                      )}
                    </td>

                    {/* Total Price */}
                    <td className="py-3 px-3 font-bold text-stone-900 font-mono">
                      {formatPrice(order.grandTotal, config.currency)}
                    </td>

                    {/* Status Select */}
                    <td className="py-3 px-3">
                      <select
                        value={order.status}
                        onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className={`text-[11px] font-semibold rounded-lg px-2 py-1 border focus:outline-none ${
                          order.status === 'pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : order.status === 'confirmed'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : order.status === 'processing'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : order.status === 'shipped'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                            : order.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmée</option>
                        <option value="processing">En préparation</option>
                        <option value="shipped">Expédiée</option>
                        <option value="delivered">Livrée</option>
                        <option value="cancelled">Annulée</option>
                      </select>
                    </td>

                    {/* Actions: Details, Print Slip & WhatsApp */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedOrderDetails(order)}
                          className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-600 transition-colors"
                          title="Voir tous les détails (Quantité, Articles, Client)"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setSelectedOrderForPrint(order)}
                          className="px-2 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-semibold flex items-center gap-1 shadow-xs"
                          title="Imprimer le bordereau de colis"
                        >
                          <Printer className="w-3 h-3 text-stone-300" />
                          <span className="hidden sm:inline">Bordereau</span>
                        </button>

                        <a
                          href={generateWhatsAppLink(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1 shadow-xs"
                          title="WhatsApp confirmation"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal with Prominent Quantity & Breakdown */}
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

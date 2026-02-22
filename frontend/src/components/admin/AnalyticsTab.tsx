import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  Package,
  MessageCircle,
  Star,
  AlertTriangle,
  Download,
} from 'lucide-react';
import RevenueChart from './RevenueChart';

interface Stats {
  total_revenue: number;
  pending_orders: number;
  total_users: number;
  completed_orders: number;
  active_products: number;
  open_tickets: number;
  total_reviews: number;
  rejected_orders: number;
}

interface ProductAnalytics {
  id: number;
  name: string;
  category: string;
  total_orders: number;
  total_revenue: number;
  average_rating: number | null;
  stock_count: number;
}

type SortKey = keyof Pick<
  ProductAnalytics,
  'name' | 'category' | 'total_orders' | 'total_revenue' | 'average_rating' | 'stock_count'
>;

function AnimatedCounter({ value }: { value: number | string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {value}
    </motion.span>
  );
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < full ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'}
        />
      ))}
    </span>
  );
}

export default function AnalyticsTab() {
  const [sortKey, setSortKey] = useState<SortKey>('total_revenue');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await axios.get('/api/v1/admin/stats');
      return data;
    },
  });

  const { data: products, isLoading: productsLoading } = useQuery<ProductAnalytics[]>({
    queryKey: ['admin-product-analytics'],
    queryFn: async () => {
      const { data } = await axios.get('/api/v1/admin/product-analytics');
      return data;
    },
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortedProducts = [...(products ?? [])].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDir === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  const handleExport = async (type: 'orders' | 'users') => {
    try {
      const { data } = await axios.get(`/api/v1/admin/export/${type}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-export.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Failed to export ${type}`, error);
    }
  };

  const kpis: {
    label: string;
    value: number | string;
    icon: React.ReactNode;
    accent: string;
  }[] = stats
    ? [
        {
          label: 'Total Revenue',
          value: `${(stats.total_revenue || 0).toLocaleString()} EGP`,
          icon: <DollarSign size={22} />,
          accent: 'text-success',
        },
        {
          label: 'Pending Orders',
          value: stats.pending_orders,
          icon: <ShoppingBag size={22} />,
          accent: 'text-yellow-500',
        },
        {
          label: 'Total Users',
          value: stats.total_users,
          icon: <Users size={22} />,
          accent: 'text-primary',
        },
        {
          label: 'Completed Orders',
          value: stats.completed_orders,
          icon: <TrendingUp size={22} />,
          accent: 'text-success',
        },
        {
          label: 'Active Products',
          value: stats.active_products,
          icon: <Package size={22} />,
          accent: 'text-primary',
        },
        {
          label: 'Open Tickets',
          value: stats.open_tickets,
          icon: <MessageCircle size={22} />,
          accent: 'text-yellow-500',
        },
        {
          label: 'Total Reviews',
          value: stats.total_reviews,
          icon: <Star size={22} />,
          accent: 'text-primary',
        },
        {
          label: 'Rejected Orders',
          value: stats.rejected_orders,
          icon: <AlertTriangle size={22} />,
          accent: 'text-danger',
        },
      ]
    : [];

  const columnHeaders: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'total_orders', label: 'Total Orders' },
    { key: 'total_revenue', label: 'Revenue (EGP)' },
    { key: 'average_rating', label: 'Avg Rating' },
    { key: 'stock_count', label: 'Stock Available' },
  ];

  return (
    <div className="space-y-8">
      {/* Export Buttons */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => handleExport('orders')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Download size={16} />
          Export Orders CSV
        </button>
        <button
          onClick={() => handleExport('users')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Download size={16} />
          Export Users CSV
        </button>
      </div>

      {/* KPI Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-surface animate-pulse border border-border"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-xl bg-surface border border-border p-5 flex flex-col gap-2 hover:bg-surface-hover transition-colors"
            >
              <div className={`${kpi.accent}`}>{kpi.icon}</div>
              <p className="text-sm text-foreground/60">{kpi.label}</p>
              <p className="text-xl font-bold text-foreground">
                <AnimatedCounter value={kpi.value} />
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Revenue Chart */}
      <div className="rounded-xl bg-surface border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Overview</h3>
        <RevenueChart />
      </div>

      {/* Product Performance Table */}
      <div className="rounded-xl bg-surface border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Product Performance</h3>
        </div>

        {productsLoading ? (
          <div className="p-8 text-center text-foreground/50">Loading product data...</div>
        ) : !sortedProducts.length ? (
          <div className="p-8 text-center text-foreground/50">No product data available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {columnHeaders.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="px-5 py-3 text-left text-foreground/70 font-medium cursor-pointer select-none hover:text-foreground transition-colors"
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {sortKey === col.key && (
                          <span className="text-xs">{sortDir === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-border last:border-b-0 hover:bg-surface-hover transition-colors"
                  >
                    <td className="px-5 py-3 text-foreground font-medium">{product.name}</td>
                    <td className="px-5 py-3 text-foreground/70">{product.category}</td>
                    <td className="px-5 py-3 text-foreground">{product.total_orders}</td>
                    <td className="px-5 py-3 text-foreground">
                      {(product.total_revenue || 0).toLocaleString()} EGP
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={product.average_rating || 0} />
                        <span className="text-foreground/50 text-xs">
                          ({product.average_rating?.toFixed(1) || '0.0'})
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-foreground">{product.stock_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

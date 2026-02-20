import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface RevenueData {
  date: string
  revenue: number
}

export default function RevenueChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['revenue-chart'],
    queryFn: async (): Promise<RevenueData[]> => {
      const res = await axios.get('/api/v1/admin/revenue-chart?days=30')
      return res.data
    }
  })

  if (isLoading) {
    return (
      <div className="bg-surface border border-border/50 rounded-2xl p-6 h-[300px] animate-pulse" />
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-surface border border-border/50 rounded-2xl p-6 h-[300px] flex items-center justify-center text-foreground/40 text-sm">
        No revenue data available
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border/50 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Revenue (30 Days)</h3>
        <span className="text-xs text-foreground/40">
          Total: {data.reduce((s, d) => s + d.revenue, 0).toFixed(0)} EGP
        </span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--foreground)', opacity: 0.4, fontSize: 11 }}
            tickFormatter={(val: string) => new Date(val).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--foreground)', opacity: 0.4, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '8px 12px',
              fontSize: '12px',
              color: 'var(--foreground)',
            }}
            formatter={(value: any) => [`${Number(value).toFixed(2)} EGP`, 'Revenue']}
            labelFormatter={(label: any) => new Date(label).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#revenueGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

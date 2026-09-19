import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Area,
} from 'recharts';
import { InvoiceQuote, DocumentType, InvoiceStatus } from '../../types/schema';
import {
  TrendingUp,
  Receipt,
  Clock,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Calendar,
  BarChart3,
  LineChart as LineChartIcon,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

interface RevenueSummaryCardProps {
  invoices: InvoiceQuote[];
  onViewAllInvoices?: () => void;
  onNewInvoice?: () => void;
}

interface MonthlyDataPoint {
  monthKey: string;
  monthLabel: string;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  totalInvoiced: number;
  vatAmount: number;
  paidCount: number;
  pendingCount: number;
  collectionRate: number;
}

export const RevenueSummaryCard: React.FC<RevenueSummaryCardProps> = ({
  invoices,
  onViewAllInvoices,
  onNewInvoice,
}) => {
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');
  const [timeRange, setTimeRange] = useState<'6m' | 'all'>('6m');

  // Compute monthly data dynamically from actual tenant invoices
  const { monthlyData, overallStats } = useMemo(() => {
    const onlyInvoices = invoices.filter((i) => i.docType === DocumentType.INVOICE);

    // Group by Year-Month (YYYY-MM)
    const monthMap = new Map<string, {
      paid: number;
      pending: number;
      overdue: number;
      vat: number;
      paidCount: number;
      pendingCount: number;
    }>();

    // Ensure last 6 calendar months exist even if 0 invoices
    const now = new Date('2026-08-22T00:00:00Z');
    const defaultMonths: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      defaultMonths.push(k);
      monthMap.set(k, {
        paid: 0,
        pending: 0,
        overdue: 0,
        vat: 0,
        paidCount: 0,
        pendingCount: 0,
      });
    }

    onlyInvoices.forEach((inv) => {
      const date = new Date(inv.createdAt);
      if (isNaN(date.getTime())) return;
      const k = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthMap.has(k)) {
        monthMap.set(k, {
          paid: 0,
          pending: 0,
          overdue: 0,
          vat: 0,
          paidCount: 0,
          pendingCount: 0,
        });
      }

      const entry = monthMap.get(k)!;
      if (inv.status === InvoiceStatus.PAID) {
        entry.paid += inv.grandTotal;
        entry.vat += inv.vatAmount;
        entry.paidCount += 1;
      } else if (inv.status === InvoiceStatus.OVERDUE) {
        entry.overdue += inv.grandTotal;
        entry.pending += inv.grandTotal;
        entry.pendingCount += 1;
      } else if (inv.status === InvoiceStatus.SENT || inv.status === InvoiceStatus.DRAFT) {
        entry.pending += inv.grandTotal;
        entry.pendingCount += 1;
      }
    });

    const sortedKeys = Array.from(monthMap.keys()).sort();
    const activeKeys = timeRange === '6m' ? defaultMonths : sortedKeys;

    const data: MonthlyDataPoint[] = activeKeys.map((key) => {
      const item = monthMap.get(key) || {
        paid: 0,
        pending: 0,
        overdue: 0,
        vat: 0,
        paidCount: 0,
        pendingCount: 0,
      };

      const [year, month] = key.split('-');
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthLabel = dateObj.toLocaleDateString('en-ZA', { month: 'short', year: '2-digit' });

      const total = item.paid + item.pending;
      const collectionRate = total > 0 ? Math.round((item.paid / total) * 100) : 100;

      return {
        monthKey: key,
        monthLabel,
        paidAmount: Math.round(item.paid),
        pendingAmount: Math.round(item.pending),
        overdueAmount: Math.round(item.overdue),
        totalInvoiced: Math.round(total),
        vatAmount: Math.round(item.vat),
        paidCount: item.paidCount,
        pendingCount: item.pendingCount,
        collectionRate,
      };
    });

    // Calculate aggregated totals
    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;
    let totalVat = 0;
    let totalInvoiced = 0;
    let countPaid = 0;
    let countPending = 0;

    onlyInvoices.forEach((inv) => {
      totalInvoiced += inv.grandTotal;
      if (inv.status === InvoiceStatus.PAID) {
        totalPaid += inv.grandTotal;
        totalVat += inv.vatAmount;
        countPaid++;
      } else {
        totalPending += inv.grandTotal;
        countPending++;
        if (inv.status === InvoiceStatus.OVERDUE) {
          totalOverdue += inv.grandTotal;
        }
      }
    });

    const overallCollectionRate =
      totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 100;

    return {
      monthlyData: data,
      overallStats: {
        totalPaid,
        totalPending,
        totalOverdue,
        totalVat,
        totalInvoiced,
        countPaid,
        countPending,
        overallCollectionRate,
      },
    };
  }, [invoices, timeRange]);

  // Custom Frosted Glass Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: MonthlyDataPoint = payload[0].payload;
      return (
        <div className="bg-slate-950/90 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl space-y-2.5 min-w-[220px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              {data.monthLabel} Breakdown
            </span>
            <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
              {data.collectionRate}% Settled
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" />
                <span className="text-slate-300">Revenue Collected:</span>
              </div>
              <span className="font-mono font-bold text-emerald-400">
                R {data.paidAmount.toLocaleString('en-ZA')}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-sm" />
                <span className="text-slate-300">Pending / Awaiting:</span>
              </div>
              <span className="font-mono font-bold text-indigo-300">
                R {data.pendingAmount.toLocaleString('en-ZA')}
              </span>
            </div>

            {data.overdueAmount > 0 && (
              <div className="flex items-center justify-between gap-3 text-amber-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />
                  <span>Of which Overdue:</span>
                </div>
                <span className="font-mono font-bold">
                  R {data.overdueAmount.toLocaleString('en-ZA')}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/[0.08] text-[11px] text-slate-400">
              <span>SARS 15% VAT Paid:</span>
              <span className="font-mono font-semibold text-slate-300">
                R {data.vatAmount.toLocaleString('en-ZA')}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-sm">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                Monthly Revenue & Pending Invoices
              </h2>
              <p className="text-xs text-slate-400">
                Visualizing collected EFT payments vs. outstanding SARS 15% VAT invoices.
              </p>
            </div>
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Chart format buttons */}
          <div className="flex bg-white/[0.04] p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setChartType('bar')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                chartType === 'bar'
                  ? 'bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Bar Chart"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold">Bars</span>
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                chartType === 'area'
                  ? 'bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Area Trend"
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold">Area</span>
            </button>
          </div>

          {/* Time range selector */}
          <div className="flex bg-white/[0.04] p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setTimeRange('6m')}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-semibold ${
                timeRange === '6m'
                  ? 'bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Last 6 Months
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-semibold ${
                timeRange === 'all'
                  ? 'bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Time
            </button>
          </div>

          {onViewAllInvoices && (
            <button
              onClick={onViewAllInvoices}
              className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1"
            >
              <span>Invoices</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Highlights Strip inside the Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Collected Revenue */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Collected Revenue</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <p className="text-lg sm:text-xl font-mono font-extrabold text-emerald-400">
            R {overallStats.totalPaid.toLocaleString('en-ZA', { minimumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] text-emerald-300/80">
            {overallStats.countPaid} settled tax invoices
          </p>
        </div>

        {/* Total Pending / Outstanding */}
        <div className="bg-indigo-950/20 border border-indigo-500/30 p-3.5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-indigo-300 text-[11px] font-bold uppercase tracking-wider">
            <span>Pending Invoices</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <p className="text-lg sm:text-xl font-mono font-extrabold text-indigo-200">
            R {overallStats.totalPending.toLocaleString('en-ZA', { minimumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] text-indigo-300/80">
            {overallStats.countPending} awaiting EFT payment
          </p>
        </div>

        {/* Overdue Component */}
        <div className="bg-amber-950/20 border border-amber-500/30 p-3.5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-amber-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Overdue Amount</span>
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
          <p className="text-lg sm:text-xl font-mono font-extrabold text-amber-300">
            R {overallStats.totalOverdue.toLocaleString('en-ZA', { minimumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] text-amber-300/80">WhatsApp reminders ready</p>
        </div>

        {/* Collection Efficiency Rate */}
        <div className="bg-white/[0.03] border border-white/10 p-3.5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Collection Rate</span>
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <p className="text-lg sm:text-xl font-mono font-extrabold text-slate-100">
              {overallStats.overallCollectionRate}%
            </p>
            <span className="text-[10px] font-bold text-emerald-400">High Efficiency</span>
          </div>
          <p className="text-[10px] text-slate-400">Total: R {overallStats.totalInvoiced.toLocaleString('en-ZA')}</p>
        </div>
      </div>

      {/* Recharts Visual Canvas */}
      <div className="h-[280px] sm:h-[320px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <ComposedChart
              data={monthlyData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="paidBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
                </linearGradient>
                <linearGradient id="pendingBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818CF8" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255, 255, 255, 0.07)"
                vertical={false}
              />
              <XAxis
                dataKey="monthLabel"
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                tickFormatter={(val) => `R${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '16px', fontSize: '11px' }}
                formatter={(value) => {
                  if (value === 'paidAmount') return <span className="text-emerald-400 font-semibold">Revenue Collected (ZAR)</span>;
                  if (value === 'pendingAmount') return <span className="text-indigo-300 font-semibold">Pending / Outstanding (ZAR)</span>;
                  if (value === 'collectionRate') return <span className="text-amber-300 font-semibold">Settlement %</span>;
                  return value;
                }}
              />
              <Bar
                dataKey="paidAmount"
                name="paidAmount"
                fill="url(#paidBarGradient)"
                radius={[6, 6, 0, 0]}
                barSize={24}
              />
              <Bar
                dataKey="pendingAmount"
                name="pendingAmount"
                fill="url(#pendingBarGradient)"
                radius={[6, 6, 0, 0]}
                barSize={24}
              />
              <Line
                type="monotone"
                dataKey="collectionRate"
                name="collectionRate"
                stroke="#FBBF24"
                strokeWidth={2}
                dot={{ fill: '#FBBF24', r: 3 }}
                yAxisId={0}
                hide
              />
            </ComposedChart>
          ) : (
            <ComposedChart
              data={monthlyData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="paidAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="pendingAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255, 255, 255, 0.07)"
                vertical={false}
              />
              <XAxis
                dataKey="monthLabel"
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                tickFormatter={(val) => `R${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '16px', fontSize: '11px' }}
                formatter={(value) => {
                  if (value === 'paidAmount') return <span className="text-emerald-400 font-semibold">Revenue Collected (ZAR)</span>;
                  if (value === 'pendingAmount') return <span className="text-indigo-300 font-semibold">Pending / Outstanding (ZAR)</span>;
                  return value;
                }}
              />
              <Area
                type="monotone"
                dataKey="paidAmount"
                name="paidAmount"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#paidAreaGradient)"
              />
              <Area
                type="monotone"
                dataKey="pendingAmount"
                name="pendingAmount"
                stroke="#818CF8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#pendingAreaGradient)"
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Footer Info / Legend Bar */}
      <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-300 font-medium">Revenue Collected</span> (Paid Tax Invoices)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
            <span className="text-slate-300 font-medium">Pending Totals</span> (Sent / Overdue)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-slate-500">
            Auto-synced with ActivityHub SARS 15% Engine
          </span>
        </div>
      </div>
    </div>
  );
};

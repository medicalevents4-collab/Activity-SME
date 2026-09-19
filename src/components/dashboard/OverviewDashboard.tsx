import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DocumentType,
  InvoiceStatus,
  TaxMode,
  InvoiceQuote,
} from '../../types/schema';
import { InvoiceViewModal } from '../invoices/InvoiceViewModal';
import { InvoiceEditorModal } from '../invoices/InvoiceEditorModal';
import { RevenueSummaryCard } from './RevenueSummaryCard';
import {
  TrendingUp,
  Receipt,
  Sparkles,
  Calculator,
  Crown,
  MessageSquare,
  HardDrive,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  Eye,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowRight,
  FileCheck2,
  Users2,
  Building2,
} from 'lucide-react';

export const OverviewDashboard: React.FC = () => {
  const {
    invoices,
    prebuiltTemplates,
    conversations,
    files,
    clients,
    currentTenant,
    currentUser,
    currentSubscription,
    setActiveTab,
    shareInvoiceViaWhatsApp,
    applyTemplateToNewInvoice,
  } = useApp();

  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<InvoiceQuote | null>(null);
  const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState<InvoiceQuote | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorDocType, setEditorDocType] = useState<DocumentType>(DocumentType.INVOICE);

  const tenantInvoices = invoices.filter((i) => i.tenantId === currentTenant.id);
  const tenantFiles = files.filter((f) => f.tenantId === currentTenant.id);
  const tenantConversations = conversations.filter((c) => c.tenantId === currentTenant.id);
  const tenantClients = clients.filter((c) => c.tenantId === currentTenant.id);

  // Financial sums
  const totalInvoiced = tenantInvoices
    .filter((i) => i.docType === DocumentType.INVOICE)
    .reduce((sum, i) => sum + i.grandTotal, 0);

  const totalCollected = tenantInvoices
    .filter((i) => i.docType === DocumentType.INVOICE && i.status === InvoiceStatus.PAID)
    .reduce((sum, i) => sum + i.grandTotal, 0);

  const totalPending = tenantInvoices
    .filter(
      (i) =>
        i.docType === DocumentType.INVOICE &&
        (i.status === InvoiceStatus.SENT || i.status === InvoiceStatus.OVERDUE)
    )
    .reduce((sum, i) => sum + i.grandTotal, 0);

  const totalVat = tenantInvoices
    .filter((i) => i.docType === DocumentType.INVOICE && i.status === InvoiceStatus.PAID)
    .reduce((sum, i) => sum + i.vatAmount, 0);

  const openNewInvoice = () => {
    setSelectedInvoiceForEdit(null);
    setEditorDocType(DocumentType.INVOICE);
    setIsEditorOpen(true);
  };

  const openNewQuote = () => {
    setSelectedInvoiceForEdit(null);
    setEditorDocType(DocumentType.QUOTE);
    setIsEditorOpen(true);
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID:
        return 'status-paid';
      case InvoiceStatus.SENT:
        return 'status-sent';
      case InvoiceStatus.OVERDUE:
        return 'status-overdue';
      case InvoiceStatus.CANCELLED:
        return 'status-cancelled';
      default:
        return 'status-draft';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block border border-white/20"
              style={{ backgroundColor: currentTenant.primaryColor || '#D97706' }}
            />
            <span>{currentTenant.name} &bull; SMME Daily Operations</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Welcome back, {currentUser.fullName.split(' ')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage daily quotes, 15% VAT tax invoices, monthly subscriptions, and WhatsApp customer outreach.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('templates')}
            className="px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 font-semibold rounded-xl text-xs shadow-sm transition-colors flex items-center gap-1.5 backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Templates</span>
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className="px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 font-semibold rounded-xl text-xs shadow-sm transition-colors flex items-center gap-1.5 backdrop-blur-md"
          >
            <Users2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Clients ({tenantClients.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className="px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 font-semibold rounded-xl text-xs shadow-sm transition-colors flex items-center gap-1.5 backdrop-blur-md"
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pricing Calc</span>
          </button>
          <button
            onClick={openNewQuote}
            className="px-3.5 py-2 bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-slate-100 font-bold rounded-xl text-xs shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Quote</span>
          </button>
          <button
            onClick={openNewInvoice}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Revenue Collected</span>
            <Receipt className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-400">
            R {totalCollected.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Invoiced: R {totalInvoiced.toLocaleString('en-ZA', { minimumFractionDigits: 0 })}</span>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              EFT Verified
            </span>
          </div>
        </div>

        {/* SARS VAT */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">SARS 15% VAT</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold font-mono text-indigo-300">
            R {totalVat.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-indigo-400">VAT201 Tax Returns Accrued</p>
        </div>

        {/* Monthly Subscription Tier */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl shadow-sm space-y-1.5 cursor-pointer" onClick={() => setActiveTab('subscriptions')}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Monthly SaaS Plan</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold font-mono text-amber-300">
            {currentSubscription?.tier || 'GROWTH'}
          </p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>R {currentSubscription?.monthlyPriceZAR || 599} / mo</span>
            <span className="text-amber-300 font-bold hover:underline">Manage →</span>
          </div>
        </div>

        {/* WhatsApp & Files */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">WhatsApp & Storage</span>
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-extrabold font-mono text-slate-100">
            {tenantConversations.length} <span className="text-sm font-sans font-semibold text-slate-400">Chats</span>
          </p>
          <p className="text-[11px] text-slate-400">{tenantFiles.length} Encrypted S3 Vault Files</p>
        </div>
      </div>

      {/* Recharts Monthly Revenue & Pending Totals Summary Card */}
      <RevenueSummaryCard
        invoices={tenantInvoices}
        onViewAllInvoices={() => setActiveTab('invoices')}
        onNewInvoice={openNewInvoice}
      />

      {/* Main Dual Grid: Recent Invoices & Prebuilt Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Invoices & Quotes (7 cols) */}
        <div className="lg:col-span-7 glass-card rounded-3xl shadow-lg overflow-hidden flex flex-col justify-between">
          <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-400" />
              <h2 className="font-bold text-sm text-slate-100">Recent Tax Invoices & Quotes</h2>
            </div>
            <button
              onClick={() => setActiveTab('invoices')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <span>View All ({tenantInvoices.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] text-slate-400 font-semibold border-b border-white/[0.08]">
                <tr>
                  <th className="p-3 pl-4">Doc # & Type</th>
                  <th className="p-3">Client</th>
                  <th className="p-3 text-right">Total (ZAR)</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right pr-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {tenantInvoices.slice(0, 4).map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="p-3 pl-4 font-mono font-bold text-slate-100">
                      <div>{inv.documentNumber}</div>
                      <div className="text-[10px] font-normal text-slate-400">
                        {inv.docType === DocumentType.INVOICE ? 'Tax Invoice' : 'Quote'}
                      </div>
                    </td>
                    <td className="p-3 truncate max-w-[140px] font-medium text-slate-300">
                      {inv.clientName}
                    </td>
                    <td className="p-3 text-right font-mono font-semibold text-emerald-400">
                      R {inv.grandTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusBadge(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedInvoiceForView(inv)}
                          className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-white/10 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => shareInvoiceViaWhatsApp(inv)}
                          className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 bg-white/[0.02] border-t border-white/[0.06] text-right">
            <span className="text-[11px] text-slate-400 font-mono">
              SARS 15% VAT & No-VAT Calculation Engine Active
            </span>
          </div>
        </div>

        {/* Prebuilt Industry Templates Showcase (5 cols) */}
        <div className="lg:col-span-5 glass-card rounded-3xl shadow-lg overflow-hidden flex flex-col justify-between">
          <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="font-bold text-sm text-slate-100">Prebuilt SMME Templates</h2>
            </div>
            <button
              onClick={() => setActiveTab('templates')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <span>Explore All ({prebuiltTemplates.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            {prebuiltTemplates.slice(0, 3).map((template) => (
              <div
                key={template.id}
                onClick={() => applyTemplateToNewInvoice(template)}
                className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-amber-500/50 hover:bg-white/[0.06] cursor-pointer transition-all space-y-1.5 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-xs text-slate-100 group-hover:text-amber-300 transition-colors truncate">
                    {template.name}
                  </h3>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${template.primaryColor}25`,
                      color: template.primaryColor,
                    }}
                  >
                    {template.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {template.description}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>{template.industry}</span>
                  <span className="text-emerald-400 font-mono font-semibold">
                    {template.defaultTaxMode === TaxMode.VAT_15 ? '15% VAT' : '0% No VAT'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
            <span>Instant 1-Click Quote & Invoice Presets</span>
            <button
              onClick={() => setActiveTab('templates')}
              className="font-bold text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1"
            >
              <span>View Catalog</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Omnichannel Direct Dispatch Banner */}
      <div className="glass-card rounded-3xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">
              WhatsApp Direct Invoice & Quote Dispatch Channel
            </h3>
            <p className="text-xs text-slate-400">
              Instant delivery of SARS 15% VAT invoices, estimates, and banking EFT details directly to your clients' mobile phones.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 whitespace-nowrap"
        >
          <span>Open WhatsApp Hub</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* View Modal */}
      {selectedInvoiceForView && (
        <InvoiceViewModal
          invoice={selectedInvoiceForView}
          onClose={() => setSelectedInvoiceForView(null)}
          onEdit={(inv) => {
            setSelectedInvoiceForEdit(inv);
            setIsEditorOpen(true);
          }}
        />
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <InvoiceEditorModal
          initialInvoice={selectedInvoiceForEdit}
          defaultDocType={editorDocType}
          onClose={() => {
            setIsEditorOpen(false);
            setSelectedInvoiceForEdit(null);
          }}
        />
      )}
    </div>
  );
};

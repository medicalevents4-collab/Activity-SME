import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  InvoiceQuote,
  DocumentType,
  TaxMode,
  InvoiceStatus,
} from '../../types/schema';
import { InvoiceEditorModal } from './InvoiceEditorModal';
import { InvoiceViewModal } from './InvoiceViewModal';
import { generateVectorInvoicePdf } from '../../utils/pdfGenerator';
import {
  Receipt,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Download,
  MessageSquare,
  Sparkles,
  Calculator,
  FileCheck2,
  Users2,
  Mail,
  CheckCircle2,
} from 'lucide-react';

export const InvoiceManager: React.FC = () => {
  const {
    invoices,
    deleteInvoice,
    markInvoiceStatus,
    shareInvoiceViaWhatsApp,
    currentTenant,
    setActiveTab,
    templateToApply,
    clientToInvoice,
    clients,
    emailLogs,
    setIsEmailOutboxOpen,
    previewInvoiceEmail,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState<'ALL' | DocumentType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | InvoiceStatus>('ALL');

  // Modal States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedInvoiceForEdit, setSelectedInvoiceForEdit] = useState<InvoiceQuote | null>(null);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<InvoiceQuote | null>(null);
  const [editorDocType, setEditorDocType] = useState<DocumentType>(DocumentType.INVOICE);

  // If templateToApply or clientToInvoice is present and editor is closed, auto open editor
  React.useEffect(() => {
    if (templateToApply || clientToInvoice) {
      setIsEditorOpen(true);
      setSelectedInvoiceForEdit(null);
    }
  }, [templateToApply, clientToInvoice]);

  // Filter logic
  const tenantInvoices = invoices.filter((inv) => inv.tenantId === currentTenant.id);

  const filteredInvoices = tenantInvoices.filter((inv) => {
    const matchesSearch =
      inv.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.clientVatNo && inv.clientVatNo.includes(searchQuery)) ||
      (inv.businessName && inv.businessName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDocType = docTypeFilter === 'ALL' || inv.docType === docTypeFilter;
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;

    return matchesSearch && matchesDocType && matchesStatus;
  });

  // Totals calculations
  const totalInvoiced = tenantInvoices
    .filter((inv) => inv.docType === DocumentType.INVOICE)
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const totalCollected = tenantInvoices
    .filter((inv) => inv.docType === DocumentType.INVOICE && inv.status === InvoiceStatus.PAID)
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const totalPending = tenantInvoices
    .filter(
      (inv) =>
        inv.docType === DocumentType.INVOICE &&
        (inv.status === InvoiceStatus.SENT || inv.status === InvoiceStatus.OVERDUE)
    )
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const totalVatCollected = tenantInvoices
    .filter((inv) => inv.docType === DocumentType.INVOICE && inv.status === InvoiceStatus.PAID)
    .reduce((sum, inv) => sum + inv.vatAmount, 0);

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
      {/* Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            SMME Quotes & Tax Invoices
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Create, brand, compute 15% VAT, and distribute quotes & invoices for South African SMMEs.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsEmailOutboxOpen(true)}
            className="px-3.5 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-200 font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-colors flex items-center gap-1.5 backdrop-blur-md"
            title="View dispatched automated client email notifications"
          >
            <Mail className="w-4 h-4 text-indigo-400" />
            <span>Email Outbox ({emailLogs.filter((l) => l.tenantId === currentTenant.id).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className="px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-colors flex items-center gap-1.5 backdrop-blur-md"
          >
            <Users2 className="w-4 h-4 text-indigo-400" />
            <span>Clients ({clients.filter(c => c.tenantId === currentTenant.id).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className="px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-colors flex items-center gap-1.5 backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Templates</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className="px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-colors flex items-center gap-1.5 backdrop-blur-md"
          >
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>Pricing Calc</span>
          </button>

          <button
            id="create-quote-btn"
            onClick={openNewQuote}
            className="px-3.5 py-2 bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-slate-100 font-bold rounded-xl text-xs sm:text-sm shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-slate-300" />
            <span>New Quote</span>
          </button>

          <button
            id="create-invoice-btn"
            onClick={openNewInvoice}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* Financial Metric Banners */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card glass-card-hover p-4 rounded-2xl shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Invoiced
          </span>
          <p className="text-lg sm:text-xl font-bold font-mono text-slate-100 mt-1">
            R {totalInvoiced.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-500">All tax invoices issued</span>
        </div>

        <div className="glass-card glass-card-hover p-4 rounded-2xl shadow-sm">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
            Settled / Paid
          </span>
          <p className="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-1">
            R {totalCollected.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-emerald-500/80">Reconciled in bank</span>
        </div>

        <div className="glass-card glass-card-hover p-4 rounded-2xl shadow-sm">
          <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
            Outstanding / Due
          </span>
          <p className="text-lg sm:text-xl font-bold font-mono text-amber-300 mt-1">
            R {totalPending.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-amber-500/80">Sent & Overdue</span>
        </div>

        <div className="glass-card glass-card-hover p-4 rounded-2xl shadow-sm">
          <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
            SARS 15% VAT Collected
          </span>
          <p className="text-lg sm:text-xl font-bold font-mono text-indigo-300 mt-1">
            R {totalVatCollected.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-indigo-400/80">VAT201 return liability</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice #, client name, VAT #..."
              className="w-full pl-9 pr-3 py-1.5 text-xs glass-input rounded-xl focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {/* DocType toggle */}
            <div className="flex bg-white/[0.04] border border-white/10 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setDocTypeFilter('ALL')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  docTypeFilter === 'ALL'
                    ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({tenantInvoices.length})
              </button>
              <button
                onClick={() => setDocTypeFilter(DocumentType.INVOICE)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  docTypeFilter === DocumentType.INVOICE
                    ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Invoices ({tenantInvoices.filter((i) => i.docType === DocumentType.INVOICE).length})
              </button>
              <button
                onClick={() => setDocTypeFilter(DocumentType.QUOTE)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  docTypeFilter === DocumentType.QUOTE
                    ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Quotes ({tenantInvoices.filter((i) => i.docType === DocumentType.QUOTE).length})
              </button>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs glass-input rounded-xl px-3 py-1.5 font-medium text-slate-200 focus:outline-none"
            >
              <option value="ALL" className="bg-slate-900 text-slate-100">
                All Statuses
              </option>
              <option value={InvoiceStatus.PAID} className="bg-slate-900 text-emerald-400">
                Paid
              </option>
              <option value={InvoiceStatus.SENT} className="bg-slate-900 text-indigo-300">
                Sent
              </option>
              <option value={InvoiceStatus.DRAFT} className="bg-slate-900 text-slate-300">
                Draft
              </option>
              <option value={InvoiceStatus.OVERDUE} className="bg-slate-900 text-rose-400">
                Overdue
              </option>
              <option value={InvoiceStatus.CANCELLED} className="bg-slate-900 text-slate-400">
                Cancelled
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="glass-card rounded-3xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] text-slate-400 font-semibold border-b border-white/[0.08]">
              <tr>
                <th className="p-3.5 pl-4">Doc # & Type</th>
                <th className="p-3.5">Client / Enterprise</th>
                <th className="p-3.5">Issue Date</th>
                <th className="p-3.5">Tax Treatment</th>
                <th className="p-3.5 text-right">Grand Total (ZAR)</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No documents match your query. Click "New Tax Invoice" or "New Quote" to create one.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const isQuote = inv.docType === DocumentType.QUOTE;
                  return (
                    <tr key={inv.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-white/20"
                            style={{ backgroundColor: inv.primaryColor || '#D97706' }}
                          />
                          <div>
                            <span className="font-mono font-bold text-slate-100">
                              {inv.documentNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {isQuote ? 'Quotation' : 'SARS Tax Invoice'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold text-slate-200 block">{inv.clientName}</span>
                        {inv.clientVatNo && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            VAT: {inv.clientVatNo}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-300">
                        {new Date(inv.createdAt).toLocaleDateString('en-ZA')}
                        {inv.dueDate && (
                          <span className="text-[10px] text-slate-500 block">
                            Due: {new Date(inv.dueDate).toLocaleDateString('en-ZA')}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        {inv.taxMode === TaxMode.VAT_15 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            15% VAT (R {inv.vatAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })})
                          </span>
                        ) : inv.taxMode === TaxMode.VAT_15_INCLUSIVE ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            15% VAT Incl.
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/[0.06] text-slate-400 border border-white/10">
                            Zero Rated / No VAT
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                        R {inv.grandTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="inline-block relative">
                          <select
                            value={inv.status}
                            onChange={(e) => markInvoiceStatus(inv.id, e.target.value as InvoiceStatus)}
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full cursor-pointer ${getStatusBadge(
                              inv.status
                            )} focus:outline-none`}
                          >
                            <option value={InvoiceStatus.DRAFT} className="bg-slate-900 text-slate-300">
                              DRAFT
                            </option>
                            <option value={InvoiceStatus.SENT} className="bg-slate-900 text-indigo-300">
                              SENT
                            </option>
                            <option value={InvoiceStatus.PAID} className="bg-slate-900 text-emerald-400">
                              PAID
                            </option>
                            <option value={InvoiceStatus.OVERDUE} className="bg-slate-900 text-rose-400">
                              OVERDUE
                            </option>
                            <option value={InvoiceStatus.CANCELLED} className="bg-slate-900 text-slate-400">
                              CANCELLED
                            </option>
                          </select>
                        </div>
                      </td>

                      <td className="p-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedInvoiceForView(inv)}
                            className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-white/10 rounded-lg transition-colors"
                            title="View Invoice & Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => previewInvoiceEmail(inv)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              inv.emailDelivery?.status === 'DELIVERED'
                                ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                                : 'text-slate-400 hover:text-indigo-300 hover:bg-white/10'
                            }`}
                            title={
                              inv.emailDelivery?.lastSentAt
                                ? `Automated email delivered to ${inv.emailDelivery.recipientEmail} on ${new Date(
                                    inv.emailDelivery.lastSentAt
                                  ).toLocaleDateString('en-ZA')}`
                                : 'Preview & audit automated client email notification'
                            }
                          >
                            <Mail className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => generateVectorInvoicePdf(inv)}
                            className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => shareInvoiceViaWhatsApp(inv)}
                            className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Send directly to WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedInvoiceForEdit(inv);
                              setIsEditorOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-white/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Delete document ${inv.documentNumber}?`)) {
                                deleteInvoice(inv.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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

      {/* View/Print Modal */}
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
    </div>
  );
};

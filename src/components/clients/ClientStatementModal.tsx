import React from 'react';
import { useApp } from '../../context/AppContext';
import { ClientProfile, DocumentType, InvoiceStatus, InvoiceQuote } from '../../types/schema';
import {
  X,
  Building2,
  Receipt,
  FileCheck2,
  Plus,
  MessageSquare,
  Eye,
  Download,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Hash,
} from 'lucide-react';
import { generateVectorInvoicePdf } from '../../utils/pdfGenerator';

interface ClientStatementModalProps {
  client: ClientProfile;
  isOpen: boolean;
  onClose: () => void;
  onNewInvoiceForClient: (client: ClientProfile) => void;
  onNewQuoteForClient: (client: ClientProfile) => void;
  onViewInvoice: (invoice: InvoiceQuote) => void;
}

export const ClientStatementModal: React.FC<ClientStatementModalProps> = ({
  client,
  isOpen,
  onClose,
  onNewInvoiceForClient,
  onNewQuoteForClient,
  onViewInvoice,
}) => {
  const { invoices, currentTenant, shareInvoiceViaWhatsApp } = useApp();

  if (!isOpen) return null;

  // Filter invoices for this client (by client name or email match)
  const clientInvoices = invoices.filter(
    (inv) =>
      inv.tenantId === currentTenant.id &&
      (inv.clientName.toLowerCase() === client.name.toLowerCase() ||
        (inv.clientEmail && inv.clientEmail.toLowerCase() === client.email.toLowerCase()))
  );

  const totalInvoiced = clientInvoices
    .filter((i) => i.docType === DocumentType.INVOICE)
    .reduce((sum, i) => sum + i.grandTotal, 0);

  const totalPaid = clientInvoices
    .filter((i) => i.docType === DocumentType.INVOICE && i.status === InvoiceStatus.PAID)
    .reduce((sum, i) => sum + i.grandTotal, 0);

  const totalOutstanding = clientInvoices
    .filter(
      (i) =>
        i.docType === DocumentType.INVOICE &&
        (i.status === InvoiceStatus.SENT || i.status === InvoiceStatus.OVERDUE)
    )
    .reduce((sum, i) => sum + i.grandTotal, 0);

  const quotesCount = clientInvoices.filter((i) => i.docType === DocumentType.QUOTE).length;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-modal w-full max-w-4xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-lg">
              {client.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">{client.name}</h2>
                {client.vatNumber ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    VAT: {client.vatNumber}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400 border border-white/10">
                    Non-VAT Entity
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Client Statement & Billing History &bull; {currentTenant.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Client Details Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs">
            <div className="space-y-1">
              <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Contact Details</span>
              </div>
              <p className="text-slate-200 font-medium">{client.contactPerson || 'Accounts Dept'}</p>
              <p className="text-slate-400 text-[11px] truncate">{client.email}</p>
              <p className="text-emerald-400 text-[11px] font-mono">{client.phone}</p>
            </div>

            <div className="space-y-1">
              <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Physical Address</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {client.address || 'No physical address recorded'}
              </p>
              {client.city && (
                <p className="text-slate-400 text-[11px]">
                  {client.city}, {client.province || 'Gauteng'} {client.postalCode}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Terms & Registration</span>
              </div>
              <p className="text-slate-200 font-medium">
                Payment Terms: <span className="text-indigo-300 font-mono">Net {client.defaultPaymentDays} Days</span>
              </p>
              {client.companyRegNo && (
                <p className="text-slate-400 text-[11px] font-mono">Reg: {client.companyRegNo}</p>
              )}
              {client.notes && (
                <p className="text-slate-400 text-[11px] italic line-clamp-2">"{client.notes}"</p>
              )}
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-card p-3.5 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Invoiced
              </span>
              <p className="text-base sm:text-lg font-bold font-mono text-slate-100 mt-0.5">
                R {totalInvoiced.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="glass-card p-3.5 rounded-2xl">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Total Settled / Paid
              </span>
              <p className="text-base sm:text-lg font-bold font-mono text-emerald-400 mt-0.5">
                R {totalPaid.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="glass-card p-3.5 rounded-2xl">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Outstanding Balance
              </span>
              <p className="text-base sm:text-lg font-bold font-mono text-amber-300 mt-0.5">
                R {totalOutstanding.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="glass-card p-3.5 rounded-2xl">
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                Total Documents
              </span>
              <p className="text-base sm:text-lg font-bold font-mono text-indigo-200 mt-0.5">
                {clientInvoices.length} <span className="text-xs font-normal text-slate-400">({quotesCount} Quotes)</span>
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-400" />
              <span>Invoices & Quotations Log</span>
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onNewQuoteForClient(client);
                }}
                className="px-3 py-1.5 rounded-xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-slate-400" />
                <span>New Quote for {client.name.split(' ')[0]}</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onNewInvoiceForClient(client);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Tax Invoice</span>
              </button>
            </div>
          </div>

          {/* Table of Invoices */}
          <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.02] text-slate-400 font-semibold border-b border-white/[0.08]">
                  <tr>
                    <th className="p-3 pl-4">Doc # & Type</th>
                    <th className="p-3">Issue Date</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3 text-right">Amount (ZAR)</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {clientInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No invoices or quotes generated for this client yet. Click "New Tax Invoice" above to create one.
                      </td>
                    </tr>
                  ) : (
                    clientInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-white/[0.04] transition-colors">
                        <td className="p-3 pl-4 font-mono font-bold text-slate-100">
                          <div>{inv.documentNumber}</div>
                          <span className="text-[10px] font-normal text-slate-400 block">
                            {inv.docType === DocumentType.INVOICE ? 'Tax Invoice' : 'Quotation'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">
                          {new Date(inv.createdAt).toLocaleDateString('en-ZA')}
                        </td>
                        <td className="p-3 text-slate-400">
                          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-ZA') : '-'}
                        </td>
                        <td className="p-3 text-right font-mono font-semibold text-emerald-400">
                          R {inv.grandTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getStatusBadge(
                              inv.status
                            )}`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-3 pr-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                onViewInvoice(inv);
                              }}
                              className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-white/10 rounded-lg transition-colors"
                              title="View Document"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => generateVectorInvoicePdf(inv)}
                              className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => shareInvoiceViaWhatsApp(inv)}
                              className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors"
                              title="Share on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-slate-400">
          <span>
            Physical Address & VAT verified for SARS tax invoices.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-slate-200 font-semibold transition-colors"
          >
            Close Statement
          </button>
        </div>
      </div>
    </div>
  );
};

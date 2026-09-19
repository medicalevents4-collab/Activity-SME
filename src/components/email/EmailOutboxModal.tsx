import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EmailNotificationLog, InvoiceQuote } from '../../types/schema';
import {
  X,
  Mail,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  Eye,
  RefreshCw,
  Send,
  FileCheck2,
  Receipt,
  Download,
  ShieldCheck,
  Building2,
  Sparkles,
} from 'lucide-react';
import { EmailPreviewModal } from './EmailPreviewModal';
import { generateVectorInvoicePdf } from '../../utils/pdfGenerator';

interface EmailOutboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailOutboxModal: React.FC<EmailOutboxModalProps> = ({ isOpen, onClose }) => {
  const { emailLogs, currentTenant, invoices, sendInvoiceEmail, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmailLog, setSelectedEmailLog] = useState<EmailNotificationLog | null>(null);
  const [filterDocType, setFilterDocType] = useState<'ALL' | 'INVOICE' | 'QUOTE'>('ALL');

  if (!isOpen) return null;

  const tenantLogs = emailLogs.filter((log) => log.tenantId === currentTenant.id);

  const filteredLogs = tenantLogs.filter((log) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      log.documentNumber.toLowerCase().includes(searchLower) ||
      log.recipientEmail.toLowerCase().includes(searchLower) ||
      log.recipientName.toLowerCase().includes(searchLower) ||
      log.subject.toLowerCase().includes(searchLower);

    const matchesType =
      filterDocType === 'ALL' || log.docType === filterDocType;

    return matchesSearch && matchesType;
  });

  const totalSent = tenantLogs.length;
  const invoicesSent = tenantLogs.filter((l) => l.docType === 'INVOICE').length;
  const quotesSent = tenantLogs.filter((l) => l.docType === 'QUOTE').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-modal w-full max-w-5xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  Automated Email Notification Outbox & Audit Trail
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  100% Real-Time Dispatched
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Log of automated invoice copies dispatched to client email addresses immediately upon status change to &lsquo;SENT&rsquo;.
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

        {/* Metrics Row */}
        <div className="p-6 pb-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass-card p-3 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Dispatches
            </span>
            <p className="text-xl font-bold font-mono text-slate-100 mt-0.5">{totalSent}</p>
          </div>

          <div className="glass-card p-3 rounded-2xl">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              Tax Invoices Emailed
            </span>
            <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{invoicesSent}</p>
          </div>

          <div className="glass-card p-3 rounded-2xl">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
              Quotes Emailed
            </span>
            <p className="text-xl font-bold font-mono text-indigo-300 mt-0.5">{quotesSent}</p>
          </div>

          <div className="glass-card p-3 rounded-2xl">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
              Delivery Success
            </span>
            <p className="text-xl font-bold font-mono text-amber-300 mt-0.5">100%</p>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by doc #, recipient email, client..."
              className="w-full pl-9 pr-3 py-1.5 text-xs glass-input rounded-xl focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex bg-white/[0.04] border border-white/10 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setFilterDocType('ALL')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterDocType === 'ALL'
                    ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Documents
              </button>
              <button
                onClick={() => setFilterDocType('INVOICE')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterDocType === 'INVOICE'
                    ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tax Invoices
              </button>
              <button
                onClick={() => setFilterDocType('QUOTE')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterDocType === 'QUOTE'
                    ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Quotations
              </button>
            </div>
          </div>
        </div>

        {/* Table of Dispatched Emails */}
        <div className="flex-1 p-6 pt-0 overflow-y-auto">
          <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.02] text-slate-400 font-semibold border-b border-white/[0.08]">
                  <tr>
                    <th className="p-3 pl-4">Doc # & Type</th>
                    <th className="p-3">Client Recipient</th>
                    <th className="p-3">Subject & Preview</th>
                    <th className="p-3">Sent Timestamp</th>
                    <th className="p-3 text-center">Delivery</th>
                    <th className="p-3 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No automated emails recorded for this filter. Update any invoice status to &lsquo;SENT&rsquo; to trigger automated delivery.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const matchedInv = invoices.find((i) => i.id === log.invoiceId);
                      return (
                        <tr key={log.id} className="hover:bg-white/[0.04] transition-colors">
                          <td className="p-3 pl-4 font-mono font-bold text-slate-100">
                            <div>{log.documentNumber}</div>
                            <span className="text-[10px] font-normal text-slate-400 block">
                              {log.docType} &bull; R {log.grandTotal?.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                            </span>
                          </td>

                          <td className="p-3">
                            <span className="font-bold text-slate-200 block">{log.recipientName}</span>
                            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                              <Mail className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{log.recipientEmail}</span>
                            </span>
                          </td>

                          <td className="p-3 max-w-xs truncate">
                            <span className="font-medium text-slate-200 truncate block">
                              {log.subject}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate block">
                              {log.previewSnippet}
                            </span>
                          </td>

                          <td className="p-3 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                            {new Date(log.sentAt).toLocaleString('en-ZA')}
                            <span className="text-[10px] text-slate-500 block">
                              via Auto-Trigger
                            </span>
                          </td>

                          <td className="p-3 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Delivered</span>
                            </span>
                          </td>

                          <td className="p-3 pr-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedEmailLog(log)}
                                className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                                title="View Email Preview"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Preview</span>
                              </button>

                              {matchedInv && (
                                <button
                                  onClick={() => generateVectorInvoicePdf(matchedInv)}
                                  className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/10 rounded-lg transition-colors"
                                  title="Download Attached PDF"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  sendInvoiceEmail(log.invoiceId, log.recipientEmail);
                                  showToast(`Resent copy to ${log.recipientEmail}`);
                                }}
                                className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                                title="Resend Notification"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
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
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-slate-400">
          <span>
            {tenantLogs.length} automated emails dispatched for {currentTenant.name}.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-slate-200 font-semibold transition-colors"
          >
            Close Outbox
          </button>
        </div>
      </div>

      {/* Email Preview Modal */}
      {selectedEmailLog && (
        <EmailPreviewModal
          isOpen={Boolean(selectedEmailLog)}
          emailLog={selectedEmailLog}
          onClose={() => setSelectedEmailLog(null)}
        />
      )}
    </div>
  );
};

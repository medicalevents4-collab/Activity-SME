import React, { useState } from 'react';
import { EmailNotificationLog, InvoiceQuote } from '../../types/schema';
import { useApp } from '../../context/AppContext';
import {
  X,
  Mail,
  CheckCircle2,
  Download,
  Calendar,
  Send,
  FileText,
  Copy,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Eye,
  Code2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { generateVectorInvoicePdf } from '../../utils/pdfGenerator';

interface EmailPreviewModalProps {
  emailLog: EmailNotificationLog;
  isOpen: boolean;
  onClose: () => void;
  onResend?: (emailLog: EmailNotificationLog) => void;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  emailLog,
  isOpen,
  onClose,
  onResend,
}) => {
  const { invoices, showToast, sendInvoiceEmail } = useApp();
  const [activeViewTab, setActiveViewTab] = useState<'PREVIEW' | 'HTML_SOURCE' | 'HEADERS'>('PREVIEW');
  const [isResending, setIsResending] = useState(false);

  if (!isOpen) return null;

  const matchedInvoice = invoices.find((inv) => inv.id === emailLog.invoiceId);

  const handleDownloadAttachment = () => {
    if (matchedInvoice) {
      generateVectorInvoicePdf(matchedInvoice);
      showToast(`Downloaded attached ${matchedInvoice.documentNumber}.pdf`);
    } else {
      showToast(`Generating document PDF...`);
    }
  };

  const handleCopyHtml = () => {
    if (emailLog.bodyHtml) {
      navigator.clipboard.writeText(emailLog.bodyHtml);
      showToast(`Copied HTML email markup to clipboard!`);
    }
  };

  const handleResendNow = () => {
    setIsResending(true);
    setTimeout(() => {
      if (emailLog.invoiceId) {
        sendInvoiceEmail(emailLog.invoiceId, emailLog.recipientEmail);
      }
      setIsResending(false);
      if (onResend) onResend(emailLog);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-modal w-full max-w-4xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-slate-100">
                  Automated Email Notification
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Delivered to Client</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  ID: {emailLog.messageId}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Triggered automatically upon document status transitioning to &lsquo;SENT&rsquo;.
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

        {/* Envelope Metadata Bar */}
        <div className="px-6 py-3.5 bg-white/[0.03] border-b border-white/10 space-y-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
            <div className="flex items-center gap-2 truncate">
              <span className="text-slate-400 font-semibold w-14 flex-shrink-0">From:</span>
              <span className="text-slate-200 font-medium truncate">{emailLog.senderName}</span>
              <span className="text-slate-400 font-mono text-[11px] truncate">&lt;{emailLog.senderEmail}&gt;</span>
            </div>

            <div className="flex items-center gap-2 truncate">
              <span className="text-slate-400 font-semibold w-14 flex-shrink-0">To:</span>
              <span className="text-indigo-300 font-bold truncate">{emailLog.recipientName}</span>
              <span className="text-emerald-400 font-mono text-[11px] truncate">&lt;{emailLog.recipientEmail}&gt;</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 truncate">
              <span className="text-slate-400 font-semibold w-14 flex-shrink-0">Subject:</span>
              <span className="text-slate-100 font-bold truncate">{emailLog.subject}</span>
            </div>

            <div className="flex items-center gap-3 text-slate-400 text-[11px] flex-shrink-0">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-400" />
                <span>Sent: {new Date(emailLog.sentAt).toLocaleString('en-ZA')}</span>
              </span>
            </div>
          </div>
        </div>

        {/* View Switcher & Action Ribbon */}
        <div className="px-6 py-2.5 bg-white/[0.02] border-b border-white/10 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveViewTab('PREVIEW')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                activeViewTab === 'PREVIEW'
                  ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Email Preview</span>
            </button>
            <button
              onClick={() => setActiveViewTab('HTML_SOURCE')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                activeViewTab === 'HTML_SOURCE'
                  ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>HTML Source</span>
            </button>
            <button
              onClick={() => setActiveViewTab('HEADERS')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                activeViewTab === 'HEADERS'
                  ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SMTP & Delivery Logs</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {matchedInvoice && (
              <button
                onClick={handleDownloadAttachment}
                className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 font-bold rounded-xl transition-colors flex items-center gap-1.5"
                title="Download the attached vector PDF invoice copy"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Attached PDF ({matchedInvoice.documentNumber}.pdf)</span>
              </button>
            )}

            <button
              onClick={handleResendNow}
              disabled={isResending}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>Resend Email</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950/40">
          {activeViewTab === 'PREVIEW' ? (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-300">
              {emailLog.bodyHtml ? (
                <div
                  className="w-full overflow-x-auto text-gray-900"
                  dangerouslySetInnerHTML={{ __html: emailLog.bodyHtml }}
                />
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No HTML preview available.
                </div>
              )}
            </div>
          ) : activeViewTab === 'HTML_SOURCE' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  Full Email Template Source Code
                </span>
                <button
                  onClick={handleCopyHtml}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 border border-white/10 flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3 h-3 text-indigo-400" />
                  <span>Copy HTML</span>
                </button>
              </div>
              <pre className="p-4 rounded-2xl bg-black/70 border border-white/10 text-emerald-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-[50vh]">
                {emailLog.bodyHtml}
              </pre>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="glass-card p-4 rounded-2xl space-y-3">
                <h3 className="font-bold text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Delivery Envelope & Verification</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Message ID</span>
                    <span className="font-mono text-slate-200">{emailLog.messageId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Dispatch Timestamp</span>
                    <span className="font-mono text-slate-200">{emailLog.sentAt}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Trigger Reason</span>
                    <span className="font-mono text-indigo-300">{emailLog.trigger}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Delivery Status</span>
                    <span className="text-emerald-400 font-bold">{emailLog.status} (Immediate Handshake)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Document Number</span>
                    <span className="font-mono text-slate-200">{emailLog.documentNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Attached Document Type</span>
                    <span className="text-slate-200">{emailLog.docType} (Vector PDF)</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-4 rounded-2xl space-y-2">
                <h4 className="font-bold text-slate-200">Raw SMTP Transmission Headers</h4>
                <pre className="p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-slate-400 whitespace-pre-wrap leading-relaxed">
{`Date: ${new Date(emailLog.sentAt).toUTCString()}
From: "${emailLog.senderName}" <${emailLog.senderEmail}>
To: "${emailLog.recipientName}" <${emailLog.recipientEmail}>
Subject: ${emailLog.subject}
Message-ID: <${emailLog.messageId}@smtp.activityhub.co.za>
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="----=_Part_${emailLog.id}"
X-ActivityHub-Tenant: ${emailLog.tenantId}
X-ActivityHub-DocType: ${emailLog.docType}
X-ActivityHub-DocNumber: ${emailLog.documentNumber}
X-Trigger: ${emailLog.trigger}
Status: 250 2.0.0 OK: Message accepted for immediate delivery`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs text-slate-400">
          <span>
            Automated email notification copy generated and delivered immediately to client.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-slate-200 font-semibold transition-colors"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};

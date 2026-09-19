import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InvoiceQuote, DocumentType, TaxMode, InvoiceStatus } from '../../types/schema';
import { downloadInvoicePdf } from '../../utils/pdfGenerator';
import {
  Printer,
  Share2,
  CheckCircle,
  CheckCircle2,
  MessageSquare,
  Building,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Download,
  Edit,
  Loader2,
  ArrowRight,
  FileCheck2,
  Send,
  Eye,
  Clock,
  Sparkles,
} from 'lucide-react';

interface InvoiceViewModalProps {
  invoice: InvoiceQuote;
  onClose: () => void;
  onEdit: (invoice: InvoiceQuote) => void;
}

export const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({ invoice, onClose, onEdit }) => {
  const { markInvoiceStatus, shareInvoiceViaWhatsApp, convertQuoteToInvoice, previewInvoiceEmail, sendInvoiceEmail } = useApp();
  const [isDownloading, setIsDownloading] = useState(false);

  const isInvoice = invoice.docType === DocumentType.INVOICE;
  const isPaid = invoice.status === InvoiceStatus.PAID;
  const isDraft = invoice.status === InvoiceStatus.DRAFT;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      await downloadInvoicePdf(invoice, 'invoice-printable-doc');
    } catch (err) {
      console.error('Failed to download invoice PDF:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleConvertToInvoice = () => {
    convertQuoteToInvoice(invoice.id);
    onClose();
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case InvoiceStatus.SENT:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case InvoiceStatus.OVERDUE:
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case InvoiceStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-auto shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between print:hidden flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Document Preview:
            </span>
            <span className="font-mono text-xs font-bold text-emerald-400">
              {invoice.documentNumber}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(invoice.status)}`}>
              {invoice.status}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!isInvoice && (
              <button
                onClick={handleConvertToInvoice}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Convert to Tax Invoice</span>
              </button>
            )}

            {isDraft && (
              <button
                onClick={() => markInvoiceStatus(invoice.id, InvoiceStatus.SENT)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                title="Update status to SENT and automatically email copy to client"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Mark Sent & Email Client</span>
              </button>
            )}

            {isInvoice && !isPaid && (
              <button
                onClick={() => markInvoiceStatus(invoice.id, InvoiceStatus.PAID)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Mark Paid</span>
              </button>
            )}

            <button
              onClick={() => previewInvoiceEmail(invoice)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors shadow-xs"
              title="Preview automated email notification dispatched to client"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>Email Notification</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              title="Download professional PDF with branding"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                shareInvoiceViaWhatsApp(invoice);
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors"
              title="Share directly to WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(invoice);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-xs font-medium transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-900 hover:bg-gray-100 rounded-xl text-xs font-bold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-lg text-lg font-bold ml-1"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div
          id="invoice-printable-doc"
          className="p-8 sm:p-10 overflow-y-auto bg-white text-gray-900 print:p-8 font-sans space-y-6"
        >
          {/* Automated Email Notification Status Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-indigo-50/90 border border-indigo-200/90 rounded-2xl text-xs print:hidden shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-gray-900">
                    Automated Client Email Notification:
                  </span>
                  {invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.PAID ? (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full text-[10px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Delivered immediately to {invoice.clientEmail}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full text-[10px]">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Auto-sends upon updating status to &lsquo;SENT&rsquo;</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  Recipient Address: <strong className="text-gray-800">{invoice.clientEmail || 'No email specified'}</strong>
                  {invoice.emailDelivery?.lastSentAt && (
                    <span> &bull; Dispatched at {new Date(invoice.emailDelivery.lastSentAt).toLocaleString('en-ZA')}</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
              <button
                onClick={() => previewInvoiceEmail(invoice)}
                className="px-3 py-1.5 bg-white hover:bg-gray-100 text-indigo-700 font-bold border border-indigo-300 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Email</span>
              </button>
              <button
                onClick={() => sendInvoiceEmail(invoice.id)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                title="Send fresh copy to client email"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Copy Now</span>
              </button>
            </div>
          </div>
          {/* Header, Custom Logo & Business Branding */}
          <div
            className="flex flex-col sm:flex-row justify-between items-start border-b-2 pb-6 gap-4"
            style={{ borderColor: invoice.primaryColor || '#D97706' }}
          >
            <div className="flex items-start gap-4">
              {invoice.logoUrl && (
                <div className="w-16 h-16 rounded-xl border border-gray-200 bg-white p-1 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-xs">
                  <img
                    src={invoice.logoUrl}
                    alt={invoice.businessName}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  {invoice.businessName}
                </h1>
                {invoice.businessRegNo && (
                  <p className="text-xs text-gray-500 font-mono">
                    <span className="font-semibold text-gray-700">CIPC Reg No:</span> {invoice.businessRegNo}
                  </p>
                )}
                {invoice.vatNumber && (
                  <p className="text-xs text-gray-500 font-mono">
                    <span className="font-semibold text-gray-700">SARS VAT Reg No:</span> {invoice.vatNumber}
                  </p>
                )}
                {invoice.businessAddress && (
                  <p className="text-xs text-gray-600 max-w-sm">{invoice.businessAddress}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-500 pt-0.5">
                  {invoice.businessEmail && <span>{invoice.businessEmail}</span>}
                  {invoice.businessPhone && <span className="font-mono">{invoice.businessPhone}</span>}
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-0 text-left sm:text-right space-y-1">
              <div
                className="inline-block px-3.5 py-1 text-white font-bold rounded-lg text-xs uppercase tracking-wider mb-1 shadow-xs"
                style={{ backgroundColor: invoice.primaryColor || '#D97706' }}
              >
                {isInvoice ? 'TAX INVOICE' : 'OFFICIAL QUOTATION'}
              </div>
              <h2 className="text-lg font-mono font-bold text-gray-900">{invoice.documentNumber}</h2>
              <p className="text-xs text-gray-500">
                <span className="font-semibold text-gray-700">Date Issued:</span>{' '}
                {new Date(invoice.createdAt).toLocaleDateString('en-ZA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              {invoice.dueDate && (
                <p className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">Payment Due:</span>{' '}
                  {new Date(invoice.dueDate).toLocaleDateString('en-ZA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}
              <div className="pt-1">
                <span
                  className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${getStatusBadge(
                    invoice.status
                  )}`}
                >
                  Status: {invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Billed To / Client Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50/80 p-5 rounded-2xl border border-gray-200">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Billed Client / Enterprise:
              </span>
              <h3 className="font-bold text-base text-gray-900">{invoice.clientName}</h3>
              {invoice.contactPerson && (
                <p className="text-xs text-gray-600 mt-0.5">Attn: {invoice.contactPerson}</p>
              )}
              {invoice.clientAddress && (
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{invoice.clientAddress}</p>
              )}
              {invoice.clientVatNo && (
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  <span className="font-semibold text-gray-700">Client VAT Reg:</span> {invoice.clientVatNo}
                </p>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Contact & Delivery:
              </span>
              {invoice.clientEmail && (
                <p className="text-xs text-gray-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{invoice.clientEmail}</span>
                </p>
              )}
              {invoice.clientPhone && (
                <p className="text-xs text-gray-700 flex items-center gap-1.5 mt-1 font-mono">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{invoice.clientPhone}</span>
                </p>
              )}
              <div className="mt-2 pt-2 border-t border-gray-200">
                <span className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">Tax Mode:</span>{' '}
                  {invoice.taxMode === TaxMode.VAT_15
                    ? 'Standard 15% VAT (Exclusive)'
                    : invoice.taxMode === TaxMode.VAT_15_INCLUSIVE
                    ? '15% VAT Included'
                    : 'Zero-Rated / Exempt (0% VAT)'}
                </span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-white" style={{ backgroundColor: invoice.primaryColor || '#D97706' }}>
                  <th className="p-3 font-semibold">Description of Goods or Services</th>
                  <th className="p-3 w-16 text-center font-semibold">Qty</th>
                  <th className="p-3 w-28 text-right font-semibold">Unit Price</th>
                  <th className="p-3 w-20 text-center font-semibold">Disc %</th>
                  <th className="p-3 w-32 text-right font-semibold">Line Total (ZAR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {invoice.lineItems.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-gray-50/50">
                    <td className="p-3 text-gray-900 font-medium">{item.description}</td>
                    <td className="p-3 text-center text-gray-700 font-semibold">{item.quantity}</td>
                    <td className="p-3 text-right font-mono text-gray-700">
                      R {item.unitPrice.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center font-mono text-gray-500">
                      {item.discountPercent ? `${item.discountPercent}%` : '-'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-gray-900">
                      R {item.lineTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end">
            <div className="w-80 space-y-2 text-xs bg-gray-50/80 p-4 rounded-2xl border border-gray-200">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal (Excl. VAT):</span>
                <span className="font-mono font-semibold text-gray-900">
                  R {invoice.subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 items-center">
                <span>SARS VAT ({invoice.taxMode === TaxMode.NO_VAT ? '0%' : '15%'}):</span>
                <span className="font-mono font-semibold text-gray-900">
                  R {invoice.vatAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="border-t-2 border-gray-900 pt-2 flex justify-between font-bold text-sm text-gray-900">
                <span>Grand Total (ZAR):</span>
                <span
                  className="font-mono text-lg font-extrabold"
                  style={{ color: invoice.primaryColor || '#D97706' }}
                >
                  R {invoice.grandTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Banking Details & Footer Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-200 pt-4 text-xs">
            {invoice.bankingDetails && (
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  South African Banking Details & EFT Settlement
                </span>
                <pre className="font-mono text-[11px] text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {invoice.bankingDetails}
                </pre>
              </div>
            )}

            {invoice.footerNotes && (
              <div className="p-4 rounded-2xl border border-gray-200 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    Payment Terms & Legal Conditions
                  </span>
                  <p className="text-[11px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {invoice.footerNotes}
                  </p>
                </div>
                <p className="text-[10px] text-gray-400 mt-3">
                  Powered by ActivityHub SMME Multi-Tenant Daily Management Platform.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TaxMode, DocumentType, InvoiceStatus } from '../../types/schema';
import {
  Calculator,
  Plus,
  Trash2,
  Receipt,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Percent,
  Coins,
  FileCheck,
  RotateCcw,
} from 'lucide-react';

interface CalcItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
}

export const PricingCalculator: React.FC = () => {
  const { createInvoice, setActiveTab, currentTenant, currentUser } = useApp();

  const [taxMode, setTaxMode] = useState<TaxMode>(TaxMode.VAT_15);
  const [docType, setDocType] = useState<DocumentType>(DocumentType.INVOICE);
  const [overallDiscountPercent, setOverallDiscountPercent] = useState<number>(0);

  const [items, setItems] = useState<CalcItem[]>([
    {
      id: 'calc-1',
      description: 'Master Technician Site Assessment & Electrical Labour',
      quantity: 16,
      unitPrice: 550,
      discountPercent: 0,
    },
    {
      id: 'calc-2',
      description: 'Solar Photovoltaic Inverter & Surge Protection Sub-Assembly',
      quantity: 1,
      unitPrice: 18500,
      discountPercent: 5,
    },
    {
      id: 'calc-3',
      description: 'Department of Labour Certified Certificate of Compliance (CoC)',
      quantity: 1,
      unitPrice: 3500,
      discountPercent: 0,
    },
  ]);

  // Quick reverse VAT calculator state
  const [reverseTotalInput, setReverseTotalInput] = useState<number>(11500);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `calc-${Date.now()}`,
        description: 'New Service or Hardware Line Item',
        quantity: 1,
        unitPrice: 1200,
        discountPercent: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof CalcItem, val: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            [field]: field === 'description' ? val : Math.max(0, parseFloat(val) || 0),
          };
        }
        return item;
      })
    );
  };

  // Calculations based on TaxMode
  const rawSubtotal = items.reduce((acc, item) => {
    const lineGross = item.quantity * item.unitPrice;
    const lineDiscount = lineGross * (item.discountPercent / 100);
    return acc + (lineGross - lineDiscount);
  }, 0);

  const overallDiscountAmount = rawSubtotal * (overallDiscountPercent / 100);
  const netSubtotal = rawSubtotal - overallDiscountAmount;

  let baseAmount = 0;
  let vatAmount = 0;
  let grandTotal = 0;

  if (taxMode === TaxMode.VAT_15) {
    // Exclusive: Net Subtotal is base, Add 15% VAT on top
    baseAmount = netSubtotal;
    vatAmount = netSubtotal * 0.15;
    grandTotal = baseAmount + vatAmount;
  } else if (taxMode === TaxMode.VAT_15_INCLUSIVE) {
    // Inclusive: Net Subtotal is already inclusive of 15% VAT
    grandTotal = netSubtotal;
    vatAmount = netSubtotal * (15 / 115);
    baseAmount = grandTotal - vatAmount;
  } else {
    // NO_VAT: 0% VAT
    baseAmount = netSubtotal;
    vatAmount = 0;
    grandTotal = netSubtotal;
  }

  // Reverse VAT calculations
  const reverseVatAmount = reverseTotalInput * (15 / 115);
  const reverseExclAmount = reverseTotalInput - reverseVatAmount;

  const handleExportToInvoice = () => {
    const newDoc = createInvoice({
      tenantId: currentTenant.id,
      userId: currentUser.id,
      docType,
      documentNumber: `${docType === DocumentType.INVOICE ? 'INV' : 'QUO'}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      logoUrl: currentTenant.logoUrl,
      primaryColor: currentTenant.primaryColor || '#D97706',
      businessName: currentTenant.name,
      businessRegNo: currentTenant.businessRegNo,
      vatNumber: currentTenant.vatNumber,
      businessAddress: currentTenant.businessAddress,
      businessEmail: currentTenant.businessEmail,
      businessPhone: currentTenant.businessPhone,
      clientName: 'Prospective Client / Enterprise',
      clientEmail: 'procurement@client.co.za',
      taxMode,
      vatRate: taxMode === TaxMode.NO_VAT ? 0.0 : 0.15,
      subtotal: baseAmount,
      discountTotal: overallDiscountAmount,
      vatAmount,
      grandTotal,
      bankingDetails: currentTenant.bankingDetails || '',
      footerNotes: `Automated Pricing Calculation based on standard ${taxMode === TaxMode.VAT_15 ? '15% SARS VAT' : taxMode === TaxMode.NO_VAT ? 'Zero-Rated / No VAT' : '15% Inclusive VAT'}. Valid for 30 days.`,
      status: docType === DocumentType.INVOICE ? InvoiceStatus.SENT : InvoiceStatus.DRAFT,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      lineItems: items.map((item, idx) => ({
        id: `item-${idx}`,
        invoiceQuoteId: '',
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent,
        lineTotal: item.quantity * item.unitPrice * (1 - item.discountPercent / 100),
      })),
    });

    setActiveTab('invoices');
  };

  const handleResetCalculator = () => {
    setItems([
      {
        id: `calc-${Date.now()}`,
        description: 'Standard Professional Consulting & Service Pass',
        quantity: 1,
        unitPrice: 3500,
        discountPercent: 0,
      },
    ]);
    setOverallDiscountPercent(0);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400">
                <Calculator className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
                Automated SMME Pricing & SARS 15% VAT Calculator
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Calculate instant line item subtotals, item-level discounts, 15% SARS VAT (tax inclusive or exclusive), and zero-rated options for non-VAT micro vendors.
            </p>
          </div>

          <button
            onClick={handleResetCalculator}
            className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold rounded-xl border border-white/10 transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Calculator</span>
          </button>
        </div>

        {/* Tax Mode Switcher & Doc Type */}
        <div className="mt-6 pt-6 border-t border-white/[0.08] grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              SARS Tax & VAT Calculation Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTaxMode(TaxMode.VAT_15)}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  taxMode === TaxMode.VAT_15
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 shadow-sm'
                    : 'bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/[0.05]'
                }`}
              >
                <div className="font-bold text-xs">Add 15% VAT</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Tax Exclusive (+15%)</div>
              </button>

              <button
                type="button"
                onClick={() => setTaxMode(TaxMode.VAT_15_INCLUSIVE)}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  taxMode === TaxMode.VAT_15_INCLUSIVE
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200 shadow-sm'
                    : 'bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/[0.05]'
                }`}
              >
                <div className="font-bold text-xs">15% VAT Included</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Tax Inclusive (15/115)</div>
              </button>

              <button
                type="button"
                onClick={() => setTaxMode(TaxMode.NO_VAT)}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  taxMode === TaxMode.NO_VAT
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 shadow-sm'
                    : 'bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/[0.05]'
                }`}
              >
                <div className="font-bold text-xs">Without 15% VAT</div>
                <div className="text-[10px] text-slate-400 mt-0.5">0% / Non-VAT Vendor</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">Target Document Export</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDocType(DocumentType.INVOICE)}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  docType === DocumentType.INVOICE
                    ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                    : 'bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/[0.05]'
                }`}
              >
                <div className="text-xs font-bold">Tax Invoice</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Official Tax Billing</div>
              </button>

              <button
                type="button"
                onClick={() => setDocType(DocumentType.QUOTE)}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  docType === DocumentType.QUOTE
                    ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                    : 'bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/[0.05]'
                }`}
              >
                <div className="text-xs font-bold">Quotation</div>
                <div className="text-[10px] text-slate-400 mt-0.5">30-Day Cost Estimate</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Calculator Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Line Item Calculator */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Line Items & Pricing Variables
              </h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-xl font-semibold text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Line Items Table */}
            <div className="border border-white/10 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left">
                <thead className="bg-white/[0.04] text-slate-400 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Service / Product Description</th>
                    <th className="p-3 w-20 text-center">Qty</th>
                    <th className="p-3 w-32 text-right">Unit Price (R)</th>
                    <th className="p-3 w-24 text-center">Disc %</th>
                    <th className="p-3 w-32 text-right">Line Total</th>
                    <th className="p-3 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-black/20">
                  {items.map((item) => {
                    const lineGross = item.quantity * item.unitPrice;
                    const lineDiscount = lineGross * (item.discountPercent / 100);
                    const lineNet = lineGross - lineDiscount;

                    return (
                      <tr key={item.id}>
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white/[0.05] border border-white/10 rounded-xl text-xs text-slate-100 focus:bg-white/[0.08] focus:border-indigo-400 focus:outline-none"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                            className="w-full text-center px-2 py-1.5 bg-white/[0.05] border border-white/10 rounded-xl text-xs font-mono font-semibold text-slate-100 focus:outline-none focus:border-indigo-400"
                          />
                        </td>
                        <td className="p-2.5">
                          <div className="relative">
                            <span className="absolute left-2.5 top-1.5 text-xs text-slate-500">R</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                              className="w-full pl-6 pr-2 py-1.5 text-right bg-white/[0.05] border border-white/10 rounded-xl text-xs font-mono font-semibold text-slate-100 focus:outline-none focus:border-indigo-400"
                            />
                          </div>
                        </td>
                        <td className="p-2.5">
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discountPercent}
                              onChange={(e) => updateItem(item.id, 'discountPercent', e.target.value)}
                              className="w-full pr-5 pl-2 py-1.5 text-center bg-white/[0.05] border border-white/10 rounded-xl text-xs font-mono text-amber-400 focus:outline-none focus:border-indigo-400"
                            />
                            <span className="absolute right-2 top-1.5 text-xs text-slate-500">%</span>
                          </div>
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-100 text-xs">
                          R {lineNet.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            disabled={items.length <= 1}
                            className="text-slate-500 hover:text-red-400 disabled:opacity-20 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Overall Discount Input */}
            <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-2xl border border-white/5 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <Percent className="w-4 h-4 text-amber-400" />
                <span>Overall Invoice / Quotation Discount</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={overallDiscountPercent}
                  onChange={(e) => setOverallDiscountPercent(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                  className="w-20 px-2 py-1 bg-white/[0.05] border border-white/10 rounded-lg text-xs font-mono text-right text-amber-400 focus:outline-none focus:border-indigo-400"
                />
                <span className="text-slate-400 font-mono">%</span>
              </div>
            </div>
          </div>

          {/* Reverse VAT Calculator Tool */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Coins className="w-4 h-4" />
              <span>Reverse SARS 15% VAT Quick-Extract Tool</span>
            </div>
            <p className="text-xs text-slate-400">
              Need to extract the 15% VAT from an already tax-inclusive total quote or receipt? Enter total amount below:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Gross Amount (Incl. VAT)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-slate-500">R</span>
                  <input
                    type="number"
                    value={reverseTotalInput}
                    onChange={(e) => setReverseTotalInput(parseFloat(e.target.value) || 0)}
                    className="w-full pl-7 pr-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs font-mono font-bold text-slate-100"
                  />
                </div>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="text-[10px] text-slate-400">Base Net (Excl. VAT)</div>
                <div className="text-sm font-mono font-bold text-slate-200 mt-1">
                  R {reverseExclAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="text-[10px] text-slate-400">SARS 15% VAT Portion</div>
                <div className="text-sm font-mono font-bold text-emerald-400 mt-1">
                  R {reverseVatAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Summary & 1-Click Export */}
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-5">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider pb-3 border-b border-white/[0.08]">
              Automated Financial Breakdown
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Gross Line Items:</span>
                <span className="font-mono font-semibold text-slate-200">
                  R {rawSubtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {overallDiscountAmount > 0 && (
                <div className="flex items-center justify-between text-amber-400">
                  <span>Overall Discount ({overallDiscountPercent}%):</span>
                  <span className="font-mono font-semibold">
                    - R {overallDiscountAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-300 font-semibold pt-2 border-t border-white/5">
                <span>Taxable Subtotal (Excl. VAT):</span>
                <span className="font-mono text-slate-100">
                  R {baseAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span>SARS VAT ({taxMode === TaxMode.NO_VAT ? '0%' : '15%'}):</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      taxMode === TaxMode.NO_VAT
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {taxMode === TaxMode.NO_VAT ? 'Exempt' : taxMode === TaxMode.VAT_15_INCLUSIVE ? 'Inclusive' : 'Standard'}
                  </span>
                </span>
                <span className="font-mono font-semibold text-emerald-400">
                  R {vatAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Grand Total */}
              <div className="pt-4 border-t border-white/10 flex flex-col gap-1 bg-white/[0.02] p-3.5 rounded-2xl border border-white/5">
                <span className="text-xs text-slate-400 font-semibold">
                  Final Payable Amount ({taxMode === TaxMode.NO_VAT ? 'No VAT' : 'Incl. 15% VAT'}):
                </span>
                <span className="text-2xl font-extrabold font-mono text-emerald-400 tracking-tight">
                  R {grandTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* 1-Click Export Button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={handleExportToInvoice}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <FileCheck className="w-4 h-4" />
                <span>Create {docType === DocumentType.INVOICE ? 'Tax Invoice' : 'Quotation'} from Calculation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 text-xs text-slate-400 space-y-1.5">
            <div className="text-slate-200 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>SARS Compliance Ready</span>
            </div>
            <p className="leading-relaxed">
              Exported documents automatically inject your organization's legal CIPC registration, VAT number, and banking details into an official tax template.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

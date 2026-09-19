import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DocumentType,
  TaxMode,
  InvoiceStatus,
  InvoiceQuote,
  PrebuiltTemplate,
} from '../../types/schema';
import {
  Plus,
  Trash2,
  Receipt,
  Sparkles,
  Building,
  User,
  CreditCard,
  Palette,
  Check,
  Upload,
  Image as ImageIcon,
  Calculator,
  Percent,
  BookmarkPlus,
  FileCode,
  Sliders,
} from 'lucide-react';

interface InvoiceEditorModalProps {
  initialInvoice?: InvoiceQuote | null;
  onClose: () => void;
  defaultDocType?: DocumentType;
  initialTemplate?: PrebuiltTemplate | null;
}

const COLOR_PRESETS = [
  { name: 'Amber Gold', hex: '#D97706' },
  { name: 'Emerald Teal', hex: '#0F766E' },
  { name: 'Indigo Blue', hex: '#6366F1' },
  { name: 'Royal Blue', hex: '#1E40AF' },
  { name: 'Ruby Crimson', hex: '#DC2626' },
  { name: 'Sky Blue', hex: '#0284C7' },
  { name: 'Dark Slate', hex: '#334155' },
];

export const InvoiceEditorModal: React.FC<InvoiceEditorModalProps> = ({
  initialInvoice,
  onClose,
  defaultDocType = DocumentType.INVOICE,
  initialTemplate = null,
}) => {
  const {
    currentTenant,
    currentUser,
    createInvoice,
    updateInvoice,
    clients,
    saveClient,
    prebuiltTemplates,
    templateToApply,
    setTemplateToApply,
    clientToInvoice,
    setClientToInvoice,
    openTemplateEditor,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(initialInvoice);
  const activeTemplate = initialTemplate || templateToApply;

  const [docType, setDocType] = useState<DocumentType>(
    initialInvoice
      ? initialInvoice.docType
      : activeTemplate
      ? activeTemplate.docType
      : defaultDocType
  );

  const [documentNumber, setDocumentNumber] = useState<string>(
    initialInvoice
      ? initialInvoice.documentNumber
      : `${docType === DocumentType.INVOICE ? 'INV' : 'QUO'}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
  );

  const [primaryColor, setPrimaryColor] = useState<string>(
    initialInvoice?.primaryColor ||
      activeTemplate?.primaryColor ||
      currentTenant.primaryColor ||
      '#D97706'
  );

  const [logoUrl, setLogoUrl] = useState<string>(
    initialInvoice?.logoUrl || currentTenant.logoUrl || ''
  );

  // Business Info (Fillable)
  const [businessName, setBusinessName] = useState<string>(
    initialInvoice?.businessName || currentTenant.name
  );
  const [businessRegNo, setBusinessRegNo] = useState<string>(
    initialInvoice?.businessRegNo || currentTenant.businessRegNo || '2021/849201/07'
  );
  const [vatNumber, setVatNumber] = useState<string>(
    initialInvoice?.vatNumber || currentTenant.vatNumber || '4910283746'
  );
  const [businessAddress, setBusinessAddress] = useState<string>(
    initialInvoice?.businessAddress ||
      currentTenant.businessAddress ||
      'Unit 4, Gateway Industrial Park, Midrand, 1685'
  );
  const [businessEmail, setBusinessEmail] = useState<string>(
    initialInvoice?.businessEmail || currentTenant.businessEmail || 'accounts@smme.co.za'
  );
  const [businessPhone, setBusinessPhone] = useState<string>(
    initialInvoice?.businessPhone || currentTenant.businessPhone || '+27 11 805 9200'
  );

  // Client Info (Fillable)
  const [clientName, setClientName] = useState<string>(
    initialInvoice?.clientName || clientToInvoice?.name || ''
  );
  const [contactPerson, setContactPerson] = useState<string>(
    initialInvoice?.contactPerson || clientToInvoice?.contactPerson || ''
  );
  const [clientEmail, setClientEmail] = useState<string>(
    initialInvoice?.clientEmail || clientToInvoice?.email || ''
  );
  const [clientPhone, setClientPhone] = useState<string>(
    initialInvoice?.clientPhone || clientToInvoice?.phone || ''
  );
  const [clientAddress, setClientAddress] = useState<string>(
    initialInvoice?.clientAddress || clientToInvoice?.address || ''
  );
  const [clientVatNo, setClientVatNo] = useState<string>(
    initialInvoice?.clientVatNo || clientToInvoice?.vatNumber || ''
  );
  const [saveClientToDirectory, setSaveClientToDirectory] = useState<boolean>(false);

  // Tax & Status
  const [taxMode, setTaxMode] = useState<TaxMode>(
    initialInvoice?.taxMode || activeTemplate?.defaultTaxMode || TaxMode.VAT_15
  );
  const [status, setStatus] = useState<InvoiceStatus>(initialInvoice?.status || InvoiceStatus.SENT);
  const [dueDate, setDueDate] = useState<string>(
    initialInvoice?.dueDate
      ? initialInvoice.dueDate.split('T')[0]
      : clientToInvoice?.defaultPaymentDays
      ? new Date(Date.now() + clientToInvoice.defaultPaymentDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Dynamic Line Items
  const [lineItems, setLineItems] = useState<
    Array<{ id: string; description: string; quantity: number; unitPrice: number; discountPercent?: number; lineTotal: number }>
  >(
    initialInvoice?.lineItems && initialInvoice.lineItems.length > 0
      ? initialInvoice.lineItems
      : activeTemplate
      ? activeTemplate.sampleLineItems.map((s, idx) => ({
          id: `item-tmpl-${idx}`,
          description: s.description,
          quantity: s.quantity,
          unitPrice: s.unitPrice,
          discountPercent: 0,
          lineTotal: s.quantity * s.unitPrice,
        }))
      : [
          {
            id: 'item-1',
            description: 'Commercial Diagnostic & Artisan Labour Services',
            quantity: 8,
            unitPrice: 550,
            discountPercent: 0,
            lineTotal: 4400,
          },
          {
            id: 'item-2',
            description: 'Heavy-Duty Hardware Supply & Safety Sub-Assembly',
            quantity: 1,
            unitPrice: 12500,
            discountPercent: 0,
            lineTotal: 12500,
          },
        ]
  );

  // Banking Details & Footer Notes
  const [bankingDetails, setBankingDetails] = useState<string>(
    initialInvoice?.bankingDetails ||
      activeTemplate?.bankingDetails ||
      currentTenant.bankingDetails ||
      `Bank: First National Bank (FNB)
Account Name: ${currentTenant.name}
Account Number: 628 491 0284
Branch Code: 250655 (Commercial Banking)
Reference: ${documentNumber}`
  );

  const [footerNotes, setFooterNotes] = useState<string>(
    initialInvoice?.footerNotes ||
      activeTemplate?.footerNotes ||
      `1. Payment strictly due within 14 calendar days of statement date.
2. Official SARS 15% VAT Document.
3. Thank you for your valued partnership!`
  );

  // Clear templateToApply & clientToInvoice when unmounted
  useEffect(() => {
    return () => {
      if (templateToApply) setTemplateToApply(null);
      if (clientToInvoice) setClientToInvoice(null);
    };
  }, [templateToApply, setTemplateToApply, clientToInvoice, setClientToInvoice]);

  // Load a client from saved directory
  const handleSelectClient = (clientId: string) => {
    const selected = clients.find((c) => c.id === clientId);
    if (!selected) return;

    setClientName(selected.name);
    setContactPerson(selected.contactPerson || '');
    setClientEmail(selected.email);
    setClientPhone(selected.phone);
    
    // Construct full address if city / postal code present
    let fullAddr = selected.address || '';
    if (selected.city && !fullAddr.includes(selected.city)) {
      fullAddr = fullAddr ? `${fullAddr}, ${selected.city}` : selected.city;
    }
    if (selected.postalCode && !fullAddr.includes(selected.postalCode)) {
      fullAddr = `${fullAddr}, ${selected.postalCode}`;
    }
    setClientAddress(fullAddr);
    setClientVatNo(selected.vatNumber || '');

    if (selected.defaultPaymentDays !== undefined) {
      setDueDate(
        new Date(Date.now() + selected.defaultPaymentDays * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
      );
    }
  };

  // Load a prebuilt template
  const handleLoadTemplate = (tmplId: string) => {
    const tmpl = prebuiltTemplates.find((t) => t.id === tmplId);
    if (!tmpl) return;

    setDocType(tmpl.docType);
    setPrimaryColor(tmpl.primaryColor);
    setTaxMode(tmpl.defaultTaxMode);
    setBankingDetails(tmpl.bankingDetails.replace('{DOC_NUM}', documentNumber.replace(/\D/g, '')));
    setFooterNotes(tmpl.footerNotes);
    setLineItems(
      tmpl.sampleLineItems.map((s, idx) => ({
        id: `item-tmpl-${idx}-${Date.now()}`,
        description: s.description,
        quantity: s.quantity,
        unitPrice: s.unitPrice,
        discountPercent: 0,
        lineTotal: s.quantity * s.unitPrice,
      }))
    );
  };

  // Handle Logo Upload as Base64 Data URL
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl) {
        setLogoUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDocTypeChange = (newType: DocumentType) => {
    setDocType(newType);
    if (!isEditing) {
      setDocumentNumber(
        `${newType === DocumentType.INVOICE ? 'INV' : 'QUO'}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
      );
    }
  };

  // Line item modifications
  const updateItem = (
    index: number,
    field: 'description' | 'quantity' | 'unitPrice' | 'discountPercent',
    val: any
  ) => {
    setLineItems((prev) => {
      const copy = [...prev];
      const current = { ...copy[index] };
      if (field === 'description') {
        current.description = val;
      } else if (field === 'quantity') {
        current.quantity = Math.max(1, parseInt(val) || 1);
      } else if (field === 'unitPrice') {
        current.unitPrice = Math.max(0, parseFloat(val) || 0);
      } else if (field === 'discountPercent') {
        current.discountPercent = Math.max(0, Math.min(100, parseFloat(val) || 0));
      }

      const disc = current.discountPercent || 0;
      current.lineTotal = current.quantity * current.unitPrice * (1 - disc / 100);
      copy[index] = current;
      return copy;
    });
  };

  const addItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: 'Commercial Service / Product Line Item',
        quantity: 1,
        unitPrice: 1200,
        discountPercent: 0,
        lineTotal: 1200,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Pricing & SARS 15% VAT Calculations
  const grossSubtotal = lineItems.reduce((acc, item) => acc + item.lineTotal, 0);

  let subtotal = 0;
  let vatAmount = 0;
  let grandTotal = 0;
  const vatRate = taxMode === TaxMode.NO_VAT ? 0.0 : 0.15;

  if (taxMode === TaxMode.VAT_15) {
    // Exclusive: subtotal is gross, +15% VAT added
    subtotal = grossSubtotal;
    vatAmount = subtotal * 0.15;
    grandTotal = subtotal + vatAmount;
  } else if (taxMode === TaxMode.VAT_15_INCLUSIVE) {
    // Inclusive: gross is total, back out VAT
    grandTotal = grossSubtotal;
    vatAmount = grossSubtotal * (15 / 115);
    subtotal = grandTotal - vatAmount;
  } else {
    // Zero VAT
    subtotal = grossSubtotal;
    vatAmount = 0;
    grandTotal = grossSubtotal;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      alert('Please enter a client or company name.');
      return;
    }

    if (saveClientToDirectory) {
      saveClient({
        tenantId: currentTenant.id,
        name: clientName,
        contactPerson: contactPerson || undefined,
        email: clientEmail || 'info@client.co.za',
        phone: clientPhone || '+27 82 555 4910',
        address: clientAddress || undefined,
        vatNumber: clientVatNo || undefined,
        defaultPaymentDays: 14,
        totalInvoicedZAR: grandTotal,
      });
    }

    const payload = {
      tenantId: currentTenant.id,
      userId: currentUser.id,
      docType,
      documentNumber,
      logoUrl: logoUrl || undefined,
      primaryColor,
      businessName,
      businessRegNo: businessRegNo || undefined,
      vatNumber: vatNumber || undefined,
      businessAddress: businessAddress || undefined,
      businessEmail: businessEmail || undefined,
      businessPhone: businessPhone || undefined,
      clientName,
      contactPerson: contactPerson || undefined,
      clientEmail,
      clientAddress: clientAddress || undefined,
      clientVatNo: clientVatNo || undefined,
      clientPhone: clientPhone || undefined,
      taxMode,
      vatRate,
      subtotal,
      vatAmount,
      grandTotal,
      bankingDetails,
      footerNotes,
      status,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      lineItems: lineItems.map((item, idx) => ({
        id: item.id || `item-${idx}`,
        invoiceQuoteId: initialInvoice?.id || '',
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent || 0,
        lineTotal: item.lineTotal,
      })),
    };

    if (isEditing && initialInvoice) {
      updateInvoice(initialInvoice.id, payload);
    } else {
      createInvoice(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full my-auto shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header with Dynamic Color */}
        <div
          className="p-5 text-white flex items-center justify-between transition-colors shadow-sm"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-2xl shadow-inner">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {isEditing
                  ? `Edit ${docType === DocumentType.INVOICE ? 'Tax Invoice' : 'Quotation'}`
                  : `Create New ${docType === DocumentType.INVOICE ? 'Tax Invoice' : 'Quotation'}`}
              </h2>
              <p className="text-xs text-white/85">
                SMME Automated pricing calculator with fillable business details & 15% VAT options
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-xl font-bold p-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* Quick Prebuilt Template Loader Bar */}
          <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent rounded-2xl border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Load Prebuilt Industry Template:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                onChange={(e) => handleLoadTemplate(e.target.value)}
                defaultValue=""
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-medium text-gray-800 shadow-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="" disabled>
                  -- Select an Industry Template --
                </option>
                {prebuiltTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.isCustom ? '⭐' : ''} ({t.industry})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => openTemplateEditor(activeTemplate || null)}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                title="Design custom template in Template Studio"
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                <span>Template Designer Studio</span>
              </button>
            </div>
          </div>

          {/* Top Control Bar: Doc Type, Number, Status, Tax Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Document Type</label>
              <div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-xl border border-gray-300">
                <button
                  type="button"
                  onClick={() => handleDocTypeChange(DocumentType.INVOICE)}
                  className={`py-1.5 px-2 rounded-lg font-bold text-xs transition-colors ${
                    docType === DocumentType.INVOICE
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Tax Invoice
                </button>
                <button
                  type="button"
                  onClick={() => handleDocTypeChange(DocumentType.QUOTE)}
                  className={`py-1.5 px-2 rounded-lg font-bold text-xs transition-colors ${
                    docType === DocumentType.QUOTE
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Quotation
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Document Number</label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                required
                className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                SARS Tax & VAT Calculation Mode
              </label>
              <select
                value={taxMode}
                onChange={(e) => setTaxMode(e.target.value as TaxMode)}
                className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value={TaxMode.VAT_15}>Standard Rate: Add 15% VAT (Exclusive)</option>
                <option value={TaxMode.VAT_15_INCLUSIVE}>Inclusive: 15% VAT Included in prices</option>
                <option value={TaxMode.NO_VAT}>Without 15% VAT: 0% / Non-VAT Vendor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Document Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value={InvoiceStatus.DRAFT}>Draft</option>
                <option value={InvoiceStatus.SENT}>Sent to Client</option>
                <option value={InvoiceStatus.PAID}>Paid / Settled</option>
                <option value={InvoiceStatus.OVERDUE}>Overdue</option>
                <option value={InvoiceStatus.CANCELLED}>Cancelled</option>
              </select>
            </div>
          </div>

          {/* Fillable Logo, Branding & Due Date */}
          <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase tracking-wider">
              <Palette className="w-4 h-4 text-emerald-600" />
              <span>Fillable Logo, Brand Color & Styling</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              {/* Logo Upload & Preview */}
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Business Logo (File Upload or URL)
                </label>
                <div className="flex items-center gap-3">
                  {logoUrl ? (
                    <div className="relative w-14 h-14 rounded-xl border border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="absolute inset-0 bg-black/60 text-white text-[10px] font-bold opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-300 hover:border-emerald-500 cursor-pointer flex flex-col items-center justify-center text-gray-400 hover:text-emerald-600 transition-colors flex-shrink-0 bg-gray-50"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-[9px] font-bold mt-0.5">Upload</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-2.5 py-1 text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-left truncate"
                    >
                      📁 Browse Local Image...
                    </button>
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="Or paste image URL https://..."
                      className="w-full px-2.5 py-1 bg-gray-50 border border-gray-300 rounded-lg text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Brand Accent Color */}
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Brand Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-24 px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg font-mono text-xs text-gray-700"
                  />
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setPrimaryColor(preset.hex)}
                      className="w-5 h-5 rounded-full border border-white shadow-xs relative transition-transform hover:scale-110"
                      style={{ backgroundColor: preset.hex }}
                      title={preset.name}
                    >
                      {primaryColor === preset.hex && (
                        <Check className="w-3 h-3 text-white absolute inset-0 m-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* Two Columns: Issuer Business Details vs Client Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fillable Issuer Business Details */}
            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase tracking-wider">
                <Building className="w-4 h-4 text-emerald-600" />
                <span>Fillable Issuer Business Info (Tax Vendor)</span>
              </div>
              <div>
                <label className="block text-[11px] text-gray-600 font-medium">Business / Company Name *</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-gray-600">Company Reg No.</label>
                  <input
                    type="text"
                    value={businessRegNo}
                    onChange={(e) => setBusinessRegNo(e.target.value)}
                    placeholder="2021/849201/07"
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-600">SARS VAT Number</label>
                  <input
                    type="text"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    placeholder="4910283746"
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-gray-600">Physical Address</label>
                <input
                  type="text"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-gray-600">Business Email</label>
                  <input
                    type="email"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-600">Business Phone</label>
                  <input
                    type="text"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Fillable Client Details */}
            <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase tracking-wider">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>Billed Client / Enterprise Info</span>
                </div>
                {clients.length > 0 && (
                  <select
                    onChange={(e) => handleSelectClient(e.target.value)}
                    defaultValue=""
                    className="text-[11px] px-2 py-1 bg-white border border-gray-300 rounded-lg text-gray-700"
                  >
                    <option value="" disabled>
                      Auto-fill Saved Client
                    </option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-gray-600 font-medium">Client / Company Name *</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                    placeholder="e.g. Growthpoint Properties Ltd"
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-600">Contact Person</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Martin Steyn"
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-gray-600">Client Email</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="finance@client.co.za"
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-600">Client Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+27 82 555 4910"
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-gray-600">Client Physical Address</label>
                <input
                  type="text"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="1 Sandton Drive, Sandton, 2196"
                  className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-[11px] text-gray-600">Client VAT Number</label>
                  <input
                    type="text"
                    value={clientVatNo}
                    onChange={(e) => setClientVatNo(e.target.value)}
                    placeholder="4820194821"
                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs font-mono"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-gray-700">
                    <input
                      type="checkbox"
                      checked={saveClientToDirectory}
                      onChange={(e) => setSaveClientToDirectory(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Save to client directory</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table with Discount % & Real-Time Math */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                  Line Items & Automated Pricing Table
                </h3>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-bold text-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left">
                <thead className="bg-gray-100 text-gray-700 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-2.5 pl-3">Description of Goods or Services</th>
                    <th className="p-2.5 w-20 text-center">Qty</th>
                    <th className="p-2.5 w-32 text-right">Unit Price (ZAR)</th>
                    <th className="p-2.5 w-24 text-center">Disc %</th>
                    <th className="p-2.5 w-32 text-right">Line Total</th>
                    <th className="p-2.5 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {lineItems.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="p-2.5 pl-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(idx, 'description', e.target.value)}
                          required
                          className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                          className="w-full text-center px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </td>
                      <td className="p-2.5">
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-[11px] text-gray-400">R</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
                            className="w-full pl-6 pr-2 py-1.5 text-right bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                      </td>
                      <td className="p-2.5">
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discountPercent || 0}
                            onChange={(e) => updateItem(idx, 'discountPercent', e.target.value)}
                            className="w-full pr-4 pl-1 py-1.5 text-center bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                          <span className="absolute right-1.5 top-2 text-[10px] text-gray-400">%</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-gray-900">
                        R{' '}
                        {item.lineTotal.toLocaleString('en-ZA', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          disabled={lineItems.length <= 1}
                          className="text-gray-400 hover:text-red-600 disabled:opacity-30 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Totals & Automated SARS VAT Breakdown */}
          <div className="flex justify-end">
            <div className="w-full sm:w-88 bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal (Excl. VAT):</span>
                <span className="font-mono font-semibold text-gray-900">
                  R {subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 items-center">
                <span className="flex items-center gap-1">
                  <span>SARS VAT ({taxMode === TaxMode.NO_VAT ? '0%' : '15%'}):</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      taxMode === TaxMode.NO_VAT
                        ? 'bg-gray-200 text-gray-700'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {taxMode === TaxMode.NO_VAT
                      ? 'Exempt / Non-VAT'
                      : taxMode === TaxMode.VAT_15_INCLUSIVE
                      ? 'Included in prices'
                      : 'Standard +15%'}
                  </span>
                </span>
                <span className="font-mono font-semibold text-gray-900">
                  R {vatAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-gray-900 text-sm">
                <span>
                  Grand Total ({taxMode === TaxMode.NO_VAT ? 'No VAT' : 'Incl. 15% VAT'}):
                </span>
                <span className="font-mono text-emerald-800 text-base">
                  R {grandTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Banking Details & Footer Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                <span>Banking Details & EFT Reference</span>
              </label>
              <textarea
                rows={4}
                value={bankingDetails}
                onChange={(e) => setBankingDetails(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-mono text-[11px] text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Footer Terms & Quotation Validity Notes
              </label>
              <textarea
                rows={4}
                value={footerNotes}
                onChange={(e) => setFooterNotes(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-[11px] text-gray-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              <span>{isEditing ? 'Save Changes' : `Issue ${docType === DocumentType.INVOICE ? 'Tax Invoice' : 'Quotation'}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

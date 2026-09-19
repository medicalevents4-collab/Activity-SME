import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  PrebuiltTemplate,
  DocumentType,
  TaxMode,
} from '../../types/schema';
import {
  Sparkles,
  Layout,
  Palette,
  Building,
  CreditCard,
  FileText,
  Plus,
  Trash2,
  Save,
  Eye,
  Check,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Smartphone,
  Monitor,
  Copy,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  FileCode,
  Layers,
  Wrench,
  Briefcase,
  Cpu,
  ShoppingBag,
  Car,
  Tag,
  ShieldCheck,
  Printer,
  ChevronRight,
  Sliders,
  Type,
} from 'lucide-react';

interface TemplateEditorProps {
  initialTemplate?: PrebuiltTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (savedTemplate: PrebuiltTemplate) => void;
}

const COLOR_PALETTES = [
  { name: 'Amber Gold (Trades)', hex: '#D97706', accent: '#F59E0B', industry: 'Construction & Trades' },
  { name: 'Kirstenbosch Teal', hex: '#0F766E', accent: '#14B8A6', industry: 'Advisory & Legal' },
  { name: 'Royal Indigo', hex: '#6366F1', accent: '#818CF8', industry: 'Tech & Agency' },
  { name: 'Standard Navy', hex: '#1E3A8A', accent: '#3B82F6', industry: 'Corporate & Supply' },
  { name: 'Highveld Sky Blue', hex: '#0284C7', accent: '#38BDF8', industry: 'Wholesale & Logistics' },
  { name: 'Cape Ruby Red', hex: '#DC2626', accent: '#EF4444', industry: 'Automotive & Fleet' },
  { name: 'Charcoal Obsidian', hex: '#1E293B', accent: '#475569', industry: 'Modern Minimal' },
  { name: 'Karoo Bronze', hex: '#C2410C', accent: '#FB923C', industry: 'Agriculture & Food' },
  { name: 'Amethyst Purple', hex: '#7C3AED', accent: '#A855F7', industry: 'Creative & Media' },
  { name: 'Forest Emerald', hex: '#059669', accent: '#10B981', industry: 'Eco & Landscaping' },
];

const THEME_OPTIONS: {
  id: 'MODERN' | 'EXECUTIVE' | 'BOLD' | 'MINIMAL' | 'CREATIVE' | 'COMPACT';
  title: string;
  subtitle: string;
  description: string;
}[] = [
  {
    id: 'MODERN',
    title: 'Modern Horizon',
    subtitle: 'Asymmetrical & Crisp',
    description: 'Clean slate borders, subtle shadows, colored top stripe, and modern sans typography.',
  },
  {
    id: 'EXECUTIVE',
    title: 'Executive Corporate',
    subtitle: 'Classic & Authoritative',
    description: 'Dual-border header line, serif typography, formal settlement cards, and compliance stamps.',
  },
  {
    id: 'BOLD',
    title: 'Bold Band & Horizon',
    subtitle: 'High-Contrast Accent',
    description: 'Full-bleed colored brand bar, high-contrast column headers, and solid total summary card.',
  },
  {
    id: 'MINIMAL',
    title: 'Clean Minimalist',
    subtitle: 'Pure Whitespace',
    description: 'Uncluttered hairline dividers, refined monochrome typography, and light accent badges.',
  },
  {
    id: 'CREATIVE',
    title: 'Studio & Agency',
    subtitle: 'Tech & Digital Ready',
    description: 'Sleek rounded cards, vibrant accent markers, monospaced line pricing, and modern badges.',
  },
  {
    id: 'COMPACT',
    title: 'Compact Express',
    subtitle: 'Dense & Trade Slip',
    description: 'Space-efficient format ideal for field services, plumbing callouts, and rapid receipts.',
  },
];

const SA_BANK_PRESETS = [
  {
    bankName: 'First National Bank (FNB)',
    branchCode: '250655',
    accountType: 'Cheque / Current',
    swift: 'FIRNZAJJ',
  },
  {
    bankName: 'Standard Bank of South Africa',
    branchCode: '051001',
    accountType: 'Business Current',
    swift: 'SBZA ZA JJ',
  },
  {
    bankName: 'Nedbank South Africa',
    branchCode: '198765',
    accountType: 'Corporate Cheque',
    swift: 'NEDBZAJJ',
  },
  {
    bankName: 'Absa Bank',
    branchCode: '632005',
    accountType: 'Business Cheque',
    swift: 'ABSAZAJJ',
  },
  {
    bankName: 'Capitec Business Bank',
    branchCode: '470010',
    accountType: 'Transacting Account',
    swift: 'CAPIZAJJ',
  },
  {
    bankName: 'Investec Bank',
    branchCode: '580105',
    accountType: 'Private Bank Account',
    swift: 'INVEZAJJ',
  },
];

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  initialTemplate,
  isOpen,
  onClose,
  onSaved,
}) => {
  const {
    currentTenant,
    saveTemplate,
    applyTemplateToNewInvoice,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Editor Tabs
  const [activeTab, setActiveTab] = useState<'theme' | 'branding' | 'items' | 'banking'>('theme');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [viewDevice, setViewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [showSampleClient, setShowSampleClient] = useState<boolean>(true);

  // Template State
  const [templateName, setTemplateName] = useState<string>('');
  const [industry, setIndustry] = useState<string>('Construction & Plumbing');
  const [description, setDescription] = useState<string>('');
  const [badge, setBadge] = useState<string>('Custom Template');
  const [docType, setDocType] = useState<DocumentType>(DocumentType.INVOICE);
  const [taxMode, setTaxMode] = useState<TaxMode>(TaxMode.VAT_15);

  // Theme & Styling State
  const [themeLayout, setThemeLayout] = useState<'MODERN' | 'EXECUTIVE' | 'BOLD' | 'MINIMAL' | 'CREATIVE' | 'COMPACT'>('MODERN');
  const [primaryColor, setPrimaryColor] = useState<string>('#D97706');
  const [accentColor, setAccentColor] = useState<string>('#F59E0B');
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [headerLayout, setHeaderLayout] = useState<'SPLIT' | 'CENTERED' | 'STACKED_LEFT'>('SPLIT');
  const [tableStyle, setTableStyle] = useState<'MODERN' | 'ZEBRA' | 'GRID' | 'BORDERLESS'>('MODERN');
  const [watermarkText, setWatermarkText] = useState<string>('ORIGINAL TAX INVOICE');

  // Business Branding State
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [businessName, setBusinessName] = useState<string>('');
  const [businessRegNo, setBusinessRegNo] = useState<string>('');
  const [vatNumber, setVatNumber] = useState<string>('');
  const [businessAddress, setBusinessAddress] = useState<string>('');
  const [businessEmail, setBusinessEmail] = useState<string>('');
  const [businessPhone, setBusinessPhone] = useState<string>('');

  // Banking & Terms State
  const [bankingDetails, setBankingDetails] = useState<string>('');
  const [footerNotes, setFooterNotes] = useState<string>('');

  // Sample Line Items
  const [lineItems, setLineItems] = useState<{ description: string; quantity: number; unitPrice: number }[]>([
    { description: 'Professional On-Site Diagnostic & Master Artisan Call-Out', quantity: 1, unitPrice: 850 },
    { description: 'Supply & Installation of High-Pressure Solar Geyser (SABS Approved)', quantity: 1, unitPrice: 14500 },
    { description: 'Skilled Artisan & Assistant Labour (8 Hours)', quantity: 8, unitPrice: 450 },
  ]);

  // Initialize or Reset Template State
  useEffect(() => {
    if (initialTemplate) {
      setTemplateName(initialTemplate.name);
      setIndustry(initialTemplate.industry || 'Construction & Plumbing');
      setDescription(initialTemplate.description || '');
      setBadge(initialTemplate.badge || 'Custom Template');
      setDocType(initialTemplate.docType || DocumentType.INVOICE);
      setTaxMode(initialTemplate.defaultTaxMode || TaxMode.VAT_15);
      setPrimaryColor(initialTemplate.primaryColor || '#D97706');
      setAccentColor(initialTemplate.accentColor || '#F59E0B');
      setThemeLayout(initialTemplate.themeLayout || 'MODERN');
      setFontFamily(initialTemplate.fontFamily || 'sans');
      setHeaderLayout(initialTemplate.headerLayout || 'SPLIT');
      setTableStyle(initialTemplate.tableStyle || 'MODERN');
      setWatermarkText(initialTemplate.watermarkText || (initialTemplate.docType === DocumentType.INVOICE ? 'ORIGINAL TAX INVOICE' : 'OFFICIAL ESTIMATE'));
      
      setLogoUrl(initialTemplate.logoUrl || currentTenant.logoUrl || '');
      setBusinessName(initialTemplate.businessName || currentTenant.name || '');
      setBusinessRegNo(initialTemplate.businessRegNo || currentTenant.businessRegNo || '');
      setVatNumber(initialTemplate.vatNumber || currentTenant.vatNumber || '');
      setBusinessAddress(initialTemplate.businessAddress || currentTenant.businessAddress || '');
      setBusinessEmail(initialTemplate.businessEmail || currentTenant.businessEmail || '');
      setBusinessPhone(initialTemplate.businessPhone || currentTenant.businessPhone || '');

      setBankingDetails(initialTemplate.bankingDetails || currentTenant.bankingDetails || '');
      setFooterNotes(initialTemplate.footerNotes || currentTenant.defaultTerms || '');
      setLineItems(initialTemplate.sampleLineItems?.length ? initialTemplate.sampleLineItems : [
        { description: 'Standard Service Item 1', quantity: 1, unitPrice: 1200 },
        { description: 'Labour & Specialist Artisan Work', quantity: 4, unitPrice: 450 },
      ]);
    } else {
      // Default new template state
      setTemplateName('My Custom SMME Template');
      setIndustry('Construction & Plumbing');
      setDescription('Custom tailored tax invoice layout with branded headers, SARS 15% VAT settlement, and banking details.');
      setBadge('Custom Layout');
      setDocType(DocumentType.INVOICE);
      setTaxMode(TaxMode.VAT_15);
      setPrimaryColor(currentTenant.primaryColor || '#D97706');
      setAccentColor('#F59E0B');
      setThemeLayout('MODERN');
      setFontFamily('sans');
      setHeaderLayout('SPLIT');
      setTableStyle('MODERN');
      setWatermarkText('ORIGINAL TAX INVOICE');

      setLogoUrl(currentTenant.logoUrl || '');
      setBusinessName(currentTenant.name || 'Vanguard Engineering & Trades (Pty) Ltd');
      setBusinessRegNo(currentTenant.businessRegNo || '2021/849201/07');
      setVatNumber(currentTenant.vatNumber || '4910283746');
      setBusinessAddress(currentTenant.businessAddress || 'Unit 4, Gateway Industrial Park, Midrand, 1685');
      setBusinessEmail(currentTenant.businessEmail || 'accounts@vanguard-eng.co.za');
      setBusinessPhone(currentTenant.businessPhone || '+27 11 805 9200');

      setBankingDetails(currentTenant.bankingDetails || `Bank: First National Bank (FNB)\nAccount Name: Vanguard Engineering (Pty) Ltd\nAccount Number: 628 491 0284\nBranch Code: 250655 (Corporate Banking)\nReference: INV-{DOC_NUM}`);
      setFooterNotes(currentTenant.defaultTerms || `1. Workmanship guaranteed for 12 months.\n2. Payment strictly due within 14 calendar days via EFT.\n3. Official SARS 15% VAT Tax Invoice. Thank you for your business!`);
      setLineItems([
        { description: 'On-Site Diagnostic & Master Artisan Call-Out Fee', quantity: 1, unitPrice: 850 },
        { description: 'Supply & Installation of 200L High-Pressure Solar Geyser', quantity: 1, unitPrice: 14500 },
        { description: 'Copper Piping (22mm), Brass Valves & Pressure Equalizer Fittings', quantity: 1, unitPrice: 3200 },
        { description: 'Skilled Artisan & Assistant Labour (8 Hours)', quantity: 8, unitPrice: 450 },
      ]);
    }
  }, [initialTemplate, currentTenant, isOpen]);

  if (!isOpen) return null;

  // Calculated Preview Totals
  const subtotal = lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  let vatAmount = 0;
  let grandTotal = subtotal;

  if (taxMode === TaxMode.VAT_15) {
    vatAmount = subtotal * 0.15;
    grandTotal = subtotal + vatAmount;
  } else if (taxMode === TaxMode.VAT_15_INCLUSIVE) {
    vatAmount = subtotal - subtotal / 1.15;
    grandTotal = subtotal;
  }

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setLogoUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add & Remove Line Items
  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: 'New Service / Deliverable Line Item', quantity: 1, unitPrice: 500 },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleUpdateLineItem = (index: number, field: 'description' | 'quantity' | 'unitPrice', val: string | number) => {
    setLineItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        return {
          ...item,
          [field]: field === 'description' ? val : Math.max(0, Number(val) || 0),
        };
      })
    );
  };

  // Quick Bank Preset
  const handleSelectBankPreset = (bank: typeof SA_BANK_PRESETS[0]) => {
    const text = `Bank: ${bank.bankName}\nAccount Name: ${businessName || currentTenant.name}\nAccount Number: 628 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)}\nBranch Code: ${bank.branchCode}\nSwift Code: ${bank.swift}\nReference: ${docType === DocumentType.INVOICE ? 'INV' : 'QUO'}-{DOC_NUM}`;
    setBankingDetails(text);
  };

  // Save Template Action
  const handleSave = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name.');
      return;
    }

    const payload: Omit<PrebuiltTemplate, 'id'> & { id?: string } = {
      id: initialTemplate?.id,
      name: templateName.trim(),
      industry: industry.trim() || 'General Business',
      description: description.trim() || 'Custom reusable invoice layout with custom branding and styling.',
      badge: badge.trim() || 'Custom Layout',
      docType,
      primaryColor,
      accentColor,
      defaultTaxMode: taxMode,
      themeLayout,
      fontFamily,
      headerLayout,
      tableStyle,
      watermarkText,
      logoUrl,
      businessName,
      businessRegNo,
      vatNumber,
      businessAddress,
      businessEmail,
      businessPhone,
      bankingDetails,
      footerNotes,
      sampleLineItems: lineItems.length ? lineItems : [{ description: 'General Service', quantity: 1, unitPrice: 1000 }],
      isCustom: true,
      tenantId: currentTenant.id,
    };

    const saved = saveTemplate(payload);
    if (onSaved) {
      onSaved(saved);
    }
    onClose();
  };

  // Apply to New Invoice and Close
  const handleApplyNow = () => {
    const payload: PrebuiltTemplate = {
      id: initialTemplate?.id || `tmpl-custom-${Date.now()}`,
      name: templateName.trim(),
      industry: industry.trim() || 'General Business',
      description: description.trim(),
      badge: badge.trim() || 'Custom Layout',
      docType,
      primaryColor,
      accentColor,
      defaultTaxMode: taxMode,
      themeLayout,
      fontFamily,
      headerLayout,
      tableStyle,
      watermarkText,
      logoUrl,
      businessName,
      businessRegNo,
      vatNumber,
      businessAddress,
      businessEmail,
      businessPhone,
      bankingDetails,
      footerNotes,
      sampleLineItems: lineItems,
      isCustom: true,
      tenantId: currentTenant.id,
    };

    saveTemplate(payload);
    applyTemplateToNewInvoice(payload);
    onClose();
  };

  // Determine Font Class for Preview
  const getFontFamilyClass = () => {
    if (fontFamily === 'serif') return 'font-serif';
    if (fontFamily === 'mono') return 'font-mono';
    return 'font-sans';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
      {/* Top Studio Action Bar */}
      <div className="h-16 px-4 sm:px-6 bg-[#0f131a] border-b border-white/10 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
            style={{ backgroundColor: primaryColor }}
          >
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-1.5">
                <span>Template Customizer Studio</span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                  style={{
                    backgroundColor: `${primaryColor}25`,
                    color: primaryColor,
                    border: `1px solid ${primaryColor}40`,
                  }}
                >
                  {themeLayout} THEME
                </span>
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Customize layouts, business branding, color palettes, SARS 15% VAT, and settlement presets.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleApplyNow}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl transition-colors flex items-center gap-1.5 hidden md:flex"
            title="Save template and immediately create a new invoice"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Use For New Invoice</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 hover:opacity-95"
            style={{ backgroundColor: primaryColor }}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Template</span>
          </button>
        </div>
      </div>

      {/* Main Split Body: Left Editor Sidebar | Right Live Interactive Canvas */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* LEFT COLUMN: Controls & Settings */}
        <div className="w-full lg:w-[480px] xl:w-[520px] bg-[#0c1017] border-r border-white/10 flex flex-col flex-shrink-0 overflow-hidden">
          {/* Navigation Sub-Tabs */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] p-1.5 px-3">
            <button
              onClick={() => setActiveTab('theme')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'theme'
                  ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Theme & Colors</span>
            </button>

            <button
              onClick={() => setActiveTab('branding')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'branding'
                  ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Branding & Entity</span>
            </button>

            <button
              onClick={() => setActiveTab('items')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'items'
                  ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tax & Line Items</span>
            </button>

            <button
              onClick={() => setActiveTab('banking')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'banking'
                  ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Bank & Terms</span>
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 custom-scrollbar text-slate-200">
            {/* TAB 1: THEMES, LAYOUT & COLOR SCHEMES */}
            {activeTab === 'theme' && (
              <div className="space-y-6">
                {/* Template Name & Badge */}
                <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Template Metadata</span>
                  </h3>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="e.g. Master Contractor Amber Gold"
                      className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Industry Category
                      </label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-3 py-2 bg-[#121722] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                      >
                        <option value="Construction & Plumbing">Construction & Trades</option>
                        <option value="Professional Services">Advisory & Legal</option>
                        <option value="Creative & Tech">Digital Agency & Tech</option>
                        <option value="Retail & Distribution">Retail & Wholesale</option>
                        <option value="Auto & Maintenance">Automotive & Fleet</option>
                        <option value="Small Business / Freelance">Freelance / Micro Business</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Badge Label
                      </label>
                      <input
                        type="text"
                        value={badge}
                        onChange={(e) => setBadge(e.target.value)}
                        placeholder="e.g. Executive Pro"
                        className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Short Description / Notes
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the ideal use case for this template..."
                      className="w-full px-3 py-1.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>

                {/* Pre-defined Themes Selector */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Pre-defined Theme Layouts
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {THEME_OPTIONS.map((theme) => {
                      const isSelected = themeLayout === theme.id;
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => setThemeLayout(theme.id)}
                          className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                            isSelected
                              ? 'bg-indigo-600/20 border-indigo-400 shadow-md ring-1 ring-indigo-400/50'
                              : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                          <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                            <span>{theme.title}</span>
                          </div>
                          <p className="text-[10px] text-indigo-300 font-medium mt-0.5">{theme.subtitle}</p>
                          <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {theme.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Schemes & Palette Picker */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                      Curated South African Color Palettes
                    </label>
                    <span className="text-[10px] font-mono text-indigo-300">{primaryColor}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {COLOR_PALETTES.map((palette) => {
                      const isSelected = primaryColor.toLowerCase() === palette.hex.toLowerCase();
                      return (
                        <button
                          key={palette.hex}
                          type="button"
                          onClick={() => {
                            setPrimaryColor(palette.hex);
                            setAccentColor(palette.accent);
                          }}
                          className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                            isSelected
                              ? 'bg-white/15 border-white shadow-sm ring-1 ring-white/50 scale-102'
                              : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.06]'
                          }`}
                        >
                          <div
                            className="w-7 h-7 rounded-lg shadow-inner flex items-center justify-center"
                            style={{ backgroundColor: palette.hex }}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                          </div>
                          <span className="text-[10px] font-bold text-slate-200 truncate w-full">
                            {palette.name.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Hex Color Picker */}
                  <div className="p-3 bg-white/[0.02] border border-white/10 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-200">Custom Brand Color</span>
                        <p className="text-[10px] text-slate-400">Pick any custom HEX branding color</p>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-24 px-2 py-1 bg-white/5 border border-white/20 rounded-lg text-xs font-mono text-center text-white"
                    />
                  </div>
                </div>

                {/* Typography & Structure Options */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Typography Font
                    </label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value as 'sans' | 'serif' | 'mono')}
                      className="w-full px-3 py-2 bg-[#121722] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                    >
                      <option value="sans">Modern Sans (Plus Jakarta)</option>
                      <option value="serif">Executive Serif (Playfair/Georgia)</option>
                      <option value="mono">Tech Mono (JetBrains/Courier)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Header Structure
                    </label>
                    <select
                      value={headerLayout}
                      onChange={(e) => setHeaderLayout(e.target.value as 'SPLIT' | 'CENTERED' | 'STACKED_LEFT')}
                      className="w-full px-3 py-2 bg-[#121722] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                    >
                      <option value="SPLIT">Split (Logo Left / Doc Right)</option>
                      <option value="CENTERED">Centered Brand Identity</option>
                      <option value="STACKED_LEFT">Left Stripe Stacked</option>
                    </select>
                  </div>
                </div>

                {/* Table Style & Watermark */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Table Style
                    </label>
                    <select
                      value={tableStyle}
                      onChange={(e) => setTableStyle(e.target.value as 'MODERN' | 'ZEBRA' | 'GRID' | 'BORDERLESS')}
                      className="w-full px-3 py-2 bg-[#121722] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                    >
                      <option value="MODERN">Modern Clean Dividers</option>
                      <option value="ZEBRA">Zebra Striped Rows</option>
                      <option value="GRID">Structured Outlined Grid</option>
                      <option value="BORDERLESS">Ultra Minimalist Borderless</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Compliance Watermark
                    </label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="e.g. ORIGINAL TAX INVOICE"
                      className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BUSINESS BRANDING & ENTITY DETAILS */}
            {activeTab === 'branding' && (
              <div className="space-y-4">
                <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Business Branding & Logo</span>
                  </h3>

                  {/* Logo Selector */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-300">
                      Company Logo / Avatar
                    </label>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-14 h-14 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center overflow-hidden flex-shrink-0"
                        style={{ borderColor: primaryColor }}
                      >
                        {logoUrl ? (
                          <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-500" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            placeholder="Paste image URL..."
                            className="flex-1 px-3 py-1.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload</span>
                          </button>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <p className="text-[10px] text-slate-400">
                          PNG, JPG or WebP image. Transparent background recommended.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Business Legal Details */}
                  <div className="space-y-3 pt-2 border-t border-white/10">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Registered Business / Trading Name *
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Vanguard Engineering & Trades (Pty) Ltd"
                        className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          CIPC Registration No.
                        </label>
                        <input
                          type="text"
                          value={businessRegNo}
                          onChange={(e) => setBusinessRegNo(e.target.value)}
                          placeholder="e.g. 2021/849201/07"
                          className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          SARS VAT Number
                        </label>
                        <input
                          type="text"
                          value={vatNumber}
                          onChange={(e) => setVatNumber(e.target.value)}
                          placeholder="e.g. 4910283746"
                          className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Physical Business Address
                      </label>
                      <input
                        type="text"
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        placeholder="e.g. Unit 4, Gateway Industrial Park, Midrand, 1685"
                        className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Billing Email Address
                        </label>
                        <input
                          type="email"
                          value={businessEmail}
                          onChange={(e) => setBusinessEmail(e.target.value)}
                          placeholder="billing@company.co.za"
                          className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Direct Contact Phone
                        </label>
                        <input
                          type="text"
                          value={businessPhone}
                          onChange={(e) => setBusinessPhone(e.target.value)}
                          placeholder="+27 11 805 9200"
                          className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TAX & REUSABLE LINE ITEMS */}
            {activeTab === 'items' && (
              <div className="space-y-4">
                {/* Document Type & Tax Mode */}
                <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Document Type & SARS VAT Mode</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Default Document Type
                      </label>
                      <select
                        value={docType}
                        onChange={(e) => {
                          const dt = e.target.value as DocumentType;
                          setDocType(dt);
                          if (dt === DocumentType.QUOTE) {
                            setWatermarkText('OFFICIAL ESTIMATE');
                          } else {
                            setWatermarkText('ORIGINAL TAX INVOICE');
                          }
                        }}
                        className="w-full px-3 py-2 bg-[#121722] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                      >
                        <option value={DocumentType.INVOICE}>Tax Invoice (SARS Standard)</option>
                        <option value={DocumentType.QUOTE}>Official Quotation</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Tax Calculation Mode
                      </label>
                      <select
                        value={taxMode}
                        onChange={(e) => setTaxMode(e.target.value as TaxMode)}
                        className="w-full px-3 py-2 bg-[#121722] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                      >
                        <option value={TaxMode.VAT_15}>Add 15% SARS VAT (Exclusive)</option>
                        <option value={TaxMode.VAT_15_INCLUSIVE}>15% VAT Included in Price</option>
                        <option value={TaxMode.NO_VAT}>No VAT / Exempt (0%)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sample Line Items Builder */}
                <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Boilerplate Line Items ({lineItems.length})
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Item</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {lineItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-white/[0.02] border border-white/10 rounded-xl space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateLineItem(idx, 'description', e.target.value)}
                            placeholder="Description of service or materials..."
                            className="flex-1 px-2.5 py-1.5 bg-white/5 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-400"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(idx)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Remove line item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <span className="text-[10px] text-slate-400 block mb-0.5">Quantity</span>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateLineItem(idx, 'quantity', e.target.value)}
                              className="w-full px-2 py-1 bg-white/5 border border-white/15 rounded-lg text-xs text-white font-mono text-center focus:outline-none focus:border-indigo-400"
                            />
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 block mb-0.5">Unit Price (ZAR)</span>
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => handleUpdateLineItem(idx, 'unitPrice', e.target.value)}
                              className="w-full px-2 py-1 bg-white/5 border border-white/15 rounded-lg text-xs text-white font-mono text-right focus:outline-none focus:border-indigo-400"
                            />
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 block mb-0.5">Line Total</span>
                            <div className="px-2 py-1 bg-white/[0.04] border border-white/5 rounded-lg text-xs font-mono font-bold text-emerald-400 text-right">
                              R {(item.quantity * item.unitPrice).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Estimated Summary */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">Template Grand Total:</span>
                    <span className="font-mono text-emerald-400 text-sm">
                      R {grandTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: BANKING & SETTLEMENT TERMS */}
            {activeTab === 'banking' && (
              <div className="space-y-4">
                {/* SA Bank Presets */}
                <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                      <span>South African Bank Quick-Fill</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SA_BANK_PRESETS.map((bank) => (
                      <button
                        key={bank.bankName}
                        type="button"
                        onClick={() => handleSelectBankPreset(bank)}
                        className="p-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-indigo-400/50 rounded-xl text-left transition-all"
                      >
                        <span className="text-xs font-bold text-slate-200 block truncate">
                          {bank.bankName.split(' ')[0]}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          Code: {bank.branchCode}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Banking Details Box Content (EFT Settlement)
                    </label>
                    <textarea
                      rows={5}
                      value={bankingDetails}
                      onChange={(e) => setBankingDetails(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>

                {/* Footer Notes & Legal Terms */}
                <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Standard Terms, Guarantees & Footer Notes
                  </h3>
                  <textarea
                    rows={4}
                    value={footerNotes}
                    onChange={(e) => setFooterNotes(e.target.value)}
                    placeholder="Enter standard payment terms, guarantee clauses, or SARS disclaimers..."
                    className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-400"
                  />
                  <p className="text-[10px] text-slate-400">
                    These terms will automatically populate whenever this template is selected.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Live Interactive Paper Canvas */}
        <div className="flex-1 bg-[#07090e] flex flex-col overflow-hidden">
          {/* Canvas Toolbar Controls */}
          <div className="h-11 px-4 bg-[#0a0d14] border-b border-white/10 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Interactive Layout Preview</span>
              </span>

              <label className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer ml-2">
                <input
                  type="checkbox"
                  checked={showSampleClient}
                  onChange={(e) => setShowSampleClient(e.target.checked)}
                  className="rounded border-white/20 bg-white/10 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                />
                <span>Populate Sample Client</span>
              </label>
            </div>

            {/* Device & Zoom Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setViewDevice('desktop')}
                  className={`p-1 rounded text-xs transition-colors ${
                    viewDevice === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Desktop Paper Sheet View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewDevice('mobile')}
                  className={`p-1 rounded text-xs transition-colors ${
                    viewDevice === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-1 text-slate-400 text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                <button
                  type="button"
                  onClick={() => setZoomLevel(Math.max(75, zoomLevel - 15))}
                  className="hover:text-white"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <span className="font-mono text-[11px] w-10 text-center text-slate-300">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel(Math.min(130, zoomLevel + 15))}
                  className="hover:text-white"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Canvas Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-start justify-center custom-scrollbar">
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
                maxWidth: viewDevice === 'mobile' ? '420px' : '820px',
                width: '100%',
              }}
              className={`bg-white text-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 transition-all ${getFontFamilyClass()} relative`}
            >
              {/* Theme Decorative Accent Banner / Bar */}
              {themeLayout === 'BOLD' && (
                <div
                  className="w-full py-4 px-8 text-white flex items-center justify-between"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="font-extrabold tracking-widest text-sm uppercase">
                    {docType === DocumentType.INVOICE ? 'TAX INVOICE' : 'OFFICIAL QUOTATION'}
                  </span>
                  <span className="text-xs font-mono font-bold opacity-90">
                    {watermarkText}
                  </span>
                </div>
              )}

              {themeLayout !== 'BOLD' && (
                <div className="h-2 w-full" style={{ backgroundColor: primaryColor }} />
              )}

              {/* Watermark Overlay for Draft / Original */}
              {watermarkText && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none z-0">
                  <span className="text-7xl font-black rotate-[-25deg] tracking-widest uppercase">
                    {watermarkText}
                  </span>
                </div>
              )}

              {/* Printable / Viewable Document Content */}
              <div className="p-8 sm:p-10 space-y-6 relative z-10">
                {/* Header Row */}
                {headerLayout === 'SPLIT' && (
                  <div
                    className="flex flex-col sm:flex-row justify-between items-start border-b pb-6 gap-4"
                    style={{ borderColor: `${primaryColor}30` }}
                  >
                    <div className="space-y-1.5 max-w-sm">
                      <div className="flex items-center gap-3">
                        {logoUrl ? (
                          <img
                            src={logoUrl}
                            alt={businessName}
                            className="w-12 h-12 rounded-xl object-contain border border-gray-200 shadow-xs"
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-xl text-white font-bold flex items-center justify-center text-lg shadow-sm"
                            style={{ backgroundColor: primaryColor }}
                          >
                            <Building className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight leading-none">
                            {businessName || 'Your Business Name'}
                          </h1>
                          <p className="text-xs text-gray-500 font-medium mt-1">
                            {industry || 'Commercial Enterprise'}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-gray-600 space-y-0.5 pt-2">
                        {businessRegNo && (
                          <p>
                            <strong className="text-gray-700">CIPC Reg:</strong> {businessRegNo}
                          </p>
                        )}
                        {vatNumber && (
                          <p>
                            <strong className="text-gray-700">SARS VAT:</strong> {vatNumber}
                          </p>
                        )}
                        {businessAddress && <p>{businessAddress}</p>}
                        {businessEmail && <p>{businessEmail} &bull; {businessPhone}</p>}
                      </div>
                    </div>

                    <div className="text-left sm:text-right space-y-1">
                      <div
                        className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-1"
                        style={{
                          backgroundColor: `${primaryColor}15`,
                          color: primaryColor,
                          border: `1px solid ${primaryColor}40`,
                        }}
                      >
                        {docType === DocumentType.INVOICE ? 'TAX INVOICE' : 'QUOTATION'}
                      </div>
                      <h2 className="text-2xl font-black font-mono text-gray-900">
                        {docType === DocumentType.INVOICE ? 'INV' : 'QUO'}-2026-849
                      </h2>
                      <div className="text-xs text-gray-500 space-y-0.5 pt-1">
                        <p>
                          <strong className="text-gray-700">Issue Date:</strong> 22 August 2026
                        </p>
                        <p>
                          <strong className="text-gray-700">Due Date:</strong> 05 September 2026
                        </p>
                        <p className="text-[11px] font-mono text-gray-600">
                          SARS Tax Compliance Verified
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {headerLayout === 'CENTERED' && (
                  <div
                    className="text-center border-b pb-6 space-y-3"
                    style={{ borderColor: `${primaryColor}30` }}
                  >
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={businessName}
                        className="w-16 h-16 rounded-2xl object-contain border border-gray-200 mx-auto shadow-xs"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-2xl text-white font-bold flex items-center justify-center text-xl mx-auto shadow-sm"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Building className="w-8 h-8" />
                      </div>
                    )}
                    <div>
                      <h1 className="text-2xl font-black text-gray-900">
                        {businessName || 'Your Business Name'}
                      </h1>
                      <p className="text-xs text-gray-600 mt-1 max-w-md mx-auto">
                        {businessAddress} &bull; {businessPhone} &bull; {businessEmail}
                      </p>
                      <div className="text-[11px] text-gray-500 mt-1 font-mono">
                        CIPC: {businessRegNo} | VAT: {vatNumber}
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-3 pt-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: `${primaryColor}20`,
                          color: primaryColor,
                        }}
                      >
                        {docType === DocumentType.INVOICE ? 'TAX INVOICE' : 'QUOTATION'} #INV-2026-849
                      </span>
                    </div>
                  </div>
                )}

                {headerLayout === 'STACKED_LEFT' && (
                  <div
                    className="border-l-4 pl-4 py-1 border-b pb-6 flex flex-col sm:flex-row justify-between items-start gap-4"
                    style={{ borderLeftColor: primaryColor, borderColor: `${primaryColor}30` }}
                  >
                    <div>
                      <h1 className="text-xl font-extrabold text-gray-900">
                        {businessName || 'Your Business Name'}
                      </h1>
                      <p className="text-xs text-gray-600 mt-0.5">{businessAddress}</p>
                      <p className="text-xs text-gray-500 font-mono mt-1">
                        VAT: {vatNumber} &bull; CIPC: {businessRegNo}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <span
                        className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-md text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {docType === DocumentType.INVOICE ? 'TAX INVOICE' : 'QUOTATION'}
                      </span>
                      <p className="font-mono font-bold text-gray-900 text-lg mt-1">#INV-2026-849</p>
                      <p className="text-xs text-gray-500">Date: 22 Aug 2026</p>
                    </div>
                  </div>
                )}

                {/* Client Recipient Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80 text-xs">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase block mb-1">
                      Billed Recipient / Client:
                    </span>
                    {showSampleClient ? (
                      <div className="space-y-0.5 text-gray-800">
                        <strong className="text-sm font-bold text-gray-900 block">
                          Anglo American Platinum Operations (Pty) Ltd
                        </strong>
                        <p>Attn: Procurement & Facilities Division</p>
                        <p>55 Marshall Street, Johannesburg CBD, 2001</p>
                        <p>VAT Reg #: 4019283746</p>
                        <p>Email: accounts.payable@angloplat.com</p>
                      </div>
                    ) : (
                      <div className="text-gray-400 italic">
                        [Client details populated automatically from client profile]
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase block mb-1">
                      Billing & Settlement Terms:
                    </span>
                    <div className="space-y-1 text-gray-700">
                      <p>
                        <strong className="text-gray-900">Payment Due:</strong> Net 14 Days (05 Sept 2026)
                      </p>
                      <p>
                        <strong className="text-gray-900">Tax Type:</strong>{' '}
                        {taxMode === TaxMode.VAT_15
                          ? '15% SARS VAT (Exclusive)'
                          : taxMode === TaxMode.VAT_15_INCLUSIVE
                          ? '15% VAT Included'
                          : 'Zero-Rated / No VAT'}
                      </p>
                      <p>
                        <strong className="text-gray-900">Currency:</strong> South African Rand (ZAR - R)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div
                  className={`overflow-hidden rounded-2xl ${
                    tableStyle === 'GRID'
                      ? 'border border-gray-300'
                      : tableStyle === 'BORDERLESS'
                      ? ''
                      : 'border border-gray-200'
                  }`}
                >
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr
                        style={{
                          backgroundColor:
                            tableStyle === 'BORDERLESS' ? 'transparent' : `${primaryColor}15`,
                          color: tableStyle === 'BORDERLESS' ? '#111827' : primaryColor,
                          borderBottom: `2px solid ${primaryColor}40`,
                        }}
                      >
                        <th className="p-3 font-bold uppercase tracking-wider text-[11px]">
                          Item & Deliverable Description
                        </th>
                        <th className="p-3 font-bold uppercase tracking-wider text-[11px] text-center w-16">
                          Qty
                        </th>
                        <th className="p-3 font-bold uppercase tracking-wider text-[11px] text-right w-32">
                          Unit Price (R)
                        </th>
                        <th className="p-3 font-bold uppercase tracking-wider text-[11px] text-right w-32">
                          Total (R)
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y text-gray-800 ${
                        tableStyle === 'GRID' ? 'divide-gray-300' : 'divide-gray-100'
                      }`}
                    >
                      {lineItems.map((item, idx) => (
                        <tr
                          key={idx}
                          className={
                            tableStyle === 'ZEBRA' && idx % 2 === 1
                              ? 'bg-gray-50/80'
                              : 'bg-white'
                          }
                        >
                          <td className="p-3 font-medium text-gray-900">{item.description}</td>
                          <td className="p-3 text-center font-mono text-gray-600">{item.quantity}</td>
                          <td className="p-3 text-right font-mono text-gray-700">
                            R {item.unitPrice.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-gray-900">
                            R {(item.quantity * item.unitPrice).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subtotals & Grand Total Breakdown */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
                  <div className="w-full sm:max-w-xs space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                      South African EFT Banking Details:
                    </span>
                    <div
                      className="p-3 rounded-xl border font-mono text-[11px] text-gray-800 whitespace-pre-wrap leading-relaxed shadow-2xs"
                      style={{
                        backgroundColor: `${primaryColor}08`,
                        borderColor: `${primaryColor}30`,
                      }}
                    >
                      {bankingDetails || 'No banking details specified.'}
                    </div>
                  </div>

                  <div className="w-full sm:max-w-xs space-y-2">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal (Net):</span>
                        <span className="font-mono font-semibold">
                          R {subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      {taxMode !== TaxMode.NO_VAT && (
                        <div className="flex justify-between text-gray-600">
                          <span>
                            SARS VAT ({taxMode === TaxMode.VAT_15_INCLUSIVE ? '15% Incl.' : '15%'}):
                          </span>
                          <span className="font-mono font-semibold text-indigo-700">
                            R {vatAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}

                      {taxMode === TaxMode.NO_VAT && (
                        <div className="flex justify-between text-gray-500 italic">
                          <span>VAT (0% Exempt / Micro):</span>
                          <span className="font-mono">R 0.00</span>
                        </div>
                      )}

                      <div
                        className="pt-2 border-t flex justify-between text-sm font-extrabold"
                        style={{
                          borderColor: `${primaryColor}30`,
                          color: primaryColor,
                        }}
                      >
                        <span>Grand Total (ZAR):</span>
                        <span className="font-mono text-base">
                          R {grandTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Notes & Legal Disclaimers */}
                {footerNotes && (
                  <div
                    className="pt-4 border-t text-[11px] text-gray-600 space-y-1 leading-relaxed"
                    style={{ borderColor: `${primaryColor}20` }}
                  >
                    <strong className="text-gray-900 block font-bold text-xs mb-0.5">
                      Terms of Service & Settlement Notice:
                    </strong>
                    <div className="whitespace-pre-wrap">{footerNotes}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

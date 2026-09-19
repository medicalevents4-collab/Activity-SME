import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClientProfile, DocumentType, InvoiceQuote } from '../../types/schema';
import { ClientModal } from './ClientModal';
import { ClientStatementModal } from './ClientStatementModal';
import { InvoiceViewModal } from '../invoices/InvoiceViewModal';
import {
  Users2,
  Building2,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  FileCheck2,
  Receipt,
  FileText,
  Clock,
  Edit2,
  Trash2,
  MessageSquare,
  Eye,
  LayoutGrid,
  List,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';

export const ClientManager: React.FC = () => {
  const {
    clients,
    deleteClient,
    createInvoiceForClient,
    currentTenant,
    invoices,
    shareInvoiceViaWhatsApp,
    createConversation,
    setActiveConversationId,
    setActiveTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [vatFilter, setVatFilter] = useState<'ALL' | 'VAT' | 'NON_VAT'>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // Modals state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientProfile | null>(null);
  const [statementClient, setStatementClient] = useState<ClientProfile | null>(null);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<InvoiceQuote | null>(null);

  // Filter clients for current tenant
  const tenantClients = clients.filter((c) => c.tenantId === currentTenant.id);

  const filteredClients = tenantClients.filter((client) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      client.name.toLowerCase().includes(searchLower) ||
      (client.contactPerson && client.contactPerson.toLowerCase().includes(searchLower)) ||
      client.email.toLowerCase().includes(searchLower) ||
      client.phone.includes(searchQuery) ||
      (client.vatNumber && client.vatNumber.includes(searchQuery)) ||
      (client.address && client.address.toLowerCase().includes(searchLower)) ||
      (client.city && client.city.toLowerCase().includes(searchLower));

    const matchesCategory =
      selectedCategory === 'ALL' ||
      (client.category && client.category.toLowerCase() === selectedCategory.toLowerCase());

    const matchesVat =
      vatFilter === 'ALL' ||
      (vatFilter === 'VAT' ? Boolean(client.vatNumber && client.vatNumber.trim().length > 0) : !client.vatNumber || client.vatNumber.trim().length === 0);

    return matchesSearch && matchesCategory && matchesVat;
  });

  // Calculate live financial metrics per client
  const getClientFinancials = (client: ClientProfile) => {
    const matchedInvoices = invoices.filter(
      (inv) =>
        inv.tenantId === currentTenant.id &&
        (inv.clientName.toLowerCase() === client.name.toLowerCase() ||
          (inv.clientEmail && inv.clientEmail.toLowerCase() === client.email.toLowerCase()))
    );

    const totalInvoiced = matchedInvoices
      .filter((i) => i.docType === DocumentType.INVOICE)
      .reduce((sum, i) => sum + i.grandTotal, 0);

    const invoicesCount = matchedInvoices.filter((i) => i.docType === DocumentType.INVOICE).length;
    const quotesCount = matchedInvoices.filter((i) => i.docType === DocumentType.QUOTE).length;

    return { totalInvoiced, invoicesCount, quotesCount, totalDocs: matchedInvoices.length };
  };

  // Aggregated KPIs
  const totalClientsCount = tenantClients.length;
  const vatRegisteredCount = tenantClients.filter((c) => c.vatNumber && c.vatNumber.trim().length > 0).length;
  const totalBilledLifetime = tenantClients.reduce((sum, c) => {
    const fin = getClientFinancials(c);
    return sum + (fin.totalInvoiced || c.totalInvoicedZAR || 0);
  }, 0);
  const avgPaymentDays =
    tenantClients.length > 0
      ? Math.round(tenantClients.reduce((sum, c) => sum + (c.defaultPaymentDays || 14), 0) / tenantClients.length)
      : 14;

  const handleOpenAddClient = () => {
    setEditingClient(null);
    setIsClientModalOpen(true);
  };

  const handleOpenEditClient = (client: ClientProfile) => {
    setEditingClient(client);
    setIsClientModalOpen(true);
  };

  const handleStartWhatsApp = (client: ClientProfile) => {
    createConversation(client.phone, client.name);
    setActiveTab('whatsapp');
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              Client & Enterprise Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {tenantClients.length} Profiles
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Store client contacts, SARS VAT numbers, and physical billing addresses for 1-click tax invoice generation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="add-client-btn"
            onClick={handleOpenAddClient}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Client</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card glass-card-hover p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Clients</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-slate-100 mt-1">
            {totalClientsCount}
          </p>
          <span className="text-[10px] text-slate-500">Stored for instant invoice autofill</span>
        </div>

        <div className="glass-card glass-card-hover p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">SARS 15% VAT Vendors</span>
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-1">
            {vatRegisteredCount}
          </p>
          <span className="text-[10px] text-emerald-500/80">Valid 10-digit VAT registered entities</span>
        </div>

        <div className="glass-card glass-card-hover p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-amber-300">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Billed Volume</span>
            <Receipt className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-amber-300 mt-1">
            R {totalBilledLifetime.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-amber-500/80">Across all generated documents</span>
        </div>

        <div className="glass-card glass-card-hover p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-indigo-300">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg. Payment Terms</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-indigo-300 mt-1">
            {avgPaymentDays} <span className="text-xs font-normal text-slate-400">Days</span>
          </p>
          <span className="text-[10px] text-indigo-400/80">Default credit terms for tenant</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client, contact, VAT #, email, address..."
              className="w-full pl-9 pr-3 py-1.5 text-xs glass-input rounded-xl focus:outline-none"
            />
          </div>

          {/* Filter pills & View mode toggle */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 flex-wrap">
            {/* VAT Filter */}
            <div className="flex bg-white/[0.04] border border-white/10 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setVatFilter('ALL')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  vatFilter === 'ALL'
                    ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Tax Statuses
              </button>
              <button
                onClick={() => setVatFilter('VAT')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  vatFilter === 'VAT'
                    ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                VAT Registered ({vatRegisteredCount})
              </button>
              <button
                onClick={() => setVatFilter('NON_VAT')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  vatFilter === 'NON_VAT'
                    ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Non-VAT ({totalClientsCount - vatRegisteredCount})
              </button>
            </div>

            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs glass-input rounded-xl px-3 py-1.5 font-medium text-slate-200 focus:outline-none"
            >
              <option value="ALL" className="bg-slate-900 text-slate-100">
                All Categories
              </option>
              <option value="Commercial" className="bg-slate-900 text-slate-100">
                Commercial
              </option>
              <option value="Enterprise" className="bg-slate-900 text-slate-100">
                Enterprise
              </option>
              <option value="SME" className="bg-slate-900 text-slate-100">
                SME
              </option>
              <option value="Retail" className="bg-slate-900 text-slate-100">
                Retail
              </option>
              <option value="Government" className="bg-slate-900 text-slate-100">
                Government
              </option>
              <option value="Individual" className="bg-slate-900 text-slate-100">
                Individual
              </option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex bg-white/[0.04] border border-white/10 p-1 rounded-xl text-xs">
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'GRID' ? 'bg-white/15 text-slate-100' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'TABLE' ? 'bg-white/15 text-slate-100' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Table List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredClients.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">No clients match your criteria</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Add your corporate clients, SMME customers, and retail accounts to effortlessly generate 15% VAT tax invoices and official estimates.
            </p>
          </div>
          <button
            onClick={handleOpenAddClient}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-500/20 transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Client Profile</span>
          </button>
        </div>
      ) : viewMode === 'GRID' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const financials = getClientFinancials(client);
            return (
              <div
                key={client.id}
                className="glass-card glass-card-hover rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 border border-white/10 relative group"
              >
                {/* Card Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {client.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-100 truncate group-hover:text-indigo-300 transition-colors">
                          {client.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 truncate">
                          {client.contactPerson ? client.contactPerson : 'Accounts Department'}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/10 flex-shrink-0">
                      {client.category || 'Client'}
                    </span>
                  </div>

                  {/* VAT Status Badge */}
                  <div className="flex items-center gap-1.5 flex-wrap my-2.5">
                    {client.vatNumber ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <FileCheck2 className="w-3 h-3 text-emerald-400" />
                        <span>SARS VAT: {client.vatNumber}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 border border-white/10">
                        <span>Non-VAT / Exempt</span>
                      </span>
                    )}

                    <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/5 font-mono">
                      Net {client.defaultPaymentDays} Days
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] truncate">
                      <Mail className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="font-mono text-emerald-300">{client.phone}</span>
                    </div>

                    {client.address && (
                      <div className="flex items-start gap-2 text-slate-400 text-[11px] pt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2 text-slate-300 leading-snug">
                          {client.address}
                          {client.city ? `, ${client.city}` : ''}
                          {client.postalCode ? ` ${client.postalCode}` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Financials Footer & 1-Click Action Buttons */}
                <div className="pt-3 border-t border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Total Billed</span>
                      <span className="font-mono font-bold text-emerald-400 text-xs">
                        R {financials.totalInvoiced.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <button
                      onClick={() => setStatementClient(client)}
                      className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                      title="View Client Invoices & History"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{financials.totalDocs} Docs</span>
                    </button>
                  </div>

                  {/* 1-Click Invoice & Quote Generation Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => createInvoiceForClient(client, DocumentType.QUOTE)}
                      className="px-2.5 py-1.5 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.1] text-[11px] font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                      title="Create Quote pre-filled with client info"
                    >
                      <FileText className="w-3 h-3 text-slate-400" />
                      <span>New Quote</span>
                    </button>

                    <button
                      onClick={() => createInvoiceForClient(client, DocumentType.INVOICE)}
                      className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-sm shadow-indigo-500/20 flex items-center justify-center gap-1.5 transition-all"
                      title="Create Tax Invoice pre-filled with client info"
                    >
                      <Plus className="w-3 h-3" />
                      <span>New Invoice</span>
                    </button>
                  </div>

                  {/* Sub-actions toolbar (WhatsApp, Edit, Delete) */}
                  <div className="flex items-center justify-between pt-1 text-slate-400 text-xs">
                    <button
                      onClick={() => handleStartWhatsApp(client)}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditClient(client)}
                        className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-white/10 rounded-lg transition-colors"
                        title="Edit Client"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${client.name}?`)) {
                            deleteClient(client.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete Client"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="glass-card rounded-3xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] text-slate-400 font-semibold border-b border-white/[0.08]">
                <tr>
                  <th className="p-3.5 pl-4">Client / Enterprise</th>
                  <th className="p-3.5">Contact Person</th>
                  <th className="p-3.5">Physical Address & Location</th>
                  <th className="p-3.5">SARS VAT Number</th>
                  <th className="p-3.5">Payment Terms</th>
                  <th className="p-3.5 text-right">Total Billed</th>
                  <th className="p-3.5 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredClients.map((client) => {
                  const financials = getClientFinancials(client);
                  return (
                    <tr key={client.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-100 block">{client.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{client.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-medium text-slate-200 block">
                          {client.contactPerson || '-'}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono">{client.phone}</span>
                      </td>

                      <td className="p-3.5 max-w-xs truncate">
                        <span className="text-slate-300 truncate block">
                          {client.address || 'No physical address'}
                        </span>
                        {client.city && (
                          <span className="text-[10px] text-slate-400">
                            {client.city}, {client.province || 'Gauteng'}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        {client.vatNumber ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <FileCheck2 className="w-3 h-3" />
                            <span>{client.vatNumber}</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Non-VAT Entity</span>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-300 font-mono">
                        Net {client.defaultPaymentDays} Days
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                        R {financials.totalInvoiced.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="p-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => createInvoiceForClient(client, DocumentType.INVOICE)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm"
                            title="Create Tax Invoice"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Invoice</span>
                          </button>

                          <button
                            onClick={() => setStatementClient(client)}
                            className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-white/10 rounded-lg transition-colors"
                            title="View Statement & History"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleStartWhatsApp(client)}
                            className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="WhatsApp Chat"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEditClient(client)}
                            className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-white/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Delete ${client.name}?`)) {
                                deleteClient(client.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {isClientModalOpen && (
        <ClientModal
          isOpen={isClientModalOpen}
          initialClient={editingClient}
          onClose={() => {
            setIsClientModalOpen(false);
            setEditingClient(null);
          }}
        />
      )}

      {/* Client Statement / History Modal */}
      {statementClient && (
        <ClientStatementModal
          isOpen={Boolean(statementClient)}
          client={statementClient}
          onClose={() => setStatementClient(null)}
          onNewInvoiceForClient={(c) => createInvoiceForClient(c, DocumentType.INVOICE)}
          onNewQuoteForClient={(c) => createInvoiceForClient(c, DocumentType.QUOTE)}
          onViewInvoice={(inv) => setSelectedInvoiceForView(inv)}
        />
      )}

      {/* Invoice View Modal */}
      {selectedInvoiceForView && (
        <InvoiceViewModal
          invoice={selectedInvoiceForView}
          onClose={() => setSelectedInvoiceForView(null)}
        />
      )}
    </div>
  );
};

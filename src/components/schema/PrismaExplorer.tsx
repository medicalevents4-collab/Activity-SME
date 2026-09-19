import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Database,
  Key,
  Link,
} from 'lucide-react';

export const PrismaExplorer: React.FC = () => {
  const { tenants, users, subscriptions, invoices, prebuiltTemplates, clients, files, conversations } = useApp();

  const [selectedModel, setSelectedModel] = useState<string>('InvoiceQuote');

  const models = [
    {
      name: 'Tenant',
      description: 'Multi-tenant SMME organization entity with custom slug, logo branding, VAT registration, and banking details.',
      count: tenants.length,
      fields: [
        { name: 'id', type: 'String', isPk: true, isRel: false, default: 'uuid()' },
        { name: 'name', type: 'String', isPk: false, isRel: false },
        { name: 'slug', type: 'String', isPk: false, isRel: false, isUnique: true },
        { name: 'logoUrl', type: 'String?', isPk: false, isRel: false },
        { name: 'primaryColor', type: 'String', isPk: false, isRel: false, default: '"#D97706"' },
        { name: 'vatNumber', type: 'String?', isPk: false, isRel: false },
        { name: 'bankName', type: 'String?', isPk: false, isRel: false },
        { name: 'accountNumber', type: 'String?', isPk: false, isRel: false },
        { name: 'branchCode', type: 'String?', isPk: false, isRel: false },
        { name: 'createdAt', type: 'DateTime', isPk: false, isRel: false, default: 'now()' },
        { name: 'users', type: 'User[]', isPk: false, isRel: true },
        { name: 'subscriptions', type: 'Subscription[]', isPk: false, isRel: true },
        { name: 'invoices', type: 'InvoiceQuote[]', isPk: false, isRel: true },
        { name: 'clients', type: 'Client[]', isPk: false, isRel: true },
        { name: 'files', type: 'FileStorage[]', isPk: false, isRel: true },
        { name: 'conversations', type: 'WhatsAppConversation[]', isPk: false, isRel: true },
      ],
    },
    {
      name: 'Subscription',
      description: 'Monthly SaaS billing tier (STARTER, GROWTH, SCALE_PRO, ENTERPRISE) with document limits & renewal cycles.',
      count: subscriptions.length,
      fields: [
        { name: 'id', type: 'String', isPk: true, isRel: false, default: 'uuid()' },
        { name: 'tenantId', type: 'String', isPk: false, isRel: false, isFk: true },
        { name: 'tier', type: 'SubscriptionTier (Enum)', isPk: false, isRel: false, default: 'GROWTH' },
        { name: 'status', type: 'String', isPk: false, isRel: false, default: '"ACTIVE"' },
        { name: 'monthlyPriceZAR', type: 'Decimal(10,2)', isPk: false, isRel: false },
        { name: 'monthlyInvoiceLimit', type: 'Int', isPk: false, isRel: false },
        { name: 'invoicesUsedThisMonth', type: 'Int', isPk: false, isRel: false, default: '0' },
        { name: 'currentPeriodStart', type: 'DateTime', isPk: false, isRel: false },
        { name: 'currentPeriodEnd', type: 'DateTime', isPk: false, isRel: false },
        { name: 'tenant', type: 'Tenant', isPk: false, isRel: true, relDef: 'references: [id], onDelete: Cascade' },
      ],
    },
    {
      name: 'InvoiceQuote',
      description: 'Tax invoices and quotations with SARS 15% Exclusive, 15% Inclusive, or Zero-Rated VAT treatments.',
      count: invoices.length,
      fields: [
        { name: 'id', type: 'String', isPk: true, isRel: false, default: 'uuid()' },
        { name: 'tenantId', type: 'String', isPk: false, isRel: false, isFk: true },
        { name: 'userId', type: 'String', isPk: false, isRel: false, isFk: true },
        { name: 'docType', type: 'DocumentType (QUOTE | INVOICE)', isPk: false, isRel: false, default: 'INVOICE' },
        { name: 'documentNumber', type: 'String', isPk: false, isRel: false, isUnique: true },
        { name: 'logoUrl', type: 'String?', isPk: false, isRel: false },
        { name: 'primaryColor', type: 'String', isPk: false, isRel: false, default: '"#D97706"' },
        { name: 'businessName', type: 'String', isPk: false, isRel: false },
        { name: 'businessRegNo', type: 'String?', isPk: false, isRel: false },
        { name: 'vatNumber', type: 'String?', isPk: false, isRel: false },
        { name: 'clientName', type: 'String', isPk: false, isRel: false },
        { name: 'clientEmail', type: 'String?', isPk: false, isRel: false },
        { name: 'clientVatNo', type: 'String?', isPk: false, isRel: false },
        { name: 'taxMode', type: 'TaxMode (VAT_15 | VAT_15_INCLUSIVE | NO_VAT)', isPk: false, isRel: false, default: 'VAT_15' },
        { name: 'vatRate', type: 'Float', isPk: false, isRel: false, default: '0.15' },
        { name: 'subtotal', type: 'Decimal(12,2)', isPk: false, isRel: false },
        { name: 'vatAmount', type: 'Decimal(12,2)', isPk: false, isRel: false },
        { name: 'grandTotal', type: 'Decimal(12,2)', isPk: false, isRel: false },
        { name: 'status', type: 'InvoiceStatus (Enum)', isPk: false, isRel: false, default: 'DRAFT' },
        { name: 'lineItems', type: 'InvoiceItem[]', isPk: false, isRel: true },
      ],
    },
    {
      name: 'InvoiceItem',
      description: 'Individual product or service line items with quantity, unit price, and line totals.',
      count: invoices.reduce((acc, i) => acc + i.lineItems.length, 0),
      fields: [
        { name: 'id', type: 'String', isPk: true, isRel: false, default: 'uuid()' },
        { name: 'invoiceQuoteId', type: 'String', isPk: false, isRel: false, isFk: true },
        { name: 'description', type: 'String', isPk: false, isRel: false },
        { name: 'quantity', type: 'Int', isPk: false, isRel: false, default: '1' },
        { name: 'unitPrice', type: 'Decimal(12,2)', isPk: false, isRel: false },
        { name: 'lineTotal', type: 'Decimal(12,2)', isPk: false, isRel: false },
        { name: 'invoiceQuote', type: 'InvoiceQuote', isPk: false, isRel: true, relDef: 'references: [id], onDelete: Cascade' },
      ],
    },
    {
      name: 'PrebuiltTemplate',
      description: 'Curated SMME industry quote and invoice templates (Solar, IT, Construction, Logistics, etc.).',
      count: prebuiltTemplates.length,
      fields: [
        { name: 'id', type: 'String', isPk: true, isRel: false, default: 'uuid()' },
        { name: 'name', type: 'String', isPk: false, isRel: false },
        { name: 'industry', type: 'String', isPk: false, isRel: false },
        { name: 'defaultDocType', type: 'DocumentType', isPk: false, isRel: false },
        { name: 'defaultTaxMode', type: 'TaxMode', isPk: false, isRel: false },
        { name: 'primaryColor', type: 'String', isPk: false, isRel: false },
        { name: 'badge', type: 'String', isPk: false, isRel: false },
      ],
    },
    {
      name: 'Client',
      description: 'Customer contact directory with company registration, SARS VAT number, and banking records.',
      count: clients.length,
      fields: [
        { name: 'id', type: 'String', isPk: true, isRel: false, default: 'uuid()' },
        { name: 'tenantId', type: 'String', isPk: false, isRel: false, isFk: true },
        { name: 'name', type: 'String', isPk: false, isRel: false },
        { name: 'companyName', type: 'String?', isPk: false, isRel: false },
        { name: 'email', type: 'String', isPk: false, isRel: false },
        { name: 'phone', type: 'String', isPk: false, isRel: false },
        { name: 'vatNumber', type: 'String?', isPk: false, isRel: false },
        { name: 'tenant', type: 'Tenant', isPk: false, isRel: true, relDef: 'references: [id], onDelete: Cascade' },
      ],
    },
    {
      name: 'User',
      description: 'RBAC identity with SUPER_ADMIN, TENANT_ADMIN, STAFF, and MEMBER roles.',
      count: users.length,
      fields: [
        { name: 'id', type: 'String', isPk: true, isRel: false, default: 'uuid()' },
        { name: 'tenantId', type: 'String', isPk: false, isRel: false, isFk: true },
        { name: 'email', type: 'String', isPk: false, isRel: false, isUnique: true },
        { name: 'passwordHash', type: 'String', isPk: false, isRel: false },
        { name: 'fullName', type: 'String', isPk: false, isRel: false },
        { name: 'role', type: 'Role (Enum)', isPk: false, isRel: false, default: 'STAFF' },
        { name: 'tenant', type: 'Tenant', isPk: false, isRel: true, relDef: 'references: [id], onDelete: Cascade' },
        { name: 'invoices', type: 'InvoiceQuote[]', isPk: false, isRel: true },
      ],
    },
    {
      name: 'WhatsAppConversation',
      description: 'Omnichannel customer messaging thread identified by client phone number.',
      count: conversations.length,
      fields: [
        { name: 'id', type: 'String', isPk: true, isRel: false, default: 'uuid()' },
        { name: 'tenantId', type: 'String', isPk: false, isRel: false, isFk: true },
        { name: 'phoneNumber', type: 'String', isPk: false, isRel: false, isUnique: true },
        { name: 'clientName', type: 'String?', isPk: false, isRel: false },
        { name: 'messages', type: 'Message[]', isPk: false, isRel: true },
        { name: 'tenant', type: 'Tenant', isPk: false, isRel: true, relDef: 'references: [id], onDelete: Cascade' },
      ],
    },
    {
      name: 'FileStorage',
      description: 'S3 cloud storage metadata representing uploaded invoices, receipts, and client contracts.',
      count: files.length,
      fields: [
        { name: 'id', type: 'String', isPk: true, isRel: false, default: 'uuid()' },
        { name: 'tenantId', type: 'String', isPk: false, isRel: false, isFk: true },
        { name: 'userId', type: 'String', isPk: false, isRel: false, isFk: true },
        { name: 'fileName', type: 'String', isPk: false, isRel: false },
        { name: 'fileSize', type: 'Int', isPk: false, isRel: false },
        { name: 'mimeType', type: 'String', isPk: false, isRel: false },
        { name: 's3Key', type: 'String', isPk: false, isRel: false },
        { name: 's3Url', type: 'String', isPk: false, isRel: false },
        { name: 'tenant', type: 'Tenant', isPk: false, isRel: true, relDef: 'references: [id], onDelete: Cascade' },
      ],
    },
  ];

  const currentActiveModel = models.find((m) => m.name === selectedModel) || models[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Prisma Schema & Relational Database Architecture
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            PostgreSQL relational entities, foreign keys, cascades, and South African SARS 15% VAT field definitions.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3.5 py-2 rounded-2xl text-xs font-mono font-bold shadow-sm">
          <Database className="w-4 h-4 text-indigo-400" />
          <span>PostgreSQL + Prisma ORM</span>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {models.map((m) => {
          const isSelected = m.name === selectedModel;
          return (
            <button
              key={m.name}
              onClick={() => setSelectedModel(m.name)}
              className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                isSelected
                  ? 'glass-card border-indigo-500/60 bg-indigo-950/40 shadow-indigo-500/10 shadow-lg ring-1 ring-indigo-500/30'
                  : 'glass-card border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-100">{m.name}</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/10">
                  {m.count}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block font-mono">
                {m.fields.length} columns
              </span>
            </button>
          );
        })}
      </div>

      {/* Detailed Selected Model Inspector */}
      <div className="glass-card rounded-3xl overflow-hidden shadow-xl border border-white/10">
        <div className="p-4 bg-white/[0.02] border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-sm text-indigo-300">
                model {currentActiveModel.name}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full font-mono">
                {currentActiveModel.count} active records in memory
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{currentActiveModel.description}</p>
          </div>
          <span className="text-xs text-slate-500 font-mono">Prisma v5.2 Schema</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.01] text-slate-400 border-b border-white/[0.08] uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="p-3.5 pl-4">Field Name</th>
                <th className="p-3.5">Data Type / Enum</th>
                <th className="p-3.5">Attributes</th>
                <th className="p-3.5">Default Value</th>
                <th className="p-3.5 pr-4">Relational Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-mono">
              {currentActiveModel.fields.map((f) => (
                <tr key={f.name} className="hover:bg-white/[0.03] transition-colors">
                  <td className="p-3.5 pl-4 font-bold text-slate-100 flex items-center gap-2">
                    {f.isPk && <Key className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                    {f.isFk && <Link className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />}
                    <span>{f.name}</span>
                  </td>
                  <td className="p-3.5 text-emerald-400 font-semibold">{f.type}</td>
                  <td className="p-3.5 text-slate-300">
                    {f.isPk ? (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                        @id (Primary Key)
                      </span>
                    ) : f.isUnique ? (
                      <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                        @unique
                      </span>
                    ) : f.isFk ? (
                      <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                        Foreign Key
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="p-3.5 text-slate-400">{f.default ? `@default(${f.default})` : '—'}</td>
                  <td className="p-3.5 pr-4 text-xs font-sans text-slate-300">
                    {f.relDef ? (
                      <span className="font-mono text-[11px] text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-lg">
                        @relation({f.relDef})
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

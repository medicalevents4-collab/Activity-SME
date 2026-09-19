import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PrebuiltTemplate, DocumentType, TaxMode } from '../../types/schema';
import { TemplateEditor } from './TemplateEditor';
import {
  FileCode,
  Sparkles,
  Receipt,
  Plus,
  Eye,
  Check,
  Building,
  Briefcase,
  Wrench,
  ShoppingBag,
  Cpu,
  Car,
  Tag,
  ArrowRight,
  Palette,
  Edit3,
  Copy,
  Trash2,
  Layers,
  Sliders,
} from 'lucide-react';

export const TemplatesManager: React.FC = () => {
  const {
    prebuiltTemplates,
    applyTemplateToNewInvoice,
    currentTenant,
    deleteTemplate,
    duplicateTemplate,
    openTemplateEditor,
    isTemplateEditorOpen,
    setIsTemplateEditorOpen,
    templateToEdit,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [previewTemplate, setPreviewTemplate] = useState<PrebuiltTemplate | null>(null);

  const categories = [
    { id: 'ALL', label: 'All Templates' },
    { id: 'CUSTOM', label: 'My Custom Templates', isSpecial: true },
    { id: 'Construction & Plumbing', label: 'Trades & Contracting', icon: Wrench },
    { id: 'Professional Services', label: 'Consulting & Legal', icon: Briefcase },
    { id: 'Creative & Tech', label: 'Digital Agency & Tech', icon: Cpu },
    { id: 'Retail & Distribution', label: 'Wholesale & Retail', icon: ShoppingBag },
    { id: 'Auto & Maintenance', label: 'Automotive & Fleet', icon: Car },
    { id: 'Small Business / Freelance', label: 'Micro Enterprise (No VAT)', icon: Tag },
  ];

  const filteredTemplates = prebuiltTemplates.filter((t) => {
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'CUSTOM') return Boolean(t.isCustom);
    return t.industry === selectedCategory;
  });

  const customTemplatesCount = prebuiltTemplates.filter((t) => t.isCustom).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400">
                <Palette className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
                SMME Invoicing & Quotation Templates
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Design, customize, and manage reusable invoice layouts with custom branding, themes, curated South African color schemes, and SARS 15% VAT settlement formulas.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => openTemplateEditor(null)}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Design Custom Template</span>
            </button>
          </div>
        </div>

        {/* Category & Industry Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-6 border-t border-white/[0.08] pt-6">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-indigo-500/20 shadow-md'
                    : cat.isSpecial && customTemplatesCount > 0
                    ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
                    : 'bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200 border border-white/5'
                }`}
              >
                {cat.isSpecial && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                <span>{cat.label}</span>
                {cat.isSpecial && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-white/20">
                    {customTemplatesCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="glass-card rounded-3xl p-12 text-center border border-white/10 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Palette className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-200">No templates found in this category</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create your own custom reusable template with business logos, themes, and line item presets.
            </p>
          </div>
          <button
            onClick={() => openTemplateEditor(null)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Custom Template</span>
          </button>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const sampleTotal = template.sampleLineItems.reduce(
            (acc, item) => acc + item.quantity * item.unitPrice,
            0
          );
          const vatMultiplier = template.defaultTaxMode === TaxMode.VAT_15 ? 0.15 : 0;
          const vatAmount = sampleTotal * vatMultiplier;
          const grandTotal = sampleTotal + vatAmount;

          return (
            <div
              key={template.id}
              className="glass-card rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: template.primaryColor || '#D97706' }}
              />

              <div>
                {/* Header Tag & Badges */}
                <div className="flex items-center justify-between mb-3 mt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${template.primaryColor || '#D97706'}25`,
                        color: template.primaryColor || '#D97706',
                        border: `1px solid ${template.primaryColor || '#D97706'}40`,
                      }}
                    >
                      {template.badge}
                    </span>

                    {template.isCustom && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Custom</span>
                      </span>
                    )}

                    {template.themeLayout && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400">
                        {template.themeLayout}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    {template.docType === DocumentType.INVOICE ? 'TAX INVOICE' : 'QUOTATION'}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-white transition-colors">
                    {template.name}
                  </h3>
                  <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                    {template.industry}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {template.description}
                </p>

                {/* Sample Line Items Preview */}
                <div className="mt-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Sample Line Items ({template.sampleLineItems.length})</span>
                    <span className="text-emerald-400 font-mono">
                      {template.defaultTaxMode === TaxMode.VAT_15
                        ? '15% VAT'
                        : template.defaultTaxMode === TaxMode.VAT_15_INCLUSIVE
                        ? '15% Incl.'
                        : 'No VAT (0%)'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {template.sampleLineItems.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs text-slate-300">
                        <span className="truncate max-w-[180px] text-[11px]">{item.description}</span>
                        <span className="font-mono text-[11px] font-semibold text-slate-200">
                          R {(item.quantity * item.unitPrice).toLocaleString('en-ZA')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">Estimated Total:</span>
                    <span className="font-mono text-emerald-400 text-sm">
                      R {grandTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-5 mt-5 border-t border-white/[0.08] space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewTemplate(template)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 border border-white/10 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => openTemplateEditor(template)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-colors flex items-center justify-center gap-1.5"
                    title="Customize this template in the Template Editor"
                  >
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Customize</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => applyTemplateToNewInvoice(template)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white shadow-sm transition-all flex items-center justify-center gap-1.5 hover:opacity-90"
                    style={{ backgroundColor: template.primaryColor || '#D97706' }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Use Template</span>
                  </button>

                  {template.isCustom && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => duplicateTemplate(template.id)}
                        className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl transition-colors"
                        title="Duplicate template"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete custom template "${template.name}"?`)) {
                            deleteTemplate(template.id);
                          }
                        }}
                        className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-xl transition-colors"
                        title="Delete template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-modal rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-white/15 animate-in fade-in zoom-in duration-150 text-slate-100 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-base"
                  style={{ backgroundColor: previewTemplate.primaryColor || '#D97706' }}
                >
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{previewTemplate.name}</h3>
                  <p className="text-xs text-slate-400">{previewTemplate.industry}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Template Body */}
            <div className="py-4 space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">{previewTemplate.description}</p>

              {/* Line items table */}
              <div className="border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.04] text-slate-400 text-[11px] uppercase">
                    <tr>
                      <th className="p-3">Line Item Description</th>
                      <th className="p-3 w-16 text-center">Qty</th>
                      <th className="p-3 w-28 text-right">Unit Price</th>
                      <th className="p-3 w-28 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200">
                    {previewTemplate.sampleLineItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3">{item.description}</td>
                        <td className="p-3 text-center font-mono">{item.quantity}</td>
                        <td className="p-3 text-right font-mono">
                          R {item.unitPrice.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-right font-mono font-semibold">
                          R {(item.quantity * item.unitPrice).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Banking & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-white/[0.02] rounded-xl border border-white/5">
                  <div className="text-[11px] font-bold text-slate-400 mb-1 uppercase">
                    South African Banking Template
                  </div>
                  <pre className="font-mono text-[10px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {previewTemplate.bankingDetails}
                  </pre>
                </div>
                <div className="p-3.5 bg-white/[0.02] rounded-xl border border-white/5">
                  <div className="text-[11px] font-bold text-slate-400 mb-1 uppercase">
                    Standard Terms & Payment Notes
                  </div>
                  <p className="text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {previewTemplate.footerNotes}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setPreviewTemplate(null);
                    openTemplateEditor(previewTemplate);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Customize in Studio</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    applyTemplateToNewInvoice(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center gap-2 hover:opacity-90"
                  style={{ backgroundColor: previewTemplate.primaryColor || '#D97706' }}
                >
                  <span>Use This Template Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Customizer Studio Modal */}
      {isTemplateEditorOpen && (
        <TemplateEditor
          isOpen={isTemplateEditorOpen}
          initialTemplate={templateToEdit}
          onClose={() => setIsTemplateEditorOpen(false)}
        />
      )}
    </div>
  );
};

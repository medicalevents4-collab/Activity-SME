import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  ReceiptText,
  Sparkles,
  Calculator,
  Crown,
  MessageSquareCode,
  FolderArchive,
  Database,
  Users2,
  Building2,
  FileCheck2,
  Briefcase,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    invoices,
    prebuiltTemplates,
    conversations,
    files,
    currentSubscription,
    clients,
    currentTenant,
  } = useApp();

  const tenantClients = clients.filter((c) => c.tenantId === currentTenant.id);

  const navItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      description: 'Daily Business Overview',
    },
    {
      id: 'invoices',
      label: 'Quotes & Invoices',
      icon: ReceiptText,
      badge: invoices.length,
      description: 'SARS 15% VAT Engine',
    },
    {
      id: 'clients',
      label: 'Client Directory',
      icon: Users2,
      badge: tenantClients.length,
      description: 'Clients, VAT & Addresses',
    },
    {
      id: 'templates',
      label: 'Prebuilt Templates',
      icon: Sparkles,
      badge: prebuiltTemplates.length,
      description: 'Industry Quoting Presets',
    },
    {
      id: 'calculator',
      label: 'Pricing Calculator',
      icon: Calculator,
      badge: '15% VAT',
      description: 'Automated Pricing & Taxes',
    },
    {
      id: 'subscriptions',
      label: 'Monthly Plans',
      icon: Crown,
      badge: currentSubscription?.tier || 'GROWTH',
      description: 'SaaS Subscriptions & Tiers',
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp CRM',
      icon: MessageSquareCode,
      badge: conversations.length,
      description: 'Live Chat & Automated Bot',
    },
    {
      id: 'files',
      label: 'S3 File Vault',
      icon: FolderArchive,
      badge: files.length,
      description: 'Encrypted Cloud Storage',
    },
    {
      id: 'tenants',
      label: 'Tenant & Roles',
      icon: Building2,
      badge: null,
      description: 'Multi-Tenant & RBAC',
    },
    {
      id: 'schema',
      label: 'Database Schema',
      icon: Database,
      badge: 'v5.2',
      description: 'Schema & ERD Architecture',
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-950/40 backdrop-blur-xl border-r border-white/[0.08] flex-shrink-0 flex flex-col justify-between p-4">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          SMME Operations
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/40 shadow-indigo-500/10 shadow-sm font-semibold'
                    : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'
                    }`}
                  />
                  <div className="truncate">
                    <span className="text-xs truncate block">{item.label}</span>
                    {item.description && (
                      <span className="text-[10px] text-slate-500 group-hover:text-slate-400 block truncate font-normal">
                        {item.description}
                      </span>
                    )}
                  </div>
                </div>
                {item.badge !== null && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 border ${
                      isActive
                        ? 'bg-indigo-500/30 text-indigo-200 border-indigo-400/40'
                        : 'bg-white/[0.06] text-slate-400 border-white/10'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer info box */}
      <div className="pt-4 mt-6 border-t border-white/[0.08]">
        <div className="p-3.5 glass-card rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>SARS 15% VAT Ready</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            South African tax invoices, instant quotes, automated VAT calculators & WhatsApp integration for SMMEs.
          </p>
        </div>
      </div>
    </aside>
  );
};

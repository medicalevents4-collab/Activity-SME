import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Role, SubscriptionTier } from '../../types/schema';
import {
  Building2,
  Users2,
  Crown,
  Shield,
  CheckCircle,
  Plus,
  ArrowUpRight,
  UserCheck,
  Palette,
  CreditCard,
  Building,
  Image as ImageIcon,
  Save,
  Check,
} from 'lucide-react';

export const TenantManager: React.FC = () => {
  const {
    tenants,
    currentTenant,
    setCurrentTenantId,
    updateTenantBranding,
    users,
    subscriptions,
    currentSubscription,
    upgradeSubscription,
    currentUser,
    setActiveTab,
  } = useApp();

  const [activeTabSub, setActiveTabSub] = useState<'tenants' | 'branding' | 'users' | 'billing'>('tenants');

  // Tenant Branding state
  const [brandingForm, setBrandingForm] = useState({
    name: currentTenant.name,
    slug: currentTenant.slug,
    logoUrl: currentTenant.logoUrl || '',
    primaryColor: currentTenant.primaryColor || '#D97706',
    vatNumber: currentTenant.vatNumber || '',
    businessAddress: currentTenant.businessAddress || '',
    bankName: currentTenant.bankName || '',
    accountNumber: currentTenant.accountNumber || '',
    branchCode: currentTenant.branchCode || '',
    supportEmail: currentTenant.supportEmail || '',
    supportPhone: currentTenant.supportPhone || '',
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  const tenantUsers = users.filter((u) => u.tenantId === currentTenant.id || u.role === Role.SUPER_ADMIN);

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case Role.SUPER_ADMIN:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case Role.TENANT_ADMIN:
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case Role.STAFF:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case Role.MEMBER:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantBranding(currentTenant.id, brandingForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            SMME Tenant & Business Identity
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Multi-tenant switching, custom logo & business branding, RBAC user directory, and SaaS subscriptions.
          </p>
        </div>

        <div className="flex bg-white/[0.04] p-1.5 rounded-2xl border border-white/10 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTabSub('tenants')}
            className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
              activeTabSub === 'tenants'
                ? 'bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SMME Accounts ({tenants.length})
          </button>
          <button
            onClick={() => setActiveTabSub('branding')}
            className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
              activeTabSub === 'branding'
                ? 'bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Business Branding & Info
          </button>
          <button
            onClick={() => setActiveTabSub('users')}
            className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
              activeTabSub === 'users'
                ? 'bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Team Members ({tenantUsers.length})
          </button>
          <button
            onClick={() => setActiveTabSub('billing')}
            className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
              activeTabSub === 'billing'
                ? 'bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Subscription Plans
          </button>
        </div>
      </div>

      {/* Tenants List Tab */}
      {activeTabSub === 'tenants' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tenants.map((t) => {
            const isCurrent = t.id === currentTenant.id;
            const sub = subscriptions.find((s) => s.tenantId === t.id);

            return (
              <div
                key={t.id}
                className={`glass-card p-6 rounded-3xl transition-all flex flex-col justify-between ${
                  isCurrent ? 'border-indigo-500/50 bg-indigo-950/20 shadow-indigo-500/10 shadow-xl' : 'hover:border-white/20'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-md"
                      style={{ backgroundColor: t.primaryColor || '#D97706' }}
                    >
                      {t.name.substring(0, 2).toUpperCase()}
                    </div>
                    {isCurrent ? (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Active SMME</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setCurrentTenantId(t.id)}
                        className="text-xs text-indigo-400 font-bold hover:underline"
                      >
                        Switch To →
                      </button>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-100">{t.name}</h3>
                    <p className="text-xs font-mono text-indigo-300 font-semibold mt-0.5">
                      Slug: @{t.slug}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 bg-white/[0.02] p-3.5 rounded-2xl border border-white/[0.06]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Monthly Plan:</span>
                      <span className="font-bold text-slate-100">{sub?.tier || 'GROWTH'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="text-emerald-400 font-semibold">{sub?.status || 'ACTIVE'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">SARS VAT Number:</span>
                      <span className="font-mono text-slate-200">{t.vatNumber || '4990192837'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Primary Color:</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full inline-block border border-white/20"
                          style={{ backgroundColor: t.primaryColor || '#D97706' }}
                        />
                        <span className="font-mono text-[11px] text-slate-300">{t.primaryColor || '#D97706'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/[0.08] flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono text-[11px]">Tenant ID: {t.slug}</span>
                  {!isCurrent && (
                    <button
                      onClick={() => setCurrentTenantId(t.id)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-colors"
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Business Branding & Information Form */}
      {activeTabSub === 'branding' && (
        <form onSubmit={handleSaveBranding} className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 max-w-4xl">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Palette className="w-5 h-5 text-indigo-400" />
                <span>Business Identity & Invoice Branding for {currentTenant.name}</span>
              </h2>
              <p className="text-xs text-slate-400">
                These details automatically populate on all new quotes and SARS 15% VAT invoices.
              </p>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-500/20"
            >
              {saveSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              <span>{saveSuccess ? 'Saved Successfully!' : 'Save Branding'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Registered Business Name</label>
              <input
                type="text"
                value={brandingForm.name}
                onChange={(e) => setBrandingForm({ ...brandingForm, name: e.target.value })}
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tenant Identifier / Slug</label>
              <input
                type="text"
                value={brandingForm.slug}
                onChange={(e) => setBrandingForm({ ...brandingForm, slug: e.target.value })}
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Logo Image URL</label>
              <input
                type="text"
                value={brandingForm.logoUrl}
                onChange={(e) => setBrandingForm({ ...brandingForm, logoUrl: e.target.value })}
                placeholder="https://... (or leave empty for stylish monogram)"
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Primary Brand Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={brandingForm.primaryColor}
                  onChange={(e) => setBrandingForm({ ...brandingForm, primaryColor: e.target.value })}
                  className="w-10 h-9 rounded-xl bg-transparent border border-white/20 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={brandingForm.primaryColor}
                  onChange={(e) => setBrandingForm({ ...brandingForm, primaryColor: e.target.value })}
                  className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">SARS 15% VAT Registration Number</label>
              <input
                type="text"
                value={brandingForm.vatNumber}
                onChange={(e) => setBrandingForm({ ...brandingForm, vatNumber: e.target.value })}
                placeholder="e.g. 4990192837"
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Contact / Support Email</label>
              <input
                type="email"
                value={brandingForm.supportEmail}
                onChange={(e) => setBrandingForm({ ...brandingForm, supportEmail: e.target.value })}
                placeholder="billing@yourbusiness.co.za"
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Physical & Postal Business Address</label>
              <input
                type="text"
                value={brandingForm.businessAddress}
                onChange={(e) => setBrandingForm({ ...brandingForm, businessAddress: e.target.value })}
                placeholder="Suite 402, Sandton City Office Tower, 5th Street, Sandton, 2196"
                className="w-full glass-input px-3.5 py-2 rounded-xl text-xs"
              />
            </div>

            {/* Banking Details */}
            <div className="md:col-span-2 pt-3 border-t border-white/[0.08]">
              <h3 className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider">
                EFT Banking Details for Invoice Footer
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold">Bank Name</label>
                  <input
                    type="text"
                    value={brandingForm.bankName}
                    onChange={(e) => setBrandingForm({ ...brandingForm, bankName: e.target.value })}
                    placeholder="First National Bank (FNB)"
                    className="w-full glass-input px-3 py-1.5 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold">Account Number</label>
                  <input
                    type="text"
                    value={brandingForm.accountNumber}
                    onChange={(e) => setBrandingForm({ ...brandingForm, accountNumber: e.target.value })}
                    placeholder="62819283741"
                    className="w-full glass-input px-3 py-1.5 rounded-xl text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold">Branch Code</label>
                  <input
                    type="text"
                    value={brandingForm.branchCode}
                    onChange={(e) => setBrandingForm({ ...brandingForm, branchCode: e.target.value })}
                    placeholder="250655"
                    className="w-full glass-input px-3 py-1.5 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Users & RBAC Tab */}
      {activeTabSub === 'users' && (
        <div className="glass-card rounded-3xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
            <h3 className="font-bold text-sm text-slate-100">
              Role-Based Access Control (RBAC) Directory for {currentTenant.name}
            </h3>
            <span className="text-xs text-slate-400 font-mono">{tenantUsers.length} Users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.02] text-slate-400 font-semibold border-b border-white/[0.08]">
                <tr>
                  <th className="p-3.5 pl-4">Full Name</th>
                  <th className="p-3.5">Email Address</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {tenantUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="p-3.5 pl-4 font-bold text-slate-100 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                        {u.fullName.charAt(0)}
                      </div>
                      <span>{u.fullName}</span>
                      {u.id === currentUser.id && (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                          You
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">{u.email}</td>
                    <td className="p-3.5">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getRoleBadgeColor(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString('en-ZA')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SaaS Subscriptions Tab */}
      {activeTabSub === 'billing' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Select or upgrade your monthly SaaS subscription tier to increase limits.
            </p>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1"
            >
              <span>Open Full Subscription Manager</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Starter Plan */}
            <div
              className={`glass-card p-5 rounded-3xl flex flex-col justify-between ${
                currentSubscription?.tier === SubscriptionTier.STARTER ? 'border-indigo-500/60 bg-indigo-950/20 shadow-xl' : ''
              }`}
            >
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Starter</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-100">R 299</span>
                  <span className="text-xs text-slate-400">/ mo</span>
                </div>
                <p className="text-xs text-slate-400">Solo entrepreneurs & freelancers starting out.</p>
                <ul className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-white/[0.08]">
                  <li>✓ 50 Tax Invoices / mo</li>
                  <li>✓ 5 Prebuilt Templates</li>
                  <li>✓ SARS 15% VAT Engine</li>
                </ul>
              </div>

              <button
                onClick={() => upgradeSubscription(SubscriptionTier.STARTER)}
                className="mt-4 w-full py-2 bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 font-bold rounded-xl text-xs transition-colors border border-white/10"
              >
                {currentSubscription?.tier === SubscriptionTier.STARTER ? 'Current Plan' : 'Select'}
              </button>
            </div>

            {/* Growth SME */}
            <div
              className={`glass-card p-5 rounded-3xl flex flex-col justify-between ${
                currentSubscription?.tier === SubscriptionTier.GROWTH ? 'border-amber-500/60 bg-amber-950/20 shadow-xl' : ''
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Growth SME</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">Popular</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-100">R 599</span>
                  <span className="text-xs text-slate-400">/ mo</span>
                </div>
                <p className="text-xs text-slate-400">Growing small businesses needing quotes & PDF generation.</p>
                <ul className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-white/[0.08]">
                  <li>✓ 250 Invoices & Quotes</li>
                  <li>✓ All Industry Templates</li>
                  <li>✓ WhatsApp Direct Dispatch</li>
                </ul>
              </div>

              <button
                onClick={() => upgradeSubscription(SubscriptionTier.GROWTH)}
                className="mt-4 w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-all shadow-md"
              >
                {currentSubscription?.tier === SubscriptionTier.GROWTH ? 'Current Plan (Active)' : 'Select Growth'}
              </button>
            </div>

            {/* Scale Pro */}
            <div
              className={`glass-card p-5 rounded-3xl flex flex-col justify-between ${
                currentSubscription?.tier === SubscriptionTier.SCALE_PRO ? 'border-indigo-500/60 bg-indigo-950/20 shadow-xl' : ''
              }`}
            >
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Scale Pro</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-100">R 1,299</span>
                  <span className="text-xs text-slate-400">/ mo</span>
                </div>
                <p className="text-xs text-slate-400">Full feature suite for mid-size SMEs and multi-branch operations.</p>
                <ul className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-white/[0.08]">
                  <li>✓ Unlimited Invoices & Quotes</li>
                  <li>✓ Custom PDF Branding & Logo</li>
                  <li>✓ Priority Support & API</li>
                </ul>
              </div>

              <button
                onClick={() => upgradeSubscription(SubscriptionTier.SCALE_PRO)}
                className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-md"
              >
                {currentSubscription?.tier === SubscriptionTier.SCALE_PRO ? 'Current Plan (Active)' : 'Select Scale Pro'}
              </button>
            </div>

            {/* Enterprise */}
            <div
              className={`glass-card p-5 rounded-3xl flex flex-col justify-between ${
                currentSubscription?.tier === SubscriptionTier.ENTERPRISE ? 'border-emerald-500/60 bg-emerald-950/20 shadow-xl' : ''
              }`}
            >
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Enterprise</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-slate-100">R 2,499</span>
                  <span className="text-xs text-slate-400">/ mo</span>
                </div>
                <p className="text-xs text-slate-400">Large enterprises requiring custom domain & multi-tenant isolation.</p>
                <ul className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-white/[0.08]">
                  <li>✓ Unlimited Multi-Tenants</li>
                  <li>✓ Dedicated Account Mgr</li>
                  <li>✓ Custom SLA & Integrations</li>
                </ul>
              </div>

              <button
                onClick={() => upgradeSubscription(SubscriptionTier.ENTERPRISE)}
                className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md"
              >
                {currentSubscription?.tier === SubscriptionTier.ENTERPRISE ? 'Current Plan (Active)' : 'Select Enterprise'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

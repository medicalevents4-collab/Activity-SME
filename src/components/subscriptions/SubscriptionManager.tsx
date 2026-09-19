import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubscriptionTier } from '../../types/schema';
import {
  Crown,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  CreditCard,
  Calendar,
  Building,
  TrendingUp,
  Receipt,
  FileCheck2,
  ArrowRight,
} from 'lucide-react';

export const SubscriptionManager: React.FC = () => {
  const { currentTenant, currentSubscription, upgradeSubscription } = useApp();
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>(
    currentSubscription?.billingCycle || 'MONTHLY'
  );

  const PLANS = [
    {
      tier: SubscriptionTier.STARTER,
      name: 'Starter SMME',
      tagline: 'Ideal for solo entrepreneurs, freelancers & micro trades',
      monthlyPrice: 249,
      annualPrice: 2390,
      badge: 'Micro SMME',
      badgeColor: 'bg-slate-700 text-slate-200',
      popular: false,
      maxInvoices: '30 Invoices & Quotes / month',
      maxTeam: '1 User Account',
      features: [
        '30 Invoices & Quotes / month',
        'Standard 15% VAT & No-VAT mode',
        'Prebuilt Templates Library',
        'Custom Logo & Business Details',
        'WhatsApp Invoice Dispatch',
        '5GB S3 Cloud File Vault',
        'Standard PDF Generation',
      ],
      disabledFeatures: [
        'Automated Overdue WhatsApp Reminders',
        'Multi-Staff Team Accounts',
        'Custom SARS Tax Reports',
      ],
    },
    {
      tier: SubscriptionTier.GROWTH,
      name: 'Growth SME',
      tagline: 'Best for growing contracting, consulting & service businesses',
      monthlyPrice: 599,
      annualPrice: 5750,
      badge: 'Most Popular',
      badgeColor: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-amber-500/20 shadow-md',
      popular: true,
      maxInvoices: '250 Invoices & Quotes / month',
      maxTeam: 'Up to 5 Team Members',
      features: [
        '250 Invoices & Quotes / month',
        'Automated 15% VAT & Reverse Pricing Calculator',
        'Full Prebuilt Quoting & Invoicing Templates',
        'Custom Brand Palettes & Logo Upload',
        'WhatsApp Automated Bot & Reminders',
        '50GB S3 Encrypted Document Vault',
        '1-Click Quote-to-Invoice Conversion',
        'Up to 5 Staff Roles with RBAC',
        'Client Directory & Saved Profiles',
      ],
      disabledFeatures: [
        'Multi-Branch Enterprise Invoicing',
      ],
    },
    {
      tier: SubscriptionTier.SCALE_PRO,
      name: 'Scale Pro',
      tagline: 'For established SMEs, commercial suppliers & fleet operators',
      monthlyPrice: 1299,
      annualPrice: 12470,
      badge: 'High Volume',
      badgeColor: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-500/20 shadow-md',
      popular: false,
      maxInvoices: 'Unlimited Invoices & Quotes',
      maxTeam: 'Up to 15 Team Members',
      features: [
        'Unlimited Invoices & Quotations',
        'Advanced Automated Pricing Calculator with Multi-Tier Discounts',
        'All Industry Prebuilt Templates',
        'Multi-Staff Role Management (Super Admin, Estimator, Staff)',
        'Direct WhatsApp Business CRM with Custom Bot Responses',
        '150GB S3 Cloud Document Vault',
        'Custom SARS B-BBEE & Tax Clearance Storage',
        'Priority Phone & WhatsApp Support (South Africa)',
      ],
      disabledFeatures: [],
    },
    {
      tier: SubscriptionTier.ENTERPRISE,
      name: 'Enterprise SME',
      tagline: 'Tailored for multi-branch corporations & commercial groups',
      monthlyPrice: 2499,
      annualPrice: 23990,
      badge: 'Custom Corporate',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      popular: false,
      maxInvoices: 'Unlimited Invoices & Quotes',
      maxTeam: 'Unlimited Staff Accounts',
      features: [
        'Unlimited Everything across all branches',
        'Dedicated Custom Subdomain & Multi-Tenant Routing',
        'Custom SARS VAT Report Generation for Accounting Audits',
        'Dedicated South African Account Manager',
        'Unlimited S3 Document Storage',
        'Custom SLA & 99.9% Uptime Guarantee',
      ],
      disabledFeatures: [],
    },
  ];

  const currentTier = currentSubscription?.tier || SubscriptionTier.STARTER;
  const invoicesUsed = currentSubscription?.invoicesThisMonth || 0;
  const maxInvoices = currentSubscription?.maxMonthlyInvoices || 250;
  const usagePercentage = Math.min(100, Math.round((invoicesUsed / maxInvoices) * 100));

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner: Current Plan Status & Monthly Usage */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400">
                <Crown className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
                SMME Monthly Subscriptions & SaaS Billing
              </h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active Subscription
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Transparent, predictable monthly plans designed for South African SMMEs and SMEs. Upgrade or switch anytime with instant feature activation and zero hidden fees.
            </p>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 p-1.5 rounded-2xl self-start lg:self-center">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'MONTHLY'
                  ? 'bg-indigo-600 text-white shadow-indigo-500/20 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('ANNUAL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'ANNUAL'
                  ? 'bg-indigo-600 text-white shadow-indigo-500/20 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded-full font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Current Active Plan Card & Monthly Invoicing Usage Bar */}
        <div className="mt-8 pt-6 border-t border-white/[0.08] grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/10">
            <div className="text-xs text-slate-400 font-medium mb-1">Active Business Organization</div>
            <div className="text-base font-bold text-slate-100 truncate">{currentTenant.name}</div>
            <div className="text-[11px] text-amber-400 font-mono mt-0.5">Slug: @{currentTenant.slug}</div>
          </div>

          <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/10">
            <div className="text-xs text-slate-400 font-medium mb-1">Current Monthly Plan</div>
            <div className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>{currentTier}</span>
              <span className="text-xs font-normal text-emerald-400 font-mono">
                R {currentSubscription?.monthlyPriceZAR || 599} / month
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Renewal Date:{' '}
              <span className="text-slate-200 font-semibold">
                {currentSubscription?.currentPeriodEnd
                  ? new Date(currentSubscription.currentPeriodEnd).toLocaleDateString('en-ZA', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '31 Aug 2026'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/10">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
              <span>Monthly Invoices Used</span>
              <span className="text-slate-200 font-mono font-bold">
                {invoicesUsed} / {maxInvoices >= 9999 ? 'Unlimited' : maxInvoices}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full transition-all ${
                  usagePercentage > 80 ? 'bg-amber-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
                }`}
                style={{ width: `${maxInvoices >= 9999 ? 15 : usagePercentage}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
              <span>Usage resets at month end</span>
              <span className="text-emerald-400 font-semibold">Healthy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = currentTier === plan.tier;
          const displayPrice =
            billingCycle === 'MONTHLY' ? plan.monthlyPrice : Math.round(plan.annualPrice / 12);

          return (
            <div
              key={plan.tier}
              className={`glass-card rounded-3xl p-6 border flex flex-col justify-between transition-all relative ${
                isCurrent
                  ? 'border-indigo-500/60 bg-indigo-500/[0.08] shadow-indigo-500/10 shadow-xl'
                  : plan.popular
                  ? 'border-amber-500/40 bg-white/[0.03] hover:border-amber-500/70'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md">
                  Most Popular for SMMEs
                </div>
              )}

              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${plan.badgeColor}`}>
                    {plan.badge}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Active
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-100">{plan.name}</h3>
                <p className="text-xs text-slate-400 mt-1 min-h-[36px]">{plan.tagline}</p>

                {/* Price */}
                <div className="mt-5 pb-5 border-b border-white/[0.08]">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-slate-400">R</span>
                    <span className="text-3xl font-extrabold text-slate-100 tracking-tight">
                      {displayPrice.toLocaleString('en-ZA')}
                    </span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {billingCycle === 'ANNUAL'
                      ? `Billed annually (R ${plan.annualPrice.toLocaleString('en-ZA')} / yr)`
                      : 'Billed monthly, cancel anytime'}
                  </div>
                </div>

                {/* Core Capacity */}
                <div className="py-3 space-y-1.5 border-b border-white/[0.08] text-xs">
                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <Receipt className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{plan.maxInvoices}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <Building className="w-3.5 h-3.5 text-amber-400" />
                    <span>{plan.maxTeam}</span>
                  </div>
                </div>

                {/* Feature List */}
                <div className="py-4 space-y-2.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Included Capabilities
                  </div>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {plan.disabledFeatures.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 line-through">
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-700 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-4 border-t border-white/[0.08]">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Current Active Plan</span>
                  </button>
                ) : (
                  <button
                    onClick={() => upgradeSubscription(plan.tier, billingCycle)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-500/20'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Select {plan.name}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SMME FAQ & Compliance Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <FileCheck2 className="w-4 h-4" />
            <span>SARS 15% VAT & No-VAT Support</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Switch seamlessly between 15% VAT Tax Invoices or Zero-Rated/Exempt (0% VAT) for non-registered micro enterprises below the R1M SARS threshold.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
            <CreditCard className="w-4 h-4" />
            <span>South African EFT & Card Payments</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            All major South African banks supported (FNB, Standard Bank, ABSA, Nedbank, Capitec, Investec) with automated invoice references and bank clearance notes.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>S3 Encrypted File Vault</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Safely store and link SARS Tax Clearance PIN certificates, B-BBEE affidavits, CIPC registration disclosures, and signed SLA client agreements.
          </p>
        </div>
      </div>
    </div>
  );
};

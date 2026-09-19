import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role, SubscriptionTier } from '../types/schema';
import {
  Building2,
  UserCheck,
  Crown,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    tenants,
    currentTenant,
    setCurrentTenantId,
    users,
    currentUser,
    setCurrentUserId,
    currentSubscription,
    resetToDefaults,
    setActiveTab,
  } = useApp();

  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const tenantUsers = users.filter((u) => u.tenantId === currentTenant.id || u.role === Role.SUPER_ADMIN);

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case Role.SUPER_ADMIN:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case Role.TENANT_ADMIN:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case Role.STAFF:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case Role.MEMBER:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
  };

  const getTierBadge = (tier?: SubscriptionTier) => {
    switch (tier) {
      case SubscriptionTier.ENTERPRISE:
        return { label: 'ENTERPRISE', bg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' };
      case SubscriptionTier.SCALE_PRO:
        return { label: 'SCALE PRO', bg: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-500/20 shadow-sm' };
      case SubscriptionTier.GROWTH:
        return { label: 'GROWTH SME', bg: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-amber-500/20 shadow-sm' };
      default:
        return { label: 'STARTER', bg: 'bg-slate-800 text-slate-300 border border-white/10' };
    }
  };

  const tierInfo = getTierBadge(currentSubscription?.tier);

  return (
    <header className="bg-slate-950/60 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-lg shadow-indigo-500/20 border border-white/20 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 cursor-pointer"
              onClick={() => setActiveTab('overview')}
            >
              AH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="font-extrabold text-slate-100 tracking-tight text-base sm:text-lg cursor-pointer"
                  onClick={() => setActiveTab('overview')}
                >
                  ActivityHub
                </span>
                <span className="text-slate-500 font-light">/</span>
                <span className="font-semibold text-indigo-200 tracking-tight text-xs sm:text-sm truncate max-w-[140px] sm:max-w-[220px]">
                  {currentTenant.name}
                </span>
                <button
                  onClick={() => setActiveTab('subscriptions')}
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full cursor-pointer hover:opacity-90 transition-opacity ${tierInfo.bg}`}
                  title="Manage Monthly Subscription Plans"
                >
                  {tierInfo.label}
                </button>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>Tenant:</span>
                <span className="font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded text-[11px]">
                  @{currentTenant.slug}
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">SMME Daily Operations</span>
              </p>
            </div>
          </div>

          {/* Controls: Switch Tenant, Switch User/Role, Reset */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Tenant Switcher */}
            <div className="relative">
              <button
                id="tenant-switcher-btn"
                onClick={() => {
                  setShowTenantDropdown(!showTenantDropdown);
                  setShowUserDropdown(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-200 transition-colors backdrop-blur-md"
                title="Switch Multi-Tenant Account"
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden md:inline">Switch Tenant</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showTenantDropdown && (
                <div className="absolute right-0 mt-2 w-72 glass-dropdown rounded-2xl shadow-2xl border border-white/15 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Active SMME Tenant
                  </div>
                  {tenants.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setCurrentTenantId(t.id);
                        setShowTenantDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-white/[0.08] transition-colors ${
                        t.id === currentTenant.id ? 'bg-indigo-500/20 text-indigo-200 font-medium' : 'text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div
                          className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-white/20"
                          style={{ backgroundColor: t.primaryColor || '#D97706' }}
                        />
                        <div className="truncate">
                          <p className="text-xs truncate font-medium">{t.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">@{t.slug}</p>
                        </div>
                      </div>
                      {t.id === currentTenant.id && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User & Role Switcher */}
            <div className="relative">
              <button
                id="user-role-switcher-btn"
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowTenantDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-slate-200 transition-colors backdrop-blur-md"
                title="Switch User Role / Identity"
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                <div className="text-left hidden sm:block">
                  <span className="font-semibold text-slate-100">{currentUser.fullName.split(' ')[0]}</span>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${getRoleBadgeColor(currentUser.role)}`}>
                  {currentUser.role}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-80 glass-dropdown rounded-2xl shadow-2xl border border-white/15 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Simulate User & RBAC Role
                  </div>
                  {tenantUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUserId(u.id);
                        setShowUserDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-white/[0.08] transition-colors ${
                        u.id === currentUser.id ? 'bg-indigo-500/20 text-indigo-100 font-medium' : 'text-slate-300'
                      }`}
                    >
                      <div>
                        <p className="text-xs text-slate-100 font-medium">{u.fullName}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${getRoleBadgeColor(u.role)}`}>
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Data Button */}
            <button
              onClick={resetToDefaults}
              className="p-2 text-slate-400 hover:text-slate-200 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors"
              title="Reset Sample Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

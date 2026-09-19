import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ClientProfile } from '../../types/schema';
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  FileCheck2,
  CreditCard,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  Hash,
} from 'lucide-react';

interface ClientModalProps {
  initialClient: ClientProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  initialClient,
  isOpen,
  onClose,
}) => {
  const { currentTenant, saveClient, updateClient } = useApp();

  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [province, setProvince] = useState('Gauteng');
  const [vatNumber, setVatNumber] = useState('');
  const [companyRegNo, setCompanyRegNo] = useState('');
  const [category, setCategory] = useState<'Commercial' | 'SME' | 'Enterprise' | 'Government' | 'Retail' | 'Individual' | string>('Commercial');
  const [defaultPaymentDays, setDefaultPaymentDays] = useState<number>(14);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialClient) {
      setName(initialClient.name || '');
      setContactPerson(initialClient.contactPerson || '');
      setEmail(initialClient.email || '');
      setPhone(initialClient.phone || '');
      setAddress(initialClient.address || '');
      setCity(initialClient.city || '');
      setPostalCode(initialClient.postalCode || '');
      setProvince(initialClient.province || 'Gauteng');
      setVatNumber(initialClient.vatNumber || '');
      setCompanyRegNo(initialClient.companyRegNo || '');
      setCategory(initialClient.category || 'Commercial');
      setDefaultPaymentDays(initialClient.defaultPaymentDays ?? 14);
      setNotes(initialClient.notes || '');
    } else {
      setName('');
      setContactPerson('');
      setEmail('');
      setPhone('+27 ');
      setAddress('');
      setCity('Johannesburg');
      setPostalCode('');
      setProvince('Gauteng');
      setVatNumber('');
      setCompanyRegNo('');
      setCategory('Commercial');
      setDefaultPaymentDays(14);
      setNotes('');
    }
    setErrors({});
  }, [initialClient, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Client or Company Name is required';
    if (!email.trim()) {
      errs.email = 'Email address is required for invoicing';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!phone.trim() || phone.trim().length < 6) {
      errs.phone = 'Phone number is required for quote dispatch & WhatsApp';
    }
    if (vatNumber.trim() && !/^\d{10}$/.test(vatNumber.trim())) {
      errs.vatNumber = 'SARS VAT Number must be exactly 10 digits (e.g. 4820194821)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Compose address string if city or postalCode are supplied
    let fullAddress = address.trim();

    if (initialClient) {
      updateClient(initialClient.id, {
        name: name.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: fullAddress,
        city: city.trim(),
        postalCode: postalCode.trim(),
        province: province.trim(),
        vatNumber: vatNumber.trim(),
        companyRegNo: companyRegNo.trim(),
        category,
        defaultPaymentDays,
        notes: notes.trim(),
      });
    } else {
      saveClient({
        tenantId: currentTenant.id,
        name: name.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: fullAddress,
        city: city.trim(),
        postalCode: postalCode.trim(),
        province: province.trim(),
        vatNumber: vatNumber.trim(),
        companyRegNo: companyRegNo.trim(),
        category,
        defaultPaymentDays,
        totalInvoicedZAR: 0,
        notes: notes.trim(),
      });
    }

    onClose();
  };

  const SA_PROVINCES = [
    'Gauteng',
    'Western Cape',
    'KwaZulu-Natal',
    'Eastern Cape',
    'Free State',
    'Limpopo',
    'Mpumalanga',
    'North West',
    'Northern Cape',
  ];

  const CLIENT_CATEGORIES = [
    'Commercial',
    'Enterprise',
    'SME',
    'Retail',
    'Government',
    'Individual',
    'Non-Profit',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-modal w-full max-w-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                {initialClient ? 'Edit Client Profile' : 'Add New Client & Enterprise'}
              </h2>
              <p className="text-xs text-slate-400">
                Store VAT number, physical address, contact person & billing terms for 1-click invoicing.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Business Identity & Contact */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>Company & Contact Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Company / Client Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Client / Enterprise Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Growthpoint Properties Ltd or Vodacom Group"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2.5 text-xs glass-input rounded-xl focus:outline-none ${
                      errors.name ? 'border-rose-500 ring-1 ring-rose-500' : ''
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.name}
                  </p>
                )}
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contact Person / Accounts Dept
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. Martin Steyn"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs glass-input rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Category / Tier */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Client Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 text-xs glass-input rounded-xl focus:outline-none text-slate-200"
                >
                  {CLIENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-900 text-slate-100">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Billing Email Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. accounts@growthpoint.co.za"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2.5 text-xs glass-input rounded-xl focus:outline-none ${
                      errors.email ? 'border-rose-500 ring-1 ring-rose-500' : ''
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.email}
                  </p>
                )}
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone / WhatsApp Number <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +27 82 555 4910"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2.5 text-xs glass-input rounded-xl focus:outline-none ${
                      errors.phone ? 'border-rose-500 ring-1 ring-rose-500' : ''
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: SARS VAT & Legal Registration */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>SARS VAT & Tax Compliance</span>
              </div>
              <span className="text-[10px] text-slate-400">10-Digit South African SARS format</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* VAT Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  SARS 15% VAT Number (Optional)
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="e.g. 4820194821"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value.replace(/\D/g, ''))}
                    className={`w-full pl-9 pr-3 py-2.5 text-xs font-mono glass-input rounded-xl focus:outline-none ${
                      errors.vatNumber ? 'border-rose-500 ring-1 ring-rose-500' : ''
                    }`}
                  />
                </div>
                {errors.vatNumber ? (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.vatNumber}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-500 mt-1">
                    {vatNumber.length === 10
                      ? '✓ Valid 10-digit SARS vendor format'
                      : 'Leave blank if client is non-VAT or individual'}
                  </p>
                )}
              </div>

              {/* Company Reg No */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  CIPC Company Registration No.
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. 1987/004988/06 or 2021/491823/07"
                    value={companyRegNo}
                    onChange={(e) => setCompanyRegNo(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-mono glass-input rounded-xl focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Physical Address & Location */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              <span>Physical Billing & Delivery Address</span>
            </div>

            {/* Street / Building Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Street Address, Building & Suite
              </label>
              <input
                type="text"
                placeholder="e.g. The Place, 1 Sandton Drive, Sandton"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2.5 text-xs glass-input rounded-xl focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  City / Town
                </label>
                <input
                  type="text"
                  placeholder="e.g. Johannesburg"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs glass-input rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2196"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono glass-input rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Province
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-3 py-2 text-xs glass-input rounded-xl focus:outline-none text-slate-200"
                >
                  {SA_PROVINCES.map((prov) => (
                    <option key={prov} value={prov} className="bg-slate-900 text-slate-100">
                      {prov}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Payment Terms & Notes */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Default Billing Terms & Instructions</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Default Payment Due Days
                </label>
                <select
                  value={defaultPaymentDays}
                  onChange={(e) => setDefaultPaymentDays(Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-xs glass-input rounded-xl focus:outline-none text-slate-200 font-medium"
                >
                  <option value={0} className="bg-slate-900 text-slate-100">
                    COD / Due on Receipt (0 Days)
                  </option>
                  <option value={7} className="bg-slate-900 text-slate-100">
                    Net 7 Days
                  </option>
                  <option value={14} className="bg-slate-900 text-slate-100">
                    Net 14 Days (Standard SME)
                  </option>
                  <option value={30} className="bg-slate-900 text-slate-100">
                    Net 30 Days (Commercial Standard)
                  </option>
                  <option value={60} className="bg-slate-900 text-slate-100">
                    Net 60 Days (Enterprise / Government)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Billing Notes / PO Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Always quote PO # on tax invoices"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs glass-input rounded-xl focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/10 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{initialClient ? 'Save Changes' : 'Create Client Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

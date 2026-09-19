import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Tenant,
  User,
  Role,
  Subscription,
  SubscriptionTier,
  InvoiceQuote,
  DocumentType,
  TaxMode,
  InvoiceStatus,
  FileStorage,
  WhatsAppConversation,
  Message,
  ClientProfile,
  PrebuiltTemplate,
  EmailNotificationLog,
} from '../types/schema';
import {
  INITIAL_TENANTS,
  INITIAL_USERS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_INVOICES,
  INITIAL_CLIENTS,
  INITIAL_FILES,
  INITIAL_CONVERSATIONS,
  INITIAL_EMAIL_LOGS,
} from '../data/seedData';
import { PREBUILT_TEMPLATES } from '../data/prebuiltTemplates';
import { buildAutomatedEmailLog } from '../utils/emailNotifier';
import confetti from 'canvas-confetti';

interface AppContextType {
  // Tenancy & Fillable Business Info
  tenants: Tenant[];
  currentTenant: Tenant;
  setCurrentTenantId: (id: string) => void;
  updateCurrentTenant: (updatedFields: Partial<Tenant>) => void;
  
  // Users & RBAC
  users: User[];
  currentUser: User;
  setCurrentUserId: (id: string) => void;
  
  // Monthly Subscriptions & SaaS Plans
  subscriptions: Subscription[];
  currentSubscription: Subscription | undefined;
  upgradeSubscription: (tier: SubscriptionTier, cycle?: 'MONTHLY' | 'ANNUAL') => void;
  
  // Invoices & Quotes Engine
  invoices: InvoiceQuote[];
  createInvoice: (invoice: Omit<InvoiceQuote, 'id' | 'createdAt' | 'updatedAt'>) => InvoiceQuote;
  updateInvoice: (id: string, invoice: Partial<InvoiceQuote>) => void;
  deleteInvoice: (id: string) => void;
  markInvoiceStatus: (id: string, status: InvoiceStatus) => void;
  convertQuoteToInvoice: (quoteId: string) => InvoiceQuote | null;
  
  // Automated Email Notification System
  emailLogs: EmailNotificationLog[];
  sendInvoiceEmail: (invoiceId: string, customRecipient?: string) => EmailNotificationLog | null;
  previewInvoiceEmail: (invoice: InvoiceQuote) => void;
  selectedEmailForView: EmailNotificationLog | null;
  setSelectedEmailForView: (log: EmailNotificationLog | null) => void;
  isEmailOutboxOpen: boolean;
  setIsEmailOutboxOpen: (open: boolean) => void;
  
  // Clients Directory (Fillable presets & storage)
  clients: ClientProfile[];
  saveClient: (client: Omit<ClientProfile, 'id'>) => ClientProfile;
  updateClient: (id: string, updatedFields: Partial<ClientProfile>) => void;
  deleteClient: (id: string) => void;
  clientToInvoice: ClientProfile | null;
  setClientToInvoice: (client: ClientProfile | null) => void;
  createInvoiceForClient: (client: ClientProfile, docType?: DocumentType) => void;
  
  // Prebuilt & Custom Reusable Templates
  prebuiltTemplates: PrebuiltTemplate[];
  saveTemplate: (template: Omit<PrebuiltTemplate, 'id'> & { id?: string }) => PrebuiltTemplate;
  updateTemplate: (id: string, updatedFields: Partial<PrebuiltTemplate>) => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => PrebuiltTemplate | null;
  applyTemplateToNewInvoice: (template: PrebuiltTemplate) => void;
  templateToApply: PrebuiltTemplate | null;
  setTemplateToApply: (tmpl: PrebuiltTemplate | null) => void;
  templateToEdit: PrebuiltTemplate | null;
  setTemplateToEdit: (tmpl: PrebuiltTemplate | null) => void;
  isTemplateEditorOpen: boolean;
  setIsTemplateEditorOpen: (open: boolean) => void;
  openTemplateEditor: (tmpl?: PrebuiltTemplate | null) => void;
  
  // S3 File Vault
  files: FileStorage[];
  uploadFile: (file: { name: string; size: number; mimeType: string; category?: FileStorage['category'] }) => FileStorage;
  deleteFile: (id: string) => void;
  
  // WhatsApp Omnichannel
  conversations: WhatsAppConversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (conversationId: string, text: string, sender?: 'USER' | 'BOT' | 'AGENT', attachment?: Message['documentAttachment']) => void;
  createConversation: (phoneNumber: string, clientName: string) => string;
  shareInvoiceViaWhatsApp: (invoice: InvoiceQuote) => void;
  
  // Navigation & Toasts
  activeTab: 'overview' | 'invoices' | 'templates' | 'calculator' | 'clients' | 'subscriptions' | 'whatsapp' | 'files' | 'tenants' | 'schema';
  setActiveTab: (tab: 'overview' | 'invoices' | 'templates' | 'calculator' | 'clients' | 'subscriptions' | 'whatsapp' | 'files' | 'tenants' | 'schema') => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('activityhub_smme_tenants_v2');
    return saved ? JSON.parse(saved) : INITIAL_TENANTS;
  });

  const [currentTenantId, setCurrentTenantId] = useState<string>(() => {
    return localStorage.getItem('activityhub_smme_current_tenant_id_v2') || 'tenant-1';
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('activityhub_smme_users_v2');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem('activityhub_smme_current_user_id_v2') || 'user-tenant-admin-1';
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem('activityhub_smme_subscriptions_v2');
    return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTIONS;
  });

  const [invoices, setInvoices] = useState<InvoiceQuote[]>(() => {
    const saved = localStorage.getItem('activityhub_smme_invoices_v2');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [clients, setClients] = useState<ClientProfile[]>(() => {
    const saved = localStorage.getItem('activityhub_smme_clients_v2');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [files, setFiles] = useState<FileStorage[]>(() => {
    const saved = localStorage.getItem('activityhub_smme_files_v2');
    return saved ? JSON.parse(saved) : INITIAL_FILES;
  });

  const [conversations, setConversations] = useState<WhatsAppConversation[]>(() => {
    const saved = localStorage.getItem('activityhub_smme_conversations_v2');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });

  const [emailLogs, setEmailLogs] = useState<EmailNotificationLog[]>(() => {
    const saved = localStorage.getItem('activityhub_smme_emaillogs_v2');
    return saved ? JSON.parse(saved) : INITIAL_EMAIL_LOGS;
  });

  const [templates, setTemplates] = useState<PrebuiltTemplate[]>(() => {
    const saved = localStorage.getItem('activityhub_smme_templates_v2');
    return saved ? JSON.parse(saved) : PREBUILT_TEMPLATES;
  });

  const [selectedEmailForView, setSelectedEmailForView] = useState<EmailNotificationLog | null>(null);
  const [isEmailOutboxOpen, setIsEmailOutboxOpen] = useState(false);

  const [templateToEdit, setTemplateToEdit] = useState<PrebuiltTemplate | null>(null);
  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false);

  const [activeConversationId, setActiveConversationId] = useState<string | null>('conv-1');
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'templates' | 'calculator' | 'clients' | 'subscriptions' | 'whatsapp' | 'files' | 'tenants' | 'schema'>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [templateToApply, setTemplateToApply] = useState<PrebuiltTemplate | null>(null);
  const [clientToInvoice, setClientToInvoice] = useState<ClientProfile | null>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('activityhub_smme_tenants_v2', JSON.stringify(tenants));
    localStorage.setItem('activityhub_smme_current_tenant_id_v2', currentTenantId);
    localStorage.setItem('activityhub_smme_users_v2', JSON.stringify(users));
    localStorage.setItem('activityhub_smme_current_user_id_v2', currentUserId);
    localStorage.setItem('activityhub_smme_subscriptions_v2', JSON.stringify(subscriptions));
    localStorage.setItem('activityhub_smme_invoices_v2', JSON.stringify(invoices));
    localStorage.setItem('activityhub_smme_clients_v2', JSON.stringify(clients));
    localStorage.setItem('activityhub_smme_files_v2', JSON.stringify(files));
    localStorage.setItem('activityhub_smme_conversations_v2', JSON.stringify(conversations));
    localStorage.setItem('activityhub_smme_emaillogs_v2', JSON.stringify(emailLogs));
    localStorage.setItem('activityhub_smme_templates_v2', JSON.stringify(templates));
  }, [tenants, currentTenantId, users, currentUserId, subscriptions, invoices, clients, files, conversations, emailLogs, templates]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const currentTenant = tenants.find((t) => t.id === currentTenantId) || tenants[0] || INITIAL_TENANTS[0];
  const currentUser = users.find((u) => u.id === currentUserId) || users[0] || INITIAL_USERS[0];
  const currentSubscription = subscriptions.find((s) => s.tenantId === currentTenant.id);

  const updateCurrentTenant = (updatedFields: Partial<Tenant>) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === currentTenant.id ? { ...t, ...updatedFields, updatedAt: new Date().toISOString() } : t))
    );
    showToast('Business & branding details updated successfully.');
  };

  const upgradeSubscription = (tier: SubscriptionTier, cycle: 'MONTHLY' | 'ANNUAL' = 'MONTHLY') => {
    let monthlyPrice = 249;
    let maxInvoices = 30;
    let maxTeam = 1;

    if (tier === SubscriptionTier.GROWTH) {
      monthlyPrice = 599;
      maxInvoices = 250;
      maxTeam = 5;
    } else if (tier === SubscriptionTier.SCALE_PRO) {
      monthlyPrice = 1299;
      maxInvoices = 9999;
      maxTeam = 15;
    } else if (tier === SubscriptionTier.ENTERPRISE) {
      monthlyPrice = 2499;
      maxInvoices = 99999;
      maxTeam = 50;
    }

    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.tenantId === currentTenant.id
          ? {
              ...sub,
              tier,
              billingCycle: cycle,
              monthlyPriceZAR: monthlyPrice,
              maxMonthlyInvoices: maxInvoices,
              maxTeamMembers: maxTeam,
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            }
          : sub
      )
    );
    showToast(`SMME Plan upgraded to ${tier} (${cycle} billing)!`);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
  };

  // Automated Email Notification System
  const triggerAutomatedInvoiceEmail = (
    invoice: InvoiceQuote,
    trigger: 'STATUS_CHANGED_TO_SENT' | 'CREATED_AS_SENT' | 'MANUAL_TRIGGER' = 'STATUS_CHANGED_TO_SENT',
    customRecipient?: string
  ): { emailLog: EmailNotificationLog; updatedInvoice: InvoiceQuote } => {
    const effectiveInvoice: InvoiceQuote = customRecipient
      ? { ...invoice, clientEmail: customRecipient }
      : invoice;

    const emailLog = buildAutomatedEmailLog(effectiveInvoice, currentTenant, trigger);
    
    const updatedInvoice: InvoiceQuote = {
      ...effectiveInvoice,
      emailDelivery: {
        lastSentAt: emailLog.sentAt,
        recipientEmail: emailLog.recipientEmail,
        status: 'DELIVERED',
        messageId: emailLog.messageId,
        sentCount: (effectiveInvoice.emailDelivery?.sentCount || 0) + 1,
      },
      emailLogs: [emailLog, ...(effectiveInvoice.emailLogs || [])],
      updatedAt: new Date().toISOString(),
    };

    setEmailLogs((prev) => [emailLog, ...prev]);

    return { emailLog, updatedInvoice };
  };

  const sendInvoiceEmail = (invoiceId: string, customRecipient?: string): EmailNotificationLog | null => {
    const target = invoices.find((inv) => inv.id === invoiceId);
    if (!target) return null;

    const { emailLog, updatedInvoice } = triggerAutomatedInvoiceEmail(
      target,
      'MANUAL_TRIGGER',
      customRecipient
    );

    setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? updatedInvoice : inv)));
    showToast(`📧 Email copy of ${target.documentNumber} delivered to ${emailLog.recipientEmail}`);
    return emailLog;
  };

  const previewInvoiceEmail = (invoice: InvoiceQuote) => {
    const emailLog = buildAutomatedEmailLog(invoice, currentTenant, 'STATUS_CHANGED_TO_SENT');
    setSelectedEmailForView(emailLog);
  };

  // Invoices & Quotes
  const createInvoice = (invoiceData: Omit<InvoiceQuote, 'id' | 'createdAt' | 'updatedAt'>): InvoiceQuote => {
    const id = `inv-${Date.now()}`;
    const now = new Date().toISOString();
    let newInvoice: InvoiceQuote = {
      ...invoiceData,
      id,
      tenantId: currentTenant.id,
      userId: currentUser.id,
      createdAt: now,
      updatedAt: now,
    };

    // Update monthly invoice counter for current subscription
    setSubscriptions((prev) =>
      prev.map((s) => (s.tenantId === currentTenant.id ? { ...s, invoicesThisMonth: s.invoicesThisMonth + 1 } : s))
    );

    // If created directly in SENT status, trigger immediate automated email
    if (newInvoice.status === InvoiceStatus.SENT) {
      const { updatedInvoice, emailLog } = triggerAutomatedInvoiceEmail(
        newInvoice,
        'CREATED_AS_SENT'
      );
      newInvoice = updatedInvoice;
      setInvoices((prev) => [updatedInvoice, ...prev]);
      showToast(`Tax Invoice ${newInvoice.documentNumber} created & copy automatically emailed to ${emailLog.recipientEmail}!`);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      return updatedInvoice;
    }

    setInvoices((prev) => [newInvoice, ...prev]);
    showToast(`${newInvoice.docType === DocumentType.INVOICE ? 'Tax Invoice' : 'Quotation'} ${newInvoice.documentNumber} created!`);
    return newInvoice;
  };

  const updateInvoice = (id: string, updatedFields: Partial<InvoiceQuote>) => {
    const existing = invoices.find((inv) => inv.id === id);
    const becomingSent = updatedFields.status === InvoiceStatus.SENT && existing?.status !== InvoiceStatus.SENT;

    if (becomingSent && existing) {
      const merged: InvoiceQuote = { ...existing, ...updatedFields, status: InvoiceStatus.SENT };
      const { updatedInvoice, emailLog } = triggerAutomatedInvoiceEmail(
        merged,
        'STATUS_CHANGED_TO_SENT'
      );
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? updatedInvoice : inv)));
      showToast(`Document marked as SENT & copy automatically emailed to ${emailLog.recipientEmail}!`);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      return;
    }

    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...updatedFields, updatedAt: new Date().toISOString() } : inv))
    );
    showToast(`Document updated.`);
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    showToast(`Document deleted.`);
  };

  const markInvoiceStatus = (id: string, status: InvoiceStatus) => {
    const existing = invoices.find((inv) => inv.id === id);

    if (status === InvoiceStatus.SENT && existing && existing.status !== InvoiceStatus.SENT) {
      const { updatedInvoice, emailLog } = triggerAutomatedInvoiceEmail(
        { ...existing, status: InvoiceStatus.SENT },
        'STATUS_CHANGED_TO_SENT'
      );
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? updatedInvoice : inv)));
      showToast(`📧 Status updated to SENT! Copy of ${existing.documentNumber} automatically delivered to ${emailLog.recipientEmail}`);
      confetti({ particleCount: 60, spread: 75, origin: { y: 0.6 } });
      return;
    }

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          if (status === InvoiceStatus.PAID) {
            confetti({ particleCount: 90, spread: 85, origin: { y: 0.6 } });
          }
          return { ...inv, status, updatedAt: new Date().toISOString() };
        }
        return inv;
      })
    );
    showToast(`Document marked as ${status}`);
  };

  const convertQuoteToInvoice = (quoteId: string): InvoiceQuote | null => {
    const targetQuote = invoices.find((inv) => inv.id === quoteId);
    if (!targetQuote) return null;

    const newDocNumber = `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const baseInvoice: InvoiceQuote = {
      ...targetQuote,
      id: `inv-${Date.now()}`,
      docType: DocumentType.INVOICE,
      documentNumber: newDocNumber,
      status: InvoiceStatus.SENT,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Trigger automated email on new sent invoice
    const { updatedInvoice, emailLog } = triggerAutomatedInvoiceEmail(
      baseInvoice,
      'CREATED_AS_SENT'
    );

    setInvoices((prev) => [updatedInvoice, ...prev]);
    showToast(`Converted Quote ${targetQuote.documentNumber} into Tax Invoice ${newDocNumber} & automatically emailed to ${emailLog.recipientEmail}!`);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    return updatedInvoice;
  };

  const saveClient = (clientData: Omit<ClientProfile, 'id'>): ClientProfile => {
    const id = `client-${Date.now()}`;
    const now = new Date().toISOString();
    const newClient: ClientProfile = {
      ...clientData,
      id,
      tenantId: currentTenant.id,
      createdAt: clientData.createdAt || now,
      updatedAt: now,
    };
    setClients((prev) => [newClient, ...prev]);
    showToast(`Saved client "${newClient.name}" to directory!`);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    return newClient;
  };

  const updateClient = (id: string, updatedFields: Partial<ClientProfile>) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, ...updatedFields, updatedAt: new Date().toISOString() }
          : c
      )
    );
    showToast(`Client profile updated successfully.`);
  };

  const deleteClient = (id: string) => {
    const target = clients.find((c) => c.id === id);
    setClients((prev) => prev.filter((c) => c.id !== id));
    showToast(`Deleted client "${target?.name || 'Client'}" from directory.`);
  };

  const createInvoiceForClient = (client: ClientProfile, docType: DocumentType = DocumentType.INVOICE) => {
    setClientToInvoice(client);
    setActiveTab('invoices');
    showToast(`Creating new ${docType === DocumentType.INVOICE ? 'Tax Invoice' : 'Quotation'} for ${client.name}...`);
  };

  const applyTemplateToNewInvoice = (template: PrebuiltTemplate) => {
    setTemplateToApply(template);
    setActiveTab('invoices');
    showToast(`Loaded template "${template.name}". Opening invoice editor...`);
  };

  const openTemplateEditor = (tmpl: PrebuiltTemplate | null = null) => {
    setTemplateToEdit(tmpl);
    setIsTemplateEditorOpen(true);
  };

  const saveTemplate = (templateData: Omit<PrebuiltTemplate, 'id'> & { id?: string }): PrebuiltTemplate => {
    const existingIndex = templateData.id ? templates.findIndex((t) => t.id === templateData.id) : -1;
    const now = new Date().toISOString();

    if (existingIndex >= 0 && templateData.id) {
      const updated: PrebuiltTemplate = {
        ...templates[existingIndex],
        ...templateData,
        id: templateData.id,
        isCustom: true,
        tenantId: currentTenant.id,
        updatedAt: now,
      };

      setTemplates((prev) => prev.map((t) => (t.id === templateData.id ? updated : t)));
      showToast(`Custom template "${updated.name}" updated successfully!`);
      confetti({ particleCount: 50, spread: 65, origin: { y: 0.6 } });
      return updated;
    }

    const newId = templateData.id && !templateData.id.startsWith('tmpl-trade') && !templateData.id.startsWith('tmpl-consulting') && !templateData.id.startsWith('tmpl-digital') && !templateData.id.startsWith('tmpl-retail') && !templateData.id.startsWith('tmpl-auto') && !templateData.id.startsWith('tmpl-freelance')
      ? templateData.id
      : `tmpl-custom-${Date.now()}`;

    const newTemplate: PrebuiltTemplate = {
      ...templateData,
      id: newId,
      badge: templateData.badge || 'Custom Layout',
      isCustom: true,
      tenantId: currentTenant.id,
      createdAt: templateData.createdAt || now,
      updatedAt: now,
    };

    setTemplates((prev) => [newTemplate, ...prev]);
    showToast(`New custom template "${newTemplate.name}" saved and ready for reuse!`);
    confetti({ particleCount: 60, spread: 75, origin: { y: 0.6 } });
    return newTemplate;
  };

  const updateTemplate = (id: string, updatedFields: Partial<PrebuiltTemplate>) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, ...updatedFields, updatedAt: new Date().toISOString() }
          : t
      )
    );
    showToast(`Template updated successfully.`);
  };

  const deleteTemplate = (id: string) => {
    const target = templates.find((t) => t.id === id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    showToast(`Deleted template "${target?.name || 'Template'}".`);
  };

  const duplicateTemplate = (id: string): PrebuiltTemplate | null => {
    const source = templates.find((t) => t.id === id);
    if (!source) return null;

    const duplicated: PrebuiltTemplate = {
      ...source,
      id: `tmpl-custom-${Date.now()}`,
      name: `${source.name} (Copy)`,
      badge: 'Custom Layout',
      isCustom: true,
      tenantId: currentTenant.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTemplates((prev) => [duplicated, ...prev]);
    showToast(`Duplicated template "${source.name}"!`);
    return duplicated;
  };

  // S3 Files Vault
  const uploadFile = (file: { name: string; size: number; mimeType: string; category?: FileStorage['category'] }): FileStorage => {
    const id = `file-${Date.now()}`;
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const safeName = file.name.replace(/\s+/g, '_');
    const s3Key = `tenants/${currentTenant.id}/vault/${year}/${month}/${safeName}`;
    const s3Url = `https://s3.af-south-1.amazonaws.com/activityhub-vault/${s3Key}`;

    const newFile: FileStorage = {
      id,
      tenantId: currentTenant.id,
      userId: currentUser.id,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.mimeType,
      s3Key,
      s3Url,
      category: file.category || 'OTHER',
      createdAt: new Date().toISOString(),
    };

    setFiles((prev) => [newFile, ...prev]);
    showToast(`Securely vaulted ${file.name} to S3 bucket [af-south-1]!`);
    return newFile;
  };

  const deleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    showToast(`File removed from vault.`);
  };

  // WhatsApp Omnichannel CRM
  const sendMessage = (
    conversationId: string,
    text: string,
    sender: 'USER' | 'BOT' | 'AGENT' = 'AGENT',
    attachment?: Message['documentAttachment']
  ) => {
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      sender,
      body: text,
      createdAt: new Date().toISOString(),
      documentAttachment: attachment,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            updatedAt: new Date().toISOString(),
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    // Bot automated assistant reply for SMME clients
    if (sender === 'USER') {
      setTimeout(() => {
        const lower = text.toLowerCase();
        let reply = `Thank you for contacting ${currentTenant.name}. An account executive will assist you shortly.`;
        if (lower.includes('invoice') || lower.includes('payment') || lower.includes('banking') || lower.includes('tax') || lower.includes('vat')) {
          reply = `Hello! Regarding your invoice or quotation, you can make direct EFT payment to our verified South African bank account. Our automated billing engine tracks real-time SARS 15% VAT settlement.`;
        } else if (lower.includes('quote') || lower.includes('pricing') || lower.includes('rates') || lower.includes('estimate')) {
          reply = `Hi there! We can generate an official customized quotation within minutes with automated pricing breakdowns (incl. or excl. 15% VAT). Please reply with your required line items.`;
        } else if (lower.includes('approve') || lower.includes('proceed') || lower.includes('accept') || lower.includes('order')) {
          reply = `Fantastic! We have noted your quotation approval and our dispatch team has begun project scheduling. A formal tax invoice will be generated.`;
        }

        const botMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          conversationId,
          sender: 'BOT',
          body: reply,
          createdAt: new Date().toISOString(),
        };

        setConversations((inner) =>
          inner.map((c) =>
            c.id === conversationId
              ? { ...c, updatedAt: new Date().toISOString(), messages: [...c.messages, botMsg] }
              : c
          )
        );
      }, 1100);
    }
  };

  const createConversation = (phoneNumber: string, clientName: string): string => {
    const id = `conv-${Date.now()}`;
    const newConv: WhatsAppConversation = {
      id,
      tenantId: currentTenant.id,
      phoneNumber,
      clientName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          conversationId: id,
          sender: 'BOT',
          body: `Direct WhatsApp Business Channel initialized with ${clientName} (${phoneNumber}) for ${currentTenant.name}.`,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(id);
    showToast(`WhatsApp chat opened with ${clientName}`);
    return id;
  };

  const shareInvoiceViaWhatsApp = (invoice: InvoiceQuote) => {
    const phone = invoice.clientPhone || '+27825554910';
    let conv = conversations.find((c) => c.phoneNumber.replace(/\s+/g, '') === phone.replace(/\s+/g, ''));
    let convId = conv ? conv.id : null;

    if (!convId) {
      convId = createConversation(phone, invoice.clientName);
    }

    const docName = invoice.docType === DocumentType.INVOICE ? 'Tax Invoice' : 'Quotation';
    const vatText =
      invoice.taxMode === TaxMode.VAT_15
        ? '(includes 15% SARS VAT)'
        : invoice.taxMode === TaxMode.VAT_15_INCLUSIVE
        ? '(15% VAT Included)'
        : '(Zero-Rated / No VAT)';
    const text = `Dear ${invoice.clientName},\n\nPlease find attached your official ${docName} #${invoice.documentNumber} for R ${invoice.grandTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} ${vatText}.\n\nPayment Reference: ${invoice.documentNumber}\nDue Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-ZA') : 'Upon Receipt'}.\n\nThank you for choosing ${invoice.businessName}!`;

    sendMessage(convId, text, 'AGENT', {
      type: invoice.docType === DocumentType.INVOICE ? 'INVOICE' : 'QUOTE',
      title: `${docName} #${invoice.documentNumber}`,
      number: invoice.documentNumber,
      amount: invoice.grandTotal,
    });

    setActiveConversationId(convId);
    setActiveTab('whatsapp');
    showToast(`Dispatched ${invoice.documentNumber} via WhatsApp!`);
  };

  const resetToDefaults = () => {
    localStorage.clear();
    setTenants(INITIAL_TENANTS);
    setCurrentTenantId('tenant-1');
    setUsers(INITIAL_USERS);
    setCurrentUserId('user-tenant-admin-1');
    setSubscriptions(INITIAL_SUBSCRIPTIONS);
    setInvoices(INITIAL_INVOICES);
    setClients(INITIAL_CLIENTS);
    setFiles(INITIAL_FILES);
    setConversations(INITIAL_CONVERSATIONS);
    setEmailLogs(INITIAL_EMAIL_LOGS);
    setTemplates(PREBUILT_TEMPLATES);
    setActiveConversationId('conv-1');
    setTemplateToApply(null);
    setTemplateToEdit(null);
    setIsTemplateEditorOpen(false);
    setSelectedEmailForView(null);
    setIsEmailOutboxOpen(false);
    showToast('Reset all data to SMME default state.');
  };

  return (
    <AppContext.Provider
      value={{
        tenants,
        currentTenant,
        setCurrentTenantId,
        updateCurrentTenant,
        users,
        currentUser,
        setCurrentUserId,
        subscriptions,
        currentSubscription,
        upgradeSubscription,
        invoices,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        markInvoiceStatus,
        convertQuoteToInvoice,
        emailLogs,
        sendInvoiceEmail,
        previewInvoiceEmail,
        selectedEmailForView,
        setSelectedEmailForView,
        isEmailOutboxOpen,
        setIsEmailOutboxOpen,
        clients,
        saveClient,
        updateClient,
        deleteClient,
        clientToInvoice,
        setClientToInvoice,
        createInvoiceForClient,
        prebuiltTemplates: templates,
        saveTemplate,
        updateTemplate,
        deleteTemplate,
        duplicateTemplate,
        applyTemplateToNewInvoice,
        templateToApply,
        setTemplateToApply,
        templateToEdit,
        setTemplateToEdit,
        isTemplateEditorOpen,
        setIsTemplateEditorOpen,
        openTemplateEditor,
        files,
        uploadFile,
        deleteFile,
        conversations,
        activeConversationId,
        setActiveConversationId,
        sendMessage,
        createConversation,
        shareInvoiceViaWhatsApp,
        activeTab,
        setActiveTab,
        toastMessage,
        showToast,
        resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

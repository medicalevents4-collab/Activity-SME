export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  STAFF = 'STAFF',
  MEMBER = 'MEMBER',
}

export enum SubscriptionTier {
  STARTER = 'STARTER',
  GROWTH = 'GROWTH',
  SCALE_PRO = 'SCALE_PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum DocumentType {
  QUOTE = 'QUOTE',
  INVOICE = 'INVOICE',
}

export enum TaxMode {
  VAT_15 = 'VAT_15', // Standard Add 15% VAT (Exclusive)
  VAT_15_INCLUSIVE = 'VAT_15_INCLUSIVE', // 15% VAT Included in unit prices
  NO_VAT = 'NO_VAT', // Without 15% VAT (0% / Exempt / Non-VAT Vendor)
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  tradeCategory?: string;
  createdAt: string;
  updatedAt: string;
  logoUrl?: string;
  primaryColor?: string;
  businessRegNo?: string;
  vatNumber?: string;
  businessAddress?: string;
  businessEmail?: string;
  businessPhone?: string;
  bankingDetails?: string;
  defaultTerms?: string;
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: Role;
  jobTitle?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  tenantId: string;
  tier: SubscriptionTier;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  status: 'ACTIVE' | 'EXPIRED' | 'TRIAL' | 'PAST_DUE';
  monthlyPriceZAR: number;
  invoicesThisMonth: number;
  maxMonthlyInvoices: number; // e.g. 30 for STARTER, Infinity for GROWTH/PRO
  maxTeamMembers: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceQuoteId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  lineTotal: number;
}

export interface EmailNotificationLog {
  id: string;
  tenantId: string;
  invoiceId: string;
  documentNumber: string;
  docType: DocumentType;
  recipientEmail: string;
  recipientName: string;
  senderEmail: string;
  senderName: string;
  subject: string;
  sentAt: string;
  status: 'DELIVERED' | 'SENT' | 'FAILED';
  messageId: string;
  grandTotal: number;
  dueDate?: string;
  previewSnippet: string;
  trigger: 'STATUS_CHANGED_TO_SENT' | 'CREATED_AS_SENT' | 'MANUAL_TRIGGER';
  bodyHtml?: string;
}

export interface InvoiceQuote {
  id: string;
  tenantId: string;
  userId: string;
  docType: DocumentType;
  documentNumber: string;
  
  // Custom Branding & Styling
  logoUrl?: string;
  primaryColor: string;
  
  // Business Info (Fillable)
  businessName: string;
  businessRegNo?: string;
  vatNumber?: string;
  businessAddress?: string;
  businessEmail?: string;
  businessPhone?: string;
  
  // Client Info (Fillable)
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  clientVatNo?: string;
  clientPhone?: string;
  contactPerson?: string;
  
  // Pricing & Automated SARS 15% VAT Logic
  taxMode: TaxMode;
  vatRate: number;
  subtotal: number;
  discountTotal?: number;
  vatAmount: number;
  grandTotal: number;
  
  // Dynamic Footer & Terms
  bankingDetails?: string;
  footerNotes?: string;
  paymentTerms?: string;
  
  status: InvoiceStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  
  // Automated Email Notification Metadata
  emailDelivery?: {
    lastSentAt: string;
    recipientEmail: string;
    status: 'DELIVERED' | 'SENT' | 'FAILED';
    messageId: string;
    sentCount: number;
  };
  emailLogs?: EmailNotificationLog[];
  
  lineItems: InvoiceItem[];
}

export interface ClientProfile {
  id: string;
  tenantId: string;
  name: string;
  contactPerson?: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  vatNumber?: string;
  companyRegNo?: string;
  category?: 'Commercial' | 'SME' | 'Enterprise' | 'Government' | 'Retail' | 'Individual' | string;
  defaultPaymentDays: number;
  totalInvoicedZAR: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PrebuiltTemplate {
  id: string;
  name: string;
  industry: string;
  description: string;
  docType: DocumentType;
  primaryColor: string;
  defaultTaxMode: TaxMode;
  badge: string;
  bankingDetails: string;
  footerNotes: string;
  sampleLineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
  // Customizable Layout, Branding & Styling
  themeLayout?: 'MODERN' | 'EXECUTIVE' | 'BOLD' | 'MINIMAL' | 'CREATIVE' | 'COMPACT';
  fontFamily?: 'sans' | 'serif' | 'mono';
  headerLayout?: 'SPLIT' | 'CENTERED' | 'STACKED_LEFT';
  tableStyle?: 'MODERN' | 'ZEBRA' | 'GRID' | 'BORDERLESS';
  accentColor?: string;
  logoUrl?: string;
  businessName?: string;
  businessRegNo?: string;
  vatNumber?: string;
  businessAddress?: string;
  businessEmail?: string;
  businessPhone?: string;
  watermarkText?: string;
  isCustom?: boolean;
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FileStorage {
  id: string;
  tenantId: string;
  userId: string;
  fileName: string;
  fileSize: number; // in bytes
  mimeType: string;
  s3Key: string;
  s3Url: string;
  category?: 'INVOICE' | 'QUOTE' | 'SARS_TAX_CLEARANCE' | 'B_BBEE' | 'CONTRACT' | 'RECEIPT' | 'CIPC_DOC' | 'OTHER';
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'USER' | 'BOT' | 'AGENT';
  body: string;
  createdAt: string;
  documentAttachment?: {
    type: 'INVOICE' | 'QUOTE' | 'RECEIPT';
    title: string;
    number: string;
    amount?: number;
  };
}

export interface WhatsAppConversation {
  id: string;
  tenantId: string;
  phoneNumber: string;
  clientName?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

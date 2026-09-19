import { PrebuiltTemplate, DocumentType, TaxMode } from '../types/schema';

export const PREBUILT_TEMPLATES: PrebuiltTemplate[] = [
  {
    id: 'tmpl-trade-construction',
    name: 'Contracting & Trades Pro',
    industry: 'Construction & Plumbing',
    description: 'Perfect for builders, electricians, plumbers, and renovation contractors with materials, labour & call-out items.',
    docType: DocumentType.INVOICE,
    primaryColor: '#D97706', // Amber gold
    defaultTaxMode: TaxMode.VAT_15,
    badge: 'Popular for Trades',
    bankingDetails: `Bank: First National Bank (FNB)
Account Name: BuildCraft Contractors (Pty) Ltd
Account Number: 628 491 0284
Branch Code: 250655 (Commercial Banking)
Reference: INV-{DOC_NUM}`,
    footerNotes: `1. Workmanship guaranteed for 12 months from completion date.
2. 50% deposit required prior to material procurement; balance strictly due upon practical handover.
3. Official SARS 15% VAT Tax Invoice. Thank you for your business!`,
    sampleLineItems: [
      { description: 'On-Site Diagnostic & Master Artisan Call-Out Fee', quantity: 1, unitPrice: 850 },
      { description: 'Supply & Installation of 200L High-Pressure Solar Geyser (SABS Approved)', quantity: 1, unitPrice: 14500 },
      { description: 'Copper Piping (22mm), Brass Valves & Pressure Equalizer Fittings', quantity: 1, unitPrice: 3200 },
      { description: 'Skilled Artisan & Assistant Labour (8 Hours)', quantity: 8, unitPrice: 450 },
      { description: 'Site Rubble Removal & Eco-Friendly Disposal', quantity: 1, unitPrice: 950 },
    ],
  },
  {
    id: 'tmpl-consulting-professional',
    name: 'Executive Advisory & Consulting',
    industry: 'Professional Services',
    description: 'Designed for management consultants, legal practitioners, accountants, and business advisors.',
    docType: DocumentType.INVOICE,
    primaryColor: '#0F766E', // Emerald Teal
    defaultTaxMode: TaxMode.VAT_15,
    badge: 'Corporate Standard',
    bankingDetails: `Bank: Standard Bank of South Africa
Account Name: Apex Strategy Partners (Pty) Ltd
Account Number: 023 981 7462
Branch Code: 051001 (Sandton City)
Swift: SBZA ZA JJ
Reference: INV-{DOC_NUM}`,
    footerNotes: `1. Payment terms: 14 days from statement date via EFT.
2. Late payments accrue interest at prime + 2% per annum.
3. SARS Registered VAT Vendor # 4910283746.`,
    sampleLineItems: [
      { description: 'Strategic Business Model & B-BBEE Compliance Advisory (Senior Partner)', quantity: 12, unitPrice: 1850 },
      { description: 'Financial Systems Process Optimization & Cost Audit Report', quantity: 1, unitPrice: 18500 },
      { description: 'Executive Leadership Stakeholder Workshop (Half-Day Facilitation)', quantity: 1, unitPrice: 9500 },
      { description: 'Monthly Retainer Governance & Board Pack Review', quantity: 1, unitPrice: 7500 },
    ],
  },
  {
    id: 'tmpl-digital-agency',
    name: 'Digital Agency & Web Studio',
    industry: 'Creative & Tech',
    description: 'Tailored for software studios, UI/UX designers, marketing agencies, and media creators.',
    docType: DocumentType.QUOTE,
    primaryColor: '#6366F1', // Indigo
    defaultTaxMode: TaxMode.VAT_15,
    badge: 'Quotation Ready',
    bankingDetails: `Bank: Investec Bank South Africa
Account Name: PixelForge Interactive CC
Account Number: 100 119 28374
Branch Code: 580105 (Grayston Drive)
Reference: QUO-{DOC_NUM}`,
    footerNotes: `1. Quotation is valid for 30 calendar days from date of issue.
2. Project kickoff milestone: 40% deposit upon sprint contract signature.
3. Includes 3 revision rounds and 60 days post-launch warranty support.`,
    sampleLineItems: [
      { description: 'Custom Responsive React & Next.js Web Application Development', quantity: 1, unitPrice: 32000 },
      { description: 'Figma UI/UX High-Fidelity Design System & Interactive Prototypes', quantity: 1, unitPrice: 14500 },
      { description: 'SEO Optimization, Schema Microdata & Google Analytics 4 Setup', quantity: 1, unitPrice: 5500 },
      { description: 'Cloud Infrastructure Hosting, Domain SSL & 12-Month Security Maintenance', quantity: 12, unitPrice: 650 },
    ],
  },
  {
    id: 'tmpl-retail-wholesale',
    name: 'Wholesale, Supply & Retail',
    industry: 'Retail & Distribution',
    description: 'Bulk order supply, hardware parts, manufacturing goods, and commercial equipment sales.',
    docType: DocumentType.INVOICE,
    primaryColor: '#0284C7', // Sky blue
    defaultTaxMode: TaxMode.VAT_15,
    badge: 'Inventory & Bulk',
    bankingDetails: `Bank: Nedbank South Africa
Account Name: Vuma Industrial Supplies (Pty) Ltd
Account Number: 118 492 8471
Branch Code: 198765 (Midrand Central)
Reference: INV-{DOC_NUM}`,
    footerNotes: `1. Goods remain property of seller until paid in full.
2. Delivery note signature constitutes acceptance of quantity and condition.
3. SARS Tax Invoice. VAT No: 4890123847.`,
    sampleLineItems: [
      { description: 'Heavy-Duty Industrial Safety Boots (Size 9-11 Assorted)', quantity: 25, unitPrice: 420 },
      { description: 'High-Visibility Reflective Safety Vests with Custom Logo Print', quantity: 50, unitPrice: 85 },
      { description: 'Grade 8.8 Galvanized Metric Fastener Kit (Pack of 500)', quantity: 10, unitPrice: 680 },
      { description: 'Pallet Freight & Express Delivery (Gauteng Metro)', quantity: 1, unitPrice: 1450 },
    ],
  },
  {
    id: 'tmpl-automotive-fleet',
    name: 'Automotive & Fleet Repair',
    industry: 'Auto & Maintenance',
    description: 'Vehicle servicing, fleet maintenance, mechanical repairs, panel beating, and auto diagnostics.',
    docType: DocumentType.INVOICE,
    primaryColor: '#DC2626', // Red
    defaultTaxMode: TaxMode.VAT_15,
    badge: 'Fleet & Auto',
    bankingDetails: `Bank: ABSA Bank South Africa
Account Name: TurboTech Auto Works
Account Number: 408 920 1849
Branch Code: 632005 (Centurion)
Reference: INV-{DOC_NUM}`,
    footerNotes: `1. 6-Month / 10,000km guarantee on all genuine replacement parts.
2. Vehicles will only be released upon receipt of cleared payment or verified proof of payment (POP).
3. Storage fee of R150/day applies for vehicles uncollected after 3 working days.`,
    sampleLineItems: [
      { description: 'Major Fleet Service Inspection (Oil, Air, Fuel & Spark Plugs)', quantity: 2, unitPrice: 3800 },
      { description: 'OEM Front Brake Discs & Ceramic Brake Pads Replacement Set', quantity: 2, unitPrice: 2400 },
      { description: 'Wheel Balancing, 3D Laser Alignment & Suspension Check', quantity: 1, unitPrice: 750 },
      { description: 'Certified Automotive Technician Labour (4.5 Hours)', quantity: 4.5, unitPrice: 580 },
    ],
  },
  {
    id: 'tmpl-micro-smme-novat',
    name: 'Micro-Enterprise & Freelancer (No VAT)',
    industry: 'Small Business / Freelance',
    description: 'Designed specifically for non-VAT registered micro SMMEs under the R1M SARS mandatory threshold.',
    docType: DocumentType.INVOICE,
    primaryColor: '#475569', // Slate
    defaultTaxMode: TaxMode.NO_VAT,
    badge: 'Zero VAT (Exempt)',
    bankingDetails: `Bank: Capitec Bank South Africa
Account Name: K. Mokoena Photography & Media
Account Number: 168 940 2819
Branch Code: 470010 (Universal Branch Code)
Reference: INV-{DOC_NUM}`,
    footerNotes: `1. Non-VAT Vendor registered under SARS Small Business Exemption (Section 23 of VAT Act).
2. 0% VAT charged. Grand total is final payable amount.
3. Direct EFT or Capitec Pay to mobile: +27 72 345 6789. Thank you!`,
    sampleLineItems: [
      { description: 'Corporate Event Photography & Drone Aerial Coverage (Full Day)', quantity: 1, unitPrice: 4500 },
      { description: 'High-Resolution Color Grading & Post-Production Retouching (60 Photos)', quantity: 1, unitPrice: 1800 },
      { description: 'Social Media Highlight Reel Video Edit (60s 4K Format)', quantity: 1, unitPrice: 2200 },
    ],
  },
];

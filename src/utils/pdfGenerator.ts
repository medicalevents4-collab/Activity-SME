import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { InvoiceQuote, DocumentType, TaxMode } from '../types/schema';

// Helper to convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return { r: 15, g: 118, b: 110 }; // Default teal
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Generates an ultra-crisp vector PDF using native jsPDF drawing commands.
 */
export function generateVectorInvoicePdf(invoice: InvoiceQuote): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryRgb = hexToRgb(invoice.primaryColor || '#0F766E');
  const isInvoice = invoice.docType === DocumentType.INVOICE;

  // Margin and layout coordinates
  const leftMargin = 15;
  const rightMargin = 195;
  const pageWidth = 210;
  let currentY = 18;

  // Top Accent Bar
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.rect(0, 0, pageWidth, 4, 'F');

  // Business Header (Left side)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text(invoice.businessName || 'ActivityHub South Africa (Pty) Ltd', leftMargin, currentY);

  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // Slate-500

  if (invoice.businessRegNo) {
    doc.text(`Reg No: ${invoice.businessRegNo}`, leftMargin, currentY);
    currentY += 4;
  }
  if (invoice.vatNumber) {
    doc.text(`SARS VAT Reg No: ${invoice.vatNumber}`, leftMargin, currentY);
    currentY += 4;
  }
  if (invoice.businessAddress) {
    const addressLines = doc.splitTextToSize(invoice.businessAddress, 85);
    doc.text(addressLines, leftMargin, currentY);
    currentY += addressLines.length * 3.5;
  }
  if (invoice.businessEmail) {
    doc.text(`Email: ${invoice.businessEmail}`, leftMargin, currentY);
    currentY += 4;
  }

  // Document Badge & Details (Right side)
  const badgeText = isInvoice ? 'TAX INVOICE' : 'QUOTATION';
  const badgeWidth = 36;
  const badgeHeight = 7;
  const badgeX = rightMargin - badgeWidth;

  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.roundedRect(badgeX, 12, badgeWidth, badgeHeight, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(badgeText, badgeX + badgeWidth / 2, 16.5, { align: 'center' });

  // Document Number & Dates
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text(invoice.documentNumber, rightMargin, 24, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const issueDateFormatted = new Date(invoice.createdAt).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Issue Date: ${issueDateFormatted}`, rightMargin, 29, { align: 'right' });

  if (invoice.dueDate) {
    const dueDateFormatted = new Date(invoice.dueDate).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.text(`Due Date: ${dueDateFormatted}`, rightMargin, 34, { align: 'right' });
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text(`Status: ${invoice.status}`, rightMargin, 39, { align: 'right' });

  // Divider Line
  currentY = Math.max(currentY, 44);
  doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.setLineWidth(0.8);
  doc.line(leftMargin, currentY, rightMargin, currentY);
  currentY += 6;

  // Billed To / Client Box
  const clientBoxY = currentY;
  const boxHeight = 28;
  const boxWidth = rightMargin - leftMargin;

  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.3);
  doc.roundedRect(leftMargin, clientBoxY, boxWidth, boxHeight, 2, 2, 'FD');

  // Client Details Left
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text('BILLED TO / MEDICAL PRACTICE:', leftMargin + 4, clientBoxY + 5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.clientName, leftMargin + 4, clientBoxY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105); // Slate-600
  let clientDetailsY = clientBoxY + 14.5;

  if (invoice.clientAddress) {
    const lines = doc.splitTextToSize(invoice.clientAddress, 80);
    doc.text(lines, leftMargin + 4, clientDetailsY);
    clientDetailsY += lines.length * 3.5;
  }
  if (invoice.clientVatNo) {
    doc.text(`Client VAT Reg No: ${invoice.clientVatNo}`, leftMargin + 4, clientDetailsY);
  }

  // Client Details Right
  const midX = leftMargin + boxWidth / 2 + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('CONTACT & TAX TREATMENT:', midX, clientBoxY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  let contactY = clientBoxY + 10;

  if (invoice.clientEmail) {
    doc.text(`Email: ${invoice.clientEmail}`, midX, contactY);
    contactY += 4;
  }
  if (invoice.clientPhone) {
    doc.text(`Phone: ${invoice.clientPhone}`, midX, contactY);
    contactY += 4;
  }
  const taxModeText =
    invoice.taxMode === TaxMode.VAT_15
      ? 'Standard 15% VAT (South Africa)'
      : 'Zero Rated / Tax Exempt';
  doc.setFont('helvetica', 'bold');
  doc.text(`Tax Treatment: ${taxModeText}`, midX, contactY);

  currentY = clientBoxY + boxHeight + 6;

  // Line Items Table Header
  const tableHeaderY = currentY;
  const headerHeight = 7;
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.roundedRect(leftMargin, tableHeaderY, boxWidth, headerHeight, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Description / CPD Accredited Service', leftMargin + 4, tableHeaderY + 4.8);
  doc.text('Qty', 125, tableHeaderY + 4.8, { align: 'center' });
  doc.text('Unit Price (ZAR)', 155, tableHeaderY + 4.8, { align: 'right' });
  doc.text('Total (Excl. VAT)', rightMargin - 4, tableHeaderY + 4.8, { align: 'right' });

  currentY = tableHeaderY + headerHeight;

  // Line Items Body
  doc.setFontSize(8);
  invoice.lineItems.forEach((item, index) => {
    const rowHeight = 7.5;
    const isEven = index % 2 === 0;

    if (isEven) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.rect(leftMargin, currentY, boxWidth, rowHeight, 'F');

    // Bottom subtle border
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.2);
    doc.line(leftMargin, currentY + rowHeight, rightMargin, currentY + rowHeight);

    // Item details
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    const descLines = doc.splitTextToSize(item.description, 95);
    doc.text(descLines[0] || item.description, leftMargin + 4, currentY + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(String(item.quantity), 125, currentY + 4.8, { align: 'center' });
    doc.text(
      `R ${item.unitPrice.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
      155,
      currentY + 4.8,
      { align: 'right' }
    );

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(
      `R ${item.lineTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
      rightMargin - 4,
      currentY + 4.8,
      { align: 'right' }
    );

    currentY += rowHeight;
  });

  // Table Outer Border
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.rect(leftMargin, tableHeaderY, boxWidth, currentY - tableHeaderY, 'D');

  currentY += 6;

  // Totals Summary Box (Right aligned)
  const totalsWidth = 75;
  const totalsX = rightMargin - totalsWidth;
  const totalsY = currentY;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', totalsX, totalsY + 4);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(
    `R ${invoice.subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
    rightMargin - 2,
    totalsY + 4,
    { align: 'right' }
  );

  const vatLabel = `SARS 15% VAT (${invoice.taxMode === TaxMode.VAT_15 ? '15%' : '0%'}):`;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(vatLabel, totalsX, totalsY + 9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(
    `R ${invoice.vatAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
    rightMargin - 2,
    totalsY + 9,
    { align: 'right' }
  );

  // Grand Total Line
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(totalsX, totalsY + 12, rightMargin, totalsY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Grand Total (ZAR):', totalsX, totalsY + 17);

  doc.setFontSize(11);
  doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.text(
    `R ${invoice.grandTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
    rightMargin - 2,
    totalsY + 17,
    { align: 'right' }
  );

  currentY = totalsY + 24;

  // Banking Details & Footer Notes Boxes
  const footerBoxWidth = (boxWidth - 6) / 2;

  if (invoice.bankingDetails || invoice.footerNotes) {
    // Banking Details Box (Left)
    if (invoice.bankingDetails) {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(leftMargin, currentY, footerBoxWidth, 24, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('SOUTH AFRICAN BANKING DETAILS', leftMargin + 3.5, currentY + 4.5);

      doc.setFont('courier', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      const bankLines = doc.splitTextToSize(invoice.bankingDetails, footerBoxWidth - 7);
      doc.text(bankLines, leftMargin + 3.5, currentY + 9);
    }

    // Terms / Notes Box (Right)
    if (invoice.footerNotes) {
      const notesX = leftMargin + footerBoxWidth + 6;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.roundedRect(notesX, currentY, footerBoxWidth, 24, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('TERMS & CPD CERTIFICATION NOTES', notesX + 3.5, currentY + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      const noteLines = doc.splitTextToSize(invoice.footerNotes, footerBoxWidth - 7);
      doc.text(noteLines, notesX + 3.5, currentY + 9);
    }

    currentY += 28;
  }

  // Footer Disclaimer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Generated by ActivityHub Multi-Tenant Healthcare Platform (SARS 15% VAT compliant).',
    leftMargin,
    285
  );

  // File Name Clean
  const cleanNumber = invoice.documentNumber.replace(/[^a-zA-Z0-9-_]/g, '_');
  const cleanClient = invoice.clientName.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 20);
  const fileName = `${invoice.docType}_${cleanNumber}_${cleanClient}.pdf`;

  doc.save(fileName);
}

/**
 * Downloads a high-resolution PDF of the invoice from the modal element with vector fallback.
 */
export async function downloadInvoicePdf(
  invoice: InvoiceQuote,
  elementId: string = 'invoice-printable-doc'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    generateVectorInvoicePdf(invoice);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Sharp 2x retina
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1024,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    const cleanNumber = invoice.documentNumber.replace(/[^a-zA-Z0-9-_]/g, '_');
    const cleanClient = invoice.clientName.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 20);
    const fileName = `${invoice.docType}_${cleanNumber}_${cleanClient}.pdf`;

    pdf.save(fileName);
  } catch (err) {
    console.warn('Canvas capture fallback to vector PDF:', err);
    generateVectorInvoicePdf(invoice);
  }
}

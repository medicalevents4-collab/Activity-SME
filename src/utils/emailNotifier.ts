import { InvoiceQuote, Tenant, EmailNotificationLog, DocumentType, TaxMode } from '../types/schema';

/**
  * Generates a fully formatted, professional HTML email body for sending an invoice copy to a client.
  */
export function generateInvoiceEmailHtml(invoice: InvoiceQuote, tenant?: Tenant): string {
  const isInvoice = invoice.docType === DocumentType.INVOICE;
  const docTypeName = isInvoice ? 'Tax Invoice' : 'Official Quotation';
  const brandColor = invoice.primaryColor || '#D97706';
  const businessName = invoice.businessName || tenant?.name || 'ActivityHub SMME';
  const recipientName = invoice.contactPerson || invoice.clientName || 'Valued Client';
  const dueDateFormatted = invoice.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Upon Receipt (Net EFT)';
  const issueDateFormatted = new Date(invoice.createdAt).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const itemsRows = invoice.lineItems
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 12px; font-size: 13px; color: #1f2937; font-weight: 500;">
          ${item.description}
        </td>
        <td style="padding: 10px 12px; font-size: 13px; color: #4b5563; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px 12px; font-size: 13px; color: #4b5563; text-align: right; font-family: monospace;">
          R ${item.unitPrice.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
        </td>
        <td style="padding: 10px 12px; font-size: 13px; color: #111827; text-align: right; font-family: monospace; font-weight: 600;">
          R ${item.lineTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
        </td>
      </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${docTypeName} ${invoice.documentNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
          
          <!-- Top Accent Stripe -->
          <tr>
            <td style="height: 6px; background-color: ${brandColor};"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 20px; background-color: #ffffff; border-bottom: 1px solid #f3f4f6;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: middle;">
                    ${
                      invoice.logoUrl
                        ? `<img src="${invoice.logoUrl}" alt="${businessName}" style="max-height: 48px; max-width: 140px; object-fit: contain; margin-bottom: 8px; border-radius: 6px;" />`
                        : ''
                    }
                    <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #111827;">${businessName}</h1>
                    ${
                      invoice.vatNumber
                        ? `<p style="margin: 2px 0 0; font-size: 11px; color: #6b7280; font-family: monospace;">SARS VAT Reg: ${invoice.vatNumber}</p>`
                        : ''
                    }
                  </td>
                  <td style="text-align: right; vertical-align: middle;">
                    <span style="display: inline-block; padding: 4px 12px; background-color: ${brandColor}15; color: ${brandColor}; border: 1px solid ${brandColor}30; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${docTypeName}
                    </span>
                    <p style="margin: 6px 0 0; font-size: 14px; font-weight: 700; color: #111827; font-family: monospace;">
                      ${invoice.documentNumber}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Notification Callout Banner -->
          <tr>
            <td style="padding: 16px 32px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="28" style="vertical-align: middle; font-size: 18px;">📄</td>
                  <td style="vertical-align: middle; font-size: 13px; color: #334155;">
                    <strong>Automated Billing Notification:</strong> A copy of your ${docTypeName.toLowerCase()} is enclosed below.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 28px 32px;">
              <p style="margin: 0 0 16px; font-size: 15px; color: #1f2937; line-height: 1.6;">
                Dear <strong>${recipientName}</strong>,
              </p>
              <p style="margin: 0 0 20px; font-size: 14px; color: #4b5563; line-height: 1.6;">
                Please find enclosed a copy of <strong>${docTypeName} ${invoice.documentNumber}</strong> for services/supplies provided to <strong>${invoice.clientName}</strong>.
              </p>

              <!-- Document Summary Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="50%" style="padding-bottom: 10px;">
                          <span style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 600; display: block;">Date Issued</span>
                          <span style="font-size: 13px; color: #111827; font-weight: 500;">${issueDateFormatted}</span>
                        </td>
                        <td width="50%" style="padding-bottom: 10px;">
                          <span style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 600; display: block;">Payment Due Date</span>
                          <span style="font-size: 13px; color: #b91c1c; font-weight: 700;">${dueDateFormatted}</span>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%">
                          <span style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 600; display: block;">Recipient Entity</span>
                          <span style="font-size: 13px; color: #111827; font-weight: 600;">${invoice.clientName}</span>
                        </td>
                        <td width="50%">
                          <span style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 600; display: block;">Total Amount (ZAR)</span>
                          <span style="font-size: 18px; color: ${brandColor}; font-weight: 800; font-family: monospace;">
                            R ${invoice.grandTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Itemized Table Preview -->
              <h3 style="margin: 0 0 10px; font-size: 13px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">
                Itemized Summary
              </h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
                <thead>
                  <tr style="background-color: #f3f4f6; color: #374151; font-size: 11px; text-transform: uppercase; font-weight: 700;">
                    <th style="padding: 8px 12px; text-align: left;">Item</th>
                    <th style="padding: 8px 12px; text-align: center; width: 40px;">Qty</th>
                    <th style="padding: 8px 12px; text-align: right; width: 90px;">Rate</th>
                    <th style="padding: 8px 12px; text-align: right; width: 100px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>

              <!-- Totals Breakdown -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td width="50%"></td>
                  <td width="50%">
                    <table width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 13px;">
                      <tr>
                        <td style="color: #6b7280;">Subtotal (Excl. VAT):</td>
                        <td style="text-align: right; font-family: monospace; font-weight: 600; color: #111827;">
                          R ${invoice.subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280;">
                          SARS 15% VAT ${invoice.taxMode === TaxMode.NO_VAT ? '(0%)' : ''}:
                        </td>
                        <td style="text-align: right; font-family: monospace; font-weight: 600; color: #111827;">
                          R ${invoice.vatAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr style="border-top: 2px solid #111827;">
                        <td style="padding-top: 8px; font-weight: 700; color: #111827; font-size: 14px;">Grand Total:</td>
                        <td style="padding-top: 8px; text-align: right; font-family: monospace; font-weight: 800; color: ${brandColor}; font-size: 16px;">
                          R ${invoice.grandTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${
                invoice.bankingDetails
                  ? `
              <!-- Banking & Payment Instructions -->
              <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 8px; font-size: 12px; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">
                  🇿🇦 South African EFT Banking Settlement Details
                </h4>
                <pre style="margin: 0; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 12px; color: #334155; line-height: 1.5; white-space: pre-wrap;">${invoice.bankingDetails}</pre>
                <p style="margin: 10px 0 0; font-size: 11px; color: #64748b;">
                  * Please use payment reference: <strong style="color: #0f172a; font-family: monospace;">${invoice.documentNumber}</strong>
                </p>
              </div>`
                  : ''
              }

              ${
                invoice.footerNotes
                  ? `
              <!-- Terms & Notes -->
              <div style="border-left: 3px solid ${brandColor}; padding-left: 12px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 12px; color: #6b7280; line-height: 1.5; white-space: pre-wrap;">
                  ${invoice.footerNotes}
                </p>
              </div>`
                  : ''
              }

              <!-- PDF Attachment Notice -->
              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 12px 16px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td width="24" style="vertical-align: middle; font-size: 16px;">📎</td>
                    <td style="vertical-align: middle; font-size: 12px; color: #065f46; font-weight: 500;">
                      <strong>Official PDF Attached:</strong> <code style="background-color: #ffffff; padding: 2px 6px; border-radius: 4px; border: 1px solid #d1fae5; font-family: monospace;">${invoice.documentNumber}.pdf</code> (${invoice.docType === DocumentType.INVOICE ? 'SARS Tax Compliant Document' : 'Official Estimate'})
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Sign-off -->
              <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.5;">
                Kind regards,<br>
                <strong style="color: #111827;">${businessName} Accounts Team</strong><br>
                ${invoice.businessEmail ? `<a href="mailto:${invoice.businessEmail}" style="color: ${brandColor}; text-decoration: none;">${invoice.businessEmail}</a>` : ''}
                ${invoice.businessPhone ? ` &bull; ${invoice.businessPhone}` : ''}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 11px; color: #6b7280;">
                This automated notification was generated and dispatched by ActivityHub SMME Multi-Tenant Daily Management Platform.
              </p>
              <p style="margin: 0; font-size: 10px; color: #9ca3af;">
                Recipient: ${invoice.clientEmail} &bull; Sent on ${new Date().toLocaleString('en-ZA')}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Creates a structured EmailNotificationLog record and formats the email payload.
 */
export function buildAutomatedEmailLog(
  invoice: InvoiceQuote,
  tenant: Tenant,
  trigger: 'STATUS_CHANGED_TO_SENT' | 'CREATED_AS_SENT' | 'MANUAL_TRIGGER' = 'STATUS_CHANGED_TO_SENT'
): EmailNotificationLog {
  const isInvoice = invoice.docType === DocumentType.INVOICE;
  const docTypeLabel = isInvoice ? 'Tax Invoice' : 'Quotation';
  const businessName = invoice.businessName || tenant.name;
  const senderEmail =
    invoice.businessEmail || tenant.businessEmail || `billing@${tenant.slug || 'activityhub'}.co.za`;
  const recipientEmail = invoice.clientEmail || 'client@example.co.za';
  const recipientName = invoice.contactPerson || invoice.clientName || 'Accounts Dept';
  const subject = `${docTypeLabel} ${invoice.documentNumber} from ${businessName}`;
  const now = new Date().toISOString();
  const messageId = `MSG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const bodyHtml = generateInvoiceEmailHtml(invoice, tenant);
  const previewSnippet = `${docTypeLabel} ${invoice.documentNumber} for R ${invoice.grandTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} has been issued to ${invoice.clientName}. Payment due: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-ZA') : 'Upon receipt'}.`;

  return {
    id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    tenantId: tenant.id,
    invoiceId: invoice.id,
    documentNumber: invoice.documentNumber,
    docType: invoice.docType,
    recipientEmail,
    recipientName,
    senderEmail,
    senderName: `${businessName} Finance & Billing`,
    subject,
    sentAt: now,
    status: 'DELIVERED',
    messageId,
    grandTotal: invoice.grandTotal,
    dueDate: invoice.dueDate,
    previewSnippet,
    trigger,
    bodyHtml,
  };
}

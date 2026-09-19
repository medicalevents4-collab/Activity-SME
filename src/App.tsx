import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { InvoiceManager } from './components/invoices/InvoiceManager';
import { ClientManager } from './components/clients/ClientManager';
import { TemplatesManager } from './components/templates/TemplatesManager';
import { PricingCalculator } from './components/calculator/PricingCalculator';
import { SubscriptionManager } from './components/subscriptions/SubscriptionManager';
import { WhatsAppHub } from './components/whatsapp/WhatsAppHub';
import { FileVault } from './components/files/FileVault';
import { TenantManager } from './components/tenants/TenantManager';
import { PrismaExplorer } from './components/schema/PrismaExplorer';
import { EmailPreviewModal } from './components/email/EmailPreviewModal';
import { EmailOutboxModal } from './components/email/EmailOutboxModal';
import { TemplateEditor } from './components/templates/TemplateEditor';
import { CheckCircle2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    activeTab,
    toastMessage,
    selectedEmailForView,
    setSelectedEmailForView,
    isEmailOutboxOpen,
    setIsEmailOutboxOpen,
    isTemplateEditorOpen,
    setIsTemplateEditorOpen,
    templateToEdit,
  } = useApp();

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e2e8f0] flex flex-col font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-x-hidden">
      {/* Dynamic Frosted Glass Mesh Gradient Background */}
      <div className="mesh-bg" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
          <Sidebar />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
            {activeTab === 'overview' && <OverviewDashboard />}
            {activeTab === 'invoices' && <InvoiceManager />}
            {activeTab === 'clients' && <ClientManager />}
            {activeTab === 'templates' && <TemplatesManager />}
            {activeTab === 'calculator' && <PricingCalculator />}
            {activeTab === 'subscriptions' && <SubscriptionManager />}
            {activeTab === 'whatsapp' && <WhatsAppHub />}
            {activeTab === 'files' && <FileVault />}
            {activeTab === 'tenants' && <TenantManager />}
            {activeTab === 'schema' && <PrismaExplorer />}
          </main>
        </div>
      </div>

      {/* Global Automated Email Outbox & Logs Modal */}
      <EmailOutboxModal
        isOpen={isEmailOutboxOpen}
        onClose={() => setIsEmailOutboxOpen(false)}
      />

      {/* Global Automated Email Preview / Audit Modal */}
      {selectedEmailForView && (
        <EmailPreviewModal
          isOpen={!!selectedEmailForView}
          emailLog={selectedEmailForView}
          onClose={() => setSelectedEmailForView(null)}
        />
      )}

      {/* Global Template Customizer Studio Modal */}
      {isTemplateEditorOpen && (
        <TemplateEditor
          isOpen={isTemplateEditorOpen}
          initialTemplate={templateToEdit}
          onClose={() => setIsTemplateEditorOpen(false)}
        />
      )}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="glass-modal text-slate-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 text-xs sm:text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

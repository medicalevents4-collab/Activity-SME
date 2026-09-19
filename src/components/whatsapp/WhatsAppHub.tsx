import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Message, WhatsAppConversation, Role } from '../../types/schema';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  ShieldCheck,
  Paperclip,
  Search,
  CheckCheck,
  FileText,
  Award,
  Phone,
  Sparkles,
  Zap,
  CheckCircle2,
  Receipt,
  Plus,
} from 'lucide-react';

export const WhatsAppHub: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    createConversation,
    invoices,
    cpdRecords,
    currentTenant,
    currentUser,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [senderRole, setSenderRole] = useState<'AGENT' | 'USER' | 'BOT'>('AGENT');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newPhone, setNewPhone] = useState('+27 ');
  const [newClientName, setNewClientName] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  const filteredConversations = conversations.filter(
    (c) =>
      (c.clientName && c.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.phoneNumber.includes(searchQuery)
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !activeConv) return;

    sendMessage(activeConv.id, inputMessage.trim(), senderRole);
    setInputMessage('');
  };

  const handleQuickAction = (actionType: 'invoice' | 'certificate' | 'banking' | 'ethics_faq') => {
    if (!activeConv) return;

    if (actionType === 'invoice') {
      const inv = invoices.find((i) => i.tenantId === currentTenant.id) || invoices[0];
      const text = `Hi ${activeConv.clientName || 'Doctor'}, here is your official Tax Invoice #${inv.documentNumber} for R ${inv.grandTotal.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} (15% SARS VAT inclusive).\nDue Date: ${inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-ZA') : 'Upon receipt'}.`;
      sendMessage(activeConv.id, text, 'AGENT', {
        type: 'INVOICE',
        title: `Tax Invoice #${inv.documentNumber}`,
        number: inv.documentNumber,
        amount: inv.grandTotal,
      });
    } else if (actionType === 'certificate') {
      const record = cpdRecords[0];
      const text = `Dr. ${activeConv.clientName || 'Doctor'}, your HPCSA CPD Certificate for "${record.eventName || record.category}" is ready!\nPoints: ${record.points} CPD Points\nCertificate No: ${record.certificateNumber}`;
      sendMessage(activeConv.id, text, 'AGENT', {
        type: 'CERTIFICATE',
        title: `CPD Certificate - ${record.points} Points`,
        number: record.certificateNumber || 'CPD-2026',
      });
    } else if (actionType === 'banking') {
      const text = `MedEvents Africa Standard Bank Banking Details:\nAccount: 023 481 9204\nBranch: 051001 (Sandton)\nRef: ${activeConv.clientName ? activeConv.clientName.split(' ')[0] : 'MED'}-2026`;
      sendMessage(activeConv.id, text, 'BOT');
    } else if (actionType === 'ethics_faq') {
      const text = `HPCSA Compliance Tip: All registered medical practitioners require 30 CPD points per 12-month cycle, with a minimum of 5 points in Ethics, Human Rights & Medical Law. Our upcoming ethics masterclass awards 5 full Ethics points!`;
      sendMessage(activeConv.id, text, 'BOT');
    }
  };

  const handleCreateNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone.trim() || !newClientName.trim()) return;
    const id = createConversation(newPhone.trim(), newClientName.trim());
    setIsNewChatModalOpen(false);
    setNewPhone('+27 ');
    setNewClientName('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            WhatsApp Client Communication Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time client messaging, automated quote/invoice delivery, and AI assistant replies.
          </p>
        </div>

        <button
          onClick={() => setIsNewChatModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New WhatsApp Chat</span>
        </button>
      </div>

      {/* WhatsApp Container */}
      <div className="glass-card rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 h-[700px] border border-white/10">
        {/* Left Pane: Conversations List (4 cols) */}
        <div className="md:col-span-4 border-r border-white/[0.08] flex flex-col h-full bg-white/[0.02]">
          {/* Header & Search */}
          <div className="p-4 border-b border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-300 uppercase tracking-wider">
                Active Chats ({conversations.length})
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                WhatsApp API v2.4
              </span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8 pr-3 py-1.5 glass-input rounded-xl text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
            {filteredConversations.map((conv) => {
              const lastMessage = conv.messages[conv.messages.length - 1];
              const isSelected = activeConv?.id === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`p-3.5 cursor-pointer flex items-center gap-3 transition-colors ${
                    isSelected ? 'bg-indigo-600/20 border-l-4 border-indigo-500' : 'hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {conv.clientName ? conv.clientName.substring(0, 2).toUpperCase() : 'WA'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-100 truncate">
                        {conv.clientName || conv.phoneNumber}
                      </h4>
                      {lastMessage && (
                        <span className="text-[10px] text-slate-500">
                          {new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 font-mono truncate">{conv.phoneNumber}</p>

                    {lastMessage && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        <span className="font-semibold text-slate-300">
                          {lastMessage.sender === 'AGENT' ? 'You: ' : lastMessage.sender === 'BOT' ? '🤖 Bot: ' : ''}
                        </span>
                        {lastMessage.body}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Active Chat Window (8 cols) */}
        {activeConv ? (
          <div className="md:col-span-8 flex flex-col h-full bg-slate-950/40">
            {/* Chat Top Bar */}
            <div className="p-3.5 bg-white/[0.03] border-b border-white/[0.08] flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  {activeConv.clientName ? activeConv.clientName.substring(0, 2).toUpperCase() : 'WA'}
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-100">{activeConv.clientName || 'Doctor Client'}</h3>
                  <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>{activeConv.phoneNumber}</span>
                    <span className="text-emerald-400 font-medium">● Online via WhatsApp Business</span>
                  </p>
                </div>
              </div>

              {/* Sender Role Switcher */}
              <div className="flex items-center gap-2 bg-white/[0.04] px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold hidden sm:inline">
                  Simulate Sender:
                </span>
                <select
                  value={senderRole}
                  onChange={(e) => setSenderRole(e.target.value as any)}
                  className="bg-transparent text-slate-200 font-bold text-xs focus:outline-none cursor-pointer"
                >
                  <option value="AGENT" className="bg-slate-900 text-slate-200">👨‍⚕️ Agent (Staff)</option>
                  <option value="USER" className="bg-slate-900 text-slate-200">🩺 Client Doctor (User)</option>
                  <option value="BOT" className="bg-slate-900 text-slate-200">🤖 AI Assistant (Bot)</option>
                </select>
              </div>
            </div>

            {/* Quick Actions Ribbon */}
            <div className="bg-white/[0.02] px-3 py-2 border-b border-white/[0.06] flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-slate-400 font-bold flex items-center gap-1 flex-shrink-0">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Quick Dispatch:</span>
              </span>
              <button
                onClick={() => handleQuickAction('invoice')}
                className="px-2.5 py-1 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 rounded-lg font-semibold border border-emerald-500/30 whitespace-nowrap transition-colors"
              >
                + Send Tax Invoice
              </button>
              <button
                onClick={() => handleQuickAction('certificate')}
                className="px-2.5 py-1 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 rounded-lg font-semibold border border-amber-500/30 whitespace-nowrap transition-colors"
              >
                + Send CPD Certificate
              </button>
              <button
                onClick={() => handleQuickAction('banking')}
                className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 rounded-lg font-semibold border border-indigo-500/30 whitespace-nowrap transition-colors"
              >
                + Bank Details
              </button>
              <button
                onClick={() => handleQuickAction('ethics_faq')}
                className="px-2.5 py-1 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 rounded-lg font-semibold border border-purple-500/30 whitespace-nowrap transition-colors"
              >
                + HPCSA Ethics FAQ
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-black/20">
              {activeConv.messages.map((msg) => {
                const isAgent = msg.sender === 'AGENT';
                const isBot = msg.sender === 'BOT';
                const isUser = msg.sender === 'USER';

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isUser ? 'justify-start' : 'justify-end'} text-xs`}
                  >
                    <div
                      className={`max-w-md rounded-2xl p-4 shadow-lg space-y-2 border ${
                        isUser
                          ? 'bg-white/[0.06] text-slate-200 rounded-tl-xs border-white/10'
                          : isBot
                          ? 'bg-indigo-950/60 text-slate-200 rounded-tr-xs border-indigo-500/30 shadow-indigo-950/40'
                          : 'bg-emerald-950/50 text-slate-200 rounded-tr-xs border-emerald-500/30 shadow-emerald-950/40'
                      }`}
                    >
                      {/* Sender Tag */}
                      <div className="flex items-center justify-between gap-2 border-b pb-1.5 mb-1.5 border-white/10">
                        <span className={`text-[10px] font-bold ${isBot ? 'text-indigo-400' : isAgent ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {isUser
                            ? `Client: ${activeConv.clientName || 'Doctor'}`
                            : isBot
                            ? '🤖 MedEvents AI Bot'
                            : '👨‍⚕️ CPD Coordinator'}
                        </span>
                        <span className="text-[9px] text-slate-500">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Message Content */}
                      <p className="whitespace-pre-line leading-relaxed text-xs text-slate-200">{msg.body}</p>

                      {/* Document Attachment Card */}
                      {msg.documentAttachment && (
                        <div className="mt-2.5 p-3 bg-white/[0.04] rounded-2xl border border-white/10 text-slate-200 flex items-center gap-3 shadow-md">
                          <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 flex-shrink-0">
                            {msg.documentAttachment.type === 'INVOICE' ? (
                              <Receipt className="w-5 h-5" />
                            ) : (
                              <Award className="w-5 h-5" />
                            )}
                          </div>
                          <div className="truncate flex-1">
                            <span className="text-[10px] font-bold uppercase text-emerald-400 block">
                              {msg.documentAttachment.type === 'INVOICE' ? 'SARS 15% VAT Document' : 'CPD Accredited Certificate'}
                            </span>
                            <p className="font-bold text-xs truncate text-slate-100">{msg.documentAttachment.title}</p>
                            {msg.documentAttachment.amount && (
                              <p className="text-[11px] font-mono font-bold text-emerald-400 mt-0.5">
                                R {msg.documentAttachment.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3.5 bg-white/[0.03] border-t border-white/[0.08] flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Type message as ${senderRole === 'AGENT' ? 'Staff Agent' : senderRole === 'BOT' ? 'AI Bot' : 'Client Doctor'}...`}
                className="flex-1 px-4 py-2 glass-input rounded-full text-xs text-slate-100 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-full transition-colors shadow-lg shadow-emerald-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="md:col-span-8 flex items-center justify-center p-8 text-slate-500">
            Select a conversation to start chatting.
          </div>
        )}
      </div>

      {/* New WhatsApp Chat Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-modal rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-150">
            <h3 className="text-base font-bold text-slate-100 mb-1">Start New WhatsApp Chat</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter the healthcare professional or practice's details to initialize conversation.
            </p>

            <form onSubmit={handleCreateNewChat} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Doctor / Practice Name *</label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  required
                  placeholder="e.g. Dr. Lerato Modise"
                  className="w-full px-3 py-2 glass-input rounded-xl text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">WhatsApp Phone Number *</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  required
                  placeholder="+27 82 123 4567"
                  className="w-full px-3 py-2 glass-input rounded-xl font-mono text-xs text-emerald-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsNewChatModalOpen(false)}
                  className="px-4 py-2 border border-white/10 hover:bg-white/[0.06] text-slate-300 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Start Conversation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

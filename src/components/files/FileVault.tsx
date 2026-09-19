import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileStorage } from '../../types/schema';
import {
  FolderArchive,
  UploadCloud,
  FileText,
  Trash2,
  Download,
  Search,
  HardDrive,
  CheckCircle,
  FileSpreadsheet,
  FileCode,
  Shield,
  Layers,
  FileCheck2,
} from 'lucide-react';

export const FileVault: React.FC = () => {
  const { files, uploadFile, deleteFile, currentTenant } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isUploading, setIsUploading] = useState(false);
  const [mockFileName, setMockFileName] = useState('');
  const [mockCategory, setMockCategory] = useState<FileStorage['category']>('INVOICE');

  const tenantFiles = files.filter((f) => f.tenantId === currentTenant.id);

  const filteredFiles = tenantFiles.filter((f) => {
    const matchesSearch =
      f.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.s3Key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || f.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalBytes = tenantFiles.reduce((acc, f) => acc + f.fileSize, 0);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleSimulateUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockFileName.trim()) return;

    uploadFile({
      name: mockFileName.trim(),
      size: Math.floor(150000 + Math.random() * 4000000), // 150KB to 4MB
      mimeType: mockFileName.endsWith('.pdf')
        ? 'application/pdf'
        : mockFileName.endsWith('.xlsx')
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/octet-stream',
      category: mockCategory,
    });

    setIsUploading(false);
    setMockFileName('');
  };

  const getCategoryBadge = (cat?: FileStorage['category']) => {
    switch (cat) {
      case 'INVOICE':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'QUOTE':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'SARS_TAX_CLEARANCE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'B_BBEE':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'CIPC_DOC':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'CONTRACT':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      case 'RECEIPT':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-white/10 text-slate-300 border-white/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Encrypted S3 File & Compliance Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Secure cloud storage in AWS Region <code className="font-mono text-indigo-300 font-bold">af-south-1</code> (Cape Town) for tax invoices, CIPC, B-BBEE, and contracts.
          </p>
        </div>

        <button
          onClick={() => setIsUploading(!isUploading)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* S3 Storage Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Vault Files</span>
          <p className="text-xl font-bold font-mono text-slate-100 mt-1">{tenantFiles.length}</p>
          <span className="text-[10px] text-slate-500">AES-256 Server-Side Encryption</span>
        </div>

        <div className="glass-card p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">Storage Used</span>
          <p className="text-xl font-bold font-mono text-indigo-300 mt-1">{formatFileSize(totalBytes)}</p>
          <span className="text-[10px] text-indigo-400/80">Of 50 GB Allotted Quota</span>
        </div>

        <div className="glass-card p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">AWS Region</span>
          <p className="text-xl font-bold font-mono text-emerald-400 mt-1">af-south-1</p>
          <span className="text-[10px] text-emerald-500/80">Cape Town Low-Latency DC</span>
        </div>

        <div className="glass-card p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">Tenant Bucket</span>
          <p className="text-sm font-bold font-mono text-amber-300 mt-1 truncate">
            activityhub-prod-{currentTenant.slug}
          </p>
          <span className="text-[10px] text-amber-500/80">Isolated Tenant Prefix</span>
        </div>
      </div>

      {/* Upload Simulation Card */}
      {isUploading && (
        <form onSubmit={handleSimulateUpload} className="glass-card p-6 rounded-3xl border border-indigo-500/40 bg-indigo-950/20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-indigo-400" />
              <span>Upload Document to Encrypted S3 Bucket</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsUploading(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Document File Name</label>
              <input
                type="text"
                value={mockFileName}
                onChange={(e) => setMockFileName(e.target.value)}
                placeholder="e.g. SARS_Tax_Pin_2026.pdf or B_BBEE_Affidavit.pdf"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Document Classification</label>
              <select
                value={mockCategory}
                onChange={(e) => setMockCategory(e.target.value as any)}
                className="w-full glass-input px-3 py-2 rounded-xl text-xs font-medium text-slate-200"
              >
                <option value="INVOICE" className="bg-slate-900">Tax Invoice PDF</option>
                <option value="QUOTE" className="bg-slate-900">Quotation / Estimate</option>
                <option value="SARS_TAX_CLEARANCE" className="bg-slate-900">SARS Tax Clearance / PIN</option>
                <option value="B_BBEE" className="bg-slate-900">B-BBEE Affidavit / Certificate</option>
                <option value="CIPC_DOC" className="bg-slate-900">CIPC Registration Certificate</option>
                <option value="CONTRACT" className="bg-slate-900">Client Service Contract / SLA</option>
                <option value="RECEIPT" className="bg-slate-900">Payment Receipt / Bank Confirmation</option>
                <option value="OTHER" className="bg-slate-900">Other General Business Doc</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
            >
              Simulate Secure S3 PutObject
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by file name or S3 key..."
            className="w-full pl-9 pr-3 py-1.5 text-xs glass-input rounded-xl focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'INVOICE', 'QUOTE', 'SARS_TAX_CLEARANCE', 'B_BBEE', 'CIPC_DOC', 'CONTRACT'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {cat === 'ALL' ? 'All Files' : cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Files Table */}
      <div className="glass-card rounded-3xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] text-slate-400 font-semibold border-b border-white/[0.08]">
              <tr>
                <th className="p-3.5 pl-4">File Name & S3 Key</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">File Size</th>
                <th className="p-3.5">Upload Date</th>
                <th className="p-3.5 text-right pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No files found matching your search.
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="p-3.5 pl-4 font-bold text-slate-100 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate max-w-[240px] sm:max-w-md">
                        <span className="block truncate">{file.fileName}</span>
                        <span className="font-mono text-[10px] text-slate-400 block truncate">{file.s3Key}</span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryBadge(file.category)}`}>
                        {file.category || 'GENERAL'}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-slate-300">
                      {formatFileSize(file.fileSize)}
                    </td>

                    <td className="p-3.5 text-slate-400">
                      {new Date(file.createdAt).toLocaleDateString('en-ZA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    <td className="p-3.5 pr-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={file.s3Url}
                          download={file.fileName}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-white/10 rounded-lg transition-colors"
                          title="Download from S3"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => {
                            if (confirm(`Delete file "${file.fileName}" from S3 vault?`)) {
                              deleteFile(file.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete from S3"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

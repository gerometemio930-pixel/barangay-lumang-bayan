import React, { useState } from 'react';
import { X, Search, CheckCircle, Clock, AlertTriangle, FileText, Printer, ArrowRight } from 'lucide-react';
import { ServiceRequest } from '../types';

interface ReferenceLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: ServiceRequest[];
  onOpenCertificate: (req: ServiceRequest) => void;
}

export const ReferenceLookupModal: React.FC<ReferenceLookupModalProps> = ({
  isOpen,
  onClose,
  requests,
  onOpenCertificate
}) => {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<ServiceRequest | null>(null);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim().toUpperCase();
    if (!clean) return;

    const match = requests.find(
      (r) => r.referenceNumber.toUpperCase() === clean || r.id.toUpperCase() === clean
    );
    setResult(match || null);
    setSearched(true);
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Approved':
        return { color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: CheckCircle, label: 'Approved / Ready for Release' };
      case 'Completed':
        return { color: 'text-blue-700 bg-blue-50 border-blue-200', icon: CheckCircle, label: 'Completed / Document Issued' };
      case 'Waiting for Captain Approval':
        return { color: 'text-purple-700 bg-purple-50 border-purple-200', icon: Clock, label: 'Awaiting Punong Barangay Signature' };
      case 'Processing':
        return { color: 'text-amber-700 bg-amber-50 border-amber-200', icon: Clock, label: 'Under Document Verification' };
      case 'Rejected':
        return { color: 'text-rose-700 bg-rose-50 border-rose-200', icon: AlertTriangle, label: 'Returned / Rejected' };
      default:
        return { color: 'text-slate-700 bg-slate-100 border-slate-200', icon: Clock, label: 'Pending Initial Review' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Public Document & Request Verification</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Enter the official tracking reference code (e.g., <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">LB-2026-0189</code>) 
            to verify document validity or check application status in real-time.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. LB-2026-0189"
              className="flex-1 px-4 py-2.5 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
              required
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Search className="w-4 h-4" />
              Verify
            </button>
          </form>

          {/* Quick sample chips */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span>Try sample:</span>
            <button
              type="button"
              onClick={() => {
                setQuery('LB-2026-0189');
                const match = requests.find((r) => r.referenceNumber === 'LB-2026-0189');
                setResult(match || null);
                setSearched(true);
              }}
              className="underline text-blue-600 hover:text-blue-800 font-mono"
            >
              LB-2026-0189 (Approved)
            </button>
            <button
              type="button"
              onClick={() => {
                setQuery('LB-2026-0204');
                const match = requests.find((r) => r.referenceNumber === 'LB-2026-0204');
                setResult(match || null);
                setSearched(true);
              }}
              className="underline text-blue-600 hover:text-blue-800 font-mono"
            >
              LB-2026-0204 (Pending Kapitan)
            </button>
          </div>

          {/* Search Result Display */}
          {searched && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              {result ? (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className={`p-4 rounded-xl border ${getStatusDisplay(result.status).color}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {getStatusDisplay(result.status).label}
                      </span>
                      <span className="font-mono text-xs font-bold">{result.referenceNumber}</span>
                    </div>
                  </div>

                  {/* Summary Details */}
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Service:</span>
                      <span className="font-bold text-slate-800">{result.serviceName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Applicant:</span>
                      <span className="font-medium text-slate-800">{result.residentName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Purpose:</span>
                      <span className="text-slate-800">{result.purpose}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Date Filed:</span>
                      <span className="text-slate-800">
                        {new Date(result.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    {result.adminNote && (
                      <div className="pt-1">
                        <span className="text-slate-500 block mb-0.5">Barangay Note:</span>
                        <p className="text-slate-700 bg-white p-2 rounded border border-slate-200 text-[11px]">
                          {result.adminNote}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Certificate Link if approved/completed */}
                  {(result.status === 'Approved' || result.status === 'Completed') && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenCertificate(result);
                      }}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      <Printer className="w-4 h-4" />
                      View Official Printable Certificate
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">No Record Found</p>
                  <p className="text-xs text-slate-500 mt-1">
                    No active or historical request matches "{query}". Please check the reference code on your receipt.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

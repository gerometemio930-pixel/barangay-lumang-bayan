import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  FileText,
  Printer,
  Clock,
  ShieldCheck,
  Search,
  ExternalLink
} from 'lucide-react';
import { User, ServiceRequest } from '../types';
import { OFFICIAL_INFO } from '../data/mockData';

interface CaptainViewProps {
  currentUser: User;
  requests: ServiceRequest[];
  onApproveByCaptain: (requestId: string, remarks?: string) => void;
  onRejectByCaptain: (requestId: string, remarks: string) => void;
  onOpenCertificate: (req: ServiceRequest) => void;
}

export const CaptainView: React.FC<CaptainViewProps> = ({
  currentUser,
  requests,
  onApproveByCaptain,
  onRejectByCaptain,
  onOpenCertificate
}) => {
  const [remarks, setRemarks] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    requests.find((r) => r.status === 'Waiting for Captain Approval') || requests[0] || null
  );

  // Focus queue on requests awaiting captain signature
  const pendingApprovalRequests = requests.filter(
    (r) => r.status === 'Waiting for Captain Approval'
  );

  const approvedByCaptainRequests = requests.filter(
    (r) => r.status === 'Approved' || r.status === 'Completed'
  );

  const handleApprove = () => {
    if (!selectedRequest) return;
    onApproveByCaptain(selectedRequest.id, remarks.trim() || undefined);
    setRemarks('');
  };

  const handleReject = () => {
    if (!selectedRequest) return;
    const reason = remarks.trim() || prompt('Enter reason for return / disapproval:');
    if (!reason) return;
    onRejectByCaptain(selectedRequest.id, reason);
    setRemarks('');
  };

  return (
    <div className="space-y-6">
      {/* Captain's Executive Desk Header */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-purple-300 text-xs font-bold uppercase tracking-widest mb-1.5">
            <Award className="w-4 h-4 text-purple-400" />
            Tanggapan ng Punong Barangay / Office of the Barangay Captain
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {OFFICIAL_INFO.captain}
          </h1>
          <p className="text-purple-100 text-xs sm:text-sm mt-1 max-w-xl">
            Executive Document Approval & Certification Desk. Authorize official clearances, verify Lupon dispute clearance, and affix the digital barangay seal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15 text-center">
            <p className="text-[11px] text-purple-200 uppercase font-semibold">For Your Signature</p>
            <p className="text-2xl font-bold font-mono text-amber-400">{pendingApprovalRequests.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15 text-center">
            <p className="text-[11px] text-purple-200 uppercase font-semibold">Certified Issued</p>
            <p className="text-2xl font-bold font-mono text-emerald-400">{approvedByCaptainRequests.length}</p>
          </div>
        </div>
      </div>

      {/* Main Layout: Signatures Waiting Queue + Document Approval Station */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Signatures Waiting Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                Awaiting Signature ({pendingApprovalRequests.length})
              </h2>
            </div>

            {pendingApprovalRequests.length === 0 ? (
              <div className="text-center py-10 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Inbox Clear</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  No requests are currently waiting for your signature.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {pendingApprovalRequests.map((req) => {
                  const isSelected = selectedRequest?.id === req.id;
                  return (
                    <div
                      key={req.id}
                      onClick={() => setSelectedRequest(req)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/70 shadow-xs ring-1 ring-purple-600'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-purple-700">{req.referenceNumber}</span>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                          Awaiting Seal
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{req.residentName}</h3>
                      <p className="text-xs text-slate-600">{req.serviceName}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Purpose: <span className="text-slate-700">{req.purpose}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recently Approved List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Recently Certified Documents</h3>
            <div className="space-y-2">
              {approvedByCaptainRequests.slice(0, 3).map((req) => (
                <div
                  key={req.id}
                  className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800 block">{req.residentName}</span>
                    <span className="text-[11px] text-slate-500">{req.serviceName} · {req.referenceNumber}</span>
                  </div>
                  <button
                    onClick={() => onOpenCertificate(req)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Certificate"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Document Review & Signing Station */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          {selectedRequest ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">
                    Executive Document Review
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {selectedRequest.serviceName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">Ref: {selectedRequest.referenceNumber}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenCertificate(selectedRequest)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors border border-slate-200"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Live Preview Certificate
                </button>
              </div>

              {/* Applicant Dossier */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Resident Name:</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedRequest.residentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Purok / Address:</span>
                    <span className="font-medium text-slate-800">{selectedRequest.residentAddress}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Intended Purpose:</span>
                    <span className="font-medium text-slate-800">{selectedRequest.purpose}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Barangay Staff Endorsement:</span>
                    <span className="font-semibold text-emerald-700">Verified by {OFFICIAL_INFO.secretary}</span>
                  </div>
                </div>

                {selectedRequest.adminNote && (
                  <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-700">
                    <span className="font-bold text-slate-800">Secretary's Audit Note: </span>
                    {selectedRequest.adminNote}
                  </div>
                )}
              </div>

              {/* Verified Documents List */}
              <div>
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                  Verified Requirements on File
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedRequest.submittedDocuments.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2 text-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <span className="font-medium text-slate-800 block truncate">{doc.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono truncate">{doc.fileName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Captain's Endorsement Remarks Box */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                  Punong Barangay Executive Remarks (Optional)
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Cleared of any pending dispute at Lupon Tagapamayapa. Approved for employment purposes."
                  rows={2}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleApprove}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 transform active:scale-95"
                >
                  <Award className="w-4 h-4" />
                  Affix Digital Signature & Approve Certificate
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  Return with Remarks
                </button>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400">
              Select an application from the pending signature queue.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

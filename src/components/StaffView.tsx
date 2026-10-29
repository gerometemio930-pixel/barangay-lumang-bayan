import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  Printer,
  Calendar,
  AlertCircle,
  FileCheck,
  Send,
  UserCheck,
  ArrowRight
} from 'lucide-react';
import { User, ServiceRequest, RequestStatus } from '../types';

interface StaffViewProps {
  currentUser: User;
  requests: ServiceRequest[];
  onUpdateRequestStatus: (
    requestId: string,
    newStatus: RequestStatus,
    adminNote?: string,
    orNumber?: string,
    pickupDate?: string
  ) => void;
  onOpenCertificate: (req: ServiceRequest) => void;
}

export const StaffView: React.FC<StaffViewProps> = ({
  currentUser,
  requests,
  onUpdateRequestStatus,
  onOpenCertificate
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    requests[0] || null
  );

  // Form states for the selected request
  const [actionStatus, setActionStatus] = useState<RequestStatus>('Processing');
  const [adminNote, setAdminNote] = useState('');
  const [orNumber, setOrNumber] = useState('');
  const [pickupDate, setPickupDate] = useState('');

  // Sync state when selecting a request
  const handleSelectRequest = (req: ServiceRequest) => {
    setSelectedRequest(req);
    setActionStatus(req.status === 'Pending' ? 'Processing' : req.status);
    setAdminNote(req.adminNote || '');
    setOrNumber(req.orNumber || '');
    setPickupDate(req.pickupDate ? req.pickupDate.substring(0, 10) : '');
  };

  const filteredRequests = requests.filter((r) => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchSearch =
      searchTerm === '' ||
      r.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.residentPurok.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleApplyUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    onUpdateRequestStatus(
      selectedRequest.id,
      actionStatus,
      adminNote.trim() || undefined,
      orNumber.trim() || undefined,
      pickupDate ? new Date(pickupDate).toISOString() : undefined
    );
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'Approved':
        return <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Approved</span>;
      case 'Completed':
        return <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Completed</span>;
      case 'Waiting for Captain Approval':
        return <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">With Captain</span>;
      case 'Processing':
        return <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Processing</span>;
      case 'Rejected':
        return <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Rejected</span>;
      default:
        return <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Staff Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Barangay Secretary & Staff Console</span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Resident Applications Processing Queue</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review resident documentary requirements, screen background records, update statuses, and endorse to Punong Barangay for digital signature.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto text-xs font-mono">
          <div className="px-3 py-2 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 font-bold">
            Total Queue: {requests.length}
          </div>
          <div className="px-3 py-2 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 font-bold">
            Pending Action: {requests.filter((r) => r.status === 'Pending' || r.status === 'Processing').length}
          </div>
        </div>
      </div>

      {/* Main Grid: Queue Table (7 cols) + Action Review Panel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Filterable Requests List */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          {/* Search & Status Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search resident, ref #, or service..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              {['all', 'Pending', 'Processing', 'Waiting for Captain Approval', 'Approved', 'Completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st === 'Waiting for Captain Approval' ? 'With Captain' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Table / List */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredRequests.length === 0 ? (
              <p className="text-center py-10 text-xs text-slate-400">
                No applications match your filter criteria.
              </p>
            ) : (
              filteredRequests.map((req) => {
                const isSelected = selectedRequest?.id === req.id;
                return (
                  <div
                    key={req.id}
                    onClick={() => handleSelectRequest(req)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700">{req.referenceNumber}</span>
                      {getStatusBadge(req.status)}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <h3 className="font-bold text-slate-900 text-sm">{req.residentName}</h3>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        E-Service
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{req.serviceName}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span>{req.residentPurok}</span>
                      <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Detailed Request Review & Action Panel */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          {selectedRequest ? (
            <form onSubmit={handleApplyUpdate} className="space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-700">{selectedRequest.referenceNumber}</span>
                  <h3 className="font-bold text-slate-900 text-base">{selectedRequest.serviceName}</h3>
                  <p className="text-xs text-slate-500">Applicant: <strong>{selectedRequest.residentName}</strong></p>
                </div>
                {(selectedRequest.status === 'Approved' || selectedRequest.status === 'Completed') && (
                  <button
                    type="button"
                    onClick={() => onOpenCertificate(selectedRequest)}
                    className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                    title="Preview Certificate"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Applicant Metadata Box */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact Number:</span>
                  <span className="font-mono font-medium text-slate-800">{selectedRequest.residentPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Residential Address:</span>
                  <span className="font-medium text-slate-800">{selectedRequest.residentAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Declared Purpose:</span>
                  <span className="font-medium text-slate-800">{selectedRequest.purpose}</span>
                </div>
                {selectedRequest.customDetails && (
                  <div className="pt-1 text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200">
                    <strong>Note from resident:</strong> {selectedRequest.customDetails}
                  </div>
                )}
              </div>

              {/* Submitted Requirements Checklist */}
              <div>
                <p className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-2">
                  Document Requirements Inspection
                </p>
                <div className="space-y-2">
                  {selectedRequest.submittedDocuments.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium text-slate-800">{doc.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{doc.fileName}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action: Update Workflow Status */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
                    Update Application Status
                  </label>
                  <select
                    value={actionStatus}
                    onChange={(e) => setActionStatus(e.target.value as RequestStatus)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                  >
                    <option value="Pending">Pending Review</option>
                    <option value="Processing">Processing (Screening background & records)</option>
                    <option value="Waiting for Captain Approval">Endorse to Punong Barangay (Awaiting Signature)</option>
                    <option value="Approved">Approved (Ready for Pickup)</option>
                    <option value="Completed">Completed / Officially Released</option>
                    <option value="Rejected">Return / Reject Application</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Official Receipt (OR #)
                    </label>
                    <input
                      type="text"
                      value={orNumber}
                      onChange={(e) => setOrNumber(e.target.value)}
                      placeholder="e.g. OR-884920"
                      className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Pickup Date
                    </label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Staff Administrative Note (Visible to Resident)
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="e.g. All requirements verified. Ready for release at Window 1 on Friday morning."
                    rows={2}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Save & Update Record
                  </button>
                  {(selectedRequest.status === 'Approved' || selectedRequest.status === 'Completed') && (
                    <button
                      type="button"
                      onClick={() => onOpenCertificate(selectedRequest)}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print
                    </button>
                  )}
                </div>
              </div>
            </form>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400">
              Select an application from the queue to view documents and update status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

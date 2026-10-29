import React, { useState } from 'react';
import {
  Settings,
  Download,
  Plus,
  Trash2,
  Edit2,
  Pin,
  CheckCircle,
  FileSpreadsheet,
  History,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Megaphone,
  Layers,
  Search,
  Filter,
  Clock,
  UserCheck,
  Users,
  FileText,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Eye,
  Printer,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building
} from 'lucide-react';
import {
  User,
  ServiceCatalogItem,
  ServiceRequest,
  Announcement,
  AuditLogItem,
  RequestStatus
} from '../types';

interface AdminViewProps {
  currentUser: User;
  services: ServiceCatalogItem[];
  requests: ServiceRequest[];
  announcements: Announcement[];
  auditLogs: AuditLogItem[];
  residentsList: User[];
  onToggleServiceOnline: (serviceId: string) => void;
  onUpdateServiceFee: (serviceId: string, fee: number) => void;
  onVerifyRequirement: (serviceId: string, reqId: string) => void;
  onUpdateRequestStatus: (
    requestId: string,
    newStatus: RequestStatus,
    adminNote?: string,
    orNumber?: string,
    pickupDate?: string,
    captainRemarks?: string
  ) => void;
  onPublishAnnouncement: (title: string, body: string, category: 'advisory' | 'health' | 'program' | 'emergency') => void;
  onDeleteAnnouncement: (id: string) => void;
  onTogglePinAnnouncement: (id: string) => void;
  onOpenCertificate: (req: ServiceRequest) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentUser,
  services,
  requests,
  announcements,
  auditLogs,
  residentsList,
  onToggleServiceOnline,
  onUpdateServiceFee,
  onVerifyRequirement,
  onUpdateRequestStatus,
  onPublishAnnouncement,
  onDeleteAnnouncement,
  onTogglePinAnnouncement,
  onOpenCertificate
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'captain_desk' | 'residents' | 'announcements' | 'services' | 'audit'>('requests');

  // Search & Filter state for Requests Queue
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Selected request for detailed review modal / drawer
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [remarksInput, setRemarksInput] = useState('');
  const [orNumberInput, setOrNumberInput] = useState('');
  const [pickupDateInput, setPickupDateInput] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Search for Residents tab
  const [residentSearch, setResidentSearch] = useState('');

  // Announcement form state
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annCategory, setAnnCategory] = useState<'advisory' | 'health' | 'program' | 'emergency'>('advisory');

  // Request status counts
  const totalRequests = requests.length;
  const pendingRequests = requests.filter((r) => r.status === 'Pending').length;
  const processingRequests = requests.filter((r) => r.status === 'Processing').length;
  const waitingCaptainRequests = requests.filter((r) => r.status === 'Waiting for Captain\'s Signature' || r.status === 'Waiting for Captain Approval').length;
  const approvedRequests = requests.filter((r) => r.status === 'Approved').length;
  const readyPickupRequests = requests.filter((r) => r.status === 'Ready for Pickup').length;
  const completedRequests = requests.filter((r) => r.status === 'Completed').length;
  const rejectedRequests = requests.filter((r) => r.status === 'Rejected').length;

  // Filter requests
  const filteredRequests = requests
    .filter((r) => {
      if (statusFilter !== 'all') {
        if (statusFilter === 'Waiting for Captain') {
          if (!r.status.includes('Captain')) return false;
        } else if (r.status !== statusFilter) {
          return false;
        }
      }
      if (serviceFilter !== 'all' && r.serviceId !== serviceFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        return (
          r.referenceNumber.toLowerCase().includes(query) ||
          r.residentName.toLowerCase().includes(query) ||
          r.serviceName.toLowerCase().includes(query) ||
          r.residentPurok.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

  // Filter residents
  const filteredResidents = residentsList.filter((res) => {
    if (!residentSearch.trim()) return true;
    const q = residentSearch.toLowerCase();
    return (
      res.fullName.toLowerCase().includes(q) ||
      res.email.toLowerCase().includes(q) ||
      res.phone.toLowerCase().includes(q) ||
      res.purok.toLowerCase().includes(q)
    );
  });

  // CSV Export Function
  const handleExportCSV = () => {
    const headers = [
      'Reference Number',
      'Resident Name',
      'Email',
      'Phone',
      'Purok',
      'Service',
      'Purpose',
      'Fee',
      'Status',
      'Certificate #',
      'OR Number',
      'Created At',
      'Updated At'
    ];

    const rows = requests.map((r) => [
      r.referenceNumber,
      `"${r.residentName.replace(/"/g, '""')}"`,
      r.residentEmail,
      r.residentPhone,
      r.residentPurok,
      `"${r.serviceName}"`,
      `"${r.purpose.replace(/"/g, '""')}"`,
      r.fee,
      r.status,
      r.certificateNumber || 'N/A',
      r.orNumber || 'N/A',
      r.createdAt,
      r.updatedAt
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `barangay_lumangbayan_requests_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annBody.trim()) return;

    onPublishAnnouncement(annTitle.trim(), annBody.trim(), annCategory);
    setAnnTitle('');
    setAnnBody('');
  };

  const handleSelectRequestForReview = (req: ServiceRequest) => {
    setSelectedRequest(req);
    setRemarksInput(req.adminNote || '');
    setOrNumberInput(req.orNumber || '');
    setPickupDateInput(req.pickupDate ? req.pickupDate.substring(0, 10) : '');
    setRejectionReason('');
  };

  const getStatusBadge = (status: RequestStatus | string) => {
    switch (status) {
      case 'Approved':
        return <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">Approved</span>;
      case 'Ready for Pickup':
        return <span className="text-[11px] font-bold text-teal-800 bg-teal-100 border border-teal-300 px-2 py-0.5 rounded-full">Ready for Pickup</span>;
      case 'Completed':
        return <span className="text-[11px] font-bold text-blue-800 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded-full">Completed</span>;
      case 'Waiting for Captain\'s Signature':
      case 'Waiting for Captain Approval':
        return <span className="text-[11px] font-bold text-purple-800 bg-purple-100 border border-purple-300 px-2 py-0.5 rounded-full">For Captain Signature</span>;
      case 'Processing':
        return <span className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">Processing</span>;
      case 'Rejected':
        return <span className="text-[11px] font-bold text-rose-800 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-full">Rejected</span>;
      default:
        return <span className="text-[11px] font-bold text-slate-700 bg-slate-200 border border-slate-300 px-2 py-0.5 rounded-full">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Executive Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-1.5">
            <Building className="w-4 h-4" />
            Tanggapan ng Pamahalaang Barangay · Portal Administrator Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Administrator Dashboard
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Sentralisadong pamamahala ng mga kahilingan ng residente, pag-apruba ng Punong Barangay, catalog ng serbisyo, at opisyal na audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            title="I-export ang lahat ng requests bilang CSV spreadsheet"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Export Requests (CSV)
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[10px] font-bold uppercase text-slate-500">Total Requests</p>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{totalRequests}</p>
        </div>
        <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 shadow-2xs">
          <p className="text-[10px] font-bold uppercase text-amber-700">Pending</p>
          <p className="text-2xl font-bold font-mono text-amber-800 mt-1">{pendingRequests}</p>
        </div>
        <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 shadow-2xs">
          <p className="text-[10px] font-bold uppercase text-blue-700">Processing</p>
          <p className="text-2xl font-bold font-mono text-blue-800 mt-1">{processingRequests}</p>
        </div>
        <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-200 shadow-2xs">
          <p className="text-[10px] font-bold uppercase text-purple-700">Captain's Desk</p>
          <p className="text-2xl font-bold font-mono text-purple-800 mt-1">{waitingCaptainRequests}</p>
        </div>
        <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 shadow-2xs">
          <p className="text-[10px] font-bold uppercase text-emerald-700">Approved</p>
          <p className="text-2xl font-bold font-mono text-emerald-800 mt-1">{approvedRequests}</p>
        </div>
        <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-200 shadow-2xs">
          <p className="text-[10px] font-bold uppercase text-teal-700">Ready for Pickup</p>
          <p className="text-2xl font-bold font-mono text-teal-800 mt-1">{readyPickupRequests}</p>
        </div>
        <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200 shadow-2xs">
          <p className="text-[10px] font-bold uppercase text-rose-700">Rejected</p>
          <p className="text-2xl font-bold font-mono text-rose-800 mt-1">{rejectedRequests}</p>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-white px-4 pt-2 rounded-t-2xl overflow-x-auto text-xs font-bold text-slate-600">
        <button
          onClick={() => setActiveTab('requests')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'requests'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>All Requests Queue ({requests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('captain_desk')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'captain_desk'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <span>Captain's Desk ({waitingCaptainRequests})</span>
        </button>

        <button
          onClick={() => setActiveTab('residents')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'residents'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Resident Accounts ({residentsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'services'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Services & Requirements</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'announcements'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Announcements ({announcements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: All Requests Queue */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          {/* Controls: Search, Filter by Status, Filter by Service, Sort */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by resident name, reference number, purok, or service..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Waiting for Captain">Waiting for Captain</option>
                <option value="Approved">Approved</option>
                <option value="Ready for Pickup">Ready for Pickup</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium text-slate-700"
              >
                <option value="all">All Services</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium text-slate-700"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          {/* Requests Table */}
          {filteredRequests.length === 0 ? (
            <div className="text-center py-16 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Walang Nakitang Aplikasyon</p>
              <p className="text-xs text-slate-400 mt-1">
                Kasalukuyang walang request na tumutugma sa filter o wala pang nag-a-apply na residente.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">Reference #</th>
                    <th className="p-3">Resident Applicant</th>
                    <th className="p-3">Service</th>
                    <th className="p-3">Submitted Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {req.referenceNumber}
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{req.residentName}</p>
                        <p className="text-[11px] text-slate-400">{req.residentPurok} · {req.residentPhone}</p>
                      </td>
                      <td className="p-3 font-medium text-slate-800">
                        {req.serviceName}
                        <p className="text-[11px] text-slate-400">{req.purpose}</p>
                      </td>
                      <td className="p-3 text-slate-500 whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleSelectRequestForReview(req)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Review & Process
                          </button>
                          {(req.status === 'Approved' || req.status === 'Completed') && (
                            <button
                              onClick={() => onOpenCertificate(req)}
                              className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-200"
                              title="Tingnan ang Opisyal na Sertipiko"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Captain's Signature Desk */}
      {activeTab === 'captain_desk' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Desk ng Punong Barangay / Captain's Signature</h2>
              <p className="text-xs text-slate-500">Mga dokumentong na-screen na ng staff at naghihintay ng opisyal na lagda at digital seal.</p>
            </div>
          </div>

          {requests.filter((r) => r.status === 'Waiting for Captain\'s Signature' || r.status === 'Waiting for Captain Approval').length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Inbox Clear</p>
              <p className="text-xs text-slate-400 mt-1">Walang kasalukuyang dokumento na naghihintay ng pirma ng Punong Barangay.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests
                .filter((r) => r.status === 'Waiting for Captain\'s Signature' || r.status === 'Waiting for Captain Approval')
                .map((req) => (
                  <div key={req.id} className="p-5 border border-purple-200 bg-purple-50/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-purple-700">{req.referenceNumber}</span>
                        <span className="text-slate-300">·</span>
                        <h4 className="font-bold text-slate-900">{req.serviceName}</h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Residente: <span className="font-semibold text-slate-900">{req.residentName}</span> ({req.residentPurok})
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Layunin: <span className="text-slate-700">{req.purpose}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          onUpdateRequestStatus(
                            req.id,
                            'Approved',
                            'Approved by Punong Barangay. Official clearance signed and sealed.',
                            undefined,
                            undefined,
                            'Certified and authorized for official issuance.'
                          );
                        }}
                        className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-300" />
                        Approve & Sign Certificate
                      </button>

                      <button
                        onClick={() => handleSelectRequestForReview(req)}
                        className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Resident Accounts Management */}
      {activeTab === 'residents' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Talaan ng mga Rehistradong Residente</h2>
              <p className="text-xs text-slate-500">Lahat ng mamamayang gumawa ng account sa pamamagitan ng portal.</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={residentSearch}
                onChange={(e) => setResidentSearch(e.target.value)}
                placeholder="Search resident name, purok, or phone..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs"
              />
            </div>
          </div>

          {filteredResidents.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Walang Nakitang Residente</p>
              <p className="text-xs text-slate-400 mt-1">Mag-register ng account sa login page upang lumitaw dito.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">Full Name</th>
                    <th className="p-3">Purok / Sona</th>
                    <th className="p-3">Contact Details</th>
                    <th className="p-3">Address</th>
                    <th className="p-3">Voter Status</th>
                    <th className="p-3">Residency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResidents.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{res.fullName}</p>
                        <p className="text-[11px] text-slate-400">{res.email}</p>
                      </td>
                      <td className="p-3 font-semibold text-blue-700">{res.purok}</td>
                      <td className="p-3 text-slate-600 font-mono">{res.phone}</td>
                      <td className="p-3 text-slate-600">{res.address}</td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {res.voterStatus || 'Registered Voter'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{res.yearsOfResidency || 3} taon</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Services & Requirements Configuration */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Barangay E-Services Configuration</h2>
            <p className="text-xs text-slate-500">
              I-configure ang statutory fees, online availability, at official document checklist para sa bawat serbisyo.
            </p>
          </div>

          <div className="space-y-4">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="p-5 border border-slate-200 rounded-2xl hover:border-slate-300 transition-all bg-slate-50/40"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {svc.code}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{svc.name}</h3>
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {svc.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{svc.description}</p>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-center">
                    <button
                      onClick={() => onToggleServiceOnline(svc.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                        svc.isOnlineEnabled
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-700 border border-slate-300 hover:bg-slate-300'
                      }`}
                    >
                      {svc.isOnlineEnabled ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4" />}
                      <span>{svc.isOnlineEnabled ? 'Online Enabled' : 'Disabled'}</span>
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-bold text-slate-700 mb-1.5">Official Requirements Checklist:</p>
                    <div className="space-y-1.5">
                      {svc.requirements.map((req) => (
                        <div
                          key={req.id}
                          onClick={() => onVerifyRequirement(svc.id, req.id)}
                          className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-blue-50/50"
                        >
                          <CheckCircle className={`w-4 h-4 ${req.sampleVerified ? 'text-emerald-600' : 'text-slate-300'}`} />
                          <span className="text-slate-700 font-medium">{req.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-slate-700 mb-1.5">Valid Purposes Supported:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {svc.validPurposes.map((p, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] text-slate-600">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Announcements Management */}
      {activeTab === 'announcements' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Pamamahala ng mga Opisyal na Anunsyo</h2>
            <p className="text-xs text-slate-500">Mag-post ng mga balita, iskedyul ng ayuda, at public health advisories para sa residente.</p>
          </div>

          <form onSubmit={handleCreateAnnouncement} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
            <h4 className="font-bold text-slate-900">Gumawa ng Bagong Anunsyo</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Pamagat ng anunsyo (Hal. Iskedyul ng Pamamahagi ng Ayuda)..."
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>
              <div>
                <select
                  value={annCategory}
                  onChange={(e) => setAnnCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="advisory">Advisory</option>
                  <option value="health">Health & Sanitation</option>
                  <option value="program">Social Program / Ayuda</option>
                  <option value="emergency">Emergency / Alert</option>
                </select>
              </div>
            </div>

            <textarea
              value={annBody}
              onChange={(e) => setAnnBody(e.target.value)}
              placeholder="Kumpletong nilalaman ng anunsyo, detalye, at mga kailangang dalhin ng residente..."
              required
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            />

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              I-publish ang Anunsyo
            </button>
          </form>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-4 border border-slate-200 rounded-xl flex items-start justify-between gap-4 bg-white">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{ann.title}</h4>
                    {ann.isPinned && (
                      <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                        PINNED
                      </span>
                    )}
                    <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      {ann.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ann.body}</p>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Inilathala ni: {ann.author} ({ann.authorRole}) · {new Date(ann.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onTogglePinAnnouncement(ann.id)}
                    className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-slate-100"
                    title="Toggle Pin"
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteAnnouncement(ann.id)}
                    className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-100"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-b-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Opisyal na Audit Logs & Activity Record</h2>
            <p className="text-xs text-slate-500">Awtomatikong talaan ng bawat login, pag-apruba, status change, at pagbabago sa portal.</p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor / Official</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="p-3 font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900">{log.actorName}</span>
                      <span className="text-[10px] text-blue-700 bg-blue-50 px-1 rounded ml-1.5 font-bold uppercase">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800">{log.action}</td>
                    <td className="p-3 font-mono text-blue-600">{log.target}</td>
                    <td className="p-3 text-slate-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Request Review & Status Update Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Request Processing & Document Review
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Ref: {selectedRequest.referenceNumber} · {selectedRequest.serviceName}
                </p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              {/* Resident Info Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Resident Applicant Details:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500">Name:</span> <strong className="text-slate-900">{selectedRequest.residentName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Purok:</span> <strong className="text-slate-900">{selectedRequest.residentPurok}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Contact:</span> <span className="font-mono text-slate-800">{selectedRequest.residentPhone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Email:</span> <span className="text-slate-800">{selectedRequest.residentEmail}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Address:</span> <span className="text-slate-800">{selectedRequest.residentAddress}</span>
                  </div>
                </div>
              </div>

              {/* Purpose & Custom Details */}
              <div>
                <p className="font-bold text-slate-800 mb-1">Purpose of Request:</p>
                <p className="p-2.5 bg-slate-100 rounded-lg text-slate-800 font-medium">{selectedRequest.purpose}</p>
                {selectedRequest.customDetails && (
                  <p className="mt-1 text-slate-500 italic">"{selectedRequest.customDetails}"</p>
                )}
              </div>

              {/* Attached Requirements Checklist */}
              <div>
                <p className="font-bold text-slate-800 mb-1.5">Submitted Requirements & Attachments:</p>
                <div className="space-y-1.5">
                  {selectedRequest.submittedDocuments.map((doc, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold text-slate-800">{doc.name}</span>
                        <span className="text-slate-400 font-mono">({doc.fileName})</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Verified
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remarks / Administrator Notes */}
              <div>
                <label className="block font-bold text-slate-800 uppercase mb-1">
                  Administrator Remarks / Instructions to Resident:
                </label>
                <textarea
                  value={remarksInput}
                  onChange={(e) => setRemarksInput(e.target.value)}
                  placeholder="Hal. Pakidala ang orihinal na valid ID sa pag-claim sa bintana 1..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>

              {/* Ready for Pickup date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 uppercase mb-1">
                    Pickup Date (Petsa ng Pagkuha):
                  </label>
                  <input
                    type="date"
                    value={pickupDateInput}
                    onChange={(e) => setPickupDateInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 uppercase mb-1">
                    OR / Assessment Number:
                  </label>
                  <input
                    type="text"
                    value={orNumberInput}
                    onChange={(e) => setOrNumberInput(e.target.value)}
                    placeholder="Hal. EXEMPTED o OR-9921"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-mono"
                  />
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="pt-3 border-t border-slate-200">
                <p className="font-bold text-slate-800 uppercase text-[11px] mb-2">Update Request Status:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      onUpdateRequestStatus(selectedRequest.id, 'Processing', remarksInput, orNumberInput, pickupDateInput);
                      setSelectedRequest(null);
                    }}
                    className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl border border-blue-200 transition-colors"
                  >
                    Move to Processing
                  </button>

                  <button
                    onClick={() => {
                      onUpdateRequestStatus(selectedRequest.id, 'Waiting for Captain\'s Signature', remarksInput || 'Screened by staff; endorsed for Punong Barangay signature.', orNumberInput, pickupDateInput);
                      setSelectedRequest(null);
                    }}
                    className="p-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl border border-purple-200 transition-colors"
                  >
                    Route to Captain
                  </button>

                  <button
                    onClick={() => {
                      onUpdateRequestStatus(selectedRequest.id, 'Approved', remarksInput || 'Officially approved and sealed.', orNumberInput, pickupDateInput);
                      setSelectedRequest(null);
                    }}
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Approve Request
                  </button>

                  <button
                    onClick={() => {
                      onUpdateRequestStatus(selectedRequest.id, 'Ready for Pickup', remarksInput || 'Ang inyong dokumento ay nakahanda na sa Barangay Hall.', orNumberInput, pickupDateInput);
                      setSelectedRequest(null);
                    }}
                    className="p-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Ready for Pickup
                  </button>

                  <button
                    onClick={() => {
                      onUpdateRequestStatus(selectedRequest.id, 'Completed', remarksInput || 'Dokumento ay matagumpay na naipalabas.', orNumberInput, pickupDateInput);
                      setSelectedRequest(null);
                    }}
                    className="p-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Mark Completed
                  </button>

                  <button
                    onClick={() => {
                      const reason = prompt('Pakilagay ang dahilan ng pag-reject / kulang na requirement:', 'Kulang ang isinumiteng patunay ng paninirahan.');
                      if (reason) {
                        onUpdateRequestStatus(selectedRequest.id, 'Rejected', reason, orNumberInput, pickupDateInput);
                        setSelectedRequest(null);
                      }
                    }}
                    className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 transition-colors"
                  >
                    Reject / Return
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

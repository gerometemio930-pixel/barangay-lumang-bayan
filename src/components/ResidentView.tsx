import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Printer,
  ChevronDown,
  ChevronUp,
  Megaphone,
  MessageSquare,
  ShieldAlert,
  Calendar,
  Building,
  UserCheck,
  UserPlus,
  Lock,
  User as UserIcon,
  Phone,
  MapPin,
  Mail,
  Award,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { User, ServiceCatalogItem, ServiceRequest, Announcement, CommunityConcern } from '../types';

interface ResidentViewProps {
  currentUser: User;
  services: ServiceCatalogItem[];
  requests: ServiceRequest[];
  announcements: Announcement[];
  concerns: CommunityConcern[];
  onOpenNewRequest: () => void;
  onOpenConcern: () => void;
  onOpenCertificate: (req: ServiceRequest) => void;
  onOpenAuthModal: () => void;
  onUpdateProfile: (updatedData: Partial<User>) => Promise<void>;
}

export const ResidentView: React.FC<ResidentViewProps> = ({
  currentUser,
  services,
  requests,
  announcements,
  concerns,
  onOpenNewRequest,
  onOpenConcern,
  onOpenCertificate,
  onOpenAuthModal,
  onUpdateProfile
}) => {
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeMainTab, setActiveMainTab] = useState<'requests' | 'catalog' | 'profile' | 'concerns'>('requests');

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editPhone, setEditPhone] = useState(currentUser.phone || '');
  const [editPurok, setEditPurok] = useState(currentUser.purok || 'Purok 1');
  const [editAddress, setEditAddress] = useState(currentUser.address || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const isGuest = currentUser.role === 'guest';

  // Requests belonging to this resident
  const myRequests = isGuest
    ? []
    : requests.filter(
        (r) => r.residentId === currentUser.id || r.residentEmail?.toLowerCase() === currentUser.email?.toLowerCase()
      );

  const myConcerns = isGuest
    ? []
    : concerns.filter((c) => c.residentId === currentUser.id);

  // Status Metrics
  const totalCount = myRequests.length;
  const pendingCount = myRequests.filter((r) => r.status === 'Pending').length;
  const processingCount = myRequests.filter((r) => r.status === 'Processing' || r.status.includes('Captain')).length;
  const approvedCount = myRequests.filter((r) => r.status === 'Approved' || r.status === 'Ready for Pickup').length;
  const completedCount = myRequests.filter((r) => r.status === 'Completed').length;
  const rejectedCount = myRequests.filter((r) => r.status === 'Rejected').length;

  // Recent Alert (if any request approved or ready for pickup)
  const readyOrApproved = myRequests.find((r) => r.status === 'Ready for Pickup' || r.status === 'Approved');
  const rejectedWithReason = myRequests.find((r) => r.status === 'Rejected');

  const filteredAnnouncements = announcements.filter((a) => {
    if (selectedCategory === 'all') return true;
    return a.category === selectedCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">Approved · Ready for Issuance</span>;
      case 'Ready for Pickup':
        return <span className="text-xs font-bold text-teal-800 bg-teal-100 border border-teal-300 px-2.5 py-0.5 rounded-full">Ready for Pickup at Barangay Hall</span>;
      case 'Completed':
        return <span className="text-xs font-bold text-blue-800 bg-blue-100 border border-blue-300 px-2.5 py-0.5 rounded-full">Completed / Released</span>;
      case 'Waiting for Captain\'s Signature':
      case 'Waiting for Captain Approval':
        return <span className="text-xs font-bold text-purple-800 bg-purple-100 border border-purple-300 px-2.5 py-0.5 rounded-full">Awaiting Captain Signature</span>;
      case 'Processing':
        return <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">Processing / Verification</span>;
      case 'Rejected':
        return <span className="text-xs font-bold text-rose-800 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded-full">Rejected / Returned</span>;
      default:
        return <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-full">Pending Review</span>;
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMsg('');
    try {
      await onUpdateProfile({
        phone: editPhone,
        purok: editPurok,
        address: editAddress
      });
      setProfileMsg('Matagumpay na na-update ang inyong profile!');
      setIsEditingProfile(false);
    } catch {
      setProfileMsg('Nabigong i-save ang pagbabago.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1.5">
            Portal ng Mamamayan · Barangay Lumang Bayan
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Mabuhay, {currentUser.fullName}!
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-2 leading-relaxed">
            Welcome sa inyong resident dashboard. Maaari ka nang mag-request ng official barangay clearances, 
            i-track ang application status, at mag-report ng mga concern sa komunidad.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={onOpenNewRequest}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Mag-request ng Serbisyo (Apply Now)
            </button>
            <button
              onClick={onOpenConcern}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl flex items-center gap-2 backdrop-blur-xs transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              Ulat sa Barangay / Concern
            </button>
          </div>
        </div>

        {/* Resident Summary Stats Box in Hero */}
        <div className="mt-6 sm:mt-0 sm:absolute sm:right-8 sm:top-1/2 sm:-translate-y-1/2 grid grid-cols-2 gap-3 sm:w-64">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15">
            <p className="text-[11px] text-blue-200 font-medium uppercase tracking-wider">In Process</p>
            <p className="text-2xl font-bold font-mono mt-0.5">{pendingCount + processingCount}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15">
            <p className="text-[11px] text-blue-200 font-medium uppercase tracking-wider">Approved / Ready</p>
            <p className="text-2xl font-bold font-mono mt-0.5 text-amber-300">{approvedCount}</p>
          </div>
        </div>
      </div>

      {/* Dynamic Status Notifications / Dashboard Alerts */}
      {readyOrApproved && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-3 text-xs text-emerald-900 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-sm">Opisyal na Balita ukol sa inyong Aplikasyon:</p>
            <p className="mt-0.5 text-emerald-800">
              Ang inyong request para sa <strong>{readyOrApproved.serviceName}</strong> (Ref: <span className="font-mono font-bold">{readyOrApproved.referenceNumber}</span>) ay <strong>{readyOrApproved.status}</strong>!
              {readyOrApproved.pickupDate && ` Petsa ng pagkuha: ${new Date(readyOrApproved.pickupDate).toLocaleDateString()}.`}
            </p>
            <button
              onClick={() => onOpenCertificate(readyOrApproved)}
              className="mt-2 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Tingnan at I-print ang Opisyal na Sertipiko
            </button>
          </div>
        </div>
      )}

      {rejectedWithReason && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-3 text-xs text-rose-900 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-sm">Paalala ukol sa Ibinalik na Aplikasyon:</p>
            <p className="mt-0.5 text-rose-800">
              Ang inyong request (Ref: <span className="font-mono font-bold">{rejectedWithReason.referenceNumber}</span>) ay ibinalik.
              Dahilan ng tanggapan: <em>"{rejectedWithReason.adminNote || 'Pakidala ang kumpletong supporting documents.'}"</em>
            </p>
          </div>
        </div>
      )}

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-slate-500">Total Requests</p>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{totalCount}</p>
        </div>
        <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-amber-700">Pending</p>
          <p className="text-2xl font-bold font-mono text-amber-800 mt-1">{pendingCount}</p>
        </div>
        <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-blue-700">Processing</p>
          <p className="text-2xl font-bold font-mono text-blue-800 mt-1">{processingCount}</p>
        </div>
        <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-emerald-700">Approved</p>
          <p className="text-2xl font-bold font-mono text-emerald-800 mt-1">{approvedCount}</p>
        </div>
        <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-indigo-700">Completed</p>
          <p className="text-2xl font-bold font-mono text-indigo-800 mt-1">{completedCount}</p>
        </div>
      </div>

      {/* Main Resident Dashboard Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-white px-4 pt-2 rounded-t-2xl overflow-x-auto text-xs font-bold text-slate-600">
        <button
          onClick={() => setActiveMainTab('requests')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeMainTab === 'requests'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>My Requests ({myRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('catalog')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeMainTab === 'catalog'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Barangay Services ({services.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('profile')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeMainTab === 'profile'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Resident Profile</span>
        </button>

        <button
          onClick={() => setActiveMainTab('concerns')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeMainTab === 'concerns'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ulat sa Barangay ({myConcerns.length})</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* TAB 1: MY REQUESTS */}
          {activeMainTab === 'requests' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Aking mga Aplikasyon (My Requests)</h2>
                  <p className="text-xs text-slate-500">I-track ang bawat dokumentong iyong isinumite sa tanggapan.</p>
                </div>
                <button
                  onClick={onOpenNewRequest}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Mag-apply ng Bago
                </button>
              </div>

              {myRequests.length === 0 ? (
                <div className="text-center py-14 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">Wala ka pang naisusumiteng request</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Nakahanda na ang iyong account! Pindutin ang button sa ibaba upang mag-apply ng inyong unang barangay clearance o sertipiko.
                  </p>
                  <button
                    onClick={onOpenNewRequest}
                    className="mt-4 px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Mag-apply para sa Unang Dokumento
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myRequests.map((req) => {
                    const isExpanded = expandedRequestId === req.id;
                    const canPrint = req.status === 'Approved' || req.status === 'Completed' || req.status === 'Ready for Pickup';

                    return (
                      <div
                        key={req.id}
                        className="border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition-all bg-white"
                      >
                        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                {req.referenceNumber}
                              </span>
                              <span className="text-slate-300">·</span>
                              <h3 className="font-bold text-slate-900 text-sm">{req.serviceName}</h3>
                            </div>
                            <p className="text-xs text-slate-600 mt-1">
                              Layunin: <span className="text-slate-800 font-medium">{req.purpose}</span>
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Petsa ng Aplikasyon: {new Date(req.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-center">
                            {getStatusBadge(req.status)}
                            <button
                              onClick={() => setExpandedRequestId(isExpanded ? null : req.id)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Tingnan ang detalye at timeline"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/60 space-y-4 text-xs">
                            {/* Official Remarks / Instructions */}
                            {req.adminNote && (
                              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900">
                                <span className="font-bold block mb-0.5">Mensahe mula sa Tanggapan ng Barangay:</span>
                                {req.adminNote}
                              </div>
                            )}

                            {req.pickupDate && (
                              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 font-semibold">
                                Petsa ng Pagkuha sa Barangay Hall: {new Date(req.pickupDate).toLocaleDateString()}
                              </div>
                            )}

                            {/* Print Certificate Button */}
                            {canPrint && (
                              <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                                <div className="flex-1">
                                  <p className="font-bold text-emerald-950">Opisyal na Dokumento ay Handa Na</p>
                                  <p className="text-[11px] text-emerald-800">
                                    Maaari nang i-preview at i-print ang sertipiko na may opisyal na circular seal at digital verification QR code.
                                  </p>
                                </div>
                                <button
                                  onClick={() => onOpenCertificate(req)}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Printer className="w-4 h-4" />
                                  I-print ang Sertipiko
                                </button>
                              </div>
                            )}

                            {/* Timeline */}
                            <div>
                              <p className="font-bold text-slate-800 mb-2">History at Status Timeline:</p>
                              <div className="space-y-2 border-l-2 border-blue-200 pl-3 ml-1">
                                {req.timeline.map((event, idx) => (
                                  <div key={idx} className="relative">
                                    <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white"></div>
                                    <p className="font-bold text-slate-800 text-[11px]">{event.title}</p>
                                    <p className="text-slate-600 text-[11px]">{event.description}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{event.timestamp} · {event.actor}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Attached requirements */}
                            <div>
                              <p className="font-bold text-slate-800 mb-1">Isinumiteng mga Dokumento:</p>
                              <div className="flex flex-wrap gap-2">
                                {req.submittedDocuments.map((doc, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-700 font-medium"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                    {doc.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BARANGAY SERVICES CATALOG */}
          {activeMainTab === 'catalog' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Katalogo ng mga Serbisyo sa Barangay</h2>
                <p className="text-xs text-slate-500">
                  Opisyal na mga dokumento at clearances na maaaring i-request online na may malinaw na listahan ng requirements.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-slate-50/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          {item.code}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>

                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs">
                        <p className="text-[11px] font-bold text-slate-700">Pangunahing Requirements:</p>
                        <ul className="list-disc list-inside text-slate-500 text-[11px] space-y-0.5">
                          {item.requirements.slice(0, 3).map((req) => (
                            <li key={req.id} className="truncate">{req.name}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <button
                      onClick={onOpenNewRequest}
                      className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Mag-apply para sa {item.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: RESIDENT PROFILE */}
          {activeMainTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Impormasyon ng Residente (Profile)</h2>
                  <p className="text-xs text-slate-500">Talaan ng inyong personal na rekord sa Barangay Lumang Bayan.</p>
                </div>
                {!isEditingProfile && (
                  <button
                    onClick={() => {
                      setIsEditingProfile(true);
                      setProfileMsg('');
                    }}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    I-edit ang Profile
                  </button>
                )}
              </div>

              {profileMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{profileMsg}</span>
                </div>
              )}

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase mb-1">Purok</label>
                      <select
                        value={editPurok}
                        onChange={(e) => setEditPurok(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white"
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                          <option key={num} value={`Purok ${num}`}>
                            Purok {num}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">Tirahan / Street Address</label>
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {isSavingProfile ? 'Inise-save...' : 'I-save ang Pagbabago'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                    >
                      Kanselahin
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="text-slate-400 font-bold uppercase text-[10px]">Buong Pangalan</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{currentUser.fullName}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="text-slate-400 font-bold uppercase text-[10px]">Email Address</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono">{currentUser.email}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="text-slate-400 font-bold uppercase text-[10px]">Purok / Sona</p>
                    <p className="text-sm font-bold text-blue-700 mt-0.5">{currentUser.purok}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="text-slate-400 font-bold uppercase text-[10px]">Mobile Contact</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono">{currentUser.phone}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl sm:col-span-2">
                    <p className="text-slate-400 font-bold uppercase text-[10px]">Kumpletong Tirahan</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{currentUser.address}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="text-slate-400 font-bold uppercase text-[10px]">Voter Status</p>
                    <p className="text-sm font-bold text-emerald-700 mt-0.5">{currentUser.voterStatus || 'Registered Voter'}</p>
                  </div>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="text-slate-400 font-bold uppercase text-[10px]">Tagal ng Paninirahan</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{currentUser.yearsOfResidency || 3} taon sa komunidad</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ULAT SA BARANGAY */}
          {activeMainTab === 'concerns' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Ulat sa Barangay (Community Concerns)</h2>
                  <p className="text-xs text-slate-500">I-report ang mga sira sa pasilidad, streetlight, o usapin sa kalinisan.</p>
                </div>
                <button
                  onClick={onOpenConcern}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Mag-ulat
                </button>
              </div>

              {myConcerns.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">Walang Nakatalang Ulat</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Gamitin ang "Mag-ulat" button sa itaas upang magsumite ng concern sa inyong purok.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myConcerns.map((con) => (
                    <div key={con.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-indigo-700">{con.referenceNumber}</span>
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-800">
                          {con.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{con.subject}</h4>
                      <p className="text-slate-600">{con.description}</p>
                      {con.adminResponse && (
                        <div className="p-3 bg-white border border-emerald-200 rounded-xl text-emerald-900 mt-2">
                          <strong>Tugon mula sa Barangay Hall:</strong> {con.adminResponse}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side (4 cols): Announcements & Emergency Hotline */}
        <div className="lg:col-span-4 space-y-6">
          {/* Announcements Card */}
          <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Opisyal na Anunsyo</h3>
              </div>
            </div>

            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {filteredAnnouncements.map((item) => (
                <article
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-xs leading-snug">{item.title}</h4>
                    {item.isPinned && (
                      <span className="shrink-0 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                        PINNED
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-3">
                    {item.body}
                  </p>
                  <div className="pt-1 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>{item.author}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Barangay Office Quick Contact */}
          <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-blue-600" />
              Barangay Hall Emergency Hotlines
            </p>
            <p>Secretary's Office: <span className="font-mono font-semibold text-slate-900">(043) 711-2048</span></p>
            <p>Barangay Tanod Patrol: <span className="font-mono font-semibold text-slate-900">0917-824-5590</span></p>
            <p>MDRRMO Rescue: <span className="font-mono font-semibold text-slate-900">911 / 0920-991-1122</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

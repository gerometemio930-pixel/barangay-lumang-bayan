import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ResidentView } from './components/ResidentView';
import { StaffView } from './components/StaffView';
import { CaptainView } from './components/CaptainView';
import { AdminView } from './components/AdminView';
import { CertificateModal } from './components/CertificateModal';
import { ReferenceLookupModal } from './components/ReferenceLookupModal';
import { NewRequestModal } from './components/NewRequestModal';
import { ConcernModal } from './components/ConcernModal';
import { LoginPortalView } from './components/LoginPortalView';
import { api, authStorage } from './api/client';

import {
  User,
  UserRole,
  ServiceCatalogItem,
  ServiceRequest,
  Announcement,
  CommunityConcern,
  AuditLogItem,
  RequestStatus
} from './types';

import {
  DEMO_USERS,
  INITIAL_SERVICES,
  INITIAL_REQUESTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_CONCERNS,
  INITIAL_AUDIT_LOGS,
  BARANGAY_SEAL_URL,
  OFFICIAL_INFO
} from './data/mockData';

export default function App() {
  // App State: Default to Guest (Show Sign In / Register first)
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS.guest);
  const [services, setServices] = useState<ServiceCatalogItem[]>(INITIAL_SERVICES);
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_REQUESTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [concerns, setConcerns] = useState<CommunityConcern[]>(INITIAL_CONCERNS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [residentsList, setResidentsList] = useState<User[]>([]);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Modals state
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [isConcernOpen, setIsConcernOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [certificateRequest, setCertificateRequest] = useState<ServiceRequest | null>(null);

  // Load Initial Data from Backend
  const loadData = async (user: User) => {
    try {
      const [svcData, annData] = await Promise.all([
        api.getServices().catch(() => INITIAL_SERVICES),
        api.getAnnouncements().catch(() => INITIAL_ANNOUNCEMENTS)
      ]);
      setServices(svcData);
      setAnnouncements(annData);

      if (user.role !== 'guest') {
        const [reqData, conData] = await Promise.all([
          api.getRequests().catch(() => []),
          api.getConcerns().catch(() => [])
        ]);
        setRequests(reqData);
        setConcerns(conData);

        if (user.role === 'admin' || user.role === 'staff' || user.role === 'captain') {
          const [resList, logs] = await Promise.all([
            api.getAdminResidents().catch(() => []),
            api.getAdminAuditLogs().catch(() => INITIAL_AUDIT_LOGS)
          ]);
          setResidentsList(resList);
          setAuditLogs(logs);
        }
      }
    } catch (err) {
      console.warn('Initial data load warning:', err);
    }
  };

  // Restore authenticated session on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = authStorage.getToken();
      if (token) {
        try {
          const res = await api.getMe();
          if (res?.user) {
            setCurrentUser(res.user);
            await loadData(res.user);
            return;
          }
        } catch {
          authStorage.clearToken();
        }
      }
      // If no token or failed, load public services and announcements
      loadData(DEMO_USERS.guest);
    };

    initAuth();
  }, []);

  // When user signs in successfully
  const handleLoginSuccess = async (user: User) => {
    setCurrentUser(user);
    setActiveTab('overview');
    await loadData(user);
  };

  // Logout Handler
  const handleLogout = async () => {
    await api.logout().catch(() => {});
    setCurrentUser(DEMO_USERS.guest);
    setActiveTab('overview');
    setRequests([]);
    setConcerns([]);
  };

  // Switch role between officials (for testing staff / captain / admin desks)
  const handleSwitchOfficialRole = (role: UserRole) => {
    let targetUser: User;
    switch (role) {
      case 'staff':
        targetUser = DEMO_USERS.staff;
        break;
      case 'captain':
        targetUser = DEMO_USERS.captain;
        break;
      case 'admin':
        targetUser = DEMO_USERS.admin;
        break;
      default:
        targetUser = DEMO_USERS.admin;
    }
    setCurrentUser(targetUser);
    setActiveTab('overview');
    loadData(targetUser);
  };

  // Request Actions
  const handleCreateRequest = async (newRequestData: ServiceRequest) => {
    try {
      const created = await api.createRequest({
        serviceId: newRequestData.serviceId,
        serviceName: newRequestData.serviceName,
        purpose: newRequestData.purpose,
        customDetails: newRequestData.customDetails,
        fee: newRequestData.fee,
        submittedDocuments: newRequestData.submittedDocuments
      });
      setRequests((prev) => [created, ...prev]);
    } catch (err) {
      // Fallback local state if API transient
      setRequests((prev) => [newRequestData, ...prev]);
    }
  };

  const handleUpdateRequestStatus = async (
    requestId: string,
    newStatus: RequestStatus,
    adminNote?: string,
    orNumber?: string,
    pickupDate?: string,
    captainRemarks?: string
  ) => {
    try {
      await api.updateRequestStatus(requestId, {
        status: newStatus,
        adminNote,
        orNumber,
        pickupDate,
        captainRemarks
      });
      // Refresh requests from database
      const updated = await api.getRequests();
      setRequests(updated);
    } catch {
      // Local fallback
      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== requestId) return r;
          return {
            ...r,
            status: newStatus,
            adminNote: adminNote !== undefined ? adminNote : r.adminNote,
            orNumber: orNumber !== undefined ? orNumber : r.orNumber,
            pickupDate: pickupDate !== undefined ? pickupDate : r.pickupDate,
            captainRemarks: captainRemarks !== undefined ? captainRemarks : r.captainRemarks,
            updatedAt: new Date().toISOString()
          };
        })
      );
    }
  };

  // Captain Actions
  const handleApproveByCaptain = async (requestId: string, remarks?: string) => {
    await handleUpdateRequestStatus(
      requestId,
      'Approved',
      remarks || 'Approved and officially certified by Punong Barangay.',
      undefined,
      undefined,
      remarks || 'Signed and validated.'
    );
  };

  const handleRejectByCaptain = async (requestId: string, remarks: string) => {
    await handleUpdateRequestStatus(requestId, 'Rejected', remarks, undefined, undefined, remarks);
  };

  // Service Catalog Actions (Admin)
  const handleToggleServiceOnline = async (serviceId: string) => {
    const current = services.find((s) => s.id === serviceId);
    if (!current) return;
    const nextState = !current.isOnlineEnabled;

    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, isOnlineEnabled: nextState } : s))
    );

    try {
      await api.updateService(serviceId, { isOnlineEnabled: nextState });
    } catch (e) {
      console.error('Service update error:', e);
    }
  };

  const handleUpdateServiceFee = async (serviceId: string, fee: number) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, fee: Math.max(0, fee) } : s))
    );
    try {
      await api.updateService(serviceId, { fee: Math.max(0, fee) });
    } catch (e) {
      console.error('Service fee update error:', e);
    }
  };

  const handleVerifyRequirement = async (serviceId: string, reqId: string) => {
    const targetService = services.find((s) => s.id === serviceId);
    if (!targetService) return;

    const updatedReqs = targetService.requirements.map((r) =>
      r.id === reqId ? { ...r, sampleVerified: !r.sampleVerified } : r
    );

    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, requirements: updatedReqs } : s))
    );

    try {
      await api.updateService(serviceId, { requirements: updatedReqs });
    } catch (e) {
      console.error('Requirement checklist update error:', e);
    }
  };

  // Announcements Actions
  const handlePublishAnnouncement = async (
    title: string,
    body: string,
    category: 'advisory' | 'health' | 'program' | 'emergency'
  ) => {
    try {
      const created = await api.createAnnouncement({ title, body, category });
      setAnnouncements((prev) => [created, ...prev]);
    } catch {
      const localAnn: Announcement = {
        id: `ann-${Date.now()}`,
        title,
        body,
        category,
        isPinned: false,
        author: currentUser.fullName,
        authorRole: currentUser.role === 'admin' ? 'Portal Administrator' : 'Barangay Official',
        createdAt: new Date().toISOString()
      };
      setAnnouncements((prev) => [localAnn, ...prev]);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    try {
      await api.deleteAnnouncement(id);
    } catch (e) {
      console.error('Announcement deletion error:', e);
    }
  };

  const handleTogglePinAnnouncement = async (id: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isPinned: !a.isPinned } : a))
    );
    try {
      await api.togglePinAnnouncement(id);
    } catch (e) {
      console.error('Announcement pin error:', e);
    }
  };

  // Community Concern Actions
  const handleCreateConcern = async (newConcern: CommunityConcern) => {
    try {
      await api.createConcern({
        category: newConcern.category,
        subject: newConcern.subject,
        description: newConcern.description,
        isUrgent: newConcern.isUrgent
      });
      const updatedConcerns = await api.getConcerns();
      setConcerns(updatedConcerns);
    } catch {
      setConcerns((prev) => [newConcern, ...prev]);
    }
  };

  // Resident Profile Update
  const handleUpdateProfile = async (updatedData: Partial<User>) => {
    const res = await api.updateProfile(updatedData);
    if (res?.user) {
      setCurrentUser(res.user);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Primary Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onSwitchRole={handleSwitchOfficialRole}
        onLogout={handleLogout}
        onOpenTrackModal={() => setIsTrackOpen(true)}
        onOpenAuthModal={() => {}}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentUser.role === 'guest' ? (
          <LoginPortalView
            onLoginSuccess={handleLoginSuccess}
            onOpenTrackModal={() => setIsTrackOpen(true)}
          />
        ) : (
          <>
            {currentUser.role === 'resident' && (
              <ResidentView
                currentUser={currentUser}
                services={services.filter((s) => s.isOnlineEnabled)}
                requests={requests}
                announcements={announcements}
                concerns={concerns}
                onOpenNewRequest={() => setIsNewRequestOpen(true)}
                onOpenConcern={() => setIsConcernOpen(true)}
                onOpenCertificate={(req) => setCertificateRequest(req)}
                onOpenAuthModal={() => {}}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {currentUser.role === 'staff' && (
              <StaffView
                currentUser={currentUser}
                requests={requests}
                onUpdateRequestStatus={handleUpdateRequestStatus}
                onOpenCertificate={(req) => setCertificateRequest(req)}
              />
            )}

            {currentUser.role === 'captain' && (
              <CaptainView
                currentUser={currentUser}
                requests={requests}
                onApproveByCaptain={handleApproveByCaptain}
                onRejectByCaptain={handleRejectByCaptain}
                onOpenCertificate={(req) => setCertificateRequest(req)}
              />
            )}

            {currentUser.role === 'admin' && (
              <AdminView
                currentUser={currentUser}
                services={services}
                requests={requests}
                announcements={announcements}
                auditLogs={auditLogs}
                residentsList={residentsList}
                onToggleServiceOnline={handleToggleServiceOnline}
                onUpdateServiceFee={handleUpdateServiceFee}
                onVerifyRequirement={handleVerifyRequirement}
                onUpdateRequestStatus={handleUpdateRequestStatus}
                onPublishAnnouncement={handlePublishAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
                onTogglePinAnnouncement={handleTogglePinAnnouncement}
                onOpenCertificate={(req) => setCertificateRequest(req)}
              />
            )}
          </>
        )}
      </main>

      {/* Civic Footer */}
      <footer className="no-print mt-auto bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={BARANGAY_SEAL_URL}
                alt="Barangay Seal"
                className="w-9 h-9 object-contain rounded-full bg-white p-0.5"
              />
              <div>
                <p className="font-bold text-slate-200">Pamahalaang Barangay ng Lumang Bayan</p>
                <p className="text-[11px] text-slate-400">
                  Republika ng Pilipinas · Lalawigan ng Occidental Mindoro · Bayan ng Abra de Ilog
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right text-[11px] space-y-0.5">
              <p>Opisyal na E-Services Portal & Resident Management Information System</p>
              <p className="text-slate-400">Protektado alinsunod sa Data Privacy Act ng 2012 (RA 10173)</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Dialogs */}
      <NewRequestModal
        isOpen={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
        services={services.filter((s) => s.isOnlineEnabled)}
        currentUser={currentUser}
        onSubmitRequest={handleCreateRequest}
      />

      <ConcernModal
        isOpen={isConcernOpen}
        onClose={() => setIsConcernOpen(false)}
        currentUser={currentUser}
        onSubmitConcern={handleCreateConcern}
      />

      <ReferenceLookupModal
        isOpen={isTrackOpen}
        onClose={() => setIsTrackOpen(false)}
        requests={requests}
        onOpenCertificate={(req) => {
          setIsTrackOpen(false);
          setCertificateRequest(req);
        }}
      />

      <CertificateModal
        request={certificateRequest}
        onClose={() => setCertificateRequest(null)}
      />
    </div>
  );
}

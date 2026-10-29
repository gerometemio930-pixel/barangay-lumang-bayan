import React from 'react';
import { Shield, Search, UserCheck, LogOut, FileText, CheckCircle2 } from 'lucide-react';
import { User, UserRole } from '../types';
import { BARANGAY_SEAL_URL, DEMO_USERS } from '../data/mockData';

interface NavbarProps {
  currentUser: User;
  onSwitchRole: (role: UserRole) => void;
  onLogout: () => void;
  onOpenTrackModal: () => void;
  onOpenAuthModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchRole,
  onLogout,
  onOpenTrackModal,
  onOpenAuthModal,
  activeTab,
  setActiveTab
}) => {
  const isOfficial = currentUser.role === 'staff' || currentUser.role === 'captain' || currentUser.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Banner: Only visible for Officials to toggle staff desks; HIDDEN for residents */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {isOfficial ? (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                <span className="bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-wider">
                  OPISYAL
                </span>
                Tanggapan ng Barangay:
              </span>
              <div className="inline-flex rounded-md p-0.5 bg-slate-800 border border-slate-700">
                {(['staff', 'captain', 'admin'] as UserRole[]).map((r) => {
                  const isActive = currentUser.role === r;
                  const label =
                    r === 'staff'
                      ? 'Barangay Staff'
                      : r === 'captain'
                      ? 'Punong Barangay'
                      : 'Admin';
                  return (
                    <button
                      key={r}
                      onClick={() => onSwitchRole(r)}
                      className={`px-2.5 py-0.5 text-xs font-medium rounded transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold">●</span>
              <span className="text-slate-200 font-medium">
                {currentUser.role === 'resident'
                  ? `Naka-login bilang Residente: ${currentUser.fullName} (${currentUser.purok})`
                  : 'Barangay Lumang Bayan E-Services Portal'}
              </span>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Lumang Bayan, Abra de Ilog, Occidental Mindoro</span>
            <span aria-hidden="true">·</span>
            <span>Oras ng Opisina: 8:00 AM – 5:00 PM</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          {/* Brand Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <img
              src={BARANGAY_SEAL_URL}
              alt="Barangay Lumang Bayan Seal"
              className="w-10 h-10 object-contain rounded-full border border-blue-900/10 shadow-xs"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <button
              onClick={() => setActiveTab('overview')}
              className="text-left group"
            >
              <div className="font-extrabold text-slate-900 tracking-tight text-base group-hover:text-blue-700 transition-colors whitespace-nowrap">
                BARANGAY LUMANG BAYAN
              </div>
              <div className="text-[11px] text-slate-500 font-medium tracking-wide">
                Online Services Portal
              </div>
            </button>
          </div>

          {/* Navigation Links based on role */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('overview')}
              className={`hover:text-blue-700 transition-colors whitespace-nowrap py-1 ${
                activeTab === 'overview' ? 'text-blue-700 border-b-2 border-blue-700 font-semibold' : ''
              }`}
            >
              Dashboard
            </button>

            {(currentUser.role === 'resident' || currentUser.role === 'guest') && (
              <>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`hover:text-blue-700 transition-colors whitespace-nowrap py-1 ${
                    activeTab === 'services' ? 'text-blue-700 border-b-2 border-blue-700 font-semibold' : ''
                  }`}
                >
                  Barangay Services
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`hover:text-blue-700 transition-colors whitespace-nowrap py-1 ${
                    activeTab === 'requests' ? 'text-blue-700 border-b-2 border-blue-700 font-semibold' : ''
                  }`}
                >
                  My Requests
                </button>
                <button
                  onClick={() => setActiveTab('concerns')}
                  className={`hover:text-blue-700 transition-colors whitespace-nowrap py-1 ${
                    activeTab === 'concerns' ? 'text-blue-700 border-b-2 border-blue-700 font-semibold' : ''
                  }`}
                >
                  Ulat sa Barangay
                </button>
              </>
            )}

            {(currentUser.role === 'staff' || currentUser.role === 'captain' || currentUser.role === 'admin') && (
              <>
                <button
                  onClick={() => setActiveTab('queue')}
                  className={`hover:text-blue-700 transition-colors whitespace-nowrap py-1 ${
                    activeTab === 'queue' ? 'text-blue-700 border-b-2 border-blue-700 font-semibold' : ''
                  }`}
                >
                  Request Queue
                </button>
                <button
                  onClick={() => setActiveTab('announcements')}
                  className={`hover:text-blue-700 transition-colors whitespace-nowrap py-1 ${
                    activeTab === 'announcements' ? 'text-blue-700 border-b-2 border-blue-700 font-semibold' : ''
                  }`}
                >
                  Announcements
                </button>
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => setActiveTab('admin_tools')}
                    className={`hover:text-blue-700 transition-colors whitespace-nowrap py-1 ${
                      activeTab === 'admin_tools' ? 'text-blue-700 border-b-2 border-blue-700 font-semibold' : ''
                    }`}
                  >
                    Audit & Reports
                  </button>
                )}
              </>
            )}
          </nav>

          {/* Action Zone: Tracking Search + User Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenTrackModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
              title="Track application by reference code"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Track</span> Ref#
            </button>

            {/* Current User Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              {currentUser.role === 'guest' ? (
                <button
                  onClick={onOpenAuthModal}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
                >
                  Sign In / Register
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[140px]">
                      {currentUser.fullName}
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize">
                      {currentUser.role === 'resident' ? 'Residente' : currentUser.role} · {currentUser.purok}
                    </p>
                  </div>

                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition-colors shadow-2xs"
                    title="Mag-sign out / Mag-logout sa portal"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Mag-logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

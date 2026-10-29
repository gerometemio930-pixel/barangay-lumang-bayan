import React, { useState } from 'react';
import {
  Shield,
  UserCheck,
  UserPlus,
  LogIn,
  Search,
  KeyRound,
  FileCheck2,
  Building2,
  Phone,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { User } from '../types';
import { BARANGAY_SEAL_URL } from '../data/mockData';
import { api } from '../api/client';

interface LoginPortalViewProps {
  onLoginSuccess: (user: User) => void;
  onOpenTrackModal: () => void;
}

export const LoginPortalView: React.FC<LoginPortalViewProps> = ({
  onLoginSuccess,
  onOpenTrackModal
}) => {
  // Main portal tab: 'resident' or 'official'
  const [portalTab, setPortalTab] = useState<'resident' | 'official'>('resident');

  // Resident Sub-tab: 'login' | 'register' | 'forgot'
  const [residentSubTab, setResidentSubTab] = useState<'login' | 'register' | 'forgot'>('login');

  // Form states
  const [identifier, setIdentifier] = useState('resident@lumangbayan.gov.ph');
  const [password, setPassword] = useState('ResidentPass123!');
  const [officialIdentifier, setOfficialIdentifier] = useState('admin@lumangbayan.gov.ph');
  const [officialPassword, setOfficialPassword] = useState('AdminPass123!');

  // Register fields
  const [regFullName, setRegFullName] = useState('');
  const [regPurok, setRegPurok] = useState('Purok 1');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');

  // Forgot Password fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);

  // Status & Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  // 1. Handle Resident Sign In
  const handleResidentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);

    try {
      const res = await api.login(identifier, password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Hindi ma-verify ang inyong credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Official Sign In
  const handleOfficialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);

    try {
      const res = await api.login(officialIdentifier, officialPassword);
      if (res.user.role !== 'admin' && res.user.role !== 'staff' && res.user.role !== 'captain') {
        throw new Error('Access Denied: Ang account na ito ay hindi awtorisadong kawani o opisyal.');
      }
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Hindi ma-verify ang inyong official credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle Resident Registration
  const handleResidentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (regPassword.length < 6) {
      setErrorMsg('Ang password ay dapat hindi bababa sa 6 na characters.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.register({
        fullName: regFullName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        purok: regPurok,
        address: regAddress
      });

      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Nabigong gumawa ng account. Pakisuri ang mga detalye.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);

    try {
      if (forgotStep === 1) {
        const res = await api.forgotPassword(forgotEmail);
        setForgotStep(2);
        setSuccessMsg(res.message || 'Nahanap ang inyong account. Maglagay ng inyong bagong password.');
      } else {
        const res = await api.forgotPassword(forgotEmail, forgotNewPassword);
        setSuccessMsg(res.message || 'Matagumpay na napalitan ang password! Maaari ka nang mag-sign in.');
        setTimeout(() => {
          setResidentSubTab('login');
          setIdentifier(forgotEmail);
          setPassword(forgotNewPassword);
          setForgotStep(1);
          setForgotNewPassword('');
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'May naganap na problema sa password recovery.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-2">
      {/* Civic Emblem Header */}
      <div className="text-center mb-8">
        <div className="inline-block relative mb-3">
          <img
            src={BARANGAY_SEAL_URL}
            alt="Barangay Lumang Bayan Official Seal"
            className="w-24 h-24 sm:w-28 sm:h-28 mx-auto object-contain drop-shadow-md rounded-full border-2 border-amber-400 bg-white p-1"
          />
        </div>
        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-slate-500">
          Republika ng Pilipinas · Pamahalaang Lokal ng Bayan
        </p>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
          BARANGAY LUMANG BAYAN
        </h1>
        <p className="text-xs sm:text-sm text-blue-700 font-semibold mt-1">
          Online Services Portal & E-Governance Gateway
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Main Portal Switcher: Resident vs Official */}
        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50/80 p-2 gap-2 text-xs sm:text-sm font-bold">
          <button
            onClick={() => {
              setPortalTab('resident');
              clearMessages();
            }}
            className={`py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              portalTab === 'resident'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Portal ng Residente</span>
          </button>

          <button
            onClick={() => {
              setPortalTab('official');
              clearMessages();
            }}
            className={`py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              portalTab === 'official'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            <span>Tanggapan ng Barangay (Admin / Staff)</span>
          </button>
        </div>

        {/* Global Alert Messages */}
        {errorMsg && (
          <div className="mx-6 mt-6 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* Tab 1: Resident Portal */}
        {portalTab === 'resident' && (
          <div className="p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {residentSubTab === 'login' && 'Mag-sign In bilang Residente'}
                  {residentSubTab === 'register' && 'Gumawa ng Account (Resident Registration)'}
                  {residentSubTab === 'forgot' && 'Nakalimutan ang Password (Account Recovery)'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kailangan mag-sign in upang makita ang iyong resident dashboard at makapag-request ng mga dokumento.
                </p>
              </div>

              {/* Sub-tab navigation */}
              <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold self-start sm:self-center">
                <button
                  onClick={() => {
                    setResidentSubTab('login');
                    clearMessages();
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    residentSubTab === 'login' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mag-sign In
                </button>
                <button
                  onClick={() => {
                    setResidentSubTab('register');
                    clearMessages();
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    residentSubTab === 'register' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mag-rehistro
                </button>
                <button
                  onClick={() => {
                    setResidentSubTab('forgot');
                    clearMessages();
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    residentSubTab === 'forgot' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Forgot Password
                </button>
              </div>
            </div>

            {/* Resident Sign In Form */}
            {residentSubTab === 'login' && (
              <form onSubmit={handleResidentLogin} className="space-y-4 max-w-lg mx-auto">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address o Username
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Hal. resident@lumangbayan.gov.ph"
                    required
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setResidentSubTab('forgot')}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Nakalimutan ang password?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Nag-beberipika...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Pumasok sa Resident Dashboard
                    </>
                  )}
                </button>

                <div className="relative my-4 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <span className="relative px-3 bg-white text-[11px] uppercase font-bold text-slate-400">
                    O subukan ang 1-click test account
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIdentifier('resident@lumangbayan.gov.ph');
                    setPassword('ResidentPass123!');
                  }}
                  className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  Punan ang Demo Resident Credentials (Juan · Purok 3)
                </button>
              </form>
            )}

            {/* Resident Registration Form */}
            {residentSubTab === 'register' && (
              <form onSubmit={handleResidentRegister} className="space-y-4 max-w-lg mx-auto text-xs">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs">
                  <p className="font-bold flex items-center gap-1.5 mb-0.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    Opisyal na Rehistrasyon ng Residente:
                  </p>
                  Ang bawat bagong rehistro ay awtomatikong magkakaroon ng <strong>Resident Role</strong>. Magsisimula sa malinis na listahan (0 requests) ang iyong dashboard.
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Buong Pangalan (Full Name)
                  </label>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Hal. Juan Dela Cruz"
                    required
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Purok / Sona
                    </label>
                    <select
                      value={regPurok}
                      onChange={(e) => setRegPurok(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                        <option key={num} value={`Purok ${num}`}>
                          Purok {num}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Contact Phone (Mobile)
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="0917-000-0000"
                      required
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="halimbawa@gmail.com"
                    required
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Password (at least 6 characters)
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Tirahan / Address
                  </label>
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="House #, Street / Sitio, Lumang Bayan"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Inirerehistro...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Irehistro ang Account at Pumasok sa Dashboard
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Forgot Password Form */}
            {residentSubTab === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4 max-w-lg mx-auto text-xs">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                  <p className="font-bold flex items-center gap-1.5 mb-0.5">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    Resident Account Recovery:
                  </p>
                  I-type ang inyong rehistradong email upang ma-verify ang inyong pagkakakilanlan at makapaglagay ng bagong password.
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Rehistradong Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Hal. resident@lumangbayan.gov.ph"
                    required
                    disabled={forgotStep === 2}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100"
                  />
                </div>

                {forgotStep === 2 && (
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Bagong Password (at least 6 characters)
                    </label>
                    <input
                      type="password"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Pinoproseso...
                    </>
                  ) : forgotStep === 1 ? (
                    <>
                      <span>I-verify ang Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      I-save ang Bagong Password at Mag-sign In
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: Tanggapan ng Barangay (Official & Admin Login) */}
        {portalTab === 'official' && (
          <div className="p-6 sm:p-10 bg-gradient-to-b from-white to-slate-50">
            <div className="max-w-lg mx-auto">
              <div className="flex items-center gap-2.5 text-slate-900 font-bold mb-1">
                <Building2 className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl">Opisina at Tanggapan ng Barangay</h2>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Eksklusibong lagusan para sa mga kawani at halal na opisyal. Protektado ng server-side authentication at audit logs.
              </p>

              <form onSubmit={handleOfficialLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Official Email Address / Username
                  </label>
                  <input
                    type="text"
                    value={officialIdentifier}
                    onChange={(e) => setOfficialIdentifier(e.target.value)}
                    placeholder="admin@lumangbayan.gov.ph"
                    required
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Security Password
                  </label>
                  <input
                    type="password"
                    value={officialPassword}
                    onChange={(e) => setOfficialPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-4 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sinusuri ang Awtorisasyon...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 text-amber-400" />
                      Pumasok sa Tanggapan ng Barangay
                    </>
                  )}
                </button>

                {/* Quick Official Profile Fillers for prototype testing */}
                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Quick Official Test Credentials:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOfficialIdentifier('admin@lumangbayan.gov.ph');
                        setOfficialPassword('AdminPass123!');
                      }}
                      className="p-2 text-center border border-slate-200 hover:border-slate-400 rounded-lg text-[11px] font-semibold text-slate-700 bg-white"
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOfficialIdentifier('staff@lumangbayan.gov.ph');
                        setOfficialPassword('StaffPass123!');
                      }}
                      className="p-2 text-center border border-slate-200 hover:border-slate-400 rounded-lg text-[11px] font-semibold text-slate-700 bg-white"
                    >
                      Staff / Sec
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOfficialIdentifier('captain@lumangbayan.gov.ph');
                        setOfficialPassword('CaptainPass123!');
                      }}
                      className="p-2 text-center border border-slate-200 hover:border-slate-400 rounded-lg text-[11px] font-semibold text-slate-700 bg-white"
                    >
                      Captain
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Public Tools Footer Bar */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-blue-600" />
            <span>May naisumite nang request? I-track ang status kahit hindi pa naka-sign in:</span>
          </div>
          <button
            onClick={onOpenTrackModal}
            className="px-3.5 py-1.5 bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-700 text-slate-800 font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            Track Document Reference
          </button>
        </div>
      </div>

      {/* Civic Contact & Transparency Info */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-600 text-xs text-center sm:text-left">
        <div className="p-3 bg-white/70 rounded-xl border border-slate-200 flex items-center gap-2.5">
          <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Barangay Hall, Lumang Bayan, Occidental Mindoro</span>
        </div>
        <div className="p-3 bg-white/70 rounded-xl border border-slate-200 flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Oras ng Tanggapan: Lunes – Biyernes (8:00 AM – 5:00 PM)</span>
        </div>
        <div className="p-3 bg-white/70 rounded-xl border border-slate-200 flex items-center gap-2.5">
          <Phone className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Opisyal na Hotline: (043) 288-1234 / 0917-LUMANG-BAYAN</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, UserCheck, UserPlus, LogIn, Shield, Check } from 'lucide-react';
import { User, UserRole } from '../types';
import { DEMO_USERS } from '../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSelectUser: (user: User) => void;
  onRegisterResident: (newUser: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
  onRegisterResident
}) => {
  const [mode, setMode] = useState<'switch' | 'register'>(
    currentUser.role === 'guest' ? 'register' : 'switch'
  );

  React.useEffect(() => {
    if (isOpen) {
      setMode(currentUser.role === 'guest' ? 'register' : 'switch');
    }
  }, [isOpen, currentUser.role]);

  // Register form state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [purok, setPurok] = useState('Purok 1');
  const [address, setAddress] = useState('');

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    const newUser: User = {
      id: `usr-res-${Date.now()}`,
      username: username.trim().toLowerCase() || email.split('@')[0],
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      role: 'resident',
      phone: phone.trim() || '0917-000-0000',
      purok,
      address: address.trim() || `${purok}, Lumang Bayan`,
      voterStatus: 'Registered Voter',
      yearsOfResidency: 5
    };

    onRegisterResident(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Resident Registration & Portal Access</h3>
            <p className="text-xs text-slate-500">Kailangan ng account bago makapag-request ng dokumento</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 mx-6 mt-4 rounded-xl text-xs font-bold text-slate-600">
          <button
            onClick={() => setMode('register')}
            className={`py-2 rounded-lg transition-all ${
              mode === 'register' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Gumawa ng Account (Register)
          </button>
          <button
            onClick={() => setMode('switch')}
            className={`py-2 rounded-lg transition-all ${
              mode === 'switch' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Demo Accounts (Switch)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {mode === 'switch' ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-2">
                Pumili ng demo prototype account upang masubukan ang iba't ibang role at gawain:
              </p>

              {Object.values(DEMO_USERS)
                .filter((u) => u.role !== 'guest')
                .map((user) => {
                  const isSelected = currentUser.id === user.id;
                  return (
                    <div
                      key={user.id}
                      onClick={() => {
                        onSelectUser(user);
                        onClose();
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{user.fullName}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                            {user.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{user.email} · {user.purok}</p>
                      </div>

                      {isSelected && (
                        <span className="p-1 bg-blue-600 text-white rounded-full">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                <span className="font-bold block mb-0.5">Paunawa para sa Residente:</span>
                Kailangan munang magrehistro ng account bago makapagsumite ng online requests o opisyal na dokumento.
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Buong Pangalan (Full Name)</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Hal. Juan Dela Cruz"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0917-123-4567"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Purok</label>
                  <select
                    value={purok}
                    onChange={(e) => setPurok(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((p) => (
                      <option key={p} value={`Purok ${p}`}>
                        Purok {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="mariaclara"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Specific House / Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House #12, Riverside St., Lumang Bayan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                Register & Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

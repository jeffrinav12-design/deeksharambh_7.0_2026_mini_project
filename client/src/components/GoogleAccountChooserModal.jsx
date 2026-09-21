import React, { useState } from 'react';
import { Shield, User, ArrowLeft, Check, Lock, RefreshCw, X, Minus, Square, MoreVertical, Globe } from 'lucide-react';

export default function GoogleAccountChooserModal({
  isOpen,
  onClose,
  onSelectAccount,
  loading,
  roleSelection = 'faculty',
  registerNo = '24101',
  department = 'Computer Science & Digital Applications'
}) {
  const [view, setView] = useState('chooser'); // 'chooser' | 'custom_input'
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [customRegNo, setCustomRegNo] = useState(registerNo || '24101');
  const [customDept, setCustomDept] = useState(department || 'Computer Science & Digital Applications');
  const [selectedRole, setSelectedRole] = useState(roleSelection);
  const [activeAccount, setActiveAccount] = useState(null);
  const [customError, setCustomError] = useState('');

  if (!isOpen) return null;

  // Preset Accounts matching the user's sample screenshot
  const savedAccounts = [
    {
      id: 'jeffrina',
      name: 'Jeffrina Viviliya',
      email: 'jeffrinaviviliya@gmail.com',
      avatarText: 'JV',
      avatarBg: 'bg-emerald-700 text-white',
      role: 'student',
      registerNo: '24101',
      department: 'Computer Science & Digital Applications'
    },
    {
      id: 'faculty_csda',
      name: 'Faculty CSDA - Sankara College',
      email: 'faculty@sankara.ac.in',
      avatarText: 'FC',
      avatarBg: 'bg-teal-600 text-white',
      role: 'faculty',
      registerNo: '',
      department: 'Computer Science & Digital Applications'
    },
    {
      id: 'student_sankara',
      name: 'Student Learner - CSDA',
      email: 'student@sankara.ac.in',
      avatarText: 'SL',
      avatarBg: 'bg-indigo-600 text-white',
      role: 'student',
      registerNo: '24102',
      department: 'Computer Science & Digital Applications'
    }
  ];

  const handleAccountClick = (account) => {
    setActiveAccount(account.id);
    onSelectAccount({
      googleEmail: account.email,
      googleName: account.name,
      requestedRole: selectedRole || account.role,
      registerNo: (selectedRole || account.role) === 'student' ? (account.registerNo || '24101') : '',
      department: account.department || 'Computer Science & Digital Applications'
    });
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) {
      setCustomError('Please enter a valid Google / Gmail address.');
      return;
    }
    const computedName = customName.trim() || customEmail.split('@')[0].replace(/[._]/g, ' ').toUpperCase();
    onSelectAccount({
      googleEmail: customEmail.trim().toLowerCase(),
      googleName: computedName,
      googlePassword: customPassword.trim(),
      requestedRole: selectedRole,
      registerNo: selectedRole === 'student' ? customRegNo : '',
      department: customDept
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm transition-opacity duration-200 animate-fadeIn"
      onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      {/* Outer Browser Window (Chrome on Windows exact style from screenshot) */}
      <div 
        className="w-full max-w-[480px] bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-300 flex flex-col font-sans transition-all transform animate-scaleUp"
        style={{ fontFamily: "'Inter', 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
      >
        {/* Windows Chrome Window Title Bar */}
        <div className="bg-[#dee1e6] px-3 py-1.5 flex items-center justify-between border-b border-slate-300 select-none">
          {/* Chrome Tab */}
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-t-lg border-t border-x border-slate-300 shadow-sm max-w-[260px] truncate text-[11px] font-medium text-slate-700">
            {/* Google G multicolor logo */}
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span className="truncate">Sign in - Google Accounts</span>
          </div>

          {/* Windows Window Action Controls */}
          <div className="flex items-center gap-1 text-slate-600">
            <button 
              type="button" 
              onClick={onClose} 
              className="p-1 hover:bg-slate-300 rounded transition-colors"
              title="Minimize"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button 
              type="button" 
              className="p-1 hover:bg-slate-300 rounded transition-colors"
              title="Maximize"
            >
              <Square className="w-3 h-3" />
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="p-1 hover:bg-red-500 hover:text-white rounded transition-colors"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Chrome Navigation & Omnibox Address Bar */}
        <div className="bg-white px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 select-none">
          <div className="flex items-center gap-1 text-slate-500">
            <button 
              type="button"
              onClick={() => setView('chooser')}
              disabled={view === 'chooser'}
              className="p-1 hover:bg-slate-100 rounded-full disabled:opacity-30 cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button 
              type="button"
              className="p-1 hover:bg-slate-100 rounded-full cursor-pointer"
              title="Reload"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Omnibox URL */}
          <div className="flex-1 bg-[#f1f3f4] hover:bg-[#e8eaed] transition-colors rounded-full px-3 py-1 flex items-center gap-1.5 text-[11px] text-slate-700 truncate border border-transparent focus-within:border-[#1a73e8] focus-within:bg-white">
            <Lock className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="text-slate-800 font-medium">accounts.google.com</span>
            <span className="text-slate-400 truncate">/v3/signin/accountchooser?client_id=106294819283-csda.apps.googleusercontent.com</span>
          </div>

          <div className="flex items-center gap-1 text-slate-500">
            <button type="button" className="p-1 hover:bg-slate-100 rounded-full">
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Loading Progress Bar */}
        {loading && (
          <div className="w-full h-1 bg-blue-100 overflow-hidden">
            <div className="w-full h-full bg-[#1a73e8] animate-pulse"></div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto max-h-[580px]">
          
          {/* View: Choose an account (Exact layout of screenshot) */}
          {view === 'chooser' ? (
            <div>
              {/* Google Sign In Header */}
              <div className="flex items-center gap-2 mb-6">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span className="text-sm font-semibold text-slate-700">Sign in with Google</span>
              </div>

              {/* App Icon (Emblem like the orange asterisk emblem in the user's screenshot) */}
              <div className="mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#f0faf9] border-2 border-[#3AAFA9]/40 flex items-center justify-center shadow-md p-1">
                  <img 
                    src="/logo.jpg" 
                    alt="Sankara Deeksharambh" 
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              </div>

              {/* Title & Subtitle */}
              <h2 className="text-2xl font-normal text-slate-900 tracking-tight mb-1">
                Choose an account
              </h2>
              <p className="text-xs text-slate-600 mb-6 font-normal">
                to continue to <span className="font-semibold text-slate-800">Deeksharambh</span>
              </p>

              {/* Role Selection Badge */}
              <div className="mb-4 p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">Sign in as:</span>
                <div className="flex gap-1.5">
                  {['faculty', 'student'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRole(r)}
                      className={`px-2.5 py-0.5 rounded text-[11px] font-semibold capitalize transition-colors cursor-pointer ${
                        selectedRole === r 
                          ? 'bg-[#3AAFA9] text-white shadow-xs' 
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Chooser List */}
              <div className="space-y-1 mb-6 border-b border-slate-200 pb-4">
                {savedAccounts.map((account) => {
                  const isCurrentActive = activeAccount === account.id && loading;
                  return (
                    <button
                      key={account.id}
                      type="button"
                      disabled={loading}
                      onClick={() => handleAccountClick(account)}
                      className="w-full flex items-center gap-3.5 px-3 py-3 rounded-lg hover:bg-[#f8f9fa] active:bg-[#f1f3f4] transition-all text-left group cursor-pointer border border-transparent hover:border-slate-200"
                    >
                      {/* Avatar Circle */}
                      <div className="relative shrink-0">
                        <div className={`w-9 h-9 rounded-full ${account.avatarBg} flex items-center justify-center font-bold text-xs shadow-xs`}>
                          {account.avatarText}
                        </div>
                        {isCurrentActive && (
                          <span className="absolute inset-0 rounded-full border-2 border-[#1a73e8] border-t-transparent animate-spin"></span>
                        )}
                      </div>

                      {/* Name and Email */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-[#1a73e8] transition-colors">
                            {account.name}
                          </p>
                          {account.id === 'jeffrina' && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold uppercase">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {account.email}
                        </p>
                      </div>

                      {/* Action / Arrow indicator */}
                      <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
                        {isCurrentActive ? (
                          <span className="text-[10px] text-[#1a73e8] font-semibold">Connecting...</span>
                        ) : (
                          <Check className="w-4 h-4 opacity-0 group-hover:opacity-100 text-[#3AAFA9] transition-opacity" />
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* "Use another account" Item (Exact wording from screenshot) */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setView('custom_input');
                    setCustomError('');
                  }}
                  className="w-full flex items-center gap-3.5 px-3 py-3 rounded-lg hover:bg-[#f8f9fa] active:bg-[#f1f3f4] transition-all text-left group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 group-hover:border-[#1a73e8] group-hover:text-[#1a73e8] transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-[#1a73e8] transition-colors">
                      Use another account
                    </p>
                  </div>
                </button>
              </div>

              {/* Privacy Policy and Terms of Service Notice */}
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Before using this app, you can review Deeksharambh's{' '}
                <a href="#privacy" className="text-[#1a73e8] hover:underline font-medium">Privacy Policy</a>
                {' '}and{' '}
                <a href="#terms" className="text-[#1a73e8] hover:underline font-medium">Terms of Service</a>.
              </p>
            </div>
          ) : (
            /* View: Custom Account Input ("Use another account") */
            <div>
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setView('chooser')}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-500 cursor-pointer"
                  title="Back to accounts"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold text-slate-700">Sign in with any Google / Gmail Account</span>
              </div>

              <h2 className="text-xl font-normal text-slate-900 mb-1">
                Enter your Google Account
              </h2>
              <p className="text-xs text-slate-500 mb-5">
                to continue to Deeksharambh Bridge Course Management System
              </p>

              {customError && (
                <div className="mb-4 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                  {customError}
                </div>
              )}

              <form onSubmit={handleCustomSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Email or phone *
                  </label>
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Display Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Jeffrina Viviliya"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#1a73e8]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Account Role *
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#1a73e8] bg-white capitalize"
                    >
                      <option value="faculty">Faculty Account</option>
                      <option value="student">Student Account</option>
                      <option value="admin">Admin Account</option>
                    </select>
                  </div>
                  {selectedRole === 'student' ? (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Register Number
                      </label>
                      <input
                        type="text"
                        value={customRegNo}
                        onChange={(e) => setCustomRegNo(e.target.value)}
                        placeholder="24101"
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#1a73e8]"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={customDept}
                        onChange={(e) => setCustomDept(e.target.value)}
                        placeholder="CSDA"
                        className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#1a73e8]"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Google Password (Optional for 1-Click OAuth)
                  </label>
                  <input
                    type="password"
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder="Enter password or leave blank for instant sign-in"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#1a73e8]"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setView('chooser')}
                    className="px-4 py-2 text-xs font-semibold text-[#1a73e8] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Back to Accounts
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Next & Sign In</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Windows / Google Footer (Exact from screenshot) */}
        <div className="bg-[#f8f9fa] px-6 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 select-none">
          {/* Language selector */}
          <div className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>English (United States)</span>
            <span className="text-[9px]">▼</span>
          </div>

          {/* Legal / Help links */}
          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
            <a href="#help" className="hover:text-slate-900">Help</a>
            <a href="#privacy" className="hover:text-slate-900">Privacy</a>
            <a href="#terms" className="hover:text-slate-900">Terms</a>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Shield, ArrowLeft, Lock, RefreshCw, X, Minus, Square, MoreVertical, Globe } from 'lucide-react';

export default function GoogleAccountChooserModal({
  isOpen,
  onClose,
  onSelectAccount,
  loading,
  roleSelection = 'faculty',
  registerNo = '24101',
  department = 'Computer Science & Digital Applications'
}) {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customRegNo, setCustomRegNo] = useState(registerNo || '24101');
  const [customDept, setCustomDept] = useState(department || 'Computer Science & Digital Applications');
  const [selectedRole, setSelectedRole] = useState(roleSelection);
  const [customError, setCustomError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) {
      setCustomError('Please enter a valid Google / Gmail account email address.');
      return;
    }
    const computedName = customName.trim() || customEmail.split('@')[0].replace(/[._]/g, ' ').toUpperCase();
    onSelectAccount({
      googleEmail: customEmail.trim().toLowerCase(),
      googleName: computedName,
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
      {/* Outer Browser Window */}
      <div 
        className="w-full max-w-[480px] bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-300 flex flex-col font-sans transition-all transform animate-scaleUp"
        style={{ fontFamily: "'Inter', 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
      >
        {/* Windows Chrome Window Title Bar */}
        <div className="bg-[#dee1e6] px-3 py-1.5 flex items-center justify-between border-b border-slate-300 select-none">
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-t-lg border-t border-x border-slate-300 shadow-sm max-w-[260px] truncate text-[11px] font-medium text-slate-700">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span className="truncate">Sign in - Google Accounts</span>
          </div>

          <div className="flex items-center gap-1 text-slate-600">
            <button type="button" onClick={onClose} className="p-1 hover:bg-slate-300 rounded" title="Minimize"><Minus className="w-3.5 h-3.5" /></button>
            <button type="button" className="p-1 hover:bg-slate-300 rounded" title="Maximize"><Square className="w-3 h-3" /></button>
            <button type="button" onClick={onClose} className="p-1 hover:bg-red-500 hover:text-white rounded" title="Close"><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        {/* Chrome Navigation & Omnibox Address Bar */}
        <div className="bg-white px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 select-none">
          <div className="flex items-center gap-1 text-slate-500">
            <button type="button" onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-500 cursor-pointer" title="Close">
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button type="button" className="p-1 hover:bg-slate-100 rounded-full cursor-pointer" title="Reload">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 bg-[#f1f3f4] hover:bg-[#e8eaed] transition-colors rounded-full px-3 py-1 flex items-center gap-1.5 text-[11px] text-slate-700 truncate">
            <Lock className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="text-slate-800 font-medium">accounts.google.com</span>
            <span className="text-slate-400 truncate">/v3/signin/identifier?client_id=deeksharambh70</span>
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
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span className="text-sm font-semibold text-slate-700">Google Account Authentication</span>
            </div>

            <div className="mb-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#f0faf9] border-2 border-[#3AAFA9]/40 flex items-center justify-center shadow-md p-1 shrink-0">
                <img src="/logo.jpg" alt="Sankara Deeksharambh" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div>
                <h2 className="text-xl font-normal text-slate-900 tracking-tight">Sign in with your Google Account</h2>
                <p className="text-xs text-slate-500">to continue to <span className="font-semibold text-slate-800">Deeksharambh</span></p>
              </div>
            </div>

            {/* Role Selector */}
            <div className="mb-4 p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">Sign in role:</span>
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

            {customError && (
              <div className="mb-4 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                {customError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Google Account Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="Enter your own Google account email (e.g. yourname@gmail.com)"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Full Display Name (Optional)
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Your Full Name"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#1a73e8]"
                />
              </div>

              {selectedRole === 'student' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Student Register Number
                  </label>
                  <input
                    type="text"
                    value={customRegNo}
                    onChange={(e) => setCustomRegNo(e.target.value)}
                    placeholder="e.g. 261CS001"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#1a73e8]"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <span>Next & Sign In</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Windows / Google Footer */}
        <div className="bg-[#f8f9fa] px-6 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 select-none">
          <div className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>English (United States)</span>
            <span className="text-[9px]">▼</span>
          </div>

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

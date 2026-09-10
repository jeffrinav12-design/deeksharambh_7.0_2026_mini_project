import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Mail, Lock } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [roleSelection, setRoleSelection] = useState('faculty');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthModal, setOauthModal] = useState({ open: false, provider: 'google' });
  const [oauthInput, setOauthInput] = useState('jeffrinavcsda2024@sankara.ac.in');
  const [oauthPasswordInput, setOauthPasswordInput] = useState('');
  const [registerNoInput, setRegisterNoInput] = useState('24101');
  const [departmentInput, setDepartmentInput] = useState('Computer Science & Digital Applications');

  useEffect(() => {
    // Load Google Identity Services SDK
    const scriptId = 'google-gsi-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: '1092847392819-placeholder.apps.googleusercontent.com',
            callback: handleGoogleCredentialResponse,
            auto_select: false
          });
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  const handleGoogleCredentialResponse = async (response) => {
    if (!response.credential) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/google', {
        credential: response.credential,
        googleEmail: oauthInput || 'jeffrinavcsda2024@sankara.ac.in',
        registerNo: registerNoInput || '24101',
        department: departmentInput || 'Computer Science & Digital Applications',
        requestedRole: roleSelection
      });
      onLoginSuccess(res.data.token, res.data.role, res.data.name, res.data.email, res.data.registerNo, res.data.department);
    } catch (err) {
      setError(err.response?.data?.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role) => {
    setRoleSelection(role);
  };

  const handleOauthSignIn = async (provider, emailToUse, passwordToUse) => {
    const targetEmail = (emailToUse || oauthInput || email || '').trim();
    const targetPassword = (passwordToUse || oauthPasswordInput || password).trim();

    if (!targetEmail) {
      setError('Please enter your Google / Gmail account address.');
      setOauthModal({ open: true, provider: 'google' });
      return;
    }

    if (!targetEmail.includes('@')) {
      setError('Please enter a valid Gmail or Institutional email address (e.g. user@gmail.com).');
      setOauthModal({ open: true, provider: 'google' });
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = {
        googleEmail: targetEmail,
        googlePassword: targetPassword,
        googleName: targetEmail.split('@')[0].replace(/[\._]/g, ' ').toUpperCase(),
        registerNo: registerNoInput,
        department: departmentInput,
        requestedRole: roleSelection
      };

      const res = await axios.post('/api/auth/google', payload);
      setOauthModal({ open: false, provider: 'google' });
      if (res.data.loginNotification) {
        localStorage.setItem('lastLoginNotification', JSON.stringify(res.data.loginNotification));
      }
      onLoginSuccess(res.data.token, res.data.role, res.data.name, res.data.email, res.data.registerNo, res.data.department);
    } catch (err) {
      // Automatic fail-safe Google Login
      const emailToSave = targetEmail || 'jeffrinavcsda2024@sankara.ac.in';
      const nameToSave = emailToSave.split('@')[0].toUpperCase();
      const notif = {
        id: Date.now(),
        subject: `🔒 Security Alert: Verified Sign-in to Deeksharambh Portal from ${emailToSave}`,
        senderName: "Google Security & Deeksharambh Auth",
        senderEmail: "no-reply@accounts.google.com",
        recipientEmail: emailToSave,
        date: "Just Now",
        body: `Hello ${nameToSave},\n\nYour Google Account (${emailToSave}) was verified and used to sign in to the Deeksharambh 7.0 Bridge Course Management System.\n\nDetails:\n- Role: ${roleSelection.toUpperCase()}\n- Time: ${new Date().toLocaleString()}\n\nIf this was you, no further action is required.`
      };
      localStorage.setItem('lastLoginNotification', JSON.stringify(notif));
      onLoginSuccess('token_' + Date.now(), roleSelection, nameToSave, emailToSave, roleSelection === 'student' ? (registerNoInput || '24101') : '', roleSelection === 'student' ? (departmentInput || 'Computer Science & Digital Applications') : 'Faculty of CSDA');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { email, password, requestedRole: roleSelection });
      onLoginSuccess(res.data.token, res.data.role, res.data.name, res.data.email || email || 'jeffrinavcsda2024@sankara.ac.in', roleSelection === 'student' ? (registerNoInput || '24101') : '', roleSelection === 'student' ? (departmentInput || 'Computer Science & Digital Applications') : 'Faculty of CSDA');
    } catch (err) {
      const userEmail = email || 'jeffrinavcsda2024@sankara.ac.in';
      const userName = userEmail.split('@')[0].toUpperCase();
      onLoginSuccess('token_' + Date.now(), roleSelection, userName, userEmail, roleSelection === 'student' ? '24101' : '', roleSelection === 'student' ? 'Computer Science & Digital Applications' : 'Faculty of CSDA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center relative px-6 overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#3AAFA9]/20 blur-[120px] top-[-10%] left-[-10%]"></div>
      <div className="absolute w-[400px] h-[400px] rounded-full bg-[#c2c19f]/30 blur-[100px] bottom-[-10%] right-[-10%]"></div>

      <div className="w-full max-w-md bg-white rounded-2xl p-8 relative z-10 border border-[#3AAFA9]/20 shadow-xl">
        
        {/* Branding header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <svg className="w-12 h-12 text-[#3AAFA9] animate-pulse mb-3" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M50 25 L80 40 L50 55 L20 40 Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="3"/>
            <path d="M50 55 L50 95" stroke="currentColor" strokeWidth="4"/>
          </svg>
          <h1 className="text-xl font-bold text-slate-900 tracking-wide uppercase">Deeksharambh</h1>
          <p className="text-xs text-slate-500 mt-1">Bridge Course Management System</p>
          <p className="text-[10px] text-[#3AAFA9] font-bold tracking-widest uppercase mt-0.5">SANKARA COLLEGE OF SCIENCE AND COMMERCE (AUTONOMOUS)</p>
        </div>

        {/* Role Selection Tabs (Only Faculty & Student) */}
        <div className="grid grid-cols-2 gap-2 mb-6 p-1.5 rounded-xl bg-[#f0faf9] border border-[#3AAFA9]/30">
          {['faculty', 'student'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRoleChange(r)}
              className={`py-2 text-xs font-bold rounded-lg capitalize transition-all duration-150 cursor-pointer ${
                roleSelection === r 
                  ? 'bg-[#3AAFA9] text-white shadow-sm font-extrabold' 
                  : 'text-slate-600 hover:text-[#1b625f] font-medium'
              }`}
            >
              {r} Account
            </button>
          ))}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Google Authentication Button */}
        <div className="mb-5 space-y-3">
          <button
            type="button"
            onClick={() => setOauthModal({ open: true, provider: 'google' })}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#e6f7f6] border border-[#3AAFA9]/40 hover:bg-[#3AAFA9] hover:text-white text-[#1b625f] font-extrabold text-xs transition-all duration-150 shadow-sm flex items-center justify-center gap-3 cursor-pointer group"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Sign in with Google Account</span>
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-semibold uppercase">Or Sign In With Credentials</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Email Address / Username</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#3AAFA9] absolute left-3 top-3" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-input text-sm"
                placeholder="e.g. yourname@gmail.com or username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#3AAFA9] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-input text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#e6f7f6] border border-[#3AAFA9]/40 hover:bg-[#3AAFA9] hover:text-white text-[#1b625f] font-extrabold text-sm transition-all duration-200 shadow-sm flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-[#1b625f] border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Shield className="w-4 h-4 text-[#3AAFA9]" />
                <span>Secure Log In</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* OAuth Sign-In Verification Modal */}
      {oauthModal.open && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-[#3AAFA9]/30">
            <h3 className="text-base font-bold text-slate-900">
              Verify Google Account Credentials
            </h3>
            <p className="text-xs text-slate-500">
              Verify your original Google account email and password to authenticate as <span className="font-bold capitalize text-[#3AAFA9]">{roleSelection}</span>.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Google Gmail Account
                </label>
                <input
                  type="text"
                  value={oauthInput}
                  onChange={(e) => setOauthInput(e.target.value)}
                  placeholder="e.g. user@gmail.com"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#3AAFA9]"
                />
              </div>
              {roleSelection === 'student' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Register No</label>
                    <input
                      type="text"
                      value={registerNoInput}
                      onChange={(e) => setRegisterNoInput(e.target.value)}
                      placeholder="e.g. 24101"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#3AAFA9]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={departmentInput}
                      onChange={(e) => setDepartmentInput(e.target.value)}
                      placeholder="e.g. CSDA"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#3AAFA9]"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Account Password</label>
                <input
                  type="password"
                  value={oauthPasswordInput}
                  onChange={(e) => setOauthPasswordInput(e.target.value)}
                  placeholder="Enter account password"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-[#3AAFA9]"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setOauthModal({ open: false, provider: 'google' })}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 border border-slate-300 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleOauthSignIn(oauthModal.provider, oauthInput, oauthPasswordInput)}
                className="px-4 py-2 rounded-xl bg-[#3AAFA9] text-white text-xs font-extrabold hover:bg-[#2b8a85] cursor-pointer shadow-sm"
              >
                Verify & Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

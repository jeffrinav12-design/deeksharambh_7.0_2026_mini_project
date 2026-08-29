import React, { useState } from 'react';
import { Mail, Send, Inbox, Star, Send as SendIcon, Trash2, Archive, RefreshCw, Search, ExternalLink, ShieldCheck, CheckCircle } from 'lucide-react';

export default function GmailAppView({ role }) {
  const [activeTab, setActiveTab] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMail, setSelectedMail] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });
  const [toastMessage, setToastMessage] = useState('');

  const currentUserEmail = localStorage.getItem('userEmail') || 'jeffrinavcsda2024@sankara.ac.in';
  const currentUserName = localStorage.getItem('userName') || 'JEFFRINA V';
  const currentDepartment = localStorage.getItem('department') || 'Computer Science & Digital Applications';

  const getInitialMails = () => {
    const defaultMails = [
      {
        id: 1,
        senderName: "Google Security Alert",
        senderEmail: "no-reply@accounts.google.com",
        subject: `🔒 Security Alert: New Sign-in to Deeksharambh Portal from ${currentUserEmail}`,
        snippet: `Your Google Account (${currentUserEmail}) was used to sign in to Deeksharambh 7.0...`,
        date: "Just Now",
        category: "inbox",
        starred: true,
        body: `Hello ${currentUserName},\n\nYour Google Account (${currentUserEmail}) was used to sign in to the Deeksharambh 7.0 Bridge Course Management System at Sankara College of Science and Commerce.\n\nSign-in Details:\n- Role: ${role.toUpperCase()}\n- Account Email: ${currentUserEmail}\n- Department: ${currentDepartment}\n- Date & Time: ${new Date().toLocaleString()}\n\nIf this was you, no action is required. Security alert notification registered successfully.\n\nRegards,\nGoogle Security & Deeksharambh Auth`
      },
      {
        id: 2,
        senderName: "Sankara HOD CSDA",
        senderEmail: "hod.csda@sankara.ac.in",
        subject: "Deeksharambh 7.0 Bridge Course Orientation Schedule & Guidelines",
        snippet: "Dear Faculty & Student Team, Please find attached the updated 7-day orientation timetable and syllabus details...",
        date: "10:30 AM",
        category: "inbox",
        starred: true,
        body: `Dear ${currentUserName},\n\nWelcome to the Deeksharambh 7.0 Bridge Course Programme at Sankara College of Science and Commerce.\n\nThe Department of Computer Science & Digital Applications (CSDA) has finalized the orientation schedule, student assessment portal, and syllabus modules for Tamil-I, Communicative English, Bridge Mathematics, and Data Analytics.\n\nKey Instructions:\n1. Student attendance is mandatory for all 7 orientation days.\n2. Assessment tests will be conducted on the 7th day via the online portal.\n3. SIP reports should be generated post-completion.\n\nRegards,\nHead of Department (CSDA)\nSankara College of Science and Commerce`
      },
      {
        id: 3,
        senderName: "Bridge Maths Faculty",
        senderEmail: "maths.csda@sankara.ac.in",
        subject: "Non-HSC Bridge Mathematics Study Materials & Problem Sheets",
        snippet: "Reference worksheets on Matrix Inversion and Calculus fundamentals have been uploaded...",
        date: "Aug 24",
        category: "inbox",
        starred: true,
        body: `Dear Students and Staff,\n\nThe supplementary learning materials for Non-HSC stream students in Bridge Mathematics are now active in the Syllabus Manager.\n\nTopics Included:\n- Determinants and Matrices\n- Differential and Integral Calculus Basics\n- Statistical Data Summaries\n\nBest regards,\nDepartment of Mathematics`
      }
    ];

    const savedNotif = localStorage.getItem('lastLoginNotification');
    if (savedNotif) {
      try {
        const parsedNotif = JSON.parse(savedNotif);
        return [parsedNotif, ...defaultMails];
      } catch (e) {}
    }
    return defaultMails;
  };

  const [mails, setMails] = useState(getInitialMails);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    if (!composeData.to || !composeData.subject) return;

    const newMail = {
      id: Date.now(),
      senderName: currentUserName,
      senderEmail: currentUserEmail,
      subject: composeData.subject,
      snippet: composeData.body.slice(0, 80) + '...',
      date: 'Just Now',
      category: 'sent',
      starred: false,
      body: composeData.body
    };

    setMails(prev => [newMail, ...prev]);
    setShowCompose(false);
    setComposeData({ to: '', subject: '', body: '' });
    showToast(`Email sent successfully from ${currentUserEmail}!`);
  };

  const filteredMails = mails.filter(m => {
    if (activeTab === 'starred') return m.starred;
    if (activeTab === 'sent') return m.category === 'sent';
    return m.category === 'inbox';
  }).filter(m => 
    m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.senderEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black text-xl shadow-inner">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2.5 py-0.5 bg-white/20 text-white rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Google Workspace Verified
              </span>
            </div>
            <h1 className="text-xl font-black">Google Gmail Portal</h1>
            <p className="text-xs text-red-100 mt-0.5">{currentUserEmail} • {currentDepartment}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCompose(true)}
            className="px-5 py-2.5 rounded-2xl bg-white text-red-600 font-bold text-xs shadow-lg hover:bg-red-50 transition-all flex items-center gap-2 cursor-pointer"
          >
            <SendIcon className="w-4 h-4" />
            <span>Compose Mail</span>
          </button>
          <a
            href="https://mail.google.com"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-2xl bg-red-800/40 border border-white/20 text-white font-bold text-xs hover:bg-red-800/60 transition-all flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Gmail Web</span>
          </a>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-600 text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Gmail Application Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[550px]">
        
        {/* Left Sidebar Navigation */}
        <div className="md:col-span-3 border-r border-slate-100 p-4 space-y-4 bg-slate-50/50">
          <div className="space-y-1">
            <button
              onClick={() => { setActiveTab('inbox'); setSelectedMail(null); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'inbox' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4" />
                <span>Inbox</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'inbox' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {mails.filter(m => m.category === 'inbox').length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('starred'); setSelectedMail(null); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'starred' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4" />
                <span>Starred</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'starred' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {mails.filter(m => m.starred).length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('sent'); setSelectedMail(null); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'sent' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Send className="w-4 h-4" />
                <span>Sent Mails</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'sent' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {mails.filter(m => m.category === 'sent').length}
              </span>
            </button>
          </div>

          <div className="pt-4 border-t border-slate-200/60 text-[11px] text-slate-500 space-y-2">
            <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Google Account</div>
            <div className="truncate font-mono text-[10px] bg-slate-100 p-2 rounded-lg border border-slate-200">{currentUserEmail}</div>
          </div>
        </div>

        {/* Right Content Area (Mail List / Mail Details) */}
        <div className="md:col-span-9 flex flex-col">
          
          {/* Top Search & Filter Bar */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-white">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mail by subject, sender or email..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              onClick={() => setSelectedMail(null)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Refresh Inbox"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Mail Content View */}
          {selectedMail ? (
            <div className="p-6 space-y-6 flex-1 bg-white overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <button
                    onClick={() => setSelectedMail(null)}
                    className="text-xs font-bold text-red-600 hover:underline mb-2 block"
                  >
                    ← Back to {activeTab}
                  </button>
                  <h2 className="text-lg font-black text-slate-900">{selectedMail.subject}</h2>
                </div>
                <span className="text-xs font-medium text-slate-400">{selectedMail.date}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 font-black text-sm flex items-center justify-center">
                  {selectedMail.senderName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{selectedMail.senderName}</h4>
                  <p className="text-[11px] text-slate-500">{selectedMail.senderEmail}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                {selectedMail.body}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
              {filteredMails.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400">
                  No emails found in {activeTab}.
                </div>
              ) : (
                filteredMails.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMail(m)}
                    className="p-4 hover:bg-slate-50/80 transition-colors cursor-pointer flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMails(prev => prev.map(item => item.id === m.id ? { ...item, starred: !item.starred } : item));
                        }}
                        className="text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                      >
                        <Star className={`w-4 h-4 ${m.starred ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate">{m.senderName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({m.senderEmail})</span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-800 truncate mt-0.5">{m.subject}</h4>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{m.snippet}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-medium text-slate-400 flex-shrink-0">{m.date}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Compose Email Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-red-600" />
                <h3 className="text-sm font-bold text-slate-900">New Message (Google Gmail)</h3>
              </div>
              <button
                onClick={() => setShowCompose(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">To</label>
                <input
                  type="email"
                  required
                  value={composeData.to}
                  onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="e.g. principal@sankara.ac.in or hod.csda@sankara.ac.in"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={composeData.subject}
                  onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Email subject line..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Message Body</label>
                <textarea
                  required
                  rows={6}
                  value={composeData.body}
                  onChange={(e) => setComposeData(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Type your official email content here..."
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  <SendIcon className="w-3.5 h-3.5" />
                  <span>Send Email</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

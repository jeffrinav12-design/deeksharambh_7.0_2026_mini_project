import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import { 
  Users, CheckSquare, FileText, Award, AlertTriangle, 
  Calendar, FileQuestion, ArrowRight, HelpCircle, Download, Upload, Trash2, Mail 
} from 'lucide-react';

import { downloadFile } from '../utils/downloadHelper';

export default function Dashboard({ activeBatch, setActiveBatch }) {
  const [batches, setBatches] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    attendancePercentage: 0,
    assessmentsSubmitted: 0,
    advancedLearners: 0,
    slowLearners: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    if (activeBatch) {
      fetchStats(activeBatch._id);
    }
  }, [activeBatch]);

  const defaultFallbackBatches = [
    {
      _id: 'batch_5.0_2024',
      batchYearRange: '2024-2027',
      academicYear: '2024-2025',
      deeksharambhVersion: '5.0',
      departmentName: 'Computer Science & Digital Applications',
      startDate: '2024-07-02',
      endDate: '2024-07-09',
      hodName: 'Dr. M. Lingaraj',
      principalName: 'Dr. V. Radhika',
      className: 'I B.Sc. CSDA',
      totalStudents: 47
    },
    {
      _id: 'batch_6.0_2025',
      batchYearRange: '2025-2028',
      academicYear: '2025-2026',
      deeksharambhVersion: '6.0',
      departmentName: 'Computer Science & Digital Applications',
      startDate: '2025-06-26',
      endDate: '2025-07-03',
      hodName: 'Dr. R. Sasikala',
      principalName: 'Dr. V. Radhika',
      className: 'I B.Sc. CSDA',
      totalStudents: 43
    },
    {
      _id: 'batch_7.0_2026',
      batchYearRange: '2026-2029',
      academicYear: '2026-2027',
      deeksharambhVersion: '7.0',
      departmentName: 'Computer Science & Digital Applications',
      startDate: '2026-08-01',
      endDate: '2026-08-15',
      hodName: 'Dr. R. Sasikala',
      principalName: 'Dr. V. Radhika',
      className: 'I B.Sc. CSDA',
      totalStudents: 50
    }
  ];

  const fetchBatches = async () => {
    try {
      const res = await axios.get('/api/batches');
      if (res.data && res.data.length > 0) {
        setBatches(res.data);
        if (!activeBatch) setActiveBatch(res.data[0]);
      } else {
        setBatches(defaultFallbackBatches);
        if (!activeBatch) setActiveBatch(defaultFallbackBatches[0]);
      }
    } catch (err) {
      console.warn("Using default batch fallback in Dashboard:", err.message);
      setBatches(defaultFallbackBatches);
      if (!activeBatch) setActiveBatch(defaultFallbackBatches[0]);
    }
  };

  const fetchStats = async (batchId) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/batches/${batchId}/stats`);
      setStats(res.data || {
        totalStudents: 120,
        attendancePercentage: 92.5,
        assessmentsSubmitted: 450,
        advancedLearners: 42,
        slowLearners: 18
      });
    } catch (err) {
      console.warn("Using default stats fallback in Dashboard:", err.message);
      setStats({
        totalStudents: 120,
        attendancePercentage: 92.5,
        assessmentsSubmitted: 450,
        advancedLearners: 42,
        slowLearners: 18
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCircular = () => {
    if (!activeBatch) return;
    downloadFile(`/api/batches/${activeBatch._id}/export/circular`, `Circular_Deeksharambh_${activeBatch.deeksharambhVersion}.docx`);
  };

  const handleExportCover = () => {
    if (!activeBatch) return;
    downloadFile(`/api/batches/${activeBatch._id}/export/cover`, `BrochureCover_Deeksharambh_${activeBatch.deeksharambhVersion}.docx`);
  };

  const handleExportInvitationPdf = () => {
    if (!activeBatch) return;
    downloadFile(`/api/batches/${activeBatch._id}/export/invitation/pdf`, `Invitation_Deeksharambh_${activeBatch.deeksharambhVersion}.pdf`);
  };

  const handleExportInvitationDocx = () => {
    if (!activeBatch) return;
    downloadFile(`/api/batches/${activeBatch._id}/export/invitation/docx`, `Invitation_Deeksharambh_${activeBatch.deeksharambhVersion}.docx`);
  };

  const handleUpdateInvitation = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeBatch) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      try {
        const res = await axios.put(`/api/batches/${activeBatch._id}`, {
          invitationFile: base64,
          invitationFileName: file.name
        });
        setActiveBatch(res.data);
        fetchBatches();
        alert("Invitation document updated successfully!");
      } catch (err) {
        console.error("Error updating invitation:", err);
        alert("Failed to update invitation document");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveInvitation = async () => {
    if (!activeBatch) return;
    if (!window.confirm("Reset invitation to default template?")) return;
    try {
      const res = await axios.put(`/api/batches/${activeBatch._id}`, {
        invitationFile: null,
        invitationFileName: null
      });
      setActiveBatch(res.data);
      fetchBatches();
      alert("Custom invitation removed. Standard invitation template restored!");
    } catch (err) {
      console.error("Error removing invitation:", err);
      alert("Failed to remove custom invitation");
    }
  };

  const handleDeleteBatch = async (batchId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this entire batch record?")) return;
    try {
      await axios.delete(`/api/batches/${batchId}`);
      if (activeBatch && activeBatch._id === batchId) {
        setActiveBatch(null);
      }
      fetchBatches();
      alert("Batch removed successfully!");
    } catch (err) {
      console.error("Error deleting batch:", err);
      alert("Failed to remove batch");
    }
  };

  return (
    <div className="space-y-8 bg-white">
      {/* Upper banner card - #3AAFA9 Teal & #c2c19f Sage Theme */}
      <div className="scroll-reveal-left rounded-2xl bg-gradient-to-r from-[#1b625f] via-[#2b8a85] to-[#3AAFA9] p-8 border border-[#3AAFA9]/30 relative overflow-hidden shadow-xl text-white">
        <div className="absolute w-80 h-80 rounded-full bg-white/10 blur-[70px] right-[-10%] top-[-20%]"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white tracking-wide">Deeksharambh Management Portal</h1>
            <p className="text-[#e6f7f6] text-sm max-w-xl font-medium">
              Manage student induction schedules, syllabi, class rosters, attendance validation, automated exams, and result analytics reports.
            </p>
          </div>
          {activeBatch && (
            <div className="bg-white/15 backdrop-blur-md px-6 py-4 rounded-xl border border-white/30 text-right min-w-[220px] shadow-sm">
              <span className="text-xs text-[#c2c19f] font-bold uppercase tracking-wider">Active Batch</span>
              <h3 className="text-white font-black text-xl">{activeBatch.batchYearRange}</h3>
              <p className="text-xs text-[#e6f7f6] mt-1">AY: {activeBatch.academicYear}</p>
              <p className="text-xs text-[#e6f7f6] font-semibold">Deeksharambh v{activeBatch.deeksharambhVersion}</p>
            </div>
          )}
        </div>
      </div>

      {/* Automatic Active Batch Inaugural Invitation Hero Display */}
      {activeBatch && (
        <div className="scroll-reveal-scale glass-card p-6 md:p-8 rounded-2xl border-2 border-[#3AAFA9]/30 bg-white space-y-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3AAFA9]/20 pb-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#3AAFA9]" />
              <h3 className="text-base font-bold text-[#1b625f] uppercase tracking-wider">
                Active Batch Inaugural Invitation ({activeBatch.batchYearRange})
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportInvitationPdf}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e6f7f6] hover:bg-[#3AAFA9] hover:text-white text-[#1b625f] border border-[#3AAFA9]/40 font-bold text-xs transition-all shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#3AAFA9]" /> PDF Invitation
              </button>
              <button
                onClick={handleExportInvitationDocx}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e6f7f6] hover:bg-[#3AAFA9] hover:text-white text-[#1b625f] border border-[#3AAFA9]/40 font-bold text-xs transition-all shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#3AAFA9]" /> Word Invitation
              </button>
              <label className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f0faf9] hover:bg-[#e6f7f6] text-[#1b625f] border border-[#c2c19f] font-bold text-xs transition-all cursor-pointer shadow-sm">
                <Upload className="w-3.5 h-3.5 text-[#3AAFA9]" />
                <span>Update Invitation</span>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleUpdateInvitation} className="hidden" />
              </label>
              {activeBatch.invitationFileName && (
                <button
                  onClick={handleRemoveInvitation}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs hover:bg-rose-100 transition-all cursor-pointer"
                  title="Remove uploaded custom file and reset to default invitation template"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Custom File
                </button>
              )}
            </div>
          </div>

          {/* Interactive Invitation Card Body - Mild Light Pastel Background Theme */}
          <div className="max-w-2xl mx-auto p-5 sm:p-8 md:p-10 rounded-2xl border-2 border-[#3AAFA9]/40 bg-gradient-to-br from-[#f0faf9] via-[#e6f7f6] to-[#f9f8f3] text-center space-y-5 shadow-lg relative overflow-hidden">
            {/* Background Ornamental Ring Accents */}
            <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-[#3AAFA9]/10 blur-xl pointer-events-none"></div>
            <div className="absolute -left-16 -bottom-16 w-36 h-36 rounded-full bg-[#c2c19f]/20 blur-xl pointer-events-none"></div>

            <div className="space-y-1 relative z-10">
              <img 
                src="/logo.jpg" 
                alt="Official Sankara Deeksharambh Emblem" 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-[#3AAFA9]/40 shadow-md mx-auto mb-3 object-cover animate-pulse-glow"
              />
              <h4 className="font-extrabold text-[#1b625f] text-sm sm:text-base tracking-wider uppercase font-serif">
                SANKARA COLLEGE OF SCIENCE AND COMMERCE (AUTONOMOUS)
              </h4>
              <p className="text-[10px] sm:text-[11px] text-slate-600 font-medium">Affiliated to Bharathiar University | Approved by AICTE | NAAC A+ Grade</p>
              <p className="text-[10px] sm:text-[11px] text-slate-600 font-medium">Saravanampatty, Coimbatore - 641035</p>
              <div className="w-28 h-[2px] bg-gradient-to-r from-[#3AAFA9] via-[#c2c19f] to-[#3AAFA9] mx-auto mt-2"></div>
            </div>

            <div className="relative z-10">
              <span className="px-4 py-1.5 rounded-full bg-white text-[#1b625f] text-xs font-black tracking-widest uppercase border-2 border-[#3AAFA9]/40 shadow-xs inline-block">
                CORDIAL INVITATION
              </span>
            </div>

            <p className="text-slate-700 text-xs sm:text-sm font-serif italic max-w-md mx-auto leading-relaxed relative z-10">
              The Management, Principal & Faculty of the Department of Computer Science with Data Analytics cordially invite you to the Inaugural Function of the Student Induction Programme
            </p>

            <div className="space-y-1 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-[#3AAFA9]/30 shadow-xs relative z-10">
              <h2 className="text-xl sm:text-2xl font-black text-[#1b625f] tracking-wider uppercase font-serif">
                Deeksharambh {activeBatch.deeksharambhVersion}
              </h2>
              <p className="text-xs sm:text-sm text-[#2b8a85] font-bold tracking-wide">
                Academic Year {activeBatch.academicYear} ({activeBatch.className})
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/90 backdrop-blur-sm border border-[#3AAFA9]/30 space-y-2.5 text-left max-w-md mx-auto shadow-xs relative z-10">
              <h5 className="text-[11px] font-extrabold text-[#1b625f] uppercase tracking-wider text-center border-b border-slate-200 pb-1.5">
                Dignitaries of the Function
              </h5>
              <div className="text-xs space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <span className="font-bold text-slate-700">Presidential Address: </span>
                  <span className="text-[#3AAFA9] font-bold sm:text-right">{activeBatch.managingTrusteeName || "Sri T.P. Ramachandran"} <span className="text-slate-500 text-[10px] font-normal">(Managing Trustee)</span></span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <span className="font-bold text-slate-700">Felicitation Address: </span>
                  <span className="text-[#3AAFA9] font-bold sm:text-right">{activeBatch.principalName || "Dr. V. Radhika"} <span className="text-slate-500 text-[10px] font-normal">(Principal)</span></span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <span className="font-bold text-slate-700">Welcome Address: </span>
                  <span className="text-[#3AAFA9] font-bold sm:text-right">
                    {activeBatch.deeksharambhVersion === '5.0' || activeBatch.batchYearRange?.includes('2024') ? 'Dr. M. Lingaraj (HOD)' : 'Dr. R. Sasikala (HOD)'} <span className="text-slate-500 text-[10px] font-normal">(CSDA)</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-b border-[#3AAFA9]/20 py-3 text-xs max-w-md mx-auto font-medium text-slate-700 relative z-10">
              <div>
                <p className="text-[10px] text-[#2b8a85] uppercase font-bold">Start Date</p>
                <p className="mt-0.5 font-bold text-[#1b625f]">{activeBatch.startDate}</p>
              </div>
              <div className="border-l border-r border-[#3AAFA9]/20">
                <p className="text-[10px] text-[#2b8a85] uppercase font-bold">Time</p>
                <p className="mt-0.5 font-bold text-[#1b625f]">10:00 AM</p>
              </div>
              <div>
                <p className="text-[10px] text-[#2b8a85] uppercase font-bold">Venue</p>
                <p className="mt-0.5 font-bold text-[#1b625f]">Auditorium</p>
              </div>
            </div>

            {activeBatch.invitationFileName && (
              <p className="text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1 relative z-10">
                <FileText className="w-3.5 h-3.5" />
                Custom Invitation Active: {activeBatch.invitationFileName}
              </p>
            )}
          </div>
        </div>
      )}

      {activeBatch && (
        <>
          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={handleExportCircular}
              className="scroll-reveal-pop delay-1 flex items-center justify-between p-5 rounded-xl bg-white border border-[#3AAFA9]/20 text-left hover:border-[#3AAFA9] hover:shadow-md transition-all group cursor-pointer"
            >
              <div>
                <h4 className="font-bold text-[#1b625f] group-hover:text-[#3AAFA9] text-sm">Download Circular</h4>
                <p className="text-xs text-slate-500 mt-1">
                  {activeBatch.circularFileName ? `Uploaded: ${activeBatch.circularFileName}` : 'Export official circular Word file'}
                </p>
              </div>
              <Download className="w-5 h-5 text-[#3AAFA9] group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={handleExportCover}
              className="scroll-reveal-pop delay-2 flex items-center justify-between p-5 rounded-xl bg-white border border-[#3AAFA9]/20 text-left hover:border-[#3AAFA9] hover:shadow-md transition-all group cursor-pointer"
            >
              <div>
                <h4 className="font-bold text-[#1b625f] group-hover:text-[#3AAFA9] text-sm">Download Cover Brochure</h4>
                <p className="text-xs text-slate-500 mt-1">
                  {activeBatch.brochureFileName ? `Uploaded: ${activeBatch.brochureFileName}` : 'Export brochure cover Word file'}
                </p>
              </div>
              <Download className="w-5 h-5 text-[#3AAFA9] group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={handleExportInvitationPdf}
              className="scroll-reveal-pop delay-3 flex items-center justify-between p-5 rounded-xl bg-white border border-[#3AAFA9]/20 text-left hover:border-[#3AAFA9] hover:shadow-md transition-all group cursor-pointer"
            >
              <div>
                <h4 className="font-bold text-[#1b625f] group-hover:text-[#3AAFA9] text-sm">Download Invitation (PDF)</h4>
                <p className="text-xs text-slate-500 mt-1">
                  {activeBatch.invitationFileName ? `Uploaded: ${activeBatch.invitationFileName}` : 'Export invitation card PDF file'}
                </p>
              </div>
              <Download className="w-5 h-5 text-[#3AAFA9] group-hover:scale-110 transition-transform" />
            </button>

            <NavLink
              to="/archive"
              className="scroll-reveal-pop delay-4 flex items-center justify-between p-5 rounded-xl bg-white border border-[#3AAFA9]/20 text-left hover:border-[#3AAFA9] hover:shadow-md transition-all group"
            >
              <div>
                <h4 className="font-bold text-[#1b625f] group-hover:text-[#3AAFA9] text-sm">View Batch Archive</h4>
                <p className="text-xs text-slate-500 mt-1">Browse past batch history data</p>
              </div>
              <ArrowRight className="w-5 h-5 text-[#3AAFA9] group-hover:translate-x-1 transition-transform" />
            </NavLink>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="scroll-reveal-scale delay-1 glass-card p-5 rounded-xl border border-[#3AAFA9]/20 flex flex-col justify-between min-h-[110px]">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-500 uppercase">Total Students</span>
                <Users className="w-5 h-5 text-[#3AAFA9]" />
              </div>
              <h2 className="text-2xl font-black text-[#1b625f] mt-4">{stats.totalStudents}</h2>
            </div>

            <div className="scroll-reveal-scale delay-2 glass-card p-5 rounded-xl border border-[#3AAFA9]/20 flex flex-col justify-between min-h-[110px]">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-500 uppercase">Attendance %</span>
                <CheckSquare className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-[#1b625f] mt-4">{stats.attendancePercentage}%</h2>
            </div>

            <div className="scroll-reveal-scale delay-3 glass-card p-5 rounded-xl border border-[#3AAFA9]/20 flex flex-col justify-between min-h-[110px]">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-500 uppercase">Exams Taken</span>
                <FileQuestion className="w-5 h-5 text-[#3AAFA9]" />
              </div>
              <h2 className="text-2xl font-black text-[#1b625f] mt-4">{stats.assessmentsSubmitted}</h2>
            </div>

            <div className="scroll-reveal-scale delay-4 glass-card p-5 rounded-xl border border-[#3AAFA9]/20 flex flex-col justify-between min-h-[110px]">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-500 uppercase">Advanced Learners</span>
                <Award className="w-5 h-5 text-[#3AAFA9]" />
              </div>
              <h2 className="text-2xl font-black text-[#1b625f] mt-4">{stats.advancedLearners}</h2>
            </div>

            <div className="scroll-reveal-scale delay-5 glass-card p-5 rounded-xl border border-[#3AAFA9]/20 flex flex-col justify-between min-h-[110px]">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-500 uppercase">Slow Learners</span>
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <h2 className="text-2xl font-black text-[#1b625f] mt-4">{stats.slowLearners}</h2>
            </div>
          </div>
        </>
      )}

      {/* Academic Batches Selection & Controls */}
      <div className="scroll-reveal space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-[#1b625f] tracking-wide">Select Academic Batch</h3>
          <span className="text-xs text-slate-500">Click any batch card to switch active invitation and records</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map(b => (
            <div
              key={b._id}
              onClick={() => {
                setActiveBatch(b);
                fetchStats(b._id);
              }}
              className={`p-6 rounded-xl border text-left transition-all glass-card glass-card-hover cursor-pointer relative group ${
                activeBatch && activeBatch._id === b._id 
                  ? 'border-[#3AAFA9] bg-[#f0faf9] ring-2 ring-[#3AAFA9]/30' 
                  : 'border-[#3AAFA9]/20 hover:border-[#3AAFA9]'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-1 rounded bg-[#3AAFA9] text-[10px] text-white font-black uppercase tracking-wider shadow-sm">
                  v{b.deeksharambhVersion}
                </span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#3AAFA9]" />
                  <button
                    type="button"
                    onClick={(e) => handleDeleteBatch(b._id, e)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded cursor-pointer"
                    title="Remove Batch"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h4 className="font-bold text-[#1b625f] text-base mt-4">{b.batchYearRange}</h4>
              <p className="text-xs text-slate-500 mt-1">Academic Year: {b.academicYear}</p>
              <div className="mt-4 flex items-center justify-between border-t border-[#3AAFA9]/20 pt-3 text-xs text-slate-600">
                <span>HoD: {b.deeksharambhVersion === '5.0' || b.batchYearRange?.includes('2024') ? 'Dr. M. Lingaraj' : 'Dr. R. Sasikala'}</span>
                <span className="font-bold text-[#1b625f]">{b.totalStudents} Students</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

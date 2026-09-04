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
      hodName: 'Dr. S. Sundararajan',
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
    <div className="space-y-8">
      {/* Upper banner card - Mild Blue Professional Theme */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-8 border border-blue-400/30 relative overflow-hidden shadow-xl text-white">
        <div className="absolute w-80 h-80 rounded-full bg-white/10 blur-[70px] right-[-10%] top-[-20%]"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white tracking-wide">Deeksharambh Management Portal</h1>
            <p className="text-blue-100 text-sm max-w-xl font-medium">
              Manage student induction schedules, syllabi, class rosters, attendance validation, automated exams, and result analytics reports.
            </p>
          </div>
          {activeBatch && (
            <div className="bg-white/15 backdrop-blur-md px-6 py-4 rounded-xl border border-white/30 text-right min-w-[220px] shadow-sm">
              <span className="text-xs text-blue-200 font-bold uppercase tracking-wider">Active Batch</span>
              <h3 className="text-white font-black text-xl">{activeBatch.batchYearRange}</h3>
              <p className="text-xs text-blue-100 mt-1">AY: {activeBatch.academicYear}</p>
              <p className="text-xs text-blue-100 font-semibold">Deeksharambh v{activeBatch.deeksharambhVersion}</p>
            </div>
          )}
        </div>
      </div>

      {/* Automatic Active Batch Inaugural Invitation Hero Display */}
      {activeBatch && (
        <div className="glass-card p-6 md:p-8 rounded-2xl border-2 border-blue-500/30 bg-gradient-to-b from-blue-50/50 to-white space-y-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-100 pb-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-blue-900 uppercase tracking-wider">
                Active Batch Inaugural Invitation ({activeBatch.batchYearRange})
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportInvitationPdf}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 font-bold text-xs transition-all shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-rose-700" /> PDF Invitation
              </button>
              <button
                onClick={handleExportInvitationDocx}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-900 border border-sky-300 font-bold text-xs transition-all shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-sky-700" /> Word Invitation
              </button>
              <label className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-100 hover:bg-cyan-200 text-cyan-900 border border-cyan-300 font-bold text-xs transition-all cursor-pointer shadow-sm">
                <Upload className="w-3.5 h-3.5 text-cyan-700" />
                <span>Update Invitation</span>
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleUpdateInvitation} className="hidden" />
              </label>
              {activeBatch.invitationFileName && (
                <button
                  onClick={handleRemoveInvitation}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 font-bold text-xs hover:bg-red-100 transition-all cursor-pointer"
                  title="Remove uploaded custom file and reset to default invitation template"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Custom File
                </button>
              )}
            </div>
          </div>

          {/* Interactive Invitation Card Body */}
          <div className="max-w-2xl mx-auto p-6 md:p-8 rounded-xl border-2 border-blue-200 bg-white text-center space-y-5 shadow-md relative">
            <div className="space-y-1">
              <h4 className="font-extrabold text-blue-950 text-base tracking-wide uppercase">Sankara College of Science and Commerce</h4>
              <p className="text-[11px] text-gray-500 font-medium">Affiliated to Bharathiar University | Approved by AICTE | NAAC A+ Grade</p>
              <p className="text-[11px] text-gray-500 font-medium">Saravanampatty, Coimbatore - 641035</p>
              <div className="w-24 h-[2px] bg-blue-500 mx-auto mt-2"></div>
            </div>

            <div>
              <span className="px-4 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold tracking-widest uppercase border border-blue-300">
                CORDIAL INVITATION
              </span>
            </div>

            <p className="text-gray-600 text-xs font-serif italic max-w-md mx-auto leading-relaxed">
              The Management, Principal & Faculty of the Department of Computer Science with Data Analytics cordially invite you to the Inaugural Function of the Student Induction Programme
            </p>

            <div className="space-y-1 bg-blue-50/70 p-3 rounded-lg border border-blue-100">
              <h2 className="text-xl font-black text-blue-700 tracking-wider uppercase font-serif">
                Deeksharambh {activeBatch.deeksharambhVersion}
              </h2>
              <p className="text-xs text-blue-900 font-bold tracking-wide">
                Academic Year {activeBatch.academicYear} ({activeBatch.className})
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-2 text-left max-w-md mx-auto">
              <h5 className="text-[11px] font-bold text-blue-900 uppercase tracking-wider text-center border-b border-gray-200 pb-1">
                Dignitaries of the Function
              </h5>
              <div className="text-xs space-y-1.5">
                <div>
                  <span className="font-bold text-gray-700">Presidential Address: </span>
                  <span className="text-blue-700 font-bold">{activeBatch.managingTrusteeName || "Sri T.P. Ramachandran"}</span>
                  <span className="text-gray-500 text-[10px]"> (Managing Trustee)</span>
                </div>
                <div>
                  <span className="font-bold text-gray-700">Felicitation Address: </span>
                  <span className="text-blue-700 font-bold">{activeBatch.principalName}</span>
                  <span className="text-gray-500 text-[10px]"> (Principal)</span>
                </div>
                <div>
                  <span className="font-bold text-gray-700">Welcome Address: </span>
                  <span className="text-blue-700 font-bold">{activeBatch.hodName}</span>
                  <span className="text-gray-500 text-[10px]"> (HOD, CSDA)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-b border-gray-200 py-2.5 text-xs max-w-md mx-auto font-medium text-gray-700">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Start Date</p>
                <p className="mt-0.5 font-bold text-blue-900">{activeBatch.startDate}</p>
              </div>
              <div className="border-l border-r border-gray-200">
                <p className="text-[10px] text-gray-500 uppercase font-bold">Time</p>
                <p className="mt-0.5 font-bold text-blue-900">10:00 AM</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Venue</p>
                <p className="mt-0.5 font-bold text-blue-900">Auditorium</p>
              </div>
            </div>

            {activeBatch.invitationFileName && (
              <p className="text-xs text-green-600 font-semibold flex items-center justify-center gap-1">
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
              className="flex items-center justify-between p-5 rounded-xl bg-white border border-blue-100 text-left hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer"
            >
              <div>
                <h4 className="font-bold text-blue-950 group-hover:text-blue-600 text-sm">Download Circular</h4>
                <p className="text-xs text-gray-500 mt-1">
                  {activeBatch.circularFileName ? `Uploaded: ${activeBatch.circularFileName}` : 'Export official circular Word file'}
                </p>
              </div>
              <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
            </button>

            <button
              onClick={handleExportCover}
              className="flex items-center justify-between p-5 rounded-xl bg-white border border-blue-100 text-left hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer"
            >
              <div>
                <h4 className="font-bold text-blue-950 group-hover:text-blue-600 text-sm">Download Cover Brochure</h4>
                <p className="text-xs text-gray-500 mt-1">
                  {activeBatch.brochureFileName ? `Uploaded: ${activeBatch.brochureFileName}` : 'Export brochure cover Word file'}
                </p>
              </div>
              <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
            </button>

            <button
              onClick={handleExportInvitationPdf}
              className="flex items-center justify-between p-5 rounded-xl bg-white border border-blue-100 text-left hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer"
            >
              <div>
                <h4 className="font-bold text-blue-950 group-hover:text-blue-600 text-sm">Download Invitation (PDF)</h4>
                <p className="text-xs text-gray-500 mt-1">
                  {activeBatch.invitationFileName ? `Uploaded: ${activeBatch.invitationFileName}` : 'Export invitation card PDF file'}
                </p>
              </div>
              <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
            </button>

            <NavLink
              to="/archive"
              className="flex items-center justify-between p-5 rounded-xl bg-white border border-blue-100 text-left hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div>
                <h4 className="font-bold text-blue-950 group-hover:text-blue-600 text-sm">View Batch Archive</h4>
                <p className="text-xs text-gray-500 mt-1">Browse past batch history data</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
            </NavLink>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="glass-card p-5 rounded-xl border border-blue-100 flex flex-col justify-between min-h-[110px]">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-gray-500 uppercase">Total Students</span>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-black text-blue-950 mt-4">{stats.totalStudents}</h2>
            </div>

            <div className="glass-card p-5 rounded-xl border border-blue-100 flex flex-col justify-between min-h-[110px]">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-gray-500 uppercase">Attendance %</span>
                <CheckSquare className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-blue-950 mt-4">{stats.attendancePercentage}%</h2>
            </div>

            <div className="glass-card p-5 rounded-xl border border-blue-100 flex flex-col justify-between min-h-[110px]">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-gray-500 uppercase">Exams Taken</span>
                <FileQuestion className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-black text-blue-950 mt-4">{stats.assessmentsSubmitted}</h2>
            </div>

            <div className="glass-card p-5 rounded-xl border border-blue-100 flex flex-col justify-between min-h-[110px]">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-gray-500 uppercase">Advanced Learners</span>
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-black text-blue-950 mt-4">{stats.advancedLearners}</h2>
            </div>

            <div className="glass-card p-5 rounded-xl border border-blue-100 flex flex-col justify-between min-h-[110px]">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-gray-500 uppercase">Slow Learners</span>
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <h2 className="text-2xl font-black text-blue-950 mt-4">{stats.slowLearners}</h2>
            </div>
          </div>
        </>
      )}

      {/* Academic Batches Selection & Controls */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-blue-950 tracking-wide">Select Academic Batch</h3>
          <span className="text-xs text-gray-500">Click any batch card to switch active invitation and records</span>
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
                  ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20' 
                  : 'border-blue-100 hover:border-blue-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-1 rounded bg-blue-600 text-[10px] text-white font-bold uppercase tracking-wider shadow-sm">
                  v{b.deeksharambhVersion}
                </span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <button
                    type="button"
                    onClick={(e) => handleDeleteBatch(b._id, e)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors rounded"
                    title="Remove Batch"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h4 className="font-bold text-blue-950 text-base mt-4">{b.batchYearRange}</h4>
              <p className="text-xs text-gray-500 mt-1">Academic Year: {b.academicYear}</p>
              <div className="mt-4 flex items-center justify-between border-t border-blue-100 pt-3 text-xs text-gray-600">
                <span>HoD: {b.hodName}</span>
                <span className="font-semibold text-blue-700">{b.totalStudents} Students</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import { 
  Users, CheckSquare, FileText, Award, AlertTriangle, 
  Calendar, FileQuestion, ArrowRight, HelpCircle, Download 
} from 'lucide-react';

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

  const fetchBatches = async () => {
    try {
      const res = await axios.get('/api/batches');
      setBatches(res.data);
      if (res.data.length > 0 && !activeBatch) {
        setActiveBatch(res.data[0]); // default to latest
      }
    } catch (err) {
      console.error("Error fetching batches:", err);
    }
  };

  const fetchStats = async (batchId) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/batches/${batchId}/stats`);
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCircular = () => {
    if (!activeBatch) return;
    window.open(`/api/batches/${activeBatch._id}/export/circular`, '_blank');
  };

  const handleExportCover = () => {
    if (!activeBatch) return;
    window.open(`/api/batches/${activeBatch._id}/export/cover`, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Upper banner card */}
      <div className="rounded-2xl bg-gradient-to-r from-navy to-navy-dark p-8 border border-white/10 relative overflow-hidden shadow-xl">
        <div className="absolute w-80 h-80 rounded-full bg-gold/5 blur-[80px] right-[-10%] top-[-20%]"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-wide">Deeksharambh Management Portal</h1>
            <p className="text-gray-300 text-sm max-w-xl">
              Manage student induction schedules, syllabi, class rosters, attendance validation, automated exams, and result analytics reports.
            </p>
          </div>
          {activeBatch && (
            <div className="glass-card px-6 py-4 rounded-xl border border-white/10 text-right min-w-[200px]">
              <h3 className="text-gold font-bold text-lg">{activeBatch.batchYearRange}</h3>
              <p className="text-xs text-gray-400 mt-1">AY: {activeBatch.academicYear}</p>
              <p className="text-xs text-gray-400">Version: Deeksharambh {activeBatch.deeksharambhVersion}</p>
            </div>
          )}
        </div>
      </div>

      {activeBatch && (
        <>
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleExportCircular}
              className="flex items-center justify-between p-5 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-gold/10 hover:border-gold/30 transition-all group cursor-pointer"
            >
              <div>
                <h4 className="font-bold text-white group-hover:text-gold text-sm">Download Circular</h4>
                <p className="text-xs text-gray-400 mt-1">
                  {activeBatch.circularFileName ? `Uploaded: ${activeBatch.circularFileName}` : 'Export official circular Word file'}
                </p>
              </div>
              <Download className="w-5 h-5 text-gray-400 group-hover:text-gold" />
            </button>

            <button
              onClick={handleExportCover}
              className="flex items-center justify-between p-5 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-gold/10 hover:border-gold/30 transition-all group cursor-pointer"
            >
              <div>
                <h4 className="font-bold text-white group-hover:text-gold text-sm">Download Cover Brochure</h4>
                <p className="text-xs text-gray-400 mt-1">
                  {activeBatch.brochureFileName ? `Uploaded: ${activeBatch.brochureFileName}` : 'Export brochure cover Word file'}
                </p>
              </div>
              <Download className="w-5 h-5 text-gray-400 group-hover:text-gold" />
            </button>

            <NavLink
              to="/archive"
              className="flex items-center justify-between p-5 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-gold/10 hover:border-gold/30 transition-all group"
            >
              <div>
                <h4 className="font-bold text-white group-hover:text-gold text-sm">View Batch Archive</h4>
                <p className="text-xs text-gray-400 mt-1">Browse past batch history data</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gold" />
            </NavLink>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="glass-card p-5 rounded-xl border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[110px]">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-gray-400 uppercase">Total Students</span>
                <Users className="w-5 h-5 text-gold" />
              </div>
              <h2 className="text-2xl font-bold text-white mt-4">{stats.totalStudents}</h2>
            </div>

            <div className="glass-card p-5 rounded-xl border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[110px]">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-gray-400 uppercase">Attendance %</span>
                <CheckSquare className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mt-4">{stats.attendancePercentage}%</h2>
            </div>

            <div className="glass-card p-5 rounded-xl border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[110px]">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-gray-400 uppercase">Exams Taken</span>
                <FileQuestion className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mt-4">{stats.assessmentsSubmitted}</h2>
            </div>

            <div className="glass-card p-5 rounded-xl border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[110px]">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-gray-400 uppercase">Advanced Learners</span>
                <Award className="w-5 h-5 text-gold" />
              </div>
              <h2 className="text-2xl font-bold text-white mt-4">{stats.advancedLearners}</h2>
            </div>

            <div className="glass-card p-5 rounded-xl border border-white/5 relative overflow-hidden flex flex-col justify-between min-h-[110px]">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-gray-400 uppercase">Slow Learners</span>
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mt-4">{stats.slowLearners}</h2>
            </div>
          </div>
        </>
      )}

      {/* Past Batches List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white tracking-wide">Select Academic Batch</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map(b => (
            <button
              key={b._id}
              onClick={() => {
                setActiveBatch(b);
                fetchStats(b._id);
              }}
              className={`p-6 rounded-xl border text-left transition-all glass-card glass-card-hover ${
                activeBatch && activeBatch._id === b._id 
                  ? 'border-gold/60 bg-gold/5 ring-1 ring-gold/20' 
                  : 'border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-1 rounded bg-navy-dark text-[10px] text-gold font-bold uppercase tracking-wider">
                  v{b.deeksharambhVersion}
                </span>
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <h4 className="font-bold text-white text-base mt-4">{b.batchYearRange}</h4>
              <p className="text-xs text-gray-400 mt-1">AY: {b.academicYear}</p>
              <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-gray-400">
                <span>HoD: {b.hodName}</span>
                <span>{b.totalStudents} Students</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

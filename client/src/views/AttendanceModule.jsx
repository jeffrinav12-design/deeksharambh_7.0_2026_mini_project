import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Download, Calendar, Save, CheckCircle, AlertCircle, Grid } from 'lucide-react';
import { downloadFile } from '../utils/downloadHelper';

export default function AttendanceModule({ activeBatch, role }) {
  const [students, setStudents] = useState([]);
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  
  // Attendance records in database: [{ studentId, date, status }]
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  
  // Local modifications before saving: { [studentId]: 'P' | 'A' }
  const [localAttendance, setLocalAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [activeTab, setActiveTab] = useState('Mark'); // Mark, GridView

  const getBatchSampleStudents = (batch) => {
    const ver = (batch?.deeksharambhVersion || batch?.batchYearRange || '').toString();
    if (ver.includes('5.0') || ver.includes('2024')) {
      return [
        { _id: 'std_5_1', sNo: 1, rollNo: '24CS01', registerNo: '24101', name: 'ABINESH.M', mathsStream: 'NON_HSC' },
        { _id: 'std_5_2', sNo: 2, rollNo: '24CS02', registerNo: '24102', name: 'ABISHEK.S', mathsStream: 'NON_HSC' },
        { _id: 'std_5_3', sNo: 3, rollNo: '24CS03', registerNo: '24103', name: 'ANGELIN GIFTY.I', mathsStream: 'HSC' },
        { _id: 'std_5_4', sNo: 4, rollNo: '24CS04', registerNo: '24104', name: 'ARTHI.M', mathsStream: 'HSC' },
        { _id: 'std_5_5', sNo: 5, rollNo: '24CS05', registerNo: '24105', name: 'ASWINI.S', mathsStream: 'NON_HSC' },
        { _id: 'std_5_6', sNo: 6, rollNo: '24CS06', registerNo: '24106', name: 'DEVI PRIYA.M', mathsStream: 'HSC' },
        { _id: 'std_5_7', sNo: 7, rollNo: '24CS07', registerNo: '24107', name: 'DHANABAL.L', mathsStream: 'NON_HSC' },
        { _id: 'std_5_8', sNo: 8, rollNo: '24CS08', registerNo: '24108', name: 'DHANUSH.S', mathsStream: 'HSC' },
        { _id: 'std_5_9', sNo: 9, rollNo: '24CS09', registerNo: '24109', name: 'DHANYA.D', mathsStream: 'NON_HSC' },
        { _id: 'std_5_10', sNo: 10, rollNo: '24CS10', registerNo: '24110', name: 'JEFFRINA.V', mathsStream: 'HSC' }
      ];
    }
    if (ver.includes('6.0') || ver.includes('2025')) {
      return [
        { _id: 'std_6_1', sNo: 1, rollNo: '25CS01', registerNo: '25101', name: 'Saarah Azizah K.M', mathsStream: 'HSC' },
        { _id: 'std_6_2', sNo: 2, rollNo: '25CS02', registerNo: '25102', name: 'Mahadharshini V', mathsStream: 'NON_HSC' },
        { _id: 'std_6_3', sNo: 3, rollNo: '25CS03', registerNo: '25103', name: 'Kaavya P', mathsStream: 'HSC' },
        { _id: 'std_6_4', sNo: 4, rollNo: '25CS04', registerNo: '25104', name: 'Karthikaa P', mathsStream: 'HSC' },
        { _id: 'std_6_5', sNo: 5, rollNo: '25CS05', registerNo: '25105', name: 'Abarna C', mathsStream: 'NON_HSC' },
        { _id: 'std_6_6', sNo: 6, rollNo: '25CS06', registerNo: '25106', name: 'Subiskha . P', mathsStream: 'HSC' },
        { _id: 'std_6_7', sNo: 7, rollNo: '25CS07', registerNo: '25107', name: 'Neha Sai .S', mathsStream: 'HSC' },
        { _id: 'std_6_8', sNo: 8, rollNo: '25CS08', registerNo: '25108', name: 'Varshini M', mathsStream: 'NON_HSC' },
        { _id: 'std_6_9', sNo: 9, rollNo: '25CS09', registerNo: '25109', name: 'Abhinaya M', mathsStream: 'HSC' },
        { _id: 'std_6_10', sNo: 10, rollNo: '25CS10', registerNo: '25110', name: 'Gowri P', mathsStream: 'HSC' }
      ];
    }
    return [
      { _id: 'std_7_1', sNo: 1, rollNo: '26CS01', registerNo: '26101', name: 'AAYISHA SIDHIKA D', mathsStream: 'HSC' },
      { _id: 'std_7_2', sNo: 2, rollNo: '26CS02', registerNo: '26102', name: 'AGASTIAN G E', mathsStream: 'HSC' },
      { _id: 'std_7_3', sNo: 3, rollNo: '26CS03', registerNo: '26103', name: 'BALAJI I', mathsStream: 'NON_HSC' },
      { _id: 'std_7_4', sNo: 4, rollNo: '26CS04', registerNo: '26104', name: 'DHANASRI A', mathsStream: 'HSC' },
      { _id: 'std_7_5', sNo: 5, rollNo: '26CS05', registerNo: '26105', name: 'DHARUNKUMAR V', mathsStream: 'NON_HSC' },
      { _id: 'std_7_6', sNo: 6, rollNo: '26CS06', registerNo: '26106', name: 'DINEESH KUMAR J', mathsStream: 'HSC' },
      { _id: 'std_7_7', sNo: 7, rollNo: '26CS07', registerNo: '26107', name: 'DIVYADHARSHINI A', mathsStream: 'HSC' },
      { _id: 'std_7_8', sNo: 8, rollNo: '26CS08', registerNo: '26108', name: 'DURGA SRI S', mathsStream: 'NON_HSC' },
      { _id: 'std_7_9', sNo: 9, rollNo: '26CS09', registerNo: '26109', name: 'GOBIKA C R', mathsStream: 'NON_HSC' },
      { _id: 'std_7_10', sNo: 10, rollNo: '26CS10', registerNo: '26110', name: 'GOKULAKRISHNAN M', mathsStream: 'HSC' }
    ];
  };

  useEffect(() => {
    initAttendanceData();
  }, [activeBatch]);

  const initAttendanceData = async () => {
    const sampleList = getBatchSampleStudents(activeBatch);
    try {
      if (!activeBatch?._id) {
        setStudents(sampleList);
        const fallbackDates = generateFallbackDates('2026-08-01', '2026-08-07');
        setDates(fallbackDates);
        setSelectedDate(fallbackDates[0]);
        return;
      }
      // 1. Fetch Students
      const studentRes = await axios.get(`/api/batches/${activeBatch._id}/students`);
      setStudents(studentRes.data && studentRes.data.length > 0 ? studentRes.data : sampleList);

      // 2. Fetch Dates from Schedule slots
      const scheduleRes = await axios.get(`/api/batches/${activeBatch._id}/schedule`);
      const scheduleDates = (scheduleRes.data?.slots || []).map(s => s.date).filter(Boolean);
      
      const finalDates = scheduleDates.length > 0 ? scheduleDates : generateFallbackDates(activeBatch.startDate || '2026-08-01', activeBatch.endDate || '2026-08-07');
      setDates(finalDates);
      if (finalDates.length > 0) {
        setSelectedDate(finalDates[0]);
      }

      // 3. Fetch Attendance
      const attendanceRes = await axios.get(`/api/batches/${activeBatch._id}/attendance`);
      setAttendanceRecords(attendanceRes.data || []);
    } catch (err) {
      console.warn('Error initializing attendance details, using fallbacks:', err.message);
      setStudents(defaultSampleStudents);
      const fallbackDates = generateFallbackDates('2026-08-01', '2026-08-07');
      setDates(fallbackDates);
      setSelectedDate(fallbackDates[0]);
    }
  };

  const generateFallbackDates = (startStr, endStr) => {
    // Generate dates between start and end
    const list = [];
    let curr = new Date(startStr);
    const end = new Date(endStr);
    while (curr <= end && list.length < 6) {
      list.push(curr.toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
    }
    return list;
  };

  useEffect(() => {
    if (selectedDate && students.length > 0) {
      // Populate local state with DB state, fallback to 'P'
      const mapping = {};
      students.forEach(st => {
        const record = attendanceRecords.find(r => r.studentId === st._id && r.date === selectedDate);
        mapping[st._id] = record ? record.status : 'P';
      });
      setLocalAttendance(mapping);
    }
  }, [selectedDate, attendanceRecords, students]);

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleStatusChange = (studentId, status) => {
    if (role === 'viewer') return;
    setLocalAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const markAllAs = (status) => {
    if (role === 'viewer') return;
    const mapping = {};
    students.forEach(st => {
      mapping[st._id] = status;
    });
    setLocalAttendance(mapping);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (role === 'viewer') {
      showToast('Viewers cannot mark attendance.', 'error');
      return;
    }
    setLoading(true);
    try {
      // Save each student attendance record
      for (const stId of Object.keys(localAttendance)) {
        await axios.post('/api/attendance', {
          batchId: activeBatch._id,
          studentId: stId,
          date: selectedDate,
          status: localAttendance[stId]
        });
      }
      showToast(`Attendance saved successfully for ${selectedDate}!`);
      
      // Refresh DB state
      const attendanceRes = await axios.get(`/api/batches/${activeBatch._id}/attendance`);
      setAttendanceRecords(attendanceRes.data);
    } catch (err) {
      showToast('Failed to save attendance records', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!activeBatch) {
    return <div className="text-gray-400 text-sm">Please select a batch from the Dashboard first.</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide uppercase">Attendance Module</h2>
          <p className="text-xs text-gray-400 mt-1">Mark and edit daily student attendance, monitor class participation stats, and export attendance sheets.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/attendance`, `AttendanceSheet_${activeBatch.batchYearRange}.docx`, students)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export DOCX
          </button>
          <button
            onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/attendance/csv`, `AttendanceSheet_${activeBatch.batchYearRange}.csv`, students)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${
          message.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'
        }`}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-between items-center bg-navy-dark/40 border border-white/5 p-4 rounded-xl">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('Mark')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'Mark' ? 'bg-gold text-navy-dark shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 inline mr-1" /> Mark Attendance
          </button>
          <button
            onClick={() => setActiveTab('GridView')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'GridView' ? 'bg-gold text-navy-dark shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5 inline mr-1" /> Grid Summary Sheet
          </button>
        </div>

        {activeTab === 'Mark' && dates.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">Select Date:</span>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg glass-input text-xs font-semibold"
            >
              {dates.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {activeTab === 'Mark' ? (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
            {role !== 'viewer' && (
              <div className="px-6 py-4 bg-navy-dark/30 border-b border-white/5 flex gap-3 text-xs justify-end">
                <button
                  type="button"
                  onClick={() => markAllAs('P')}
                  className="px-3 py-1 rounded bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 font-bold"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => markAllAs('A')}
                  className="px-3 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 font-bold"
                >
                  Mark All Absent
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full styled-table text-xs text-left">
                <thead>
                  <tr>
                    <th className="p-3 w-20 text-center">S.No</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3 w-32">Maths Stream</th>
                    <th className="p-3 w-56 text-center">Attendance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((st, idx) => {
                    const status = localAttendance[st._id] || 'P';
                    return (
                      <tr key={st._id} className="hover:bg-white/5 border-b border-white/5">
                        <td className="p-3 text-center text-gray-400">{st.sNo || idx+1}</td>
                        <td className="p-3 text-white font-medium">{st.name}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            st.mathsStream === 'M' ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-yellow-500/10 text-yellow-400'
                          }`}>
                            {st.mathsStream}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center gap-4">
                            <button
                              type="button"
                              disabled={role === 'viewer'}
                              onClick={() => handleStatusChange(st._id, 'P')}
                              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                status === 'P'
                                  ? 'bg-green-500/10 border-green-500/40 text-green-400 shadow-sm'
                                  : 'bg-transparent border-transparent text-gray-500 hover:text-gray-400'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" /> Present (P)
                            </button>
                            <button
                              type="button"
                              disabled={role === 'viewer'}
                              onClick={() => handleStatusChange(st._id, 'A')}
                              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                status === 'A'
                                  ? 'bg-red-500/10 border-red-500/40 text-red-400 shadow-sm'
                                  : 'bg-transparent border-transparent text-gray-500 hover:text-gray-400'
                              }`}
                            >
                              <X className="w-3.5 h-3.5" /> Absent (A)
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-500">
                        No students enrolled in this batch yet. Run Student Master first.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {role !== 'viewer' && students.length > 0 && (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-gold to-yellow-400 text-navy-dark font-bold text-sm hover:from-yellow-400 hover:to-gold transition-all duration-200 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Attendance Records</span>
                </>
              )}
            </button>
          )}
        </form>
      ) : (
        /* Grid Sheet View */
        <div className="glass-card rounded-xl border border-white/5 overflow-hidden p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Date-wise Attendance Grid</h3>
          <div className="overflow-x-auto">
            <table className="w-full styled-table text-xs text-left">
              <thead>
                <tr>
                  <th className="p-3 text-center w-16">S.No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3 w-20 text-center">Stream</th>
                  {dates.map(date => (
                    <th key={date} className="p-3 text-center">{date}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((st, idx) => (
                  <tr key={st._id} className="hover:bg-white/5 border-b border-white/5">
                    <td className="p-3 text-center text-gray-400">{st.sNo || idx+1}</td>
                    <td className="p-3 text-white font-medium">{st.name}</td>
                    <td className="p-3 text-center text-gray-400">{st.mathsStream}</td>
                    {dates.map(date => {
                      const rec = attendanceRecords.find(r => r.studentId === st._id && r.date === date);
                      const status = rec ? rec.status : 'P';
                      return (
                        <td key={date} className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            status === 'P' 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {status}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={3 + dates.length} className="p-8 text-center text-gray-500">
                      No student enrollment records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

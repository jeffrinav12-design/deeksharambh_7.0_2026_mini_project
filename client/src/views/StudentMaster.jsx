import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, Check, X, Users, Download, Upload, Search, AlertCircle } from 'lucide-react';
import { downloadFile } from '../utils/downloadHelper';
import { getFullBatchStudents } from '../utils/studentData';

export default function StudentMaster({ activeBatch, role }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Add Form State
  const [newName, setNewName] = useState('');
  const [newRollNo, setNewRollNo] = useState('');
  const [newRegisterNo, setNewRegisterNo] = useState('');
  const [newMathsStream, setNewMathsStream] = useState('M');

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editRollNo, setEditRollNo] = useState('');
  const [editRegisterNo, setEditRegisterNo] = useState('');
  const [editMathsStream, setEditMathsStream] = useState('M');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Full'); // Full, Maths, NonMaths

  useEffect(() => {
    fetchStudents();
  }, [activeBatch]);

  const fetchStudents = async () => {
    const fallback = getFullBatchStudents(activeBatch);
    try {
      if (!activeBatch?._id) {
        setStudents(fallback);
        return;
      }
      const res = await axios.get(`/api/batches/${activeBatch._id}/students`);
      if (res.data && res.data.length > 0) {
        setStudents(res.data);
      } else {
        setStudents(fallback);
      }
    } catch (err) {
      console.warn('Using default student list fallback:', err.message);
      setStudents(fallback);
    }
  };

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleCsvImport = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeBatch) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = reader.result;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length <= 1) return showToast('CSV file is empty', 'error');
        const studentsList = [];
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',').map(p => p.replace(/^"|"$/g, '').trim());
          if (parts.length >= 2) {
            studentsList.push({
              name: parts[1] || parts[0],
              mathsStream: (parts[2] && parts[2].toUpperCase() === 'NM') ? 'NM' : 'M',
              rollNo: parts[3] || '',
              registerNo: parts[4] || ''
            });
          }
        }
        const res = await axios.post(`/api/batches/${activeBatch._id}/import/students/csv`, { studentsList });
        showToast(res.data.message || 'Imported students successfully!');
        fetchStudents();
      } catch (err) {
        showToast('Failed to import CSV file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (role === 'viewer') {
      showToast('Viewers cannot manage student records.', 'error');
      return;
    }
    if (!newName.trim()) {
      showToast('Please enter a student name.', 'error');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/students', {
        batchId: activeBatch._id,
        name: newName.trim().toUpperCase(),
        rollNo: newRollNo.trim().toUpperCase(),
        registerNo: newRegisterNo.trim().toUpperCase(),
        mathsStream: newMathsStream
      });
      setNewName('');
      setNewRollNo('');
      setNewRegisterNo('');
      showToast('Student added successfully!');
      fetchStudents();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add student', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (role === 'viewer') {
      showToast('Viewers cannot delete student records.', 'error');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this student? All their results and attendance will be removed.')) {
      return;
    }

    try {
      await axios.delete(`/api/students/${studentId}`);
      showToast('Student deleted successfully!');
      fetchStudents();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete student', 'error');
    }
  };

  const startEdit = (student) => {
    setEditingId(student._id);
    setEditName(student.name);
    setEditRollNo(student.rollNo || '');
    setEditRegisterNo(student.registerNo || '');
    setEditMathsStream(student.mathsStream);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditRollNo('');
    setEditRegisterNo('');
  };

  const saveEdit = async (studentId) => {
    if (role === 'viewer') return;
    try {
      await axios.put(`/api/students/${studentId}`, {
        name: editName.trim().toUpperCase(),
        rollNo: editRollNo.trim().toUpperCase(),
        registerNo: editRegisterNo.trim().toUpperCase(),
        mathsStream: editMathsStream
      });
      showToast('Student updated successfully!');
      cancelEdit();
      fetchStudents();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update student', 'error');
    }
  };

  if (!activeBatch) {
    return <div className="text-gray-400 text-sm">Please select a batch from the Dashboard first.</div>;
  }

  // Filter students based on search query and tab selection
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || String(s.sNo).includes(searchQuery);
    if (!matchesSearch) return false;
    
    if (activeTab === 'Maths') return s.mathsStream === 'M';
    if (activeTab === 'NonMaths') return s.mathsStream === 'NM';
    return true;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide uppercase">Student Master</h2>
          <p className="text-xs text-gray-400 mt-1">Manage the student roster, assign them to Mathematics or Non-Mathematics groups, and export student lists.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/students?type=${activeTab}`, `StudentList_${activeTab}_${activeBatch.batchYearRange}.docx`, filteredStudents)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export DOCX
          </button>
          <button
            onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/students/csv`, `StudentRoster_${activeBatch.batchYearRange}.csv`, filteredStudents)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          {role !== 'viewer' && (
            <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Import CSV</span>
              <input type="file" accept=".csv" onChange={handleCsvImport} className="hidden" />
            </label>
          )}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: Add Student */}
        {role !== 'viewer' && (
          <div className="lg:col-span-1">
            <div className="glass-card p-6 rounded-xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-sky-700 uppercase tracking-wider border-b border-sky-100 pb-2">Add Student</h3>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg glass-input text-sm uppercase"
                    placeholder="e.g. ANGELIN GIFTY.I"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Roll Number (Optional)</label>
                  <input
                    type="text"
                    value={newRollNo}
                    onChange={(e) => setNewRollNo(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg glass-input text-sm uppercase"
                    placeholder="e.g. 241CS001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Register Number (Optional)</label>
                  <input
                    type="text"
                    value={newRegisterNo}
                    onChange={(e) => setNewRegisterNo(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg glass-input text-sm uppercase"
                    placeholder="e.g. 241CS001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mathematics Background Stream</label>
                  <select
                    value={newMathsStream}
                    onChange={(e) => setNewMathsStream(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
                  >
                    <option value="M">Maths Students (M)</option>
                    <option value="NM">Non-Maths Students (NM)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Student
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Right Table List */}
        <div className={role !== 'viewer' ? 'lg:col-span-2 space-y-4' : 'lg:col-span-3 space-y-4'}>
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white border border-sky-100 p-4 rounded-xl shadow-sm">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name, S.No, or Roll No..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg glass-input text-xs"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 p-1 rounded-lg bg-sky-50 border border-sky-200 w-full sm:w-auto">
              {['Full', 'Maths', 'NonMaths'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-semibold rounded capitalize transition-all duration-150 ${
                    activeTab === tab
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-sky-800'
                  }`}
                >
                  {tab === 'Full' ? 'All' : tab === 'Maths' ? 'Maths (M)' : 'Non-Maths (NM)'}
                </button>
              ))}
            </div>
          </div>

          {/* Roster Table */}
          <div className="bg-white rounded-xl border border-sky-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full styled-table text-xs text-left">
                <thead>
                  <tr className="bg-sky-50 text-slate-700">
                    <th className="p-3 w-12 text-center">S.No</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Roll / Reg. No</th>
                    <th className="p-3 w-28">Maths Stream</th>
                    {role !== 'viewer' && <th className="p-3 w-24 text-center">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((st) => {
                    const isEditing = editingId === st._id;
                    return (
                      <tr key={st._id} className="hover:bg-sky-50/50 border-b border-sky-100">
                        <td className="p-3 text-center text-slate-500 font-mono">{st.sNo}</td>
                        <td className="p-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="px-2 py-1 rounded glass-input text-xs w-full uppercase"
                            />
                          ) : (
                            <span className="text-slate-900 font-semibold">{st.name}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={editRollNo}
                                onChange={(e) => setEditRollNo(e.target.value)}
                                placeholder="Roll No"
                                className="px-2 py-0.5 rounded glass-input text-[11px] w-full uppercase"
                              />
                              <input
                                type="text"
                                value={editRegisterNo}
                                onChange={(e) => setEditRegisterNo(e.target.value)}
                                placeholder="Reg No"
                                className="px-2 py-0.5 rounded glass-input text-[11px] w-full uppercase"
                              />
                            </div>
                          ) : (
                            <span className="text-slate-600 font-mono text-[11px]">
                              {st.rollNo || st.registerNo || '-'}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <select
                              value={editMathsStream}
                              onChange={(e) => setEditMathsStream(e.target.value)}
                              className="px-2 py-1 rounded glass-input text-xs w-full"
                            >
                              <option value="M">M (Maths)</option>
                              <option value="NM">NM (Non-Maths)</option>
                            </select>
                          ) : (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              st.mathsStream === 'M' 
                                ? 'bg-sky-100 text-sky-800 border border-sky-300' 
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {st.mathsStream === 'M' ? 'M (Maths)' : 'NM (Non-Maths)'}
                            </span>
                          )}
                        </td>
                        {role !== 'viewer' && (
                          <td className="p-3 text-center">
                            {isEditing ? (
                              <div className="flex justify-center gap-1.5">
                                <button
                                  onClick={() => saveEdit(st._id)}
                                  className="p-1 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="p-1 rounded bg-rose-100 text-rose-700 hover:bg-rose-200 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-center gap-1.5">
                                <button
                                  onClick={() => startEdit(st)}
                                  className="p-1 rounded bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(st._id)}
                                  className="p-1 rounded bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={role !== 'viewer' ? 5 : 4} className="p-8 text-center text-slate-500 text-xs">
                        No students found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

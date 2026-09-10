import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit2, Save, FileText, CheckCircle2, Calendar, RotateCcw, Shield } from 'lucide-react';
import { downloadFile } from '../utils/downloadHelper';

export default function BatchSetup({ activeBatch, setActiveBatch }) {
  const [batches, setBatches] = useState([]);
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [formData, setFormData] = useState({
    batchYearRange: '2026-2029',
    academicYear: '2026-2027',
    deeksharambhVersion: '',
    startDate: '',
    endDate: '',
    hodName: '',
    principalName: '',
    className: 'I B.Sc. CSDA',
    managingTrusteeName: 'Dr. Sandhya Ramachandran',
    marksTamil: 15,
    marksEnglish: 15,
    marksMaths: 15,
    marksCore: 55,
    resultRanges: ['60 & Above', '70-79', '60-69', '50-59', 'Below 50'],
    circularFile: '',
    circularFileName: '',
    brochureFile: '',
    brochureFileName: '',
    invitationFile: '',
    invitationFileName: ''
  });

  const [activeBatchUpload, setActiveBatchUpload] = useState({
    circularFile: '',
    circularFileName: '',
    brochureFile: '',
    brochureFileName: '',
    invitationFile: '',
    invitationFileName: ''
  });
  const [uploadingActive, setUploadingActive] = useState(false);

  const [insights, setInsights] = useState([
    'Motivational Talks',
    'Gender Sensitivity Programmes',
    'Placement & Life Skill Orientation',
    'Clubs & Committees Orientation',
    'Physical Education',
    'Fun Events',
    'SWAYAM-NPTEL-MOOCS Orientation',
    'Annual Plan',
    'Short & Long-Term Goal Setting',
    'Dissemination of POs & COs'
  ]);
  
  const [newInsight, setNewInsight] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const defaultFallbackBatches = [
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
    }
  ];

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await axios.get('/api/batches');
      const data = (res.data && res.data.length > 0) ? res.data : defaultFallbackBatches;
      setBatches(data);
      if (data.length > 0 && !editingBatchId) {
        const versions = data.map(b => parseFloat(b.deeksharambhVersion)).filter(v => !isNaN(v));
        const maxVersion = versions.length > 0 ? Math.max(...versions) : 6.0;
        setFormData(prev => ({
          ...prev,
          deeksharambhVersion: (maxVersion + 1.0).toFixed(1)
        }));
      }
    } catch (err) {
      console.warn('Error fetching batches, using fallback:', err.message);
      setBatches(defaultFallbackBatches);
    }
  };

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const startEditBatch = (batch) => {
    setEditingBatchId(batch._id);
    setFormData({
      batchYearRange: batch.batchYearRange || '',
      academicYear: batch.academicYear || '',
      deeksharambhVersion: batch.deeksharambhVersion || '',
      startDate: batch.startDate || '',
      endDate: batch.endDate || '',
      hodName: batch.hodName || '',
      principalName: batch.principalName || '',
      className: batch.className || 'I B.Sc. CSDA',
      managingTrusteeName: batch.managingTrusteeName || 'Dr. Sandhya Ramachandran',
      marksTamil: batch.marksConfig?.tamil || 15,
      marksEnglish: batch.marksConfig?.english || 15,
      marksMaths: batch.marksConfig?.maths || 15,
      marksCore: batch.marksConfig?.core || 55,
      resultRanges: batch.resultRanges && batch.resultRanges.length > 0 ? batch.resultRanges : ['60 & Above', '70-79', '60-69', '50-59', 'Below 50'],
      circularFile: batch.circularFile || '',
      circularFileName: batch.circularFileName || '',
      brochureFile: batch.brochureFile || '',
      brochureFileName: batch.brochureFileName || '',
      invitationFile: batch.invitationFile || '',
      invitationFileName: batch.invitationFileName || ''
    });
    if (batch.programmeInsights && batch.programmeInsights.length > 0) {
      setInsights(batch.programmeInsights);
    }
    showToast(`Loaded ${batch.batchYearRange} details for editing!`);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const cancelEditBatch = () => {
    setEditingBatchId(null);
    fetchBatches();
    showToast('Switched to New Batch creation mode.');
  };

  const handleDeleteBatch = async (batchId, batchRange) => {
    if (!window.confirm(`Are you sure you want to permanently delete Batch (${batchRange}) and ALL its associated students, syllabus, schedule, attendance, and exam results from MongoDB?`)) {
      return;
    }
    setLoading(true);
    try {
      await axios.delete(`/api/batches/${batchId}`);
      if (activeBatch && activeBatch._id === batchId) {
        setActiveBatch(null);
      }
      showToast(`Batch ${batchRange} and all related records deleted from MongoDB!`);
      if (editingBatchId === batchId) {
        cancelEditBatch();
      } else {
        fetchBatches();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete batch from MongoDB', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      showToast('File size exceeds the 10MB limit!', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result.split(',')[1];
      setFormData(prev => ({
        ...prev,
        [`${type}File`]: base64Data,
        [`${type}FileName`]: file.name
      }));
      showToast(`${type === 'circular' ? 'Circular' : 'Brochure'} file loaded successfully!`);
    };
    reader.readAsDataURL(file);
  };

  const handleActiveFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      showToast('File size exceeds the 10MB limit!', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result.split(',')[1];
      setActiveBatchUpload(prev => ({
        ...prev,
        [`${type}File`]: base64Data,
        [`${type}FileName`]: file.name
      }));
      showToast(`${type === 'circular' ? 'Circular' : 'Brochure'} file loaded for active batch!`);
    };
    reader.readAsDataURL(file);
  };

  const handleActiveUploadSubmit = async () => {
    if (!activeBatchUpload.circularFile && !activeBatchUpload.brochureFile && !activeBatchUpload.invitationFile) {
      showToast('Please select at least one file to upload!', 'error');
      return;
    }
    setUploadingActive(true);
    try {
      const payload = {};
      if (activeBatchUpload.circularFile) {
        payload.circularFile = activeBatchUpload.circularFile;
        payload.circularFileName = activeBatchUpload.circularFileName;
      }
      if (activeBatchUpload.brochureFile) {
        payload.brochureFile = activeBatchUpload.brochureFile;
        payload.brochureFileName = activeBatchUpload.brochureFileName;
      }
      if (activeBatchUpload.invitationFile) {
        payload.invitationFile = activeBatchUpload.invitationFile;
        payload.invitationFileName = activeBatchUpload.invitationFileName;
      }

      const res = await axios.put(`/api/batches/${activeBatch._id}`, payload);
      setActiveBatch(res.data);
      showToast('Active batch documents updated successfully in MongoDB!');
      setActiveBatchUpload({
        circularFile: '',
        circularFileName: '',
        brochureFile: '',
        brochureFileName: '',
        invitationFile: '',
        invitationFileName: ''
      });
    } catch (err) {
      showToast('Failed to update active batch files', 'error');
    } finally {
      setUploadingActive(false);
    }
  };

  const handleAutofill = (version) => {
    if (version === '7.0') {
      setFormData(prev => ({
        ...prev,
        batchYearRange: '2026-2029',
        academicYear: '2026-2027',
        deeksharambhVersion: '7.0',
        startDate: '2026-06-25',
        endDate: '2026-07-02',
        hodName: 'Dr. R. Sasikala',
        principalName: 'Dr. V. Radhika',
        className: 'I B.Sc. CSDA',
        managingTrusteeName: 'Dr. Sandhya Ramachandran',
        marksTamil: 15,
        marksEnglish: 15,
        marksMaths: 15,
        marksCore: 55,
        resultRanges: ['60 & Above', '70-79', '60-69', '50-59', 'Below 50']
      }));
      setInsights([
        'Motivational Talks',
        'Gender Sensitivity Programmes',
        'Placement & Life Skill Orientation',
        'Clubs & Committees Orientation',
        'Physical Education',
        'Fun Events',
        'SWAYAM-NPTEL-MOOCS Orientation',
        'Annual Plan',
        'Short & Long-Term Goal Setting',
        'Dissemination of POs & COs'
      ]);
      showToast('Pre-filled Deeksharambh 7.0 template details!');
    } else if (version === '8.0') {
      setFormData(prev => ({
        ...prev,
        batchYearRange: '2027-2030',
        academicYear: '2027-2028',
        deeksharambhVersion: '8.0',
        startDate: '2027-06-24',
        endDate: '2027-07-01',
        hodName: 'Dr. R. Sasikala',
        principalName: 'Dr. V. Radhika',
        className: 'I B.Sc. CSDA',
        managingTrusteeName: 'Dr. Sandhya Ramachandran',
        marksTamil: 15,
        marksEnglish: 15,
        marksMaths: 15,
        marksCore: 55,
        resultRanges: ['60 & Above', '70-79', '60-69', '50-59', 'Below 50']
      }));
      setInsights([
        'Motivational Talks',
        'Gender Sensitivity Programmes',
        'Placement & Life Skill Orientation',
        'Clubs & Committees Orientation',
        'Physical Education',
        'Fun Events',
        'SWAYAM-NPTEL-MOOCS Orientation',
        'Annual Plan',
        'Short & Long-Term Goal Setting',
        'Dissemination of POs & COs'
      ]);
      showToast('Pre-filled Deeksharambh 8.0 template details!');
    }
  };

  const handleAddInsight = () => {
    if (newInsight.trim()) {
      setInsights([...insights, newInsight.trim()]);
      setNewInsight('');
    }
  };

  const handleRemoveInsight = (index) => {
    setInsights(insights.filter((_, i) => i !== index));
  };

  const handleInitDefaultsForActiveBatch = async () => {
    if (!activeBatch) {
      showToast('Please select an active batch first!', 'error');
      return;
    }
    if (!window.confirm(`Initialize/populate default syllabus, schedule, questions, and sample roster for batch ${activeBatch.batchYearRange}?`)) return;
    setLoading(true);
    try {
      const res = await axios.post(`/api/batches/${activeBatch._id}/init-defaults`);
      showToast(res.data.message || 'Defaults initialized successfully!');
      fetchBatches();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to initialize defaults', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const totalMarks = Number(formData.marksTamil) + Number(formData.marksEnglish) + Number(formData.marksMaths) + Number(formData.marksCore);
      const payload = {
        batchYearRange: formData.batchYearRange,
        academicYear: formData.academicYear,
        deeksharambhVersion: formData.deeksharambhVersion,
        startDate: formData.startDate,
        endDate: formData.endDate,
        hodName: formData.hodName,
        principalName: formData.principalName,
        className: formData.className,
        managingTrusteeName: formData.managingTrusteeName,
        programmeInsights: insights,
        marksConfig: {
          tamil: Number(formData.marksTamil),
          english: Number(formData.marksEnglish),
          maths: Number(formData.marksMaths),
          core: Number(formData.marksCore),
          total: totalMarks
        },
        resultRanges: formData.resultRanges,
        circularFile: formData.circularFile,
        circularFileName: formData.circularFileName,
        brochureFile: formData.brochureFile,
        brochureFileName: formData.brochureFileName,
        invitationFile: formData.invitationFile,
        invitationFileName: formData.invitationFileName
      };

      if (editingBatchId) {
        const res = await axios.put(`/api/batches/${editingBatchId}`, payload);
        setActiveBatch(res.data);
        showToast(`Batch ${formData.batchYearRange} updated successfully in MongoDB!`);
        setEditingBatchId(null);
      } else {
        const res = await axios.post('/api/batches', payload);
        setActiveBatch(res.data);
        showToast('New Batch setup completed successfully! All features auto-initialized in MongoDB.');
      }
      fetchBatches();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save batch', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide uppercase">
            {editingBatchId ? 'Edit & Update Academic Batch' : 'New Batch Setup & Management'}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {editingBatchId ? 'Modify settings, dates, HOD names, and document templates for the selected batch.' : 'Initialize settings, schedules, syllabus templates, and configurations for a new class.'}
          </p>
        </div>
        <div className="flex gap-2">
          {editingBatchId && (
            <button
              type="button"
              onClick={cancelEditBatch}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Cancel Edit</span>
            </button>
          )}
          {activeBatch && (
            <button
              type="button"
              onClick={handleInitDefaultsForActiveBatch}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Initialize All Features ({activeBatch.batchYearRange})</span>
            </button>
          )}
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${
          message.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'
        }`}>
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Existing Batches Management Cards with Edit, Update, and Delete */}
      <div className="glass-card p-6 rounded-xl border border-white/5 space-y-4">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">All Academic Batches ({batches.length})</h3>
            <p className="text-xs text-gray-400 mt-0.5">Click Edit to modify batch settings, Trash to permanently delete from MongoDB, or Set Active.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map(b => {
            const isActive = activeBatch && activeBatch._id === b._id;
            const isEditing = editingBatchId === b._id;
            return (
              <div
                key={b._id}
                className={`p-4 rounded-xl border text-left transition-all relative space-y-3 ${
                  isEditing 
                    ? 'border-yellow-400 bg-yellow-400/10 ring-2 ring-yellow-400/20' 
                    : isActive 
                      ? 'border-blue-500 bg-blue-50/10 ring-2 ring-blue-500/20' 
                      : 'border-white/10 bg-navy-dark/40 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 rounded bg-blue-600 text-[10px] text-white font-bold uppercase tracking-wider">
                    v{b.deeksharambhVersion}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEditBatch(b)}
                      className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Edit & Update Batch"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBatch(b._id, b.batchYearRange)}
                      className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete Batch from MongoDB"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm">{b.batchYearRange}</h4>
                  <p className="text-[11px] text-gray-400">AY: {b.academicYear} • {b.className || 'I B.Sc. CSDA'}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">HoD: {b.hodName}</p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-semibold">{b.totalStudents || 0} Students</span>
                  {!isActive ? (
                    <button
                      type="button"
                      onClick={() => { setActiveBatch(b); showToast(`Set ${b.batchYearRange} as active batch!`); }}
                      className="text-[10px] font-bold text-blue-400 hover:text-blue-300 underline cursor-pointer"
                    >
                      Set Active
                    </button>
                  ) : (
                    <span className="text-[10px] font-extrabold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quick Setup Templates */}
        <div className="glass-card p-6 rounded-xl border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Quick Autofill Templates</h3>
          <p className="text-xs text-gray-400">Instantly pre-populate all fields with upcoming Deeksharambh batch configurations to save time.</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleAutofill('7.0')}
              className="flex-1 min-w-[200px] py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-extrabold text-xs transition-all cursor-pointer shadow-sm"
            >
              Autofill Deeksharambh 7.0 (2026-2029)
            </button>
            <button
              type="button"
              onClick={() => handleAutofill('8.0')}
              className="flex-1 min-w-[200px] py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-extrabold text-xs transition-all cursor-pointer shadow-sm"
            >
              Autofill Deeksharambh 8.0 (2027-2030)
            </button>
          </div>
        </div>

        {/* Core batch information */}
        <div className="glass-card p-6 rounded-xl border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-gold uppercase tracking-wider border-b border-white/5 pb-2">Batch General Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Batch Year Range</label>
              <input
                type="text"
                name="batchYearRange"
                required
                value={formData.batchYearRange}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
                placeholder="e.g. 2026-2029"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Academic Year (AY)</label>
              <input
                type="text"
                name="academicYear"
                required
                value={formData.academicYear}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
                placeholder="e.g. 2026-2027"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Deeksharambh Version</label>
              <input
                type="text"
                name="deeksharambhVersion"
                required
                value={formData.deeksharambhVersion}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
                placeholder="e.g. 7.0"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Class / Stream Name</label>
              <input
                type="text"
                name="className"
                required
                value={formData.className}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Programme Start Date</label>
              <input
                type="date"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Programme End Date</label>
              <input
                type="date"
                name="endDate"
                required
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">HOD Name</label>
              <input
                type="text"
                name="hodName"
                required
                value={formData.hodName}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
                placeholder="e.g. Dr. R. Sasikala"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Principal Name</label>
              <input
                type="text"
                name="principalName"
                required
                value={formData.principalName}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
                placeholder="e.g. Dr. V. Radhika"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Managing Trustee Name</label>
              <input
                type="text"
                name="managingTrusteeName"
                required
                value={formData.managingTrusteeName}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
                placeholder="e.g. Dr. Sandhya Ramachandran"
              />
            </div>
          </div>
        </div>

        {/* Marks Configuration */}
        <div className="glass-card p-6 rounded-xl border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-gold uppercase tracking-wider border-b border-white/5 pb-2">Assessments Max Marks Configuration</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Tamil Max Marks</label>
              <input
                type="number"
                name="marksTamil"
                required
                value={formData.marksTamil}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">English Max Marks</label>
              <input
                type="number"
                name="marksEnglish"
                required
                value={formData.marksEnglish}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Mathematics Max</label>
              <input
                type="number"
                name="marksMaths"
                required
                value={formData.marksMaths}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Core Max Marks</label>
              <input
                type="number"
                name="marksCore"
                required
                value={formData.marksCore}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
              />
            </div>
          </div>
          <div className="text-right text-xs text-gold font-bold">
            Total Marks: {Number(formData.marksTamil) + Number(formData.marksEnglish) + Number(formData.marksMaths) + Number(formData.marksCore)}
          </div>
        </div>

        {/* Cover brochure page insights list */}
        <div className="glass-card p-6 rounded-xl border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-gold uppercase tracking-wider border-b border-white/5 pb-2">Programme Insights / Activities</h3>
          <p className="text-xs text-gray-400">Add the co-curricular activities, guest talks, and induction events included on the front cover brochure.</p>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newInsight}
              onChange={(e) => setNewInsight(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg glass-input text-sm"
              placeholder="e.g. Guest Talk on Cyber Security"
            />
            <button
              type="button"
              onClick={handleAddInsight}
              className="px-4 py-2 rounded-lg bg-gold text-navy-dark font-bold text-xs hover:bg-gold-light transition-all flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
            {insights.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center px-3 py-2 bg-white/5 border border-white/5 rounded-lg text-xs">
                <span className="text-gray-300">{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveInsight(idx)}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Circular & Brochure Cover & Invitation */}
        <div className="glass-card p-6 rounded-xl border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-gold uppercase tracking-wider border-b border-white/5 pb-2">Documents Upload (Optional)</h3>
          <p className="text-xs text-gray-400">Upload custom files (PDF or Word) for circular, cover brochure, and invitation card. If left empty, default templates will be generated.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Upload Circular File</label>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, 'circular')}
                  className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20"
                />
                {formData.circularFileName && (
                  <span className="text-[10px] text-green-400">Selected: {formData.circularFileName}</span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Upload Cover Brochure</label>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, 'brochure')}
                  className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20"
                />
                {formData.brochureFileName && (
                  <span className="text-[10px] text-green-400">Selected: {formData.brochureFileName}</span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Upload Invitation Card</label>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e, 'invitation')}
                  className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20"
                />
                {formData.invitationFileName && (
                  <span className="text-[10px] text-green-400">Selected: {formData.invitationFileName}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-gold to-yellow-400 text-navy-dark font-bold text-sm hover:from-yellow-400 hover:to-gold transition-all duration-200 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{editingBatchId ? 'Save & Update Batch Details in MongoDB' : 'Complete Setup & Initialize New Batch'}</span>
            </>
          )}
        </button>
      </form>

      {/* Export Options (Active Batch) */}
      {activeBatch && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Active Batch Documents ({activeBatch.batchYearRange})</h3>
            <p className="text-xs text-gray-400">Download the circular, cover brochure, and invitation documents for the currently active batch.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/circular`, activeBatch.circularFileName || `Circular_${activeBatch.deeksharambhVersion}.docx`)}
                className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 transition-all text-center cursor-pointer shadow"
              >
                <FileText className="w-4 h-4 flex-shrink-0 text-white" />
                <span className="truncate">
                  {activeBatch.circularFileName ? `Circular: ${activeBatch.circularFileName}` : 'Download Circular'}
                </span>
              </button>
              <button
                onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/cover`, activeBatch.brochureFileName || `Brochure_${activeBatch.deeksharambhVersion}.docx`)}
                className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all text-center cursor-pointer shadow"
              >
                <FileText className="w-4 h-4 flex-shrink-0 text-white" />
                <span className="truncate">
                  {activeBatch.brochureFileName ? `Brochure: ${activeBatch.brochureFileName}` : 'Download Brochure'}
                </span>
              </button>
              <button
                onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/invitation/pdf`, activeBatch.invitationFileName || `Invitation_${activeBatch.deeksharambhVersion}.pdf`)}
                className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-cyan-600 text-white font-bold text-xs hover:bg-cyan-700 transition-all text-center cursor-pointer shadow"
              >
                <FileText className="w-4 h-4 flex-shrink-0 text-white" />
                <span className="truncate">
                  {activeBatch.invitationFileName ? `Invitation: ${activeBatch.invitationFileName}` : 'Download Invitation (PDF)'}
                </span>
              </button>
              <button
                onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/invitation/docx`, `Invitation_${activeBatch.deeksharambhVersion}.docx`)}
                className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-sky-500 text-white font-bold text-xs hover:bg-sky-600 transition-all text-center cursor-pointer shadow"
              >
                <FileText className="w-4 h-4 flex-shrink-0 text-white" />
                <span className="truncate">Download Invitation (Word)</span>
              </button>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-gold uppercase tracking-wider border-b border-white/5 pb-2">Upload Files for Active Batch</h3>
            <p className="text-xs text-gray-400">Directly upload and overwrite the circular, brochure, or invitation for the active batch without creating a new batch.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Upload Circular File</label>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleActiveFileUpload(e, 'circular')}
                    className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20"
                  />
                  {activeBatchUpload.circularFileName && (
                    <span className="text-[10px] text-green-400">Selected: {activeBatchUpload.circularFileName}</span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Upload Cover Brochure</label>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleActiveFileUpload(e, 'brochure')}
                    className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20"
                  />
                  {activeBatchUpload.brochureFileName && (
                    <span className="text-[10px] text-green-400">Selected: {activeBatchUpload.brochureFileName}</span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Upload Invitation File</label>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleActiveFileUpload(e, 'invitation')}
                    className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gold/10 file:text-gold hover:file:bg-gold/20"
                  />
                  {activeBatchUpload.invitationFileName && (
                    <span className="text-[10px] text-green-400">Selected: {activeBatchUpload.invitationFileName}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={uploadingActive}
                onClick={handleActiveUploadSubmit}
                className="px-6 py-2 rounded-lg bg-gold text-navy-dark font-bold text-xs hover:bg-gold-light transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {uploadingActive ? (
                  <span className="w-3.5 h-3.5 border-2 border-navy border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Files to Active Batch</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

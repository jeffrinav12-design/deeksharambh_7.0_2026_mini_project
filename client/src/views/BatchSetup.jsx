import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Save, FileText, CheckCircle2 } from 'lucide-react';

export default function BatchSetup({ activeBatch, setActiveBatch }) {
  const [batches, setBatches] = useState([]);
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
    brochureFileName: ''
  });

  const [activeBatchUpload, setActiveBatchUpload] = useState({
    circularFile: '',
    circularFileName: '',
    brochureFile: '',
    brochureFileName: ''
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

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await axios.get('/api/batches');
      setBatches(res.data);
      if (res.data.length > 0) {
        // Suggest next version
        const versions = res.data.map(b => parseFloat(b.deeksharambhVersion)).filter(v => !isNaN(v));
        const maxVersion = versions.length > 0 ? Math.max(...versions) : 6.0;
        setFormData(prev => ({
          ...prev,
          deeksharambhVersion: (maxVersion + 1.0).toFixed(1)
        }));
      } else {
        setFormData(prev => ({ ...prev, deeksharambhVersion: '5.0' }));
      }
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
  };

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
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
    if (!activeBatchUpload.circularFile && !activeBatchUpload.brochureFile) {
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

      const res = await axios.put(`/api/batches/${activeBatch._id}`, payload);
      setActiveBatch(res.data);
      showToast('Active batch circular/brochure updated successfully!');
      setActiveBatchUpload({
        circularFile: '',
        circularFileName: '',
        brochureFile: '',
        brochureFileName: ''
      });
    } catch (err) {
      showToast('Failed to update active batch files', 'error');
    } finally {
      setUploadingActive(false);
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
        brochureFileName: formData.brochureFileName
      };

      const res = await axios.post('/api/batches', payload);
      setActiveBatch(res.data);
      showToast('New Batch setup completed successfully!');
      fetchBatches();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to setup batch', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide uppercase">New Batch Setup</h2>
          <p className="text-xs text-gray-400 mt-1">Initialize settings, schedules, syllabus templates, and configurations for a new class.</p>
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

      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Upload Circular & Brochure Cover */}
        <div className="glass-card p-6 rounded-xl border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-gold uppercase tracking-wider border-b border-white/5 pb-2">Circular & Cover Brochure Upload (Optional)</h3>
          <p className="text-xs text-gray-400">Upload custom circular and brochure files (PDF or Word) for this batch. If left empty, default templates will be generated.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </div>

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
              <span>Complete Setup & Initialize Batch</span>
            </>
          )}
        </button>
      </form>

      {/* Export Options (Active Batch) */}
      {activeBatch && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Active Batch Documents ({activeBatch.batchYearRange})</h3>
            <p className="text-xs text-gray-400">Download the circular and cover brochure files for the currently active batch.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.open(`/api/batches/${activeBatch._id}/export/circular`, '_blank')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:border-gold/30 hover:bg-gold/5 text-xs text-gold font-bold transition-all text-center cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>
                  {activeBatch.circularFileName ? `Circular: ${activeBatch.circularFileName}` : 'Download Circular (Default Template)'}
                </span>
              </button>
              <button
                onClick={() => window.open(`/api/batches/${activeBatch._id}/export/cover`, '_blank')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/5 border border-white/10 hover:border-gold/30 hover:bg-gold/5 text-xs text-gold font-bold transition-all text-center cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>
                  {activeBatch.brochureFileName ? `Brochure: ${activeBatch.brochureFileName}` : 'Download Cover Brochure (Default Template)'}
                </span>
              </button>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-gold uppercase tracking-wider border-b border-white/5 pb-2">Upload Files for Active Batch</h3>
            <p className="text-xs text-gray-400">Directly upload and overwrite the circular or brochure for the active batch without creating a new batch.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

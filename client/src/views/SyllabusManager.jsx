import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Plus, Trash2, BookOpen, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { downloadFile } from '../utils/downloadHelper';

export default function SyllabusManager({ activeBatch, role }) {
  const [syllabi, setSyllabi] = useState([]);
  const [selectedSyllabusId, setSelectedSyllabusId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form State
  const [formData, setFormData] = useState({
    subjectName: '',
    departmentName: 'Department of CSDA',
    hours: 3,
    mathsStream: 'ALL',
    objectives: [''],
    referenceBooks: [''],
    staffIncharge: '',
    subjectExpertName: '',
    subjectExpertDesignation: '',
    subjectExpertInstitution: '',
    subjectExpertDetails: '',
    hodName: activeBatch ? activeBatch.hodName : '',
    units: [
      { unitNo: 'UNIT I', title: '', content: '' },
      { unitNo: 'UNIT II', title: '', content: '' },
      { unitNo: 'UNIT III', title: '', content: '' },
      { unitNo: 'UNIT IV', title: '', content: '' },
      { unitNo: 'UNIT V', title: '', content: '' }
    ]
  });

  const getBatchSampleSyllabi = (batch) => {
    const bId = (batch?.deeksharambhVersion || batch?.batchYearRange || '').toString();
    const batchLabel = bId.includes('5.0') || bId.includes('2024') ? 'Batch 5.0 (2024-2027)' : (bId.includes('6.0') || bId.includes('2025') ? 'Batch 6.0 (2025-2028)' : 'Batch 7.0 (2026-2029)');
    
    return [
      {
        _id: `syl_${bId}_1`,
        subjectName: `Communicative English (${batchLabel})`,
        departmentName: 'Department of CSDA',
        hours: 6,
        mathsStream: 'ALL',
        objectives: ['Enhance professional vocabulary and active listening skills', 'Develop effective technical presentation techniques'],
        referenceBooks: ['Essential English Grammar by Raymond Murphy', 'Technical Communication by Meenakshi Raman'],
        staffIncharge: 'Prof. Anitha R',
        hodName: 'Dr. S. Nithyanandh',
        units: [
          { unitNo: 'UNIT I', title: 'Phonetics & Pronunciation', content: 'Vowel and consonant sounds, accentuation, intonation patterns, speech clarity drills.' },
          { unitNo: 'UNIT II', title: 'Functional Grammar', content: 'Tenses, active/passive voice, subject-verb agreement, common syntactic errors.' },
          { unitNo: 'UNIT III', title: 'Professional Writing', content: 'Email etiquette, formal letter writing, resume drafting, technical report structure.' },
          { unitNo: 'UNIT IV', title: 'Group Discussions & Interviews', content: 'GD strategies, body language, interview preparation, answering STAR method questions.' },
          { unitNo: 'UNIT V', title: 'Presentation Skills', content: 'Slide design, public speaking confidence, audience engagement techniques.' }
        ]
      },
      {
        _id: `syl_${bId}_2`,
        subjectName: `Bridge Mathematics (${batchLabel})`,
        departmentName: 'Department of CSDA',
        hours: 6,
        mathsStream: 'NON_HSC',
        objectives: ['Bridge foundational mathematical gap for Non-HSC Computer Science entrants', 'Introduce calculus and matrix operations essential for algorithms'],
        referenceBooks: ['Higher Engineering Mathematics by B.S. Grewal', 'Discrete Mathematics by Tremblay & Manohar'],
        staffIncharge: 'Dr. Ramesh Kumar',
        hodName: 'Dr. S. Nithyanandh',
        units: [
          { unitNo: 'UNIT I', title: 'Matrices & Determinants', content: 'Types of matrices, determinant evaluation, inverse matrix, Cramer\'s rule.' },
          { unitNo: 'UNIT II', title: 'Differential Calculus', content: 'Limits, continuity, standard derivatives, product and quotient rules.' },
          { unitNo: 'UNIT III', title: 'Integral Calculus', content: 'Definite and indefinite integrals, integration by parts, simple area applications.' },
          { unitNo: 'UNIT IV', title: 'Analytical Geometry', content: 'Straight lines, slopes, distance formula, equations of circles.' },
          { unitNo: 'UNIT V', title: 'Basic Probability & Statistics', content: 'Permutations, combinations, mean, median, mode, standard deviation.' }
        ]
      },
      {
        _id: `syl_${bId}_3`,
        subjectName: `Core CSDA Foundations (${batchLabel})`,
        departmentName: 'Department of CSDA',
        hours: 18,
        mathsStream: 'ALL',
        objectives: ['Introduce fundamentals of computer hardware, logic gates, and Python logic', 'Prepare students for digital applications and web technologies'],
        referenceBooks: ['Computer Fundamentals by Anita Goel', 'Python Programming by Reema Thareja'],
        staffIncharge: 'Dr. S. Nithyanandh',
        hodName: 'Dr. S. Nithyanandh',
        units: [
          { unitNo: 'UNIT I', title: 'Computer Architecture & Systems', content: 'CPU, RAM, storage devices, binary representation, operating system basics.' },
          { unitNo: 'UNIT II', title: 'Digital Logic Gates', content: 'AND, OR, NOT, NAND, NOR, XOR logic gates, Boolean algebraic simplification.' },
          { unitNo: 'UNIT III', title: 'Problem Solving & Flowcharts', content: 'Algorithms, flowchart symbols, pseudocode design, control structures.' },
          { unitNo: 'UNIT IV', title: 'Python Basics & Data Types', content: 'Variables, loops, lists, dictionaries, functions, debugging techniques.' },
          { unitNo: 'UNIT V', title: 'Web Fundamentals & Databases', content: 'HTML5, CSS3 layout, SQL queries, database tables, client-server model.' }
        ]
      }
    ];
  };

  useEffect(() => {
    if (activeBatch) {
      fetchSyllabi();
    }
  }, [activeBatch]);

  const fetchSyllabi = async () => {
    const fallback = getBatchSampleSyllabi(activeBatch);
    try {
      const res = await axios.get(`/api/batches/${activeBatch._id}/syllabi`);
      if (res.data && res.data.length > 0) {
        setSyllabi(res.data);
        loadSyllabusToForm(res.data[0]);
      } else {
        setSyllabi(fallback);
        loadSyllabusToForm(fallback[0]);
      }
    } catch (err) {
      setSyllabi(fallback);
      loadSyllabusToForm(fallback[0]);
    }
  };

  const loadSyllabusToForm = (syllabus) => {
    setSelectedSyllabusId(syllabus._id);
    setFormData({
      subjectName: syllabus.subjectName,
      departmentName: syllabus.departmentName,
      hours: syllabus.hours || 3,
      mathsStream: syllabus.mathsStream || 'ALL',
      objectives: syllabus.objectives.length > 0 ? syllabus.objectives : [''],
      referenceBooks: syllabus.referenceBooks.length > 0 ? syllabus.referenceBooks : [''],
      staffIncharge: syllabus.staffIncharge || '',
      subjectExpertName: syllabus.subjectExpert?.name || '',
      subjectExpertDesignation: syllabus.subjectExpert?.designation || '',
      subjectExpertInstitution: syllabus.subjectExpert?.institution || '',
      subjectExpertDetails: syllabus.subjectExpert?.details || '',
      hodName: syllabus.hodName || activeBatch.hodName,
      units: syllabus.units.length > 0 ? syllabus.units : [
        { unitNo: 'UNIT I', title: '', content: '' },
        { unitNo: 'UNIT II', title: '', content: '' },
        { unitNo: 'UNIT III', title: '', content: '' },
        { unitNo: 'UNIT IV', title: '', content: '' },
        { unitNo: 'UNIT V', title: '', content: '' }
      ]
    });
  };

  const clearForm = () => {
    setSelectedSyllabusId('');
    setFormData({
      subjectName: '',
      departmentName: 'Department of CSDA',
      hours: 3,
      mathsStream: 'ALL',
      objectives: [''],
      referenceBooks: [''],
      staffIncharge: '',
      subjectExpertName: '',
      subjectExpertDesignation: '',
      subjectExpertInstitution: '',
      subjectExpertDetails: '',
      hodName: activeBatch ? activeBatch.hodName : '',
      units: [
        { unitNo: 'UNIT I', title: '', content: '' },
        { unitNo: 'UNIT II', title: '', content: '' },
        { unitNo: 'UNIT III', title: '', content: '' },
        { unitNo: 'UNIT IV', title: '', content: '' },
        { unitNo: 'UNIT V', title: '', content: '' }
      ]
    });
  };

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (index, value, type) => {
    const updated = [...formData[type]];
    updated[index] = value;
    setFormData(prev => ({ ...prev, [type]: updated }));
  };

  const addArrayItem = (type) => {
    setFormData(prev => ({ ...prev, [type]: [...prev[type], ''] }));
  };

  const removeArrayItem = (index, type) => {
    const updated = formData[type].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [type]: updated.length > 0 ? updated : [''] }));
  };

  const handleUnitChange = (index, field, value) => {
    const updatedUnits = [...formData.units];
    updatedUnits[index] = { ...updatedUnits[index], [field]: value };
    setFormData(prev => ({ ...prev, units: updatedUnits }));
  };

  const handleDeleteSyllabus = async () => {
    if (!selectedSyllabusId) return;
    if (role !== 'admin') {
      showToast('Only admins can delete syllabus subjects.', 'error');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this syllabus subject?')) return;

    try {
      await axios.delete(`/api/syllabi/${selectedSyllabusId}`);
      showToast('Syllabus subject deleted successfully!');
      fetchSyllabi();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete syllabus subject', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (role === 'viewer') {
      showToast('Viewers cannot edit the syllabus.', 'error');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        batchId: activeBatch._id,
        subjectName: formData.subjectName,
        departmentName: formData.departmentName,
        hours: Number(formData.hours),
        mathsStream: formData.mathsStream,
        objectives: formData.objectives.filter(o => o.trim() !== ''),
        referenceBooks: formData.referenceBooks.filter(r => r.trim() !== ''),
        staffIncharge: formData.staffIncharge,
        subjectExpert: {
          name: formData.subjectExpertName,
          designation: formData.subjectExpertDesignation,
          institution: formData.subjectExpertInstitution,
          details: formData.subjectExpertDetails
        },
        hodName: formData.hodName,
        units: formData.units
      };

      if (selectedSyllabusId) {
        await axios.put(`/api/syllabi/${selectedSyllabusId}`, payload);
        showToast('Syllabus updated successfully!');
      } else {
        const res = await axios.post('/api/syllabi', payload);
        setSelectedSyllabusId(res.data._id);
        showToast('Syllabus saved successfully!');
      }
      fetchSyllabi();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save syllabus', 'error');
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
          <h2 className="text-xl font-bold text-white tracking-wide uppercase">Syllabus Manager</h2>
          <p className="text-xs text-gray-400 mt-1">Configure subjects, hours, units, and subject experts signatures for the induction course.</p>
        </div>
        {role === 'admin' && (
          <button
            onClick={clearForm}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-navy-dark font-bold text-xs hover:bg-gold-light transition-all"
          >
            <Plus className="w-4 h-4" /> Create New Subject
          </button>
        )}
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${
          message.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'
        }`}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side: Subject Selector List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold text-gold uppercase tracking-wider">Subject Syllabus List</h3>
          <div className="flex flex-col space-y-1.5">
            {syllabi.map(s => (
              <button
                key={s._id}
                onClick={() => loadSyllabusToForm(s)}
                className={`w-full p-4 rounded-xl border text-left transition-all text-xs flex justify-between items-center ${
                  selectedSyllabusId === s._id
                    ? 'border-gold/50 bg-gold/5 text-gold'
                    : 'border-white/5 bg-navy-dark/40 text-gray-400 hover:border-white/10 hover:text-white'
                }`}
              >
                <div className="space-y-1 truncate">
                  <div className="font-bold truncate">{s.subjectName}</div>
                  <div className="text-[10px] text-gray-400">Stream: {s.mathsStream === 'ALL' ? 'General' : s.mathsStream === 'M' ? 'Maths (M)' : 'Non-Maths (NM)'}</div>
                </div>
                <BookOpen className="w-4 h-4 flex-shrink-0 ml-2" />
              </button>
            ))}
            {syllabi.length === 0 && (
              <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-xs text-gray-500">
                No subjects configured.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="glass-card p-6 rounded-xl border border-white/5 space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  {selectedSyllabusId ? 'Edit Subject Syllabus' : 'New Subject Syllabus Details'}
                </h3>
                {selectedSyllabusId && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => downloadFile(`/api/syllabi/${selectedSyllabusId}/export`, `Syllabus_${formData.subjectName.replace(/\s+/g, '_') || 'Subject'}.docx`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-300 text-sky-800 hover:bg-sky-100 text-xs font-bold cursor-pointer shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" /> DOCX
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadFile(`/api/syllabi/${selectedSyllabusId}/export/csv`, `Syllabus_${formData.subjectName.replace(/\s+/g, '_') || 'Subject'}.csv`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs font-bold cursor-pointer shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" /> CSV
                    </button>
                    {role === 'admin' && (
                      <button
                        type="button"
                        onClick={handleDeleteSyllabus}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-100 cursor-pointer shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* General details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Subject Name</label>
                  <input
                    type="text"
                    name="subjectName"
                    required
                    disabled={role === 'viewer'}
                    value={formData.subjectName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
                    placeholder="e.g. Programming Basics & C"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Department Name</label>
                  <input
                    type="text"
                    name="departmentName"
                    required
                    disabled={role === 'viewer'}
                    value={formData.departmentName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Stream Mapping</label>
                  <select
                    name="mathsStream"
                    disabled={role === 'viewer'}
                    value={formData.mathsStream}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
                  >
                    <option value="ALL">ALL (Common Subject)</option>
                    <option value="M">Maths Students (M) Only</option>
                    <option value="NM">Non-Maths Students (NM) Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Syllabus Hours</label>
                  <input
                    type="number"
                    name="hours"
                    required
                    disabled={role === 'viewer'}
                    value={formData.hours}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
                    min="1"
                  />
                </div>
              </div>

              {/* Objectives List */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-gray-300">Course Objectives</label>
                  {role !== 'viewer' && (
                    <button
                      type="button"
                      onClick={() => addArrayItem('objectives')}
                      className="text-gold font-bold text-[10px] uppercase hover:underline"
                    >
                      + Add Objective
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {formData.objectives.map((obj, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        disabled={role === 'viewer'}
                        value={obj}
                        onChange={(e) => handleArrayChange(idx, e.target.value, 'objectives')}
                        className="flex-1 px-4 py-2 rounded-lg glass-input text-xs"
                        placeholder={`Objective #${idx+1}`}
                      />
                      {role !== 'viewer' && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem(idx, 'objectives')}
                          className="text-red-400 hover:text-red-300 px-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Unit Content Builder */}
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-gold uppercase tracking-wider">Unit-wise content description</label>
                <div className="space-y-3">
                  {formData.units.map((unit, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-navy-deep/50 border border-white/5 space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          disabled={role === 'viewer'}
                          value={unit.unitNo}
                          onChange={(e) => handleUnitChange(idx, 'unitNo', e.target.value)}
                          className="px-3 py-1.5 rounded bg-white/5 border border-white/10 text-xs text-gold font-bold"
                          placeholder="Unit No"
                        />
                        <input
                          type="text"
                          disabled={role === 'viewer'}
                          value={unit.title}
                          onChange={(e) => handleUnitChange(idx, 'title', e.target.value)}
                          className="col-span-2 px-3 py-1.5 rounded glass-input text-xs font-bold"
                          placeholder="Unit Title"
                        />
                      </div>
                      <textarea
                        rows="2"
                        disabled={role === 'viewer'}
                        value={unit.content}
                        onChange={(e) => handleUnitChange(idx, 'content', e.target.value)}
                        className="w-full px-3 py-1.5 rounded glass-input text-xs resize-none"
                        placeholder="Content outline"
                      ></textarea>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reference books list */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-gray-300">Reference Books</label>
                  {role !== 'viewer' && (
                    <button
                      type="button"
                      onClick={() => addArrayItem('referenceBooks')}
                      className="text-gold font-bold text-[10px] uppercase hover:underline"
                    >
                      + Add Reference
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {formData.referenceBooks.map((ref, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        disabled={role === 'viewer'}
                        value={ref}
                        onChange={(e) => handleArrayChange(idx, e.target.value, 'referenceBooks')}
                        className="flex-1 px-4 py-2 rounded-lg glass-input text-xs"
                        placeholder={`Reference Book #${idx+1}`}
                      />
                      {role !== 'viewer' && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem(idx, 'referenceBooks')}
                          className="text-red-400 hover:text-red-300 px-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Staff and Experts Signatures */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h4 className="text-xs font-bold text-gold uppercase tracking-wider">Faculty & Expert Assignment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Staff In-charge Name</label>
                    <input
                      type="text"
                      name="staffIncharge"
                      disabled={role === 'viewer'}
                      value={formData.staffIncharge}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">HOD Name</label>
                    <input
                      type="text"
                      name="hodName"
                      disabled={role === 'viewer'}
                      value={formData.hodName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg glass-input text-sm"
                    />
                  </div>
                  <div className="md:col-span-2 p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                    <h5 className="text-xs font-bold text-white uppercase">Subject Expert Details</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 mb-1">Expert Name</label>
                        <input
                          type="text"
                          name="subjectExpertName"
                          disabled={role === 'viewer'}
                          value={formData.subjectExpertName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 mb-1">Designation</label>
                        <input
                          type="text"
                          name="subjectExpertDesignation"
                          disabled={role === 'viewer'}
                          value={formData.subjectExpertDesignation}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-400 mb-1">Institution</label>
                        <input
                          type="text"
                          name="subjectExpertInstitution"
                          disabled={role === 'viewer'}
                          value={formData.subjectExpertInstitution}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 mb-1">Additional Details</label>
                      <input
                        type="text"
                        name="subjectExpertDetails"
                        disabled={role === 'viewer'}
                        value={formData.subjectExpertDetails}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                        placeholder="e.g. Coimbatore - 641 018"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {role !== 'viewer' && (
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
                    <span>Save Subject Syllabus</span>
                  </>
                )}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

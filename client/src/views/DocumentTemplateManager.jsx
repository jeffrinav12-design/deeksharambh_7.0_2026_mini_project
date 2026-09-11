import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, Upload, Copy, Edit, Trash2, Download, Printer, Eye, Plus, Search, Filter, 
  CheckCircle2, AlertCircle, RefreshCw, Calendar, Users, Shield, History, Sparkles, Save, FileCode, Check, Paperclip, HelpCircle
} from 'lucide-react';
import { downloadFile } from '../utils/downloadHelper';

const renderFieldInput = (field, value, onChange) => {
  const lowercaseField = field.toLowerCase();
  
  if (lowercaseField.includes('fontfamily')) {
    return (
      <select
        value={value}
        onChange={onChange}
        required
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none bg-white"
      >
        <option value="">Select Font Family</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Arial">Arial</option>
        <option value="Calibri">Calibri</option>
        <option value="Courier New">Courier New</option>
        <option value="Georgia">Georgia</option>
      </select>
    );
  }
  
  if (lowercaseField.includes('fontsize')) {
    return (
      <select
        value={value}
        onChange={onChange}
        required
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none bg-white"
      >
        <option value="">Select Font Size</option>
        <option value="10">10pt</option>
        <option value="11">11pt</option>
        <option value="12">12pt (Standard)</option>
        <option value="14">14pt (Sub-heading)</option>
        <option value="16">16pt (Heading)</option>
        <option value="18">18pt</option>
        <option value="20">20pt</option>
      </select>
    );
  }
  
  if (lowercaseField.includes('alignment') || lowercaseField.includes('align')) {
    return (
      <select
        value={value}
        onChange={onChange}
        required
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none bg-white"
      >
        <option value="">Select Alignment</option>
        <option value="left">Left</option>
        <option value="center">Center</option>
        <option value="right">Right</option>
        <option value="justify">Justify</option>
      </select>
    );
  }
  
  if (lowercaseField.includes('content') || lowercaseField.includes('body') || lowercaseField.includes('text') || lowercaseField.includes('description')) {
    return (
      <textarea
        value={value}
        onChange={onChange}
        required
        rows={4}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none"
        placeholder="Enter document text content here..."
      />
    );
  }
  
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      required
      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none"
    />
  );
};

const isFullWidthField = (field) => {
  const lowercaseField = field.toLowerCase();
  return lowercaseField.includes('content') || lowercaseField.includes('body') || lowercaseField.includes('text') || lowercaseField.includes('description');
};

export default function DocumentTemplateManager({ activeBatch, role }) {
  const [activePortalTab, setActivePortalTab] = useState('TEMPLATES'); // TEMPLATES, SIP_REPORT, MCQS
  
  // Template Portal State
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [docName, setDocName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [generatedDocs, setGeneratedDocs] = useState([]);

  // SIP Report State
  const [reportText, setReportText] = useState('');
  const [objectives, setObjectives] = useState([]);
  const [newObjective, setNewObjective] = useState('');
  const [customFileName, setCustomFileName] = useState('');
  const [attachedFileBase64, setAttachedFileBase64] = useState('');
  const [attachedFileName, setAttachedFileName] = useState('');

  // MCQ & Question State
  const [mcqList, setMcqList] = useState([
    {
      id: 1,
      questionText: "Which matrix operation is used to solve simultaneous linear equations in bridge calculus?",
      optionA: "Matrix Transpose",
      optionB: "Matrix Inversion (A⁻¹B)",
      optionC: "Matrix Trace",
      optionD: "Determinant Addition",
      correctAnswer: "B"
    },
    {
      id: 2,
      questionText: "Given dataset D with mean = 50 and standard deviation = 0, what can be inferred about student test scores?",
      optionA: "All students scored 100%",
      optionB: "All students scored exactly 50 marks",
      optionC: "Scores follow normal distribution",
      optionD: "Half of students failed",
      correctAnswer: "B"
    }
  ]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptionA, setNewOptionA] = useState('');
  const [newOptionB, setNewOptionB] = useState('');
  const [newOptionC, setNewOptionC] = useState('');
  const [newOptionD, setNewOptionD] = useState('');
  const [newCorrectAnswer, setNewCorrectAnswer] = useState('A');

  useEffect(() => {
    fetchTemplates();
    fetchGeneratedDocs();
    if (activeBatch) {
      fetchSipReport();
    }
  }, [activeBatch]);

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const fetchTemplates = async () => {
    try {
      const res = await axios.get('/api/templates', { params: { batchId: activeBatch?._id } });
      setTemplates(res.data || []);
      if (res.data && res.data.length > 0) {
        handleSelectTemplate(res.data[0]);
      }
    } catch (err) {
      console.warn("Using default templates fallback:", err.message);
    }
  };

  const fetchGeneratedDocs = async () => {
    try {
      const res = await axios.get('/api/generated-documents', { params: { batchId: activeBatch?._id } });
      setGeneratedDocs(res.data || []);
    } catch (err) {
      console.warn("Error fetching generated docs:", err.message);
    }
  };

  const fetchSipReport = async () => {
    try {
      const res = await axios.get(`/api/batches/${activeBatch._id}/sip-report`);
      if (res.data) {
        setReportText(res.data.reportText || getDefaultReportText());
        setObjectives(res.data.objectives && res.data.objectives.length > 0 ? res.data.objectives : getDefaultObjectives());
        if (res.data.customFileName) setCustomFileName(res.data.customFileName);
        if (res.data.attachedFile) setAttachedFileBase64(res.data.attachedFile);
        if (res.data.attachedFileName) setAttachedFileName(res.data.attachedFileName);
      }
    } catch (err) {
      setReportText(getDefaultReportText());
      setObjectives(getDefaultObjectives());
    }
  };

  const getDefaultReportText = () => `The Student Induction Program (SIP) for first-year undergraduate students for Academic Year ${activeBatch?.academicYear || '2026-2027'} was conducted from ${activeBatch?.startDate || '2026-08-01'} to ${activeBatch?.endDate || '2026-08-15'} by the Department of Computer Science & Digital Applications (CSDA) at SANKARA COLLEGE OF SCIENCE AND COMMERCE (AUTONOMOUS).

As per Bharathiar University guidelines and UGC Deeksharambh directives, the 7-day orientation program bridged the transition from Higher Secondary Education to Undergraduate Computer Science coursework.`;

  const getDefaultObjectives = () => [
    'Help students feel at ease in the new academic environment at Sankara College',
    'Encourage exploration of academic interests in Data Analytics and Computer Science',
    'Bridge high school learning gaps through Non-HSC stream Bridge Mathematics',
    'Cultivate collaboration over competition, nurturing team spirit and ethical discipline',
    'Strengthen student-teacher mentorship bonds throughout the undergraduate duration'
  ];

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setDocName(`${template.name} - ${activeBatch?.batchYearRange || '2026-2029'}`);
    const initialValues = {};
    (template.fields || []).forEach(field => {
      initialValues[field] = '';
    });
    setFormValues(initialValues);
  };

  const handleInputChange = (field, val) => {
    setFormValues(prev => ({ ...prev, [field]: val }));
  };

  const handleGenerateDoc = async (e) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/generate-document', {
        templateId: selectedTemplate._id,
        batchId: activeBatch?._id,
        name: docName,
        fieldValues: formValues
      });
      showToast('Document compiled successfully!');
      fetchGeneratedDocs();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to generate document', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSipReport = async (e) => {
    e.preventDefault();
    if (!activeBatch) return;
    setLoading(true);
    try {
      await axios.post(`/api/batches/${activeBatch._id}/sip-report`, {
        reportText,
        objectives,
        customFileName: customFileName || `SIP_Report_${activeBatch.deeksharambhVersion}.docx`,
        attachedFile: attachedFileBase64,
        attachedFileName
      });
      showToast(`SIP Report saved successfully for Batch ${activeBatch.batchYearRange}!`);
    } catch (err) {
      showToast('Failed to save SIP report details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddObjective = () => {
    if (!newObjective.trim()) return;
    setObjectives(prev => [...prev, newObjective.trim()]);
    setNewObjective('');
  };

  const handleRemoveObjective = (idx) => {
    setObjectives(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddMcq = (e) => {
    e.preventDefault();
    if (!newQuestionText.trim() || !newOptionA.trim() || !newOptionB.trim()) {
      showToast('Please fill question text and at least options A and B', 'error');
      return;
    }

    const newMcq = {
      id: Date.now(),
      questionText: newQuestionText.trim(),
      optionA: newOptionA.trim(),
      optionB: newOptionB.trim(),
      optionC: newOptionC.trim() || '-',
      optionD: newOptionD.trim() || '-',
      correctAnswer: newCorrectAnswer
    };

    setMcqList(prev => [newMcq, ...prev]);
    setNewQuestionText('');
    setNewOptionA('');
    setNewOptionB('');
    setNewOptionC('');
    setNewOptionD('');
    setNewCorrectAnswer('A');
    showToast('MCQ added to question bank!');
  };

  const handleRemoveMcq = (id) => {
    setMcqList(prev => prev.filter(m => m.id !== id));
  };

  const handleExportMcqsCsv = () => {
    let csv = "Question Text,Option A,Option B,Option C,Option D,Correct Answer\n";
    mcqList.forEach(m => {
      csv += `"${m.questionText.replace(/"/g, '""')}","${m.optionA}","${m.optionB}","${m.optionC}","${m.optionD}","${m.correctAnswer}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `MCQ_Question_Bank_${activeBatch?.batchYearRange || 'Batch'}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Title Header Banner */}
      <div className="bg-gradient-to-r from-[#1b625f] via-[#2b8a85] to-[#3AAFA9] rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-white/20 border border-white/30 rounded-full text-xs font-black uppercase text-white">
                SIP – Student Induction Program
              </span>
              <span className="px-3 py-1 bg-[#c2c19f]/30 border border-[#c2c19f]/40 rounded-full text-xs font-bold text-white">
                SANKARA COLLEGE (AUTONOMOUS)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-wide">Unified Document & SIP Portal</h1>
            <p className="text-xs text-[#e6f7f6] mt-1 max-w-2xl font-medium">
              Create academic document templates, compile induction reports, generate Bloom's taxonomy MCQs with options A/B/C/D, and export official files.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/20">
            <button
              onClick={() => setActivePortalTab('TEMPLATES')}
              className={`px-3 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activePortalTab === 'TEMPLATES' ? 'bg-white text-[#1b625f] shadow-sm' : 'text-white hover:bg-white/10'
              }`}
            >
              📄 Templates
            </button>
            <button
              onClick={() => setActivePortalTab('SIP_REPORT')}
              className={`px-3 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activePortalTab === 'SIP_REPORT' ? 'bg-white text-[#1b625f] shadow-sm' : 'text-white hover:bg-white/10'
              }`}
            >
              📝 SIP Report
            </button>
            <button
              onClick={() => setActivePortalTab('MCQS')}
              className={`px-3 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activePortalTab === 'MCQS' ? 'bg-white text-[#1b625f] shadow-sm' : 'text-white hover:bg-white/10'
              }`}
            >
              🧠 MCQ Bank
            </button>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${
          message.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-xs font-bold">{message.text}</span>
        </div>
      )}

      {/* TAB 1: Document Templates & Compilation */}
      {activePortalTab === 'TEMPLATES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates Roster */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-[#3AAFA9]/20 shadow-sm space-y-3">
              <h3 className="text-xs font-extrabold text-[#1b625f] uppercase tracking-wider border-b border-slate-100 pb-2">
                Available Document Templates
              </h3>

              <div className="space-y-2">
                {templates.map(t => (
                  <div
                    key={t._id}
                    onClick={() => handleSelectTemplate(t)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedTemplate && selectedTemplate._id === t._id
                        ? 'border-[#3AAFA9] bg-[#f0faf9] ring-2 ring-[#3AAFA9]/30'
                        : 'border-slate-100 hover:border-[#3AAFA9]/40 hover:bg-slate-50'
                    }`}
                  >
                    <h4 className="font-bold text-xs text-slate-800">{t.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{t.fileName}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(t.fields || []).slice(0, 3).map((f, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-white text-[9px] text-[#2b8a85] font-semibold border border-[#3AAFA9]/20">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form & Compilation Workspace */}
          <div className="lg:col-span-2 space-y-4">
            {selectedTemplate ? (
              <div className="bg-white rounded-2xl p-6 border border-[#3AAFA9]/20 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-[#1b625f]">Compile Template: {selectedTemplate.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Fill dynamic placeholders to generate compiled document.</p>
                </div>

                <form onSubmit={handleGenerateDoc} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Generated Document Name</label>
                    <input
                      type="text"
                      required
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#3AAFA9]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(selectedTemplate.fields || []).map((field) => (
                      <div key={field} className={isFullWidthField(field) ? 'md:col-span-2' : ''}>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          {field.replace(/([A-Z])/g, ' $1')} *
                        </label>
                        {renderFieldInput(field, formValues[field] || '', (e) => handleInputChange(field, e.target.value))}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 rounded-xl bg-[#3AAFA9] hover:bg-[#2b8a85] text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                      <span>Compile Document</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-xs">
                Select a template from the left list to begin compilation.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SIP Report & Executive Summary */}
      {activePortalTab === 'SIP_REPORT' && (
        <div className="bg-white rounded-2xl p-6 border border-[#3AAFA9]/20 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-[#1b625f]">SIP – Student Induction Program Report</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Batch {activeBatch?.batchYearRange || '7.0'} • SANKARA COLLEGE OF SCIENCE AND COMMERCE (AUTONOMOUS)
              </p>
            </div>
            <button
              onClick={handleSaveSipReport}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-[#3AAFA9] hover:bg-[#2b8a85] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save SIP Report</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">SIP Executive Summary Text</label>
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                rows={6}
                className="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#3AAFA9] leading-relaxed bg-[#f0faf9]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Program Objectives Checklist</label>
              <div className="space-y-2 mb-3">
                {objectives.map((obj, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-medium text-slate-800">{i + 1}. {obj}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveObjective(i)}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="Add new objective..."
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddObjective}
                  className="px-4 py-2 rounded-lg bg-[#e6f7f6] text-[#1b625f] border border-[#3AAFA9]/40 font-bold text-xs hover:bg-[#3AAFA9] hover:text-white transition-all cursor-pointer"
                >
                  Add Objective
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Question & MCQ Generator */}
      {activePortalTab === 'MCQS' && (
        <div className="space-y-6">
          {/* MCQ Creator Form */}
          <div className="bg-white rounded-2xl p-6 border border-[#3AAFA9]/20 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1b625f]">Create Assessment MCQ</h3>
                <p className="text-xs text-slate-500">Add Bloom's Taxonomy Multiple Choice Questions with Options A, B, C, D and Correct Answer.</p>
              </div>
              <button
                type="button"
                onClick={handleExportMcqsCsv}
                className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs hover:bg-emerald-100 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export Question Bank CSV
              </button>
            </div>

            <form onSubmit={handleAddMcq} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Question Text *</label>
                <textarea
                  required
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  rows={2}
                  placeholder="Enter question statement..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#3AAFA9]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Option A *</label>
                  <input
                    type="text"
                    required
                    value={newOptionA}
                    onChange={(e) => setNewOptionA(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Option B *</label>
                  <input
                    type="text"
                    required
                    value={newOptionB}
                    onChange={(e) => setNewOptionB(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Option C</label>
                  <input
                    type="text"
                    value={newOptionC}
                    onChange={(e) => setNewOptionC(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Option D</label>
                  <input
                    type="text"
                    value={newOptionD}
                    onChange={(e) => setNewOptionD(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-700">Correct Option:</label>
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <label key={opt} className="flex items-center gap-1 text-xs font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="correctOpt"
                        value={opt}
                        checked={newCorrectAnswer === opt}
                        onChange={(e) => setNewCorrectAnswer(e.target.value)}
                        className="text-[#3AAFA9]"
                      />
                      <span>Option {opt}</span>
                    </label>
                  ))}
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#3AAFA9] hover:bg-[#2b8a85] text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Question
                </button>
              </div>
            </form>
          </div>

          {/* Question Bank Roster */}
          <div className="bg-white rounded-2xl p-6 border border-[#3AAFA9]/20 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#1b625f] border-b border-slate-100 pb-2">
              Question Bank ({mcqList.length} Questions)
            </h3>

            <div className="space-y-3">
              {mcqList.map((m, idx) => (
                <div key={m.id} className="p-4 rounded-xl border border-slate-100 bg-[#f0faf9]/30 space-y-2 relative">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs text-slate-900">Q{idx + 1}. {m.questionText}</h4>
                    <button
                      type="button"
                      onClick={() => handleRemoveMcq(m.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
                    <div className={m.correctAnswer === 'A' ? 'font-bold text-emerald-700' : ''}>A. {m.optionA}</div>
                    <div className={m.correctAnswer === 'B' ? 'font-bold text-emerald-700' : ''}>B. {m.optionB}</div>
                    <div className={m.correctAnswer === 'C' ? 'font-bold text-emerald-700' : ''}>C. {m.optionC}</div>
                    <div className={m.correctAnswer === 'D' ? 'font-bold text-emerald-700' : ''}>D. {m.optionD}</div>
                  </div>

                  <div className="text-[10px] font-bold text-[#2b8a85] pt-1">
                    Correct Answer: Option {m.correctAnswer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

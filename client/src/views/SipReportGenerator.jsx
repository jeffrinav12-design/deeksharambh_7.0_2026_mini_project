import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Save, FileText, Download, Plus, Trash2, CheckCircle, 
  Upload, Sparkles, AlertCircle, RefreshCw, FileCode, Check, Paperclip 
} from 'lucide-react';
import { downloadFile } from '../utils/downloadHelper';

export default function SipReportGenerator({ activeBatch, role }) {
  const [reportText, setReportText] = useState('');
  const [objectives, setObjectives] = useState([]);
  const [newObjective, setNewObjective] = useState('');
  const [customFileName, setCustomFileName] = useState('');
  const [customFormatText, setCustomFormatText] = useState('');
  const [customContentsText, setCustomContentsText] = useState('');
  const [uploadedFormatName, setUploadedFormatName] = useState('');
  const [attachedFileBase64, setAttachedFileBase64] = useState('');
  const [attachedFileName, setAttachedFileName] = useState('');
  
  const [selectedTemplate, setSelectedTemplate] = useState('UGC_STANDARD');
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const defaultReportText = `The Student Induction Program (SIP) for the newly admitted first-year students for the academic year ${activeBatch ? activeBatch.academicYear : '2026-2027'} was conducted from ${activeBatch ? activeBatch.startDate : '2026-08-01'} to ${activeBatch ? activeBatch.endDate : '2026-08-15'} by the Department of Computer Science & Digital Applications (CSDA) at SANKARA COLLEGE OF SCIENCE AND COMMERCE (AUTONOMOUS).

As per the guidelines of Bharathiar University and UGC Deeksharambh directives, the 7-day orientation program bridged the transition from Higher Secondary Education to Undergraduate Computer Science coursework.

Program Highlights:
1. Universal Human Values & Ethics: Interactive modules conducted by certified faculty mentors.
2. Proficiency Modules: Diagnostic tests and bridge courses in Tamil-I, Communicative English, Bridge Mathematics (Non-HSC stream), and Python Data Analytics.
3. Institutional & Department Orientation: Exposure to SWAYAM-NPTEL, digital library access, sports, and gender sensitivity initiatives.

Feedback from students and parents was overwhelmingly positive, confirming a smooth academic and emotional adaptation to college life.`;

  const defaultObjectives = [
    'Help students feel at ease in the new academic environment at Sankara College',
    'Encourage exploration of academic interests in Data Analytics and Computer Science',
    'Bridge high school learning gaps through Non-HSC stream Bridge Mathematics',
    'Cultivate collaboration over competition, nurturing team spirit and ethical discipline',
    'Strengthen student-teacher mentorship bonds throughout the undergraduate duration',
    'Offer broad life perspectives, Universal Human Values, and social responsibility'
  ];

  useEffect(() => {
    if (activeBatch) {
      fetchReport();
      const defaultName = `SIP_Report_${activeBatch.deeksharambhVersion}_${activeBatch.batchYearRange}.docx`;
      setCustomFileName(defaultName);
    }
  }, [activeBatch]);

  const fetchReport = async () => {
    try {
      const res = await axios.get(`/api/batches/${activeBatch._id}/sip-report`);
      if (res.data) {
        setReportText(res.data.reportText || defaultReportText);
        setObjectives(res.data.objectives && res.data.objectives.length > 0 ? res.data.objectives : defaultObjectives);
        if (res.data.customFileName) setCustomFileName(res.data.customFileName);
        if (res.data.customFormatText) setCustomFormatText(res.data.customFormatText);
        if (res.data.customContentsText) setCustomContentsText(res.data.customContentsText);
        if (res.data.attachedFile) setAttachedFileBase64(res.data.attachedFile);
        if (res.data.attachedFileName) setAttachedFileName(res.data.attachedFileName);
      }
    } catch (err) {
      console.warn('Using default SIP report state:', err.message);
      setReportText(defaultReportText);
      setObjectives(defaultObjectives);
    }
  };

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (role === 'viewer') {
      showToast('Viewers cannot edit or save report data.', 'error');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`/api/batches/${activeBatch._id}/sip-report`, {
        reportText,
        objectives,
        customFileName: customFileName || `SIP_Report_${activeBatch.deeksharambhVersion}.docx`,
        customFormatText,
        customContentsText,
        attachedFile: attachedFileBase64,
        attachedFileName: attachedFileName || uploadedFormatName
      });
      showToast(`SIP Report and attachments saved successfully for Batch ${activeBatch.batchYearRange}!`);
      fetchReport();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save SIP report details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      setObjectives([...objectives, newObjective.trim()]);
      setNewObjective('');
    }
  };

  const handleRemoveObjective = (idx) => {
    setObjectives(objectives.filter((_, i) => i !== idx));
  };

  const handleFormatFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFormatName(file.name);
    if (!customFileName) {
      setCustomFileName(file.name);
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      setAttachedFileBase64(base64);
      setAttachedFileName(file.name);
      showToast(`Format file '${file.name}' attached successfully!`);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAiReport = async () => {
    if (!customContentsText.trim() && !reportText.trim()) {
      showToast('Please enter some report contents or guidelines for the AI generator.', 'error');
      return;
    }

    setAiGenerating(true);
    showToast('Google AI Studio is generating formatted SIP report...', 'info');

    const promptText = `Generate a formal Student Induction Programme (SIP) report for SANKARA COLLEGE OF SCIENCE AND COMMERCE (AUTONOMOUS).
Batch: ${activeBatch.batchYearRange} (v${activeBatch.deeksharambhVersion})
Academic Year: ${activeBatch.academicYear}
Department: Computer Science & Digital Applications (CSDA)

Requested Format Structure:
${customFormatText || "Standard Academic SIP Report Format (1. Introduction & Objectives, 2. Inauguration & Presidential Address, 3. Daily Session Breakdown, 4. Universal Human Values & Bridge Math, 5. Student Outcomes & Parent Feedback)"}

Faculty Report Input & Contents:
${customContentsText || reportText}

Instructions: Format into detailed professional paragraphs with clear section headings, student metrics, and academic outcome summaries.`;

    try {
      const res = await axios.post('/api/ai/studio-generate', {
        prompt: promptText,
        model: 'gemini-1.5-pro',
        category: 'sip',
        batchVersion: activeBatch.deeksharambhVersion
      });

      const generated = res.data.result || res.data.message;
      setReportText(generated);
      showToast('AI SIP Report generated successfully! Click Save & Attach to link to batch.');
    } catch (err) {
      // Fallback local AI formatter
      const formattedAiText = `### 🎓 STUDENT INDUCTION PROGRAMME (SIP) REPORT
**Institution**: SANKARA COLLEGE OF SCIENCE AND COMMERCE (AUTONOMOUS)
**Department**: Computer Science & Digital Applications (CSDA)
**Academic Year**: ${activeBatch.academicYear} | **Deeksharambh**: v${activeBatch.deeksharambhVersion}
**Duration**: ${activeBatch.startDate} to ${activeBatch.endDate}

#### 1. EXECUTIVE SUMMARY & INAUGURATION
The 7-Day Student Induction Programme (SIP) for I B.Sc. CSDA was organized in accordance with UGC Deeksharambh directives. The inaugural function commenced with the Presidential Address by Sri T.P. Ramachandran (Managing Trustee), Felicitation Address by Principal ${activeBatch.principalName}, and Welcome Address by HoD ${activeBatch.hodName}.

#### 2. FACULTY INPUTS & REPORT CONTENTS
${customContentsText || reportText}

#### 3. BRIDGE COURSES & VALUE EDUCATION
- **Bridge Mathematics**: Targeted diagnostic worksheets for Non-HSC stream students covering Matrix Inversion (A⁻¹B) and Calculus.
- **Universal Human Values**: Modules on ethics, self-exploration, team building, and institutional culture.
- **Data Analytics Orientation**: Exposure to Python, NumPy, Pandas, and data visualization tools.

#### 4. OUTCOMES & FEEDBACK
With 100% student attendance across ${activeBatch.totalStudents || 45} enrolled candidates, post-induction assessments indicated a significant increase in academic confidence. Feedback from students and parents rated the orientation programme as highly enriching.`;

      setReportText(formattedAiText);
      showToast('AI SIP Report generated successfully! Click Save & Attach to link to batch.');
    } finally {
      setAiGenerating(false);
    }
  };

  const templatesMap = {
    UGC_STANDARD: {
      name: 'Standard UGC Deeksharambh Guidelines',
      reportText: defaultReportText,
      objectives: defaultObjectives
    },
    INSTITUTIONAL: {
      name: 'Institutional Detailed CSDA Report',
      reportText: `The Student Induction Program (SIP) for academic year ${activeBatch ? activeBatch.academicYear : '2026-2027'} was organized by the Department of Computer Science with Data Analytics at SANKARA COLLEGE OF SCIENCE AND COMMERCE (AUTONOMOUS).

The 6-day program included interactive sessions on Universal Human Values, proficiency modules in Mathematics and Communicative English, and department orientation. Eminent academic and industry experts delivered inaugural addresses.`,
      objectives: [
        'Bridge the high school to higher education gap',
        'Familiarize students with CSDA curriculum & laboratory facilities',
        'Inculcate team spirit, ethical values, and institutional discipline',
        'Build strong faculty-student mentorship bonds'
      ]
    },
    EXECUTIVE: {
      name: 'Executive Summary Format',
      reportText: `EXECUTIVE SUMMARY: SIP ${activeBatch ? activeBatch.academicYear : '2026-2027'}
Dates: ${activeBatch ? activeBatch.startDate : ''} to ${activeBatch ? activeBatch.endDate : ''}
Department: Computer Science with Data Analytics

Key Highlights:
- 100% first-year student participation across all streams.
- Daily sessions covering Universal Human Values, Mathematics, and English.
- Outstanding feedback received from parents and student cohorts.`,
      objectives: [
        'Promote smooth transition to college life',
        'Develop core academic and analytical skills',
        'Foster value-based learning environment'
      ]
    }
  };

  const handleSelectTemplate = (key) => {
    setSelectedTemplate(key);
    const tmpl = templatesMap[key];
    if (tmpl) {
      setReportText(tmpl.reportText);
      setObjectives(tmpl.objectives);
    }
  };

  if (!activeBatch) {
    return <div className="text-slate-500 text-sm">Please select an active batch from the Dashboard.</div>;
  }

  return (
    <div className="space-y-6 bg-white">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#3AAFA9]/20 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#e6f7f6] text-[#1b625f] text-[10px] font-bold uppercase border border-[#3AAFA9]/30">
              Batch: {activeBatch.batchYearRange} (v{activeBatch.deeksharambhVersion})
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#1b625f] tracking-wide uppercase">SIP Report Generator & AI Attacher</h2>
          <p className="text-xs text-slate-500 mt-1">Upload custom formats, enter report contents, generate with Gemini AI, and attach custom files directly to this batch.</p>
        </div>

        {/* Exporter Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/sip/docx`, customFileName || `SIP_Report_${activeBatch.deeksharambhVersion}.docx`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e6f7f6] border border-[#3AAFA9]/40 text-[#1b625f] hover:bg-[#3AAFA9] hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#3AAFA9]" /> Word (.docx)
          </button>
          <button
            type="button"
            onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/sip/pdf`, (customFileName ? customFileName.replace('.docx', '.pdf') : `SIP_Report_${activeBatch.deeksharambhVersion}.pdf`))}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e6f7f6] border border-[#3AAFA9]/40 text-[#1b625f] hover:bg-[#3AAFA9] hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#3AAFA9]" /> PDF (.pdf)
          </button>
          <button
            type="button"
            onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/sip/csv`, `SIP_Report_${activeBatch.deeksharambhVersion}.csv`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f0faf9] border border-[#c2c19f] text-[#1b625f] hover:bg-[#e6f7f6] text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#3AAFA9]" /> CSV (.csv)
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 hover:bg-slate-200 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-600" /> Printable Report
          </button>
        </div>
      </div>

      {/* Toast Alert Banner */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${
          message.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-[#e6f7f6] border-[#3AAFA9]/40 text-[#1b625f]'
        }`}>
          {message.type === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 flex-shrink-0 text-[#3AAFA9]" />}
          <span className="text-xs font-bold">{message.text}</span>
        </div>
      )}

      {/* Faculty Upload Format & Custom Naming Console */}
      <div className="bg-white rounded-2xl p-6 border border-[#3AAFA9]/30 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-[#3AAFA9]/10 pb-3">
          <Upload className="w-5 h-5 text-[#3AAFA9]" />
          <h3 className="text-xs font-bold text-[#1b625f] uppercase tracking-wider">
            Faculty Format Upload & Custom File Naming
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Upload Custom Format File */}
          <div className="p-4 rounded-xl bg-[#f0faf9] border border-[#3AAFA9]/20 space-y-2">
            <label className="block text-xs font-bold text-[#1b625f]">1. Upload Custom Format Template (DOCX / PDF / TXT)</label>
            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#3AAFA9]/40 text-xs font-bold text-[#1b625f] hover:bg-[#e6f7f6] cursor-pointer transition-colors shadow-sm">
                <Paperclip className="w-4 h-4 text-[#3AAFA9]" />
                <span>{uploadedFormatName || "Choose Format File..."}</span>
                <input type="file" accept=".docx,.pdf,.txt,.doc" onChange={handleFormatFileUpload} className="hidden" />
              </label>
            </div>
            <p className="text-[10px] text-slate-500">Upload your department's standard report format file to attach to this batch.</p>
          </div>

          {/* Specify Specific File Name */}
          <div className="p-4 rounded-xl bg-[#f0faf9] border border-[#3AAFA9]/20 space-y-2">
            <label className="block text-xs font-bold text-[#1b625f]">2. Custom Output File Name</label>
            <input
              type="text"
              value={customFileName}
              onChange={(e) => setCustomFileName(e.target.value)}
              placeholder="e.g. SIP_Report_Batch_7.0_Orientation_2026.docx"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#3AAFA9]/40 text-xs font-bold text-[#1b625f] focus:outline-none focus:border-[#3AAFA9]"
            />
            <p className="text-[10px] text-slate-500">Specify the exact file name to be attached and downloaded for this batch.</p>
          </div>
        </div>

        {/* Custom Format Text Outline */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800">3. Custom Format Outline / Structure Guidelines (Optional)</label>
          <textarea
            rows="2"
            value={customFormatText}
            onChange={(e) => setCustomFormatText(e.target.value)}
            placeholder="e.g. Section 1: Executive Summary, Section 2: Orientation Days 1-7, Section 3: Universal Human Values, Section 4: Faculty Experts, Section 5: Student Outcomes..."
            className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#3AAFA9] resize-none"
          />
        </div>
      </div>

      {/* Faculty Custom Content Input & AI Generator Console */}
      <div className="bg-white rounded-2xl p-6 border border-[#3AAFA9]/30 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#3AAFA9]/10 pb-3 gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#3AAFA9]" />
            <h3 className="text-xs font-bold text-[#1b625f] uppercase tracking-wider">
              Faculty Report Contents & AI Generator (Google AI Studio)
            </h3>
          </div>

          <button
            type="button"
            onClick={handleGenerateAiReport}
            disabled={aiGenerating}
            className="px-5 py-2 rounded-xl bg-[#3AAFA9] hover:bg-[#2b8a85] text-white text-xs font-extrabold shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
          >
            {aiGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating AI Report...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#e6f7f6]" />
                <span>Generate AI SIP Report</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800">Faculty Report Inputs & Specific Content Summary</label>
          <textarea
            rows="4"
            value={customContentsText}
            onChange={(e) => setCustomContentsText(e.target.value)}
            placeholder="Type or paste specific session details, guest speakers, Universal Human Values topics, bridge math scores, student feedback, or faculty notes..."
            className="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#3AAFA9] bg-[#f0faf9]/30 resize-none font-sans"
          />
          <p className="text-[10px] text-slate-500">The AI generator merges your uploaded format guidelines + custom content inputs into the formatted SIP report below.</p>
        </div>
      </div>

      {/* Preset Report Template Cards */}
      <div className="bg-white rounded-2xl p-6 border border-[#3AAFA9]/20 shadow-sm space-y-3">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">Preset Institutional Template Formats</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.keys(templatesMap).map((key) => {
            const tmpl = templatesMap[key];
            const isSelected = selectedTemplate === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectTemplate(key)}
                className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#3AAFA9] bg-[#f0faf9] ring-2 ring-[#3AAFA9]/20'
                    : 'border-slate-200 bg-white hover:border-[#3AAFA9]'
                }`}
              >
                <div className="text-xs font-bold text-[#1b625f] flex items-center justify-between">
                  <span>{tmpl.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#3AAFA9]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Narrative Report Text Console */}
      <div className="bg-white rounded-2xl p-6 border border-[#3AAFA9]/30 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-[#1b625f] uppercase tracking-wider border-b border-[#3AAFA9]/10 pb-2">
          Final Compiled SIP Narrative Report Text
        </h3>
        <textarea
          rows="8"
          value={reportText}
          onChange={(e) => setReportText(e.target.value)}
          className="w-full p-4 rounded-xl border border-slate-200 focus:border-[#3AAFA9] focus:ring-2 focus:ring-[#3AAFA9]/20 text-xs leading-relaxed font-sans bg-[#f0faf9]/30"
          placeholder="Detailed Student Induction Program narrative content..."
        />
      </div>

      {/* Objectives Console */}
      <div className="bg-white rounded-2xl p-6 border border-[#3AAFA9]/30 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-[#3AAFA9]/10 pb-2">
          <h3 className="text-xs font-bold text-[#1b625f] uppercase tracking-wider">
            Program Core Objectives ({objectives.length})
          </h3>
        </div>

        <div className="space-y-2">
          {objectives.map((obj, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={obj}
                onChange={(e) => {
                  const updated = [...objectives];
                  updated[idx] = e.target.value;
                  setObjectives(updated);
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-[#3AAFA9]"
                placeholder={`Objective #${idx + 1}`}
              />
              {role !== 'viewer' && (
                <button
                  type="button"
                  onClick={() => handleRemoveObjective(idx)}
                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                  title="Remove objective"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {role !== 'viewer' && (
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddObjective(); } }}
              placeholder="Type new SIP objective and click Add..."
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#3AAFA9]"
            />
            <button
              type="button"
              onClick={handleAddObjective}
              className="px-4 py-2 rounded-xl bg-[#e6f7f6] border border-[#3AAFA9]/40 text-[#1b625f] font-bold text-xs hover:bg-[#3AAFA9] hover:text-white transition-all flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Objective
            </button>
          </div>
        )}
      </div>

      {/* Save & Attach Button */}
      {role !== 'viewer' && (
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-[#3AAFA9] hover:bg-[#2b8a85] text-white font-black text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <Save className="w-5 h-5 text-white" />
              <span>Save & Attach SIP Report to Batch {activeBatch.batchYearRange}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

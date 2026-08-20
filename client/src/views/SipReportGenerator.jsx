import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, FileText, Download, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { downloadFile } from '../utils/downloadHelper';

export default function SipReportGenerator({ activeBatch, role }) {
  const [reportText, setReportText] = useState('');
  const [objectives, setObjectives] = useState([]);
  const [newObjective, setNewObjective] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const defaultReportText = `The Student Induction Program for the newly admitted first-year students for the academic year ${activeBatch ? activeBatch.academicYear : ''} was conducted from ${activeBatch ? activeBatch.startDate : ''} to ${activeBatch ? activeBatch.endDate : ''}. Eminent personalities from various fields were invited to address the students throughout the program.

As per the guidelines of Bharathiar University, the Induction Program is organized every year before the commencement of regular first-semester classes, facilitated by trained faculty members.

The objective of the program is to bridge the gap between higher secondary education and undergraduate studies, providing students with a solid foundation in Applied Science and English at a moderate level. This ensures that students transition smoothly into the academic rigors of regular coursework.

Spanning six days, the program offers meaningful exposure to Universal Human Values, alongside various co-curricular and extra-curricular activities. It serves as an ideal platform for students to shed initial hesitation, engage confidently, and build strong bonds with faculty members.

Over the years, this Student Induction Programme has made a noticeable impact on the overall performance of students. Feedback from students and parents alike has been overwhelmingly positive. This initiative continues to play a vital role in ensuring a smooth academic and emotional transition for incoming students.`;

  const defaultObjectives = [
    'Help students feel at ease in the new academic environment',
    'Encourage exploration of academic interests and institutional activities',
    'Cultivate collaboration over competition, nurturing a drive for excellence',
    'Strengthen the student-teacher bond',
    'Offer a broader perspective on life, values, and responsibility',
    'Shape character and instill life-enriching values'
  ];

  useEffect(() => {
    if (activeBatch) {
      fetchReport();
    }
  }, [activeBatch]);

  const fetchReport = async () => {
    try {
      const res = await axios.get(`/api/batches/${activeBatch._id}/sip-report`);
      if (res.data.reportText) {
        setReportText(res.data.reportText);
      } else {
        setReportText(defaultReportText);
      }

      if (res.data.objectives && res.data.objectives.length > 0) {
        setObjectives(res.data.objectives);
      } else {
        setObjectives(defaultObjectives);
      }
    } catch (err) {
      console.error('Error fetching SIP report:', err);
    }
  };

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (role === 'viewer') {
      showToast('Viewers cannot edit the report.', 'error');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`/api/batches/${activeBatch._id}/sip-report`, {
        reportText,
        objectives
      });
      showToast('SIP Report details updated and saved successfully!');
      fetchReport();
    } catch (err) {
      showToast('Failed to save report details', 'error');
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

  const [selectedTemplate, setSelectedTemplate] = useState('UGC_STANDARD');

  const templatesMap = {
    UGC_STANDARD: {
      label: 'Standard UGC Deeksharambh Guidelines',
      reportText: defaultReportText,
      objectives: defaultObjectives
    },
    INSTITUTIONAL: {
      label: 'Institutional Detailed Department Report',
      reportText: `The Student Induction Program (SIP) for academic year ${activeBatch ? activeBatch.academicYear : ''} was organized by the Department of Computer Science with Data Analytics at Sankara College of Science and Commerce.

The 6-day program included interactive sessions on Universal Human Values, proficiency modules in Mathematics and Communicative English, and department orientation. Eminent academic and industry experts delivered inaugural addresses.`,
      objectives: [
        'Bridge the high school to higher education gap',
        'Familiarize students with CSDA curriculum & laboratory facilities',
        'Inculcate team spirit, ethical values, and institutional discipline',
        'Build strong faculty-student mentorship bonds'
      ]
    },
    EXECUTIVE: {
      label: 'Executive Summary Format',
      reportText: `EXECUTIVE SUMMARY: SIP ${activeBatch ? activeBatch.academicYear : ''}
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

  const handleTemplateChange = (tmplKey) => {
    setSelectedTemplate(tmplKey);
    const tmpl = templatesMap[tmplKey];
    if (tmpl) {
      setReportText(tmpl.reportText);
      setObjectives(tmpl.objectives);
    }
  };

  if (!activeBatch) {
    return <div className="text-slate-500 text-sm">Please select a batch from the Dashboard.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-sky-100 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-wide uppercase">SIP Narrative Report & Exporter</h2>
          <p className="text-xs text-slate-500 mt-1">Compose Student Induction Program reports, choose templates, and export into Word, PDF, CSV, or Printable Report.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/sip/docx`, `SIP_Report_${activeBatch.batchYearRange}.docx`)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" /> Word (.docx)
          </button>
          <button
            type="button"
            onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/sip/pdf`, `SIP_Report_${activeBatch.batchYearRange}.pdf`)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" /> PDF (.pdf)
          </button>
          <button
            type="button"
            onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/sip/csv`, `SIP_Report_${activeBatch.batchYearRange}.csv`)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" /> CSV (.csv)
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4" /> Printable Report
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${
          message.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Template Chooser Bar */}
      <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Choose Report Template:</span>
          <select
            value={selectedTemplate}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-sky-200 text-xs font-semibold text-slate-800 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="UGC_STANDARD">Standard UGC Deeksharambh Guidelines</option>
            <option value="INSTITUTIONAL">Institutional Detailed Department Report</option>
            <option value="EXECUTIVE">Executive Summary Format</option>
          </select>
        </div>
        <span className="text-xs text-sky-700 font-medium">Selected Template: {templatesMap[selectedTemplate].label}</span>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Narrative Paragraph Editor */}
        <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-sky-100 pb-2">Narrative Document Text</h3>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Introduction and Overview Content</label>
            <textarea
              rows="10"
              disabled={role === 'viewer'}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-slate-50 text-xs leading-relaxed focus:ring-2 focus:ring-sky-500 focus:outline-none"
              placeholder="Enter narrative report paragraphs..."
            ></textarea>
          </div>
        </div>

        {/* Objectives Builder */}
        <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-sky-100 pb-2">Program Objectives</h3>
          
          {role !== 'viewer' && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-sky-200 bg-slate-50 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="e.g. Cultivate team collaboration skills"
              />
              <button
                type="button"
                onClick={handleAddObjective}
                className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700 transition-all flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Objective
              </button>
            </div>
          )}

          <div className="space-y-2 mt-4">
            {objectives.map((obj, idx) => (
              <div key={idx} className="flex justify-between items-center px-4 py-2.5 bg-slate-50 border border-sky-100 rounded-xl text-xs font-medium text-slate-800 shadow-xs">
                <span>• {obj}</span>
                {role !== 'viewer' && (
                  <button
                    type="button"
                    onClick={() => handleRemoveObjective(idx)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {role !== 'viewer' && (
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save SIP Report Content</span>
              </>
            )}
          </button>
        )}
      </form>
    </div>
  );
}

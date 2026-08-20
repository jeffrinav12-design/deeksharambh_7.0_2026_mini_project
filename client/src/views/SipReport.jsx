import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Check, Download, FileText } from 'lucide-react';
import { downloadFile } from '../utils/downloadHelper';

export default function SipReport({ activeBatch }) {
  const [reportText, setReportText] = useState('');
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
        setObjectives(res.data.objectives || []);
      } else {
        // Load default text
        const defaultText = `The Student Induction Program for the newly admitted first-year students for the academic year ${activeBatch.academicYear} was conducted from ${activeBatch.startDate} to ${activeBatch.endDate}. Eminent personalities from various fields were invited to address the students throughout the program.

As per the guidelines of Bharathiar University, the Induction Program is organized every year before the commencement of regular first-semester classes, facilitated by trained faculty members.

The objective of the program is to bridge the gap between higher secondary education and undergraduate studies, providing students with a solid foundation in Applied Science and English at a moderate level. This ensures that students transition smoothly into the academic rigors of regular coursework.

Spanning eight days, the program offers meaningful exposure to Universal Human Values, alongside various co-curricular and extra-curricular activities. It serves as an ideal platform for students to shed initial hesitation, engage confidently, and build strong bonds with faculty members.

Over the years, this Student Induction Programme has made a noticeable impact on the overall performance of students. Feedback from students and parents alike has been overwhelmingly positive. This initiative continues to play a vital role in ensuring a smooth academic and emotional transition for incoming students.`;

        const defaultObjectives = [
          "Help students feel at ease in the new academic environment",
          "Encourage exploration of academic interests and institutional activities",
          "Cultivate collaboration over competition, nurturing a drive for excellence",
          "Strengthen the student-teacher bond",
          "Offer a broader perspective on life, values, and responsibility",
          "Shape character and instill life-enriching values"
        ];

        setReportText(defaultText);
        setObjectives(defaultObjectives);
      }
    } catch (err) {
      console.error("Error fetching SIP report:", err);
    }
  };

  const handleObjectiveChange = (index, value) => {
    const list = [...objectives];
    list[index] = value;
    setObjectives(list);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);

    try {
      await axios.post(`/api/batches/${activeBatch._id}/sip-report`, {
        reportText,
        objectives: objectives.filter(o => o.trim())
      });
      setSaveSuccess(true);
    } catch (err) {
      alert("Error saving SIP report: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!activeBatch) {
    return <div className="text-gray-400 text-sm">Please select a batch from the Dashboard.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">Student Induction Programme (SIP) Report</h2>
          <p className="text-xs text-gray-400 mt-1">Review, compile, and download the annual induction narrative report page.</p>
        </div>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/sip/docx`, `SIP_Report_${activeBatch.batchYearRange}.docx`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-white" /> Word Doc
          </button>
          <button 
            type="button"
            onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/sip/pdf`, `SIP_Report_${activeBatch.batchYearRange}.pdf`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-white" /> PDF Doc
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="glass-card p-8 rounded-2xl border border-white/5 space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <FileText className="w-5 h-5 text-gold" />
          <h3 className="text-base font-bold text-white uppercase tracking-wider">Induction Report Editor</h3>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2">Narrative Report Paragraphs</label>
          <textarea
            required
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            rows={12}
            className="w-full px-4 py-3 rounded-lg glass-input text-xs font-serif leading-relaxed"
            placeholder="Report paragraphs..."
          />
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-gray-300">Objectives Bullet List</label>
          {objectives.map((obj, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-gold font-bold text-xs">•</span>
              <input
                type="text"
                required
                value={obj}
                onChange={(e) => handleObjectiveChange(i, e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg glass-input text-xs"
                placeholder={`Objective ${i+1}`}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center border-t border-white/5 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-gold text-navy-dark font-bold text-xs hover:bg-yellow-400 disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Report Content</span>
          </button>

          {saveSuccess && (
            <span className="text-xs text-green-400 font-semibold animate-pulse">
              ✓ Narrative details successfully saved.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

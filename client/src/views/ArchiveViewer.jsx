import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Calendar, BookOpen, Users, CheckSquare, FileQuestion, 
  BarChart3, FileText, Image as ImageIcon, Download, Eye, Mail 
} from 'lucide-react';
import { downloadFile } from '../utils/downloadHelper';

export default function ArchiveViewer({ activeBatch }) {
  const [activeTab, setActiveTab] = useState('schedule');
  const [scheduleData, setScheduleData] = useState({ slots: [], abbreviations: [] });
  const [syllabi, setSyllabi] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [resultsData, setResultsData] = useState({ results: [], rangeSummary: [] });
  const [sipReport, setSipReport] = useState({ reportText: "", objectives: [] });
  const [photos, setPhotos] = useState([]);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeBatch) {
      loadTabData(activeTab);
    }
  }, [activeBatch, activeTab]);

  const loadTabData = async (tab) => {
    setLoading(true);
    try {
      if (tab === 'schedule') {
        const res = await axios.get(`/api/batches/${activeBatch._id}/schedule`);
        setScheduleData(res.data);
      } else if (tab === 'syllabus') {
        const res = await axios.get(`/api/batches/${activeBatch._id}/syllabi`);
        setSyllabi(res.data);
      } else if (tab === 'students') {
        const res = await axios.get(`/api/batches/${activeBatch._id}/students`);
        setStudents(res.data);
      } else if (tab === 'attendance') {
        const res = await axios.get(`/api/batches/${activeBatch._id}/students`);
        const attRes = await axios.get(`/api/batches/${activeBatch._id}/attendance`);
        setStudents(res.data);
        setAttendance(attRes.data);
      } else if (tab === 'assessment') {
        const res = await axios.get(`/api/batches/${activeBatch._id}/questions`);
        setQuestions(res.data);
      } else if (tab === 'results') {
        const res = await axios.get(`/api/batches/${activeBatch._id}/results`);
        setResultsData(res.data);
      } else if (tab === 'sip') {
        const res = await axios.get(`/api/batches/${activeBatch._id}/sip-report`);
        setSipReport(res.data);
      } else if (tab === 'photos') {
        const res = await axios.get(`/api/batches/${activeBatch._id}/photos`);
        setPhotos(res.data);
      }
    } catch (err) {
      console.error(`Error loading archive data for ${tab}:`, err);
    } finally {
      setLoading(false);
    }
  };

  if (!activeBatch) {
    return <div className="text-gray-400 text-sm">Please select a batch from the Dashboard first.</div>;
  }

  const tabs = [
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: CheckSquare },
    { id: 'assessment', label: 'Assessment Questions', icon: FileQuestion },
    { id: 'results', label: 'Results & Chart', icon: BarChart3 },
    { id: 'sip', label: 'SIP Report', icon: FileText },
    { id: 'photos', label: 'Photo Gallery', icon: ImageIcon },
    { id: 'invitation', label: 'Invitation Card', icon: Mail },
  ];

  return (
    <div className="space-y-6">
      {/* Archive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-card rounded-xl border border-white/5">
        <div>
          <span className="text-xs font-semibold text-gold uppercase tracking-wider">Archived batch records</span>
          <h2 className="text-xl font-bold text-white mt-1">
            Deeksharambh {activeBatch.deeksharambhVersion} — AY {activeBatch.academicYear}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Conducted by HoD {activeBatch.hodName} | Principal {activeBatch.principalName}
          </p>
        </div>
        <div className="text-right text-xs text-gray-400">
          <div>Start: {activeBatch.startDate}</div>
          <div>End: {activeBatch.endDate}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto space-x-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-all duration-150 ${
              activeTab === tab.id 
                ? 'border-gold text-gold bg-gold/5' 
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="glass-card p-6 rounded-xl border border-white/5">
          
          {/* TAB 1: SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white text-base">Timetable Grid</h3>
                <button 
                  onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/schedule`, `Schedule_${activeBatch.batchYearRange}.docx`)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 shadow cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-white" /> Export Schedule
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full styled-table text-xs text-left">
                  <thead>
                    <tr>
                      <th className="p-3">Day Order</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Period I (9.45-10.35)</th>
                      <th className="p-3">Period II (10.35-11.25)</th>
                      <th className="p-3">Period III (11.40-12.30)</th>
                      <th className="p-3">Period IV (1.15-1.55)</th>
                      <th className="p-3">Period V (1.55-2.50)</th>
                      <th className="p-3">Period VI (2.50-3.45)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleData.slots.map((slot, idx) => (
                      <tr key={idx} className="hover:bg-white/5">
                        <td className="p-3 font-semibold text-gold">{slot.dayOrder}</td>
                        <td className="p-3 text-white">{slot.date}</td>
                        <td className="p-3 text-gray-300">{slot.periods.I || "-"}</td>
                        <td className="p-3 text-gray-300">{slot.periods.II || "-"}</td>
                        <td className="p-3 text-gray-300">{slot.periods.III || "-"}</td>
                        <td className="p-3 text-gray-300">{slot.periods.IV || "-"}</td>
                        <td className="p-3 text-gray-300">{slot.periods.V || "-"}</td>
                        <td className="p-3 text-gray-300">{slot.periods.VI || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="font-bold text-white text-base mt-8">Abbreviation Legend & Faculty Table</h3>
              <div className="overflow-x-auto">
                <table className="w-full styled-table text-xs text-left">
                  <thead>
                    <tr>
                      <th className="p-3">S.No</th>
                      <th className="p-3">Abbreviation</th>
                      <th className="p-3">Particulars</th>
                      <th className="p-3">Faculty Assigned</th>
                      <th className="p-3">Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleData.abbreviations.map((ab, idx) => (
                      <tr key={idx} className="hover:bg-white/5">
                        <td className="p-3 text-gray-300">{ab.sNo || idx+1}</td>
                        <td className="p-3 text-gold font-bold">{ab.abbreviation}</td>
                        <td className="p-3 text-white">{ab.particulars}</td>
                        <td className="p-3 text-gray-300">{ab.facultyName}</td>
                        <td className="p-3 text-gray-300">{ab.noOfHours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: SYLLABUS */}
          {activeTab === 'syllabus' && (
            <div className="space-y-6">
              <h3 className="font-bold text-white text-base">Syllabus per Subject</h3>
              <div className="grid grid-cols-1 gap-6">
                {syllabi.map((s, idx) => (
                  <div key={idx} className="p-5 rounded-xl bg-navy-dark/40 border border-white/5 space-y-4">
                    <div className="flex justify-between items-start border-b border-white/5 pb-3">
                      <div>
                        <h4 className="text-gold font-bold text-base">{s.subjectName}</h4>
                        <p className="text-xs text-gray-400 mt-1">{s.departmentName} | Hours: {s.hours}</p>
                        <p className="text-[10px] text-gray-500 uppercase mt-0.5">Stream: {s.mathsStream === 'ALL' ? 'ALL' : s.mathsStream === 'M' ? 'Maths' : 'Non-Maths'}</p>
                      </div>
                      <button 
                        onClick={() => downloadFile(`/api/syllabi/${s._id}/export`, `Syllabus_${s.subjectName.replace(/\s+/g, '_')}.docx`)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-600 text-white text-[10px] font-bold hover:bg-sky-700 shadow-sm cursor-pointer"
                      >
                        <Download className="w-3 h-3 text-white" /> Export DOCX
                      </button>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider">Objectives:</h5>
                      <ul className="list-disc pl-5 text-xs text-gray-300 mt-1 space-y-1">
                        {s.objectives.map((obj, i) => <li key={i}>{obj}</li>)}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h5 className="text-xs font-bold text-white uppercase tracking-wider">Units Content:</h5>
                      {s.units.map((unit, i) => (
                        <div key={i} className="text-xs">
                          <strong className="text-gold">{unit.unitNo || `Unit ${i+1}`}: {unit.title}</strong>
                          <p className="text-gray-300 mt-1 leading-relaxed">{unit.content}</p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-white/5 pt-3 grid grid-cols-3 text-xs text-gray-400">
                      <div><strong>Staff Incharge:</strong> {s.staffIncharge}</div>
                      <div><strong>Subject Expert:</strong> {s.subjectExpert?.name}</div>
                      <div><strong>HOD Name:</strong> {s.hodName}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: STUDENTS */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white text-base">Student List</h3>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/students?type=Full`, `StudentList_Full_${activeBatch.batchYearRange}.docx`)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 shadow cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-white" /> Full List
                  </button>
                  <button 
                    onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/students?type=Maths`, `StudentList_Maths_${activeBatch.batchYearRange}.docx`)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-white" /> Maths Students
                  </button>
                  <button 
                    onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/students?type=NonMaths`, `StudentList_NonMaths_${activeBatch.batchYearRange}.docx`)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 shadow cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-white" /> Non-Maths List
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-gold text-sm border-b border-white/5 pb-2 mb-3">Maths Students (M)</h4>
                  <div className="max-h-[400px] overflow-y-auto space-y-1.5 pr-2">
                    {students.filter(s => s.mathsStream === 'M').map(s => (
                      <div key={s._id} className="flex justify-between p-2.5 rounded bg-white/5 text-xs">
                        <span className="text-gray-300 font-medium">{s.sNo}. {s.name}</span>
                        <span className="text-gold font-bold">{s.mathsStream}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gold text-sm border-b border-white/5 pb-2 mb-3">Non-Maths Students (NM)</h4>
                  <div className="max-h-[400px] overflow-y-auto space-y-1.5 pr-2">
                    {students.filter(s => s.mathsStream === 'NM').map(s => (
                      <div key={s._id} className="flex justify-between p-2.5 rounded bg-white/5 text-xs">
                        <span className="text-gray-300 font-medium">{s.sNo}. {s.name}</span>
                        <span className="text-yellow-500 font-bold">{s.mathsStream}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white text-base">Date-wise Attendance Grid</h3>
                <button 
                  onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/attendance`, `AttendanceSheet_${activeBatch.batchYearRange}.docx`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-white" /> Export Sheet
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full styled-table text-xs text-left">
                  <thead>
                    <tr>
                      <th className="p-3">S.No</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Stream</th>
                      {Array.from(new Set(attendance.map(a => a.date))).sort().map(d => (
                        <th key={d} className="p-3">{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(st => {
                      const dates = Array.from(new Set(attendance.map(a => a.date))).sort();
                      return (
                        <tr key={st._id} className="hover:bg-white/5 border-b border-white/5">
                          <td className="p-3 text-gray-400">{st.sNo}</td>
                          <td className="p-3 text-white font-medium">{st.name}</td>
                          <td className="p-3 text-gray-400">{st.mathsStream}</td>
                          {dates.map(date => {
                            const rec = attendance.find(a => a.studentId === st._id && a.date === date);
                            const status = rec ? rec.status : 'P';
                            return (
                              <td key={date} className="p-3">
                                <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                                  status === 'P' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                  {status}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: ASSESSMENT BANK */}
          {activeTab === 'assessment' && (
            <div className="space-y-6">
              <h3 className="font-bold text-white text-base">MCQ Question Bank</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {questions.map((q, idx) => (
                  <div key={q._id} className="p-5 rounded-xl bg-navy-dark/40 border border-white/5 space-y-3 text-xs">
                    <div className="flex justify-between items-start border-b border-white/5 pb-2">
                      <span className="text-gold font-bold">Q.{idx+1} ({q.subject})</span>
                      <span className="text-[10px] text-gray-400 uppercase">Stream: {q.mathsStream}</span>
                    </div>
                    <p className="text-white font-medium leading-relaxed">{q.questionText}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-gray-300">
                      <div>A. {q.optionA}</div>
                      <div>B. {q.optionB}</div>
                      <div>C. {q.optionC}</div>
                      <div>D. {q.optionD}</div>
                    </div>
                    <div className="text-[10px] text-green-400 font-bold bg-green-500/5 border border-green-500/15 p-2 rounded">
                      Correct Option: {q.correctAnswer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: RESULTS & CHART */}
          {activeTab === 'results' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white text-base">Result Analysis Scorecard</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/results/docx`, `ResultAnalysis_${activeBatch.batchYearRange}.docx`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-white" /> Word Report
                  </button>
                  <button 
                    onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/results/pdf`, `ResultAnalysis_${activeBatch.batchYearRange}.pdf`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-white" /> PDF Report
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full styled-table text-xs text-left">
                  <thead>
                    <tr>
                      <th className="p-3">S.No</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Tamil</th>
                      <th className="p-3">English</th>
                      <th className="p-3">Maths</th>
                      <th className="p-3">Core</th>
                      <th className="p-3">Total Marks</th>
                      <th className="p-3">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultsData.results.map(res => (
                      <tr key={res.sNo} className="hover:bg-white/5 border-b border-white/5">
                        <td className="p-3 text-gray-400">{res.sNo}</td>
                        <td className="p-3 text-white font-medium">{res.name}</td>
                        <td className="p-3 text-gray-300">{res.tamil}</td>
                        <td className="p-3 text-gray-300">{res.english}</td>
                        <td className="p-3 text-gray-300">{res.maths}</td>
                        <td className="p-3 text-gray-300">{res.core}</td>
                        <td className="p-3 text-white font-bold">{res.isAbsent ? 0 : res.total}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                            res.isAbsent 
                              ? 'bg-red-500/10 text-red-400 border border-red-500/25'
                              : Number(res.percentage) >= 70
                              ? 'bg-green-500/10 text-green-400 border border-green-500/25'
                              : Number(res.percentage) >= 50
                              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25'
                              : 'bg-red-500/10 text-red-400 border border-red-500/25'
                          }`}>
                            {res.percentage === 'AB' ? 'AB' : `${res.percentage}%`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Ranges and Recharts Visualizer */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                <div>
                  <h4 className="font-bold text-white text-sm border-b border-white/5 pb-2 mb-4">Result Range Summary</h4>
                  <table className="w-full styled-table text-xs text-left">
                    <thead>
                      <tr>
                        <th className="p-3">Range Category</th>
                        <th className="p-3">No. of Students</th>
                        <th className="p-3">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultsData.rangeSummary.map((r, idx) => (
                        <tr key={idx} className="hover:bg-white/5 border-b border-white/5">
                          <td className="p-3 text-gold font-bold">{r.range}</td>
                          <td className="p-3 text-white">{r.count}</td>
                          <td className="p-3 text-gray-300">{r.percent}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-4 text-[10px] text-gray-400 italic">
                    Note: "THOSE WHO GOT 70 AND ABOVE ARE THE ADVANCED LEARNERS AND OTHERS ARE SLOW LEARNERS."
                  </p>
                </div>

                <div className="glass-card p-5 rounded-xl border border-white/5">
                  <h4 className="font-bold text-white text-sm mb-4">Visual Analytics Chart</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={resultsData.rangeSummary} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="range" stroke="#9ca3af" fontSize={10} />
                        <YAxis stroke="#9ca3af" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0d1340', borderColor: '#FFD700', color: '#fff' }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="count" name="Students Count" fill="#FFD700" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="percent" name="Students Percentage" fill="#2a36b1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SIP REPORT */}
          {activeTab === 'sip' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white text-base">Student Induction Program Report</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/sip/docx`, `SIP_Report_${activeBatch.batchYearRange}.docx`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-white" /> Word Report
                  </button>
                  <button 
                    onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/sip/pdf`, `SIP_Report_${activeBatch.batchYearRange}.pdf`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-white" /> PDF Report
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-navy-dark/40 border border-white/5 space-y-6 text-sm leading-relaxed text-gray-200">
                <div className="text-center font-serif space-y-1">
                  <h4 className="font-bold text-white text-lg">STUDENT INDUCTION PROGRAMME</h4>
                  <p className="text-gold text-sm font-bold">Deeksharambh {activeBatch.deeksharambhVersion}</p>
                  <p className="text-gray-400 text-xs">Department of Computer Science with Data Analytics</p>
                </div>

                <p className="whitespace-pre-line font-serif text-justify">{sipReport.reportText}</p>

                <div className="space-y-2 font-serif">
                  <h5 className="font-bold text-white text-sm">Objectives of the SIP:</h5>
                  <ul className="list-disc pl-6 space-y-1 text-gray-300">
                    {(sipReport.objectives || []).map((obj, i) => <li key={i}>{obj}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: PHOTO GALLERY */}
          {activeTab === 'photos' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white text-base">Fleeting Views of Bridge Courses</h3>
                <button 
                  onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/photos`, `PhotoGallery_${activeBatch.batchYearRange}.docx`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 shadow-sm cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-white" /> Export Album
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {photos.map((p, idx) => (
                  <div key={p._id || idx} className="p-4 rounded-xl bg-navy-dark/40 border border-white/5 space-y-3 relative group">
                    {/* Image Box */}
                    <div className="aspect-video w-full rounded-lg bg-navy/80 flex items-center justify-center border border-white/5 overflow-hidden relative">
                      {p.url ? (
                        <img src={p.url} alt={p.caption} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-500 text-xs">Mock Image Reference</span>
                      )}
                      
                      {/* GPS Overlay Camera watermark emulation */}
                      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm p-2 rounded text-[8px] font-mono text-green-400 space-y-0.5 max-w-[280px] pointer-events-none">
                        <div>Coimbatore, Tamil Nadu, India</div>
                        <div>GPS Map: Lat {p.gpsOverlayText?.split(',')[0] || "11.0852° N"}, Long {p.gpsOverlayText?.split(',')[1] || "76.9847° E"}</div>
                        <div>Date: {p.photoDate}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{p.caption}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Date: {p.photoDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: INVITATION CARD */}
          {activeTab === 'invitation' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white text-base">Inaugural Invitation Card</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/invitation/pdf`, `Invitation_${activeBatch.deeksharambhVersion}.pdf`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-white" /> PDF Invitation
                  </button>
                  <button 
                    onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/invitation/docx`, `Invitation_${activeBatch.deeksharambhVersion}.docx`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-white" /> Word Invitation
                  </button>
                </div>
              </div>

              {/* Interactive Invitation Card Preview */}
              <div className="max-w-2xl mx-auto p-8 rounded-2xl border-4 border-double border-gold/40 bg-gradient-to-b from-navy-light/60 to-navy-dark/90 text-center space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
                {/* Decorative border accent */}
                <div className="absolute inset-2 border border-gold/15 rounded-lg pointer-events-none"></div>
                
                {/* Header */}
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-base tracking-wide uppercase">Sankara College of Science and Commerce</h4>
                  <p className="text-[10px] text-gray-400 font-medium">Affiliated to Bharathiar University | Approved by AICTE</p>
                  <p className="text-[10px] text-gray-400 font-medium">Accredited with A+ Grade by NAAC | Coimbatore - 641035</p>
                  <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent mx-auto mt-2"></div>
                </div>

                <div className="py-2">
                  <span className="px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-bold tracking-widest uppercase">
                    CORDIAL INVITATION
                  </span>
                </div>

                {/* Body wording */}
                <p className="text-gray-300 text-sm font-serif italic max-w-md mx-auto leading-relaxed">
                  The Management, Principal & Faculty of the Department of Computer Science with Data Analytics cordially invite you to the Inaugural Function of the Student Induction Programme
                </p>

                {/* Deeksharambh title */}
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-gold tracking-wider uppercase font-serif">
                    Deeksharambh {activeBatch.deeksharambhVersion}
                  </h2>
                  <p className="text-xs text-white/80 font-bold tracking-wider">
                    Academic Year {activeBatch.academicYear}
                  </p>
                </div>

                {/* Dignitaries */}
                <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-3 text-left max-w-md mx-auto">
                  <h5 className="text-[11px] font-bold text-gold uppercase tracking-wider text-center border-b border-white/5 pb-1.5">
                    Dignitaries of the Function
                  </h5>
                  <div className="text-xs space-y-2">
                    <div>
                      <span className="font-bold text-gray-300">Presidential Address: </span>
                      <span className="text-gold font-bold">{activeBatch.managingTrusteeName || "Dr. Sandhya Ramachandran"}</span>
                      <span className="text-gray-400 text-[10px]"> (Managing Trustee)</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-300">Felicitation Address: </span>
                      <span className="text-gold font-bold">{activeBatch.principalName}</span>
                      <span className="text-gray-400 text-[10px]"> (Principal)</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-300">Welcome Address: </span>
                      <span className="text-gold font-bold">{activeBatch.hodName}</span>
                      <span className="text-gray-400 text-[10px]"> (HOD, CSDA)</span>
                    </div>
                  </div>
                </div>

                {/* Venue & Date */}
                <div className="grid grid-cols-3 gap-2 border-t border-b border-white/5 py-3 text-xs max-w-md mx-auto font-medium text-gray-300">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Date</p>
                    <p className="mt-1 font-bold text-white">{activeBatch.startDate}</p>
                  </div>
                  <div className="border-l border-r border-white/5">
                    <p className="text-[10px] text-gray-400 uppercase">Time</p>
                    <p className="mt-1 font-bold text-white">10:00 AM</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Venue</p>
                    <p className="mt-1 font-bold text-white">Auditorium</p>
                  </div>
                </div>

                <p className="text-[10px] text-gray-400 font-bold italic">
                  * All B.Sc. CSDA first-year students and parents are requested to join.
                </p>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

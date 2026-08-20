import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Plus, Trash2, Edit2, Shield, Award, HelpCircle, Download, ToggleLeft, ToggleRight, CheckSquare, AlertCircle, X } from 'lucide-react';
import { downloadFile } from '../utils/downloadHelper';
import AiQuestionChatbot from '../components/AiQuestionChatbot';

export default function AssessmentModule({ activeBatch, role }) {
  const [students, setStudents] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [activeTab, setActiveTab] = useState('Portal'); // Builder, Portal
  const [editingQId, setEditingQId] = useState(null);

  // Question Form State (Builder)
  const [qFormData, setQFormData] = useState({
    subject: 'Core',
    mathsStream: 'ALL',
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A'
  });

  // Student Test Portal State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Core');
  const [testModeActive, setTestModeActive] = useState(false);
  const [displayOneByOne, setDisplayOneByOne] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState({}); // { [qId]: selectedOption }
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (activeBatch) {
      fetchData();
    }
  }, [activeBatch]);

  const fetchData = async () => {
    try {
      const studentRes = await axios.get(`/api/batches/${activeBatch._id}/students`);
      setStudents(studentRes.data);
      if (studentRes.data.length > 0) {
        setSelectedStudentId(studentRes.data[0]._id);
      }

      const questionRes = await axios.get(`/api/batches/${activeBatch._id}/questions`);
      setQuestions(questionRes.data);
    } catch (err) {
      console.error('Error fetching questions/students:', err);
    }
  };

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const startEditQuestion = (q) => {
    setEditingQId(q._id);
    setQFormData({
      subject: q.subject,
      mathsStream: q.mathsStream || 'ALL',
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer
    });
    setActiveTab('Builder');
  };

  const cancelEditQuestion = () => {
    setEditingQId(null);
    setQFormData({
      subject: 'Core',
      mathsStream: 'ALL',
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A'
    });
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (role === 'viewer') {
      showToast('Viewers cannot add or edit questions.', 'error');
      return;
    }
    if (!qFormData.questionText.trim()) {
      showToast('Question text is required.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        batchId: activeBatch._id,
        subject: qFormData.subject,
        mathsStream: qFormData.subject === 'Maths' ? qFormData.mathsStream : 'ALL',
        questionText: qFormData.questionText,
        optionA: qFormData.optionA,
        optionB: qFormData.optionB,
        optionC: qFormData.optionC,
        optionD: qFormData.optionD,
        correctAnswer: qFormData.correctAnswer
      };
      if (editingQId) {
        await axios.put(`/api/questions/${editingQId}`, payload);
        showToast('Question updated successfully!');
      } else {
        await axios.post('/api/questions', payload);
        showToast('Question added successfully to database bank!');
      }
      cancelEditQuestion();
      fetchData();
    } catch (err) {
      showToast('Failed to save question', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (role === 'viewer') return;
    if (!window.confirm('Delete this question from the bank?')) return;
    try {
      await axios.delete(`/api/questions/${qId}`);
      showToast('Question deleted.');
      fetchData();
    } catch (err) {
      showToast('Failed to delete question', 'error');
    }
  };

  // Start Assessment
  const handleStartTest = () => {
    if (!selectedStudentId) {
      showToast('Please select a student first.', 'error');
      return;
    }

    // Filter questions for the student
    const studentObj = students.find(s => s._id === selectedStudentId);
    if (!studentObj) return;

    let paperQuestions = [];
    if (selectedSubject === 'Maths') {
      // Filter by M or NM
      paperQuestions = questions.filter(q => q.subject === 'Maths' && q.mathsStream === studentObj.mathsStream);
    } else {
      paperQuestions = questions.filter(q => q.subject === selectedSubject);
    }

    if (paperQuestions.length === 0) {
      showToast(`No questions configured for subject: ${selectedSubject}${selectedSubject === 'Maths' ? ` (${studentObj.mathsStream === 'M' ? 'Maths Stream' : 'Non-Maths Stream'})` : ''}.`, 'error');
      return;
    }

    setStudentAnswers({});
    setTestResult(null);
    setCurrentQuestionIndex(0);
    setTestModeActive(true);
  };

  const handleSelectOption = (qId, option) => {
    setStudentAnswers(prev => ({
      ...prev,
      [qId]: option
    }));
  };

  const getFilteredQuestions = () => {
    const studentObj = students.find(s => s._id === selectedStudentId);
    if (!studentObj) return [];
    if (selectedSubject === 'Maths' || selectedSubject === 'Mathematics') {
      return questions.filter(q => (q.subject === 'Maths' || q.subject === 'Mathematics') && (q.mathsStream === 'ALL' || q.mathsStream === studentObj.mathsStream));
    }
    return questions.filter(q => q.subject === selectedSubject);
  };

  const handleTestSubmit = async () => {
    const pQs = getFilteredQuestions();
    const answersPayload = Object.keys(studentAnswers).map(qId => ({
      questionId: qId,
      selectedOption: studentAnswers[qId]
    }));

    setLoading(true);
    try {
      // Calculate score locally for instant visual feedback
      let localScore = 0;
      pQs.forEach(q => {
        if (studentAnswers[q._id] === q.correctAnswer) {
          localScore++;
        }
      });

      // Submit to backend
      const res = await axios.post('/api/assessments/submit', {
        batchId: activeBatch._id,
        studentId: selectedStudentId,
        subject: selectedSubject,
        answers: answersPayload
      });

      setTestResult({
        score: localScore,
        total: pQs.length,
        percent: Number(((localScore / pQs.length) * 100).toFixed(1))
      });
      showToast('Assessment submitted successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit test', 'error');
    } finally {
      setLoading(false);
      setTestModeActive(false);
    }
  };

  const handleAiAddQuestion = async (q) => {
    try {
      const payload = {
        batchId: activeBatch._id,
        subject: q.subject,
        mathsStream: 'ALL',
        questionText: q.questionText,
        optionA: q.options[0],
        optionB: q.options[1],
        optionC: q.options[2],
        optionD: q.options[3],
        correctAnswer: String.fromCharCode(65 + q.correctOption),
        bloomLevel: q.bloomLevel
      };
      await axios.post('/api/questions', payload);
      showToast(`Question added to bank (${q.bloomLevel} Level)!`, 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to add question to bank', 'error');
    }
  };

  if (!activeBatch) {
    return <div className="text-gray-400 text-sm">Please select a batch from the Dashboard first.</div>;
  }

  const currentStudent = students.find(s => s._id === selectedStudentId);
  const activePaperQuestions = getFilteredQuestions();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-wide uppercase">Assessment Module</h2>
          <p className="text-xs text-slate-500 mt-1">Manage MCQ exams, build subject-wise question papers using Bloom's Taxonomy AI, and run student online test sessions.</p>
        </div>
        <button
          onClick={() => downloadFile(`/api/batches/${activeBatch._id}/export/questions/csv`, `QuestionBank_${activeBatch.batchYearRange}.csv`)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4" /> Export Questions (CSV)
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border ${
          message.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex gap-2 p-1.5 rounded-xl bg-sky-50 border border-sky-200 w-full sm:w-80 shadow-sm">
        <button
          onClick={() => { setActiveTab('Portal'); setTestResult(null); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all ${
            activeTab === 'Portal' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Student Test Portal
        </button>
        <button
          onClick={() => { setActiveTab('Builder'); setTestResult(null); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all ${
            activeTab === 'Builder' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Question Bank Builder
        </button>
      </div>

      {activeTab === 'Builder' ? (
        <div className="space-y-6">
          {/* AI Question Generator Chatbot */}
          {role !== 'viewer' && (
            <AiQuestionChatbot onAddQuestion={handleAiAddQuestion} />
          )}

          {/* Question Bank Builder */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Question Form */}
          {role !== 'viewer' && (
            <div className="lg:col-span-1">
              <div className="glass-card p-6 rounded-xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-gold uppercase tracking-wider border-b border-white/5 pb-2">Add MCQ Question</h3>
                <form onSubmit={handleQuestionSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Subject Paper</label>
                    <select
                      value={qFormData.subject}
                      onChange={(e) => setQFormData({ ...qFormData, subject: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg glass-input text-xs"
                    >
                      <option value="Tamil">Tamil</option>
                      <option value="English">English</option>
                      <option value="Maths">Mathematics</option>
                      <option value="Core">Core (Programming/Data/ICT)</option>
                    </select>
                  </div>

                  {qFormData.subject === 'Maths' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-300 mb-1.5">Maths Stream Category</label>
                      <select
                        value={qFormData.mathsStream}
                        onChange={(e) => setQFormData({ ...qFormData, mathsStream: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg glass-input text-xs"
                      >
                        <option value="M">Maths Students Stream (Maths-Maths)</option>
                        <option value="NM">Non-Maths Students Stream (Maths-NonMaths)</option>
                      </select>
                    </div>
                  )}

                  {qFormData.subject === 'Tamil' && (
                    <div className="p-3 rounded-lg bg-gold/5 border border-gold/20 text-[10px] text-gold/80 italic leading-relaxed">
                      💡 <strong>Tamil Unicode Note:</strong> Tamil font questions must be typed manually in Tamil Unicode.
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Question Text</label>
                    <textarea
                      required
                      rows="3"
                      value={qFormData.questionText}
                      onChange={(e) => setQFormData({ ...qFormData, questionText: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg glass-input text-xs resize-none"
                      placeholder="Type the question..."
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 mb-1">Option A</label>
                      <input
                        type="text"
                        required
                        value={qFormData.optionA}
                        onChange={(e) => setQFormData({ ...qFormData, optionA: e.target.value })}
                        className="w-full px-2 py-1.5 rounded glass-input text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 mb-1">Option B</label>
                      <input
                        type="text"
                        required
                        value={qFormData.optionB}
                        onChange={(e) => setQFormData({ ...qFormData, optionB: e.target.value })}
                        className="w-full px-2 py-1.5 rounded glass-input text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 mb-1">Option C</label>
                      <input
                        type="text"
                        required
                        value={qFormData.optionC}
                        onChange={(e) => setQFormData({ ...qFormData, optionC: e.target.value })}
                        className="w-full px-2 py-1.5 rounded glass-input text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 mb-1">Option D</label>
                      <input
                        type="text"
                        required
                        value={qFormData.optionD}
                        onChange={(e) => setQFormData({ ...qFormData, optionD: e.target.value })}
                        className="w-full px-2 py-1.5 rounded glass-input text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1.5">Correct Answer</label>
                    <select
                      value={qFormData.correctAnswer}
                      onChange={(e) => setQFormData({ ...qFormData, correctAnswer: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg glass-input text-xs"
                    >
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-lg bg-gold text-navy-dark font-bold text-xs hover:bg-gold-light transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Save to Question Bank
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Question List View */}
          <div className={role !== 'viewer' ? 'lg:col-span-2 space-y-4' : 'lg:col-span-3 space-y-4'}>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Question Bank ({questions.length} questions)</h3>
            <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2">
              {questions.map((q, idx) => (
                <div key={q._id} className="p-4 rounded-xl bg-navy-dark/40 border border-white/5 space-y-3 relative group">
                  {role !== 'viewer' && (
                    <button
                      onClick={() => handleDeleteQuestion(q._id)}
                      className="absolute right-4 top-4 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-500/10 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="flex justify-between items-center text-[10px] text-gray-400 border-b border-white/5 pb-2 pr-6">
                    <span className="text-gold font-bold">Q.{idx+1} ({q.subject})</span>
                    <span className="uppercase">Stream: {q.subject === 'Maths' ? `Maths (${q.mathsStream})` : 'ALL'}</span>
                  </div>
                  <p className="text-xs text-white leading-relaxed font-medium">{q.questionText}</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-400">
                    <div>A. {q.optionA}</div>
                    <div>B. {q.optionB}</div>
                    <div>C. {q.optionC}</div>
                    <div>D. {q.optionD}</div>
                  </div>
                  <div className="text-[10px] font-bold text-green-400 bg-green-500/5 border border-green-500/15 p-2 rounded">
                    Correct Option: {q.correctAnswer}
                  </div>
                </div>
              ))}
              {questions.length === 0 && (
                <div className="p-12 text-center text-gray-500 text-xs border border-dashed border-white/10 rounded-xl">
                  No questions saved in this batch's question bank.
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      ) : (
        /* Student Test Portal (Google Forms style) */
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Pre-Exam Setup Details */}
          {!testModeActive && !testResult && (
            <div className="glass-card p-6 rounded-xl border border-white/5 space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-center border-b border-white/5 pb-3">Bridge Course Exam Portal</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">1. Select Student Profile</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg glass-input text-xs"
                  >
                    {students.map(s => (
                      <option key={s._id} value={s._id}>{s.sNo}. {s.name} ({s.mathsStream === 'M' ? 'Maths' : 'Non-Maths'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">2. Choose Subject Assessment</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Tamil', 'English', 'Maths', 'Core'].map(subj => (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => setSelectedSubject(subj)}
                        className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                          selectedSubject === subj 
                            ? 'bg-gold text-navy-dark border-gold font-bold shadow-md' 
                            : 'border-white/5 bg-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        {subj}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs">
                  <span className="text-gray-400">Question Layout Format:</span>
                  <button
                    type="button"
                    onClick={() => setDisplayOneByOne(!displayOneByOne)}
                    className="text-gold font-bold flex items-center gap-1.5"
                  >
                    {displayOneByOne ? (
                      <>
                        <ToggleRight className="w-5 h-5 text-gold" />
                        <span>One question at a time</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5 text-gray-500" />
                        <span>Show all questions at once</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartTest}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-gold to-yellow-400 text-navy-dark font-bold text-xs hover:from-yellow-400 hover:to-gold transition-all duration-200 shadow-md flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4" /> Start Examination Session
              </button>
            </div>
          )}

          {/* Test Submission Result View */}
          {testResult && (
            <div className="glass-card p-8 rounded-xl border border-white/5 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto">
                <Award className="w-8 h-8 text-gold" />
              </div>
              <div className="space-y-1">
                <h3 className="text-gold font-bold text-base uppercase">Assessment Completed!</h3>
                <p className="text-xs text-gray-400">Scorecard details have been logged in results database.</p>
              </div>

              <div className="py-4 border-y border-white/5">
                <div className="text-3xl font-bold text-white">{testResult.score} / {testResult.total}</div>
                <div className="text-xs text-gray-400 mt-1">Passing percentage target: 50% | Scored: {testResult.percent}%</div>
              </div>

              <button
                onClick={() => setTestResult(null)}
                className="px-6 py-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white font-bold hover:bg-white/10"
              >
                Back to Selection
              </button>
            </div>
          )}

          {/* Active Test Paper Form */}
          {testModeActive && currentStudent && (
            <div className="space-y-6">
              {/* Paper Header banner */}
              <div className="glass-card p-4 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-gold font-semibold uppercase">Exam Candidate:</span>
                  <div className="font-bold text-white mt-0.5">{currentStudent.name}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase">Assessment Subject:</span>
                  <div className="font-bold text-gold mt-0.5">{selectedSubject}</div>
                </div>
              </div>

              {displayOneByOne ? (
                /* Mode 1: One by one layout */
                <div className="glass-card p-6 rounded-xl border border-white/5 space-y-6">
                  {(() => {
                    const q = activePaperQuestions[currentQuestionIndex];
                    if (!q) return null;
                    return (
                      <div className="space-y-4">
                        <div className="text-xs text-gold font-bold">
                          Question {currentQuestionIndex + 1} of {activePaperQuestions.length}
                        </div>
                        <p className="text-sm font-semibold text-white leading-relaxed">{q.questionText}</p>
                        
                        <div className="space-y-2">
                          {['A', 'B', 'C', 'D'].map(opt => {
                            const optionText = q[`option${opt}`];
                            const isSelected = studentAnswers[q._id] === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleSelectOption(q._id, opt)}
                                className={`w-full text-left p-3.5 rounded-lg border text-xs font-semibold flex items-center gap-3 transition-all ${
                                  isSelected 
                                    ? 'bg-gold/10 border-gold text-gold' 
                                    : 'border-white/5 bg-navy-deep hover:border-white/15 text-gray-300'
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  isSelected ? 'bg-gold text-navy-dark' : 'bg-white/5 text-gray-400'
                                }`}>
                                  {opt}
                                </span>
                                <span>{optionText}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Navigation Footer */}
                  <div className="flex justify-between items-center border-t border-white/5 pt-4">
                    <button
                      type="button"
                      disabled={currentQuestionIndex === 0}
                      onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                      className="px-4 py-2 rounded-lg text-xs font-semibold border border-white/10 text-gray-300 hover:text-white disabled:opacity-30"
                    >
                      Previous
                    </button>
                    {currentQuestionIndex < activePaperQuestions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold bg-gold text-navy-dark font-bold hover:bg-gold-light"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleTestSubmit}
                        className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold text-xs"
                      >
                        Submit Test Paper
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Mode 2: Show all questions at once */
                <div className="space-y-4">
                  {activePaperQuestions.map((q, idx) => (
                    <div key={q._id} className="glass-card p-6 rounded-xl border border-white/5 space-y-4">
                      <div className="text-xs text-gold font-bold">Question {idx + 1}</div>
                      <p className="text-xs font-semibold text-white leading-relaxed">{q.questionText}</p>
                      
                      <div className="grid grid-cols-1 gap-2">
                        {['A', 'B', 'C', 'D'].map(opt => {
                          const optionText = q[`option${opt}`];
                          const isSelected = studentAnswers[q._id] === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleSelectOption(q._id, opt)}
                              className={`w-full text-left p-3 rounded-lg border text-xs font-semibold flex items-center gap-3 transition-all ${
                                isSelected 
                                  ? 'bg-gold/10 border-gold text-gold' 
                                  : 'border-white/5 bg-navy-deep hover:border-white/10 text-gray-300'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                isSelected ? 'bg-gold text-navy-dark' : 'bg-white/5 text-gray-400'
                              }`}>
                                  {opt}
                              </span>
                              <span>{optionText}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={handleTestSubmit}
                    className="w-full py-3.5 rounded-lg bg-green-500 text-white font-bold text-xs hover:bg-green-600 shadow-lg flex items-center justify-center gap-2 mt-6"
                  >
                    <CheckSquare className="w-4 h-4" /> Finish and Submit Answers
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

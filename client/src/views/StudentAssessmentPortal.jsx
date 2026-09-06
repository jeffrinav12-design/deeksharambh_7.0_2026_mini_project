import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, CheckCircle, Clock, FileText, AlertCircle, RefreshCw, BarChart2, Check, X } from 'lucide-react';

export default function StudentAssessmentPortal({ activeBatch, batches = [], onSelectBatch, currentRole }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  const normalizeQuestions = (data) => {
    return data.map(q => {
      const options = [
        q.optionA || (q.options && q.options[0]) || 'Option A',
        q.optionB || (q.options && q.options[1]) || 'Option B',
        q.optionC || (q.options && q.options[2]) || 'Option C',
        q.optionD || (q.options && q.options[3]) || 'Option D'
      ];
      let correctOption = q.correctOption;
      if (correctOption === undefined && q.correctAnswer) {
        const ca = String(q.correctAnswer).trim().toUpperCase();
        if (ca === 'A' || ca === '0') correctOption = 0;
        else if (ca === 'B' || ca === '1') correctOption = 1;
        else if (ca === 'C' || ca === '2') correctOption = 2;
        else if (ca === 'D' || ca === '3') correctOption = 3;
        else correctOption = 0;
      }
      return {
        ...q,
        options,
        correctOption: correctOption !== undefined ? Number(correctOption) : 0
      };
    });
  };

  useEffect(() => {
    if (activeBatch?._id) {
      axios.get(`/api/batches/${activeBatch._id}/questions`)
        .then(res => {
          if (res.data && res.data.length > 0) {
            setQuestions(normalizeQuestions(res.data));
          } else {
            setQuestions(normalizeQuestions(getSampleQuestions(activeBatch)));
          }
        })
        .catch(() => setQuestions(normalizeQuestions(getSampleQuestions(activeBatch))));
    } else {
      setQuestions(normalizeQuestions(getSampleQuestions(activeBatch)));
    }
  }, [activeBatch]);

  useEffect(() => {
    if (!submitted && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [submitted, timeLeft]);

  const getSampleQuestions = (batch) => {
    const bId = (batch?.deeksharambhVersion || batch?._id || '').toString();
    
    if (bId.includes('5.0') || bId.includes('2024')) {
      return [
        {
          _id: 'q_5_1',
          subject: 'Core',
          questionText: 'Batch 5.0 (2024): Which data structure follows the LIFO (Last-In, First-Out) principle?',
          optionA: 'Queue', optionB: 'Stack', optionC: 'Array', optionD: 'Linked List',
          correctAnswer: 'B', bloomLevel: 'Understanding'
        },
        {
          _id: 'q_5_2',
          subject: 'Maths',
          questionText: 'Batch 5.0 (2024): What is the determinant of a 2x2 identity matrix?',
          optionA: '0', optionB: '1', optionC: '2', optionD: '-1',
          correctAnswer: 'B', bloomLevel: 'Applying'
        },
        {
          _id: 'q_5_3',
          subject: 'English',
          questionText: 'Batch 5.0 (2024): Identify the synonym for "Meticulous":',
          optionA: 'Hasty', optionB: 'Diligent / Thorough', optionC: 'Careless', optionD: 'Vague',
          correctAnswer: 'B', bloomLevel: 'Remembering'
        },
        {
          _id: 'q_5_4',
          subject: 'Tamil',
          questionText: 'Batch 5.0 (2024): திருக்குறளில் மொத்தம் எத்தனை அதிகாரங்கள் உள்ளன?',
          optionA: '100', optionB: '133', optionC: '150', optionD: '1330',
          correctAnswer: 'B', bloomLevel: 'Remembering'
        }
      ];
    } else if (bId.includes('6.0') || bId.includes('2025')) {
      return [
        {
          _id: 'q_6_1',
          subject: 'Core',
          questionText: 'Batch 6.0 (2025): In Python Pandas, which object represents a 2D tabular data structure?',
          optionA: 'Series', optionB: 'DataFrame', optionC: 'Panel', optionD: 'Array',
          correctAnswer: 'B', bloomLevel: 'Understanding'
        },
        {
          _id: 'q_6_2',
          subject: 'Maths',
          questionText: 'Batch 6.0 (2025): What is the derivative of f(x) = 4x³ + 2x?',
          optionA: '12x² + 2', optionB: '4x² + 2', optionC: '12x + 2', optionD: '8x² + 2',
          correctAnswer: 'A', bloomLevel: 'Applying'
        },
        {
          _id: 'q_6_3',
          subject: 'English',
          questionText: 'Batch 6.0 (2025): Which tense is used for an action completed before a past point in time?',
          optionA: 'Simple Past', optionB: 'Past Perfect', optionC: 'Present Continuous', optionD: 'Future Perfect',
          correctAnswer: 'B', bloomLevel: 'Applying'
        },
        {
          _id: 'q_6_4',
          subject: 'Tamil',
          questionText: 'Batch 6.0 (2025): சங்க இலக்கியங்களில் எட்டுத்தொகை நூல்களுள் ஒன்று எது?',
          optionA: 'நாலடியார்', optionB: 'நற்றிணை', optionC: 'இனியவை நாற்பது', optionD: 'திரிகடுகம்',
          correctAnswer: 'B', bloomLevel: 'Remembering'
        }
      ];
    }

    // Default Batch 7.0 (2026)
    return [
      {
        _id: 'q_7_1',
        subject: 'Core',
        questionText: 'Batch 7.0 (2026): Which Machine Learning technique is used for classifying labeled data?',
        optionA: 'Unsupervised Learning', optionB: 'Supervised Learning', optionC: 'Reinforcement Learning', optionD: 'Clustering',
        correctAnswer: 'B', bloomLevel: 'Understanding'
      },
      {
        _id: 'q_7_2',
        subject: 'Maths',
        questionText: 'Batch 7.0 (2026): What is the limit of (sin x / x) as x approaches 0?',
        optionA: '0', optionB: '1', optionC: 'Infinity', optionD: 'Undefined',
        correctAnswer: 'B', bloomLevel: 'Evaluating'
      },
      {
        _id: 'q_7_3',
        subject: 'English',
        questionText: 'Batch 7.0 (2026): Choose the correct sentence with proper subject-verb agreement:',
        optionA: 'Each student have a notebook.', optionB: 'Each student has a notebook.', optionC: 'Each student are having notebooks.', optionD: 'Each students has notebooks.',
        correctAnswer: 'B', bloomLevel: 'Analyzing'
      },
      {
        _id: 'q_7_4',
        subject: 'Tamil',
        questionText: 'Batch 7.0 (2026): கணினி மற்றும் தரவு அறிவியலில் "Data" என்பதன் இணையான தமிழ் சொல் எது?',
        optionA: 'தகவல்', optionB: 'தரவு', optionC: 'செய்தி', optionD: 'அறிவு',
        correctAnswer: 'B', bloomLevel: 'Remembering'
      }
    ];
  };

  const filteredQuestions = selectedSubject === 'All'
    ? questions
    : questions.filter(q => q.subject === selectedSubject || (selectedSubject === 'Mathematics' && (q.subject === 'Maths' || q.subject === 'Mathematics')) || (selectedSubject === 'Maths' && (q.subject === 'Mathematics' || q.subject === 'Maths')));

  const handleOptionSelect = (qId, optionIdx) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmit = async () => {
    let correctCount = 0;
    let subjectBreakdown = {};

    filteredQuestions.forEach(q => {
      const isCorrect = answers[q._id] === q.correctOption;
      if (isCorrect) correctCount++;

      if (!subjectBreakdown[q.subject]) {
        subjectBreakdown[q.subject] = { correct: 0, total: 0 };
      }
      subjectBreakdown[q.subject].total++;
      if (isCorrect) subjectBreakdown[q.subject].correct++;
    });

    const total = filteredQuestions.length;
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    let category = 'Slow Learner';
    let badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
    if (percentage >= 70) {
      category = 'Advanced Learner';
      badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    } else if (percentage >= 50) {
      category = 'Moderate Learner';
      badgeColor = 'bg-sky-100 text-sky-800 border-sky-300';
    }

    setScoreResult({
      score: correctCount,
      total,
      percentage,
      category,
      badgeColor,
      subjectBreakdown
    });
    setSubmitted(true);

    if (activeBatch?._id) {
      try {
        const studentRes = await axios.get(`/api/batches/${activeBatch._id}/students`);
        if (studentRes.data && studentRes.data.length > 0) {
          const studentId = studentRes.data[0]._id;
          const answersPayload = filteredQuestions.map(q => ({
            questionId: q._id,
            selectedOption: answers[q._id] !== undefined ? String.fromCharCode(65 + answers[q._id]) : 'A'
          }));
          await axios.post('/api/assessments/submit', {
            batchId: activeBatch._id,
            studentId,
            subject: selectedSubject === 'All' ? 'Core' : selectedSubject,
            answers: answersPayload
          });
        }
      } catch (err) {
        console.error('Failed to sync student assessment results:', err);
      }
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 rounded-2xl p-6 text-white shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-white/20 text-blue-100 rounded-full text-xs font-semibold uppercase tracking-wider">
            Deeksharambh Student Assessment Portal
          </span>
          <h1 className="text-2xl font-extrabold mt-2">Bridge Course Assessment & Evaluation</h1>
          <p className="text-sm text-blue-100 mt-1">
            Batch: {activeBatch?.batchYearRange || '2026-2029'} (v{activeBatch?.deeksharambhVersion || '7.0'}) | Class: I B.Sc CSDA
          </p>
        </div>

        {!submitted && (
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 flex items-center gap-3">
            <Clock className="w-5 h-5 text-sky-200 animate-pulse" />
            <div>
              <div className="text-[10px] text-sky-100 uppercase tracking-wide font-semibold">Time Remaining</div>
              <div className="text-xl font-black font-mono tracking-wider">{formatTime(timeLeft)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Student Batch Switcher Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-sky-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select College Academic Batch:</span>
          <span className="text-[11px] text-slate-500">(Questions & Evaluation auto-switch per batch)</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {batches.map(b => (
            <button
              key={b._id || b.deeksharambhVersion}
              type="button"
              onClick={() => onSelectBatch && onSelectBatch(b)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeBatch?._id === b._id || activeBatch?.deeksharambhVersion === b.deeksharambhVersion
                  ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-700'
              }`}
            >
              Batch {b.deeksharambhVersion} ({b.batchYearRange})
            </button>
          ))}
        </div>
      </div>

      {/* Score Summary Modal/Card */}
      {submitted && scoreResult && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-sky-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-sky-100 text-sky-800 rounded-2xl">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Assessment Score Summary</h2>
                <p className="text-xs text-slate-500">Evaluation complete - Score registered in Student Master</p>
              </div>
            </div>
            <span className={`px-4 py-1.5 text-xs font-bold rounded-full border ${scoreResult.badgeColor}`}>
              {scoreResult.category} ({scoreResult.percentage}%)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 text-center">
              <div className="text-xs font-medium text-sky-700">Total Marks Scored</div>
              <div className="text-3xl font-black text-sky-900 mt-1">{scoreResult.score} / {scoreResult.total}</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
              <div className="text-xs font-medium text-blue-700">Percentage</div>
              <div className="text-3xl font-black text-blue-900 mt-1">{scoreResult.percentage}%</div>
            </div>
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
              <div className="text-xs font-medium text-indigo-700">Learner Classification</div>
              <div className="text-lg font-bold text-indigo-900 mt-2">{scoreResult.category}</div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setSubmitted(false);
                setAnswers({});
                setScoreResult(null);
                setTimeLeft(600);
              }}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4" /> Re-take Assessment
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 max-w-full">
          <span className="text-xs font-semibold text-slate-600 shrink-0">Filter Subject:</span>
          {['All', 'Core', 'Mathematics', 'English', 'Tamil'].map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all shrink-0 ${
                selectedSubject === sub
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                  : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-50'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
        <span className="text-xs font-medium text-slate-500 shrink-0">
          Showing {filteredQuestions.length} Questions
        </span>
      </div>

      {/* Question List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => {
          const selectedOpt = answers[q._id];
          return (
            <div key={q._id || idx} className="bg-white rounded-2xl p-6 shadow-sm border border-sky-100 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="px-2.5 py-1 text-xs font-bold bg-sky-100 text-sky-800 rounded-lg">
                  Question {idx + 1}
                </span>
                <div className="flex items-center gap-2">
                  {q.bloomLevel && (
                    <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-800 rounded-md">
                      {q.bloomLevel}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-slate-500">{q.subject}</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{q.questionText}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedOpt === optIdx;
                  let optionClass = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-sky-50';

                  if (submitted) {
                    if (optIdx === q.correctOption) {
                      optionClass = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold';
                    } else if (isSelected && optIdx !== q.correctOption) {
                      optionClass = 'bg-rose-50 border-rose-300 text-rose-800';
                    }
                  } else if (isSelected) {
                    optionClass = 'bg-sky-100 border-sky-400 text-sky-900 font-semibold ring-2 ring-sky-300';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleOptionSelect(q._id, optIdx)}
                      disabled={submitted}
                      className={`p-3 text-left text-xs rounded-xl border transition-all flex items-center justify-between ${optionClass}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-white border border-slate-300 flex items-center justify-center font-bold text-slate-500 text-[11px]">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {submitted && optIdx === q.correctOption && (
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {submitted && isSelected && optIdx !== q.correctOption && (
                        <X className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Action */}
      {!submitted && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-sky-100 flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-sm rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" /> Submit Assessment
          </button>
        </div>
      )}
    </div>
  );
}

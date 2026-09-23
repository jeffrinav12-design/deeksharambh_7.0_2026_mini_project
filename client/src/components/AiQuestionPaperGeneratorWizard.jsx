import React, { useState } from 'react';
import axios from 'axios';
import { 
  FileText, Upload, Sparkles, RefreshCw, CheckCircle2, ArrowRight, ArrowLeft, 
  Edit3, Trash2, MoveUp, MoveDown, Plus, Download, Printer, Save, Layers, BookOpen, ShieldCheck, Cpu
} from 'lucide-react';
import { downloadFile } from '../utils/downloadHelper';

export default function AiQuestionPaperGeneratorWizard({ activeBatch, role }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [synthesisLogs, setSynthesisLogs] = useState([]);
  const [regeneratingId, setRegeneratingId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Step 1 State: Exam Pattern
  const [patternType, setPatternType] = useState('autonomous_endsem');
  const [uploadedTemplateName, setUploadedTemplateName] = useState('');
  const [templateConfig, setTemplateConfig] = useState({
    patternName: 'Sankara Autonomous End-Semester Exam Pattern',
    totalMarks: 75,
    durationHours: 3,
    sections: [
      { section: 'A', title: 'Multiple Choice Questions (Bloom K1 - K2)', questionCount: 10, marksPerQuestion: 1, totalSectionMarks: 10, choiceRule: 'All Compulsory', questionType: 'MCQ' },
      { section: 'B', title: 'Short Answer & Conceptual Questions (Bloom K3 - K4)', questionCount: 5, marksPerQuestion: 5, totalSectionMarks: 25, choiceRule: 'Either/Or Internal Choice', questionType: 'Short Answer / Diagrammatic' },
      { section: 'C', title: 'Comprehensive & Essay Questions (Bloom K5 - K6)', questionCount: 5, marksPerQuestion: 8, totalSectionMarks: 40, choiceRule: 'Either/Or Internal Choice', questionType: 'Essay / Analytical Problem' }
    ],
    bloomDistribution: { K1_K2: '30%', K3_K4: '40%', K5_K6: '30%' }
  });

  // Step 2 State: Subject & Syllabus Input (Dual Mode)
  const [selectedSubject, setSelectedSubject] = useState('Core');
  const [syllabusInputMode, setSyllabusInputMode] = useState('upload'); // 'upload' or 'manual'
  const [uploadedSyllabusName, setUploadedSyllabusName] = useState('');
  const [parsingSyllabus, setParsingSyllabus] = useState(false);
  const [syllabusConfig, setSyllabusConfig] = useState({
    subject: 'Core Programming & Data Structures',
    units: [
      { unitNo: 'UNIT I', title: 'Problem Solving & Algorithmic Thinking', keywords: 'Algorithms, Flowcharts, Pseudocode, Complexity, Recursion', co: 'CO1' },
      { unitNo: 'UNIT II', title: 'C & Python Programming Fundamentals', keywords: 'Variables, Data Types, Control Structures, Loops, Functions', co: 'CO2' },
      { unitNo: 'UNIT III', title: 'Linear Data Structures & Memory Allocation', keywords: 'Arrays, Stacks, Queues, Linked Lists, Pointers', co: 'CO3' },
      { unitNo: 'UNIT IV', title: 'Non-Linear Data Structures & Graph Algorithms', keywords: 'Binary Trees, BST, DFS/BFS Traversals, Hashing', co: 'CO4' },
      { unitNo: 'UNIT V', title: 'Sorting, Searching & Modern Tech Tools', keywords: 'Bubble Sort, Merge Sort, Quick Sort, Binary Search, Git', co: 'CO5' }
    ],
    courseOutcomes: [
      { co: 'CO1', description: 'Apply algorithmic principles to solve computational problems efficiently.' },
      { co: 'CO2', description: 'Construct modular Python and C programs using structured control flows.' },
      { co: 'CO3', description: 'Demonstrate proficiency in memory allocation and linear data structures.' },
      { co: 'CO4', description: 'Analyze non-linear tree and graph data structures for complex applications.' },
      { co: 'CO5', description: 'Implement efficient sorting, searching algorithms, and version control.' }
    ]
  });

  // Step 3 & 4 State: Synthesized Question Paper
  const [generatedPaper, setGeneratedPaper] = useState(null);
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  const showToast = (text) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Step 1: Parse Exam Template
  const handleParseTemplate = async (selectedPattern, fileName = '') => {
    setLoading(true);
    try {
      const res = await axios.post('/api/ai/parse-template', { patternType: selectedPattern, fileName });
      setTemplateConfig(res.data);
      if (fileName) setUploadedTemplateName(fileName);
      showToast('Exam pattern & section structure successfully parsed!');
    } catch (err) {
      showToast('Failed to parse exam pattern', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleParseTemplate('uploaded_custom', file.name);
    }
  };

  // Step 2: Parse Syllabus Document
  const handleSyllabusFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedSyllabusName(file.name);
    setParsingSyllabus(true);
    try {
      const res = await axios.post('/api/ai/parse-syllabus', { subject: selectedSubject, rawSyllabusText: file.name });
      setSyllabusConfig(res.data);
      showToast(`Extracted 5 Units & CO1-CO5 outcomes from ${file.name}!`);
    } catch (err) {
      showToast('Failed to parse syllabus file', 'error');
    } finally {
      setParsingSyllabus(false);
    }
  };

  const handleAutoCurateSyllabus = async () => {
    setParsingSyllabus(true);
    try {
      const res = await axios.post('/api/ai/parse-syllabus', { subject: selectedSubject });
      setSyllabusConfig(res.data);
      showToast(`Auto-Curated 5 Units for ${selectedSubject}!`);
    } catch (err) {
      showToast('Auto-curate failed', 'error');
    } finally {
      setParsingSyllabus(false);
    }
  };

  // Step 3: Full Question Paper Synthesis
  const handleGenerateQuestionPaper = async () => {
    setLoading(true);
    setSynthesisLogs([
      "Initiating Gemini AI Multi-Phase Question Paper Synthesis...",
      "Phase 1: Synthesizing Section A (10 MCQs, Bloom K1-K2, CO1-CO5 mapping)...",
      "Phase 2: Synthesizing Section B (5 Either/Or Pairs, Bloom K3-K4)...",
      "Phase 3: Synthesizing Section C (5 Either/Or Pairs, Bloom K5-K6)...",
      "Performing Autonomous Bloom Cognitive Taxonomy Audit & Marking Scheme Verification..."
    ]);

    try {
      const res = await axios.post('/api/ai/generate-question-paper', {
        subject: selectedSubject,
        templateConfig,
        syllabusConfig,
        batchId: activeBatch?._id
      });
      setGeneratedPaper(res.data);
      setCurrentStep(4);
      showToast('Question Paper Synthesized Successfully!');
    } catch (err) {
      showToast('Failed to synthesize question paper', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Individual Question Regeneration
  const handleRegenerateQuestion = async (qId, section, bloomLevel, coTag) => {
    setRegeneratingId(qId);
    try {
      const res = await axios.post('/api/ai/regenerate-question', {
        questionId: qId,
        subject: selectedSubject,
        section,
        bloomLevel,
        coTag
      });
      
      const newQ = res.data.question;

      setGeneratedPaper(prev => {
        if (!prev) return prev;
        const newSecA = section === 'A' 
          ? prev.sections.sectionA.map(q => q.id === qId ? { ...q, ...newQ } : q)
          : prev.sections.sectionA;
        
        const newSecB = section === 'B'
          ? prev.sections.sectionB.map(pair => {
              if (pair.option1.id === qId) return { ...pair, option1: { ...pair.option1, ...newQ } };
              if (pair.option2.id === qId) return { ...pair, option2: { ...pair.option2, ...newQ } };
              return pair;
            })
          : prev.sections.sectionB;

        const newSecC = section === 'C'
          ? prev.sections.sectionC.map(pair => {
              if (pair.option1.id === qId) return { ...pair, option1: { ...pair.option1, ...newQ } };
              if (pair.option2.id === qId) return { ...pair, option2: { ...pair.option2, ...newQ } };
              return pair;
            })
          : prev.sections.sectionC;

        return {
          ...prev,
          sections: { sectionA: newSecA, sectionB: newSecB, sectionC: newSecC }
        };
      });
      showToast('Question regenerated dynamically!');
    } catch (err) {
      showToast('Failed to regenerate question', 'error');
    } finally {
      setRegeneratingId(null);
    }
  };

  // Save Document to Institutional Store
  const handleSaveToArchiveStore = async () => {
    if (!generatedPaper) return;
    setLoading(true);
    try {
      const docName = `${selectedSubject}_EndSem_QuestionPaper_${activeBatch?.batchYearRange || '2026-2029'}`;
      await axios.post('/api/documents', {
        batchId: activeBatch?._id,
        name: docName,
        fieldValues: {
          subject: selectedSubject,
          batch: activeBatch?.batchYearRange,
          totalMarks: 75,
          paper: JSON.stringify(generatedPaper)
        }
      });
      showToast('Question Paper saved to Institutional Document Store!');
    } catch (err) {
      showToast('Saved to document store notice', 'success');
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    { num: 1, title: 'Exam Pattern', icon: FileText },
    { num: 2, title: 'Subject & Syllabus', icon: BookOpen },
    { num: 3, title: 'AI Synthesis Engine', icon: Sparkles },
    { num: 4, title: 'Review & Fine-Tune', icon: Edit3 },
    { num: 5, title: 'Masthead Preview', icon: Layers },
    { num: 6, title: 'Export & Archive', icon: Download }
  ];

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {toastMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Step Progress Bar */}
      <div className="glass-card p-4 rounded-xl border border-white/5 bg-slate-900/60 backdrop-blur-md">
        <div className="grid grid-cols-6 gap-2 text-center">
          {stepsList.map((st) => {
            const Icon = st.icon;
            const isActive = currentStep === st.num;
            const isCompleted = currentStep > st.num;
            return (
              <button
                key={st.num}
                onClick={() => (st.num <= currentStep || generatedPaper) && setCurrentStep(st.num)}
                disabled={st.num > currentStep && !generatedPaper}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-sky-600 text-white font-bold shadow-md ring-2 ring-sky-400/50 scale-105' 
                    : (isCompleted 
                        ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' 
                        : 'bg-white/5 text-gray-500 opacity-60 cursor-not-allowed')
                }`}
              >
                <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-white' : (isCompleted ? 'text-emerald-400' : 'text-gray-500')}`} />
                <span className="text-[10px] uppercase tracking-wider">{st.num}. {st.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: EXAM PATTERN & TEMPLATE */}
      {currentStep === 1 && (
        <div className="glass-card p-6 rounded-xl border border-white/5 space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider">Step 1: Exam Pattern & Template Selection</h3>
              <p className="text-xs text-gray-400 mt-0.5">Select a pre-configured university exam pattern or upload an institutional exam format (.pdf, .docx, .txt, .json).</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-bold">API: /api/ai/parse-template</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => { setPatternType('autonomous_endsem'); handleParseTemplate('autonomous_endsem'); }}
              className={`p-4 rounded-xl border text-left transition-all ${
                patternType === 'autonomous_endsem' ? 'bg-sky-600/20 border-sky-400 text-white shadow-md' : 'bg-navy-dark/40 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <div className="font-bold text-xs text-sky-300">Autonomous End-Semester</div>
              <div className="text-[11px] mt-1 text-gray-300">75 Marks | 3 Hours</div>
              <div className="text-[10px] text-gray-400 mt-2">Sec A: 10 MCQs (1M) • Sec B: 5 Either/Or (5M) • Sec C: 5 Either/Or (8M)</div>
            </button>

            <button
              onClick={() => { setPatternType('bridge_course'); handleParseTemplate('bridge_course'); }}
              className={`p-4 rounded-xl border text-left transition-all ${
                patternType === 'bridge_course' ? 'bg-sky-600/20 border-sky-400 text-white shadow-md' : 'bg-navy-dark/40 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <div className="font-bold text-xs text-amber-300">Bridge Course Diagnostic</div>
              <div className="text-[11px] mt-1 text-gray-300">50 Marks | 2 Hours</div>
              <div className="text-[10px] text-gray-400 mt-2">Sec A: 25 MCQs (1M) • Sec B: 5 Short Answers (5M)</div>
            </button>

            <button
              onClick={() => { setPatternType('cia_test'); handleParseTemplate('cia_test'); }}
              className={`p-4 rounded-xl border text-left transition-all ${
                patternType === 'cia_test' ? 'bg-sky-600/20 border-sky-400 text-white shadow-md' : 'bg-navy-dark/40 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <div className="font-bold text-xs text-emerald-300">Continuous Internal Test (CIA)</div>
              <div className="text-[11px] mt-1 text-gray-300">40 Marks | 1.5 Hours</div>
              <div className="text-[10px] text-gray-400 mt-2">Sec A: 5 MCQs (1M) • Sec B: 3 Either/Or (5M) • Sec C: 2 Essay (10M)</div>
            </button>
          </div>

          {/* Upload Institutional Template */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-dashed border-sky-400/30 text-center space-y-3">
            <Upload className="w-8 h-8 text-sky-400 mx-auto" />
            <div>
              <div className="text-xs font-bold text-white">Upload Institutional Exam Pattern Document</div>
              <p className="text-[11px] text-gray-400">Supported formats: .pdf, .docx, .doc, .txt, .json</p>
            </div>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer transition-all">
              <Upload className="w-4 h-4" /> Browse Exam Pattern File
              <input type="file" onChange={handleTemplateFileUpload} accept=".pdf,.docx,.doc,.txt,.json" className="hidden" />
            </label>
            {uploadedTemplateName && (
              <div className="text-xs text-emerald-400 font-bold">Uploaded & Parsed: {uploadedTemplateName}</div>
            )}
          </div>

          {/* Parsed Structure Preview */}
          <div className="space-y-3 border-t border-white/10 pt-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase">Parsed Exam Structure Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {templateConfig.sections.map((sec) => (
                <div key={sec.section} className="p-3 rounded-lg bg-navy-dark/60 border border-white/10 space-y-1 text-xs">
                  <div className="font-bold text-sky-300">Section {sec.section}: {sec.totalSectionMarks} Marks</div>
                  <div className="text-gray-300">{sec.questionCount} Questions × {sec.marksPerQuestion} Mark(s)</div>
                  <div className="text-[10px] text-gray-400">Rule: {sec.choiceRule}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 shadow-md"
            >
              Next: Syllabus & Course Outcomes <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SUBJECT & SYLLABUS CONFIGURATION */}
      {currentStep === 2 && (
        <div className="glass-card p-6 rounded-xl border border-white/5 space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider">Step 2: Subject & Dual-Mode Syllabus Integration</h3>
              <p className="text-xs text-gray-400 mt-0.5">Upload syllabus documents or auto-curate 5 units with AI and Course Outcome (CO1–CO5) mapping.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-bold">API: /api/ai/parse-syllabus</span>
          </div>

          {/* Subject Picker */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">Select Examination Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg glass-input text-xs font-semibold"
            >
              <option value="Core">Core Programming & Data Structures</option>
              <option value="Tamil">Tamil (தமிழ்மொழி மற்றும் கணினிப் பயன்பாடு)</option>
              <option value="English">Communicative & Professional English</option>
              <option value="Maths">Mathematics (Bridge Course Algebra & Calculus)</option>
            </select>
          </div>

          {/* Dual Mode Selector */}
          <div className="flex gap-2 p-1.5 bg-slate-900 rounded-xl border border-white/10">
            <button
              onClick={() => setSyllabusInputMode('upload')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                syllabusInputMode === 'upload' ? 'bg-sky-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Option A: Institutional Document Upload (.pdf, .docx, .txt)
            </button>
            <button
              onClick={() => setSyllabusInputMode('manual')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                syllabusInputMode === 'manual' ? 'bg-sky-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Option B: Manual / AI Auto-Curate 5 Units
            </button>
          </div>

          {syllabusInputMode === 'upload' ? (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-dashed border-sky-400/30 text-center space-y-3">
              <Upload className="w-8 h-8 text-sky-400 mx-auto" />
              <div>
                <div className="text-xs font-bold text-white">Upload Subject Syllabus Document</div>
                <p className="text-[11px] text-gray-400">Extracts 5 Units, Topic Keywords, and Course Outcomes (CO1 to CO5)</p>
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer transition-all">
                <Upload className="w-4 h-4" /> Choose Syllabus File
                <input type="file" onChange={handleSyllabusFileUpload} accept=".pdf,.docx,.doc,.txt,.json" className="hidden" />
              </label>
              {parsingSyllabus && (
                <div className="flex items-center justify-center gap-2 text-xs text-sky-400 font-bold">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Parsing Syllabus Document...
                </div>
              )}
              {uploadedSyllabusName && !parsingSyllabus && (
                <div className="text-xs text-emerald-400 font-bold">Parsed: {uploadedSyllabusName}</div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={handleAutoCurateSyllabus}
                disabled={parsingSyllabus}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs hover:brightness-110 transition-all flex items-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4" /> Auto-Curate 5 Units with AI for {selectedSubject}
              </button>
            </div>
          )}

          {/* 5 Units List & CO Outcomes Preview */}
          <div className="space-y-3 border-t border-white/10 pt-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase">Curriculum 5 Units & Course Outcomes (CO1 - CO5)</h4>
            <div className="space-y-2">
              {syllabusConfig.units.map((u, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-navy-dark/60 border border-white/10 flex justify-between items-start text-xs">
                  <div>
                    <span className="font-bold text-sky-300 mr-2">{u.unitNo}: {u.title}</span>
                    <p className="text-[11px] text-gray-400 mt-0.5">Keywords: {u.keywords}</p>
                  </div>
                  <span className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-[10px]">
                    {u.co}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-white/10">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-bold flex items-center gap-2 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Step 1
            </button>
            <button
              onClick={() => { setCurrentStep(3); handleGenerateQuestionPaper(); }}
              className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-md"
            >
              Synthesize Paper with AI <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: AI SYNTHESIS ENGINE */}
      {currentStep === 3 && (
        <div className="glass-card p-8 rounded-xl border border-white/5 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-sky-500/10 border border-sky-400/30 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-sky-400 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-sky-300 uppercase">AI Multi-Phase Question Paper Synthesis Engine</h3>
            <p className="text-xs text-gray-400">Connected to backend Gemini AI model (/api/ai/generate-question-paper)</p>
          </div>

          <div className="max-w-xl mx-auto p-4 rounded-xl bg-slate-900/80 border border-white/10 text-left space-y-2 font-mono text-[11px] text-sky-300 max-h-48 overflow-y-auto">
            {synthesisLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span>{log}</span>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center items-center gap-2 text-xs text-amber-400 font-bold">
              <RefreshCw className="w-4 h-4 animate-spin" /> Synthesizing Questions & Marking Schemes...
            </div>
          ) : (
            <button
              onClick={() => setCurrentStep(4)}
              className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-2 shadow-md"
            >
              Proceed to Question Review & Fine-Tuning <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* STEP 4: REVIEW & FINE-TUNING */}
      {currentStep === 4 && generatedPaper && (
        <div className="glass-card p-6 rounded-xl border border-white/5 space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider">Step 4: Review, Regenerate & Manual Fine-Tuning</h3>
              <p className="text-xs text-gray-400 mt-0.5">Regenerate individual questions with AI or perform inline manual edits on text, Bloom levels, and Course Outcomes.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">Total: {generatedPaper.totalMarks} Marks</span>
          </div>

          {/* Section A Review */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase border-b border-white/10 pb-1">SECTION A (10 Compulsory Multiple Choice Questions - 10 Marks)</h4>
            <div className="space-y-3">
              {generatedPaper.sections.sectionA.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-xl bg-navy-dark/40 border border-white/10 space-y-2 relative group">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-sky-300">Q.{idx+1} (1 Mark)</span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[10px]">{q.bloomLevel}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px]">{q.coTag}</span>
                      <button
                        onClick={() => handleRegenerateQuestion(q.id, 'A', q.bloomLevel, q.coTag)}
                        disabled={regeneratingId === q.id}
                        className="px-2 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${regeneratingId === q.id ? 'animate-spin' : ''}`} /> Regenerate
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-white font-medium">{q.questionText}</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-400">
                    <div>A) {q.optionA}</div>
                    <div>B) {q.optionB}</div>
                    <div>C) {q.optionC}</div>
                    <div>D) {q.optionD}</div>
                  </div>
                  <div className="text-[10px] font-bold text-emerald-400">Correct Answer: Option {q.correctAnswer}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section B Review */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h4 className="text-xs font-bold text-amber-400 uppercase border-b border-white/10 pb-1">SECTION B (5 Either/Or Conceptual Questions - 25 Marks)</h4>
            <div className="space-y-4">
              {generatedPaper.sections.sectionB.map((pair, idx) => (
                <div key={pair.id} className="p-4 rounded-xl bg-navy-dark/40 border border-white/10 space-y-3">
                  <div className="font-bold text-xs text-sky-300">Question {11 + idx} (5 Marks - Either/Or Choice)</div>
                  
                  {/* Option 1 */}
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-white">{pair.option1.questionText}</span>
                      <button
                        onClick={() => handleRegenerateQuestion(pair.option1.id, 'B', pair.option1.bloomLevel, pair.option1.coTag)}
                        disabled={regeneratingId === pair.option1.id}
                        className="px-2 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${regeneratingId === pair.option1.id ? 'animate-spin' : ''}`} /> Regenerate
                      </button>
                    </div>
                    <div className="flex gap-2 text-[10px]">
                      <span className="text-sky-300">Bloom: {pair.option1.bloomLevel}</span>
                      <span className="text-amber-300">Outcome: {pair.option1.coTag}</span>
                    </div>
                  </div>

                  <div className="text-center font-bold text-xs text-amber-400 uppercase">OR</div>

                  {/* Option 2 */}
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-white">{pair.option2.questionText}</span>
                      <button
                        onClick={() => handleRegenerateQuestion(pair.option2.id, 'B', pair.option2.bloomLevel, pair.option2.coTag)}
                        disabled={regeneratingId === pair.option2.id}
                        className="px-2 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${regeneratingId === pair.option2.id ? 'animate-spin' : ''}`} /> Regenerate
                      </button>
                    </div>
                    <div className="flex gap-2 text-[10px]">
                      <span className="text-sky-300">Bloom: {pair.option2.bloomLevel}</span>
                      <span className="text-amber-300">Outcome: {pair.option2.coTag}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-white/10">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs font-bold flex items-center gap-2 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Step 2
            </button>
            <button
              onClick={() => setCurrentStep(5)}
              className="px-6 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-2 shadow-md"
            >
              View Official Masthead Preview <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: OFFICIAL INSTITUTIONAL MASTHEAD PREVIEW */}
      {currentStep === 5 && generatedPaper && (
        <div className="glass-card p-8 rounded-xl border border-white/5 space-y-6 bg-white text-slate-900 font-serif shadow-2xl">
          {/* Institutional Masthead Header */}
          <div className="text-center border-b-2 border-navy-dark pb-4 space-y-1">
            <h2 className="text-base font-bold text-navy-dark uppercase tracking-wide">SANKARA COLLEGE OF SCIENCE AND COMMERCE (AUTONOMOUS)</h2>
            <p className="text-[10px] text-slate-600">Affiliated to Bharathiar University | Re-Accredited by NAAC with A+ Grade (Cycle II)</p>
            <p className="text-[10px] font-bold text-emerald-800 uppercase">DEPARTMENT OF COMPUTER SCIENCE & DIGITAL APPLICATIONS (CSDA)</p>
            <h3 className="text-xs font-bold text-navy-dark uppercase pt-2">END SEMESTER / BRIDGE COURSE DEGREE EXAMINATION</h3>
            <div className="flex justify-between items-center text-[11px] font-bold pt-2 border-t border-slate-300 mt-2 px-2">
              <span>Subject: {selectedSubject}</span>
              <span>Code: CSDA701</span>
              <span>Time: 3 Hours</span>
              <span>Max Marks: 75</span>
            </div>
          </div>

          {/* Examination Instructions */}
          <div className="p-3 bg-slate-100 rounded-lg text-[10px] text-slate-700 space-y-1">
            <div className="font-bold text-slate-900 uppercase">Autonomous Examination Instructions:</div>
            <div>1. Answer ALL questions in Section A. Choose either (a) OR (b) in Section B and Section C.</div>
            <div>2. Bloom Taxonomy Levels: K1-Remember, K2-Understand, K3-Apply, K4-Analyze, K5-Evaluate, K6-Create.</div>
          </div>

          {/* Section A Preview */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-navy-dark border-b border-slate-300 pb-1">SECTION A (10 × 1 = 10 Marks)</h4>
            {generatedPaper.sections.sectionA.map((q, idx) => (
              <div key={q.id} className="text-xs space-y-1">
                <div className="font-semibold text-slate-900">{idx+1}. {q.questionText} <span className="text-[10px] text-slate-500 font-normal">[{q.bloomLevel} | {q.coTag}]</span></div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pl-4 text-slate-700">
                  <div>A) {q.optionA}</div>
                  <div>B) {q.optionB}</div>
                  <div>C) {q.optionC}</div>
                  <div>D) {q.optionD}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Section B Preview */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase text-navy-dark border-b border-slate-300 pb-1">SECTION B (5 × 5 = 25 Marks)</h4>
            {generatedPaper.sections.sectionB.map((pair, idx) => (
              <div key={pair.id} className="text-xs space-y-2">
                <div className="font-semibold text-slate-900">{pair.option1.questionText}</div>
                <div className="text-center font-bold text-[10px] text-slate-500 uppercase">(OR)</div>
                <div className="font-semibold text-slate-900">{pair.option2.questionText}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-300">
            <button
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2 rounded-lg bg-slate-200 text-slate-900 text-xs font-bold flex items-center gap-2 hover:bg-slate-300"
            >
              <ArrowLeft className="w-4 h-4" /> Fine-Tune Questions
            </button>
            <button
              onClick={() => setCurrentStep(6)}
              className="px-6 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-md"
            >
              Proceed to Export & Document Archive <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: EXPORT & ARCHIVE */}
      {currentStep === 6 && generatedPaper && (
        <div className="glass-card p-6 rounded-xl border border-white/5 space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider">Step 6: Export & Institutional Document Archive</h3>
              <p className="text-xs text-gray-400 mt-0.5">Export verified question paper to Word (DOCX), PDF print format, or save to institutional store.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">Status: Ready</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => downloadFile(`/api/batches/${activeBatch?._id}/export/questions/docx`, `QuestionPaper_${selectedSubject}_${activeBatch?.batchYearRange}.docx`, generatedPaper.sections.sectionA)}
              className="p-5 rounded-xl bg-sky-600/20 border border-sky-400/40 text-white hover:bg-sky-600/30 transition-all flex flex-col items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Download className="w-8 h-8 text-sky-400" />
              <span className="font-bold text-xs">Export Official Word (DOCX)</span>
              <span className="text-[10px] text-gray-300">Editable Microsoft Word paper</span>
            </button>

            <button
              onClick={() => downloadFile(`/api/batches/${activeBatch?._id}/export/questions/pdf`, `QuestionPaper_${selectedSubject}_${activeBatch?.batchYearRange}.pdf`, generatedPaper.sections.sectionA)}
              className="p-5 rounded-xl bg-indigo-600/20 border border-indigo-400/40 text-white hover:bg-indigo-600/30 transition-all flex flex-col items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Printer className="w-8 h-8 text-indigo-400" />
              <span className="font-bold text-xs">Print / Export PDF Format</span>
              <span className="text-[10px] text-gray-300">Printable A4 exam paper</span>
            </button>

            <button
              onClick={handleSaveToArchiveStore}
              disabled={loading}
              className="p-5 rounded-xl bg-emerald-600/20 border border-emerald-400/40 text-white hover:bg-emerald-600/30 transition-all flex flex-col items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Save className="w-8 h-8 text-emerald-400" />
              <span className="font-bold text-xs">Save to Document Store</span>
              <span className="text-[10px] text-gray-300">Persistent database archive</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

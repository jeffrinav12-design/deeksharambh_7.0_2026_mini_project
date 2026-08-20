import React, { useState } from 'react';
import { Bot, Sparkles, Send, Plus, CheckCircle, BookOpen, Layers } from 'lucide-react';

const BLOOM_LEVELS = [
  { id: 'Remembering', label: '1. Remembering', desc: 'Recall facts, definitions & concepts', color: 'bg-sky-100 text-sky-800 border-sky-300' },
  { id: 'Understanding', label: '2. Understanding', desc: 'Explain ideas & interpretations', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'Applying', label: '3. Applying', desc: 'Execute procedures & solve problems', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
  { id: 'Analyzing', label: '4. Analyzing', desc: 'Distinguish components & structure', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { id: 'Evaluating', label: '5. Evaluating', desc: 'Critique & justify decisions', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  { id: 'Creating', label: '6. Creating', desc: 'Synthesize & construct new ideas', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
];

export default function AiQuestionChatbot({ onAddQuestion, subjects = ['Tamil', 'English', 'Mathematics', 'Core'] }) {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0] || 'Core');
  const [selectedLevel, setSelectedLevel] = useState('Understanding');
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "👋 Hello Professor! I am your AI Bloom's Taxonomy Question Generator. Select a subject and cognitive level, or ask me to generate specialized assessment MCQs!",
      questions: []
    }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [addedIds, setAddedIds] = useState([]);

  // Local Bloom's Taxonomy AI generator engine
  const handleGenerate = (customTopic = null) => {
    const topic = customTopic || prompt.trim() || selectedSubject;
    setIsGenerating(true);

    const userMessage = {
      sender: 'user',
      text: `Generate ${selectedLevel} level questions for "${topic}" in ${selectedSubject}`
    };
    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      const generated = generateBloomQuestions(selectedSubject, topic, selectedLevel);
      const aiReply = {
        sender: 'ai',
        text: `Here are 2 Bloom's Taxonomy (${selectedLevel} Level) questions generated for ${selectedSubject}:`,
        questions: generated
      };
      setMessages(prev => [...prev, aiReply]);
      setIsGenerating(false);
      setPrompt('');
    }, 800);
  };

  const generateBloomQuestions = (subject, topic, level) => {
    const idBase = Date.now();
    
    if (subject === 'Mathematics') {
      if (level === 'Remembering' || level === 'Understanding') {
        return [
          {
            id: idBase,
            subject,
            topic,
            bloomLevel: level,
            questionText: `Which of the following describes the derivative of a function f(x)?`,
            options: ['The area under the curve', 'The rate of change or slope of tangent', 'The average value of the function', 'The maximum bound'],
            correctOption: 1,
            explanation: 'Derivative measures the instantaneous rate of change or slope of tangent line.'
          },
          {
            id: idBase + 1,
            subject,
            topic,
            bloomLevel: level,
            questionText: `What is the value of ∫ x dx?`,
            options: ['x² + C', '(1/2)x² + C', 'x + C', '2x + C'],
            correctOption: 1,
            explanation: 'Integration of x¹ gives (1/2)x² + C.'
          }
        ];
      } else {
        return [
          {
            id: idBase,
            subject,
            topic,
            bloomLevel: level,
            questionText: `If f(x) = 3x² + 4x - 5, calculate f'(2) using differentiation rules.`,
            options: ['10', '16', '12', '14'],
            correctOption: 1,
            explanation: `f'(x) = 6x + 4. At x=2, f'(2) = 6(2) + 4 = 16.`
          },
          {
            id: idBase + 1,
            subject,
            topic,
            bloomLevel: level,
            questionText: `Analyze the matrix A = [[2, 0], [0, 5]]. What are its eigenvalues?`,
            options: ['2 and 5', '0 and 7', '1 and 10', '-2 and -5'],
            correctOption: 0,
            explanation: 'For diagonal matrices, eigenvalues are the diagonal entries 2 and 5.'
          }
        ];
      }
    }

    if (subject === 'Core' || subject.includes('CS') || subject.includes('Data')) {
      if (level === 'Remembering' || level === 'Understanding') {
        return [
          {
            id: idBase,
            subject: 'Core',
            topic,
            bloomLevel: level,
            questionText: `Which data structure operates on a Last-In, First-Out (LIFO) principle?`,
            options: ['Queue', 'Stack', 'Array', 'Linked List'],
            correctOption: 1,
            explanation: 'Stack works strictly on LIFO principle (push and pop at top).'
          },
          {
            id: idBase + 1,
            subject: 'Core',
            topic,
            bloomLevel: level,
            questionText: `What is the main function of an Operating System Kernel?`,
            options: ['Designing web pages', 'Managing hardware resources and memory', 'Compiling source code', 'Creating database tables'],
            correctOption: 1,
            explanation: 'Kernel is the core component managing system hardware and processes.'
          }
        ];
      } else {
        return [
          {
            id: idBase,
            subject: 'Core',
            topic,
            bloomLevel: level,
            questionText: `Evaluate the worst-case time complexity of QuickSort algorithm.`,
            options: ['O(N log N)', 'O(N²)', 'O(N)', 'O(1)'],
            correctOption: 1,
            explanation: 'QuickSort has O(N²) worst-case when pivot selection is poor.'
          },
          {
            id: idBase + 1,
            subject: 'Core',
            topic,
            bloomLevel: level,
            questionText: `Analyze the primary key constraint in SQL databases. Which statement is correct?`,
            options: ['Allows multiple NULL values', 'Uniquely identifies each record and cannot be NULL', 'Stores duplicate strings', 'Is optional for indexing'],
            correctOption: 1,
            explanation: 'Primary keys enforce uniqueness and NOT NULL constraints.'
          }
        ];
      }
    }

    if (subject === 'English') {
      return [
        {
          id: idBase,
          subject,
          topic,
          bloomLevel: level,
          questionText: `Identify the correct passive voice of: "The teacher explained the lesson."`,
          options: ['The lesson is explained by teacher.', 'The lesson was explained by the teacher.', 'The lesson had explained.', 'Teacher explains lesson.'],
          correctOption: 1,
          explanation: 'Past simple active changes to "was + past participle" in passive.'
        },
        {
          id: idBase + 1,
          subject,
          topic,
          bloomLevel: level,
          questionText: `Choose the correct synonym for "Meticulous":`,
          options: ['Careless', 'Diligent / Thorough', 'Hasty', 'Obscure'],
          correctOption: 1,
          explanation: 'Meticulous means showing great attention to detail; thorough.'
        }
      ];
    }

    // Default Tamil / General
    return [
      {
        id: idBase,
        subject,
        topic,
        bloomLevel: level,
        questionText: `தமிழ் இலக்கணத்தில் 'தொகைநிலைத் தொடர்' எத்தனை வகைப்படும்?`,
        options: ['4 வகை', '6 வகை', '8 வகை', '5 வகை'],
        correctOption: 1,
        explanation: 'தொகைநிலைத் தொடர் 6 வகைப்படும்.'
      },
      {
        id: idBase + 1,
        subject,
        topic,
        bloomLevel: level,
        questionText: `திருக்குறளில் உள்ள மொத்த அதிகாரங்கள் எத்தனை?`,
        options: ['100', '133', '150', '1330'],
        correctOption: 1,
        explanation: 'திருக்குறள் 133 அதிகாரங்களைக் கொண்டுள்ளது.'
      }
    ];
  };

  const handleAdd = (q) => {
    onAddQuestion(q);
    setAddedIds(prev => [...prev, q.id]);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden mb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 px-6 py-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              Bloom's Taxonomy Question Generator AI
              <span className="px-2 py-0.5 text-xs bg-sky-200 text-blue-900 font-semibold rounded-full">v2.5</span>
            </h3>
            <p className="text-xs text-blue-100">Automatically curate & generate MCQs mapped to cognitive learning levels</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-blue-50 font-medium">
            Subject: {selectedSubject}
          </span>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="p-4 bg-sky-50/50 border-b border-sky-100 flex flex-wrap gap-4 items-center justify-between">
        {/* Subject Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-sky-900 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-sky-600" /> Target Subject:
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 bg-white border border-sky-200 text-xs font-medium text-slate-800 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Bloom's Level Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-sky-900 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-sky-600" /> Bloom's Level:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {BLOOM_LEVELS.map(lvl => (
              <button
                key={lvl.id}
                onClick={() => setSelectedLevel(lvl.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                  selectedLevel === lvl.id
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                    : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-100'
                }`}
                title={lvl.desc}
              >
                {lvl.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="p-4 max-h-[320px] overflow-y-auto space-y-4 bg-slate-50/40">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                AI
              </div>
            )}

            <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${
              m.sender === 'user'
                ? 'bg-sky-600 text-white rounded-br-none shadow-sm'
                : 'bg-white border border-sky-100 text-slate-800 rounded-bl-none shadow-sm'
            }`}>
              <p className="font-medium text-xs mb-1 opacity-90">{m.text}</p>

              {m.questions && m.questions.length > 0 && (
                <div className="mt-3 space-y-3">
                  {m.questions.map((q) => {
                    const isAdded = addedIds.includes(q.id);
                    return (
                      <div key={q.id} className="p-3 bg-sky-50/60 border border-sky-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-sky-200 text-sky-900 uppercase tracking-wide">
                            {q.bloomLevel} Level
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">{q.subject}</span>
                        </div>

                        <p className="font-semibold text-xs text-slate-900">{q.questionText}</p>

                        <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-700">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className={`p-1.5 rounded-lg border text-[11px] ${
                              oIdx === q.correctOption 
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold' 
                                : 'bg-white border-slate-200'
                            }`}>
                              <span className="font-bold text-slate-400 mr-1">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-sky-200/60">
                          <span className="text-[10px] text-slate-500 italic">💡 {q.explanation}</span>
                          <button
                            onClick={() => handleAdd(q)}
                            disabled={isAdded}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                              isAdded
                                ? 'bg-emerald-100 text-emerald-800 cursor-default'
                                : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Added to Bank
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" /> Add to Bank
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                You
              </div>
            )}
          </div>
        ))}

        {isGenerating && (
          <div className="flex gap-2 items-center text-xs text-sky-600 font-medium pl-10">
            <Sparkles className="w-4 h-4 animate-spin text-sky-500" /> AI is crafting Bloom's Taxonomy questions...
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-white border-t border-sky-100 flex items-center gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          placeholder={`Ask AI: e.g. "Create 2 ${selectedLevel} questions for ${selectedSubject}..."`}
          className="flex-1 px-4 py-2 bg-slate-50 border border-sky-200 text-xs text-slate-800 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
        />
        <button
          onClick={() => handleGenerate()}
          disabled={isGenerating}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" /> Generate
        </button>
      </div>
    </div>
  );
}

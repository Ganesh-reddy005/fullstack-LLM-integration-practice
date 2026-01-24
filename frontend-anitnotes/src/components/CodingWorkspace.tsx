"use client";
import React, { useState, useEffect } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { Sparkles, Lightbulb, ChevronRight, ChevronLeft, Play, HelpCircle, AlertTriangle } from 'lucide-react';
import { authFetch } from '@/utils/auth'; // <--- IMPORT THIS

loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' } });

// ... Interfaces stay the same ...
interface ProblemSummary { problem_id: string; title: string; difficulty: string; }
interface ProblemDetail extends ProblemSummary { description: string; starter_code: string; }

// 👇 NO PROPS NEEDED NOW
export default function CodingWorkspace() {
  
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentProblem, setCurrentProblem] = useState<ProblemDetail | null>(null);
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHinting, setIsHinting] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProblems() {
      // 👇 Use authFetch
      const res = await authFetch('http://localhost:8000/problems/');
      if (res && res.ok) {
        const data = await res.json();
        setProblems(data);
        if (data.length > 0) fetchProblemDetails(data[0].problem_id);
      }
    }
    fetchProblems();
  }, []);

  const fetchProblemDetails = async (id: string) => {
    setEvaluation(null); setHint(null);
    // 👇 Use authFetch
    const res = await authFetch(`http://localhost:8000/problems/${id}`);
    if (res && res.ok) {
      const data = await res.json();
      setCurrentProblem(data);
      setCode(data.starter_code || "# Write your code here");
    }
  };

  const handleNext = () => {
    if (currentIndex < problems.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      fetchProblemDetails(problems[newIndex].problem_id);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      fetchProblemDetails(problems[newIndex].problem_id);
    }
  };

  const handleHint = async () => {
    if (!currentProblem) return;
    setIsHinting(true);
    setHint(null);
    
    try {
      // 👇 Use authFetch & Remove user_id from body
      const res = await authFetch('http://localhost:8000/hint/', {
        method: 'POST',
        body: JSON.stringify({
          problem_id: currentProblem.problem_id,
          code: code,
          user_question: "I am stuck. Give me a conceptual hint."
        }),
      });
      if (res && res.ok) {
        const data = await res.json();
        setHint(data.hint);
      }
    } catch (err) { console.error(err); } 
    finally { setIsHinting(false); }
  };

  const handleSubmit = async () => {
    if (!currentProblem) return;
    setIsSubmitting(true);
    setEvaluation(null);
    setHint(null);

    try {
      // 👇 Use authFetch & Remove user_id from body
      const res = await authFetch('http://localhost:8000/submit/', {
        method: 'POST',
        body: JSON.stringify({
          code: code,
          language: "python",
          problem_id: currentProblem.problem_id
        }),
      });
      if (res && res.ok) {
        const data = await res.json();
        setEvaluation(data.evaluation);
      }
    } catch (err) { console.error(err); } 
    finally { setIsSubmitting(false); }
  };

  // ... RENDER (Return) stays exactly the same ...
  // (Just keep the JSX you had before)
  return (
      // ... same JSX ...
      <div className="flex flex-col h-screen bg-gray-50 text-gray-800 font-sans">
        {/* Just Ensure you use currentProblem, handleHint, handleSubmit variables from above */}
        {/* Copy the previous JSX return block here */}
        {/* ... */}
         {/* --- TOP BAR --- */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6 justify-between shadow-sm z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
             <Sparkles size={24} className="text-indigo-500" /> AntiNotes
          </div>
          
          {/* Problem Navigator */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-2">
            <button onClick={handlePrev} disabled={currentIndex === 0} className="p-1 hover:bg-white rounded-md disabled:opacity-30 transition-all">
              <ChevronLeft size={18} />
            </button>
            <span className="text-xs font-mono font-medium px-4 min-w-[150px] text-center truncate">
              {currentProblem ? currentProblem.title : "Loading..."}
            </span>
            <button onClick={handleNext} disabled={currentIndex === problems.length - 1} className="p-1 hover:bg-white rounded-md disabled:opacity-30 transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
           {/* HINT BUTTON */}
           <button 
            onClick={handleHint}
            disabled={isHinting || !currentProblem}
            className="flex items-center gap-2 px-4 py-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-semibold text-sm transition-all border border-indigo-200"
          >
            {isHinting ? 'Thinking...' : 'Get Hint'} <HelpCircle size={16} />
          </button>

          {/* SUBMIT BUTTON */}
           <button 
            onClick={handleSubmit}
            disabled={isSubmitting || !currentProblem}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-all shadow-md active:scale-95"
          >
            {isSubmitting ? 'Evaluating...' : 'Run Code'} <Play size={16} fill="currentColor" />
          </button>
        </div>
      </div>

      {/* --- MAIN GRID --- */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 overflow-hidden">
        
        {/* LEFT COLUMN: Problem & Feedback */}
        <div className="lg:col-span-2 border-r border-gray-200 overflow-y-auto bg-white p-8 custom-scrollbar relative">
          {currentProblem ? (
            <div className="animate-in fade-in duration-500">
              
              {/* Difficulty Badge */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide 
                  ${currentProblem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : 
                    currentProblem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                  {currentProblem.difficulty}
                </span>
              </div>
              
              <h1 className="text-3xl font-extrabold text-gray-900 mb-6">{currentProblem.title}</h1>
              
              {/* Description (whitespace-pre-wrap preserves newlines) */}
              <div className="prose prose-indigo text-gray-600 mb-8 whitespace-pre-wrap font-medium leading-relaxed text-sm">
                {currentProblem.description}
              </div>

              {/* --- DYNAMIC SECTIONS --- */}
              
              {/* 1. HINT BOX (Only shows if 'hint' exists) */}
              {hint && (
                <div className="mb-6 p-5 bg-yellow-50 rounded-xl border border-yellow-200 animate-in slide-in-from-left-4">
                  <div className="flex items-center gap-2 text-yellow-800 font-bold mb-2">
                    <Lightbulb size={18} /> Mentor Hint:
                  </div>
                  <p className="text-sm text-yellow-900 italic">
                    "{hint}"
                  </p>
                </div>
              )}

              {/* 2. FEEDBACK BOX (Only shows if 'evaluation' exists) */}
              {evaluation && (
                <div className={`p-6 rounded-xl border animate-in slide-in-from-bottom-4 ${evaluation.score === 100 ? 'bg-green-50 border-green-200' : 'bg-indigo-50 border-indigo-100'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900">Mentor Feedback</h3>
                    <span className={`text-2xl font-black ${evaluation.score === 100 ? 'text-green-600' : 'text-indigo-600'}`}>
                      {evaluation.score}/100
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-800 mb-4 whitespace-pre-line">
                    {evaluation.feedback}
                  </p>
                  
                  {/* Bottlenecks List */}
                  {evaluation.bottlenecks?.length > 0 && (
                    <div className="space-y-2 mt-4 pt-4 border-t border-gray-200">
                      <span className="text-xs font-bold text-gray-500 uppercase">Areas to Improve:</span>
                      {evaluation.bottlenecks.map((b: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-red-600 bg-white px-3 py-2 rounded border border-red-100 shadow-sm">
                           <AlertTriangle size={12} className="mt-0.5" /> {b}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">Loading...</div>
          )}
        </div>

        {/* RIGHT COLUMN: Code Editor */}
        <div className="lg:col-span-3 flex flex-col bg-gray-50">
          <Editor
            height="100%"
            defaultLanguage="python"
            theme="light" // 'vs-dark' is also available
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{
              fontFamily: '"Fira Code", monospace',
              fontSize: 14,
              minimap: { enabled: false }, // Hides the tiny map on right
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              padding: { top: 20 },
            }}
          />
        </div>

      </div>
      </div>
  );
}
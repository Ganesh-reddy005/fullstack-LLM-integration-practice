"use client";
import React, { useState } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { BookOpen, Code2, Sparkles, Lightbulb, AlertCircle, CheckCircle2 } from 'lucide-react';

// Configure monaco to load files from CDN
loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' } });

export default function CodingWorkspace() {
  // State for Code, Submission Status, and AI Evaluation
  const [code, setCode] = useState('"""\nThought Process:\n1. What is the goal?\n2. What are the edge cases?\n\nApproach:\n"""\n\ndef solution(n):\n    # Start translating your thoughts into code below\n    pass');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setEvaluation(null);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/submit/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          language: "python",
          problem_id: "sum_of_divisors" 
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      // Expecting { status: "success", evaluation: { score, feedback, suggested_level, bottlenecks } }
      setEvaluation(data.evaluation);
      
    } catch (err) {
      console.error("Submission failed:", err);
      setError("Could not connect to the evaluation engine. Please ensure your FastAPI backend is running on port 8000.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans text-gray-800">
      {/* Header */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center px-8 justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
             <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 leading-tight">AntiNotes.dev</h1>
            <p className="text-xs text-gray-500 font-medium tracking-wider uppercase">Engineering from First Principles</p>
          </div>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-semibold text-sm shadow-sm hover:shadow-md active:scale-95 ${
            isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isSubmitting ? <Sparkles className="animate-spin" size={18} /> : <Lightbulb size={18} />}
          {isSubmitting ? 'Evaluating...' : 'Submit Approach'}
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 overflow-hidden">
        
        {/* Left Side: Question & Feedback Panel */}
        <div className="lg:col-span-2 border-r border-gray-200 overflow-y-auto bg-white p-10 custom-scrollbar">
          <div className="flex items-center gap-2 text-indigo-600 mb-6">
            <BookOpen size={20} />
            <span className="text-xs font-bold tracking-widest uppercase">Problem Context</span>
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Sum of Divisors</h2>
          
          <div className="prose prose-gray prose-lg max-w-none mb-10">
            <p>
              Given a positive integer <code className="bg-gray-100 px-2 py-1 rounded-md text-indigo-700 font-mono text-sm">n</code>, calculate the sum of all its divisors.
            </p>
            
            <div className="my-8 p-6 bg-gray-50 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-base font-bold text-gray-700 mb-3 uppercase tracking-wide">Example</h3>
              <div className="font-mono text-sm">
                <p><span className="text-gray-500">Input:</span> n = 6</p>
                <p><span className="text-gray-500">Output:</span> 12 (1+2+3+6)</p>
              </div>
            </div>

            <h3 className="text-lg font-bold">Guiding Questions</h3>
            <ul className="text-sm space-y-2">
              <li>What is the largest possible divisor of <code className="text-sm">n</code>?</li>
              <li>Is there a mathematical boundary to optimize the search?</li>
            </ul>
          </div>

          {/* AI Evaluation Section */}
          <div className="mt-12">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-700 text-sm">
                <AlertCircle size={20} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {evaluation && (
              <div className="p-8 bg-white rounded-3xl border-2 border-indigo-100 shadow-xl animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Engineering Feedback</h3>
                  <div className="px-4 py-1.5 bg-indigo-600 text-white rounded-full font-mono font-bold text-sm">
                    Score: {evaluation.score}/100
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Growth Level</p>
                    <p className="text-2xl font-black text-indigo-600">Lvl {evaluation.suggested_level}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Verdict</p>
                    <p className="text-sm font-bold text-gray-700">{evaluation.score >= 80 ? 'Mastery' : 'Iterate'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Mentor Notes</p>
                    <p className="text-gray-700 text-sm leading-relaxed italic border-l-4 border-indigo-200 pl-4">
                      "{evaluation.feedback}"
                    </p>
                  </div>

                  {evaluation.bottlenecks && evaluation.bottlenecks.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">Bottlenecks</p>
                      <ul className="space-y-2">
                        {evaluation.bottlenecks.map((item: string, i: number) => (
                          <li key={i} className="text-xs bg-red-50 text-red-600 px-3 py-2 rounded-lg font-medium border border-red-100 flex gap-2">
                            <span className="opacity-40">#</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Code Editor */}
        <div className="lg:col-span-3 flex flex-col bg-gray-50">
          <div className="flex items-center justify-between px-6 py-3 bg-gray-100 border-b border-gray-200 text-gray-600">
            <div className="flex items-center gap-2">
                <Code2 size={18} />
                <span className="text-sm font-semibold tracking-wider uppercase">Workspace</span>
            </div>
            <span className="text-xs font-mono text-gray-500">Python 3.10</span>
          </div>
          
          <div className="flex-1 relative">
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="light"
              value={code}
              onChange={(value) => setCode(value || '')}
              loading={<div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-400 italic">Warming up Thinking Engine...</div>}
              options={{
                fontFamily: '"Fira Code", "JetBrains Mono", monospace',
                fontSize: 15,
                lineHeight: 24,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                padding: { top: 24, bottom: 24 },
                cursorBlinking: 'smooth',
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
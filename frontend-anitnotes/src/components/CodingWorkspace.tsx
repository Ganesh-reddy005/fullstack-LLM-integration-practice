"use client";
import React, { useState } from 'react';
import Editor, {loader} from '@monaco-editor/react';
import { BookOpen, Code2, Sparkles, Lightbulb } from 'lucide-react';

// Optional: Configure monaco to load files from CDN if local loading fails
loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' } });

export default function CodingWorkspace() {
  // Pre-filling with a "thinking" template instead of just 'pass'
  const [code, setCode] = useState('"""\nThought Process:\n1. What is the goal?\n2. What are the edge cases?\n\nApproach:\n"""\n\ndef solution(n):\n    # Start translating your thoughts into code below\n    pass');

  const handleSubmit = async () => {
    console.log("Submitting code to FastAPI:", code);
    alert("Approach submitted for evaluation! (Connection coming next)");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans text-gray-800">
      {/* Header - Clean & Minimal */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center px-8 justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
             <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 leading-tight">AntiNotes.dev</h1>
            <p className="text-xs text-gray-500 font-medium tracking-wider uppercase">Focus on the 'Why', not just the 'How'</p>
          </div>
        </div>
        <button 
          onClick={handleSubmit}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl transition-all font-semibold text-sm shadow-sm hover:shadow-md active:scale-95"
        >
          <Lightbulb size={18} /> Submit Approach
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 overflow-hidden">
        
        {/* Left Side: Question Panel (Takes 2/5 width on large screens for better reading) */}
        <div className="lg:col-span-2 border-r border-gray-200 overflow-y-auto bg-white p-10 custom-scrollbar">
          <div className="flex items-center gap-2 text-indigo-600 mb-6">
            <BookOpen size={20} />
            <span className="text-xs font-bold tracking-widest uppercase">Problem Context</span>
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Sum of Divisors</h2>
          
          {/* Using 'prose-gray' for a softer, highly readable typography style */}
          <div className="prose prose-gray prose-lg max-w-none">
            <p>
              We want to understand the building blocks of a number. Given a positive integer <code className="bg-gray-100 px-2 py-1 rounded-md text-indigo-700 font-mono text-sm">n</code>, your task is to calculate the sum of all its divisors.
            </p>
            
            <div className="my-8 p-6 bg-gray-50 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-base font-bold text-gray-700 mb-3 uppercase tracking-wide">Thought Starter Example</h3>
              <div className="space-y-2 font-mono text-sm">
                <p><span className="text-gray-500">Input:</span> n = 6</p>
                <p><span className="text-gray-500">Output:</span> 12</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 text-gray-600 text-sm italic flex gap-2">
                <Lightbulb size={16} className="text-yellow-500 shrink-0 mt-0.5"/>
                <p>Think: The divisors of 6 are 1, 2, 3, and 6. If you add them up (1+2+3+6), you get 12.</p>
              </div>
            </div>

            <h3>Guiding Questions (Before you code)</h3>
            <ul>
              <li>What is the largest possible divisor of a number <code className="text-sm">n</code> (other than <code className="text-sm">n</code> itself)?</li>
              <li>Do we really need to check every number from 1 up to <code className="text-sm">n</code>? Is there a boundary where divisors stop appearing?</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Code Editor (Takes 3/5 width) */}
        <div className="lg:col-span-3 flex flex-col bg-gray-50">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-6 py-3 bg-gray-100 border-b border-gray-200 text-gray-600">
            <div className="flex items-center gap-2">
                <Code2 size={18} />
                <span className="text-sm font-semibold tracking-wider uppercase">Workspace</span>
            </div>
            <span className="text-xs font-mono text-gray-500">Python 3.10</span>
          </div>
          
          {/* The Editor */}
          <div className="flex-1 relative">
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="light" // Crucial change to light theme
              value={code}
              onChange={(value) => setCode(value || '')}
              loading={<div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-400">Loading Thinking Engine...</div>}
              options={{
                fontFamily: '"Fira Code", "JetBrains Mono", Menlo, Monaco, "Courier New", monospace', // Better coding fonts
                fontSize: 15,
                lineHeight: 24,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'gutter', // subtler highlight
                folding: true,
                padding: { top: 24, bottom: 24 },
                smoothScrolling: true,
                cursorBlinking: 'smooth',
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
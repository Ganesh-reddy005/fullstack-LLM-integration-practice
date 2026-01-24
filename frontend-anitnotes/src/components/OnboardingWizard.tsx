"use client";
import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { authFetch } from '@/utils/auth'; // <--- Import Auth Helper

export default function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for answers
  const [answers, setAnswers] = useState({
    experience: "",
    mission: "",
    style: "",
    block: ""
  });

  const handleSelect = (key: string, value: string) => {
    setAnswers({ ...answers, [key]: value });
  };

  const handleNext = () => setStep(step + 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 👇 Use authFetch (No user_id needed)
      const res = await authFetch('http://localhost:8000/onboarding/complete', {
        method: 'POST',
        body: JSON.stringify(answers)
      });
      
      if (res && res.ok) {
        onComplete(); // Tell parent (page.tsx) to close wizard
      } else {
        alert("Failed to save profile. Try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI RENDER ---
  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-2xl w-full p-8 rounded-2xl shadow-xl border border-gray-100">
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-2 rounded-full mb-8 overflow-hidden">
          <div 
            className="bg-indigo-600 h-full transition-all duration-500 ease-out" 
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* STEP 1: EXPERIENCE */}
        {step === 1 && (
          <QuestionStep 
            title="What is your current coding level?"
            options={["Beginner (Hello World)", "Intermediate (Can build apps)", "Advanced (System Design)"]}
            selected={answers.experience}
            onSelect={(val) => handleSelect("experience", val)}
            onNext={handleNext}
          />
        )}

        {/* STEP 2: MISSION */}
        {step === 2 && (
          <QuestionStep 
            title="What is your main goal?"
            options={["Crack Interviews (FAANG)", "Build my own Startup", "Just learning for fun"]}
            selected={answers.mission}
            onSelect={(val) => handleSelect("mission", val)}
            onNext={handleNext}
          />
        )}

        {/* STEP 3: MENTAL BLOCK */}
        {step === 3 && (
          <QuestionStep 
            title="What struggles do you face?"
            options={["I get stuck on logic", "I give up too easily", "I can't remember syntax", "No struggles, I'm just slow"]}
            selected={answers.block}
            onSelect={(val) => handleSelect("block", val)}
            onNext={handleNext}
          />
        )}

        {/* STEP 4: FEEDBACK STYLE */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How should the AI treat you?</h2>
            <div className="grid gap-3 mb-8">
              {["Drill Sergeant (Strict)", "Supportive Coach (Kind)", "Technicallly Precise (Robot)"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSelect("style", opt)}
                  className={`p-4 text-left rounded-xl border-2 transition-all flex justify-between items-center
                    ${answers.style === opt ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-100 hover:border-gray-300'}`}
                >
                  <span className="font-medium">{opt}</span>
                  {answers.style === opt && <Check size={20} />}
                </button>
              ))}
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={!answers.style || isSubmitting}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? "Saving Profile..." : "Start Coding"} <ArrowRight size={20} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// Helper Component for Steps 1-3
function QuestionStep({ title, options, selected, onSelect, onNext }: any) {
  return (
    <div className="animate-in fade-in slide-in-from-right-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      <div className="grid gap-3 mb-8">
        {options.map((opt: string) => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className={`p-4 text-left rounded-xl border-2 transition-all flex justify-between items-center
              ${selected === opt ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-100 hover:border-gray-300'}`}
          >
            <span className="font-medium">{opt}</span>
            {selected === opt && <Check size={20} />}
          </button>
        ))}
      </div>
      <button 
        onClick={onNext}
        disabled={!selected}
        className="w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Next Step
      </button>
    </div>
  );
}
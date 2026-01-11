"use client";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const currentInput = input;
    setInput('');

    // v1- trying to FILTER and Get only the content of the user messages for the history
    const userOnlyHistory = newMessages
      .filter(m => m.role === 'user')
      .map(m => m.content);

    try {
      const response = await fetch('http://localhost:8000/chat', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentInput,
          history: userOnlyHistory.slice(-5) // Send the last 5 user inputs for context
        }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.text }]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Main render
  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900 p-4">
      {/* Header */}
      <div className="text-center py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text">
          AntiNotes.dev - Demo
        </h1>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto space-y-4 my-4 p-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                m.role === "user"
                  ? "bg-indigo-100 text-indigo-900"
                  : "bg-white border border-gray-200 text-gray-900"
              }`}
            >
              {/* Structured output formatting */}
              <div className="whitespace-pre-wrap leading-relaxed">
                {m.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex gap-2 max-w-4xl mx-auto w-full pb-6">
        <input
          className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
          placeholder="Ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}

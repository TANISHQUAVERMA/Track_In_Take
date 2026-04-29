// src/components/ai/NutritionAssistant.jsx

import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import { X, Sparkles, Loader } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ⚠️ In a real application, this key should be in a .env.local file
// and accessed via process.env.REACT_APP_GEMINI_API_KEY
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ VITE_GEMINI_API_KEY is not defined");
}
const genAI = new GoogleGenerativeAI(API_KEY);

const SmartAssistant = ({ isVisible, onClose }) => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || loading) return;
    setLoading(true);
    setResponse("");

    try {
      const nutritionContextPrompt = `You are a friendly and helpful nutrition assistant for the 
      TrackEats app. Please answer the following user question about nutrition, health, or fitness in a clear and encouraging way. Keep your response concise and easy to read. Question: "${question}"`;
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(nutritionContextPrompt);
      const text = result.response.text();
      setResponse(text);
    } catch (err) {
      console.error("Gemini API Error:", err);
      setResponse(
        "Sorry, I encountered an error trying to get an answer. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

      const handleClose = () => {
    // Reset internal state for the next time it opens
    setQuestion("");
    setResponse("");
    onClose(); // This now signals the parent component to close the modal
  };
  // const modalAnimation = isClosing
  //   ? "animate-fade-out-down"
  //   : "animate-fade-in-up";

  return (
    <>
    

      <AnimatePresence>
        {isVisible && (
          <div
            className="fixed inset-0 bg-[var(--color-bg-backdrop)] backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fade-in"
            onClick={handleClose}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className={`bg-[var(--color-bg-surface)] p-6 rounded-2xl shadow-2xl w-full max-w-lg relative flex flex-col border-2 border-[var(--color-border-default)]`}
            >
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 text-[var(--color-text-muted)] p-1.5 rounded-full hover:bg-[var(--color-bg-interactive-subtle)] hover:text-[var(--color-danger-text)] transition-all duration-300 transform hover:rotate-90"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>

              <h2 className="text-xl font-[var(--font-primary)] text-[var(--color-text-strong)] mb-4 flex items-center gap-2">
                <Sparkles className="text-[var(--color-primary)]" />
                Ask Your Nutrition Assistant
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., What are good sources of vegan protein?"
                  className="w-full bg-[var(--color-bg-app)] border-2 border-[var(--color-border-default)] p-3 rounded-lg text-[var(--color-text-default)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[var(--color-primary)] text-[var(--color-text-on-primary)] px-4 py-3 font-semibold rounded-lg hover:bg-[var(--color-primary-hover)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="animate-spin" /> Thinking...
                    </span>
                  ) : (
                    "Get Answer"
                  )}
                </button>
              </form>

              <AnimatePresence>
                {response && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-5 border-t-2 border-dashed border-[var(--color-border-default)] pt-4 max-h-64 overflow-y-auto custom-scrollbar text-[var(--color-text-default)]"
                  >
                    <div className="prose prose-sm max-w-none prose-p:text-[var(--color-text-default)] prose-strong:text-[var(--color-text-strong)] prose-headings:text-[var(--color-text-strong)] prose-li:marker:text-[var(--color-primary)]">
                      <ReactMarkdown>{response}</ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SmartAssistant;

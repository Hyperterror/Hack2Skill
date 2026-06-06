"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, RefreshCw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your CookWise AI Assistant. Ask me anything about cooking, substituting ingredients, or managing your meal budget!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-6) // send last few messages for context
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I had trouble thinking. Let's try again!" }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong on my side." }]);
    } finally {
      setLoading(false);
    }
  };

  const PRESETS = [
    "What can I cook right now?",
    "Substitute for butter?",
    "Keto snack option?"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center shadow-2xl shadow-primary/45 transition-all hover:scale-105 cursor-pointer relative group"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent animate-pulse"></span>
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="glass w-80 sm:w-96 h-[480px] rounded-2xl border border-white/10 flex flex-col shadow-2xl overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="p-4 border-b border-white/5 bg-aurora-card/90 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent animate-pulse-glow" />
              <div>
                <h3 className="text-xs font-bold text-text-primary">CookWise AI Companion</h3>
                <span className="text-[9px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-400"></span> Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg bg-black/30 border border-white/5 text-text-secondary hover:text-text-primary transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-tr-none"
                      : "bg-aurora-card border border-white/5 text-text-primary rounded-tl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-2xl bg-aurora-card border border-white/5 text-xs text-text-secondary rounded-tl-none flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Preset Prompts */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-white/5 bg-black/10 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleSend(preset)}
                  className="text-[9px] px-2.5 py-1.5 rounded-full bg-aurora-card border border-aurora-border text-text-secondary hover:text-text-primary hover:border-text-secondary cursor-pointer transition shrink-0"
                >
                  {preset}
                </button>
              ))}
            </div>
          )}

          {/* Footer Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 border-t border-white/5 bg-aurora-card/40 flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-[#09090B]/60 border border-aurora-border rounded-xl px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-primary transition"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition disabled:opacity-50 cursor-pointer shadow-lg shadow-primary/25 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

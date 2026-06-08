"use client";

import { useState } from "react";

export default function PollCreate() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function addOption() {
    if (options.length < 6) setOptions([...options, ""]);
  }

  function updateOption(index: number, value: string) {
    const next = [...options];
    next[index] = value;
    setOptions(next);
  }

  function removeOption(index: number) {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        options: options.filter((o) => o.trim()),
      }),
    });

    if (res.ok) {
      setQuestion("");
      setOptions(["", ""]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }

    setLoading(false);
  }

  return (
    <div className="mb-8 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/60 to-slate-900/80 p-6 shadow-xl shadow-indigo-900/20 backdrop-blur-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20">
          <span className="text-base">📊</span>
        </div>
        <h2 className="text-lg font-semibold tracking-tight text-white">
          Create Poll
        </h2>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-indigo-400/60 focus:bg-white/8 focus:ring-2 focus:ring-indigo-500/20"
          placeholder="Ask your community something..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300">
                {String.fromCharCode(65 + index)}
              </div>
              <input
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/20"
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/30 transition hover:bg-red-500/10 hover:text-red-400"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          {options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 transition hover:border-indigo-400/40 hover:bg-white/10 hover:text-white"
            >
              + Add Option
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="ml-auto rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:bg-indigo-500 disabled:opacity-40"
          >
            {loading ? "Creating..." : success ? "✓ Created!" : "Launch Poll"}
          </button>
        </div>
      </form>
    </div>
  );
}
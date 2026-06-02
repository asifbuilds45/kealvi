"use client";

import { useState } from "react";

export default function PollCreate() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);

  function addOption() {
    setOptions([...options, ""]);
  }

  function updateOption(index: number, value: string) {
    const next = [...options];
    next[index] = value;
    setOptions(next);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const res = await fetch("/api/polls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        options: options.filter((o) => o.trim()),
      }),
    });

    if (res.ok) {
      setQuestion("");
      setOptions(["", ""]);
      alert("Poll created!");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="mb-6 space-y-2 border p-4 rounded">
      <h2 className="text-lg font-semibold">Create Poll</h2>

      <input
        className="w-full border p-2 rounded"
        placeholder="Poll question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      {options.map((option, index) => (
        <input
          key={index}
          className="w-full border p-2 rounded"
          placeholder={`Option ${index + 1}`}
          value={option}
          onChange={(e) => updateOption(index, e.target.value)}
        />
      ))}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={addOption}
          className="border px-3 py-1 rounded"
        >
          Add Option
        </button>

        <button
          type="submit"
          disabled={loading}
          className="border px-3 py-1 rounded"
        >
          {loading ? "Creating..." : "Create Poll"}
        </button>
      </div>
    </form>
  );
}
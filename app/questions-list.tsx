"use client";
import { useState, useEffect } from "react";
import { getVoterId } from "@/lib/voter";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://eiyelakqglopqwdaokiz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpeWVsYWtxZ2xvcHF3ZGFva2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MDA4NjcsImV4cCI6MjA5NTk3Njg2N30.m-gZJgtIQ4VH1uJrNn6Y8QsXwxpgZmXom6KlIrOU8po"
);

const REPORT_REASONS = ["Spam", "Inappropriate", "Misinformation", "Other"];

type Question = {
  id: string;
  body: string;
  author: string | null;
  votes: number;
};

export default function QuestionsList({
  initialQuestions,
  initialHasMore,
}: {
  initialQuestions: Question[];
  initialHasMore: boolean;
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [reported, setReported] = useState<Set<string>>(new Set());
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  const [categorizing, setCategorizing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("question-draft");
    if (saved) setDraft(saved);
  }, []);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    async function fetchBookmarks() {
      const userId = getVoterId();
      const { data } = await supabase
        .from("bookmarks")
        .select("question_id")
        .eq("user_id", userId);
      if (data) {
        setBookmarks(new Set(data.map((b: any) => b.question_id)));
      }
    }
    fetchBookmarks();
  }, []);

  useEffect(() => {
    const id = setTimeout(async () => {
      const url = query
        ? `/api/questions?q=${encodeURIComponent(query)}`
        : `/api/questions`;
      const res = await fetch(url);
      const data = await res.json();
      setQuestions(data.questions);
      setHasMore(data.hasMore);
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  async function submit() {
    if (!draft.trim()) return;
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: draft }),
    });
    const created = await res.json();
    setQuestions((qs) => [{ ...created, votes: 0 }, ...qs]);
    setDraft("");
    setSuggestedCategory(null);
    localStorage.removeItem("question-draft");
  }

  async function upvote(id: string) {
    setQuestions((qs) =>
      qs.map((q) => (q.id === id ? { ...q, votes: q.votes + 1 } : q))
    );
    const res = await fetch(`/api/questions/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voterId: getVoterId() }),
    });
    if (!res.ok) {
      setQuestions((qs) =>
        qs.map((q) => (q.id === id ? { ...q, votes: q.votes - 1 } : q))
      );
    }
  }

  async function toggleBookmark(questionId: string) {
    const userId = getVoterId();
    const isBookmarked = bookmarks.has(questionId);
    if (isBookmarked) {
      await supabase
        .from("bookmarks")
        .delete()
        .eq("question_id", questionId)
        .eq("user_id", userId);
      setBookmarks((prev) => {
        const next = new Set(prev);
        next.delete(questionId);
        return next;
      });
    } else {
      await supabase
        .from("bookmarks")
        .insert({ question_id: questionId, user_id: userId });
      setBookmarks((prev) => new Set(prev).add(questionId));
    }
  }

  async function submitReport(questionId: string, reason: string) {
    const userId = getVoterId();
    const { error } = await supabase
      .from("reports")
      .insert({ question_id: questionId, user_id: userId, reason });
    if (!error) {
      setReported((prev) => new Set(prev).add(questionId));
    }
    setReportingId(null);
  }

  async function handleDraftChange(value: string) {
    setDraft(value);
    localStorage.setItem("question-draft", value);

    if (value.length > 20) {
      setCategorizing(true);
      try {
        const res = await fetch("/api/suggest-category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: value }),
        });
        const data = await res.json();
        console.log("Category response:", data);
        setSuggestedCategory(data.category);
      } catch {
        setSuggestedCategory(null);
      }
      setCategorizing(false);
    } else {
      setSuggestedCategory(null);
    }
  }

  async function loadMore() {
    setLoading(true);
    const res = await fetch(`/api/questions?offset=${questions.length}`);
    const data = await res.json();
    setQuestions((qs) => [...qs, ...data.questions]);
    setHasMore(data.hasMore);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        {hydrated ? "Interactive ✓" : "Loading interactivity…"}
      </p>

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => handleDraftChange(e.target.value)}
          placeholder="Ask a question…"
          className="flex-1 rounded-md border px-3 py-2"
        />
        <button onClick={submit} className="rounded-md border px-4 py-2">
          Ask
        </button>
      </div>

      {categorizing && (
        <p className="text-xs text-gray-400">Suggesting category...</p>
      )}
      {suggestedCategory && !categorizing && (
        <p className="text-xs text-blue-500">
          Suggested category: <strong>{suggestedCategory}</strong>
        </p>
      )}

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search questions…"
        className="w-full rounded-md border px-3 py-2"
      />

      <ul className="space-y-3">
        {questions.map((q) => (
          <li key={q.id} className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => upvote(q.id)}
                className="rounded-md border px-3 py-1 font-mono"
              >
                ▲ {q.votes}
              </button>
              <span className="flex-1">{q.body}</span>
              <button
                onClick={() => toggleBookmark(q.id)}
                className="text-lg"
                title={bookmarks.has(q.id) ? "Remove bookmark" : "Bookmark"}
              >
                {bookmarks.has(q.id) ? "🔖" : "🏷️"}
              </button>
              {reported.has(q.id) ? (
                <span className="text-xs text-gray-400">Reported ✓</span>
              ) : (
                <button
                  onClick={() =>
                    setReportingId(reportingId === q.id ? null : q.id)
                  }
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Report
                </button>
              )}
            </div>

            {reportingId === q.id && (
              <div className="flex flex-wrap gap-2 pt-1">
                {REPORT_REASONS.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => submitReport(q.id, reason)}
                    className="rounded-md border px-3 py-1 text-sm hover:bg-red-50"
                  >
                    {reason}
                  </button>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="rounded-md border px-4 py-2 disabled:opacity-50"
        >
          {loading ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}
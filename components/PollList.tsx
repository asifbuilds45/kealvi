"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://eiyelakqglopqwdaokiz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpeWVsYWtxZ2xvcHF3ZGFva2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MDA4NjcsImV4cCI6MjA5NTk3Njg2N30.m-gZJgtIQ4VH1uJrNn6Y8QsXwxpgZmXom6KlIrOU8po"
);

type Option = { id: string; text: string; position: number; poll_id: string };
type Poll = { id: string; question: string; is_open: boolean; options: Option[] };

export default function PollList() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [voted, setVoted] = useState<Record<string, string>>({});
  const [votes, setVotes] = useState<Record<string, number>>({});

  async function fetchPolls() {
    const { data, error } = await supabase
      .from("polls")
      .select("*, poll_options(*)")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setPolls(data.map((p: any) => ({ ...p, options: p.poll_options })));
    }
  }

  async function fetchVotes() {
    const { data } = await supabase.from("poll_votes").select("option_id");
    if (data) {
      const counts: Record<string, number> = {};
      data.forEach((v: any) => {
        counts[v.option_id] = (counts[v.option_id] || 0) + 1;
      });
      setVotes(counts);
    }
  }

  async function vote(pollId: string, optionId: string) {
    if (voted[pollId]) return;
    const { error } = await supabase
      .from("poll_votes")
      .insert({ poll_id: pollId, option_id: optionId });
    if (!error) {
      setVoted((prev) => ({ ...prev, [pollId]: optionId }));
      setVotes((prev) => ({ ...prev, [optionId]: (prev[optionId] || 0) + 1 }));
    }
  }

  useEffect(() => {
    fetchPolls();
    fetchVotes();
  }, []);

  if (polls.length === 0) return null;

  return (
    <div className="mb-8 space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30">
        Active Polls
      </h3>
      {polls.map((poll) => {
        const totalVotes = poll.options.reduce((sum, o) => sum + (votes[o.id] || 0), 0);
        const hasVoted = !!voted[poll.id];

        return (
          <div
            key={poll.id}
            className="rounded-2xl border border-white/8 bg-gradient-to-br from-slate-800/60 to-slate-900/80 p-5 shadow-lg backdrop-blur-sm"
          >
            <p className="mb-4 font-semibold text-white">{poll.question}</p>
            <div className="space-y-2">
              {poll.options
                .sort((a, b) => a.position - b.position)
                .map((option, idx) => {
                  const count = votes[option.id] || 0;
                  const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                  const isChosen = voted[poll.id] === option.id;
                  const isWinning = hasVoted && count === Math.max(...poll.options.map(o => votes[o.id] || 0));

                  return (
                    <button
                      key={option.id}
                      onClick={() => vote(poll.id, option.id)}
                      disabled={hasVoted}
                      className={`relative w-full overflow-hidden rounded-xl border px-4 py-3 text-left transition-all ${
                        isChosen
                          ? "border-indigo-400/60 bg-indigo-500/10"
                          : hasVoted
                          ? "border-white/8 bg-white/3"
                          : "border-white/10 bg-white/5 hover:border-indigo-400/40 hover:bg-white/8"
                      }`}
                    >
                      {hasVoted && (
                        <div
                          className={`absolute inset-0 transition-all duration-700 ${
                            isWinning ? "bg-indigo-500/15" : "bg-white/3"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      )}
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                            isChosen ? "bg-indigo-500 text-white" : "bg-white/10 text-white/50"
                          }`}>
                            {isChosen ? "✓" : String.fromCharCode(65 + idx)}
                          </span>
                          <span className={`text-sm font-medium ${isChosen ? "text-white" : "text-white/80"}`}>
                            {option.text}
                          </span>
                        </div>
                        {hasVoted && (
                          <span className={`text-sm font-bold ${isWinning ? "text-indigo-300" : "text-white/40"}`}>
                            {pct}%
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
            {hasVoted && (
              <p className="mt-3 text-xs text-white/30">
                {totalVotes} vote{totalVotes !== 1 ? "s" : ""} total
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
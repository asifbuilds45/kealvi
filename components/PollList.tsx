"use client";

import { useEffect, useState } from "react";
import { supabaseClient as supabase } from "@/lib/supabase";

type Option = {
  id: string;
  text: string;
  position: number;
  poll_id: string;
};

type Poll = {
  id: string;
  question: string;
  is_open: boolean;
  options: Option[];
};

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
    const { data, error } = await supabase
      .from("poll_votes")
      .select("option_id");

    if (!error && data) {
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
      setVotes((prev) => ({
        ...prev,
        [optionId]: (prev[optionId] || 0) + 1,
      }));
    }
  }

  useEffect(() => {
    fetchPolls();
    fetchVotes();
  }, []);

  if (polls.length === 0) return null;

  return (
    <div className="mb-6 space-y-4">
      {polls.map((poll) => {
        const totalVotes = poll.options.reduce(
          (sum, o) => sum + (votes[o.id] || 0),
          0
        );
        const hasVoted = !!voted[poll.id];

        return (
          <div key={poll.id} className="border p-4 rounded space-y-2">
            <p className="font-semibold">{poll.question}</p>
            {poll.options
              .sort((a, b) => a.position - b.position)
              .map((option) => {
                const count = votes[option.id] || 0;
                const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                const isChosen = voted[poll.id] === option.id;

                return (
                  <button
                    key={option.id}
                    onClick={() => vote(poll.id, option.id)}
                    disabled={hasVoted}
                    className="w-full text-left border rounded p-2 relative overflow-hidden"
                  >
                    {hasVoted && (
                      <div
                        className="absolute inset-0 bg-blue-100"
                        style={{ width: `${pct}%` }}
                      />
                    )}
                    <span className="relative flex justify-between">
                      <span>{isChosen ? `✓ ${option.text}` : option.text}</span>
                      {hasVoted && <span>{pct}%</span>}
                    </span>
                  </button>
                );
              })}
            {hasVoted && (
              <p className="text-xs text-gray-400">{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
import QuestionsList from "./questions-list";
import { getQuestionsPage } from "@/lib/questions";
import PollCreate from "@/components/PollCreate";
import PollList from "@/components/PollList";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function Page() {
  const { questions, hasMore } = await getQuestionsPage(0, PAGE_SIZE);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950">
      <div className="mx-auto max-w-2xl p-6">
        <div className="mb-8 pt-4">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Live Q&A
          </h1>
          <p className="mt-1 text-sm text-white/40">
            Ask questions, vote on polls, join the conversation
          </p>
        </div>

        <PollCreate />
        <PollList />

        <QuestionsList
          initialQuestions={questions}
          initialHasMore={hasMore}
        />
      </div>
    </main>
  );
}
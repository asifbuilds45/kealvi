import QuestionsList from "./questions-list";
import { getQuestionsPage } from "@/lib/questions";
import PollCreate from "@/components/PollCreate";
import PollList from "../components/PollList";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function Page() {
  const { questions, hasMore } = await getQuestionsPage(0, PAGE_SIZE);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-medium">Live Q&A</h1>

      <PollCreate />
      <PollList />

      <QuestionsList
        initialQuestions={questions}
        initialHasMore={hasMore}
      />
    </main>
  );
}
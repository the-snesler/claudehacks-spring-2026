import { useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/chat";
import eventsData from "../../data/mscr_events.json";

export async function action({ request, context }: Route.ActionArgs) {
  const { messages, savedIds } = await request.json() as {
    messages: { role: string; content: string }[];
    savedIds: number[];
  };

  const apiKey = context.cloudflare.env.ANTHROPIC_API_KEY;
  const savedEvents = eventsData.events.filter((e) => savedIds.includes(e.id));
  const allEvents = eventsData.events;

  const systemPrompt = `You are a helpful Madison, WI community events assistant.
All available events: ${JSON.stringify(allEvents)}
Events the user has saved: ${JSON.stringify(savedEvents)}
Help them find events they'll enjoy. Be concise and friendly.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: systemPrompt,
      messages,
    }),
  });

  const data = await res.json() as { content: { text: string }[] };
  return { reply: data.content[0].text };
}

type Message = { role: "user" | "assistant"; content: string };

function getSavedIds(): number[] {
  try {
    return JSON.parse(localStorage.getItem("saved_events") || "[]");
  } catch {
    return [];
  }
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const fetcher = useFetcher<{ reply: string }>();
  const loading = fetcher.state !== "idle";

  function send() {
    if (!input.trim() || loading) return;
    const next: Message[] = [...messages, { role: "user", content: input }];
    setMessages(next);
    setInput("");
    fetcher.submit(
      { messages: next, savedIds: getSavedIds() } as unknown as Record<string, string>,
      { method: "post", encType: "application/json" }
    );
  }

  // Append assistant reply when it arrives
  const lastReply = fetcher.data?.reply;
  const lastMsg = messages[messages.length - 1];
  const displayMessages =
    lastReply && lastMsg?.role === "user"
      ? [...messages, { role: "assistant" as const, content: lastReply }]
      : messages;

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] max-w-lg mx-auto">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {displayMessages.length === 0 && (
          <p className="text-center text-gray-400 mt-10">Ask me about Madison events!</p>
        )}
        {displayMessages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                m.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-400 px-4 py-2 rounded-2xl rounded-bl-sm text-sm">…</div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 flex gap-2">
        <input
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-indigo-400"
          placeholder="What kind of event are you looking for?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button
          onClick={send}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

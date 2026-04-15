// Drop this into any React Router route:
//   export async function action(args) { return chatAction(args); }

export async function chatAction({ request, context }: any) {
  const { messages, systemPrompt } = await request.json();
  const apiKey = context.cloudflare.env.ANTHROPIC_API_KEY;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      stream: true,
      system: systemPrompt ?? "You are a helpful assistant.",
      messages,
    }),
  });

  return new Response(res.body, {
    headers: { "content-type": "text/event-stream" },
  });
}

import Anthropic from '@anthropic-ai/sdk';
import type { Route } from './+types/api.chat';
import type { Event } from '../models/event';

type ChatMessage = { role: 'user' | 'assistant'; content: string };
type RequestBody = { event: Event; history: ChatMessage[] };

export async function action({ request, context }: Route.ActionArgs) {
  const apiKey = context.cloudflare.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'Missing API key' }, { status: 500 });
  }

  const { event, history }: RequestBody = await request.json();

  const client = new Anthropic({ apiKey });

  const systemPrompt = `You are "${event.title}", a real event happening in Madison, Wisconsin. You're texting with a local resident who showed interest in you.

Event details:
- Date: ${event.date}${event.time ? ` at ${event.time}` : ''}
- Location: ${event.location ?? 'TBD'}
- Category: ${event.category ?? 'General'}
- Description: ${event.description}
- Source: ${event.source}
${event.isFree ? '- Admission: Free' : event.fee ? `- Admission: $${event.fee}` : ''}

Stay in character as the event itself. Be warm, enthusiastic, and helpful. Keep replies to 1-3 sentences. Answer questions about the event accurately based on the details above. If asked something you don't know, say you're not sure but encourage them to come find out.`;

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 256,
    system: systemPrompt,
    messages: history,
  });

  const text = response.content.find(b => b.type === 'text')?.text ?? '';
  return Response.json({ text });
}

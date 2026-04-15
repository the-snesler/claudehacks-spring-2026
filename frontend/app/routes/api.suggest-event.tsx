import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import type { Route } from './+types/api.suggest-event';
import type { Event } from '../models/event';

const SuggestionSchema = z.object({
  selectedEventId: z.string().describe('The id of the event that should message the user'),
  message: z.string().describe('A short, friendly opening message from the event to the user (1-2 sentences, conversational tone)'),
});

export async function action({ request, context }: Route.ActionArgs) {
  const apiKey = (context.cloudflare.env as { ANTHROPIC_API_KEY: string }).ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'Missing API key' }, { status: 500 });
  }

  const events: Event[] = await request.json();
  if (!events.length) {
    return Response.json({ error: 'No events provided' }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  const eventSummaries = events.map(e =>
    `id: ${e.id}\ntitle: ${e.title}\ncategory: ${e.category ?? 'General'}\ndate: ${e.date}${e.time ? ` at ${e.time}` : ''}\nlocation: ${e.location ?? 'TBD'}\ndescription: ${e.description.slice(0, 120)}`
  ).join('\n\n---\n\n');

  const response = await client.messages.parse({
    model: 'claude-opus-4-6',
    max_tokens: 512,
    output_config: {
      format: zodOutputFormat(SuggestionSchema),
    },
    messages: [{
      role: 'user',
      content: `A user is browsing Madison, WI events and saved these ones:\n\n${eventSummaries}\n\nPick the ONE event most likely to spark their interest based on the mix. Write a short, warm opening message as if the event itself is reaching out — keep it to 1-2 sentences, conversational, specific to that event. Return the event id and the message.`,
    }],
  });

  const result = response.parsed_output;
  if (!result) {
    return Response.json({ error: 'Failed to parse response' }, { status: 500 });
  }

  return Response.json(result);
}

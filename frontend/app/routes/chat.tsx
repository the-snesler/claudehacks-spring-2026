import { ChatWidget } from "../chat/ChatWidget";
import { chatAction } from "../chat/action";
import eventsData from "../../data/mscr_events.json";

export async function action(args: any) {
  return chatAction(args);
}

const systemPrompt = `You are a helpful Madison, WI community events assistant.
Here are all available events: ${JSON.stringify(eventsData.events)}
Help users find events they'll enjoy. Be concise and friendly.`;

export default function Chat() {
  return (
    <div className="h-[calc(100vh-56px)] max-w-lg mx-auto">
      <ChatWidget
        endpoint="/chat"
        systemPrompt={systemPrompt}
        placeholder="What kind of event are you looking for?"
      />
    </div>
  );
}

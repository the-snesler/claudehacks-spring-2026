import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("events", "routes/events.tsx"),
  route("chat", "routes/chat.tsx"),
  route("chat/:id", "routes/chat.$id.tsx"),
  route("api/suggest-event", "routes/api.suggest-event.tsx"),
  route("api/chat", "routes/api.chat.tsx"),
] satisfies RouteConfig;

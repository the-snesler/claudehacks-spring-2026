import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("events", "routes/events.tsx"),
  route("saved", "routes/saved.tsx"),
  route("chat", "routes/chat.tsx"),
  route("chat/:id", "routes/chat.$id.tsx"),
] satisfies RouteConfig;

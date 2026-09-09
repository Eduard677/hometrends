import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/find")({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({ q: typeof search.q === "string" ? search.q : undefined }),
  beforeLoad: ({ search }) => {
    if (search.q?.trim()) throw redirect({ to: "/shop", search: { q: search.q }, statusCode: 301 });
    throw redirect({ to: "/showroom", statusCode: 301 });
  },
});

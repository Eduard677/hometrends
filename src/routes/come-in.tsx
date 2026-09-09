import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/come-in")({ beforeLoad: () => { throw redirect({ to: "/showroom", statusCode: 301 }); } });

import { pageHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { OwnersSection } from "@/components/owners-section";
import { VisitSection } from "@/components/visit-section";
export const Route = createFileRoute("/showroom")({
  component: ShowroomPage,
  head: () => pageHead({ title: "Visit our Ennis showroom | Home Trends Furniture", description: "Visit Home Trends Furniture at 29 Parnell Street, Ennis, V95 ED79. Mon–Sat 09:30–18:00. Directions, parking and telephone 065 679 7853.", path: "/showroom" }),
});
function ShowroomPage() {
  return <main id="main" className="showroom-page"><header className="showroom-title"><p className="eyebrow">Home Trends Furniture</p><h1>Visit us in Ennis</h1></header><VisitSection /><OwnersSection /></main>;
}

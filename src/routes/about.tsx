import { Link, createFileRoute } from "@tanstack/react-router";
import { PageFrame } from "@/components/page-frame";
import { OwnersSection } from "@/components/owners-section";
export const Route = createFileRoute("/about")({ component: AboutPage, head: () => ({ meta: [{ title: "Finbar and Eileen | Home Trends Furniture" }] }) });
function AboutPage() {
  return <PageFrame title="A family showroom in Ennis" lead="Home Trends Furniture, trading since 2013."><OwnersSection /><Link to="/showroom" className="button button--solid">Visit the showroom</Link></PageFrame>;
}

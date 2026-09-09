import { pageHead } from "@/lib/seo";
import { Link, createFileRoute } from "@tanstack/react-router";
import { PageFrame } from "@/components/page-frame";
import { OwnersSection } from "@/components/owners-section";
export const Route = createFileRoute("/about")({ component: AboutPage, head: () => pageHead({ title: "Finbar and Eileen | Home Trends Furniture", description: "Home Trends Furniture, trading since 2013. Finbar and Eileen Keaveney's family showroom on Parnell Street, Ennis.", path: "/about" }) });
function AboutPage() {
  return <PageFrame title="A family showroom in Ennis" lead="Home Trends Furniture, trading since 2013."><OwnersSection /><Link to="/showroom" className="button button--solid">Visit the showroom</Link></PageFrame>;
}

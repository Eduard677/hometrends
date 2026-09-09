import { Link, createFileRoute } from "@tanstack/react-router";
import { PageFrame } from "@/components/page-frame";
export const Route = createFileRoute("/bespoke")({ component: UpholsteryPage, head: () => ({ meta: [{ title: "Upholstery | Home Trends Furniture" }] }) });
function UpholsteryPage() {
  return <PageFrame title="Find your fabric in Ennis" lead="See and feel physical fabric swatches in the showroom."><article className="prose"><p>Bring a cushion, curtain sample or paint colour from your room. Ask the team which fabrics are available for the sofa or chair you have in mind.</p></article><Link to="/showroom" className="button button--solid">Plan your visit</Link></PageFrame>;
}

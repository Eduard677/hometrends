import { pageHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { PageFrame } from "@/components/page-frame";
import { STORE } from "@/lib/store";
export const Route = createFileRoute("/delivery")({ component: DeliveryPage, head: () => pageHead({ title: "Delivery enquiries | Home Trends Furniture", description: "Talk to the team about your piece and your address. Delivery enquiries for Home Trends Furniture, Ennis.", path: "/delivery" }) });
function DeliveryPage() {
  return <PageFrame title="Delivery enquiries" lead="Talk to the team about your piece and your address."><article className="prose"><p>For delivery charges, availability and timing, <a href={STORE.phoneHref}>call {STORE.phone}</a> before making arrangements.</p><p><a href="https://hometrendsfurniture.ie/pages/shipping">Read delivery information on the official Home Trends website →</a></p></article></PageFrame>;
}

import { createFileRoute } from "@tanstack/react-router";
import { PageFrame } from "@/components/page-frame";
import { STORE } from "@/lib/store";
export const Route = createFileRoute("/returns")({ component: ReturnsPage, head: () => ({ meta: [{ title: "Returns enquiries | Home Trends Furniture" }] }) });
function ReturnsPage() {
  return <PageFrame title="Returns enquiries" lead="Have a question about an existing purchase?"><article className="prose"><p><a href={STORE.phoneHref}>Call {STORE.phone}</a> or <a href={STORE.emailHref}>email the team</a> with your order details.</p><p><a href="https://hometrendsfurniture.ie/pages/refunds-returns">Read the returns policy on the official Home Trends website →</a></p></article></PageFrame>;
}

import { createFileRoute } from "@tanstack/react-router";
import { PageFrame } from "@/components/page-frame";
import { STORE } from "@/lib/store";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({ meta: [{ title: "Terms | Home Trends Furniture" }] }),
});

function TermsPage() {
  return (
    <PageFrame title="Terms" lead="A catalogue for the floor. Orders are confirmed with the showroom.">
      <article className="prose">
        <p>
          These pages are a catalogue for Home Trends Furniture, {STORE.address}. Prices shown are a guide from the showroom floor
          and may differ from an in-store or online promotion. They do not include assembly. Stock moves; please check availability
          before travelling — not every website piece is on the floor every day, and not every floor piece is photographed here.
        </p>
        <p>
          Adding a piece to the bag does not reserve it and does not create an order. Orders are confirmed with the showroom by
          phone, email or in person. We accept major debit and credit cards.
        </p>
        <p>
          Irish law applies. If a product is misdescribed we will make it right. See Delivery and Returns for charges, lead times
          and take-away fees.
        </p>
      </article>
    </PageFrame>
  );
}

import { pageHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { PageFrame } from "@/components/page-frame";
import { STORE } from "@/lib/store";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => pageHead({ title: "Privacy | Home Trends Furniture", description: "A small shop. A small amount of information. How Home Trends Furniture handles your data.", path: "/privacy" }),
});

function PrivacyPage() {
  return (
    <PageFrame title="Privacy" lead="A small shop. A small amount of information.">
      <article className="prose">
        <p>
          Home Trends Furniture, {STORE.address}, is the data controller for this site. We handle a small amount of information,
          for a small shop.
        </p>
        <h2>What we keep</h2>
        <p>
          If you email or telephone us, we keep the details needed to answer you and to fulfil an order: name, contact, delivery
          address, and what you asked about. Payment is taken in store or through our payment providers — we do not store card
          numbers on this website.
        </p>
        <h2>This website</h2>
        <p>
          A bag stored in your browser (local storage) remembers pieces you have set aside. It does not leave your device. We use
          only the cookies you accept on the cookie preferences page — essential storage for the bag, and nothing for advertising.
        </p>
        <h2>Your rights</h2>
        <p>
          You can ask for a copy of what we hold, a correction, or deletion, by emailing {STORE.email}. If you are unhappy with how
          we handle your information you may contact the Data Protection Commission.
        </p>
      </article>
    </PageFrame>
  );
}

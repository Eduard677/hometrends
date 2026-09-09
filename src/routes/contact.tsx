import { pageHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { PageFrame } from "@/components/page-frame";
import { STORE, HOURS } from "@/lib/store";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => pageHead({ title: "Contact | Home Trends Furniture", description: "We would rather you sat on the sofa than bought it from a photograph. Call or visit Home Trends Furniture in Ennis.", path: "/contact" }),
});

function ContactPage() {
  const mailto = `${STORE.emailHref}?subject=${encodeURIComponent("Showroom enquiry")}`;
  return (
    <PageFrame
      eyebrow={STORE.town}
      title="Write to the showroom"
      lead="We would rather you sat on the sofa than bought it from a photograph."
    >
      <dl className="facts">
        <div>
          <dt>Address</dt>
          <dd>{STORE.address}</dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>
            <a href={STORE.phoneHref}>{STORE.phone}</a>
          </dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>
            <a href={STORE.emailHref}>{STORE.email}</a>
          </dd>
        </div>
      </dl>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 500 }}>Hours</h2>
      <dl className="facts">
        {HOURS.map((row) => (
          <div key={row.day}>
            <dt>{row.day}</dt>
            <dd>{row.time}</dd>
          </div>
        ))}
      </dl>
      <div className="ed-actions">
        <a className="button button--solid" href={STORE.phoneHref}>
          Call the showroom
        </a>
        <a className="text-link" href={mailto}>
          Email →
        </a>
        <a className="text-link" href={STORE.maps}>
          Directions →
        </a>
      </div>
    </PageFrame>
  );
}

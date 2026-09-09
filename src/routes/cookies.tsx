import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageFrame } from "@/components/page-frame";

export const Route = createFileRoute("/cookies")({
  component: CookiesPage,
  head: () => ({ meta: [{ title: "Cookie preferences | Home Trends Furniture" }] }),
});

function CookiesPage() {
  const [analytics, setAnalytics] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <PageFrame title="Cookies" lead="The bag stays in the browser. Advertising cookies do not.">
      <article className="prose">
        <p>
          We store your bag in the browser so pieces stay put if you wander to another page. That is essential. We do not run
          advertising cookies. Optional analytics stay off unless you switch them on.
        </p>
        <label style={{ display: "flex", gap: "0.7rem", alignItems: "center", margin: "1.4rem 0" }}>
          <input type="checkbox" checked disabled />
          Essential — bag and cookie choice
        </label>
        <label style={{ display: "flex", gap: "0.7rem", alignItems: "center", margin: "1.4rem 0" }}>
          <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} />
          Analytics — anonymous visits, off by default
        </label>
        <button
          className="button button--solid"
          type="button"
          onClick={() => {
            window.localStorage.setItem("ht-cookie-analytics", analytics ? "1" : "0");
            setSaved(true);
          }}
        >
          Save preferences
        </button>
        {saved ? <p>Saved. Analytics {analytics ? "on" : "off"}.</p> : null}
      </article>
    </PageFrame>
  );
}

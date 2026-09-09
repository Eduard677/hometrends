import { useState, type FormEvent } from "react";

function remember(email: string) {
  try {
    const raw = window.localStorage.getItem("ht-touch");
    const list: { email: string; at: number }[] = raw ? JSON.parse(raw) : [];
    if (!list.some((row) => row.email === email)) {
      list.push({ email, at: Date.now() });
      window.localStorage.setItem("ht-touch", JSON.stringify(list));
    }
  } catch {
    /* ignore */
  }
}

export function NewsletterBand() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const value = email.trim().toLowerCase();
    if (!value) return;
    remember(value);
    setDone(true);
  }

  return (
    <section className="news-band" id="newsletter" aria-labelledby="news-band-title">
      <div className="news-band__inner">
        <div className="news-band__copy">
          <h2 id="news-band-title">Keep in touch</h2>
          <p>Sign up for Home Trends news, new arrivals and showroom updates.</p>
        </div>
        {done ? (
          <p className="news-band__thanks">We will write from the showroom.</p>
        ) : (
          <form onSubmit={onSubmit} className="news-band__form">
            <label htmlFor="news-band-email" className="vh">
              Email
            </label>
            <input
              id="news-band-email"
              type="email"
              required
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <button type="submit">Subscribe</button>
          </form>
        )}
      </div>
    </section>
  );
}

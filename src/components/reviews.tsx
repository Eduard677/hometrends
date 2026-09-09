import { GOOGLE_REVIEWS_URL, REVIEWS } from "@/lib/reviews";

export function Reviews() {
  return <section className="reviews-section ed-sec" id="reviews" aria-labelledby="reviews-heading">
    <header><h2 id="reviews-heading">What customers say</h2><a className="reviews-section__aggregate" href={GOOGLE_REVIEWS_URL} target="_blank" rel="noreferrer"><span>4.9 / 5</span> · 94 Google reviews</a></header>
    <div className="reviews-section__grid">{REVIEWS.slice(0, 3).map(review => <article key={review.name}>
      <p aria-label={`${review.stars} out of 5 stars`}>{"★".repeat(review.stars)}</p>
      <blockquote>{review.text}</blockquote>
      <p><cite>{review.name}</cite></p><a href={review.sourceUrl} target="_blank" rel="noreferrer">Read on Google</a>
    </article>)}</div>
  </section>;
}

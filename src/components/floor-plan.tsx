export function FloorPlan() {
  return (
    <figure className="floor-plan">
      <svg viewBox="0 0 640 400" role="img" aria-labelledby="floor-plan-title floor-plan-desc">
        <title id="floor-plan-title">Home Trends, 29 Parnell Street — two floors</title>
        <desc id="floor-plan-desc">
          Ground floor: suites, beds and mattresses, with doors to Parnell Street at front and back. Second floor:
          rugs, dining, artwork and mirrors. After the store’s published description.
        </desc>
        <g fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.55">
          <rect x="80" y="56" width="480" height="140" />
          <rect x="80" y="232" width="480" height="112" />
          <path d="M80 56v-10M560 56v-10M80 196v10M560 196v10" />
          <path d="M312 196v36M328 196v36" />
        </g>
        <g fill="currentColor">
          <text x="320" y="36" textAnchor="middle" className="floor-plan__street">
            Parnell Street
          </text>
          <text x="96" y="88" className="floor-plan__level">
            Ground
          </text>
          <text x="96" y="112" className="floor-plan__use">
            Suites · beds · mattresses
          </text>
          <text x="96" y="268" className="floor-plan__level">
            Above
          </text>
          <text x="96" y="292" className="floor-plan__use">
            Rugs · dining · mirrors
          </text>
          <text x="320" y="384" textAnchor="middle" className="floor-plan__street">
            Parnell Street
          </text>
        </g>
      </svg>
      <figcaption>Two floors, two doors. As described by the store, 2023.</figcaption>
    </figure>
  );
}

/*
  ImageSlot — use this everywhere an image goes.

  If `src` is set, it renders the image.
  If not, it renders a labelled box at the right ratio showing what needs to go
  there and what path to save it to, so the layout is correct before the shoot
  and nothing 404s.

  Keep existing images where they exist. Only leave a box where the photo
  genuinely doesn't exist yet.

    <ImageSlot ratio="4/3" label="Shopfront, Parnell Street"
               path="/media/story/shopfront-parnell-street.jpg" />

    <ImageSlot ratio="4/3" src="/media/editorial/from-shop-living.jpg"
               alt="Sofa and recliner in the showroom" />
*/

export default function ImageSlot({
  src = null,
  alt = "",
  ratio = "4/3",
  label = "Image needed",
  path = "",
  note = "",
  className = "",
  imgClassName = "",
}) {
  if (src) {
    return (
      <div className={`overflow-hidden bg-[#E2DACC] ${className}`} style={{ aspectRatio: ratio }}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`h-full w-full object-cover ${imgClassName}`}
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`Placeholder: ${label}`}
      className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#B9AE9C] bg-[#E4DCCE] p-6 text-center ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 stroke-[#9A8F7E]" fill="none" strokeWidth="1.2" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="1" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5" strokeLinejoin="round" />
      </svg>

      <span className="text-sm text-[#5F5647]">{label}</span>
      <span className="text-xs text-[#9A8F7E]">{ratio.replace("/", ":")}</span>
      {path && <code className="text-[11px] text-[#9A8F7E]">{path}</code>}
      {note && <span className="mt-1 max-w-[22ch] text-[11px] text-[#9A8F7E]">{note}</span>}
    </div>
  );
}

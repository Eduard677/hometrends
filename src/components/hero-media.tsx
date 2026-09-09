import { useEffect, useState } from "react";
import { SiteImage } from "./site-image";

export function HeroMedia({ videoSrc, poster, alt }: { videoSrc?: string; poster: string; alt: string }) {
  const [play, setPlay] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPlay(!preference.matches);
    update(); preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  return <div className="ed-hero__media">
    <SiteImage src={poster} alt={alt} width={1672} height={941} loading="eager" priority />
    {videoSrc && play && !failed ? <video autoPlay muted loop playsInline poster={poster} onError={() => setFailed(true)} aria-hidden="true"><source src={videoSrc} type="video/mp4" /></video> : null}
  </div>;
}

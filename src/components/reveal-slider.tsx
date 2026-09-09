import { useCallback, useEffect, useRef, useState } from "react";

function Chevron({ dir }: { dir: "left" | "right" }) {
  const d = dir === "left" ? "M6 1L1.5 6L6 11" : "M2 1L6.5 6L2 11";
  return (
    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const REST = 50;

export function RevealSlider({
  before,
  after,
  beforeAlt,
  afterAlt,
  caption,
}: {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
  caption: string;
}) {
  const [value, setValue] = useState(REST);
  const [dragging, setDragging] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const setFromClientX = useCallback((clientX: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const next = ((clientX - rect.left) / Math.max(rect.width, 1)) * 100;
    setValue(Math.min(96, Math.max(4, next)));
  }, []);

  function showBefore() {
    setDragging(false);
    setValue(96);
  }
  function showAfter() {
    setDragging(false);
    setValue(4);
  }

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setDragging(false);
        setValue(REST);
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <div className={`ht-reveal ht-reveal--bedroom${dragging ? "" : " is-resting"}`} ref={rootRef}>
      <div className="ht-reveal__frame">
        <div
          ref={stageRef}
          className={`ht-reveal__stage${dragging ? " is-dragging" : ""}`}
          style={{ ["--reveal" as string]: `${value}%` }}
          onPointerDown={(event) => {
            (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
            setDragging(true);
            setFromClientX(event.clientX);
          }}
          onPointerMove={(event) => {
            if (event.buttons) setFromClientX(event.clientX);
          }}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
        >
          <img className="ht-reveal__after" src={after} alt={afterAlt} width={1600} height={1067} draggable={false} />
          <img className="ht-reveal__before" src={before} alt={beforeAlt} width={1600} height={1067} draggable={false} />
          <div className="ht-reveal__handle" aria-hidden="true">
            <span className="ht-reveal__grip">
              <Chevron dir="left" />
              <Chevron dir="right" />
            </span>
          </div>
          <input
            className="ht-reveal__range"
            type="range"
            min={4}
            max={96}
            value={value}
            aria-label="Compare the bedroom empty and furnished"
            onChange={(event) => setValue(Number(event.target.value))}
          />
        </div>
        <button
          type="button"
          className={`ht-reveal__tag ht-reveal__tag--before${value >= 70 ? " is-on" : ""}`}
          aria-pressed={value >= 70}
          onClick={showBefore}
        >
          Before
        </button>
        <button
          type="button"
          className={`ht-reveal__tag ht-reveal__tag--after${value <= 30 ? " is-on" : ""}`}
          aria-pressed={value <= 30}
          onClick={showAfter}
        >
          After
        </button>
      </div>
      <p className="ht-reveal__caption">{caption}</p>
    </div>
  );
}

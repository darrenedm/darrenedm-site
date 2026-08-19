"use client";

import { useEffect, useState } from "react";

/**
 * A depth gauge that tracks scroll position down the home page.
 *
 * Reads scroll once per animation frame rather than on every scroll
 * event, so it stays cheap. Hidden from assistive tech — it is a
 * decorative restatement of where you already are on the page.
 */

const LAYERS: { until: number; label: string }[] = [
  { until: 40, label: "Tide line" },
  { until: 200, label: "Sunlight" },
  { until: 1000, label: "Twilight" },
  { until: 4000, label: "Midnight" },
  { until: Infinity, label: "Abyss" },
];

const MAX_DEPTH = 4600;

export function DepthGauge() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const read = () => {
      frame = 0;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? window.scrollY / scrollable : 0);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // eased so the shallow zones do not blur past in the first flick
  const depth = Math.round(Math.pow(progress, 1.35) * MAX_DEPTH);
  const layer = LAYERS.find((l) => depth < l.until)!.label;

  return (
    <aside
      className="gauge"
      aria-hidden="true"
      style={{ "--p": progress } as React.CSSProperties}
    >
      <span className="gauge-readout">
        <b>{depth.toLocaleString("en-GB")}</b>
        <span>m</span>
      </span>
      <span className="gauge-track">
        <span className="gauge-thumb" />
      </span>
      <span className="gauge-layer">{layer}</span>
    </aside>
  );
}

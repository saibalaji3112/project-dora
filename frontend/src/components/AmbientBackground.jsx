import { useEffect, useRef } from "react";

export default function AmbientBackground({ enabled }) {
  const host = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!enabled || reduced || !host.current || !window.WebGLRenderingContext) return undefined;

    let effect;
    let cancelled = false;
    let idleToken;
    const start = async () => {
      try {
        const [{ default: THREE }, { default: WAVES }] = await Promise.all([
          import("three"),
          import("vanta/dist/vanta.waves.min.js"),
        ]);
        if (cancelled || !host.current) return;
        effect = WAVES({
          el: host.current,
          THREE,
          mouseControls: true,
          touchControls: false,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: 0.78,
          scaleMobile: 1.35,
          color: 0xd1c7b7,
          shininess: 12,
          waveHeight: 5,
          waveSpeed: 0.45,
          zoom: 0.82,
          backgroundColor: 0xf3f1ed,
        });
      } catch {
        // The CSS background remains in place when WebGL or the effect is unavailable.
      }
    };
    if ("requestIdleCallback" in window) idleToken = window.requestIdleCallback(start, { timeout: 1200 });
    else idleToken = window.setTimeout(start, 250);

    return () => {
      cancelled = true;
      if ("cancelIdleCallback" in window) window.cancelIdleCallback(idleToken);
      else window.clearTimeout(idleToken);
      effect?.destroy();
    };
  }, [enabled]);

  return <div ref={host} className="ambient-wave" aria-hidden="true" />;
}

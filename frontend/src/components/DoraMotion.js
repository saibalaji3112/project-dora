import { useEffect, useRef, useState } from "react";

export default function useDoraMotion(enabled, pathname, scopeRef) {
  const lenisRef = useRef(null);
  const [engine, setEngine] = useState(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!enabled || reduced) return undefined;

    let cancelled = false;
    let cleanupScroll = () => {};
    Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("lenis")]).then(([gsapModule, scrollModule, lenisModule]) => {
      if (cancelled) return;
      const gsap = gsapModule.gsap || gsapModule.default;
      const ScrollTrigger = scrollModule.ScrollTrigger || scrollModule.default;
      const Lenis = lenisModule.default;
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        anchors: true,
        duration: 1.05,
        smoothWheel: true,
        wheelMultiplier: 0.92,
        prevent: (node) => Boolean(node.closest(".modal-backdrop, textarea, input, select")),
      });
      lenisRef.current = lenis;
      const updateScroll = () => ScrollTrigger.update();
      const tick = (time) => lenis.raf(time * 1000);
      lenis.on("scroll", updateScroll);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      cleanupScroll = () => {
        lenis.off("scroll", updateScroll);
        gsap.ticker.remove(tick);
        lenis.destroy();
        lenisRef.current = null;
        ScrollTrigger.refresh();
      };
      setEngine({ gsap, ScrollTrigger });
    }).catch(() => {
      setEngine(null);
    });

    return () => {
      cancelled = true;
      cleanupScroll();
      lenisRef.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scope = scopeRef.current;
    if (!enabled || reduced || !engine || !scope) return undefined;

    const { gsap, ScrollTrigger } = engine;
    const spotlightHandlers = [];
    const context = gsap.context(() => {
      gsap.fromTo(".site-nav .active", { scale: 0.94 }, { scale: 1, duration: 0.48, ease: "back.out(1.8)" });
      gsap.fromTo(".dashboard-copy h1, .page-intro h1", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.85, ease: "power3.out" });
      gsap.fromTo(".dashboard-copy > p, .dashboard-actions, .dashboard-showcase, .page-intro > p", { autoAlpha: 0, y: 15 }, { autoAlpha: 1, y: 0, duration: 0.7, delay: 0.12, stagger: 0.08, ease: "power2.out" });

      gsap.utils.toArray(".capability-card, .workflow-step, .recent-item, .how-grid article").forEach((card, index) => {
        gsap.fromTo(card, { autoAlpha: 0, y: 20 }, {
          autoAlpha: 1, y: 0, duration: 0.62, delay: index < 3 ? index * 0.045 : 0,
          ease: "power2.out", scrollTrigger: { trigger: card, start: "top 94%", once: true },
        });
        const setX = gsap.quickSetter(card, "--spot-x", "px");
        const setY = gsap.quickSetter(card, "--spot-y", "px");
        const move = (event) => {
          const bounds = card.getBoundingClientRect();
          setX(event.clientX - bounds.left);
          setY(event.clientY - bounds.top);
        };
        const leave = () => gsap.to(card, { "--spot-alpha": 0, duration: 0.25, overwrite: true });
        const enter = () => gsap.to(card, { "--spot-alpha": 1, duration: 0.2, overwrite: true });
        card.addEventListener("pointermove", move);
        card.addEventListener("pointerenter", enter);
        card.addEventListener("pointerleave", leave);
        spotlightHandlers.push(() => {
          card.removeEventListener("pointermove", move);
          card.removeEventListener("pointerenter", enter);
          card.removeEventListener("pointerleave", leave);
        });
      });

      if (scope.querySelector(".dashboard-showcase")) {
        gsap.to(".showcase-paper-card", {
          y: -10, rotate: 3, ease: "none",
          scrollTrigger: { trigger: ".dashboard-showcase", start: "top bottom", end: "bottom top", scrub: 0.8 },
        });
        gsap.to(".showcase-float-note", { y: -7, duration: 2.6, repeat: -1, yoyo: true, ease: "sine.inOut" });
      }

      gsap.to(".reading-progress", {
        scaleX: 1, ease: "none",
        scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: 0.25 },
      });
      ScrollTrigger.refresh();
    }, scope);

    return () => {
      spotlightHandlers.forEach((remove) => remove());
      context.revert();
    };
  }, [enabled, pathname, scopeRef, engine]);

  return lenisRef;
}
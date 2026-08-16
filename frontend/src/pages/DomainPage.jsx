import { useState, useCallback, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import { CalendarDays, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LetterPageShell, PageSection, SectionKicker, fadeUp } from "@/components/LetterPageShell";
import { DOMAIN_EVENTS, IMAGES } from "@/data/content";
import { useTransitionNav } from "@/components/PageTransition";

/*
  PixelCycleViewer — 3-state pixel transition image viewer.
  State 0 (default): shows photo 1 (current round)
  State 1 (hovered): pixel-transitions to photo 2 (next round)
  State 2 (clicked while hovered): pixel-transitions to photo 3 (round after next)
  Mouse leave from state 1 or 2: pixel-transitions back to photo 1
*/

const GRID_SIZE = 12;
const STEP_DURATION = 0.4;
const PIXEL_COLOR = 'hsl(220, 12%, 5%)';

const PixelCycleViewer = ({ rounds, activeRound }) => {
  const containerRef = useRef(null);
  const pixelGridRef = useRef(null);
  const delayedCallRef = useRef(null);
  const stateRef = useRef(0);          // tracks current state without re-renders
  const [displayState, setDisplayState] = useState(0); // drives badge/dots UI

  const img0 = rounds[activeRound % rounds.length];
  const img1 = rounds[(activeRound + 1) % rounds.length];
  const img2 = rounds[(activeRound + 2) % rounds.length];
  const images = [img0, img1, img2];

  // Build the pixel grid on mount
  useEffect(() => {
    const grid = pixelGridRef.current;
    if (!grid) return;
    grid.innerHTML = '';
    const s = 100 / GRID_SIZE;
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const px = document.createElement('div');
        px.className = 'pvcycle-pixel';
        px.style.cssText = `position:absolute;background:${PIXEL_COLOR};width:${s}%;height:${s}%;left:${col * s}%;top:${row * s}%;display:none;`;
        grid.appendChild(px);
      }
    }
  }, []);

  // Core transition: animate pixels, then swap the visible layer
  const runTransition = useCallback((toState) => {
    if (stateRef.current === toState) return;

    const grid = pixelGridRef.current;
    const container = containerRef.current;
    if (!grid || !container) return;

    const pixels = grid.querySelectorAll('.pvcycle-pixel');
    if (!pixels.length) return;

    // Kill any in-progress animation
    gsap.killTweensOf(pixels);
    if (delayedCallRef.current) delayedCallRef.current.kill();

    gsap.set(pixels, { display: 'none' });
    const stagger = STEP_DURATION / pixels.length;

    // Phase 1: pixels appear in random order
    gsap.to(pixels, {
      display: 'block',
      duration: 0,
      stagger: { each: stagger, from: 'random' }
    });

    // Halfway through: swap the visible image layer
    delayedCallRef.current = gsap.delayedCall(STEP_DURATION, () => {
      stateRef.current = toState;
      setDisplayState(toState);
      const layers = container.querySelectorAll('.pvcycle-layer');
      layers.forEach((layer, i) => {
        layer.style.display = i === toState ? 'block' : 'none';
      });
    });

    // Phase 2: pixels disappear in random order
    gsap.to(pixels, {
      display: 'none',
      duration: 0,
      delay: STEP_DURATION,
      stagger: { each: stagger, from: 'random' }
    });
  }, []);

  const handleMouseEnter = useCallback(() => {
    // Only transition if currently at default state
    if (stateRef.current === 0) runTransition(1);
  }, [runTransition]);

  const handleMouseLeave = useCallback(() => {
    // Always reset to default on leave, regardless of state
    if (stateRef.current !== 0) runTransition(0);
  }, [runTransition]);

  const handleClick = useCallback(() => {
    // Only advance to state 2 when currently in state 1 (hovering)
    if (stateRef.current === 1) runTransition(2);
  }, [runTransition]);

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    if (stateRef.current === 0) runTransition(1);
    else if (stateRef.current === 1) runTransition(2);
    else runTransition(0);
  }, [runTransition]);

  if (!img0?.image) return null;

  return (
    <div className="relative mb-10 h-[240px] overflow-hidden rounded-xl md:h-[320px]">
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', position: 'relative', cursor: 'pointer' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
      >
        {/* 3 image layers — only the active one is visible */}
        {images.map((r, i) => (
          <img
            key={i}
            className="pvcycle-layer"
            src={r.image}
            alt={r.name}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              display: i === 0 ? 'block' : 'none',
            }}
            draggable={false}
          />
        ))}

        {/* Bottom gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)',
          pointerEvents: 'none',
          zIndex: 2,
        }} />

        {/* Pixel grid (sits on top of images, under badge overlay) */}
        <div
          ref={pixelGridRef}
          style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}
        />

        {/* Badge + progress dots */}
        <div style={{
          position: 'absolute', bottom: 16, left: 20, right: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          pointerEvents: 'none', zIndex: 4,
        }}>
          <Badge className="bg-background/60 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-primary backdrop-blur">
            {images[displayState].day} · {images[displayState].date}
          </Badge>
          <div style={{ display: 'flex', gap: 6 }}>
            {images.map((_, i) => (
              <span
                key={i}
                style={{
                  display: 'block',
                  height: 6,
                  borderRadius: 9999,
                  width: displayState === i ? 24 : 6,
                  background: displayState === i
                    ? 'hsl(var(--primary))'
                    : 'hsl(var(--primary) / 0.3)',
                  transition: 'width 0.3s ease, background 0.3s ease',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DomainPage() {
  const { go } = useTransitionNav();
  const [activeRounds, setActiveRounds] = useState(
    Object.fromEntries(DOMAIN_EVENTS.current.map((ev) => [ev.id, 0]))
  );

  const setActiveRound = (eventId, roundIdx) => {
    setActiveRounds((prev) => ({ ...prev, [eventId]: roundIdx }));
  };

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      {/* Page content — blurred when overlay is active */}
      <div
        style={{
          filter: "blur(6px)",
          pointerEvents: "none",
          userSelect: "none",
        }}
        aria-hidden="true"
      >
        <LetterPageShell
          idx={3}
          heroImage={IMAGES.skeletonKey}
          title={<span>Three events. Three days. <span className="text-gradient-silver">Three rounds each.</span></span>}
          intro={DOMAIN_EVENTS.intro}
        >
          <PageSection data-testid="domain-current">
            <motion.div {...fadeUp} transition={{ duration: 0.7 }}>
              <Tabs defaultValue={DOMAIN_EVENTS.current[0].id} className="w-full">
                <TabsList className="grid h-auto w-full max-w-2xl grid-cols-3 border border-border bg-secondary/60">
                  {DOMAIN_EVENTS.current.map((ev) => (
                    <TabsTrigger
                      key={ev.id}
                      value={ev.id}
                      className="whitespace-normal px-2 py-2 font-mono-tech text-[10px] uppercase tracking-[0.12em] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:text-xs"
                    >
                      {ev.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {DOMAIN_EVENTS.current.map((ev) => (
                  <TabsContent key={ev.id} value={ev.id} className="mt-10">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge className="bg-gradient-silver font-mono-tech text-[10px] uppercase tracking-[0.2em] text-primary-foreground">2025 Edition</Badge>
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />{ev.dates} · one round per day
                      </span>
                    </div>
                    <h2 className="mt-5 font-display text-3xl font-bold text-foreground">{ev.name}</h2>
                    <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">{ev.description}</p>
                  </TabsContent>
                ))}
              </Tabs>
            </motion.div>
          </PageSection>
        </LetterPageShell>
      </div>

      {/* Coming Soon overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0, 0, 0, 0.55)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: "hsl(var(--card) / 0.92)",
            border: "1px solid hsl(var(--primary) / 0.25)",
            borderRadius: "1.5rem",
            padding: "3rem 3.5rem",
            maxWidth: 480,
            width: "calc(100% - 2.5rem)",
            textAlign: "center",
            boxShadow: "0 0 80px hsl(var(--primary) / 0.12), 0 24px 64px rgba(0,0,0,0.5)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Glow accent */}
          <div
            style={{
              position: "absolute",
              top: "-40%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 320,
              height: 320,
              borderRadius: "50%",
              background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Icon */}
          <motion.div
            animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
            style={{ display: "inline-flex", marginBottom: "1.25rem" }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                border: "1px solid hsl(var(--primary) / 0.35)",
                background: "hsl(var(--primary) / 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.75rem",
              }}
            >
              🔒
            </div>
          </motion.div>

          {/* Label */}
          <p
            style={{
              fontFamily: "var(--font-mono-tech, monospace)",
              fontSize: "0.65rem",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "hsl(var(--primary) / 0.7)",
              marginBottom: "0.75rem",
            }}
          >
            Domain Events · 2025
          </p>

          {/* Heading */}
          <h2
            style={{
              fontFamily: "var(--font-display, serif)",
              fontSize: "clamp(1.6rem, 5vw, 2.2rem)",
              fontWeight: 700,
              color: "hsl(var(--foreground))",
              lineHeight: 1.2,
              marginBottom: "1rem",
            }}
          >
            Coming Soon
          </h2>

          {/* Sub-copy */}
          <p
            style={{
              fontSize: "0.875rem",
              lineHeight: 1.7,
              color: "hsl(var(--muted-foreground))",
              maxWidth: 340,
              margin: "0 auto 2rem",
            }}
          >
            The Domain Events page for FUNDAZ 2025 is being finalised. Check back soon — three brand-new events, each running across all three days of the fest.
          </p>

          {/* Animated dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.1, 0.8] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.22 }}
                style={{
                  display: "block",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "hsl(var(--primary))",
                }}
              />
            ))}
          </div>


          {/* Navigation buttons */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: "2rem", flexWrap: "wrap" }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => go("now")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "0.6rem 1.4rem",
                borderRadius: "0.6rem",
                border: "1px solid hsl(var(--border))",
                background: "transparent",
                color: "hsl(var(--muted-foreground))",
                fontSize: "0.75rem",
                fontFamily: "var(--font-mono-tech, monospace)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "border-color 0.2s ease, color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.5)";
                e.currentTarget.style.color = "hsl(var(--foreground))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "hsl(var(--border))";
                e.currentTarget.style.color = "hsl(var(--muted-foreground))";
              }}
              data-testid="domain-coming-soon-back"
            >
              <ArrowRight className="h-3.5 w-3.5 rotate-180" />
              Back to Now
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => go("arena")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "0.6rem 1.4rem",
                borderRadius: "0.6rem",
                border: "1px solid hsl(var(--primary) / 0.4)",
                background: "hsl(var(--primary) / 0.08)",
                color: "hsl(var(--primary))",
                fontSize: "0.75rem",
                fontFamily: "var(--font-mono-tech, monospace)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "border-color 0.2s ease, background 0.2s ease, color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.8)";
                e.currentTarget.style.background = "hsl(var(--primary) / 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.4)";
                e.currentTarget.style.background = "hsl(var(--primary) / 0.08)";
              }}
              data-testid="domain-coming-soon-arena"
            >
              Activities
              <ArrowRight className="h-3.5 w-3.5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

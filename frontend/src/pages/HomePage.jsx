import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useAnimationFrame, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Preloader } from "@/components/Preloader";
import { LETTERS } from "@/lib/letterPaths";
import { useTransitionNav } from "@/components/PageTransition";

const ORBIT_SIZE = "min(86vw, 620px)";
const ELLIPSE_TILTS = [0, 60, 120];
const ELLIPSE_DIRS = [1, -1, 1];
const ELLIPSE_SPEEDS = [0.00042, 0.00036, 0.00048];

// F is index 0 in LETTERS — highlight that atom during the hint overlay
const HINT_ATOM_INDEX = 0;
const HINT_DURATION_MS = 2600; // overlay auto-dismisses after ~2.6s

// The landing experience: preloader collision → frosted hint overlay (2.5s) → full atom system
export default function HomePage() {
  const [loading, setLoading] = useState(() => !sessionStorage.getItem("fz_preloaded"));
  const [showHint, setShowHint] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  const { go } = useTransitionNav();
  const systemRef = useRef(null);
  const nodeRefs = useRef([]);
  const thetaRef = useRef(0);
  const lastRef = useRef(0);
  const hoverRef = useRef(false);
  const hintTimerRef = useRef(null);
  const showHintRef = useRef(false);

  useEffect(() => {
    // Landing is now scrollable — remove the old body overflow lock
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Once preloader finishes, show the frosted hint overlay then auto-dismiss
  const handlePreloaderComplete = () => {
    sessionStorage.setItem("fz_preloaded", "1");
    setLoading(false);
    setShowHint(true);
    showHintRef.current = true;
    hintTimerRef.current = setTimeout(() => {
      setShowHint(false);
      showHintRef.current = false;
      setHintDismissed(true);
    }, HINT_DURATION_MS);
  };

  // If user taps/clicks, dismiss the overlay early
  const dismissHint = () => {
    if (!showHintRef.current) return;
    clearTimeout(hintTimerRef.current);
    setShowHint(false);
    showHintRef.current = false;
    setHintDismissed(true);
  };

  useAnimationFrame((t) => {
    const delta = lastRef.current ? t - lastRef.current : 16;
    lastRef.current = t;
    
    // Pause orbital animation if hovering OR showing hint
    if (!hoverRef.current && !showHintRef.current) {
      thetaRef.current += delta;
    }
    
    const el = systemRef.current;
    if (!el) return;
    const size = el.offsetWidth;
    const a = size * 0.4;
    const b = size * 0.165;
    LETTERS.forEach((_, i) => {
      const node = nodeRefs.current[i];
      if (!node) return;
      const ring = Math.floor(i / 2);
      const tilt = (ELLIPSE_TILTS[ring] * Math.PI) / 180;
      const phase = (i % 2) * Math.PI + ring * 0.9;
      const th = thetaRef.current * ELLIPSE_SPEEDS[ring] * ELLIPSE_DIRS[ring] + phase;
      const lx = a * Math.cos(th);
      const ly = b * Math.sin(th);
      const x = lx * Math.cos(tilt) - ly * Math.sin(tilt);
      const y = lx * Math.sin(tilt) + ly * Math.cos(tilt);
      const depth = Math.sin(th);
      const scale = 0.82 + 0.18 * ((depth + 1) / 2);
      
      node.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      
      if (showHintRef.current) {
        if (i === HINT_ATOM_INDEX) {
          node.style.zIndex = 100;
          node.style.opacity = "1";
          node.style.filter = "none";
        } else {
          node.style.zIndex = depth >= 0 ? 12 : 3;
          node.style.opacity = "0.2";
          node.style.filter = "blur(2px)";
        }
      } else {
        node.style.zIndex = depth >= 0 ? 12 : 3;
        node.style.opacity = String(0.75 + 0.25 * ((depth + 1) / 2));
        node.style.filter = "none";
      }
    });
  });



  return (
    <div className="relative" data-testid="landing-page">
      {loading && <Preloader onComplete={handlePreloaderComplete} />}

      <Navbar minimal />

      {/* ── Section 1: Hero (full viewport) ── */}
      <section
        className="relative flex h-screen flex-col items-center justify-center px-5"
        data-testid="hero-section"
      >

        <div className="pointer-events-none absolute inset-0 bg-gradient-section" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[76vmin] w-[76vmin] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle, hsl(212 16% 20% / 0.55), transparent 65%)" }} />

        <motion.div
          ref={systemRef}
          initial={{ opacity: 0, scale: 0.82 }}
          animate={{ opacity: loading ? 0 : 1, scale: loading ? 0.82 : 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="orbit-system relative"
          style={{ 
            "--orbit-size": ORBIT_SIZE, 
            width: ORBIT_SIZE, 
            height: "calc(min(86vw, 620px) * 0.82)",
            zIndex: showHint ? 90 : 1
          }}
          data-testid="hero-orbit-system"
        >
          <div className="atom-ellipse" style={{ transform: "rotate(0deg)", opacity: showHint ? 0.2 : 1, transition: "opacity 0.5s" }} />
          <div className="atom-ellipse" style={{ transform: "rotate(60deg)", opacity: showHint ? 0.2 : 1, transition: "opacity 0.5s" }} />
          <div className="atom-ellipse" style={{ transform: "rotate(120deg)", opacity: showHint ? 0.2 : 1, transition: "opacity 0.5s" }} />

          <div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" 
            style={{ 
              zIndex: 6, 
              opacity: showHint ? 0.2 : 1, 
              filter: showHint ? 'blur(2px)' : 'none',
              transition: "opacity 0.5s, filter 0.5s"
            }}
          >
            <div className="nucleus-pi flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary/60 bg-secondary/80 backdrop-blur-md sm:h-24 sm:w-24">
              <span className="font-serif text-4xl italic text-gradient-silver sm:text-5xl" style={{ WebkitTextFillColor: "transparent" }}>π</span>
            </div>
          </div>

          {LETTERS.map((l, i) => (
            <div
              key={l.char}
              ref={(r) => { nodeRefs.current[i] = r; }}
              className="absolute left-1/2 top-1/2"
              style={{ marginLeft: "-26px", marginTop: "-26px", willChange: "transform, opacity, filter", transition: "opacity 0.5s, filter 0.5s" }}
            >
              <button
                className={`orbit-node group relative ${showHint && i === HINT_ATOM_INDEX ? 'ring-4 ring-primary/80 shadow-[0_0_40px_hsl(var(--primary)/0.6)] bg-secondary' : ''}`}
                onClick={() => {
                  dismissHint();
                  go(l.id);
                }}
                onMouseEnter={() => { hoverRef.current = true; dismissHint(); }}
                onMouseLeave={() => { hoverRef.current = false; }}
                aria-label={`${l.char} — ${l.word}`}
                data-testid={`hero-orbit-letter-${l.char.toLowerCase()}`}
              >
                {l.char}
                <span className="pointer-events-none absolute top-full mt-2 whitespace-nowrap font-mono-tech text-[9px] uppercase tracking-[0.25em] text-primary opacity-0 group-hover:opacity-100" style={{ transition: "opacity 0.25s ease" }}>
                  {l.word}
                </span>
                
                {/* Pulsing ring for the highlighted atom */}
                {showHint && i === HINT_ATOM_INDEX && (
                  <motion.div
                    className="absolute inset-[-14px] rounded-full border border-primary/60 pointer-events-none"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
              </button>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: loading ? 0 : 1, y: loading ? 24 : 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mt-8 flex flex-col items-center text-center"
        >
          <p className="font-mono-tech text-[10px] uppercase tracking-[0.45em] text-muted-foreground sm:text-xs">
            A Domain of Aaruush · SRMIST
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-[0.2em] sm:text-4xl">
            <span className="text-gradient-silver">FUNDAZ</span>
          </h1>
          <motion.p
            className="mt-4 font-mono-tech text-[10px] uppercase tracking-[0.35em] text-primary/60"
            animate={{ opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            data-testid="hero-hint"
          >
            Pick a letter to enter its world
          </motion.p>
        </motion.div>
      </section>

      {/* ── Frosted hint overlay ── */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            key="hint-overlay"
            className="landing-hint-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onClick={dismissHint}
            aria-hidden="true"
          >
            <motion.p
              className="landing-hint-text mt-[35vh]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: [0, 1, 1, 0.7], y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              tap any atom to explore
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

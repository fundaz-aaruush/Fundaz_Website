import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LETTERS, LETTER_PATHS } from "@/lib/letterPaths";

/*
  Cinematic page transitions:
  1. "cover"  — the source letter zooms out of screen, while the target letter zooms in from 0 to 1.
  2. "hold"   — the target letter wiggles / charges (orbiting electron ring) while the
                route silently swaps underneath.
  3. "reveal" — the target letter zooms out past the viewport as the overlay dissolves
                into the new page's content.
*/

const TransitionContext = createContext({ go: () => {} });
export const useTransitionNav = () => useContext(TransitionContext);

const COVER_MS = 620;
const HOLD_MS = 1050;
const REVEAL_MS = 800;

export const TransitionProvider = ({ children }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [state, setState] = useState(null); // { idx: target, sIdx: source, phase }
  const busyRef = useRef(false);
  
  const currentIdx = LETTERS.findIndex((l) => `/${l.id}` === pathname);

  const go = useCallback(
    (id) => {
      if (busyRef.current) return;
      const idx = id === "home" ? -1 : LETTERS.findIndex((l) => l.id === id);
      const sIdx = currentIdx; // capture current route
      busyRef.current = true;
      setState({ idx, sIdx, phase: "cover" });
    },
    [currentIdx]
  );

  useEffect(() => {
    if (!state) return undefined;
    let t;
    if (state.phase === "cover") {
      t = setTimeout(() => {
        const targetPath = state.idx < 0 ? "/home" : `/${LETTERS[state.idx].id}`;
        navigate(targetPath);
        window.scrollTo({ top: 0, behavior: "instant" });
        setState((s) => ({ ...s, phase: "hold" }));
      }, COVER_MS);
    } else if (state.phase === "hold") {
      t = setTimeout(() => setState((s) => ({ ...s, phase: "reveal" })), HOLD_MS);
    } else if (state.phase === "reveal") {
      t = setTimeout(() => {
        setState(null);
        busyRef.current = false;
      }, REVEAL_MS);
    }
    return () => clearTimeout(t);
  }, [state, navigate]);

  const targetLetter = state && state.idx >= 0 ? LETTERS[state.idx] : null;
  const sourceLetter = state && state.sIdx >= 0 ? LETTERS[state.sIdx] : null;
  const phase = state?.phase;

  return (
    <TransitionContext.Provider value={{ go, transitioning: !!state }}>
      {children}

      {state && (
        <motion.div
          className="fixed inset-0 z-[95] flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "reveal" ? 0 : 1 }}
          transition={{ duration: phase === "reveal" ? 0.75 : 0.3, ease: "easeOut" }}
          data-testid="page-transition-overlay"
        >
          {/* charging ring around the letter during hold */}
          <div className="relative flex items-center justify-center">
            <motion.div
              className="absolute rounded-full border border-dashed border-primary/30"
              style={{ width: 220, height: 220 }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{
                opacity: phase === "hold" ? 1 : 0,
                scale: phase === "hold" ? 1 : 0.6,
                rotate: 360,
              }}
              transition={{ rotate: { duration: 5, repeat: Infinity, ease: "linear" }, opacity: { duration: 0.3 }, scale: { duration: 0.4 } }}
            >
              <span className="absolute -top-1 left-1/2 h-2 w-2 rounded-full bg-primary shadow-glow" />
            </motion.div>

            {/* SOURCE LETTER */}
            {(phase === "cover" || phase === "hold") && (
              <motion.div
                key={`source-${state.sIdx}`}
                className="absolute flex items-center justify-center"
                initial={{ scale: 1, opacity: 1, rotate: 0 }}
                animate={{
                  scale: phase === "cover" ? 25 : 25,
                  opacity: phase === "cover" ? 0 : 0
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ willChange: "transform, opacity" }}
              >
                {sourceLetter ? (
                  <svg viewBox="-6 -6 92 132" className="companion-letter w-[110px]">
                    <path d={LETTER_PATHS[sourceLetter.char]} style={{ fill: "hsl(var(--primary) / 0.16)" }} />
                  </svg>
                ) : (
                  <span className="font-serif text-8xl italic text-gradient-silver" style={{ WebkitTextFillColor: "transparent" }}>π</span>
                )}
              </motion.div>
            )}

            {/* TARGET LETTER */}
            <motion.div
              key={`target-${state.idx}`}
              className="absolute flex items-center justify-center"
              initial={{ scale: 0.1, opacity: 0 }}
              animate={
                phase === "cover"
                  ? { scale: 1, opacity: 1, rotate: 0 }
                  : phase === "hold"
                    ? { scale: [1, 1.07, 1], opacity: 1, rotate: [-6, 6, -6] }
                    : { scale: 25, opacity: 0, rotate: 0 }
              }
              transition={
                phase === "cover"
                  ? { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
                  : phase === "hold"
                    ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.78, ease: [0.55, 0, 0.68, 0.2] }
              }
              style={{ willChange: "transform, opacity" }}
              data-testid="transition-letter"
            >
              {targetLetter ? (
                <svg viewBox="-6 -6 92 132" className="companion-letter w-[110px]">
                  <path d={LETTER_PATHS[targetLetter.char]} style={{ fill: "hsl(var(--primary) / 0.16)" }} />
                </svg>
              ) : (
                <span className="font-serif text-8xl italic text-gradient-silver" style={{ WebkitTextFillColor: "transparent" }}>π</span>
              )}
            </motion.div>
          </div>

          <motion.p
            className="mt-12 font-mono-tech text-[10px] uppercase tracking-[0.5em] text-muted-foreground"
            animate={{ opacity: phase === "reveal" ? 0 : [0.4, 1, 0.4] }}
            transition={{ duration: 1.4, repeat: phase === "reveal" ? 0 : Infinity }}
            data-testid="transition-label"
          >
            {targetLetter ? `Entering · ${targetLetter.word}` : "Returning to the orbit"}
          </motion.p>
        </motion.div>
      )}
    </TransitionContext.Provider>
  );
};

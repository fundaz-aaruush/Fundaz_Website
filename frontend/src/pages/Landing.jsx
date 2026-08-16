import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useAnimationFrame, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Preloader } from "@/components/Preloader";
import { LETTERS } from "@/lib/letterPaths";
import { useTransitionNav } from "@/components/PageTransition";
import { RegNoVerifier, OnboardingFlow } from "@/pages/RegisterPage";
const ORBIT_SIZE = "min(86vw, 620px)";
const ELLIPSE_TILTS = [0, 60, 120];
const ELLIPSE_DIRS = [1, -1, 1];
const ELLIPSE_SPEEDS = [0.00042, 0.00036, 0.00048];

// F is index 0 in LETTERS — highlight that atom during the hint overlay
const HINT_ATOM_INDEX = 0;
const HINT_DURATION_MS = 2600; // overlay auto-dismisses after ~2.6s

// The landing experience: preloader collision → frosted hint overlay (2.5s) → full atom system
export default function Landing() {
  const { go } = useTransitionNav();
  const formSectionRef = useRef(null);
  const verifierSectionRef = useRef(null);

  const scrollToVerifier = useCallback(() => {
    verifierSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const scrollToForm = useCallback(() => {
    formSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="relative" data-testid="landing-page">
      <Navbar minimal />
      {/* ── Section 1: Intro Video ── */}
      <section
        style={{
          height: "100vh",
          width: "100%",
          position: "relative",
          background: "#000",
          overflow: "hidden"
        }}
      >
        <video
          src="/videos/intro.mp4"
          autoPlay
          muted
          playsInline
          onEnded={scrollToVerifier}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />
      </section>

      {/* ── Section 2: Reg number verifier ── */}
      <section
        ref={verifierSectionRef}
        style={{
          minHeight: "100vh",
          background: "#090912",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "6rem 1.5rem 4rem",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" }} />
        <RegNoVerifier
          onGoHome={() => go("home")}
          onScrollToForm={scrollToForm}
        />
      </section>

      {/* ── Section 3: GSAP onboarding flow (unlocked after verification) ── */}
      <section
        ref={formSectionRef}
        style={{
          minHeight: "100vh",
          background: "#090912",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)" }} />
        <OnboardingFlow
          onSuccess={() => {
            scrollToVerifier();
            setTimeout(() => go("home"), 2200);
          }}
        />
      </section>
    </div>
  );
}

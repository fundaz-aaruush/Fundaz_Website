/**
 * RegisterPage.jsx — FUNDAZ 2025 Event Registration
 *
 * Flow:
 *  "verify"  → RegNoVerifier  — enter & validate reg number, Firestore duplicate check
 *  "form"    → OnboardingFlow — GSAP S-curve waypoint animation (name, email, phone, course)
 *  "success" → SuccessScreen  — confirmation + navigation
 */
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import {
  collection, addDoc, getDocs, query, where, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useTransitionNav } from "@/components/PageTransition";
import { AtomLogo } from "@/components/AtomLogo";

// ─── Field config ──────────────────────────────────────────────────────────────

const FIELDS = [
  { key: "name",   label: "First Name",     placeholder: "Ada Lovelace",       type: "text",  side: "left",  autoComplete: "given-name" },
  { key: "regNo",  label: "Register No.",   placeholder: "RA2311XXXXXXX",      type: "text",  side: "right", autoComplete: "off" },
  { key: "course", label: "Branch / Dept.", placeholder: "B.Tech CSE",         type: "text",  side: "left",  autoComplete: "off" },
  { key: "phone",  label: "Phone Number",   placeholder: "98765 43210",        type: "tel",   side: "right", autoComplete: "tel",   inputMode: "tel" },
  { key: "email",  label: "Email Address",  placeholder: "you@srmist.edu.in",  type: "email", side: "left",  autoComplete: "email", inputMode: "email" },
];

// ─── Validators ────────────────────────────────────────────────────────────────

function validateRegNo(v) {
  const t = v.trim().toUpperCase();
  if (!t) return "Registration number is required";
  if (!t.startsWith("RA")) return "Must start with RA (e.g. RA2311026010535)";
  if (t.length < 10) return "Registration number is too short";
  if (!/^RA[0-9A-Z]+$/.test(t)) return "Invalid format — only RA followed by digits";
  return null;
}

const VALIDATORS = {
  name: (v) => {
    const t = v.trim();
    if (!t) return "First name is required";
    if (t.length < 2) return "At least 2 characters required";
    if (!/^[a-zA-Z\s.''()-]+$/.test(t)) return "Only letters and spaces allowed";
    return null;
  },
  regNo: (v) => {
    const t = v.trim().toUpperCase();
    if (!t) return "Registration number is required";
    if (!t.startsWith("RA")) return "Must start with RA (e.g. RA2311026010535)";
    if (t.length < 10) return "Registration number is too short";
    if (!/^RA[0-9A-Z]+$/.test(t)) return "Invalid format — only RA followed by digits";
    return null;
  },
  course: (v) => {
    const t = v.trim();
    if (!t) return "Branch / department is required";
    if (t.length < 2) return "Enter at least 2 characters";
    return null;
  },
  phone: (v) => {
    const d = v.replace(/[\s()\-+]/g, "");
    if (!d) return "Phone number is required";
    if (!/^\d{10}$/.test(d)) return "Enter a valid 10-digit number";
    return null;
  },
  email: (v) => {
    const t = v.trim();
    if (!t) return "Email address is required";
    if (!/^\S+@\S+\.\S+$/.test(t)) return "Enter a valid email address";
    return null;
  },
};

// ─── SVG / GSAP constants ──────────────────────────────────────────────────────

const VIEW_W = 1200;
const VIEW_H = 1370;
const BALL_R = 44;

const ANCHORS = [
  { x: 600, y: 80   },  // A – entry
  { x: 810, y: 260  },  // B – regNo  (card left,  ball right)
  { x: 390, y: 480  },  // C – name   (card right, ball left)
  { x: 810, y: 700  },  // D – email  (card left,  ball right)
  { x: 390, y: 920  },  // E – phone  (card right, ball left)
  { x: 810, y: 1140 },  // F – course (card left,  ball right)
  { x: 600, y: 1290 },  // G – exit
];

const PATH_D = [
  "M 600 80",
  "C 600 185, 810 165, 810 260",
  "C 810 375, 390 355, 390 480",
  "C 390 595, 810 575, 810 700",
  "C 810 815, 390 795, 390 920",
  "C 390 1035, 810 1015, 810 1140",
  "C 810 1240, 600 1225, 600 1290",
].join(" ");

const CARD_CX = { left: 235, right: 965 };
const CARD_W  = 440;
const WORD = "FUNDAZ".split("");
const LETTER_FRACS = WORD.map((_, i) => 0.1 + (i * 0.8) / (WORD.length - 1));

const mono = "monospace";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

// ─── OnboardingFlow ───────────────────────────────────────────────────────────

export function OnboardingFlow({ onSuccess }) {
  const isMobile = useIsMobile();
  const pathRef  = useRef(null);
  const ballRef  = useRef(null);
  const spinRef  = useRef(null);
  const trailRef = useRef(null);
  const glowRef  = useRef(null);
  const inputRef = useRef(null);

  const letterOuter = useRef([]);
  const letterInner = useRef([]);
  const shownRef    = useRef([]);
  const valuesRef   = useRef({});   // always-fresh snapshot for the Firestore effect

  const fracsRef    = useRef([]);
  const totalRef    = useRef(0);
  const prevFracRef = useRef(0);
  const spinDegRef  = useRef(0);

  const [ready,      setReady]      = useState(false);
  const [step,       setStep]       = useState(0);
  const [values,     setValues]     = useState({});
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [checking,   setChecking]   = useState(false); // async regNo duplicate check
  const [submitError,setSubmitError] = useState(null);
  const [animating,  setAnimating]  = useState(true); // true initially for the entrance roll

  const done = step >= FIELDS.length;
  valuesRef.current = values;  // keep ref current on every render

  // Reveal / retract FUNDAZ letters as the ball rolls past their positions
  function revealLetters(frac) {
    LETTER_FRACS.forEach((lf, i) => {
      const el = letterInner.current[i];
      if (!el) return;
      const show = frac >= lf - 0.002;
      if (show && !shownRef.current[i]) {
        shownRef.current[i] = true;
        gsap.to(el, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "back.out(2.2)", overwrite: true });
      } else if (!show && shownRef.current[i]) {
        shownRef.current[i] = false;
        gsap.to(el, { opacity: 0, y: -16, scale: 0.4, duration: 0.3, ease: "power1.in", overwrite: true });
      }
    });
  }

  // One-time setup: measure path length, place letters, entrance roll
  useLayoutEffect(() => {
    gsap.registerPlugin(MotionPathPlugin);
    const path  = pathRef.current;
    const trail = trailRef.current;
    if (!path || !trail) return;

    const L = path.getTotalLength();
    totalRef.current = L;

    // Find path fraction closest to each anchor by sampling 2400 points
    const fracFor = (pt) => {
      let best = 0, bestD = Infinity;
      for (let i = 0; i <= 2400; i++) {
        const l = (i / 2400) * L;
        const p = path.getPointAtLength(l);
        const d = (p.x - pt.x) ** 2 + (p.y - pt.y) ** 2;
        if (d < bestD) { bestD = d; best = l / L; }
      }
      return best;
    };
    fracsRef.current = ANCHORS.map(fracFor);

    // Place letters along the rail, hidden initially
    LETTER_FRACS.forEach((lf, i) => {
      const p = path.getPointAtLength(L * lf);
      letterOuter.current[i]?.setAttribute("transform", `translate(${p.x} ${p.y})`);
      shownRef.current[i] = false;
      if (letterInner.current[i]) {
        gsap.set(letterInner.current[i], { opacity: 0, y: -16, scale: 0.4, transformOrigin: "50% 50%" });
      }
    });

    // Set trail dasharray; start from entry → first field waypoint
    const startFrac = fracsRef.current[0];
    const endFrac   = fracsRef.current[1];
    trail.style.strokeDasharray  = `${L}`;
    trail.style.strokeDashoffset = `${L * (1 - endFrac)}`;

    prevFracRef.current = endFrac;
    const arc  = Math.abs(endFrac - startFrac) * L;
    const spin = (arc / BALL_R) * (180 / Math.PI);
    spinDegRef.current = spin;

    gsap.set([ballRef.current, glowRef.current], {
      motionPath: { path, start: startFrac, end: startFrac, autoRotate: false },
    });

    // Entrance roll
    setAnimating(true);
    gsap.fromTo(
      [ballRef.current, glowRef.current],
      { motionPath: { path, start: startFrac, end: startFrac, autoRotate: false } },
      { duration: 2.2, ease: "power2.out", motionPath: { path, start: startFrac, end: endFrac, autoRotate: false } }
    );
    gsap.fromTo(spinRef.current,
      { rotate: 0 },
      { rotate: spin, duration: 2.2, ease: "power2.out", transformOrigin: "50% 50%" }
    );
    gsap.fromTo(trail,
      { strokeDashoffset: L * (1 - startFrac) },
      { strokeDashoffset: L * (1 - endFrac),   duration: 2.2, ease: "power2.out" }
    );

    const prox = { f: startFrac };
    gsap.to(prox, { 
      f: endFrac, 
      duration: 2.2, 
      ease: "power2.out", 
      onUpdate: () => revealLetters(prox.f),
      onComplete: () => setAnimating(false)
    });

    setReady(true);
    return () => gsap.killTweensOf([ballRef.current, glowRef.current, spinRef.current, trail]);
  }, []);

  // Roll ball to next waypoint when step changes
  useEffect(() => {
    if (!ready) return;
    const path  = pathRef.current;
    const trail = trailRef.current;
    if (!path || !trail) return;

    const L       = totalRef.current;
    const fracs   = fracsRef.current;
    const target  = done ? fracs[fracs.length - 1] : fracs[step + 1];
    const from    = prevFracRef.current;
    if (target === from) return;

    const arc      = Math.abs(target - from) * L;
    const dir      = target >= from ? 1 : -1;
    const nextSpin = spinDegRef.current + dir * (arc / BALL_R) * (180 / Math.PI);

    setAnimating(true);
    gsap.to([ballRef.current, glowRef.current], {
      duration: 2, ease: "power1.inOut",
      motionPath: { path, start: from, end: target, autoRotate: false },
    });
    gsap.to(spinRef.current,
      { rotate: nextSpin, duration: 2, ease: "power1.inOut", transformOrigin: "50% 50%" }
    );
    gsap.to(trail,
      { strokeDashoffset: L * (1 - target), duration: 2, ease: "power1.inOut" }
    );

    const prox = { f: from };
    gsap.to(prox, { 
      f: target, 
      duration: 2, 
      ease: "power1.inOut", 
      onUpdate: () => revealLetters(prox.f),
      onComplete: () => setAnimating(false)
    });

    prevFracRef.current = target;
    spinDegRef.current  = nextSpin;
  }, [step, done, ready]);

  // Auto-focus active input after the ball animation settles
  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => inputRef.current?.focus(), 500);
    return () => clearTimeout(t);
  }, [step, done]);

  // Save all fields to Firestore when the form is complete
  useEffect(() => {
    if (!done) return;
    const v = valuesRef.current;
    const save = async () => {
      setSubmitting(true);
      try {
        const savePromise = addDoc(collection(db, "users"), {
          regNo:       v.regNo?.trim().toUpperCase()        ?? "",
          name:        v.name?.trim()                       ?? "",
          email:       v.email?.trim()                      ?? "",
          phone:       v.phone?.replace(/[\s()\-+]/g, "")  ?? "",
          course:      v.course?.trim()                     ?? "",
          submittedAt: serverTimestamp(),
        });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout saving to database. Are you on a restricted Wi-Fi network?")), 8000));
        
        await Promise.race([savePromise, timeoutPromise]);
        
        setSubmitting(false);
        onSuccess();
      } catch (err) {
        console.error("Firestore save failed:", err);
        setSubmitError(err.message || "Failed to save registration. Please check Firebase permissions.");
        setSubmitting(false);
      }
    };
    save();
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  // Validate current field (async for regNo — checks Firestore duplicate), then advance
  async function advance() {
    if (step >= FIELDS.length || checking) return;
    const field = FIELDS[step];
    const val   = values[field.key] ?? "";
    const err   = VALIDATORS[field.key](val);
    if (err) {
      setErrors((e) => ({ ...e, [field.key]: err }));
      return;
    }
    // For the regNo field, check Firestore for duplicate before rolling forward
    if (field.key === "regNo") {
      setChecking(true);
      try {
        const normalized = val.trim().toUpperCase();
        
        // Wrap the Firebase call in a 5-second timeout so it doesn't hang forever on blocked networks
        const checkPromise = getDocs(
          query(collection(db, "users"), where("regNo", "==", normalized))
        );
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));
        
        const snap = await Promise.race([checkPromise, timeoutPromise]);
        
        if (!snap.empty) {
          setErrors((e) => ({ ...e, regNo: "This reg number is already registered — use the lookup above" }));
          setChecking(false);
          return;
        }
        // Normalise to uppercase in values
        setValues((v) => ({ ...v, regNo: normalized }));
      } catch (err) {
        // Network error or timeout — let them proceed; Firestore save will naturally fail on its own if completely blocked
        setValues((v) => ({ ...v, regNo: val.trim().toUpperCase() }));
      }
      setChecking(false);
    }
    setErrors((e) => ({ ...e, [field.key]: null }));
    setStep((s) => s + 1);
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  return (
    <div style={{ position: "relative", width: "100%", minHeight: "90vh", overflow: "hidden" }}>

      {/* Step counter */}
      <p style={{
        position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
        fontFamily: mono, fontSize: "0.65rem", letterSpacing: "0.3em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.38)",
        margin: 0, zIndex: 5, pointerEvents: "none", whiteSpace: "nowrap",
      }}>
        {done ? "Registration complete" : `Step ${step + 1} / ${FIELDS.length}`}
      </p>

      {/* SVG canvas */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg
          style={{ width: "100%", maxWidth: 1320, height: "auto" }}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          fill="none"
        >
          <defs>
            <linearGradient id="rp_rail" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0"    stopColor="#1a1c1f" />
              <stop offset="0.28" stopColor="#5f656c" />
              <stop offset="0.48" stopColor="#c9ced4" />
              <stop offset="0.56" stopColor="#f2f4f7" />
              <stop offset="0.66" stopColor="#aab0b7" />
              <stop offset="0.82" stopColor="#4a4e54" />
              <stop offset="1"    stopColor="#141619" />
            </linearGradient>
            <radialGradient id="rp_chrome" cx="0.36" cy="0.3" r="0.75">
              <stop offset="0"    stopColor="#ffffff" />
              <stop offset="0.16" stopColor="#e8ecf0" />
              <stop offset="0.42" stopColor="#a7aeb6" />
              <stop offset="0.72" stopColor="#484d54" />
              <stop offset="1"    stopColor="#111316" />
            </radialGradient>
            <radialGradient id="rp_hot" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0"   stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="0.6" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="1"   stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="rp_shadow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#000000" stopOpacity="0.75" />
              <stop offset="1" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="rp_sectionglow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0"    stopColor="#ffffff" stopOpacity="0.16" />
              <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="1"    stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <filter id="rp_glowf" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Travelling section glow (follows the ball) */}
          <g ref={glowRef}><circle r="340" fill="url(#rp_sectionglow)" /></g>

          {/* Mounting brackets at each field waypoint */}
          {ANCHORS.slice(1, 6).map((a, i) => (
            <g key={i} opacity="0.9">
              <rect x={a.x - 7} y={a.y - 26} width="14" height="52" rx="4"   fill="#2a2d31" />
              <rect x={a.x - 7} y={a.y - 26} width="5"  height="52" rx="2.5" fill="#5c6167" />
              <circle cx={a.x} cy={a.y - 20} r="2.4" fill="#0d0e10" />
              <circle cx={a.x} cy={a.y + 20} r="2.4" fill="#0d0e10" />
            </g>
          ))}

          {/* Rail tube — base, ribbed grooves, specular highlight */}
          <path ref={pathRef} d={PATH_D} stroke="url(#rp_rail)" strokeWidth="24" strokeLinecap="round" />
          <path d={PATH_D} stroke="#000000" strokeOpacity="0.26" strokeWidth="24" strokeDasharray="2 10" />
          <path d={PATH_D} stroke="#ffffff" strokeOpacity="0.14" strokeWidth="3"  strokeLinecap="round" />
          {/* Lit trail */}
          <path ref={trailRef} d={PATH_D} stroke="#ffffff" strokeOpacity="0.85" strokeWidth="6" strokeLinecap="round" filter="url(#rp_glowf)" />

          {/* FUNDAZ letters deposited along the rail */}
          {WORD.map((ch, i) => (
            <g key={i} ref={(el) => { letterOuter.current[i] = el; }}>
              <g ref={(el) => { letterInner.current[i] = el; }}>
                <text
                  textAnchor="middle" dominantBaseline="central"
                  fontFamily={mono} fontSize="46" fontWeight={800}
                  fill="url(#rp_chrome)"
                  stroke="#000000" strokeOpacity="0.85" strokeWidth="5"
                  style={{ paintOrder: "stroke fill" }}
                >{ch}</text>
              </g>
            </g>
          ))}

          {/* Rolling chrome ball */}
          <g ref={ballRef}>
            <ellipse cx="0" cy={BALL_R + 9} rx={BALL_R - 4} ry="10" fill="url(#rp_shadow)" />
            <g transform="rotate(10)">
              <circle r={BALL_R} fill="url(#rp_chrome)" />
              <g ref={spinRef}><ellipse cx="-16" cy="-18" rx="15" ry="9" fill="url(#rp_hot)" /></g>
              <circle r={BALL_R} fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1" />
            </g>
          </g>

          {/* Field cards — alternating left / right */}
          {FIELDS.map((f, i) => {
            const anchor   = ANCHORS[i + 1];
            const cx       = CARD_CX[f.side];
            const isActive = i === step && !done;
            const isFilled = i < step || done;
            const isPending = i > step && !done;
            const value    = values[f.key] ?? "";
            const error    = errors[f.key];
            const cardX    = cx - CARD_W / 2;
            const cardY    = anchor.y - 78;
            const edgeX    = f.side === "left" ? cardX + CARD_W : cardX;

            // On mobile, hide filled and pending cards. Only show active card when not animating.
            let showCard = true;
            if (isMobile) {
              showCard = isActive && !animating;
            }

            return (
              <g key={f.key} style={{ opacity: showCard ? 1 : 0, transition: "opacity 0.4s", pointerEvents: showCard ? "auto" : "none" }}>
                {/* Dashed connector to the rail anchor */}
                <line
                  x1={edgeX} y1={anchor.y} x2={anchor.x} y2={anchor.y}
                  stroke={isActive ? "#ffffff" : "#3a3d42"}
                  strokeOpacity={isActive ? 0.55 : 0.6}
                  strokeWidth="2" strokeDasharray="1 6" strokeLinecap="round"
                />

                {/* Card (HTML inside foreignObject) */}
                <foreignObject x={cardX} y={cardY} width={CARD_W} height={172} style={{ overflow: "visible" }}>
                  <div style={{ 
                    width: "100%", height: "100%", 
                    transform: isMobile ? "scale(1.7)" : "scale(1)", 
                    transformOrigin: f.side === "left" ? "left center" : "right center",
                    transition: "transform 0.3s"
                  }}>
                    <div style={{
                      height: "100%",
                      borderRadius: "1rem",
                      border: `1px solid ${isActive ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.09)"}`,
                      background: "#0d0d12",
                      padding: "1rem 1.25rem 0.8rem",
                      boxShadow: isActive
                        ? "0 0 0 1px rgba(255,255,255,0.08), 0 24px 60px -20px rgba(255,255,255,0.2)"
                        : "inset 0 1px 0 rgba(255,255,255,0.03)",
                      opacity: isPending ? 0.4 : 1,
                      transition: "border-color 0.5s, opacity 0.5s, box-shadow 0.5s",
                      boxSizing: "border-box",
                      overflow: "hidden",
                    }}>
                      {/* Label row */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.55rem" }}>
                        <span style={{ fontFamily: mono, fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.28em", color: "rgba(255,255,255,0.38)" }}>
                          {f.label}
                        </span>
                        {isFilled && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                      </div>

                      {/* Filled → show value */}
                      {isFilled ? (
                        <p style={{ fontSize: "1.15rem", fontWeight: 500, color: "white", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {value || "—"}
                        </p>
                      ) : (
                        /* Active / pending → input + advance button */
                        <>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                            <input
                              ref={isActive ? inputRef : undefined}
                              type={f.type}
                              inputMode={f.inputMode}
                              autoComplete={f.autoComplete}
                              placeholder={f.placeholder}
                              value={value}
                              disabled={!isActive}
                              aria-label={f.label}
                              onChange={(e) => {
                                const raw = f.key === "regNo"
                                  ? e.target.value.toUpperCase()
                                  : e.target.value;
                                setValues((v) => ({ ...v, [f.key]: raw }));
                                if (errors[f.key]) setErrors((er) => ({ ...er, [f.key]: null }));
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.nativeEvent?.isComposing) {
                                  e.preventDefault();
                                  advance();
                                }
                              }}
                              style={{
                                flex: 1, height: "3rem",
                                background: "transparent",
                                border: "none",
                                borderBottom: `1px solid ${error ? "#f87171" : isActive ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.1)"}`,
                                color: "white",
                                fontSize: "1.15rem", fontWeight: 500,
                                padding: "0 0.5rem",
                                outline: "none",
                                cursor: isActive ? "text" : "not-allowed",
                                transition: "border-color 0.3s",
                              }}
                            />
                            <button
                              type="button"
                              onClick={advance}
                              disabled={!isActive || (isActive && checking)}
                              aria-label="Continue"
                              style={{
                                width: "3rem", height: "3rem", flexShrink: 0,
                                borderRadius: "50%",
                                border: `1px solid ${isActive ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.08)"}`,
                                background: "transparent", color: "white",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: isActive && !checking ? "pointer" : "not-allowed",
                                opacity: isActive ? 1 : 0.25,
                                transition: "opacity 0.3s, border-color 0.3s",
                              }}
                            >
                              {isActive && checking ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
                                  </path>
                                </svg>
                              ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M5 12h14M13 6l6 6-6 6" />
                                </svg>
                              )}
                            </button>
                          </div>

                          {/* Inline validation error */}
                          {error && (
                            <p style={{ color: "#f87171", fontFamily: mono, fontSize: "0.6rem", margin: "0.3rem 0 0", letterSpacing: "0.05em" }}>
                              ↑ {error}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </foreignObject>
              </g>
            );
          })}

          {/* Completion text at the exit anchor */}
          {done && (
            <foreignObject x={VIEW_W / 2 - 210} y={ANCHORS[6].y + 14} width="420" height="150" style={{ overflow: "visible" }}>
              <div style={{ textAlign: "center", transform: isMobile ? "scale(1.7)" : "scale(1)", transformOrigin: "top center" }}>
                <p style={{ fontFamily: mono, fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", marginBottom: "0.5rem" }}>
                  {submitting ? "Saving to FUNDAZ…" : submitError ? "Error" : "All fields complete"}
                </p>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: submitError ? "#f87171" : "white", margin: 0, marginBottom: "0.5rem" }}>
                  {submitting ? "Submitting…" : submitError ? "Save Failed ✗" : "Registration submitted ✓"}
                </h2>
                {submitError && (
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", maxWidth: "400px", margin: "0 auto" }}>
                    {submitError}
                  </p>
                )}
              </div>
            </foreignObject>
          )}
        </svg>
      </div>

      {/* Back button */}
      {step > 0 && !done && (
        <div style={{ textAlign: "center", paddingBottom: "1.5rem" }}>
          <button
            onClick={back}
            style={{
              fontFamily: mono, fontSize: "0.65rem", letterSpacing: "0.3em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.38)",
              background: "none", border: "none", cursor: "pointer",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "white"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.38)"; }}
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}

// ─── RegNoVerifier — "Already registered?" lookup ─────────────────────────────
// This is NOT a gate for the form. It lets people who already registered
// look up their status and get redirected home.

export function RegNoVerifier({ onGoHome, onScrollToForm }) {
  const [regNo,    setRegNo]    = useState("");
  const [error,    setError]    = useState(null);
  const [checking, setChecking] = useState(false);
  const [result,   setResult]   = useState(null); // null | "found" | "not-found"

  async function handleSubmit(e) {
    e?.preventDefault();
    const t = regNo.trim().toUpperCase();
    if (!t) { setError("Enter your registration number"); return; }
    if (t.length < 5 || !/^[A-Z0-9]+$/i.test(t)) { setError("Enter a valid registration number"); return; }
    setError(null);
    setChecking(true);
    try {
      const snap = await getDocs(
        query(collection(db, "users"), where("regNo", "==", t))
      );
      setResult(snap.empty ? "not-found" : "found");
      if (!snap.empty) {
        // Auto-redirect home after 2s
        setTimeout(() => onGoHome?.(), 2000);
      }
    } catch {
      setError("Connection error — please try again.");
    } finally {
      setChecking(false);
    }
  }

  if (result === "found") {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✓</div>
        <p style={{ fontFamily: mono, fontSize: "0.65rem", letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", marginBottom: "0.5rem" }}>
          You're registered
        </p>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>
          {regNo.toUpperCase()}
        </h2>
        <p style={{ fontFamily: mono, fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", marginBottom: "1.5rem", lineHeight: 1.8 }}>
          Your registration is confirmed.<br />Redirecting you home…
        </p>
      </div>
    );
  }

  if (result === "not-found") {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center" }}>
        <p style={{ fontFamily: mono, fontSize: "0.65rem", letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", marginBottom: "0.5rem" }}>
          Not found
        </p>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>
          {regNo.toUpperCase()} isn't registered yet.
        </h2>
        <p style={{ fontFamily: mono, fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", marginBottom: "1.5rem", lineHeight: 1.8 }}>
          Scroll down and fill in the form to register.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={onScrollToForm}
            style={{ fontFamily: mono, fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "white", padding: "0.7rem 1.5rem", borderRadius: "0.6rem", border: "1px solid rgba(255,255,255,0.28)", background: "transparent", cursor: "pointer", transition: "border-color 0.25s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)"; }}
          >
            Register below ↓
          </button>
          <button
            onClick={() => { setResult(null); setRegNo(""); }}
            style={{ fontFamily: mono, fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", padding: "0.7rem 1.5rem", borderRadius: "0.6rem", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", cursor: "pointer" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "white"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.38)"; }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <p style={{ fontFamily: mono, fontSize: "0.65rem", letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", marginBottom: "0.75rem", textAlign: "center" }}>
        Already Registered?
      </p>
      <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "white", textAlign: "center", lineHeight: 1.2, marginBottom: "0.5rem" }}>
        Look up your registration
      </h2>
      <p style={{ fontFamily: mono, fontSize: "0.7rem", color: "rgba(255,255,255,0.28)", letterSpacing: "0.08em", textAlign: "center", marginBottom: "2.5rem", lineHeight: 1.8 }}>
        Enter your SRM register number to check your status<br />and get redirected home.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <input
          type="text"
          value={regNo}
          onChange={(e) => { setRegNo(e.target.value.toUpperCase()); if (error) setError(null); }}
          placeholder="RA2311XXXXXXX"
          autoComplete="off"
          spellCheck={false}
          style={{
            display: "block", width: "100%",
            height: "3.5rem",
            background: "#0d0d12",
            border: `1px solid ${error ? "#f87171" : "rgba(255,255,255,0.12)"}`,
            borderRadius: "0.75rem",
            color: "white",
            fontSize: "1rem", fontFamily: mono, letterSpacing: "0.12em",
            padding: "0 1.25rem",
            outline: "none",
            marginBottom: "0.5rem",
            boxSizing: "border-box",
            transition: "border-color 0.3s",
          }}
          onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"; }}
          onBlur={(e)  => { if (!error) e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
        />

        {error ? (
          <p style={{ color: "#f87171", fontFamily: mono, fontSize: "0.68rem", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
            ↑ {error}
          </p>
        ) : <div style={{ height: "1.5rem" }} />}

        <button
          type="submit"
          disabled={checking}
          style={{
            display: "block", width: "100%", height: "3.5rem",
            borderRadius: "0.75rem",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "transparent", color: "white",
            fontFamily: mono, fontSize: "0.72rem",
            letterSpacing: "0.3em", textTransform: "uppercase",
            cursor: checking ? "wait" : "pointer",
            transition: "border-color 0.25s, background 0.25s",
          }}
          onMouseEnter={(e) => { if (!checking) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.55)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; } }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.background = "transparent"; }}
        >
          {checking ? "Checking…" : "Check Status →"}
        </button>

        {/* Scroll-to-form hint */}
        <p style={{ fontFamily: mono, fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)", textAlign: "center", marginTop: "1.5rem" }}>
          New here?{" "}
          <button
            type="button"
            onClick={onScrollToForm}
            style={{ fontFamily: "inherit", fontSize: "inherit", letterSpacing: "inherit", textTransform: "inherit", color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}
          >
            Scroll down to register ↓
          </button>
        </p>
      </form>
    </div>
  );
}

// ─── SuccessScreen ─────────────────────────────────────────────────────────────

export function SuccessSection({ regNo, onReset, onBrowse }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "2rem", textAlign: "center" }}>
      <div style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>🎉</div>
      <p style={{ fontFamily: mono, fontSize: "0.65rem", letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", marginBottom: "0.75rem" }}>
        Registration Complete
      </p>
      <h2 style={{ fontSize: "2.25rem", fontWeight: 700, color: "white", lineHeight: 1.2, marginBottom: "0.75rem" }}>
        You're in, {regNo}.
      </h2>
      <p style={{ fontFamily: mono, fontSize: "0.72rem", color: "rgba(255,255,255,0.32)", letterSpacing: "0.08em", maxWidth: 380, marginBottom: "2.5rem", lineHeight: 1.8 }}>
        Your registration for FUNDAZ 2025 has been saved.<br />See you at the fest.
      </p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={onBrowse}
          style={{ fontFamily: mono, fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "white", padding: "0.7rem 1.5rem", borderRadius: "0.6rem", border: "1px solid rgba(255,255,255,0.28)", background: "transparent", cursor: "pointer", transition: "border-color 0.25s" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.6)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)"; }}
        >
          Browse Events →
        </button>
        <button
          onClick={onReset}
          style={{ fontFamily: mono, fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", padding: "0.7rem 1.5rem", borderRadius: "0.6rem", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", cursor: "pointer", transition: "color 0.25s" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "white"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.38)"; }}
        >
          Register Another
        </button>
      </div>
    </div>
  );
}

// ─── RegisterPage — main export ────────────────────────────────────────────────

export default function RegisterPage() {
  const [phase,         setPhase]         = useState("verify"); // "verify" | "form" | "success"
  const [verifiedRegNo, setVerifiedRegNo] = useState(null);
  const { go } = useTransitionNav();

  return (
    <div style={{ minHeight: "100vh", background: "#090912", color: "white", position: "relative" }}>
      {/* Minimal fixed header */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 40,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.85rem 2rem",
        background: "rgba(9,9,18,0.9)", backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <button
          onClick={() => go("home")}
          style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "none", border: "none", cursor: "pointer", color: "white" }}
        >
          <AtomLogo size={26} />
          <span style={{ fontFamily: "var(--font-display, serif)", fontSize: "1rem", fontWeight: 700, letterSpacing: "0.28em" }}>
            FUNDAZ
          </span>
        </button>
        <p style={{ fontFamily: mono, fontSize: "0.6rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", margin: 0 }}>
          Event Registration · 2025
        </p>
      </header>

      {/* Page content — padded below fixed header */}
      <div style={{ paddingTop: "4rem" }}>
        {phase === "verify" && (
          <RegNoVerifier
            onVerified={(rn) => { setVerifiedRegNo(rn); setPhase("form"); }}
          />
        )}
        {phase === "form" && (
          <OnboardingFlow
            regNo={verifiedRegNo}
            onSuccess={() => setPhase("success")}
          />
        )}
        {phase === "success" && (
          <SuccessScreen
            regNo={verifiedRegNo}
            onReset={() => { setVerifiedRegNo(null); setPhase("verify"); }}
          />
        )}
      </div>
    </div>
  );
}

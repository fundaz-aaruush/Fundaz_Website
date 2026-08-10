import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthContext";
import { Starfield } from "@/components/Starfield";
import { LETTER_PATHS } from "@/lib/letterPaths";

/* ─────────────────────────────────────────
   FUNDAZ Auth Gate — fullscreen login/signup
───────────────────────────────────────── */

const EMPTY_SIGNUP = { name: "", email: "", regNo: "", phone: "", course: "", password: "", confirmPassword: "" };
const EMPTY_LOGIN  = { identifier: "", password: "" };
const EMPTY_COMPLETE = { name: "", regNo: "", phone: "", course: "" };

export default function AuthGatePage() {
  const { user, signup, login, loginWithGoogle, completeGoogleProfile, logout } = useAuth();
  const [tab, setTab] = useState(user?.needsProfile ? "complete_profile" : "login");
  
  const [signupForm, setSignupForm] = useState(EMPTY_SIGNUP);
  const [loginForm, setLoginForm] = useState(EMPTY_LOGIN);
  const [completeForm, setCompleteForm] = useState(EMPTY_COMPLETE);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Switch to profile-completion form whenever the auth state indicates it's needed.
  // Depends on uid so it re-runs if a different Google account signs in.
  useEffect(() => {
    if (user?.needsProfile) {
      setTab("complete_profile");
      setErrors({});
      // Pre-fill name (and phone/email if available) from Google account
      setCompleteForm((f) => ({
        ...f,
        name: f.name || user.displayName || "",
      }));
    }
  }, [user?.uid, user?.needsProfile, user?.displayName]);

  const setS = (k) => (e) => setSignupForm((f) => ({ ...f, [k]: e.target.value }));
  const setL = (k) => (e) => setLoginForm((f) => ({ ...f, [k]: e.target.value }));
  const setC = (k) => (e) => setCompleteForm((f) => ({ ...f, [k]: e.target.value }));

  /* ── Validation ── */
  const validateSignup = () => {
    const errs = {};
    if (!signupForm.name.trim())                               errs.name  = "Required";
    if (!/^\S+@\S+\.\S+$/.test(signupForm.email))            errs.email = "Enter a valid email";
    if (!signupForm.regNo.trim())                              errs.regNo = "Required";
    if (!/^\d{10}$/.test(signupForm.phone.replace(/\s/g,""))) errs.phone = "10-digit number";
    if (!signupForm.course.trim())                             errs.course= "Required";
    if (signupForm.password.length < 6)                        errs.password = "At least 6 characters";
    if (signupForm.password !== signupForm.confirmPassword)    errs.confirmPassword = "Passwords don't match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateLogin = () => {
    const errs = {};
    if (!loginForm.identifier.trim()) errs.identifier = "Required";
    if (!loginForm.password)          errs.password   = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateComplete = () => {
    const errs = {};
    if (!completeForm.name.trim())  errs.name  = "Required";
    if (!completeForm.regNo.trim()) errs.regNo = "Required";
    if (!/^\d{10}$/.test(completeForm.phone.replace(/\s/g,""))) errs.phone = "10-digit number";
    if (!completeForm.course.trim()) errs.course= "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Handlers ── */
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;
    setLoading(true);
    try {
      await signup(signupForm);
      toast.success("Welcome to FUNDAZ!", { description: "Account created. The nucleus ignites…" });
    } catch (err) {
      toast.error("Signup failed", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setLoading(true);
    try {
      await login(loginForm);
      toast.success("Logged in!", { description: "Welcome back — FUNDAZ awaits." });
    } catch (err) {
      toast.error("Login failed", { description: "Check your email and password." });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    if (!validateComplete()) return;
    setLoading(true);
    try {
      await completeGoogleProfile({
        name: completeForm.name || user.displayName || "Unknown",
        email: user.email,
        regNo: completeForm.regNo,
        phone: completeForm.phone,
        course: completeForm.course,
      });
      toast.success("Profile complete!", { description: "Welcome to FUNDAZ." });
    } catch (err) {
      toast.error("Failed to complete profile", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setLoading(true);
    try {
      const { isNewUser } = await loginWithGoogle();
      // For new users: onAuthStateChanged will set needsProfile=true which
      // triggers the useEffect above. For extra reliability, also set the tab
      // directly here so the form appears immediately without waiting for
      // the Firestore fetch to complete.
      if (isNewUser) {
        setTab("complete_profile");
      }
      // Returning users: onAuthStateChanged will fetch their Firestore profile
      // and set needsProfile=false → App.js will unmount this page.
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
        toast.error("Google sign-in failed", { description: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-gate-root">
      <Starfield />
      <div className="noise-overlay" />

      {/* ── Ambient decorative letter paths ── */}
      <div className="auth-gate-deco" aria-hidden="true">
        <svg viewBox="-6 -6 92 132" className="auth-gate-deco-letter auth-gate-deco-f">
          <path d={LETTER_PATHS["F"]} />
        </svg>
        <svg viewBox="-6 -6 92 132" className="auth-gate-deco-letter auth-gate-deco-z">
          <path d={LETTER_PATHS["Z"]} />
        </svg>
      </div>

      {/* ── Main card ── */}
      <motion.div
        className="auth-gate-card"
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Brand header */}
        <div className="auth-gate-brand">
          <div className="auth-gate-nucleus">π</div>
          <div>
            <h1 className="auth-gate-title">FUNDAZ</h1>
            <p className="auth-gate-subtitle">A Domain of Aaruush · SRMIST</p>
          </div>
        </div>

        {/* Hide regular tabs and Google if they just need to complete profile */}
        {!user?.needsProfile && (
          <>


            {/* Tab switcher */}
            <div className="auth-gate-tabs" role="tablist">
              {["login", "signup"].map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  className={`auth-gate-tab${tab === t ? " auth-gate-tab--active" : ""}`}
                  onClick={() => { setTab(t); setErrors({}); }}
                  disabled={loading}
                >
                  {t === "login" ? "Log In" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* Google sign-in */}
            <button className="auth-gate-google-btn" onClick={handleGoogleClick} type="button" disabled={loading}>
              <svg className="auth-gate-google-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="auth-gate-divider">
              <span />
              <p>or continue with email</p>
              <span />
            </div>
          </>
        )}

        {/* Forms */}
        <AnimatePresence mode="wait">
          {tab === "login" && !user?.needsProfile && (
            <motion.form
              key="login"
              onSubmit={handleLogin}
              className="auth-gate-form"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.22 }}
              data-testid="auth-gate-login-form"
            >
              <div className="auth-gate-field">
                <label className="auth-gate-label" htmlFor="ag-login-id">Email</label>
                <input
                  id="ag-login-id"
                  type="email"
                  className={`auth-gate-input${errors.identifier ? " auth-gate-input--error" : ""}`}
                  placeholder="you@srmist.edu.in"
                  value={loginForm.identifier}
                  onChange={setL("identifier")}
                  autoComplete="username"
                  disabled={loading}
                />
                {errors.identifier && <p className="auth-gate-error">{errors.identifier}</p>}
              </div>

              <div className="auth-gate-field">
                <label className="auth-gate-label" htmlFor="ag-login-pw">Password</label>
                <input
                  id="ag-login-pw"
                  type="password"
                  className={`auth-gate-input${errors.password ? " auth-gate-input--error" : ""}`}
                  placeholder="••••••"
                  value={loginForm.password}
                  onChange={setL("password")}
                  autoComplete="current-password"
                  disabled={loading}
                />
                {errors.password && <p className="auth-gate-error">{errors.password}</p>}
              </div>

              <button className="auth-gate-submit" type="submit" disabled={loading} data-testid="auth-gate-login-submit">
                {loading ? "Logging in…" : "Log In →"}
              </button>

              <p className="auth-gate-switch">
                Don't have an account?{" "}
                <button type="button" onClick={() => { setTab("signup"); setErrors({}); }} disabled={loading}>Sign up</button>
              </p>
            </motion.form>
          )}

          {tab === "signup" && !user?.needsProfile && (
            <motion.form
              key="signup"
              onSubmit={handleSignup}
              className="auth-gate-form"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22 }}
              data-testid="auth-gate-signup-form"
            >
              <div className="auth-gate-field">
                <label className="auth-gate-label" htmlFor="ag-name">Full Name</label>
                <input
                  id="ag-name"
                  className={`auth-gate-input${errors.name ? " auth-gate-input--error" : ""}`}
                  placeholder="Ada Lovelace"
                  value={signupForm.name}
                  onChange={setS("name")}
                  disabled={loading}
                />
                {errors.name && <p className="auth-gate-error">{errors.name}</p>}
              </div>

              <div className="auth-gate-field-row">
                <div className="auth-gate-field">
                  <label className="auth-gate-label" htmlFor="ag-regno">Reg. No.</label>
                  <input
                    id="ag-regno"
                    className={`auth-gate-input${errors.regNo ? " auth-gate-input--error" : ""}`}
                    placeholder="RA2311…"
                    value={signupForm.regNo}
                    onChange={setS("regNo")}
                    disabled={loading}
                  />
                  {errors.regNo && <p className="auth-gate-error">{errors.regNo}</p>}
                </div>
                <div className="auth-gate-field">
                  <label className="auth-gate-label" htmlFor="ag-phone">Phone</label>
                  <input
                    id="ag-phone"
                    className={`auth-gate-input${errors.phone ? " auth-gate-input--error" : ""}`}
                    placeholder="98765 43210"
                    value={signupForm.phone}
                    onChange={setS("phone")}
                    disabled={loading}
                  />
                  {errors.phone && <p className="auth-gate-error">{errors.phone}</p>}
                </div>
              </div>

              <div className="auth-gate-field">
                <label className="auth-gate-label" htmlFor="ag-email">Email</label>
                <input
                  id="ag-email"
                  type="email"
                  className={`auth-gate-input${errors.email ? " auth-gate-input--error" : ""}`}
                  placeholder="you@srmist.edu.in"
                  value={signupForm.email}
                  onChange={setS("email")}
                  autoComplete="email"
                  disabled={loading}
                />
                {errors.email && <p className="auth-gate-error">{errors.email}</p>}
              </div>

              <div className="auth-gate-field">
                <label className="auth-gate-label" htmlFor="ag-course">Course / Department</label>
                <input
                  id="ag-course"
                  className={`auth-gate-input${errors.course ? " auth-gate-input--error" : ""}`}
                  placeholder="B.Tech CSE"
                  value={signupForm.course}
                  onChange={setS("course")}
                  disabled={loading}
                />
                {errors.course && <p className="auth-gate-error">{errors.course}</p>}
              </div>

              <div className="auth-gate-field-row">
                <div className="auth-gate-field">
                  <label className="auth-gate-label" htmlFor="ag-pw">Password</label>
                  <input
                    id="ag-pw"
                    type="password"
                    className={`auth-gate-input${errors.password ? " auth-gate-input--error" : ""}`}
                    placeholder="••••••"
                    value={signupForm.password}
                    onChange={setS("password")}
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  {errors.password && <p className="auth-gate-error">{errors.password}</p>}
                </div>
                <div className="auth-gate-field">
                  <label className="auth-gate-label" htmlFor="ag-cpw">Confirm</label>
                  <input
                    id="ag-cpw"
                    type="password"
                    className={`auth-gate-input${errors.confirmPassword ? " auth-gate-input--error" : ""}`}
                    placeholder="••••••"
                    value={signupForm.confirmPassword}
                    onChange={setS("confirmPassword")}
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  {errors.confirmPassword && <p className="auth-gate-error">{errors.confirmPassword}</p>}
                </div>
              </div>

              <button className="auth-gate-submit" type="submit" disabled={loading} data-testid="auth-gate-signup-submit">
                {loading ? "Creating account…" : "Create Account →"}
              </button>

              <p className="auth-gate-switch">
                Already have an account?{" "}
                <button type="button" onClick={() => { setTab("login"); setErrors({}); }} disabled={loading}>Log in</button>
              </p>
            </motion.form>
          )}

          {tab === "complete_profile" && (
            <motion.form
              key="complete_profile"
              onSubmit={handleCompleteProfile}
              className="auth-gate-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.22 }}
              data-testid="auth-gate-complete-form"
            >
              <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                <p className="auth-gate-label" style={{ fontSize: "0.9rem", marginBottom: "0.35rem" }}>
                  One more step — complete your SRMIST profile.
                </p>
                {user?.email && (
                  <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginBottom: "0.1rem" }}>
                    Signed in as <strong style={{ color: "rgba(255,255,255,0.65)" }}>{user.email}</strong>
                  </p>
                )}
              </div>

              <div className="auth-gate-field">
                <label className="auth-gate-label" htmlFor="cp-name">Full Name</label>
                <input
                  id="cp-name"
                  className={`auth-gate-input${errors.name ? " auth-gate-input--error" : ""}`}
                  placeholder="Ada Lovelace"
                  value={completeForm.name}
                  onChange={setC("name")}
                  disabled={loading}
                />
                {errors.name && <p className="auth-gate-error">{errors.name}</p>}
              </div>

              <div className="auth-gate-field">
                <label className="auth-gate-label" htmlFor="cp-regno">Reg. No.</label>
                <input
                  id="cp-regno"
                  className={`auth-gate-input${errors.regNo ? " auth-gate-input--error" : ""}`}
                  placeholder="RA2311…"
                  value={completeForm.regNo}
                  onChange={setC("regNo")}
                  disabled={loading}
                />
                {errors.regNo && <p className="auth-gate-error">{errors.regNo}</p>}
              </div>
              
              <div className="auth-gate-field">
                <label className="auth-gate-label" htmlFor="cp-phone">Phone</label>
                <input
                  id="cp-phone"
                  className={`auth-gate-input${errors.phone ? " auth-gate-input--error" : ""}`}
                  placeholder="98765 43210"
                  value={completeForm.phone}
                  onChange={setC("phone")}
                  disabled={loading}
                />
                {errors.phone && <p className="auth-gate-error">{errors.phone}</p>}
              </div>

              <div className="auth-gate-field">
                <label className="auth-gate-label" htmlFor="cp-course">Course / Department</label>
                <input
                  id="cp-course"
                  className={`auth-gate-input${errors.course ? " auth-gate-input--error" : ""}`}
                  placeholder="B.Tech CSE"
                  value={completeForm.course}
                  onChange={setC("course")}
                  disabled={loading}
                />
                {errors.course && <p className="auth-gate-error">{errors.course}</p>}
              </div>

              <button className="auth-gate-submit" type="submit" disabled={loading}>
                {loading ? "Saving…" : "Complete Registration →"}
              </button>

              <p className="auth-gate-switch">
                Wrong account?{" "}
                <button
                  type="button"
                  disabled={loading}
                  onClick={async () => {
                    await logout();
                    setTab("login");
                    setCompleteForm({ name: "", regNo: "", phone: "", course: "" });
                    setErrors({});
                  }}
                >
                  Sign out and switch
                </button>
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

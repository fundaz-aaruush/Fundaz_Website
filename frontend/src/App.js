import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TransitionProvider } from "@/components/PageTransition";
import { Starfield } from "@/components/Starfield";
import { AuthProvider, useAuth } from "@/components/AuthContext";
import Landing from "@/pages/Landing";
import FlagshipPage from "@/pages/FlagshipPage";
import UnearthedPage from "@/pages/UnearthedPage";
import NowPage from "@/pages/NowPage";
import DomainPage from "@/pages/DomainPage";
import ArenaPage from "@/pages/ArenaPage";
import ZenithPage from "@/pages/ZenithPage";
import AuthGatePage from "@/pages/AuthGatePage";

/*
  Auth-gated shell:
  - loading         → show a branded splash screen (no more blank black screen)
  - Not authenticated → show AuthGatePage (fullscreen login/signup)
  - needsProfile    → show AuthGatePage (Google profile completion)
  - Authenticated   → normal site
*/
function AppShell() {
  const { isAuthenticated, user, loading } = useAuth();

  // ── Loading splash ── shown while Firebase verifies the session
  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "var(--background, #090912)",
        gap: "1rem",
      }}>
        <div style={{
          fontSize: "2.5rem",
          animation: "auth-pulse 1.6s ease-in-out infinite",
          color: "var(--primary, #a78bfa)",
        }}>π</div>
        <p style={{
          fontFamily: "monospace",
          fontSize: "0.75rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.35)",
        }}>Verifying session…</p>
        <style>{`@keyframes auth-pulse { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }`}</style>
      </div>
    );
  }

  if (!isAuthenticated || user?.needsProfile) {
    return (
      <>
        <AuthGatePage />
        <Toaster position="bottom-right" richColors />
      </>
    );
  }

  return (
    <div className="relative min-h-screen bg-background">
      <BrowserRouter>
        <TransitionProvider>
          <Starfield />
          <div className="noise-overlay" />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/flagship" element={<FlagshipPage />} />
            <Route path="/unearthed" element={<UnearthedPage />} />
            <Route path="/now" element={<NowPage />} />
            <Route path="/domain" element={<DomainPage />} />
            <Route path="/arena" element={<ArenaPage />} />
            <Route path="/zenith" element={<ZenithPage />} />
            <Route path="*" element={<Landing />} />
          </Routes>
          <Toaster position="bottom-right" richColors />
        </TransitionProvider>
      </BrowserRouter>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;

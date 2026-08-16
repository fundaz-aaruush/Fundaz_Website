import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TransitionProvider } from "@/components/PageTransition";
import { Starfield } from "@/components/Starfield";
import { AuthProvider } from "@/components/AuthContext";
import Landing from "@/pages/Landing";
import HomePage from "@/pages/HomePage";
import FlagshipPage from "@/pages/FlagshipPage";
import UnearthedPage from "@/pages/UnearthedPage";
import NowPage from "@/pages/NowPage";
import DomainPage from "@/pages/DomainPage";
import ArenaPage from "@/pages/ArenaPage";
import ZenithPage from "@/pages/ZenithPage";
import RegisterPage from "@/pages/RegisterPage";

function App() {
  return (
    // AuthProvider kept so components using useAuth() don't crash,
    // but access to the site is no longer gated by authentication.
    <AuthProvider>
      <div className="relative min-h-screen bg-background">
        <BrowserRouter>
          <TransitionProvider>
            <Starfield />
            <div className="noise-overlay" />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/flagship" element={<FlagshipPage />} />
              <Route path="/unearthed" element={<UnearthedPage />} />
              <Route path="/now" element={<NowPage />} />
              <Route path="/domain" element={<DomainPage />} />
              <Route path="/arena" element={<ArenaPage />} />
              <Route path="/zenith"   element={<ZenithPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*"         element={<Landing />} />
            </Routes>
            <Toaster position="bottom-right" richColors />
          </TransitionProvider>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;


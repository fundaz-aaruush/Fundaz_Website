import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu, User, LogOut, UserPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { AtomLogo } from "@/components/AtomLogo";
import { LETTERS } from "@/lib/letterPaths";
import { useTransitionNav } from "@/components/PageTransition";
import { useAuth } from "@/components/AuthContext";
import { AuthDialog } from "@/components/AuthDialog";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { cn } from "@/lib/utils";

export const Navbar = ({ minimal = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const { go } = useTransitionNav();
  const { pathname } = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const activeIdx = LETTERS.findIndex((l) => `/${l.id}` === pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = (id) => {
    setOpen(false);
    if (`/${id}` === pathname || (id === "home" && pathname === "/")) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    go(id);
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40",
          scrolled ? "glass-panel border-x-0 border-t-0 shadow-elegant" : "border-b border-transparent"
        )}
        style={{ transition: "background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease" }}
        data-testid="main-navbar"
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <button onClick={() => nav("home")} className="group flex items-center gap-3" data-testid="nav-logo">
            <span className="transition-transform duration-500 group-hover:rotate-180">
              <AtomLogo size={32} />
            </span>
            <span className="flex flex-col items-start leading-none">
              <span className="font-display text-lg font-bold tracking-[0.28em] text-foreground">FUNDAZ</span>
              <span className="font-mono-tech text-[9px] tracking-[0.22em] text-muted-foreground">AARUUSH · SRMIST</span>
            </span>
          </button>

          {!minimal && (
            <>
              <div className="hidden items-center gap-1 md:flex">
                {LETTERS.map((l, i) => (
                  <button
                    key={l.char}
                    onClick={() => nav(l.id)}
                    data-testid={`nav-letter-${l.char.toLowerCase()}`}
                    className={cn(
                      "group relative flex h-10 min-w-10 items-center justify-center rounded-md px-2 font-display text-base font-semibold",
                      activeIdx === i ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                    style={{ transition: "color 0.25s ease" }}
                  >
                    <span>{l.char}</span>
                    <span
                      className={cn(
                        "absolute bottom-1 left-1/2 h-px -translate-x-1/2 bg-primary",
                        activeIdx === i ? "w-5" : "w-0 group-hover:w-5"
                      )}
                      style={{ transition: "width 0.25s ease" }}
                    />
                  </button>
                ))}

                {isAuthenticated ? (
                  <div className="ml-3 flex items-center gap-2">
                    <Button variant="silver" size="sm" onClick={() => nav("now")} data-testid="nav-register-cta">
                      Register
                    </Button>
                    <div className="group relative">
                      <Button variant="ghostSilver" size="icon" className="h-9 w-9" data-testid="nav-user-button">
                        <User className="h-4 w-4" />
                      </Button>
                      <div className="invisible absolute right-0 top-full mt-1 w-56 rounded-lg border border-border bg-card/95 p-2 opacity-0 shadow-elegant backdrop-blur-xl group-hover:visible group-hover:opacity-100" style={{ transition: "opacity 0.2s ease, visibility 0.2s ease" }}>
                        <p className="truncate px-2 py-1.5 text-xs font-semibold text-foreground">{user.name || user.displayName}</p>
                        <p className="truncate px-2 pb-2 text-[10px] text-muted-foreground">{user.email}</p>
                        <div className="h-px bg-border mb-1" />
                        <button
                          onClick={() => setEditProfileOpen(true)}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
                          style={{ transition: "background-color 0.2s ease, color 0.2s ease" }}
                          data-testid="nav-edit-profile"
                        >
                          <UserPen className="h-3 w-3" /> Edit Profile
                        </button>
                        <button
                          onClick={logout}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
                          style={{ transition: "background-color 0.2s ease, color 0.2s ease" }}
                          data-testid="nav-logout"
                        >
                          <LogOut className="h-3 w-3" /> Log out
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="ml-3 flex items-center gap-2">
                    <Button variant="ghostSilver" size="sm" onClick={() => setAuthOpen(true)} data-testid="nav-login-cta">
                      Log In
                    </Button>
                    <Button variant="silver" size="sm" onClick={() => setAuthOpen(true)} data-testid="nav-signup-cta">
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>

              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghostSilver" size="icon" className="md:hidden" data-testid="nav-mobile-trigger">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 border-border bg-background/95 backdrop-blur-xl">
                  <SheetTitle className="font-display tracking-[0.25em] text-foreground">FUNDAZ</SheetTitle>
                  <div className="mt-8 flex flex-col gap-1">
                    {LETTERS.map((l) => (
                      <button
                        key={l.char}
                        onClick={() => nav(l.id)}
                        data-testid={`mobile-nav-letter-${l.char.toLowerCase()}`}
                        className="flex items-center gap-4 rounded-md px-3 py-3 text-left hover:bg-secondary"
                        style={{ transition: "background-color 0.2s ease" }}
                      >
                        <span className="font-display text-2xl font-bold text-primary">{l.char}</span>
                        <span className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground">{l.word}</span>
                          <span className="text-xs text-muted-foreground">{l.tagline}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 border-t border-border pt-4">
                    {isAuthenticated ? (
                      <div className="flex flex-col gap-2 px-3">
                        <p className="text-sm font-semibold text-foreground">{user.name || user.displayName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <Button variant="ghostSilver" size="sm" onClick={() => { setOpen(false); setEditProfileOpen(true); }} className="mt-1 justify-start" data-testid="mobile-edit-profile">
                          <UserPen className="mr-2 h-3 w-3" /> Edit Profile
                        </Button>
                        <Button variant="ghostSilver" size="sm" onClick={logout} className="justify-start" data-testid="mobile-logout">
                          <LogOut className="mr-2 h-3 w-3" /> Log out
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 px-3">
                        <Button variant="silver" size="sm" onClick={() => { setOpen(false); setAuthOpen(true); }} data-testid="mobile-signup-cta">
                          Sign Up
                        </Button>
                        <Button variant="ghostSilver" size="sm" onClick={() => { setOpen(false); setAuthOpen(true); }} data-testid="mobile-login-cta">
                          Log In
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
        </nav>
      </header>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      <EditProfileDialog open={editProfileOpen} onOpenChange={setEditProfileOpen} />
    </>
  );
};
